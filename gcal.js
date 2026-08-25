// ── Sincronizzazione automatica con Google Calendar ──────────────────────
// Colloqui e Appuntamenti (non le Lezioni) vengono creati/aggiornati/eliminati
// anche sul calendario "primary" dell'utente Google, usando un access token
// OAuth (scope https://www.googleapis.com/auth/calendar.events) ottenuto
// tramite Google Identity Services (accounts.google.com/gsi/client), NON
// tramite Firebase Auth: signInWithPopup/signInWithRedirect di Firebase per
// questo scopo si sono rivelati inaffidabili sull'hosting di quest'app
// (GitHub Pages invia di default Cross-Origin-Opener-Policy: same-origin,
// che blocca la comunicazione del popup con Firebase; anche passando a
// signInWithRedirect lo stato del redirect si perdeva al ritorno). Google
// Identity Services è la libreria di Google pensata apposta per ottenere
// permessi OAuth aggiuntivi in modo indipendente dal login, e gestisce
// correttamente le policy di sicurezza moderne — vedi requestAccessToken
// più sotto e il pulsante "Calendar" in header (app.js).
//
// Limite noto: l'access token dura circa un'ora e non c'è un backend che
// possa rinnovarlo in silenzio — da quel momento la sincronizzazione si
// ferma finché l'utente non si riconnette. I dati restano comunque sempre
// salvati su Firestore indipendentemente dall'esito della sync — un
// fallimento verso Calendar non fa mai perdere il salvataggio locale.
const GCal = (() => {
  const TOKEN_KEY = 'sm-gcal-token';
  const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
  // Client ID OAuth "Web application" del progetto Google Cloud collegato a
  // Firebase (Credenziali → OAuth 2.0 Client IDs — spesso già presente come
  // "Web client (auto created by Google Service)"; verificare che
  // https://<tuo-dominio> sia elencato tra le "Authorized JavaScript
  // origins"). Vedi le istruzioni fornite per trovarlo/crearlo.
  const GCAL_CLIENT_ID = '874485472320-ues39pid1t026sdhj494euv2m5g7lo8n.apps.googleusercontent.com';

  function getToken() { try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; } }
  function hasToken() { return !!getToken(); }
  function setToken(token) {
    try { token ? sessionStorage.setItem(TOKEN_KEY, token) : sessionStorage.removeItem(TOKEN_KEY); } catch {}
    if (_listener) _listener(hasToken());
  }
  let _listener = null;
  function onStatusChange(fn) { _listener = fn; }

  // Risultati: oggetto JSON, `true` (204 no-content), 'GONE' (404/410: evento
  // già cancellato lato Google), o null (nessun token / errore di rete o API —
  // fallisce sempre in silenzio, mai un'eccezione che blocchi il chiamante)
  async function _call(path, opts = {}) {
    const token = getToken();
    if (!token) return null;
    let res;
    try {
      res = await fetch(API + path, {
        ...opts,
        headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json', ...(opts.headers || {}) },
      });
    } catch { return null; }
    if (res.status === 401) { setToken(''); return null; } // token scaduto/revocato
    if (res.status === 404 || res.status === 410) return 'GONE';
    if (res.status === 204) return true;
    if (!res.ok) { console.warn('Google Calendar:', res.status, await res.text().catch(() => '')); return null; }
    return res.json();
  }

  function _addMinutes(hhmm, mins) {
    const [h, m] = hhmm.split(':').map(Number);
    const t = h * 60 + m + mins;
    return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(((t % 60) + 60) % 60).padStart(2, '0')}`;
  }

  // Crea (se gcalEventId è assente, o se puntava a un evento nel frattempo
  // cancellato lato Google) o aggiorna un evento. Ritorna il gcalEventId da
  // salvare sul record locale — quello nuovo, o quello esistente se la sync
  // non è attiva/fallisce (per non perdere il collegamento già stabilito).
  async function upsertEvent({ gcalEventId, title, dateISO, startTime, endTime, description, location }) {
    if (!hasToken() || !dateISO) return gcalEventId || '';
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const body = { summary: title || '(senza titolo)', description: description || '', location: location || '' };
    if (startTime) {
      body.start = { dateTime: `${dateISO}T${startTime}:00`, timeZone: tz };
      body.end = { dateTime: `${dateISO}T${endTime || _addMinutes(startTime, 60)}:00`, timeZone: tz };
    } else {
      body.start = { date: dateISO };
      body.end = { date: dateISO };
    }
    let result = null;
    if (gcalEventId) {
      result = await _call('/' + gcalEventId, { method: 'PATCH', body: JSON.stringify(body) });
      if (result === 'GONE') result = null;
    }
    if (!result) result = await _call('', { method: 'POST', body: JSON.stringify(body) });
    return (result && result.id) ? result.id : (gcalEventId || '');
  }

  async function deleteEvent(gcalEventId) {
    if (!gcalEventId || !hasToken()) return;
    await _call('/' + gcalEventId, { method: 'DELETE' });
  }

  // Verifica reale (non solo "il token è presente"): prova a leggere il
  // calendario "primary". Usata dopo il login/riconnessione per dare un
  // riscontro immediato e concreto invece di un'icona che dice "connesso"
  // anche quando la sync in realtà fallisce sempre in silenzio (es. Calendar
  // API non abilitata nel progetto Google Cloud collegato a Firebase: la
  // causa più comune quando "non sembra collegato" nonostante il login).
  async function verify() {
    const token = getToken();
    if (!token) return { ok: false, reason: 'no-token' };
    let res;
    try {
      res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
        headers: { Authorization: 'Bearer ' + token },
      });
    } catch { return { ok: false, reason: 'network' }; }
    if (res.status === 401) { setToken(''); return { ok: false, reason: 'unauthorized' }; }
    if (res.status === 403) {
      const detail = await res.text().catch(() => '');
      console.error('[gcal] verify 403 — risposta completa di Google:', detail); // sempre in console, oltre che nell'alert
      return { ok: false, reason: 'forbidden', detail };
    }
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      console.error(`[gcal] verify ${res.status} — risposta completa di Google:`, detail);
      return { ok: false, reason: 'http-' + res.status, detail };
    }
    return { ok: true };
  }

  // ── Ottenimento del permesso via Google Identity Services ───────────────
  // Il client va creato una sola volta (initTokenClient); i due callback
  // restano fissi e smistano l'esito al resolver "in corso" tenuto in
  // _pendingResolve, così ogni chiamata a requestAccessToken() può
  // restituire una Promise pur riusando lo stesso client.
  let _tokenClient = null;
  let _pendingResolve = null;
  function _getTokenClient() {
    if (_tokenClient) return _tokenClient;
    if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) return null;
    _tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GCAL_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/calendar.events',
      callback: resp => {
        if (!_pendingResolve) return;
        const resolve = _pendingResolve; _pendingResolve = null;
        // Logga sempre gli scope OTTENUTI (resp.scope): Google può a volte
        // restituire un token valido ma senza lo scope calendar.events
        // richiesto (consenso parziale) — qui si vede subito, senza dover
        // aspettare il 403 sulla chiamata API vera e propria.
        console.log('[gcal] token ottenuto — scope concessi:', resp && resp.scope, '— includono calendar.events:', !!(resp && resp.scope && resp.scope.includes('calendar.events')));
        if (resp && resp.access_token) { setToken(resp.access_token); resolve({ ok: true }); }
        else resolve({ ok: false, reason: (resp && resp.error) || 'no-token' });
      },
      error_callback: err => {
        if (!_pendingResolve) return;
        const resolve = _pendingResolve; _pendingResolve = null;
        resolve({ ok: false, reason: (err && err.type) || 'error' });
      },
    });
    return _tokenClient;
  }
  // Apre il popup di consenso Google (gestito da Google Identity Services,
  // non da Firebase) e risolve quando arriva una risposta — mai
  // un'eccezione. prompt:'consent' forza la schermata completa ogni volta,
  // per non rischiare un consenso "silenzioso" senza token restituito.
  function requestAccessToken() {
    return new Promise(resolve => {
      const client = _getTokenClient();
      if (!client) { resolve({ ok: false, reason: 'gis-not-loaded' }); return; }
      _pendingResolve = resolve;
      client.requestAccessToken({ prompt: 'consent' });
    });
  }

  return { getToken, setToken, hasToken, onStatusChange, upsertEvent, deleteEvent, verify, requestAccessToken };
})();

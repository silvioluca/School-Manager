// ── Sincronizzazione automatica con Google Calendar ──────────────────────
// Colloqui e Appuntamenti (non le Lezioni) vengono creati/aggiornati/eliminati
// anche sul calendario "primary" dell'utente Google, usando l'access token
// OAuth (scope https://www.googleapis.com/auth/calendar.events) ottenuto al
// login — vedi login.html per la cattura del token dopo signInWithPopup.
//
// Limite noto: l'app non ha un backend proprio (solo Firebase), quindi non
// può rinnovare l'access token in silenzio. Il token dura circa un'ora: da
// quel momento la sincronizzazione si ferma finché l'utente non si
// riconnette (pulsante "Google Calendar" in header, vedi app.js). I dati
// restano comunque sempre salvati su Firestore indipendentemente dall'esito
// della sync — un fallimento verso Calendar non fa mai perdere il salvataggio
// locale.
const GCal = (() => {
  const TOKEN_KEY = 'sm-gcal-token';
  const API = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

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

  return { getToken, setToken, hasToken, onStatusChange, upsertEvent, deleteEvent };
})();

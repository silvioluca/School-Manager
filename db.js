// ── Store su Firestore (anagrafica + pacchetti per anno) ────────────
// La classe di un alunno CAMBIA con l'anno scolastico: la verità sta
// dentro l'anno, non sull'alunno. Struttura su Firestore:
//
//   users/{uid}/packs/anagrafica     → { json: [ {id, nome, cognome, profilo, profiloTipo, note, createdAt, updatedAt}, … ] }
//   users/{uid}/packs/a-2024_25      → { json: { [idAlunno]: { classe: "3A", materie: {...} } } }
//   users/{uid}/packs/a-2025_26      → { json: { [idAlunno]: { classe: "4A", materie: {...} } } }
//   users/{uid}/packs/classi-meta    → { json: { "2025/26|3A": { istituto: "Liceo Scientifico N. Rosa (LI02)",
//                                        indirizzo: "Liceo Scientifico opzione Scienze Applicate",
//                                        materie: ["Matematica","Fisica"] }, … } }
//                                        istituto (scuola) + indirizzo ministeriale + materie
//                                        insegnate dall'utente in quella classe/anno (info di
//                                        classe, non di alunno)
//   users/{uid}/packs/orario         → { json: { "2025/26": {
//                                          slots: [ {id, giorno, ora, materia, classe}, … ],
//                                          periodi: { "1": {inizio: "08:00", fine: "09:00"}, … },
//                                          sabato: false
//                                        }, … } }
//                                        orario settimanale del docente, ricorrente per anno scolastico
//                                        (giorno: 1=Lun..6=Sab, ora: numero dell'ora di lezione).
//                                        periodi è per "ora" (vale per tutti i giorni), non per slot.
//                                        sabato: false nasconde la colonna del sabato (default true).
//   users/{uid}/packs/lez-2025_26    → { json: [ {id, data, ora, classe, materia, argomento, note,
//                                        compiti, scadenza}, … ] }
//                                        registro delle lezioni svolte (una data specifica, non ricorrente).
//                                        compiti/scadenza (testo + data di consegna) alimentano la
//                                        sezione Compiti, che li aggrega e ordina per scadenza.
//   users/{uid}/packs/rubriche       → { json: [ {id, nome, indicatori: [
//                                          {id, nome, min, max, step, livelli: [
//                                            {id, numero, label, descrizione}, … ]}, … ]}, … ] }
//                                        libreria di griglie di valutazione: ogni indicatore ha un
//                                        punteggio minimo/massimo/step propri (alcuni indicatori non
//                                        possono scendere a 0: min riflette quel vincolo) e una serie
//                                        di livelli con descrittore testuale, a scopo di riferimento.
//   users/{uid}/packs/coll-2025_26   → { json: [ {id, data, ora, studenteId, partecipanti, note,
//                                        meetLink, gcalEventId}, … ] }
//                                        colloqui/ricevimento genitori (per anno scolastico): un incontro
//                                        specifico su un alunno. L'orario ricorrente di ricevimento
//                                        (giorno/ora fisso) vive invece dentro l'orario del docente
//                                        (slot con materia "Colloqui", classe vuota).
//   users/{uid}/packs/appt-2025_26   → { json: [ {id, tipo, data, ora, oraFine, modalita, classe,
//                                        oggetto, luogo, note, meetLink, gcalEventId}, … ] }
//                                        appuntamenti istituzionali (per anno scolastico): collegi
//                                        docenti, consigli di classe, incontri anche pomeridiani/online.
//                                        tipo: 'collegio' | 'consiglio' | 'incontro'; modalita: 'presenza'
//                                        | 'online' (vedi TIPI_APPUNTAMENTO in app.js).
//                                        meetLink/gcalEventId (su entrambi coll-/appt-): link Meet
//                                        inserito a mano e id dell'evento gemello creato su Google
//                                        Calendar dalla sincronizzazione automatica (vedi gcal.js) —
//                                        '' finché non sincronizzato o senza link.
//   users/{uid}/packs/todos          → { json: [ {id, titolo, descrizione, stato, scadenza}, … ] }
//                                        to-do del docente, elenco globale (non legato all'anno
//                                        scolastico): stato è 'da_fare' | 'in_corso' | 'fatto'
//                                        (vedi TODO_STATI in app.js).
//
// Un caricamento costa 1 lettura (anagrafica) + 1 per anno scolastico.
// Ogni salvataggio riscrive SOLO i pacchetti effettivamente cambiati
// (diff sui json caricati): aggiungere un voto = 1 scrittura sul
// pacchetto dell'anno; modificare l'anagrafica = 1 scrittura.
// Cache in sessionStorage: 0 letture ai reload nella stessa sessione.
//
// In memoria l'app lavora sul documento ricomposto:
// {
//   id, nome, cognome,
//   profilo: "ND" | "PDP" | "PEI",      // profilo inclusione
//   profiloTipo: [],                    // codici tipologia, anche più di uno (PDP: F81.0 ecc. — PEI: VIS/UDI/... vedi PROFILO_TIPI in app.js)
//   note: "",
//   anni: {
//     "2023/24": { classe: "3A", materie: { "Matematica": [ {id, voto, data, tipo, desc, commento, griglia}, … ] } },
//       griglia (facoltativa, da "Verifiche"): [ {a,b,c}, … ] un elemento per esercizio
//     "2024/25": { classe: "4A", materie: { … } }
//   },
//   createdAt, updatedAt
// }
//
// NB: un pacchetto non può superare 1 MB (limite doc Firestore): un anno
// con ~100 alunni e voti di una materia resta nell'ordine dei 100 KB.

const DB = (() => {
  const APP = 'school-manager';
  const CACHE_KEY = 'sm-cache-v5';

  let _cache = null;    // array alunni ricomposti (stesso riferimento usato dall'app)
  let _loaded = {};     // id → { anag: jsonStr, anni: { anno: jsonStr } } — stato salvato, per il diff
  let _classiMeta = {}; // "anno|classe" → { istituto, indirizzo, materie: [...] } — info di classe, non di alunno
  let _orario = {};     // anno → [ {id, giorno, ora, materia, classe}, … ] — orario settimanale del docente
  let _lezioni = {};    // anno → [ {id, data, ora, classe, materia, argomento, note}, … ] — registro lezioni
  let _rubriche = [];   // [ {id, nome, indicatori: [...]}, … ] — libreria griglie di valutazione
  let _colloqui = {};   // anno → [ {id, data, ora, studenteId, partecipanti, note}, … ] — colloqui genitori
  let _appuntamenti = {}; // anno → [ {id, tipo, data, ora, oraFine, modalita, classe, oggetto, note}, … ] — collegi/consigli/incontri
  let _todos = [];      // [ {id, titolo, descrizione, stato, scadenza}, … ] — to-do, globale (non per anno)

  function _db() { return firebase.firestore(); }

  function _base() {
    const u = firebase.auth().currentUser;
    if (!u) throw new Error('Utente non autenticato');
    return 'users/' + u.uid;
  }

  function packs() { return _db().collection(_base() + '/packs'); }

  function annoDocId(anno) { return 'a-' + String(anno).replace(/\//g, '_'); }
  function annoFromDocId(id) { return id.slice(2).replace(/_/g, '/'); }
  function lezDocId(anno) { return 'lez-' + String(anno).replace(/\//g, '_'); }
  function lezAnnoFromDocId(id) { return id.slice(4).replace(/_/g, '/'); }
  function colDocId(anno) { return 'coll-' + String(anno).replace(/\//g, '_'); }
  function colAnnoFromDocId(id) { return id.slice(5).replace(/_/g, '/'); }
  function apptDocId(anno) { return 'appt-' + String(anno).replace(/\//g, '_'); }
  function apptAnnoFromDocId(id) { return id.slice(5).replace(/_/g, '/'); }

  // Anno scolastico corrente: settembre–agosto (es. a luglio 2026 → "2025/26")
  function currentAnno() {
    const d = new Date();
    const y = d.getMonth() + 1 >= 9 ? d.getFullYear() : d.getFullYear() - 1;
    return `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
  }

  // Data odierna in ora locale (mai .toISOString(): in Italia sposterebbe
  // indietro di un giorno vicino alla mezzanotte, perché converte in UTC)
  function todayISO() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function uid() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
      'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function _stamp(doc) {
    doc.updatedAt = new Date().toISOString();
    if (!doc.createdAt) doc.createdAt = doc.updatedAt;
    return doc;
  }

  // Parte anagrafica del documento (tutto tranne `anni`)
  function anagOf(s) {
    const { anni, ...rest } = s;
    return rest;
  }

  // Classe più recente dell'alunno (ultimo anno presente)
  function classeCorrente(s) {
    const ys = Object.keys(s.anni || {}).sort();
    return ys.length ? (s.anni[ys[ys.length - 1]].classe || '') : '';
  }

  // ── Cache sessione ────────────────────────────────────────────────
  function _cacheLoad() {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return false;
      const p = JSON.parse(raw);
      _cache = p.students || [];
      _loaded = p.loaded || {};
      _classiMeta = p.classiMeta || {};
      _orario = p.orario || {};
      _lezioni = p.lezioni || {};
      _rubriche = p.rubriche || [];
      _colloqui = p.colloqui || {};
      _appuntamenti = p.appuntamenti || {};
      _todos = p.todos || [];
      return true;
    } catch { return false; }
  }
  function _cacheSave() {
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({ students: _cache, loaded: _loaded, classiMeta: _classiMeta, orario: _orario, lezioni: _lezioni, rubriche: _rubriche, colloqui: _colloqui, appuntamenti: _appuntamenti, todos: _todos })); } catch {}
  }
  function _cacheDrop() {
    try { sessionStorage.removeItem(CACHE_KEY); } catch {}
  }

  // ── Scrittura pacchetti (ricostruiti dallo stato in memoria) ──────
  async function _saveAnagrafica() {
    const arr = (_cache || []).map(anagOf);
    const json = JSON.stringify(arr);
    if (json.length > 900000) console.warn(`Anagrafica vicina al limite di 1 MB (${json.length} byte)`);
    await packs().doc('anagrafica').set({ json });
  }

  async function _saveAnno(anno) {
    const map = {};
    (_cache || []).forEach(s => { if (s.anni && s.anni[anno]) map[s.id] = s.anni[anno]; });
    const ref = packs().doc(annoDocId(anno));
    if (!Object.keys(map).length) { await ref.delete(); return; }
    const json = JSON.stringify(map);
    if (json.length > 900000) console.warn(`Pacchetto ${anno} vicino al limite di 1 MB (${json.length} byte)`);
    await ref.set({ json });
  }

  // Registra lo stato salvato di un alunno (per i diff successivi)
  function _markLoaded(s) {
    _loaded[s.id] = {
      anag: JSON.stringify(anagOf(s)),
      anni: Object.fromEntries(Object.entries(s.anni || {}).map(([y, v]) => [y, JSON.stringify(v)])),
    };
  }

  // Pacchetti da riscrivere per allineare Firestore allo stato di `doc`
  function _dirtyOf(doc) {
    const prev = _loaded[doc.id] || { anag: null, anni: {} };
    const dirty = { anag: false, anni: new Set() };
    if (JSON.stringify(anagOf(doc)) !== prev.anag) dirty.anag = true;
    const anni = new Set([...Object.keys(doc.anni || {}), ...Object.keys(prev.anni)]);
    anni.forEach(y => {
      const now = doc.anni && doc.anni[y] ? JSON.stringify(doc.anni[y]) : null;
      if (now !== (prev.anni[y] ?? null)) dirty.anni.add(y);
    });
    return dirty;
  }

  // ── Migrazione dai vecchi schemi ──────────────────────────────────
  // v0: users/{uid}/students (1 doc per alunno) — v1: packs/c-{classe}.
  // In entrambi la classe era sull'alunno: se mancano gli anni, la
  // classe corrente diventa l'iscrizione all'anno scolastico in corso.
  async function _migrateIfNeeded(snap) {
    const hasNew = snap.docs.some(d => d.id === 'anagrafica' || d.id.startsWith('a-'));
    if (hasNew) return false;

    const legacyStudents = [];
    // v1: pacchetti per classe
    snap.docs.filter(d => d.id.startsWith('c-')).forEach(d => {
      legacyStudents.push(...JSON.parse(d.data().json));
    });
    // v0: doc singoli
    const legacySnap = await _db().collection(_base() + '/students').get();
    legacySnap.docs.forEach(d => legacyStudents.push(JSON.parse(d.data().json)));
    if (!legacyStudents.length) return false;

    legacyStudents.forEach(s => {
      s.anni = s.anni || {};
      if (s.classe && !Object.keys(s.anni).length) {
        s.anni[currentAnno()] = { classe: s.classe, materie: {} };
      }
      Object.values(s.anni).forEach(y => { y.classe = y.classe || s.classe || ''; });
      delete s.classe;
    });

    _cache = legacyStudents;
    await _saveAnagrafica();
    const anni = new Set();
    legacyStudents.forEach(s => Object.keys(s.anni).forEach(y => anni.add(y)));
    for (const y of anni) await _saveAnno(y);

    // Cancella i vecchi documenti
    const olds = [...snap.docs.filter(d => d.id.startsWith('c-')), ...legacySnap.docs];
    for (let i = 0; i < olds.length; i += 450) {
      const batch = _db().batch();
      olds.slice(i, i + 450).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    return true;
  }

  // ── API ───────────────────────────────────────────────────────────
  async function all() {
    if (_cacheLoad()) return _cache;
    let snap = await packs().get();
    if (await _migrateIfNeeded(snap)) snap = await packs().get();

    const anagDoc = snap.docs.find(d => d.id === 'anagrafica');
    const list = anagDoc ? JSON.parse(anagDoc.data().json) : [];
    const byId = {};
    list.forEach(s => { s.anni = {}; byId[s.id] = s; });

    snap.docs.filter(d => d.id.startsWith('a-')).forEach(d => {
      const anno = annoFromDocId(d.id);
      const map = JSON.parse(d.data().json);
      Object.entries(map).forEach(([id, v]) => { if (byId[id]) byId[id].anni[anno] = v; });
    });

    const metaDoc = snap.docs.find(d => d.id === 'classi-meta');
    if (metaDoc) {
      _classiMeta = JSON.parse(metaDoc.data().json);
      // Migrazione dal vecchio schema {indirizzo, materie}: quel campo "indirizzo"
      // in realtà conteneva il nome della scuola (es. da un import PDF Argo) →
      // diventa "istituto"; il nuovo "indirizzo" (lista ministeriale) parte vuoto.
      let migrated = false;
      Object.values(_classiMeta).forEach(v => {
        if (v.istituto === undefined) { v.istituto = v.indirizzo || ''; v.indirizzo = ''; migrated = true; }
      });
      if (migrated) await packs().doc('classi-meta').set({ json: JSON.stringify(_classiMeta) });
    } else {
      // Migrazione dal vecchio pack 'materie' (solo array, senza istituto/indirizzo)
      const legacyMateria = snap.docs.find(d => d.id === 'materie');
      _classiMeta = {};
      if (legacyMateria) {
        const old = JSON.parse(legacyMateria.data().json);
        Object.entries(old).forEach(([key, materie]) => { _classiMeta[key] = { istituto: '', indirizzo: '', materie }; });
        await packs().doc('classi-meta').set({ json: JSON.stringify(_classiMeta) });
        await packs().doc('materie').delete();
      }
    }

    const orarioDoc = snap.docs.find(d => d.id === 'orario');
    _orario = orarioDoc ? JSON.parse(orarioDoc.data().json) : {};

    _lezioni = {};
    snap.docs.filter(d => d.id.startsWith('lez-')).forEach(d => {
      _lezioni[lezAnnoFromDocId(d.id)] = JSON.parse(d.data().json);
    });

    const rubricheDoc = snap.docs.find(d => d.id === 'rubriche');
    _rubriche = rubricheDoc ? JSON.parse(rubricheDoc.data().json) : [];

    _colloqui = {};
    snap.docs.filter(d => d.id.startsWith('coll-')).forEach(d => {
      _colloqui[colAnnoFromDocId(d.id)] = JSON.parse(d.data().json);
    });

    _appuntamenti = {};
    snap.docs.filter(d => d.id.startsWith('appt-')).forEach(d => {
      _appuntamenti[apptAnnoFromDocId(d.id)] = JSON.parse(d.data().json);
    });

    const todosDoc = snap.docs.find(d => d.id === 'todos');
    _todos = todosDoc ? JSON.parse(todosDoc.data().json) : [];

    _cache = list;
    _loaded = {};
    list.forEach(_markLoaded);
    _cacheSave();
    return _cache;
  }

  // ── Info di classe: istituto + indirizzo ministeriale + materie ────
  function classeMetaKey(anno, classe) { return anno + '|' + classe; }
  function getClasseMeta(anno, classe) {
    return _classiMeta[classeMetaKey(anno, classe)] || { istituto: '', indirizzo: '', materie: [] };
  }
  function materieOf(anno, classe) { return getClasseMeta(anno, classe).materie; }
  function indirizzoOf(anno, classe) { return getClasseMeta(anno, classe).indirizzo; }
  function istitutoOf(anno, classe) { return getClasseMeta(anno, classe).istituto; }
  function materieMapAll() {
    const out = {};
    Object.entries(_classiMeta).forEach(([k, v]) => { out[k] = v.materie || []; });
    return out;
  }
  function allIstituti() {
    return [...new Set(Object.values(_classiMeta).map(v => v.istituto).filter(Boolean))].sort();
  }

  async function setClasseMeta(anno, classe, { istituto, indirizzo, materie }) {
    if (!_cache) await all();
    const key = classeMetaKey(anno, classe);
    const hasContent = (istituto && istituto.trim()) || (indirizzo && indirizzo.trim()) || (materie && materie.length);
    if (hasContent) _classiMeta[key] = { istituto: istituto || '', indirizzo: indirizzo || '', materie: materie || [] };
    else delete _classiMeta[key];
    await packs().doc('classi-meta').set({ json: JSON.stringify(_classiMeta) });
    _cacheDrop();
  }

  // Sposta i metadati di classe da una coppia (anno,classe) a un'altra, se la
  // destinazione non ha ancora nulla impostato (usato dalla promozione: porta
  // avanti istituto/indirizzo, lascia le materie da riconfigurare)
  function _carryClasseMeta(fromAnno, fromClasse, toAnno, toClasse) {
    const from = getClasseMeta(fromAnno, fromClasse);
    const toKey = classeMetaKey(toAnno, toClasse);
    if (_classiMeta[toKey]) return; // già configurata, non sovrascrivere
    if (from.istituto || from.indirizzo) {
      _classiMeta[toKey] = { istituto: from.istituto, indirizzo: from.indirizzo, materie: [] };
    }
  }

  // ── Orario del docente (ricorrente, per anno scolastico) ────────────
  // { slots: [ {id, giorno, ora, materia, classe}, … ], periodi: { [ora]: {inizio, fine} },
  //   sabato: true|false }
  // periodi è per "ora" (vale per tutti i giorni): la fascia oraria di una
  // riga non cambia da un giorno all'altro, si imposta una volta sola.
  // sabato: false nasconde la colonna del sabato (default true, non salvato
  // finché non viene esplicitamente disattivato).
  function getOrario(anno) {
    const v = _orario[anno];
    if (!v) return { slots: [], periodi: {}, sabato: true };
    if (Array.isArray(v)) return { slots: v, periodi: {}, sabato: true }; // retrocompat schema iniziale
    return { slots: v.slots || [], periodi: v.periodi || {}, sabato: v.sabato !== false };
  }
  async function _saveOrario() {
    await packs().doc('orario').set({ json: JSON.stringify(_orario) });
  }
  // Un anno è "tutto di default" (niente da persistere) solo se non ha slot,
  // periodi, né il sabato disattivato esplicitamente
  function _isOrarioDefault(cur) {
    return cur.sabato !== false && !cur.slots.length && !Object.keys(cur.periodi).length;
  }
  async function setOrarioSlots(anno, slots) {
    if (!_cache) await all();
    const cur = getOrario(anno);
    cur.slots = slots;
    if (!_isOrarioDefault(cur)) _orario[anno] = cur;
    else delete _orario[anno];
    await _saveOrario();
    _cacheDrop();
  }
  async function setOrarioPeriodo(anno, ora, times) {
    if (!_cache) await all();
    const cur = getOrario(anno);
    if (times.inizio || times.fine) cur.periodi[ora] = times;
    else delete cur.periodi[ora];
    if (!_isOrarioDefault(cur)) _orario[anno] = cur;
    else delete _orario[anno];
    await _saveOrario();
    _cacheDrop();
  }
  async function setOrarioSabato(anno, include) {
    if (!_cache) await all();
    const cur = getOrario(anno);
    cur.sabato = !!include;
    if (!_isOrarioDefault(cur)) _orario[anno] = cur;
    else delete _orario[anno];
    await _saveOrario();
    _cacheDrop();
  }

  // ── Registro lezioni (per anno scolastico, una data specifica ciascuna) ──
  function getLezioni(anno) { return _lezioni[anno] || []; }
  async function _saveLezioni(anno) {
    const arr = _lezioni[anno] || [];
    const ref = packs().doc(lezDocId(anno));
    if (!arr.length) { await ref.delete(); return; }
    const json = JSON.stringify(arr);
    if (json.length > 900000) console.warn(`Lezioni ${anno} vicino al limite di 1 MB (${json.length} byte)`);
    await ref.set({ json });
  }
  function _newLezione(l) {
    return {
      id: uid(), data: l.data || '', ora: l.ora || '', classe: l.classe || '',
      materia: l.materia || '', argomento: l.argomento || '', note: l.note || '',
      compiti: l.compiti || '', scadenza: l.scadenza || '',
      // '' = lezione normale, 'verifica' | 'interrogazione' = alimenta l'avviso
      // proattivo in dashboard (Lezioni)
      tipo: l.tipo || '',
    };
  }
  async function addLezione(anno, lezione) {
    if (!_cache) await all();
    (_lezioni[anno] ||= []).push(_newLezione(lezione));
    await _saveLezioni(anno);
    _cacheDrop();
  }
  async function updateLezione(anno, id, attrs) {
    if (!_cache) await all();
    const arr = _lezioni[anno] || [];
    const idx = arr.findIndex(l => l.id === id);
    if (idx < 0) return;
    Object.assign(arr[idx], attrs);
    await _saveLezioni(anno);
    _cacheDrop();
  }
  async function removeLezione(anno, id) {
    if (!_cache) await all();
    _lezioni[anno] = (_lezioni[anno] || []).filter(l => l.id !== id);
    await _saveLezioni(anno);
    _cacheDrop();
  }
  // Import CSV: più lezioni (anche su anni diversi), un solo salvataggio per anno coinvolto
  async function addLezioniBulk(lezioniPerAnno) {
    if (!_cache) await all();
    const anni = new Set();
    Object.entries(lezioniPerAnno).forEach(([anno, list]) => {
      (_lezioni[anno] ||= []).push(...list.map(_newLezione));
      anni.add(anno);
    });
    for (const anno of anni) await _saveLezioni(anno);
    _cacheDrop();
  }
  // Raggruppa una lista di chiavi [anno, id] per anno (usato dalle azioni di
  // gruppo, per fare un solo salvataggio per anno invece che uno per riga)
  function _groupByAnno(keys) {
    const perAnno = {};
    keys.forEach(([anno, id]) => { (perAnno[anno] ||= new Set()).add(id); });
    return perAnno;
  }
  // Elimina più lezioni in blocco (anche su anni diversi): un solo
  // salvataggio per anno coinvolto, così l'intero gruppo selezionato viene
  // rimosso in un'unica scrittura invece di una sequenza di scritture
  // separate sullo stesso pacchetto (che si sovrascrivevano a vicenda).
  async function removeLezioniBulk(keys) {
    if (!_cache) await all();
    const perAnno = _groupByAnno(keys);
    for (const [anno, ids] of Object.entries(perAnno)) {
      _lezioni[anno] = (_lezioni[anno] || []).filter(l => !ids.has(l.id));
      await _saveLezioni(anno);
    }
    _cacheDrop();
  }
  // Azzera compiti/scadenza su più lezioni in blocco, un solo salvataggio per anno
  async function clearCompitiBulk(keys) {
    if (!_cache) await all();
    const perAnno = _groupByAnno(keys);
    for (const [anno, ids] of Object.entries(perAnno)) {
      (_lezioni[anno] || []).forEach(l => { if (ids.has(l.id)) { l.compiti = ''; l.scadenza = ''; } });
      await _saveLezioni(anno);
    }
    _cacheDrop();
  }

  // ── Rubriche valutative (libreria di griglie, globale) ─────────────
  function getRubriche() { return _rubriche; }
  async function saveRubriche(list) {
    if (!_cache) await all();
    _rubriche = list;
    await packs().doc('rubriche').set({ json: JSON.stringify(_rubriche) });
    _cacheDrop();
  }

  // ── To-do (elenco globale, non legato all'anno scolastico) ─────────
  function getTodos() { return _todos; }
  async function saveTodos(list) {
    if (!_cache) await all();
    _todos = list;
    await packs().doc('todos').set({ json: JSON.stringify(_todos) });
    _cacheDrop();
  }

  // ── Colloqui (per anno scolastico) ──────────────────────────────────
  function getColloqui(anno) { return _colloqui[anno] || []; }
  // Anni con almeno un colloquio salvato: gli appuntamenti generati in blocco
  // possono cadere in un anno senza ancora alunni iscritti (allYears() in
  // app.js guarda solo le iscrizioni), altrimenti sparirebbero dall'elenco
  // quando il filtro Anno è su "Tutti gli anni"
  function getColloquiAnni() { return Object.keys(_colloqui); }
  async function _saveColloqui(anno) {
    const arr = _colloqui[anno] || [];
    const ref = packs().doc(colDocId(anno));
    if (!arr.length) { await ref.delete(); return; }
    await ref.set({ json: JSON.stringify(arr) });
  }
  function _newColloquio(c) {
    return {
      id: uid(), data: c.data || '', ora: c.ora || '', studenteId: c.studenteId || '',
      partecipanti: c.partecipanti || '', note: c.note || '', meetLink: c.meetLink || '',
      // id dell'evento gemello su Google Calendar (sincronizzazione automatica,
      // vedi gcal.js): '' finché non è mai stato sincronizzato con successo
      gcalEventId: c.gcalEventId || '',
    };
  }
  async function addColloquio(anno, c) {
    if (!_cache) await all();
    const rec = _newColloquio(c);
    (_colloqui[anno] ||= []).push(rec);
    await _saveColloqui(anno);
    _cacheDrop();
    return rec;
  }
  async function updateColloquio(anno, id, attrs) {
    if (!_cache) await all();
    const arr = _colloqui[anno] || [];
    const idx = arr.findIndex(c => c.id === id);
    if (idx < 0) return;
    Object.assign(arr[idx], attrs);
    await _saveColloqui(anno);
    _cacheDrop();
  }
  async function removeColloquio(anno, id) {
    if (!_cache) await all();
    _colloqui[anno] = (_colloqui[anno] || []).filter(c => c.id !== id);
    await _saveColloqui(anno);
    _cacheDrop();
  }
  // Generazione automatica di più appuntamenti (uno per settimana su un
  // periodo Da/A): un solo salvataggio per anno coinvolto, come addLezioniBulk
  async function addColloquiBulk(colloquiPerAnno) {
    if (!_cache) await all();
    const anni = new Set();
    Object.entries(colloquiPerAnno).forEach(([anno, list]) => {
      (_colloqui[anno] ||= []).push(...list.map(_newColloquio));
      anni.add(anno);
    });
    for (const anno of anni) await _saveColloqui(anno);
    _cacheDrop();
  }

  // ── Appuntamenti: collegi, consigli di classe, incontri (per anno) ──
  function getAppuntamenti(anno) { return _appuntamenti[anno] || []; }
  function getAppuntamentiAnni() { return Object.keys(_appuntamenti); }
  async function _saveAppuntamenti(anno) {
    const arr = _appuntamenti[anno] || [];
    const ref = packs().doc(apptDocId(anno));
    if (!arr.length) { await ref.delete(); return; }
    await ref.set({ json: JSON.stringify(arr) });
  }
  function _newAppuntamento(a) {
    return {
      id: uid(), tipo: a.tipo || 'incontro', data: a.data || '', ora: a.ora || '',
      oraFine: a.oraFine || '', modalita: a.modalita || 'presenza', classe: a.classe || '',
      oggetto: a.oggetto || '', luogo: a.luogo || '', note: a.note || '', meetLink: a.meetLink || '',
      // id dell'evento gemello su Google Calendar (sincronizzazione automatica,
      // vedi gcal.js): '' finché non è mai stato sincronizzato con successo
      gcalEventId: a.gcalEventId || '',
    };
  }
  async function addAppuntamento(anno, a) {
    if (!_cache) await all();
    const rec = _newAppuntamento(a);
    (_appuntamenti[anno] ||= []).push(rec);
    await _saveAppuntamenti(anno);
    _cacheDrop();
    return rec;
  }
  async function updateAppuntamento(anno, id, attrs) {
    if (!_cache) await all();
    const arr = _appuntamenti[anno] || [];
    const idx = arr.findIndex(a => a.id === id);
    if (idx < 0) return;
    Object.assign(arr[idx], attrs);
    await _saveAppuntamenti(anno);
    _cacheDrop();
  }
  async function removeAppuntamento(anno, id) {
    if (!_cache) await all();
    _appuntamenti[anno] = (_appuntamenti[anno] || []).filter(a => a.id !== id);
    await _saveAppuntamenti(anno);
    _cacheDrop();
  }

  async function get(id) {
    if (!_cache) await all();
    return _cache.find(s => s.id === id) || null;
  }

  async function put(doc) {
    if (!_cache) await all();
    _stamp(doc);
    if (!_cache.some(s => s.id === doc.id)) _cache.push(doc);
    const dirty = _dirtyOf(doc);
    if (dirty.anag) await _saveAnagrafica();
    for (const y of dirty.anni) await _saveAnno(y);
    _markLoaded(doc);
    _cacheDrop();
    return doc;
  }

  // Scrittura in blocco (import CSV/backup): ogni pacchetto riscritto una volta sola
  async function putMany(docs) {
    if (!_cache) await all();
    let anagDirty = false;
    const anniDirty = new Set();
    docs.forEach(doc => {
      _stamp(doc);
      if (!_cache.some(s => s.id === doc.id)) _cache.push(doc);
      const dirty = _dirtyOf(doc);
      if (dirty.anag) anagDirty = true;
      dirty.anni.forEach(y => anniDirty.add(y));
    });
    if (anagDirty) await _saveAnagrafica();
    for (const y of anniDirty) await _saveAnno(y);
    docs.forEach(_markLoaded);
    _cacheDrop();
    return docs.length;
  }

  // Elimina una classe per un dato anno: disiscrive tutti gli alunni di quella
  // classe/anno (i loro voti in quell'anno vengono persi, l'anagrafica e gli
  // altri anni restano intatti) e rimuove i metadati (istituto/indirizzo/materie).
  async function deleteClasse(anno, classe) {
    if (!_cache) await all();
    const affected = _cache.filter(s => s.anni?.[anno]?.classe === classe);
    affected.forEach(s => { delete s.anni[anno]; });
    await putMany(affected);
    const key = classeMetaKey(anno, classe);
    if (_classiMeta[key]) {
      delete _classiMeta[key];
      await packs().doc('classi-meta').set({ json: JSON.stringify(_classiMeta) });
      _cacheDrop();
    }
    return affected.length;
  }

  // Promuove una classe all'anno successivo: gli alunni in `nonPromossiIds`
  // non vengono toccati (restano dove sono, nell'anno corrente — se l'anno
  // prossimo ripeteranno andrà gestito a parte, quando quell'anno esiste
  // davvero). Solo i promossi vengono iscritti a `nextClasse`/`nextAnno`.
  // Porta avanti istituto/indirizzo se non già impostati.
  async function promuoviClasse(anno, classe, nextAnno, nextClasse, nonPromossiIds) {
    if (!_cache) await all();
    const affected = _cache
      .filter(s => s.anni?.[anno]?.classe === classe)
      .filter(s => !nonPromossiIds.has(s.id));
    affected.forEach(s => { enroll(s, nextAnno, nextClasse); });
    _carryClasseMeta(anno, classe, nextAnno, nextClasse);
    await packs().doc('classi-meta').set({ json: JSON.stringify(_classiMeta) });
    await putMany(affected);
    return affected.length;
  }

  async function remove(id) {
    if (!_cache) await all();
    const prev = _loaded[id];
    _cache = _cache.filter(s => s.id !== id);
    await _saveAnagrafica();
    if (prev) for (const y of Object.keys(prev.anni)) await _saveAnno(y);
    delete _loaded[id];
    _cacheDrop();
  }

  async function clear() {
    const snap = await packs().get();
    for (let i = 0; i < snap.docs.length; i += 450) {
      const batch = _db().batch();
      snap.docs.slice(i, i + 450).forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
    _loaded = {};
    _cacheDrop();
  }

  // ── Helper documento ──────────────────────────────────────────────
  function newStudent(nome, cognome) {
    return {
      id: uid(),
      nome: nome || '',
      cognome: cognome || '',
      profilo: 'ND',
      profiloTipo: [],
      note: '',
      // Piano BES (facoltativo, ha senso solo con profilo PDP/PEI): strumenti
      // compensativi/dispensativi/valutativi e obiettivi, testo libero.
      besPiano: { compensativi: '', dispensativi: '', valutativi: '', obiettivi: '' },
      anni: {},
      createdAt: null,
      updatedAt: null,
    };
  }

  // Iscrive l'alunno a un anno scolastico (muta e ritorna il doc, non salva)
  function enroll(doc, anno, classe) {
    if (!doc.anni[anno]) doc.anni[anno] = { classe: classe || '', materie: {} };
    else if (classe !== undefined) doc.anni[anno].classe = classe;
    return doc;
  }

  // Aggiunge un voto al documento (muta e ritorna il doc, non salva).
  // Se l'anno non esiste ancora, l'alunno viene iscritto ereditando
  // la classe più recente.
  function addGrade(doc, anno, materia, grade) {
    if (!doc.anni[anno]) doc.anni[anno] = { classe: classeCorrente(doc), materie: {} };
    if (!doc.anni[anno].materie[materia]) doc.anni[anno].materie[materia] = [];
    doc.anni[anno].materie[materia].push({
      id: grade.id || uid(),
      voto: grade.voto,
      data: grade.data || todayISO(),
      tipo: grade.tipo || 'scritto',
      desc: grade.desc || '',
      commento: grade.commento || '',
      // Dati di "Verifiche" (facoltativi, per poter riaprire e modificare una
      // verifica già salvata): griglia = [{a,b,c}, …] un elemento per
      // esercizio; verificaEsercizi = [{max}, …] i punteggi massimi usati;
      // verificaPercentuali = [percentuale 0-100, …] di questo alunno.
      // Tutti nello stesso ordine degli esercizi al momento del salvataggio.
      griglia: grade.griglia || null,
      verificaEsercizi: grade.verificaEsercizi || null,
      verificaPercentuali: grade.verificaPercentuali || null,
    });
    return doc;
  }

  function removeGrade(doc, anno, materia, gradeId) {
    const arr = doc.anni?.[anno]?.materie?.[materia];
    if (!arr) return doc;
    doc.anni[anno].materie[materia] = arr.filter(g => g.id !== gradeId);
    if (!doc.anni[anno].materie[materia].length) delete doc.anni[anno].materie[materia];
    // L'anno resta anche senza voti: conserva l'iscrizione (classe)
    return doc;
  }

  // Modifica un voto esistente (muta e ritorna il doc, non salva). Se anno o
  // materia cambiano rispetto all'originale, il voto viene spostato mantenendo
  // lo stesso id (per non perdere continuità con eventuali riferimenti esterni).
  function editGrade(doc, oldAnno, oldMateria, gradeId, newAnno, newMateria, attrs) {
    const arr = doc.anni?.[oldAnno]?.materie?.[oldMateria];
    const idx = arr ? arr.findIndex(g => g.id === gradeId) : -1;
    if (idx < 0) return doc;
    const original = arr[idx];
    arr.splice(idx, 1);
    if (!arr.length) delete doc.anni[oldAnno].materie[oldMateria];
    addGrade(doc, newAnno, newMateria, {
      id: gradeId,
      voto: attrs.voto, data: attrs.data || original.data, tipo: attrs.tipo || original.tipo,
      desc: attrs.desc ?? original.desc, commento: attrs.commento ?? original.commento,
      griglia: attrs.griglia !== undefined ? attrs.griglia : original.griglia,
      verificaEsercizi: attrs.verificaEsercizi !== undefined ? attrs.verificaEsercizi : original.verificaEsercizi,
      verificaPercentuali: attrs.verificaPercentuali !== undefined ? attrs.verificaPercentuali : original.verificaPercentuali,
    });
    return doc;
  }

  // Export / import JSON per backup (include anche orario e registro lezioni)
  async function exportJSON() {
    const data = await all();
    return JSON.stringify({
      app: APP, exportedAt: new Date().toISOString(),
      students: data, orario: _orario, lezioni: _lezioni, rubriche: _rubriche, colloqui: _colloqui, appuntamenti: _appuntamenti, todos: _todos,
    }, null, 2);
  }

  async function importJSON(json, { replace = false } = {}) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    const list = Array.isArray(parsed) ? parsed : (parsed.students || []);
    if (replace) { await clear(); _cache = []; _orario = {}; _lezioni = {}; }
    list.forEach(s => {
      if (!s.id) s.id = uid();
      s.anni = s.anni || {};
      // Compatibilità con vecchi backup: classe sull'alunno → iscrizione
      if (s.classe) {
        if (!Object.keys(s.anni).length) s.anni[currentAnno()] = { classe: s.classe, materie: {} };
        delete s.classe;
      }
    });
    await putMany(list);
    if (!Array.isArray(parsed) && parsed.orario) {
      Object.entries(parsed.orario).forEach(([anno, slots]) => { _orario[anno] = slots; });
      await packs().doc('orario').set({ json: JSON.stringify(_orario) });
    }
    if (!Array.isArray(parsed) && parsed.lezioni) {
      for (const [anno, arr] of Object.entries(parsed.lezioni)) {
        _lezioni[anno] = arr;
        await _saveLezioni(anno);
      }
    }
    if (!Array.isArray(parsed) && parsed.rubriche) {
      _rubriche = parsed.rubriche;
      await packs().doc('rubriche').set({ json: JSON.stringify(_rubriche) });
    }
    if (!Array.isArray(parsed) && parsed.colloqui) {
      for (const [anno, arr] of Object.entries(parsed.colloqui)) {
        _colloqui[anno] = arr;
        await _saveColloqui(anno);
      }
    }
    if (!Array.isArray(parsed) && parsed.appuntamenti) {
      for (const [anno, arr] of Object.entries(parsed.appuntamenti)) {
        _appuntamenti[anno] = arr;
        await _saveAppuntamenti(anno);
      }
    }
    if (!Array.isArray(parsed) && parsed.todos) {
      _todos = parsed.todos;
      await packs().doc('todos').set({ json: JSON.stringify(_todos) });
    }
    _cacheDrop();
    return list.length;
  }

  return {
    all, get, put, putMany, remove, clear, uid,
    newStudent, enroll, addGrade, removeGrade, editGrade,
    currentAnno, classeCorrente,
    getClasseMeta, materieOf, indirizzoOf, istitutoOf, materieMapAll, allIstituti, setClasseMeta,
    deleteClasse, promuoviClasse,
    getOrario, setOrarioSlots, setOrarioPeriodo, setOrarioSabato,
    getLezioni, addLezione, updateLezione, removeLezione, addLezioniBulk,
    removeLezioniBulk, clearCompitiBulk,
    getRubriche, saveRubriche,
    getColloqui, getColloquiAnni, addColloquio, updateColloquio, removeColloquio, addColloquiBulk,
    getAppuntamenti, getAppuntamentiAnni, addAppuntamento, updateAppuntamento, removeAppuntamento,
    getTodos, saveTodos,
    exportJSON, importJSON,
  };
})();

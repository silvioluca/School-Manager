// ── Stato ───────────────────────────────────────────────────────────
const state = {
  view: 'dashboard',       // 'dashboard' | 'alunni' | 'classi' | 'voti' | 'report' | 'alunno-detail'
  previousView: 'alunni',  // vista da cui si è aperta la scheda alunno (per il "← Torna")
  // Filtro anno scolastico: parte sempre sull'A.S. corrente (settembre–agosto,
  // stessa regola di DB.currentAnno) invece che su "Tutti gli anni" — resta
  // comunque una select libera, l'utente può sempre cambiarlo manualmente.
  year: DB.currentAnno(),
  istituto: 'all',         // filtro istituto
  klass: 'all',            // filtro classe
  search: '',
  students: [],            // cache documenti
  openId: null,            // alunno mostrato nella Scheda alunno
  openYear: null,          // anno selezionato nella scheda
  noteCtx: null,           // { kind: 'colloquio'|'appuntamento', anno, id } mostrato nella pagina Nota
  alunniSelected: new Set(), // id alunno selezionati per le azioni di gruppo
  classiSelected: new Set(), // chiavi "anno|classe" selezionate per le azioni di gruppo
  votiSelected: new Set(),  // chiavi "sid|anno|materia|gid" selezionate per le azioni di gruppo
  lezioniSelected: new Set(), // chiavi "anno|id" selezionate nell'elenco lezioni
  compitiSelected: new Set(), // chiavi "anno|id" selezionate nella sezione compiti
  besSelected: new Set(),  // id alunno selezionati nell'elenco BES
  colloquiSelected: new Set(), // chiavi "anno|id" selezionate nell'elenco colloqui
  appuntamentiSelected: new Set(), // chiavi "anno|id" selezionate nell'elenco appuntamenti
  rubricheSelected: new Set(), // id rubrica selezionati nell'elenco rubriche
  todoSelected: new Set(), // id to-do selezionati nell'elenco
  reportMateria: 'all',    // filtro materia nella sezione Report
  reportAlunno: 'all',     // filtro alunno nella sezione Report
  filtroDa: '',            // filtro periodo-da (YYYY-MM-DD, '' = nessun limite): Voti, Lezioni, Compiti, Report
  filtroA: '',             // filtro periodo-a
  vfSelectedKey: null,     // chiave (Descrizione+Data+Classe+Materia) della verifica scelta in "Verifiche"; null = modalità nuova verifica
  registroMateria: 'all',  // filtro materia nel Registro voti (Scheda classe)
  registroTipo: 'all',     // filtro tipologia nel Registro voti (Scheda classe)
  lezView: 'elenco',       // 'elenco' | 'settimana' | 'calendario'
  besView: 'schede',       // 'schede' | 'elenco'
  rubricheView: 'schede',  // 'schede' | 'elenco'
  todoView: 'kanban',      // 'kanban' | 'elenco'
  calView: 'settimana',    // 'settimana' | 'mese' | 'agenda' — vista attiva nella sezione Calendario
  calRefDate: null,        // data di riferimento (YYYY-MM-DD) per Calendario, indipendente da lezRefDate
  calFilters: { colloqui: true, appuntamenti: true }, // tipi visibili in Calendario (mai le lezioni: hanno la propria vista)
  lezRefDate: null,        // data di riferimento (YYYY-MM-DD) per le viste settimana/calendario
  raggruppa: {             // "Raggruppa" per vista: booleano (solo classe) ovunque
    voti: false, alunni: false, bes: false, compiti: false, colloqui: false,
    // eccetto lezioni (prototipo Notion): null oppure 'classe'|'materia'|'giorno'|'ora'
    lezioni: null,
  },
  groupPage: {}, // "viewKey|valoreGruppo" -> pagina corrente (0-based) quando raggruppato
  sort: {                  // ordinamento corrente per ciascuna tabella: { key, dir: 1|-1 }
    alunni: { key: 'nome', dir: 1 },
    classi: { key: 'anno', dir: -1 },
    voti: { key: 'data', dir: -1 },
    report: { key: 'data', dir: -1 },
    summary: { key: 'materia', dir: 1 },
    lezioni: { key: 'data', dir: -1 },
    compiti: { key: 'scadenza', dir: 1 },
    rubriche: { key: 'nome', dir: 1 },
    todo: { key: 'scadenza', dir: 1 },
  },
};

const charts = {};       // istanze Chart.js per distruzione/ricreazione
const ALL_VIEWS = ['dashboard', 'alunni', 'bes', 'classi', 'voti', 'verifiche', 'rubriche', 'bonusmalus', 'lezioni', 'compiti', 'todo', 'orario', 'colloqui', 'appuntamenti', 'calendario', 'report', 'report-ore', 'report-os', 'alunno-detail', 'classe-detail', 'item-note'];
const VIEW_TITLES = {
  dashboard: 'Dashboard', alunni: 'Alunni', classi: 'Classi', voti: 'Voti', lezioni: 'Lezioni', compiti: 'Compiti', orario: 'Orario', report: 'Report Voti',
  'alunno-detail': 'Scheda alunno', 'classe-detail': 'Scheda classe', verifiche: 'Verifiche', rubriche: 'Rubriche valutative', bonusmalus: 'Bonus/Malus',
  bes: 'BES', colloqui: 'Colloqui', appuntamenti: 'Appuntamenti', calendario: 'Calendario', todo: 'To-do', 'item-note': 'Nota', 'report-ore': 'Report ore',
  'report-os': 'Report Orali/Scritti',
};
// Tipi di appuntamento istituzionale (collegi/consigli/incontri, anche pomeridiani o online)
const TIPI_APPUNTAMENTO = {
  collegio: 'Collegio docenti', consiglio: 'Consiglio di classe', dipartimento: 'Dipartimento',
  glo: 'GLO', incontro: 'Incontro',
};
// Stati del kanban To-do, nell'ordine in cui compaiono le colonne
const TODO_STATI = [
  { key: 'da_fare', label: 'Da fare' },
  { key: 'in_corso', label: 'In corso' },
  { key: 'fatto', label: 'Fatto' },
];

// ── Profili inclusione (codici ufficiali) ───────────────────────────
// PDP: codici ICD-10 dei DSA (L.170/2010) + altri BES (Dir. 27/12/2012).
// PEI (L.104/92): aree di disabilità (le sigle sono una scorciatoia interna,
// non un codice ministeriale unico — le classificazioni SIDI variano da scuola a scuola).
// Uno studente può avere più tipologie contemporaneamente (comorbidità comuni,
// es. dislessia + discalculia): profiloTipo è quindi un array di codici.
const PROFILI = { ND: 'Normodotazione', PDP: 'PDP', PEI: 'PEI' };
const PROFILO_TIPI = {
  PEI: [
    { c: 'INT', l: 'Disabilità intellettiva' },
    { c: 'MOT', l: 'Disabilità motoria' },
    { c: 'VIS', l: 'Disabilità visiva' },
    { c: 'UDI', l: 'Disabilità uditiva' },
    { c: 'AUT', l: 'Disturbo dello spettro autistico' },
    { c: 'PLU', l: 'Disabilità plurima' },
    { c: 'ALT', l: 'Altra disabilità certificata (L.104/92)' },
  ],
  PDP: [
    { c: 'F81.0', l: 'F81.0 — Dislessia' },
    { c: 'F81.1', l: 'F81.1 — Disortografia' },
    { c: 'F81.2', l: 'F81.2 — Discalculia' },
    { c: 'F81.3', l: 'F81.3 — Disturbo misto delle abilità scolastiche' },
    { c: 'F81.8', l: 'F81.8 — Disgrafia / altri disturbi evolutivi' },
    { c: 'F80',   l: 'F80 — Disturbo del linguaggio' },
    { c: 'F90',   l: 'F90 — ADHD (Deficit di Attenzione/Iperattività)' },
    { c: 'FIL',   l: 'FIL — Funzionamento Intellettivo Limite' },
    { c: 'BES',   l: 'BES — Svantaggio socio-economico/linguistico/culturale' },
  ],
};
// I dati salvati prima di questa modifica avevano profiloTipo come stringa singola:
// normalizzalo sempre ad array per restare compatibile con quelli vecchi.
function toTipiArray(v) { return Array.isArray(v) ? v : (v ? [v] : []); }
// Etichetta breve per badge: "PEI · AUT, VIS", "PDP · F81.0", '' se normodotazione
function profiloBadge(s) {
  if (!s.profilo || s.profilo === 'ND') return '';
  const tipi = toTipiArray(s.profiloTipo);
  return tipi.length ? `${s.profilo} · ${tipi.join(', ')}` : s.profilo;
}

// ── Indirizzi di studio ministeriali (riordino 2010) ─────────────────
// Selezionabili a tendina nella scheda classe; l'istituto (nome scuola) resta
// invece testo libero, perché non standardizzabile.
const INDIRIZZI_MINISTERIALI = {
  'Licei': [
    'Liceo Classico', 'Liceo Scientifico', 'Liceo Scientifico opzione Scienze Applicate',
    'Liceo Scientifico sezione ad indirizzo sportivo', 'Liceo Linguistico',
    'Liceo delle Scienze Umane', 'Liceo delle Scienze Umane opzione Economico-Sociale',
    'Liceo Artistico', 'Liceo Musicale e Coreutico',
  ],
  'Istituti Tecnici — Economico': ['Amministrazione, Finanza e Marketing', 'Turismo'],
  'Istituti Tecnici — Tecnologico': [
    'Meccanica, Meccatronica ed Energia', 'Trasporti e Logistica', 'Elettronica ed Elettrotecnica',
    'Informatica e Telecomunicazioni', 'Grafica e Comunicazione', 'Chimica, Materiali e Biotecnologie',
    'Sistema Moda', 'Agraria, Agroalimentare e Agroindustria', 'Costruzioni, Ambiente e Territorio',
  ],
  'Istituti Professionali — Servizi': [
    "Servizi per l'Agricoltura e lo Sviluppo Rurale", 'Servizi Socio-Sanitari',
    'Enogastronomia e Ospitalità Alberghiera', 'Servizi Commerciali',
  ],
  'Istituti Professionali — Industria e Artigianato': [
    'Produzioni Industriali e Artigianali', 'Manutenzione e Assistenza Tecnica',
  ],
};

// ── Tema ────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('sm-theme') || 'dark';
if (savedTheme === 'light') document.documentElement.setAttribute('data-theme', 'light');

document.getElementById('theme-toggle').addEventListener('click', () => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
  localStorage.setItem('sm-theme', isLight ? 'dark' : 'light');
  if (state.view === 'alunno-detail') { renderStudentChart(); renderStudentExtraCharts(); }
  if (state.view === 'classe-detail') {
    const t = classeDetailTarget();
    if (t.mode !== 'ambiguous') renderClasseCharts(t);
  }
  if (state.view === 'dashboard') renderDashboard();
});

// ── Sidebar / navigazione ───────────────────────────────────────────
document.getElementById('hamburger').addEventListener('click', () => {
  document.body.classList.toggle('sidebar-open');
});
document.getElementById('sidebar-backdrop').addEventListener('click', () => {
  document.body.classList.remove('sidebar-open');
});

function setView(v) {
  state.view = v;
  document.querySelectorAll('[data-view]').forEach(b =>
    b.classList.toggle('active', b.dataset.view === v));
  // Espande automaticamente il gruppo sidebar che contiene la view appena
  // attivata (anche da navigazione programmatica, es. "torna a Classi"),
  // senza richiudere gli altri gruppi eventualmente aperti dall'utente.
  document.querySelectorAll('.subject-group').forEach(g => {
    const hasActive = !!g.querySelector(`[data-view="${v}"]`);
    if (hasActive) g.classList.add('open');
    g.classList.toggle('has-active', hasActive);
  });
  // su tablet/mobile la sidebar è in overlay: chiudila dopo la scelta
  if (window.innerWidth <= 1024) document.body.classList.remove('sidebar-open');
  renderView();
}
document.querySelectorAll('[data-view]').forEach(btn =>
  btn.addEventListener('click', () => {
    // Click diretto sul menu (non un "vai a"/submenu programmatico): riparte
    // da una vista pulita invece di restare filtrata su quanto si stava
    // guardando prima (es. una classe specifica).
    if (btn.dataset.view === 'alunni' || btn.dataset.view === 'classi') {
      state.klass = 'all';
      buildFilterBar();
    }
    setView(btn.dataset.view);
  }));
document.querySelectorAll('.subject-group-toggle').forEach(btn =>
  btn.addEventListener('click', () => btn.closest('.subject-group').classList.toggle('open')));

// ── Helper voti / colori ────────────────────────────────────────────
function avg(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}
function gradeClass(v) { return v == null ? '' : v >= 6 ? 'g-good' : v >= 5 ? 'g-mid' : 'g-bad'; }
function fmt(v) { return v == null ? '–' : v.toFixed(2).replace('.', ','); }
// Le date sono sempre salvate/ordinate in ISO (YYYY-MM-DD): questa è solo la
// resa a video in dd/mm/yyyy, non tocca il formato interno né i confronti.
function fmtData(iso) {
  const m = String(iso ?? '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : (iso || '');
}
function escHtml(s) { return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

// Scarica un contenuto testuale/binario come file, senza lasciare l'oggetto Blob in memoria
function downloadBlob(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}
function initials(s) { return `${(s.nome[0] || '')}${(s.cognome[0] || '')}`.toUpperCase() || '?'; }

// ── Ordinamento tabelle (generico, riusato da tutte le tabelle del sito) ──
// `getters` mappa ogni chiave di colonna alla funzione che estrae il valore
// grezzo (non la stringa già formattata) da una riga, per ordinare numeri
// come numeri e non alfabeticamente. I valori nulli finiscono sempre in
// fondo, indipendentemente dalla direzione.
function sortRows(table, rows, getters) {
  const s = state.sort[table];
  const get = s && getters[s.key];
  if (!get) return rows;
  return [...rows].sort((a, b) => {
    let va = get(a), vb = get(b);
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return -1 * s.dir;
    if (va > vb) return 1 * s.dir;
    return 0;
  });
}
// Freccina da appendere all'etichetta della colonna attualmente ordinata
function sortIcon(table, key) {
  const s = state.sort[table];
  if (!s || s.key !== key) return '';
  return `<span class="sort-arrow">${s.dir === 1 ? '▲' : '▼'}</span>`;
}
// Collega il click sulle intestazioni ordinabili (th[data-sort]) di una
// tabella appena renderizzata: stesso tasto → inverte direzione, tasto
// diverso → nuova colonna, direzione ascendente.
function wireSort(wrap, table, renderFn) {
  wrap.querySelectorAll('th[data-sort]').forEach(th => th.addEventListener('click', () => {
    const key = th.dataset.sort;
    const cur = state.sort[table];
    if (cur && cur.key === key) cur.dir *= -1;
    else state.sort[table] = { key, dir: 1 };
    renderFn();
  }));
}

// Sotto questa soglia .col-hide-m viene nascosta via CSS: le stesse righe
// diventano "espandibili" al tap invece di perdere quei dati del tutto
function isMobileWidth() { return window.matchMedia('(max-width: 900px)').matches; }

// Espande/richiude `row` mostrando i valori delle sue colonne nascoste in
// mobile (.col-hide-m), letti direttamente dal DOM (testo o valore
// dell'input/select, se la cella è un campo inline) — generico, funziona
// su qualunque tabella con intestazioni <th> e classe .col-hide-m.
function toggleRowExpand(row) {
  const table = row.closest('table');
  const next = row.nextElementSibling;
  if (next && next.classList.contains('row-expand-detail')) {
    next.remove();
    row.classList.remove('expanded');
    return;
  }
  table.querySelectorAll('.row-expand-detail').forEach(r => r.remove());
  table.querySelectorAll('tr.expanded').forEach(r => r.classList.remove('expanded'));

  const headers = [...table.querySelectorAll('thead th')];
  const cells = [...row.children];
  const items = cells.map((td, i) => {
    if (!td.classList.contains('col-hide-m')) return null;
    const label = (headers[i]?.textContent || '').replace(/[▲▼]/g, '').trim();
    const field = td.querySelector('input, select');
    const value = field ? (field.tagName === 'SELECT' ? field.selectedOptions[0]?.text : field.value) : td.textContent.trim();
    return { label, value };
  }).filter(Boolean);
  if (!items.length) return;

  const detail = document.createElement('tr');
  detail.className = 'row-expand-detail';
  const td = document.createElement('td');
  td.colSpan = cells.length;
  td.innerHTML = items.map(it => `<div class="rxd-item"><span class="rxd-label">${escHtml(it.label)}</span><span class="rxd-value">${escHtml(it.value || '—')}</span></div>`).join('');
  detail.appendChild(td);
  row.after(detail);
  row.classList.add('expanded');
}

// Tutti i voti di un alunno (eventualmente filtrati per anno), flat
function gradesOf(s, year) {
  const out = [];
  for (const [anno, y] of Object.entries(s.anni || {})) {
    if (year && year !== 'all' && anno !== year) continue;
    for (const [materia, arr] of Object.entries(y.materie || {})) {
      arr.forEach(g => out.push({ ...g, anno, materia }));
    }
  }
  return out;
}
function studentAvg(s, year) { return avg(gradesOf(s, year).map(g => g.voto)); }

// Tutti gli anni scolastici presenti nel dataset (ordinati)
function allYears(list = state.students) {
  const set = new Set();
  list.forEach(s => Object.keys(s.anni || {}).forEach(y => set.add(y)));
  return [...set].sort();
}

// Classe dell'alunno nell'anno indicato ('all' → la più recente)
function classeOf(s, year) {
  if (year && year !== 'all') return s.anni?.[year]?.classe || '';
  return DB.classeCorrente(s);
}
// Tutte le classi frequentate dall'alunno nel tempo
function classesOfStudent(s) {
  return [...new Set(Object.values(s.anni || {}).map(y => y.classe).filter(Boolean))];
}
// Tutte le coppie (anno, classe) frequentate dall'alunno
function pairsOfStudent(s) {
  return Object.entries(s.anni || {}).filter(([, v]) => v.classe).map(([anno, v]) => ({ anno, classe: v.classe }));
}
// L'alunno appartiene alla classe c (rispettando il filtro anno)?
function inClasse(s, c, year = state.year) {
  if (year !== 'all') return s.anni?.[year]?.classe === c;
  return classesOfStudent(s).includes(c);
}
// L'alunno appartiene all'istituto i (rispettando il filtro anno)?
function inIstituto(s, ist, year = state.year) {
  return pairsOfStudent(s)
    .filter(p => year === 'all' || p.anno === year)
    .some(p => DB.istitutoOf(p.anno, p.classe) === ist);
}
// Classi presenti nel dataset (rispettando i filtri anno/istituto)
function allClasses(list = state.students, year = state.year, istituto = state.istituto) {
  const set = new Set();
  list.forEach(s => {
    pairsOfStudent(s)
      .filter(p => year === 'all' || p.anno === year)
      .filter(p => istituto === 'all' || DB.istitutoOf(p.anno, p.classe) === istituto)
      .forEach(p => set.add(p.classe));
  });
  return [...set].sort();
}
// Istituti presenti nel dataset (rispettando il filtro anno)
function allIstituti(list = state.students, year = state.year) {
  const set = new Set();
  list.forEach(s => {
    pairsOfStudent(s)
      .filter(p => year === 'all' || p.anno === year)
      .forEach(p => { const i = DB.istitutoOf(p.anno, p.classe); if (i) set.add(i); });
  });
  return [...set].sort();
}

// Palette deterministica per alunno (accento card/avatar)
const PALETTE = ['#5b9bff', '#2ecc71', '#ffb400', '#ff3b3b', '#9b59b6', '#16a085', '#e67e22', '#e84393'];
function colorOf(s) {
  let h = 0; for (const c of s.id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
function colorOfName(name) {
  let h = 0; for (const c of String(name)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}
// Colori fissi per le materie più comuni, fallback all'hash per le altre
const MATERIA_COLORS = { matematica: '#5b9bff', fisica: '#2ecc71' };
function colorOfMateria(nome) {
  return MATERIA_COLORS[String(nome ?? '').trim().toLowerCase()] || colorOfName(nome);
}
// Pill colorata per classe (hash deterministico, come le materie ma senza mappa fissa)
function colorOfClasse(classe) { return colorOfName(classe); }

// Colori tema-aware per Chart.js
function themeColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    text: cs.getPropertyValue('--text-secondary').trim() || '#888',
    grid: cs.getPropertyValue('--border-idle').trim() || 'rgba(255,255,255,0.08)',
    blue: '#5b9bff', green: '#2ecc71', amber: '#ffb400', red: '#ff3b3b',
  };
}

// ── Caricamento dati ────────────────────────────────────────────────
async function load() {
  state.students = await DB.all();
  await seedRubricheIfEmpty();
  renderAll();
}

// ── Filtri (Anno / Istituto / Classe) ────────────────────────────────
// Tre select in cascata nella filters-bar: Anno → Istituto → Classe.
function buildFilterBar() {
  const selY = document.getElementById('filter-anno');
  const selI = document.getElementById('filter-istituto');
  const selC = document.getElementById('filter-classe');

  // L'A.S. corrente è sempre selezionabile, anche prima che esistano dati per
  // quell'anno (nuovo anno scolastico appena iniziato, ancora senza alunni/voti)
  const years = ['all', ...[...new Set([...allYears(), DB.currentAnno()])].sort()];
  selY.innerHTML = years.map(y =>
    `<option value="${escHtml(y)}" ${state.year === y ? 'selected' : ''}>${y === 'all' ? 'Tutti gli anni' : y}</option>`).join('');

  const istituti = ['all', ...allIstituti(state.students, state.year)];
  if (!istituti.includes(state.istituto)) state.istituto = 'all';
  selI.innerHTML = istituti.map(i =>
    `<option value="${escHtml(i)}" ${state.istituto === i ? 'selected' : ''}>${i === 'all' ? 'Tutti gli istituti' : i}</option>`).join('');

  const classes = ['all', ...allClasses(state.students, state.year, state.istituto)];
  if (!classes.includes(state.klass)) state.klass = 'all';
  selC.innerHTML = classes.map(c =>
    `<option value="${escHtml(c)}" ${state.klass === c ? 'selected' : ''}>${c === 'all' ? 'Tutte le classi' : c}</option>`).join('');

  // Sincronizzazione esplicita: il valore visualizzato deve sempre
  // corrispondere allo stato, non solo l'attributo "selected" nel markup
  selY.value = state.year;
  selI.value = state.istituto;
  selC.value = state.klass;
}
document.getElementById('filter-anno').addEventListener('change', e => {
  state.year = e.target.value;
  buildFilterBar(); // riallinea istituti/classi disponibili al nuovo anno
  renderView();
});
document.getElementById('filter-istituto').addEventListener('change', e => {
  state.istituto = e.target.value;
  buildFilterBar(); // riallinea le classi disponibili al nuovo istituto
  renderView();
});
document.getElementById('filter-classe').addEventListener('change', e => {
  state.klass = e.target.value;
  renderView();
});
document.getElementById('filter-alunno-scheda').addEventListener('change', e => {
  state.openId = e.target.value || null;
  renderView();
});

// "Scheda classe" (sidebar, sempre visibile) è guidata dai filtri Anno/Classe:
// - Classe = "Tutte le classi" → dati aggregati (rispettando Anno/Istituto)
// - Classe specifica ma Anno = "Tutti gli anni" → ambiguo (stessa etichetta,
//   es. "3A", indica coorti diverse in anni diversi: serve scegliere l'anno)
// - entrambi specifici → singola classe
function classeDetailTarget() {
  if (state.klass === 'all') return { mode: 'aggregate' };
  if (state.year === 'all') return { mode: 'ambiguous' };
  return { mode: 'single', anno: state.year, classe: state.klass };
}

// ── Filtri correnti ─────────────────────────────────────────────────
function filtered() {
  return state.students.filter(s => {
    if (state.klass !== 'all' && !inClasse(s, state.klass)) return false;
    if (state.istituto !== 'all' && !inIstituto(s, state.istituto)) return false;
    if (state.year !== 'all' && !(s.anni && s.anni[state.year])) return false;
    if (state.search) {
      const hay = `${s.nome} ${s.cognome} ${classesOfStudent(s).join(' ')}`.toLowerCase();
      if (!hay.includes(state.search)) return false;
    }
    return true;
  });
}

// Come filtered() ma senza ricerca testuale (per la vista Voti,
// dove la ricerca agisce sulle righe voto e non sugli alunni)
function filteredNoSearch() {
  return state.students.filter(s => {
    if (state.klass !== 'all' && !inClasse(s, state.klass)) return false;
    if (state.istituto !== 'all' && !inIstituto(s, state.istituto)) return false;
    if (state.year !== 'all' && !(s.anni && s.anni[state.year])) return false;
    return true;
  });
}

// ── "Raggruppa per classe" ────────────────────────────────────────────
// Inserisce un'intestazione a piena larghezza fra un gruppo e l'altro.
// getClasse(item) legge la classe dall'elemento originale (non dall'HTML già
// pronto), renderRow(item) produce la riga <tr> come nell'elenco piatto.
function groupByClasse(items, getClasse, compareFn) {
  const groups = new Map();
  items.forEach(item => {
    const c = getClasse(item) || '—';
    if (!groups.has(c)) groups.set(c, []);
    groups.get(c).push(item);
  });
  return [...groups.keys()].sort(compareFn || ((a, b) => a.localeCompare(b, 'it', { numeric: true })))
    .map(classe => ({ classe, items: groups.get(classe) }));
}
// Ogni gruppo è un panel a sé, con la STESSA identica struttura (classi
// .panel.table-panel, stesso .table-wrap) della tabella non raggruppata —
// non uno sfondo/colore diverso incollato sopra, proprio le stesse regole
// CSS applicate di nuovo N volte. Il panel statico viene nascosto e questi
// vengono resi in un contenitore fratello separato (#X-groups), non
// annidati dentro di esso: nessun trucco di trasparenza necessario.
function groupPanelHeadHtml(classe, n) {
  return `
      <div class="group-panel-head">
        <h3 class="group-panel-title">${escHtml(classe)}</h3>
        <span class="stat-sub">${n} element${n === 1 ? 'o' : 'i'}</span>
      </div>`;
}
const GROUP_PAGE_SIZE = 10;
// Frecce per sfogliare un gruppo 10 alla volta quando supera il limite di
// una pagina — la pagina corrente resta in state.groupPage, non nel DOM,
// così sopravvive al re-render (i bottoni sono rigenerati ogni volta).
// Stile sobrio: solo icona, niente bordo/sfondo, allineate a destra.
function groupPagerHtml(pageKey, page, totalPages) {
  return `
      <div class="group-pager">
        <span class="stat-sub">Pagina ${page + 1} di ${totalPages}</span>
        <button class="pager-arrow" data-page-prev="${escHtml(pageKey)}" ${page === 0 ? 'disabled' : ''} title="Pagina precedente">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="pager-arrow" data-page-next="${escHtml(pageKey)}" ${page === totalPages - 1 ? 'disabled' : ''} title="Pagina successiva">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>`;
}
function groupedTablePanels(items, getClasse, theadHtml, renderRow, extraTableClass, opts = {}) {
  const { compareFn, pageKeyPrefix } = opts;
  return groupByClasse(items, getClasse, compareFn).map(({ classe, items: rows }) => {
    const totalPages = Math.max(1, Math.ceil(rows.length / GROUP_PAGE_SIZE));
    const pageKey = `${pageKeyPrefix || ''}|${classe}`;
    let page = state.groupPage[pageKey] || 0;
    if (page > totalPages - 1) page = totalPages - 1;
    const pageRows = pageKeyPrefix ? rows.slice(page * GROUP_PAGE_SIZE, page * GROUP_PAGE_SIZE + GROUP_PAGE_SIZE) : rows;
    return `
    <div class="panel table-panel group-panel">
      ${groupPanelHeadHtml(classe, rows.length)}
      <div class="table-wrap">
        <table class="voti-table ${extraTableClass || ''}">
          <thead><tr>${theadHtml}</tr></thead>
          <tbody>${pageRows.map(renderRow).join('')}</tbody>
        </table>
      </div>
      ${pageKeyPrefix && totalPages > 1 ? groupPagerHtml(pageKey, page, totalPages) : ''}
    </div>`;
  }).join('');
}
// Stessa cosa per elenchi a card (BES in vista Schede): una sezione per classe
function groupedCardPanels(items, getClasse, renderCard) {
  return groupByClasse(items, getClasse).map(({ classe, items: cards }) => `
    <div class="group-section">
      ${groupPanelHeadHtml(classe, cards.length)}
      <div class="bes-list">${cards.map(renderCard).join('')}</div>
    </div>`).join('');
}
document.addEventListener('click', e => {
  const prev = e.target.closest('[data-page-prev]');
  const next = e.target.closest('[data-page-next]');
  if (prev) { state.groupPage[prev.dataset.pagePrev] = Math.max(0, (state.groupPage[prev.dataset.pagePrev] || 0) - 1); renderView(); }
  else if (next) { state.groupPage[next.dataset.pageNext] = (state.groupPage[next.dataset.pageNext] || 0) + 1; renderView(); }
});
// Pulsante "Raggruppa per classe" generico, in due varianti:
// - bottone testuale semplice: click = toggle diretto (Voti/Alunni/BES/...)
// - icona dentro un .tb-dropdown (prototipo Notion su Lezioni): click apre/
//   chiude un menu a comparsa, il toggle vero avviene scegliendo "Classe"
document.querySelectorAll('.btn-raggruppa').forEach(btn => btn.addEventListener('click', e => {
  const dd = btn.closest('.tb-dropdown');
  if (dd) {
    e.stopPropagation();
    const menu = dd.querySelector('.tb-dropdown-menu');
    const willOpen = menu.classList.contains('hidden');
    document.querySelectorAll('.tb-dropdown-menu').forEach(m => m.classList.add('hidden'));
    if (willOpen) menu.classList.remove('hidden');
    return;
  }
  const key = btn.dataset.rg;
  state.raggruppa[key] = !state.raggruppa[key];
  renderView();
}));
// Il menu ha più opzioni (Classe/Materia/Giorno/Ora, per ora solo su
// Lezioni): scegliere quella già attiva disattiva il raggruppamento,
// scegliere un'altra ci passa. Le viste ancora booleane (solo classe) non
// hanno un dropdown, quindi non passano mai di qui.
document.querySelectorAll('.tb-dropdown-item[data-rg-option]').forEach(item => item.addEventListener('click', e => {
  e.stopPropagation();
  const dd = item.closest('.tb-dropdown');
  const key = dd.querySelector('.btn-raggruppa').dataset.rg;
  const option = item.dataset.rgOption;
  state.raggruppa[key] = state.raggruppa[key] === option ? null : option;
  dd.querySelector('.tb-dropdown-menu').classList.add('hidden');
  renderView();
}));
document.addEventListener('click', () => {
  document.querySelectorAll('.tb-dropdown-menu').forEach(m => m.classList.add('hidden'));
});
// Trigger generico per un .tb-dropdown senza stato da sincronizzare (es. il
// menu Azioni nell'header): apre/chiude soltanto, .btn-raggruppa ha invece
// anche la logica di toggle del raggruppamento
document.querySelectorAll('.tb-dropdown-trigger').forEach(btn => btn.addEventListener('click', e => {
  e.stopPropagation();
  const menu = btn.closest('.tb-dropdown').querySelector('.tb-dropdown-menu');
  const willOpen = menu.classList.contains('hidden');
  document.querySelectorAll('.tb-dropdown-menu').forEach(m => m.classList.add('hidden'));
  if (willOpen) menu.classList.remove('hidden');
}));
// Voci di un dropdown "semplice" (senza logica di toggle propria, es. il
// menu Azioni): un click le esegue già (listener proprio altrove) e in più
// richiude il menu, senza dover ripetere questa riga in ogni handler
document.querySelectorAll('.tb-dropdown-item:not([data-rg-option])').forEach(item => item.addEventListener('click', () => {
  item.closest('.tb-dropdown-menu')?.classList.add('hidden');
}));
function syncRaggruppaBtn(key) {
  const btn = document.querySelector(`.btn-raggruppa[data-rg="${key}"]`);
  if (!btn) return;
  const cur = state.raggruppa[key];
  btn.classList.toggle('active', !!cur);
  const dd = btn.closest('.tb-dropdown');
  if (dd) {
    dd.querySelectorAll('.tb-dropdown-item[data-rg-option]').forEach(item => item.classList.toggle('active', cur === item.dataset.rgOption));
  } else {
    btn.title = cur ? 'Non raggruppare' : 'Raggruppa per classe';
  }
}

document.getElementById('search-input').addEventListener('input', e => {
  state.search = e.target.value.toLowerCase().trim();
  renderView();
});

// ── Render orchestrazione ───────────────────────────────────────────
function renderAll() {
  document.getElementById('stu-count').textContent = `${state.students.length} alunni`;
  buildFilterBar();
  renderView();
}

function renderView() {
  ALL_VIEWS.forEach(v =>
    document.getElementById('view-' + v).classList.toggle('hidden', v !== state.view));
  document.querySelectorAll('[data-view]').forEach(b =>
    b.classList.toggle('active', b.dataset.view === state.view));
  // Scheda alunno/classe e Report hanno i propri filtri dedicati: la ricerca
  // testuale lì non filtrerebbe nulla di visibile
  document.getElementById('search-wrap').classList.toggle('hidden',
    state.view === 'dashboard' || state.view === 'report' || state.view === 'alunno-detail' || state.view === 'classe-detail'
    || state.view === 'orario' || state.view === 'lezioni' || state.view === 'compiti' || state.view === 'verifiche' || state.view === 'rubriche'
    || state.view === 'bes' || state.view === 'colloqui' || state.view === 'appuntamenti' || state.view === 'calendario' || state.view === 'todo'
    || state.view === 'item-note' || state.view === 'report-ore' || state.view === 'report-os');
  document.getElementById('dash-toolbar').classList.toggle('hidden', state.view !== 'dashboard');
  document.getElementById('filter-materia').classList.toggle('hidden', state.view !== 'report' && state.view !== 'report-os');
  document.getElementById('filter-alunno-report').classList.toggle('hidden', state.view !== 'report');
  // Periodo Da/A: filtro condiviso da Voti, Lezioni, Compiti, Report e Report ore
  const periodoViews = ['voti', 'lezioni', 'compiti', 'report', 'report-ore'];
  document.getElementById('filter-da').classList.toggle('hidden', !periodoViews.includes(state.view));
  document.getElementById('filter-a').classList.toggle('hidden', !periodoViews.includes(state.view));
  document.getElementById('filter-da').value = state.filtroDa;
  document.getElementById('filter-a').value = state.filtroA;
  document.getElementById('filter-alunno-scheda').classList.toggle('hidden', state.view !== 'alunno-detail');
  document.getElementById('page-title').textContent = VIEW_TITLES[state.view];
  const renderers = {
    dashboard: renderDashboard, alunni: renderAlunni, classi: renderClassi, voti: renderVoti, report: renderReport,
    lezioni: renderLezioni, compiti: renderCompiti, orario: renderOrario, verifiche: renderVerifiche, rubriche: renderRubriche,
    bonusmalus: renderBonusMalus,
    bes: renderBes, colloqui: renderColloqui, appuntamenti: renderAppuntamenti, calendario: renderCalendario, todo: renderTodo,
    'alunno-detail': renderAlunnoDetailPage, 'classe-detail': renderClasseDetailPage, 'item-note': renderItemNote, 'report-ore': renderReportOre,
    'report-os': renderReportOS,
  };
  try {
    renderers[state.view]();
  } catch (err) {
    // Una vista che si rompe non deve restare silenziosamente vuota:
    // meglio un errore visibile che "non vedo nulla" senza indizi.
    console.error(`Errore nel render di "${state.view}":`, err);
    const sec = document.getElementById('view-' + state.view);
    sec.innerHTML = `<div class="empty-state"><h3>Errore nel caricamento</h3><p>${escHtml(err.message)}</p></div>`;
  }
}

// ── Dashboard ───────────────────────────────────────────────────────
// Riga compatta di una lezione/compito nei pannelli "oggi" della Dashboard.
// Sempre l'anno scolastico reale corrente (non il filtro Anno, che serve per
// navigare lo storico): "oggi" ha senso solo nell'anno in corso.
// Riga di lezione/compito in dashboard: ora - classe (chip colorata) -
// titolo sulla prima riga, con la chip materia spinta in fondo a destra;
// il testo (tipicamente il compito) sotto, solo se presente.
function dashItemRow(l, titolo, testo, oraLabel) {
  return `
    <div class="dash-item" data-id="${l.id}">
      <div class="dash-item-top">
        ${oraLabel ? `<span class="dash-item-ora">${escHtml(oraLabel)}</span>` : ''}
        ${l.classe ? `<span class="classe-chip" style="--cls-color:${colorOfClasse(l.classe)}">${escHtml(l.classe)}</span>` : ''}
        <span class="dash-item-titolo">${escHtml(titolo || '—')}</span>
        ${l.materia ? `<span class="mat-chip" style="--mat-color:${colorOfMateria(l.materia)}">${escHtml(l.materia)}</span>` : ''}
      </div>
      ${testo ? `<div class="dash-item-text">${escHtml(testo)}</div>` : ''}
    </div>`;
}
// oraLabelFn facoltativa: di default mostra il periodo ("Nª ora"), ma il
// pannello "Compiti in scadenza oggi" la sovrascrive con la data originale
// della lezione (può essere di giorni fa, non ha senso mostrarne il periodo)
function fillDashOggi(elId, items, anno, titoloFn, testoFn, emptyText, oraLabelFn) {
  const el = document.getElementById(elId);
  if (!items.length) { el.innerHTML = `<p class="stat-sub" style="padding:4px 0 8px">${emptyText}</p>`; return; }
  el.innerHTML = items.map(l => dashItemRow(l, titoloFn(l), testoFn(l), oraLabelFn ? oraLabelFn(l) : (l.ora ? `${l.ora}ª` : ''))).join('');
  el.querySelectorAll('.dash-item').forEach(div => div.addEventListener('click', () => openLezione(anno, div.dataset.id)));
}
// Avviso proattivo: lezioni segnate come Verifica/Interrogazione da oggi in
// avanti (non solo "oggi" come gli altri pannelli, altrimenti sarebbe utile
// solo il giorno stesso, quando è ormai tardi per prepararsi)
function fillDashVerificheArrivo(elId, items, anno, emptyText) {
  const el = document.getElementById(elId);
  if (!items.length) { el.innerHTML = `<p class="stat-sub" style="padding:4px 0 8px">${emptyText}</p>`; return; }
  const oggi = todayISO();
  el.innerHTML = items.map(l => dashItemRow(l,
    `${l.tipo === 'verifica' ? 'Verifica' : 'Interrogazione'}${l.argomento ? ' · ' + l.argomento : ''}`,
    '',
    l.data === oggi ? 'Oggi' : fmtData(l.data))).join('');
  el.querySelectorAll('.dash-item').forEach(div => div.addEventListener('click', () => openLezione(anno, div.dataset.id)));
}
function renderDashboardOggi() {
  const oggi = todayISO();
  const anno = DB.currentAnno();
  const lez = DB.getLezioni(anno);

  // Lezioni di oggi e "Compiti assegnati oggi" sono la stessa cosa (il
  // compito è un campo della lezione, non un'entità a parte): un unico
  // pannello, il compito compare nella riga sotto quando presente.
  const lezOggi = lez.filter(l => l.data === oggi).sort((a, b) => (+a.ora || 0) - (+b.ora || 0));
  // "Scadenza oggi" può riguardare una lezione di un altro giorno: resta un
  // pannello a sé, mostrando la data originale della lezione al posto del
  // periodo (vedi oraLabelFn in fillDashOggi)
  const scadenzaOggi = lez.filter(l => l.compiti && l.scadenza === oggi);
  const verificheArrivo = lez.filter(l => l.tipo && l.data >= oggi)
    .sort((a, b) => a.data === b.data ? (+a.ora || 0) - (+b.ora || 0) : a.data.localeCompare(b.data))
    .slice(0, 20);

  fillDashOggi('dash-lezioni-oggi', lezOggi, anno, l => l.argomento || 'Lezione', l => l.compiti, 'Nessuna lezione registrata per oggi.');
  fillDashOggi('dash-compiti-scadenza-oggi', scadenzaOggi, anno, l => l.argomento || 'Lezione', l => l.compiti, 'Nessun compito in scadenza oggi.', l => fmtData(l.data));
  fillDashVerificheArrivo('dash-verifiche-arrivo', verificheArrivo, anno, 'Nessuna verifica o interrogazione in programma.');
  renderDashboardTodo();
  renderDashboardApptColloqui();
}
// Panel To-do in dashboard: i to-do aperti (non "fatto"), prima le scadenze
// più vicine — clic apre direttamente la modifica dalla sezione To-do
function renderDashboardTodo() {
  const aperti = DB.getTodos().filter(t => t.stato !== 'fatto')
    .sort((a, b) => (a.scadenza || '9999-99-99').localeCompare(b.scadenza || '9999-99-99'))
    .slice(0, 20);
  const el = document.getElementById('dash-todo');
  if (!aperti.length) { el.innerHTML = `<p class="stat-sub" style="padding:4px 0 8px">Nessun to-do aperto.</p>`; return; }
  el.innerHTML = aperti.map(t => `
    <div class="dash-item" data-id="${t.id}">
      <div class="dash-item-top">
        <span class="todo-pill" style="--todo-color:${todoStatoColor(t.stato)}">${escHtml(todoStatoLabel(t.stato))}</span>
        ${t.scadenza ? `<span class="stat-sub ${todoScadCls(t)}">${fmtData(t.scadenza)}</span>` : ''}
      </div>
      <div class="dash-item-text">${escHtml(t.titolo)}</div>
    </div>`).join('');
  el.querySelectorAll('.dash-item').forEach(div => div.addEventListener('click', () => {
    setView('todo');
    openTodoModal(DB.getTodos().find(t => t.id === div.dataset.id));
  }));
}
// Panel "Prossimi appuntamenti e colloqui" in dashboard: entrambi i tipi
// entro 14 giorni da oggi (inclusi), ordinati per data/ora — clic apre la
// pagina Nota dell'appuntamento/colloquio corrispondente. Usa sempre l'anno
// reale corrente (come renderDashboardOggi), non il filtro Anno in alto:
// "prossimi" ha senso solo guardando avanti da oggi.
function renderDashboardApptColloqui() {
  const oggi = todayISO();
  const limite = toISO(addDays(new Date(oggi + 'T00:00:00'), 14));
  const anni = new Set([annoFromData(oggi), annoFromData(limite)].filter(Boolean));
  const items = [];
  anni.forEach(anno => {
    DB.getAppuntamenti(anno).forEach(a => {
      if (!(a.data >= oggi && a.data <= limite)) return;
      items.push({
        kind: 'appuntamento', anno, id: a.id, data: a.data, ora: a.ora, oraFine: a.oraFine,
        titolo: a.oggetto || TIPI_APPUNTAMENTO[a.tipo] || a.tipo, tipoLabel: TIPI_APPUNTAMENTO[a.tipo] || a.tipo,
      });
    });
    DB.getColloqui(anno).forEach(c => {
      if (!(c.data >= oggi && c.data <= limite)) return;
      const s = state.students.find(x => x.id === c.studenteId);
      items.push({
        kind: 'colloquio', anno, id: c.id, data: c.data, ora: c.ora, oraFine: '',
        titolo: s ? `${s.cognome} ${s.nome}` : (c.partecipanti || 'Colloquio'), tipoLabel: 'Colloquio',
      });
    });
  });
  items.sort((a, b) => (a.data + (a.ora || '')).localeCompare(b.data + (b.ora || '')));
  const el = document.getElementById('dash-appt-colloqui');
  if (!items.length) { el.innerHTML = `<p class="stat-sub" style="padding:4px 0 8px">Nessun appuntamento o colloquio nei prossimi 14 giorni.</p>`; return; }
  // A sinistra data - ora inizio - ora fine - titolo, a destra la chip tipo
  // (stessa struttura .dash-item-top di Lezioni/Compiti, riusata qui)
  el.innerHTML = items.map(it => {
    const oraLabel = [it.ora, it.oraFine].filter(Boolean).join('–');
    const whenLabel = [it.data === oggi ? 'Oggi' : fmtData(it.data), oraLabel].filter(Boolean).join(' · ');
    return `
    <div class="dash-item" data-kind="${it.kind}" data-anno="${escHtml(it.anno)}" data-id="${it.id}">
      <div class="dash-item-top">
        <span class="dash-item-ora">${escHtml(whenLabel)}</span>
        <span class="dash-item-titolo">${escHtml(it.titolo)}</span>
        <span class="mat-chip" style="--mat-color:${it.kind === 'colloquio' ? 'var(--accent-blue)' : 'var(--accent-amber)'}">${escHtml(it.tipoLabel)}</span>
      </div>
    </div>`;
  }).join('');
  el.querySelectorAll('.dash-item').forEach(div => div.addEventListener('click', () =>
    openItemNote(div.dataset.kind, div.dataset.anno, div.dataset.id)));
}

function renderDashboard() {
  dashInitGrid();
  const list = filtered();
  const allGrades = list.flatMap(s => gradesOf(s, state.year).map(g => g.voto));
  const media = avg(allGrades);
  const suff = allGrades.filter(v => v >= 6).length;
  const pctSuff = allGrades.length ? Math.round(suff / allGrades.length * 100) : 0;

  const stats = [
    { label: 'Alunni', value: list.length, sub: state.klass === 'all' ? 'tutte le classi' : `classe ${state.klass}`, accent: 'var(--accent-blue)' },
    { label: 'Media generale', value: fmt(media), sub: `${allGrades.length} voti`, accent: 'var(--accent-green)' },
    { label: 'Sufficienze', value: `${pctSuff}%`, sub: `${suff}/${allGrades.length} voti ≥ 6`, accent: 'var(--accent-amber)' },
    { label: 'Anni tracciati', value: allYears(list).length, sub: state.year === 'all' ? 'storico completo' : state.year, accent: 'var(--accent-red)' },
  ];
  document.getElementById('stat-grid').innerHTML = stats.map(s => `
    <div class="stat-card" style="--stat-accent:${s.accent}">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-sub">${escHtml(s.sub)}</div>
    </div>`).join('');

  renderDashboardOggi();

  const tc = themeColors();
  const base = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: tc.text }, grid: { color: tc.grid } },
      x: { ticks: { color: tc.text }, grid: { color: tc.grid } },
    },
  };

  // 1) Media per anno scolastico (linea)
  const years = allYears(list);
  const mediaByYear = years.map(y => {
    const g = list.flatMap(s => (s.anni[y] ? gradesOf(s, y).map(x => x.voto) : []));
    return avg(g);
  });
  drawChart('chart-years', {
    type: 'line',
    data: { labels: years, datasets: [{
      data: mediaByYear, borderColor: tc.blue, backgroundColor: 'rgba(91,155,255,0.12)',
      fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: tc.blue, borderWidth: 2,
    }] },
    options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, suggestedMin: 4, suggestedMax: 10 } } },
  });

  // 2) Media per materia (ultimo anno selezionato o ultimo disponibile)
  const refYear = state.year !== 'all' ? state.year : years[years.length - 1];
  const subjMap = {};
  list.forEach(s => {
    const y = s.anni?.[refYear];
    if (!y) return;
    for (const [materia, arr] of Object.entries(y.materie || {})) {
      (subjMap[materia] ||= []).push(...arr.map(g => g.voto));
    }
  });
  const subjLabels = Object.keys(subjMap).sort();
  const subjAvgs = subjLabels.map(m => avg(subjMap[m]));
  drawChart('chart-subjects', {
    type: 'bar',
    data: { labels: subjLabels, datasets: [{
      data: subjAvgs,
      backgroundColor: subjAvgs.map(v => v >= 6 ? tc.green : v >= 5 ? tc.amber : tc.red),
      borderRadius: 6,
    }] },
    options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, suggestedMin: 0, suggestedMax: 10 } } },
  });

  // 3) Distribuzione voti (istogramma 1..10)
  const buckets = Array(11).fill(0); // indici 0..10, uso 1..10
  allGrades.forEach(v => { buckets[Math.round(v)]++; });
  drawChart('chart-dist', {
    type: 'bar',
    data: { labels: [...Array(10)].map((_, i) => i + 1), datasets: [{
      data: buckets.slice(1, 11),
      backgroundColor: [...Array(10)].map((_, i) => (i + 1) >= 6 ? tc.green : (i + 1) >= 5 ? tc.amber : tc.red),
      borderRadius: 5,
    }] },
    options: base,
  });
}

function drawChart(id, config) {
  const ctx = document.getElementById(id);
  if (!ctx) return;
  if (charts[id]) charts[id].destroy();
  charts[id] = new Chart(ctx, config);
}

// ── Dashboard: griglia widget trascinabile/ridimensionabile ──────────
// Layout persistito in localStorage (preferenza di interfaccia locale,
// come il tema — non è un dato scolastico da sincronizzare via Firestore).
// Ogni widget ha una posizione (x,y = colonna/riga di partenza, 1-based)
// e una dimensione (w,h in celle) sulla griglia a DASH_COLS colonne.
// Finché l'utente non interviene, i widget restano in auto-placement
// (solo "span" impostato via data-w/data-h); entrando in modalità
// modifica la disposizione corrente viene "fissata" leggendo le posizioni
// che il browser ha già risolto, così drag/resize partono da uno stato
// esplicito e prevedibile invece che da un mix auto/manuale.
const DASH_COLS = 4;
const DASH_ROW_H = 90;
const DASH_GAP = 14;
const DASH_LAYOUT_KEY = 'sm-dashboard-layout';

let dashLayout = null;   // { [widgetId]: {x,y,w,h} }
let dashDrag = null;     // interazione drag/resize in corso, null a riposo

function dashClamp(v, min, max) { return Math.min(Math.max(v, min), max); }

function dashLoadLayout() {
  try { return JSON.parse(localStorage.getItem(DASH_LAYOUT_KEY)) || {}; }
  catch { return {}; }
}
function dashSaveLayout() { localStorage.setItem(DASH_LAYOUT_KEY, JSON.stringify(dashLayout || {})); }

function dashWidgets() { return [...document.querySelectorAll('#dashboard-grid .dash-widget')]; }
function dashWidgetEl(id) { return document.querySelector(`#dashboard-grid .dash-widget[data-widget-id="${id}"]`); }

function dashApplyWidgetStyle(el, pos) {
  el.style.gridColumn = `${pos.x} / span ${pos.w}`;
  el.style.gridRow = `${pos.y} / span ${pos.h}`;
}

function dashRectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
function dashOverlapsFor(id, rect) {
  return Object.keys(dashLayout).filter(otherId => otherId !== id && dashRectsOverlap(rect, dashLayout[otherId]));
}

// Replica l'algoritmo di auto-placement di CSS Grid (sparse, riga per
// riga) per calcolare dove finirebbe ciascun widget senza posizione
// salvata: getComputedStyle non restituisce la riga/colonna risolta per
// gli elementi in auto-placement (resta "auto"), quindi va ricostruita.
function dashComputeDefaultLayout() {
  const occupied = new Set();
  const isFree = (x, y, w, h) => {
    for (let cy = y; cy < y + h; cy++)
      for (let cx = x; cx < x + w; cx++) {
        if (cx > DASH_COLS || occupied.has(cx + ',' + cy)) return false;
      }
    return true;
  };
  const occupy = (x, y, w, h) => {
    for (let cy = y; cy < y + h; cy++)
      for (let cx = x; cx < x + w; cx++) occupied.add(cx + ',' + cy);
  };
  const layout = {};
  dashWidgets().forEach(el => {
    const w = parseInt(el.dataset.w, 10), h = parseInt(el.dataset.h, 10);
    outer:
    for (let y = 1; y < 500; y++) {
      for (let x = 1; x <= DASH_COLS - w + 1; x++) {
        if (isFree(x, y, w, h)) { layout[el.dataset.widgetId] = { x, y, w, h }; occupy(x, y, w, h); break outer; }
      }
    }
  });
  return layout;
}

// Combina la disposizione salvata (se presente) con quella predefinita
// calcolata sopra, e la fissa come stile inline esplicito sui widget.
function dashFreezeLayout() {
  const saved = dashLoadLayout();
  const defaults = dashComputeDefaultLayout();
  dashLayout = {};
  dashWidgets().forEach(el => {
    const id = el.dataset.widgetId;
    dashLayout[id] = saved[id] || defaults[id];
    dashApplyWidgetStyle(el, dashLayout[id]);
  });
}

function setDashEditMode(on) {
  const grid = document.getElementById('dashboard-grid');
  grid.classList.toggle('dash-edit-mode', on);
  const btn = document.getElementById('btn-dash-edit');
  btn.classList.toggle('active', on);
  btn.title = on ? 'Fine personalizzazione' : 'Personalizza dashboard: sposta e ridimensiona i pannelli';
  document.getElementById('btn-dash-reset').classList.toggle('hidden', !on);
  if (on) dashFreezeLayout();
}

function dashResetLayout() {
  if (!confirm('Ripristinare la disposizione predefinita dei pannelli della dashboard?')) return;
  localStorage.removeItem(DASH_LAYOUT_KEY);
  dashLayout = dashComputeDefaultLayout();
  dashWidgets().forEach(el => dashApplyWidgetStyle(el, dashLayout[el.dataset.widgetId]));
}

function dashHighlightDropTarget(rect, id) {
  const overlapIds = dashOverlapsFor(id, rect);
  dashWidgets().forEach(w => w.classList.toggle(
    'dash-drop-target', overlapIds.length === 1 && w.dataset.widgetId === overlapIds[0]));
}

function dashBeginInteraction(e, type, el) {
  const grid = document.getElementById('dashboard-grid');
  if (!grid.classList.contains('dash-edit-mode')) return;
  e.preventDefault();
  e.stopPropagation();
  const handle = e.currentTarget;
  handle.setPointerCapture(e.pointerId);

  const gridRect = grid.getBoundingClientRect();
  const colW = (gridRect.width - DASH_GAP * (DASH_COLS - 1)) / DASH_COLS;
  const id = el.dataset.widgetId;
  const pos = dashLayout[id];
  const elRect = el.getBoundingClientRect();

  dashDrag = {
    type, id, el, handle, gridRect,
    colPitch: colW + DASH_GAP, rowPitch: DASH_ROW_H + DASH_GAP,
    origX: pos.x, origY: pos.y, origW: pos.w, origH: pos.h,
    grabDX: e.clientX - elRect.left, grabDY: e.clientY - elRect.top,
    startClientX: e.clientX, startClientY: e.clientY,
    curX: pos.x, curY: pos.y, curW: pos.w, curH: pos.h,
  };
  el.classList.add(type === 'move' ? 'dash-dragging' : 'dash-resizing');

  const onMove = ev => dashOnPointerMove(ev);
  const onUp = ev => {
    dashOnPointerUp(ev);
    handle.removeEventListener('pointermove', onMove);
    handle.removeEventListener('pointerup', onUp);
    handle.removeEventListener('pointercancel', onUp);
  };
  handle.addEventListener('pointermove', onMove);
  handle.addEventListener('pointerup', onUp);
  handle.addEventListener('pointercancel', onUp);
}

function dashOnPointerMove(e) {
  if (!dashDrag) return;
  const d = dashDrag;
  const el = d.el;
  if (d.type === 'move') {
    const leftPx = e.clientX - d.grabDX - d.gridRect.left;
    const topPx = e.clientY - d.grabDY - d.gridRect.top;
    const colIdx = dashClamp(Math.round(leftPx / d.colPitch), 0, DASH_COLS - d.origW);
    const rowIdx = Math.max(0, Math.round(topPx / d.rowPitch));
    d.curX = colIdx + 1; d.curY = rowIdx + 1;
    const dxCells = d.curX - d.origX, dyCells = d.curY - d.origY;
    el.style.transform = `translate(${dxCells * d.colPitch}px, ${dyCells * d.rowPitch}px)`;
    dashHighlightDropTarget({ x: d.curX, y: d.curY, w: d.origW, h: d.origH }, d.id);
  } else {
    const dCols = Math.round((e.clientX - d.startClientX) / d.colPitch);
    const dRows = Math.round((e.clientY - d.startClientY) / d.rowPitch);
    let newW = dashClamp(d.origW + dCols, 1, DASH_COLS - d.origX + 1);
    let newH = dashClamp(d.origH + dRows, 1, 12);
    // Se il rettangolo cresciuto sconfina su un altro widget, restringe la
    // dimensione che si è allargata di più (quella "responsabile" della
    // sovrapposizione), non sempre la larghezza: altrimenti un ingombro
    // dovuto solo all'altezza farebbe collassare anche la larghezza.
    while ((newW > 1 || newH > 1) &&
           dashOverlapsFor(d.id, { x: d.origX, y: d.origY, w: newW, h: newH }).length) {
      if (newH - d.origH >= newW - d.origW && newH > 1) newH--;
      else if (newW > 1) newW--;
      else newH--;
    }
    d.curW = newW; d.curH = newH;
    dashLayout[d.id] = { x: d.origX, y: d.origY, w: newW, h: newH };
    dashApplyWidgetStyle(el, dashLayout[d.id]);
  }
}

function dashOnPointerUp() {
  if (!dashDrag) return;
  const d = dashDrag;
  const el = d.el;
  el.classList.remove('dash-dragging', 'dash-resizing');
  el.style.transform = '';
  dashWidgets().forEach(w => w.classList.remove('dash-drop-target'));

  if (d.type === 'move') {
    const rect = { x: d.curX, y: d.curY, w: d.origW, h: d.origH };
    const overlapIds = dashOverlapsFor(d.id, rect);
    if (overlapIds.length === 1) {
      const otherId = overlapIds[0];
      const otherPos = dashLayout[otherId];
      const myPos = dashLayout[d.id];
      dashLayout[otherId] = { ...otherPos, x: myPos.x, y: myPos.y };
      dashLayout[d.id] = { ...myPos, x: rect.x, y: rect.y };
      dashApplyWidgetStyle(dashWidgetEl(otherId), dashLayout[otherId]);
      dashApplyWidgetStyle(el, dashLayout[d.id]);
    } else if (overlapIds.length === 0) {
      dashLayout[d.id] = { ...dashLayout[d.id], x: rect.x, y: rect.y };
      dashApplyWidgetStyle(el, dashLayout[d.id]);
    } else {
      dashApplyWidgetStyle(el, dashLayout[d.id]); // troppe sovrapposizioni: annulla, torna alla posizione di partenza
    }
  }
  dashSaveLayout();
  dashDrag = null;
}

function dashInitGrid() {
  const grid = document.getElementById('dashboard-grid');
  if (!grid || grid.dataset.dashInit) return;
  grid.dataset.dashInit = '1';
  grid.querySelectorAll('.dash-widget-handle').forEach(handle => {
    handle.addEventListener('pointerdown', e => dashBeginInteraction(e, 'move', handle.closest('.dash-widget')));
  });
  grid.querySelectorAll('.dash-widget-resize').forEach(handle => {
    handle.addEventListener('pointerdown', e => dashBeginInteraction(e, 'resize', handle.closest('.dash-widget')));
  });
  document.getElementById('btn-dash-edit').addEventListener('click', () => setDashEditMode(!grid.classList.contains('dash-edit-mode')));
  document.getElementById('btn-dash-reset').addEventListener('click', dashResetLayout);

  // Applica subito la dimensione (span) di ciascun widget da data-w/data-h:
  // senza uno "span" esplicito ogni widget occuperebbe una sola cella
  // (comportamento di default della griglia). I widget con una posizione
  // salvata (localStorage) la ottengono per intero, fissa; gli altri restano
  // in auto-placement del browser, solo con la dimensione fissata — così la
  // disposizione personalizzata resta visibile anche dopo un ricaricamento.
  const saved = dashLoadLayout();
  grid.querySelectorAll('.dash-widget').forEach(el => {
    const pos = saved[el.dataset.widgetId];
    if (pos) dashApplyWidgetStyle(el, pos);
    else {
      el.style.gridColumn = `span ${el.dataset.w}`;
      el.style.gridRow = `span ${el.dataset.h}`;
    }
  });
}

// ── Vista Alunni ────────────────────────────────────────────────────
function renderAlunni() {
  const wrap = document.getElementById('stu-wrap');
  const empty = document.getElementById('empty-state');
  const panel = wrap.closest('.table-panel');
  const groupsWrap = document.getElementById('stu-groups');

  let records = filtered().map(s => ({
    s,
    nome: `${s.cognome} ${s.nome}`,
    classe: classeOf(s, state.year) || '',
    media: studentAvg(s, state.year),
    nVoti: gradesOf(s, state.year).length,
    nAnni: Object.keys(s.anni || {}).length,
  }));
  records = sortRows('alunni', records, {
    nome: r => r.nome, classe: r => r.classe, media: r => r.media, voti: r => r.nVoti, anni: r => r.nAnni,
  });

  document.getElementById('alunni-count').textContent = `${records.length} alunn${records.length === 1 ? 'o' : 'i'}`;

  const visibleIds = new Set(records.map(r => r.s.id));
  [...state.alunniSelected].forEach(id => { if (!visibleIds.has(id)) state.alunniSelected.delete(id); });
  updateAlunniBulkBar();
  const allSel = records.length > 0 && records.every(r => state.alunniSelected.has(r.s.id));
  const selAllBtn = document.getElementById('btn-alunni-select-all');
  selAllBtn.classList.toggle('active', allSel);
  selAllBtn.title = allSel ? 'Deseleziona tutto' : 'Seleziona tutto';

  if (!records.length) { wrap.innerHTML = ''; panel.classList.add('hidden'); groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  syncRaggruppaBtn('alunni');

  const alunnoRowHtml = r => {
    const badge = profiloBadge(r.s);
    return `
        <tr class="al-row ${state.alunniSelected.has(r.s.id) ? 'selected' : ''}" data-id="${r.s.id}">
          <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
          <td>
            <div class="al-name-cell">
              <div class="al-avatar" style="--card-accent:${colorOf(r.s)}">${escHtml(initials(r.s))}</div>
              <div class="al-name">${escHtml(r.s.cognome)} ${escHtml(r.s.nome)}</div>
            </div>
          </td>
          <td class="col-hide-m">${escHtml(r.classe || '—')}</td>
          <td class="col-hide-m">${badge ? `<span class="profilo-badge pb-${r.s.profilo.toLowerCase()}">${escHtml(badge)}</span>` : '<span class="stat-sub">—</span>'}</td>
          <td class="vt-mono vt-voto ${gradeClass(r.media)}">${fmt(r.media)}</td>
          <td class="col-hide-m">${r.nVoti}</td>
          <td class="col-hide-m">${r.nAnni}</td>
        </tr>`;
  };
  const alunniThead = `
      <th></th>
      <th class="sortable" data-sort="nome">Alunno${sortIcon('alunni', 'nome')}</th>
      <th class="col-hide-m sortable" data-sort="classe">Classe${sortIcon('alunni', 'classe')}</th>
      <th class="col-hide-m">Profilo</th>
      <th class="sortable" data-sort="media">Media${sortIcon('alunni', 'media')}</th>
      <th class="col-hide-m sortable" data-sort="voti">Voti${sortIcon('alunni', 'voti')}</th>
      <th class="col-hide-m sortable" data-sort="anni">Anni${sortIcon('alunni', 'anni')}</th>`;
  // Raggruppato: panel/table-wrap generati in un contenitore fratello a
  // parte, non dentro quello statico reso trasparente — quello statico
  // resta con le sue regole normali, semplicemente nascosto (nessun "quasi
  // vuoto" che dà l'impressione che la tabella si sia rimpicciolita)
  let activeContainer;
  if (state.raggruppa.alunni) {
    panel.classList.add('hidden');
    groupsWrap.classList.remove('hidden');
    groupsWrap.innerHTML = groupedTablePanels(records, r => r.classe, alunniThead, alunnoRowHtml);
    activeContainer = groupsWrap;
  } else {
    panel.classList.remove('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    wrap.innerHTML = `<table class="voti-table"><thead><tr>${alunniThead}</tr></thead><tbody>${records.map(alunnoRowHtml).join('')}</tbody></table>`;
    activeContainer = wrap;
  }

  // Click sul nome → apre la scheda; click altrove nella riga → seleziona
  // (in mobile, dove le colonne extra sono nascoste, espande la riga invece)
  activeContainer.querySelectorAll('.al-row').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('.al-name-cell')) { openStudent(row.dataset.id); return; }
    if (isMobileWidth()) { toggleRowExpand(row); return; }
    const id = row.dataset.id;
    if (state.alunniSelected.has(id)) state.alunniSelected.delete(id);
    else state.alunniSelected.add(id);
    row.classList.toggle('selected');
    updateAlunniBulkBar();
    const stillAll = records.length > 0 && records.every(r => state.alunniSelected.has(r.s.id));
    const selAllBtn = document.getElementById('btn-alunni-select-all');
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
  wireSort(activeContainer, 'alunni', renderAlunni);
}
function updateAlunniBulkBar() {
  const bar = document.getElementById('alunni-bulk-bar');
  const n = state.alunniSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('alunni-sel-count').textContent = `${n} alunn${n === 1 ? 'o' : 'i'} selezionat${n === 1 ? 'o' : 'i'}`;
}
document.getElementById('btn-alunni-select-all').addEventListener('click', () => {
  const ids = filtered().map(s => s.id);
  const allSel = ids.length > 0 && ids.every(id => state.alunniSelected.has(id));
  if (allSel) ids.forEach(id => state.alunniSelected.delete(id));
  else ids.forEach(id => state.alunniSelected.add(id));
  renderAlunni();
});
document.getElementById('btn-alunni-elimina-bulk').addEventListener('click', async () => {
  const ids = [...state.alunniSelected];
  if (!ids.length) return;
  const nomi = ids.map(id => state.students.find(s => s.id === id)).filter(Boolean)
    .map(s => `${s.cognome} ${s.nome}`).join(', ');
  if (!confirm(`Eliminare ${ids.length} alunn${ids.length === 1 ? 'o' : 'i'} (${nomi}) e tutti i loro voti? L'azione è irreversibile.`)) return;
  try {
    for (const id of ids) await DB.remove(id);
    state.students = state.students.filter(s => !ids.includes(s.id));
    state.alunniSelected.clear();
    renderAll();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Vista Classi ────────────────────────────────────────────────────
// Ogni riga è una coppia (anno, classe): la stessa etichetta ("3A") indica
// coorti diverse in anni diversi, quindi NON va mai sommata fra annate
// (altrimenti il conteggio alunni di una classe risulterebbe raddoppiato
// sommando due generazioni). Con un anno specifico selezionato si riduce
// naturalmente a una sola riga per classe, come ci si aspetta.
function renderClassi() {
  const wrap = document.getElementById('classi-wrap');
  const empty = document.getElementById('classi-empty');
  const panel = wrap.closest('.table-panel');

  const seen = new Set();
  const pairs = [];
  state.students.forEach(s => Object.entries(s.anni || {}).forEach(([anno, v]) => {
    if (!v.classe) return;
    if (state.year !== 'all' && anno !== state.year) return;
    if (state.klass !== 'all' && v.classe !== state.klass) return;
    if (state.istituto !== 'all' && DB.istitutoOf(anno, v.classe) !== state.istituto) return;
    const key = anno + '|' + v.classe;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push({ anno, classe: v.classe });
  }));
  pairs.sort((a, b) => (a.anno === b.anno ? a.classe.localeCompare(b.classe) : b.anno.localeCompare(a.anno)));

  let filteredPairs = pairs;
  if (state.search) filteredPairs = filteredPairs.filter(p => p.classe.toLowerCase().includes(state.search));

  let records = filteredPairs.map(({ anno, classe }) => {
    const key = anno + '|' + classe;
    const stu = state.students.filter(s => s.anni?.[anno]?.classe === classe);
    const grades = stu.flatMap(s => Object.values(s.anni[anno].materie || {}).flat().map(g => g.voto));
    return {
      anno, classe, key, stu, grades, media: avg(grades),
      nd: stu.filter(s => (s.profilo || 'ND') === 'ND').length,
      pdp: stu.filter(s => s.profilo === 'PDP').length,
      pei: stu.filter(s => s.profilo === 'PEI').length,
      meta: DB.getClasseMeta(anno, classe),
    };
  });
  records = sortRows('classi', records, {
    anno: r => r.anno, classe: r => r.classe, alunni: r => r.stu.length,
    nd: r => r.nd, pdp: r => r.pdp, pei: r => r.pei, media: r => r.media, voti: r => r.grades.length,
  });

  // Rimuove dalla selezione le classi non più presenti nel filtro corrente
  const visibleKeys = new Set(records.map(r => r.key));
  [...state.classiSelected].forEach(k => { if (!visibleKeys.has(k)) state.classiSelected.delete(k); });
  updateClassiBulkBar();
  const allSel = records.length > 0 && records.every(r => state.classiSelected.has(r.key));
  const classiSelAllBtn = document.getElementById('btn-classi-select-all');
  classiSelAllBtn.classList.toggle('active', allSel);
  classiSelAllBtn.title = allSel ? 'Deseleziona tutto' : 'Seleziona tutto';

  if (!records.length) { wrap.innerHTML = ''; panel.classList.add('hidden'); empty.classList.remove('hidden'); return; }
  panel.classList.remove('hidden'); empty.classList.add('hidden');

  wrap.innerHTML = `
  <table class="voti-table">
    <thead><tr>
      <th class="sortable" data-sort="classe">Classe${sortIcon('classi', 'classe')}</th>
      <th class="sortable" data-sort="alunni">Alunni${sortIcon('classi', 'alunni')}</th>
      <th class="col-hide-m sortable" data-sort="nd">ND${sortIcon('classi', 'nd')}</th>
      <th class="col-hide-m sortable" data-sort="pdp">PDP${sortIcon('classi', 'pdp')}</th>
      <th class="col-hide-m sortable" data-sort="pei">PEI${sortIcon('classi', 'pei')}</th>
      <th class="sortable" data-sort="media">Media${sortIcon('classi', 'media')}</th>
      <th class="col-hide-m sortable" data-sort="voti">Voti${sortIcon('classi', 'voti')}</th>
      <th class="col-hide-m">Materie insegnate</th>
    </tr></thead>
    <tbody>
      ${records.map(r => {
        const sub = [r.meta.istituto, r.meta.indirizzo, r.anno].filter(Boolean).join(' · ');
        return `
        <tr class="al-row ${state.classiSelected.has(r.key) ? 'selected' : ''}" data-anno="${escHtml(r.anno)}" data-class="${escHtml(r.classe)}" data-key="${escHtml(r.key)}">
          <td>
            <div class="al-name-cell">
              <div>
                <div class="al-name">Classe ${escHtml(r.classe)}</div>
                <div class="cl-sub">${escHtml(sub)}</div>
              </div>
            </div>
          </td>
          <td class="vt-mono">${r.stu.length}</td>
          <td class="col-hide-m vt-mono">${r.nd}</td>
          <td class="col-hide-m vt-mono">${r.pdp}</td>
          <td class="col-hide-m vt-mono">${r.pei}</td>
          <td class="vt-mono vt-voto ${gradeClass(r.media)}">${fmt(r.media)}</td>
          <td class="col-hide-m vt-mono">${r.grades.length}</td>
          <td class="col-hide-m">${r.meta.materie.length ? r.meta.materie.map(mm => `<span class="mat-chip" style="--mat-color:${colorOfMateria(mm)}">${escHtml(mm)}</span>`).join('') : '<span class="stat-sub">—</span>'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;

  // Click sul nome → imposta i filtri su quella coppia (anno, classe) e va
  // alla Scheda classe; click altrove nella riga → seleziona per le azioni di gruppo
  wrap.querySelectorAll('.al-row').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('.al-name-cell')) {
      state.year = row.dataset.anno;
      state.istituto = 'all'; // altrimenti un istituto incoerente con la classe la farebbe sparire dal filtro
      state.klass = row.dataset.class;
      buildFilterBar();
      setView('classe-detail');
      return;
    }
    if (isMobileWidth()) { toggleRowExpand(row); return; }
    const key = row.dataset.key;
    if (state.classiSelected.has(key)) state.classiSelected.delete(key);
    else state.classiSelected.add(key);
    row.classList.toggle('selected');
    updateClassiBulkBar();
    const stillAll = records.length > 0 && records.every(r => state.classiSelected.has(r.key));
    const selAllBtn = document.getElementById('btn-classi-select-all');
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
  wireSort(wrap, 'classi', renderClassi);
}

function updateClassiBulkBar() {
  const bar = document.getElementById('classi-bulk-bar');
  const n = state.classiSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('classi-sel-count').textContent = `${n} classe${n === 1 ? '' : 'i'} selezionat${n === 1 ? 'a' : 'e'}`;
}

// Tutte le materie mai usate nel registro, più quelle già assegnate a una
// classe anche se senza voti — per proporle nel selettore "Materie insegnate"
function allMaterieNames() {
  const set = new Set();
  state.students.forEach(s => Object.values(s.anni || {}).forEach(v => Object.keys(v.materie || {}).forEach(m => set.add(m))));
  Object.values(DB.materieMapAll()).forEach(arr => arr.forEach(m => set.add(m)));
  return [...set].sort();
}
// Materie non legate a una classe specifica (es. ore di potenziamento, dove
// la classe resta vuota): proposte solo nei suggerimenti di Lezioni/Orario,
// non nel selettore "Materie insegnate" di una classe (lì non avrebbe senso)
const MATERIE_SPECIALI = ['Potenziamento'];
function materieNamesLezioni() {
  return [...new Set([...allMaterieNames(), ...MATERIE_SPECIALI])].sort();
}

// Anno scolastico successivo ("2025/26" → "2026/27")
function nextAnnoOf(anno) {
  const m = String(anno || '').match(/^(\d{4})\/(\d{2})$/);
  if (!m) return DB.currentAnno();
  const y = +m[1] + 1;
  return `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
}
// Classe successiva incrementando il numero iniziale ("3A" → "4A"); null se
// già in quinta (non promuovibile oltre: presumibilmente diplomati) o se la
// classe non inizia con un numero riconoscibile
function nextClasseOf(classe) {
  const m = String(classe || '').match(/^(\d+)(.*)$/);
  if (!m) return null;
  const num = parseInt(m[1], 10);
  if (num >= 5) return null;
  return (num + 1) + m[2];
}

// ── Dettaglio classe (grafici inline nella pagina, non modale) ───────
const MESI = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
function monthLabel(ym) {
  const [y, m] = ym.split('-');
  return `${MESI[(+m || 1) - 1]} ${y}`;
}

// Punto d'ingresso chiamato dal router: mostra la scheda della classe indicata
// dai filtri Anno/Classe. Con "Tutte le classi" mostra i dati aggregati
// (rispettando comunque Anno/Istituto se specifici); serve invece scegliere
// anche l'anno se è selezionata una classe specifica ma "Tutti gli anni",
// perché la stessa etichetta ("3A") in anni diversi è una coorte diversa.
function renderClasseDetailPage() {
  const target = classeDetailTarget();
  document.getElementById('cd-empty').classList.toggle('hidden', target.mode !== 'ambiguous');
  document.getElementById('cd-content').classList.toggle('hidden', target.mode === 'ambiguous');
  if (target.mode !== 'ambiguous') renderClasseDetail(target);
}

// Alunni (con i relativi voti) nell'ambito scelto: una singola classe, oppure
// - in modalità aggregata - tutte le classi che rispettano Anno/Istituto
// I voti sono la copia con "materia" allegata (nel documento è solo la chiave
// della mappa materie, non un campo del voto): serve per il registro voti,
// che mostra la materia di ciascuna colonna nel tooltip.
function withMateria(materie) {
  return Object.entries(materie || {}).flatMap(([materia, arr]) => arr.map(g => ({ ...g, materia })));
}
function classeDetailScope(target) {
  const rows = [];
  if (target.mode === 'single') {
    const { anno, classe } = target;
    state.students.forEach(s => {
      if (s.anni?.[anno]?.classe !== classe) return;
      rows.push({ s, grades: withMateria(s.anni[anno].materie) });
    });
  } else {
    state.students.forEach(s => {
      const pairs = Object.entries(s.anni || {}).filter(([anno, v]) => v.classe
        && (state.year === 'all' || anno === state.year)
        && (state.istituto === 'all' || DB.istitutoOf(anno, v.classe) === state.istituto));
      if (!pairs.length) return;
      rows.push({ s, grades: pairs.flatMap(([, v]) => withMateria(v.materie)) });
    });
  }
  return { rows, stu: rows.map(r => r.s), grades: rows.flatMap(r => r.grades) };
}

function renderClasseDetail(target = classeDetailTarget()) {
  if (target.mode === 'ambiguous') return;
  const isAgg = target.mode === 'aggregate';
  const { rows, stu, grades } = classeDetailScope(target);

  document.getElementById('cm-title').textContent = isAgg ? 'Tutte le classi' : `Classe ${target.classe}`;
  if (isAgg) {
    const parts = [state.istituto !== 'all' ? state.istituto : '', state.year !== 'all' ? state.year : 'tutti gli anni'];
    document.getElementById('cm-sub').textContent = parts.filter(Boolean).join(' · ');
  } else {
    const meta = DB.getClasseMeta(target.anno, target.classe);
    document.getElementById('cm-sub').textContent = [meta.istituto, meta.indirizzo, target.anno].filter(Boolean).join(' · ') || target.anno;
  }
  document.getElementById('cm-media').textContent = `media ${fmt(avg(grades.map(g => g.voto)))} · ${stu.length} alunn${stu.length === 1 ? 'o' : 'i'}`;

  // Modifica/promozione/eliminazione richiedono una classe specifica, non un aggregato
  document.getElementById('btn-classe-modifica').classList.toggle('hidden', isAgg);
  document.getElementById('btn-classe-promuovi').classList.toggle('hidden', isAgg);
  document.getElementById('btn-classe-elimina').classList.toggle('hidden', isAgg);

  renderClasseStatCards(stu, grades);
  renderClasseCharts(target, rows, grades);
  renderClasseVotiGrid(rows);
  renderClasseVerifiche(target, stu);
}

// Alunni, voti scritti/orali, insufficienti: stessa scala (rows/grades)
// già calcolata da classeDetailScope, nessuna interrogazione DB aggiuntiva.
function renderClasseStatCards(stu, grades) {
  const pdp = stu.filter(s => s.profilo === 'PDP').length;
  const pei = stu.filter(s => s.profilo === 'PEI').length;
  const scritti = grades.filter(g => g.tipo === 'scritto').length;
  const orali = grades.filter(g => g.tipo === 'orale').length;
  const insuff = grades.filter(g => g.voto < 6).length;
  const stats = [
    { label: 'Alunni', value: stu.length, sub: `${pdp} PDP · ${pei} PEI` },
    { label: 'Voti scritti', value: scritti, sub: `su ${grades.length} totali` },
    { label: 'Voti orali', value: orali, sub: `su ${grades.length} totali` },
    { label: 'Insufficienti', value: insuff, sub: `${grades.length ? Math.round(insuff / grades.length * 100) : 0}% dei voti` },
  ];
  document.getElementById('cd-stat-grid').innerHTML = stats.map(s => `
    <div class="stat-card">
      <div class="stat-label">${s.label}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-sub">${escHtml(s.sub)}</div>
    </div>`).join('');
}

// Registro voti: una riga per alunno, una colonna per ciascun voto (in ordine
// cronologico, non allineate per data fra alunni diversi), ultima colonna la
// media. Il numero di colonne segue l'alunno con più voti. Materia (esclusiva,
// una sola alla volta) e Tipologia filtrano solo questa tabella, non i grafici.
let cdGridRows = []; // cache non filtrata, per rigenerare quando cambia il filtro
function renderClasseVotiGrid(rows) {
  cdGridRows = rows;
  const wrap = document.getElementById('cd-grid-wrap');

  const materie = [...new Set(rows.flatMap(r => r.grades.map(g => g.materia)))].sort();
  if (state.registroMateria !== 'all' && !materie.includes(state.registroMateria)) state.registroMateria = 'all';
  const selM = document.getElementById('cd-grid-materia');
  selM.innerHTML = '<option value="all">Tutte le materie</option>' +
    materie.map(m => `<option value="${escHtml(m)}" ${state.registroMateria === m ? 'selected' : ''}>${escHtml(m)}</option>`).join('');
  selM.value = state.registroMateria;
  document.getElementById('cd-grid-tipo').value = state.registroTipo;

  const filtered = rows.map(r => ({
    s: r.s,
    grades: r.grades.filter(g =>
      (state.registroMateria === 'all' || g.materia === state.registroMateria) &&
      (state.registroTipo === 'all' || g.tipo === state.registroTipo)),
  }));

  const sorted = filtered
    .map(r => ({ s: r.s, grades: [...r.grades].sort((a, b) => (a.data > b.data ? 1 : -1)) }))
    .sort((a, b) => `${a.s.cognome} ${a.s.nome}`.localeCompare(`${b.s.cognome} ${b.s.nome}`));
  const maxN = sorted.reduce((m, r) => Math.max(m, r.grades.length), 0);
  if (!maxN) { wrap.innerHTML = '<p class="stat-sub" style="padding:12px">Nessun voto con questi filtri.</p>'; return; }

  wrap.innerHTML = `
  <table class="voti-table">
    <thead><tr>
      <th>Alunno</th>
      ${[...Array(maxN)].map((_, i) => `<th class="col-hide-m vt-mono">${i + 1}</th>`).join('')}
      <th>Media</th>
    </tr></thead>
    <tbody>
      ${sorted.map(r => {
        const media = avg(r.grades.map(g => g.voto));
        return `<tr>
          <td>${escHtml(r.s.cognome)} ${escHtml(r.s.nome)}</td>
          ${[...Array(maxN)].map((_, i) => {
            const g = r.grades[i];
            return `<td class="col-hide-m vt-mono vt-voto ${g ? gradeClass(g.voto) : ''}" ${g ? `title="${escHtml(fmtData(g.data))} · ${escHtml(g.materia)}"` : ''}>${g ? fmt(g.voto) : '—'}</td>`;
          }).join('')}
          <td class="vt-mono vt-voto ${gradeClass(media)}">${fmt(media)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;
  // Con tanti voti la tabella diventa larghissima: in mobile le colonne dei
  // singoli voti si nascondono (.col-hide-m) e la riga diventa espandibile
  wrap.querySelectorAll('tbody tr').forEach(row => row.addEventListener('click', () => {
    if (isMobileWidth()) toggleRowExpand(row);
  }));
}
document.getElementById('cd-grid-materia').addEventListener('change', e => {
  state.registroMateria = e.target.value;
  renderClasseVotiGrid(cdGridRows);
});
document.getElementById('cd-grid-tipo').addEventListener('change', e => {
  state.registroTipo = e.target.value;
  renderClasseVotiGrid(cdGridRows);
});

function renderClasseCharts(target = classeDetailTarget(), rows, grades) {
  if (target.mode === 'ambiguous') return;
  if (!rows || !grades) ({ rows, grades } = classeDetailScope(target));
  const tc = themeColors();
  const base = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: tc.text }, grid: { color: tc.grid } },
      x: { ticks: { color: tc.text }, grid: { color: tc.grid } },
    },
  };

  // 1) Sufficienze (ad anello)
  const suff = grades.filter(g => g.voto >= 6).length;
  const insuff = grades.length - suff;
  drawChart('chart-classe-suff', {
    type: 'doughnut',
    data: { labels: ['Sufficienti', 'Insufficienti'], datasets: [{ data: [suff, insuff], backgroundColor: [tc.green, tc.red], borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { color: tc.text, boxWidth: 10, font: { size: 10 } } } },
    },
  });

  // 2) Distribuzione delle medie degli alunni (istogramma)
  const bucketsDef = [
    { label: '<5', test: v => v < 5 },
    { label: '5-6', test: v => v >= 5 && v < 6 },
    { label: '6-7', test: v => v >= 6 && v < 7 },
    { label: '7-8', test: v => v >= 7 && v < 8 },
    { label: '8-9', test: v => v >= 8 && v < 9 },
    { label: '9-10', test: v => v >= 9 },
  ];
  const medieAlunni = rows
    .map(r => avg(r.grades.map(g => g.voto)))
    .filter(v => v != null);
  drawChart('chart-classe-medie', {
    type: 'bar',
    data: {
      labels: bucketsDef.map(b => b.label),
      datasets: [{
        data: bucketsDef.map(b => medieAlunni.filter(b.test).length),
        backgroundColor: bucketsDef.map((b, i) => i < 2 ? tc.red : i < 4 ? tc.amber : tc.green),
        borderRadius: 6,
      }],
    },
    options: base,
  });

  // 3) Andamento del voto medio nel tempo (per mese)
  const byMonth = {};
  grades.forEach(g => {
    const ym = String(g.data || '').slice(0, 7);
    if (ym) (byMonth[ym] ||= []).push(g.voto);
  });
  const months = Object.keys(byMonth).sort();
  drawChart('chart-classe-andamento', {
    type: 'line',
    data: {
      labels: months.map(monthLabel),
      datasets: [{
        data: months.map(m => avg(byMonth[m])),
        borderColor: tc.blue, backgroundColor: 'rgba(91,155,255,0.12)',
        fill: true, tension: 0.3, pointRadius: 4, pointBackgroundColor: tc.blue, borderWidth: 2,
      }],
    },
    options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, suggestedMin: 0, suggestedMax: 10 } } },
  });

  // 4) Distribuzione dei voti singoli (1..10)
  const dbuckets = Array(11).fill(0);
  grades.forEach(g => { dbuckets[Math.round(g.voto)]++; });
  drawChart('chart-classe-dist', {
    type: 'bar',
    data: {
      labels: [...Array(10)].map((_, i) => i + 1),
      datasets: [{
        data: dbuckets.slice(1, 11),
        backgroundColor: [...Array(10)].map((_, i) => (i + 1) >= 6 ? tc.green : (i + 1) >= 5 ? tc.amber : tc.red),
        borderRadius: 5,
      }],
    },
    options: base,
  });
}

// Lezioni segnate come Verifica/Interrogazione (l.tipo, vedi dashboard) nello
// stesso ambito Anno/Classe della Scheda classe — non un'entità a sé, sono
// lezioni: il click apre la lezione stessa, come nei pannelli dashboard.
function classeDetailVerifiche(target, stu) {
  if (target.mode === 'ambiguous') return [];
  if (target.mode === 'single') {
    return DB.getLezioni(target.anno).filter(l => l.tipo && l.classe === target.classe).map(l => ({ ...l, anno: target.anno }));
  }
  const pairs = new Set();
  stu.forEach(s => Object.entries(s.anni || {}).forEach(([anno, v]) => {
    if (!v.classe) return;
    if (state.year !== 'all' && anno !== state.year) return;
    if (state.istituto !== 'all' && DB.istitutoOf(anno, v.classe) !== state.istituto) return;
    pairs.add(anno + '|' + v.classe);
  }));
  const out = [];
  pairs.forEach(key => {
    const [anno, classe] = key.split('|');
    out.push(...DB.getLezioni(anno).filter(l => l.tipo && l.classe === classe).map(l => ({ ...l, anno })));
  });
  return out;
}

function renderClasseVerifiche(target, stu) {
  const items = classeDetailVerifiche(target, stu)
    .sort((a, b) => a.data === b.data ? (+a.ora || 0) - (+b.ora || 0) : b.data.localeCompare(a.data));
  const el = document.getElementById('cd-verifiche-list');
  if (!items.length) { el.innerHTML = `<p class="stat-sub" style="padding:4px 0 8px">Nessuna verifica o interrogazione registrata.</p>`; return; }
  // A sinistra data - titolo, a destra la chip tipologia (stessa struttura
  // .dash-item-top del pannello dashboard "Prossimi appuntamenti e colloqui")
  el.innerHTML = items.map(l => `
    <div class="dash-item" data-anno="${escHtml(l.anno)}" data-id="${l.id}">
      <div class="dash-item-top">
        <span class="dash-item-ora">${escHtml(fmtData(l.data))}</span>
        <span class="dash-item-titolo">${escHtml(l.argomento || (l.tipo === 'verifica' ? 'Verifica' : 'Interrogazione'))}</span>
        <span class="mat-chip" style="--mat-color:${l.tipo === 'verifica' ? 'var(--accent-blue)' : 'var(--accent-amber)'}">${l.tipo === 'verifica' ? 'Verifica' : 'Interrogazione'}</span>
      </div>
    </div>`).join('');
  el.querySelectorAll('.dash-item').forEach(div => div.addEventListener('click', () => openLezione(div.dataset.anno, div.dataset.id)));
}

document.getElementById('cm-back').addEventListener('click', () => setView('classi'));
document.getElementById('btn-classe-alunni').addEventListener('click', () => {
  const target = classeDetailTarget();
  if (target.mode === 'ambiguous') return;
  if (target.mode === 'single') state.istituto = 'all'; // altrimenti un istituto filtrato non coerente con la classe la farebbe sparire dal filtro
  buildFilterBar();
  setView('alunni');
});
document.getElementById('btn-classe-modifica').addEventListener('click', () => {
  const target = classeDetailTarget();
  if (target.mode !== 'single') return;
  openForm('classe-meta', target);
});
document.getElementById('btn-classe-elimina').addEventListener('click', async () => {
  const target = classeDetailTarget();
  if (target.mode !== 'single') return;
  const { anno, classe } = target;
  const n = state.students.filter(s => s.anni?.[anno]?.classe === classe).length;
  if (!confirm(`Eliminare la classe ${classe} (${anno})? ${n} alunn${n === 1 ? 'o verrà disiscritto' : 'i verranno disiscritti'} da quell'anno e perderanno i voti registrati in quell'anno. L'azione è irreversibile.`)) return;
  try {
    await DB.deleteClasse(anno, classe);
    state.students = await DB.all();
    state.klass = 'all';
    buildFilterBar();
    setView('classi');
  } catch (err) {
    alert('Errore durante l\'eliminazione: ' + err.message);
  }
});

// ── Promozione classe (singola e di gruppo) ──────────────────────────
const promoOverlay = document.getElementById('promo-overlay');
let promoTargets = null; // [{anno, classe, nextAnno, nextClasse}] in attesa di conferma

function closePromo() { promoOverlay.classList.add('hidden'); promoTargets = null; }
document.getElementById('promo-close').addEventListener('click', closePromo);
document.getElementById('promo-cancel').addEventListener('click', closePromo);
promoOverlay.addEventListener('click', e => { if (e.target === promoOverlay) closePromo(); });

// Promozione di una singola classe: mostra l'elenco alunni con checkbox "non promosso"
function openPromoSingola(anno, classe) {
  const nextClasse = nextClasseOf(classe);
  if (!nextClasse) {
    alert(`"${classe}" è già una quinta (o la classe non inizia con un numero): non può essere promossa oltre. Gli alunni probabilmente si diplomano.`);
    return;
  }
  const nextAnno = nextAnnoOf(anno);
  const stu = state.students.filter(s => s.anni?.[anno]?.classe === classe)
    .sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));

  document.getElementById('promo-title').textContent = `Promuovi ${classe} (${anno} → ${nextAnno})`;
  document.getElementById('promo-body').innerHTML = `
    <p class="modal-desc">${classe} diventa <b>${escHtml(nextClasse)}</b> in ${escHtml(nextAnno)}. Segna chi non è stato promosso: non verrà iscritto da nessuna parte (resta così com'è, se ne occuperà quando l'anno prossimo esisterà davvero).</p>
    <div class="mc-list">
      ${stu.length ? stu.map(x => `
        <label class="mc-chk">
          <input type="checkbox" class="promo-np" value="${x.id}"/>
          <span>${escHtml(x.cognome)} ${escHtml(x.nome)}</span>
        </label>`).join('') : '<p class="stat-sub">Nessun alunno in questa classe.</p>'}
    </div>`;

  promoTargets = [{ anno, classe, nextAnno, nextClasse, single: true }];
  promoOverlay.classList.remove('hidden');
}

// Promozione di gruppo: tutti promossi (nessuna selezione di ripetenti),
// classi non promuovibili (già quinte) vengono saltate con avviso
function openPromoBulk(pairs) {
  const targets = [];
  const skipped = [];
  pairs.forEach(({ anno, classe }) => {
    const nextClasse = nextClasseOf(classe);
    if (!nextClasse) { skipped.push(classe); return; }
    targets.push({ anno, classe, nextAnno: nextAnnoOf(anno), nextClasse });
  });
  if (!targets.length) { alert('Nessuna delle classi selezionate può essere promossa (già quinte).'); return; }

  document.getElementById('promo-title').textContent = `Promuovi ${targets.length} class${targets.length === 1 ? 'e' : 'i'}`;
  document.getElementById('promo-body').innerHTML = `
    <p class="modal-desc">Tutti gli alunni delle classi selezionate verranno promossi (nessuna gestione di eventuali non promossi in blocco: usa la promozione singola per quello).</p>
    <div class="mc-list">
      ${targets.map(t => `<div class="mc-chk" style="cursor:default"><span>${escHtml(t.classe)} → ${escHtml(t.nextClasse)} (${escHtml(t.anno)} → ${escHtml(t.nextAnno)})</span></div>`).join('')}
    </div>
    ${skipped.length ? `<p class="stat-sub" style="margin-top:8px">Saltate (già quinte): ${skipped.map(escHtml).join(', ')}</p>` : ''}`;

  promoTargets = targets;
  promoOverlay.classList.remove('hidden');
}

document.getElementById('promo-confirm').addEventListener('click', async () => {
  if (!promoTargets || !promoTargets.length) return;
  const btn = document.getElementById('promo-confirm');
  btn.disabled = true;
  try {
    let totale = 0;
    for (const t of promoTargets) {
      const nonPromossi = t.single
        ? new Set([...document.querySelectorAll('.promo-np:checked')].map(i => i.value))
        : new Set();
      totale += await DB.promuoviClasse(t.anno, t.classe, t.nextAnno, t.nextClasse, nonPromossi);
    }
    state.students = await DB.all();
    closePromo();
    state.classiSelected.clear();
    renderAll();
    alert(`Promossi ${totale} alunni.`);
  } catch (err) {
    alert('Errore durante la promozione: ' + err.message);
  } finally {
    btn.disabled = false;
  }
});

document.getElementById('btn-classe-promuovi').addEventListener('click', () => {
  const target = classeDetailTarget();
  if (target.mode !== 'single') return;
  openPromoSingola(target.anno, target.classe);
});

// Chiavi "anno|classe" attualmente visibili in tabella (stessi filtri di renderClassi)
function classiVisibleKeys() {
  const seen = new Set();
  state.students.forEach(s => Object.entries(s.anni || {}).forEach(([anno, v]) => {
    if (!v.classe) return;
    if (state.year !== 'all' && anno !== state.year) return;
    if (state.klass !== 'all' && v.classe !== state.klass) return;
    if (state.istituto !== 'all' && DB.istitutoOf(anno, v.classe) !== state.istituto) return;
    const key = anno + '|' + v.classe;
    if (state.search && !v.classe.toLowerCase().includes(state.search)) return;
    seen.add(key);
  }));
  return [...seen];
}
document.getElementById('btn-classi-select-all').addEventListener('click', () => {
  const keys = classiVisibleKeys();
  const allSel = keys.length > 0 && keys.every(k => state.classiSelected.has(k));
  if (allSel) keys.forEach(k => state.classiSelected.delete(k));
  else keys.forEach(k => state.classiSelected.add(k));
  renderClassi();
});

// ── Azioni di gruppo sulle classi (tabella) ──────────────────────────
document.getElementById('btn-classi-promuovi-bulk').addEventListener('click', () => {
  const pairs = [...state.classiSelected].map(k => { const [anno, classe] = k.split('|'); return { anno, classe }; });
  if (!pairs.length) return;
  openPromoBulk(pairs);
});
document.getElementById('btn-classi-elimina-bulk').addEventListener('click', async () => {
  const pairs = [...state.classiSelected].map(k => { const [anno, classe] = k.split('|'); return { anno, classe }; });
  if (!pairs.length) return;
  if (!confirm(`Eliminare ${pairs.length} class${pairs.length === 1 ? 'e' : 'i'} (${pairs.map(p => `${p.classe} ${p.anno}`).join(', ')})? Gli alunni verranno disiscritti e perderanno i voti di quegli anni. L'azione è irreversibile.`)) return;
  try {
    for (const p of pairs) await DB.deleteClasse(p.anno, p.classe);
    state.students = await DB.all();
    state.classiSelected.clear();
    renderAll();
  } catch (err) {
    alert('Errore durante l\'eliminazione: ' + err.message);
  }
});

// ── Vista Voti ──────────────────────────────────────────────────────
function votiRows() {
  const rows = [];
  filteredNoSearch().forEach(s =>
    gradesOf(s, state.year).forEach(g => rows.push({ s, g })));
  let list = rows;
  if (state.filtroDa) list = list.filter(r => r.g.data >= state.filtroDa);
  if (state.filtroA) list = list.filter(r => r.g.data <= state.filtroA);
  if (!state.search) return list;
  return list.filter(r =>
    `${r.s.nome} ${r.s.cognome} ${classeOf(r.s, r.g.anno)} ${r.g.materia} ${r.g.desc || ''} ${r.g.anno}`
      .toLowerCase().includes(state.search));
}

function votiRowKey(s, g) { return `${s.id}|${g.anno}|${g.materia}|${g.id}`; }

async function inlineUpdateGrade(sid, anno, materia, gradeId, field, value) {
  const s = state.students.find(x => x.id === sid);
  const g = s?.anni?.[anno]?.materie?.[materia]?.find(x => x.id === gradeId);
  if (!s || !g) return;
  // editGrade ricostruisce il voto da zero: serve passare tutti i campi, non solo quello cambiato
  const attrs = { voto: g.voto, data: g.data, tipo: g.tipo, desc: g.desc, commento: g.commento };
  if (field === 'voto') {
    const v = parseVotoArgo(value);
    if (!Number.isFinite(v)) { alert('Voto non valido.'); renderAll(); return; }
    attrs.voto = v;
  } else {
    attrs[field] = value;
  }
  try {
    DB.editGrade(s, anno, materia, gradeId, anno, materia, attrs);
    await DB.put(s);
    renderAll();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
}

function renderVoti() {
  const wrap = document.getElementById('voti-wrap');
  const empty = document.getElementById('voti-empty');
  const panel = wrap.closest('.table-panel');
  const groupsWrap = document.getElementById('voti-groups');
  const rows = sortRows('voti', votiRows(), {
    data: r => r.g.data, alunno: r => `${r.s.cognome} ${r.s.nome}`,
    classe: r => classeOf(r.s, r.g.anno) || '', materia: r => r.g.materia,
    voto: r => r.g.voto, tipo: r => r.g.tipo,
  });
  document.getElementById('voti-count').textContent = `${rows.length} voti`;

  const visibleKeys = new Set(rows.map(({ s, g }) => votiRowKey(s, g)));
  [...state.votiSelected].forEach(k => { if (!visibleKeys.has(k)) state.votiSelected.delete(k); });
  updateVotiBulkBar();
  const allSel = rows.length > 0 && rows.every(({ s, g }) => state.votiSelected.has(votiRowKey(s, g)));
  const votiSelAllBtn = document.getElementById('btn-voti-select-all');
  votiSelAllBtn.classList.toggle('active', allSel);
  votiSelAllBtn.title = allSel ? 'Deseleziona tutto' : 'Seleziona tutto';

  if (!rows.length) {
    wrap.innerHTML = ''; panel.classList.add('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');
  syncRaggruppaBtn('voti');

  const votoRowHtml = ({ s, g }) => {
    const key = votiRowKey(s, g);
    const classe = classeOf(s, g.anno) || '';
    return `
      <tr class="row-selectable ${state.votiSelected.has(key) ? 'selected' : ''}" data-key="${escHtml(key)}" data-sid="${s.id}" data-anno="${escHtml(g.anno)}" data-mat="${escHtml(g.materia)}" data-gid="${g.id}">
        <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
        <td><input type="date" class="vf-input voti-field" data-f="data" value="${escHtml(g.data)}"/></td>
        <td class="vt-stu" data-open="${s.id}">${escHtml(s.cognome)} ${escHtml(s.nome)}</td>
        <td class="col-hide-m">${escHtml(classe || '—')}</td>
        <td>${escHtml(g.materia)}</td>
        <td><input class="vf-input voti-field" data-f="voto" list="voto-list" value="${fmt(g.voto)}"/></td>
        <td class="col-hide-m">
          <select class="vf-input voti-field" data-f="tipo">
            <option value="scritto" ${g.tipo === 'scritto' ? 'selected' : ''}>Scritto</option>
            <option value="orale" ${g.tipo === 'orale' ? 'selected' : ''}>Orale</option>
            <option value="pratico" ${g.tipo === 'pratico' ? 'selected' : ''}>Pratico</option>
          </select>
        </td>
        <td class="col-hide-m"><input class="vf-input voti-field" data-f="desc" value="${escHtml(g.desc || '')}" title="${escHtml(g.commento || '')}"/></td>
        <td class="vt-actions">
          <button class="grade-edit" data-sid="${s.id}" data-anno="${escHtml(g.anno)}" data-mat="${escHtml(g.materia)}" data-gid="${g.id}" title="Modifica (tutti i campi)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="grade-rm" data-sid="${s.id}" data-anno="${escHtml(g.anno)}" data-mat="${escHtml(g.materia)}" data-gid="${g.id}" title="Elimina voto">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </td>
      </tr>`;
  };
  const votiThead = `
      <th></th>
      <th class="sortable" data-sort="data">Data${sortIcon('voti', 'data')}</th>
      <th class="sortable" data-sort="alunno">Alunno${sortIcon('voti', 'alunno')}</th>
      <th class="col-hide-m sortable" data-sort="classe">Classe${sortIcon('voti', 'classe')}</th>
      <th class="sortable" data-sort="materia">Materia${sortIcon('voti', 'materia')}</th>
      <th class="sortable" data-sort="voto">Voto${sortIcon('voti', 'voto')}</th>
      <th class="col-hide-m sortable" data-sort="tipo">Tipo${sortIcon('voti', 'tipo')}</th>
      <th class="col-hide-m">Descrizione</th><th></th>`;
  let activeContainer;
  if (state.raggruppa.voti) {
    panel.classList.add('hidden');
    groupsWrap.classList.remove('hidden');
    groupsWrap.innerHTML = groupedTablePanels(rows, r => classeOf(r.s, r.g.anno), votiThead, votoRowHtml);
    activeContainer = groupsWrap;
  } else {
    panel.classList.remove('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    wrap.innerHTML = `<table class="voti-table"><thead><tr>${votiThead}</tr></thead><tbody>${rows.map(votoRowHtml).join('')}</tbody></table>`;
    activeContainer = wrap;
  }

  activeContainer.querySelectorAll('.voti-field').forEach(inp => inp.addEventListener('change', () => {
    const row = inp.closest('tr');
    const { sid, anno, mat, gid } = row.dataset;
    inlineUpdateGrade(sid, anno, mat, gid, inp.dataset.f, inp.value);
  }));
  activeContainer.querySelectorAll('.grade-rm').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    const s = state.students.find(x => x.id === btn.dataset.sid);
    if (!s) return;
    DB.removeGrade(s, btn.dataset.anno, btn.dataset.mat, btn.dataset.gid);
    await DB.put(s);
    renderAll();
  }));
  activeContainer.querySelectorAll('.grade-edit').forEach(btn => btn.addEventListener('click', e => {
    e.stopPropagation();
    openForm('grade', { editing: { sid: btn.dataset.sid, anno: btn.dataset.anno, materia: btn.dataset.mat, gradeId: btn.dataset.gid } });
  }));

  // Click sul nome alunno → apre la scheda; click altrove nella riga (fuori
  // da campi inline/bottoni) → seleziona per le azioni di gruppo
  activeContainer.querySelectorAll('tr[data-key]').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('.vt-stu')) { openStudent(row.dataset.sid); return; }
    if (e.target.closest('.voti-field') || e.target.closest('.grade-edit') || e.target.closest('.grade-rm')) return;
    if (isMobileWidth()) { toggleRowExpand(row); return; }
    const key = row.dataset.key;
    if (state.votiSelected.has(key)) state.votiSelected.delete(key);
    else state.votiSelected.add(key);
    row.classList.toggle('selected');
    updateVotiBulkBar();
    const stillAll = rows.length > 0 && rows.every(({ s, g }) => state.votiSelected.has(votiRowKey(s, g)));
    const votiSelAllBtn = document.getElementById('btn-voti-select-all');
    votiSelAllBtn.classList.toggle('active', stillAll);
    votiSelAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
  wireSort(activeContainer, 'voti', renderVoti);
}
function updateVotiBulkBar() {
  const bar = document.getElementById('voti-bulk-bar');
  const n = state.votiSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('voti-sel-count').textContent = `${n} vot${n === 1 ? 'o' : 'i'} selezionat${n === 1 ? 'o' : 'i'}`;
}
document.getElementById('btn-voti-select-all').addEventListener('click', () => {
  const keys = votiRows().map(({ s, g }) => votiRowKey(s, g));
  const allSel = keys.length > 0 && keys.every(k => state.votiSelected.has(k));
  if (allSel) keys.forEach(k => state.votiSelected.delete(k));
  else keys.forEach(k => state.votiSelected.add(k));
  renderVoti();
});
document.getElementById('btn-voti-elimina-bulk').addEventListener('click', async () => {
  const keys = [...state.votiSelected];
  if (!keys.length) return;
  if (!confirm(`Eliminare ${keys.length} vot${keys.length === 1 ? 'o' : 'i'}? L'azione è irreversibile.`)) return;
  try {
    const bySid = new Map();
    keys.forEach(k => {
      const [sid, anno, materia, gid] = k.split('|');
      if (!bySid.has(sid)) bySid.set(sid, []);
      bySid.get(sid).push({ anno, materia, gid });
    });
    const changed = [];
    for (const [sid, items] of bySid) {
      const s = state.students.find(x => x.id === sid);
      if (!s) continue;
      items.forEach(({ anno, materia, gid }) => DB.removeGrade(s, anno, materia, gid));
      changed.push(s);
    }
    await DB.putMany(changed);
    state.votiSelected.clear();
    renderAll();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Verifiche: valutazione (griglia) + analisi (statistiche), unite ─────
// Una verifica è identificata da Classe + Descrizione soltanto: ogni alunno
// può averla svolta in una data diversa (assenti, recuperi), quindi la Data
// non fa parte della chiave ma è un campo per-alunno nella griglia.
function verificaKeyOf(g, classe) {
  return [classe || '', g.desc].join('§');
}
function verificaGroups() {
  const map = new Map();
  filteredNoSearch().forEach(s => gradesOf(s, state.year).forEach(g => {
    if (!g.desc) return;
    const classe = classeOf(s, g.anno) || '';
    const key = verificaKeyOf(g, classe);
    if (!map.has(key)) map.set(key, { key, desc: g.desc, data: g.data, anno: g.anno, classe, materia: g.materia, rows: [] });
    const grp = map.get(key);
    if (g.data < grp.data) grp.data = g.data; // data rappresentativa = la più vecchia tra gli alunni
    grp.rows.push({ s, g });
  }));
  return [...map.values()].sort((a, b) => b.data.localeCompare(a.data));
}

// Punto d'ingresso della vista: mostra il select "nuova vs precedente".
// La griglia di valutazione/inserimento resta sempre visibile: scegliendo
// una verifica già salvata viene ricaricata lì (dati precompilati, stessi
// alunni) così si può correggere non solo guardare i grafici; scegliendo
// "+ Nuova verifica" la griglia riparte vuota.
function renderVerifiche() {
  const groups = verificaGroups();
  if (state.vfSelectedKey && !groups.some(g => g.key === state.vfSelectedKey)) state.vfSelectedKey = null;

  const sel = document.getElementById('vf-select');
  sel.innerHTML = '<option value="">+ Nuova verifica</option>' +
    groups.map(g => `<option value="${escHtml(g.key)}" ${state.vfSelectedKey === g.key ? 'selected' : ''}>${escHtml(g.classe || '—')} - ${escHtml(g.desc)} (${g.rows.length} vot${g.rows.length === 1 ? 'o' : 'i'})</option>`).join('');
  sel.value = state.vfSelectedKey || '';

  const group = state.vfSelectedKey ? groups.find(g => g.key === state.vfSelectedKey) : null;
  document.getElementById('vf-analisi-mode').classList.toggle('hidden', !group);
  if (group) renderVerificaAnalisi(group);
  renderValutazioneVerifica();
}
document.getElementById('vf-select').addEventListener('change', e => {
  state.vfSelectedKey = e.target.value || null;
  if (state.vfSelectedKey) {
    const group = verificaGroups().find(g => g.key === state.vfSelectedKey);
    if (group) loadVerificaIntoVV(group);
  } else {
    vvState = newVVState();
    document.getElementById('vv-titolo').value = '';
  }
  renderVerifiche();
});

// Ricostruisce lo stato di modifica (esercizi, percentuali, griglia) a
// partire dai voti già salvati di una verifica, e allinea Anno/Classe ai
// filtri in alto (la griglia mostra gli alunni di quella classe/anno)
function loadVerificaIntoVV(group) {
  vvState = newVVState();
  const sample = group.rows.find(r => r.g.verificaEsercizi?.length) || group.rows[0];
  const esArr = sample?.g.verificaEsercizi || [];
  vvState.esercizi = esArr.map(e => ({ id: DB.uid(), max: e.max || 0 }));

  group.rows.forEach(({ s, g }) => {
    if (g.verificaPercentuali) {
      vvState.percentuali[s.id] = {};
      vvState.esercizi.forEach((e, i) => { vvState.percentuali[s.id][e.id] = g.verificaPercentuali[i] ?? ''; });
    }
    if (g.griglia) {
      vvState.griglia[s.id] = {};
      vvState.esercizi.forEach((e, i) => { vvState.griglia[s.id][e.id] = g.griglia[i] || { a: '', b: '', c: '' }; });
    }
    vvState.date[s.id] = g.data;
    vvState.pratico.voti[s.id] = g.voto;
    vvState.pratico.commenti[s.id] = g.commento || '';
  });

  document.getElementById('vv-titolo').value = group.desc;
  document.getElementById('vv-materia').value = group.materia || '';
  document.getElementById('vv-data').value = group.data;
  document.getElementById('vv-tipo').value = sample?.g.tipo || 'scritto';

  state.year = group.anno;
  state.istituto = 'all';
  state.klass = group.classe;
  buildFilterBar();
}

function renderVerificaAnalisi(group) {
  const rows = group.rows;
  const voti = rows.map(r => r.g.voto);

  const date = [...new Set(rows.map(r => r.g.data))].sort();
  const dateLabel = date.length > 1 ? `${fmtData(date[0])} – ${fmtData(date[date.length - 1])}` : fmtData(date[0]);
  document.getElementById('av-title').textContent = group.desc;
  document.getElementById('av-sub').textContent = [group.classe, group.materia, dateLabel].filter(Boolean).join(' · ');
  document.getElementById('av-media').textContent = `media ${fmt(avg(voti))} · ${rows.length} vot${rows.length === 1 ? 'o' : 'i'}`;

  const tc = themeColors();
  const base = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: tc.text }, grid: { color: tc.grid } },
      x: { ticks: { color: tc.text }, grid: { color: tc.grid } },
    },
  };

  const suff = voti.filter(v => v >= 6).length;
  drawChart('chart-av-suff', {
    type: 'doughnut',
    data: { labels: ['Sufficienti', 'Insufficienti'], datasets: [{ data: [suff, voti.length - suff], backgroundColor: [tc.green, tc.red], borderWidth: 0 }] },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '68%',
      plugins: { legend: { position: 'bottom', labels: { color: tc.text, boxWidth: 10, font: { size: 10 } } } },
    },
  });

  const buckets = Array(11).fill(0);
  voti.forEach(v => buckets[Math.round(v)]++);
  drawChart('chart-av-hist', {
    type: 'bar',
    data: {
      labels: [...Array(10)].map((_, i) => i + 1),
      datasets: [{
        data: buckets.slice(1, 11),
        backgroundColor: [...Array(10)].map((_, i) => (i + 1) >= 6 ? tc.green : (i + 1) >= 5 ? tc.amber : tc.red),
        borderRadius: 5,
      }],
    },
    options: base,
  });

  const ranking = rows.map(r => ({ nome: `${r.s.cognome} ${r.s.nome}`, voto: r.g.voto })).sort((a, b) => a.nome.localeCompare(b.nome));
  drawChart('chart-av-bar', {
    type: 'bar',
    data: {
      labels: ranking.map(r => r.nome),
      datasets: [{
        data: ranking.map(r => r.voto),
        backgroundColor: ranking.map(r => r.voto >= 6 ? tc.green : r.voto >= 5 ? tc.amber : tc.red),
        borderRadius: 5,
      }],
    },
    options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, suggestedMin: 0, suggestedMax: 10 } } },
  });
}

// ── Valutazione verifica: voto esercizio per esercizio ───────────────
// Griglia "usa e getta" (non salvata come modello): la struttura esercizi
// vive solo mentre la pagina è aperta. Ogni esercizio ha solo un punteggio
// massimo (niente titolo); il punteggio per alunno si inserisce in
// percentuale (0-100%) di quel massimo — così "Punteggi esercizi" è, come
// da modello allegato dall'utente, uno strumento di ausilio rapido.
// Da lì un pulsante "Converti" propone i valori per l'ufficiale "Griglia di
// valutazione" (indicatori A/B/C, max 4/4/2 = 10), restando comunque
// modificabili a mano. Il voto salvato è quello della Griglia se compilata,
// altrimenti quello calcolato dalle percentuali. Classe/anno seguono i
// filtri in alto, come la Scheda classe.
function newVVState() {
  return {
    esercizi: [], percentuali: {}, griglia: {}, date: {},
    pratico: { modo: 'individuale', voti: {}, commenti: {}, gruppi: [] },
  };
  // esercizi: [{id, max}]
  // percentuali: { [studentId]: { [esercizioId]: percentuale 0-100 } }
  // griglia: { [studentId]: { a, b, c } }  (0-4, 0-4, 0-2)
  // date: { [studentId]: 'YYYY-MM-DD' }  (data di svolgimento individuale)
  // pratico: tipo "Pratico" salta esercizi/griglia — voto diretto per alunno
  // ('individuale') oppure più gruppi ('gruppo'), ciascuno con il proprio
  // voto/commento e i propri membri: gruppi: [{id, voto, commento, studenti: [studentId,…]}]
  // — un alunno assegnato a un gruppo sparisce dal pool condiviso, quindi
  // non può stare in due gruppi contemporaneamente
}
// Data di svolgimento dell'alunno: quella esplicitamente impostata per lui,
// altrimenti la data generale in alto (così basta cambiarla per chi assente
// non serve toccare nulla, ma chi ha svolto la verifica altrove resta suo)
function vvDataOf(s) {
  return vvState.date[s.id] || document.getElementById('vv-data').value || todayISO();
}
let vvState = newVVState();
function roundVoto025(v) { return Math.round(v * 4) / 4; }
function vvSommaMax() { return vvState.esercizi.reduce((a, e) => a + (e.max || 0), 0); }
function vvHasPercentuali(s) {
  const p = vvState.percentuali[s.id];
  return !!p && Object.values(p).some(v => v !== '' && v != null);
}
// Percentuale complessiva pesata sui punteggi massimi dei singoli esercizi
function vvPercentualeMedia(s) {
  if (!vvHasPercentuali(s)) return null;
  const sommaMax = vvSommaMax();
  if (!sommaMax) return null;
  const pcts = vvState.percentuali[s.id] || {};
  const ottenuto = vvState.esercizi.reduce((a, e) => a + ((parseFloat(pcts[e.id]) || 0) / 100) * e.max, 0);
  return (ottenuto / sommaMax) * 100;
}
function vvVotoPercentuali(s) {
  const pct = vvPercentualeMedia(s);
  return pct == null ? null : roundVoto025((pct / 100) * 10);
}
// Griglia A/B/C: una per esercizio (max 4/4/2 = 10 ciascuna), non una sola
// per l'intera verifica — vvState.griglia[studentId][esercizioId] = {a,b,c}
function vvSommaGrigliaEs(s, esId) {
  const g = vvState.griglia[s.id]?.[esId];
  if (!g || ![g.a, g.b, g.c].some(v => v !== '' && v != null)) return null;
  return (parseFloat(g.a) || 0) + (parseFloat(g.b) || 0) + (parseFloat(g.c) || 0);
}
function vvHasGrigliaEs(s, esId) { return vvSommaGrigliaEs(s, esId) != null; }
// Somma A+B+C (scala fissa su 10) riportata sul punteggio massimo di
// quell'esercizio, es. esercizio da 5 punti e somma 8.5/10 → 4.25/5
function vvSommaEsPunti(somma, max) { return somma == null ? null : (somma / 10) * max; }
function vvHasGriglia(s) { return vvState.esercizi.some(e => vvHasGrigliaEs(s, e.id)); }
// Voto complessivo dalla griglia: somma di ciascun esercizio (già su 10)
// pesata come le percentuali, sullo stesso punteggio massimo dell'esercizio
// (un esercizio non compilato conta 0, come una percentuale vuota)
function vvVotoGriglia(s) {
  const sommaMax = vvSommaMax();
  if (!sommaMax || !vvHasGriglia(s)) return null;
  const totPesato = vvState.esercizi.reduce((acc, e) => acc + (vvSommaGrigliaEs(s, e.id) || 0) * (e.max / sommaMax), 0);
  return roundVoto025(totPesato);
}
function vvVotoFinale(s) { return vvHasGriglia(s) ? vvVotoGriglia(s) : vvVotoPercentuali(s); }

function renderValutazioneVerifica() {
  document.getElementById('vv-materie-list').innerHTML =
    materieNamesLezioni().map(m => `<option value="${escHtml(m)}">`).join('');
  if (!document.getElementById('vv-data').value) document.getElementById('vv-data').value = todayISO();
  document.getElementById('vv-save').textContent = state.vfSelectedKey ? 'Salva modifiche' : 'Salva voti';

  renderVVEsercizi();
  renderVVGrid();
}

function updateVVSommaWarn() {
  const sommaMax = vvSommaMax();
  const warn = document.getElementById('vv-somma-warn');
  if (vvState.esercizi.length && sommaMax !== 10) {
    warn.textContent = `Il totale dei punti esercizio è ${fmt(sommaMax).replace(/,00$/, '')}, non 10.`;
    warn.classList.remove('hidden');
  } else {
    warn.classList.add('hidden');
  }
}

function renderVVEsercizi() {
  const list = document.getElementById('vv-esercizi-list');
  list.innerHTML = vvState.esercizi.length ? vvState.esercizi.map((es, i) => `
    <div class="vv-es-row" data-id="${es.id}">
      <span class="vv-es-label">Esercizio ${i + 1}</span>
      <input class="vf-input" data-f="max" type="number" min="0" step="0.5" value="${es.max}" placeholder="Punti max"/>
      <button class="btn-icon" data-rm="${es.id}" title="Rimuovi esercizio">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`).join('') : '<p class="stat-sub">Nessun esercizio: aggiungine almeno uno con "+ Esercizio".</p>';
  updateVVSommaWarn();

  list.querySelectorAll('[data-f="max"]').forEach(inp => inp.addEventListener('input', () => {
    const es = vvState.esercizi.find(e => e.id === inp.closest('.vv-es-row').dataset.id);
    if (!es) return;
    es.max = parseFloat(inp.value) || 0;
    updateVVSommaWarn();
    renderVVGrid();
  }));
  list.querySelectorAll('[data-rm]').forEach(btn => btn.addEventListener('click', () => {
    vvState.esercizi = vvState.esercizi.filter(e => e.id !== btn.dataset.rm);
    renderVVEsercizi();
    renderVVGrid();
  }));
}
document.getElementById('vv-add-esercizio').addEventListener('click', () => {
  vvState.esercizi.push({ id: DB.uid(), max: 0 });
  renderVVEsercizi();
  renderVVGrid();
});
// Cambiando la data generale si allinea la data di TUTTI gli alunni
// attualmente in griglia (è il modo naturale di pensarla: "la verifica è il
// giorno X" salvo eccezioni impostate singolarmente DOPO questo cambio,
// per gli assenti che la svolgono altrove)
document.getElementById('vv-data').addEventListener('input', e => {
  const target = classeDetailTarget();
  if (target.mode === 'single') {
    state.students
      .filter(s => s.anni?.[target.anno]?.classe === target.classe)
      .forEach(s => { vvState.date[s.id] = e.target.value; });
  }
  renderVVGrid();
});

function renderVVGrid() {
  const tipo = document.getElementById('vv-tipo').value;
  const esBlock = document.getElementById('vv-esercizi-block');
  const panel = document.getElementById('vv-grid-panel');
  const grigliaPanel = document.getElementById('vv-griglia-panel');
  const praticoPanel = document.getElementById('vv-pratico-panel');
  const empty = document.getElementById('vv-empty');
  const target = classeDetailTarget(); // riusa Anno/Classe dai filtri, come la Scheda classe

  // Pratico: niente esercizi/griglia, solo voto (+ commento) diretto per
  // alunno, oppure lo stesso voto/commento per tutta la classe ("di gruppo")
  if (tipo === 'pratico') {
    esBlock.classList.add('hidden');
    panel.classList.add('hidden');
    grigliaPanel.classList.add('hidden');
    const ready = target.mode === 'single';
    praticoPanel.classList.toggle('hidden', !ready);
    empty.classList.toggle('hidden', ready);
    if (!ready) return;
    renderVVPratico(target);
    return;
  }
  esBlock.classList.remove('hidden');
  praticoPanel.classList.add('hidden');

  const ready = target.mode === 'single' && vvState.esercizi.length > 0;
  panel.classList.toggle('hidden', !ready);
  grigliaPanel.classList.toggle('hidden', !ready);
  empty.classList.toggle('hidden', ready);
  if (!ready) return;

  const { anno, classe } = target;
  const stu = state.students.filter(s => s.anni?.[anno]?.classe === classe)
    .sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));

  renderVVPunteggiTable(stu);
  renderVVGrigliaTable(stu);
}
function renderVVPratico(target) {
  const { anno, classe } = target;
  const stu = state.students.filter(s => s.anni?.[anno]?.classe === classe)
    .sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
  const modo = vvState.pratico.modo;
  document.querySelectorAll('#vv-pratico-modo .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.pm === modo));
  document.getElementById('vv-pratico-individuale-view').classList.toggle('hidden', modo !== 'individuale');
  document.getElementById('vv-pratico-gruppo-view').classList.toggle('hidden', modo !== 'gruppo');

  if (modo === 'individuale') {
    document.getElementById('vv-pratico-individuale-wrap').innerHTML = `
      <table class="voti-table">
        <thead><tr><th>Alunno</th><th>Voto</th><th>Commento</th></tr></thead>
        <tbody>${stu.map(s => `
          <tr data-sid="${s.id}">
            <td>${vvAlunnoCell(s)}</td>
            <td><input class="vf-input vv-voto-input vv-pratico-voto" data-sid="${s.id}" type="number" min="0" max="10" step="0.25" value="${vvState.pratico.voti[s.id] ?? ''}"/></td>
            <td><input class="vf-input vv-pratico-commento" data-sid="${s.id}" value="${escHtml(vvState.pratico.commenti[s.id] || '')}"/></td>
          </tr>`).join('')}</tbody>
      </table>`;
    document.querySelectorAll('.vv-pratico-voto').forEach(inp => inp.addEventListener('input', () => {
      vvState.pratico.voti[inp.dataset.sid] = inp.value;
    }));
    document.querySelectorAll('.vv-pratico-commento').forEach(inp => inp.addEventListener('input', () => {
      vvState.pratico.commenti[inp.dataset.sid] = inp.value;
    }));
  } else {
    renderVVPraticoGruppi(stu);
  }
}
function mkVVGruppo() { return { id: DB.uid(), voto: '', commento: '', studenti: [] }; }
// Più gruppi, pool di alunni condiviso: chi è già in un gruppo (di questo o
// di un altro) sparisce dalle select "+ Aggiungi alunno" di tutti i gruppi —
// così un alunno non può finire in due gruppi contemporaneamente
function renderVVPraticoGruppi(stu) {
  // Scarta id di alunni non più nella classe corrente (cambio filtro Anno/Classe)
  vvState.pratico.gruppi.forEach(g => { g.studenti = g.studenti.filter(sid => stu.some(s => s.id === sid)); });
  if (!vvState.pratico.gruppi.length) vvState.pratico.gruppi.push(mkVVGruppo());

  const assegnati = new Set(vvState.pratico.gruppi.flatMap(g => g.studenti));
  const pool = stu.filter(s => !assegnati.has(s.id));

  const wrap = document.getElementById('vv-pratico-gruppi-wrap');
  wrap.innerHTML = vvState.pratico.gruppi.map((g, i) => `
    <div class="vv-gruppo-card" data-gid="${g.id}">
      <div class="vv-gruppo-head">
        <span class="vv-gruppo-title">Gruppo ${i + 1}</span>
        ${vvState.pratico.gruppi.length > 1 ? `
        <button class="btn-icon btn-icon-danger" data-rm-gruppo="${g.id}" title="Rimuovi gruppo">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>` : ''}
      </div>
      <select class="vf-input vv-gruppo-add" data-gid="${g.id}">
        <option value="">+ Aggiungi alunno</option>
        ${pool.map(s => `<option value="${s.id}">${escHtml(s.cognome)} ${escHtml(s.nome)}</option>`).join('')}
      </select>
      <div class="vv-gruppo-chips">
        ${g.studenti.map(sid => {
          const s = stu.find(x => x.id === sid);
          if (!s) return '';
          return `<span class="vv-gruppo-chip">${escHtml(s.cognome)} ${escHtml(s.nome)}<button data-rm-stu="${sid}" data-gid="${g.id}" title="Rimuovi dal gruppo">×</button></span>`;
        }).join('') || '<span class="stat-sub">Nessun alunno ancora</span>'}
      </div>
      <div class="vf-row">
        <label class="vf-label">Voto<input class="vf-input vv-voto-input vv-gruppo-voto" data-gid="${g.id}" type="number" min="0" max="10" step="0.25" value="${g.voto}"/></label>
        <label class="vf-label">Commento<input class="vf-input vv-gruppo-commento" data-gid="${g.id}" value="${escHtml(g.commento)}"/></label>
      </div>
    </div>`).join('');

  wrap.querySelectorAll('.vv-gruppo-voto').forEach(inp => inp.addEventListener('input', () => {
    const g = vvState.pratico.gruppi.find(x => x.id === inp.dataset.gid);
    if (g) g.voto = inp.value;
  }));
  wrap.querySelectorAll('.vv-gruppo-commento').forEach(inp => inp.addEventListener('input', () => {
    const g = vvState.pratico.gruppi.find(x => x.id === inp.dataset.gid);
    if (g) g.commento = inp.value;
  }));
  wrap.querySelectorAll('.vv-gruppo-add').forEach(sel => sel.addEventListener('change', () => {
    const g = vvState.pratico.gruppi.find(x => x.id === sel.dataset.gid);
    if (g && sel.value) { g.studenti.push(sel.value); renderVVGrid(); }
  }));
  wrap.querySelectorAll('[data-rm-stu]').forEach(btn => btn.addEventListener('click', () => {
    const g = vvState.pratico.gruppi.find(x => x.id === btn.dataset.gid);
    if (g) { g.studenti = g.studenti.filter(sid => sid !== btn.dataset.rmStu); renderVVGrid(); }
  }));
  wrap.querySelectorAll('[data-rm-gruppo]').forEach(btn => btn.addEventListener('click', () => {
    vvState.pratico.gruppi = vvState.pratico.gruppi.filter(x => x.id !== btn.dataset.rmGruppo);
    renderVVGrid();
  }));
}
document.getElementById('vv-add-gruppo').addEventListener('click', () => {
  vvState.pratico.gruppi.push(mkVVGruppo());
  renderVVGrid();
});
document.getElementById('vv-tipo').addEventListener('change', () => renderVVGrid());
document.querySelectorAll('#vv-pratico-modo .seg-btn').forEach(btn => btn.addEventListener('click', () => {
  vvState.pratico.modo = btn.dataset.pm;
  renderVVGrid();
}));

// Qui solo la sigla (PDP/PEI), senza la classificazione (es. "F81.0"): la
// colonna Alunno è stretta e a larghezza fissa, la pill con la classificazione
// per intero andrebbe a sovrapporsi alla colonna Data accanto
function vvAlunnoCell(s, showBM) {
  const profilo = s.profilo && s.profilo !== 'ND' ? s.profilo : '';
  return `${escHtml(s.cognome)} ${escHtml(s.nome)}${profilo ? `<span class="profilo-badge pb-inline pb-${profilo.toLowerCase()}">${escHtml(profilo)}</span>` : ''}${showBM ? bmScoreChipsHtml(s) : ''}`;
}
function renderVVPunteggiTable(stu) {
  document.getElementById('vv-grid-wrap').innerHTML = `
  <table class="voti-table vv-punteggi-table">
    <thead><tr>
      <th>Alunno</th>
      <th>Data</th>
      ${vvState.esercizi.map((e, i) => `<th class="vt-mono">Es. ${i + 1}<br><span class="stat-sub">% (max ${fmt(e.max).replace(/,00$/, '')})</span></th>`).join('')}
      <th>Voto</th>
    </tr></thead>
    <tbody>
      ${stu.map(s => {
        const pcts = vvState.percentuali[s.id] || {};
        const voto = vvVotoPercentuali(s);
        return `<tr data-sid="${s.id}">
          <td>${vvAlunnoCell(s, true)}</td>
          <td><input class="vf-input vv-data-stu" data-sid="${s.id}" type="date" value="${vvDataOf(s)}"/></td>
          ${vvState.esercizi.map(e => `<td><input class="vf-input vv-pct" data-sid="${s.id}" data-eid="${e.id}" type="number" min="0" max="100" step="1" value="${pcts[e.id] ?? ''}"/></td>`).join('')}
          <td class="vt-mono vt-voto vv-voto-pct ${voto != null ? gradeClass(voto) : ''}">${voto != null ? fmt(voto) : '—'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;

  document.querySelectorAll('.vv-data-stu').forEach(inp => inp.addEventListener('input', () => {
    vvState.date[inp.dataset.sid] = inp.value;
  }));
  document.querySelectorAll('.vv-pct').forEach(inp => inp.addEventListener('input', () => {
    let v = parseFloat(inp.value);
    if (Number.isFinite(v) && v > 100) { v = 100; inp.value = '100'; }
    const { sid, eid } = inp.dataset;
    (vvState.percentuali[sid] ||= {})[eid] = inp.value;
    const row = inp.closest('tr');
    const voto = vvVotoPercentuali({ id: sid });
    const votoCell = row.querySelector('.vv-voto-pct');
    votoCell.textContent = voto != null ? fmt(voto) : '—';
    votoCell.className = `vt-mono vt-voto vv-voto-pct ${voto != null ? gradeClass(voto) : ''}`;
  }));
}

// Una per esercizio: A/4, B/4, C/2, e la loro somma (già su 10) subito sotto
// Una colonna per esercizio (non 4): dentro, gli input A/B/C affiancati e
// subito sotto il totale di quell'esercizio diviso 10 (una singola riga di
// intestazione, niente colspan/rowspan — con tante colonne uguali il
// table-layout fixed le tiene della stessa dimensione anche ridimensionando).
function renderVVGrigliaTable(stu) {
  document.getElementById('vv-griglia-wrap').innerHTML = `
  <table class="voti-table vv-griglia-table">
    <thead>
      <tr>
        <th>Alunno</th>
        ${vvState.esercizi.map((e, i) => `<th class="vt-mono">Es. ${i + 1} (A/4 B/4 C/2)</th>`).join('')}
        <th>Voto</th>
      </tr>
    </thead>
    <tbody>
      ${stu.map(s => {
        const voto = vvVotoGriglia(s);
        return `<tr data-sid="${s.id}">
          <td>${vvAlunnoCell(s, true)}</td>
          ${vvState.esercizi.map(e => {
            const g = vvState.griglia[s.id]?.[e.id] || {};
            const somma = vvSommaGrigliaEs(s, e.id);
            return `
              <td>
                <div class="vv-abc-row">
                  <input class="vf-input vv-g" data-sid="${s.id}" data-eid="${e.id}" data-k="a" type="number" min="0" max="4" step="0.5" value="${g.a ?? ''}"/>
                  <input class="vf-input vv-g" data-sid="${s.id}" data-eid="${e.id}" data-k="b" type="number" min="0" max="4" step="0.5" value="${g.b ?? ''}"/>
                  <input class="vf-input vv-g" data-sid="${s.id}" data-eid="${e.id}" data-k="c" type="number" min="0" max="2" step="0.25" value="${g.c ?? ''}"/>
                </div>
                <div class="vv-somma-es" data-sid="${s.id}" data-eid="${e.id}">${somma != null ? `${fmt(vvSommaEsPunti(somma, e.max))}/${fmt(e.max).replace(/,00$/, '')}` : '—'}</div>
              </td>`;
          }).join('')}
          <td class="vt-mono vt-voto vv-voto-g ${voto != null ? gradeClass(voto) : ''}">${voto != null ? fmt(voto) : '—'}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>`;

  document.querySelectorAll('.vv-g').forEach(inp => inp.addEventListener('input', () => {
    const { sid, eid, k } = inp.dataset;
    ((vvState.griglia[sid] ||= {})[eid] ||= {})[k] = inp.value;
    const row = inp.closest('tr');
    const somma = vvSommaGrigliaEs({ id: sid }, eid);
    const esMax = vvState.esercizi.find(e => e.id === eid)?.max || 0;
    row.querySelector(`.vv-somma-es[data-eid="${eid}"]`).textContent = somma != null ? `${fmt(vvSommaEsPunti(somma, esMax))}/${fmt(esMax).replace(/,00$/, '')}` : '—';
    const voto = vvVotoGriglia({ id: sid });
    const votoCell = row.querySelector('.vv-voto-g');
    votoCell.textContent = voto != null ? fmt(voto) : '—';
    votoCell.className = `vt-mono vt-voto vv-voto-g ${voto != null ? gradeClass(voto) : ''}`;
  }));
}

document.getElementById('vv-converti').addEventListener('click', () => {
  const target = classeDetailTarget();
  if (target.mode !== 'single') return;
  const { anno, classe } = target;
  const stu = state.students.filter(s => s.anni?.[anno]?.classe === classe);
  let n = 0;
  stu.forEach(s => {
    const pcts = vvState.percentuali[s.id];
    if (!pcts) return;
    vvState.esercizi.forEach(e => {
      const pct = parseFloat(pcts[e.id]);
      if (!Number.isFinite(pct)) return; // esercizio non valutato per questo alunno: lascialo com'è
      (vvState.griglia[s.id] ||= {})[e.id] = {
        a: Math.round((pct / 100 * 4) * 2) / 2,
        b: Math.round((pct / 100 * 4) * 2) / 2,
        c: Math.round((pct / 100 * 2) * 4) / 4,
      };
      n++;
    });
  });
  if (!n) { alert('Inserisci prima almeno una percentuale nella tabella "Punteggi esercizi".'); return; }
  renderVVGrigliaTable(stu.sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`)));
});

async function saveVerifica() {
  const target = classeDetailTarget();
  if (target.mode !== 'single') return;
  const titolo = document.getElementById('vv-titolo').value.trim();
  const materia = document.getElementById('vv-materia').value.trim();
  const tipo = document.getElementById('vv-tipo').value;
  if (!materia) { alert('Inserisci la materia.'); return; }
  if (!titolo) { alert('Inserisci un titolo per la verifica (diventa la descrizione del voto).'); return; }

  const { anno, classe } = target;
  const stu = state.students.filter(s => s.anni?.[anno]?.classe === classe);
  // Se si sta modificando una verifica già salvata, i voti degli alunni già
  // presenti vengono aggiornati (non duplicati); un alunno nuovo (es. era
  // assente ed è stato aggiunto ora) diventa comunque un voto nuovo.
  const editingGroup = state.vfSelectedKey ? verificaGroups().find(g => g.key === state.vfSelectedKey) : null;
  const changed = [];

  if (tipo === 'pratico') {
    // Niente esercizi/griglia: voto diretto, individuale o "di gruppo" (uno o
    // più gruppi, ciascuno col proprio voto/commento per i propri membri)
    const salva = (s, voto, commento) => {
      const attrs = { voto, tipo, data: vvDataOf(s), desc: titolo, commento, griglia: null, verificaEsercizi: null, verificaPercentuali: null };
      const existing = editingGroup?.rows.find(r => r.s.id === s.id)?.g;
      if (existing) DB.editGrade(s, existing.anno, existing.materia, existing.id, anno, materia, attrs);
      else DB.addGrade(s, anno, materia, attrs);
      changed.push(s);
    };
    if (vvState.pratico.modo === 'gruppo') {
      vvState.pratico.gruppi.forEach(g => {
        const voto = parseFloat(g.voto);
        if (!Number.isFinite(voto) || !g.studenti.length) return; // gruppo incompleto: salta
        const commento = g.commento.trim();
        stu.filter(s => g.studenti.includes(s.id)).forEach(s => salva(s, voto, commento));
      });
    } else {
      stu.forEach(s => {
        const voto = parseFloat(vvState.pratico.voti[s.id]);
        if (!Number.isFinite(voto)) return; // nessun voto per questo alunno: salta
        salva(s, voto, (vvState.pratico.commenti[s.id] || '').trim());
      });
    }
    if (!changed.length) { alert('Inserisci almeno un voto.'); return; }
  } else {
    if (!vvSommaMax()) { alert('Imposta un punteggio massimo maggiore di zero per almeno un esercizio.'); return; }
    stu.forEach(s => {
      const voto = vvVotoFinale(s);
      if (voto == null) return; // né percentuali né griglia per questo alunno: salta
      const parti = [];
      if (vvHasPercentuali(s)) {
        const pcts = vvState.percentuali[s.id];
        parti.push(vvState.esercizi.map((e, i) => `Es.${i + 1}: ${parseFloat(pcts[e.id]) || 0}%`).join(', '));
      }
      let griglia = null;
      if (vvHasGriglia(s)) {
        const dettaglioGriglia = vvState.esercizi
          .map((e, i) => ({ e, i }))
          .filter(({ e }) => vvHasGrigliaEs(s, e.id))
          .map(({ e, i }) => { const g = vvState.griglia[s.id][e.id]; return `Es.${i + 1} A=${g.a || 0} B=${g.b || 0} C=${g.c || 0}`; })
          .join(', ');
        parti.push(`Griglia: ${dettaglioGriglia}`);
        griglia = vvState.esercizi.map(e => vvState.griglia[s.id]?.[e.id] || { a: '', b: '', c: '' });
      }
      const verificaEsercizi = vvState.esercizi.map(e => ({ max: e.max }));
      const verificaPercentuali = vvHasPercentuali(s) ? vvState.esercizi.map(e => vvState.percentuali[s.id]?.[e.id] ?? '') : null;
      const attrs = { voto, tipo, data: vvDataOf(s), desc: titolo, commento: parti.join(' · '), griglia, verificaEsercizi, verificaPercentuali };

      const existing = editingGroup?.rows.find(r => r.s.id === s.id)?.g;
      if (existing) DB.editGrade(s, existing.anno, existing.materia, existing.id, anno, materia, attrs);
      else DB.addGrade(s, anno, materia, attrs);
      changed.push(s);
    });
    if (!changed.length) { alert('Inserisci almeno un punteggio (percentuale o griglia).'); return; }
  }

  try {
    await DB.putMany(changed);
    const savedKey = verificaKeyOf({ desc: titolo }, classe);
    vvState = newVVState();
    document.getElementById('vv-titolo').value = '';
    state.vfSelectedKey = savedKey; // resta sulla verifica appena salvata/aggiornata
    renderAll();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
}
document.getElementById('vv-save').addEventListener('click', saveVerifica);
document.getElementById('vv-save-pratico').addEventListener('click', saveVerifica);

// ── Rubriche valutative: libreria di griglie di valutazione riusabili ──
// Ogni indicatore ha un proprio min/max/step: alcuni indicatori (es. A e B
// della griglia di Matematica/Fisica/Informatica) non possono mai valere 0,
// altri (es. l'indicatore C della stessa griglia) sì — min riflette questo
// vincolo indicatore per indicatore, non è un limite unico per la rubrica.
// I "livelli" sono descrittori di riferimento (facoltativi) che aiutano a
// scegliere il punteggio da assegnare, non un elenco chiuso di valori.
function mkLivello(numero, descrizione, label) {
  return { id: DB.uid(), numero, label: label || '', descrizione: descrizione || '' };
}
function mkIndicatore(nome, min, max, step, livelli) {
  return { id: DB.uid(), nome, min, max, step, livelli: livelli || [] };
}
function mkRubrica(nome, indicatori) {
  return { id: DB.uid(), nome, indicatori };
}

// Le due rubriche di partenza allegate dall'utente: la griglia A/B/C di
// Matematica/Fisica/Informatica (PDF) e "Verifica semplificato" a 4
// dimensioni (CSV) — seminate una sola volta se la libreria è vuota.
function defaultRubriche() {
  return [
    mkRubrica('Griglia di valutazione di Matematica, Fisica e Informatica', [
      mkIndicatore('Indicatore A: Padronanza dei contenuti', 1, 4, 0.5, [
        mkLivello(1, 'Non ha alcuna padronanza dei contenuti disciplinari.', 'L1'),
        mkLivello(1.5, 'Ha scarsa padronanza dei contenuti disciplinari.', 'L2'),
        mkLivello(2, 'Padroneggia in modo superficiale i contenuti disciplinari.', 'L2'),
        mkLivello(2.5, 'Padroneggia in modo adeguato i contenuti disciplinari.', 'L3'),
        mkLivello(3, 'Padroneggia in modo completo i contenuti disciplinari.', 'L3'),
        mkLivello(3.5, 'Padroneggia in modo accurato e approfondito i contenuti disciplinari.', 'L4'),
        mkLivello(4, 'Padroneggia in modo ampio e molto approfondito i contenuti disciplinari.', 'L4'),
      ]),
      mkIndicatore('Indicatore B: Sviluppo ed elaborazione dei contenuti', 1, 4, 0.5, [
        mkLivello(1, 'Mostra capacità di sintesi e di rielaborazione nulle; non applica procedure e strategie corrette e pertinenti.', 'L1'),
        mkLivello(1.5, 'Mostra capacità di sintesi e di rielaborazione scarse; applica procedure e strategie non corrette né pertinenti.', 'L2'),
        mkLivello(2, 'Mostra capacità di sintesi e di rielaborazione parziali; applica procedure e strategie non sempre corrette e/o pertinenti.', 'L2'),
        mkLivello(2.5, 'Mostra capacità di sintesi e di rielaborazione quasi complete; applica procedure e strategie in modo quasi corretto.', 'L3'),
        mkLivello(3, 'Mostra complete capacità di sintesi e di rielaborazione; applica procedure e strategie in modo generalmente corretto.', 'L3'),
        mkLivello(3.5, 'Mostra capacità di sintesi e di rielaborazione complete; applica procedure e strategie corrette per la risoluzione.', 'L4'),
        mkLivello(4, 'Mostra capacità di sintesi e di rielaborazione complete ed esaurienti; applica procedure e strategie corrette e ottimali per la risoluzione.', 'L4'),
      ]),
      mkIndicatore('Indicatore C: Comunicazione dei contenuti', 0, 2, 0.25, [
        mkLivello(0, 'Non argomenta; non sviluppa il ragionamento in maniera comprensibile; comunica con linguaggio e simbolismo specifico assente o quasi, elaborazione scritta e grafica oscura o estremamente disordinata.', 'L1'),
        mkLivello(0.25, 'Argomenta in modo scarso; sviluppa il ragionamento in maniera molto confusa o molto superficiale; comunica con linguaggio e simbolismo specifico non adeguato, elaborazione e grafica scritta poco chiara e molto disordinata.', 'L1'),
        mkLivello(0.5, 'Argomenta in modo superficiale; sviluppa il ragionamento in maniera confusa o superficiale; comunica con linguaggio e simbolismo specifico non sempre adeguato e corretto, elaborazione scritta e grafica non sempre chiara e non molto ordinata.', 'L2'),
        mkLivello(0.75, 'Argomenta in modo parziale; sviluppa il ragionamento in maniera non sempre corretta; comunica con linguaggio e simbolismo specifico non sempre adeguato o corretto, elaborazione scritta e grafica non del tutto chiara e poco ordinata.', 'L2'),
        mkLivello(1, 'Argomenta in modo adeguato; sviluppa il ragionamento in maniera sostanzialmente corretta; comunica con linguaggio e simbolismo specifico adeguato pur con qualche incertezza, elaborazione scritta e grafica adeguatamente chiara e ordinata.', 'L3'),
        mkLivello(1.25, 'Argomenta in modo completo; sviluppa il ragionamento in maniera corretta; comunica con linguaggio e simbolismo specifico adeguato, elaborazione scritta e grafica chiara e ordinata.', 'L3'),
        mkLivello(1.5, 'Argomenta con padronanza; sviluppa il ragionamento in maniera quasi sempre completa ed esauriente; comunica con linguaggio e simbolismo specifico quasi sempre pertinente e corretto, elaborazione scritta e grafica molto chiara e ordinata.', 'L4'),
        mkLivello(2, 'Argomenta con padronanza; sviluppa il ragionamento in maniera completa ed esauriente; comunica con linguaggio e simbolismo specifico pertinente e corretto, elaborazione scritta e grafica estremamente chiara e ordinata.', 'L4'),
      ]),
    ]),
    mkRubrica('Verifica semplificato (4 dimensioni)', [
      mkIndicatore('Conoscenza dei contenuti', 1, 4, 1, [
        mkLivello(1, "L'alunno presenta gravi lacune nella conoscenza dei contenuti proposti", 'Insufficiente'),
        mkLivello(2, 'Conosce in maniera non solo mnemonica i contenuti proposti', 'Sufficiente'),
        mkLivello(3, 'Mostra una buona conoscenza dei contenuti proposti', 'Buono'),
        mkLivello(4, 'Mostra una conoscenza approfondita dei contenuti proposti', 'Avanzato'),
      ]),
      mkIndicatore('Comprensione del problema', 1, 4, 1, [
        mkLivello(1, 'Mostra gravi difficoltà a cogliere il nesso fra la teoria e il problema', 'Insufficiente'),
        mkLivello(2, 'Coglie il nesso tra la teoria studiata e il problema', 'Sufficiente'),
        mkLivello(3, "L'alunno conosce i concetti utili alla risoluzione del problema e utilizza una buona strategia per la risoluzione", 'Buono'),
        mkLivello(4, "L'alunno mostra una conoscenza perfetta della teoria e utilizza una strategia efficace per la risoluzione del problema", 'Avanzato'),
      ]),
      mkIndicatore('Correttezza degli svolgimenti', 1, 4, 1, [
        mkLivello(1, 'Svolgimento del problema approssimato e non chiaro, carente il lessico specifico', 'Insufficiente'),
        mkLivello(2, 'Corretta dal punto di vista formale nella risoluzione del problema, uso del lessico specifico non sempre corretto', 'Sufficiente'),
        mkLivello(3, 'Chiarezza e correttezza nella risoluzione del problema, buono uso del lessico specifico', 'Buono'),
        mkLivello(4, 'Risoluzione del problema appropriata, puntuale in ogni fase, uso di un lessico ricco e appropriato', 'Avanzato'),
      ]),
      mkIndicatore('Completezza', 1, 4, 1, [
        mkLivello(1, "L'alunno propone una risoluzione disorganizzata o errata", 'Insufficiente'),
        mkLivello(2, "L'alunno imposta in maniera un po' imprecisa la risoluzione del problema", 'Sufficiente'),
        mkLivello(3, "L'alunno presenta in maniera chiara e consequenziale la risoluzione del problema", 'Buono'),
        mkLivello(4, "L'alunno mostra completezza nella strategia risolutiva evidenziando contributi di riflessione personale", 'Avanzato'),
      ]),
    ]),
  ];
}
async function seedRubricheIfEmpty() {
  if (DB.getRubriche().length) return;
  await DB.saveRubriche(defaultRubriche());
}

// CSV quote-aware (gestisce virgole e "a capo" dentro campi tra virgolette,
// necessario per i descrittori multi-riga dei file di rubrica)
function parseCsvRows(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQuotes = false; }
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\r') { /* ignora: il \n che segue chiude comunque la riga */ }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field !== '' || row.length) { row.push(field); rows.push(row); }
  return rows;
}

// Formato "Dimensione/Livello" (come nei file allegati): prima colonna =
// nome indicatore, colonne successive = un livello ciascuna con intestazione
// "numero + etichetta" (es. "1 Insufficiente"), celle = descrittore
// testuale. I punti di ogni livello sono il numero in intestazione: se il
// più basso non è 0, quell'indicatore non potrà mai valere 0 nella griglia.
function parseRubricaCSV(text, nomeDefault) {
  const rows = parseCsvRows(text).map(r => r.map(c => c.trim())).filter(r => r.some(Boolean));
  const headerIdx = rows.findIndex(r => (r[0] || '').toLowerCase() === 'dimensione');
  if (headerIdx < 0) throw new Error('Intestazione "Dimensione" non trovata nel CSV.');
  const headerCells = rows[headerIdx].slice(1).filter(c => c !== '');
  const livelliHead = headerCells.map(cell => {
    const m = cell.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/s);
    return m ? { numero: parseFloat(m[1].replace(',', '.')), label: m[2].trim() } : { numero: 0, label: cell };
  });
  if (!livelliHead.length) throw new Error('Nessun livello trovato nell\'intestazione.');

  const indicatori = [];
  for (let i = headerIdx + 1; i < rows.length; i++) {
    const r = rows[i];
    const nome = (r[0] || '').trim();
    if (!nome || nome.toLowerCase() === 'tot') continue;
    const livelli = livelliHead.map((lh, li) => mkLivello(lh.numero, (r[li + 1] || '').replace(/\s+/g, ' ').trim(), lh.label));
    const numeri = livelli.map(l => l.numero);
    const min = Math.min(...numeri), max = Math.max(...numeri);
    const diffs = numeri.slice(1).map((n, idx) => n - numeri[idx]).filter(d => d > 0);
    const step = diffs.length ? Math.min(...diffs) : 1;
    indicatori.push(mkIndicatore(nome, min, max, step, livelli));
  }
  if (!indicatori.length) throw new Error('Nessun indicatore trovato nel CSV.');
  return mkRubrica(nomeDefault, indicatori);
}

function renderRubricheToggle() {
  document.getElementById('rub-schede-view').classList.toggle('hidden', state.rubricheView !== 'schede');
  document.getElementById('rub-elenco-view').classList.toggle('hidden', state.rubricheView !== 'elenco');
  document.querySelectorAll('#rubriche-view-toggle .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.rv === state.rubricheView));
}
document.querySelectorAll('#rubriche-view-toggle .seg-btn').forEach(btn => btn.addEventListener('click', () => {
  state.rubricheView = btn.dataset.rv;
  renderRubriche();
}));
function rubricaRowHtml(r) {
  return `<tr class="row-selectable ${state.rubricheSelected.has(r.id) ? 'selected' : ''}" data-id="${r.id}">
      <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
      <td>${escHtml(r.nome)}</td>
      <td>${r.indicatori.length} indicator${r.indicatori.length === 1 ? 'e' : 'i'}</td>
      <td class="vt-actions">
        <button class="grade-meet" data-pdf-rub="${r.id}" title="Scarica PDF">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="grade-edit" data-edit-rub="${r.id}" title="Modifica">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="grade-rm" data-rm-rub="${r.id}" title="Elimina">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </td>
    </tr>`;
}
function updateRubricheBulkBar() {
  const bar = document.getElementById('rubriche-bulk-bar');
  const n = state.rubricheSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('rubriche-sel-count').textContent = `${n} rubrich${n === 1 ? 'a' : 'e'} selezionat${n === 1 ? 'a' : 'e'}`;
}
function renderRubricheElenco(unsortedList) {
  const wrap = document.getElementById('rubriche-elenco-wrap');
  const visibleIds = new Set(unsortedList.map(r => r.id));
  [...state.rubricheSelected].forEach(id => { if (!visibleIds.has(id)) state.rubricheSelected.delete(id); });
  updateRubricheBulkBar();
  const allSel = unsortedList.length > 0 && unsortedList.every(r => state.rubricheSelected.has(r.id));
  const selAllBtn = document.getElementById('btn-rubriche-select-all');
  selAllBtn.classList.toggle('active', allSel);
  selAllBtn.title = allSel ? 'Deseleziona tutto' : 'Seleziona tutto';

  const list = sortRows('rubriche', unsortedList, {
    nome: r => r.nome, indicatori: r => r.indicatori.length,
  });
  wrap.innerHTML = `<table class="voti-table">
    <thead><tr>
      <th></th>
      <th class="sortable" data-sort="nome">Nome${sortIcon('rubriche', 'nome')}</th>
      <th class="sortable" data-sort="indicatori">Indicatori${sortIcon('rubriche', 'indicatori')}</th>
      <th></th>
    </tr></thead>
    <tbody>${list.map(rubricaRowHtml).join('')}</tbody>
  </table>`;

  wrap.querySelectorAll('tbody tr').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('[data-edit-rub]') || e.target.closest('[data-rm-rub]') || e.target.closest('[data-pdf-rub]')) return;
    const id = row.dataset.id;
    if (state.rubricheSelected.has(id)) state.rubricheSelected.delete(id);
    else state.rubricheSelected.add(id);
    row.classList.toggle('selected');
    updateRubricheBulkBar();
    const stillAll = unsortedList.length > 0 && unsortedList.every(r => state.rubricheSelected.has(r.id));
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
  wireSort(wrap, 'rubriche', renderRubriche);
}
document.getElementById('btn-rubriche-select-all').addEventListener('click', () => {
  const ids = DB.getRubriche().map(r => r.id);
  const allSel = ids.length > 0 && ids.every(id => state.rubricheSelected.has(id));
  if (allSel) ids.forEach(id => state.rubricheSelected.delete(id));
  else ids.forEach(id => state.rubricheSelected.add(id));
  renderRubriche();
});
document.getElementById('btn-rubriche-duplica-bulk').addEventListener('click', async () => {
  const ids = [...state.rubricheSelected];
  if (!ids.length) return;
  const list = DB.getRubriche();
  const copie = ids.map(id => {
    const r = list.find(x => x.id === id);
    if (!r) return null;
    return {
      ...JSON.parse(JSON.stringify(r)),
      id: DB.uid(),
      nome: r.nome + ' (copia)',
      indicatori: r.indicatori.map(ind => ({ ...ind, id: DB.uid() })),
    };
  }).filter(Boolean);
  try {
    await DB.saveRubriche([...list, ...copie]);
    state.rubricheSelected.clear();
    renderRubriche();
  } catch (err) { alert('Errore durante la duplicazione: ' + err.message); }
});
document.getElementById('btn-rubriche-elimina-bulk').addEventListener('click', async () => {
  const ids = [...state.rubricheSelected];
  if (!ids.length) return;
  const list = DB.getRubriche();
  const nomi = ids.map(id => list.find(r => r.id === id)).filter(Boolean).map(r => r.nome).join(', ');
  if (!confirm(`Eliminare ${ids.length} rubrich${ids.length === 1 ? 'a' : 'e'} (${nomi})?`)) return;
  try {
    await DB.saveRubriche(list.filter(r => !ids.includes(r.id)));
    state.rubricheSelected.clear();
    renderRubriche();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});
function renderRubriche() {
  const list = DB.getRubriche();
  document.getElementById('rubriche-count').textContent = `${list.length} rubrich${list.length === 1 ? 'a' : 'e'}`;
  document.getElementById('rubriche-empty').classList.toggle('hidden', !!list.length);
  renderRubricheToggle();
  renderRubricheElenco(list);
  document.getElementById('rubriche-list').innerHTML = list.map(r => `
    <div class="rub-card" data-id="${r.id}">
      <div class="rub-card-head">
        <h3>${escHtml(r.nome)}</h3>
        <div class="modal-actions">
          <button class="btn-icon" data-pdf-rub="${r.id}" title="Scarica PDF">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </button>
          <button class="btn-icon" data-edit-rub="${r.id}" title="Modifica">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn-icon btn-danger-ghost" data-rm-rub="${r.id}" title="Elimina">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
      <p class="rub-card-sub">${r.indicatori.length} indicator${r.indicatori.length === 1 ? 'e' : 'i'}</p>
      <div class="rub-indicatori">
        ${r.indicatori.map(ind => `
          <div class="rub-ind-chip">
            <span class="rub-ind-nome">${escHtml(ind.nome)}</span>
            <span class="stat-sub">${fmt(ind.min)}–${fmt(ind.max)}${ind.min > 0 ? ' · min non 0' : ''}</span>
          </div>`).join('')}
      </div>
    </div>`).join('');

  document.querySelectorAll('[data-pdf-rub]').forEach(b => b.addEventListener('click', () => exportRubricaPDF(list.find(r => r.id === b.dataset.pdfRub))));
  document.querySelectorAll('[data-edit-rub]').forEach(b => b.addEventListener('click', () => openRubricaModal(list.find(r => r.id === b.dataset.editRub))));
  document.querySelectorAll('[data-rm-rub]').forEach(b => b.addEventListener('click', async () => {
    const r = list.find(x => x.id === b.dataset.rmRub);
    if (!confirm(`Eliminare la rubrica "${r.nome}"?`)) return;
    try {
      await DB.saveRubriche(list.filter(x => x.id !== r.id));
      renderRubriche();
    } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
  }));
}
// Scarica una rubrica come PDF: una tabella per indicatore (Punteggio /
// Livello / Descrizione), con intestazione nome+range — mostra i livelli
// descrittivi (assenti dalla vista a card, che riporta solo il range) perché
// sono il contenuto utile da stampare/consultare durante una valutazione.
function exportRubricaPDF(r) {
  if (!r) return;
  if (!window.jspdf) { alert('Libreria PDF non caricata (ricarica la pagina).'); return; }
  const doc = new jspdf.jsPDF();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(16);
  doc.text(r.nome || 'Rubrica valutativa', 14, 16);
  let y = 24;
  r.indicatori.forEach(ind => {
    if (y > pageH - 40) { doc.addPage(); y = 16; }
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text(`${ind.nome || 'Indicatore'} (${fmt(ind.min)}–${fmt(ind.max)}${ind.min > 0 ? ', min non 0' : ''})`, 14, y);
    const livelli = [...(ind.livelli || [])].sort((a, b) => (a.numero ?? 0) - (b.numero ?? 0));
    if (!livelli.length) {
      doc.setFontSize(9);
      doc.setTextColor(140);
      doc.text('Nessun livello descrittivo definito.', 14, y + 6);
      y += 16;
      return;
    }
    doc.autoTable({
      startY: y + 4,
      head: [['Punteggio', 'Livello', 'Descrizione']],
      body: livelli.map(l => [fmt(l.numero), l.label || '', l.descrizione || '']),
      styles: { fontSize: 8, cellPadding: 2.5 },
      headStyles: { fillColor: [91, 155, 255] },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 35 } },
      margin: { left: 14, right: 14 },
    });
    y = doc.lastAutoTable.finalY + 10;
  });
  doc.save(`rubrica-${(r.nome || 'valutativa').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`);
}

// ── Modal rubrica: indicatori/livelli dinamici, editati su una copia di
// lavoro (rubricaDraft) finché non si salva ─────────────────────────
let rubricaDraft = null;
let rubricaEditingId = null;

function openRubricaModal(rubrica) {
  rubricaEditingId = rubrica ? rubrica.id : null;
  rubricaDraft = rubrica ? JSON.parse(JSON.stringify(rubrica)) : mkRubrica('', [mkIndicatore('', 0, 10, 1, [])]);
  document.getElementById('rubrica-title').textContent = rubrica ? 'Modifica rubrica' : 'Nuova rubrica';
  document.getElementById('rubrica-delete').classList.toggle('hidden', !rubrica);
  renderRubricaBody();
  document.getElementById('rubrica-overlay').classList.remove('hidden');
}
function closeRubricaModal() {
  document.getElementById('rubrica-overlay').classList.add('hidden');
  rubricaDraft = null; rubricaEditingId = null;
}
document.getElementById('btn-add-rubrica').addEventListener('click', () => openRubricaModal(null));
document.getElementById('rubrica-close').addEventListener('click', closeRubricaModal);
document.getElementById('rubrica-cancel').addEventListener('click', closeRubricaModal);
document.getElementById('rubrica-overlay').addEventListener('click', e => { if (e.target.id === 'rubrica-overlay') closeRubricaModal(); });

function renderIndicatoreBlock(ind, i) {
  return `
  <div class="rub-ind-block" data-i="${i}">
    <div class="vf-row">
      <label class="vf-label">Nome indicatore
        <input class="vf-input rub-ind-nome" data-i="${i}" value="${escHtml(ind.nome)}" placeholder="es. Indicatore A: Padronanza dei contenuti"/>
      </label>
      <button class="btn-icon" type="button" data-rm-ind="${i}" title="Rimuovi indicatore">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="rub-ind-mms">
      <label class="vf-label">Min<input class="vf-input rub-ind-min" data-i="${i}" type="number" step="0.25" value="${ind.min}"/></label>
      <label class="vf-label">Max<input class="vf-input rub-ind-max" data-i="${i}" type="number" step="0.25" value="${ind.max}"/></label>
      <label class="vf-label">Step<input class="vf-input rub-ind-step" data-i="${i}" type="number" step="0.05" value="${ind.step}"/></label>
    </div>
    ${ind.min > 0 ? `<p class="stat-sub">Punteggio minimo ${fmt(ind.min)}: questo indicatore non può mai valere 0.</p>` : ''}
    <div class="rub-livelli-list">
      ${ind.livelli.map((l, li) => `
        <div class="rub-liv-row">
          <input class="vf-input rub-liv-numero" data-i="${i}" data-li="${li}" type="number" step="0.25" value="${l.numero}" title="Punti"/>
          <input class="vf-input rub-liv-label" data-i="${i}" data-li="${li}" value="${escHtml(l.label)}" placeholder="Etichetta (es. Sufficiente)"/>
          <input class="vf-input rub-liv-desc" data-i="${i}" data-li="${li}" value="${escHtml(l.descrizione)}" placeholder="Descrittore"/>
          <button class="btn-icon" type="button" data-rm-liv="${i}|${li}" title="Rimuovi livello">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>`).join('')}
    </div>
    <button class="btn-ghost" type="button" data-add-liv="${i}" style="margin-top:4px">+ Livello</button>
  </div>`;
}

function renderRubricaBody() {
  const body = document.getElementById('rubrica-body');
  body.innerHTML = `
    <label class="vf-label">Nome rubrica
      <input class="vf-input" id="rub-nome" value="${escHtml(rubricaDraft.nome)}" placeholder="es. Griglia di valutazione di..."/>
    </label>
    <div id="rub-indicatori-list">
      ${rubricaDraft.indicatori.map((ind, i) => renderIndicatoreBlock(ind, i)).join('')}
    </div>
    <button class="btn-ghost" type="button" id="rub-add-indicatore" style="margin-top:8px">+ Indicatore</button>
  `;
  document.getElementById('rub-nome').addEventListener('input', e => { rubricaDraft.nome = e.target.value; });
  document.getElementById('rub-add-indicatore').addEventListener('click', () => {
    rubricaDraft.indicatori.push(mkIndicatore('', 0, 10, 1, []));
    renderRubricaBody();
  });
  wireRubricaBodyEvents();
}

function wireRubricaBodyEvents() {
  document.querySelectorAll('.rub-ind-nome').forEach(inp => inp.addEventListener('input', () => {
    rubricaDraft.indicatori[+inp.dataset.i].nome = inp.value;
  }));
  document.querySelectorAll('.rub-ind-min').forEach(inp => inp.addEventListener('change', () => {
    rubricaDraft.indicatori[+inp.dataset.i].min = parseFloat(inp.value) || 0;
    renderRubricaBody();
  }));
  document.querySelectorAll('.rub-ind-max').forEach(inp => inp.addEventListener('change', () => {
    rubricaDraft.indicatori[+inp.dataset.i].max = parseFloat(inp.value) || 0;
  }));
  document.querySelectorAll('.rub-ind-step').forEach(inp => inp.addEventListener('change', () => {
    rubricaDraft.indicatori[+inp.dataset.i].step = parseFloat(inp.value) || 1;
  }));
  document.querySelectorAll('[data-rm-ind]').forEach(btn => btn.addEventListener('click', () => {
    rubricaDraft.indicatori.splice(+btn.dataset.rmInd, 1);
    renderRubricaBody();
  }));
  document.querySelectorAll('[data-add-liv]').forEach(btn => btn.addEventListener('click', () => {
    rubricaDraft.indicatori[+btn.dataset.addLiv].livelli.push(mkLivello(0, '', ''));
    renderRubricaBody();
  }));
  document.querySelectorAll('.rub-liv-numero').forEach(inp => inp.addEventListener('input', () => {
    rubricaDraft.indicatori[+inp.dataset.i].livelli[+inp.dataset.li].numero = parseFloat(inp.value) || 0;
  }));
  document.querySelectorAll('.rub-liv-label').forEach(inp => inp.addEventListener('input', () => {
    rubricaDraft.indicatori[+inp.dataset.i].livelli[+inp.dataset.li].label = inp.value;
  }));
  document.querySelectorAll('.rub-liv-desc').forEach(inp => inp.addEventListener('input', () => {
    rubricaDraft.indicatori[+inp.dataset.i].livelli[+inp.dataset.li].descrizione = inp.value;
  }));
  document.querySelectorAll('[data-rm-liv]').forEach(btn => btn.addEventListener('click', () => {
    const [i, li] = btn.dataset.rmLiv.split('|').map(Number);
    rubricaDraft.indicatori[i].livelli.splice(li, 1);
    renderRubricaBody();
  }));
}

document.getElementById('rubrica-save').addEventListener('click', async () => {
  const nome = document.getElementById('rub-nome').value.trim();
  if (!nome) { alert('Inserisci un nome per la rubrica.'); return; }
  rubricaDraft.nome = nome;
  rubricaDraft.indicatori = rubricaDraft.indicatori.filter(ind => ind.nome.trim());
  if (!rubricaDraft.indicatori.length) { alert('Aggiungi almeno un indicatore con un nome.'); return; }
  const list = DB.getRubriche();
  const next = rubricaEditingId ? list.map(r => r.id === rubricaEditingId ? rubricaDraft : r) : [...list, rubricaDraft];
  try {
    await DB.saveRubriche(next);
    closeRubricaModal();
    renderRubriche();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});
document.getElementById('rubrica-delete').addEventListener('click', async () => {
  if (!rubricaEditingId) return;
  if (!confirm('Eliminare questa rubrica?')) return;
  try {
    await DB.saveRubriche(DB.getRubriche().filter(r => r.id !== rubricaEditingId));
    closeRubricaModal();
    renderRubriche();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Import rubrica da CSV (formato Dimensione/Livello) ───────────────
document.getElementById('btn-import-rubrica').addEventListener('click', () => document.getElementById('rubrica-csv-overlay').classList.remove('hidden'));
document.getElementById('rubrica-csv-close').addEventListener('click', () => document.getElementById('rubrica-csv-overlay').classList.add('hidden'));
document.getElementById('rubrica-csv-cancel').addEventListener('click', () => document.getElementById('rubrica-csv-overlay').classList.add('hidden'));
document.getElementById('rubrica-csv-choose').addEventListener('click', () => document.getElementById('rubrica-csv-file').click());
document.getElementById('rubrica-csv-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const text = await file.text();
    const nomeDefault = file.name.replace(/\.csv$/i, '');
    rubricaDraft = parseRubricaCSV(text, nomeDefault);
    rubricaEditingId = null;
    document.getElementById('rubrica-csv-overlay').classList.add('hidden');
    document.getElementById('rubrica-title').textContent = 'Nuova rubrica (da CSV)';
    document.getElementById('rubrica-delete').classList.add('hidden');
    renderRubricaBody();
    document.getElementById('rubrica-overlay').classList.remove('hidden');
  } catch (err) {
    alert('File non valido: ' + err.message);
  }
});

// ── BES: alunni con PDP/PEI, classificazioni + piano (strumenti/obiettivi) ──
function tipoLabel(profilo, code) {
  return (PROFILO_TIPI[profilo] || []).find(t => t.c === code)?.l || code;
}
// Rispetta gli stessi filtri Anno/Istituto/Classe delle altre viste (prima
// ignorava del tutto state.klass: il filtro Classe sembrava "non funzionare")
function besStudents() {
  return filteredNoSearch().filter(s => s.profilo === 'PDP' || s.profilo === 'PEI')
    .sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
}
// Classe coerente col filtro Anno attivo (se specifico), altrimenti l'ultima nota
function besClasseOf(s) {
  return state.year !== 'all' ? (classeOf(s, state.year) || '') : DB.classeCorrente(s);
}
function besFieldPreview(text) {
  return text ? escHtml(text) : '<span class="stat-sub">—</span>';
}
function renderBesToggle() {
  document.getElementById('bes-schede-view').classList.toggle('hidden', state.besView !== 'schede');
  document.getElementById('bes-elenco-view').classList.toggle('hidden', state.besView !== 'elenco');
  document.querySelectorAll('#bes-view-toggle .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.bv === state.besView));
}
document.querySelectorAll('#bes-view-toggle .seg-btn').forEach(btn => btn.addEventListener('click', () => {
  state.besView = btn.dataset.bv;
  renderBes();
}));
function besCardHtml(s) {
  const classe = besClasseOf(s);
  const tipi = toTipiArray(s.profiloTipo);
  const piano = s.besPiano || {};
  return `
    <div class="bes-card" data-id="${s.id}">
      <div class="bes-card-head">
        <div>
          <h3>${escHtml(s.cognome)} ${escHtml(s.nome)}${classe ? ` <span class="stat-sub">· ${escHtml(classe)}</span>` : ''}</h3>
          <div class="bes-chips">
            <span class="profilo-badge pb-${s.profilo.toLowerCase()}">${escHtml(s.profilo)}</span>
            ${tipi.map(c => `<span class="tipo-badge">${escHtml(tipoLabel(s.profilo, c))}</span>`).join('')}
          </div>
        </div>
        <button class="btn-ghost" data-edit-bes="${s.id}">Modifica piano</button>
      </div>
      <div class="bes-grid">
        <div class="bes-field"><span class="bes-field-label">Strumenti compensativi</span><p>${besFieldPreview(piano.compensativi)}</p></div>
        <div class="bes-field"><span class="bes-field-label">Strumenti dispensativi</span><p>${besFieldPreview(piano.dispensativi)}</p></div>
        <div class="bes-field"><span class="bes-field-label">Strumenti valutativi</span><p>${besFieldPreview(piano.valutativi)}</p></div>
        <div class="bes-field"><span class="bes-field-label">Obiettivi</span><p>${besFieldPreview(piano.obiettivi)}</p></div>
      </div>
    </div>`;
}
function renderBesSchede(list) {
  document.getElementById('bes-list').innerHTML = state.raggruppa.bes
    ? groupedCardPanels(list, besClasseOf, besCardHtml)
    : list.map(besCardHtml).join('');
  document.querySelectorAll('#bes-list [data-edit-bes]').forEach(b => b.addEventListener('click', () => openBesModal(list.find(s => s.id === b.dataset.editBes))));
}
function besRowHtml(s) {
  const classe = besClasseOf(s);
  const tipi = toTipiArray(s.profiloTipo);
  return `<tr class="row-selectable ${state.besSelected.has(s.id) ? 'selected' : ''}" data-id="${s.id}">
          <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
          <td>${escHtml(s.cognome)} ${escHtml(s.nome)}</td>
          <td>${escHtml(classe || '—')}</td>
          <td><span class="profilo-badge pb-${s.profilo.toLowerCase()}">${escHtml(s.profilo)}</span></td>
          <td>${tipi.map(c => `<span class="tipo-badge">${escHtml(tipoLabel(s.profilo, c))}</span>`).join(' ') || '<span class="stat-sub">—</span>'}</td>
          <td class="vt-actions">
            <button class="grade-edit" data-edit-bes="${s.id}" title="Modifica piano">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
          </td>
        </tr>`;
}
function updateBesBulkBar() {
  const bar = document.getElementById('bes-bulk-bar');
  const n = state.besSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('bes-sel-count').textContent = `${n} alunn${n === 1 ? 'o' : 'i'} selezionat${n === 1 ? 'o' : 'i'}`;
}
function renderBesElenco(list) {
  const wrap = document.getElementById('bes-elenco-wrap');
  const panel = wrap.closest('.table-panel');
  const groupsWrap = document.getElementById('bes-elenco-groups');
  const visibleIds = new Set(list.map(s => s.id));
  [...state.besSelected].forEach(id => { if (!visibleIds.has(id)) state.besSelected.delete(id); });
  updateBesBulkBar();
  const besAllSel = list.length > 0 && list.every(s => state.besSelected.has(s.id));
  const besSelAllBtn = document.getElementById('btn-bes-select-all');
  besSelAllBtn.classList.toggle('active', besAllSel);
  besSelAllBtn.title = besAllSel ? 'Deseleziona tutto' : 'Seleziona tutto';
  const besThead = `<th></th><th>Alunno</th><th>Classe</th><th>Profilo</th><th>Classificazione</th><th></th>`;
  let activeContainer;
  if (state.raggruppa.bes) {
    panel.classList.add('hidden');
    groupsWrap.classList.remove('hidden');
    groupsWrap.innerHTML = groupedTablePanels(list, besClasseOf, besThead, besRowHtml);
    activeContainer = groupsWrap;
  } else {
    panel.classList.remove('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    wrap.innerHTML = `<table class="voti-table"><thead><tr>${besThead}</tr></thead><tbody>${list.map(besRowHtml).join('')}</tbody></table>`;
    activeContainer = wrap;
  }
  activeContainer.querySelectorAll('[data-edit-bes]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openBesModal(list.find(s => s.id === b.dataset.editBes)); }));
  activeContainer.querySelectorAll('tbody tr').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('[data-edit-bes]')) return;
    const id = row.dataset.id;
    if (state.besSelected.has(id)) state.besSelected.delete(id);
    else state.besSelected.add(id);
    row.classList.toggle('selected');
    updateBesBulkBar();
    const stillAll = list.length > 0 && list.every(s => state.besSelected.has(s.id));
    const selAllBtn = document.getElementById('btn-bes-select-all');
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
}
document.getElementById('btn-bes-rimuovi-bulk').addEventListener('click', async () => {
  const ids = [...state.besSelected];
  if (!ids.length) return;
  if (!confirm(`Rimuovere PDP/PEI da ${ids.length} alunn${ids.length === 1 ? 'o' : 'i'}? Il piano personalizzato resta salvato ma l'alunno non risulterà più BES.`)) return;
  try {
    for (const id of ids) {
      const s = state.students.find(x => x.id === id);
      if (!s) continue;
      s.profilo = 'ND';
      s.profiloTipo = [];
      await DB.put(s);
    }
    state.besSelected.clear();
    renderAll();
  } catch (err) { alert('Errore durante la rimozione: ' + err.message); }
});
document.getElementById('btn-bes-select-all').addEventListener('click', () => {
  const ids = besStudents().map(s => s.id);
  const allSel = ids.length > 0 && ids.every(id => state.besSelected.has(id));
  if (allSel) ids.forEach(id => state.besSelected.delete(id));
  else ids.forEach(id => state.besSelected.add(id));
  renderBes();
});
function renderBes() {
  const list = besStudents();
  document.getElementById('bes-count').textContent = `${list.length} alunn${list.length === 1 ? 'o' : 'i'} con PDP/PEI`;
  document.getElementById('bes-empty').classList.toggle('hidden', !!list.length);
  syncRaggruppaBtn('bes');
  renderBesToggle();
  renderBesSchede(list);
  renderBesElenco(list);
}

let besEditingId = null;
// Checkbox tipologie dipendenti dal profilo scelto (stesso pattern del form
// Alunno): i codici sono specifici di PDP/PEI, non condivisi fra i due
function besSyncTipo(selectedTipi) {
  const selP = document.getElementById('bes-profilo');
  const wrapT = document.getElementById('bes-ptipo-wrap');
  const listT = document.getElementById('bes-ptipi-list');
  const tipi = PROFILO_TIPI[selP.value];
  wrapT.classList.toggle('hidden', !tipi);
  listT.innerHTML = tipi
    ? tipi.map(t => `
      <label class="mc-chk">
        <input type="checkbox" value="${t.c}" ${selectedTipi.includes(t.c) ? 'checked' : ''}/>
        <span>${escHtml(t.l)}</span>
      </label>`).join('')
    : '';
}
function openBesModal(s) {
  if (!s) return;
  besEditingId = s.id;
  const piano = s.besPiano || {};
  document.getElementById('bes-title').textContent = `Piano BES — ${s.cognome} ${s.nome}`;
  const selP = document.getElementById('bes-profilo');
  selP.innerHTML = Object.entries(PROFILI).map(([c, l]) => `<option value="${c}" ${(s.profilo || 'ND') === c ? 'selected' : ''}>${l}</option>`).join('');
  besSyncTipo(toTipiArray(s.profiloTipo));
  selP.onchange = () => besSyncTipo([]); // profilo cambiato: i codici del profilo precedente non hanno senso, si riparte da zero
  document.getElementById('bes-compensativi').value = piano.compensativi || '';
  document.getElementById('bes-dispensativi').value = piano.dispensativi || '';
  document.getElementById('bes-valutativi').value = piano.valutativi || '';
  document.getElementById('bes-obiettivi').value = piano.obiettivi || '';
  document.getElementById('bes-overlay').classList.remove('hidden');
}
function closeBesModal() { document.getElementById('bes-overlay').classList.add('hidden'); besEditingId = null; }
document.getElementById('bes-close').addEventListener('click', closeBesModal);
document.getElementById('bes-cancel').addEventListener('click', closeBesModal);
document.getElementById('bes-overlay').addEventListener('click', e => { if (e.target.id === 'bes-overlay') closeBesModal(); });
document.getElementById('bes-save').addEventListener('click', async () => {
  const s = state.students.find(x => x.id === besEditingId);
  if (!s) return;
  const profilo = document.getElementById('bes-profilo').value || 'ND';
  s.profilo = profilo;
  s.profiloTipo = profilo === 'ND' ? [] : [...document.querySelectorAll('#bes-ptipi-list input:checked')].map(i => i.value);
  s.besPiano = {
    compensativi: document.getElementById('bes-compensativi').value.trim(),
    dispensativi: document.getElementById('bes-dispensativi').value.trim(),
    valutativi: document.getElementById('bes-valutativi').value.trim(),
    obiettivi: document.getElementById('bes-obiettivi').value.trim(),
  };
  try {
    await DB.put(s);
    closeBesModal();
    renderAll();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});

// ── Bonus/Malus: piccoli riconoscimenti/note comportamentali per alunno,
// svincolati dai voti (stelline/teschietti/quadernetti). Il dato vive su
// s.bonusMalus (vedi db.js), quindi si salva con DB.put(s) come profilo/note.
const BM_TIPI = {
  stella: {
    label: 'Stellina', plural: 'stelline', color: 'var(--accent-amber)',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  },
  teschio: {
    label: 'Teschietto', plural: 'teschietti', color: 'var(--accent-red)',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C7 2 4 5.5 4 10c0 2.8 1.3 5 3 6.3V19a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2.7c1.7-1.3 3-3.5 3-6.3 0-4.5-3-8-8-8z"/><circle cx="9" cy="10.5" r="1.7" fill="currentColor" stroke="none"/><circle cx="15" cy="10.5" r="1.7" fill="currentColor" stroke="none"/></svg>',
  },
  quaderno: {
    label: 'Quadernetto', plural: 'quadernetti', color: 'var(--accent-blue)',
    icon: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="3" x2="8" y2="21"/><line x1="11" y1="8" x2="17" y2="8"/><line x1="11" y1="12" x2="17" y2="12"/><line x1="11" y1="16" x2="17" y2="16"/></svg>',
  },
};
const BM_RM_ICON = '<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
const BM_PLUS_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>';
const BM_MINUS_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>';

function bmCounts(s) {
  const arr = s.bonusMalus || [];
  return {
    stella: arr.filter(b => b.tipo === 'stella').length,
    teschio: arr.filter(b => b.tipo === 'teschio').length,
    quaderno: arr.filter(b => b.tipo === 'quaderno').length,
  };
}

function renderBonusMalus() {
  const list = filtered().sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
  document.getElementById('bm-count').textContent = `${list.length} alunn${list.length === 1 ? 'o' : 'i'}`;
  const wrap = document.getElementById('bm-wrap');
  const empty = document.getElementById('bm-empty');
  if (!list.length) { wrap.innerHTML = ''; empty.classList.remove('hidden'); return; }
  empty.classList.add('hidden');
  wrap.innerHTML = `
  <table class="voti-table bm-table">
    <thead><tr><th>Alunno</th><th>Stelline</th><th>Teschietti</th><th>Quadernetti</th></tr></thead>
    <tbody>${list.map(bmRowHtml).join('')}</tbody>
  </table>`;
  wireBonusMalusRows();
}

// Niente colonna "Azioni" a sé: i pulsantini +/- stanno in fondo a ciascuna
// colonna (compatti, non più di 8 elementi previsti per tipo). I pulsanti
// "aggiungi" a icona intera sono nella Scheda alunno (vedi renderAdBmSummary).
function bmRowHtml(s) {
  return `
  <tr data-sid="${s.id}">
    <td>${escHtml(s.cognome)} ${escHtml(s.nome)}</td>
    <td><div class="bm-icons-cell">${bmIconsCellHtml(s, 'stella')}</div></td>
    <td><div class="bm-icons-cell">${bmIconsCellHtml(s, 'teschio')}</div></td>
    <td><div class="bm-icons-cell">${bmIconsCellHtml(s, 'quaderno')}</div></td>
  </tr>`;
}

// Un'icona per elemento (non un numero): cliccandola compare accanto un
// piccolo popover inline con data e "x" per rimuovere solo quell'elemento —
// niente riga espansa, resta tutto dentro la stessa cella. Le icone stanno
// in una riga che va a capo (bm-icons-row); i pulsantini +/- sono in una
// riga separata (bm-icons-actions), spinta in fondo alla cella con
// margin-top:auto — così restano sempre allineati in basso, non subito
// dopo l'ultima icona quando le icone vanno a capo su più righe.
function bmIconsCellHtml(s, tipo) {
  const arr = (s.bonusMalus || []).filter(b => b.tipo === tipo).sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  const t = BM_TIPI[tipo];
  const icons = arr.map(b => `<span class="bm-icon-item" style="--bm-color:${t.color}" data-id="${b.id}" data-sid="${s.id}" data-date="${escHtml(b.data)}" title="${escHtml(fmtData(b.data))}">${t.icon}</span>`).join('');
  return `
    <div class="bm-icons-row">${icons}</div>
    <div class="bm-icons-actions">
      <button class="bm-mini-btn" data-add="${tipo}" data-sid="${s.id}" title="Aggiungi ${t.label.toLowerCase()}">${BM_PLUS_ICON}</button>
      <button class="bm-mini-btn" data-quickrm="${tipo}" data-sid="${s.id}" title="Rimuovi l'ultima aggiunta" ${arr.length ? '' : 'disabled'}>${BM_MINUS_ICON}</button>
    </div>`;
}

// Aggiorna in-place le tre celle a icone di un solo alunno dopo
// aggiunta/rimozione: evita di ridisegnare l'intera tabella (e quindi il
// contatore/l'ordinamento) per un singolo click.
function bmRefreshRow(sid) {
  const s = state.students.find(x => x.id === sid);
  if (!s) return;
  const row = document.querySelector(`#bm-wrap tr[data-sid="${sid}"]`);
  if (row) {
    const cells = row.querySelectorAll('.bm-icons-cell');
    ['stella', 'teschio', 'quaderno'].forEach((t, i) => { if (cells[i]) cells[i].innerHTML = bmIconsCellHtml(s, t); });
  }
  if (state.openId === sid) renderAdBmSummary(s); // riepilogo nell'header Scheda alunno, se è l'alunno aperto
}

function bmClosePopover() {
  document.querySelectorAll('.bm-icon-popover').forEach(p => p.remove());
  document.querySelectorAll('.bm-icon-item.active').forEach(el => el.classList.remove('active'));
}

// Delegazione sull'intero #bm-wrap: la tabella viene ricreata ad ogni
// render (innerHTML), ma il contenitore resta lo stesso, quindi il
// listener va agganciato una volta sola (altrimenti si accumulerebbe ad
// ogni renderBonusMalus() e ogni click scatterebbe più volte).
function wireBonusMalusRows() {
  const wrap = document.getElementById('bm-wrap');
  if (wrap.dataset.bmWired) return;
  wrap.dataset.bmWired = '1';
  wrap.addEventListener('click', async e => {
    const rm = e.target.closest('[data-rm]');
    if (rm) {
      bmClosePopover();
      const s = state.students.find(x => x.id === rm.dataset.sid);
      if (!s) return;
      DB.removeBonusMalus(s, rm.dataset.rm);
      await DB.put(s);
      bmRefreshRow(s.id);
      return;
    }
    const quickrm = e.target.closest('[data-quickrm]');
    if (quickrm) {
      const s = state.students.find(x => x.id === quickrm.dataset.sid);
      if (!s) return;
      const arr = (s.bonusMalus || []).filter(b => b.tipo === quickrm.dataset.quickrm).sort((a, b) => (a.data || '').localeCompare(b.data || ''));
      const last = arr[arr.length - 1];
      if (!last) return;
      bmClosePopover();
      DB.removeBonusMalus(s, last.id);
      await DB.put(s);
      bmRefreshRow(s.id);
      return;
    }
    const item = e.target.closest('.bm-icon-item');
    if (item) {
      const wasActive = item.classList.contains('active');
      bmClosePopover();
      if (wasActive) return; // era già aperto: il click lo ha solo richiuso
      item.classList.add('active');
      const pop = document.createElement('span');
      pop.className = 'bm-icon-popover';
      pop.innerHTML = `${escHtml(fmtData(item.dataset.date))}<span class="bm-chip-rm" data-rm="${item.dataset.id}" data-sid="${item.dataset.sid}" title="Rimuovi">${BM_RM_ICON}</span>`;
      item.after(pop);
      return;
    }
    const add = e.target.closest('[data-add]');
    if (add) {
      const s = state.students.find(x => x.id === add.dataset.sid);
      if (!s) return;
      bmClosePopover();
      DB.addBonusMalus(s, add.dataset.add);
      await DB.put(s);
      bmRefreshRow(s.id);
    }
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.bm-icon-item') && !e.target.closest('.bm-icon-popover')) bmClosePopover();
  });
}

// Riepilogo (icona+conteggio colorati) centrato fra i tab anno e i
// pulsanti, e pulsanti di aggiunta a icona intera incollati a "+ Voto" —
// due gruppi separati nella riga, non uno solo. La rimozione puntuale di
// un elemento resta nella sezione Bonus/Malus dedicata.
function renderAdBmSummary(s) {
  const el = document.getElementById('ad-bm-summary');
  const actionsEl = document.getElementById('ad-bm-actions');
  if (!el || !actionsEl) return;
  wireAdBmSummary();
  const c = bmCounts(s);
  el.innerHTML = ['stella', 'teschio', 'quaderno'].map(t => {
    const t2 = BM_TIPI[t];
    return `<span class="bm-summary-item" style="--bm-color:${t2.color}" title="${t2.label}">${t2.icon}${c[t]}</span>`;
  }).join('');
  // Pulsanti di aggiunta: l'icona del tipo stesso è il pulsante (come
  // l'originale colonna Azioni della tabella, da cui sono stati spostati
  // qui), non un generico "+" accanto al conteggio.
  actionsEl.innerHTML = ['stella', 'teschio', 'quaderno'].map(t => {
    const t2 = BM_TIPI[t];
    return `<button class="btn-icon" data-add="${t}" data-sid="${s.id}" title="Aggiungi ${t2.label.toLowerCase()}">${t2.icon}</button>`;
  }).join('');
}
function wireAdBmSummary() {
  const el = document.getElementById('ad-bm-actions');
  if (!el || el.dataset.bmWired) return;
  el.dataset.bmWired = '1';
  el.addEventListener('click', async e => {
    const add = e.target.closest('[data-add]');
    if (!add) return;
    const s = state.students.find(x => x.id === add.dataset.sid);
    if (!s) return;
    DB.addBonusMalus(s, add.dataset.add);
    await DB.put(s);
    renderAdBmSummary(s);
  });
}

// Chip "ogni 4" da affiancare al nome nel punteggio esercizi di Verifiche:
// una chip per tipo con almeno 4 elementi, col numero di gruppi da 4 (non
// il totale grezzo, altrimenti perderebbe il senso di "traguardo ogni 4")
function bmScoreChipsHtml(s) {
  const c = bmCounts(s);
  return ['stella', 'teschio', 'quaderno'].map(t => {
    const n = Math.floor(c[t] / 4);
    if (!n) return '';
    const t2 = BM_TIPI[t];
    return `<span class="bm-score-chip" style="--bm-color:${t2.color}" title="${n * 4} ${t2.plural}">${t2.icon}</span>`;
  }).join('');
}

// ── Colloqui: orario di ricevimento (in Orario) + elenco appuntamenti ───
// L'orario ricorrente vive dentro l'orario del docente (uno slot con
// materia "Colloqui", classe vuota): niente schema a parte, e resta visibile
// anche nella vista Orario. I singoli appuntamenti (data specifica, alunno,
// partecipanti, note) sono invece un pacchetto per anno scolastico a sé.
function renderColloquioSlots() {
  const anno = state.year !== 'all' ? state.year : DB.currentAnno();
  const { slots } = DB.getOrario(anno);
  const collSlots = slots.filter(sl => sl.materia === 'Colloqui');
  const list = document.getElementById('coll-slots-list');
  list.innerHTML = collSlots.length ? collSlots.map(sl => `
    <div class="coll-slot-row" data-id="${sl.id}">
      <span>${escHtml(GIORNI_ORARIO[sl.giorno - 1] || '?')} · ${sl.ora}ª ora</span>
      <button class="btn-icon" type="button" data-rm-slot="${sl.id}" title="Rimuovi orario di ricevimento">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>`).join('') : '<p class="stat-sub">Nessun orario di ricevimento impostato.</p>';

  const giorni = giorniAttivi(anno);
  document.getElementById('coll-slot-giorno').innerHTML = giorni.map((g, i) => `<option value="${i + 1}">${g}</option>`).join('');
  document.getElementById('coll-slot-ora').innerHTML = [...Array(ORE_MAX)].map((_, i) => `<option value="${i + 1}">${i + 1}ª</option>`).join('');
  const daEl = document.getElementById('coll-slot-da');
  if (!daEl.value) daEl.value = todayISO();

  list.querySelectorAll('[data-rm-slot]').forEach(btn => btn.addEventListener('click', async () => {
    try { await DB.setOrarioSlots(anno, slots.filter(sl => sl.id !== btn.dataset.rmSlot)); renderAll(); }
    catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
  }));
}
// Tutte le date fra da/a (incluse) che cadono nel giorno della settimana dato
function datesInRangeForGiorno(daISO, aISO, giorno) {
  const out = [];
  let d = new Date(daISO + 'T00:00:00');
  const end = new Date(aISO + 'T00:00:00');
  if (isNaN(d) || isNaN(end)) return out;
  while (d <= end) {
    const iso = toISO(d);
    if (isoDayGiorno(iso) === giorno) out.push(iso);
    d = addDays(d, 1);
  }
  return out;
}
document.getElementById('coll-slot-add').addEventListener('click', async () => {
  const anno = state.year !== 'all' ? state.year : DB.currentAnno();
  const giorno = +document.getElementById('coll-slot-giorno').value;
  const ora = +document.getElementById('coll-slot-ora').value;
  const da = document.getElementById('coll-slot-da').value;
  const a = document.getElementById('coll-slot-a').value;
  if (!da || !a) { alert('Imposta il periodo (dal / al) per generare gli appuntamenti.'); return; }
  if (da > a) { alert('"Dal" deve precedere "al".'); return; }
  const { slots, periodi } = DB.getOrario(anno);
  const existing = slots.find(sl => sl.giorno === giorno && sl.ora === ora);
  if (existing && existing.materia !== 'Colloqui') {
    alert('In quell\'ora c\'è già una lezione in orario: liberala prima da Orario.');
    return;
  }
  try {
    if (!existing) await DB.setOrarioSlots(anno, [...slots, { id: DB.uid(), giorno, ora, materia: 'Colloqui', classe: '' }]);

    const dates = datesInRangeForGiorno(da, a, giorno);
    if (!dates.length) { alert('Nessuna data trovata in quel periodo per il giorno selezionato.'); renderAll(); return; }
    const oraLabel = periodi[ora]?.inizio || '';
    const perAnno = {};
    dates.forEach(iso => {
      const dAnno = annoFromData(iso);
      if (DB.getColloqui(dAnno).some(c => c.data === iso && c.ora === oraLabel)) return; // già generato
      (perAnno[dAnno] ||= []).push({ data: iso, ora: oraLabel, studenteId: '', partecipanti: '', note: '' });
    });
    const nuovi = Object.values(perAnno).reduce((n, arr) => n + arr.length, 0);
    if (nuovi) await DB.addColloquiBulk(perAnno);
    renderAll();
    alert(nuovi ? `Creati ${nuovi} appuntamenti disponibili tra ${fmtData(da)} e ${fmtData(a)}.` : 'Gli appuntamenti per quel periodo erano già stati generati.');
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});

function colloquiRows() {
  const anni = state.year !== 'all' ? [state.year] : [...new Set([...allYears(), ...DB.getColloquiAnni()])];
  const rows = [];
  anni.forEach(anno => DB.getColloqui(anno).forEach(c => rows.push({ anno, c })));
  return rows.sort((a, b) => (a.c.data + (a.c.ora || '')).localeCompare(b.c.data + (b.c.ora || '')));
}
function renderColloqui() {
  renderColloquioSlots();
  const rows = colloquiRows();
  document.getElementById('colloqui-count').textContent = `${rows.length} colloqui${rows.length === 1 ? 'o' : ''}`;
  document.getElementById('colloqui-empty').classList.toggle('hidden', !!rows.length);
  syncRaggruppaBtn('colloqui');
  const colloquioRowHtml = ({ anno, c }) => {
    const s = state.students.find(x => x.id === c.studenteId);
    const classe = s ? (classeOf(s, anno) || '') : '';
    const note = richToPlainText(c.note);
    const key = anno + '|' + c.id;
    return `<tr class="row-selectable ${state.colloquiSelected.has(key) ? 'selected' : ''}" data-anno="${escHtml(anno)}" data-id="${c.id}" data-key="${escHtml(key)}">
            <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
            <td class="vt-mono">${fmtData(c.data)}</td>
            <td class="vt-mono">${escHtml(c.ora || '—')}</td>
            <td class="name-open" data-anno="${escHtml(anno)}" data-id="${c.id}" title="Apri">${s ? escHtml(s.cognome) + ' ' + escHtml(s.nome) : '<span class="stat-sub">—</span>'}</td>
            <td>${escHtml(classe || '—')}</td>
            <td>${escHtml(c.partecipanti || '—')}</td>
            <td class="stat-sub" title="${escHtml(note)}">${escHtml(note.length > 40 ? note.slice(0, 40) + '…' : note)}</td>
            <td class="vt-actions">
              ${c.meetLink ? `<a class="grade-meet" href="${escHtml(c.meetLink)}" target="_blank" rel="noopener" title="Apri link Meet" onclick="event.stopPropagation()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10l5-3v10l-5-3"/><rect x="1" y="6" width="14" height="12" rx="2"/></svg>
              </a>` : ''}
              <button class="grade-edit" data-anno="${escHtml(anno)}" data-id="${c.id}" title="Modifica">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="grade-rm" data-anno="${escHtml(anno)}" data-id="${c.id}" title="Elimina colloquio">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </td>
          </tr>`;
  };
  const colloquiWrap = document.getElementById('colloqui-wrap');
  const colloquiPanel = colloquiWrap.closest('.table-panel');
  const colloquiGroupsWrap = document.getElementById('colloqui-groups');
  const colloquiThead = `<th></th><th>Data</th><th>Ora</th><th>Alunno</th><th>Classe</th><th>Partecipanti</th><th>Note</th><th></th>`;
  const visibleKeys = new Set(rows.map(({ anno, c }) => anno + '|' + c.id));
  [...state.colloquiSelected].forEach(k => { if (!visibleKeys.has(k)) state.colloquiSelected.delete(k); });
  updateColloquiBulkBar();
  const colloquiAllSel = rows.length > 0 && rows.every(({ anno, c }) => state.colloquiSelected.has(anno + '|' + c.id));
  const colloquiSelAllBtn = document.getElementById('btn-colloqui-select-all');
  colloquiSelAllBtn.classList.toggle('active', colloquiAllSel);
  colloquiSelAllBtn.title = colloquiAllSel ? 'Deseleziona tutto' : 'Seleziona tutto';
  if (!rows.length) {
    colloquiWrap.innerHTML = ''; colloquiPanel.classList.add('hidden');
    colloquiGroupsWrap.classList.add('hidden'); colloquiGroupsWrap.innerHTML = '';
    return;
  }
  let activeContainer;
  if (state.raggruppa.colloqui) {
    colloquiPanel.classList.add('hidden');
    colloquiGroupsWrap.classList.remove('hidden');
    colloquiGroupsWrap.innerHTML = groupedTablePanels(rows, ({ anno, c }) => {
      const s = state.students.find(x => x.id === c.studenteId);
      return s ? classeOf(s, anno) : '';
    }, colloquiThead, colloquioRowHtml);
    activeContainer = colloquiGroupsWrap;
  } else {
    colloquiPanel.classList.remove('hidden');
    colloquiGroupsWrap.classList.add('hidden'); colloquiGroupsWrap.innerHTML = '';
    colloquiWrap.innerHTML = `<table class="voti-table"><thead><tr>${colloquiThead}</tr></thead><tbody>${rows.map(colloquioRowHtml).join('')}</tbody></table>`;
    activeContainer = colloquiWrap;
  }
  activeContainer.querySelectorAll('.grade-edit').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openColloquio(btn.dataset.anno, btn.dataset.id); }));
  activeContainer.querySelectorAll('.name-open').forEach(td => td.addEventListener('click', e => { e.stopPropagation(); openItemNote('colloquio', td.dataset.anno, td.dataset.id); }));
  activeContainer.querySelectorAll('.grade-rm').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    if (!confirm('Eliminare questo colloquio?')) return;
    try {
      const prevGcalEventId = DB.getColloqui(btn.dataset.anno).find(x => x.id === btn.dataset.id)?.gcalEventId;
      await DB.removeColloquio(btn.dataset.anno, btn.dataset.id);
      renderAll();
      if (prevGcalEventId) GCal.deleteEvent(prevGcalEventId);
    } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
  }));
  activeContainer.querySelectorAll('tr[data-key]').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('.grade-edit') || e.target.closest('.grade-rm') || e.target.closest('.grade-meet') || e.target.closest('.name-open')) return;
    const key = row.dataset.key;
    if (state.colloquiSelected.has(key)) state.colloquiSelected.delete(key);
    else state.colloquiSelected.add(key);
    row.classList.toggle('selected');
    updateColloquiBulkBar();
    const stillAll = rows.length > 0 && rows.every(({ anno, c }) => state.colloquiSelected.has(anno + '|' + c.id));
    const selAllBtn = document.getElementById('btn-colloqui-select-all');
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
}
function updateColloquiBulkBar() {
  const bar = document.getElementById('colloqui-bulk-bar');
  const n = state.colloquiSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('colloqui-sel-count').textContent = `${n} colloqui${n === 1 ? 'o' : ''} selezionat${n === 1 ? 'o' : 'i'}`;
}
document.getElementById('btn-colloqui-elimina-bulk').addEventListener('click', async () => {
  const keys = [...state.colloquiSelected].map(k => k.split('|'));
  if (!keys.length) return;
  if (!confirm(`Eliminare ${keys.length} colloqui${keys.length === 1 ? 'o' : ''}? L'azione è irreversibile.`)) return;
  try {
    const gcalIds = keys.map(([anno, id]) => DB.getColloqui(anno).find(x => x.id === id)?.gcalEventId).filter(Boolean);
    for (const [anno, id] of keys) await DB.removeColloquio(anno, id);
    state.colloquiSelected.clear();
    renderAll();
    gcalIds.forEach(gid => GCal.deleteEvent(gid));
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});
document.getElementById('btn-colloqui-select-all').addEventListener('click', () => {
  const keys = colloquiRows().map(({ anno, c }) => anno + '|' + c.id);
  const allSel = keys.length > 0 && keys.every(k => state.colloquiSelected.has(k));
  if (allSel) keys.forEach(k => state.colloquiSelected.delete(k));
  else keys.forEach(k => state.colloquiSelected.add(k));
  renderColloqui();
});

// ── Editor di testo ricco (Colloqui/Appuntamenti): titolo, elenchi puntati/
//    numerati, checkbox — stile Notion. Usa document.execCommand: deprecato
//    ma pienamente supportato nei browser Chromium (unico target di
//    quest'app). Il campo "note" passa da testo semplice a frammento HTML:
//    plainNoteToHtml() converte le note vecchie al primo utilizzo,
//    sanitizeRichHtml() filtra l'HTML prodotto dall'editor prima di salvarlo
//    (solo i tag/attributi in whitelist sopravvivono).
const RICH_ALLOWED_TAGS = new Set(['P', 'BR', 'B', 'STRONG', 'I', 'EM', 'UL', 'OL', 'LI', 'H3', 'DIV', 'INPUT']);
function sanitizeRichHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  (function walk(node) {
    [...node.childNodes].forEach(child => {
      if (child.nodeType === 1) {
        if (!RICH_ALLOWED_TAGS.has(child.tagName)) {
          while (child.firstChild) child.parentNode.insertBefore(child.firstChild, child);
          child.remove();
        } else {
          [...child.attributes].forEach(attr => {
            const keep = child.tagName === 'INPUT' && (attr.name === 'type' || attr.name === 'checked');
            if (!keep) child.removeAttribute(attr.name);
          });
          if (child.tagName === 'UL' && child.querySelector(':scope > li > input[type="checkbox"]')) child.className = 'chk-list';
          if (child.tagName === 'INPUT') child.setAttribute('contenteditable', 'false');
          walk(child);
        }
      } else if (child.nodeType !== 3) {
        child.remove();
      }
    });
  })(tmp);
  return tmp.innerHTML;
}
// Le note salvate prima dell'editor ricco erano testo semplice: le converte
// in HTML equivalente la prima volta che vengono riaperte (idempotente: se è
// già HTML — riconoscibile da un tag — la restituisce invariata)
function plainNoteToHtml(text) {
  if (!text) return '';
  if (/<[a-z][\s\S]*>/i.test(text)) return text;
  return text.split(/\n{2,}/).map(par => `<p>${escHtml(par).replace(/\n/g, '<br>')}</p>`).join('');
}
function richToolbarHtml(idPrefix) {
  return `
    <div class="rt-toolbar" data-target="${idPrefix}-editor">
      <button type="button" class="rt-btn" data-cmd="bold" title="Grassetto"><b>B</b></button>
      <button type="button" class="rt-btn" data-cmd="italic" title="Corsivo"><i>I</i></button>
      <button type="button" class="rt-btn" data-cmd="heading" title="Titolo">H</button>
      <button type="button" class="rt-btn" data-cmd="ul" title="Elenco puntato">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.3" fill="currentColor" stroke="none"/></svg>
      </button>
      <button type="button" class="rt-btn" data-cmd="ol" title="Elenco numerato">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="1" y="8" font-size="7" fill="currentColor" stroke="none">1</text><text x="1" y="14" font-size="7" fill="currentColor" stroke="none">2</text><text x="1" y="20" font-size="7" fill="currentColor" stroke="none">3</text></svg>
      </button>
      <button type="button" class="rt-btn" data-cmd="checklist" title="Checkbox">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><polyline points="8 12 11 15 16 9"/></svg>
      </button>
    </div>
    <div class="rt-editor" id="${idPrefix}-editor" contenteditable="true" data-placeholder="Scrivi qui…"></div>`;
}
function wireRichToolbar(idPrefix) {
  const editor = document.getElementById(idPrefix + '-editor');
  document.querySelectorAll(`.rt-toolbar[data-target="${idPrefix}-editor"] .rt-btn`).forEach(btn => {
    btn.addEventListener('click', () => {
      editor.focus();
      const cmd = btn.dataset.cmd;
      if (cmd === 'bold') document.execCommand('bold');
      else if (cmd === 'italic') document.execCommand('italic');
      else if (cmd === 'heading') document.execCommand('formatBlock', false, 'H3');
      else if (cmd === 'ul') document.execCommand('insertUnorderedList');
      else if (cmd === 'ol') document.execCommand('insertOrderedList');
      else if (cmd === 'checklist') document.execCommand('insertHTML', false,
        '<ul class="chk-list"><li><input type="checkbox" contenteditable="false"> nuovo elemento</li></ul><p></p>');
    });
  });
}
function setRichValue(idPrefix, note) { document.getElementById(idPrefix + '-editor').innerHTML = plainNoteToHtml(note); }
function getRichValue(idPrefix) { return sanitizeRichHtml(document.getElementById(idPrefix + '-editor').innerHTML); }
// Estrae il testo semplice da una nota HTML: per l'anteprima in tabella e
// per la descrizione dell'evento sincronizzato su Google Calendar (che non
// interpreta l'HTML) — una riga per blocco, gli elementi di lista diventano
// righe con un trattino. (.textContent ignora i confini tra elementi, quindi
// le "righe" vanno ricostruite scorrendo i blocchi di primo livello, non
// inserendo <br> nel DOM: non produrrebbero comunque newline in .textContent)
function richToPlainText(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  const lines = [];
  tmp.childNodes.forEach(node => {
    if (node.nodeType === 1 && (node.tagName === 'UL' || node.tagName === 'OL')) {
      node.querySelectorAll(':scope > li').forEach(li => {
        const t = li.textContent.trim();
        if (t) lines.push('- ' + t);
      });
    } else {
      const t = node.textContent.trim();
      if (t) lines.push(t);
    }
  });
  return lines.join('\n');
}

function colloquioFormBody(c) {
  const studentiOrdinati = state.students.slice().sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
  return `
    <div class="vf-row">
      <label class="vf-label">Data<input type="date" class="vf-input" id="cl-data" value="${escHtml(c.data || todayISO())}"/></label>
      <label class="vf-label">Ora<input type="time" class="vf-input" id="cl-ora" value="${escHtml(c.ora || '')}"/></label>
    </div>
    <label class="vf-label">Alunno
      <select class="vf-input" id="cl-studente">
        <option value="">— Seleziona —</option>
        ${studentiOrdinati.map(s => `<option value="${s.id}" ${c.studenteId === s.id ? 'selected' : ''}>${escHtml(s.cognome)} ${escHtml(s.nome)}${DB.classeCorrente(s) ? ` (${escHtml(DB.classeCorrente(s))})` : ''}</option>`).join('')}
      </select>
    </label>
    <label class="vf-label">Partecipanti<input class="vf-input" id="cl-partecipanti" placeholder="es. Madre, Padre" value="${escHtml(c.partecipanti || '')}"/></label>
    <label class="vf-label">Link Meet<input type="url" class="vf-input" id="cl-meet" placeholder="https://meet.google.com/…" value="${escHtml(c.meetLink || '')}"/></label>`;
}
let colloquioCtx = null;
function openColloquio(anno, id) {
  const c = DB.getColloqui(anno).find(x => x.id === id);
  if (!c) return;
  colloquioCtx = { anno, id };
  document.getElementById('colloquio-title').textContent = 'Modifica colloquio';
  document.getElementById('colloquio-body').innerHTML = colloquioFormBody(c);
  document.getElementById('colloquio-delete').classList.remove('hidden');
  document.getElementById('colloquio-overlay').classList.remove('hidden');
}
document.getElementById('btn-add-colloquio').addEventListener('click', () => {
  colloquioCtx = null;
  document.getElementById('colloquio-title').textContent = 'Nuovo colloquio';
  document.getElementById('colloquio-body').innerHTML = colloquioFormBody({ data: todayISO() });
  document.getElementById('colloquio-delete').classList.add('hidden');
  document.getElementById('colloquio-overlay').classList.remove('hidden');
});
function closeColloquio() { document.getElementById('colloquio-overlay').classList.add('hidden'); colloquioCtx = null; }
document.getElementById('colloquio-close').addEventListener('click', closeColloquio);
document.getElementById('colloquio-cancel').addEventListener('click', closeColloquio);
document.getElementById('colloquio-overlay').addEventListener('click', e => { if (e.target.id === 'colloquio-overlay') closeColloquio(); });
// Sincronizza (in background, senza bloccare né condizionare il salvataggio
// locale già avvenuto) un colloquio con Google Calendar: crea/aggiorna
// l'evento gemello e, se cambia l'id, lo riporta sul record Firestore.
async function syncColloquioToGCal(anno, id, attrs, prevGcalEventId) {
  if (!GCal.hasToken()) return;
  const s = state.students.find(x => x.id === attrs.studenteId);
  const gcalEventId = await GCal.upsertEvent({
    gcalEventId: prevGcalEventId,
    title: 'Colloquio' + (s ? ' · ' + s.cognome + ' ' + s.nome : ''),
    dateISO: attrs.data, startTime: attrs.ora,
    description: [attrs.partecipanti && `Partecipanti: ${attrs.partecipanti}`, richToPlainText(attrs.note)].filter(Boolean).join('\n'),
    location: attrs.meetLink,
  });
  if (gcalEventId && gcalEventId !== prevGcalEventId) {
    await DB.updateColloquio(anno, id, { gcalEventId });
    if (state.view === 'colloqui' || state.view === 'calendario') renderView();
  }
}
document.getElementById('colloquio-save').addEventListener('click', async () => {
  const val = id => document.getElementById(id)?.value.trim() ?? '';
  const data = val('cl-data');
  if (!data) { alert('La data è obbligatoria.'); return; }
  const attrs = { data, ora: val('cl-ora'), studenteId: val('cl-studente'), partecipanti: val('cl-partecipanti'), meetLink: val('cl-meet') };
  const anno = annoFromData(data);
  try {
    // La nota si scrive dalla pagina dedicata (non da questo modale): va
    // preservata esplicitamente solo nel caso "cambio di A.S." (rimuovi +
    // ricrea), perché altrimenti "note" non specificata verrebbe azzerata da
    // _newColloquio. Nel caso "stesso A.S." l'update non tocca affatto "note"
    // (Object.assign aggiorna solo le chiavi presenti in attrs).
    const existing = colloquioCtx ? DB.getColloqui(colloquioCtx.anno).find(x => x.id === colloquioCtx.id) : null;
    const prevGcalEventId = existing?.gcalEventId || '';
    let targetId;
    if (colloquioCtx) {
      if (anno !== colloquioCtx.anno) {
        await DB.removeColloquio(colloquioCtx.anno, colloquioCtx.id);
        targetId = (await DB.addColloquio(anno, { ...attrs, note: existing?.note || '' })).id;
      } else {
        await DB.updateColloquio(colloquioCtx.anno, colloquioCtx.id, attrs);
        targetId = colloquioCtx.id;
      }
    } else {
      targetId = (await DB.addColloquio(anno, attrs)).id;
    }
    closeColloquio();
    renderAll();
    syncColloquioToGCal(anno, targetId, { ...attrs, note: existing?.note || '' }, prevGcalEventId);
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});
document.getElementById('colloquio-delete').addEventListener('click', async () => {
  if (!colloquioCtx) return;
  if (!confirm('Eliminare questo colloquio?')) return;
  try {
    const prevGcalEventId = DB.getColloqui(colloquioCtx.anno).find(x => x.id === colloquioCtx.id)?.gcalEventId;
    await DB.removeColloquio(colloquioCtx.anno, colloquioCtx.id);
    closeColloquio();
    renderAll();
    if (prevGcalEventId) GCal.deleteEvent(prevGcalEventId);
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Appuntamenti: collegi docenti, consigli di classe, incontri (anche
//    pomeridiani/online) — sezione a sé, separata dai Colloqui ──────────
function appuntamentiRows() {
  const anni = state.year !== 'all' ? [state.year] : [...new Set([...allYears(), ...DB.getAppuntamentiAnni()])];
  const rows = [];
  anni.forEach(anno => DB.getAppuntamenti(anno).forEach(a => rows.push({ anno, a })));
  return rows.sort((x, y) => (x.a.data + (x.a.ora || '')).localeCompare(y.a.data + (y.a.ora || '')));
}
function renderAppuntamenti() {
  const rows = appuntamentiRows();
  document.getElementById('appuntamenti-count').textContent = `${rows.length} appuntament${rows.length === 1 ? 'o' : 'i'}`;
  document.getElementById('appuntamenti-empty').classList.toggle('hidden', !!rows.length);
  const appuntamentoRowHtml = ({ anno, a }) => {
    const ora = a.oraFine ? `${a.ora || '—'}–${a.oraFine}` : (a.ora || '—');
    const oggetto = a.oggetto || TIPI_APPUNTAMENTO[a.tipo] || a.tipo;
    const oggettoShown = oggetto.length > 40 ? oggetto.slice(0, 40) + '…' : oggetto;
    const note = richToPlainText(a.note);
    return `<tr class="row-selectable ${state.appuntamentiSelected.has(anno + '|' + a.id) ? 'selected' : ''}" data-anno="${escHtml(anno)}" data-id="${a.id}" data-key="${escHtml(anno + '|' + a.id)}">
            <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
            <td class="vt-mono">${fmtData(a.data)}</td>
            <td class="vt-mono">${escHtml(ora)}</td>
            <td>${escHtml(TIPI_APPUNTAMENTO[a.tipo] || a.tipo)}</td>
            <td>${a.modalita === 'online' ? 'Online' : 'In presenza'}</td>
            <td>${escHtml(a.classe || '—')}</td>
            <td class="col-hide-m">${escHtml(a.luogo || '—')}</td>
            <td class="name-open" data-anno="${escHtml(anno)}" data-id="${a.id}" title="${escHtml([oggetto, note].filter(Boolean).join(' — '))}">${escHtml(oggettoShown)}</td>
            <td class="vt-actions">
              ${a.meetLink ? `<a class="grade-meet" href="${escHtml(a.meetLink)}" target="_blank" rel="noopener" title="Apri link Meet" onclick="event.stopPropagation()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 10l5-3v10l-5-3"/><rect x="1" y="6" width="14" height="12" rx="2"/></svg>
              </a>` : ''}
              <button class="grade-edit" data-anno="${escHtml(anno)}" data-id="${a.id}" title="Modifica">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="grade-rm" data-anno="${escHtml(anno)}" data-id="${a.id}" title="Elimina appuntamento">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </td>
          </tr>`;
  };
  const wrap = document.getElementById('appuntamenti-wrap');
  const panel = wrap.closest('.table-panel');
  const thead = `<th></th><th>Data</th><th>Ora</th><th>Tipo</th><th>Modalità</th><th>Classe</th><th class="col-hide-m">Luogo</th><th>Oggetto</th><th></th>`;
  const visibleKeys = new Set(rows.map(({ anno, a }) => anno + '|' + a.id));
  [...state.appuntamentiSelected].forEach(k => { if (!visibleKeys.has(k)) state.appuntamentiSelected.delete(k); });
  updateAppuntamentiBulkBar();
  const selAllBtn = document.getElementById('btn-appuntamenti-select-all');
  const allSel = rows.length > 0 && rows.every(({ anno, a }) => state.appuntamentiSelected.has(anno + '|' + a.id));
  selAllBtn.classList.toggle('active', allSel);
  selAllBtn.title = allSel ? 'Deseleziona tutto' : 'Seleziona tutto';
  if (!rows.length) { wrap.innerHTML = ''; panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');
  wrap.innerHTML = `<table class="voti-table"><thead><tr>${thead}</tr></thead><tbody>${rows.map(appuntamentoRowHtml).join('')}</tbody></table>`;
  wrap.querySelectorAll('.grade-edit').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openAppuntamento(btn.dataset.anno, btn.dataset.id); }));
  wrap.querySelectorAll('.name-open').forEach(td => td.addEventListener('click', e => { e.stopPropagation(); openItemNote('appuntamento', td.dataset.anno, td.dataset.id); }));
  wrap.querySelectorAll('.grade-rm').forEach(btn => btn.addEventListener('click', async e => {
    e.stopPropagation();
    if (!confirm('Eliminare questo appuntamento?')) return;
    try {
      const prevGcalEventId = DB.getAppuntamenti(btn.dataset.anno).find(x => x.id === btn.dataset.id)?.gcalEventId;
      await DB.removeAppuntamento(btn.dataset.anno, btn.dataset.id);
      renderAll();
      if (prevGcalEventId) GCal.deleteEvent(prevGcalEventId);
    } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
  }));
  wrap.querySelectorAll('tr[data-key]').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('.grade-edit') || e.target.closest('.grade-rm') || e.target.closest('.grade-meet') || e.target.closest('.name-open')) return;
    const key = row.dataset.key;
    if (state.appuntamentiSelected.has(key)) state.appuntamentiSelected.delete(key);
    else state.appuntamentiSelected.add(key);
    row.classList.toggle('selected');
    updateAppuntamentiBulkBar();
    const stillAll = rows.length > 0 && rows.every(({ anno, a }) => state.appuntamentiSelected.has(anno + '|' + a.id));
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
}
function updateAppuntamentiBulkBar() {
  const bar = document.getElementById('appuntamenti-bulk-bar');
  const n = state.appuntamentiSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('appuntamenti-sel-count').textContent = `${n} appuntament${n === 1 ? 'o' : 'i'} selezionat${n === 1 ? 'o' : 'i'}`;
}
document.getElementById('btn-appuntamenti-elimina-bulk').addEventListener('click', async () => {
  const keys = [...state.appuntamentiSelected].map(k => k.split('|'));
  if (!keys.length) return;
  if (!confirm(`Eliminare ${keys.length} appuntament${keys.length === 1 ? 'o' : 'i'}? L'azione è irreversibile.`)) return;
  try {
    const gcalIds = keys.map(([anno, id]) => DB.getAppuntamenti(anno).find(x => x.id === id)?.gcalEventId).filter(Boolean);
    for (const [anno, id] of keys) await DB.removeAppuntamento(anno, id);
    state.appuntamentiSelected.clear();
    renderAll();
    gcalIds.forEach(gid => GCal.deleteEvent(gid));
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});
document.getElementById('btn-appuntamenti-select-all').addEventListener('click', () => {
  const keys = appuntamentiRows().map(({ anno, a }) => anno + '|' + a.id);
  const allSel = keys.length > 0 && keys.every(k => state.appuntamentiSelected.has(k));
  if (allSel) keys.forEach(k => state.appuntamentiSelected.delete(k));
  else keys.forEach(k => state.appuntamentiSelected.add(k));
  renderAppuntamenti();
});

function appuntamentoFormBody(a) {
  return `
    <div class="vf-row">
      <label class="vf-label">Tipo
        <select class="vf-input" id="ap-tipo">
          ${Object.entries(TIPI_APPUNTAMENTO).map(([k, l]) => `<option value="${k}" ${a.tipo === k ? 'selected' : ''}>${escHtml(l)}</option>`).join('')}
        </select>
      </label>
      <label class="vf-label">Oggetto<input class="vf-input" id="ap-oggetto" placeholder="es. Scrutini primo quadrimestre" value="${escHtml(a.oggetto || '')}"/></label>
    </div>
    <div class="vf-row">
      <label class="vf-label">Data<input type="date" class="vf-input" id="ap-data" value="${escHtml(a.data || todayISO())}"/></label>
      <label class="vf-label">Ora inizio<input type="time" class="vf-input" id="ap-ora" value="${escHtml(a.ora || '')}"/></label>
      <label class="vf-label">Ora fine<input type="time" class="vf-input" id="ap-ora-fine" value="${escHtml(a.oraFine || '')}"/></label>
    </div>
    <div class="vf-row">
      <label class="vf-label">Modalità
        <select class="vf-input" id="ap-modalita">
          <option value="presenza" ${a.modalita !== 'online' ? 'selected' : ''}>In presenza</option>
          <option value="online" ${a.modalita === 'online' ? 'selected' : ''}>Online</option>
        </select>
      </label>
      <label class="vf-label">Classe (facoltativa)
        <input class="vf-input" id="ap-classe" list="ap-classi-list" value="${escHtml(a.classe || '')}"/>
        <datalist id="ap-classi-list">${allClasses(state.students, 'all', 'all').map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
      </label>
    </div>
    <div class="vf-row">
      <label class="vf-label">Luogo<input class="vf-input" id="ap-luogo" placeholder="es. Aula magna, Sala docenti" value="${escHtml(a.luogo || '')}"/></label>
      <label class="vf-label">Link Meet<input type="url" class="vf-input" id="ap-meet" placeholder="https://meet.google.com/…" value="${escHtml(a.meetLink || '')}"/></label>
    </div>`;
}
let appuntamentoCtx = null;
function openAppuntamento(anno, id) {
  const a = DB.getAppuntamenti(anno).find(x => x.id === id);
  if (!a) return;
  appuntamentoCtx = { anno, id };
  document.getElementById('appuntamento-title').textContent = 'Modifica appuntamento';
  document.getElementById('appuntamento-body').innerHTML = appuntamentoFormBody(a);
  document.getElementById('appuntamento-delete').classList.remove('hidden');
  document.getElementById('appuntamento-overlay').classList.remove('hidden');
}
document.getElementById('btn-add-appuntamento').addEventListener('click', () => {
  appuntamentoCtx = null;
  document.getElementById('appuntamento-title').textContent = 'Nuovo appuntamento';
  document.getElementById('appuntamento-body').innerHTML = appuntamentoFormBody({ data: todayISO(), tipo: 'incontro', modalita: 'presenza' });
  document.getElementById('appuntamento-delete').classList.add('hidden');
  document.getElementById('appuntamento-overlay').classList.remove('hidden');
});
function closeAppuntamento() { document.getElementById('appuntamento-overlay').classList.add('hidden'); appuntamentoCtx = null; }
document.getElementById('appuntamento-close').addEventListener('click', closeAppuntamento);
document.getElementById('appuntamento-cancel').addEventListener('click', closeAppuntamento);
document.getElementById('appuntamento-overlay').addEventListener('click', e => { if (e.target.id === 'appuntamento-overlay') closeAppuntamento(); });
// Sincronizza (in background, senza bloccare né condizionare il salvataggio
// locale già avvenuto) un appuntamento con Google Calendar: crea/aggiorna
// l'evento gemello e, se cambia l'id, lo riporta sul record Firestore.
async function syncAppuntamentoToGCal(anno, id, attrs, prevGcalEventId) {
  if (!GCal.hasToken()) return;
  const gcalEventId = await GCal.upsertEvent({
    gcalEventId: prevGcalEventId,
    title: (TIPI_APPUNTAMENTO[attrs.tipo] || attrs.tipo) + (attrs.oggetto ? ' · ' + attrs.oggetto : ''),
    dateISO: attrs.data, startTime: attrs.ora, endTime: attrs.oraFine,
    description: [attrs.classe && `Classe: ${attrs.classe}`, attrs.modalita === 'online' ? 'Online' : 'In presenza', richToPlainText(attrs.note)].filter(Boolean).join('\n'),
    location: attrs.modalita === 'online' ? (attrs.meetLink || attrs.luogo) : (attrs.luogo || attrs.meetLink),
  });
  if (gcalEventId && gcalEventId !== prevGcalEventId) {
    await DB.updateAppuntamento(anno, id, { gcalEventId });
    if (state.view === 'appuntamenti' || state.view === 'calendario') renderView();
  }
}
document.getElementById('appuntamento-save').addEventListener('click', async () => {
  const val = id => document.getElementById(id)?.value.trim() ?? '';
  const data = val('ap-data');
  if (!data) { alert('La data è obbligatoria.'); return; }
  const attrs = {
    tipo: val('ap-tipo') || 'incontro', data, ora: val('ap-ora'), oraFine: val('ap-ora-fine'),
    modalita: val('ap-modalita') || 'presenza', classe: val('ap-classe'), oggetto: val('ap-oggetto'),
    luogo: val('ap-luogo'), meetLink: val('ap-meet'),
  };
  const anno = annoFromData(data);
  try {
    // La nota si scrive dalla pagina dedicata (non da questo modale): va
    // preservata esplicitamente solo nel caso "cambio di A.S." (rimuovi +
    // ricrea); nel caso "stesso A.S." l'update non tocca "note" (Object.assign
    // aggiorna solo le chiavi presenti in attrs).
    const existing = appuntamentoCtx ? DB.getAppuntamenti(appuntamentoCtx.anno).find(x => x.id === appuntamentoCtx.id) : null;
    const prevGcalEventId = existing?.gcalEventId || '';
    let targetId;
    if (appuntamentoCtx) {
      if (anno !== appuntamentoCtx.anno) {
        await DB.removeAppuntamento(appuntamentoCtx.anno, appuntamentoCtx.id);
        targetId = (await DB.addAppuntamento(anno, { ...attrs, note: existing?.note || '' })).id;
      } else {
        await DB.updateAppuntamento(appuntamentoCtx.anno, appuntamentoCtx.id, attrs);
        targetId = appuntamentoCtx.id;
      }
    } else {
      targetId = (await DB.addAppuntamento(anno, attrs)).id;
    }
    closeAppuntamento();
    renderAll();
    syncAppuntamentoToGCal(anno, targetId, { ...attrs, note: existing?.note || '' }, prevGcalEventId);
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});
document.getElementById('appuntamento-delete').addEventListener('click', async () => {
  if (!appuntamentoCtx) return;
  if (!confirm('Eliminare questo appuntamento?')) return;
  try {
    const prevGcalEventId = DB.getAppuntamenti(appuntamentoCtx.anno).find(x => x.id === appuntamentoCtx.id)?.gcalEventId;
    await DB.removeAppuntamento(appuntamentoCtx.anno, appuntamentoCtx.id);
    closeAppuntamento();
    renderAll();
    if (prevGcalEventId) GCal.deleteEvent(prevGcalEventId);
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Pagina Nota (Colloquio/Appuntamento): non modale, sostituisce il main
//    come "Scheda alunno"/"Scheda classe" — solo il testo libero (titolo,
//    elenchi, checkbox). I campi data/ora/ecc. restano nel modale compatto
//    sopra (icona matita), aperto da qui con "Modifica dati" ──────────────
function itemNoteRecord(ctx) {
  if (!ctx) return null;
  return ctx.kind === 'colloquio'
    ? DB.getColloqui(ctx.anno).find(x => x.id === ctx.id)
    : DB.getAppuntamenti(ctx.anno).find(x => x.id === ctx.id);
}
function openItemNote(kind, anno, id) {
  const rec = kind === 'colloquio' ? DB.getColloqui(anno).find(x => x.id === id) : DB.getAppuntamenti(anno).find(x => x.id === id);
  if (!rec) return;
  state.previousView = state.view === 'item-note' ? state.previousView : state.view;
  state.noteCtx = { kind, anno, id };
  setView('item-note');
}
function backFromItemNote() {
  state.noteCtx = null;
  state.view = state.previousView || 'colloqui';
  renderView();
}
document.getElementById('note-back').addEventListener('click', backFromItemNote);
document.getElementById('note-edit-props').addEventListener('click', () => {
  const ctx = state.noteCtx;
  if (!ctx) return;
  if (ctx.kind === 'colloquio') openColloquio(ctx.anno, ctx.id);
  else openAppuntamento(ctx.anno, ctx.id);
});
function renderItemNote() {
  const ctx = state.noteCtx;
  const rec = itemNoteRecord(ctx);
  if (!ctx || !rec) { backFromItemNote(); return; }
  let title, meta;
  if (ctx.kind === 'colloquio') {
    const s = state.students.find(x => x.id === rec.studenteId);
    title = s ? `${s.cognome} ${s.nome}` : 'Colloquio';
    meta = ['Colloquio', fmtData(rec.data), rec.ora, s ? classeOf(s, ctx.anno) : ''].filter(Boolean).join(' · ');
  } else {
    title = rec.oggetto || TIPI_APPUNTAMENTO[rec.tipo] || rec.tipo;
    meta = [TIPI_APPUNTAMENTO[rec.tipo] || rec.tipo, fmtData(rec.data), rec.oraFine ? `${rec.ora || '—'}–${rec.oraFine}` : rec.ora, rec.luogo].filter(Boolean).join(' · ');
  }
  document.getElementById('note-title').textContent = title;
  document.getElementById('note-meta').textContent = meta;
  document.getElementById('note-editor-wrap').innerHTML = richToolbarHtml('note');
  wireRichToolbar('note');
  setRichValue('note', rec.note);
}
document.getElementById('note-save').addEventListener('click', async () => {
  const ctx = state.noteCtx;
  if (!ctx) return;
  const note = getRichValue('note');
  try {
    if (ctx.kind === 'colloquio') {
      await DB.updateColloquio(ctx.anno, ctx.id, { note });
      const rec = DB.getColloqui(ctx.anno).find(x => x.id === ctx.id);
      syncColloquioToGCal(ctx.anno, ctx.id, rec, rec.gcalEventId);
    } else {
      await DB.updateAppuntamento(ctx.anno, ctx.id, { note });
      const rec = DB.getAppuntamenti(ctx.anno).find(x => x.id === ctx.id);
      syncAppuntamentoToGCal(ctx.anno, ctx.id, rec, rec.gcalEventId);
    }
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});

// ── Data helpers condivisi da Lezioni/Orario ─────────────────────────
// NB: mai .toISOString() su una data "solo giorno" — converte in UTC e in
// Italia (UTC+1/+2) sposta indietro di un giorno vicino alla mezzanotte
// locale. toISO legge sempre i componenti in ora locale.
function toISO(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayISO() { return toISO(new Date()); }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }
// Anno scolastico (settembre–agosto) a cui appartiene una data specifica
function annoFromData(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return DB.currentAnno();
  const y = d.getMonth() + 1 >= 9 ? d.getFullYear() : d.getFullYear() - 1;
  return `${y}/${String((y + 1) % 100).padStart(2, '0')}`;
}
const DOW_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
function dowLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return isNaN(d) ? '' : DOW_LABELS[(d.getDay() + 6) % 7];
}
// Salva una modifica inline (Lezioni/Compiti): se cambia la data e questa
// ricade in un altro anno scolastico, sposta il record nel pacchetto giusto
async function inlineUpdateLezione(anno, id, patch) {
  try {
    if (patch.data) {
      const newAnno = annoFromData(patch.data);
      if (newAnno !== anno) {
        const l = DB.getLezioni(anno).find(x => x.id === id);
        if (l) {
          await DB.removeLezione(anno, id);
          await DB.addLezione(newAnno, { ...l, ...patch });
        }
        renderAll();
        return;
      }
    }
    await DB.updateLezione(anno, id, patch);
    renderAll();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
}
function startOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}

// ── Vista Lezioni (registro, elenco/settimana/calendario, import CSV) ──
// Le lezioni sono salvate per anno scolastico (come i voti): con "Tutti gli
// anni" nel filtro si aggregano tutti gli anni conosciuti.
function lezioniRows() {
  const anni = state.year !== 'all' ? [state.year] : allYears();
  const rows = [];
  anni.forEach(anno => DB.getLezioni(anno).forEach(l => rows.push({ anno, l })));
  return rows.filter(({ anno, l }) => {
    if (state.klass !== 'all' && l.classe !== state.klass) return false;
    if (state.istituto !== 'all' && DB.istitutoOf(anno, l.classe) !== state.istituto) return false;
    if (state.filtroDa && l.data < state.filtroDa) return false;
    if (state.filtroA && l.data > state.filtroA) return false;
    return true;
  });
}
function lezioniRowsSorted() {
  return sortRows('lezioni', lezioniRows(), {
    data: r => r.l.data, ora: r => +r.l.ora || 0, classe: r => r.l.classe,
    materia: r => r.l.materia, argomento: r => r.l.argomento,
  });
}

function renderLezioni() {
  document.getElementById('lez-elenco-view').classList.toggle('hidden', state.lezView !== 'elenco');
  document.getElementById('lez-settimana-view').classList.toggle('hidden', state.lezView !== 'settimana');
  document.getElementById('lez-calendario-view').classList.toggle('hidden', state.lezView !== 'calendario');
  document.querySelectorAll('#lez-view-toggle .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.lv === state.lezView));
  document.getElementById('btn-lezioni-raggruppa').classList.toggle('hidden', state.lezView !== 'elenco');
  syncRaggruppaBtn('lezioni');

  const rows = lezioniRowsSorted();
  document.getElementById('lezioni-count').textContent = `${rows.length} lezion${rows.length === 1 ? 'e' : 'i'}`;

  if (state.lezView === 'elenco') renderLezioniElenco(rows);
  else if (state.lezView === 'settimana') renderLezioniSettimana();
  else renderLezioniCalendario();
}

function updateLezioniBulkBar() {
  const bar = document.getElementById('lezioni-bulk-bar');
  const n = state.lezioniSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('lezioni-sel-count').textContent = `${n} lezion${n === 1 ? 'e' : 'i'} selezionat${n === 1 ? 'a' : 'e'}`;
}

const DOW_ORDER_LEZ = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
// Le 4 dimensioni di raggruppamento offerte dal menu "Raggruppa" di Lezioni
const LEZ_GROUP_FIELDS = {
  classe: { get: r => r.l.classe },
  materia: { get: r => r.l.materia },
  giorno: { get: r => dowLabel(r.l.data), cmp: (a, b) => DOW_ORDER_LEZ.indexOf(a) - DOW_ORDER_LEZ.indexOf(b) },
  ora: { get: r => r.l.ora ? `${r.l.ora}ª ora` : '', cmp: (a, b) => (parseInt(a) || 0) - (parseInt(b) || 0) },
};
function renderLezioniElenco(rows) {
  const wrap = document.getElementById('lezioni-wrap');
  const empty = document.getElementById('lezioni-empty');
  const panel = wrap.closest('.table-panel');
  const groupsWrap = document.getElementById('lezioni-groups');

  const visibleKeys = new Set(rows.map(({ anno, l }) => anno + '|' + l.id));
  [...state.lezioniSelected].forEach(k => { if (!visibleKeys.has(k)) state.lezioniSelected.delete(k); });
  updateLezioniBulkBar();

  if (!rows.length) {
    wrap.innerHTML = ''; panel.classList.add('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const classiList = allClasses(state.students, 'all', 'all');
  const materieList = materieNamesLezioni();

  const lezioneRowHtml = ({ anno, l }) => {
    const key = anno + '|' + l.id;
    return `
      <tr class="lez-row ${state.lezioniSelected.has(key) ? 'selected' : ''}" data-anno="${escHtml(anno)}" data-id="${l.id}" data-key="${escHtml(key)}">
        <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
        <td><input type="date" class="vf-input lez-field" data-f="data" value="${escHtml(l.data)}"/></td>
        <td class="col-hide-m vt-mono">${dowLabel(l.data)}</td>
        <td class="col-hide-m"><input type="number" class="vf-input lez-field" data-f="ora" min="1" max="${ORE_MAX}" value="${escHtml(l.ora || '')}"/></td>
        <td><input class="vf-input lez-field" data-f="classe" list="lez-elenco-classi" value="${escHtml(l.classe || '')}"/></td>
        <td><input class="vf-input lez-field" data-f="materia" list="lez-elenco-materie" value="${escHtml(l.materia || '')}"/></td>
        <td class="col-hide-m"><input class="vf-input lez-field" data-f="argomento" value="${escHtml(l.argomento || '')}"/></td>
        <td class="vt-actions">
          <button class="grade-edit" data-anno="${escHtml(anno)}" data-id="${l.id}" title="Modifica (tutti i campi)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="grade-rm" data-anno="${escHtml(anno)}" data-id="${l.id}" title="Elimina lezione">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </td>
      </tr>`;
  };
  const lezioniThead = `
      <th></th>
      <th class="sortable" data-sort="data">Data${sortIcon('lezioni', 'data')}</th>
      <th class="col-hide-m">Giorno</th>
      <th class="col-hide-m sortable" data-sort="ora">Ora${sortIcon('lezioni', 'ora')}</th>
      <th class="sortable" data-sort="classe">Classe${sortIcon('lezioni', 'classe')}</th>
      <th class="sortable" data-sort="materia">Materia${sortIcon('lezioni', 'materia')}</th>
      <th class="col-hide-m sortable" data-sort="argomento">Argomento${sortIcon('lezioni', 'argomento')}</th>
      <th></th>`;
  const groupField = state.raggruppa.lezioni;
  const groupCfg = groupField ? LEZ_GROUP_FIELDS[groupField] : null;
  const datalistsHtml = `<datalist id="lez-elenco-classi">${classiList.map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
       <datalist id="lez-elenco-materie">${materieList.map(m => `<option value="${escHtml(m)}">`).join('')}</datalist>`;
  let activeContainer;
  if (groupField) {
    panel.classList.add('hidden');
    wrap.innerHTML = datalistsHtml;
    groupsWrap.classList.remove('hidden');
    groupsWrap.innerHTML = groupedTablePanels(rows, groupCfg.get, lezioniThead, lezioneRowHtml, 'lez-elenco-table', { compareFn: groupCfg.cmp, pageKeyPrefix: 'lezioni-' + groupField });
    activeContainer = groupsWrap;
  } else {
    panel.classList.remove('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    wrap.innerHTML = `<table class="voti-table lez-elenco-table"><thead><tr>${lezioniThead}</tr></thead><tbody>${rows.map(lezioneRowHtml).join('')}</tbody></table>` + datalistsHtml;
    activeContainer = wrap;
  }

  activeContainer.querySelectorAll('.lez-field').forEach(inp => inp.addEventListener('change', () => {
    const { anno, id } = inp.closest('tr').dataset;
    inlineUpdateLezione(anno, id, { [inp.dataset.f]: inp.value });
  }));
  activeContainer.querySelectorAll('.grade-edit').forEach(btn => btn.addEventListener('click', () => openLezione(btn.dataset.anno, btn.dataset.id)));
  activeContainer.querySelectorAll('.grade-rm').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Eliminare questa lezione?')) return;
    await DB.removeLezione(btn.dataset.anno, btn.dataset.id);
    renderAll();
  }));
  // Niente più checkbox: click sulla riga (fuori da campi/bottoni) seleziona,
  // come Alunni/Classi/Voti. In mobile espande invece di selezionare.
  activeContainer.querySelectorAll('.lez-row').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('.lez-field') || e.target.closest('.grade-edit') || e.target.closest('.grade-rm')) return;
    if (isMobileWidth()) { toggleRowExpand(row); return; }
    const key = row.dataset.key;
    if (state.lezioniSelected.has(key)) state.lezioniSelected.delete(key);
    else state.lezioniSelected.add(key);
    row.classList.toggle('selected');
    updateLezioniBulkBar();
  }));
  wireSort(activeContainer, 'lezioni', renderLezioni);
}

// Griglia come l'Orario: prima colonna sempre ora 1..ORE_MAX, colonne = giorni
// (mai la domenica; niente sabato se disattivato in Orario per quell'anno)
function renderLezioniSettimana() {
  if (!state.lezRefDate) state.lezRefDate = todayISO();
  const start = startOfWeek(state.lezRefDate);
  const anno = annoFromData(toISO(start));
  const numGiorni = giorniAttivi(anno).length;
  const days = [...Array(numGiorni)].map((_, i) => addDays(start, i));
  document.getElementById('lez-week-label').textContent =
    `${days[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} – ${days[days.length - 1].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const byDate = {};
  lezioniRows().forEach(({ anno: a, l }) => { (byDate[l.data] ||= []).push({ anno: a, l }); });
  const today = todayISO();

  // Appuntamenti (collegi/consigli di classe/incontri) della settimana mostrata:
  // non legati a un'ora di lezione, compaiono in una riga extra sopra la
  // griglia a periodi invece che in una cella (vedi sezione "Appuntamenti")
  const apptByDate = {};
  const daysSet = new Set(days.map(toISO));
  appuntamentiRows().forEach(({ anno, a: appt }) => { if (daysSet.has(appt.data)) (apptByDate[appt.data] ||= []).push({ anno, appt }); });
  const hasAppt = Object.keys(apptByDate).length > 0;

  // Griglia CSS (non <table>): con table-layout anche "fixed" un contenuto
  // interno senza vincoli (testo lungo di classe/materia) può comunque forzare
  // una colonna più larga delle altre — con minmax(0,1fr) sulle colonne-giorno
  // la larghezza uguale è garantita a prescindere dal contenuto.
  document.getElementById('lez-week-wrap').innerHTML = `
  <div class="week-grid" style="--week-cols:${days.length}">
    <div class="week-grid-head"></div>
    ${days.map(d => {
      const iso = toISO(d);
      return `<div class="week-grid-head ${iso === today ? 'week-today-head' : ''}">${DOW_LABELS[(d.getDay() + 6) % 7]} ${d.getDate()}</div>`;
    }).join('')}
    ${hasAppt ? `<div class="week-extra-label">Appunt.</div>${days.map(d => {
      const iso = toISO(d);
      const items = apptByDate[iso] || [];
      return `<div class="week-extra-cell">${items.map(({ anno: a, appt }) => `
          <div class="week-appt-chip" data-anno="${escHtml(a)}" data-id="${appt.id}" title="${escHtml(TIPI_APPUNTAMENTO[appt.tipo] || appt.tipo)}${appt.oggetto ? ' · ' + escHtml(appt.oggetto) : ''}">${appt.ora ? escHtml(appt.ora) + ' · ' : ''}${escHtml(TIPI_APPUNTAMENTO[appt.tipo] || appt.tipo)}</div>`).join('')}</div>`;
    }).join('')}` : ''}
    ${[...Array(ORE_MAX)].map((_, i) => {
      const ora = i + 1;
      const last = i === ORE_MAX - 1;
      return `<div class="week-ora-label ${last ? 'no-border' : ''}">${ora}ª</div>${days.map(d => {
        const iso = toISO(d);
        const cellRows = (byDate[iso] || []).filter(({ l }) => (+l.ora || 0) === ora);
        return `<div class="week-cell ${last ? 'no-border' : ''}">
            ${cellRows.map(({ anno: a, l }) => `
              <div class="lez-card" data-anno="${escHtml(a)}" data-id="${l.id}" style="--cls-color:${colorOfClasse(l.classe)}">
                <div class="lc-top">
                  <span class="lc-classe">${escHtml(l.classe || 'Lezione')}</span>
                  ${l.tipo ? `<span class="tipo-badge">${l.tipo === 'verifica' ? 'Verifica' : 'Interrogazione'}</span>` : ''}
                </div>
                ${l.materia ? `<div class="lc-materia-txt">${escHtml(l.materia)}</div>` : ''}
                ${l.argomento ? `<div class="lc-arg">${escHtml(l.argomento)}</div>` : ''}
              </div>`).join('')}
            ${!cellRows.length ? `<div class="week-add" data-date="${iso}" data-ora="${ora}">+</div>` : ''}
          </div>`;
      }).join('')}`;
    }).join('')}
  </div>`;

  document.querySelectorAll('#lez-week-wrap .lez-card').forEach(c =>
    c.addEventListener('click', () => openLezione(c.dataset.anno, c.dataset.id)));
  document.querySelectorAll('#lez-week-wrap .week-add').forEach(b =>
    b.addEventListener('click', () => openLezioneNew(b.dataset.date, b.dataset.ora)));
  document.querySelectorAll('#lez-week-wrap .week-appt-chip').forEach(c =>
    c.addEventListener('click', () => openAppuntamento(c.dataset.anno, c.dataset.id)));
  renderWeekNowLine();
}
// Linea rossa dell'ora corrente nella vista Settimana: usa le fasce orarie
// (inizio/fine per "ora") impostate in Orario per l'anno scolastico di oggi
// — non un'ora fissa, segue esattamente gli orari reali del docente. Visibile
// solo se oggi è nella settimana mostrata e l'ora attuale cade in una fascia
// oraria definita; funzione a sé (non solo dentro renderLezioniSettimana)
// così un intervallo può riposizionarla senza rifare tutta la griglia.
function renderWeekNowLine() {
  const grid = document.querySelector('#lez-week-wrap .week-grid');
  if (!grid || !state.lezRefDate) return;
  let line = grid.querySelector('.week-now-line');
  if (!line) { line = document.createElement('div'); line.className = 'week-now-line'; grid.appendChild(line); }

  const todayIso = todayISO();
  const start = startOfWeek(state.lezRefDate);
  const anno = annoFromData(toISO(start));
  const numGiorni = giorniAttivi(anno).length;
  const days = [...Array(numGiorni)].map((_, i) => addDays(start, i));
  if (!days.some(d => toISO(d) === todayIso)) { line.style.display = 'none'; return; }

  const { periodi } = DB.getOrario(annoFromData(todayIso));
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); };

  const labels = grid.querySelectorAll('.week-ora-label');
  let top = null;
  for (let ora = 1; ora <= ORE_MAX; ora++) {
    const p = periodi[ora];
    if (!p?.inizio || !p?.fine) continue;
    const startMin = toMin(p.inizio), endMin = toMin(p.fine);
    if (endMin <= startMin || nowMin < startMin || nowMin > endMin) continue;
    const rowEl = labels[ora - 1];
    if (!rowEl) continue;
    top = rowEl.offsetTop + ((nowMin - startMin) / (endMin - startMin)) * rowEl.offsetHeight;
    break;
  }
  line.style.display = top == null ? 'none' : 'block';
  if (top != null) line.style.top = top + 'px';
}
// Riposiziona la linea ogni minuto, solo se la vista Settimana è quella
// attiva (evita lavoro inutile quando si sta guardando un'altra sezione)
setInterval(() => {
  if (state.view === 'lezioni' && state.lezView === 'settimana') renderWeekNowLine();
}, 60000);

function renderLezioniCalendario() {
  if (!state.lezRefDate) state.lezRefDate = todayISO();
  const ref = new Date(state.lezRefDate + 'T00:00:00');
  const year = ref.getFullYear(), month = ref.getMonth();
  const label = ref.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  document.getElementById('lez-month-label').textContent = label.charAt(0).toUpperCase() + label.slice(1);

  const lezByDay = {};
  lezioniRows().forEach(({ l }) => { (lezByDay[l.data] ||= []).push({ tipo: 'lezione', l }); });
  // Appuntamenti (collegi/consigli di classe/incontri): stesse celle delle
  // lezioni, distinti per colore (vedi sezione "Appuntamenti")
  appuntamentiRows().forEach(({ a }) => { (lezByDay[a.data] ||= []).push({ tipo: 'appuntamento', a }); });

  // Stessi giorni "attivi" di Orario/Settimana: mai la domenica, niente
  // sabato se disattivato nelle impostazioni orario per quell'anno
  const anno = annoFromData(state.lezRefDate) || DB.currentAnno();
  const giorni = giorniAttivi(anno);
  const numCols = giorni.length;

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7; // 0=Lun, in settimane "normali" da 7 giorni
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gridStart = addDays(first, -startOffset);
  const totalWeeks = Math.ceil((startOffset + daysInMonth) / 7);
  const today = todayISO();
  const CAL_MAX_SHOWN = 5;

  const itemChipHtml = item => item.tipo === 'lezione'
    ? `<div class="cal-lesson" style="--cls-color:${colorOfClasse(item.l.classe)}" title="${escHtml([item.l.classe, item.l.materia, item.l.argomento].filter(Boolean).join(' · '))}">${escHtml([item.l.classe, item.l.materia, item.l.argomento].filter(Boolean).join(' · ') || '—')}</div>`
    : `<div class="cal-lesson" style="--cls-color:var(--accent-amber)" title="${escHtml(TIPI_APPUNTAMENTO[item.a.tipo] || item.a.tipo)}${item.a.oggetto ? ' · ' + escHtml(item.a.oggetto) : ''}">${item.a.ora ? escHtml(item.a.ora) + ' · ' : ''}${escHtml(TIPI_APPUNTAMENTO[item.a.tipo] || item.a.tipo)}</div>`;
  const dayCellHtml = d => {
    const iso = toISO(d);
    const dayItems = lezByDay[iso] || [];
    const shown = dayItems.slice(0, CAL_MAX_SHOWN);
    const extra = dayItems.length - shown.length;
    return `<div class="cal-day ${d.getMonth() !== month ? 'outside' : ''} ${iso === today ? 'today' : ''}" data-date="${iso}">
        <span class="cd-num">${d.getDate()}</span>
        <div class="cal-day-lessons">
          ${shown.map(itemChipHtml).join('')}
          ${extra > 0 ? `<div class="cal-lesson-more">+${extra} altr${extra === 1 ? 'a' : 'e'}</div>` : ''}
        </div>
      </div>`;
  };

  const grid = document.getElementById('lez-calendar-grid');
  grid.style.setProperty('--cal-cols', numCols);
  let cellsHtml = '';
  for (let w = 0; w < totalWeeks; w++) {
    for (let dow = 0; dow < numCols; dow++) cellsHtml += dayCellHtml(addDays(gridStart, w * 7 + dow));
  }
  grid.innerHTML = giorni.map(d => `<div class="cal-dow">${d}</div>`).join('') + cellsHtml;

  grid.querySelectorAll('.cal-day').forEach(cell => cell.addEventListener('click', () => {
    state.lezRefDate = cell.dataset.date;
    state.lezView = 'settimana';
    renderLezioni();
  }));
}

document.querySelectorAll('#lez-view-toggle .seg-btn').forEach(btn => btn.addEventListener('click', () => {
  state.lezView = btn.dataset.lv;
  renderLezioni();
}));
document.getElementById('lez-week-prev').addEventListener('click', () => {
  state.lezRefDate = toISO(addDays(startOfWeek(state.lezRefDate || todayISO()), -7));
  renderLezioniSettimana();
});
document.getElementById('lez-week-next').addEventListener('click', () => {
  state.lezRefDate = toISO(addDays(startOfWeek(state.lezRefDate || todayISO()), 7));
  renderLezioniSettimana();
});
document.getElementById('lez-week-today').addEventListener('click', () => {
  state.lezRefDate = todayISO();
  renderLezioniSettimana();
});
document.getElementById('lez-month-prev').addEventListener('click', () => {
  const d = new Date((state.lezRefDate || todayISO()) + 'T00:00:00'); d.setMonth(d.getMonth() - 1);
  state.lezRefDate = toISO(d); renderLezioniCalendario();
});
document.getElementById('lez-month-next').addEventListener('click', () => {
  const d = new Date((state.lezRefDate || todayISO()) + 'T00:00:00'); d.setMonth(d.getMonth() + 1);
  state.lezRefDate = toISO(d); renderLezioniCalendario();
});
document.getElementById('lez-month-today').addEventListener('click', () => {
  state.lezRefDate = todayISO();
  renderLezioniCalendario();
});

// ── Calendario: aggrega Colloqui + Appuntamenti (Settimana/Mese/Agenda),
//    filtrabile per tipo tramite la legenda a chip — MAI le Lezioni, che
//    hanno una propria vista Settimana/Calendario dedicata ──────────────
// Elenco normalizzato degli eventi visibili, in base ai filtri di stato.calFilters
// (indipendente da stato.calRefDate: solo Calendario la usa)
function calEventsFor(sources) {
  const rows = [];
  if (sources.colloqui) colloquiRows().forEach(({ anno, c }) => {
    const s = state.students.find(x => x.id === c.studenteId);
    rows.push({
      tipo: 'colloquio', anno, id: c.id, data: c.data, ora: c.ora || '', sortOra: c.ora || '',
      label: 'Colloquio' + (s ? ' · ' + s.cognome + ' ' + s.nome : ''),
      sub: c.partecipanti || '', color: 'var(--accent-blue)',
    });
  });
  if (sources.appuntamenti) appuntamentiRows().forEach(({ anno, a }) => rows.push({
    tipo: 'appuntamento', anno, id: a.id, data: a.data, ora: a.ora || '', sortOra: a.ora || '',
    label: TIPI_APPUNTAMENTO[a.tipo] || a.tipo,
    sub: a.oggetto || '', color: 'var(--accent-amber)',
  }));
  return rows.sort((x, y) => (x.data + x.sortOra).localeCompare(y.data + y.sortOra));
}
function openCalEvent(ev) {
  if (ev.tipo === 'colloquio') openColloquio(ev.anno, ev.id);
  else openAppuntamento(ev.anno, ev.id);
}
function renderCalendario() {
  document.getElementById('cal-settimana-view').classList.toggle('hidden', state.calView !== 'settimana');
  document.getElementById('cal-mese-view').classList.toggle('hidden', state.calView !== 'mese');
  document.getElementById('cal-agenda-view').classList.toggle('hidden', state.calView !== 'agenda');
  document.querySelectorAll('#cal-view-toggle .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.calv === state.calView));
  document.querySelectorAll('#cal-legend .cal-legend-chip').forEach(b => b.classList.toggle('active', state.calFilters[b.dataset.src]));
  if (state.calView === 'settimana') renderCalSettimana();
  else if (state.calView === 'mese') renderCalMese();
  else renderCalAgenda();
}
document.querySelectorAll('#cal-view-toggle .seg-btn').forEach(btn => btn.addEventListener('click', () => {
  state.calView = btn.dataset.calv;
  renderCalendario();
}));
document.querySelectorAll('#cal-legend .cal-legend-chip').forEach(btn => btn.addEventListener('click', () => {
  state.calFilters[btn.dataset.src] = !state.calFilters[btn.dataset.src];
  renderCalendario();
}));

function renderCalSettimana() {
  if (!state.calRefDate) state.calRefDate = todayISO();
  const start = startOfWeek(state.calRefDate);
  const anno = annoFromData(toISO(start));
  const numGiorni = giorniAttivi(anno).length;
  const days = [...Array(numGiorni)].map((_, i) => addDays(start, i));
  document.getElementById('cal-week-label').textContent =
    `${days[0].toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })} – ${days[days.length - 1].toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  const daysSet = new Set(days.map(toISO));
  const byDate = {};
  calEventsFor(state.calFilters).forEach(ev => { if (daysSet.has(ev.data)) (byDate[ev.data] ||= []).push(ev); });
  const today = todayISO();

  document.getElementById('cal-week-wrap').innerHTML = `
    <div class="cal-week-grid" style="--week-cols:${days.length}">
      ${days.map(d => {
        const iso = toISO(d);
        const items = byDate[iso] || [];
        return `<div class="cal-week-day ${iso === today ? 'today' : ''}">
          <div class="cal-week-day-head ${iso === today ? 'is-today' : ''}">${DOW_LABELS[(d.getDay() + 6) % 7]} ${d.getDate()}</div>
          ${items.map(ev => `<div class="cal-week-chip" style="--chip-color:${ev.color}" data-tipo="${ev.tipo}" data-anno="${escHtml(ev.anno)}" data-id="${ev.id}" title="${escHtml([ev.label, ev.sub].filter(Boolean).join(' · '))}">${ev.ora ? escHtml(ev.ora) + ' · ' : ''}${escHtml(ev.label)}</div>`).join('')}
          ${!items.length ? '<div class="cal-week-empty">—</div>' : ''}
        </div>`;
      }).join('')}
    </div>`;

  document.querySelectorAll('#cal-week-wrap .cal-week-chip').forEach(chip => chip.addEventListener('click', () =>
    openCalEvent({ tipo: chip.dataset.tipo, anno: chip.dataset.anno, id: chip.dataset.id })));
}

function renderCalMese() {
  if (!state.calRefDate) state.calRefDate = todayISO();
  const ref = new Date(state.calRefDate + 'T00:00:00');
  const year = ref.getFullYear(), month = ref.getMonth();
  const label = ref.toLocaleDateString('it-IT', { month: 'long', year: 'numeric' });
  document.getElementById('cal-month-label').textContent = label.charAt(0).toUpperCase() + label.slice(1);

  const byDay = {};
  calEventsFor(state.calFilters).forEach(ev => { (byDay[ev.data] ||= []).push(ev); });

  const anno = annoFromData(state.calRefDate) || DB.currentAnno();
  const giorni = giorniAttivi(anno);
  const numCols = giorni.length;

  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const gridStart = addDays(first, -startOffset);
  const totalWeeks = Math.ceil((startOffset + daysInMonth) / 7);
  const today = todayISO();
  const CAL_MAX_SHOWN = 5;

  const dayCellHtml = d => {
    const iso = toISO(d);
    const dayItems = byDay[iso] || [];
    const shown = dayItems.slice(0, CAL_MAX_SHOWN);
    const extra = dayItems.length - shown.length;
    return `<div class="cal-day ${d.getMonth() !== month ? 'outside' : ''} ${iso === today ? 'today' : ''}" data-date="${iso}">
        <span class="cd-num">${d.getDate()}</span>
        <div class="cal-day-lessons">
          ${shown.map(ev => `<div class="cal-lesson" style="--cls-color:${ev.color}" title="${escHtml([ev.label, ev.sub].filter(Boolean).join(' · '))}">${ev.ora ? escHtml(ev.ora) + ' · ' : ''}${escHtml(ev.label)}</div>`).join('')}
          ${extra > 0 ? `<div class="cal-lesson-more">+${extra} altr${extra === 1 ? 'a' : 'e'}</div>` : ''}
        </div>
      </div>`;
  };

  const grid = document.getElementById('cal-calendar-grid');
  grid.style.setProperty('--cal-cols', numCols);
  let cellsHtml = '';
  for (let w = 0; w < totalWeeks; w++) {
    for (let dow = 0; dow < numCols; dow++) cellsHtml += dayCellHtml(addDays(gridStart, w * 7 + dow));
  }
  grid.innerHTML = giorni.map(d => `<div class="cal-dow">${d}</div>`).join('') + cellsHtml;

  grid.querySelectorAll('.cal-day').forEach(cell => cell.addEventListener('click', () => {
    state.calRefDate = cell.dataset.date;
    state.calView = 'settimana';
    renderCalendario();
  }));
}

function renderCalAgenda() {
  const events = calEventsFor(state.calFilters);
  const list = document.getElementById('cal-agenda-list');
  if (!events.length) { list.innerHTML = '<p class="stat-sub" style="padding:8px 0">Nessun evento con questi filtri.</p>'; return; }
  let html = '';
  let lastData = null;
  events.forEach(ev => {
    if (ev.data !== lastData) { html += `<div class="agenda-date-head">${fmtDateIt(ev.data)}</div>`; lastData = ev.data; }
    html += `<div class="dash-item" data-tipo="${ev.tipo}" data-anno="${escHtml(ev.anno)}" data-id="${ev.id}">
      <div class="dash-item-top">
        <span class="mat-chip" style="--mat-color:${ev.color}">${escHtml(ev.ora || '—')}</span>
        <span class="dash-item-classe">${escHtml(ev.label)}</span>
      </div>
      ${ev.sub ? `<div class="dash-item-text">${escHtml(ev.sub)}</div>` : ''}
    </div>`;
  });
  list.innerHTML = html;
  list.querySelectorAll('.dash-item').forEach(div => div.addEventListener('click', () =>
    openCalEvent({ tipo: div.dataset.tipo, anno: div.dataset.anno, id: div.dataset.id })));
}

document.getElementById('cal-week-prev').addEventListener('click', () => {
  state.calRefDate = toISO(addDays(startOfWeek(state.calRefDate || todayISO()), -7));
  renderCalSettimana();
});
document.getElementById('cal-week-next').addEventListener('click', () => {
  state.calRefDate = toISO(addDays(startOfWeek(state.calRefDate || todayISO()), 7));
  renderCalSettimana();
});
document.getElementById('cal-week-today').addEventListener('click', () => {
  state.calRefDate = todayISO();
  renderCalSettimana();
});
document.getElementById('cal-month-prev').addEventListener('click', () => {
  const d = new Date((state.calRefDate || todayISO()) + 'T00:00:00'); d.setMonth(d.getMonth() - 1);
  state.calRefDate = toISO(d); renderCalMese();
});
document.getElementById('cal-month-next').addEventListener('click', () => {
  const d = new Date((state.calRefDate || todayISO()) + 'T00:00:00'); d.setMonth(d.getMonth() + 1);
  state.calRefDate = toISO(d); renderCalMese();
});
document.getElementById('cal-month-today').addEventListener('click', () => {
  state.calRefDate = todayISO();
  renderCalMese();
});

// ── Modale lezione (nuova/modifica) ──────────────────────────────────
let lezioneCtx = null; // { anno, id } se in modifica, null se nuova

// Giorno (1=Lun..6=Sab) di una data, o null se domenica/data non valida
function isoDayGiorno(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d)) return null;
  const dow = (d.getDay() + 6) % 7 + 1;
  return dow >= 1 && dow <= 6 ? dow : null;
}
function fmtDateIt(iso) {
  const d = new Date(iso + 'T00:00:00');
  return `${DOW_LABELS[(d.getDay() + 6) % 7]} ${d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}`;
}
// Prossime date (a partire dal giorno dopo `fromDateStr`) in cui quella classe
// ha un'ora in orario, secondo la griglia ricorrente — per proporre la
// scadenza dei compiti come "prossima lezione di quella classe" invece di
// una data libera
function nextClasseDates(anno, classe, fromDateStr, count = 8) {
  if (!classe) return [];
  const giorniConClasse = new Set(DB.getOrario(anno).slots.filter(s => s.classe === classe).map(s => s.giorno));
  if (!giorniConClasse.size) return [];
  const out = [];
  let d = new Date((fromDateStr || todayISO()) + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  for (let guard = 0; out.length < count && guard < 60; guard++) {
    if (giorniConClasse.has((d.getDay() + 6) % 7 + 1)) out.push(toISO(d));
    d.setDate(d.getDate() + 1);
  }
  return out;
}
function scadenzaOptions(anno, classe, fromDate, existingScadenza) {
  const dates = nextClasseDates(anno, classe, fromDate);
  if (existingScadenza && !dates.includes(existingScadenza)) dates.unshift(existingScadenza);
  return dates;
}

function lezioneFormBody(l, anno) {
  const classe = l.classe || '';
  const scadOpts = scadenzaOptions(anno, classe, l.data || todayISO(), l.scadenza);
  return `
    <div class="vf-row">
      <label class="vf-label">Data<input type="date" class="vf-input" id="lz-data" value="${escHtml(l.data || todayISO())}"/></label>
      <label class="vf-label">Ora
        <select class="vf-input" id="lz-ora">
          <option value="">—</option>
          ${[...Array(ORE_MAX)].map((_, i) => `<option value="${i + 1}" ${String(l.ora ?? '') === String(i + 1) ? 'selected' : ''}>${i + 1}ª</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="vf-row">
      <label class="vf-label">Classe
        <input class="vf-input" id="lz-classe" list="lz-classi-list" value="${escHtml(classe)}"/>
        <datalist id="lz-classi-list">${allClasses(state.students, 'all', 'all').map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
      </label>
      <label class="vf-label">Materia
        <input class="vf-input" id="lz-materia" list="lz-materie-list" value="${escHtml(l.materia || '')}"/>
        <datalist id="lz-materie-list">${materieNamesLezioni().map(m => `<option value="${escHtml(m)}">`).join('')}</datalist>
      </label>
    </div>
    <div class="vf-row">
      <label class="vf-label">Argomento<input class="vf-input" id="lz-argomento" value="${escHtml(l.argomento || '')}"/></label>
      <label class="vf-label">Tipo
        <select class="vf-input" id="lz-tipo">
          <option value="" ${!l.tipo ? 'selected' : ''}>Lezione normale</option>
          <option value="verifica" ${l.tipo === 'verifica' ? 'selected' : ''}>Verifica</option>
          <option value="interrogazione" ${l.tipo === 'interrogazione' ? 'selected' : ''}>Interrogazione</option>
        </select>
      </label>
    </div>
    <div class="vf-row">
      <label class="vf-label">Compiti<textarea class="vf-input" id="lz-compiti">${escHtml(l.compiti || '')}</textarea></label>
      <label class="vf-label">Scadenza compiti
        <select class="vf-input" id="lz-scadenza">
          <option value="">Nessuna</option>
          ${scadOpts.map(iso => `<option value="${iso}" ${l.scadenza === iso ? 'selected' : ''}>${fmtDateIt(iso)}</option>`).join('')}
        </select>
      </label>
    </div>
    <label class="vf-label">Note<textarea class="vf-input" id="lz-note">${escHtml(l.note || '')}</textarea></label>`;
}

// Ora/Data cambiano → propone classe+materia dall'orario di quel giorno/ora
// (resta comunque modificabile a mano, es. per una sostituzione) e riallinea
// le date di scadenza proposte alla classe corrente
function wireLezioneFormEvents(anno) {
  const dataEl = document.getElementById('lz-data');
  const oraEl = document.getElementById('lz-ora');
  const classeEl = document.getElementById('lz-classe');
  const materiaEl = document.getElementById('lz-materia');
  const scadEl = document.getElementById('lz-scadenza');

  function refreshScadenzaOptions() {
    const cur = scadEl.value;
    const effAnno = annoFromData(dataEl.value) || anno;
    const opts = scadenzaOptions(effAnno, classeEl.value.trim(), dataEl.value, cur);
    scadEl.innerHTML = '<option value="">Nessuna</option>' +
      opts.map(iso => `<option value="${iso}" ${cur === iso ? 'selected' : ''}>${fmtDateIt(iso)}</option>`).join('');
  }
  function autofillFromOrario() {
    const giorno = isoDayGiorno(dataEl.value);
    const ora = +oraEl.value;
    if (giorno && ora) {
      const effAnno = annoFromData(dataEl.value) || anno;
      const slot = DB.getOrario(effAnno).slots.find(sl => sl.giorno === giorno && sl.ora === ora);
      if (slot) { classeEl.value = slot.classe || ''; materiaEl.value = slot.materia || ''; }
    }
    refreshScadenzaOptions();
  }

  oraEl.addEventListener('change', autofillFromOrario);
  dataEl.addEventListener('change', autofillFromOrario);
  classeEl.addEventListener('change', refreshScadenzaOptions);
  classeEl.addEventListener('input', refreshScadenzaOptions);
}

function openLezione(anno, id) {
  const l = DB.getLezioni(anno).find(x => x.id === id);
  if (!l) return;
  lezioneCtx = { anno, id };
  document.getElementById('lezione-title').textContent = 'Modifica lezione';
  document.getElementById('lezione-body').innerHTML = lezioneFormBody(l, anno);
  document.getElementById('lezione-delete').classList.remove('hidden');
  document.getElementById('lezione-overlay').classList.remove('hidden');
  wireLezioneFormEvents(anno);
}
function openLezioneNew(defaultData, defaultOra) {
  lezioneCtx = null;
  const data = defaultData || todayISO();
  const anno = annoFromData(data);
  const giorno = defaultOra ? isoDayGiorno(data) : null;
  const slot = giorno ? DB.getOrario(anno).slots.find(sl => sl.giorno === giorno && sl.ora === +defaultOra) : null;
  document.getElementById('lezione-title').textContent = 'Nuova lezione';
  document.getElementById('lezione-body').innerHTML = lezioneFormBody({
    data, ora: defaultOra || '',
    classe: slot?.classe || (state.klass !== 'all' ? state.klass : ''),
    materia: slot?.materia || '',
  }, anno);
  document.getElementById('lezione-delete').classList.add('hidden');
  document.getElementById('lezione-overlay').classList.remove('hidden');
  wireLezioneFormEvents(anno);
}
function closeLezione() { document.getElementById('lezione-overlay').classList.add('hidden'); lezioneCtx = null; }
document.getElementById('lezione-close').addEventListener('click', closeLezione);
document.getElementById('lezione-cancel').addEventListener('click', closeLezione);
document.getElementById('lezione-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('lezione-overlay')) closeLezione();
});
document.getElementById('btn-add-lezione').addEventListener('click', () => openLezioneNew());
document.getElementById('lezione-save').addEventListener('click', async () => {
  const val = id => document.getElementById(id)?.value.trim() ?? '';
  const data = val('lz-data');
  if (!data) { alert('La data è obbligatoria.'); return; }
  const attrs = {
    data, ora: val('lz-ora'), classe: val('lz-classe'), materia: val('lz-materia'), argomento: val('lz-argomento'),
    compiti: val('lz-compiti'), scadenza: val('lz-scadenza'), note: val('lz-note'), tipo: val('lz-tipo'),
  };
  const newAnno = annoFromData(data);
  try {
    if (lezioneCtx) {
      if (newAnno !== lezioneCtx.anno) {
        // la data è cambiata di anno scolastico: la lezione si sposta di pacchetto
        await DB.removeLezione(lezioneCtx.anno, lezioneCtx.id);
        await DB.addLezione(newAnno, attrs);
      } else {
        await DB.updateLezione(lezioneCtx.anno, lezioneCtx.id, attrs);
      }
    } else {
      await DB.addLezione(newAnno, attrs);
    }
    closeLezione();
    renderAll();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});
document.getElementById('lezione-delete').addEventListener('click', async () => {
  if (!lezioneCtx) return;
  if (!confirm('Eliminare questa lezione?')) return;
  try {
    await DB.removeLezione(lezioneCtx.anno, lezioneCtx.id);
    closeLezione();
    renderAll();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Import CSV lezioni ────────────────────────────────────────────────
// Colonne: Data;Ora;Classe;Materia;Argomento;Note
function parseLezioniCSV(text) {
  const nSemi = (text.match(/;/g) || []).length;
  const nComma = (text.match(/,/g) || []).length;
  const delim = nSemi >= nComma ? ';' : ',';
  const rows = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    .map(l => l.split(delim).map(c => c.trim().replace(/^"|"$/g, '')));
  if (!rows.length) return [];
  const head = rows[0].map(c => c.toLowerCase());
  const hasHeader = head.some(c => c.includes('data') || c.includes('class'));
  const idx = hasHeader ? {
    data: head.findIndex(c => c.includes('data')),
    ora: head.findIndex(c => c.includes('ora')),
    classe: head.findIndex(c => c.includes('class')),
    materia: head.findIndex(c => c.includes('materia')),
    argomento: head.findIndex(c => c.includes('argoment')),
    compiti: head.findIndex(c => c.includes('compit')),
    scadenza: head.findIndex(c => c.includes('scaden')),
    note: head.findIndex(c => c.includes('note') || c.includes('comment')),
  } : { data: 0, ora: 1, classe: 2, materia: 3, argomento: 4, compiti: 5, scadenza: 6, note: 7 };
  const body = hasHeader ? rows.slice(1) : rows;
  return body.map(r => ({
    data: normDataVoto(idx.data >= 0 ? r[idx.data] : ''),
    ora: idx.ora >= 0 ? (r[idx.ora] || '') : '',
    classe: idx.classe >= 0 ? (r[idx.classe] || '') : '',
    materia: idx.materia >= 0 ? (r[idx.materia] || '') : '',
    argomento: idx.argomento >= 0 ? (r[idx.argomento] || '') : '',
    compiti: idx.compiti >= 0 ? (r[idx.compiti] || '') : '',
    scadenza: idx.scadenza >= 0 && r[idx.scadenza] ? normDataVoto(r[idx.scadenza]) : '',
    note: idx.note >= 0 ? (r[idx.note] || '') : '',
  }));
}
const lezCsvOverlay = document.getElementById('lez-csv-overlay');
function closeLezCsv() { lezCsvOverlay.classList.add('hidden'); }
document.getElementById('btn-import-lezioni').addEventListener('click', () => lezCsvOverlay.classList.remove('hidden'));
document.getElementById('lez-csv-close').addEventListener('click', closeLezCsv);
document.getElementById('lez-csv-cancel').addEventListener('click', closeLezCsv);
lezCsvOverlay.addEventListener('click', e => { if (e.target === lezCsvOverlay) closeLezCsv(); });
document.getElementById('lez-csv-choose').addEventListener('click', () => document.getElementById('lez-csv-file').click());
document.getElementById('lez-csv-template').addEventListener('click', () => {
  const oggi = fmtData(todayISO());
  const righe = [
    'Data;Ora;Classe;Materia;Argomento;Compiti;Scadenza;Note',
    `${oggi};1;3A;Matematica;Equazioni di secondo grado;Esercizi pag. 45 n. 1-10;;`,
    `${oggi};2;3A;Fisica;Moto rettilineo uniforme;;;Verifica la prossima settimana`,
  ].join('\r\n');
  downloadBlob('﻿' + righe, 'modello-lezioni.csv', 'text/csv;charset=utf-8');
});
document.getElementById('lez-csv-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const text = await file.text();
    const list = parseLezioniCSV(text).filter(r => r.data);
    if (!list.length) { alert('Nessuna lezione trovata nel file.'); return; }
    if (!confirm(`Importare ${list.length} lezioni?`)) return;
    const perAnno = {};
    list.forEach(r => { (perAnno[annoFromData(r.data)] ||= []).push(r); });
    await DB.addLezioniBulk(perAnno);
    closeLezCsv();
    renderAll();
    alert(`Importate ${list.length} lezioni.`);
  } catch (err) {
    alert('File non valido: ' + err.message);
  }
});

// ── Azioni di gruppo sulle lezioni (tabella elenco) ──────────────────
document.getElementById('btn-lezioni-duplica-bulk').addEventListener('click', async () => {
  const keys = [...state.lezioniSelected].map(k => k.split('|'));
  if (!keys.length) return;
  const perAnno = {};
  keys.forEach(([anno, id]) => {
    const l = DB.getLezioni(anno).find(x => x.id === id);
    if (l) (perAnno[anno] ||= []).push({ ...l });
  });
  try {
    await DB.addLezioniBulk(perAnno);
    state.lezioniSelected.clear();
    renderAll();
  } catch (err) { alert('Errore durante la duplicazione: ' + err.message); }
});
document.getElementById('btn-lezioni-elimina-bulk').addEventListener('click', async () => {
  const keys = [...state.lezioniSelected].map(k => k.split('|'));
  if (!keys.length) return;
  if (!confirm(`Eliminare ${keys.length} lezion${keys.length === 1 ? 'e' : 'i'}? L'azione è irreversibile.`)) return;
  try {
    await DB.removeLezioniBulk(keys);
    state.lezioniSelected.clear();
    renderAll();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Vista Compiti (aggrega i compiti assegnati nelle lezioni) ────────
// Un compito è un campo della lezione, non un'entità a parte: la vista
// elenca le lezioni con "compiti" valorizzato, ordinate per scadenza.
function compitiRows() {
  return lezioniRows().filter(({ l }) => l.compiti);
}
function compitiRowsSorted() {
  return sortRows('compiti', compitiRows(), {
    scadenza: r => r.l.scadenza || '9999-99-99', // senza scadenza vanno in fondo
    data: r => r.l.data, classe: r => r.l.classe, materia: r => r.l.materia,
  });
}
function updateCompitiBulkBar() {
  const bar = document.getElementById('compiti-bulk-bar');
  const n = state.compitiSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('compiti-sel-count').textContent = `${n} compit${n === 1 ? 'o' : 'i'} selezionat${n === 1 ? 'o' : 'i'}`;
}

function renderCompiti() {
  const rows = compitiRowsSorted();
  const wrap = document.getElementById('compiti-wrap');
  const empty = document.getElementById('compiti-empty');
  const panel = wrap.closest('.table-panel');
  const groupsWrap = document.getElementById('compiti-groups');
  document.getElementById('compiti-count').textContent = `${rows.length} compit${rows.length === 1 ? 'o' : 'i'}`;

  const visibleKeys = new Set(rows.map(({ anno, l }) => anno + '|' + l.id));
  [...state.compitiSelected].forEach(k => { if (!visibleKeys.has(k)) state.compitiSelected.delete(k); });
  updateCompitiBulkBar();
  const compitiAllSel = rows.length > 0 && rows.every(({ anno, l }) => state.compitiSelected.has(anno + '|' + l.id));
  const compitiSelAllBtn = document.getElementById('btn-compiti-select-all');
  compitiSelAllBtn.classList.toggle('active', compitiAllSel);
  compitiSelAllBtn.title = compitiAllSel ? 'Deseleziona tutto' : 'Seleziona tutto';

  if (!rows.length) {
    wrap.innerHTML = ''; panel.classList.add('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    empty.classList.remove('hidden');
    return;
  }
  empty.classList.add('hidden');

  const oggi = todayISO();
  const classiList = allClasses(state.students, 'all', 'all');
  const materieList = materieNamesLezioni();
  syncRaggruppaBtn('compiti');
  const compitoRowHtml = ({ anno, l }) => {
    const scadCls = !l.scadenza ? '' : l.scadenza < oggi ? 'g-bad' : l.scadenza === oggi ? 'g-mid' : 'g-good';
    const key = anno + '|' + l.id;
    return `
        <tr class="row-selectable ${state.compitiSelected.has(key) ? 'selected' : ''}" data-anno="${escHtml(anno)}" data-id="${l.id}" data-key="${escHtml(key)}">
          <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
          <td><input type="date" class="vf-input lez-field ${scadCls}" data-f="scadenza" value="${escHtml(l.scadenza || '')}"/></td>
          <td><input class="vf-input lez-field" data-f="classe" list="compiti-elenco-classi" value="${escHtml(l.classe || '')}"/></td>
          <td><input class="vf-input lez-field" data-f="materia" list="compiti-elenco-materie" value="${escHtml(l.materia || '')}"/></td>
          <td><input class="vf-input lez-field" data-f="compiti" value="${escHtml(l.compiti)}"/></td>
          <td class="col-hide-m"><input type="date" class="vf-input lez-field" data-f="data" value="${escHtml(l.data)}"/></td>
          <td class="vt-actions">
            <button class="grade-edit" data-anno="${escHtml(anno)}" data-id="${l.id}" title="Modifica (tutti i campi)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="grade-rm" data-anno="${escHtml(anno)}" data-id="${l.id}" title="Elimina l'intera lezione (non solo il compito)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </td>
        </tr>`;
  };
  const compitiThead = `
      <th></th>
      <th class="sortable" data-sort="scadenza">Scadenza${sortIcon('compiti', 'scadenza')}</th>
      <th class="sortable" data-sort="classe">Classe${sortIcon('compiti', 'classe')}</th>
      <th class="sortable" data-sort="materia">Materia${sortIcon('compiti', 'materia')}</th>
      <th>Compiti</th>
      <th class="col-hide-m sortable" data-sort="data">Assegnati il${sortIcon('compiti', 'data')}</th>
      <th></th>`;
  const datalistsHtml = `<datalist id="compiti-elenco-classi">${classiList.map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
       <datalist id="compiti-elenco-materie">${materieList.map(m => `<option value="${escHtml(m)}">`).join('')}</datalist>`;
  let activeContainer;
  if (state.raggruppa.compiti) {
    panel.classList.add('hidden');
    wrap.innerHTML = datalistsHtml;
    groupsWrap.classList.remove('hidden');
    groupsWrap.innerHTML = groupedTablePanels(rows, r => r.l.classe, compitiThead, compitoRowHtml, 'compiti-elenco-table');
    activeContainer = groupsWrap;
  } else {
    panel.classList.remove('hidden');
    groupsWrap.classList.add('hidden'); groupsWrap.innerHTML = '';
    wrap.innerHTML = `<table class="voti-table compiti-elenco-table"><thead><tr>${compitiThead}</tr></thead><tbody>${rows.map(compitoRowHtml).join('')}</tbody></table>` + datalistsHtml;
    activeContainer = wrap;
  }

  activeContainer.querySelectorAll('.lez-field').forEach(inp => inp.addEventListener('change', () => {
    const { anno, id } = inp.closest('tr').dataset;
    inlineUpdateLezione(anno, id, { [inp.dataset.f]: inp.value });
  }));
  activeContainer.querySelectorAll('.grade-edit').forEach(btn => btn.addEventListener('click', () => openLezione(btn.dataset.anno, btn.dataset.id)));
  activeContainer.querySelectorAll('.grade-rm').forEach(btn => btn.addEventListener('click', async () => {
    if (!confirm('Eliminare questa lezione?')) return;
    await DB.removeLezione(btn.dataset.anno, btn.dataset.id);
    renderAll();
  }));
  // Niente più checkbox: click sulla riga (fuori da campi/bottoni) seleziona,
  // come Alunni/Voti/Lezioni. In mobile espande invece di selezionare.
  activeContainer.querySelectorAll('tbody tr').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('.lez-field') || e.target.closest('.grade-edit') || e.target.closest('.grade-rm')) return;
    if (isMobileWidth()) { toggleRowExpand(row); return; }
    const key = row.dataset.key;
    if (state.compitiSelected.has(key)) state.compitiSelected.delete(key);
    else state.compitiSelected.add(key);
    row.classList.toggle('selected');
    updateCompitiBulkBar();
    const stillAll = rows.length > 0 && rows.every(({ anno, l }) => state.compitiSelected.has(anno + '|' + l.id));
    const selAllBtn = document.getElementById('btn-compiti-select-all');
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
  wireSort(activeContainer, 'compiti', renderCompiti);
}
document.getElementById('btn-compiti-rimuovi-bulk').addEventListener('click', async () => {
  const keys = [...state.compitiSelected].map(k => k.split('|'));
  if (!keys.length) return;
  if (!confirm(`Rimuovere i compiti da ${keys.length} lezion${keys.length === 1 ? 'e' : 'i'}? Le lezioni restano, solo compiti/scadenza vengono cancellati.`)) return;
  try {
    await DB.clearCompitiBulk(keys);
    state.compitiSelected.clear();
    renderAll();
  } catch (err) { alert('Errore durante la rimozione: ' + err.message); }
});
document.getElementById('btn-compiti-select-all').addEventListener('click', () => {
  const keys = compitiRowsSorted().map(({ anno, l }) => anno + '|' + l.id);
  const allSel = keys.length > 0 && keys.every(k => state.compitiSelected.has(k));
  if (allSel) keys.forEach(k => state.compitiSelected.delete(k));
  else keys.forEach(k => state.compitiSelected.add(k));
  renderCompiti();
});
document.getElementById('btn-add-compito').addEventListener('click', () => openLezioneNew());

// ── Vista To-do (elenco globale, non legato all'anno scolastico) ──────
// Due viste sullo stesso elenco: Elenco (tabella con selezione/azioni di
// gruppo, come le altre sezioni) e Kanban (una colonna per stato, con
// frecce avanti/indietro per spostare — niente drag&drop reale, stesso
// principio della drag handle "solo affordance" usata altrove nel sito).
function todoRows() { return DB.getTodos(); }
function todoStatoLabel(stato) { return TODO_STATI.find(s => s.key === stato)?.label || stato; }
// Colore per stato, stile Notion: grigio (da iniziare) → blu (in corso) → verde (fatto)
function todoStatoColor(stato) {
  return stato === 'in_corso' ? 'var(--accent-blue)' : stato === 'fatto' ? 'var(--accent-green)' : 'var(--text-hint)';
}
// Colore in base all'urgenza della scadenza, come i compiti — ma non se
// il to-do è già "fatto": non ha più senso segnalarlo come in ritardo
function todoScadCls(t) {
  if (t.stato === 'fatto' || !t.scadenza) return '';
  const oggi = todayISO();
  return t.scadenza < oggi ? 'g-bad' : t.scadenza === oggi ? 'g-mid' : 'g-good';
}
function updateTodoBulkBar() {
  const bar = document.getElementById('todo-bulk-bar');
  const n = state.todoSelected.size;
  bar.classList.toggle('hidden', n === 0);
  document.getElementById('todo-sel-count').textContent = `${n} to-do selezionat${n === 1 ? 'o' : 'i'}`;
}
function todoRowHtml(t) {
  const scadCls = todoScadCls(t);
  return `<tr class="row-selectable ${state.todoSelected.has(t.id) ? 'selected' : ''}" data-id="${t.id}">
      <td class="row-drag" title="Seleziona"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="8" cy="6" r="1.6"/><circle cx="8" cy="12" r="1.6"/><circle cx="8" cy="18" r="1.6"/><circle cx="16" cy="6" r="1.6"/><circle cx="16" cy="12" r="1.6"/><circle cx="16" cy="18" r="1.6"/></svg></td>
      <td>${escHtml(t.titolo)}</td>
      <td><span class="todo-pill" style="--todo-color:${todoStatoColor(t.stato)}">${escHtml(todoStatoLabel(t.stato))}</span></td>
      <td class="vt-mono ${scadCls}">${t.scadenza ? fmtData(t.scadenza) : '—'}</td>
      <td class="vt-actions">
        <button class="grade-edit" data-edit-todo="${t.id}" title="Modifica">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="grade-rm" data-rm-todo="${t.id}" title="Elimina">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </td>
    </tr>`;
}
function renderTodoElenco(unsortedList) {
  const wrap = document.getElementById('todo-elenco-wrap');
  const visibleIds = new Set(unsortedList.map(t => t.id));
  [...state.todoSelected].forEach(id => { if (!visibleIds.has(id)) state.todoSelected.delete(id); });
  updateTodoBulkBar();
  const selAllBtn = document.getElementById('btn-todo-select-all');
  const allSel = unsortedList.length > 0 && unsortedList.every(t => state.todoSelected.has(t.id));
  selAllBtn.classList.toggle('active', allSel);
  selAllBtn.title = allSel ? 'Deseleziona tutto' : 'Seleziona tutto';

  const list = sortRows('todo', unsortedList, {
    titolo: t => t.titolo, stato: t => todoStatoLabel(t.stato), scadenza: t => t.scadenza,
  });
  wrap.innerHTML = `<table class="voti-table">
    <thead><tr>
      <th></th>
      <th class="sortable" data-sort="titolo">Titolo${sortIcon('todo', 'titolo')}</th>
      <th class="sortable" data-sort="stato">Stato${sortIcon('todo', 'stato')}</th>
      <th class="sortable" data-sort="scadenza">Scadenza${sortIcon('todo', 'scadenza')}</th>
      <th></th>
    </tr></thead>
    <tbody>${list.map(todoRowHtml).join('')}</tbody>
  </table>`;

  wrap.querySelectorAll('[data-edit-todo]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); openTodoModal(unsortedList.find(x => x.id === b.dataset.editTodo)); }));
  wrap.querySelectorAll('[data-rm-todo]').forEach(b => b.addEventListener('click', async e => {
    e.stopPropagation();
    if (!confirm('Eliminare questo to-do?')) return;
    try { await DB.saveTodos(DB.getTodos().filter(x => x.id !== b.dataset.rmTodo)); renderAll(); }
    catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
  }));
  wrap.querySelectorAll('tbody tr').forEach(row => row.addEventListener('click', e => {
    if (e.target.closest('[data-edit-todo]') || e.target.closest('[data-rm-todo]')) return;
    const id = row.dataset.id;
    if (state.todoSelected.has(id)) state.todoSelected.delete(id);
    else state.todoSelected.add(id);
    row.classList.toggle('selected');
    updateTodoBulkBar();
    const stillAll = unsortedList.length > 0 && unsortedList.every(x => state.todoSelected.has(x.id));
    selAllBtn.classList.toggle('active', stillAll);
    selAllBtn.title = stillAll ? 'Deseleziona tutto' : 'Seleziona tutto';
  }));
  wireSort(wrap, 'todo', renderTodo);
}
document.getElementById('btn-todo-select-all').addEventListener('click', () => {
  const ids = DB.getTodos().map(t => t.id);
  const allSel = ids.length > 0 && ids.every(id => state.todoSelected.has(id));
  if (allSel) ids.forEach(id => state.todoSelected.delete(id));
  else ids.forEach(id => state.todoSelected.add(id));
  renderTodo();
});
document.getElementById('btn-todo-elimina-bulk').addEventListener('click', async () => {
  const ids = [...state.todoSelected];
  if (!ids.length) return;
  if (!confirm(`Eliminare ${ids.length} to-do?`)) return;
  try {
    await DB.saveTodos(DB.getTodos().filter(t => !ids.includes(t.id)));
    state.todoSelected.clear();
    renderAll();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

function todoCardHtml(t) {
  const scadCls = todoScadCls(t);
  const idx = TODO_STATI.findIndex(s => s.key === t.stato);
  return `<div class="todo-card" draggable="true" data-id="${t.id}">
      <div class="todo-card-title">${escHtml(t.titolo)}</div>
      ${t.descrizione ? `<div class="todo-card-desc">${escHtml(t.descrizione)}</div>` : ''}
      ${t.scadenza ? `<div class="todo-card-scad ${scadCls}">${fmtData(t.scadenza)}</div>` : ''}
      <div class="todo-card-actions">
        <button class="pager-arrow" data-todo-prev="${t.id}" ${idx <= 0 ? 'disabled' : ''} title="Sposta indietro">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="grade-edit" data-edit-todo="${t.id}" title="Modifica">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="grade-rm" data-rm-todo="${t.id}" title="Elimina">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        <button class="pager-arrow" data-todo-next="${t.id}" ${idx >= TODO_STATI.length - 1 ? 'disabled' : ''} title="Sposta avanti">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>`;
}
// Sposta un to-do in un nuovo stato (drag&drop o frecce), un solo salvataggio
async function setTodoStato(id, statoKey) {
  const list = DB.getTodos();
  const t = list.find(x => x.id === id);
  if (!t || t.stato === statoKey) return;
  t.stato = statoKey;
  try { await DB.saveTodos(list); renderAll(); }
  catch (err) { alert('Errore durante l\'aggiornamento: ' + err.message); }
}
function moveTodoStato(id, delta) {
  const t = DB.getTodos().find(x => x.id === id);
  if (!t) return;
  const idx = TODO_STATI.findIndex(s => s.key === t.stato);
  const next = TODO_STATI[idx + delta];
  if (next) setTodoStato(id, next.key);
}
function renderTodoKanban(list) {
  const grid = document.getElementById('todo-kanban-grid');
  grid.innerHTML = TODO_STATI.map(s => {
    const items = list.filter(t => t.stato === s.key);
    const color = todoStatoColor(s.key);
    return `<div class="todo-col" style="--todo-color:${color}">
      <div class="todo-col-head"><span class="todo-col-dot"></span><span class="todo-col-title">${escHtml(s.label)}</span><span class="stat-sub">${items.length}</span></div>
      <div class="todo-col-body" data-stato="${s.key}">${items.map(todoCardHtml).join('') || '<p class="stat-sub" style="padding:8px 0">Nessun to-do</p>'}</div>
    </div>`;
  }).join('');

  grid.querySelectorAll('[data-edit-todo]').forEach(b => b.addEventListener('click', () => openTodoModal(list.find(x => x.id === b.dataset.editTodo))));
  grid.querySelectorAll('[data-rm-todo]').forEach(b => b.addEventListener('click', async () => {
    if (!confirm('Eliminare questo to-do?')) return;
    try { await DB.saveTodos(DB.getTodos().filter(x => x.id !== b.dataset.rmTodo)); renderAll(); }
    catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
  }));
  grid.querySelectorAll('[data-todo-prev]').forEach(b => b.addEventListener('click', () => moveTodoStato(b.dataset.todoPrev, -1)));
  grid.querySelectorAll('[data-todo-next]').forEach(b => b.addEventListener('click', () => moveTodoStato(b.dataset.todoNext, 1)));

  // Drag & drop reale fra colonne (a differenza della drag-handle "solo
  // affordance" usata nelle tabelle, qui il trascinamento cambia davvero lo
  // stato): dragstart sulla card, dragover/drop sul corpo della colonna.
  grid.querySelectorAll('.todo-card').forEach(card => {
    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      card.classList.add('dragging');
    });
    card.addEventListener('dragend', () => card.classList.remove('dragging'));
  });
  grid.querySelectorAll('.todo-col-body').forEach(body => {
    body.addEventListener('dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; body.classList.add('drag-over'); });
    body.addEventListener('dragleave', () => body.classList.remove('drag-over'));
    body.addEventListener('drop', e => {
      e.preventDefault();
      body.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      if (id) setTodoStato(id, body.dataset.stato);
    });
  });
}

function renderTodoToggle() {
  document.getElementById('todo-kanban-view').classList.toggle('hidden', state.todoView !== 'kanban');
  document.getElementById('todo-elenco-view').classList.toggle('hidden', state.todoView !== 'elenco');
  document.querySelectorAll('#todo-view-toggle .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.tv === state.todoView));
}
document.querySelectorAll('#todo-view-toggle .seg-btn').forEach(btn => btn.addEventListener('click', () => {
  state.todoView = btn.dataset.tv;
  renderTodo();
}));

function renderTodo() {
  const list = todoRows();
  document.getElementById('todo-count').textContent = `${list.length} to-do`;
  renderTodoToggle();
  renderTodoElenco(list);
  renderTodoKanban(list);
}

// ── Modale to-do (nuovo/modifica) ─────────────────────────────────────
let todoCtx = null;
function todoFormBody(t) {
  return `
    <label class="vf-label">Titolo<input class="vf-input" id="td-titolo" value="${escHtml(t.titolo || '')}"/></label>
    <label class="vf-label">Descrizione<textarea class="vf-input" id="td-descrizione">${escHtml(t.descrizione || '')}</textarea></label>
    <div class="vf-row">
      <label class="vf-label">Stato
        <select class="vf-input" id="td-stato">
          ${TODO_STATI.map(s => `<option value="${s.key}" ${(t.stato || 'da_fare') === s.key ? 'selected' : ''}>${escHtml(s.label)}</option>`).join('')}
        </select>
      </label>
      <label class="vf-label">Scadenza<input type="date" class="vf-input" id="td-scadenza" value="${escHtml(t.scadenza || '')}"/></label>
    </div>`;
}
function openTodoModal(t) {
  todoCtx = t ? t.id : null;
  document.getElementById('todo-title').textContent = t ? 'Modifica to-do' : 'Nuovo to-do';
  document.getElementById('todo-body').innerHTML = todoFormBody(t || {});
  document.getElementById('todo-delete').classList.toggle('hidden', !t);
  document.getElementById('todo-overlay').classList.remove('hidden');
}
document.getElementById('btn-add-todo').addEventListener('click', () => openTodoModal(null));
function closeTodoModal() { document.getElementById('todo-overlay').classList.add('hidden'); todoCtx = null; }
document.getElementById('todo-close').addEventListener('click', closeTodoModal);
document.getElementById('todo-cancel').addEventListener('click', closeTodoModal);
document.getElementById('todo-overlay').addEventListener('click', e => { if (e.target.id === 'todo-overlay') closeTodoModal(); });
document.getElementById('todo-save').addEventListener('click', async () => {
  const titolo = document.getElementById('td-titolo').value.trim();
  if (!titolo) { alert('Il titolo è obbligatorio.'); return; }
  const attrs = {
    titolo,
    descrizione: document.getElementById('td-descrizione').value.trim(),
    stato: document.getElementById('td-stato').value,
    scadenza: document.getElementById('td-scadenza').value,
  };
  const list = DB.getTodos();
  try {
    if (todoCtx) {
      const t = list.find(x => x.id === todoCtx);
      if (t) Object.assign(t, attrs);
    } else {
      list.push({ id: DB.uid(), ...attrs });
    }
    await DB.saveTodos(list);
    closeTodoModal();
    renderAll();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});
document.getElementById('todo-delete').addEventListener('click', async () => {
  if (!todoCtx) return;
  if (!confirm('Eliminare questo to-do?')) return;
  try {
    await DB.saveTodos(DB.getTodos().filter(x => x.id !== todoCtx));
    closeTodoModal();
    renderAll();
  } catch (err) { alert('Errore durante l\'eliminazione: ' + err.message); }
});

// ── Vista Orario (griglia settimanale ricorrente del docente, per anno) ──
// La fascia oraria si imposta una sola volta per "ora" (numero di riga) e
// vale per tutti i giorni; materia/classe restano invece per singola cella.
const GIORNI_ORARIO = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab'];
const ORE_MAX = 10; // 1-8 mattutine + 2 pomeridiane
// Giorni da mostrare in griglia per quell'anno: esclude il sabato se disattivato
function giorniAttivi(anno) {
  return DB.getOrario(anno).sabato === false ? GIORNI_ORARIO.slice(0, 5) : GIORNI_ORARIO;
}
function renderOrario() {
  const anno = state.year !== 'all' ? state.year : DB.currentAnno();
  const { slots, periodi, sabato } = DB.getOrario(anno);
  document.getElementById('orario-info').textContent =
    `Anno ${anno}${state.year === 'all' ? ' (imposta il filtro Anno in alto per cambiarlo)' : ''} — clicca una cella per modificarla, clicca il numero dell'ora per impostarne la fascia oraria`;
  document.getElementById('btn-orario-sabato').textContent = sabato === false ? 'Includi il sabato' : 'Elimina il sabato';
  const giorni = giorniAttivi(anno);
  const map = {};
  slots.forEach(sl => { map[sl.giorno + '|' + sl.ora] = sl; });

  document.getElementById('orario-wrap').innerHTML = `
  <table class="voti-table orario-table">
    <thead><tr><th></th>${giorni.map(g => `<th>${g}</th>`).join('')}</tr></thead>
    <tbody>
      ${[...Array(ORE_MAX)].map((_, i) => {
        const ora = i + 1;
        const p = periodi[ora];
        return `<tr><td class="vt-mono orario-ora" data-ora="${ora}">${ora}ª${p ? `<div class="oc-time">${escHtml(p.inizio || '?')}–${escHtml(p.fine || '?')}</div>` : ''}</td>${giorni.map((_, gi) => {
          const giorno = gi + 1;
          const sl = map[giorno + '|' + ora];
          return `<td><div class="orario-cell ${sl ? 'filled' : ''}" data-giorno="${giorno}" data-ora="${ora}" ${sl ? `style="--cls-color:${sl.classe ? colorOfClasse(sl.classe) : colorOfMateria(sl.materia)}"` : ''}>
            ${sl ? `<span class="oc-classe">${escHtml(sl.classe || sl.materia || '—')}</span>${(sl.materia && sl.classe) ? `<span class="oc-materia-txt">${escHtml(sl.materia)}</span>` : ''}` : ''}
          </div></td>`;
        }).join('')}</tr>`;
      }).join('')}
    </tbody>
  </table>`;

  document.querySelectorAll('#orario-wrap .orario-cell').forEach(cell =>
    cell.addEventListener('click', () => openOrarioCell(anno, +cell.dataset.giorno, +cell.dataset.ora)));
  document.querySelectorAll('#orario-wrap .orario-ora').forEach(th =>
    th.addEventListener('click', () => openOrarioPeriodo(anno, +th.dataset.ora)));
}
document.getElementById('btn-orario-sabato').addEventListener('click', async () => {
  const anno = state.year !== 'all' ? state.year : DB.currentAnno();
  const includeOra = DB.getOrario(anno).sabato === false; // sta per diventare true
  try {
    await DB.setOrarioSabato(anno, includeOra);
    renderOrario();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});

let orarioSlotCtx = null; // { type: 'cell', anno, giorno, ora } | { type: 'periodo', anno, ora }

function openOrarioCell(anno, giorno, ora) {
  const existing = DB.getOrario(anno).slots.find(sl => sl.giorno === giorno && sl.ora === ora);
  orarioSlotCtx = { type: 'cell', anno, giorno, ora };
  document.getElementById('orario-slot-title').textContent = `${GIORNI_ORARIO[giorno - 1]} · ${ora}ª ora`;
  document.getElementById('orario-slot-body').innerHTML = `
    <div class="vf-row">
      <label class="vf-label">Materia
        <input class="vf-input" id="os-materia" list="os-materie-list" value="${escHtml(existing?.materia || '')}"/>
        <datalist id="os-materie-list">${materieNamesLezioni().map(m => `<option value="${escHtml(m)}">`).join('')}</datalist>
      </label>
      <label class="vf-label">Classe
        <input class="vf-input" id="os-classe" list="os-classi-list" value="${escHtml(existing?.classe || '')}"/>
        <datalist id="os-classi-list">${allClasses(state.students, anno, 'all').map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
      </label>
    </div>`;
  document.getElementById('orario-slot-delete').textContent = 'Libera';
  document.getElementById('orario-slot-delete').classList.toggle('hidden', !existing);
  document.getElementById('orario-slot-overlay').classList.remove('hidden');
}

function openOrarioPeriodo(anno, ora) {
  const existing = DB.getOrario(anno).periodi[ora];
  orarioSlotCtx = { type: 'periodo', anno, ora };
  document.getElementById('orario-slot-title').textContent = `Fascia oraria — ${ora}ª ora`;
  document.getElementById('orario-slot-body').innerHTML = `
    <p class="modal-desc">Vale per tutti i giorni: la ${ora}ª ora è sempre alla stessa fascia oraria.</p>
    <div class="vf-row">
      <label class="vf-label">Dalle ore<input type="time" class="vf-input" id="os-inizio" value="${escHtml(existing?.inizio || '')}"/></label>
      <label class="vf-label">Alle ore<input type="time" class="vf-input" id="os-fine" value="${escHtml(existing?.fine || '')}"/></label>
    </div>`;
  document.getElementById('orario-slot-delete').textContent = 'Rimuovi fascia';
  document.getElementById('orario-slot-delete').classList.toggle('hidden', !existing);
  document.getElementById('orario-slot-overlay').classList.remove('hidden');
}

function closeOrarioSlot() { document.getElementById('orario-slot-overlay').classList.add('hidden'); orarioSlotCtx = null; }
document.getElementById('orario-slot-close').addEventListener('click', closeOrarioSlot);
document.getElementById('orario-slot-cancel').addEventListener('click', closeOrarioSlot);
document.getElementById('orario-slot-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('orario-slot-overlay')) closeOrarioSlot();
});
document.getElementById('orario-slot-save').addEventListener('click', async () => {
  if (!orarioSlotCtx) return;
  try {
    if (orarioSlotCtx.type === 'periodo') {
      const { anno, ora } = orarioSlotCtx;
      const inizio = document.getElementById('os-inizio').value;
      const fine = document.getElementById('os-fine').value;
      await DB.setOrarioPeriodo(anno, ora, { inizio, fine });
    } else {
      const { anno, giorno, ora } = orarioSlotCtx;
      const materia = document.getElementById('os-materia').value.trim();
      const classe = document.getElementById('os-classe').value.trim();
      const slots = DB.getOrario(anno).slots.filter(sl => !(sl.giorno === giorno && sl.ora === ora));
      if (materia || classe) slots.push({ id: DB.uid(), giorno, ora, materia, classe });
      await DB.setOrarioSlots(anno, slots);
    }
    closeOrarioSlot();
    renderOrario();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});
document.getElementById('orario-slot-delete').addEventListener('click', async () => {
  if (!orarioSlotCtx) return;
  try {
    if (orarioSlotCtx.type === 'periodo') {
      const { anno, ora } = orarioSlotCtx;
      await DB.setOrarioPeriodo(anno, ora, { inizio: '', fine: '' });
    } else {
      const { anno, giorno, ora } = orarioSlotCtx;
      const slots = DB.getOrario(anno).slots.filter(sl => !(sl.giorno === giorno && sl.ora === ora));
      await DB.setOrarioSlots(anno, slots);
    }
    closeOrarioSlot();
    renderOrario();
  } catch (err) { alert('Errore durante il salvataggio: ' + err.message); }
});

// ── Vista Report (export CSV/PDF con filtri) ─────────────────────────
// Riusa i filtri globali (Anno/Istituto/Classe/Ricerca) e ne aggiunge due
// propri (Materia/Alunno) per restringere ulteriormente l'export.
function reportRows() {
  const rows = [];
  filteredNoSearch().forEach(s => gradesOf(s, state.year).forEach(g => rows.push({ s, g })));
  let list = rows;
  if (state.reportMateria !== 'all') list = list.filter(r => r.g.materia === state.reportMateria);
  if (state.reportAlunno !== 'all') list = list.filter(r => r.s.id === state.reportAlunno);
  if (state.filtroDa) list = list.filter(r => r.g.data >= state.filtroDa);
  if (state.filtroA) list = list.filter(r => r.g.data <= state.filtroA);
  return list;
}
// Righe del report nell'ordine attualmente mostrato in tabella (stesso
// ordinamento sia a video che nei file scaricati)
function reportRowsSorted() {
  return sortRows('report', reportRows(), {
    data: r => r.g.data, alunno: r => `${r.s.cognome} ${r.s.nome}`,
    classe: r => classeOf(r.s, r.g.anno) || '', materia: r => r.g.materia,
    voto: r => r.g.voto, tipo: r => r.g.tipo,
  });
}

// Riusata da Report Voti e Report Orali/Scritti: entrambi condividono lo
// stesso <select id="filter-materia">/state.reportMateria, popolato dalle
// materie che compaiono davvero nei voti (non dal registro materie per
// classe) filtrate per l'Anno corrente.
function populateReportMateriaSelect() {
  const selM = document.getElementById('filter-materia');
  const materie = [...new Set(state.students.flatMap(s => gradesOf(s, state.year).map(g => g.materia)))].sort();
  const matOpts = ['all', ...materie];
  if (!matOpts.includes(state.reportMateria)) state.reportMateria = 'all';
  selM.innerHTML = matOpts.map(m =>
    `<option value="${escHtml(m)}" ${state.reportMateria === m ? 'selected' : ''}>${m === 'all' ? 'Tutte le materie' : escHtml(m)}</option>`).join('');
}
function renderReport() {
  const selA = document.getElementById('filter-alunno-report');
  populateReportMateriaSelect();

  const alunni = filteredNoSearch().sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
  const alunniIds = new Set(alunni.map(a => a.id));
  if (state.reportAlunno !== 'all' && !alunniIds.has(state.reportAlunno)) state.reportAlunno = 'all';
  selA.innerHTML = `<option value="all" ${state.reportAlunno === 'all' ? 'selected' : ''}>Tutti gli alunni</option>` +
    alunni.map(a => `<option value="${a.id}" ${state.reportAlunno === a.id ? 'selected' : ''}>${escHtml(a.cognome)} ${escHtml(a.nome)}</option>`).join('');

  const wrap = document.getElementById('report-wrap');
  const empty = document.getElementById('report-empty');
  const panel = wrap.closest('.table-panel');
  const rows = reportRowsSorted();
  document.getElementById('report-count').textContent = `${rows.length} voti`;
  document.getElementById('btn-report-csv').disabled = !rows.length;
  document.getElementById('btn-report-pdf').disabled = !rows.length;

  if (!rows.length) { wrap.innerHTML = ''; panel.classList.add('hidden'); empty.classList.remove('hidden'); return; }
  panel.classList.remove('hidden'); empty.classList.add('hidden');

  wrap.innerHTML = `
  <table class="voti-table">
    <thead><tr>
      <th class="sortable" data-sort="data">Data${sortIcon('report', 'data')}</th>
      <th class="sortable" data-sort="alunno">Alunno${sortIcon('report', 'alunno')}</th>
      <th class="col-hide-m sortable" data-sort="classe">Classe${sortIcon('report', 'classe')}</th>
      <th class="sortable" data-sort="materia">Materia${sortIcon('report', 'materia')}</th>
      <th class="sortable" data-sort="voto">Voto${sortIcon('report', 'voto')}</th>
      <th class="col-hide-m sortable" data-sort="tipo">Tipo${sortIcon('report', 'tipo')}</th>
    </tr></thead>
    <tbody>
      ${rows.map(({ s, g }) => {
        const classe = classeOf(s, g.anno) || '';
        return `
      <tr>
        <td class="vt-mono">${escHtml(fmtData(g.data))}</td>
        <td>${escHtml(s.cognome)} ${escHtml(s.nome)}</td>
        <td class="col-hide-m">${escHtml(classe || '—')}</td>
        <td>${escHtml(g.materia)}</td>
        <td class="vt-mono vt-voto ${gradeClass(g.voto)}">${fmt(g.voto)}</td>
        <td class="col-hide-m"><span class="tipo-badge">${escHtml(g.tipo)}</span></td>
      </tr>`;
      }).join('')}
    </tbody>
  </table>`;
  wireSort(wrap, 'report', renderReport);
}

document.getElementById('filter-materia').addEventListener('change', e => {
  state.reportMateria = e.target.value;
  // Condiviso da Report Voti e Report Orali/Scritti: passa dal dispatcher
  // generico invece di richiamare un renderer fisso, così re-invoca quello
  // giusto in base alla view attualmente aperta.
  renderView();
});
document.getElementById('filter-alunno-report').addEventListener('change', e => {
  state.reportAlunno = e.target.value;
  renderReport();
});
document.getElementById('filter-da').addEventListener('change', e => {
  state.filtroDa = e.target.value;
  renderView();
});
document.getElementById('filter-a').addEventListener('change', e => {
  state.filtroA = e.target.value;
  renderView();
});

// Descrizione dei filtri attivi, usata sia nel nome file che nell'intestazione PDF
// Filtri di base condivisi da tutti i report (Anno/Istituto/Classe/Periodo):
// riusata sia da Report Voti (che vi aggiunge Materia/Alunno) sia dai PDF di
// Report ore e Report Orali/Scritti, così ognuno mostra solo i propri filtri
// realmente attivi invece di ereditare per sbaglio uno stato lasciato da
// un'altra vista (es. state.reportMateria impostato mentre si era su Report Voti).
function baseFilterSummary() {
  const parts = [];
  if (state.year !== 'all') parts.push(state.year);
  if (state.istituto !== 'all') parts.push(state.istituto);
  if (state.klass !== 'all') parts.push(state.klass);
  if (state.filtroDa || state.filtroA) parts.push(`dal ${state.filtroDa ? fmtData(state.filtroDa) : '…'} al ${state.filtroA ? fmtData(state.filtroA) : '…'}`);
  return parts;
}
function reportFilterSummary() {
  const parts = [];
  if (state.year !== 'all') parts.push(state.year);
  if (state.istituto !== 'all') parts.push(state.istituto);
  if (state.klass !== 'all') parts.push(state.klass);
  if (state.reportMateria !== 'all') parts.push(state.reportMateria);
  if (state.reportAlunno !== 'all') {
    const a = state.students.find(x => x.id === state.reportAlunno);
    if (a) parts.push(`${a.cognome} ${a.nome}`);
  }
  if (state.filtroDa || state.filtroA) parts.push(`dal ${state.filtroDa ? fmtData(state.filtroDa) : '…'} al ${state.filtroA ? fmtData(state.filtroA) : '…'}`);
  return parts;
}

document.getElementById('btn-report-csv').addEventListener('click', () => {
  const rows = reportRowsSorted();
  if (!rows.length) return;
  const righe = ['Data;Alunno;Classe;Materia;Voto;Tipo;Descrizione;Commento'];
  rows.forEach(({ s, g }) => {
    righe.push([
      fmtData(g.data), `${s.cognome} ${s.nome}`, classeOf(s, g.anno) || '', g.materia,
      String(g.voto).replace('.', ','), g.tipo, g.desc || '', g.commento || '',
    ].join(';'));
  });
  downloadBlob('﻿' + righe.join('\r\n'), `report-voti-${todayISO()}.csv`, 'text/csv;charset=utf-8');
});

document.getElementById('btn-report-pdf').addEventListener('click', () => {
  if (!window.jspdf) { alert('Libreria PDF non caricata (ricarica la pagina).'); return; }
  const rows = reportRowsSorted();
  if (!rows.length) return;

  const doc = new jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text('Report voti', 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  const filtri = reportFilterSummary();
  doc.text(filtri.length ? filtri.join(' · ') : 'Nessun filtro applicato', 14, 21);

  doc.autoTable({
    startY: 27,
    head: [['Data', 'Alunno', 'Classe', 'Materia', 'Voto', 'Tipo', 'Descrizione']],
    body: rows.map(({ s, g }) => [fmtData(g.data), `${s.cognome} ${s.nome}`, classeOf(s, g.anno) || '—', g.materia, fmt(g.voto), g.tipo, g.desc || '']),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [91, 155, 255] },
    columnStyles: { 6: { cellWidth: 55 } },
  });

  doc.save(`report-voti-${todayISO()}.pdf`);
});

// ── Report Orali/Scritti: un alunno per riga, voti orali/scritti e le
//    relative medie, per UNA singola Materia + Classe — entrambe
//    obbligatorie (niente "Tutte le materie/classi": ha senso solo su una
//    combinazione precisa, altrimenti le colonne mescolerebbero materie
//    diverse). Stesso schema di ambiguità di classeDetailTarget(): una
//    classe con Anno = "Tutti gli anni" può indicare coorti diverse.
function reportOSTarget() {
  if (state.klass === 'all' || state.reportMateria === 'all') return { mode: 'missing' };
  if (state.year === 'all') return { mode: 'ambiguous' };
  return { mode: 'ready', anno: state.year, classe: state.klass, materia: state.reportMateria };
}
function renderReportOS() {
  populateReportMateriaSelect();
  const wrap = document.getElementById('report-os-wrap');
  const panel = wrap.closest('.table-panel');
  const msgEl = document.getElementById('report-os-message');
  const countEl = document.getElementById('report-os-count');
  const target = reportOSTarget();
  if (target.mode !== 'ready') {
    panel.classList.add('hidden');
    msgEl.classList.remove('hidden');
    msgEl.textContent = target.mode === 'ambiguous'
      ? 'La classe selezionata esiste in più anni scolastici: scegli anche un Anno specifico nei filtri in alto per generare il report.'
      : 'Seleziona una Materia e una Classe specifiche nei filtri in alto per generare il report.';
    countEl.textContent = '';
    return;
  }
  msgEl.classList.add('hidden');
  panel.classList.remove('hidden');
  const { anno, classe, materia } = target;

  const studenti = filteredNoSearch().sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
  countEl.textContent = `${studenti.length} alunn${studenti.length === 1 ? 'o' : 'i'} · ${materia} · ${classe}`;

  const thead = `<th>Alunno</th><th>Voti orali</th><th>Media orali</th><th>Voti scritti</th><th>Media scritti</th><th>Media generale</th>`;
  wrap.innerHTML = studenti.length
    ? `<table class="voti-table"><thead><tr>${thead}</tr></thead><tbody>${studenti.map(s => reportOSRowHtml(s, anno, materia)).join('')}</tbody></table>`
    : '';
  if (!studenti.length) { panel.classList.add('hidden'); msgEl.classList.remove('hidden'); msgEl.textContent = 'Nessun alunno in questa classe con i filtri correnti.'; }
}
// Voti orali/scritti + medie di un alunno per una materia: calcolo condiviso
// dalla riga HTML e dall'export PDF, così non possono disallinearsi.
function reportOSGrades(s, anno, materia) {
  const voti = gradesOf(s, anno).filter(g => g.materia === materia);
  const orali = voti.filter(g => g.tipo === 'orale').sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  const scritti = voti.filter(g => g.tipo !== 'orale').sort((a, b) => (a.data || '').localeCompare(b.data || ''));
  return {
    orali, scritti,
    mediaOrali: avg(orali.map(g => g.voto)),
    mediaScritti: avg(scritti.map(g => g.voto)),
    mediaGenerale: avg(voti.map(g => g.voto)),
  };
}
function reportOSRowHtml(s, anno, materia) {
  const { orali, scritti, mediaOrali, mediaScritti, mediaGenerale } = reportOSGrades(s, anno, materia);
  return `<tr>
      <td>${escHtml(s.cognome)} ${escHtml(s.nome)}</td>
      <td>${orali.length ? escHtml(orali.map(g => fmt(g.voto)).join(', ')) : '–'}</td>
      <td class="vt-mono ${gradeClass(mediaOrali)}">${fmt(mediaOrali)}</td>
      <td>${scritti.length ? escHtml(scritti.map(g => fmt(g.voto)).join(', ')) : '–'}</td>
      <td class="vt-mono ${gradeClass(mediaScritti)}">${fmt(mediaScritti)}</td>
      <td class="vt-mono ${gradeClass(mediaGenerale)}"><strong>${fmt(mediaGenerale)}</strong></td>
    </tr>`;
}
document.getElementById('btn-report-os-pdf').addEventListener('click', () => {
  if (!window.jspdf) { alert('Libreria PDF non caricata (ricarica la pagina).'); return; }
  const target = reportOSTarget();
  if (target.mode !== 'ready') return;
  const { anno, classe, materia } = target;
  const studenti = filteredNoSearch().sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
  if (!studenti.length) return;

  const doc = new jspdf.jsPDF();
  doc.setFontSize(14);
  doc.text('Report Orali/Scritti', 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`${materia} · ${classe} · ${anno}`, 14, 21);
  doc.autoTable({
    startY: 27,
    head: [['Alunno', 'Voti orali', 'Media orali', 'Voti scritti', 'Media scritti', 'Media generale']],
    body: studenti.map(s => {
      const { orali, scritti, mediaOrali, mediaScritti, mediaGenerale } = reportOSGrades(s, anno, materia);
      return [
        `${s.cognome} ${s.nome}`,
        orali.length ? orali.map(g => fmt(g.voto)).join(', ') : '–', fmt(mediaOrali),
        scritti.length ? scritti.map(g => fmt(g.voto)).join(', ') : '–', fmt(mediaScritti),
        fmt(mediaGenerale),
      ];
    }),
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [91, 155, 255] },
  });
  doc.save(`report-orali-scritti-${classe}-${materia}-${todayISO()}.pdf`.replace(/\s+/g, '_'));
});

// Conteggio grezzo righe × colonne, condiviso dal rendering HTML (pivotTableHtml)
// e dall'export PDF (pivotAutoTablePDF) di Report ore, così le due versioni
// non possono disallinearsi tra loro.
function pivotData(items, rowKeyFn, colKeyFn) {
  const rowKeys = new Set(), colKeys = new Set();
  const counts = {};
  items.forEach(item => {
    const r = rowKeyFn(item) || '—', c = colKeyFn(item) || '—';
    rowKeys.add(r); colKeys.add(c);
    const key = r + '|' + c;
    counts[key] = (counts[key] || 0) + 1;
  });
  return { rowsArr: [...rowKeys].sort(), colsArr: [...colKeys].sort(), counts };
}
// Costruisce una tabella pivot (righe × colonne → conteggio), con totali di
// riga/colonna — riusata da Report ore sia per le lezioni (Classe × Materia)
// sia per appuntamenti+colloqui (Tipo × Classe).
function pivotTableHtml(items, rowKeyFn, colKeyFn, rowLabel) {
  const { rowsArr, colsArr, counts } = pivotData(items, rowKeyFn, colKeyFn);
  const thead = `<th>${escHtml(rowLabel)}</th>${colsArr.map(c => `<th class="vt-mono">${escHtml(c)}</th>`).join('')}<th class="vt-mono">Totale</th>`;
  const bodyRows = rowsArr.map(r => {
    let tot = 0;
    const cells = colsArr.map(c => {
      const n = counts[r + '|' + c] || 0;
      tot += n;
      return `<td class="vt-mono">${n || '–'}</td>`;
    }).join('');
    return `<tr><td>${escHtml(r)}</td>${cells}<td class="vt-mono"><strong>${tot}</strong></td></tr>`;
  }).join('');
  const totRow = `<tr><td><strong>Totale</strong></td>${colsArr.map(c => {
    const n = rowsArr.reduce((s, r) => s + (counts[r + '|' + c] || 0), 0);
    return `<td class="vt-mono"><strong>${n}</strong></td>`;
  }).join('')}<td class="vt-mono"><strong>${items.length}</strong></td></tr>`;
  return `<table class="voti-table"><thead><tr>${thead}</tr></thead><tbody>${bodyRows}${totRow}</tbody></table>`;
}
// Stessa tabella pivot, aggiunta a un jsPDF esistente con autoTable a partire
// da startY. Ritorna la Y successiva, per poter incatenare più tabelle.
function pivotAutoTablePDF(doc, items, rowKeyFn, colKeyFn, rowLabel, startY) {
  const { rowsArr, colsArr, counts } = pivotData(items, rowKeyFn, colKeyFn);
  const body = rowsArr.map(r => {
    let tot = 0;
    const cells = colsArr.map(c => { const n = counts[r + '|' + c] || 0; tot += n; return n || '–'; });
    return [r, ...cells, tot];
  });
  body.push(['Totale', ...colsArr.map(c => rowsArr.reduce((s, r) => s + (counts[r + '|' + c] || 0), 0)), items.length]);
  doc.autoTable({
    startY,
    head: [[rowLabel, ...colsArr, 'Totale']],
    body,
    styles: { fontSize: 8, cellPadding: 2.5 },
    headStyles: { fillColor: [91, 155, 255] },
    margin: { left: 14, right: 14 },
  });
  return doc.lastAutoTable.finalY + 10;
}

// Appuntamenti + colloqui svolti (data passata), stessi filtri Anno/Classe/
// Periodo di tutto il resto di Report ore. Normalizzati in un'unica lista
// {tipo, classe} così finiscono nella stessa pivot Tipo × Classe: la classe
// di un colloquio non è un campo diretto ma si ricava dall'alunno.
function reportOreInterazioniItems() {
  const oggi = todayISO();
  const inPeriodo = data => data && data < oggi
    && (!state.filtroDa || data >= state.filtroDa) && (!state.filtroA || data <= state.filtroA);
  const items = [];
  const anniA = state.year !== 'all' ? [state.year] : [...new Set([...allYears(), ...DB.getAppuntamentiAnni()])];
  anniA.forEach(anno => DB.getAppuntamenti(anno).forEach(a => {
    if (!inPeriodo(a.data)) return;
    if (state.klass !== 'all' && a.classe !== state.klass) return;
    items.push({ tipo: TIPI_APPUNTAMENTO[a.tipo] || a.tipo, classe: a.classe || '' });
  }));
  const anniC = state.year !== 'all' ? [state.year] : [...new Set([...allYears(), ...DB.getColloquiAnni()])];
  anniC.forEach(anno => DB.getColloqui(anno).forEach(c => {
    if (!inPeriodo(c.data)) return;
    const s = state.students.find(x => x.id === c.studenteId);
    const classe = s ? classeOf(s, anno) : '';
    if (state.klass !== 'all' && classe !== state.klass) return;
    items.push({ tipo: 'Colloquio', classe: classe || '' });
  }));
  return items;
}

// ── Report ore: lezioni svolte per classe/materia + appuntamenti/colloqui
//    svolti per tipo/classe — entrambe tabelle pivot. Rispetta gli stessi
//    filtri di Voti/Lezioni (Anno, Istituto, Classe, Periodo Da/A in alto):
//    riusa lezioniRows() così i due report restano sempre coerenti.
function renderReportOre() {
  const lezRows = lezioniRows();
  document.getElementById('report-ore-count').textContent = `${lezRows.length} or${lezRows.length === 1 ? 'a' : 'e'} svolt${lezRows.length === 1 ? 'a' : 'e'}`;
  document.getElementById('report-ore-empty').classList.toggle('hidden', !!lezRows.length);
  const wrap = document.getElementById('report-ore-wrap');
  const panel = wrap.closest('.table-panel');
  if (!lezRows.length) {
    wrap.innerHTML = ''; panel.classList.add('hidden');
  } else {
    panel.classList.remove('hidden');
    wrap.innerHTML = pivotTableHtml(lezRows.map(({ l }) => l), l => l.classe, l => l.materia, 'Classe');
  }

  const interazioni = reportOreInterazioniItems();
  document.getElementById('report-ore-appt-count').textContent = `${interazioni.length} tra appuntament${interazioni.length === 1 ? 'o' : 'i'} e colloqui svolti`;
  document.getElementById('report-ore-appt-empty').classList.toggle('hidden', !!interazioni.length);
  const apptWrap = document.getElementById('report-ore-appt-wrap');
  const apptPanel = apptWrap.closest('.table-panel');
  if (!interazioni.length) {
    apptWrap.innerHTML = ''; apptPanel.classList.add('hidden');
  } else {
    apptPanel.classList.remove('hidden');
    apptWrap.innerHTML = pivotTableHtml(interazioni, i => i.tipo, i => i.classe, 'Tipo');
  }
}
document.getElementById('btn-report-ore-pdf').addEventListener('click', () => {
  if (!window.jspdf) { alert('Libreria PDF non caricata (ricarica la pagina).'); return; }
  const lezRows = lezioniRows().map(({ l }) => l);
  const interazioni = reportOreInterazioniItems();
  if (!lezRows.length && !interazioni.length) return;
  const doc = new jspdf.jsPDF();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFontSize(14);
  doc.text('Report ore', 14, 15);
  doc.setFontSize(9);
  doc.setTextColor(120);
  const filtri = baseFilterSummary();
  doc.text(filtri.length ? filtri.join(' · ') : 'Nessun filtro applicato', 14, 21);
  let y = 27;
  if (lezRows.length) {
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text('Ore di lezione per classe e materia', 14, y);
    y = pivotAutoTablePDF(doc, lezRows, l => l.classe, l => l.materia, 'Classe', y + 4);
  }
  if (interazioni.length) {
    if (y > pageH - 40) { doc.addPage(); y = 16; }
    doc.setFontSize(11);
    doc.setTextColor(30);
    doc.text('Appuntamenti e colloqui svolti per tipo e classe', 14, y);
    y = pivotAutoTablePDF(doc, interazioni, i => i.tipo, i => i.classe, 'Tipo', y + 4);
  }
  doc.save(`report-ore-${todayISO()}.pdf`);
});

// ── Scheda alunno (pagina dedicata, non modale, sempre in sidebar) ───
function openStudent(id) {
  const s = state.students.find(x => x.id === id);
  if (!s) return;
  state.previousView = state.view === 'alunno-detail' ? state.previousView : state.view;
  state.openId = id;
  setView('alunno-detail');
}

// Tiene Anno/Istituto/Classe allineati a ciò che la Scheda alunno sta
// mostrando: senza questo, cambiando i filtri in alto la scheda continuava a
// mostrare l'alunno con la sua classe/anno precedente, sembrando appartenere
// a una classe diversa da quella indicata dai filtri.
function syncFiltersToStudentYear(s) {
  if (!state.openYear) return;
  const cls = classeOf(s, state.openYear) || 'all';
  const ist = (cls !== 'all' && DB.istitutoOf(state.openYear, cls)) || 'all';
  if (state.year === state.openYear && state.klass === cls && state.istituto === ist) return;
  state.year = state.openYear;
  state.istituto = ist;
  state.klass = cls;
  buildFilterBar();
}

// Punto d'ingresso chiamato dal router per la vista 'alunno-detail'. Se
// l'alunno mostrato non rientra più nei filtri correnti, azzera la scheda
// invece di lasciare visibili dati di un'altra classe/anno (come nella
// Scheda classe, che richiede filtri coerenti per mostrare qualcosa).
function renderAlunnoDetailPage() {
  const cur = state.students.find(x => x.id === state.openId);
  const stillMatches = cur && filteredNoSearch().some(x => x.id === cur.id);
  if (!stillMatches) state.openId = null;

  if (state.openId) {
    const s = state.students.find(x => x.id === state.openId);
    if (state.year !== 'all' && s.anni?.[state.year]) {
      state.openYear = state.year;
    } else {
      const years = Object.keys(s.anni || {}).sort();
      state.openYear = years[years.length - 1] || null;
    }
    syncFiltersToStudentYear(s);
  }

  const list = filteredNoSearch().sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
  const sel = document.getElementById('filter-alunno-scheda');
  sel.innerHTML = list.map(s =>
    `<option value="${s.id}" ${s.id === state.openId ? 'selected' : ''}>${escHtml(s.cognome)} ${escHtml(s.nome)}</option>`).join('');
  sel.value = state.openId || '';

  document.getElementById('ad-empty').classList.toggle('hidden', !!state.openId);
  document.getElementById('ad-content').classList.toggle('hidden', !state.openId);
  if (!state.openId) return;
  fillStudentDetail(state.students.find(x => x.id === state.openId));
}

function fillStudentDetail(s) {
  const years = Object.keys(s.anni || {}).sort();
  document.getElementById('modal-title').textContent = `${s.cognome} ${s.nome}`;
  document.getElementById('ad-avatar').textContent = initials(s);
  document.getElementById('ad-avatar').style.setProperty('--card-accent', colorOf(s));
  setModalClasse(s);
  document.getElementById('modal-media').textContent = `media ${fmt(studentAvg(s, 'all'))}`;
  setModalProfilo(s);
  renderAdBmSummary(s);
  renderYearTabs(years);
  renderStudentSummary();
  renderGrades();
  renderStudentChart();
  renderStudentExtraCharts();
}

// Tab anni cliccabili (sostituiscono la vecchia select, più leggibili con
// poche opzioni come sono di solito gli anni scolastici di un alunno)
function renderYearTabs(years) {
  const wrap = document.getElementById('ad-year-tabs');
  wrap.innerHTML = years.length
    ? years.map(y => `<button class="year-tab ${y === state.openYear ? 'active' : ''}" data-year="${escHtml(y)}">${escHtml(y)}</button>`).join('')
    : '<span class="stat-sub">Nessun anno registrato</span>';
  wrap.querySelectorAll('[data-year]').forEach(btn => btn.addEventListener('click', () => {
    state.openYear = btn.dataset.year;
    const s = state.students.find(x => x.id === state.openId);
    if (s) { setModalClasse(s); syncFiltersToStudentYear(s); }
    wrap.querySelectorAll('.year-tab').forEach(b => b.classList.toggle('active', b.dataset.year === state.openYear));
    renderGrades();
  }));
}

// Classe nell'anno selezionato nella scheda (o la più recente)
function setModalClasse(s) {
  const c = classeOf(s, state.openYear || 'all');
  document.getElementById('modal-classe').textContent =
    c ? `${c}${state.openYear ? ' · ' + state.openYear : ''}` : '—';
}

function setModalProfilo(s) {
  const el = document.getElementById('modal-profilo');
  const b = profiloBadge(s);
  el.textContent = b;
  el.className = 'profilo-badge' + (b ? ' pb-' + s.profilo.toLowerCase() : ' hidden');
}

// Riepilogo votazioni: una riga per materia con media, numero di voti e
// data dell'ultimo voto (su tutti gli anni, complementare ai grafici)
function renderStudentSummary() {
  const s = state.students.find(x => x.id === state.openId);
  const wrap = document.getElementById('ad-summary-wrap');
  if (!s) { wrap.innerHTML = ''; return; }
  const grades = gradesOf(s, 'all');
  if (!grades.length) { wrap.innerHTML = '<p class="stat-sub" style="padding:12px">Nessun voto registrato.</p>'; return; }

  const byMateria = {};
  grades.forEach(g => (byMateria[g.materia] ||= []).push(g));
  let records = Object.keys(byMateria).map(materia => {
    const arr = byMateria[materia].sort((a, b) => (a.data > b.data ? 1 : -1));
    return { materia, media: avg(arr.map(g => g.voto)), nVoti: arr.length, ultimo: arr[arr.length - 1].data };
  });
  records = sortRows('summary', records, {
    materia: r => r.materia, media: r => r.media, voti: r => r.nVoti, ultimo: r => r.ultimo,
  });

  wrap.innerHTML = `
  <table class="voti-table">
    <thead><tr>
      <th class="sortable" data-sort="materia">Materia${sortIcon('summary', 'materia')}</th>
      <th class="sortable" data-sort="media">Media${sortIcon('summary', 'media')}</th>
      <th class="sortable" data-sort="voti">Voti${sortIcon('summary', 'voti')}</th>
      <th class="col-hide-m sortable" data-sort="ultimo">Ultimo voto${sortIcon('summary', 'ultimo')}</th>
    </tr></thead>
    <tbody>
      ${records.map(r => `
        <tr>
          <td>${escHtml(r.materia)}</td>
          <td class="vt-mono vt-voto ${gradeClass(r.media)}">${fmt(r.media)}</td>
          <td class="vt-mono">${r.nVoti}</td>
          <td class="col-hide-m vt-mono">${escHtml(fmtData(r.ultimo))}</td>
        </tr>`).join('')}
    </tbody>
  </table>`;
  wireSort(wrap, 'summary', renderStudentSummary);
}

function renderGrades() {
  const s = state.students.find(x => x.id === state.openId);
  const wrap = document.getElementById('grades-wrap');
  if (!s || !state.openYear || !s.anni[state.openYear]) { wrap.innerHTML = '<p class="stat-sub">Nessun voto per questo anno.</p>'; return; }
  const materie = s.anni[state.openYear].materie || {};
  const names = Object.keys(materie).sort();
  if (!names.length) { wrap.innerHTML = '<p class="stat-sub">Nessun voto per questo anno.</p>'; return; }

  wrap.innerHTML = names.map(materia => {
    const arr = [...materie[materia]].sort((a, b) => (a.data > b.data ? 1 : -1));
    const m = avg(arr.map(g => g.voto));
    const rows = arr.map(g => `
      <div class="grade-row">
        <div class="grade-voto ${gradeClass(g.voto)}">${fmt(g.voto)}</div>
        <div class="grade-info">
          <div class="grade-desc">${escHtml(g.desc || materia)}</div>
          <div class="grade-sub">${escHtml(fmtData(g.data))}</div>
          ${g.commento ? `<div class="grade-commento">${escHtml(g.commento)}</div>` : ''}
        </div>
        <span class="tipo-badge">${escHtml(g.tipo)}</span>
        <button class="grade-edit" data-edit="${g.id}" data-mat="${escHtml(materia)}" title="Modifica voto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button class="grade-rm" data-rm="${g.id}" data-mat="${escHtml(materia)}" title="Elimina voto">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>`).join('');
    return `
      <div class="subj-block">
        <div class="subj-head">
          <span class="subj-name">${escHtml(materia)}</span>
          <span class="subj-avg ${gradeClass(m)}">${fmt(m)}</span>
        </div>
        ${rows}
      </div>`;
  }).join('');

  wrap.querySelectorAll('.grade-rm').forEach(btn => btn.addEventListener('click', async () => {
    const s2 = state.students.find(x => x.id === state.openId);
    DB.removeGrade(s2, state.openYear, btn.dataset.mat, btn.dataset.rm);
    await DB.put(s2);
    // l'anno potrebbe essere svanito se era l'ultimo voto
    const years = Object.keys(s2.anni || {}).sort();
    if (!s2.anni[state.openYear]) state.openYear = years[years.length - 1] || null;
    refreshOpen();
  }));
  wrap.querySelectorAll('.grade-edit').forEach(btn => btn.addEventListener('click', () => {
    openForm('grade', { editing: { sid: state.openId, anno: state.openYear, materia: btn.dataset.mat, gradeId: btn.dataset.edit } });
  }));
}

// "AAAA-MM-GG" → "GG/MM" per le etichette dell'asse
function fmtDateShort(iso) {
  const parts = String(iso || '').split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}` : (iso || '');
}

// Andamento per materia nel tempo: un punto per OGNI voto (non una media per
// anno) — con dati di un solo anno scolastico una media-per-anno darebbe un
// singolo punto invece di una linea leggibile.
function renderStudentChart() {
  const s = state.students.find(x => x.id === state.openId);
  if (!s) return;
  const tc = themeColors();

  const materie = new Set();
  const perMateria = {}; // materia → { data → voto (media se più voti nello stesso giorno) }
  const allDates = new Set();
  Object.values(s.anni || {}).forEach(y => {
    Object.entries(y.materie || {}).forEach(([materia, arr]) => {
      materie.add(materia);
      arr.forEach(g => {
        allDates.add(g.data);
        const cur = (perMateria[materia] ||= {})[g.data];
        perMateria[materia][g.data] = cur != null ? (cur + g.voto) / 2 : g.voto;
      });
    });
  });
  const dates = [...allDates].sort();
  const cols = ['#5b9bff', '#2ecc71', '#ffb400', '#ff3b3b', '#9b59b6', '#16a085', '#e67e22', '#e84393'];

  const datasets = [...materie].map((m, i) => ({
    label: m,
    data: dates.map(d => perMateria[m]?.[d] ?? null),
    borderColor: cols[i % cols.length], backgroundColor: cols[i % cols.length],
    tension: 0.3, pointRadius: 3, borderWidth: 2, spanGaps: true,
  }));

  drawChart('chart-student', {
    type: 'line',
    data: { labels: dates.map(fmtDateShort), datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { color: tc.text, boxWidth: 10, font: { size: 10 } } } },
      scales: {
        y: { suggestedMin: 0, suggestedMax: 10, ticks: { color: tc.text }, grid: { color: tc.grid } },
        x: { ticks: { color: tc.text, maxRotation: 60, minRotation: 30 }, grid: { color: tc.grid } },
      },
    },
  });
}

// Grafici aggiuntivi nella scheda alunno: media per materia + distribuzione voti
function renderStudentExtraCharts() {
  const s = state.students.find(x => x.id === state.openId);
  if (!s) return;
  const tc = themeColors();
  const base = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { ticks: { color: tc.text }, grid: { color: tc.grid } },
      x: { ticks: { color: tc.text }, grid: { color: tc.grid } },
    },
  };
  const allGrades = gradesOf(s, 'all');

  // Media per materia (su tutti gli anni)
  const subjMap = {};
  allGrades.forEach(g => (subjMap[g.materia] ||= []).push(g.voto));
  const subjLabels = Object.keys(subjMap).sort();
  const subjAvgs = subjLabels.map(m => avg(subjMap[m]));
  drawChart('chart-student-materie', {
    type: 'bar',
    data: { labels: subjLabels, datasets: [{
      data: subjAvgs,
      backgroundColor: subjAvgs.map(v => v >= 6 ? tc.green : v >= 5 ? tc.amber : tc.red),
      borderRadius: 6,
    }] },
    options: { ...base, scales: { ...base.scales, y: { ...base.scales.y, suggestedMin: 0, suggestedMax: 10 } } },
  });

  // Distribuzione dei propri voti (1..10)
  const buckets = Array(11).fill(0);
  allGrades.forEach(g => { buckets[Math.round(g.voto)]++; });
  drawChart('chart-student-dist', {
    type: 'bar',
    data: { labels: [...Array(10)].map((_, i) => i + 1), datasets: [{
      data: buckets.slice(1, 11),
      backgroundColor: [...Array(10)].map((_, i) => (i + 1) >= 6 ? tc.green : (i + 1) >= 5 ? tc.amber : tc.red),
      borderRadius: 5,
    }] },
    options: base,
  });
}

async function refreshOpen() {
  const s = state.students.find(x => x.id === state.openId);
  if (!s) { renderAlunnoDetailPage(); return; }
  fillStudentDetail(s);
  buildFilterBar();
  document.getElementById('stu-count').textContent = `${state.students.length} alunni`;
}

function backFromStudent() {
  state.openId = null;
  state.view = state.previousView || 'alunni';
  renderView();
}
document.getElementById('ad-back').addEventListener('click', backFromStudent);

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (!document.getElementById('csv-overlay').classList.contains('hidden')) closeCsv();
  else if (!document.getElementById('form-overlay').classList.contains('hidden')) closeForm();
  else if (!promoOverlay.classList.contains('hidden')) closePromo();
  else if (!votiPreviewOverlay.classList.contains('hidden')) closeVotiPreview();
  else if (!votiImportOverlay.classList.contains('hidden')) closeVotiImport();
  else if (!document.getElementById('lezione-overlay').classList.contains('hidden')) closeLezione();
  else if (!document.getElementById('orario-slot-overlay').classList.contains('hidden')) closeOrarioSlot();
  else if (!lezCsvOverlay.classList.contains('hidden')) closeLezCsv();
  else if (state.view === 'alunno-detail') backFromStudent();
});

document.getElementById('btn-del-student').addEventListener('click', async () => {
  const s = state.students.find(x => x.id === state.openId);
  if (!s) return;
  if (!confirm(`Eliminare ${s.cognome} ${s.nome} e tutti i suoi voti? L'azione è irreversibile.`)) return;
  await DB.remove(s.id);
  state.students = state.students.filter(x => x.id !== s.id);
  backFromStudent();
  renderAll();
});

// ── Form (anagrafica / voto / classe) ────────────────────────────────
const formOverlay = document.getElementById('form-overlay');
let formMode = null; // 'student-new' | 'student-edit' | 'grade' | 'grade-class' | 'classe-meta'
let formCtx = null;  // contesto extra (es. {anno, classe} per classe-meta)

function openForm(mode, ctx) {
  formMode = mode;
  formCtx = ctx || null;
  const body = document.getElementById('form-body');
  const title = document.getElementById('form-title');
  const s = state.students.find(x => x.id === state.openId);
  document.getElementById('form-box').classList.add('modal-box-sm');

  if (mode === 'grade') {
    // Modifica di un voto esistente: formCtx.editing = {sid, anno, materia, gradeId}
    const editing = formCtx && formCtx.editing;
    const editS = editing ? state.students.find(x => x.id === editing.sid) : null;
    const editGrade = editing ? editS?.anni?.[editing.anno]?.materie?.[editing.materia]?.find(g => g.id === editing.gradeId) : null;
    const s2 = editing ? editS : s; // alunno di riferimento (fisso se in modifica)

    title.textContent = editing ? 'Modifica voto' : 'Nuovo voto';
    const years = new Set(); const subs = new Set();
    state.students.forEach(x => Object.entries(x.anni || {}).forEach(([y, v]) => {
      years.add(y);
      Object.keys(v.materie || {}).forEach(m => subs.add(m));
    }));
    const yearsArr = [...years].sort();
    const defAnno = editing ? editing.anno
      : state.openYear || (state.year !== 'all' ? state.year : yearsArr[yearsArr.length - 1]) || DB.currentAnno();

    // Alunno di riferimento: quello aperto nella scheda (o in modifica), altrimenti
    // select con filtro Classe per trovarlo più in fretta tra tanti alunni
    const stuSelect = !s2 ? `
      <div class="vf-row">
        <label class="vf-label">Classe
          <select class="vf-input" id="f-filtro-classe"></select>
        </label>
        <label class="vf-label">Alunno
          <select class="vf-input" id="f-alunno"></select>
        </label>
      </div>` : '';

    body.innerHTML = `
      ${stuSelect}
      <label class="vf-label">Anno scolastico
        <input class="vf-input" id="f-anno" list="anni-list" value="${escHtml(defAnno)}" placeholder="es. 2025/26"/>
        <datalist id="anni-list">${yearsArr.map(y => `<option value="${y}">`).join('')}</datalist>
      </label>
      <label class="vf-label">Materia
        <input class="vf-input" id="f-materia" list="mat-list" value="${editing ? escHtml(editing.materia) : ''}" placeholder="es. Matematica"/>
        <datalist id="mat-list">${[...subs].sort().map(m => `<option value="${escHtml(m)}">`).join('')}</datalist>
      </label>
      <div class="vf-row">
        <label class="vf-label">Voto
          <input class="vf-input" id="f-voto" list="voto-list" value="${editGrade ? escHtml(String(editGrade.voto)) : ''}" placeholder="es. 7, 7½, 7-, 7+"/>
        </label>
        <label class="vf-label">Tipo
          <select class="vf-input" id="f-tipo">
            ${['scritto', 'orale', 'pratico'].map(t => `<option ${editGrade?.tipo === t ? 'selected' : ''}>${t}</option>`).join('')}
          </select>
        </label>
      </div>
      <label class="vf-label">Data
        <input class="vf-input" id="f-data" type="date" value="${editGrade ? escHtml(editGrade.data) : todayISO()}"/>
      </label>
      <label class="vf-label">Descrizione / Argomento
        <input class="vf-input" id="f-desc" value="${escHtml(editGrade?.desc || '')}" placeholder="es. Verifica derivate"/>
      </label>
      <label class="vf-label">Commento (facoltativo)
        <textarea class="vf-input" id="f-commento" placeholder="Note, feedback per l'alunno…">${escHtml(editGrade?.commento || '')}</textarea>
      </label>`;

    if (!s2) {
      const selC = document.getElementById('f-filtro-classe');
      const selA = document.getElementById('f-alunno');
      const annoInput = document.getElementById('f-anno');

      function syncAlunni() {
        const anno = annoInput.value.trim();
        const cl = selC.value;
        const opts = state.students
          .filter(x => cl === 'all' || x.anni?.[anno]?.classe === cl)
          .sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
        selA.innerHTML = opts.map(x => `<option value="${x.id}">${escHtml(x.cognome)} ${escHtml(x.nome)}${DB.classeCorrente(x) ? ` (${escHtml(DB.classeCorrente(x))})` : ''}</option>`).join('')
          || '<option value="">— nessun alunno —</option>';
      }
      function syncClassi() {
        const cs = ['all', ...allClasses(state.students, annoInput.value.trim() || 'all', 'all')];
        selC.innerHTML = cs.map(c => `<option value="${escHtml(c)}">${c === 'all' ? 'Tutte le classi' : escHtml(c)}</option>`).join('');
        if (cs.includes(state.klass)) selC.value = state.klass;
        syncAlunni();
      }
      selC.addEventListener('change', syncAlunni);
      annoInput.addEventListener('input', syncClassi);
      syncClassi();
    }
  } else if (mode === 'grade-class') {
    title.textContent = 'Voto classe';
    document.getElementById('form-box').classList.remove('modal-box-sm');
    const defAnno = state.year !== 'all' ? state.year : DB.currentAnno();
    const yearOpts = [...new Set([...allYears(), DB.currentAnno()])].sort();
    const subs = new Set();
    state.students.forEach(x => Object.values(x.anni || {}).forEach(v => Object.keys(v.materie || {}).forEach(m => subs.add(m))));

    body.innerHTML = `
      <div class="vf-row">
        <label class="vf-label">Anno scolastico
          <input class="vf-input" id="gc-anno" list="gc-anni-list" value="${escHtml(defAnno)}" placeholder="es. 2025/26"/>
          <datalist id="gc-anni-list">${yearOpts.map(y => `<option value="${escHtml(y)}">`).join('')}</datalist>
        </label>
        <label class="vf-label">Classe
          <select class="vf-input" id="gc-classe"></select>
        </label>
      </div>
      <label class="vf-label">Materia
        <input class="vf-input" id="gc-materia" list="gc-mat-list" placeholder="es. Matematica"/>
        <datalist id="gc-mat-list">${[...subs].sort().map(m => `<option value="${escHtml(m)}">`).join('')}</datalist>
      </label>
      <div class="vf-row">
        <label class="vf-label">Tipo
          <select class="vf-input" id="gc-tipo"><option>scritto</option><option>orale</option><option>pratico</option></select>
        </label>
        <label class="vf-label">Data
          <input class="vf-input" id="gc-data" type="date" value="${todayISO()}"/>
        </label>
      </div>
      <label class="vf-label">Descrizione
        <input class="vf-input" id="gc-desc" placeholder="es. Verifica derivate"/>
      </label>
      <label class="vf-label">Commento (facoltativo, uguale per tutta la classe)
        <textarea class="vf-input" id="gc-commento" placeholder="Note comuni…"></textarea>
      </label>
      <label class="vf-label">Voti
        <div class="gc-list" id="gc-list"></div>
      </label>`;

    const annoInput = document.getElementById('gc-anno');
    const selClasse = document.getElementById('gc-classe');
    const listEl = document.getElementById('gc-list');

    function syncList() {
      const anno = annoInput.value.trim();
      const cl = selClasse.value;
      const stu = state.students
        .filter(x => x.anni?.[anno]?.classe === cl)
        .sort((a, b) => `${a.cognome} ${a.nome}`.localeCompare(`${b.cognome} ${b.nome}`));
      listEl.innerHTML = stu.length
        ? stu.map(x => `
          <div class="gc-row">
            <span class="gc-name">${escHtml(x.cognome)} ${escHtml(x.nome)}</span>
            <input class="vf-input gc-voto" list="voto-list" data-sid="${x.id}" placeholder="—"/>
          </div>`).join('')
        : '<p class="stat-sub">Nessun alunno in questa classe per l\'anno indicato.</p>';
    }
    function syncClassi() {
      const cs = allClasses(state.students, annoInput.value.trim() || 'all', 'all');
      const prev = selClasse.value;
      selClasse.innerHTML = cs.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('') || '<option value="">—</option>';
      if (cs.includes(state.klass)) selClasse.value = state.klass;
      else if (cs.includes(prev)) selClasse.value = prev;
      syncList();
    }
    annoInput.addEventListener('input', syncClassi);
    selClasse.addEventListener('change', syncList);
    syncClassi();
  } else if (mode === 'classe-meta') {
    document.getElementById('form-box').classList.remove('modal-box-sm');
    title.textContent = `Classe ${formCtx.classe} · ${formCtx.anno}`;
    const meta = DB.getClasseMeta(formCtx.anno, formCtx.classe);
    const current = new Set(meta.materie);
    const names = allMaterieNames();
    const istituti = DB.allIstituti();
    const indirizzoOptgroups = Object.entries(INDIRIZZI_MINISTERIALI).map(([grp, opts]) => `
      <optgroup label="${escHtml(grp)}">
        ${opts.map(o => `<option value="${escHtml(o)}" ${meta.indirizzo === o ? 'selected' : ''}>${escHtml(o)}</option>`).join('')}
      </optgroup>`).join('');

    body.innerHTML = `
      <label class="vf-label">Istituto (scuola)
        <input class="vf-input" id="cm-istituto" list="cm-istituti-list" value="${escHtml(meta.istituto)}" placeholder="es. Liceo Scientifico N. Rosa (LI02)"/>
        <datalist id="cm-istituti-list">${istituti.map(i => `<option value="${escHtml(i)}">`).join('')}</datalist>
      </label>
      <label class="vf-label">Indirizzo di studio
        <select class="vf-input" id="cm-indirizzo">
          <option value="" ${!meta.indirizzo ? 'selected' : ''}>— non indicato —</option>
          ${indirizzoOptgroups}
        </select>
      </label>
      <label class="vf-label">Materie insegnate
        <div class="mc-list" id="mc-list">
          ${names.length ? names.map(m => `
            <label class="mc-chk">
              <input type="checkbox" value="${escHtml(m)}" ${current.has(m) ? 'checked' : ''}/>
              <span>${escHtml(m)}</span>
            </label>`).join('') : '<p class="stat-sub">Nessuna materia ancora registrata: aggiungine una qui sotto.</p>'}
        </div>
      </label>
      <div class="vf-row">
        <label class="vf-label">Aggiungi materia
          <input class="vf-input" id="mc-new" placeholder="es. Educazione civica"/>
        </label>
        <label class="vf-label" style="justify-content:flex-end">
          <button class="btn-ghost" type="button" id="mc-add-btn">Aggiungi</button>
        </label>
      </div>`;

    function addMateria() {
      const inp = document.getElementById('mc-new');
      const v = inp.value.trim();
      if (!v) return;
      const list = document.getElementById('mc-list');
      const dup = [...list.querySelectorAll('input[type=checkbox]')].some(i => i.value.toLowerCase() === v.toLowerCase());
      if (!dup) {
        const empty = list.querySelector('.stat-sub'); if (empty) empty.remove();
        const lbl = document.createElement('label');
        lbl.className = 'mc-chk';
        lbl.innerHTML = `<input type="checkbox" value="${escHtml(v)}" checked/><span>${escHtml(v)}</span>`;
        list.appendChild(lbl);
      }
      inp.value = '';
      inp.focus();
    }
    document.getElementById('mc-add-btn').addEventListener('click', addMateria);
    document.getElementById('mc-new').addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      e.stopPropagation();
      addMateria();
    });
  } else {
    const edit = mode === 'student-edit';
    title.textContent = edit ? 'Modifica alunno' : 'Nuovo alunno';
    const v = edit ? s : { nome: '', cognome: '', profilo: 'ND', profiloTipo: [], note: '' };
    const vTipi = toTipiArray(v.profiloTipo);
    // Iscrizione proposta: per un alunno esistente l'ultimo anno presente,
    // altrimenti l'anno scolastico in corso
    const sYears = edit ? Object.keys(s.anni || {}).sort() : [];
    const defAnno = sYears[sYears.length - 1] || DB.currentAnno();
    const defClasse = edit ? (s.anni?.[defAnno]?.classe || '') : '';
    const yearOpts = [...new Set([...allYears(), DB.currentAnno()])].sort();
    const classes = allClasses(state.students, 'all', 'all');
    body.innerHTML = `
      <div class="vf-row">
        <label class="vf-label">Nome<input class="vf-input" id="f-nome" value="${escHtml(v.nome)}"/></label>
        <label class="vf-label">Cognome<input class="vf-input" id="f-cognome" value="${escHtml(v.cognome)}"/></label>
      </div>
      <div class="vf-row">
        <label class="vf-label">Anno scolastico
          <input class="vf-input" id="f-anno-s" list="anni-s-list" value="${escHtml(defAnno)}" placeholder="es. 2025/26"/>
          <datalist id="anni-s-list">${yearOpts.map(y => `<option value="${escHtml(y)}">`).join('')}</datalist>
        </label>
        <label class="vf-label">Classe in quell'anno
          <input class="vf-input" id="f-classe" list="classi-list" value="${escHtml(defClasse)}" placeholder="es. 5A"/>
          <datalist id="classi-list">${classes.map(c => `<option value="${escHtml(c)}">`).join('')}</datalist>
        </label>
      </div>
      <div class="vf-row">
        <label class="vf-label">Profilo
          <select class="vf-input" id="f-profilo">
            ${Object.entries(PROFILI).map(([c, l]) =>
              `<option value="${c}" ${(v.profilo || 'ND') === c ? 'selected' : ''}>${l}</option>`).join('')}
          </select>
        </label>
      </div>
      <label class="vf-label" id="f-ptipo-wrap">Tipologie (selezionabili più di una)
        <div class="mc-list" id="f-ptipi-list"></div>
      </label>
      <label class="vf-label">Note<textarea class="vf-input" id="f-note">${escHtml(v.note || '')}</textarea></label>`;

    // In modifica: cambiando anno, precompila la classe già registrata per quell'anno
    if (edit) {
      document.getElementById('f-anno-s').addEventListener('input', e => {
        const c = s.anni?.[e.target.value.trim()]?.classe;
        if (c !== undefined) document.getElementById('f-classe').value = c;
      });
    }

    // Tipologie dipendenti dal profilo (checkbox multiple, codici PROFILO_TIPI)
    const selP = document.getElementById('f-profilo');
    const wrapT = document.getElementById('f-ptipo-wrap');
    const listT = document.getElementById('f-ptipi-list');
    function syncTipo() {
      const tipi = PROFILO_TIPI[selP.value];
      wrapT.classList.toggle('hidden', !tipi);
      listT.innerHTML = tipi
        ? tipi.map(t => `
          <label class="mc-chk">
            <input type="checkbox" value="${t.c}" ${vTipi.includes(t.c) ? 'checked' : ''}/>
            <span>${escHtml(t.l)}</span>
          </label>`).join('')
        : '';
    }
    selP.addEventListener('change', syncTipo);
    syncTipo();
  }
  formOverlay.classList.remove('hidden');
  setTimeout(() => body.querySelector('input,select,textarea')?.focus(), 30);
}

function closeForm() { formOverlay.classList.add('hidden'); formMode = null; formCtx = null; }

async function saveForm() {
  const val = id => document.getElementById(id)?.value.trim() ?? '';
  try {
    if (formMode === 'grade') {
      const editing = formCtx && formCtx.editing;
      const targetId = editing ? editing.sid : (state.openId || val('f-alunno'));
      const s = state.students.find(x => x.id === targetId);
      if (!s) { alert('Seleziona un alunno.'); return; }
      const anno = val('f-anno'), materia = val('f-materia');
      const voto = parseVotoArgo(val('f-voto'));
      if (!anno || !materia || !Number.isFinite(voto)) { alert('Anno, materia e voto sono obbligatori.'); return; }
      const attrs = { voto, tipo: val('f-tipo'), data: val('f-data'), desc: val('f-desc'), commento: val('f-commento') };
      if (editing) DB.editGrade(s, editing.anno, editing.materia, editing.gradeId, anno, materia, attrs);
      else DB.addGrade(s, anno, materia, attrs);
      await DB.put(s);
      closeForm();
      if (state.view === 'alunno-detail') {
        state.openYear = anno;
        refreshOpen();
      } else {
        renderAll();
      }
    } else if (formMode === 'grade-class') {
      const anno = val('gc-anno'), materia = val('gc-materia');
      const tipo = val('gc-tipo'), data = val('gc-data'), desc = val('gc-desc'), commento = val('gc-commento');
      if (!anno || !materia) { alert('Anno e materia sono obbligatori.'); return; }
      const inputs = [...document.querySelectorAll('.gc-voto')].filter(i => i.value.trim() !== '');
      const changed = [];
      inputs.forEach(inp => {
        const voto = parseVotoArgo(inp.value);
        if (!Number.isFinite(voto)) return;
        const stu = state.students.find(x => x.id === inp.dataset.sid);
        if (!stu) return;
        DB.addGrade(stu, anno, materia, { voto, tipo, data, desc, commento });
        changed.push(stu);
      });
      if (!changed.length) { alert('Inserisci almeno un voto valido.'); return; }
      await DB.putMany(changed);
      closeForm();
      renderAll();
      alert(`Aggiunti ${changed.length} voti.`);
    } else if (formMode === 'classe-meta') {
      const istituto = val('cm-istituto');
      const indirizzo = val('cm-indirizzo');
      const materie = [...document.querySelectorAll('#mc-list input[type=checkbox]:checked')].map(i => i.value);
      const { anno: metaAnno, classe: metaClasse } = formCtx; // catturati prima di closeForm(), che azzera formCtx
      await DB.setClasseMeta(metaAnno, metaClasse, { istituto, indirizzo, materie });
      closeForm();
      renderAll();
    } else {
      const nome = val('f-nome'), cognome = val('f-cognome');
      if (!nome && !cognome) { alert('Inserisci almeno nome o cognome.'); return; }
      const profilo = val('f-profilo') || 'ND';
      const profiloTipo = profilo === 'ND' ? [] :
        [...document.querySelectorAll('#f-ptipi-list input:checked')].map(i => i.value);
      const anno = val('f-anno-s') || DB.currentAnno();
      const classe = val('f-classe');
      if (formMode === 'student-edit') {
        const s = state.students.find(x => x.id === state.openId);
        Object.assign(s, { nome, cognome, profilo, profiloTipo, note: val('f-note') });
        DB.enroll(s, anno, classe);
        await DB.put(s);
        closeForm();
        document.getElementById('modal-title').textContent = `${s.cognome} ${s.nome}`;
        setModalClasse(s);
        setModalProfilo(s);
        buildFilterBar();
      } else {
        const s = DB.newStudent(nome, cognome);
        DB.enroll(s, anno, classe);
        s.profilo = profilo;
        s.profiloTipo = profiloTipo;
        s.note = val('f-note');
        await DB.put(s);
        state.students.push(s);
        closeForm();
        renderAll();
        openStudent(s.id);
      }
    }
  } catch (err) {
    // Senza questo, un errore di salvataggio passa inosservato: il form si
    // richiude (o resta com'è) senza che l'utente capisca perché "non salva".
    alert('Errore durante il salvataggio: ' + err.message);
  }
}

document.getElementById('btn-add-student').addEventListener('click', () => openForm('student-new'));
document.getElementById('btn-edit-student').addEventListener('click', () => openForm('student-edit'));
document.getElementById('btn-add-grade').addEventListener('click', () => openForm('grade'));
document.getElementById('btn-add-grade-alunno').addEventListener('click', () => {
  if (!state.students.length) { alert('Aggiungi prima un alunno.'); return; }
  openForm('grade');
});
document.getElementById('btn-add-grade-classe').addEventListener('click', () => {
  if (!state.students.length) { alert('Aggiungi prima un alunno.'); return; }
  openForm('grade-class');
});
document.getElementById('form-save').addEventListener('click', saveForm);
document.getElementById('form-cancel').addEventListener('click', closeForm);
document.getElementById('form-close').addEventListener('click', closeForm);
formOverlay.addEventListener('click', e => { if (e.target === formOverlay) closeForm(); });
document.getElementById('form-body').addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') { e.preventDefault(); saveForm(); }
});

// ── Import CSV alunni ───────────────────────────────────────────────
const csvOverlay = document.getElementById('csv-overlay');
function closeCsv() { csvOverlay.classList.add('hidden'); }

document.getElementById('btn-import-csv').addEventListener('click', () => csvOverlay.classList.remove('hidden'));
document.getElementById('csv-close').addEventListener('click', closeCsv);
document.getElementById('csv-cancel').addEventListener('click', closeCsv);
csvOverlay.addEventListener('click', e => { if (e.target === csvOverlay) closeCsv(); });
document.getElementById('csv-choose').addEventListener('click', () => document.getElementById('csv-file').click());

// Normalizza profilo/tipologia dai valori CSV ai codici interni.
// La colonna Tipologia può contenere più codici separati da "/" (es. "F81.0/F90"),
// dato che uno studente può avere più tipologie contemporaneamente.
function normProfilo(p, t) {
  const P = String(p || '').trim().toUpperCase();
  const profilo = P === 'PEI' ? 'PEI' : P === 'PDP' ? 'PDP' : 'ND';
  if (profilo === 'ND') return { profilo, profiloTipo: [] };
  const validCodes = new Set(PROFILO_TIPI[profilo].map(x => x.c.toUpperCase()));
  const profiloTipo = String(t || '').split('/').map(x => x.trim().toUpperCase()).filter(x => validCodes.has(x));
  return { profilo, profiloTipo };
}

// Normalizza l'anno scolastico: "2025" → "2025/26", "2025-26"/"2025/2026" → "2025/26";
// vuoto → anno in corso
function normAnno(a) {
  let s = String(a || '').trim().replace(/-/g, '/');
  if (!s) return DB.currentAnno();
  if (/^\d{4}$/.test(s)) { const y = +s; return `${y}/${String((y + 1) % 100).padStart(2, '0')}`; }
  if (/^\d{4}\/\d{4}$/.test(s)) return s.slice(0, 5) + s.slice(7);
  return s;
}

// Parser CSV minimale: separatore ; o , (il più frequente), intestazione opzionale
// Colonne: Nome;Cognome;Classe;Anno;Profilo;Tipologia
function parseStudentsCSV(text) {
  const nSemi = (text.match(/;/g) || []).length;
  const nComma = (text.match(/,/g) || []).length;
  const delim = nSemi >= nComma ? ';' : ',';
  const rows = text.split(/\r?\n/)
    .map(l => l.trim()).filter(Boolean)
    .map(l => l.split(delim).map(c => c.trim().replace(/^"|"$/g, '')));
  if (!rows.length) return [];

  const head = rows[0].map(c => c.toLowerCase());
  const hasHeader = head.some(c => c.includes('nome') || c.includes('class'));
  if (hasHeader) {
    const iNome = head.findIndex(c => c.includes('nome') && !c.includes('cognome'));
    const iCogn = head.findIndex(c => c.includes('cognome'));
    const iClas = head.findIndex(c => c.includes('class'));
    const iAnno = head.findIndex(c => c.includes('anno'));
    const iProf = head.findIndex(c => c.includes('profilo'));
    const iTipo = head.findIndex(c => c.includes('tipolog'));
    return rows.slice(1).map(r => ({
      nome: iNome >= 0 ? (r[iNome] || '') : '',
      cognome: iCogn >= 0 ? (r[iCogn] || '') : '',
      classe: iClas >= 0 ? (r[iClas] || '') : '',
      anno: normAnno(iAnno >= 0 ? r[iAnno] : ''),
      ...normProfilo(iProf >= 0 ? r[iProf] : '', iTipo >= 0 ? r[iTipo] : ''),
    }));
  }
  return rows.map(r => ({
    nome: r[0] || '', cognome: r[1] || '', classe: r[2] || '',
    anno: normAnno(r[3]),
    ...normProfilo(r[4], r[5]),
  }));
}

// Modello CSV scaricabile dalla modale
document.getElementById('csv-template').addEventListener('click', () => {
  const anno = DB.currentAnno();
  const righe = [
    'Nome;Cognome;Classe;Anno;Profilo;Tipologia',
    `Mario;Rossi;3A;${anno};ND;`,
    `Lucia;Bianchi;3A;${anno};PDP;F81.0/F90`,
    `Marco;Verdi;3A;${anno};PEI;VIS`,
  ].join('\r\n');
  downloadBlob('﻿' + righe, 'modello-alunni.csv', 'text/csv;charset=utf-8');
});

document.getElementById('csv-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const text = await file.text();
    const list = parseStudentsCSV(text).filter(r => r.nome || r.cognome);
    if (!list.length) { alert('Nessun alunno trovato nel file.'); return; }
    if (!confirm(`Importare ${list.length} alunni?`)) return;
    const docs = list.map(r => {
      const s = DB.newStudent(r.nome, r.cognome);
      DB.enroll(s, r.anno, r.classe);
      s.profilo = r.profilo;
      s.profiloTipo = r.profiloTipo;
      return s;
    });
    await DB.putMany(docs);
    state.students.push(...docs);
    closeCsv();
    renderAll();
    alert(`Importati ${docs.length} alunni.`);
  } catch (err) {
    alert('File non valido: ' + err.message);
  }
});

// ── Import voti (CSV o PDF "Elenco Valutazioni per Classe" di Argo) ──
// pdf.js: worker richiesto dal file caricato in app.html
if (window.pdfjsLib) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

const votiImportOverlay = document.getElementById('voti-import-overlay');
const votiPreviewOverlay = document.getElementById('voti-preview-overlay');
let votiPendingRows = null; // righe validate in attesa di conferma nell'anteprima

function closeVotiImport() { votiImportOverlay.classList.add('hidden'); }
function closeVotiPreview() { votiPreviewOverlay.classList.add('hidden'); votiPendingRows = null; }

document.getElementById('btn-import-voti').addEventListener('click', () => votiImportOverlay.classList.remove('hidden'));
document.getElementById('voti-import-close').addEventListener('click', closeVotiImport);
votiImportOverlay.addEventListener('click', e => { if (e.target === votiImportOverlay) closeVotiImport(); });
document.getElementById('voti-preview-close').addEventListener('click', closeVotiPreview);
document.getElementById('voti-preview-cancel').addEventListener('click', closeVotiPreview);
votiPreviewOverlay.addEventListener('click', e => { if (e.target === votiPreviewOverlay) closeVotiPreview(); });

// Normalizza un nome per il confronto (case/accenti/spazi non contano)
function normName(s) {
  return String(s || '').trim().toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/\s+/g, ' ');
}

// "GG/MM/AAAA" → "AAAA-MM-GG" (formato usato internamente per i voti)
function normDataVoto(s) {
  s = String(s || '').trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s || todayISO();
}

function normTipoVoto(s) {
  return String(s || '').trim().toLowerCase() || 'scritto';
}

// Voto "da registro": accetta 8, 8.5, 8,5, 8- (=7,75), 8+ (=8,25), 8½ (=8,5), 8/9 (media=8,5)
function parseVotoArgo(raw) {
  let s = String(raw ?? '').trim();
  if (!s) return null;
  const slash = s.match(/^(\d+(?:[.,]\d+)?)\s*\/\s*(\d+(?:[.,]\d+)?)$/);
  if (slash) {
    const a = parseFloat(slash[1].replace(',', '.'));
    const b = parseFloat(slash[2].replace(',', '.'));
    return Math.round((a + b) / 2 * 4) / 4;
  }
  let mod = 0;
  if (s.endsWith('½')) { mod = 0.5; s = s.slice(0, -1); }
  else if (s.endsWith('+')) { mod = 0.25; s = s.slice(0, -1); }
  else if (s.endsWith('-')) { mod = -0.25; s = s.slice(0, -1); }
  s = s.trim().replace(',', '.');
  const n = parseFloat(s);
  return Number.isFinite(n) ? n + mod : null;
}

// Trova l'alunno per cognome+nome (case/accenti-insensitive) o lo crea al volo,
// iscrivendolo a anno/classe. `newlyCreated` accumula i nuovi tra alunni omonimi
// nello stesso import, per non duplicarli.
function findOrCreateStudent(cognome, nome, anno, classe, newlyCreated) {
  const key = normName(cognome) + '|' + normName(nome);
  let s = state.students.find(x => normName(x.cognome) + '|' + normName(x.nome) === key)
    || newlyCreated.find(x => normName(x.cognome) + '|' + normName(x.nome) === key);
  if (!s) { s = DB.newStudent(nome, cognome); newlyCreated.push(s); }
  DB.enroll(s, anno, classe || undefined);
  return s;
}

// ── CSV voti ──────────────────────────────────────────────────────────
// Colonne: Cognome;Nome;Classe;Anno;Materia;Giorno;Voto;Tipo;Argomento;Commento
function parseVotiCSV(text) {
  const nSemi = (text.match(/;/g) || []).length;
  const nComma = (text.match(/,/g) || []).length;
  const delim = nSemi >= nComma ? ';' : ',';
  const rows = text.split(/\r?\n/)
    .map(l => l.trim()).filter(Boolean)
    .map(l => l.split(delim).map(c => c.trim().replace(/^"|"$/g, '')));
  if (!rows.length) return [];

  const head = rows[0].map(c => c.toLowerCase());
  const hasHeader = head.some(c => c.includes('cognome') || c.includes('voto'));
  const idx = name => head.findIndex(c => c.includes(name));
  let get, start;
  if (hasHeader) {
    const iCogn = idx('cognome');
    const iNome = head.findIndex(c => c.includes('nome') && !c.includes('cognome'));
    const iClasse = idx('classe');
    const iAnno = idx('anno');
    const iMateria = idx('materia');
    const iGiorno = head.findIndex(c => c.includes('giorno') || c.includes('data'));
    const iVoto = idx('voto');
    const iTipo = idx('tipo');
    const iArg = head.findIndex(c => c.includes('argoment'));
    const iComm = head.findIndex(c => c.includes('comment'));
    get = r => ({
      cognome: iCogn >= 0 ? r[iCogn] : '', nome: iNome >= 0 ? r[iNome] : '',
      classe: iClasse >= 0 ? r[iClasse] : '', anno: iAnno >= 0 ? r[iAnno] : '',
      materia: iMateria >= 0 ? r[iMateria] : '', giorno: iGiorno >= 0 ? r[iGiorno] : '',
      voto: iVoto >= 0 ? r[iVoto] : '', tipo: iTipo >= 0 ? r[iTipo] : '',
      argomento: iArg >= 0 ? r[iArg] : '', commento: iComm >= 0 ? r[iComm] : '',
    });
    start = 1;
  } else {
    get = r => ({
      cognome: r[0], nome: r[1], classe: r[2], anno: r[3], materia: r[4],
      giorno: r[5], voto: r[6], tipo: r[7], argomento: r[8], commento: r[9],
    });
    start = 0;
  }

  return rows.slice(start).map(get).filter(r => r.cognome).map(r => ({
    cognome: r.cognome || '', nome: r.nome || '',
    classe: r.classe || '', anno: normAnno(r.anno),
    materia: r.materia || '', data: normDataVoto(r.giorno),
    voto: parseVotoArgo(r.voto), tipo: normTipoVoto(r.tipo),
    desc: r.argomento || '', commento: r.commento || '',
  }));
}

document.getElementById('voti-csv-template').addEventListener('click', () => {
  const anno = DB.currentAnno();
  const righe = [
    'Cognome;Nome;Classe;Anno;Materia;Giorno;Voto;Tipo;Argomento;Commento',
    `Rossi;Mario;3A;${anno};Matematica;15/10/2025;7;scritto;Equazioni;`,
    `Bianchi;Lucia;3A;${anno};Matematica;15/10/2025;8-;scritto;Equazioni;`,
    `Verdi;Marco;3A;${anno};Matematica;20/11/2025;8½;orale;Interrogazione;Buona esposizione`,
  ].join('\r\n');
  downloadBlob('﻿' + righe, 'modello-voti.csv', 'text/csv;charset=utf-8');
});

document.getElementById('voti-csv-choose').addEventListener('click', () => document.getElementById('voti-csv-file').click());
document.getElementById('voti-csv-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const text = await file.text();
    const rows = parseVotiCSV(text);
    openVotiPreview(rows, `CSV — ${file.name}`);
  } catch (err) {
    alert('File non valido: ' + err.message);
  }
});

// ── PDF Argo ("Elenco Valutazioni per Classe") ─────────────────────────
// Ricostruisce le celle della tabella dalla posizione X di ogni frammento
// di testo rispetto alle colonne dell'intestazione (Alunno/Giorno/Voto/
// Tipo/Commento/Argomenti): un semplice testo "a righe" non basta perché
// Commento e Argomenti sono due colonne separate che vanno a capo in modo
// indipendente, e concatenarle in ordine di lettura le mescolerebbe.
async function parseArgoPDF(file) {
  if (!window.pdfjsLib) throw new Error('Libreria PDF non caricata (ricarica la pagina).');
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  let sheetClasse = '', sheetIstituto = '', sheetAnno = '', sheetMateria = '';
  const rows = [];
  let curRecord = null;
  let lastSeenName = ''; // persiste tra pagine: gli alunni proseguono da una pagina all'altra

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const items = content.items
      .map(it => ({ str: it.str, x: it.transform[4], y: Math.round(it.transform[5]) }))
      .filter(it => it.str.trim() !== '');
    if (!items.length) continue;

    // Raggruppa in righe per Y (tolleranza per piccoli disallineamenti di font)
    items.sort((a, b) => b.y - a.y || a.x - b.x);
    const lines = [];
    for (const it of items) {
      let line = lines.find(l => Math.abs(l.y - it.y) <= 3);
      if (!line) { line = { y: it.y, items: [] }; lines.push(line); }
      line.items.push(it);
    }
    lines.forEach(l => l.items.sort((a, b) => a.x - b.x));

    // Metadati foglio (una volta sola: restano costanti su tutte le pagine).
    // "Classe:" contiene sia il codice classe che il nome della scuola (es.
    // "3A LICEO SCIENTIFICO N. ROSA (LI02)"): il primo token è la classe, il
    // resto è l'istituto (l'indirizzo ministeriale va scelto a parte).
    if (!sheetClasse) {
      for (const l of lines) {
        const t = l.items.map(i => i.str).join(' ');
        const mC = t.match(/Classe:\s*(.+?)\s+Anno:\s*(\S+)/);
        if (mC) {
          const full = mC[1].trim();
          const mSplit = full.match(/^(\S+)\s+(.+)$/);
          sheetClasse = mSplit ? mSplit[1] : full;
          sheetIstituto = mSplit ? mSplit[2] : '';
          sheetAnno = mC[2].trim();
        }
        const mM = t.match(/Materia:\s*(.+)$/);
        if (mM) sheetMateria = mM[1].trim();
      }
    }

    // Colonne dalla riga di intestazione della tabella. I dati non sono
    // sempre allineati esattamente sotto la label della colonna (es. "Giorno"
    // può iniziare qualche punto più a destra dei valori data effettivi):
    // il confine tra due colonne è il punto medio tra le rispettive label,
    // non la posizione della label stessa.
    const headerLine = lines.find(l => {
      const t = l.items.map(i => i.str).join(' ');
      return /Alunno/.test(t) && /Giorno/.test(t) && /Voto/.test(t);
    });
    if (!headerLine) continue; // pagina senza tabella riconoscibile (es. copertina)

    const colOrder = ['Alunno', 'Giorno', 'Voto', 'Tipo', 'Commento', 'Argomenti'];
    const colX = {};
    headerLine.items.forEach(it => { const k = it.str.trim(); if (colOrder.includes(k)) colX[k] = it.x; });
    const present = colOrder.filter(c => colX[c] != null);
    const bounds = present.map((name, i) => ({
      name,
      x0: i === 0 ? -Infinity : (colX[present[i - 1]] + colX[name]) / 2,
      x1: i === present.length - 1 ? Infinity : (colX[name] + colX[present[i + 1]]) / 2,
    }));
    function bucket(x) {
      for (const b of bounds) if (x >= b.x0 && x < b.x1) return b.name;
      return present[present.length - 1] || 'Alunno';
    }

    for (const line of lines) {
      const t = line.items.map(i => i.str).join(' ').trim();
      if (!t) continue;
      if (/^Elenco Valutazioni|^Classe:|^Docente:|^Alunno\s+Giorno\s+Voto/.test(t)) continue;

      const cells = { Alunno: '', Giorno: '', Voto: '', Tipo: '', Commento: '', Argomenti: '' };
      line.items.forEach(it => {
        const col = bucket(it.x);
        cells[col] += (cells[col] ? ' ' : '') + it.str;
      });

      // Le righe "Media ..." vanno ignorate (le ricalcola l'app), ma senza
      // perdere eventuale testo di Commento/Argomenti sulla stessa riga: la
      // cella Alunno di quella riga viene solo svuotata, non l'intera riga.
      if (/^Media\s/i.test(cells.Alunno.trim())) cells.Alunno = '';
      if (cells.Alunno.trim()) lastSeenName = cells.Alunno.trim();

      const isDataRow = /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(cells.Giorno.trim());
      if (isDataRow) {
        curRecord = {
          studente: lastSeenName,
          giorno: cells.Giorno.trim(), voto: cells.Voto.trim(), tipo: cells.Tipo.trim(),
          commento: cells.Commento.trim(), argomenti: cells.Argomenti.trim(),
        };
        rows.push(curRecord);
      } else if (curRecord && curRecord.giorno && !cells.Alunno.trim()) {
        // riga di continuazione (testo andato a capo nella stessa cella)
        if (cells.Commento) curRecord.commento += (curRecord.commento ? ' ' : '') + cells.Commento.trim();
        if (cells.Argomenti) curRecord.argomenti += (curRecord.argomenti ? ' ' : '') + cells.Argomenti.trim();
      }
    }
  }

  const cap = w => w.charAt(0) + w.slice(1).toLowerCase();
  const materiaCap = sheetMateria ? sheetMateria.split(' ').map(cap).join(' ') : '';
  const grades = rows.filter(r => r.studente && r.giorno).map(r => {
    const words = r.studente.trim().split(/\s+/);
    const nomeW = words.pop();
    return {
      cognome: words.map(cap).join(' '), nome: cap(nomeW),
      classe: sheetClasse, istituto: sheetIstituto, anno: normAnno(sheetAnno),
      materia: materiaCap, data: normDataVoto(r.giorno),
      voto: parseVotoArgo(r.voto), tipo: normTipoVoto(r.tipo),
      desc: r.argomenti || '', commento: r.commento || '',
    };
  });
  return grades;
}

document.getElementById('voti-pdf-choose').addEventListener('click', () => document.getElementById('voti-pdf-file').click());
document.getElementById('voti-pdf-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  e.target.value = '';
  if (!file) return;
  try {
    const rows = await parseArgoPDF(file);
    if (!rows.length) { alert('Nessun voto riconosciuto nel PDF. Verifica che sia l\'export "Elenco Valutazioni per Classe" di Argo.'); return; }
    openVotiPreview(rows, `PDF — ${file.name}`);
  } catch (err) {
    alert('Impossibile leggere il PDF: ' + err.message);
  }
});

// ── Anteprima comune (CSV e PDF) prima di scrivere su Firestore ───────
function openVotiPreview(rows, fonte) {
  const valid = rows.filter(r => r.cognome && r.materia && r.anno && Number.isFinite(r.voto));
  const invalid = rows.length - valid.length;
  if (!valid.length) { alert('Nessun voto valido trovato (controlla Cognome, Materia, Anno e Voto).'); return; }

  const seen = new Map();
  valid.forEach(r => {
    const key = normName(r.cognome) + '|' + normName(r.nome);
    if (seen.has(key)) return;
    const exists = state.students.some(x => normName(x.cognome) + '|' + normName(x.nome) === key);
    seen.set(key, exists);
  });
  const nEsistenti = [...seen.values()].filter(Boolean).length;
  const nNuovi = seen.size - nEsistenti;
  const classi = [...new Set(valid.map(r => r.classe).filter(Boolean))];
  const materie = [...new Set(valid.map(r => r.materia))];
  const anni = [...new Set(valid.map(r => r.anno))];

  const sample = valid.slice(0, 12);
  document.getElementById('voti-preview-body').innerHTML = `
    <div class="stat-grid" style="margin-bottom:14px">
      <div class="stat-card"><div class="stat-label">Fonte</div><div class="stat-value" style="font-size:14px">${escHtml(fonte)}</div></div>
      <div class="stat-card"><div class="stat-label">Voti trovati</div><div class="stat-value">${valid.length}</div>${invalid ? `<div class="stat-sub">${invalid} righe scartate (dati mancanti)</div>` : ''}</div>
      <div class="stat-card"><div class="stat-label">Alunni</div><div class="stat-value">${seen.size}</div><div class="stat-sub">${nEsistenti} esistenti, ${nNuovi} nuovi</div></div>
      <div class="stat-card"><div class="stat-label">Classe / Anno / Materia</div><div class="stat-value" style="font-size:13px">${escHtml(classi.join(', ') || '—')}</div><div class="stat-sub">${escHtml(anni.join(', '))} · ${escHtml(materie.join(', '))}</div></div>
    </div>
    <div class="table-wrap">
      <table class="voti-table">
        <thead><tr><th>Alunno</th><th>Classe</th><th>Materia</th><th>Data</th><th>Voto</th><th>Tipo</th></tr></thead>
        <tbody>
          ${sample.map(r => `
          <tr>
            <td>${escHtml(r.cognome)} ${escHtml(r.nome)}</td>
            <td>${escHtml(r.classe || '—')}</td>
            <td>${escHtml(r.materia)}</td>
            <td class="vt-mono">${escHtml(fmtData(r.data))}</td>
            <td class="vt-mono vt-voto ${gradeClass(r.voto)}">${fmt(r.voto)}</td>
            <td>${escHtml(r.tipo)}</td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>
    ${valid.length > sample.length ? `<p class="stat-sub" style="margin-top:8px">… e altri ${valid.length - sample.length} voti.</p>` : ''}`;

  votiPendingRows = valid;
  closeVotiImport();
  votiPreviewOverlay.classList.remove('hidden');
}

document.getElementById('voti-preview-confirm').addEventListener('click', async () => {
  if (!votiPendingRows) return;
  const rows = votiPendingRows;
  const btn = document.getElementById('voti-preview-confirm');
  btn.disabled = true;
  try {
    const newlyCreated = [];
    const touched = new Map();
    rows.forEach(r => {
      const s = findOrCreateStudent(r.cognome, r.nome, r.anno, r.classe, newlyCreated);
      DB.addGrade(s, r.anno, r.materia, { voto: r.voto, tipo: r.tipo, data: r.data, desc: r.desc, commento: r.commento });
      touched.set(s.id, s);
    });
    const changed = [...touched.values()];
    await DB.putMany(changed);
    newlyCreated.forEach(s => { if (!state.students.includes(s)) state.students.push(s); });

    // Se il PDF Argo riportava un istituto, lo salva per la classe
    // (solo se non già impostato, per non sovrascrivere una scelta manuale)
    const istitutiRilevati = new Map();
    rows.forEach(r => {
      if (r.istituto && r.classe && r.anno) istitutiRilevati.set(r.anno + '|' + r.classe, r.istituto);
    });
    for (const [key, istituto] of istitutiRilevati) {
      const [anno, classe] = key.split('|');
      const meta = DB.getClasseMeta(anno, classe);
      if (!meta.istituto) await DB.setClasseMeta(anno, classe, { istituto, indirizzo: meta.indirizzo, materie: meta.materie });
    }

    closeVotiPreview();
    renderAll();
    alert(`Importati ${rows.length} voti su ${changed.length} alunni (${newlyCreated.length} nuovi).`);
  } catch (err) {
    alert('Errore durante l\'import: ' + err.message);
  } finally {
    btn.disabled = false;
  }
});

// ── Export / Import backup ──────────────────────────────────────────
document.getElementById('btn-export').addEventListener('click', async () => {
  const json = await DB.exportJSON();
  downloadBlob(json, `scuola-backup-${todayISO()}.json`, 'application/json');
});

document.getElementById('btn-import').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const replace = confirm('OK = sostituisci tutti i dati attuali.\nAnnulla = unisci agli alunni esistenti.');
  try {
    const n = await DB.importJSON(text, { replace });
    state.students = await DB.all();
    renderAll();
    alert(`Importati ${n} alunni.`);
  } catch (err) {
    alert('File non valido: ' + err.message);
  }
  e.target.value = '';
});

// ── Auth + avvio ────────────────────────────────────────────────────
document.getElementById('btn-logout').addEventListener('click', async () => {
  await firebase.auth().signOut();
  window.location.replace('login.html');
});

// ── Stato Google Calendar in header: l'access token OAuth (scope
//    calendar.events, ottenuto tramite Google Identity Services — vedi
//    gcal.js, non più Firebase Auth) dura circa un'ora — quando manca o è
//    scaduto il pulsante permette di riconnettersi. Lo stato mostrato
//    riflette una verifica reale (GCal.verify, una chiamata di prova
//    all'API), non solo "il token è presente": così l'icona non dice
//    "connesso" mentre la sync fallisce in silenzio a ogni salvataggio.
function updateGCalStatus(connected) {
  const btn = document.getElementById('gcal-status');
  btn.classList.toggle('connected', connected);
  btn.title = connected
    ? 'Google Calendar: connesso (colloqui/appuntamenti sincronizzati)'
    : 'Google Calendar: non connesso — clicca per collegare';
}
GCal.onStatusChange(updateGCalStatus);
// Il corpo delle risposte di errore di Google è JSON ({error:{message,...}});
// mostrarlo per esteso evita di dover aprire la console per capire la causa
// esatta di un 403/altro errore (API non abilitata vs scope insufficiente
// vs altro sono tutti "forbidden" qui, ma il messaggio le distingue).
function gcalDetailMessage(check) {
  if (!check.detail) return '';
  try { return JSON.parse(check.detail)?.error?.message || check.detail; } catch { return check.detail; }
}
function gcalErrorMessage(check) {
  if (check.reason === 'forbidden') {
    const detail = gcalDetailMessage(check);
    return 'Permesso ottenuto, ma Google ha rifiutato la richiesta verso Calendar (403).\n\n'
      + (detail ? `Messaggio di Google: "${detail}"\n\n` : '')
      + 'Causa più probabile: la "Google Calendar API" non è abilitata nel progetto Google Cloud collegato a questo account Firebase — vai su console.cloud.google.com, sezione "API e servizi" → "Libreria", cerca "Google Calendar API" e abilitala per il progetto, poi riprova a collegare.';
  }
  if (check.reason === 'no-token' || check.reason === 'gis-not-loaded') {
    return check.reason === 'gis-not-loaded'
      ? 'La libreria di Google (accounts.google.com/gsi/client) non è ancora pronta. Attendi qualche secondo e riprova.'
      : 'Google non ha restituito alcun permesso di accesso a Calendar.\n\nCausa più probabile: il Client ID OAuth configurato in gcal.js non è corretto, oppure il dominio di questo sito non è tra le "Authorized JavaScript origins" del client OAuth — controlla su console.cloud.google.com → API e servizi → Credenziali.';
  }
  if (check.reason === 'unauthorized') return 'Il permesso è scaduto o non valido. Riprova a collegare.';
  if (check.reason === 'network') return 'Google Calendar non è raggiungibile in questo momento (rete). Riprova più tardi.';
  if (check.reason === 'popup_closed' || check.reason === 'popup_closed_by_user') return null; // annullato dall'utente: nessun avviso
  return `Google Calendar non risponde correttamente (${check.reason}). Riprova più tardi.`;
}
document.getElementById('gcal-status').addEventListener('click', async () => {
  const result = await GCal.requestAccessToken();
  if (!result.ok) {
    const msg = gcalErrorMessage(result);
    if (msg) alert(msg);
    return;
  }
  const check = await GCal.verify();
  if (check.ok) {
    alert('Google Calendar collegato: colloqui e appuntamenti verranno sincronizzati automaticamente.');
  } else {
    // Il token resta valido su un rifiuto "forbidden" (es. API non ancora
    // abilitata lato Google Cloud): può iniziare a funzionare senza un
    // nuovo consenso, appena risolto lato Google — non lo scarta qui.
    if (check.reason !== 'forbidden') GCal.setToken('');
    updateGCalStatus(false);
    const msg = gcalErrorMessage(check);
    if (msg) alert(msg);
  }
});

smAuthReady.then(user => {
  if (!smIsAllowed(user)) { window.location.replace('login.html'); return; }
  const av = document.getElementById('user-avatar');
  if (user.photoURL) { av.src = user.photoURL; av.classList.remove('hidden'); }
  av.title = user.email;
  updateGCalStatus(GCal.hasToken());
  // Il token può essere sopravvissuto in sessionStorage da prima ma essere nel
  // frattempo scaduto/revocato: verifica in background e corregge l'icona se
  // non funziona davvero, invece di lasciarla "connesso" a torto.
  if (GCal.hasToken()) GCal.verify().then(check => { if (!check.ok && check.reason !== 'network') updateGCalStatus(false); });
  load().catch(err => alert('Errore caricamento dati: ' + err.message));
});

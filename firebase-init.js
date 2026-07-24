// ─── Firebase init (compat SDK, caricato da tutte le pagine) ──
// INCOLLA QUI la config del tuo progetto Firebase:
// Console Firebase → Impostazioni progetto → Le tue app → Config
// (crea un progetto nuovo "school-manager" con Authentication → Google
// e Cloud Firestore abilitati)
const SM_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCkO_IF02aQY_jy3yetmKnqRJxs90XVfI8",
  authDomain: "school-manager-6eb52.firebaseapp.com",
  projectId: "school-manager-6eb52",
  storageBucket: "school-manager-6eb52.firebasestorage.app",
  messagingSenderId: "874485472320",
  appId: "1:874485472320:web:ca14d0022e37e5cb81d3a5"
};

// Account Google autorizzati ad accedere all'app.
// IMPORTANTE: deve combaciare con la lista in firestore.rules (da ripubblicare
// in console ogni volta che la modifichi).
const SM_ALLOWED_EMAILS = [
  'silvio.phy@gmail.com',
  // 'altra.persona@gmail.com',
];

firebase.initializeApp(SM_FIREBASE_CONFIG);

// Risolve con l'utente (o null) al primo stato auth noto
const smAuthReady = new Promise(resolve => {
  const off = firebase.auth().onAuthStateChanged(u => { off(); resolve(u); });
});

// Multi-utente, ma solo per gli account in whitelist.
// Ogni utente autorizzato vede solo i propri dati (users/{uid}/…).
function smIsAllowed(user) {
  return !!user && SM_ALLOWED_EMAILS.includes(user.email);
}

// ── 17 Partidos seleccionados ────────────────────────────────────────
// ⚠️ VERIFICAR fechas/horas antes del torneo — los kickoffs son aproximados (UTC)
// El cierre de predicciones es automático al llegar la hora de kickoff.
var MATCHES = [
  // ── PARTIDO DE PRUEBA — borrar antes del torneo ───────────────────
  { id:"test", num:0, phase:"Grupos", home:"Colombia", away:"New Zealand", kickoff:"2026-06-04T03:46:00Z" },
  { id:"m01", num:1,  phase:"Grupos", home:"Mexico",       away:"South Africa",  kickoff:"2026-06-12T23:00:00Z" },
  { id:"m02", num:2,  phase:"Grupos", home:"USA",           away:"Paraguay",      kickoff:"2026-06-12T22:00:00Z" },
  { id:"m03", num:3,  phase:"Grupos", home:"Brazil",        away:"Morocco",       kickoff:"2026-06-14T02:00:00Z" },
  { id:"m04", num:4,  phase:"Grupos", home:"Netherlands",   away:"Japan",         kickoff:"2026-06-14T20:00:00Z" },
  { id:"m05", num:5,  phase:"Grupos", home:"Belgium",       away:"Egypt",         kickoff:"2026-06-14T23:00:00Z" },
  { id:"m06", num:6,  phase:"Grupos", home:"Argentina",     away:"Algeria",       kickoff:"2026-06-15T23:00:00Z" },
  { id:"m07", num:7,  phase:"Grupos", home:"Uzbekistan",    away:"Colombia",      kickoff:"2026-06-15T19:00:00Z" },
  { id:"m10", num:10, phase:"Grupos", home:"Germany",       away:"Ivory Coast",   kickoff:"2026-06-14T19:00:00Z" },
  { id:"m11", num:11, phase:"Grupos", home:"Spain",         away:"Saudi Arabia",  kickoff:"2026-06-14T02:00:00Z" },
  { id:"m12", num:12, phase:"Grupos", home:"France",        away:"Iraq",          kickoff:"2026-06-14T23:00:00Z" },
  // ── Fase de Grupos — Jornada 2 ───────────────────────────────────
  { id:"m08", num:8,  phase:"Grupos", home:"Mexico",        away:"South Korea",   kickoff:"2026-06-20T00:00:00Z" },
  { id:"m09", num:9,  phase:"Grupos", home:"Turkey",        away:"Paraguay",      kickoff:"2026-06-20T20:00:00Z" },
  { id:"m13", num:13, phase:"Grupos", home:"Colombia",      away:"DR Congo",      kickoff:"2026-06-21T23:00:00Z" },
  { id:"m14", num:14, phase:"Grupos", home:"Scotland",      away:"Brazil",        kickoff:"2026-06-20T19:00:00Z" },
  { id:"m15", num:15, phase:"Grupos", home:"Ecuador",       away:"Germany",       kickoff:"2026-06-21T16:00:00Z" },
  { id:"m16", num:16, phase:"Grupos", home:"Uruguay",       away:"Spain",         kickoff:"2026-06-20T03:00:00Z" },
  // ── Fase de Grupos — Jornada 3 ───────────────────────────────────
  { id:"m17", num:17, phase:"Grupos", home:"Colombia",      away:"Portugal",      kickoff:"2026-06-26T23:00:00Z" },
];

// ── ISO codes para banderas ──────────────────────────────────────────
var CC = {
  Spain:"es", France:"fr", Brazil:"br", Argentina:"ar", Germany:"de",
  Portugal:"pt", Netherlands:"nl", England:"gb-eng", Scotland:"gb-sct",
  Morocco:"ma", Colombia:"co", USA:"us", Japan:"jp", "South Korea":"kr",
  Norway:"no", Uruguay:"uy", Senegal:"sn", Mexico:"mx", Belgium:"be",
  Ecuador:"ec", Croatia:"hr", Switzerland:"ch", Australia:"au",
  "Ivory Coast":"ci", Tunisia:"tn", Austria:"at", Algeria:"dz",
  Uzbekistan:"uz", Jordan:"jo", Ghana:"gh", Canada:"ca", Qatar:"qa",
  "South Africa":"za", Haiti:"ht", Paraguay:"py", "New Zealand":"nz",
  "Cape Verde":"cv", "Saudi Arabia":"sa", Iran:"ir", Egypt:"eg",
  Panama:"pa", "Curaçao":"cw", Italy:"it", Sweden:"se", Poland:"pl",
  Turkey:"tr", Czechia:"cz", "Bosnia & Herz.":"ba",
  Jamaica:"jm", "DR Congo":"cd", Bolivia:"bo", Iraq:"iq",
  "Ivory Coast":"ci"
};

// ── Emojis de bandera ────────────────────────────────────────────────
var FL = {
  Mexico:"🇲🇽","South Africa":"🇿🇦","South Korea":"🇰🇷",
  USA:"🇺🇸", Paraguay:"🇵🇾", Brazil:"🇧🇷", Morocco:"🇲🇦",
  Netherlands:"🇳🇱", Japan:"🇯🇵", Belgium:"🇧🇪", Egypt:"🇪🇬",
  Argentina:"🇦🇷", Algeria:"🇩🇿", Uzbekistan:"🇺🇿", Colombia:"🇨🇴",
  Germany:"🇩🇪","Ivory Coast":"🇨🇮",Spain:"🇪🇸","Saudi Arabia":"🇸🇦",
  France:"🇫🇷", Iraq:"🇮🇶", Turkey:"🇹🇷", Scotland:"🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  Ecuador:"🇪🇨", Uruguay:"🇺🇾", Portugal:"🇵🇹", "DR Congo":"🇨🇩"
};
function fl(t) { return FL[t] || "🏳️"; }

// ── Traducciones de nombres de equipos ─────────────────────────────
var TEAM_ES = {
  "Spain":"España","France":"Francia","Brazil":"Brasil",
  "Argentina":"Argentina","Germany":"Alemania","England":"Inglaterra",
  "Portugal":"Portugal","Netherlands":"Países Bajos","Morocco":"Marruecos",
  "Colombia":"Colombia","USA":"EE.UU.","Japan":"Japón",
  "South Korea":"Corea del Sur","Norway":"Noruega","Uruguay":"Uruguay",
  "Senegal":"Senegal","Mexico":"México","Belgium":"Bélgica",
  "Ecuador":"Ecuador","Croatia":"Croacia","Switzerland":"Suiza",
  "Australia":"Australia","Ivory Coast":"Costa de Marfil","Tunisia":"Túnez",
  "Austria":"Austria","Algeria":"Argelia","Uzbekistan":"Uzbekistán",
  "Jordan":"Jordania","Ghana":"Ghana","Scotland":"Escocia",
  "Canada":"Canadá","Qatar":"Catar","South Africa":"Sudáfrica",
  "Haiti":"Haití","Paraguay":"Paraguay","New Zealand":"Nueva Zelanda",
  "Cape Verde":"Cabo Verde","Saudi Arabia":"Arabia Saudita",
  "Iran":"Irán","Egypt":"Egipto","Panama":"Panamá","Curaçao":"Curazao",
  "Italy":"Italia","Sweden":"Suecia","Poland":"Polonia","Turkey":"Turquía",
  "Czechia":"Chequia","Bosnia & Herz.":"Bosnia y Herz.",
  "Jamaica":"Jamaica","DR Congo":"Rep. D. del Congo","Bolivia":"Bolivia","Iraq":"Irak"
};
function teamName(t) { return TEAM_ES[t] || t; }

// ── Textos de la aplicación (español) ───────────────────────────────
var T = {
  title:       "POLLA MUNDIALISTA",
  sub:         "Predice los marcadores · Copa del Mundo 2026",
  predict:     "Predecir",
  table:       "🏅 Tabla",
  admin:       "Admin",
  back:        "← Volver",
  cont:        "Continuar →",
  save:        "Guardar predicciones",
  saving:      "Guardando...",
  saved:       "¡Predicciones guardadas!",
  updated:     "(Actualización)",
  goodluck:    "¡Buena suerte! 🏆",
  nameL:       "Nombre completo",
  namePh:      "Tu nombre",



  noPart:      "Sin participantes aún",
  adminPw:     "Contraseña admin",
  salsamentaria: "Salsamentaria JCG",
  salsaSub:    "Concurso exclusivo para clientes de la Salsamentaria JCG",
  prize1:      "🥇 1er puesto — Bono $150.000",
  prize2:      "🥈 2do puesto — Bono $100.000",
  prize3:      "🥉 3er puesto — Bono $50.000",
  scoringTitle:"Sistema de Puntos",
  delConfirm:  "¿Eliminar participante?",
  saveBtn:     "Guardar",
  savedOk:     "Guardado ✓",
  loading:     "CARGANDO...",
  open:        "ABIERTO",
  closed:      "CERRADO",
  matchday:    "Partido",
  groups:      "Fase de Grupos",
  ko:          "Eliminatoria",
  predictionsClosed: "PREDICCIONES CERRADAS",
  noMorePreds: "Ya no es posible registrar o modificar predicciones.",
  leaderTitle: "CLASIFICACIÓN",
  hiddenMsg:   "La tabla se publicará cuando comience el primer partido.",
  registerPreds: "REGISTRAR PREDICCIONES",
  regSub:      "Predice los marcadores de los 17 partidos seleccionados",
  adminTitle:  "PANEL ADMIN",
  resultsTab:  "Resultados",
  partTab:     "Participantes",
  settingsTab: "Ajustes",
  points:      "pts",
  result:      "Resultado correcto",
  exact:       "Marcador exacto",
  adminNotifSent: "Admin notificado ✓",
  adminNotifFail: "Email admin falló",
  downloadPDF: "Descargar predicciones (PDF)",
  pinAccess:   "Control de acceso",
  pinList:     "Lista de PINs",
  addPin:      "Agregar PIN",
  pinCode:     "PIN de acceso",
  pinPh:       "Tu PIN personal",
  pinRequired: "Ingresa tu PIN de acceso.",
  pinInvalid:  "PIN inválido.",
  verifying:   "Verificando...",
  paymentNote: "Pago: Transferencia bancaria directa.",
  prizes:      "PREMIOS",
  rules:       "REGLAS"
};

// ── Configuración por defecto ────────────────────────────────────────
var DEF = {
  adminPw:   "admin2026!",
  firebase:  "https://polla-jcg1-default-rtdb.firebaseio.com",

  scoring: {
    result: 1,   // 1 pt por resultado correcto (G/E/P)
    exact:  3    // 3 pts ADICIONALES por marcador exacto
  }
};

// ── 17 Partidos seleccionados ────────────────────────────────────────
// Kickoffs verificados con ESPN/CBS/Fox Sports (fuente: junio 2026)
// Hora Colombia = UTC-5. Para convertir: resta 5h al tiempo UTC.
var MATCHES = [
  // ── Jornada 1 (Jun 11–17) ────────────────────────────────────────
  { id:"m01", num:1,  phase:"Grupos", home:"Mexico",       away:"South Africa",  kickoff:"2026-06-11T19:00:00Z" }, // jue 11 jun · 14:00 COL
  { id:"m02", num:2,  phase:"Grupos", home:"USA",           away:"Paraguay",      kickoff:"2026-06-13T01:00:00Z" }, // vie 12 jun · 20:00 COL
  { id:"m03", num:3,  phase:"Grupos", home:"Brazil",        away:"Morocco",       kickoff:"2026-06-13T22:00:00Z" }, // sáb 13 jun · 17:00 COL
  { id:"m04", num:4,  phase:"Grupos", home:"Netherlands",   away:"Japan",         kickoff:"2026-06-14T20:00:00Z" }, // dom 14 jun · 15:00 COL ✅
  { id:"m05", num:5,  phase:"Grupos", home:"Belgium",       away:"Egypt",         kickoff:"2026-06-15T22:00:00Z" }, // lun 15 jun · 17:00 COL
  { id:"m06", num:6,  phase:"Grupos", home:"Argentina",     away:"Algeria",       kickoff:"2026-06-17T01:00:00Z" }, // mar 16 jun · 20:00 COL
  { id:"m07", num:7,  phase:"Grupos", home:"Uzbekistan",    away:"Colombia",      kickoff:"2026-06-18T02:00:00Z" }, // mié 17 jun · 21:00 COL
 
  // ── Jornada 2 (Jun 18–23) ────────────────────────────────────────
  { id:"m08", num:8,  phase:"Grupos", home:"Mexico",        away:"South Korea",   kickoff:"2026-06-19T01:00:00Z" }, // jue 18 jun · 20:00 COL
  { id:"m09", num:9,  phase:"Grupos", home:"Turkey",        away:"Paraguay",      kickoff:"2026-06-20T03:00:00Z" }, // vie 19 jun · 22:00 COL
  { id:"m10", num:10, phase:"Grupos", home:"Germany",       away:"Ivory Coast",   kickoff:"2026-06-20T20:00:00Z" }, // sáb 20 jun · 15:00 COL
  { id:"m11", num:11, phase:"Grupos", home:"Spain",         away:"Saudi Arabia",  kickoff:"2026-06-21T16:00:00Z" }, // dom 21 jun · 11:00 COL
  { id:"m12", num:12, phase:"Grupos", home:"France",        away:"Iraq",          kickoff:"2026-06-22T21:00:00Z" }, // lun 22 jun · 16:00 COL
  { id:"m13", num:13, phase:"Grupos", home:"Colombia",      away:"DR Congo",      kickoff:"2026-06-24T02:00:00Z" }, // mar 23 jun · 21:00 COL
  { id:"m14", num:14, phase:"Grupos", home:"Scotland",      away:"Brazil",        kickoff:"2026-06-24T22:00:00Z" }, // mié 24 jun · 17:00 COL
  { id:"m15", num:15, phase:"Grupos", home:"Ecuador",       away:"Germany",       kickoff:"2026-06-25T20:00:00Z" }, // jue 25 jun · 15:00 COL
  { id:"m16", num:16, phase:"Grupos", home:"Uruguay",       away:"Spain",         kickoff:"2026-06-27T00:00:00Z" }, // vie 26 jun · 19:00 COL
  // ── Jornada 3 (Jun 24–27) ────────────────────────────────────────
  { id:"m17", num:17, phase:"Grupos", home:"Colombia",      away:"Portugal",      kickoff:"2026-06-27T23:30:00Z" }, // sáb 27 jun · 18:30 COL
  // ── Ronda de 32 (Jun 28 – Jul 3) ─────────────────────────────────
  { id:"r32_01", num:18, phase:"Ronda de 32", home:"South Africa", away:"Canada",        kickoff:"2026-06-28T19:00:00Z" }, // dom 28 jun · 14:00 COL
  { id:"r32_02", num:19, phase:"Ronda de 32", home:"Brazil",       away:"Japan",         kickoff:"2026-06-29T17:00:00Z" }, // lun 29 jun · 12:00 COL
  { id:"r32_03", num:20, phase:"Ronda de 32", home:"Germany",      away:"Paraguay",      kickoff:"2026-06-29T20:30:00Z" }, // lun 29 jun · 15:30 COL
  { id:"r32_04", num:21, phase:"Ronda de 32", home:"Netherlands",  away:"Morocco",       kickoff:"2026-06-30T01:00:00Z" }, // lun 29 jun · 20:00 COL
  { id:"r32_05", num:22, phase:"Ronda de 32", home:"Ivory Coast",  away:"Norway",        kickoff:"2026-06-30T17:00:00Z" }, // mar 30 jun · 12:00 COL
  { id:"r32_06", num:23, phase:"Ronda de 32", home:"France",       away:"Sweden",        kickoff:"2026-06-30T21:00:00Z" }, // mar 30 jun · 16:00 COL
  { id:"r32_07", num:24, phase:"Ronda de 32", home:"Mexico",       away:"Ecuador",       kickoff:"2026-07-01T01:00:00Z" }, // mar 30 jun · 20:00 COL
  { id:"r32_08", num:25, phase:"Ronda de 32", home:"England",      away:"DR Congo",      kickoff:"2026-07-01T16:00:00Z" }, // mié 1 jul · 11:00 COL
  { id:"r32_09", num:26, phase:"Ronda de 32", home:"Belgium",      away:"Senegal",       kickoff:"2026-07-01T20:00:00Z" }, // mié 1 jul · 15:00 COL
  { id:"r32_10", num:27, phase:"Ronda de 32", home:"USA",          away:"Bosnia & Herz.", kickoff:"2026-07-02T00:00:00Z" }, // mié 1 jul · 19:00 COL
  { id:"r32_11", num:28, phase:"Ronda de 32", home:"Spain",        away:"Austria",       kickoff:"2026-07-02T19:00:00Z" }, // jue 2 jul · 14:00 COL
  { id:"r32_12", num:29, phase:"Ronda de 32", home:"Portugal",     away:"Croatia",       kickoff:"2026-07-02T23:00:00Z" }, // jue 2 jul · 18:00 COL
  { id:"r32_13", num:30, phase:"Ronda de 32", home:"Switzerland",  away:"Algeria",       kickoff:"2026-07-03T03:00:00Z" }, // jue 2 jul · 22:00 COL
  { id:"r32_14", num:31, phase:"Ronda de 32", home:"Australia",    away:"Egypt",         kickoff:"2026-07-03T18:00:00Z" }, // vie 3 jul · 13:00 COL
  { id:"r32_15", num:32, phase:"Ronda de 32", home:"Argentina",    away:"Cape Verde",    kickoff:"2026-07-03T22:00:00Z" }, // vie 3 jul · 17:00 COL
  { id:"r32_16", num:33, phase:"Ronda de 32", home:"Colombia",     away:"Ghana",         kickoff:"2026-07-04T01:30:00Z" }, // vie 3 jul · 20:30 COL

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
  salsamentaria: "Salsamentaria Juanchito",
  salsaSub:    "Concurso exclusivo para clientes de la Salsamentaria Juanchito",
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

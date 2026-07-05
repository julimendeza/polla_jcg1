// ── Resolución de bracket (equipos KO) ───────────────────────────────
// Las referencias son "W18" (ganador #18) o "L46" (perdedor #46).
// Devuelve el nombre del equipo si ya se conoce, o null si aún no.

// Busca un partido por su número
function matchByNum(num) {
  for (var i = 0; i < MATCHES.length; i++) {
    if (MATCHES[i].num === num) return MATCHES[i];
  }
  return null;
}

// Ganador de un partido según resultado + override de penales
function matchWinner(match, results) {
  if (!match) return null;
  var r = results && results[match.id];
  if (!r || r.h === "" || r.h === undefined || r.a === "" || r.a === undefined) return null;
  var home = resolveTeam(match, "home", results);
  var away = resolveTeam(match, "away", results);
  if (!home || !away) return null;
  var rh = +r.h, ra = +r.a;
  if (rh > ra) return home;
  if (ra > rh) return away;
  // Empate → ganó por penales (r.pen = "H" o "A")
  if (r.pen === "H") return home;
  if (r.pen === "A") return away;
  return null; // empate sin definir penales
}

function matchLoser(match, results) {
  if (!match) return null;
  var r = results && results[match.id];
  if (!r || r.h === "" || r.h === undefined || r.a === "" || r.a === undefined) return null;
  var home = resolveTeam(match, "home", results);
  var away = resolveTeam(match, "away", results);
  if (!home || !away) return null;
  var rh = +r.h, ra = +r.a;
  if (rh > ra) return away;
  if (ra > rh) return home;
  if (r.pen === "H") return away;
  if (r.pen === "A") return home;
  return null;
}

// Resuelve una referencia "W18" / "L46" al nombre del equipo (o null)
function resolveRef(ref, results) {
  if (!ref) return null;
  var type = ref.charAt(0);          // "W" o "L"
  var num  = parseInt(ref.slice(1), 10);
  var src  = matchByNum(num);
  if (!src) return null;
  return type === "W" ? matchWinner(src, results) : matchLoser(src, results);
}

// Resuelve el equipo de un partido para un lado ("home"/"away")
// Si el partido tiene equipo fijo, lo devuelve. Si tiene ref, la resuelve.
function resolveTeam(match, side, results) {
  if (!match) return null;
  var fixed = match[side];                 // home / away
  if (fixed) return fixed;
  var ref = match[side + "Ref"];           // homeRef / awayRef
  return resolveRef(ref, results);
}

// Texto a mostrar cuando un equipo aún no se conoce ("Ganador #18")
function refLabel(ref) {
  if (!ref) return "Por definir";
  var type = ref.charAt(0);
  var num  = ref.slice(1);
  return (type === "W" ? "Ganador #" : "Perdedor #") + num;
}

// Devuelve el equipo o el placeholder para mostrar
function displayTeam(match, side, results) {
  var team = resolveTeam(match, side, results);
  if (team) return { team: team, isPlaceholder: false };
  var ref = match[side + "Ref"];
  return { team: refLabel(ref), isPlaceholder: true };
}

// ¿Están ambos equipos de un partido KO confirmados?
function teamsKnown(match, results) {
  return !!resolveTeam(match, "home", results) && !!resolveTeam(match, "away", results);
}

// ── ¿Está abierto un partido para predicciones? ──────────────────────
// Un partido se cierra cuando el kickoff ha pasado (hora actual >= kickoff).
// Los partidos con referencias (KO) solo se abren cuando ambos equipos
// están confirmados. Se necesita pasar results para esa verificación.
function isOpen(match, results) {
  if (new Date() >= new Date(match.kickoff)) return false;
  // Si el partido depende de ganadores aún no definidos, no está abierto
  if ((match.homeRef || match.awayRef) && results !== undefined) {
    if (!teamsKnown(match, results)) return false;
  }
  return true;
}

// ── ¿Ha empezado el torneo? (al menos un kickoff ha pasado) ──────────
function hasStarted() {
  return MATCHES.some(function(m) { return !isOpen(m); });
}

// ── ¿Tiene resultado ingresado? ───────────────────────────────────────
function hasResult(res, matchId) {
  var r = res && res[matchId];
  return r && r.h !== "" && r.h !== undefined && r.a !== "" && r.a !== undefined;
}

// ── Determina el resultado: "H" ganó local, "A" ganó visitante, "D" empate ──
function outcome(h, a) {
  h = +h; a = +a;
  return h > a ? "H" : h < a ? "A" : "D";
}

// ── Puntaje de un partido individual ──────────────────────────────────
// Retorna { pts, status } donde status es "exact" | "result" | "wrong" | null
function scoreMatch(pred, res, sc) {
  if (!pred || pred.h === "" || pred.h === undefined) return { pts: 0, status: null };
  if (!res  || res.h  === "" || res.h  === undefined) return { pts: 0, status: null };
  var ph = +pred.h, pa = +pred.a;
  var rh = +res.h,  ra = +res.a;
  var pts = 0;
  var resultOk = outcome(ph, pa) === outcome(rh, ra);
  var exactOk  = ph === rh && pa === ra;
  if (resultOk) pts += (sc && sc.result) || DEF.scoring.result;
  if (exactOk)  pts += (sc && sc.exact)  || DEF.scoring.exact;
  var status = exactOk ? "exact" : resultOk ? "result" : "wrong";
  return { pts: pts, status: status };
}

// ── Puntaje total de un participante ─────────────────────────────────
function calcScore(preds, results, sc) {
  var total = 0;
  var detail = {};
  var exacts = 0;   // marcadores exactos (desempate 1)
  var correct = 0;  // resultados correctos (desempate 2)
  var predicted = 0; // partidos con predicción registrada (desempate 3)
  MATCHES.forEach(function(m) {
    var p = preds && preds[m.id];
    var r = results && results[m.id];
    var s = scoreMatch(p, r, sc);
    detail[m.id] = s;
    total += s.pts;
    if (p && p.h !== "" && p.h !== undefined && p.a !== "" && p.a !== undefined) predicted++;
    if (s.status === "exact") { exacts++; correct++; }
    else if (s.status === "result") { correct++; }
  });
  return { pts: total, detail: detail, exacts: exacts, correct: correct, predicted: predicted };
}

// ── Comparador de clasificación con desempates ───────────────────────
// 1) Puntos  2) Marcadores exactos  3) Resultados correctos  4) Partidos predichos
// Si empatan en los cuatro → empate real, sin criterio alfabético.
function cmpRank(a, b) {
  if (b.pts !== a.pts) return b.pts - a.pts;
  if (b.exacts !== a.exacts) return b.exacts - a.exacts;
  if (b.correct !== a.correct) return b.correct - a.correct;
  if (b.predicted !== a.predicted) return b.predicted - a.predicted;
  return 0;
}

// ── Formato de fecha legible en español ──────────────────────────────
function fmtKickoff(isoStr) {
  var d = new Date(isoStr);
  // Convertir a hora Colombia (UTC-5)
  var co = new Date(d.getTime() - 5 * 60 * 60 * 1000);
  var months = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  var days   = ["dom","lun","mar","mié","jue","vie","sáb"];
  var day    = days[co.getUTCDay()];
  var date   = co.getUTCDate();
  var month  = months[co.getUTCMonth()];
  var h      = co.getUTCHours().toString().padStart(2,"0");
  var min    = co.getUTCMinutes().toString().padStart(2,"0");
  return day + " " + date + " " + month + " · " + h + ":" + min + " COL";
}

// ── Cuenta regresiva legible ──────────────────────────────────────────
function countdown(isoStr) {
  var ms = new Date(isoStr) - new Date();
  if (ms <= 0) return null;
  var h  = Math.floor(ms / 3600000);
  var d  = Math.floor(h / 24);
  h = h % 24;
  var m  = Math.floor((ms % 3600000) / 60000);
  if (d > 1)  return "Cierra en " + d + " días";
  if (d === 1) return "Cierra mañana";
  if (h > 0)  return "Cierra en " + h + "h " + m + "m";
  return "Cierra en " + m + " min";
}

// ── Partidos por fase ─────────────────────────────────────────────────
function matchesByPhase() {
  var phases = {};
  MATCHES.forEach(function(m) {
    if (!phases[m.phase]) phases[m.phase] = [];
    phases[m.phase].push(m);
  });
  return phases;
}

// ── Partidos completados (tienen resultado) ───────────────────────────
function completedCount(results) {
  return MATCHES.filter(function(m) { return hasResult(results, m.id); }).length;
}

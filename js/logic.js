// ── ¿Está abierto un partido para predicciones? ──────────────────────
// Un partido se cierra cuando el kickoff ha pasado (hora actual >= kickoff)
function isOpen(match) {
  return new Date() < new Date(match.kickoff);
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
  MATCHES.forEach(function(m) {
    var p = preds && preds[m.id];
    var r = results && results[m.id];
    var s = scoreMatch(p, r, sc);
    detail[m.id] = s;
    total += s.pts;
  });
  return { pts: total, detail: detail };
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

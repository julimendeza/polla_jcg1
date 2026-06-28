// ── Helper: nombre + bandera de un equipo (resuelve refs KO) ──────────
// side = "home"/"away". Si el equipo no está definido, muestra placeholder.
function TeamSide(p) {
  var match = p.match, side = p.side, results = p.results, align = p.align;
  var d = (typeof displayTeam === "function")
    ? displayTeam(match, side, results)
    : { team: match[side], isPlaceholder: false };
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var fontSize = p.fontSize || 12;

  var nameEl = html`<span style=${{
    fontSize: fontSize, fontWeight:600,
    color: d.isPlaceholder ? thm.inv(.4) : thm.inv(.8),
    fontStyle: d.isPlaceholder ? "italic" : "normal",
    textAlign: align === "right" ? "right" : "left", lineHeight:1.2
  }}>${d.isPlaceholder ? d.team : teamName(d.team)}</span>`;

  var flagEl = d.isPlaceholder
    ? html`<span style=${{fontSize:13, opacity:.4}}>🏳️</span>`
    : html`<${FlagImg} team=${d.team}/>`;

  if (align === "right") {
    return html`<div style=${{flex:1, display:"flex", alignItems:"center", gap:7, justifyContent:"flex-end"}}>
      ${nameEl}${flagEl}
    </div>`;
  }
  return html`<div style=${{flex:1, display:"flex", alignItems:"center", gap:7}}>
    ${flagEl}${nameEl}
  </div>`;
}

// ── Botón ─────────────────────────────────────────────────────────────
function Btn(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var v = p.v || "primary";
  var base = {
    fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:14,
    borderRadius:10, cursor:"pointer", border:"none",
    padding:"10px 20px", transition:"all .15s",
    opacity: p.disabled ? 0.5 : 1,
    pointerEvents: p.disabled ? "none" : "auto",
    width: p.full ? "100%" : undefined,
    display: p.full ? "block" : "inline-flex",
    alignItems:"center", justifyContent:"center", gap:6
  };
  var styles = {
    primary:   Object.assign({}, base, { background: thm.accentGrad, color: thm.onAccent }),
    secondary: Object.assign({}, base, { background: thm.inv(.07), color: thm.inv(.8), border: thm.bdr(1,.12) }),
    ghost:     Object.assign({}, base, { background: "transparent", color: thm.inv(.5), padding:"8px 12px" }),
    danger:    Object.assign({}, base, { background:"rgba(239,68,68,.15)", color:"#f87171", border:"1px solid rgba(239,68,68,.3)" })
  };
  return html`<button
    onClick=${p.onClick}
    disabled=${p.disabled}
    style=${Object.assign({}, styles[v]||styles.primary, p.sx||{})}
  >${p.children}</button>`;
}

// ── Tarjeta ───────────────────────────────────────────────────────────
function Card(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  return html`<div style=${Object.assign({
    background: thm.inv(.04),
    border: thm.bdr(1,.09),
    borderRadius:16, padding:20,
    marginBottom: p.noMb ? 0 : 14
  }, p.sx||{})}>${p.children}</div>`;
}

// ── Campo de formulario ───────────────────────────────────────────────
function Field(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  return html`<div style=${{marginBottom:14}}>
    <label style=${{
      display:"block", fontSize:11, fontWeight:700,
      color:thm.inv(.4), marginBottom:5, letterSpacing:".06em",
      textTransform:"uppercase"
    }}>${p.label}</label>
    ${p.children}
  </div>`;
}

// ── Barra de progreso ─────────────────────────────────────────────────
function PBar(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var pct = Math.min(100, Math.round((p.v / (p.max || 1)) * 100));
  return html`<div style=${{
    background:thm.inv(.08), borderRadius:99, height:5, overflow:"hidden"
  }}>
    <div style=${{
      height:"100%", borderRadius:99,
      width: pct + "%",
      background: thm.accentGrad,
      transition:"width .3s"
    }}/>
  </div>`;
}

// ── Fila de partido (input de predicción) ─────────────────────────────
function MatchInputRow(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var match = p.match;
  var hv = p.hv || "";
  var av = p.av || "";
  var locked = p.locked;
  var result = p.result; // { h, a } si ya hay resultado admin

  var statusColor = null;
  var statusIcon  = null;
  if (result && hv !== "" && av !== "") {
    var s = scoreMatch({h:hv,a:av}, result, null);
    if      (s.status === "exact")  { statusColor = "#4ade80"; statusIcon = "⭐"; }
    else if (s.status === "result") { statusColor = thm.accent; statusIcon = "✓"; }
    else if (s.status === "wrong")  { statusColor = "#f87171"; statusIcon = "✗"; }
  }

  var inputStyle = {
    width:38, height:38, textAlign:"center", fontSize:18, fontWeight:700,
    borderRadius:8, border: locked ? thm.bdr(1,.08) : thm.bdra(1, locked ? .1 : .4),
    background: locked ? thm.inv(.04) : thm.a(.08),
    color: locked ? thm.inv(.5) : thm.inv(.9),
    fontFamily:"'DM Sans',sans-serif",
    outline:"none", padding:0,
    cursor: locked ? "default" : "text",
    MozAppearance:"textfield"
  };

  return html`<div style=${{
    display:"flex", alignItems:"center", gap:10,
    padding:"11px 14px", borderRadius:12, marginBottom:8,
    background: locked ? thm.inv(.02) : thm.a(.04),
    border: locked ? thm.bdr(1,.06) : thm.bdra(1,.15),
    opacity: locked && !hv ? 0.55 : 1,
    transition:"all .15s"
  }}>
    <!-- Local -->
    <${TeamSide} match=${match} side="home" results=${p.results} align="right"/>

    <!-- Scores -->
    <div style=${{display:"flex", alignItems:"center", gap:6}}>
      <input
        type="number" min="0" max="20"
        value=${hv}
        readOnly=${locked}
        onInput=${locked ? undefined : function(e){p.onH && p.onH(e.target.value);}}
        style=${inputStyle}
      />
      <span style=${{color:thm.inv(.3), fontWeight:700, fontSize:14}}>-</span>
      <input
        type="number" min="0" max="20"
        value=${av}
        readOnly=${locked}
        onInput=${locked ? undefined : function(e){p.onA && p.onA(e.target.value);}}
        style=${inputStyle}
      />
    </div>

    <!-- Visitante -->
    <${TeamSide} match=${match} side="away" results=${p.results} align="left"/>

    <!-- Indicador de estado -->
    <div style=${{width:22, textAlign:"center", fontSize:14}}>
      ${statusIcon && html`<span style=${{color:statusColor}}>${statusIcon}</span>`}
      ${locked && !statusIcon && html`<span style=${{color:thm.inv(.25), fontSize:12}}>🔒</span>`}
    </div>
  </div>`;
}

// ── Tarjeta de partido (vista home / leaderboard) ─────────────────────
function MatchCard(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var match  = p.match;
  var result = p.result;  // { h, a } o null
  var pred   = p.pred;    // { h, a } o null

  var hasRes = result && result.h !== "" && result.h !== undefined;
  var hasPred = pred && pred.h !== "" && pred.h !== undefined;
  var score = hasPred && hasRes ? scoreMatch(pred, result, null) : null;
  var open = isOpen(match, p.results);

  return html`<div style=${{
    display:"flex", alignItems:"center", gap:8,
    padding:"10px 12px", borderRadius:11, marginBottom:6,
    background: thm.inv(.03),
    border: open ? thm.bdr(1,.07) : (hasRes ? thm.bdra(1,.15) : thm.bdr(1,.06)),
    fontSize:12
  }}>
    <!-- Número -->
    <div style=${{
      width:22, height:22, borderRadius:6, flexShrink:0,
      background:thm.a(.12), color:thm.accent,
      display:"flex",alignItems:"center",justifyContent:"center",
      fontSize:10,fontWeight:700
    }}>${match.num}</div>

    <!-- Local -->
    <${TeamSide} match=${match} side="home" results=${p.results} align="right"/>

    <!-- Resultado -->
    <div style=${{
      display:"flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:8,
      background: hasRes ? thm.a(.12) : thm.inv(.06),
      minWidth:52, justifyContent:"center"
    }}>
      ${hasRes
        ? html`<span style=${{fontWeight:700, fontSize:13, color:thm.accent}}>${result.h} - ${result.a}</span>`
        : open
          ? html`<span style=${{color:thm.inv(.25), fontSize:10}}>VS</span>`
          : html`<span style=${{color:thm.inv(.2), fontSize:10}}>-</span>`
      }
    </div>

    <!-- Visitante -->
    <${TeamSide} match=${match} side="away" results=${p.results} align="left"/>

    <!-- Predicción del usuario -->
    ${hasPred && html`<div style=${{
      fontSize:11, color: score ? (
        score.status==="exact" ? "#4ade80" :
        score.status==="result" ? thm.accent : "#f87171"
      ) : thm.inv(.35),
      fontWeight:700, minWidth:40, textAlign:"right"
    }}>
      ${pred.h}-${pred.a}
      ${score && html`<span style=${{display:"block",fontSize:9,opacity:.8}}>+${score.pts}pts</span>`}
    </div>`}
    ${!hasPred && !open && html`<div style=${{
      fontSize:10, color:thm.inv(.2), minWidth:40, textAlign:"right"
    }}>—</div>`}
  </div>`;
}

// ── Modal overlay ─────────────────────────────────────────────────────
function Modal(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  return html`<div onClick=${p.onClose} style=${{
    position:"fixed", inset:0, zIndex:1000,
    background:"rgba(0,0,0,.7)", backdropFilter:"blur(4px)",
    display:"flex", alignItems:"center", justifyContent:"center", padding:16
  }}>
    <div onClick=${function(e){e.stopPropagation();}} style=${{
      background:thm.deep, border:thm.bdr(1,.15),
      borderRadius:18, padding:24, maxWidth:420, width:"100%",
      maxHeight:"85vh", overflowY:"auto"
    }}>
      ${p.children}
    </div>
  </div>`;
}

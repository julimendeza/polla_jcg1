function PredictView(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var participants = p.participants;
  var saveP        = p.saveP;
  var setView      = p.setView;
  var settings     = p.settings;
  var results      = p.results;

  // Steps: 0 = PIN, 1 = predicciones, 2 = confirmación
  var st0 = useState(0);     var step = st0[0],    setStep = st0[1];
  var st1 = useState("");    var name = st1[0],    setName = st1[1];
  var st2 = useState("");    var err = st2[0],     setErr = st2[1];
  var st3 = useState(null);  var existId = st3[0], setExistId = st3[1];
  var st4 = useState({});    var preds = st4[0],   setPreds = st4[1];
  var st5 = useState(false); var saving = st5[0],  setSaving = st5[1];
  var st6 = useState("");    var pinCode = st6[0], setPinCode = st6[1];
  var st7 = useState(false); var pinLoading = st7[0], setPinLoading = st7[1];

  var filled = MATCHES.filter(function(m){
    var pr = preds[m.id];
    return pr && pr.h !== "" && pr.h !== undefined;
  }).length;

  function setPred(matchId, side, val) {
    setPreds(function(prev) {
      var next = Object.assign({}, prev);
      next[matchId] = Object.assign({}, next[matchId] || {});
      next[matchId][side] = val;
      return next;
    });
  }

  async function handleStart() {
    setErr("");
    if (!pinCode.trim()) { setErr(T.pinRequired); return; }
    setPinLoading(true);
    var res = await pins.validate(pinCode.trim().toUpperCase());
    setPinLoading(false);
    if (!res.ok) { setErr(res.err); return; }

    // El nombre viene del registro del PIN
    var participantName = res.pin.name || pinCode.trim().toUpperCase();
    setName(participantName);

    // Buscar participante existente por PIN (id = "pin_" + pinCode)
    var pinId = "pin_" + pinCode.trim().toUpperCase();
    var ex = participants.find(function(x){ return x.id === pinId; });
    if (ex) {
      setExistId(ex.id);
      setPreds(Object.assign({}, ex.preds || {}));
    } else {
      setExistId(null);
    }
    setStep(1);
  }

  async function handleSave() {
    setSaving(true);
    var pinId = "pin_" + pinCode.trim().toUpperCase();
    var now = new Date().toISOString();

    // Agregar savedAt a cada predicción de partido abierto
    var predsStamped = {};
    MATCHES.forEach(function(m) {
      var pr = preds[m.id];
      if (!pr || pr.h === undefined || pr.h === '') return;
      if (isOpen(m)) {
        // Partido abierto: actualizar timestamp
        predsStamped[m.id] = Object.assign({}, pr, { savedAt: now });
      } else {
        // Partido cerrado: conservar el timestamp original si existe
        predsStamped[m.id] = pr;
      }
    });

    var upd = existId
      ? participants.map(function(x){
          return x.id === pinId
            ? Object.assign({}, x, { preds: predsStamped })
            : x;
        })
      : participants.concat([{ id: pinId, name: name, pin: pinCode.trim().toUpperCase(), preds: predsStamped }]);
    await saveP(upd);
    if (!existId) {
      await pins.markUsed(pinCode.trim().toUpperCase(), name);
      setExistId(pinId);
    }
    setSaving(false);
    setStep(2);
  }

  // ── Step 0: PIN ────────────────────────────────────────────────────
  if (step === 0) return html`<div class="fade" style=${{maxWidth:380,margin:"0 auto",padding:"40px 16px"}}>
    <${Btn} v="ghost" onClick=${function(){setView("home");}}>${T.back}</${Btn}>
    <div style=${{textAlign:"center",margin:"24px 0 28px"}}>
      <div style=${{fontSize:52,marginBottom:10}}>🔑</div>
      <h2 class="bb" style=${{fontSize:34,color:thm.accent}}>${T.registerPreds}</h2>
      <p style=${{color:thm.inv(.4),fontSize:13,marginTop:6,lineHeight:1.6}}>
        Ingresa tu PIN personal de 3 dígitos<br/>para acceder a tus predicciones.
      </p>
    </div>
    <${Card}>
      <${Field} label="Tu PIN personal">
        <input
          type="text"
          value=${pinCode}
          onInput=${function(e){
            var v = e.target.value.replace(/[^A-Za-z0-9]/g,"").toUpperCase().slice(0,3);
            setPinCode(v);
          }}
          onKeyDown=${function(e){if(e.key==="Enter")handleStart();}}
          placeholder="• • •"
          maxLength="3"
          style=${{
            width:"100%", boxSizing:"border-box",
            padding:"14px 16px", textAlign:"center",
            borderRadius:12, fontFamily:"'Bebas Neue',sans-serif",
            fontSize:36, letterSpacing:12,
            background:thm.inv(.07), border:thm.bdra(1,.4),
            color:thm.accent, outline:"none",
            caretColor:thm.accent
          }}
        />
      </${Field}>
      ${err && html`<p style=${{color:"#f87171",fontSize:13,marginBottom:12,textAlign:"center"}}>${err}</p>`}
      <${Btn} onClick=${handleStart} full=${true} disabled=${pinLoading}
        sx=${{padding:"14px",fontSize:16,borderRadius:12,marginTop:4}}>
        ${pinLoading ? T.verifying : "Entrar →"}
      </${Btn}>
    </${Card}>
  </div>`;

  // ── Step 2: Confirmación ───────────────────────────────────────────
  if (step === 2) return html`<div class="fade" style=${{maxWidth:440,margin:"0 auto",padding:"60px 16px",textAlign:"center"}}>
    <div style=${{fontSize:56,marginBottom:12}}>🎉</div>
    <h2 class="bb" style=${{fontSize:40,color:thm.accent}}>${name.toUpperCase()}</h2>
    <p style=${{color:thm.inv(.5),margin:"14px 0 24px",lineHeight:1.8}}>
      ${T.saved}${existId ? " " + T.updated : ""}<br/>${T.goodluck}
    </p>
    <div style=${{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
      <${Btn} onClick=${function(){setStep(1);}} v="secondary">← Editar</${Btn}>
      <${Btn} onClick=${function(){setView("leaderboard");}}>
        ${T.table}
      </${Btn}>
    </div>
  </div>`;

  // ── Step 1: Formulario de predicciones ────────────────────────────
  var phases = matchesByPhase();
  var phaseKeys = Object.keys(phases);

  return html`<div class="fade" style=${{maxWidth:680,margin:"0 auto",padding:"16px 16px 60px"}}>

    <!-- Cabecera -->
    <div style=${{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <${Btn} v="secondary" onClick=${function(){setStep(0);}} sx=${{padding:"7px 14px",fontSize:13}}>
        ${T.back}
      </${Btn}>
      <div style=${{flex:1}}>
        <${PBar} v=${filled} max=${MATCHES.length}/>
        <div style=${{fontSize:11,color:thm.inv(.35),marginTop:3}}>
          <span style=${{color:thm.accent,fontWeight:700}}>${name}</span>
          · ${filled} / ${MATCHES.length} predichos
        </div>
      </div>
      <${Btn} onClick=${handleSave} disabled=${saving} sx=${{padding:"8px 16px",fontSize:13}}>
        ${saving ? T.saving : "💾 Guardar"}
      </${Btn}>
    </div>

    <!-- Nota partidos cerrados -->
    ${MATCHES.some(function(m){ return !isOpen(m); }) && html`<div style=${{
      marginBottom:14,padding:"10px 14px",borderRadius:10,
      background:thm.inv(.04),border:thm.bdr(1,.08),
      fontSize:12,color:thm.inv(.45),display:"flex",gap:8,alignItems:"center"
    }}>
      <span>🔒</span>
      <span>Los partidos pasado el kickoff no se pueden editar.</span>
    </div>`}

    <!-- Partidos por fase -->
    ${phaseKeys.map(function(phase){
      var phaseMatches = phases[phase];
      return html`<div key=${phase} style=${{marginBottom:20}}>
        <div style=${{
          fontSize:11,fontWeight:700,color:thm.inv(.35),
          letterSpacing:".08em",marginBottom:10,textTransform:"uppercase"
        }}>📋 ${phase}</div>
        ${phaseMatches.map(function(m){
          var locked = !isOpen(m);
          var pr = preds[m.id] || {};
          var res = results && results[m.id];
          return html`<div key=${m.id}>
            <div style=${{
              display:"flex",justifyContent:"space-between",
              alignItems:"center",marginBottom:4,paddingLeft:2
            }}>
              <span style=${{fontSize:11,color:thm.inv(.35),fontWeight:600}}>
                Partido ${m.num}
              </span>
              <div style=${{display:"flex",alignItems:"center",gap:6}}>
                <span style=${{fontSize:10,color:thm.inv(.25)}}>${fmtKickoff(m.kickoff)}</span>
                <span style=${{
                  fontSize:9,fontWeight:700,letterSpacing:".08em",
                  padding:"2px 6px",borderRadius:4,
                  background: locked ? thm.inv(.06) : thm.a(.12),
                  color: locked ? thm.inv(.3) : thm.accent
                }}>${locked ? T.closed : T.open}</span>
                ${!locked && html`<span style=${{fontSize:10,color:thm.a(.7)}}>
                  ${countdown(m.kickoff)}
                </span>`}
              </div>
            </div>
            <${MatchInputRow}
              match=${m}
              hv=${pr.h || ""}
              av=${pr.a || ""}
              locked=${locked}
              result=${res}
              onH=${function(v){ if(!locked) setPred(m.id,"h",v); }}
              onA=${function(v){ if(!locked) setPred(m.id,"a",v); }}
            />
          </div>`;
        })}
      </div>`;
    })}

    <!-- Guardar -->
    <${Btn} onClick=${handleSave} disabled=${saving} full=${true}
      sx=${{padding:"14px",fontSize:16,borderRadius:14,marginTop:8}}>
      ${saving ? T.saving : "💾 " + T.save}
    </${Btn}>

  </div>`;
}

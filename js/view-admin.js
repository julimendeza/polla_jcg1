function AdminView(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var participants     = p.participants;
  var results          = p.results;
  var settings         = p.settings;
  var saveResults      = p.saveResults;
  var saveSettings     = p.saveSettings;
  var saveParticipants = p.saveParticipants;

  var pwSt   = useState(""); var pw = pwSt[0], setPw = pwSt[1];
  var authSt = useState(false); var auth = authSt[0], setAuth = authSt[1];
  var tabSt  = useState("results"); var tab = tabSt[0], setTab = tabSt[1];
  var locR   = useState(Object.assign({}, results));
  var locResults = locR[0], setLocResults = locR[1];
  var locS   = useState(Object.assign({}, DEF, settings));
  var locSettings = locS[0], setLocSettings = locS[1];
  var savedSt  = useState(false); var savedOk = savedSt[0], setSavedOk = savedSt[1];
  var pinListSt = useState(null); var pinList = pinListSt[0], setPinList = pinListSt[1];
  var newPinSt  = useState(""); var newPin = newPinSt[0], setNewPin = newPinSt[1];
  var newPinNameSt = useState(""); var newPinName = newPinNameSt[0], setNewPinName = newPinNameSt[1];
  var bulkSt   = useState(false); var showBulk = bulkSt[0], setShowBulk = bulkSt[1];

  useEffect(function(){ setLocResults(Object.assign({}, results)); }, [results]);
  useEffect(function(){ setLocSettings(Object.assign({}, DEF, settings)); }, [settings]);

  useEffect(function(){
    if (tab === "pins" && auth) {
      pins.get().then(setPinList);
    }
  }, [tab, auth]);

  function flash() {
    setSavedOk(true);
    setTimeout(function(){ setSavedOk(false); }, 2000);
  }

  function setResult(matchId, side, val) {
    setLocResults(function(prev){
      var next = Object.assign({}, prev);
      next[matchId] = Object.assign({}, next[matchId] || {});
      next[matchId][side] = val;
      return next;
    });
  }

  async function handleSaveResults() {
    await saveResults(locResults);
    flash();
  }

  async function handleSaveSettings() {
    await saveSettings(locSettings);
    flash();
  }

  async function handleDeleteParticipant(id) {
    if (!window.confirm(T.delConfirm)) return;
    await saveParticipants(participants.filter(function(x){ return x && x.id !== id; }));
  }

  async function handleAddPin() {
    var code = newPin.trim().toUpperCase();
    var name = newPinName.trim();
    if (!code || !name) return;
    var list = await pins.get();
    if (list.some(function(p){ return p.pin.toUpperCase() === code; })) return;
    var updated = list.concat([{
      pin: code, name: name, used: false, createdAt: new Date().toISOString()
    }]);
    await pins.set(updated);
    setPinList(updated);
    setNewPin("");
    setNewPinName("");
  }

  async function handleDeletePin(pin) {
    var list = await pins.get();
    var updated = list.filter(function(p){ return p.pin !== pin; });
    await pins.set(updated);
    setPinList(updated);
  }

  // Generar 40 PINs automáticamente (3 caracteres alfanuméricos)
  async function handleGenerate40() {
    if (!window.confirm("¿Generar 40 PINs aleatorios? Esto agrega 40 PINs vacíos (sin nombre) a la lista existente.")) return;
    var list = await pins.get();
    var existing = list.map(function(p){ return p.pin; });
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O, I, 0, 1 para evitar confusión
    var added = [];
    var attempts = 0;
    while (added.length < 40 && attempts < 500) {
      attempts++;
      var pin = "";
      for (var i=0;i<3;i++) pin += chars[Math.floor(Math.random()*chars.length)];
      if (existing.indexOf(pin) < 0 && added.indexOf(pin) < 0) added.push(pin);
    }
    var newPins = added.map(function(pin, i){
      return { pin: pin, name: "Participante " + (list.length + i + 1), used: false, createdAt: new Date().toISOString() };
    });
    var updated = list.concat(newPins);
    await pins.set(updated);
    setPinList(updated);
  }

  var inputStyle = {
    padding:"8px 10px", borderRadius:8, fontFamily:"'DM Sans',sans-serif",
    fontSize:13, background:thm.inv(.06), border:thm.bdr(1,.12),
    color:thm.inv(.9), outline:"none", width:"100%", boxSizing:"border-box"
  };

  var scoreInputStyle = {
    width:38, height:36, textAlign:"center", fontSize:16, fontWeight:700,
    borderRadius:7, border:thm.bdra(1,.35), background:thm.a(.08),
    color:thm.inv(.9), fontFamily:"'DM Sans',sans-serif", outline:"none",
    padding:0, MozAppearance:"textfield"
  };

  // ── Login ───────────────────────────────────────────────────────────
  if (!auth) return html`<div class="fade" style=${{maxWidth:360,margin:"0 auto",padding:"80px 16px",textAlign:"center"}}>
    <div style=${{fontSize:44,marginBottom:12}}>🔐</div>
    <h2 class="bb" style=${{fontSize:30,color:thm.accent,marginBottom:20}}>${T.adminTitle}</h2>
    <${Card}>
      <${Field} label=${T.adminPw}>
        <input type="password" value=${pw}
          onInput=${function(e){setPw(e.target.value);}}
          onKeyDown=${function(e){
            if(e.key==="Enter" && pw===(settings.adminPw||DEF.adminPw)) setAuth(true);
          }}
          placeholder="••••••••"
          style=${inputStyle}/>
      </${Field}>
      <${Btn} full=${true} onClick=${function(){
        if(pw===(settings.adminPw||DEF.adminPw)) setAuth(true);
        else { setPw(""); }
      }}>Entrar</${Btn}>
    </${Card}>
  </div>`;

  var tabs = [
    {id:"results",  label:"✅ Resultados"},
    {id:"parts",    label:"👥 Participantes"},
    {id:"pins",     label:"🔑 PINs"},
    {id:"settings", label:"⚙️ Ajustes"}
  ];

  return html`<div class="fade" style=${{maxWidth:680,margin:"0 auto",padding:"28px 16px 60px"}}>
    <div style=${{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
      <span style=${{fontSize:28}}>🔐</span>
      <h2 class="bb" style=${{fontSize:26,color:thm.accent}}>${T.adminTitle}</h2>
      ${savedOk && html`<span style=${{fontSize:12,color:"#4ade80",marginLeft:"auto",fontWeight:700}}>${T.savedOk}</span>`}
    </div>

    <!-- Tabs -->
    <div style=${{display:"flex",gap:6,flexWrap:"wrap",marginBottom:20}}>
      ${tabs.map(function(t){
        var active = tab === t.id;
        return html`<button key=${t.id} onClick=${function(){setTab(t.id);}} style=${{
          padding:"7px 12px", borderRadius:8, fontSize:12, fontWeight:700,
          cursor:"pointer", border:"none", fontFamily:"'DM Sans',sans-serif",
          background: active ? thm.accent : thm.inv(.07),
          color: active ? thm.onAccent : thm.inv(.65),
          transition:"all .15s"
        }}>${t.label}</button>`;
      })}
    </div>

    <!-- ── TAB: Resultados ── -->
    ${tab === "results" && html`<div>
      <p style=${{fontSize:12,color:thm.inv(.4),marginBottom:14}}>
        Ingresa los resultados reales. Las predicciones se evalúan automáticamente.
      </p>
      ${MATCHES.map(function(m){
        var r = locResults[m.id] || {};
        var open = isOpen(m);
        return html`<div key=${m.id} style=${{
          display:"flex", alignItems:"center", gap:10,
          padding:"10px 12px", borderRadius:12, marginBottom:8,
          background:thm.inv(.03), border:thm.bdr(1,.07)
        }}>
          <span style=${{width:20,fontSize:10,color:thm.inv(.35),fontWeight:700,flexShrink:0}}>
            ${m.num}
          </span>
          <div style=${{flex:1,display:"flex",alignItems:"center",gap:6,justifyContent:"flex-end"}}>
            <span style=${{fontSize:12,color:thm.inv(.7),textAlign:"right"}}>${teamName(m.home)}</span>
            <${FlagImg} team=${m.home}/>
          </div>
          <div style=${{display:"flex",alignItems:"center",gap:5}}>
            <input type="number" min="0" max="20" value=${r.h||""}
              onInput=${function(e){setResult(m.id,"h",e.target.value);}}
              style=${scoreInputStyle}/>
            <span style=${{color:thm.inv(.3),fontWeight:700}}>-</span>
            <input type="number" min="0" max="20" value=${r.a||""}
              onInput=${function(e){setResult(m.id,"a",e.target.value);}}
              style=${scoreInputStyle}/>
          </div>
          <div style=${{flex:1,display:"flex",alignItems:"center",gap:6}}>
            <${FlagImg} team=${m.away}/>
            <span style=${{fontSize:12,color:thm.inv(.7)}}>${teamName(m.away)}</span>
          </div>
          <span style=${{
            fontSize:9,padding:"2px 6px",borderRadius:4,flexShrink:0,
            background:open?thm.a(.1):thm.inv(.06),
            color:open?thm.accent:thm.inv(.3),fontWeight:700
          }}>${open?"ABIERTO":"JUGADO"}</span>
        </div>`;
      })}
      <${Btn} onClick=${handleSaveResults} full=${true} sx=${{marginTop:8,padding:"13px"}}>
        💾 Guardar resultados
      </${Btn}>
    </div>`}

    <!-- ── TAB: Participantes ── -->
    ${tab === "parts" && html`<div>
      <p style=${{fontSize:12,color:thm.inv(.4),marginBottom:14}}>
        ${participants.length} participantes registrados
      </p>
      ${participants.length === 0
        ? html`<${Card} sx=${{textAlign:"center",padding:"40px 20px",color:thm.inv(.3)}}>${T.noPart}</${Card}>`
        : participants.map(function(par){
          var sc = calcScore(par.preds||{}, results, settings.scoring);
          var predCount = MATCHES.filter(function(m){
            var pr = par.preds && par.preds[m.id];
            return pr && pr.h !== "" && pr.h !== undefined;
          }).length;
          return html`<div key=${par.id} style=${{
            display:"flex", alignItems:"center", gap:12,
            padding:"12px 14px", borderRadius:12, marginBottom:8,
            background:thm.inv(.03), border:thm.bdr(1,.07)
          }}>
            <div style=${{
              width:36, height:36, borderRadius:10, flexShrink:0,
              background:thm.a(.15), color:thm.accent,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontFamily:"'Bebas Neue',sans-serif", fontSize:14, letterSpacing:1
            }}>${par.pin || "?"}</div>
            <div style=${{flex:1}}>
              <div style=${{fontWeight:600,fontSize:14,color:thm.inv(.9)}}>${par.name}</div>
              <div style=${{fontSize:10,color:thm.inv(.3),marginTop:2}}>
                ${predCount}/${MATCHES.length} predicciones
              </div>
            </div>
            <div style=${{textAlign:"right"}}>
              <div class="bb" style=${{fontSize:20,color:thm.accent}}>${sc.pts}</div>
              <div style=${{fontSize:10,color:thm.inv(.3)}}>pts</div>
            </div>
            <${Btn} v="danger"
              onClick=${function(){ handleDeleteParticipant(par.id); }}
              sx=${{padding:"6px 10px",fontSize:11}}>🗑</${Btn}>
          </div>`;
        })
      }
    </div>`}

    <!-- ── TAB: PINs ── -->
    ${tab === "pins" && html`<div>
      <!-- Stats -->
      ${pinList && html`<div style=${{
        display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:16
      }}>
        ${[
          {label:"Total PINs",  val:pinList.length, icon:"🔑"},
          {label:"Usados",      val:pinList.filter(function(p){return p.used;}).length, icon:"✅"},
          {label:"Disponibles", val:pinList.filter(function(p){return !p.used;}).length, icon:"⏳"}
        ].map(function(s){
          return html`<div style=${{
            textAlign:"center", padding:"12px 8px", borderRadius:12,
            background:thm.inv(.04), border:thm.bdr(1,.07)
          }}>
            <div style=${{fontSize:18}}>${s.icon}</div>
            <div class="bb" style=${{fontSize:22,color:thm.accent}}>${s.val}</div>
            <div style=${{fontSize:10,color:thm.inv(.3)}}>${s.label}</div>
          </div>`;
        })}
      </div>`}

      <!-- Agregar PIN individual -->
      <${Card} sx=${{marginBottom:14}}>
        <div style=${{
          fontSize:11,fontWeight:700,color:thm.inv(.35),
          letterSpacing:".08em",marginBottom:12,textTransform:"uppercase"
        }}>➕ Agregar PIN</div>
        <div style=${{display:"flex",gap:8,alignItems:"flex-end",flexWrap:"wrap"}}>
          <div style=${{flex:"0 0 90px"}}>
            <${Field} label="PIN (3 dígitos)">
              <input type="text" value=${newPin}
                onInput=${function(e){
                  setNewPin(e.target.value.replace(/[^A-Za-z0-9]/g,"").toUpperCase().slice(0,3));
                }}
                placeholder="ABC"
                style=${Object.assign({},inputStyle,{
                  letterSpacing:4, fontWeight:700, textAlign:"center",
                  fontFamily:"'Bebas Neue',sans-serif", fontSize:18
                })}/>
            </${Field}>
          </div>
          <div style=${{flex:1,minWidth:140}}>
            <${Field} label="Nombre del participante">
              <input type="text" value=${newPinName}
                onInput=${function(e){setNewPinName(e.target.value);}}
                onKeyDown=${function(e){if(e.key==="Enter")handleAddPin();}}
                placeholder="Nombre completo"
                style=${inputStyle}/>
            </${Field}>
          </div>
          <div style=${{marginBottom:14}}>
            <${Btn} onClick=${handleAddPin}
              disabled=${!newPin.trim() || !newPinName.trim()}
              sx=${{padding:"9px 16px",whiteSpace:"nowrap"}}>
              Agregar
            </${Btn}>
          </div>
        </div>
        <!-- Generar 40 de una vez -->
        <div style=${{borderTop:thm.bdr(1,.07),paddingTop:12,marginTop:4}}>
          <${Btn} v="secondary" onClick=${handleGenerate40}
            sx=${{fontSize:12,padding:"8px 14px"}}>
            ⚡ Generar 40 PINs automáticos
          </${Btn}>
          <p style=${{fontSize:11,color:thm.inv(.3),marginTop:6}}>
            Genera 40 PINs con nombres genéricos. Puedes cambiar el nombre después desde Firebase directamente, o borrar y agregar uno a uno.
          </p>
        </div>
      </${Card}>

      <!-- Lista de PINs -->
      ${pinList === null
        ? html`<p style=${{color:thm.inv(.3),fontSize:13}}>Cargando PINs...</p>`
        : pinList.length === 0
          ? html`<${Card} sx=${{textAlign:"center",padding:"30px",color:thm.inv(.3)}}>
              Sin PINs aún. Agrega uno arriba o usa el generador automático.
            </${Card}>`
          : html`<${Card} sx=${{padding:0,overflow:"hidden"}}>
              <!-- Header -->
              <div style=${{
                display:"grid",gridTemplateColumns:"60px 1fr 80px 32px",
                padding:"7px 14px",borderBottom:thm.bdr(1,.08),
                fontSize:10,color:thm.inv(.3),fontWeight:700,letterSpacing:".06em"
              }}>
                <span>PIN</span><span>NOMBRE</span><span>ESTADO</span><span></span>
              </div>
              ${pinList.map(function(pin){
                return html`<div key=${pin.pin} style=${{
                  display:"grid",gridTemplateColumns:"60px 1fr 80px 32px",
                  alignItems:"center",padding:"9px 14px",
                  borderBottom:thm.bdr(1,.05),
                  background:pin.used?thm.a(.05):"transparent"
                }}>
                  <code style=${{
                    fontFamily:"'Bebas Neue',sans-serif",fontSize:16,
                    letterSpacing:2,color:thm.accent
                  }}>${pin.pin}</code>
                  <span style=${{fontSize:13,color:thm.inv(.8),fontWeight:pin.used?600:400}}>
                    ${pin.name}
                  </span>
                  <span style=${{
                    fontSize:10,color:pin.used?"#4ade80":thm.inv(.3),fontWeight:700
                  }}>${pin.used?"✅ Usado":"—"}</span>
                  <button
                    onClick=${function(){ handleDeletePin(pin.pin); }}
                    style=${{
                      background:"none",border:"none",cursor:"pointer",
                      color:thm.inv(.3),fontSize:14,padding:2
                    }}>🗑</button>
                </div>`;
              })}
            </${Card}>`
      }
    </div>`}

    <!-- ── TAB: Ajustes ── -->
    ${tab === "settings" && html`<div>
      <${Card}>
        <${Field} label=${T.adminPw}>
          <input type="text" value=${locSettings.adminPw||""}
            onInput=${function(e){setLocSettings(function(s){return Object.assign({},s,{adminPw:e.target.value});});}}
            style=${inputStyle}/>
        </${Field}>
        <${Field} label="Firebase Realtime Database URL">
          <input type="url" value=${locSettings.firebase||""}
            onInput=${function(e){setLocSettings(function(s){return Object.assign({},s,{firebase:e.target.value});});}}
            placeholder="https://tu-app-default-rtdb.firebaseio.com"
            style=${inputStyle}/>
        </${Field}>
        <${Field} label="Puntos por resultado correcto (G/E/P)">
          <input type="number" value=${(locSettings.scoring||{}).result||1}
            onInput=${function(e){
              setLocSettings(function(s){
                return Object.assign({},s,{scoring:Object.assign({},s.scoring||{},{result:+e.target.value})});
              });
            }}
            style=${Object.assign({},inputStyle,{width:80})}/>
        </${Field}>
        <${Field} label="Puntos adicionales por marcador exacto">
          <input type="number" value=${(locSettings.scoring||{}).exact||3}
            onInput=${function(e){
              setLocSettings(function(s){
                return Object.assign({},s,{scoring:Object.assign({},s.scoring||{},{exact:+e.target.value})});
              });
            }}
            style=${Object.assign({},inputStyle,{width:80})}/>
        </${Field}>
        <${Btn} onClick=${handleSaveSettings} full=${true} sx=${{marginTop:4,padding:"13px"}}>
          💾 Guardar ajustes
        </${Btn}>
      </${Card}>
    </div>`}

  </div>`;
}

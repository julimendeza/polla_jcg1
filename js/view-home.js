function HomeView(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var participants = p.participants;
  var results      = p.results;
  var settings     = p.settings;
  var setView      = p.setView;

  var started = hasStarted();
  var human = participants.filter(function(x){ return x && x.id !== "_bot"; });

  // Clasificación rápida
  var ranked = useMemo(function(){
    return participants
      .filter(function(x){ return x && x.id !== "_bot"; })
      .map(function(x){
        return Object.assign({}, x, calcScore(x.preds || {}, results, settings.scoring));
      })
      .sort(function(a,b){ return b.pts - a.pts; });
  }, [participants, results, settings]);

  var completed = completedCount(results);
  var openCount = MATCHES.filter(isOpen).length;

  // Tour primer acceso
  var tourDone = false;
  try { tourDone = !!localStorage.getItem("jcg_tour_done"); } catch(e){}
  var tourSt = useState(tourDone ? 0 : 1);
  var tourStep = tourSt[0], setTourStep = tourSt[1];

  function tourDone2() {
    try { localStorage.setItem("jcg_tour_done","1"); } catch(e){}
    setTourStep(0);
  }

  return html`<div class="fade" style=${{maxWidth:680,margin:"0 auto",padding:"28px 16px 60px"}}>

    <!-- Tour primer visita -->
    ${tourStep > 0 && html`<div style=${{
      position:"fixed",inset:0,zIndex:1000,
      background:"rgba(0,0,0,.8)",backdropFilter:"blur(6px)",
      display:"flex",alignItems:"center",justifyContent:"center",padding:16
    }}>
      <div style=${{
        background:thm.tourBg, border:thm.bdra(1,.3),
        borderRadius:20, padding:28, maxWidth:360, width:"100%",textAlign:"center"
      }}>
        <div style=${{fontSize:44,marginBottom:10}}>⚽</div>
        <h2 class="bb" style=${{fontSize:28,color:thm.accent,marginBottom:10}}>
          ¡BIENVENIDO!
        </h2>
        <p style=${{color:thm.inv(.7),fontSize:14,lineHeight:1.7,marginBottom:20}}>
          Predice el marcador de los <strong style=${{color:thm.accent}}>17 partidos</strong> seleccionados del Mundial 2026.<br/><br/>
          <strong>1 punto</strong> por resultado correcto (G/E/P)<br/>
          <strong>+3 puntos</strong> adicionales por marcador exacto<br/><br/>
          Las predicciones se cierran automáticamente al inicio de cada partido.
        </p>
        <${Btn} onClick=${tourDone2} full=${true} sx=${{padding:"13px",fontSize:15}}>
          ¡Entendido, a jugar! →
        </${Btn}>
        <div style=${{marginTop:10}}>
          <button onClick=${tourDone2} style=${{
            background:"none",border:"none",color:thm.inv(.3),
            fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"
          }}>Saltar</button>
        </div>
      </div>
    </div>`}

    <!-- Encabezado -->
    <div style=${{textAlign:"center",marginBottom:28}}>
      <div style=${{fontSize:52,marginBottom:6}}>⚽</div>
      <h1 class="bb" style=${{
        fontSize:"clamp(28px,7vw,52px)",
        background:thm.accentGrad,
        WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",
        backgroundClip:"text",marginBottom:6
      }} key=${thm.id}>${T.title}</h1>
      <p style=${{color:thm.inv(.4),fontSize:13}}>${T.sub}</p>
    </div>

    <!-- Banner Salsamentaria -->
    <div style=${{
      marginBottom:20, padding:"14px 18px", borderRadius:14,
      background:thm.a(.08), border:thm.bdra(1,.25),
      textAlign:"center"
    }}>
      <div style=${{fontSize:11,fontWeight:700,color:thm.accent,letterSpacing:".1em",textTransform:"uppercase",marginBottom:4}}>
        🏪 ${T.salsamentaria}
      </div>
      <p style=${{fontSize:12,color:thm.inv(.55),lineHeight:1.6}}>${T.salsaSub}</p>
    </div>

    <!-- Premios -->
    <${Card} sx=${{marginBottom:20,padding:"16px 18px"}}>
      <div style=${{
        fontSize:11,fontWeight:700,color:thm.inv(.35),
        letterSpacing:".08em",marginBottom:12,textTransform:"uppercase"
      }}>🏆 Premios</div>
      <div style=${{display:"flex",flexDirection:"column",gap:8}}>
        ${[
          {label:T.prize1, bg:thm.a(.12), color:thm.accent},
          {label:T.prize2, bg:thm.inv(.06), color:thm.inv(.7)},
          {label:T.prize3, bg:thm.inv(.04), color:thm.inv(.55)}
        ].map(function(pr, i){
          return html`<div key=${i} style=${{
            padding:"10px 14px", borderRadius:10,
            background:pr.bg, fontWeight:700,
            fontSize:14, color:pr.color
          }}>${pr.label}</div>`;
        })}
      </div>
    </${Card}>

    <!-- Stats rápidas -->
    <div style=${{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20}}>
      ${[
        {icon:"👥", val:human.length, label:"Participantes"},
        {icon:"🏟",  val:openCount,   label:openCount===1?"partido abierto":"partidos abiertos"},
        {icon:"✅",  val:completed,   label:"con resultado"}
      ].map(function(s){
        return html`<div style=${{
          textAlign:"center",padding:"14px 8px",borderRadius:14,
          background:thm.inv(.04),border:thm.bdr(1,.07)
        }}>
          <div style=${{fontSize:22}}>${s.icon}</div>
          <div class="bb" style=${{fontSize:24,color:thm.accent,lineHeight:1}}>${s.val}</div>
          <div style=${{fontSize:10,color:thm.inv(.35),marginTop:2}}>${s.label}</div>
        </div>`;
      })}
    </div>

    <!-- CTA principal -->
    <${Btn} onClick=${function(){setView("predict");}} full=${true}
      sx=${{padding:"15px",fontSize:16,borderRadius:14,marginBottom:20}}>
      ⚽ Registrar / editar predicciones →
    </${Btn}>

    <!-- Tabla rápida (si empezó) -->
    ${started && ranked.length > 0 && html`<div style=${{marginBottom:20}}>
      <div style=${{
        fontSize:11,fontWeight:700,color:thm.inv(.35),
        letterSpacing:".08em",marginBottom:10,textTransform:"uppercase"
      }}>🏅 Clasificación actual</div>
      ${ranked.slice(0,5).map(function(r,i){
        return html`<div key=${r.id} style=${{
          display:"flex",alignItems:"center",gap:10,
          padding:"10px 14px",borderRadius:12,marginBottom:6,
          background: i===0 ? thm.a(.1) : thm.inv(.03),
          border: i===0 ? thm.bdra(1,.25) : thm.bdr(1,.07)
        }}>
          <span style=${{
            width:22,height:22,borderRadius:6,flexShrink:0,
            background:i===0?thm.a(.2):thm.inv(.07),
            color:i===0?thm.accent:thm.inv(.4),
            display:"flex",alignItems:"center",justifyContent:"center",
            fontSize:11,fontWeight:700
          }}>${i+1}</span>
          <span style=${{flex:1,fontWeight:600,color:thm.inv(.85),fontSize:14}}>
            ${r.name}
          </span>
          <span class="bb" style=${{fontSize:20,color:thm.accent}}>
            ${r.pts}
          </span>
          <span style=${{fontSize:11,color:thm.inv(.35)}}>pts</span>
        </div>`;
      })}
      ${ranked.length > 5 && html`<div style=${{textAlign:"center",marginTop:4}}>
        <button onClick=${function(){setView("leaderboard");}} style=${{
          background:"none",border:"none",color:thm.accent,
          fontSize:12,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"
        }}>Ver tabla completa →</button>
      </div>`}
    </div>`}

    <!-- Lista de partidos -->
    <div>
      <div style=${{
        fontSize:11,fontWeight:700,color:thm.inv(.35),
        letterSpacing:".08em",marginBottom:10,textTransform:"uppercase"
      }}>📋 Los 17 partidos</div>
      ${MATCHES.map(function(m){
        return html`<${MatchCard} key=${m.id}
          match=${m}
          result=${results && results[m.id]}
          pred=${null}
        />`;
      })}
    </div>

    <!-- Info de puntuación -->
    <${Card} sx=${{marginTop:20,textAlign:"center"}}>
      <div style=${{fontSize:11,fontWeight:700,color:thm.inv(.35),letterSpacing:".08em",marginBottom:10,textTransform:"uppercase"}}>
        📊 Sistema de puntos
      </div>
      <div style=${{display:"flex",justifyContent:"center",gap:24}}>
        <div style=${{textAlign:"center"}}>
          <div class="bb" style=${{fontSize:28,color:thm.accent}}>1</div>
          <div style=${{fontSize:11,color:thm.inv(.5)}}>punto por resultado<br/>correcto (G/E/P)</div>
        </div>
        <div style=${{color:thm.inv(.15),fontSize:24,alignSelf:"center"}}>+</div>
        <div style=${{textAlign:"center"}}>
          <div class="bb" style=${{fontSize:28,color:thm.accent}}>3</div>
          <div style=${{fontSize:11,color:thm.inv(.5)}}>puntos adicionales<br/>por marcador exacto</div>
        </div>
        <div style=${{color:thm.inv(.15),fontSize:24,alignSelf:"center"}}>=</div>
        <div style=${{textAlign:"center"}}>
          <div class="bb" style=${{fontSize:28,color:thm.accent}}>4</div>
          <div style=${{fontSize:11,color:thm.inv(.5)}}>puntos máximo<br/>por partido</div>
        </div>
      </div>
    </${Card}>

<!-- Disclaimer eliminatoria -->
    <div style=${{
      marginTop:20, padding:"12px 16px", borderRadius:12,
      background:thm.inv(.03), border:thm.bdr(1,.07),
      fontSize:12, color:thm.inv(.35), textAlign:"center", lineHeight:1.7
    }}>
      ⚽ Los partidos de fase eliminatoria (Ronda de 32 hasta la Final) se agregarán
      a medida que se confirmen los equipos clasificados.
    </div>

  </div>`;
}

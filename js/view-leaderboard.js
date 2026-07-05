function LeaderboardView(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var participants = p.participants;
  var results      = p.results;
  var settings     = p.settings;

  var started = hasStarted();
  var expSt = useState(null); var exp = expSt[0], setExp = expSt[1];

  var human = participants.filter(function(x){ return x && x.id !== "_bot"; });

  var ranked = useMemo(function(){
    return human
      .map(function(x){
        return Object.assign({}, x, calcScore(x.preds || {}, results, settings.scoring));
      })
      .sort(cmpRank);
  }, [participants, results, settings]);

  // Tabla no visible hasta que empiece el torneo
  if (!started) return html`<div class="fade" style=${{
    maxWidth:680,margin:"0 auto",padding:"80px 16px",textAlign:"center"
  }}>
    <div style=${{fontSize:52,marginBottom:16}}>⏳</div>
    <h2 class="bb" style=${{fontSize:32,color:thm.accent,marginBottom:12}}>
      TABLA PENDIENTE
    </h2>
    <p style=${{color:thm.inv(.4),fontSize:14,lineHeight:1.8}}>
      ${T.hiddenMsg}<br/>
      <span style=${{fontSize:12}}>
        Primer partido: ${fmtKickoff(MATCHES.slice().sort(function(a,b){
          return new Date(a.kickoff) - new Date(b.kickoff);
        })[0].kickoff)}
      </span>
    </p>
  </div>`;

  if (ranked.length === 0) return html`<div class="fade" style=${{
    maxWidth:680,margin:"0 auto",padding:"60px 16px",textAlign:"center"
  }}>
    <p style=${{color:thm.inv(.3)}}>${T.noPart}</p>
  </div>`;

  return html`<div class="fade" style=${{maxWidth:680,margin:"0 auto",padding:"28px 16px 60px"}}>

    <!-- Encabezado -->
    <div style=${{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
      <span style=${{fontSize:36}}>🏅</span>
      <div>
        <h2 class="bb" style=${{fontSize:30,color:thm.accent}}>${T.leaderTitle}</h2>
        <p style=${{color:thm.inv(.4),fontSize:13}}>${ranked.length} participantes</p>
      </div>
    </div>

    <!-- Premios -->
    <div style=${{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
      ${[
        {label:T.prize1, bg:thm.a(.12), color:thm.accent},
        {label:T.prize2, bg:thm.inv(.06), color:thm.inv(.65)},
        {label:T.prize3, bg:thm.inv(.04), color:thm.inv(.45)}
      ].map(function(pr,i){
        return html`<div key=${i} style=${{
          flex:1, minWidth:130, padding:"9px 12px", borderRadius:10,
          background:pr.bg, fontWeight:700, fontSize:12, color:pr.color,
          textAlign:"center", lineHeight:1.4
        }}>${pr.label}</div>`;
      })}
    </div>

    <!-- Progreso de resultados -->
    <div style=${{marginBottom:16,padding:"10px 14px",borderRadius:10,
      background:thm.inv(.04),border:thm.bdr(1,.07)}}>
      <div style=${{display:"flex",justifyContent:"space-between",marginBottom:5}}>
        <span style=${{fontSize:11,color:thm.inv(.4)}}>Resultados ingresados</span>
        <span style=${{fontSize:11,color:thm.accent,fontWeight:700}}>${completedCount(results)} / ${MATCHES.length}</span>
      </div>
      <${PBar} v=${completedCount(results)} max=${MATCHES.length}/>
    </div>

    <!-- Tabla -->
    <${Card} sx=${{padding:0,overflow:"hidden"}}>
      <!-- Cabecera -->
      <div style=${{
        display:"grid",gridTemplateColumns:"36px 1fr 60px",
        padding:"8px 16px",borderBottom:thm.bdr(1,.08),
        fontSize:10,color:thm.inv(.3),fontWeight:700,letterSpacing:".06em"
      }}>
        <span>#</span>
        <span>NOMBRE</span>
        <span style=${{textAlign:"right"}}>PTS</span>
      </div>

      <!-- Filas -->
      ${ranked.map(function(r, i){
        var isExp = exp === r.id;
        var medal = i===0?"🥇":i===1?"🥈":i===2?"🥉":null;

        return html`<div key=${r.id}>
          <!-- Fila principal -->
          <div
            onClick=${function(){ setExp(isExp ? null : r.id); }}
            style=${{
              display:"grid",gridTemplateColumns:"36px 1fr 60px",
              padding:"12px 16px",cursor:"pointer",
              borderBottom:thm.bdr(1,isExp?.1:.05),
              background:isExp?thm.a(.07):i%2===0?"transparent":thm.inv(.02),
              transition:"background .15s"
            }}
          >
            <span style=${{
              fontSize:i<3?18:13,
              color:i<3?undefined:thm.inv(.35),
              fontWeight:700,lineHeight:1.2
            }}>${medal || (i+1)}</span>
            <div style=${{display:"flex",flexDirection:"column",justifyContent:"center",minWidth:0}}>
              <span style=${{
                fontWeight:600,fontSize:14,
                color:isExp?thm.accent:thm.inv(.85)
              }}>${r.name}</span>
              <span style=${{fontSize:10,color:thm.inv(.35),marginTop:1}}>
                ⭐ ${r.exacts} exactos · ✓ ${r.correct} aciertos
              </span>
            </div>
            <span class="bb" style=${{
              textAlign:"right",fontSize:22,alignSelf:"center",
              color:isExp?thm.accent:thm.inv(.9)
            }}>${r.pts}</span>
          </div>

          <!-- Detalle expandido -->
          ${isExp && html`<div style=${{
            padding:"12px 16px 16px",
            background:thm.a(.04),
            borderBottom:thm.bdr(1,.08)
          }}>
            <div style=${{
              fontSize:10,fontWeight:700,color:thm.inv(.3),
              letterSpacing:".08em",marginBottom:10,textTransform:"uppercase"
            }}>Mis predicciones</div>
            ${MATCHES.map(function(m){
              var pr  = r.preds && r.preds[m.id];
              var res = results && results[m.id];
              return html`<${MatchCard} key=${m.id}
                match=${m} result=${res} results=${results} pred=${pr}/>`;
            })}
          </div>`}
        </div>`;
      })}
    </${Card}>

  </div>`;
}

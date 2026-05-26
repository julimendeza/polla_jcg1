function LeaderboardView(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var participants = p.participants;
  var results      = p.results;
  var settings     = p.settings;

  var started = hasStarted();
  var expSt = useState(null); var exp = expSt[0], setExp = expSt[1];

  var human = participants.filter(function(x){ return x.id !== "_bot"; });
  var total  = human.length * (settings.entryFee || DEF.entryFee);
  var currency = settings.currency || DEF.currency;

  var ranked = useMemo(function(){
    return human
      .map(function(x){
        return Object.assign({}, x, calcScore(x.preds || {}, results, settings.scoring));
      })
      .sort(function(a,b){
        if (b.pts !== a.pts) return b.pts - a.pts;
        return a.name.localeCompare(b.name);
      });
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
    <div style=${{display:"flex",alignItems:"center",gap:12,marginBottom:22}}>
      <span style=${{fontSize:36}}>🏅</span>
      <div>
        <h2 class="bb" style=${{fontSize:30,color:thm.accent}}>${T.leaderTitle}</h2>
        <p style=${{color:thm.inv(.4),fontSize:13}}>
          ${ranked.length} participantes · ${currency} ${total.toLocaleString("es-CO")}
        </p>
      </div>
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
            <span style=${{
              fontWeight:600,fontSize:14,
              color:isExp?thm.accent:thm.inv(.85)
            }}>${r.name}</span>
            <span class="bb" style=${{
              textAlign:"right",fontSize:22,
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
                match=${m} result=${res} pred=${pr}/>`;
            })}
          </div>`}
        </div>`;
      })}
    </${Card}>

    <!-- Leyenda de puntos -->
    <div style=${{
      marginTop:16,display:"flex",gap:16,flexWrap:"wrap",
      justifyContent:"center",fontSize:11,color:thm.inv(.4)
    }}>
      <span style=${{color:"#4ade80",fontWeight:700}}>⭐ Marcador exacto (+4 pts)</span>
      <span style=${{color:thm.accent,fontWeight:700}}>✓ Resultado correcto (+1 pt)</span>
      <span style=${{color:"#f87171",fontWeight:700}}>✗ Incorrecto (0 pts)</span>
    </div>
  </div>`;
}

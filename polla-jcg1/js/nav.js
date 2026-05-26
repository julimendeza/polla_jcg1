function Nav(p) {
  var ctx = useApp();
  var thm = ctx.thm || THEMES.noche;
  var view = p.view, setView = p.setView;

  var navItems = [
    { id:"predict",     label:"⚽ Predecir" },
    { id:"leaderboard", label:T.table },
    { id:"admin",       label:"🔐 Admin" }
  ];

  return html`<nav style=${{
    position:"sticky", top:0, zIndex:100,
    background: thm.id === "pasion" ? "rgba(15,6,0,.97)" : "rgba(5,13,26,.97)",
    backdropFilter:"blur(14px)",
    borderBottom: thm.bdr(1,.07)
  }}>
    <div style=${{
      maxWidth:680, margin:"0 auto",
      display:"flex", alignItems:"center",
      justifyContent:"space-between",
      padding:"0 14px", height:50
    }}>

      <!-- Logo -->
      <button onClick=${function(){ setView("home"); }} style=${{
        background:"none", border:"none", color:thm.accent,
        fontFamily:"'Bebas Neue',sans-serif", fontSize:18,
        cursor:"pointer", letterSpacing:".06em", flexShrink:0
      }}>⚽ ${T.title}</button>

      <!-- Nav items -->
      <div style=${{display:"flex", gap:2, alignItems:"center"}}>
        ${navItems.map(function(x){
          var active = view === x.id;
          return html`<button key=${x.id}
            onClick=${function(){ setView(x.id); }}
            style=${{
              padding:"5px 9px", borderRadius:7,
              fontSize:12, fontWeight:600,
              cursor:"pointer", border:"none", transition:"all .15s",
              background: active ? thm.accent : "transparent",
              color: active ? thm.onAccent : thm.inv(.65),
              fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap"
            }}>${x.label}</button>`;
        })}

        <!-- Toggle de tema -->
        <button onClick=${function(){
          ctx.setTheme(thm.id === 'noche' ? 'pasion' : 'noche');
        }} style=${{
          padding:"4px 8px", borderRadius:7, fontSize:12,
          background: thm.inv(.07), border: thm.bdr(1,.1),
          cursor:"pointer", color: thm.inv(.6),
          fontFamily:"'DM Sans',sans-serif", marginLeft:3,
          lineHeight:1, transition:"all .15s"
        }}>${thm.id === 'noche' ? '🔥' : '🌙'}</button>
      </div>
    </div>
  </nav>`;
}

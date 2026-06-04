function App() {
  var viewSt    = useState("home");   var view = viewSt[0],    setView = viewSt[1];
  var partSt    = useState([]);       var parts = partSt[0],   setParts = partSt[1];
  var resSt     = useState({});       var results = resSt[0],  setResults = resSt[1];
  var settingsSt= useState(Object.assign({}, DEF));
  var settings = settingsSt[0], setSettings = settingsSt[1];
  var readySt   = useState(false);    var ready = readySt[0],  setReady = readySt[1];
  var themeSt   = useState(function(){
    try { return localStorage.getItem("jcg_theme") || "noche"; } catch(e){ return "noche"; }
  });
  var theme = themeSt[0], setThemeRaw = themeSt[1];

  // ── Carga inicial ──────────────────────────────────────────────────
  useEffect(function(){
    var done = false;
    function finish(){ if(!done){ done=true; setReady(true); } }
    var safety = setTimeout(finish, 10000);

    (async function(){
      try {
        // Conectar Firebase con URL por defecto
        if (DEF.firebase) {
          db._url = DEF.firebase;
        }
        // Cargar settings
        var ss = await db.get("jcg_s");
        var merged = Object.assign({}, DEF, ss||{}, {
          scoring: Object.assign({}, DEF.scoring, (ss&&ss.scoring)||{})
        });
        setSettings(merged);

        // Conectar Firebase con URL de settings (si difiere del default)
        if (merged.firebase) db._url = merged.firebase;

        // Cargar participantes y resultados en paralelo
        var loaded = await Promise.all([
          db.get("jcg_p"),
          db.get("jcg_r")
        ]);
        if (loaded[0]) { var rawP = loaded[0]; setParts(Array.isArray(rawP) ? rawP : Object.values(rawP).filter(Boolean)); }
        if (loaded[1]) setResults(loaded[1]);
      } catch(e) {
        console.error("Init error:", e);
      }
      finish();
      clearTimeout(safety);
    })();
  }, []);

  // ── Helpers de guardado ────────────────────────────────────────────
  function sv(key, setter) {
    return async function(data){ setter(data); await db.set(key, data); };
  }

  function setTheme(t) {
    setThemeRaw(t);
    try { localStorage.setItem("jcg_theme", t); } catch(e){}
    document.body.dataset.theme = t;
  }

  async function saveSettings(newS) {
    setSettings(newS);
    await db.set("jcg_s", newS);
    if (newS.firebase) db._url = newS.firebase;
  }

  // Aplicar tema al montar
  useEffect(function(){ document.body.dataset.theme = theme; }, [theme]);

  // ── Pantalla de carga ──────────────────────────────────────────────
  var thm = THEMES[theme] || THEMES.noche;
  if (!ready) return html`<div style=${{
    minHeight:"100vh", background:thm.loadBg,
    display:"flex", alignItems:"center", justifyContent:"center",
    fontFamily:"'DM Sans',sans-serif", color:thm.loadColor,
    fontSize:18, letterSpacing:".15em", flexDirection:"column", gap:16
  }}>
    <span style=${{fontSize:36}}>⚽</span>
    ${T.loading}
  </div>`;

  var ctxValue = {
    thm: THEMES[theme] || THEMES.noche,
    setTheme: setTheme
  };

  return html`<${AppCtx.Provider} value=${ctxValue}>
    <div style=${{
      minHeight:"100vh",
      background:thm.bodyBg,
      backgroundImage:thm.bodyGrad,
      fontFamily:"'DM Sans',sans-serif",
      color:thm.inv(.9)
    }}>

      <${Nav} view=${view} setView=${setView}/>

      ${view === "home" && html`<${HomeView}
        participants=${parts} results=${results}
        settings=${settings} setView=${setView}/>`}

      ${view === "predict" && html`<${PredictView}
        participants=${parts}
        results=${results}
        saveP=${sv("jcg_p", setParts)}
        setView=${setView}
        settings=${settings}/>`}

      ${view === "leaderboard" && html`<${LeaderboardView}
        participants=${parts} results=${results} settings=${settings}/>`}

      ${view === "admin" && html`<${AdminView}
        participants=${parts}
        results=${results}
        settings=${settings}
        saveResults=${sv("jcg_r", setResults)}
        saveSettings=${saveSettings}
        saveParticipants=${sv("jcg_p", setParts)}/>`}

    </div>
  </${AppCtx.Provider}>`;
}

ReactDOM.createRoot(document.getElementById("root")).render(html`<${App}/>`);

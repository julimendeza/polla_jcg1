// ── React hooks ───────────────────────────────────────────────────────
var useState    = React.useState;
var useEffect   = React.useEffect;
var useMemo     = React.useMemo;
var useContext  = React.useContext;
var createContext = React.createContext;
var html = htm.bind(React.createElement);

// ── Firebase / localStorage hybrid db ────────────────────────────────
var db = {
  _url: null,

  _fb: async function(method, key, body) {
    if (!db._url) return null;
    var base = db._url.replace(/\/$/, '') + '/' + key + '.json';
    var opts = { method: method, headers: { 'Content-Type': 'application/json' } };
    if (body !== undefined) opts.body = JSON.stringify(body);
    try {
      var res = await fetch(base, opts);
      if (!res.ok) return null;
      return await res.json();
    } catch(e) { return null; }
  },

  get: async function(key) {
    if (db._url) {
      var val = await db._fb('GET', key);
      if (val !== null && val !== undefined) return val;
      return null;
    }
    try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch(e) { return null; }
  },

  set: async function(key, value) {
    if (db._url) await db._fb('PUT', key, value);
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
  }
};

// ── Context ───────────────────────────────────────────────────────────
var AppCtx = createContext({});
function useApp() { return useContext(AppCtx); }

// ── Temas ─────────────────────────────────────────────────────────────
var THEMES = {
  noche: {
    id: 'noche', label: '🌙 Noche',
    accent:     '#38bdf8',
    accentD:    '#0ea5e9',
    accentGrad: 'linear-gradient(135deg,#38bdf8,#0ea5e9)',
    onAccent:   '#001020',
    deep:       '#050d1a',
    row1:       '#0a1828',
    tourBg:     '#0d1e35',
    loadBg:     '#050d1a',
    loadColor:  'rgba(56,189,248,.45)',
    bodyBg:     '#070f1e',
    bodyGrad:   'radial-gradient(at 0% 0%, rgba(14,165,233,0.18) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(56,189,248,0.09) 0, transparent 50%)',
    a:    function(x){ return 'rgba(56,189,248,'+x+')'; },
    inv:  function(x){ return 'rgba(240,250,255,'+x+')'; },
    bdr:  function(w,x){ return w+'px solid rgba(240,250,255,'+x+')'; },
    bdra: function(w,x){ return w+'px solid rgba(56,189,248,'+x+')'; }
  },
  pasion: {
    id: 'pasion', label: '🔥 Pasión',
    accent:     '#f97316',
    accentD:    '#ea580c',
    accentGrad: 'linear-gradient(135deg,#f97316,#ea580c)',
    onAccent:   '#1c0800',
    deep:       '#0f0600',
    row1:       '#1c0e00',
    tourBg:     '#231000',
    loadBg:     '#0f0600',
    loadColor:  'rgba(249,115,22,.45)',
    bodyBg:     '#0c0500',
    bodyGrad:   'radial-gradient(at 0% 0%, rgba(249,115,22,0.18) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(234,88,12,0.1) 0, transparent 50%)',
    a:    function(x){ return 'rgba(249,115,22,'+x+')'; },
    inv:  function(x){ return 'rgba(255,240,225,'+x+')'; },
    bdr:  function(w,x){ return w+'px solid rgba(255,240,225,'+x+')'; },
    bdra: function(w,x){ return w+'px solid rgba(249,115,22,'+x+')'; }
  }
};

// ── Componente de bandera ─────────────────────────────────────────────
function FlagImg(p) {
  var code = CC && CC[p.team];
  if (!code) return html`<span style=${{fontSize:13}}>${fl(p.team)}</span>`;
  return html`<img
    src=${"https://flagcdn.com/20x15/" + code + ".png"}
    width="20" height="15" alt=${p.team}
    style=${{
      display:"inline-block", verticalAlign:"middle",
      borderRadius:2, flexShrink:0,
      opacity: p.dim ? 0.4 : 1,
      border:"1px solid rgba(255,255,255,0.12)"
    }}
    onError=${function(e){ e.target.style.display="none"; }}
  />`;
}

// ── PIN helpers ───────────────────────────────────────────────────────
// Cada PIN es un objeto: { pin, name, used, usedAt }
// El nombre viene del registro del PIN creado por el admin.
var pins = {
  get: async function() { return await db.get("jcg_pins") || []; },
  set: async function(list) { await db.set("jcg_pins", list); },

  // Valida un PIN y retorna { ok, pin } donde pin.name es el nombre del usuario
  validate: async function(code) {
    var list = await pins.get();
    var found = list.find(function(p) {
      return p.pin.trim().toUpperCase() === code.trim().toUpperCase();
    });
    if (!found) return { ok: false, err: T.pinInvalid };
    // Siempre se permite pasar — los usuarios pueden volver a editar
    return { ok: true, pin: found };
  },

  markUsed: async function(code, name) {
    var list = await pins.get();
    var updated = list.map(function(p) {
      if (p.pin.trim().toUpperCase() === code.trim().toUpperCase()) {
        return Object.assign({}, p, {
          used: true,
          usedAt: new Date().toISOString()
        });
      }
      return p;
    });
    await pins.set(updated);
  }
};

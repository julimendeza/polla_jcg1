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
  },

  // Escribe SOLO un nodo hijo (ej. jcg_p/pin_ABC) sin tocar los demás.
  // Evita la condición de carrera donde un usuario pisa la lista completa.
  setChild: async function(key, childKey, value) {
    if (db._url) {
      await db._fb('PUT', key + '/' + childKey, value);
    }
    // Espejo local: actualizar el array en localStorage
    try {
      var cur = null;
      try { cur = JSON.parse(localStorage.getItem(key)); } catch(e){}
      var map = {};
      if (Array.isArray(cur)) {
        cur.forEach(function(x){ if (x && x.id) map[x.id] = x; });
      } else if (cur && typeof cur === 'object') {
        map = cur;
      }
      map[childKey] = value;
      localStorage.setItem(key, JSON.stringify(map));
    } catch(e) {}
  },

  // Borra SOLO un nodo hijo (ej. jcg_p/pin_ABC).
  deleteChild: async function(key, childKey) {
    if (db._url) {
      await db._fb('DELETE', key + '/' + childKey);
    }
    try {
      var cur = null;
      try { cur = JSON.parse(localStorage.getItem(key)); } catch(e){}
      var map = {};
      if (Array.isArray(cur)) {
        cur.forEach(function(x){ if (x && x.id) map[x.id] = x; });
      } else if (cur && typeof cur === 'object') {
        map = cur;
      }
      delete map[childKey];
      localStorage.setItem(key, JSON.stringify(map));
    } catch(e) {}
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
  get: async function() {
    var data = await db.get("jcg_pins");
    if (!data) return [];
    // Firebase devuelve objeto (no array) si se borraron entradas: convertir.
    var list = Array.isArray(data) ? data : Object.values(data);
    return list.filter(function(p){ return p && p.pin; });
  },

  set: async function(list) {
    // GUARDA DE SEGURIDAD: nunca sobrescribir la lista completa con una vacía
    // por error. Si la lista nueva está vacía pero en Firebase hay PINs,
    // se aborta para evitar borrados accidentales masivos.
    if (!Array.isArray(list) || list.length === 0) {
      var existing = await pins.get();
      if (existing.length > 0) {
        console.error("pins.set abortado: intento de guardar lista vacía sobre " + existing.length + " PINs existentes");
        return false;
      }
    }
    await db.set("jcg_pins", list);
    return true;
  },

  // Marca un PIN como usado escribiendo SOLO ese nodo (evita pisar la lista).
  markUsed: async function(code, name) {
    var list = await pins.get();
    var target = code.trim().toUpperCase();
    var idx = -1;
    for (var i = 0; i < list.length; i++) {
      if (list[i].pin.trim().toUpperCase() === target) { idx = i; break; }
    }
    if (idx < 0) return; // PIN no encontrado, no hacer nada
    var updated = Object.assign({}, list[idx], {
      used: true,
      usedAt: new Date().toISOString()
    });
    // Escribir SOLO el nodo de ese PIN, no toda la lista (evita race + borrados)
    if (db._url) {
      await db.setChild("jcg_pins", String(idx), updated);
    } else {
      list[idx] = updated;
      await db.set("jcg_pins", list);
    }
  },

  // Valida un PIN y retorna { ok, pin } donde pin.name es el nombre del usuario
  validate: async function(code) {
    var list = await pins.get();
    var found = list.find(function(p) {
      return p.pin.trim().toUpperCase() === code.trim().toUpperCase();
    });
    if (!found) return { ok: false, err: T.pinInvalid };
    return { ok: true, pin: found };
  }
};

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
  var editIdSt = useState(null); var editingId = editIdSt[0], setEditingId = editIdSt[1];
  var editNameSt = useState(""); var editingName = editNameSt[0], setEditingName = editNameSt[1];
  var tsIdSt = useState(null); var tsId = tsIdSt[0], setTsId = tsIdSt[1];

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

  async function handleRename(id) {
    var trimmed = editingName.trim();
    if (!trimmed) return;
    var updated = participants.map(function(x){
      return x && x.id === id ? Object.assign({}, x, { name: trimmed }) : x;
    });
    await saveParticipants(updated);
    setEditingId(null);
    flash();
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

  // ── Descargas ─────────────────────────────────────────────────────

  function sa(str) {
    // Quita acentos para PDF (jsPDF no soporta UTF-8 extendido bien)
    return String(str || '').normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function downloadJSON() {
    var data = {
      exportado: new Date().toISOString(),
      participantes: participants.filter(function(x){ return x && x.id; }),
      resultados: results,
      partidos: MATCHES.map(function(m){
        return { id:m.id, num:m.num, local:teamName(m.home), visitante:teamName(m.away), kickoff:m.kickoff };
      })
    };
    var blob = new Blob([JSON.stringify(data, null, 2)], { type:'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = 'polla-mundialista-' + new Date().toISOString().slice(0,10) + '.json';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
  }

  function downloadPDF() {
    var jsPDF = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF;
    if (!jsPDF) { alert('jsPDF no cargado aun. Espera unos segundos y reintenta.'); return; }
    var human = participants.filter(function(x){ return x && x.id; });
    if (!human.length) { alert('No hay participantes.'); return; }

    function sa(s){ return String(s||'').normalize("NFD").replace(/[\u0300-\u036f]/g,""); }

    var doc    = new jsPDF('p','mm','a4');
    var pW     = 210; var margin = 13; var cW = pW - margin*2;
    var cols   = [9,47,47,20,20,11]; // #, Local, Visit, Pred, Res, Pts
    var hdrs   = ['#','Local','Visitante','Pred.','Result.','Pts'];
    var rH     = 6.5;

    human.forEach(function(par, idx){
      if (idx > 0) doc.addPage();
      var sc = calcScore(par.preds||{}, results, settings.scoring||DEF.scoring);
      var y  = margin;

      // ── Header ──
      doc.setFontSize(15); doc.setFont('helvetica','bold');
      doc.text('POLLA MUNDIALISTA 2026', pW/2, y, {align:'center'}); y += 7;
      doc.setFontSize(12);
      doc.text(sa(par.name), pW/2, y, {align:'center'}); y += 6;
      doc.setFontSize(8.5); doc.setFont('helvetica','normal');
      doc.setTextColor(80,80,80);
      doc.text('PIN: '+(par.pin||'-')+'   |   Total: '+sc.pts+' pts', pW/2, y, {align:'center'});
      doc.setTextColor(0,0,0);
      y += 7;

      // ── Column headers ──
      doc.setFillColor(30,50,100); doc.setTextColor(255,255,255);
      doc.rect(margin, y, cW, rH, 'F');
      doc.setFontSize(7.5); doc.setFont('helvetica','bold');
      var cx = margin + 1.5;
      hdrs.forEach(function(h,i){ doc.text(h, cx, y+4.5); cx += cols[i]; });
      doc.setTextColor(0,0,0); y += rH;

      // ── Rows ──
      doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
      MATCHES.forEach(function(m,mi){
        var pred = par.preds && par.preds[m.id];
        var res  = results   && results[m.id];
        var s    = sc.detail && sc.detail[m.id];
        var hp   = pred && pred.h !== undefined && pred.h !== '';
        var hr   = res  && res.h  !== undefined && res.h  !== '';

        if (mi%2 === 0){ doc.setFillColor(247,248,250); doc.rect(margin,y,cW,rH,'F'); }
        doc.setDrawColor(220,220,220); doc.line(margin,y+rH,margin+cW,y+rH);

        var rowVals = [
          String(m.num),
          sa(teamName(m.home)).slice(0,20),
          sa(teamName(m.away)).slice(0,20),
          hp ? pred.h+'-'+pred.a : '-',
          hr ? res.h +'-'+res.a  : '-',
          String(s ? s.pts : 0)
        ];
        var clr = (!hp||!hr) ? [0,0,0] :
                  s.status==='exact'  ? [22,163,74]  :
                  s.status==='result' ? [37,99,235]   : [220,38,38];
        doc.setTextColor(clr[0],clr[1],clr[2]);
        cx = margin + 1.5;
        rowVals.forEach(function(v,i){ doc.text(v, cx, y+4.5); cx += cols[i]; });
        doc.setTextColor(0,0,0);
        y += rH;
      });

      // ── Total row ──
      doc.setFillColor(220,220,220); doc.rect(margin,y,cW,rH,'F');
      doc.setFont('helvetica','bold');
      cx = margin + 1.5;
      [' ',' ',' ',' ','TOTAL',String(sc.pts)].forEach(function(v,i){ doc.text(v,cx,y+4.5); cx+=cols[i]; });
    });

    doc.save('polla-mundialista-predicciones.pdf');
  }

  function downloadXLSX() {
    var human = participants.filter(function(x){ return x && x.id; });
    var nl = "\n";
    function xe(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function cell(v,t,s){ var st=s?' ss:StyleID="'+s+'"':''; return '<Cell'+st+'><Data ss:Type="'+(t||'String')+'">'+xe(v)+'</Data></Cell>'; }
    function hcell(v){ return cell(v,'String','h'); }
    function row(cells){ return '<Row>'+cells.join('')+'</Row>'+nl; }
    var x = '<?xml version="1.0" encoding="UTF-8"?>'+nl+'<?mso-application progid="Excel.Sheet"?>'+nl;
    x += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">'+nl;
    x += '<Styles>';
    x += '<Style ss:ID="h"><Font ss:Bold="1" ss:Color="#FFFFFF"/><Interior ss:Color="#1E3264" ss:Pattern="Solid"/></Style>';
    x += '<Style ss:ID="t"><Font ss:Bold="1"/><Interior ss:Color="#DDDDDD" ss:Pattern="Solid"/></Style>';
    x += '<Style ss:ID="b"><Font ss:Bold="1"/></Style>';
    x += '</Styles>'+nl;
    x += '<Worksheet ss:Name="Resumen"><Table>'+nl;
    x += row([hcell('Pos.'),hcell('PIN'),hcell('Nombre'),hcell('Predicciones'),hcell('Puntos')]);
    var sorted = human.slice().sort(function(a,b){
      return calcScore(b.preds||{},results,settings.scoring||DEF.scoring).pts -
             calcScore(a.preds||{},results,settings.scoring||DEF.scoring).pts;
    });
    sorted.forEach(function(par,i){
      var sc = calcScore(par.preds||{},results,settings.scoring||DEF.scoring);
      var n = MATCHES.filter(function(m){ var p=par.preds&&par.preds[m.id]; return p&&p.h!==undefined&&p.h!==''; }).length;
      x += row([cell(i+1,'Number'),cell(par.pin||'-'),cell(par.name),cell(n+'/'+MATCHES.length),cell(sc.pts,'Number','b')]);
    });
    x += '</Table></Worksheet>'+nl;
    human.forEach(function(par){
      var sc = calcScore(par.preds||{},results,settings.scoring||DEF.scoring);
      var sn = par.name.replace(/[:<>\/\?\*\[\]"&]/g,'').slice(0,31)||par.pin;
      x += '<Worksheet ss:Name="'+xe(sn)+'"><Table>'+nl;
      x += row([hcell('#'),hcell('Local'),hcell('Visitante'),hcell('Prediccion'),hcell('Resultado'),hcell('Pts'),hcell('Estado')]);
      MATCHES.forEach(function(m){
        var pred=par.preds&&par.preds[m.id]; var res=results&&results[m.id]; var s=sc.detail&&sc.detail[m.id];
        var hp=pred&&pred.h!==undefined&&pred.h!==''; var hr=res&&res.h!==undefined&&res.h!=='';
        var est=!hp?'Sin prediccion':!hr?'Pendiente':s.status==='exact'?'Exacto (+4)':s.status==='result'?'Resultado (+1)':'Incorrecto (0)';
        x += row([cell(m.num,'Number'),cell(teamName(m.home)),cell(teamName(m.away)),
          cell(hp?pred.h+'-'+pred.a:'-'),cell(hr?res.h+'-'+res.a:'-'),cell(s?s.pts:0,'Number'),cell(est)]);
      });
      x += row([cell(''),cell(''),cell(''),cell(''),cell('TOTAL','String','t'),cell(sc.pts,'Number','t'),cell('')]);
      x += '</Table></Worksheet>'+nl;
    });
    x += '</Workbook>';
    var blob = new Blob([x],{type:'application/vnd.ms-excel;charset=utf-8'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href=url; a.download='polla-mundialista-predicciones.xls';
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
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
    {id:"results",   label:"✅ Resultados"},
    {id:"parts",     label:"👥 Participantes"},
    {id:"pins",      label:"🔑 PINs"},
    {id:"settings",  label:"⚙️ Ajustes"},
    {id:"downloads", label:"📥 Descargas"}
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
            borderRadius:12, marginBottom:8,
            background:thm.inv(.03),
            border: editingId===par.id ? thm.bdra(1,.3) : tsId===par.id ? thm.bdra(1,.2) : thm.bdr(1,.07),
            overflow:"hidden"
          }}>
            <!-- Fila principal -->
            <div style=${{display:"flex", alignItems:"center", gap:10, padding:"12px 14px", flexWrap:"wrap"}}>
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
              <${Btn} v="secondary"
                onClick=${function(){
                  setTsId(tsId===par.id ? null : par.id);
                  setEditingId(null);
                }}
                sx=${{padding:"6px 10px",fontSize:11}}>🕐</${Btn}>
              <${Btn} v="secondary"
                onClick=${function(){
                  setEditingId(editingId===par.id ? null : par.id);
                  setEditingName(par.name);
                  setTsId(null);
                }}
                sx=${{padding:"6px 10px",fontSize:11}}>✏️</${Btn}>
              <${Btn} v="danger"
                onClick=${function(){ handleDeleteParticipant(par.id); }}
                sx=${{padding:"6px 10px",fontSize:11}}>🗑</${Btn}>
            </div>

            <!-- Panel de timestamps -->
            ${tsId === par.id && html`<div style=${{
              padding:"12px 14px 16px", borderTop:thm.bdr(1,.08),
              background:thm.inv(.02)
            }}>
              <div style=${{
                fontSize:10,fontWeight:700,color:thm.inv(.35),
                letterSpacing:".08em",marginBottom:10,textTransform:"uppercase"
              }}>🕐 Predicciones — hora de guardado (COL)</div>
              ${MATCHES.map(function(m){
                var pr  = par.preds && par.preds[m.id];
                var res = results && results[m.id];
                var hasPred = pr && pr.h !== undefined && pr.h !== "";
                var savedAt = pr && pr.savedAt;
                var kickoff = new Date(m.kickoff);
                var savedDate = savedAt ? new Date(savedAt) : null;
                var lateFlag = savedDate && savedDate > kickoff;
                function toColStr(d) {
                  if (!d) return "—";
                  var co = new Date(d.getTime() - 5*60*60*1000);
                  var pad = function(n){ return n.toString().padStart(2,"0"); };
                  return co.getUTCDate()+"/"+(co.getUTCMonth()+1)+" "+pad(co.getUTCHours())+":"+pad(co.getUTCMinutes());
                }
                return html`<div key=${m.id} style=${{
                  display:"flex", alignItems:"center", gap:8,
                  padding:"6px 0", borderBottom:thm.bdr(1,.05),
                  opacity: hasPred ? 1 : 0.45
                }}>
                  <span style=${{width:20,fontSize:10,color:thm.inv(.35),fontWeight:700}}>${m.num}</span>
                  <span style=${{flex:1,fontSize:11,color:thm.inv(.7)}}>
                    ${teamName(m.home)} vs ${teamName(m.away)}
                  </span>
                  <span style=${{
                    fontSize:12, fontWeight:700, minWidth:36, textAlign:"center",
                    color: !hasPred ? thm.inv(.25) :
                           (res && res.h !== undefined) ?
                             (sc.detail[m.id] && sc.detail[m.id].status==="exact" ? "#4ade80" :
                              sc.detail[m.id] && sc.detail[m.id].status==="result" ? thm.accent : "#f87171")
                             : thm.inv(.6)
                  }}>
                    ${hasPred ? pr.h+"-"+pr.a : "—"}
                  </span>
                  <span style=${{
                    fontSize:10, minWidth:72, textAlign:"right",
                    color: lateFlag ? "#f87171" : thm.inv(.3),
                    fontWeight: lateFlag ? 700 : 400
                  }}>
                    ${lateFlag ? "⚠️ " : ""}${toColStr(savedDate)}
                  </span>
                </div>`;
              })}
            </div>`}

            <!-- Panel de edición inline -->
            ${editingId === par.id && html`<div style=${{
              padding:"10px 14px 14px", borderTop:thm.bdr(1,.08),
              background:thm.a(.04), display:"flex", gap:8, alignItems:"center"
            }}>
              <input type="text" value=${editingName}
                onInput=${function(e){ setEditingName(e.target.value); }}
                onKeyDown=${function(e){
                  if (e.key==="Enter") handleRename(par.id);
                  if (e.key==="Escape") setEditingId(null);
                }}
                style=${{
                  flex:1, padding:"7px 10px", borderRadius:8,
                  fontFamily:"'DM Sans',sans-serif", fontSize:13,
                  background:thm.inv(.07), border:thm.bdra(1,.4),
                  color:thm.inv(.9), outline:"none"
                }}
              />
              <${Btn} onClick=${function(){ handleRename(par.id); }}
                sx=${{padding:"7px 14px",fontSize:12}}>Guardar</${Btn}>
              <${Btn} v="ghost" onClick=${function(){ setEditingId(null); }}
                sx=${{padding:"7px 10px",fontSize:12}}>✕</${Btn}>
            </div>`}
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

    <!-- ── TAB: Descargas ── -->
    ${tab === "downloads" && html`<div>
      <p style=${{fontSize:12,color:thm.inv(.4),marginBottom:16}}>
        ${participants.filter(function(x){return x&&x.id;}).length} participantes · datos actuales al momento de la descarga.
      </p>

      <!-- PDF -->
      <${Card} sx=${{marginBottom:12}}>
        <div style=${{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style=${{fontSize:32}}>📄</span>
          <div style=${{flex:1,minWidth:160}}>
            <div style=${{fontWeight:700,fontSize:14,color:thm.inv(.9),marginBottom:3}}>
              PDF — Una página por participante
            </div>
            <div style=${{fontSize:12,color:thm.inv(.45)}}>
              Tabla con predicciones, resultados y puntos. Ideal para imprimir.
            </div>
          </div>
          <${Btn} onClick=${downloadPDF} sx=${{padding:"9px 16px",whiteSpace:"nowrap"}}>
            Descargar PDF
          </${Btn}>
        </div>
      </${Card}>

      <!-- XLSX -->
      <${Card} sx=${{marginBottom:12}}>
        <div style=${{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style=${{fontSize:32}}>📊</span>
          <div style=${{flex:1,minWidth:160}}>
            <div style=${{fontWeight:700,fontSize:14,color:thm.inv(.9),marginBottom:3}}>
              Excel — Hoja por participante + resumen
            </div>
            <div style=${{fontSize:12,color:thm.inv(.45)}}>
              .xlsx con hoja de clasificación y una hoja por cada jugador.
            </div>
          </div>
          <${Btn} v="secondary" onClick=${downloadXLSX} sx=${{padding:"9px 16px",whiteSpace:"nowrap"}}>
            Descargar Excel
          </${Btn}>
        </div>
      </${Card}>

      <!-- JSON -->
      <${Card}>
        <div style=${{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <span style=${{fontSize:32}}>📋</span>
          <div style=${{flex:1,minWidth:160}}>
            <div style=${{fontWeight:700,fontSize:14,color:thm.inv(.9),marginBottom:3}}>
              JSON — Exportar todos los datos
            </div>
            <div style=${{fontSize:12,color:thm.inv(.45)}}>
              Participantes, predicciones y resultados. Sirve como respaldo.
            </div>
          </div>
          <${Btn} v="secondary" onClick=${downloadJSON} sx=${{padding:"9px 16px",whiteSpace:"nowrap"}}>
            Descargar JSON
          </${Btn}>
        </div>
      </${Card}>
    </div>`}

  </div>`;
}

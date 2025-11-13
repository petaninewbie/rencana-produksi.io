// app.js — Versi tunggal lengkap (logika + 6 dataset)

// ===== Default data & dataset lengkap =====
const defaultDB = {
  demand: [120,100,140,130,160,150,170,165,180,175],
  items: [
    { id:'FG-A', name:'Finished Good A', level:0, onHand:100, lead:1, safety:20 },
    { id:'RM-X', name:'Raw Material X', level:1, onHand:200, lead:2, safety:50 },
    { id:'RM-Y', name:'Raw Material Y', level:1, onHand:150, lead:1, safety:30 }
  ],
  bom: [
    { parent:'FG-A', child:'RM-X', qty:2 },
    { parent:'FG-A', child:'RM-Y', qty:1 }
  ],
  jobs: [
    { id:'J1', wc:'WC-1', procTime:6, due:10 },
    { id:'J2', wc:'WC-1', procTime:4, due:7 }
  ],
  inventory: [
    { sku:'SKU-01', name:'Bolt M8', price:0.5, consume:6000 },
    { sku:'SKU-02', name:'Nut M8', price:0.4, consume:5800 }
  ],
  quiz: [
    { q:'Tujuan utama perencanaan produksi adalah...', a:['Promosi','Menjamin ketersediaan produk','Iklan'], correct:1 },
    { q:'SMA window 3 menghitung rata-rata berapa periode?', a:['1','2','3'], correct:2 },
    { q:'Planned Order Release menunjukkan...', a:['Waktu produk selesai','Waktu memesan bahan','Jumlah tenaga kerja'], correct:1 },
    { q:'FCFS berarti...', a:['Shortest processing time','First come first serve','Most expensive first'], correct:1 },
    { q:'Item kelas A biasanya...', a:['Nilai rendah','Nilai tinggi','Tidak penting'], correct:1 }
  ]
};

const datasets = {
  tas: {
    name: "Tas Rajut",
    demand: [30,28,35,32,40,36,38,34],
    items: [
      {"id":"FG-TAS","name":"Tas Rajut","level":0,"onHand":20,"lead":1,"safety":10},
      {"id":"KAIN","name":"Kain Rajut","level":1,"onHand":100,"lead":2,"safety":30},
      {"id":"TALI","name":"Tali","level":1,"onHand":200,"lead":1,"safety":50}
    ],
    bom: [{"parent":"FG-TAS","child":"KAIN","qty":1},{"parent":"FG-TAS","child":"TALI","qty":2}],
    jobs: [{"id":"J1","wc":"Jahit","procTime":3,"due":4},{"id":"J2","wc":"Finishing","procTime":1,"due":5}],
    inventory: [{"sku":"KAIN","name":"Kain Rajut","price":5,"consume":800},{"sku":"TALI","name":"Tali","price":1,"consume":1200}],
    quiz: [{ q:'Apa bahan utama tas rajut?', a:['Kain rajut','Karton','Plastik'], correct:0 }]
  },

  sabun: {
    name: "Sabun Cair",
    demand: [50,55,60,58,65,62,70,68],
    items: [
      {"id":"FG-SABUN","name":"Sabun Cair 500ml","level":0,"onHand":30,"lead":1,"safety":15},
      {"id":"GULA","name":"Bahan Aktif","level":1,"onHand":200,"lead":2,"safety":50},
      {"id":"BOTOL","name":"Botol Plastik","level":1,"onHand":400,"lead":1,"safety":100}
    ],
    bom: [{"parent":"FG-SABUN","child":"GULA","qty":0.5},{"parent":"FG-SABUN","child":"BOTOL","qty":1}],
    jobs: [{"id":"J1","wc":"Mixing","procTime":4,"due":6},{"id":"J2","wc":"Filling","procTime":2,"due":7}],
    inventory: [{"sku":"GULA","name":"Bahan Aktif","price":2,"consume":2000},{"sku":"BOTOL","name":"Botol","price":0.8,"consume":2500}],
    quiz: [{ q:'Apa lead time yang disarankan untuk botol?', a:['1 minggu','1 hari','1 bulan'], correct:0 }]
  },

  kue: {
    name: "Kue Kering",
    demand: [120,110,130,125,140,135,150,145],
    items: [
      {"id":"FG-KUE","name":"Kue Kering Pack","level":0,"onHand":50,"lead":1,"safety":20},
      {"id":"TERIGU","name":"Tepung Terigu","level":1,"onHand":1000,"lead":2,"safety":200},
      {"id":"GULA","name":"Gula Pasir","level":1,"onHand":800,"lead":1,"safety":150}
    ],
    bom: [{"parent":"FG-KUE","child":"TERIGU","qty":0.3},{"parent":"FG-KUE","child":"GULA","qty":0.1}],
    jobs: [{"id":"J1","wc":"Mixing","procTime":5,"due":6},{"id":"J2","wc":"Oven","procTime":3,"due":8}],
    inventory: [{"sku":"TERIGU","name":"Tepung","price":0.5,"consume":5000},{"sku":"GULA","name":"Gula","price":0.4,"consume":3000}],
    quiz: [{ q:'Bahan apa yang paling banyak dipakai untuk kue kering?', a:['Tepung','Pewarna','Pengawet'], correct:0 }]
  },

  kayu: {
    name: "Kerajinan Kayu",
    demand: [8,10,9,12,11,9,10,13],
    items: [
      {"id":"FG-KAYU","name":"Kotak Kayu","level":0,"onHand":5,"lead":2,"safety":2},
      {"id":"PAPAN","name":"Papan Kayu","level":1,"onHand":50,"lead":3,"safety":10},
      {"id":"PENGIKAT","name":"Lem/Finishing","level":1,"onHand":30,"lead":1,"safety":5}
    ],
    bom: [{"parent":"FG-KAYU","child":"PAPAN","qty":2},{"parent":"FG-KAYU","child":"PENGIKAT","qty":0.2}],
    jobs: [{"id":"J1","wc":"Potong","procTime":6,"due":7},{"id":"J2","wc":"Finishing","procTime":2,"due":9}],
    inventory: [{"sku":"PAPAN","name":"Papan Kayu","price":8,"consume":300},{"sku":"PENGIKAT","name":"Lem/Fin","price":3,"consume":120}],
    quiz: [{ q:'Apa yang termasuk safety stock pada kerajinan kayu?', a:['Stok papan ekstra','Peralatan','Meja'], correct:0 }]
  },

  konveksi: {
    name: "Konveksi Kaos",
    demand: [40,42,38,45,43,47,50,48],
    items: [
      {"id":"FG-TSHIRT","name":"Kaos Polos","level":0,"onHand":30,"lead":1,"safety":10},
      {"id":"KAIN","name":"Kain Katun","level":1,"onHand":200,"lead":2,"safety":50},
      {"id":"BENANG","name":"Benang Jahit","level":1,"onHand":500,"lead":1,"safety":100}
    ],
    bom: [{"parent":"FG-TSHIRT","child":"KAIN","qty":1},{"parent":"FG-TSHIRT","child":"BENANG","qty":0.05}],
    jobs: [{"id":"J1","wc":"Cutting","procTime":4,"due":5},{"id":"J2","wc":"Sewing","procTime":6,"due":8}],
    inventory: [{"sku":"KAIN","name":"Kain Katun","price":10,"consume":1500},{"sku":"BENANG","name":"Benang","price":0.2,"consume":6000}],
    quiz: [{ q:'Berapa jumlah benang yang dibutuhkan per kaos (contoh)?', a:['0.05 unit','5 unit','1 unit'], correct:0 }]
  },

  keripik: {
    name: "Keripik",
    demand: [200,180,220,210,230,225,240,235],
    items: [
      {"id":"FG-KERIPIK","name":"Keripik 100g","level":0,"onHand":80,"lead":1,"safety":30},
      {"id":"KERIPIKB","name":"Bahan Baku Kentang","level":1,"onHand":1000,"lead":2,"safety":300},
      {"id":"KEMAS","name":"Kemasan","level":1,"onHand":500,"lead":1,"safety":150}
    ],
    bom: [{"parent":"FG-KERIPIK","child":"KERIPIKB","qty":0.2},{"parent":"FG-KERIPIK","child":"KEMAS","qty":1}],
    jobs: [{"id":"J1","wc":"Frying","procTime":8,"due":10},{"id":"J2","wc":"Packaging","procTime":2,"due":12}],
    inventory: [{"sku":"KERIPIKB","name":"Kentang","price":0.3,"consume":10000},{"sku":"KEMAS","name":"Kemasan","price":0.5,"consume":3000}],
    quiz: [{ q:'Apa yang sering menjadi bottleneck pada produksi keripik?', a:['Frying/oven','Pemasaran','Penyimpanan'], correct:0 }]
  }
};

// ===== Application state =====
let db = JSON.parse(JSON.stringify(defaultDB));

// ===== Helpers =====
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const fmt = v => (typeof v === 'number') ? v.toFixed(2) : v;

// ===== Tab handling =====
$$('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('section.tab-panel').forEach(p => p.classList.add('hidden'));
    const id = btn.dataset.tab;
    $('#' + id).classList.remove('hidden');
  });
});
// open home by default
$('.tab-btn[data-tab="home"]') && $('.tab-btn[data-tab="home"]').click();

// ===== Print worksheet =====
$('#print-worksheet') && $('#print-worksheet').addEventListener('click', () => {
  $('.tab-btn[data-tab="worksheet"]').click();
  setTimeout(() => window.print(), 300);
});

// ===== Slide full (safe write) =====
$('#open-slide') && $('#open-slide').addEventListener('click', () => {
  const slideHtmlEl = $('#slide-content');
  if (!slideHtmlEl) return;
  const slideHtml = slideHtmlEl.innerHTML;
  const w = window.open('', '_blank', 'width=900,height=700');
  w.document.open();
  w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>Slide Guru</title></head><body>');
  // escape backticks and close tags just in case
  w.document.write(slideHtml.replace(/<\/script>/gi, '<\\/script>'));
  w.document.write('</body></html>');
  w.document.close();
});

// ===== Sub-tabs (app) =====
$$('.sub-btn').forEach(b => {
  b.addEventListener('click', () => {
    $$('div.sub-panel').forEach(p => p.classList.add('hidden'));
    const name = b.dataset.sub;
    const mapping = {
      dashboard: '#dash',
      forecast: '#forecast-mod',
      mrp: '#mrp-mod',
      schedule: '#schedule-mod',
      abc: '#abc-mod',
      quiz: '#quiz-mod'
    };
    $(mapping[name]) && $(mapping[name]).classList.remove('hidden');
    renderAll();
  });
});
// default app sub (if exists)
$('.sub-btn[data-sub="dashboard"]') && $('.sub-btn[data-sub="dashboard"]').click();

// ===== Charts (Chart.js integration if loaded) =====
let chartDemand = null;
let chartForecast = null;
function initCharts() {
  if (typeof Chart === 'undefined') return;
  const ctxD = document.getElementById('chart-demand');
  if (ctxD) {
    chartDemand = new Chart(ctxD.getContext('2d'), {
      type: 'bar',
      data: { labels: [], datasets: [
        { label: 'Permintaan', backgroundColor: '#38bdf8', data: [] },
        { label: 'SMA', type:'line', borderColor:'#7c3aed', backgroundColor:'#7c3aed33', data: [], tension:0.2 }
      ]},
      options: { responsive:true, plugins:{legend:{position:'top'}}, scales:{y:{beginAtZero:true}} }
    });
  }
  const ctxF = document.getElementById('chart-forecast');
  if (ctxF) {
    chartForecast = new Chart(ctxF.getContext('2d'), {
      type: 'line',
      data: { labels: [], datasets: [
        { label: 'Aktual', borderColor:'#0ea5e9', backgroundColor:'#0ea5e933', data: [], fill:false, tension:0.2 },
        { label: 'SMA', borderColor:'#7c3aed', backgroundColor:'#7c3aed33', data: [], fill:false, tension:0.2 },
        { label: 'WMA', borderColor:'#10b981', backgroundColor:'#10b98133', data: [], fill:false, tension:0.2 }
      ]},
      options: { responsive:true, plugins:{legend:{position:'top'}}, scales:{y:{beginAtZero:true}} }
    });
    // also expose for legacy render functions
    window.chartForecast = chartForecast;
  }
}

// ===== Dashboard render =====
function renderDashboard() {
  const avg = (db.demand.reduce((a,b)=>a+b,0) / (db.demand.length||1));
  $('#kpi-avg-demand') && ($('#kpi-avg-demand').textContent = fmt(avg));
  const maxLead = Math.max(...(db.items||[]).map(i=>i.lead||0));
  $('#kpi-max-lead') && ($('#kpi-max-lead').textContent = (isFinite(maxLead)? maxLead + ' periode' : '-'));
  const totalValue = (db.inventory||[]).reduce((s,i)=> s + (i.price * i.consume), 0);
  $('#kpi-annual-value') && ($('#kpi-annual-value').textContent = totalValue? 'Rp ' + Number(totalValue).toLocaleString() : '-');
  $('#dash-summary') && ($('#dash-summary').textContent = `Data: ${db.demand.length} periode · Item: ${(db.items||[]).length}`);

  if (chartDemand) {
    chartDemand.data.labels = (db.demand||[]).map((_,i)=> 'P'+(i+1));
    chartDemand.data.datasets[0].data = db.demand || [];
    chartDemand.data.datasets[1].data = (db._lastSMA || []).map(v=> v===undefined? null : v);
    chartDemand.update();
  }
}

// ===== Forecast logic =====
function computeSMA(arr,w){
  const out = new Array(arr.length).fill(undefined);
  const log = [];
  for(let i=0;i<arr.length;i++){
    if(i < w-1) continue;
    const window = arr.slice(i-w+1, i+1);
    const avg = window.reduce((a,b)=>a+b,0)/w;
    out[i]=avg;
    log.push(`SMA P${i+1} = avg([${window.join(', ')}]) = ${avg.toFixed(2)}`);
  }
  return { out, log };
}
function computeWMA(arr, weights){
  const out = new Array(arr.length).fill(undefined);
  const log = [];
  const sumW = weights.reduce((a,b)=>a+b,0);
  if(Math.abs(sumW-1) > 1e-6) {
    log.push('Bobot WMA tidak valid (total ≠ 1). WMA dilewati.');
    return { out, log };
  }
  const w = weights.length;
  for(let i=0;i<arr.length;i++){
    if(i < w-1) continue;
    const window = arr.slice(i-w+1, i+1).slice().reverse();
    const val = window.reduce((acc,v,idx)=>acc + v*weights[idx], 0);
    out[i]=val;
    log.push(`WMA P${i+1} = ${val.toFixed(2)}`);
  }
  return { out, log };
}
function mape(actual, forecast){
  let n=0, sum=0;
  for(let i=0;i<actual.length;i++){
    const a=actual[i], f=forecast[i];
    if(f===undefined || f===null || a===0) continue;
    sum += Math.abs((a-f)/a)*100; n++;
  }
  return n? sum/n : Infinity;
}

// Forecast UI handlers
$('#fc-run') && $('#fc-run').addEventListener('click', ()=>{
  const w = Math.max(2, Math.min(8, parseInt($('#fc-window').value) || 3));
  const weights = $('#fc-weights').value.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));
  const { out: sma, log: logSMA } = computeSMA(db.demand || [], w);
  const { out: wma, log: logWMA } = computeWMA(db.demand || [], weights);
  db._lastSMA = sma;
  db._lastWMA = wma;
  const errSMA = mape(db.demand || [], sma);
  const errWMA = mape(db.demand || [], wma);

  $('#forecast-metrics') && ($('#forecast-metrics').innerHTML = `<div><strong>MAPE SMA:</strong> ${isFinite(errSMA)? (errSMA.toFixed(2)+'%') : '—'}</div><div><strong>MAPE WMA:</strong> ${isFinite(errWMA)? (errWMA.toFixed(2)+'%') : '—'}</div>`);
  $('#forecast-log') && ($('#forecast-log').textContent = [...logSMA, ...logWMA].join('\n'));
  renderDashboard();
  renderForecastUI();
});

$('#fc-clear') && $('#fc-clear').addEventListener('click', ()=> {
  db._lastSMA = [];
  db._lastWMA = [];
  renderForecastUI();
  renderDashboard();
});

// add / edit demand
$('#add-period') && $('#add-period').addEventListener('click', ()=>{
  const v = parseFloat(prompt('Masukkan permintaan periode baru (angka)', '160'));
  if(!isNaN(v)) { db.demand.push(v); renderForecastUI(); renderDashboard(); $('#json-editor').value = JSON.stringify(db, null, 2); }
});
$('#edit-demand') && $('#edit-demand').addEventListener('click', ()=>{
  const csv = prompt('Masukkan permintaan CSV (contoh: 120,100,140,...)', (db.demand||[]).join(','));
  if(csv!==null){
    const arr = csv.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));
    if(arr.length>=3){ db.demand = arr; renderForecastUI(); renderDashboard(); $('#json-editor').value = JSON.stringify(db, null, 2);} else alert('Minimal 3 periode');
  }
});

// ===== MRP =====
function renderItemsUI(){
  $('#items-table') && ($('#items-table').innerHTML = (db.items||[]).map(it=>`<div>${it.id} • ${it.name} • OnHand:${it.onHand} • Lead:${it.lead}</div>`).join(''));
}
function runMRP(){
  const horizon = 6;
  const log = [];
  const fg = (db.items||[]).find(i=>i.level===0);
  if(!fg){ alert('Tidak ada FG level 0'); return; }
  const grossFG = Array.from({length:horizon}, (_,i)=> (db.demand||[])[(db.demand||[]).length-horizon + i] ?? (db.demand||[])[(db.demand||[]).length-1] || 0);
  log.push(`Kebutuhan kotor FG: [${grossFG.join(', ')}]`);
  const plan = [];
  const lotQty = (need)=> need; // L4L
  let availFG = fg.onHand - fg.safety;
  for(let t=0;t<horizon;t++){
    const gross = grossFG[t];
    const net = Math.max(0, gross - availFG);
    const receipt = net>0 ? lotQty(net) : 0;
    const release = receipt>0 ? Math.max(0, t - fg.lead) : 0;
    plan.push({ item:fg.id, period:t+1, gross, net, receipt, release });
    availFG = availFG - gross + receipt;
    log.push(`FG p${t+1}: gross=${gross} net=${net} receipt=${receipt} avail=${availFG}`);
  }
  for(const ch of (db.items||[]).filter(i=>i.level===1)){
    let avail = ch.onHand - ch.safety;
    const qtyPer = (db.bom||[]).find(b=>b.parent===fg.id && b.child===ch.id)?.qty || 0;
    for(let t=0;t<horizon;t++){
      const parentProd = plan[t].receipt;
      const gross = parentProd * qtyPer;
      const net = Math.max(0, gross - avail);
      const receipt = net>0 ? lotQty(net) : 0;
      const release = receipt>0 ? Math.max(0, t - ch.lead) : 0;
      plan.push({ item:ch.id, period:t+1, gross, net, receipt, release });
      avail = avail - gross + receipt;
      log.push(`${ch.id} p${t+1}: gross=${gross} net=${net} receipt=${receipt} avail=${avail}`);
    }
  }
  const hdr = `<tr><th>Item</th><th>Per</th><th>Gross</th><th>Net</th><th>Receipt</th><th>Planned Release</th></tr>`;
  const rows = plan.map(p=>`<tr><td>${p.item}</td><td>${p.period}</td><td>${p.gross}</td><td>${p.net}</td><td>${p.receipt}</td><td>${p.release}</td></tr>`).join('');
  $('#mrp-table') && ($('#mrp-table').innerHTML = `<table>${hdr}${rows}</table>`);
  $('#mrp-log') && ($('#mrp-log').textContent = log.join('\n'));
  renderDashboard();
  $('#json-editor') && ($('#json-editor').value = JSON.stringify(db, null, 2));
}
$('#mrp-run') && $('#mrp-run').addEventListener('click', runMRP);
$('#mrp-edit') && $('#mrp-edit').addEventListener('click', ()=>{
  const raw = prompt('Edit items JSON', JSON.stringify(db.items, null, 2));
  if(!raw) return;
  try { db.items = JSON.parse(raw); renderItemsUI(); renderDashboard(); } catch(e){ alert('JSON invalid'); }
});

// ===== Schedule (FCFS) =====
function renderJobs(){
  $('#jobs-table') && ($('#jobs-table').innerHTML = (db.jobs||[]).map(j=>`<div>${j.id} • ${j.wc} • ${j.procTime} • due:${j.due}</div>`).join(''));
}
function runSchedule(){
  const byWC = {};
  (db.jobs||[]).forEach(j=> { (byWC[j.wc] = byWC[j.wc]||[]).push({...j}); });
  $('#gantt') && ($('#gantt').innerHTML = '');
  const log = [];
  Object.keys(byWC).forEach(wc=>{
    let time = 0;
    const track = document.createElement('div');
    track.className = 'track';
    (byWC[wc]||[]).forEach(job=>{
      const start = time, end = time + job.procTime;
      time = end;
      log.push(`${wc} ${job.id}: start=${start} end=${end}`);
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.left = (start * 8) + 'px';
      bar.style.width = (job.procTime * 8) + 'px';
      bar.textContent = job.id;
      bar.style.position = 'absolute';
      bar.style.top = '6px';
      bar.style.background = '#86efac';
      track.style.position = 'relative';
      track.appendChild(bar);
    });
    const label = document.createElement('div');
    label.textContent = wc;
    $('#gantt') && $('#gantt').appendChild(label);
    $('#gantt') && $('#gantt').appendChild(track);
  });
  $('#sch-log') && ($('#sch-log').textContent = log.join('\n'));
  $('#json-editor') && ($('#json-editor').value = JSON.stringify(db, null, 2));
}
$('#sch-run') && $('#sch-run').addEventListener('click', runSchedule);
$('#sch-edit') && $('#sch-edit').addEventListener('click', ()=>{
  const raw = prompt('Edit jobs JSON', JSON.stringify(db.jobs, null, 2));
  if(!raw) return;
  try { db.jobs = JSON.parse(raw); renderJobs(); } catch(e){ alert('JSON invalid'); }
});

// ===== ABC =====
function renderInv(){
  $('#inv-table') && ($('#inv-table').innerHTML = (db.inventory||[]).map(i=>`<div>${i.sku} • ${i.name} • ${i.price} • consume:${i.consume}</div>`).join(''));
}
function runABC(){
  const rows = (db.inventory||[]).map(i=> ({...i, value: i.price * i.consume})).sort((a,b)=>b.value - a.value);
  const total = rows.reduce((s,r)=>s+r.value,0);
  let cum=0;
  const out = rows.map(r=>{
    cum += r.value;
    const cumPct = (cum/total)*100;
    const cls = cumPct <= 80 ? 'A' : cumPct <=95 ? 'B' : 'C';
    return {...r, cumPct, cls};
  });
  const rowsHtml = out.map(o=>`<tr><td>${o.sku}</td><td>${o.name}</td><td>Rp ${Number(o.value).toLocaleString()}</td><td>${o.cumPct.toFixed(2)}%</td><td>${o.cls}</td></tr>`).join('');
  $('#abc-result') && ($('#abc-result').innerHTML = `<table><thead><tr><th>SKU</th><th>Nama</th><th>Nilai</th><th>Cumm%</th><th>Kelas</th></tr></thead><tbody>${rowsHtml}</tbody></table>`);
  $('#abc-log') && ($('#abc-log').textContent = out.map(o=>`${o.sku} value=${o.value} cum%=${o.cumPct.toFixed(2)} class=${o.cls}`).join('\n'));
  $('#json-editor') && ($('#json-editor').value = JSON.stringify(db, null, 2));
}
$('#abc-run') && $('#abc-run').addEventListener('click', runABC);
$('#abc-edit') && $('#abc-edit').addEventListener('click', ()=>{
  const raw = prompt('Edit inventory JSON', JSON.stringify(db.inventory, null, 2));
  if(!raw) return;
  try { db.inventory = JSON.parse(raw); renderInv(); renderDashboard(); } catch(e){ alert('JSON invalid'); }
});

// ===== Quiz =====
function renderQuiz(){
  $('#quiz-box') && ($('#quiz-box').innerHTML = (db.quiz || []).map((q,idx)=> {
    const opts = q.a.map((opt,i)=> `<label><input type="radio" name="q${idx}" value="${i}"> ${opt}</label>`).join('');
    return `<div class="qcard"><div><strong>Q${idx+1}.</strong> ${q.q}</div>${opts}</div>`;
  }).join(''));
}
$('#quiz-check') && $('#quiz-check').addEventListener('click', ()=>{
  let score=0;
  (db.quiz||[]).forEach((q,idx)=>{
    const sel = document.querySelector(`input[name="q${idx}"]:checked`);
    if(sel && parseInt(sel.value,10) === q.correct) score++;
  });
  $('#quiz-score') && ($('#quiz-score').textContent = `Skor: ${score}/${db.quiz.length}`);
});
$('#quiz-reset') && $('#quiz-reset').addEventListener('click', ()=> { renderQuiz(); $('#quiz-score') && ($('#quiz-score').textContent = ''); });

// ===== Data editor & dataset loader =====
$('#load-dataset') && $('#load-dataset').addEventListener('click', ()=>{
  const key = $('#dataset-select').value;
  if(!key){ alert('Pilih dataset'); return; }
  const ds = datasets[key];
  if(!ds){ alert('Dataset tidak tersedia'); return; }
  // merge minimal fields
  db.demand = ds.demand.slice();
  db.items = ds.items.map(x=>JSON.parse(JSON.stringify(x)));
  db.bom = ds.bom.map(x=>JSON.parse(JSON.stringify(x)));
  db.jobs = ds.jobs.map(x=>JSON.parse(JSON.stringify(x)));
  db.inventory = ds.inventory.map(x=>JSON.parse(JSON.stringify(x)));
  if(ds.quiz) db.quiz = ds.quiz.map(x=>JSON.parse(JSON.stringify(x)));
  $('#json-editor') && ($('#json-editor').value = JSON.stringify(db, null, 2));
  alert('Dataset dimuat ke editor. Tekan "Simpan ke aplikasi" untuk menerapkannya.');
});

$('#save-json') && $('#save-json').addEventListener('click', ()=>{
  try {
    const parsed = JSON.parse($('#json-editor').value);
    db = parsed;
    $('#json-error') && ($('#json-error').textContent = '');
    alert('Data disimpan. Modul diperbarui.');
    renderAll();
  } catch(e) {
    $('#json-error') && ($('#json-error').textContent = 'JSON tidak valid: ' + e.message);
  }
});
$('#reset-json') && $('#reset-json').addEventListener('click', ()=>{
  db = JSON.parse(JSON.stringify(defaultDB));
  $('#json-editor') && ($('#json-editor').value = JSON.stringify(db, null, 2));
  renderAll();
});
$('#export-json') && $('#export-json').addEventListener('click', ()=>{
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'pkk_data.json';
  a.click();
});

// ===== Render helpers =====
function renderItems(){ renderItemsUI(); }
function renderJobs(){ renderJobs(); }
function renderInv(){ renderInv(); }

function renderItemsUI(){
  $('#items-table') && ($('#items-table').innerHTML = (db.items||[]).map(i=>`<div>${i.id} • ${i.name} • OnHand:${i.onHand} • Lead:${i.lead}</div>`).join(''));
}
function renderJobs(){
  $('#jobs-table') && ($('#jobs-table').innerHTML = (db.jobs||[]).map(j=>`<div>${j.id} • ${j.wc} • ${j.procTime} • due:${j.due}</div>`).join(''));
}
function renderInv(){
  $('#inv-table') && ($('#inv-table').innerHTML = (db.inventory||[]).map(i=>`<div>${i.sku} • ${i.name} • ${i.price} • consume:${i.consume}</div>`).join(''));
}

// ===== Render forecast UI =====
function renderForecastUI(){
  $('#demand-list') && ($('#demand-list').textContent = (db.demand||[]).map((v,i)=>`P${i+1}: ${v}`).join(' · '));
  $('#forecast-metrics') && ($('#forecast-metrics').textContent = '');
  $('#forecast-log') && ($('#forecast-log').textContent = '');
  if (chartForecast) {
    chartForecast.data.labels = (db.demand||[]).map((_,i)=> 'P'+(i+1));
    chartForecast.data.datasets[0].data = db.demand || [];
    chartForecast.data.datasets[1].data = (db._lastSMA || []).map(v=> v===undefined? null : v);
    chartForecast.data.datasets[2].data = (db._lastWMA || []).map(v=> v===undefined? null : v);
    chartForecast.update();
  }
}

// ===== Render all =====
function renderAll(){
  if (typeof Chart !== 'undefined' && !window._chartsInitialized) {
    initCharts();
    window._chartsInitialized = true;
  }
  renderDashboard();
  renderForecastUI();
  renderItemsUI();
  renderJobs();
  renderInv();
  renderQuiz();
  $('#json-editor') && ($('#json-editor').value = JSON.stringify(db, null, 2));
}

// ===== Init =====
document.addEventListener('DOMContentLoaded', ()=>{
  renderAll();
});


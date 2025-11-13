// Simpan sebagai app.js (letakkan di folder yang sama dengan index.html)

// ===== Default demo data =====
const defaultDB = {
  demand: [120,100,140,130,160,150,170,165,180,175],
  capacityHoursPerWeek: 240,
  inventoryEnding: 320,
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
    { id:'J2', wc:'WC-1', procTime:4, due:7 },
    { id:'J3', wc:'WC-2', procTime:8, due:12 },
    { id:'J4', wc:'WC-2', procTime:3, due:6 }
  ],
  inventory: [
    { sku:'SKU-01', name:'Bolt M8', price:0.5, consume:6000 },
    { sku:'SKU-02', name:'Nut M8', price:0.4, consume:5800 },
    { sku:'SKU-03', name:'Motor 24V', price:35, consume:200 },
    { sku:'SKU-04', name:'Frame', price:12, consume:400 },
    { sku:'SKU-05', name:'PCB Controller', price:18, consume:250 },
    { sku:'SKU-06', name:'Bearing', price:2.2, consume:1200 },
    { sku:'SKU-07', name:'Packaging Box', price:1.1, consume:1800 }
  ],
  quiz: [
    { q:'MRP menghitung…', a:['Kapasitas mesin','Kebutuhan bersih material','Biaya tenaga kerja'], correct:1 },
    { q:'SPT memprioritaskan…', a:['Job tercepat','Job datang pertama','Job paling mahal'], correct:0 },
    { q:'ABC: kelas A umumnya…', a:['Nilai rendah, item banyak','Nilai tinggi, item sedikit','Nilai sedang'], correct:1 },
    { q:'SMA window 3 artinya…', a:['Rata-rata 3 periode terakhir','Bobot sama untuk semua periode','Tidak pakai data masa lalu'], correct:0 },
    { q:'Lead time 2 artinya…', a:['Order hari ini, datang 2 periode kemudian','Order hari ini, datang besok','Order kemarin, datang hari ini'], correct:0 }
  ]
};

let db = JSON.parse(JSON.stringify(defaultDB));

// ===== Utility =====
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmt = (n) => (typeof n==='number')? n.toFixed(2) : n;

// ===== Tab handling =====
$$('.tab-btn').forEach(b=>{
  b.addEventListener('click', ()=> {
    const tab = b.dataset.tab;
    $$('button.tab-btn').forEach(x=>x.classList.remove('ring','ring-2','ring-sky-300'));
    b.classList.add('ring','ring-2','ring-sky-300');
    $$('section.tab-panel').forEach(s=>s.classList.add('hidden'));
    $('#'+tab).classList.remove('hidden');
    renderAll();
  });
});
// set default active
$$('button.tab-btn')[0].click();

// ===== Render Dasbor =====
function renderDashboard(){
  const avg = db.demand.reduce((a,b)=>a+b,0)/db.demand.length;
  $('#kpi-avg-demand').textContent = fmt(avg);
  const maxLead = Math.max(...db.items.map(i=>i.lead));
  $('#kpi-max-lead').textContent = maxLead + ' periode';
  const totalValue = db.inventory.reduce((s,i)=>s + (i.price * i.consume), 0);
  $('#kpi-annual-value').textContent = 'Rp ' + Number(totalValue).toLocaleString();
}

// ===== PERAMALAN =====
function renderForecastUI(){
  $('#demand-list').innerHTML = db.demand.map((v,i)=>`P${i+1}: ${v}`).join(' · ');
  $('#forecast-result').innerHTML = '';
  $('#forecast-metrics').innerHTML = '';
  $('#forecast-log').textContent = '';
}

function computeSMA(arr, w){
  const out = new Array(arr.length).fill(undefined);
  const log = [];
  for(let i=0;i<arr.length;i++){
    if(i < w-1) continue;
    const window = arr.slice(i-w+1, i+1);
    const avg = window.reduce((a,b)=>a+b,0)/w;
    out[i]=avg;
    log.push(`SMA P${i+1} = avg([${window.join(', ')}]) = ${fmt(avg)}`);
  }
  return { out, log };
}
function computeWMA(arr, weights){
  const w = weights.length;
  const out = new Array(arr.length).fill(undefined);
  const log = [];
  const sumW = weights.reduce((a,b)=>a+b,0);
  if(Math.abs(sumW-1) > 1e-6) {
    return { out, log: ['Bobot WMA tidak total=1; WMA dilewati.'] };
  }
  for(let i=0;i<arr.length;i++){
    if(i < w-1) continue;
    const window = arr.slice(i-w+1, i+1).slice().reverse();
    const val = window.reduce((acc,v,idx)=>acc + v*weights[idx], 0);
    out[i]=val;
    log.push(`WMA P${i+1} = sum(v*w) = ${fmt(val)}`);
  }
  return { out, log };
}
function mape(actual, forecast){
  let n=0, sum=0;
  for(let i=0;i<actual.length;i++){
    const a=actual[i], f=forecast[i];
    if(f===undefined || a===0) continue;
    sum += Math.abs((a-f)/a)*100; n++;
  }
  return n? sum/n : Infinity;
}
$('#fc-run').addEventListener('click', ()=>{
  const w = Math.max(2, Math.min(8, parseInt($('#fc-window').value) || 3));
  const weights = $('#fc-weights').value.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));
  const { out: sma, log: logSMA } = computeSMA(db.demand, w);
  const { out: wma, log: logWMA } = computeWMA(db.demand, weights);
  const errSMA = mape(db.demand, sma);
  const errWMA = mape(db.demand, wma);
  // render table simple
  const rows = db.demand.map((d,i)=> {
    return `<tr class="odd:bg-slate-50"><td class="px-2 py-1">${i+1}</td><td class="px-2 py-1">${d}</td><td class="px-2 py-1">${sma[i]===undefined?'-':fmt(sma[i])}</td><td class="px-2 py-1">${wma[i]===undefined?'-':fmt(wma[i])}</td></tr>`;
  }).join('');
  $('#forecast-result').innerHTML = `
    <table class="w-full text-sm border"><thead class="bg-slate-100"><tr><th class="p-2">Per</th><th class="p-2">Aktual</th><th class="p-2">SMA</th><th class="p-2">WMA</th></tr></thead>
    <tbody>${rows}</tbody></table>
  `;
  $('#forecast-metrics').innerHTML = `<div><strong>MAPE SMA:</strong> ${isFinite(errSMA)?fmt(errSMA)+'%':'—'}</div><div><strong>MAPE WMA:</strong> ${isFinite(errWMA)?fmt(errWMA)+'%':'—'}</div>`;
  $('#forecast-log').textContent = [...logSMA, ...logWMA].join('\n');
  renderDashboard();
});
$('#fc-clear').addEventListener('click', ()=> renderForecastUI());
$('#add-period').addEventListener('click', ()=>{
  const v = parseFloat(prompt('Masukkan permintaan periode baru (angka)', '160'));
  if(!isNaN(v)) { db.demand.push(v); renderForecastUI(); renderDashboard(); }
});
$('#edit-demand').addEventListener('click', ()=>{
  const csv = prompt('Masukkan permintaan CSV (contoh: 120,100,140,...)', db.demand.join(','));
  if(csv!==null){
    const arr = csv.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));
    if(arr.length>=3){ db.demand = arr; renderForecastUI(); renderDashboard(); } else alert('Minimal 3 periode');
  }
});

// ===== MRP =====
function renderItems(){
  const rows = db.items.map(it=>`<tr class="odd:bg-slate-50"><td class="px-2 py-1">${it.id}</td><td class="px-2 py-1">${it.name}</td><td class="px-2 py-1">${it.level}</td><td class="px-2 py-1">${it.onHand}</td><td class="px-2 py-1">${it.lead}</td><td class="px-2 py-1">${it.safety}</td></tr>`).join('');
  $('#items-table').innerHTML = `<table class="w-full text-sm border"><thead class="bg-slate-100"><tr><th class="p-2">ID</th><th class="p-2">Nama</th><th class="p-2">Level</th><th class="p-2">OnHand</th><th class="p-2">Lead</th><th class="p-2">Safety</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function runMRP(){
  const horizon = 6;
  const log = [];
  const fg = db.items.find(i=>i.level===0);
  if(!fg){ alert('Tidak ada FG level 0'); return; }
  // asumsi kebutuhan FG = permintaan horizon terakhir (atau repeat last)
  const grossFG = Array.from({length:horizon}, (_,i)=> db.demand[db.demand.length-horizon + i] ?? db.demand[db.demand.length-1]);
  log.push(`Kebutuhan kotor FG: [${grossFG.join(', ')}]`);
  const plan = [];
  const lotType = 'L4L';
  const lotQty = (need)=> lotType==='L4L'? need : Math.ceil(need/50)*50;
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
  // children
  for(const ch of db.items.filter(i=>i.level===1)){
    let avail = ch.onHand - ch.safety;
    const qtyPer = (db.bom.find(b=>b.parent===fg.id && b.child===ch.id)||{qty:0}).qty;
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
  // render
  const hdr = `<tr class="bg-slate-100"><th class="p-2">Item</th><th class="p-2">Per</th><th class="p-2">Gross</th><th class="p-2">Net</th><th class="p-2">Receipt</th><th class="p-2">Planned Release</th></tr>`;
  const rows = plan.map(p=>`<tr class="odd:bg-slate-50"><td class="px-2 py-1">${p.item}</td><td class="px-2 py-1">${p.period}</td><td class="px-2 py-1">${p.gross}</td><td class="px-2 py-1">${p.net}</td><td class="px-2 py-1">${p.receipt}</td><td class="px-2 py-1">${p.release}</td></tr>`).join('');
  $('#mrp-table').innerHTML = `<table class="w-full text-sm border">${hdr}<tbody>${rows}</tbody></table>`;
  $('#mrp-log').textContent = log.join('\n');
  renderDashboard();
}
$('#mrp-run').addEventListener('click', runMRP);
$('#mrp-edit').addEventListener('click', ()=>{
  const raw = prompt('Edit items JSON', JSON.stringify(db.items, null, 2));
  if(!raw) return;
  try { db.items = JSON.parse(raw); renderItems(); renderDashboard(); } catch(e){ alert('JSON invalid'); }
});

// ===== SCHEDULE (FCFS) =====
function renderJobs(){
  const rows = db.jobs.map(j=>`<tr class="odd:bg-slate-50"><td class="px-2 py-1">${j.id}</td><td class="px-2 py-1">${j.wc}</td><td class="px-2 py-1">${j.procTime}</td><td class="px-2 py-1">${j.due}</td></tr>`).join('');
  $('#jobs-table').innerHTML = `<table class="w-full text-sm border"><thead class="bg-slate-100"><tr><th class="p-2">Job</th><th class="p-2">WC</th><th class="p-2">Proc</th><th class="p-2">Due</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function runSchedule(){
  const byWC = {};
  db.jobs.forEach(j=> { (byWC[j.wc] = byWC[j.wc]||[]).push({...j}); });
  $('#gantt').innerHTML = '';
  const log = [];
  let globalMakespan = 0, latenessSum=0, count=0;
  Object.keys(byWC).forEach(wc=>{
    // FCFS: keep order as-is
    let time = 0;
    const track = document.createElement('div');
    track.className = 'gantt-track border rounded p-2 bg-slate-50';
    byWC[wc].forEach(job=>{
      const start = time, end = time + job.procTime;
      time = end;
      globalMakespan = Math.max(globalMakespan, end);
      const lateness = Math.max(0, end - job.due);
      latenessSum += lateness; count++;
      log.push(`${wc} ${job.id}: start=${start} end=${end} due=${job.due} lateness=${lateness}`);
      const bar = document.createElement('div');
      bar.className = 'gantt-bar bg-emerald-300';
      bar.style.marginLeft = (start*14)+'px';
      bar.style.width = (job.procTime*14)+'px';
      bar.textContent = `${job.id}`;
      track.appendChild(bar);
    });
    const label = document.createElement('div');
    label.className = 'text-xs text-slate-600 mb-1';
    label.textContent = wc;
    $('#gantt').appendChild(label);
    $('#gantt').appendChild(track);
  });
  $('#sch-log').textContent = log.join('\n');
  $('#sch-metrics').innerHTML = `<div><strong>Makespan:</strong> ${globalMakespan}</div><div><strong>Avg Lateness:</strong> ${count? fmt(latenessSum/count) : 0}</div>`;
}
$('#sch-run').addEventListener('click', runSchedule);
$('#sch-edit').addEventListener('click', ()=>{
  const raw = prompt('Edit jobs JSON', JSON.stringify(db.jobs, null, 2));
  if(!raw) return;
  try { db.jobs = JSON.parse(raw); renderJobs(); } catch(e){ alert('JSON invalid'); }
});

// ===== ABC =====
function renderInventory(){
  const rows = db.inventory.map(i=>`<tr class="odd:bg-slate-50"><td class="px-2 py-1">${i.sku}</td><td class="px-2 py-1">${i.name}</td><td class="px-2 py-1">${i.price}</td><td class="px-2 py-1">${i.consume}</td></tr>`).join('');
  $('#inv-table').innerHTML = `<table class="w-full text-sm border"><thead class="bg-slate-100"><tr><th class="p-2">SKU</th><th class="p-2">Nama</th><th class="p-2">Harga</th><th class="p-2">Konsumsi</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function runABC(){
  const rows = db.inventory.map(i=> ({...i, value: i.price * i.consume})).sort((a,b)=>b.value - a.value);
  const total = rows.reduce((s,r)=>s+r.value,0);
  let cum=0;
  const out = rows.map(r=>{
    cum += r.value;
    const cumPct = (cum/total)*100;
    const cls = cumPct <= 80 ? 'A' : cumPct <=95 ? 'B' : 'C';
    return {...r, cumPct, cls};
  });
  const rowsHtml = out.map(o=>`<tr class="odd:bg-slate-50"><td class="px-2 py-1">${o.sku}</td><td class="px-2 py-1">${o.name}</td><td class="px-2 py-1">Rp ${Number(o.value).toLocaleString()}</td><td class="px-2 py-1">${fmt(o.cumPct)}%</td><td class="px-2 py-1">${o.cls}</td></tr>`).join('');
  $('#abc-result').innerHTML = `<table class="w-full text-sm border"><thead class="bg-slate-100"><tr><th class="p-2">SKU</th><th class="p-2">Nama</th><th class="p-2">Nilai</th><th class="p-2">Cumm%</th><th class="p-2">Kelas</th></tr></thead><tbody>${rowsHtml}</tbody></table>`;
  $('#abc-log').textContent = out.map(o=>`${o.sku} value=${o.value} cum%=${fmt(o.cumPct)} class=${o.cls}`).join('\n');
}
$('#abc-run').addEventListener('click', runABC);
$('#abc-edit').addEventListener('click', ()=>{
  const raw = prompt('Edit inventory JSON', JSON.stringify(db.inventory, null, 2));
  if(!raw) return;
  try { db.inventory = JSON.parse(raw); renderInventory(); renderDashboard(); } catch(e){ alert('JSON invalid'); }
});

// ===== QUIZ =====
function renderQuiz(){
  $('#quiz-box').innerHTML = db.quiz.map((q,idx)=> {
    const opts = q.a.map((opt,i)=> `<label class="block text-sm"><input type="radio" name="q${idx}" value="${i}" class="mr-2">${opt}</label>`).join('');
    return `<div class="p-3 border rounded bg-slate-50"><div class="font-medium">Q${idx+1}. ${q.q}</div>${opts}</div>`;
  }).join('');
}
$('#quiz-check').addEventListener('click', ()=>{
  let score=0;
  db.quiz.forEach((q,idx)=>{
    const sel = document.querySelector(`input[name="q${idx}"]:checked`);
    if(sel && parseInt(sel.value)===q.correct) score++;
  });
  $('#quiz-score').textContent = `Skor: ${score}/${db.quiz.length}`;
});
$('#quiz-reset').addEventListener('click', ()=> { renderQuiz(); $('#quiz-score').textContent=''; });

// ===== DATA DEMO EDITOR =====
function loadJsonEditor(){
  $('#json-editor').value = JSON.stringify(db, null, 2);
  $('#json-error').textContent = '';
}
$('#save-json').addEventListener('click', ()=>{
  try {
    const parsed = JSON.parse($('#json-editor').value);
    db = parsed;
    $('#json-error').textContent = '';
    alert('Data disimpan. Modul akan diperbarui.');
    renderAll();
  } catch(e){
    $('#json-error').textContent = 'JSON tidak valid: ' + e.message;
  }
});
$('#reset-json').addEventListener('click', ()=>{
  db = JSON.parse(JSON.stringify(defaultDB));
  loadJsonEditor();
  renderAll();
});

// ===== Render semua modul =====
function renderAll(){
  renderDashboard();
  renderForecastUI();
  renderItems();
  renderJobs();
  renderInventory();
  renderQuiz();
  loadJsonEditor();
}
// inisialisasi
document.addEventListener('DOMContentLoaded', renderAll);

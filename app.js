// Data demo (bisa di-reset/import/export)
const db = {
  demand: [120, 100, 140, 130, 160, 150, 170, 165, 180, 175],
  capacityHoursPerWeek: 240,
  inventoryEnding: 320,
  forecast: [],
  items: [
    { id: 'FG-A', name: 'Finished Good A', level: 0, onHand: 100, lead: 1, safety: 20 },
    { id: 'RM-X', name: 'Raw Material X', level: 1, onHand: 200, lead: 2, safety: 50 },
    { id: 'RM-Y', name: 'Raw Material Y', level: 1, onHand: 150, lead: 1, safety: 30 },
  ],
  bom: [
    { parent: 'FG-A', child: 'RM-X', qty: 2 },
    { parent: 'FG-A', child: 'RM-Y', qty: 1 },
  ],
  jobs: [
    { id: 'J1', wc: 'WC-1', procTime: 6, due: 10 },
    { id: 'J2', wc: 'WC-1', procTime: 4, due: 7 },
    { id: 'J3', wc: 'WC-2', procTime: 8, due: 12 },
    { id: 'J4', wc: 'WC-2', procTime: 3, due: 6 },
  ],
  inventory: [
    { sku: 'SKU-01', name: 'Bolt M8', price: 0.5, consume: 6000 },
    { sku: 'SKU-02', name: 'Nut M8', price: 0.4, consume: 5800 },
    { sku: 'SKU-03', name: 'Motor 24V', price: 35, consume: 200 },
    { sku: 'SKU-04', name: 'Frame', price: 12, consume: 400 },
    { sku: 'SKU-05', name: 'PCB Controller', price: 18, consume: 250 },
    { sku: 'SKU-06', name: 'Bearing', price: 2.2, consume: 1200 },
    { sku: 'SKU-07', name: 'Packaging Box', price: 1.1, consume: 1800 },
  ],
  quiz: [
    { q: 'MRP menghitung…', a: ['Kapasitas mesin', 'Kebutuhan bersih material', 'Biaya tenaga kerja'], correct: 1 },
    { q: 'Metode SPT memprioritaskan…', a: ['Job tercepat', 'Job datang pertama', 'Job paling mahal'], correct: 0 },
    { q: 'ABC: kelas A umumnya…', a: ['Nilai rendah, item banyak', 'Nilai tinggi, item sedikit', 'Nilai sedang'], correct: 1 },
    { q: 'SMA dengan window 3 artinya…', a: ['Rata-rata 3 periode terakhir', 'Bobot sama untuk semua periode', 'Tidak pakai data masa lalu'], correct: 0 },
    { q: 'Lead time 2 artinya…', a: ['Order hari ini, datang 2 periode kemudian', 'Order hari ini, datang besok', 'Order kemarin, datang hari ini'], correct: 0 },
  ],
};

// Util
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));
const fmt = (n) => typeof n === 'number' ? n.toFixed(2) : n;

// Init nav
$$('.nav button').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.nav button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    $$('.tab').forEach(t => t.classList.remove('active'));
    $('#' + tab).classList.add('active');
    renderAll();
  });
});

// Export/Import/Reset
$('#btn-export').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(db,null,2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'perencanaan-produksi-demo.json';
  a.click();
});
$('#btn-import').addEventListener('click', ()=> $('#file-import').click());
$('#file-import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if(!file) return;
  const text = await file.text();
  try { Object.assign(db, JSON.parse(text)); renderAll(); alert('Import sukses'); }
  catch(err){ alert('Gagal import: ' + err.message); }
});
$('#btn-reset').addEventListener('click', () => {
  window.location.reload();
});

// DASHBOARD
function renderDashboard(){
  $('#kpi-demand').textContent = db.demand[db.demand.length-1];
  $('#kpi-capacity').textContent = db.capacityHoursPerWeek;
  $('#kpi-inventory').textContent = db.inventoryEnding;
  renderDemandChart();
}
function renderDemandChart(){
  const container = $('#chart-demand');
  container.innerHTML = '';
  const max = Math.max(...db.demand, ...(db.forecast.length?db.forecast:[0]));
  db.demand.forEach((val,i)=>{
    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${(val/max)*140+8}px`;
    bar.title = `P${i+1}: ${val}`;
    container.appendChild(bar);
    if(db.forecast[i]!==undefined){
      const fbar = document.createElement('div');
      fbar.className = 'bar forecast';
      fbar.style.height = `${(db.forecast[i]/max)*140+8}px`;
      fbar.title = `F${i+1}: ${fmt(db.forecast[i])}`;
      container.appendChild(fbar);
    }
  });
}

// FORECAST
function tableFromArray(id, headers, rows){
  const t = $(id);
  t.innerHTML = '';
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  headers.forEach(h=>{
    const th = document.createElement('th'); th.textContent = h; trh.appendChild(th);
  });
  thead.appendChild(trh);
  t.appendChild(thead);
  const tbody = document.createElement('tbody');
  rows.forEach(r=>{
    const tr = document.createElement('tr');
    r.forEach(c=>{
      const td = document.createElement('td'); td.textContent = c; tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  t.appendChild(tbody);
}

function renderForecast(){
  tableFromArray('#tbl-forecast', ['Periode','Permintaan'], db.demand.map((d,i)=>[i+1,d]));
  $('#fc-edit').onclick = ()=>{
    const raw = prompt('Edit permintaan (pisahkan dengan koma)', db.demand.join(','));
    if(!raw) return;
    const arr = raw.split(',').map(x=>parseFloat(x.trim())).filter(x=>!isNaN(x));
    if(arr.length<3){ alert('Minimal 3 data'); return; }
    db.demand = arr; db.forecast = []; renderAll();
  };
  $('#fc-add').onclick = ()=>{
    const val = parseFloat(prompt('Tambah periode (angka)', '160'));
    if(isNaN(val)) return;
    db.demand.push(val); renderAll();
  };
  $('#fc-run').onclick = ()=>{
    const w = Math.max(2, Math.min(8, parseInt($('#fc-window').value)));
    const weights = $('#fc-weights').value.split(',').map(x=>parseFloat(x.trim()));
    const sumW = weights.reduce((a,b)=>a+b,0);
    const log = [];
    const sma = [];
    for(let i=0;i<db.demand.length;i++){
      if(i < w-1){ sma.push(undefined); continue; }
      const window = db.demand.slice(i-w+1, i+1);
      const avg = window.reduce((a,b)=>a+b,0)/w;
      sma.push(avg);
      log.push(`SMA P${i+1} dari [${window.join(', ')}] = ${fmt(avg)}`);
    }
    const wsma = [];
    if(weights.length===w && Math.abs(sumW-1)<1e-6){
      for(let i=0;i<db.demand.length;i++){
        if(i < w-1){ wsma.push(undefined); continue; }
        const window = db.demand.slice(i-w+1, i+1);
        const val = window
          .slice().reverse()
          .reduce((acc,v,idx)=>acc+v*weights[idx],0);
        wsma.push(val);
        log.push(`WSMA P${i+1} dari [${window.join(', ')}] dan bobot [${weights.join(', ')}] = ${fmt(val)}`);
      }
    }else{
      log.push('Bobot WSMA tidak valid (harus sejumlah window dan total=1). WSMA dilewati.');
    }
    db.forecast = sma; // tampilkan SMA sebagai baseline di dashboard
    // MAPE
    const errSMA = mape(db.demand, sma);
    const errWSMA = mape(db.demand, wsma);
    tableFromArray('#tbl-forecast-result', ['Periode','Aktual','SMA','WSMA'], db.demand.map((d,i)=>[i+1,d,fmt(sma[i]??'-'),fmt(wsma[i]??'-')]));
    $('#fc-metrics').innerHTML = `
      <div><strong>SMA MAPE:</strong> ${isFinite(errSMA)?fmt(errSMA)+'%':'—'}</div>
      <div><strong>WSMA MAPE:</strong> ${isFinite(errWSMA)?fmt(errWSMA)+'%':'—'}</div>
    `;
    $('#fc-log').textContent = log.join('\n');
    renderDemandChart();
  };
}
function mape(actual, forecast){
  let n=0, sum=0;
  for(let i=0;i<actual.length;i++){
    const a = actual[i], f = forecast[i];
    if(f===undefined || a===0) continue;
    sum += Math.abs((a-f)/a)*100; n++;
  }
  return n? (sum/n) : Infinity;
}

// MRP
function renderItems(){
  const rows = db.items.map(it=>[it.id,it.name,it.level,it.onHand,it.lead,it.safety]);
  tableFromArray('#tbl-items', ['ID','Nama','Level','OnHand','Lead','Safety'], rows);
}
function runMRP(){
  const lot = $('#mrp-lot').value;
  const foq = parseInt($('#mrp-foq').value);
  const log = [];
  // Asumsi kebutuhan FG berdasarkan demand (periode terakhir 4 minggu)
  const horizon = 6;
  const grossFG = Array.from({length:horizon}, (_,i)=> db.demand[db.demand.length-horizon+i] || db.demand[db.demand.length-1]);
  log.push(`Kebutuhan kotor FG: [${grossFG.join(', ')}]`);
  const plan = [];
  // Helper lotting
  const lotQty = (need) => {
    if(lot==='L4L') return need;
    return Math.ceil(need/foq)*foq;
  };
  // MRP FG level 0
  const fg = db.items.find(x=>x.level===0);
  let availableFG = fg.onHand - fg.safety;
  for(let t=0;t<horizon;t++){
    const gross = grossFG[t];
    const net = Math.max(0, gross - availableFG);
    const receipt = net>0 ? lotQty(net) : 0;
    const releasePeriod = t - fg.lead;
    plan.push({ item: fg.id, t, gross, net, receipt, release: releasePeriod>=0?receipt:0 });
    availableFG = availableFG - gross + receipt;
    log.push(`FG t${t+1}: gross=${gross} net=${net} receipt=${receipt} avail=${availableFG}`);
  }
  // Child requirements via BOM
  const children = db.items.filter(x=>x.level===1);
  for(const ch of children){
    let available = ch.onHand - ch.safety;
    const qtyPer = db.bom.find(b=>b.parent===fg.id && b.child===ch.id)?.qty || 0;
    for(let t=0;t<horizon;t++){
      const parentReceipt = plan[t].release || 0; // use release as planned production
      const gross = parentReceipt * qtyPer;
      const net = Math.max(0, gross - available);
      const receipt = net>0 ? lotQty(net) : 0;
      const releasePeriod = t - ch.lead;
      plan.push({ item: ch.id, t, gross, net, receipt, release: releasePeriod>=0?receipt:0 });
      available = available - gross + receipt;
      log.push(`${ch.id} t${t+1}: gross=${gross} net=${net} receipt=${receipt} avail=${available}`);
    }
  }
  // Render table
  const headers = ['Item','Periode','Gross','Net','Receipt','Release'];
  const rows = plan.map(p=>[p.item, p.t+1, p.gross, p.net, p.receipt, p.release]);
  tableFromArray('#tbl-mrp', headers, rows);
  $('#mrp-log').textContent = log.join('\n');
}
function renderMRP(){
  renderItems();
  $('#mrp-edit-items').onclick = ()=>{
    alert('Edit data melalui import/export JSON di Dasbor untuk kenyamanan. (Atau ubah data di app.js)');
  };
  $('#mrp-run').onclick = runMRP;
}

// SCHEDULE
function renderJobs(){
  const rows = db.jobs.map(j=>[j.id,j.wc,j.procTime,j.due]);
  tableFromArray('#tbl-jobs', ['Job','Work Center','Proc. Time','Due'], rows);
}
function runSchedule(){
  const rule = $('#sch-rule').value;
  const byWC = {};
  db.jobs.forEach(j=>{ byWC[j.wc] = byWC[j.wc] || []; byWC[j.wc].push(j); });
  const log = [];
  const metrics = { makespan:0, latenessAvg:0, count:0 };
  $('#gantt').innerHTML = '';
  Object.keys(byWC).forEach(wc=>{
    let queue = byWC[wc].slice();
    if(rule==='SPT') queue.sort((a,b)=>a.procTime-b.procTime);
    // FCFS default
    let time=0;
    queue.forEach(j=>{
      const start = time, end = time + j.procTime;
      time = end;
      const lateness = Math.max(0, end - j.due);
      metrics.makespan = Math.max(metrics.makespan, end);
      metrics.latenessAvg += lateness; metrics.count++;
      log.push(`${rule} ${wc} ${j.id}: start=${start}, end=${end}, due=${j.due}, lateness=${lateness}`);
      const bar = document.createElement('div');
      bar.className = `task ${rule.toLowerCase()}`;
      bar.style.marginLeft = (start*16)+'px';
      bar.style.width = (j.procTime*16)+'px';
      bar.innerHTML = `<span>${wc} • ${j.id}</span>`;
      $('#gantt').appendChild(bar);
    });
  });
  $('#sch-log').textContent = log.join('\n');
  $('#sch-metrics').innerHTML = `
    <div><strong>Makespan:</strong> ${metrics.makespan}</div>
    <div><strong>Rata-rata lateness:</strong> ${fmt(metrics.latenessAvg/metrics.count)}</div>
  `;
}
function renderSchedule(){
  renderJobs();
  $('#sch-edit').onclick = ()=>{
    const raw = prompt('Edit job (JSON array)', JSON.stringify(db.jobs));
    if(!raw) return;
    try { db.jobs = JSON.parse(raw); renderJobs(); }
    catch(err){ alert('Format salah: ' + err.message); }
  };
  $('#sch-run').onclick = runSchedule;
}

// ABC
function renderABC(){
  tableFromArray('#tbl-abc', ['SKU','Nama','Harga','Konsumsi'], db.inventory.map(i=>[i.sku,i.name,i.price,i.consume]));
  $('#abc-edit').onclick = ()=>{
    const raw = prompt('Edit inventory (JSON array)', JSON.stringify(db.inventory));
    if(!raw) return;
    try { db.inventory = JSON.parse(raw); renderABC(); }
    catch(err){ alert('Format salah: ' + err.message); }
  };
  $('#abc-run').onclick = ()=>{
    const log = [];
    const rows = db.inventory.map(i=>{
      const value = i.price * i.consume;
      return { ...i, value };
    }).sort((a,b)=>b.value-a.value);
    const total = rows.reduce((a,b)=>a+b.value,0);
    let cum=0;
    const out = rows.map(r=>{
      cum += r.value;
      const share = (r.value/total)*100;
      const cumShare = (cum/total)*100;
      let cls = cumShare<=80 ? 'A' : (cumShare<=95 ? 'B' : 'C');
      log.push(`${r.sku} value=${fmt(r.value)} share=${fmt(share)}% cum=${fmt(cumShare)}% class=${cls}`);
      return [r.sku, r.name, fmt(r.price), r.consume, fmt(r.value), cls];
    });
    tableFromArray('#tbl-abc-result', ['SKU','Nama','Harga','Konsumsi','Nilai','Kelas'], out);
    $('#abc-log').textContent = log.join('\n');
  };
}

// QUIZ
function renderQuiz(){
  $('#quiz-box').innerHTML = '';
  db.quiz.forEach((q,idx)=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `<h4>Q${idx+1}. ${q.q}</h4>`;
    q.a.forEach((opt,i)=>{
      const id = `q${idx}_${i}`;
      card.innerHTML += `
        <label><input type="radio" name="q${idx}" value="${i}" /> ${opt}</label>
      `;
    });
    $('#quiz-box').appendChild(card);
  });
  $('#quiz-start').onclick = ()=> alert('Pilih jawaban Anda lalu tekan Reset untuk mencoba lagi.');
  $('#quiz-reset').onclick = ()=>{
    $$('input[type=radio]').forEach(r=> r.checked=false);
    $('#quiz-result').innerHTML = '';
  };
  $('#quiz-box').addEventListener('change', ()=>{
    let correct=0;
    db.quiz.forEach((q,idx)=>{
      const sel = document.querySelector(`input[name="q${idx}"]:checked`);
      if(sel && parseInt(sel.value)===q.correct) correct++;
    });
    $('#quiz-result').innerHTML = `<div><strong>Skor:</strong> ${correct}/${db.quiz.length}</div>`;
  });
}

// Render all
function renderAll(){
  renderDashboard();
  renderForecast();
  renderMRP();
  renderSchedule();
  renderABC();
  renderQuiz();
}
document.addEventListener('DOMContentLoaded', renderAll);

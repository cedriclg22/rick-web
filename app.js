/* ============ STATE ============ */
const STORE_KEY = 'rick_state_v1';

const CATS = [
  { id:'pro',     name:'Pro',     icon:'💼', deco:'💼' },
  { id:'perso',   name:'Perso',   icon:'🧘', deco:'🧘' },
  { id:'famille', name:'Famille', icon:'❤️', deco:'❤️' },
];

const EXT_CATALOG = [
  { id:'gmail',    name:'Gmail',    icon:'📧', cat:'communication', desc:"Envoyez un e-mail via Gmail.", installed:true,  status:'pending' },
  { id:'whatsapp', name:'WhatsApp', icon:'💬', cat:'communication', desc:"Envoyez un message WhatsApp.", installed:true,  status:'active' },
  { id:'telegram', name:'Telegram', icon:'✈️', cat:'communication', desc:"Envoyez un message Telegram.", installed:true,  status:'pending' },
  { id:'outlook',  name:'Outlook',  icon:'📨', cat:'communication', desc:"Envoyez un e-mail via Outlook / Microsoft 365.", installed:false, status:'none' },
  { id:'slack',    name:'Slack',    icon:'✳️', cat:'communication', desc:"Postez un message dans un canal Slack.", installed:false, status:'none' },
  { id:'calendar', name:'Google Agenda', icon:'📅', cat:'automatisation', desc:"Créez des événements automatiquement.", installed:false, status:'none' },
  { id:'notion',   name:'Notion',   icon:'🗒️', cat:'automatisation', desc:"Enregistrez vos notes dans Notion.", installed:false, status:'none' },
];

const FILTERS = [
  { id:'tout', label:'Tout' },
  { id:'automatisation', label:'Automatisation' },
  { id:'communication', label:'Communication' },
];

function loadState(){
  try{
    const raw = localStorage.getItem(STORE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return {
    memos: [],
    reminders: [],
    extensions: JSON.parse(JSON.stringify(EXT_CATALOG)),
    activeCat: null,
  };
}
let state = loadState();
if(!state.extensions) state.extensions = JSON.parse(JSON.stringify(EXT_CATALOG));

function saveState(){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

/* ============ NAV ============ */
const views = document.querySelectorAll('.view');
const navBtns = document.querySelectorAll('.navpill');
let currentView = 'library';

function showView(name){
  currentView = name;
  views.forEach(v=>v.classList.toggle('active', v.id === 'view-'+name));
  navBtns.forEach(b=>b.classList.toggle('active', b.dataset.view === name));
  if(name === 'map') initMapIfNeeded();
  if(name === 'agenda') renderAgenda();
  if(name === 'library') renderLibrary();
  if(name === 'store') renderStore();
}
navBtns.forEach(b=> b.addEventListener('click', ()=> showView(b.dataset.view)));

/* ============ HEADER / DATE ============ */
function fmtDateLine(d){
  const days=['DIMANCHE','LUNDI','MARDI','MERCREDI','JEUDI','VENDREDI','SAMEDI'];
  const months=['JANV.','FÉVR.','MARS','AVR.','MAI','JUIN','JUIL.','AOÛT','SEPT.','OCT.','NOV.','DÉC.'];
  const hh = String(d.getHours()).padStart(2,'0');
  const mm = String(d.getMinutes()).padStart(2,'0');
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}
document.getElementById('todayLine').textContent = fmtDateLine(new Date());

/* ============ LIBRARY ============ */
const catRow = document.getElementById('catRow');
const memoGrid = document.getElementById('memoGrid');
const libraryEmpty = document.getElementById('libraryEmpty');
const librarySearch = document.getElementById('librarySearch');

function renderCatRow(){
  catRow.innerHTML = CATS.map(c=>{
    const count = state.memos.filter(m=>m.category===c.id).length;
    const sel = state.activeCat===c.id ? 'selected':'';
    return `<div class="cat-card ${sel}" data-cat="${c.id}">
      <div class="cat-icon-wrap">${c.icon}</div>
      <div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-count">${count} mémo${count>1?'s':''}</div>
      </div>
      <div class="cat-deco">${c.deco}</div>
    </div>`;
  }).join('');
  catRow.querySelectorAll('.cat-card').forEach(el=>{
    el.addEventListener('click', ()=>{
      const id = el.dataset.cat;
      state.activeCat = state.activeCat === id ? null : id;
      saveState();
      renderLibrary();
    });
  });
}

function timeAgoLabel(iso){
  const d = new Date(iso);
  const months=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  const hh=String(d.getHours()).padStart(2,'0');
  const mm=String(d.getMinutes()).padStart(2,'0');
  return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

function renderMemoGrid(){
  const q = librarySearch.value.trim().toLowerCase();
  let list = [...state.memos].sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  if(state.activeCat) list = list.filter(m=>m.category===state.activeCat);
  if(q) list = list.filter(m => (m.title+' '+m.summary+' '+m.transcript).toLowerCase().includes(q));

  document.getElementById('recentCount').textContent = list.length;
  memoGrid.innerHTML = list.map(m=>{
    const statusHtml = m.analyzed
      ? `<div class="memo-status analyzed">${escapeHtml(m.summary || 'Analysé')}</div>`
      : `<div class="memo-status">✨ Non analysé — touchez pour lancer l'IA</div>`;
    const tag = m.category ? `<span class="cat-tag ${m.category}">${CATS.find(c=>c.id===m.category)?.name||''}</span>` : '';
    return `<div class="memo-card" data-id="${m.id}">
      <div class="memo-play">▶</div>
      <div class="memo-meta">${timeAgoLabel(m.createdAt)}</div>
      <div class="memo-title">${escapeHtml(m.title)}</div>
      ${statusHtml}
      ${tag}
    </div>`;
  }).join('');

  memoGrid.hidden = list.length===0;
  libraryEmpty.hidden = list.length>0 || state.memos.length>0;
  if(state.memos.length>0 && list.length===0){
    libraryEmpty.hidden = false;
    document.getElementById('libraryEmpty').querySelector('.empty-title').textContent = 'Aucun résultat';
    document.getElementById('libraryEmpty').querySelector('.empty-caption').textContent = 'Essayez une autre recherche ou catégorie.';
  } else if(state.memos.length===0){
    document.getElementById('libraryEmpty').querySelector('.empty-title').textContent = 'Aucun mémo';
    document.getElementById('libraryEmpty').querySelector('.empty-caption').textContent = 'Appuyez sur le micro pour enregistrer votre premier mémo.';
  }

  memoGrid.querySelectorAll('.memo-card').forEach(el=>{
    el.addEventListener('click', ()=> openDetail(el.dataset.id));
  });
}

function renderLibrary(){
  renderCatRow();
  renderMemoGrid();
  document.getElementById('sortCount').textContent = state.memos.length;
}
librarySearch.addEventListener('input', renderMemoGrid);

document.getElementById('btnSort').addEventListener('click', ()=>{
  state.memos.forEach(m=>{ if(!m.category) m.category = guessCategory(m.transcript + ' ' + m.title); });
  saveState();
  renderLibrary();
});

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ============ MEMO ANALYSIS (mock local IA) ============ */
function guessCategory(text){
  const t = text.toLowerCase();
  if(/(client|réunion|projet|facture|deadline|équipe|contrat|boulot|travail|rendez-vous pro)/.test(t)) return 'pro';
  if(/(enfant|famille|maison|anniversaire|papa|maman|fils|fille|vacances en famille)/.test(t)) return 'famille';
  return 'perso';
}
function summarize(text){
  if(!text || text.trim().length < 3) return "Mémo vocal sans contenu détecté.";
  const clean = text.trim().replace(/\s+/g,' ');
  const sentence = clean.split(/(?<=[.!?])\s/)[0] || clean;
  return sentence.length > 140 ? sentence.slice(0,140)+'…' : sentence;
}
function detectActions(text){
  const t = (text||'').toLowerCase();
  const actions = [];
  if(/(appel|téléphon)/.test(t)) actions.push('📞 Appeler');
  if(/(email|e-mail|mail à|écrire à)/.test(t)) actions.push('📧 Envoyer un e-mail');
  if(/(message|texto|sms|whatsapp)/.test(t)) actions.push('💬 Envoyer un message');
  if(/(rendez-vous|réunion|rdv|demain|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|agenda)/.test(t)) actions.push('🗓️ Ajouter à l\'agenda');
  if(actions.length===0) actions.push('📝 Archiver dans la bibliothèque');
  return actions;
}
function guessTitle(text){
  if(!text || text.trim().length<3) return 'Nouveau mémo';
  const words = text.trim().split(/\s+/).slice(0,6).join(' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function analyzeMemo(id){
  const m = state.memos.find(x=>x.id===id);
  if(!m) return;
  m.category = m.category || guessCategory(m.transcript);
  m.summary = summarize(m.transcript);
  m.actions = detectActions(m.transcript);
  if(m.title === 'Nouveau mémo' || !m.title) m.title = guessTitle(m.transcript);
  m.analyzed = true;
  saveState();
}

/* ============ DETAIL SHEET ============ */
const detailOverlay = document.getElementById('detailOverlay');
let detailId = null;

function openDetail(id){
  detailId = id;
  const m = state.memos.find(x=>x.id===id);
  if(!m) return;
  document.getElementById('detailDate').textContent = timeAgoLabel(m.createdAt);
  const badge = document.getElementById('detailCatBadge');
  if(m.category){
    badge.hidden = false;
    badge.className = 'cat-badge '+m.category;
    badge.textContent = CATS.find(c=>c.id===m.category)?.name || '';
  } else { badge.hidden = true; badge.textContent=''; }
  document.getElementById('detailTitle').textContent = m.title;
  document.getElementById('detailStatus').textContent = m.analyzed ? '✨ Analysé par l\'IA' : '✨ Non analysé — touchez pour lancer l\'IA';
  document.getElementById('detailTranscript').textContent = m.transcript || '(aucune transcription)';

  const sumBlock = document.getElementById('detailSummaryBlock');
  const actBlock = document.getElementById('detailActionsBlock');
  if(m.analyzed){
    sumBlock.hidden = false;
    document.getElementById('detailSummary').textContent = m.summary;
    actBlock.hidden = false;
    document.getElementById('detailActions').innerHTML = (m.actions||[]).map(a=>`<span class="action-chip">${escapeHtml(a)}</span>`).join('');
  } else {
    sumBlock.hidden = true; actBlock.hidden = true;
  }
  document.getElementById('btnAnalyze').hidden = m.analyzed;
  detailOverlay.hidden = false;
}
document.getElementById('detailClose').addEventListener('click', ()=> detailOverlay.hidden = true);
detailOverlay.addEventListener('click', (e)=>{ if(e.target===detailOverlay) detailOverlay.hidden = true; });
document.getElementById('btnAnalyze').addEventListener('click', ()=>{
  const btn = document.getElementById('btnAnalyze');
  btn.textContent = '✨ Analyse en cours…';
  btn.disabled = true;
  setTimeout(()=>{
    analyzeMemo(detailId);
    btn.disabled = false;
    openDetail(detailId);
    renderLibrary();
  }, 900);
});

/* ============ AGENDA ============ */
function renderAgenda(){
  const now = new Date();
  document.getElementById('agendaTitle').textContent = "Aujourd'hui";
  const todays = state.memos.filter(m=> sameDay(new Date(m.createdAt), now));
  document.getElementById('agendaSub').textContent = todays.length ? `${todays.length} mémo${todays.length>1?'s':''} aujourd'hui` : "Rien de prévu aujourd'hui";

  renderCalendar(now);

  const list = document.getElementById('agendaList');
  const empty = document.getElementById('agendaEmpty');
  if(todays.length===0){
    list.hidden = true; empty.hidden = false;
  } else {
    empty.hidden = true; list.hidden = false;
    list.innerHTML = todays.map(m=>{
      const actions = m.analyzed ? (m.actions||[]).join(' · ') : "Non analysé";
      return `<div class="agenda-item">
        <div class="dot-ind"></div>
        <div>
          <div class="agenda-item-title">${escapeHtml(m.title)}</div>
          <div class="agenda-item-sub">${actions}</div>
        </div>
      </div>`;
    }).join('');
  }
}
function sameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

function renderCalendar(refDate){
  const cal = document.getElementById('calendar');
  const year = refDate.getFullYear(), month = refDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay()+6)%7; // Monday=0
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const dow = ['L','M','M','J','V','S','D'];
  let html = `<div class="cal-row">${dow.map(d=>`<div class="cal-dow">${d}</div>`).join('')}</div>`;

  const cells = [];
  for(let i=startOffset-1;i>=0;i--) cells.push({d:daysInPrevMonth-i, other:true});
  for(let d=1;d<=daysInMonth;d++) cells.push({d, other:false});
  let nextD = 1;
  while(cells.length % 7 !== 0) cells.push({d:nextD++, other:true});

  const eventDays = new Set(state.memos.map(m=>{
    const dt = new Date(m.createdAt);
    return dt.getMonth()===month && dt.getFullYear()===year ? dt.getDate() : null;
  }).filter(Boolean));

  const today = new Date();
  const isCurMonth = today.getMonth()===month && today.getFullYear()===year;

  let row = '';
  cells.forEach((c,i)=>{
    const isToday = !c.other && isCurMonth && c.d===today.getDate();
    const hasEvent = !c.other && eventDays.has(c.d);
    row += `<div class="cal-day ${c.other?'other':''} ${isToday?'today':''} ${hasEvent?'has-event':''}">
      <span class="num">${c.d}</span>
      <div class="dot" style="${hasEvent||isToday?'':'visibility:hidden'}"></div>
    </div>`;
    if((i+1)%7===0){ html += `<div class="cal-row">${row}</div>`; row=''; }
  });
  cal.innerHTML = html;
}

/* ============ STORE ============ */
let storeFilter = 'tout';
function renderStoreFilters(){
  document.getElementById('storeFilters').innerHTML = FILTERS.map(f=>
    `<button class="chip ${storeFilter===f.id?'active':''}" data-f="${f.id}">${f.label}</button>`
  ).join('');
  document.querySelectorAll('#storeFilters .chip').forEach(el=>{
    el.addEventListener('click', ()=>{ storeFilter = el.dataset.f; renderStore(); });
  });
}
function extCard(e){
  const statusHtml = e.status==='active'
    ? `<div class="ext-status"><span class="status-dot active"></span>Active</div>`
    : e.status==='pending'
      ? `<div class="ext-status" style="color:var(--amber)"><span class="status-dot pending"></span>À connecter</div>`
      : '';
  let btn = '';
  if(e.installed){
    if(e.status==='active') btn = `<button class="ext-btn connected" data-id="${e.id}" data-act="toggle">✓ Connecté</button>`;
    else btn = `<button class="ext-btn" data-id="${e.id}" data-act="connect">Connecter</button>`;
  } else {
    btn = `<button class="ext-btn" data-id="${e.id}" data-act="install">+ Installer</button>`;
  }
  return `<div class="ext-card">
    <div class="ext-top">
      <div class="ext-icon">${e.icon}</div>
      <span class="ext-check">${e.status==='active'?'✅':''}</span>
    </div>
    <div>
      <div class="ext-name">${e.name}</div>
      <div class="ext-desc">${e.desc}</div>
    </div>
    ${statusHtml}
    ${btn}
  </div>`;
}
function renderStore(){
  renderStoreFilters();
  const q = document.getElementById('storeSearch').value.trim().toLowerCase();
  let list = state.extensions.filter(e => storeFilter==='tout' || e.cat===storeFilter);
  if(q) list = list.filter(e => e.name.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q));

  const installed = list.filter(e=>e.installed);
  const discover = list.filter(e=>!e.installed);
  document.getElementById('installedCount').textContent = installed.length;
  document.getElementById('discoverCount').textContent = discover.length;
  document.getElementById('installedGrid').innerHTML = installed.map(extCard).join('') || `<div class="empty-caption">Aucune extension installée.</div>`;
  document.getElementById('discoverGrid').innerHTML = discover.map(extCard).join('');

  document.querySelectorAll('.ext-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id, act = btn.dataset.act;
      const ext = state.extensions.find(e=>e.id===id);
      if(act==='install'){
        ext.installed = true; ext.status = 'pending';
        saveState(); renderStore();
      } else if(act==='connect'){
        btn.textContent = 'Connexion…'; btn.classList.add('loading'); btn.disabled = true;
        setTimeout(()=>{ ext.status='active'; saveState(); renderStore(); }, 1100);
      } else if(act==='toggle'){
        ext.status='pending'; saveState(); renderStore();
      }
    });
  });
}
document.getElementById('storeSearch').addEventListener('input', renderStore);

/* ============ MAP ============ */
let map, mapInited=false, addModeOn=false, reminderMarkers=[];
function initMapIfNeeded(){
  if(mapInited) return;
  mapInited = true;
  map = L.map('mapEl', { zoomControl:false, attributionControl:true }).setView([48.85, 5], 5);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);

  map.on('click', (e)=>{
    if(!addModeOn) return;
    const label = prompt('Nom du rappel de lieu ?');
    if(label){
      state.reminders.push({ id: 'r'+Date.now(), name: label, lat: e.latlng.lat, lng: e.latlng.lng });
      saveState();
      renderReminders();
    }
    addModeOn = false;
    document.getElementById('btnAddReminder').style.filter = '';
  });

  renderReminders();
}

document.getElementById('btnLocate').addEventListener('click', ()=>{
  if(!navigator.geolocation){ alert('Géolocalisation non disponible.'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    const { latitude, longitude } = pos.coords;
    map.setView([latitude, longitude], 13);
    L.circleMarker([latitude, longitude], { radius:8, color:'#cb9b2e', fillColor:'#cb9b2e', fillOpacity:1 }).addTo(map)
      .bindPopup('Vous êtes ici').openPopup();
  }, err=>{
    alert("Impossible d'obtenir votre position: " + err.message);
  });
});

document.getElementById('btnAddReminder').addEventListener('click', (e)=>{
  addModeOn = !addModeOn;
  e.currentTarget.style.filter = addModeOn ? 'brightness(0.85)' : '';
  if(addModeOn) alert('Touchez un point sur la carte pour poser un rappel de lieu.');
});

function renderReminders(){
  reminderMarkers.forEach(m=>map.removeLayer(m));
  reminderMarkers = [];
  state.reminders.forEach(r=>{
    const marker = L.marker([r.lat, r.lng]).addTo(map).bindPopup(escapeHtml(r.name));
    reminderMarkers.push(marker);
  });
  document.getElementById('reminderSub').textContent = state.reminders.length
    ? `${state.reminders.length} lieu${state.reminders.length>1?'x':''} enregistré${state.reminders.length>1?'s':''}`
    : 'Aucun lieu enregistré';
  document.getElementById('reminderList').innerHTML = state.reminders.map(r=>
    `<div class="reminder-item"><span class="reminder-name">📍 ${escapeHtml(r.name)}</span><button class="reminder-del" data-id="${r.id}">✕</button></div>`
  ).join('');
  document.querySelectorAll('.reminder-del').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      state.reminders = state.reminders.filter(r=>r.id!==btn.dataset.id);
      saveState(); renderReminders();
    });
  });
}

let sheetExpanded = false;
document.getElementById('mapSheetToggle').addEventListener('click', ()=>{
  sheetExpanded = !sheetExpanded;
  document.getElementById('reminderList').hidden = !sheetExpanded;
  document.getElementById('sheetChevron').textContent = sheetExpanded ? '⌄' : '⌃';
});

/* ============ RECORDING ============ */
const recordOverlay = document.getElementById('recordOverlay');
const recTimer = document.getElementById('recTimer');
const transcriptText = document.getElementById('transcriptText');
const waveBars = document.getElementById('waveBars');

let recognizer = null;
let mediaStream = null;
let audioCtx = null, analyser = null, meterRAF = null;
let recStartTime = null, recElapsed = 0, timerInterval = null, isPaused = false;
let finalTranscript = '';

// build wave bars
for(let i=0;i<40;i++){ const s=document.createElement('span'); s.style.height='6px'; waveBars.appendChild(s); }

function openRecordOverlay(){
  recordOverlay.hidden = false;
  finalTranscript = '';
  transcriptText.textContent = '';
  transcriptText.className = 'transcript-placeholder';
  transcriptText.textContent = 'Parlez… la transcription s\'affiche ici';
  recElapsed = 0; isPaused = false;
  recTimer.textContent = '00:00';
  document.getElementById('recStatusLabel').textContent = 'ENREGISTREMENT';
  document.getElementById('pauseLabel').textContent = 'Pause';
  startRecording();
}

function closeRecordOverlay(){
  stopRecording();
  recordOverlay.hidden = true;
}

function startRecording(){
  recStartTime = Date.now() - recElapsed*1000;
  timerInterval = setInterval(()=>{
    if(isPaused) return;
    recElapsed = Math.floor((Date.now()-recStartTime)/1000);
    const mm = String(Math.floor(recElapsed/60)).padStart(2,'0');
    const ss = String(recElapsed%60).padStart(2,'0');
    recTimer.textContent = `${mm}:${ss}`;
  }, 250);

  // mic meter
  navigator.mediaDevices?.getUserMedia({ audio:true }).then(stream=>{
    mediaStream = stream;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const source = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);
    const data = new Uint8Array(analyser.frequencyBinCount);
    const bars = waveBars.children;
    function tick(){
      analyser.getByteFrequencyData(data);
      for(let i=0;i<bars.length;i++){
        const v = data[Math.floor(i * data.length / bars.length)] || 0;
        bars[i].style.height = Math.max(6, (isPaused?6:(v/255)*26)) + 'px';
      }
      meterRAF = requestAnimationFrame(tick);
    }
    tick();
  }).catch(()=>{ /* mic denied: keep UI functional without meter */ });

  // speech recognition
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if(SR){
    recognizer = new SR();
    recognizer.lang = 'fr-FR';
    recognizer.continuous = true;
    recognizer.interimResults = true;
    recognizer.onresult = (event)=>{
      let interim = '';
      for(let i=event.resultIndex;i<event.results.length;i++){
        const t = event.results[i][0].transcript;
        if(event.results[i].isFinal) finalTranscript += t + ' ';
        else interim += t;
      }
      const full = (finalTranscript + interim).trim();
      transcriptText.className = '';
      transcriptText.textContent = full || '…';
    };
    recognizer.onerror = ()=>{};
    recognizer.onend = ()=>{
      if(!recordOverlay.hidden && !isPaused){
        try{ recognizer.start(); }catch(e){}
      }
    };
    try{ recognizer.start(); }catch(e){}
  } else {
    transcriptText.textContent = "Reconnaissance vocale non disponible dans ce navigateur — vous pourrez éditer le texte manuellement après.";
  }
}

function stopRecording(){
  clearInterval(timerInterval);
  if(recognizer){ try{ recognizer.onend=null; recognizer.stop(); }catch(e){} recognizer=null; }
  if(meterRAF) cancelAnimationFrame(meterRAF);
  if(audioCtx){ try{ audioCtx.close(); }catch(e){} audioCtx=null; }
  if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; }
}

document.getElementById('btnMic').addEventListener('click', openRecordOverlay);
document.getElementById('btnHeaderRecord').addEventListener('click', openRecordOverlay);

document.getElementById('btnCancel').addEventListener('click', ()=>{
  closeRecordOverlay();
});

document.getElementById('btnPause').addEventListener('click', (e)=>{
  isPaused = !isPaused;
  document.getElementById('pauseLabel').textContent = isPaused ? 'Reprendre' : 'Pause';
  document.getElementById('recStatusLabel').textContent = isPaused ? 'EN PAUSE' : 'ENREGISTREMENT';
  if(isPaused){
    if(recognizer){ try{ recognizer.stop(); }catch(err){} }
  } else {
    recStartTime = Date.now() - recElapsed*1000;
    if(recognizer){ try{ recognizer.start(); }catch(err){} }
  }
});

document.getElementById('btnFinish').addEventListener('click', ()=>{
  const transcript = (finalTranscript || (transcriptText.className==='' ? transcriptText.textContent : '')).trim();
  stopRecording();
  const memo = {
    id: 'm'+Date.now(),
    title: guessTitle(transcript),
    transcript,
    summary: '',
    actions: [],
    category: null,
    analyzed: false,
    createdAt: new Date().toISOString(),
    duration: recElapsed,
  };
  state.memos.push(memo);
  saveState();
  recordOverlay.hidden = true;
  showView('library');
  renderLibrary();
});

/* ============ INIT ============ */
showView('library');

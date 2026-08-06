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

/* ============ AUDIO STORAGE (IndexedDB) ============ */
const AUDIO_DB_NAME = 'rick_audio_db';
const AUDIO_STORE = 'audio';
function openAudioDB(){
  return new Promise((resolve, reject)=>{
    const req = indexedDB.open(AUDIO_DB_NAME, 1);
    req.onupgradeneeded = ()=>{ req.result.createObjectStore(AUDIO_STORE); };
    req.onsuccess = ()=>resolve(req.result);
    req.onerror = ()=>reject(req.error);
  });
}
function saveAudioBlob(id, blob){
  return openAudioDB().then(db=> new Promise((resolve, reject)=>{
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    tx.objectStore(AUDIO_STORE).put(blob, id);
    tx.oncomplete = ()=>resolve();
    tx.onerror = ()=>reject(tx.error);
  }));
}
function getAudioBlob(id){
  return openAudioDB().then(db=> new Promise((resolve, reject)=>{
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const req = tx.objectStore(AUDIO_STORE).get(id);
    req.onsuccess = ()=>resolve(req.result || null);
    req.onerror = ()=>reject(req.error);
  }));
}

/* ============ PLAYBACK ============ */
const playerAudio = new Audio();
let playingId = null;
function setPlayIcon(id, playing){
  document.querySelectorAll(`[data-play-id="${id}"]`).forEach(btn=>{ btn.textContent = playing ? '⏸' : '▶'; });
}
playerAudio.addEventListener('ended', ()=>{ if(playingId){ setPlayIcon(playingId, false); playingId = null; } });
playerAudio.addEventListener('pause', ()=>{ if(playingId){ setPlayIcon(playingId, false); } });

function togglePlay(id){
  if(playingId === id && !playerAudio.paused){ playerAudio.pause(); return; }
  getAudioBlob(id).then(blob=>{
    if(!blob){ alert("Pas d'enregistrement audio disponible pour ce mémo."); return; }
    playerAudio.pause();
    playerAudio.src = URL.createObjectURL(blob);
    playingId = id;
    playerAudio.play();
    setPlayIcon(id, true);
  });
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
    el.addEventListener('dragover', (e)=>{
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      el.classList.add('drag-over');
    });
    el.addEventListener('dragleave', ()=>{ el.classList.remove('drag-over'); });
    el.addEventListener('drop', (e)=>{
      e.preventDefault();
      el.classList.remove('drag-over');
      const memoId = e.dataTransfer.getData('text/plain');
      if(memoId) assignMemoCategory(memoId, el.dataset.cat);
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
    const statusHtml = m.transcribing
      ? `<div class="memo-status transcribing">⏳ Transcription en cours (Whisper local)…</div>`
      : m.analyzed
        ? `<div class="memo-status analyzed">${escapeHtml(m.summary || 'Analysé')}</div>`
        : m.whisperFailed
          ? `<div class="memo-status">⚠️ Whisper local injoignable — transcription micro utilisée. Touchez pour lancer l'IA</div>`
          : `<div class="memo-status">✨ Non analysé — touchez pour lancer l'IA</div>`;
    const tag = m.category ? `<span class="cat-tag ${m.category}">${CATS.find(c=>c.id===m.category)?.name||''}</span>` : '';
    const playIcon = playingId===m.id && !playerAudio.paused ? '⏸' : '▶';
    return `<div class="memo-card" data-id="${m.id}" draggable="true">
      <div class="memo-play" data-play-id="${m.id}" ${m.hasAudio ? '' : 'data-nodata="1"'}>${playIcon}</div>
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
    el.addEventListener('dragstart', (e)=>{
      e.dataTransfer.setData('text/plain', el.dataset.id);
      e.dataTransfer.effectAllowed = 'move';
      el.classList.add('dragging');
    });
    el.addEventListener('dragend', ()=>{ el.classList.remove('dragging'); });
  });
  memoGrid.querySelectorAll('.memo-play').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const id = btn.dataset.playId;
      const m = state.memos.find(x=>x.id===id);
      if(!m || !m.hasAudio){ alert("Pas d'enregistrement audio disponible pour ce mémo."); return; }
      togglePlay(id);
    });
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

function assignMemoCategory(memoId, catId){
  const m = state.memos.find(x=>x.id===memoId);
  if(!m) return;
  m.category = m.category === catId ? null : catId;
  saveState();
  renderLibrary();
  if(detailId===memoId && !detailOverlay.hidden) openDetail(memoId);
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
  document.getElementById('detailStatus').textContent = m.transcribing
    ? '⏳ Transcription en cours (Whisper local)…'
    : m.analyzed
      ? '✨ Analysé par l\'IA'
      : m.whisperFailed
        ? '⚠️ Whisper local injoignable — transcription micro utilisée'
        : '✨ Non analysé — touchez pour lancer l\'IA';
  const dt = document.getElementById('detailTranscript');
  dt.textContent = m.transcript || (m.transcribing ? '…' : '(aucune transcription — touchez pour en écrire une)');

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

  const playBtn = document.getElementById('btnDetailPlay');
  playBtn.dataset.playId = m.id;
  playBtn.textContent = playingId===m.id && !playerAudio.paused ? '⏸' : '▶';
  playBtn.style.opacity = m.hasAudio ? '1' : '.4';

  const analyzeBtn = document.getElementById('btnAnalyze');
  analyzeBtn.hidden = m.transcribing;
  analyzeBtn.textContent = m.analyzed ? "🔁 Ré-analyser" : "✨ Lancer l'analyse IA";
  detailOverlay.hidden = false;
}
document.getElementById('detailClose').addEventListener('click', ()=> detailOverlay.hidden = true);
detailOverlay.addEventListener('click', (e)=>{ if(e.target===detailOverlay) detailOverlay.hidden = true; });

document.getElementById('btnDetailPlay').addEventListener('click', ()=>{
  const m = state.memos.find(x=>x.id===detailId);
  if(!m || !m.hasAudio){ alert("Pas d'enregistrement audio disponible pour ce mémo."); return; }
  togglePlay(detailId);
});

document.getElementById('detailTranscript').addEventListener('blur', ()=>{
  const m = state.memos.find(x=>x.id===detailId);
  if(!m) return;
  const newText = document.getElementById('detailTranscript').textContent.trim();
  const placeholder = newText === '(aucune transcription — touchez pour en écrire une)';
  const finalText = placeholder ? '' : newText;
  if(finalText !== m.transcript){
    m.transcript = finalText;
    saveState();
  }
});

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
const WHISPER_URL = 'http://127.0.0.1:5959';

const recordOverlay = document.getElementById('recordOverlay');
const recTimer = document.getElementById('recTimer');
const transcriptText = document.getElementById('transcriptText');
const waveBars = document.getElementById('waveBars');
const btnTabAudio = document.getElementById('btnTabAudio');

let recognizer = null;
let mediaStream = null;       // mic stream
let displayStream = null;     // tab/screen audio stream (visio)
let audioCtx = null, analyser = null, meterRAF = null;
let mediaRecorder = null, recordedChunks = [], recordedMimeType = '';
let recStartTime = null, recElapsed = 0, timerInterval = null, isPaused = false;
let finalTranscript = '';
let includeTabAudio = false;
let whisperAvailable = null; // cached health check result

// build wave bars
for(let i=0;i<40;i++){ const s=document.createElement('span'); s.style.height='6px'; waveBars.appendChild(s); }

function pickRecorderMimeType(){
  if(!window.MediaRecorder || !MediaRecorder.isTypeSupported) return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mp4;codecs=mp4a.40.2',
    'audio/ogg;codecs=opus',
  ];
  for(const type of candidates){
    if(MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}
function extForMimeType(type){
  if(!type) return 'webm';
  if(type.includes('mp4')) return 'mp4';
  if(type.includes('ogg')) return 'ogg';
  return 'webm';
}

// transcript is always editable — lets users type/correct when live recognition
// is unavailable (e.g. Safari has no Web Speech support) or wrong
transcriptText.contentEditable = 'true';
transcriptText.addEventListener('focus', ()=>{
  if(transcriptText.classList.contains('transcript-placeholder')){
    transcriptText.textContent = '';
    transcriptText.classList.remove('transcript-placeholder');
  }
});
transcriptText.addEventListener('input', ()=>{
  finalTranscript = transcriptText.textContent;
});

function checkWhisperServer(){
  return fetch(WHISPER_URL + '/health', { mode:'cors' })
    .then(r=>r.ok)
    .catch(()=>false)
    .then(ok=>{ whisperAvailable = ok; return ok; });
}
checkWhisperServer();

btnTabAudio.addEventListener('click', ()=>{
  includeTabAudio = !includeTabAudio;
  btnTabAudio.classList.toggle('active', includeTabAudio);
  document.getElementById('tabAudioLabel').textContent = includeTabAudio
    ? "Visio incluse — le partage sera demandé au démarrage"
    : "Inclure le son d'un onglet (visio)";
});

function openRecordOverlay(){
  recordOverlay.hidden = false;
  finalTranscript = '';
  recordedChunks = [];
  recordedMimeType = '';
  transcriptText.textContent = '';
  transcriptText.className = 'transcript-placeholder';
  transcriptText.textContent = 'Parlez… la transcription s\'affiche ici';
  recElapsed = 0; isPaused = false;
  recTimer.textContent = '00:00';
  document.getElementById('recStatusLabel').textContent = 'ENREGISTREMENT';
  document.getElementById('pauseLabel').textContent = 'Pause';
  btnTabAudio.disabled = false;
  startRecording();
}

function closeRecordOverlay(){
  stopRecording();
  recordOverlay.hidden = true;
}

function startRecording(){
  btnTabAudio.disabled = true;
  recStartTime = Date.now() - recElapsed*1000;
  timerInterval = setInterval(()=>{
    if(isPaused) return;
    recElapsed = Math.floor((Date.now()-recStartTime)/1000);
    const mm = String(Math.floor(recElapsed/60)).padStart(2,'0');
    const ss = String(recElapsed%60).padStart(2,'0');
    recTimer.textContent = `${mm}:${ss}`;
  }, 250);

  const wantTabAudio = includeTabAudio;

  const micPromise = navigator.mediaDevices?.getUserMedia({ audio:true }) || Promise.reject(new Error('no getUserMedia'));
  const displayPromise = wantTabAudio
    ? navigator.mediaDevices.getDisplayMedia({ video:true, audio:true }).catch(()=>null)
    : Promise.resolve(null);

  Promise.all([micPromise, displayPromise]).then(([mic, display])=>{
    mediaStream = mic;
    displayStream = display && display.getAudioTracks().length ? display : null;
    if(wantTabAudio && !displayStream){
      document.getElementById('tabAudioLabel').textContent = "Son d'onglet indisponible (annulé ou pas d'audio partagé) — micro seul utilisé";
    }
    if(display && !displayStream){
      display.getTracks().forEach(t=>t.stop());
    }

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const micSource = audioCtx.createMediaStreamSource(mic);

    // meter (mic only, for a responsive visual)
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    micSource.connect(analyser);
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

    // mix mic (+ tab audio if present) into one recordable stream
    const dest = audioCtx.createMediaStreamDestination();
    micSource.connect(dest);
    if(displayStream){
      const displaySource = audioCtx.createMediaStreamSource(displayStream);
      displaySource.connect(dest);
    }

    try{
      recordedMimeType = pickRecorderMimeType();
      mediaRecorder = recordedMimeType
        ? new MediaRecorder(dest.stream, { mimeType: recordedMimeType })
        : new MediaRecorder(dest.stream); // let the browser pick (e.g. Safari has no webm support)
      recordedMimeType = mediaRecorder.mimeType || recordedMimeType;
      mediaRecorder.ondataavailable = (e)=>{ if(e.data && e.data.size>0) recordedChunks.push(e.data); };
      mediaRecorder.start();
    }catch(e){ mediaRecorder = null; }
  }).catch(()=>{ /* mic denied: keep UI functional without meter/recording */ });

  // speech recognition — live preview, mic only (Web Speech API cannot listen to a custom stream)
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
    recognizer.onerror = (e)=>{
      if((e.error==='not-allowed' || e.error==='service-not-allowed') && transcriptText.classList.contains('transcript-placeholder')){
        transcriptText.textContent = "Micro refusé pour la reconnaissance vocale — écrivez votre texte ici, ou réessayez avec Whisper local activé.";
      }
    };
    recognizer.onend = ()=>{
      if(!recordOverlay.hidden && !isPaused){
        try{ recognizer.start(); }catch(e){}
      }
    };
    try{ recognizer.start(); }catch(e){}
  } else {
    transcriptText.textContent = "Reconnaissance vocale live non disponible dans ce navigateur (essayez Chrome) — écrivez votre texte ici, ou activez Whisper local pour une transcription automatique après l'enregistrement.";
  }
}

function releaseMediaResources(){
  if(mediaRecorder && mediaRecorder.state !== 'inactive'){ try{ mediaRecorder.stop(); }catch(e){} }
  mediaRecorder = null;
  if(audioCtx){ try{ audioCtx.close(); }catch(e){} audioCtx=null; }
  if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; }
  if(displayStream){ displayStream.getTracks().forEach(t=>t.stop()); displayStream=null; }
}

function stopRecording(){
  clearInterval(timerInterval);
  if(recognizer){ try{ recognizer.onend=null; recognizer.stop(); }catch(e){} recognizer=null; }
  if(meterRAF) cancelAnimationFrame(meterRAF);
  releaseMediaResources();
}

// Stops the recorder and waits for its real 'stop' event (with the final
// chunk flushed) before tearing down the audio graph — a fixed setTimeout
// guess was racing MediaRecorder's own flush on some browsers (e.g. Brave),
// silently dropping the last chunk and leaving the memo with no audio.
function stopRecorderAndGetBlob(){
  clearInterval(timerInterval);
  if(recognizer){ try{ recognizer.onend=null; recognizer.stop(); }catch(e){} recognizer=null; }
  if(meterRAF) cancelAnimationFrame(meterRAF);

  const rec = mediaRecorder;
  const chunks = recordedChunks;
  const type = recordedMimeType || 'audio/webm';

  if(!rec || rec.state === 'inactive'){
    releaseMediaResources();
    return Promise.resolve(null);
  }

  return new Promise((resolve)=>{
    const finish = ()=>{
      releaseMediaResources();
      resolve(chunks.length ? new Blob(chunks, { type }) : null);
    };
    rec.addEventListener('stop', finish, { once:true });
    try{ rec.stop(); }catch(e){ finish(); }
  });
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
    if(mediaRecorder && mediaRecorder.state==='recording'){ try{ mediaRecorder.pause(); }catch(err){} }
  } else {
    recStartTime = Date.now() - recElapsed*1000;
    if(recognizer){ try{ recognizer.start(); }catch(err){} }
    if(mediaRecorder && mediaRecorder.state==='paused'){ try{ mediaRecorder.resume(); }catch(err){} }
  }
});

function transcribeWithWhisper(memoId, blob, ext){
  const form = new FormData();
  form.append('audio', blob, 'memo.' + (ext || 'webm'));
  return fetch(WHISPER_URL + '/transcribe', { method:'POST', body: form })
    .then(r=>{ if(!r.ok) throw new Error('server error'); return r.json(); })
    .then(data=>{
      const m = state.memos.find(x=>x.id===memoId);
      if(!m) return;
      if(data.text){
        m.transcript = data.text;
        if(m.title === 'Nouveau mémo' || !m.title) m.title = guessTitle(data.text);
      }
      m.transcribing = false;
      m.whisperFailed = false;
      saveState();
      if(currentView==='library') renderLibrary();
      if(detailId===memoId && !detailOverlay.hidden) openDetail(memoId);
    })
    .catch(()=>{
      const m = state.memos.find(x=>x.id===memoId);
      if(!m) return;
      m.transcribing = false;
      m.whisperFailed = true;
      saveState();
      if(currentView==='library') renderLibrary();
      if(detailId===memoId && !detailOverlay.hidden) openDetail(memoId);
    });
}

document.getElementById('btnFinish').addEventListener('click', ()=>{
  const liveTranscript = transcriptText.classList.contains('transcript-placeholder') ? '' : transcriptText.textContent.trim();
  const usedMix = includeTabAudio && displayStream;
  const ext = extForMimeType(recordedMimeType || 'audio/webm');

  const memo = {
    id: 'm'+Date.now(),
    title: guessTitle(liveTranscript),
    transcript: liveTranscript,
    summary: '',
    actions: [],
    category: null,
    analyzed: false,
    transcribing: false,
    whisperFailed: false,
    usedTabAudio: !!usedMix,
    hasAudio: false,
    createdAt: new Date().toISOString(),
    duration: recElapsed,
  };

  recordOverlay.hidden = true;
  includeTabAudio = false;
  btnTabAudio.classList.remove('active');
  document.getElementById('tabAudioLabel').textContent = "Inclure le son d'un onglet (visio)";

  stopRecorderAndGetBlob().then(blob=>{
    if(blob && blob.size>0){
      memo.transcribing = true;
      state.memos.push(memo);
      saveState();
      showView('library');
      renderLibrary();
      saveAudioBlob(memo.id, blob).then(()=>{
        const m = state.memos.find(x=>x.id===memo.id);
        if(m){ m.hasAudio = true; saveState(); if(currentView==='library') renderLibrary(); }
      }).catch(()=>{});
      transcribeWithWhisper(memo.id, blob, ext);
    } else {
      state.memos.push(memo);
      saveState();
      showView('library');
      renderLibrary();
    }
  });
});

/* ============ INIT ============ */
showView('library');

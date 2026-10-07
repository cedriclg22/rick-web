/* ============ STATE ============ */
const STORE_KEY = 'rick_state_v1';

const DEFAULT_CATS = [
  { id:'pro',     name:'Pro',     icon:'💼', deco:'💼' },
  { id:'perso',   name:'Perso',   icon:'🧘', deco:'🧘' },
  { id:'famille', name:'Famille', icon:'❤️', deco:'❤️' },
];

const CUSTOM_CAT_PALETTE = [
  { bg:'#d8e8d0', ink:'#3f6b2c' },
  { bg:'#e0d6f2', ink:'#5b3c96' },
  { bg:'#f9dcc4', ink:'#a85b1e' },
  { bg:'#cfe8ec', ink:'#1d6b78' },
  { bg:'#f6d3e0', ink:'#a13d68' },
  { bg:'#e6e0c8', ink:'#7a6a1f' },
];

/* Catalogue des extensions.
   `cat` = famille d'usage (filtre du store) ; `pro` = professions pour
   lesquelles l'extension est pertinente, `null` = tout le monde.
   Aucun de ces éditeurs n'est partenaire à ce jour : les connecteurs métier
   sont annoncés « à venir », c'est ce que porte le statut 'soon'. */
// Logos officiels (sites des éditeurs, Simple Icons, Wikimedia), dans images/logos/.
const EXT_LOGOS = { apimo:'apimo.jpg', bigexpert:'bigexpert.png', bourgelat:'bourgelat.svg', calendar:'calendar.svg', doctolib:'doctolib.png', gmail:'gmail.svg', hektor:'hektor.png', hellodoc:'hellodoc.png', hubspot:'hubspot.svg', netsoins:'netsoins.jpg', netty:'netty.png', notion:'notion.png', o2s:'o2s.png', outlook:'outlook.jpg', sffsc:'sffsc.svg', shopify:'shopify.png', slack:'slack.svg', telegram:'telegram.png', titan:'titan.png', vetocom:'vetocom.png', vetup:'vetup.png', weda:'weda.png', whatsapp:'whatsapp.svg', woo:'woo.png' };
function extIcon(e){
  return EXT_LOGOS[e.id]
    ? `<img src="images/logos/${EXT_LOGOS[e.id]}" alt="" loading="lazy">`
    : e.icon;
}

const EXT_CATALOG = [
  { id:'gmail',    name:'Gmail',    icon:'📧', cat:'communication', pro:null, desc:"Envoyez un e-mail via Gmail.", installed:true,  status:'pending' },
  { id:'whatsapp', name:'WhatsApp', icon:'💬', cat:'communication', pro:null, desc:"Envoyez un message WhatsApp.", installed:true,  status:'active' },
  { id:'telegram', name:'Telegram', icon:'✈️', cat:'communication', pro:null, desc:"Envoyez un message Telegram.", installed:true,  status:'pending' },
  { id:'outlook',  name:'Outlook',  icon:'📨', cat:'communication', pro:null, desc:"Envoyez un e-mail via Outlook / Microsoft 365.", installed:false, status:'none' },
  { id:'slack',    name:'Slack',    icon:'✳️', cat:'communication', pro:null, desc:"Postez un message dans un canal Slack.", installed:false, status:'none' },
  { id:'calendar', name:'Google Agenda', icon:'📅', cat:'automatisation', pro:null, desc:"Créez des événements automatiquement.", installed:false, status:'none' },
  { id:'notion',   name:'Notion',   icon:'🗒️', cat:'automatisation', pro:null, desc:"Enregistrez vos notes dans Notion.", installed:false, status:'none' },

  // --- vétérinaire ---
  { id:'vetocom',  name:'Vetocom',  icon:'🐾', cat:'metier', pro:['veterinaire'], desc:"Compte rendu de consultation dans la fiche animal.", installed:false, status:'soon' },
  { id:'bourgelat',name:'Bourgelat',icon:'🐾', cat:'metier', pro:['veterinaire'], desc:"Anamnèse et examen poussés dans le dossier.", installed:false, status:'soon' },
  { id:'vetup',    name:'VetUp',    icon:'🐾', cat:'metier', pro:['veterinaire'], desc:"Synchronisation des consultations VetUp.", installed:false, status:'soon' },

  // --- santé ---
  { id:'weda',     name:'Weda',     icon:'🩺', cat:'metier', pro:['medecin'], desc:"Observation médicale déposée dans le dossier patient.", installed:false, status:'soon' },
  { id:'hellodoc', name:'HelloDoc', icon:'🩺', cat:'metier', pro:['medecin'], desc:"Compte rendu de consultation HelloDoc.", installed:false, status:'soon' },
  { id:'doctolib', name:'Doctolib', icon:'🩺', cat:'metier', pro:['medecin'], desc:"Rapprochement avec l'agenda Doctolib.", installed:false, status:'soon' },

  // --- EHPAD ---
  { id:'netsoins', name:'Netsoins', icon:'🏥', cat:'metier', pro:['ehpad'], desc:"Transmissions ciblées dans le dossier de liaison.", installed:false, status:'soon' },
  { id:'titan',    name:'Titan',    icon:'🏥', cat:'metier', pro:['ehpad'], desc:"Transmissions et relèves d'équipe Titan.", installed:false, status:'soon' },

  // --- immobilier ---
  { id:'hektor',   name:'Hektor',   icon:'🏠', cat:'metier', pro:['immobilier'], desc:"Critères client et compte rendu de visite dans Hektor.", installed:false, status:'soon' },
  { id:'apimo',    name:'Apimo',    icon:'🏠', cat:'metier', pro:['immobilier'], desc:"Fiche acquéreur Apimo mise à jour après la visite.", installed:false, status:'soon' },
  { id:'netty',    name:'Netty',    icon:'🏠', cat:'metier', pro:['immobilier'], desc:"Synchronisation des rendez-vous Netty.", installed:false, status:'soon' },

  // --- banque, assurance, patrimoine ---
  { id:'o2s',      name:'O2S (Harvest)', icon:'🏦', cat:'metier', pro:['banque'], desc:"Compte rendu d'entretien et rapport d'adéquation.", installed:false, status:'soon' },
  { id:'bigexpert',name:'Big Expert',    icon:'🏦', cat:'metier', pro:['banque'], desc:"Situation et objectifs client dans Big Expert.", installed:false, status:'soon' },
  { id:'sffsc',    name:'Salesforce FSC',icon:'🏦', cat:'metier', pro:['banque','ecommerce'], desc:"Mise à jour de la fiche client Salesforce.", installed:false, status:'soon' },

  // --- e-commerce et commerce ---
  { id:'shopify',  name:'Shopify',  icon:'🛒', cat:'metier', pro:['ecommerce','commerce'], desc:"Notes fournisseur et suivi commande dans Shopify.", installed:false, status:'soon' },
  { id:'woo',      name:'WooCommerce', icon:'🛒', cat:'metier', pro:['ecommerce'], desc:"Rapprochement des commandes WooCommerce.", installed:false, status:'soon' },
  { id:'hubspot',  name:'HubSpot',  icon:'🛒', cat:'metier', pro:['ecommerce','commerce','immobilier','banque'], desc:"Compte rendu d'appel poussé dans HubSpot.", installed:false, status:'soon' },
];

/* Professions proposées à l'inscription. L'ordre suit celui du <select>. */
const PROFESSIONS = [
  { id:'personnel',  label:'Usage personnel' },
  { id:'ecommerce',  label:'E-commerce' },
  { id:'veterinaire',label:'Vétérinaire' },
  { id:'medecin',    label:'Santé' },
  { id:'ehpad',      label:'EHPAD' },
  { id:'immobilier', label:'Immobilier' },
  { id:'banque',     label:'Banque & patrimoine' },
  { id:'commerce',   label:'Commerce' },
  { id:'autre',      label:'Autre' },
];
function professionLabel(id){
  const p = PROFESSIONS.find(x=>x.id===id);
  return p ? p.label : 'Autre';
}

const FILTERS = [
  { id:'tout', label:'Tout' },
  { id:'metier', label:'Métiers' },
  { id:'automatisation', label:'Automatisation' },
  { id:'communication', label:'Communication' },
];

/* ============ ÉTAT COURANT (miroir local du backend) ============
   Les données vivent dans Supabase (voir srv.js et supabase/schema.sql).
   Ici on garde un miroir en mémoire pour un rendu instantané : chaque
   modification met à jour le miroir, rafraîchit l'écran, puis part au serveur.
   C'est la RLS Postgres qui décide de ce qu'on reçoit : `state.categories` et
   `state.memos` ne contiennent déjà que ce que le compte a le droit de voir.
*/
let currentUser = null;   // ligne profiles du compte connecté
let userProfession = 'personnel';  // renseignée à l'inscription, sert au store
let team        = null;   // ligne teams, ou null
let members     = [];     // profils de l'équipe (admin uniquement en pratique)
let accessRows  = [];     // lignes category_access visibles

function blankState(){
  return {
    memos: [],
    reminders: [],
    extensions: JSON.parse(JSON.stringify(EXT_CATALOG)),
    categories: [],
    activeCat: null,
  };
}
let state = blankState();

/* Le filtre de catégorie actif est un confort d'affichage : il reste local. */
function prefKey(){ return 'rick_pref_' + (currentUser ? currentUser.id : 'anon'); }
/* Un mémo qui vient d'être enregistré ou importé doit se voir tout de suite :
   on lève le filtre de catégorie et la recherche qui le masqueraient, puis on
   le fait briller en haut de la liste. */
function revealNewMemo(id){
  const m = findMemo(id);
  if(state.activeCat && (!m || m.category !== state.activeCat)){
    state.activeCat = null;
    saveActiveCat();
  }
  if(chatInput.value.trim() && !chatAttached.length){
    chatInput.value = ''; chatAutosize(); chatSync();
  }
  showView('library');
  renderLibrary();
  requestAnimationFrame(()=>{
    const el = memoGrid.querySelector(`.memo-card[data-id="${id}"]`);
    if(!el) return;
    el.classList.add('is-new');
    el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    setTimeout(()=> el.classList.remove('is-new'), 2600);
  });
}

function saveActiveCat(){
  try{ localStorage.setItem(prefKey(), state.activeCat || ''); }catch(e){}
}
function loadActiveCat(){
  try{ return localStorage.getItem(prefKey()) || null; }catch(e){ return null; }
}

/* Remonte une erreur serveur à l'utilisateur sans casser l'écran. */
function reportError(err, context){
  console.error('[rick]', context || '', err);
  alert((context ? context + ' : ' : '') + (err && err.message ? err.message : 'erreur inconnue'));
}

/* ---- équipe, rôles, accès (miroir des règles appliquées par la RLS) ---- */
function myTeam(){ return team; }
function isAdmin(){ return !!currentUser && currentUser.role === 'admin'; }
function teamMembers(){ return members; }

function visibleCategories(){ return state.categories; }
function teamCategories(){ return state.categories.filter(c=>c.team); }
function findCategory(id){ return state.categories.find(c=>c.id===id) || null; }
function isTeamCat(id){ const c = findCategory(id); return !!(c && c.team); }

function allMemos(){ return state.memos; }
function findMemo(id){ return state.memos.find(m=>m.id===id) || null; }
function isTeamMemo(memo){ return !!(memo && memo.teamId); }

function memberHasAccess(memberId, catId){
  return accessRows.some(a=>a.profile_id===memberId && a.category_id===catId);
}

function catColorStyle(c){
  return c && c.color ? `style="background:${c.color.bg};color:${c.color.ink}"` : '';
}
function nextCustomColor(){
  const n = visibleCategories().filter(c=>c.custom).length;
  return CUSTOM_CAT_PALETTE[n % CUSTOM_CAT_PALETTE.length];
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
function getLocalAudioBlob(id){
  return openAudioDB().then(db=> new Promise((resolve, reject)=>{
    const tx = db.transaction(AUDIO_STORE, 'readonly');
    const req = tx.objectStore(AUDIO_STORE).get(id);
    req.onsuccess = ()=>resolve(req.result || null);
    req.onerror = ()=>reject(req.error);
  }));
}
/* IndexedDB sert de cache local ; la source de vérité est le bucket Supabase,
   pour qu'un mémo enregistré sur un appareil s'écoute depuis un autre. */
function getAudioBlob(id){
  return getLocalAudioBlob(id)
    .catch(()=>null)
    .then(local=>{
      if(local) return local;
      return srv.downloadAudio(id).then(remote=>{
        if(remote) saveAudioBlob(id, remote).catch(()=>{});
        return remote;
      }).catch(()=>null);
    });
}
function deleteAudioBlob(id){
  srv.removeAudio(id).catch(()=>{});
  return openAudioDB().then(db=> new Promise((resolve, reject)=>{
    const tx = db.transaction(AUDIO_STORE, 'readwrite');
    tx.objectStore(AUDIO_STORE).delete(id);
    tx.oncomplete = ()=>resolve();
    tx.onerror = ()=>reject(tx.error);
  }));
}

/* ============ PLAYBACK ============ */
const playerAudio = new Audio();
let playingId = null;
function setPlayIcon(id, playing){
  document.querySelectorAll(`[data-play-id="${id}"]`).forEach(btn=>{
    if(btn.id === 'btnDetailPlay'){   // lecteur de la fiche : on ne touche qu'à l'icône
      btn.classList.toggle('playing', playing);
      document.getElementById('detailPlayIcon').textContent = playing ? '❚❚' : '▶';
    } else btn.textContent = playing ? '⏸' : '▶';
  });
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
  document.body.dataset.view = name;   // le CSS affiche la saisie du chat selon l'onglet
  if(typeof renderAttach === 'function') renderAttach();   // texte d'aide selon l'onglet
  views.forEach(v=>v.classList.toggle('active', v.id === 'view-'+name));
  navBtns.forEach(b=>b.classList.toggle('active', b.dataset.view === name));
  if(name === 'map') initMapIfNeeded();
  if(name === 'agenda') renderAgenda();
  if(name === 'library') renderLibrary();
  if(name === 'store') renderStore();
  if(name === 'chat') setTimeout(()=> chatInput.focus(), 0);
}
navBtns.forEach(b=> b.addEventListener('click', ()=> showView(b.dataset.view)));

/* ============ DEMANDER À RICK ============ */
const chatList   = document.getElementById('chatList');
const chatScroll = document.getElementById('chatScroll');
const chatForm   = document.getElementById('chatForm');
const chatInput  = document.getElementById('chatInput');
const chatSend   = document.getElementById('chatSend');
const chatReset  = document.getElementById('chatReset');
const chatIntro  = document.getElementById('chatIntro');
let chatHistory = [];     // [{role:'user'|'assistant', content, memoIds?}]
let chatBusy = false;
let chatAttached = [];    // mémos glissés dans la barre : [{id, title, date}]
const chatAttach = document.getElementById('chatAttach');
const MEMO_DRAG_TYPE = 'application/x-rick-memo';

// Pastille qui suit le curseur pendant le glisser (plus lisible que la carte entière).
const dragGhost = document.createElement('div');
dragGhost.className = 'drag-ghost';
document.body.appendChild(dragGhost);

function attachChip(a, removable){
  return `<span class="chat-att" data-id="${a.id}"><span class="chat-att-ico">🎙</span>`
    + `<span class="chat-att-t">${escapeHtml(a.title)}</span><span class="chat-att-d">${escapeHtml(a.date)}</span>`
    + (removable ? `<button type="button" class="chat-att-x" data-id="${a.id}" aria-label="Retirer">×</button>` : '')
    + `</span>`;
}
function renderAttach(){
  chatAttach.innerHTML = chatAttached.map(a=> attachChip(a, true)).join('');
  chatAttach.hidden = chatAttached.length === 0;
  chatInput.placeholder = !chatAttached.length
    ? (currentView === 'library' ? 'Rechercher un mémo ou demander à Rick…' : 'Demandez à Rick…')
    : chatAttached.length === 1 ? 'Que voulez-vous savoir sur ce mémo ?' : 'Que voulez-vous savoir sur ces mémos ?';
  chatSync();
}
function attachMemo(id){
  const m = findMemo(id);
  if(!m) return;
  if(!chatAttached.some(a=> a.id === id)){
    if(chatAttached.length >= 5) chatAttached.shift();
    chatAttached.push({ id, title: memoTitle(m), date: timeAgoLabel(m.createdAt) });
  }
  renderAttach();
  chatForm.classList.remove('just-dropped'); void chatForm.offsetWidth;   // relance l'animation
  chatForm.classList.add('just-dropped');
  chatInput.focus();
}
chatAttach.addEventListener('click', (e)=>{
  const x = e.target.closest('.chat-att-x');
  if(!x) return;
  const chip = x.closest('.chat-att');
  chip.classList.add('leaving');
  setTimeout(()=>{ chatAttached = chatAttached.filter(a=> a.id !== x.dataset.id); renderAttach(); chatInput.focus(); },
    reduceMotion ? 0 : 160);   // déclaré plus bas, lu seulement au clic
});

// La barre accepte un mémo déposé.
chatForm.addEventListener('dragover', (e)=>{
  if(!e.dataTransfer.types.includes(MEMO_DRAG_TYPE)) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  chatForm.classList.add('drop-over');
});
chatForm.addEventListener('dragleave', (e)=>{
  if(!chatForm.contains(e.relatedTarget)) chatForm.classList.remove('drop-over');
});
chatForm.addEventListener('drop', (e)=>{
  const id = e.dataTransfer.getData(MEMO_DRAG_TYPE);
  if(!id) return;
  e.preventDefault();
  chatForm.classList.remove('drop-over');
  document.body.classList.remove('memo-dragging');
  attachMemo(id);
});

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// On ne recolle en bas que si l'utilisateur y est déjà : s'il remonte lire
// un ancien message pendant que Rick écrit, on ne le tire pas vers le bas.
function chatNearBottom(){
  return chatScroll.scrollHeight - chatScroll.scrollTop - chatScroll.clientHeight < 80;
}
function chatStick(smooth){
  chatScroll.scrollTo({ top: chatScroll.scrollHeight, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
}

function chatBubble(role, text, extra, attached){
  const el = document.createElement('div');
  el.className = 'chat-msg ' + role + (extra ? ' ' + extra : '');
  el.textContent = text;
  if(attached && attached.length){
    const box = document.createElement('div');
    box.className = 'chat-msg-att';
    box.innerHTML = attached.map(a=> attachChip(a, false)).join('');
    el.prepend(box);
  }
  chatList.appendChild(el);
  chatStick(true);
  return el;
}
// Trois points qui rebondissent le temps que la première ligne arrive.
function chatTyping(){
  const el = chatBubble('rick', '', 'typing');
  el.innerHTML = '<span></span><span></span><span></span>';
  el.setAttribute('aria-label', 'Rick écrit');
  return el;
}

/* Le serveur envoie le texte par paquets irréguliers : on le déroule à
   vitesse régulière. Plus il reste de retard, plus on accélère, pour ne
   jamais traîner loin derrière le flux. */
function chatTypewriter(el){
  let target = '', shown = 0, raf = 0, done = null;
  const tick = ()=>{
    const stick = chatNearBottom();
    const behind = target.length - shown;
    shown += Math.max(1, Math.ceil(behind / 14));
    if(shown > target.length) shown = target.length;
    el.textContent = target.slice(0, shown);
    if(stick) chatStick(false);
    if(shown < target.length) raf = requestAnimationFrame(tick);
    else { raf = 0; if(done){ done(); done = null; } }
  };
  return {
    push(text){
      target = text;
      // onglet caché : le navigateur suspend l'animation, on affiche d'un coup
      if(reduceMotion || document.hidden){ shown = text.length; el.textContent = text; chatStick(false); return; }
      if(!raf) raf = requestAnimationFrame(tick);
    },
    finish(){   // résout quand tout le texte est affiché
      return new Promise(res=>{ if(!raf) res(); else done = res; });
    },
  };
}

// Passe la bulle « typing » en bulle de réponse, avec un fondu enchaîné.
function chatReveal(el){
  el.classList.remove('typing');
  el.removeAttribute('aria-label');
  el.textContent = '';
  el.classList.add('streaming');
}

function chatSync(){
  chatSend.disabled = chatBusy || (!chatInput.value.trim() && !chatAttached.length);
  chatReset.hidden = chatHistory.length === 0 || chatBusy;
  chatIntro.classList.toggle('gone', chatHistory.length > 0);
}
function chatAutosize(){
  chatInput.style.height = 'auto';
  chatInput.style.height = Math.min(chatInput.scrollHeight, 140) + 'px';
}

async function askChat(question){
  question = question.trim();
  const attached = chatAttached;
  if(chatBusy || (!question && !attached.length)) return;
  // mémo déposé sans question : la demande la plus utile par défaut
  if(!question) question = attached.length === 1
    ? "Résume ce mémo et dis-moi ce qu'il reste à faire."
    : "Résume ces mémos et dis-moi ce qu'il reste à faire.";
  if(currentView !== 'chat') showView('chat');   // desktop : on tape depuis n'importe quel onglet
  chatInput.value = ''; chatAutosize();
  chatAttached = []; renderAttach();
  chatHistory.push({ role:'user', content: question, memoIds: attached.map(a=> a.id) });
  chatBubble('user', question, '', attached);
  chatBusy = true; chatSync();

  const out = chatTyping();
  if(demoMode){
    await new Promise(r=> setTimeout(r, 700));
    chatReveal(out);
    const tw = chatTypewriter(out);
    tw.push("En démo, je n'ai pas accès à de vrais mémos. Connectez-vous et je pourrai répondre à partir de tout ce que vous avez enregistré.");
    await tw.finish();
    out.classList.remove('streaming');
    chatHistory.pop();
    chatBusy = false; chatSync();
    return;
  }
  const tw = chatTypewriter(out);
  let started = false;
  try{
    const answer = await srv.askRick(chatHistory, (soFar)=>{
      if(!started){ started = true; chatReveal(out); }
      tw.push(soFar);
    });
    if(!started) chatReveal(out);
    await tw.finish();
    chatHistory.push({ role:'assistant', content: answer });
  }catch(err){
    await tw.finish();
    if(!started) chatReveal(out);
    out.classList.add('error');
    out.textContent = err.message || 'Rick ne répond pas.';
    chatHistory.pop();   // la question sans réponse ne part pas dans l'historique
    if(attached.length && !chatAttached.length){ chatAttached = attached; renderAttach(); }   // on rend les pièces jointes
  }finally{
    out.classList.remove('streaming');
    chatBusy = false; chatSync();
    chatInput.focus();
  }
}

chatForm.addEventListener('submit', (e)=>{ e.preventDefault(); askChat(chatInput.value); });
let searchTimer = 0;
chatInput.addEventListener('input', ()=>{
  chatAutosize(); chatSync();
  if(currentView === 'library'){ clearTimeout(searchTimer); searchTimer = setTimeout(renderMemoGrid, 90); }
});
chatInput.addEventListener('keydown', (e)=>{
  if(e.key === 'Enter' && !e.shiftKey && !e.isComposing){ e.preventDefault(); askChat(chatInput.value); }
});
document.querySelectorAll('#chatSuggest .chat-chip').forEach(chip=>{
  chip.addEventListener('click', ()=> askChat(chip.textContent));
});
chatReset.addEventListener('click', ()=>{
  // les bulles s'effacent avant que les suggestions ne reviennent
  const msgs = [...chatList.children];
  msgs.forEach((m, k)=>{ m.style.animationDelay = (k * 25) + 'ms'; m.classList.add('leaving'); });
  setTimeout(()=>{
    chatHistory = []; chatList.innerHTML = ''; chatSync(); chatInput.focus();
  }, reduceMotion ? 0 : 220 + msgs.length * 25);
});
chatSync();

/* ============ FENÊTRES INTÉGRÉES ============
   Remplacent prompt(), confirm() et alert() du navigateur : même style que
   l'app, dans la page. Tout est asynchrone (Promise). */
const uiLayer = document.createElement('div');
uiLayer.className = 'ui-overlay';
uiLayer.hidden = true;
uiLayer.innerHTML = `<form class="ui-dialog" novalidate>
    <div class="ui-title"></div>
    <div class="ui-msg"></div>
    <div class="ui-fields"></div>
    <div class="ui-actions">
      <button type="button" class="ui-btn ui-cancel">Annuler</button>
      <button type="submit" class="ui-btn ui-ok">OK</button>
    </div>
  </form>`;
document.body.appendChild(uiLayer);
const toastBox = document.createElement('div');
toastBox.className = 'ui-toasts';
document.body.appendChild(toastBox);

const UI_EMOJIS = ['🏷️','💼','🏠','❤️','👪','🩺','🐾','🛒','📞','💡','🎯','✈️','🎓','🏦','🔧','📚'];
let uiResolve = null;

function uiClose(value){
  if(!uiResolve) return;
  const res = uiResolve; uiResolve = null;
  uiLayer.classList.add('closing');
  setTimeout(()=>{ uiLayer.hidden = true; uiLayer.classList.remove('closing'); }, reduceMotionNow() ? 0 : 140);
  res(value);
}
function reduceMotionNow(){ return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

/* fields : [{ name, type:'text'|'emoji'|'toggle'|'choice', label, value, placeholder, required, options }]
   Résout avec { name: valeur } ou null si annulé. Un champ « choice » valide au clic. */
function uiDialog({ title='', message='', fields=[], ok='OK', cancel='Annuler', danger=false, hideCancel=false }={}){
  if(uiResolve) uiClose(null);
  const form = uiLayer.querySelector('.ui-dialog');
  form.querySelector('.ui-title').textContent = title;
  const msg = form.querySelector('.ui-msg');
  msg.textContent = message; msg.hidden = !message;
  const okBtn = form.querySelector('.ui-ok'), cancelBtn = form.querySelector('.ui-cancel');
  okBtn.textContent = ok; okBtn.classList.toggle('danger', danger);
  cancelBtn.textContent = cancel; cancelBtn.hidden = hideCancel;
  const onlyChoices = fields.length && fields.every(f=> f.type === 'choice');
  okBtn.hidden = !!onlyChoices;

  const box = form.querySelector('.ui-fields');
  box.innerHTML = fields.map(f=>{
    const label = f.label ? `<label class="ui-label">${escapeHtml(f.label)}</label>` : '';
    if(f.type === 'emoji'){
      const list = UI_EMOJIS.includes(f.value) || !f.value ? UI_EMOJIS : [f.value, ...UI_EMOJIS];
      return `${label}<div class="ui-emojis" data-name="${f.name}">${list.map(e=>
        `<button type="button" class="ui-emoji ${e===(f.value||UI_EMOJIS[0])?'on':''}" data-v="${e}">${e}</button>`).join('')}</div>`;
    }
    if(f.type === 'toggle'){
      return `${label}<div class="ui-toggle" data-name="${f.name}">${f.options.map(o=>
        `<button type="button" class="ui-seg ${o.value===f.value?'on':''}" data-v="${o.value}">${escapeHtml(o.label)}</button>`).join('')}</div>`;
    }
    if(f.type === 'choice'){
      return `${label}<div class="ui-choices" data-name="${f.name}">${f.options.map(o=>
        `<button type="button" class="ui-choice ${o.value===f.value?'on':''}" data-v="${escapeHtml(String(o.value))}">${escapeHtml(o.label)}</button>`).join('')}</div>`;
    }
    return `${label}<input class="ui-input" data-name="${f.name}" type="text" autocomplete="off"
      value="${escapeHtml(f.value || '')}" placeholder="${escapeHtml(f.placeholder || '')}" ${f.required ? 'data-required="1"' : ''}>`;
  }).join('');

  const collect = ()=>{
    const out = {};
    box.querySelectorAll('.ui-input').forEach(i=> out[i.dataset.name] = i.value.trim());
    box.querySelectorAll('.ui-emojis,.ui-toggle').forEach(g=>{
      const on = g.querySelector('.on'); out[g.dataset.name] = on ? on.dataset.v : '';
    });
    return out;
  };
  const sync = ()=>{
    okBtn.disabled = [...box.querySelectorAll('.ui-input[data-required]')].some(i=> !i.value.trim());
  };
  box.querySelectorAll('.ui-input').forEach(i=> i.addEventListener('input', sync));
  box.querySelectorAll('.ui-emojis,.ui-toggle').forEach(g=> g.addEventListener('click', (e)=>{
    const b = e.target.closest('button'); if(!b) return;
    g.querySelectorAll('button').forEach(x=> x.classList.toggle('on', x===b));
  }));
  box.querySelectorAll('.ui-choices').forEach(g=> g.addEventListener('click', (e)=>{
    const b = e.target.closest('button'); if(!b) return;
    uiClose({ ...collect(), [g.dataset.name]: b.dataset.v });
  }));
  sync();

  uiLayer.hidden = false;
  return new Promise(res=>{
    uiResolve = res;
    requestAnimationFrame(()=>{
      const first = box.querySelector('.ui-input');
      if(first){ first.focus(); first.select(); } else if(!okBtn.hidden) okBtn.focus();
    });
  });
}
uiLayer.querySelector('.ui-dialog').addEventListener('submit', (e)=>{
  e.preventDefault();
  const okBtn = uiLayer.querySelector('.ui-ok');
  if(okBtn.disabled || okBtn.hidden) return;
  const out = {};
  uiLayer.querySelectorAll('.ui-input').forEach(i=> out[i.dataset.name] = i.value.trim());
  uiLayer.querySelectorAll('.ui-emojis,.ui-toggle').forEach(g=>{
    const on = g.querySelector('.on'); out[g.dataset.name] = on ? on.dataset.v : '';
  });
  uiClose(out);
});
uiLayer.querySelector('.ui-cancel').addEventListener('click', ()=> uiClose(null));
uiLayer.addEventListener('click', (e)=>{ if(e.target === uiLayer) uiClose(null); });
document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape' && !uiLayer.hidden){ e.stopPropagation(); uiClose(null); } }, true);

function uiPrompt(title, { value='', placeholder='', message='', ok='Valider' }={}){
  return uiDialog({ title, message, ok, fields:[{ name:'v', value, placeholder, required:true }] })
    .then(r=> r ? r.v : null);
}
function uiConfirm(title, { message='', ok='Confirmer', cancel='Annuler', danger=false }={}){
  return uiDialog({ title, message, ok, cancel, danger }).then(r=> !!r);
}
/* Messages : court → petite notification qui s'efface ; long → fenêtre. */
function uiAlert(message){
  message = String(message == null ? '' : message);
  if(message.length > 110 || message.includes('\n')){
    return uiDialog({ title:'', message, ok:'OK', hideCancel:true });
  }
  const t = document.createElement('div');
  t.className = 'ui-toast';
  t.textContent = message;
  toastBox.appendChild(t);
  setTimeout(()=>{ t.classList.add('out'); setTimeout(()=> t.remove(), 250); }, 3800);
  return Promise.resolve();
}
window.alert = uiAlert;

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

function renderCatRow(){
  const memos = allMemos();
  // « Tous » en tête : sélectionné quand aucun filtre n'est actif.
  const all = `<div class="cat-card cat-card-all ${state.activeCat ? '' : 'selected'}" data-cat-all="1" title="Voir tous les mémos">
      <div>
        <div class="cat-name">Tous</div>
        <div class="cat-count">${memos.length} mémo${memos.length>1?'s':''}</div>
      </div>
      <div class="cat-deco">🎙️</div>
    </div>`;
  catRow.innerHTML = all + visibleCategories().map(c=>{
    const count = memos.filter(m=>m.category===c.id).length;
    const sel = state.activeCat===c.id ? 'selected':'';
    // catégorie d'équipe : seul l'admin peut la renommer ou la supprimer
    const editable = !c.team || isAdmin();
    const actions = editable ? `<div class="cat-card-actions">
        <button class="cat-icon-btn cat-edit" data-id="${c.id}" title="Modifier"><span class="mask-icon icon-edit"></span></button>
        <button class="cat-icon-btn cat-delete" data-id="${c.id}" title="Supprimer"><span class="mask-icon icon-trash"></span></button>
      </div>` : '';
    const teamTag = c.team ? `<span class="cat-team-tag">Équipe</span>` : '';
    return `<div class="cat-card ${sel}" data-cat="${c.id}">
      ${actions}
      ${teamTag}
      <div>
        <div class="cat-name">${c.name}</div>
        <div class="cat-count">${count} mémo${count>1?'s':''}</div>
      </div>
      <div class="cat-deco">${c.deco}</div>
    </div>`;
  }).join('') + `<div class="cat-card cat-card-add" id="catAdd" title="Ajouter une catégorie">
      <div class="cat-add-icon">+</div>
      <div class="cat-add-label">Nouvelle</div>
    </div>`;

  const allCard = catRow.querySelector('.cat-card-all');
  allCard.addEventListener('click', ()=>{
    state.activeCat = null;
    saveActiveCat();
    renderLibrary();
  });
  // Déposer un mémo sur « Tous » le sort de sa catégorie.
  allCard.addEventListener('dragover', (e)=>{
    if(!e.dataTransfer.types.includes(MEMO_DRAG_TYPE)) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    allCard.classList.add('drag-over');
  });
  allCard.addEventListener('dragleave', ()=> allCard.classList.remove('drag-over'));
  allCard.addEventListener('drop', (e)=>{
    e.preventDefault();
    allCard.classList.remove('drag-over');
    const m = findMemo(e.dataTransfer.getData('text/plain'));
    if(m && m.category) assignMemoCategory(m.id, m.category);   // même catégorie = on la retire
  });

  catRow.querySelectorAll('.cat-card[data-cat]').forEach(el=>{
    el.addEventListener('click', ()=>{
      const id = el.dataset.cat;
      state.activeCat = state.activeCat === id ? null : id;
      saveActiveCat();
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
  catRow.querySelectorAll('.cat-edit').forEach(btn=>{
    btn.addEventListener('click', (e)=>{ e.stopPropagation(); editCategory(btn.dataset.id); });
  });
  catRow.querySelectorAll('.cat-delete').forEach(btn=>{
    btn.addEventListener('click', (e)=>{ e.stopPropagation(); deleteCategory(btn.dataset.id); });
  });
  const addEl = document.getElementById('catAdd');
  if(addEl) addEl.addEventListener('click', addCategory);
}

// Une seule fenêtre : nom, emoji et, pour un admin, catégorie d'équipe ou perso.
async function categoryDialog({ title, name='', icon='🏷️', teamName=null, ok='Créer' }){
  const fields = [
    { name:'name', label:'Nom', value:name, placeholder:'ex. Clients, Idées, Maison…', required:true },
    { name:'icon', type:'emoji', label:'Emoji', value:icon || '🏷️' },
  ];
  if(teamName) fields.push({ name:'scope', type:'toggle', label:'Visible par', value:'perso', options:[
    { value:'perso', label:'Moi seulement' }, { value:'team', label:`L'équipe « ${teamName} »` },
  ]});
  const r = await uiDialog({ title, fields, ok });
  if(!r || !r.name) return null;
  return { name: r.name, icon: r.icon || '🏷️', forTeam: r.scope === 'team' };
}

async function addCategory(){
  if(requireAccount('Créer une catégorie')) return;
  // un admin peut créer une catégorie d'équipe (partagée) ou une catégorie personnelle
  const fields = await categoryDialog({ title:'Nouvelle catégorie', teamName: team && isAdmin() ? team.name : null });
  if(!fields) return;
  const forTeam = fields.forTeam;
  try{
    const cat = await srv.createCategory({
      name: fields.name, icon: fields.icon, color: nextCustomColor(),
      forTeam, teamId: team ? team.id : null, ownerId: currentUser.id,
    });
    state.categories.push(cat);
    renderLibrary();
  }catch(err){ reportError(err, 'Création de la catégorie'); }
}

async function editCategory(id){
  if(requireAccount('Renommer une catégorie')) return;
  const c = findCategory(id);
  if(!c) return;
  if(c.team && !isAdmin()){ alert("Seul l'admin de l'équipe peut modifier cette catégorie."); return; }
  const fields = await categoryDialog({ title:'Modifier la catégorie', name:c.name, icon:c.icon, ok:'Enregistrer' });
  if(!fields) return;
  const before = { name:c.name, icon:c.icon, deco:c.deco };
  c.name = fields.name; c.icon = fields.icon; c.deco = fields.icon;
  renderLibrary();
  if(detailId && !detailOverlay.hidden) openDetail(detailId);
  try{
    await srv.updateCategory(id, { name: fields.name, icon: fields.icon });
  }catch(err){
    Object.assign(c, before);   // le serveur a refusé : on revient en arrière
    renderLibrary();
    reportError(err, 'Modification de la catégorie');
  }
}

async function deleteCategory(id){
  if(requireAccount('Supprimer une catégorie')) return;
  const c = findCategory(id);
  if(!c) return;
  if(c.team && !isAdmin()){ alert("Seul l'admin de l'équipe peut supprimer cette catégorie."); return; }
  const extra = c.team ? " Elle disparaîtra pour toute l'équipe." : '';
  if(!await uiConfirm(`Supprimer « ${c.name} » ?`, { message:`Les mémos associés deviendront non catégorisés.${extra}`, ok:'Supprimer', danger:true })) return;
  try{
    await srv.deleteCategory(id);
    // en base : category_id passe à null (on delete set null) et les accès sont supprimés en cascade
    state.categories = state.categories.filter(x=>x.id!==id);
    accessRows = accessRows.filter(a=>a.category_id!==id);
    state.memos.forEach(m=>{ if(m.category===id) m.category = null; });
    // un mémo d'équipe sans catégorie n'est plus visible par les équipiers
    if(!isAdmin()) state.memos = state.memos.filter(m=>!(m.teamId && !m.category));
    if(state.activeCat===id){ state.activeCat = null; saveActiveCat(); }
    renderLibrary();
    if(detailId && !detailOverlay.hidden) openDetail(detailId);
  }catch(err){ reportError(err, 'Suppression de la catégorie'); }
}

function timeAgoLabel(iso){
  const d = new Date(iso);
  const months=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
  const hh=String(d.getHours()).padStart(2,'0');
  const mm=String(d.getMinutes()).padStart(2,'0');
  return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

function renderMemoGrid(){
  // Sur la Library, la barre du bas filtre les mémos pendant qu'on tape
  // (Entrée pose ensuite la question à Rick). Chaque mot doit apparaître.
  const q = currentView === 'library' ? chatInput.value.trim().toLowerCase() : '';
  const words = q.split(/\s+/).filter(Boolean);
  let list = allMemos().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  if(state.activeCat) list = list.filter(m=>m.category===state.activeCat);
  if(words.length) list = list.filter(m=>{
    const hay = (m.title+' '+m.summary+' '+m.transcript).toLowerCase();
    return words.every(w=> hay.includes(w));
  });

  document.getElementById('recentLabel').textContent = words.length ? 'Résultats' : 'Récents';
  document.getElementById('recentCount').textContent = list.length;
  memoGrid.innerHTML = list.map(m=>{
    // Extrait : le résumé s'il existe, sinon le début de la transcription.
    const excerptText = m.analyzed && m.summary ? m.summary : stripSpeakers(m.transcript || '').replace(/\s+/g,' ').trim();
    const excerpt = m.transcribing
      ? `<div class="memo-excerpt muted">Transcription en cours…</div>`
      : excerptText ? `<div class="memo-excerpt">${escapeHtml(excerptText)}</div>`
      : `<div class="memo-excerpt muted">Aucune transcription</div>`;
    const badge = m.transcribing ? `<span class="memo-badge busy">En cours</span>` : '';
    const mCat = m.category ? findCategory(m.category) : null;
    const tag = mCat ? `<span class="cat-tag ${mCat.custom?'':mCat.id}" ${catColorStyle(mCat)}>${mCat.name}</span>` : '';
    const author = m.teamId && m.authorId !== (currentUser && currentUser.id)
      ? `<span class="memo-author">${escapeHtml(m.authorName || 'Équipier')}</span>` : '';
    const playIcon = playingId===m.id && !playerAudio.paused ? '⏸' : '▶';
    const d = Math.round(m.duration || 0);
    const dur = d ? `<span class="memo-dur">${Math.floor(d/60)}:${String(d%60).padStart(2,'0')}</span>` : '';
    return `<div class="memo-card" data-id="${m.id}" draggable="true">
      <div class="memo-card-top">
        <span class="memo-meta">${timeAgoLabel(m.createdAt)}</span>
        <div class="memo-card-actions">
          ${badge}
          <span class="memo-icon-btn memo-drag-handle" title="Glissez la carte vers une catégorie ou dans la barre « Demandez à Rick »">⠿</span>
        </div>
      </div>
      <div class="memo-title">${escapeHtml(memoTitle(m))}</div>
      ${excerpt}
      <div class="memo-card-foot">
        <div class="memo-play" data-play-id="${m.id}" ${m.hasAudio ? '' : 'data-nodata="1"'}>${playIcon}</div>
        ${dur}
        <div class="memo-tags">${tag}${author}</div>
      </div>
    </div>`;
  }).join('');

  const total = allMemos().length;
  memoGrid.hidden = list.length===0;
  libraryEmpty.hidden = list.length>0 || total>0;
  if(total>0 && list.length===0){
    libraryEmpty.hidden = false;
    document.getElementById('libraryEmpty').querySelector('.empty-title').textContent = 'Aucun résultat';
    document.getElementById('libraryEmpty').querySelector('.empty-caption').textContent = words.length
      ? 'Appuyez sur Entrée pour poser la question à Rick.' : 'Essayez une autre catégorie.';
  } else if(total===0){
    document.getElementById('libraryEmpty').querySelector('.empty-title').textContent = 'Aucun mémo';
    document.getElementById('libraryEmpty').querySelector('.empty-caption').textContent = 'Appuyez sur le micro pour enregistrer votre premier mémo.';
  }

  memoGrid.querySelectorAll('.memo-card').forEach(el=>{
    el.addEventListener('click', ()=> openDetail(el.dataset.id));
  });
  memoGrid.querySelectorAll('.memo-drag-handle').forEach(h=> h.addEventListener('click', (e)=> e.stopPropagation()));
  // Toute la carte se glisse : vers une catégorie (text/plain) ou dans la
  // barre « Demandez à Rick » (type dédié, pour ne pas confondre avec un texte).
  memoGrid.querySelectorAll('.memo-card').forEach(card=>{
    card.addEventListener('dragstart', (e)=>{
      const m = findMemo(card.dataset.id);
      e.dataTransfer.setData('text/plain', card.dataset.id);
      e.dataTransfer.setData(MEMO_DRAG_TYPE, card.dataset.id);
      e.dataTransfer.effectAllowed = 'copyMove';
      if(m){ dragGhost.textContent = '🎙 ' + memoTitle(m); e.dataTransfer.setDragImage(dragGhost, 18, 18); }
      card.classList.add('dragging');
      document.body.classList.add('memo-dragging');
    });
    card.addEventListener('dragend', ()=>{
      card.classList.remove('dragging');
      document.body.classList.remove('memo-dragging');
      chatForm.classList.remove('drop-over');
    });
  });
  memoGrid.querySelectorAll('.memo-play').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.stopPropagation();
      const id = btn.dataset.playId;
      const m = findMemo(id);
      if(!m || !m.hasAudio){ alert("Pas d'enregistrement audio disponible pour ce mémo."); return; }
      togglePlay(id);
    });
  });
}

function renderLibrary(){
  renderCatRow();
  renderMemoGrid();
}

function escapeHtml(s){
  return (s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

/* ============ MEMO ANALYSIS (mock local IA) ============ */
/* guessCategory rend un mot-clé ; on le convertit en identifiant de catégorie
   réellement accessible au compte connecté (sinon on ne range rien). */
function guessCategoryId(text){
  const key = guessCategory(text);
  const byName = { pro:'pro', perso:'perso', famille:'famille' };
  const wanted = byName[key];
  const cat = visibleCategories().find(c=>c.name.toLowerCase() === wanted);
  return cat ? cat.id : null;
}
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
/* Fabrique un titre lisible à partir de la transcription.
   Pas d'IA ici. On cherche d'abord une intention explicite (« penser à… »),
   puis un type d'événement (« rendez-vous avec… ») repéré en début de phrase,
   sinon on retombe sur la première proposition, nettoyée des hésitations.
   Le sujet capté est coupé au premier marqueur de temps ou de subordonnée :
   sans ça, le titre avale toute la phrase. */

const TITLE_MAX_WORDS = 6;
const TITLE_MAX_CHARS = 46;

// Ouvertures sans contenu, retirées en tête de phrase.
const TITLE_FILLERS = /^(alors|euh|heu|hum|bon|bah|ben|donc|voilà|voila|ok|okay|allez|bref|du coup|en fait|écoute|ecoute|tiens)\b[\s,]*/i;

// Là où un sujet s'arrête : date, heure, ou début de subordonnée.
const TITLE_STOP = new RegExp(
  '\\s+(?:'
  + 'lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche'
  + '|demain|hier|aujourd\'hui|ce matin|cet après-midi|ce soir|la semaine|le mois|le \\d'
  + '|à\\s+\\d|a\\s+\\d|vers\\s+\\d|avant\\s|après\\s|apres\\s'
  + '|parce que|car\\s|qui\\s|que\\s|dont\\s|où\\s|et\\s|mais\\s|donc\\s|avec\\s|sur\\s'
  + '|pour\\s+(?:le|la|les|l\'|un|une|des)\\s'
  + ')', 'i');

function cap(s){ return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

// Nettoie un fragment : article de tête, ponctuation de queue, espaces.
function cleanFragment(s){
  return (s||'').trim()
    .replace(/^(?:que\s+je|qu'on|que\s+l'on|que\s+nous|je|j')\s*/i,'')
    .replace(/^(?:le|la|les|un|une|des|du|de\s+la|de|d'|l')\s*/i,'')
    .replace(/\s+/g,' ')
    .replace(/[\s,.;:!?—-]+$/,'');
}

// Coupe au premier marqueur de temps ou de subordonnée.
function cutSubject(s){
  const m = (s||'').match(TITLE_STOP);
  return (m ? s.slice(0, m.index) : s).trim();
}

function shorten(s){
  let out = s.trim().replace(/[\s,.;:!?—-]+$/,'');
  const w = out.split(/\s+/);
  let cut = w.length > TITLE_MAX_WORDS;
  if(cut) out = w.slice(0, TITLE_MAX_WORDS).join(' ');
  if(out.length > TITLE_MAX_CHARS){ out = out.slice(0, TITLE_MAX_CHARS).replace(/\s+\S*$/,''); cut = true; }
  return out.replace(/[\s,.;:!?—-]+$/,'') + (cut ? '…' : '');
}

// Intentions : elles priment, où qu'elles soient dans la phrase.
const TITLE_INTENTS = [
  /\b(?:penser à|penser a|ne pas oublier de|il faut que je|il faut|je dois|faut que je|relancer)\s+([^.,;:!?]{3,60})/i,
  /\b(?:idée|idee)\s+(?:pour|de|sur)\s+([^.,;:!?]{3,60})/i,
  /\b(?:note|noter|mémo|memo)\s+(?:sur|pour|de)\s+([^.,;:!?]{3,60})/i,
];

// Événements : seulement s'ils ouvrent la phrase (index < 40 caractères),
// sinon « ...pour la livraison des cartons » deviendrait « Livraison cartons ».
const TITLE_EVENTS = [
  { re:/\b(rendez-vous|rdv)\b\s*(avec|chez)?\s*([^.,;:!?]{2,60})/i, label:'Rendez-vous', link:true,  g:3 },
  { re:/\b(réunion|reunion)\b\s*(avec|sur)?\s*([^.,;:!?]{2,60})/i,   label:'Réunion',     link:true,  g:3 },
  { re:/\b(entretien)\b\s*(avec|de)?\s*([^.,;:!?]{2,60})/i,          label:'Entretien',   link:true,  g:3 },
  { re:/\b(?:appel|appeler|téléphoner|telephoner)\s+(?:à|a|avec)?\s*([^.,;:!?]{2,60})/i, label:'Appel', link:false, g:1 },
  { re:/\b(?:visite)\s+(?:de|du|chez)?\s*([^.,;:!?]{2,60})/i,         label:'Visite',      link:false, g:1 },
  { re:/\b(?:consultation|auscultation)\s+(?:de|du|pour)?\s*([^.,;:!?]{2,60})/i, label:'Consultation', link:false, g:1 },
  { re:/\b(devis|facture|commande|contrat|livraison)\s+(?:pour|de|du)?\s*([^.,;:!?]{2,60})/i, label:null, link:false, g:2 },
];

/* « Voix A : », « Vous : », « Visio · B : » en tête de ligne : utiles dans la
   transcription, pas dans un titre. */
const SPEAKER_PREFIX = /^\s*(?:Voix [A-Z]|Vous|Visio(?: · [A-Z])?)\s*[:：]\s*/gmu;
function stripSpeakers(text){ return (text || '').replace(SPEAKER_PREFIX, ''); }
function memoTitle(m){ return stripSpeakers(m.title) || 'Nouveau mémo'; }

function guessTitle(text){
  text = stripSpeakers(text);
  if(!text || text.trim().length < 3) return 'Nouveau mémo';
  const raw = text.trim().replace(/\s+/g,' ');

  for(const re of TITLE_INTENTS){
    const m = raw.match(re);
    if(m){
      const subject = cleanFragment(cutSubject(m[1]));
      if(subject.length >= 4) return cap(shorten(subject));
    }
  }

  for(const ev of TITLE_EVENTS){
    const m = raw.match(ev.re);
    if(m && m.index < 40){
      const subject = cleanFragment(cutSubject(m[ev.g]));
      const label = ev.label || cap(m[1]);
      const link = ev.link && m[2] ? m[2].toLowerCase() + ' ' : '';
      if(subject.length >= 2) return cap(shorten(label + ' ' + link + subject));
      return label;
    }
  }

  let first = (raw.split(/(?<=[.!?])\s/)[0] || raw);
  let prev;
  do { prev = first; first = first.replace(TITLE_FILLERS, ''); } while(first !== prev);
  first = first.replace(/^[,;:\s]+/,'');
  if(first.trim().length < 3) return 'Nouveau mémo';
  return cap(shorten(first));
}

function analyzeMemo(id){
  const m = findMemo(id);
  if(!m) return;
  if(!m.category) m.category = guessCategoryId(m.transcript);
  m.summary = summarize(m.transcript);
  m.actions = detectActions(m.transcript);
  if(m.title === 'Nouveau mémo' || !m.title) m.title = guessTitle(m.transcript);
  m.analyzed = true;
  srv.updateMemo(m.id, {
    category: m.category, summary: m.summary, actions: m.actions,
    title: m.title, analyzed: true,
  }).catch(err=>reportError(err, "Enregistrement de l'analyse"));
}

/* Déplacer un mémo vers une catégorie d'équipe le partage avec les équipiers
   autorisés : il quitte l'espace personnel pour le store de l'équipe (et inversement). */
async function assignMemoCategory(memoId, catId){
  const m = findMemo(memoId);
  if(!m) return;
  const target = m.category === catId ? null : catId;
  const wasTeam = isTeamMemo(m);
  const goesTeam = !!(target && isTeamCat(target));

  if(wasTeam && !goesTeam && !isAdmin() && m.authorId !== currentUser.id){
    alert("Ce mémo appartient à l'équipe : seul son auteur ou l'admin peut le sortir d'une catégorie d'équipe.");
    return;
  }

  const before = { category: m.category, teamId: m.teamId };
  m.category = target;
  m.teamId = goesTeam ? team.id : null;
  renderLibrary();
  if(detailId===memoId && !detailOverlay.hidden) openDetail(memoId);

  try{
    await srv.updateMemo(memoId, { category: m.category, teamId: m.teamId });
    // sorti de l'équipe, un mémo redevient privé à son auteur : s'il n'est pas
    // le mien, il quitte mon champ de visibilité et disparaît du miroir
    if(!m.teamId && m.authorId !== currentUser.id){
      state.memos = state.memos.filter(x=>x.id!==memoId);
      if(detailId===memoId) detailOverlay.hidden = true;
      renderLibrary();
    }
  }catch(err){
    Object.assign(m, before);
    renderLibrary();
    reportError(err, 'Déplacement du mémo');
  }
}

async function deleteMemo(id){
  if(requireAccount('Supprimer un mémo')) return;
  const m = findMemo(id);
  if(!m) return;
  if(isTeamMemo(m) && !isAdmin() && m.authorId !== currentUser.id){
    alert("Seul l'auteur du mémo ou l'admin de l'équipe peut le supprimer.");
    return;
  }
  if(!await uiConfirm(`Supprimer « ${memoTitle(m)} » ?`, { message:'Cette action est irréversible.', ok:'Supprimer', danger:true })) return;
  if(playingId===id){ playerAudio.pause(); playingId=null; }
  const snapshot = state.memos;
  state.memos = state.memos.filter(x=>x.id!==id);
  if(detailId===id) detailOverlay.hidden = true;
  renderLibrary();
  if(currentView==='agenda') renderAgenda();
  srv.deleteMemo(id)
    .then(()=> deleteAudioBlob(id).catch(()=>{}))
    .catch(err=>{
      state.memos = snapshot;
      renderLibrary();
      reportError(err, 'Suppression du mémo');
    });
}

/* ============ DETAIL SHEET ============ */
const detailOverlay = document.getElementById('detailOverlay');
let detailId = null;

function openDetail(id){
  detailId = id;
  const m = findMemo(id);
  if(!m) return;
  const shared = isTeamMemo(m);
  document.getElementById('detailDate').textContent = timeAgoLabel(m.createdAt)
    + (shared ? ` · partagé par ${m.authorName || 'un équipier'}` : '');
  const badge = document.getElementById('detailCatBadge');
  const dCat = m.category ? findCategory(m.category) : null;
  if(dCat){
    badge.hidden = false;
    badge.className = 'cat-badge '+(dCat.custom?'':dCat.id);
    badge.setAttribute('style', catColorStyle(dCat).replace(/^style="|"$/g,''));
    badge.textContent = dCat.name;
  } else { badge.hidden = true; badge.textContent=''; badge.removeAttribute('style'); }
  document.getElementById('detailTitle').textContent = memoTitle(m);
  // Une ligne d'état seulement quand elle apprend quelque chose : le bouton
  // d'analyse dit déjà si le mémo est analysé ou non.
  const status = document.getElementById('detailStatus');
  status.textContent = m.transcribing ? '⏳ Transcription en cours…'
    : m.whisperFailed ? '⚠️ Transcription de secours (micro du navigateur)' : '';
  status.hidden = !status.textContent;

  // Catégories en pastilles : un clic range le mémo, un second l'en sort.
  document.getElementById('detailCats').innerHTML = visibleCategories().map(c=>
    `<button type="button" class="detail-cat ${m.category===c.id?'active':''}" data-cat="${c.id}">${escapeHtml(c.name)}</button>`
  ).join('') || '<span class="detail-cat-empty">Aucune catégorie</span>';

  const dt = document.getElementById('detailTranscript');
  if(m.transcript){
    // noms des voix en gras ; textContent relu à la sortie garde le texte intact
    dt.innerHTML = escapeHtml(m.transcript).replace(
      /^(\s*(?:Voix [A-Z]|Vous|Visio(?: · [A-Z])?)\s*[:：])/gmu, '<b class="tr-speaker">$1</b>');
  } else {
    dt.textContent = m.transcribing ? '…' : '(aucune transcription — touchez pour en écrire une)';
  }

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
  playBtn.hidden = !m.hasAudio;
  playBtn.classList.toggle('playing', playingId===m.id && !playerAudio.paused);
  document.getElementById('detailPlayIcon').textContent = playingId===m.id && !playerAudio.paused ? '❚❚' : '▶';
  const d = Math.round(m.duration || 0);
  document.getElementById('detailDuration').textContent = d ? `${Math.floor(d/60)}:${String(d%60).padStart(2,'0')}` : 'Écouter';

  const analyzeBtn = document.getElementById('btnAnalyze');
  analyzeBtn.hidden = m.transcribing;
  analyzeBtn.textContent = m.analyzed ? "🔁 Relancer l'analyse" : "✨ Analyser avec l'IA";
  analyzeBtn.classList.toggle('secondary', !!m.analyzed);
  detailOverlay.hidden = false;
}
document.getElementById('detailClose').addEventListener('click', ()=> detailOverlay.hidden = true);
detailOverlay.addEventListener('click', (e)=>{ if(e.target===detailOverlay) detailOverlay.hidden = true; });
document.getElementById('btnDetailAsk').addEventListener('click', ()=>{
  if(!detailId) return;
  detailOverlay.hidden = true;
  showView('chat');
  attachMemo(detailId);
});
document.getElementById('detailCats').addEventListener('click', (e)=>{
  const b = e.target.closest('.detail-cat');
  if(b && detailId) assignMemoCategory(detailId, b.dataset.cat);
});
document.getElementById('btnDetailDelete').addEventListener('click', ()=>{
  if(detailId) deleteMemo(detailId);
});

document.getElementById('btnDetailPlay').addEventListener('click', ()=>{
  const m = findMemo(detailId);
  if(!m || !m.hasAudio){ alert("Pas d'enregistrement audio disponible pour ce mémo."); return; }
  togglePlay(detailId);
});

document.getElementById('detailTranscript').addEventListener('blur', ()=>{
  const m = findMemo(detailId);
  if(!m) return;
  const newText = document.getElementById('detailTranscript').textContent.trim();
  const placeholder = newText === '(aucune transcription — touchez pour en écrire une)';
  const finalText = placeholder ? '' : newText;
  if(finalText !== m.transcript){
    m.transcript = finalText;
    srv.updateMemo(m.id, { transcript: finalText })
      .catch(err=>reportError(err, 'Enregistrement de la transcription'));
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
  const todays = allMemos().filter(m=> sameDay(new Date(m.createdAt), now));
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
          <div class="agenda-item-title">${escapeHtml(memoTitle(m))}</div>
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

  const eventDays = new Set(allMemos().map(m=>{
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
function saveExtensions(){
  if(demoMode) return;
  if(!currentUser) return;
  srv.saveExtensions(state.extensions, currentUser.id)
    .catch(err=>reportError(err, 'Enregistrement des extensions'));
}

let storeFilter = 'tout';
// null = tous les métiers. Le store n'a pas besoin de connaître la profession
// du compte : on montre d'emblée les connecteurs de tous les métiers, et on ne
// filtre que si l'utilisateur clique sur l'un d'eux.
let storeProfession = null;

/* Professions réellement représentées dans le catalogue. */
function catalogProfessions(){
  const used = new Set();
  state.extensions.forEach(e=>(e.pro||[]).forEach(p=>used.add(p)));
  return PROFESSIONS.filter(p=>used.has(p.id));
}
function renderStoreFilters(){
  document.getElementById('storeFilters').innerHTML = FILTERS.map(f=>
    `<button class="chip ${storeFilter===f.id?'active':''}" data-f="${f.id}">${f.label}</button>`
  ).join('');
  document.querySelectorAll('#storeFilters .chip').forEach(el=>{
    el.addEventListener('click', ()=>{ storeFilter = el.dataset.f; renderStore(); });
  });

  // Deuxième rangée : visible seulement quand on regarde les connecteurs métier.
  const row = document.getElementById('storeProfessions');
  if(!row) return;
  if(storeFilter !== 'metier'){ row.hidden = true; row.innerHTML = ''; return; }
  row.hidden = false;
  // « Tous les métiers » d'abord : c'est l'état par défaut, rien à renseigner.
  const chips = [{ id:'', label:'Tous les métiers' }].concat(catalogProfessions());
  row.innerHTML = chips.map(p=>
    `<button class="chip chip-pro ${(storeProfession||'')===p.id?'active':''}" data-p="${p.id}">${p.label}</button>`
  ).join('');
  row.querySelectorAll('.chip').forEach(el=>{
    el.addEventListener('click', ()=>{ storeProfession = el.dataset.p || null; renderStore(); });
  });
}
function extCard(e){
  const statusHtml = e.status==='active'
    ? `<div class="ext-status"><span class="status-dot active"></span>Active</div>`
    : e.status==='pending'
      ? `<div class="ext-status" style="color:var(--amber)"><span class="status-dot pending"></span>À connecter</div>`
      : e.status==='soon'
        ? `<div class="ext-status ext-soon"><span class="status-dot pending"></span>Connecteur à venir</div>`
        : '';
  // Le métier desservi, maintenant que tous s'affichent ensemble : sans ça,
  // dix-sept connecteurs se ressemblent. Au-delà de deux, on abrège.
  const pros = e.pro || [];
  const proTag = pros.length
    ? `<div class="ext-pro">${pros.slice(0,2).map(professionLabel).join(' · ')}${pros.length>2 ? ' +' + (pros.length-2) : ''}</div>`
    : '';
  let btn = '';
  if(e.status==='soon'){
    // Pas de bouton « Installer » sur un connecteur qui n'existe pas encore :
    // on propose de se signaler, ce qui détermine l'ordre de priorité.
    btn = `<button class="ext-btn ext-btn-soon" data-id="${e.id}" data-act="notify">Me prévenir</button>`;
  } else if(e.installed){
    if(e.status==='active') btn = `<button class="ext-btn connected" data-id="${e.id}" data-act="toggle">✓ Connecté</button>`;
    else btn = `<button class="ext-btn" data-id="${e.id}" data-act="connect">Connecter</button>`;
  } else {
    btn = `<button class="ext-btn" data-id="${e.id}" data-act="install">+ Installer</button>`;
  }
  return `<div class="ext-card">
    <div class="ext-top">
      <div class="ext-icon">${extIcon(e)}</div>
      <span class="ext-check">${e.status==='active'?'✅':''}</span>
    </div>
    <div>
      <div class="ext-name">${e.name}</div>
      ${proTag}
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
  // Onglet « Métiers » : tous les connecteurs métier par défaut, et seulement
  // ceux d'une profession si l'utilisateur en choisit une.
  if(storeFilter==='metier' && storeProfession){
    list = list.filter(e => !e.pro || e.pro.includes(storeProfession));
  }
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
      if(act !== 'notify' && requireAccount('Installer une intégration')) return;
      const ext = state.extensions.find(e=>e.id===id);
      if(act==='notify'){
        btn.textContent = '✓ Vous serez prévenu';
        btn.disabled = true;
        return;
      }
      if(act==='install'){
        ext.installed = true; ext.status = 'pending';
        saveExtensions(); renderStore();
      } else if(act==='connect'){
        btn.textContent = 'Connexion…'; btn.classList.add('loading'); btn.disabled = true;
        setTimeout(()=>{ ext.status='active'; saveExtensions(); renderStore(); }, 1100);
      } else if(act==='toggle'){
        ext.status='pending'; saveExtensions(); renderStore();
      }
    });
  });
}
document.getElementById('storeSearch').addEventListener('input', renderStore);

/* ============ MAP ============ */
let map, mapInited=false, addModeOn=false, reminderMarkers=[], meMarker=null;
const DESKTOP = window.matchMedia('(min-width:900px)');

// Épingle lime (rappel) et point pulsant (ma position), dessinés en CSS.
const pinIcon = ()=> L.divIcon({ className:'rick-pin', html:'<span></span>', iconSize:[30,38], iconAnchor:[15,36], popupAnchor:[0,-32] });
const meIcon  = ()=> L.divIcon({ className:'rick-me', html:'<span></span>', iconSize:[22,22], iconAnchor:[11,11] });

function initMapIfNeeded(){
  if(mapInited){ setTimeout(()=> map.invalidateSize(), 0); return; }
  mapInited = true;
  map = L.map('mapEl', { zoomControl:false, attributionControl:true }).setView([46.6, 2.4], 6);
  // OpenStreetMap passé en gris clair par CSS (.leaflet-tile-pane) : un fond
  // sobre qui laisse la vedette aux épingles lime, sans clé d'API.
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap'
  }).addTo(map);
  map.attributionControl.setPrefix(false);

  map.on('click', async (e)=>{
    if(!addModeOn) return;
    setAddMode(false);
    if(requireAccount('Poser un rappel de lieu')) return;
    const label = await uiPrompt('Nouveau rappel de lieu', { placeholder:'ex. Garage, Pharmacie, Bureau…', ok:'Poser le rappel' });
    if(label && label.trim()){
      srv.addReminder({ name: label.trim(), lat: e.latlng.lat, lng: e.latlng.lng }, currentUser.id)
        .then(r=>{ state.reminders.push(r); renderReminders(); focusReminder(r.id); })
        .catch(err=>reportError(err, 'Ajout du rappel'));
    }
  });

  // Sur desktop la liste est ouverte d'emblée, sur mobile elle reste repliée.
  setSheet(DESKTOP.matches);
  renderReminders();
  if(state.reminders.length){
    map.fitBounds(L.latLngBounds(state.reminders.map(r=>[r.lat, r.lng])).pad(0.4), { maxZoom: 14 });
  }
  setTimeout(()=> map.invalidateSize(), 0);
}

function setAddMode(on){
  addModeOn = on;
  document.getElementById('btnAddReminder').classList.toggle('active', on);
  document.getElementById('mapAddHint').hidden = !on;
  document.getElementById('mapEl').classList.toggle('adding', on);
}
document.getElementById('btnAddReminder').addEventListener('click', ()=> setAddMode(!addModeOn));
document.getElementById('mapAddCancel').addEventListener('click', ()=> setAddMode(false));
document.getElementById('btnZoomIn').addEventListener('click', ()=> map && map.zoomIn());
document.getElementById('btnZoomOut').addEventListener('click', ()=> map && map.zoomOut());

document.getElementById('btnLocate').addEventListener('click', (e)=>{
  if(!navigator.geolocation){ alert('Géolocalisation non disponible.'); return; }
  const btn = e.currentTarget;
  btn.classList.add('busy');
  navigator.geolocation.getCurrentPosition(pos=>{
    btn.classList.remove('busy');
    const { latitude, longitude } = pos.coords;
    map.flyTo([latitude, longitude], 14, { duration: 1.1 });
    if(meMarker) map.removeLayer(meMarker);
    meMarker = L.marker([latitude, longitude], { icon: meIcon(), keyboard:false }).addTo(map)
      .bindPopup('Vous êtes ici');
  }, err=>{
    btn.classList.remove('busy');
    alert("Impossible d'obtenir votre position : " + err.message);
  });
});

function focusReminder(id){
  const i = state.reminders.findIndex(r=> r.id === id);
  if(i < 0) return;
  const r = state.reminders[i];
  map.flyTo([r.lat, r.lng], Math.max(map.getZoom(), 15), { duration: 1 });
  map.once('moveend', ()=> reminderMarkers[i] && reminderMarkers[i].openPopup());
  if(!DESKTOP.matches) setSheet(false);
}

function renderReminders(){
  if(map){
    reminderMarkers.forEach(m=>map.removeLayer(m));
    reminderMarkers = state.reminders.map(r=>
      L.marker([r.lat, r.lng], { icon: pinIcon(), title: r.name }).addTo(map).bindPopup(escapeHtml(r.name)));
  }
  const n = state.reminders.length;
  document.getElementById('reminderSub').textContent = n
    ? `${n} lieu${n>1?'x':''} enregistré${n>1?'s':''}` : 'Aucun lieu enregistré';
  document.getElementById('reminderList').innerHTML = n
    ? state.reminders.map(r=>
        `<div class="reminder-item" data-id="${r.id}">
          <button type="button" class="reminder-go" data-id="${r.id}"><span class="reminder-pin"></span><span class="reminder-name">${escapeHtml(r.name)}</span></button>
          <button type="button" class="reminder-del" data-id="${r.id}" title="Supprimer" aria-label="Supprimer">×</button>
        </div>`).join('')
    : `<div class="reminder-empty">Posez un rappel sur la carte : Rick vous le rappellera en arrivant sur place.</div>`;
  document.querySelectorAll('.reminder-go').forEach(btn=>{
    btn.addEventListener('click', ()=> focusReminder(btn.dataset.id));
  });
  document.querySelectorAll('.reminder-del').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.dataset.id;
      const snapshot = state.reminders;
      state.reminders = state.reminders.filter(r=>r.id!==id);
      renderReminders();
      srv.deleteReminder(id).catch(err=>{
        state.reminders = snapshot; renderReminders();
        reportError(err, 'Suppression du rappel');
      });
    });
  });
}

let sheetExpanded = false;
function setSheet(open){
  sheetExpanded = open;
  document.getElementById('reminderList').hidden = !open;
  document.getElementById('mapSheet').classList.toggle('open', open);
}
document.getElementById('mapSheetToggle').addEventListener('click', ()=> setSheet(!sheetExpanded));

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
let mixDest = null;           // sortie du mixage, pour y raccrocher la visio en cours de route
let displaySource = null;     // noeud du son de la visio : à garder, sinon le collecteur le supprime
let keepAlive = null;         // souffle inaudible : empeche la veille du contexte en arriere-plan
let ctxWatchdog = null;       // verifie que le mixage tourne encore quand la fenetre n'est plus au premier plan
let recStartTime = null, recElapsed = 0, timerInterval = null, isPaused = false;
let finalTranscript = '';
let includeTabAudio = false;
let whisperAvailable = null; // cached health check result

/* ---- transcription live AssemblyAI ----
   Une session par source : le micro porte votre voix, le son de l'onglet porte
   celle de vos interlocuteurs. C'est ce découpage qui différencie les voix — le
   streaming d'AssemblyAI ne sait pas séparer deux personnes dans un même flux. */
const SPEAKER_ME   = { id:'me',   label:'Vous',  cls:'me' };
const SPEAKER_THEM = { id:'them', label:'Visio', cls:'them' };
/* Sur la piste visio, AssemblyAI distingue les interlocuteurs (A, B, C…).
   On en fait des locuteurs à part entière pour l'affichage et le mémo. */
function speakerFor(base, tag){
  if(!tag) return base;
  if(base.id === 'them') return { id:'them_'+tag, label:'Visio · '+tag, cls:'them' };
  return { id:'me_'+tag, label:'Voix '+tag, cls:'me' };
}

/* Une seule voix au micro : c'est vous, inutile d'afficher « Voix A ».
   Plusieurs voix : on les nomme, faute de pouvoir savoir laquelle est la vôtre. */
function micVoiceCount(){
  const ids = new Set();
  sttSegments.forEach(s=>{ if(s.speaker.cls === 'me') ids.add(s.speaker.id); });
  for(const [k, v] of Object.entries(sttPartials)){
    if((k === 'me' || k.startsWith('me_')) && (v || '').trim()) ids.add(k);
  }
  return ids.size;
}
function displayLabel(sp){
  return (sp.cls === 'me' && micVoiceCount() <= 1) ? 'Vous' : sp.label;
}
function speakerFromKey(key){
  if(key === 'me')   return SPEAKER_ME;
  if(key === 'them') return SPEAKER_THEM;
  if(key.startsWith('them_')) return speakerFor(SPEAKER_THEM, key.slice(5));
  return speakerFor(SPEAKER_ME, key.slice(3));
}
let sttSessions = [];              // sessions ouvertes
let sttSegments = [];              // { speaker, text } finalisés, dans l'ordre d'arrivée
let sttPartials = {};              // { me: '…', them: '…' } en cours
let sttActive = false;             // au moins une session live en route
let transcriptEdited = false;      // l'utilisateur a repris la main au clavier

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
  transcriptEdited = true;      // l'utilisateur reprend la main : plus de réécriture auto
  finalTranscript = transcriptText.textContent;
});

/* Reconstruit la zone de transcription à partir des segments étiquetés. */
function renderLiveTranscript(){
  if(transcriptEdited) return;
  const parts = sttSegments.map(seg=>
    `<span class="tr-line"><span class="tr-who ${seg.speaker.cls}">${displayLabel(seg.speaker)}</span>${escapeHtml(seg.text)}</span>`);
  for(const [key, raw] of Object.entries(sttPartials)){
    const text = (raw || '').trim();
    if(!text) continue;
    const sp = speakerFromKey(key);
    parts.push(`<span class="tr-line pending"><span class="tr-who ${sp.cls}">${displayLabel(sp)}</span>${escapeHtml(text)}</span>`);
  }
  transcriptText.className = parts.length ? 'transcript-live' : 'transcript-placeholder';
  transcriptText.innerHTML = parts.length ? parts.join('') : "Parlez… la transcription s'affiche ici";
  transcriptText.scrollTop = transcriptText.scrollHeight;
}

/* Texte à enregistrer dans le mémo : une ligne « Vous : … » par prise de parole
   quand il y a deux voix, du texte brut quand il n'y en a qu'une. */
function liveTranscriptToText(){
  if(!sttSegments.length) return '';
  const multi = new Set(sttSegments.map(s=>s.speaker.id)).size > 1;
  if(!multi) return sttSegments.map(s=>s.text).join(' ').trim();
  return sttSegments.map(s=>`${displayLabel(s.speaker)} : ${s.text}`).join('\n');
}

function pushSegment(speaker, text){
  const last = sttSegments[sttSegments.length-1];
  // deux tours consécutifs du même locuteur se recollent en un paragraphe
  if(last && last.speaker.id === speaker.id) last.text = (last.text + ' ' + text).trim();
  else sttSegments.push({ speaker, text });
  sttPartials[speaker.id] = '';
  renderLiveTranscript();
  finalTranscript = liveTranscriptToText();
}

/* Affiche l'état de la transcription. Sans ça, un micro refusé ou une session
   tombée laissent l'écran sur « Parlez… » sans rien dire à personne. */
function setSttStatus(msg, kind){
  const el = document.getElementById('sttStatus');
  if(!el) return;
  el.textContent = msg || '';
  el.className = 'stt-status' + (kind ? ' ' + kind : '');
  el.hidden = !msg;
}

/* Ouvre une session de transcription pour une piste donnée. */
function startSttFor(stream, speaker){
  // Plusieurs personnes peuvent partager le micro (même pièce) autant que
  // l'onglet (visio) : on diarise les deux flux.
  const maxSpeakers = ((window.RICK_CONFIG||{}).assemblyai||{}).maxSpeakers || 4;
  return liveSTT.open(stream, {
    onOpen:    ()=>{ setSttStatus('Transcription en direct connectée.', 'ok'); },
    onPartial: (text, tag)=>{
      const sp = speakerFor(speaker, tag);
      sttPartials[sp.id] = text;
      renderLiveTranscript();
    },
    onFinal:   (text, tag)=>{ pushSegment(speakerFor(speaker, tag), text); },
    onError:   (err)=>{
      console.error('[rick] stt', speaker.id, err);
      setSttStatus('Transcription interrompue : ' + (err.message || 'erreur inconnue')
        + ". L'enregistrement continue, vous pourrez saisir le texte à la main.", 'err');
    },
  }, { speakerLabels: true, maxSpeakers }).then(session=>{
    sttSessions.push(session);
    sttActive = true;
    return session;
  });
}

function stopStt(){
  sttSessions.forEach(s=>{ try{ s.stop(); }catch(e){} });
  sttSessions = [];
  sttActive = false;
  sttPartials = {};
}

function checkWhisperServer(){
  return fetch(WHISPER_URL + '/health', { mode:'cors' })
    .then(r=>r.ok)
    .catch(()=>false)
    .then(ok=>{ whisperAvailable = ok; return ok; });
}
checkWhisperServer();

const TAB_AUDIO_IDLE = "Au casque ? Ajouter le son de l’onglet visio";

function setTabAudioLabel(text){
  document.getElementById('tabAudioLabel').textContent = text;
}

function resetTabAudioUi(){
  includeTabAudio = false;
  btnTabAudio.classList.remove('active');
  btnTabAudio.disabled = false;
  setTabAudioLabel(TAB_AUDIO_IDLE);
}

/**
 * Raccroche le son de la visio à l'enregistrement déjà en cours.
 *
 * Le micro n'entend pas les participants distants : leurs voix sortent du
 * haut-parleur, et l'annulation d'écho du navigateur les retire justement du
 * flux du micro. Le seul chemin est getDisplayMedia, qui exige un vrai clic —
 * d'où ce bouton, actif pendant tout l'enregistrement.
 */
function attachVisioAudio(){
  if(!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia){
    setTabAudioLabel("Ce navigateur ne sait pas capter le son d'un onglet — essayez Chrome, Brave ou Edge");
    return;
  }
  if(!audioCtx || !mixDest){
    setTabAudioLabel("Attendez que l'enregistrement ait démarré");
    return;
  }

  btnTabAudio.disabled = true;
  setTabAudioLabel("Choisissez l'onglet de la visio, en gardant « Partager l'audio » activé…");

  // displaySurface:'browser' ouvre le sélecteur directement sur la liste des
  // onglets. Sans lui, il s'ouvre sur « Écran entier » — et un écran ou une
  // fenêtre ne transporte aucun son sur macOS : c'est exactement le piège dans
  // lequel on tombait. selfBrowserSurface écarte l'onglet Rick lui-même, qui
  // ne servirait à rien et créerait une boucle.
  const wanted = {
    video: { displaySurface: 'browser' },
    audio: { suppressLocalAudioPlayback: false },
    systemAudio: 'include',
    selfBrowserSurface: 'exclude'
  };

  navigator.mediaDevices.getDisplayMedia(wanted)
    // Les navigateurs plus anciens rejettent les options récentes : on retente
    // sans elles plutôt que d'échouer.
    .catch(err=>{
      if(err && (err.name === 'TypeError' || err.name === 'NotSupportedError')){
        return navigator.mediaDevices.getDisplayMedia({ video:true, audio:true });
      }
      throw err;
    })
    .then(stream=>{
      const video = stream.getVideoTracks()[0];
      const surface = (video && video.getSettings && video.getSettings().displaySurface) || '';

      if(!stream.getAudioTracks().length){
        stream.getTracks().forEach(t=>t.stop());
        btnTabAudio.disabled = false;
        // Dire ce qui a été partagé, plutôt qu'un reproche générique : c'est la
        // seule façon pour l'utilisateur de savoir quoi refaire.
        setTabAudioLabel(
          surface === 'monitor'
            ? "Vous avez partagé l'écran entier : macOS n'en donne pas le son. Reprenez et choisissez l'onglet Google Meet."
          : surface === 'window'
            ? "Vous avez partagé une fenêtre : une fenêtre ne transporte pas le son. Reprenez et choisissez l'onglet Google Meet."
            : "Onglet partagé sans son : refaites le partage en laissant « Partager l'audio de l'onglet » activé."
        );
        return;
      }

      // NE PAS couper la piste vidéo. Elle ne sert à rien pour le son, mais dans
      // Chrome et Brave c'est elle qui porte la session de partage : l'arrêter
      // met fin au partage tout entier, et la piste audio meurt dans la seconde.
      // C'est ce qui faisait qu'un partage accepté n'enregistrait rien.
      // Elle reste ouverte et n'est simplement branchée nulle part : aucune
      // image n'est lue ni encodée.

      displayStream = stream;
      includeTabAudio = true;
      btnTabAudio.classList.add('active');
      btnTabAudio.disabled = false;
      setTabAudioLabel("Visio branchée — j'écoute…");

      // La référence doit survivre : un noeud source laissé sans référence peut
      // être ramassé par le collecteur, et le son s'arrête alors tout seul au
      // bout de quelques secondes, sans la moindre erreur.
      displaySource = audioCtx.createMediaStreamSource(stream);
      displaySource.connect(mixDest);
      watchVisioLevel(stream);

      // Si l'utilisateur coupe le partage depuis la barre du navigateur, le
      // bouton doit cesser de prétendre que la visio est captée.
      stream.getAudioTracks().forEach(t=>{
        t.addEventListener('ended', ()=>{
          if(displayStream !== stream) return;
          displayStream = null;
          includeTabAudio = false;
          btnTabAudio.classList.remove('active');
          setTabAudioLabel("Partage arrêté — micro seul à partir d'ici");
        });
      });

      if(liveSTT.available()){
        startSttFor(stream, SPEAKER_THEM).catch(err=>{
          console.error('[rick] transcription visio', err);
          setSttStatus("Visio enregistrée, mais sa transcription en direct n'a pas démarré ("
            + (err.message || 'erreur') + ").", 'warn');
        });
      }
    })
    .catch(err=>{
      btnTabAudio.disabled = false;
      // NotAllowedError couvre aussi bien le refus que la fermeture du sélecteur.
      setTabAudioLabel(err && err.name === 'NotAllowedError'
        ? "Partage annulé — retentez quand vous voulez"
        : "Partage impossible (" + ((err && err.message) || 'erreur') + ")");
    });
}

/**
 * Un onglet peut être partagé « avec son » et rester muet — mauvais onglet,
 * appel sur un autre périphérique de sortie. Plutôt que d'annoncer une victoire
 * et de le découvrir à la relecture, on écoute vraiment le flux et on le dit.
 */
function watchVisioLevel(stream){
  if(!audioCtx) return;
  const probe = audioCtx.createAnalyser();
  probe.fftSize = 256;
  displaySource.connect(probe);
  const data = new Uint8Array(probe.frequencyBinCount);
  const deadline = Date.now() + 12000;

  (function look(){
    if(displayStream !== stream) return;             // partage arrêté entre-temps
    probe.getByteFrequencyData(data);
    let peak = 0;
    for(let i=0;i<data.length;i++){ if(data[i] > peak) peak = data[i]; }
    if(peak > 6){
      setTabAudioLabel("Visio incluse — son détecté, les deux voix sont enregistrées");
      return;
    }
    if(Date.now() > deadline){
      setTabAudioLabel("Visio branchée mais silencieuse — le son de l'appel ne sort pas de cet onglet");
      return;
    }
    setTimeout(look, 300);
  })();
}

btnTabAudio.addEventListener('click', ()=>{
  if(displayStream) return;   // déjà branchée
  attachVisioAudio();
});

function openRecordOverlay(){
  if(requireAccount('Enregistrer un mémo')) return;
  setSttStatus('Connexion à la transcription…');
  recordOverlay.hidden = false;
  finalTranscript = '';
  recordedChunks = [];
  recordedMimeType = '';
  sttSegments = [];
  sttPartials = {};
  transcriptEdited = false;
  transcriptText.textContent = '';
  transcriptText.className = 'transcript-placeholder';
  transcriptText.textContent = 'Parlez… la transcription s\'affiche ici';
  recElapsed = 0; isPaused = false;
  recTimer.textContent = '00:00';
  document.getElementById('recStatusLabel').textContent = 'ENREGISTREMENT';
  document.getElementById('pauseLabel').textContent = 'Pause';
  resetTabAudioUi();
  startRecording();
}

function closeRecordOverlay(){
  stopRecording();
  recordOverlay.hidden = true;
}

/* Chrome et Brave suspendent un AudioContext dès que sa page passe en
   arrière-plan s'il ne produit aucun son audible. Or tout l'enregistrement
   transite par ce contexte : suspendu, il ne rend plus rien et le MediaRecorder
   n'écrit que du silence. C'est ce qui coupait le son dès qu'on changeait de
   fenêtre — la minute d'avant était bonne, la suite muette.

   Deux garde-fous. Un souffle inaudible branché sur la sortie, qui suffit à
   faire passer le contexte pour actif ; et une reprise explicite au retour au
   premier plan, au cas où il aurait quand même été suspendu. */
function keepContextAwake(ctx){
  try{
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 30;    // sous le seuil de l'audition utile
    gain.gain.value = 0.0001;    // inaudible, mais non nul : un zéro exact est traité comme du silence
    // Vers les haut-parleurs seulement, jamais vers le mixage : rien de ceci
    // n'entre dans l'enregistrement.
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    keepAlive = { osc, gain };
  }catch(e){ keepAlive = null; }

  ctxWatchdog = setInterval(resumeContext, 1000);
}

function resumeContext(){
  if(audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(()=>{});
}
// Les minuteries sont ralenties dans un onglet caché : le retour au premier
// plan doit donc réveiller le contexte lui-même, sans attendre le watchdog.
document.addEventListener('visibilitychange', resumeContext);
window.addEventListener('focus', resumeContext);
window.addEventListener('pageshow', resumeContext);

function startRecording(){
  recStartTime = Date.now() - recElapsed*1000;
  timerInterval = setInterval(()=>{
    if(isPaused) return;
    recElapsed = Math.floor((Date.now()-recStartTime)/1000);
    const mm = String(Math.floor(recElapsed/60)).padStart(2,'0');
    const ss = String(recElapsed%60).padStart(2,'0');
    recTimer.textContent = `${mm}:${ss}`;
  }, 250);

  // Le micro brut, sans aucun traitement : c'est ce qui rend la visio audible
  // sans rien demander à l'utilisateur.
  //
  // Par défaut le navigateur active l'annulation d'écho, la réduction de bruit
  // et le gain automatique. L'annulation d'écho retire du flux tout ce qui sort
  // des haut-parleurs — c'est-à-dire exactement la voix des interlocuteurs.
  // C'est la vraie raison pour laquelle seules les personnes présentes dans la
  // pièce étaient enregistrées. On la coupe : le micro entend alors la pièce
  // ET l'ordinateur, les deux voix arrivent, sans partage d'onglet ni boîte de
  // dialogue.
  //
  // Rick ouvre son propre flux : couper ces traitements ici ne change rien à ce
  // que Meet ou Teams envoient de leur côté, l'appel n'est pas dégradé.
  // Seule limite, physique : avec un casque, le son de la visio ne repasse
  // jamais par le micro. C'est le seul cas où le partage d'onglet reste requis.
  const micWanted = { audio: {
    echoCancellation: false,
    noiseSuppression: false,
    autoGainControl:  false
  } };
  const gum = navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    ? navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices)
    : null;
  const micPromise = gum
    ? gum(micWanted).catch(err=>{
        // Un périphérique qui refuse ces réglages vaut mieux que pas de micro.
        if(err && (err.name === 'OverconstrainedError' || err.name === 'TypeError')) return gum({ audio:true });
        throw err;
      })
    : Promise.reject(new Error('no getUserMedia'));

  micPromise.then((mic)=>{
    mediaStream = mic;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    keepContextAwake(audioCtx);
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

    // mix mic (+ son de la visio quand on l'ajoute) dans un seul flux enregistrable
    const dest = audioCtx.createMediaStreamDestination();
    mixDest = dest;
    micSource.connect(dest);

    try{
      recordedMimeType = pickRecorderMimeType();
      mediaRecorder = recordedMimeType
        ? new MediaRecorder(dest.stream, { mimeType: recordedMimeType })
        : new MediaRecorder(dest.stream); // let the browser pick (e.g. Safari has no webm support)
      recordedMimeType = mediaRecorder.mimeType || recordedMimeType;
      mediaRecorder.ondataavailable = (e)=>{ if(e.data && e.data.size>0) recordedChunks.push(e.data); };
      mediaRecorder.start();
    }catch(e){ mediaRecorder = null; }

    // Transcription live : une session par voix. Le micro d'abord (il y a
    // toujours quelqu'un derrière), le son de l'onglet ensuite s'il existe.
    if(liveSTT.available()){
      startSttFor(mic, SPEAKER_ME)
        .catch(err=>{
          console.error('[rick] transcription live', err);
          // si le micro s'est ouvert et que seule la visio a échoué, on garde
          // ce qui marche plutôt que de tout jeter
          if(sttSessions.length) return;
          transcriptText.className = 'transcript-placeholder';
          transcriptText.textContent = 'Transcription live indisponible (' + (err.message || 'erreur') + ') — repli sur le micro du navigateur.';
          startWebSpeechFallback();
        });
    } else {
      setSttStatus("Transcription AssemblyAI non configurée : repli sur le micro du navigateur.", 'warn');
      startWebSpeechFallback();
    }
  }).catch(err=>{
    // L'écran reste utilisable (on peut écrire son mémo), mais il faut dire
    // pourquoi rien ne s'enregistre : sinon l'utilisateur attend une
    // transcription qui ne viendra jamais.
    console.error('[rick] micro', err);
    const name = err && err.name;
    let msg;
    if(name === 'NotAllowedError' || name === 'SecurityError'){
      msg = "Micro refusé. Autorisez-le dans la barre d'adresse, puis rouvrez l'enregistrement.";
    } else if(name === 'NotFoundError' || name === 'OverconstrainedError'){
      msg = "Aucun micro détecté sur cet appareil.";
    } else if(name === 'NotReadableError'){
      msg = "Le micro est déjà utilisé par une autre application. Fermez-la et réessayez.";
    } else {
      msg = "Micro indisponible (" + (name || (err && err.message) || 'erreur') + ").";
    }
    setSttStatus(msg + " Rien n'est enregistré ; vous pouvez écrire votre mémo dans la zone ci-dessus.", 'err');
    transcriptText.className = 'transcript-placeholder';
    transcriptText.textContent = 'Écrivez votre mémo ici…';
  });
}

// Repli quand AssemblyAI n'est pas configuré ou injoignable : l'API du
// navigateur, qui n'écoute que le micro et ne distingue donc pas les voix.
function startWebSpeechFallback(){
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
  } else if(!sttActive){
    transcriptText.textContent = "Reconnaissance vocale live non disponible dans ce navigateur (essayez Chrome) — écrivez votre texte ici, ou activez Whisper local pour une transcription automatique après l'enregistrement.";
  }
}

function releaseMediaResources(){
  if(mediaRecorder && mediaRecorder.state !== 'inactive'){ try{ mediaRecorder.stop(); }catch(e){} }
  mediaRecorder = null;
  if(ctxWatchdog){ clearInterval(ctxWatchdog); ctxWatchdog = null; }
  if(keepAlive){ try{ keepAlive.osc.stop(); }catch(e){} keepAlive = null; }
  if(audioCtx){ try{ audioCtx.close(); }catch(e){} audioCtx=null; }
  if(mediaStream){ mediaStream.getTracks().forEach(t=>t.stop()); mediaStream=null; }
  if(displayStream){ displayStream.getTracks().forEach(t=>t.stop()); displayStream=null; }
  displaySource = null;
  mixDest = null;
}

function stopRecording(){
  clearInterval(timerInterval);
  if(recognizer){ try{ recognizer.onend=null; recognizer.stop(); }catch(e){} recognizer=null; }
  stopStt();
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
  stopStt();
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

/* ============ IMPORT D'UN AUDIO ============
   Fichier choisi (ou déposé sur le disque gris) → mémo créé tout de suite en
   « En cours », audio envoyé dans le bucket, puis transcription côté serveur. */
const IMPORT_MAX = 25 * 1024 * 1024;   // limite de la transcription OpenAI
const importInput = document.getElementById('importInput');
const btnImport = document.getElementById('btnImport');

function audioDuration(file){
  return new Promise(res=>{
    const a = document.createElement('audio');
    const url = URL.createObjectURL(file);
    const done = (d)=>{ URL.revokeObjectURL(url); res(isFinite(d) ? d : 0); };
    a.preload = 'metadata';
    a.onloadedmetadata = ()=> done(a.duration);
    a.onerror = ()=> done(0);
    setTimeout(()=> done(0), 5000);
    a.src = url;
  });
}
function titleFromFileName(name){
  const t = name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return t ? t.charAt(0).toUpperCase() + t.slice(1) : 'Audio importé';
}

async function importAudioFile(file){
  if(!file) return;
  if(demoMode){ openLoginPopup('Connectez-vous pour importer vos fichiers audio et les faire transcrire.'); return; }
  if(!/^(audio|video)\//.test(file.type) && !/\.(m4a|mp3|wav|ogg|webm|flac|aac|mp4)$/i.test(file.name)){
    alert("Ce fichier n'est pas un audio."); return;
  }
  if(file.size > IMPORT_MAX){ alert('Fichier trop lourd : 25 Mo maximum.'); return; }

  const draft = {
    teamId: null, category: null,
    title: titleFromFileName(file.name), transcript: '', summary: '', actions: [],
    analyzed: false, transcribing: true, whisperFailed: false, usedTabAudio: false,
    hasAudio: false, duration: Math.round(await audioDuration(file)),
  };
  let memo;
  try{ memo = await srv.createMemo(draft, currentUser.id); }
  catch(err){ reportError(err, "Import de l'audio"); return; }
  memo.authorName = currentUser.name;
  state.memos.unshift(memo);
  revealNewMemo(memo.id);

  const refresh = ()=>{
    if(currentView === 'library') renderLibrary();
    if(detailId === memo.id && !detailOverlay.hidden) openDetail(memo.id);
  };
  const blob = file.type ? file : new Blob([file], { type: 'audio/mpeg' });
  saveAudioBlob(memo.id, blob).catch(()=>{});
  try{
    await srv.uploadAudio(memo.id, blob);
    await srv.updateMemo(memo.id, { hasAudio:true });
    const m = findMemo(memo.id); if(m) m.hasAudio = true;
    refresh();
    const text = await srv.transcribeImported(memo.id);
    const m2 = findMemo(memo.id);
    if(!m2) return;
    m2.transcript = text;
    const guessed = guessTitle(text);
    if(guessed !== 'Nouveau mémo') m2.title = guessed;   // sinon on garde le nom du fichier
    m2.transcribing = false;
    await srv.updateMemo(m2.id, { transcript:m2.transcript, title:m2.title, transcribing:false });
    refresh();
  }catch(err){
    const m = findMemo(memo.id);
    if(m){ m.transcribing = false; srv.updateMemo(m.id, { transcribing:false }).catch(()=>{}); refresh(); }
    reportError(err, 'Transcription de « ' + draft.title + ' »');
  }
}

btnImport.addEventListener('click', ()=>{
  if(demoMode){ openLoginPopup('Connectez-vous pour importer vos fichiers audio et les faire transcrire.'); return; }
  importInput.click();
});
importInput.addEventListener('change', ()=>{
  const f = importInput.files[0];
  importInput.value = '';   // permet de réimporter le même fichier
  importAudioFile(f);
});
// On peut aussi déposer un fichier audio directement sur le disque gris.
btnImport.addEventListener('dragover', (e)=>{
  if(!e.dataTransfer.types.includes('Files')) return;
  e.preventDefault(); e.dataTransfer.dropEffect = 'copy';
  btnImport.classList.add('drop-over');
});
btnImport.addEventListener('dragleave', ()=> btnImport.classList.remove('drop-over'));
btnImport.addEventListener('drop', (e)=>{
  if(!e.dataTransfer.files.length) return;
  e.preventDefault();
  btnImport.classList.remove('drop-over');
  importAudioFile(e.dataTransfer.files[0]);
});
/* ============ APPAREILS RICK (Bluetooth) ============
   Un compte peut appairer plusieurs Rick. Chacun reçoit un libellé — un
   emplacement (« Salle réunion 1 ») ou une personne (« Rick de Julie ») — et
   peut être rattaché à une catégorie : les enregistrements de cet appareil y
   atterrissent, ce qui donne un rangement par salle ou par commercial.
   Le Web Bluetooth n'est pas disponible partout ; quand il l'est on lit le nom
   de l'appareil choisi, sinon on demande le libellé à la main. */

let devices = [];
let devicesDegraded = false;   // vrai si la table SQL n'existe pas encore
const deviceOverlay = document.getElementById('deviceOverlay');

function deviceKindLabel(kind){ return kind === 'personne' ? 'Personne' : 'Emplacement'; }

async function loadDevices(){
  if(!currentUser) return;
  try{
    const res = await srv.listDevices(currentUser.id, team ? team.id : null);
    devices = res.rows;
    devicesDegraded = res.degraded;
  }catch(err){ reportError(err, 'Chargement des appareils'); }
}

function renderDevices(){
  const list = document.getElementById('deviceList');
  document.getElementById('deviceCount').textContent =
    devices.length + (devices.length > 1 ? ' Rick' : ' Rick');

  if(!devices.length){
    list.innerHTML = `<div class="device-empty">
      <div class="empty-icon">🔗</div>
      <div class="empty-title">Aucun Rick appairé</div>
      <div class="empty-caption">Appairez un premier appareil pour lui donner un emplacement ou l'affecter à quelqu'un.</div>
    </div>`;
  } else {
    list.innerHTML = devices.map(d=>{
      const cat = d.categoryId ? findCategory(d.categoryId) : null;
      const catHtml = cat
        ? `<span class="device-cat" ${catColorStyle(cat)}>${cat.icon} ${escapeHtml(cat.name)}</span>`
        : `<span class="device-cat device-cat-none">Sans catégorie</span>`;
      return `<div class="device-row" data-id="${d.id}">
        <div class="device-dot"></div>
        <div class="device-main">
          <div class="device-label">${escapeHtml(d.label)}</div>
          <div class="device-meta">${deviceKindLabel(d.kind)}${d.local ? ' · local' : ''}</div>
        </div>
        ${catHtml}
        <div class="device-actions">
          <button class="memo-icon-btn" data-act="rename" title="Renommer"><span class="mask-icon icon-edit"></span></button>
          <button class="memo-icon-btn" data-act="cat" title="Catégorie">🏷️</button>
          <button class="memo-icon-btn memo-delete" data-act="unpair" title="Retirer"><span class="mask-icon icon-trash"></span></button>
        </div>
      </div>`;
    }).join('');
  }

  document.getElementById('deviceNote').textContent = devicesDegraded
    ? "Ces appareils sont enregistrés sur cet appareil uniquement : la table « devices » n'existe pas encore côté serveur."
    : "Les enregistrements d'un Rick rattaché à une catégorie y sont rangés automatiquement.";

  list.querySelectorAll('.device-row').forEach(row=>{
    const id = row.dataset.id;
    row.querySelectorAll('button[data-act]').forEach(btn=>{
      btn.addEventListener('click', (e)=>{
        e.stopPropagation();
        const act = btn.dataset.act;
        if(act === 'rename')      renameDevice(id);
        else if(act === 'cat')    assignDeviceCategory(id);
        else if(act === 'unpair') unpairDevice(id);
      });
    });
  });
}

function openDevicePanel(){
  if(requireAccount('Appairer un Rick')) return;
  if(!currentUser) return;
  loadDevices().then(()=>{ renderDevices(); deviceOverlay.hidden = false; });
}

/* Demande le nom de l'appareil au système quand le navigateur le permet. */
async function pickBluetoothName(){
  if(!navigator.bluetooth || !navigator.bluetooth.requestDevice) return null;
  try{
    const d = await navigator.bluetooth.requestDevice({ acceptAllDevices:true });
    return (d && d.name) || null;
  }catch(e){ return null; }   // annulation ou refus : on retombe sur la saisie
}

async function pairDevice(){
  const suggested = await pickBluetoothName();
  const label = await uiPrompt('Nommer ce Rick', {
    message:'Un emplacement ou une personne.', placeholder:'ex. Salle réunion 1, Rick de Julie', value: suggested || '', ok:'Appairer',
  });
  if(label === null) return;
  const name = label.trim();
  if(!name){ alert('Donnez un libellé à cet appareil.'); return; }

  const kind = /salle|bureau|accueil|réunion|reunion|box|cabinet|chambre|agence|local|poste/i.test(name)
    ? 'emplacement' : 'personne';
  try{
    const dev = await srv.createDevice({
      label: name, kind, categoryId: null,
      ownerId: currentUser.id, teamId: team ? team.id : null,
    });
    devices.push(dev);
    renderDevices();
    if(await uiConfirm(`« ${name} » est appairé`, { message:'Créer une catégorie du même nom pour ranger ses enregistrements ?', ok:'Créer la catégorie', cancel:'Plus tard' })){
      await createCategoryForDevice(dev);
    }
  }catch(err){ reportError(err, "Appairage de l'appareil"); }
}

/* L'appareil crée sa catégorie : c'est ce qui donne un rangement par salle
   ou par commercial sans que l'utilisateur ait à trier après coup. */
async function createCategoryForDevice(dev){
  const forTeam = !!team && isAdmin();
  try{
    const cat = await srv.createCategory({
      name: dev.label,
      icon: dev.kind === 'personne' ? '🎙️' : '📍',
      color: nextCustomColor(),
      forTeam, teamId: team ? team.id : null, ownerId: currentUser.id,
    });
    state.categories.push(cat);
    await srv.updateDevice(dev.id, { label:dev.label, kind:dev.kind, categoryId:cat.id }, currentUser.id);
    dev.categoryId = cat.id;
    renderDevices();
    renderLibrary();
  }catch(err){ reportError(err, 'Création de la catégorie'); }
}

async function renameDevice(id){
  const dev = devices.find(d=>d.id===id);
  if(!dev) return;
  const label = await uiPrompt('Renommer ce Rick', { value: dev.label, placeholder:'Emplacement ou personne', ok:'Renommer' });
  if(label === null) return;
  const name = label.trim();
  if(!name) return;
  const kind = /salle|bureau|accueil|réunion|reunion|box|cabinet|chambre|agence|local|poste/i.test(name)
    ? 'emplacement' : 'personne';
  try{
    await srv.updateDevice(id, { label:name, kind, categoryId:dev.categoryId }, currentUser.id);
    dev.label = name; dev.kind = kind;
    renderDevices();
  }catch(err){ reportError(err, "Renommage de l'appareil"); }
}

async function assignDeviceCategory(id){
  const dev = devices.find(d=>d.id===id);
  if(!dev) return;
  const cats = visibleCategories();
  const r = await uiDialog({ title:`Catégorie de « ${dev.label} »`, fields:[{ name:'cat', type:'choice', value: dev.categoryId || '', options:[
    ...cats.map(c=> ({ value:c.id, label:`${c.icon} ${c.name}` })),
    { value:'', label:'Aucune catégorie' },
    { value:'__new', label:`＋ Créer « ${dev.label} »` },
  ]}]});
  if(!r) return;
  if(r.cat === '__new'){ await createCategoryForDevice(dev); return; }
  const catId = r.cat || null;
  try{
    await srv.updateDevice(id, { label:dev.label, kind:dev.kind, categoryId:catId }, currentUser.id);
    dev.categoryId = catId;
    renderDevices();
  }catch(err){ reportError(err, 'Affectation de la catégorie'); }
}

async function unpairDevice(id){
  const dev = devices.find(d=>d.id===id);
  if(!dev) return;
  if(!await uiConfirm(`Retirer « ${dev.label} » ?`, { message:'La catégorie et les mémos sont conservés.', ok:'Retirer', danger:true })) return;
  try{
    await srv.deleteDevice(id, currentUser.id);
    devices = devices.filter(d=>d.id!==id);
    renderDevices();
  }catch(err){ reportError(err, "Retrait de l'appareil"); }
}

document.getElementById('btnBluetooth').addEventListener('click', openDevicePanel);
document.getElementById('deviceClose').addEventListener('click', ()=>{ deviceOverlay.hidden = true; });
deviceOverlay.addEventListener('click', (e)=>{ if(e.target === deviceOverlay) deviceOverlay.hidden = true; });
document.getElementById('btnPairDevice').addEventListener('click', pairDevice);

document.getElementById('btnCancel').addEventListener('click', ()=>{
  closeRecordOverlay();
});

document.getElementById('btnPause').addEventListener('click', (e)=>{
  isPaused = !isPaused;
  document.getElementById('pauseLabel').textContent = isPaused ? 'Reprendre' : 'Pause';
  document.getElementById('recStatusLabel').textContent = isPaused ? 'EN PAUSE' : 'ENREGISTREMENT';
  sttSessions.forEach(s=>{ try{ s.setPaused(isPaused); }catch(err){} });
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
      const m = findMemo(memoId);
      if(!m) return;
      if(data.text){
        m.transcript = data.text;
        if(m.title === 'Nouveau mémo' || !m.title) m.title = guessTitle(data.text);
      }
      m.transcribing = false;
      m.whisperFailed = false;
      srv.updateMemo(m.id, { transcript:m.transcript, title:m.title, transcribing:false, whisperFailed:false })
        .catch(err=>console.error('[rick]', err));
      if(currentView==='library') renderLibrary();
      if(detailId===memoId && !detailOverlay.hidden) openDetail(memoId);
    })
    .catch(()=>{
      const m = findMemo(memoId);
      if(!m) return;
      m.transcribing = false;
      m.whisperFailed = true;
      srv.updateMemo(m.id, { transcribing:false, whisperFailed:true })
        .catch(err=>console.error('[rick]', err));
      if(currentView==='library') renderLibrary();
      if(detailId===memoId && !detailOverlay.hidden) openDetail(memoId);
    });
}

document.getElementById('btnFinish').addEventListener('click', ()=>{
  const liveTranscript = transcriptEdited
    ? transcriptText.textContent.trim()
    : (liveTranscriptToText() || (transcriptText.classList.contains('transcript-placeholder') ? '' : transcriptText.textContent.trim()));
  const usedMix = includeTabAudio && displayStream;
  const ext = extForMimeType(recordedMimeType || 'audio/webm');

  const draft = {
    teamId: null,
    category: null,
    title: guessTitle(liveTranscript),
    transcript: liveTranscript,
    summary: '',
    actions: [],
    analyzed: false,
    transcribing: false,
    whisperFailed: false,
    usedTabAudio: !!usedMix,
    hasAudio: false,
    duration: recElapsed,
  };

  recordOverlay.hidden = true;
  resetTabAudioUi();

  // AssemblyAI a déjà transcrit en direct : pas besoin de repasser par Whisper.
  const liveSttWorked = sttSegments.length > 0;

  stopRecorderAndGetBlob().then(async blob=>{
    const hasBlob = !!(blob && blob.size>0);
    draft.transcribing = hasBlob && !liveSttWorked;
    let memo;
    try{
      memo = await srv.createMemo(draft, currentUser.id);
    }catch(err){
      reportError(err, "Enregistrement du mémo");
      return;
    }
    memo.authorName = currentUser.name;
    state.memos.unshift(memo);
    revealNewMemo(memo.id);

    if(!hasBlob) return;

    // l'audio part vers le bucket Supabase, et reste en cache local pour la lecture immédiate
    saveAudioBlob(memo.id, blob).catch(()=>{});
    srv.uploadAudio(memo.id, blob)
      .then(()=> srv.updateMemo(memo.id, { hasAudio:true }))
      .then(()=>{
        const m = findMemo(memo.id);
        if(m){ m.hasAudio = true; if(currentView==='library') renderLibrary(); }
      })
      .catch(err=>console.error('[rick] upload audio', err));

    if(!liveSttWorked) transcribeWithWhisper(memo.id, blob, ext);
  });
});

/* ============ AUTHENTIFICATION (Supabase) ============ */
const loginOverlay = document.getElementById('loginOverlay');
const loginForm    = document.getElementById('loginForm');
const signupForm   = document.getElementById('signupForm');
const loginError   = document.getElementById('loginError');
const signupError  = document.getElementById('signupError');
let signupMode = 'solo'; // solo | admin | join

function showAuthError(el, msg){
  el.textContent = msg;
  el.hidden = !msg;
}
function setBusy(form, busy, label){
  const btn = form.querySelector('button[type=submit]');
  btn.disabled = busy;
  btn.textContent = busy ? (label || 'Un instant…')
    : (form === loginForm ? 'Se connecter' : 'Créer mon compte');
}

document.querySelectorAll('.auth-tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    const target = tab.dataset.auth;
    document.querySelectorAll('.auth-tab').forEach(t=>t.classList.toggle('active', t===tab));
    loginForm.hidden  = target !== 'login';
    signupForm.hidden = target !== 'signup';
    showAuthError(loginError, ''); showAuthError(signupError, '');
  });
});

document.querySelectorAll('#signupMode .auth-opt').forEach(opt=>{
  opt.addEventListener('click', ()=>{
    signupMode = opt.dataset.mode;
    document.querySelectorAll('#signupMode .auth-opt').forEach(o=>o.classList.toggle('active', o===opt));
    document.getElementById('signupTeamName').hidden = signupMode !== 'admin';
    document.getElementById('signupTeamCode').hidden = signupMode !== 'join';
  });
});

signupForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  showAuthError(signupError, '');
  const name  = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('signupPass').value;
  if(!name || !email.includes('@') || pass.length < 6){
    showAuthError(signupError, 'Nom, e-mail valide et mot de passe de 6 caractères minimum.');
    return;
  }
  const teamName = document.getElementById('signupTeamName').value.trim();
  const teamCode = document.getElementById('signupTeamCode').value.trim();
  if(signupMode === 'admin' && !teamName){ showAuthError(signupError, "Donnez un nom à votre équipe."); return; }
  if(signupMode === 'join'  && !teamCode){ showAuthError(signupError, "Saisissez le code d'invitation."); return; }

  setBusy(signupForm, true, 'Création…');
  try{
    const profession = document.getElementById('signupProfession').value;
    const { session } = await srv.signUp({ name, email, password: pass, profession });
    if(!session){
      // la confirmation d'e-mail est activée sur le projet Supabase
      showAuthError(signupError, "Compte créé. Confirmez l'e-mail reçu, puis connectez-vous.");
      setBusy(signupForm, false);
      return;
    }
    leaveDemo();   // sinon createTeam/joinTeam seraient absorbés par la démo
    let joined = null;
    if(signupMode === 'admin')      joined = await srv.createTeam(teamName);
    else if(signupMode === 'join')  joined = await srv.joinTeam(teamCode);

    signupForm.reset();
    document.getElementById('signupTeamName').hidden = true;
    document.getElementById('signupTeamCode').hidden = true;
    document.querySelectorAll('#signupMode .auth-opt').forEach(o=>o.classList.toggle('active', o.dataset.mode==='solo'));
    await enterApp();

    if(signupMode === 'admin' && joined){
      alert(`Équipe « ${joined.name} » créée.\nCode d'invitation : ${joined.code}\n\nPartagez-le à vos équipiers pour qu'ils rejoignent l'équipe.`);
      openTeamPanel();
    } else if(signupMode === 'join' && joined){
      alert(`Vous avez rejoint « ${joined.name} ».\nL'admin doit vous affecter des catégories pour que vous y ayez accès.`);
    }
    signupMode = 'solo';
  }catch(err){
    showAuthError(signupError, err.message || 'Inscription impossible.');
  }finally{
    setBusy(signupForm, false);
  }
});

loginForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  showAuthError(loginError, '');
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const pass  = document.getElementById('loginPass').value;
  setBusy(loginForm, true, 'Connexion…');
  try{
    await srv.signIn(email, pass);
    loginForm.reset();
    await enterApp();
  }catch(err){
    const msg = /invalid login/i.test(err.message || '')
      ? 'E-mail ou mot de passe incorrect.' : (err.message || 'Connexion impossible.');
    showAuthError(loginError, msg);
  }finally{
    setBusy(loginForm, false);
  }
});



/* Charge le workspace complet depuis Supabase et ouvre l'app. */
/* Le catalogue évolue (nouveaux connecteurs métier) alors que le compte a un
   état figé en base : on part du catalogue et on ne reprend de l'état que ce
   qui appartient à l'utilisateur — installé ou non, et son statut. */
function mergeCatalog(saved){
  const bySaved = {};
  (saved || []).forEach(e=>{ bySaved[e.id] = e; });
  return EXT_CATALOG.map(ref=>{
    const s = bySaved[ref.id];
    if(!s) return JSON.parse(JSON.stringify(ref));
    return Object.assign({}, ref, { installed: !!s.installed, status: s.status || ref.status });
  });
}

async function enterApp(){
  leaveDemo();
  chatHistory = []; chatList.innerHTML = ''; chatSync();   // pas de conversation d'un autre compte
  const ws = await srv.loadWorkspace();
  currentUser = ws.profile;
  team        = ws.team;
  members     = ws.members;
  accessRows  = ws.access;
  state = {
    memos: ws.memos,
    reminders: ws.reminders,
    extensions: mergeCatalog(ws.extensions),
    categories: ws.categories,
    activeCat: null,
  };
  userProfession = await srv.currentProfession(ws.profile);
  storeProfession = null;
  state.activeCat = loadActiveCat();
  if(state.activeCat && !findCategory(state.activeCat)) state.activeCat = null;
  loginOverlay.hidden = true;
  refreshIdentity();
  showView('library');
}

async function logout(){
  await srv.signOut();
  currentUser = null; team = null; members = []; accessRows = [];
  state = blankState();
  detailOverlay.hidden = true;
  accountOverlay.hidden = true;
  teamOverlay.hidden = true;
  enterDemo();
}

/* ============ COMPTE ============ */
const accountOverlay = document.getElementById('accountOverlay');
const teamOverlay    = document.getElementById('teamOverlay');

function initials(name){
  return (name||'?').trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
}
function roleLabel(profile){
  if(!profile.team_id) return 'Compte solo';
  return profile.role === 'admin' ? "Admin d'équipe" : 'Équipier';
}

function refreshIdentity(){
  if(!currentUser) return;
  document.querySelector('.greeting').innerHTML = 'Bonjour <em>' + escapeHtml(currentUser.name) + '</em>';
}

function openAccountPanel(){
  if(requireAccount('Le compte et les réglages')) return;
  if(!currentUser) return;
  document.getElementById('accountAvatar').textContent = initials(currentUser.name);
  document.getElementById('accountName').textContent = currentUser.name;
  document.getElementById('accountEmail').textContent = currentUser.email;

  const rows = [
    ['Rôle', roleLabel(currentUser)],
    ['Équipe', team ? team.name : '—'],
  ];
  if(team) rows.push(["Code d'invitation", team.code]);
  if(team && !isAdmin()){
    const cats = teamCategories();
    rows.push(['Catégories autorisées', cats.length ? cats.map(c=>c.name).join(', ') : "Aucune — demandez l'accès à votre admin"]);
  }
  rows.push(['Mémos', String(state.memos.length)]);
  document.getElementById('accountRows').innerHTML = rows.map(([k,v])=>
    `<div class="account-row"><span>${escapeHtml(k)}</span><strong>${escapeHtml(v)}</strong></div>`).join('');

  document.getElementById('btnManageTeam').hidden = !(team && isAdmin());
  document.getElementById('btnCreateTeam').hidden = !!team;
  document.getElementById('btnJoinTeam').hidden = !!team;
  accountOverlay.hidden = false;
}

document.getElementById('btnAccount').addEventListener('click', openAccountPanel);
document.getElementById('accountClose').addEventListener('click', ()=> accountOverlay.hidden = true);
accountOverlay.addEventListener('click', (e)=>{ if(e.target===accountOverlay) accountOverlay.hidden = true; });
document.getElementById('btnLogout').addEventListener('click', ()=>{ logout().catch(err=>reportError(err,'Déconnexion')); });
document.getElementById('btnManageTeam').addEventListener('click', ()=>{ accountOverlay.hidden = true; openTeamPanel(); });

document.getElementById('btnCreateTeam').addEventListener('click', async ()=>{
  const name = await uiPrompt('Créer une équipe', { placeholder:"Nom de l'équipe", ok:'Créer' });
  if(name === null || !name.trim()) return;
  try{
    const t = await srv.createTeam(name.trim());
    await enterApp();               // rôle et périmètre ont changé : on recharge
    accountOverlay.hidden = true;
    alert(`Équipe « ${t.name} » créée.\nCode d'invitation : ${t.code}`);
    openTeamPanel();
  }catch(err){ reportError(err, "Création de l'équipe"); }
});

document.getElementById('btnJoinTeam').addEventListener('click', async ()=>{
  const code = await uiPrompt('Rejoindre une équipe', { placeholder:"Code d'invitation, ex. RICK-4821", ok:'Rejoindre' });
  if(code === null || !code.trim()) return;
  try{
    const t = await srv.joinTeam(code.trim());
    await enterApp();
    accountOverlay.hidden = true;
    alert(`Vous avez rejoint « ${t.name} ».\nL'admin doit vous affecter des catégories pour que vous y ayez accès.`);
  }catch(err){ reportError(err, "Impossible de rejoindre l'équipe"); }
});

/* ============ PANNEAU ÉQUIPE (admin) ============ */
function openTeamPanel(){
  if(!team || !isAdmin()){ alert("Seul l'admin de l'équipe peut ouvrir ce panneau."); return; }
  renderTeamPanel();
  teamOverlay.hidden = false;
}

function renderTeamPanel(){
  if(!team) return;
  document.getElementById('teamName').textContent = team.name;
  document.getElementById('teamCode').textContent = team.code;

  const cats = teamCategories();
  document.getElementById('teamCats').innerHTML = cats.length
    ? cats.map(c=>`<div class="team-cat" ${catColorStyle(c)}>
        <span class="team-cat-name">${c.deco || '🏷️'} ${escapeHtml(c.name)}</span>
        <span class="team-cat-actions">
          <button class="cat-icon-btn team-cat-edit" data-id="${c.id}" title="Modifier"><span class="mask-icon icon-edit"></span></button>
          <button class="cat-icon-btn team-cat-del" data-id="${c.id}" title="Supprimer"><span class="mask-icon icon-trash"></span></button>
        </span>
      </div>`).join('')
    : `<p class="detail-cat-hint">Aucune catégorie d'équipe pour l'instant.</p>`;

  document.getElementById('teamMemberCount').textContent = members.length;
  document.getElementById('teamMembers').innerHTML = members.map(mb=>{
    const admin = mb.role === 'admin';
    const boxes = cats.length
      ? cats.map(c=>{
          const on = admin || memberHasAccess(mb.id, c.id);
          return `<label class="team-access ${on?'on':''}">
            <input type="checkbox" data-member="${mb.id}" data-cat="${c.id}" ${on?'checked':''} ${admin?'disabled':''}>
            <span>${escapeHtml(c.name)}</span>
          </label>`;
        }).join('')
      : `<span class="detail-cat-hint">Créez d'abord une catégorie d'équipe.</span>`;
    return `<div class="team-member">
      <div class="team-member-head">
        <div class="account-avatar small">${initials(mb.name)}</div>
        <div class="team-member-id">
          <div class="team-member-name">${escapeHtml(mb.name)}${mb.id===currentUser.id?' (vous)':''}</div>
          <div class="team-member-mail">${escapeHtml(mb.email)}</div>
        </div>
        <span class="role-badge ${admin?'admin':''}">${admin?'Admin':'Équipier'}</span>
      </div>
      <div class="team-access-row">${admin ? `<span class="detail-cat-hint">Accès à toutes les catégories de l'équipe.</span>` : boxes}</div>
      ${admin ? '' : `<button class="team-role-btn" data-promote="${mb.id}">Promouvoir admin</button>`}
    </div>`;
  }).join('');

  document.querySelectorAll('#teamCats .team-cat-edit').forEach(b=>
    b.addEventListener('click', async ()=>{ await editCategory(b.dataset.id); renderTeamPanel(); }));
  document.querySelectorAll('#teamCats .team-cat-del').forEach(b=>
    b.addEventListener('click', async ()=>{ await deleteCategory(b.dataset.id); renderTeamPanel(); }));

  document.querySelectorAll('#teamMembers input[type=checkbox]').forEach(cb=>{
    cb.addEventListener('change', async ()=>{
      const memberId = cb.dataset.member, catId = cb.dataset.cat, allow = cb.checked;
      cb.disabled = true;
      try{
        await srv.setCategoryAccess(memberId, catId, allow);
        accessRows = accessRows.filter(a=>!(a.profile_id===memberId && a.category_id===catId));
        if(allow) accessRows.push({ profile_id:memberId, category_id:catId });
        renderTeamPanel();
      }catch(err){
        cb.checked = !allow; cb.disabled = false;
        reportError(err, "Modification des accès");
      }
    });
  });

  document.querySelectorAll('#teamMembers .team-role-btn').forEach(b=>{
    b.addEventListener('click', async ()=>{
      const member = members.find(a=>a.id===b.dataset.promote);
      if(!member) return;
      if(!await uiConfirm(`Donner le rôle admin à ${member.name} ?`, { message:"Il aura accès à toutes les catégories de l'équipe et pourra les gérer.", ok:'Donner le rôle' })) return;
      try{
        await srv.promoteMember(member.id);
        member.role = 'admin';
        renderTeamPanel();
      }catch(err){ reportError(err, 'Promotion'); }
    });
  });
}

document.getElementById('btnAddTeamCat').addEventListener('click', async ()=>{
  if(!team || !isAdmin()) return;
  const fields = promptCategoryFields('', '🏷️');
  if(!fields) return;
  try{
    const cat = await srv.createCategory({
      name: fields.name, icon: fields.icon, color: nextCustomColor(),
      forTeam: true, teamId: team.id, ownerId: currentUser.id,
    });
    state.categories.push(cat);
    renderTeamPanel();
    renderLibrary();
  }catch(err){ reportError(err, "Création de la catégorie d'équipe"); }
});

document.getElementById('teamClose').addEventListener('click', ()=>{ teamOverlay.hidden = true; renderLibrary(); });
teamOverlay.addEventListener('click', (e)=>{ if(e.target===teamOverlay){ teamOverlay.hidden = true; renderLibrary(); } });

/* ============ DÉMO SANS COMPTE ============
   L'app s'ouvre sur un jeu d'exemples : on peut tout parcourir avant de créer
   un compte. Rien ne part au serveur — le proxy `srv` ci-dessous est le
   garde-fou : en démo, aucun appel n'atteint Supabase, y compris si un nouveau
   point d'écriture est ajouté plus tard sans y penser. */
let demoMode = false;

const DEMO_PROFILE = {
  id: 'demo-user', name: 'Camille', email: 'demo@rickrecorder.com',
  role: null, team_id: null, profession: 'personnel',
};

/* Aucune écriture en démo : on renvoie ce que l'appelant attend (l'objet
   qu'il vient de composer, ou null) sans jamais toucher au réseau. */
const DEMO_STUBS = {
  createMemo: (draft)=> Promise.resolve(Object.assign({}, draft, {
    id: 'demo-' + Date.now().toString(36), authorId: DEMO_PROFILE.id, authorName: DEMO_PROFILE.name,
  })),
  createCategory: (fields)=> Promise.resolve(Object.assign({
    id: 'demo-cat-' + Date.now().toString(36), custom: true, team: false,
  }, fields)),
  addReminder: (r)=> Promise.resolve(Object.assign({ id: 'demo-rem-' + Date.now().toString(36) }, r)),
  createDevice: (label, kind, categoryId)=> Promise.resolve({
    id: 'demo-dev-' + Date.now().toString(36), label, kind, categoryId: categoryId || null, local: true,
  }),
  listDevices: ()=> Promise.resolve([]),
  currentProfession: ()=> Promise.resolve(DEMO_PROFILE.profession),
};

// La connexion part de la démo : elle doit toujours toucher le vrai backend.
const AUTH_KEYS = new Set(['signIn', 'signUp', 'currentSession']);

const srv = new Proxy({}, {
  get(_, key){
    if(!demoMode || AUTH_KEYS.has(key)) return api[key];
    if(DEMO_STUBS[key]) return DEMO_STUBS[key];
    const real = api[key];
    if(typeof real !== 'function') return real;   // .configured et consorts
    return ()=> Promise.resolve(null);            // toute écriture est absorbée
  },
});

function demoDate(daysAgo, h, m){
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
}

function demoWorkspace(){
  const cats = [
    { id:'demo-pro',     name:'Pro',     icon:'💼', deco:'💼', custom:false, team:false, ownerId:DEMO_PROFILE.id, teamId:null, color:null },
    { id:'demo-perso',   name:'Perso',   icon:'🧘', deco:'🧘', custom:false, team:false, ownerId:DEMO_PROFILE.id, teamId:null, color:null },
    { id:'demo-famille', name:'Famille', icon:'❤️', deco:'❤️', custom:false, team:false, ownerId:DEMO_PROFILE.id, teamId:null, color:null },
  ];
  const memo = (o)=> Object.assign({
    teamId:null, authorId:DEMO_PROFILE.id, authorName:DEMO_PROFILE.name,
    summary:'', actions:[], analyzed:true, transcribing:false, whisperFailed:false,
    usedTabAudio:false, hasAudio:false,
  }, o);
  const memos = [
    memo({
      id:'demo-m1', category:'demo-pro', title:'Rendez-vous avec Madame Ferrand',
      createdAt: demoDate(0, 9, 12), duration: 47,
      transcript:"Rendez-vous avec Madame Ferrand jeudi à quatorze heures pour lui présenter le devis révisé. Elle a demandé qu'on détaille la ligne installation, elle trouve le forfait trop opaque. Penser à préparer une version avec le détail heure par heure, et à lui renvoyer l'attestation d'assurance qu'elle réclame depuis la semaine dernière.",
      summary:"Préparer le devis révisé pour Mme Ferrand avec le détail de la ligne installation, et joindre l'attestation d'assurance.",
      actions:['Devis détaillé jeudi 14 h', "Envoyer l'attestation d'assurance"],
    }),
    memo({
      id:'demo-m2', category:'demo-pro', title:'Réunion équipe commerciale',
      createdAt: demoDate(0, 8, 5), duration: 132,
      transcript:"Réunion équipe commerciale de ce matin. On a acté le passage à deux relances au lieu de trois, la troisième ne convertissait plus. Thomas reprend le portefeuille Nord à partir du premier du mois. Il faut que je remonte les chiffres du trimestre à la direction avant vendredi, avec le détail par région.",
      summary:"Deux relances au lieu de trois, Thomas reprend le Nord, chiffres trimestriels à remonter avant vendredi.",
      actions:['Chiffres du trimestre avant vendredi', 'Portefeuille Nord → Thomas'],
    }),
    memo({
      id:'demo-m3', category:'demo-perso', title:'Rappeler le garage',
      createdAt: demoDate(1, 18, 40), duration: 21,
      transcript:"Penser à rappeler le garage pour la révision, ils avaient dit de les relancer en fin de semaine. Demander si la pièce est arrivée, sinon voir s'ils peuvent la commander ailleurs parce que ça traîne depuis trois semaines.",
      summary:"Relancer le garage : révision, et savoir si la pièce est enfin arrivée.",
      actions:['Rappeler le garage'],
    }),
    memo({
      id:'demo-m4', category:'demo-famille', title:'Anniversaire de Léa',
      createdAt: demoDate(2, 21, 15), duration: 63,
      transcript:"Anniversaire de Léa le vingt-trois. On part sur un goûter à la maison, une dizaine d'enfants. Réserver le gâteau à la boulangerie, elle veut du chocolat cette fois. Voir avec les parents de Nino s'ils peuvent rester un peu pour aider, et racheter des bougies, il n'en reste plus.",
      summary:"Goûter d'anniversaire pour Léa le 23 : gâteau au chocolat à réserver, bougies à racheter.",
      actions:['Réserver le gâteau', 'Racheter des bougies'],
    }),
    memo({
      id:'demo-m5', category:'demo-pro', title:'Visite 12 rue des Lilas',
      createdAt: demoDate(3, 11, 30), duration: 96,
      transcript:"Visite du douze rue des Lilas. Trois pièces, soixante-huit mètres carrés, deuxième étage sans ascenseur. La cuisine est à refaire entièrement, la salle de bain a été rénovée l'an dernier. Les propriétaires sont pressés de vendre, ils acceptent de discuter du prix. Bonne exposition, calme sur cour.",
      summary:"Trois pièces de 68 m², cuisine à refaire, vendeurs pressés et ouverts à la négociation.",
      actions:['Faire une proposition', 'Chiffrer la cuisine'],
    }),
    memo({
      id:'demo-m6', category:'demo-perso', title:'Idée pour le week-end',
      createdAt: demoDate(5, 20, 2), duration: 34,
      transcript:"Idée pour le week-end prochain : partir marcher dans le Vercors, il paraît que la météo tient jusqu'à dimanche. Vérifier s'il reste de la place au refuge, sinon on part à la journée. Ressortir les chaussures du garage, elles doivent être au fond à droite.",
      summary:"Week-end de marche dans le Vercors : vérifier le refuge, ressortir les chaussures.",
      actions:['Vérifier le refuge'],
    }),
  ];
  return { profile: DEMO_PROFILE, team: null, members: [], access: [], categories: cats, memos, reminders: [], extensions: [] };
}

/* ---- popup de connexion ---- */
let demoTimer = null, demoElapsed = 0;
const DEMO_PROMPT_MS = 10000;   // 10 s d'utilisation réelle, onglet au premier plan

function startDemoTimer(){
  stopDemoTimer();
  let last = Date.now();
  demoTimer = setInterval(()=>{
    const now = Date.now();
    // On ne compte que le temps passé sur l'onglet : dix secondes d'utilisation,
    // pas dix secondes d'horloge dans un onglet oublié en arrière-plan.
    if(document.visibilityState === 'visible') demoElapsed += now - last;
    last = now;
    if(demoElapsed >= DEMO_PROMPT_MS){
      stopDemoTimer();
      openLoginPopup("Vous naviguez sur une démo. Créez votre compte pour enregistrer vos propres mémos — ils vous suivront sur tous vos appareils.");
    }
  }, 500);
}
function stopDemoTimer(){
  if(demoTimer){ clearInterval(demoTimer); demoTimer = null; }
}

/* Le même panneau sert d'accueil et de relance ; en démo il est refermable. */
function openLoginPopup(note){
  document.getElementById('loginNote').textContent = note
    || 'Chaque compte a ses propres mémos, synchronisés sur tous vos appareils.';
  document.getElementById('loginClose').hidden = !demoMode;
  loginOverlay.classList.toggle('is-demo', demoMode);
  loginOverlay.hidden = false;
}
function closeLoginPopup(){
  if(!demoMode) return;      // sans démo derrière, il n'y a rien à refermer
  loginOverlay.hidden = true;
}

/* Tout geste qui écrirait vraiment renvoie vers la création de compte. */
function requireAccount(what){
  if(!demoMode) return false;
  stopDemoTimer();
  openLoginPopup(what + " demande un compte. C'est gratuit et il ne faut qu'un e-mail.");
  return true;
}

function enterDemo(){
  demoMode = true;
  demoElapsed = 0;
  const ws = demoWorkspace();
  currentUser = ws.profile;
  team = null; members = []; accessRows = [];
  state = {
    memos: ws.memos,
    reminders: ws.reminders,
    extensions: mergeCatalog(ws.extensions),
    categories: ws.categories,
    activeCat: null,
  };
  userProfession = DEMO_PROFILE.profession;
  storeProfession = null;
  loginOverlay.hidden = true;
  document.body.classList.add('is-demo');
  refreshIdentity();
  showView('library');
  startDemoTimer();
}

function leaveDemo(){
  demoMode = false;
  stopDemoTimer();
  document.body.classList.remove('is-demo');
  loginOverlay.classList.remove('is-demo');
  document.getElementById('loginClose').hidden = true;
}

/* ---- points d'entrée vers la connexion ---- */
document.getElementById('btnLogin').addEventListener('click', ()=>{
  stopDemoTimer();
  openLoginPopup('Retrouvez vos mémos, ou créez votre compte en quelques secondes.');
});
document.getElementById('loginClose').addEventListener('click', closeLoginPopup);
loginOverlay.addEventListener('click', (e)=>{ if(e.target === loginOverlay) closeLoginPopup(); });
document.addEventListener('keydown', (e)=>{
  if(e.key === 'Escape' && !loginOverlay.hidden) closeLoginPopup();
});

/* ============ INIT ============ */
function showSetupNeeded(){
  loginOverlay.hidden = false;
  loginForm.hidden = true;
  signupForm.hidden = true;
  document.querySelector('.auth-tabs').hidden = true;
  document.getElementById('loginNote').hidden = true;
  showAuthError(document.getElementById('setupError'),
    "Backend non configuré. Exécute supabase/schema.sql dans le SQL Editor de ton projet Supabase, "
    + "puis renseigne l'URL du projet et la clé anon dans config.js.");
  showView('library');
}

async function boot(){
  if(!srv.configured){ showSetupNeeded(); return; }
  try{
    const session = await srv.currentSession();
    if(session){ await enterApp(); return; }
  }catch(err){
    console.error('[rick] session', err);
  }
  // Pas de session : on ouvre la démo plutôt qu'un mur de connexion.
  enterDemo();
}
boot();

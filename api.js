/* ============================================================================
   Couche d'accès aux données — Supabase
   Tout passe par ici : authentification, workspace, CRUD, audio.
   Les règles d'accès (qui voit quelle catégorie) sont appliquées par la RLS
   côté serveur ; ce fichier ne fait que les refléter dans l'interface.
============================================================================ */
const api = (() => {
  const cfg = window.RICK_CONFIG || {};
  const configured = !!(cfg.supabaseUrl && cfg.supabaseAnonKey);
  let client = null;

  if(configured){
    if(!window.supabase || !window.supabase.createClient){
      console.error('[rick] supabase-js non chargé');
    } else {
      client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
        auth: { persistSession: true, autoRefreshToken: true },
      });
    }
  }

  function need(){
    if(!client) throw new Error("Backend non configuré : renseigne config.js.");
    return client;
  }
  function fail(error, fallback){
    if(!error) return;
    console.error('[rick]', error);
    throw new Error(error.message || fallback || 'Erreur serveur');
  }

  /* ------------------------------------------------------------ mappings -- */
  // Le front travaille en camelCase, la base en snake_case.
  function memoFromRow(r){
    return {
      id: r.id,
      teamId: r.team_id,
      authorId: r.owner_id,
      authorName: r.author_name || '',
      category: r.category_id,
      title: r.title,
      transcript: r.transcript,
      summary: r.summary,
      actions: r.actions || [],
      analyzed: r.analyzed,
      transcribing: r.transcribing,
      whisperFailed: r.whisper_failed,
      usedTabAudio: r.used_tab_audio,
      hasAudio: r.has_audio,
      duration: r.duration,
      createdAt: r.created_at,
    };
  }
  const MEMO_COLUMNS = {
    category:'category_id', teamId:'team_id', title:'title', transcript:'transcript',
    summary:'summary', actions:'actions', analyzed:'analyzed', transcribing:'transcribing',
    whisperFailed:'whisper_failed', usedTabAudio:'used_tab_audio', hasAudio:'has_audio',
    duration:'duration',
  };
  function memoPatchToRow(patch){
    const row = {};
    for(const [k,v] of Object.entries(patch)){
      if(MEMO_COLUMNS[k]) row[MEMO_COLUMNS[k]] = v;
    }
    return row;
  }
  function catFromRow(r){
    return {
      id: r.id, name: r.name, icon: r.icon, deco: r.deco,
      color: r.color || null, custom: r.custom,
      team: !!r.team_id, ownerId: r.owner_id, teamId: r.team_id,
    };
  }

  /* ---------------------------------------------------------------- auth -- */
  async function signUp({ name, email, password, profession }){
    // La profession part dans raw_user_meta_data : le trigger SQL la recopie
    // dans profiles.profession quand la colonne existe, et l'app sait la lire
    // depuis la session même si la migration n'est pas encore passée.
    const { data, error } = await need().auth.signUp({
      email, password, options:{ data:{ name, profession: profession || 'personnel' } },
    });
    fail(error);
    // Si la confirmation d'e-mail est activée, il n'y a pas encore de session.
    return { user: data.user, session: data.session };
  }

  async function signIn(email, password){
    const { data, error } = await need().auth.signInWithPassword({ email, password });
    fail(error);
    return data.session;
  }

  // Connexion Google : Supabase redirige vers Google puis revient sur la page
  // courante avec la session dans l'URL, que supabase-js récupère tout seul.
  // L'adresse de retour doit figurer dans Authentication > URL Configuration.
  async function signInWithGoogle(){
    // Sans provider actif, Supabase afficherait une page d'erreur brute :
    // on vérifie d'abord dans les réglages publics du projet.
    const res = await fetch(cfg.supabaseUrl + '/auth/v1/settings', { headers:{ apikey: cfg.supabaseAnonKey } });
    const settings = res.ok ? await res.json() : null;
    if(settings && !(settings.external || {}).google) throw new Error('provider is not enabled');
    const redirectTo = location.origin + location.pathname;
    const { error } = await need().auth.signInWithOAuth({
      provider: 'google', options: { redirectTo },
    });
    fail(error);
  }

  /* -------------------------------------------------------------- chat -- */
  // Pose une question sur tous les mémos : la fonction rick-chat relit les
  // mémos côté serveur et renvoie la réponse de Claude en flux texte.
  async function askRick(messages, onChunk){
    const { data } = await need().auth.getSession();
    const token = data.session && data.session.access_token;
    if(!token) throw new Error('Session expirée, reconnectez-vous.');
    const res = await fetch(cfg.supabaseUrl + '/functions/v1/rick-chat', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + token, apikey: cfg.supabaseAnonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if(!res.ok){
      let msg = 'Rick ne répond pas (' + res.status + ').';
      try{ const j = await res.json(); if(j.error) msg = j.error; }catch(_){}
      if(res.status === 404) msg = "Le chat n'est pas encore installé sur le serveur.";
      throw new Error(msg);
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let full = '';
    for(;;){
      const { value, done } = await reader.read();
      if(done) break;
      const piece = dec.decode(value, { stream: true });
      full += piece;
      onChunk(full);
    }
    return full;
  }

  async function signOut(){
    if(client) await client.auth.signOut();
  }

  async function currentSession(){
    if(!client) return null;
    const { data } = await client.auth.getSession();
    return data.session || null;
  }

  function onAuthChange(cb){
    if(!client) return;
    client.auth.onAuthStateChange((event, session)=> cb(event, session));
  }

  /* ----------------------------------------------------------- workspace -- */
  // Un seul appel au démarrage : profil, équipe, coéquipiers, droits,
  // catégories visibles, mémos visibles, rappels.
  async function loadWorkspace(){
    const db = need();
    const { data: auth } = await db.auth.getUser();
    if(!auth || !auth.user) throw new Error('Session expirée.');

    const { data: profile, error: pErr } = await db
      .from('profiles').select('*').eq('id', auth.user.id).maybeSingle();
    fail(pErr);
    if(!profile) throw new Error("Profil introuvable. Le schéma SQL a-t-il bien été exécuté ?");

    let team = null, members = [], access = [];
    if(profile.team_id){
      const { data: t, error: tErr } = await db
        .from('teams').select('*').eq('id', profile.team_id).maybeSingle();
      fail(tErr);
      team = t;

      const { data: m, error: mErr } = await db
        .from('profiles').select('id,email,name,role,team_id')
        .eq('team_id', profile.team_id).order('created_at');
      fail(mErr);
      members = m || [];

      const { data: a, error: aErr } = await db.from('category_access').select('*');
      fail(aErr);
      access = a || [];
    }

    // RLS : ne remonte que les catégories réellement autorisées.
    const { data: cats, error: cErr } = await db
      .from('categories').select('*').order('created_at');
    fail(cErr);

    const { data: memoRows, error: meErr } = await db
      .from('memos').select('*').order('created_at', { ascending:false });
    fail(meErr);

    // Nom de l'auteur pour les mémos partagés (les profils visibles suffisent).
    const nameById = new Map(members.map(m=>[m.id, m.name]));
    nameById.set(profile.id, profile.name);
    const memos = (memoRows||[]).map(r=> memoFromRow({ ...r, author_name: nameById.get(r.owner_id) || 'Équipier' }));

    const { data: reminders, error: rErr } = await db
      .from('reminders').select('*').order('created_at');
    fail(rErr);

    return {
      profile, team, members, access,
      categories: (cats||[]).map(catFromRow),
      memos,
      reminders: (reminders||[]).map(r=>({ id:r.id, name:r.name, lat:r.lat, lng:r.lng })),
      extensions: Array.isArray(profile.extensions) && profile.extensions.length ? profile.extensions : null,
    };
  }

  /* ---------------------------------------------------------- catégories -- */
  async function createCategory({ name, icon, color, forTeam, teamId, ownerId }){
    const row = {
      name, icon, deco: icon, color, custom: true,
      owner_id: forTeam ? null : ownerId,
      team_id:  forTeam ? teamId : null,
    };
    const { data, error } = await need().from('categories').insert(row).select().single();
    fail(error);
    return catFromRow(data);
  }
  async function updateCategory(id, { name, icon }){
    const { data, error } = await need().from('categories')
      .update({ name, icon, deco: icon }).eq('id', id).select().single();
    fail(error);
    return catFromRow(data);
  }
  async function deleteCategory(id){
    const { error } = await need().from('categories').delete().eq('id', id);
    fail(error);
  }

  /* --------------------------------------------------------------- équipe -- */
  async function createTeam(name){
    const { data, error } = await need().rpc('create_team', { team_name: name });
    fail(error);
    return Array.isArray(data) ? data[0] : data;
  }
  async function joinTeam(code){
    const { data, error } = await need().rpc('join_team', { invite_code: code });
    fail(error);
    return Array.isArray(data) ? data[0] : data;
  }
  async function promoteMember(memberId){
    const { error } = await need().rpc('promote_member', { member: memberId });
    fail(error);
  }
  async function setCategoryAccess(memberId, categoryId, allow){
    const db = need();
    if(allow){
      const { error } = await db.from('category_access')
        .upsert({ category_id: categoryId, profile_id: memberId });
      fail(error);
    } else {
      const { error } = await db.from('category_access').delete()
        .eq('category_id', categoryId).eq('profile_id', memberId);
      fail(error);
    }
  }

  /* --------------------------------------------------------------- mémos -- */
  async function createMemo(memo, ownerId){
    const row = {
      owner_id: ownerId,
      team_id: memo.teamId || null,
      category_id: memo.category || null,
      title: memo.title, transcript: memo.transcript, summary: memo.summary || '',
      actions: memo.actions || [], analyzed: !!memo.analyzed,
      transcribing: !!memo.transcribing, whisper_failed: !!memo.whisperFailed,
      used_tab_audio: !!memo.usedTabAudio, has_audio: !!memo.hasAudio,
      duration: Math.round(memo.duration || 0),
    };
    const { data, error } = await need().from('memos').insert(row).select().single();
    fail(error);
    return memoFromRow(data);
  }
  async function updateMemo(id, patch){
    const row = memoPatchToRow(patch);
    if(!Object.keys(row).length) return;
    const { error } = await need().from('memos').update(row).eq('id', id);
    fail(error);
  }
  async function deleteMemo(id){
    const { error } = await need().from('memos').delete().eq('id', id);
    fail(error);
  }

  /* ------------------------------------------------------------- rappels -- */
  async function addReminder({ name, lat, lng }, ownerId){
    const { data, error } = await need().from('reminders')
      .insert({ owner_id: ownerId, name, lat, lng }).select().single();
    fail(error);
    return { id:data.id, name:data.name, lat:data.lat, lng:data.lng };
  }
  async function deleteReminder(id){
    const { error } = await need().from('reminders').delete().eq('id', id);
    fail(error);
  }

  /* ---------------------------------------------------------- extensions -- */
  async function saveExtensions(list, ownerId){
    const { error } = await need().from('profiles')
      .update({ extensions: list }).eq('id', ownerId);
    fail(error);
  }
  async function updateName(name, ownerId){
    const { error } = await need().from('profiles').update({ name }).eq('id', ownerId);
    fail(error);
  }

  /* ------------------------------------------------- jeton de streaming -- */
  // Appelle l'Edge Function qui détient la clé AssemblyAI côté serveur.
  async function getStreamingToken(){
    const { data, error } = await need().functions.invoke('assemblyai-token', { body:{} });
    if(error) throw new Error(error.message || 'jeton de transcription indisponible');
    if(!data || !data.token) throw new Error((data && data.error) || 'jeton vide');
    return data.token;
  }

  /* --------------------------------------------------------------- audio -- */
  const BUCKET = 'memo-audio';
  // Extension fixe : le conteneur réel (webm sur Chrome, mp4 sur Safari) est porté
  // par le content-type du fichier, pas par son nom. Les policies du bucket
  // s'appuient sur la partie avant le point pour retrouver le mémo.
  function audioPath(memoId){ return `${memoId}.audio`; }

  async function uploadAudio(memoId, blob){
    const { error } = await need().storage.from(BUCKET)
      .upload(audioPath(memoId), blob, { upsert:true, contentType: blob.type || 'audio/webm' });
    fail(error);
  }
  async function downloadAudio(memoId){
    const { data, error } = await need().storage.from(BUCKET).download(audioPath(memoId));
    if(error) return null;
    return data;
  }
  // Transcription d'un audio importé : la fonction relit le fichier dans le bucket.
  async function transcribeImported(memoId){
    const { data, error } = await need().functions.invoke('transcribe-audio', { body:{ memoId } });
    if(error){
      let msg = error.message;
      try{ const j = await error.context.json(); if(j && j.error) msg = j.error; }catch(_){}
      throw new Error(msg);
    }
    return data.text || '';
  }
  async function removeAudio(memoId){
    try{ await need().storage.from(BUCKET).remove([audioPath(memoId)]); }catch(e){}
  }

  /* ------------------------------------------------------- appareils Rick --
     Table `devices` (voir patch-002.sql). Tant que la migration n'est pas
     passée, Postgres répond « relation does not exist » (42P01) : on bascule
     alors sur un stockage local, pour que la fonctionnalité marche quand même.
  */
  const DEV_LOCAL = 'rick_devices_';
  /* PostgREST ne remonte pas le code Postgres 42P01 : quand la table manque
     dans son cache de schéma il répond PGRST205. On accepte les deux. */
  function devMissing(error){
    if(!error) return false;
    if(error.code === '42P01' || error.code === 'PGRST205') return true;
    return /(?:relation|table).*devices.*(?:does not exist|schema cache)/i.test(error.message || '');
  }
  function localDevices(ownerId){
    try{ return JSON.parse(localStorage.getItem(DEV_LOCAL+ownerId) || '[]'); }catch(e){ return []; }
  }
  function saveLocalDevices(ownerId, list){
    try{ localStorage.setItem(DEV_LOCAL+ownerId, JSON.stringify(list)); }catch(e){}
  }
  function devFromRow(r){
    return { id:r.id, label:r.label, kind:r.kind, categoryId:r.category_id || null, local:false };
  }

  async function listDevices(ownerId, teamId){
    let q = need().from('devices').select('*').order('created_at');
    q = teamId ? q.or(`owner_id.eq.${ownerId},team_id.eq.${teamId}`) : q.eq('owner_id', ownerId);
    const { data, error } = await q;
    if(devMissing(error)) return { rows: localDevices(ownerId), degraded: true };
    fail(error);
    return { rows: (data||[]).map(devFromRow), degraded: false };
  }
  /* Un appareil créé en local avant la migration doit rester visible après :
     createDevice retombe déjà sur localStorage, et listDevices fusionne. */
  async function createDevice({ label, kind, categoryId, ownerId, teamId }){
    const row = { label, kind, category_id: categoryId || null, owner_id: ownerId, team_id: teamId || null };
    const { data, error } = await need().from('devices').insert(row).select().single();
    if(devMissing(error)){
      const list = localDevices(ownerId);
      const dev = { id:'local-'+Date.now().toString(36), label, kind, categoryId: categoryId||null, local:true };
      list.push(dev); saveLocalDevices(ownerId, list);
      return dev;
    }
    fail(error);
    return devFromRow(data);
  }
  async function updateDevice(id, { label, kind, categoryId }, ownerId){
    if(String(id).startsWith('local-')){
      const list = localDevices(ownerId).map(d=>d.id===id ? Object.assign({}, d, { label, kind, categoryId }) : d);
      saveLocalDevices(ownerId, list);
      return list.find(d=>d.id===id);
    }
    const patch = { label, kind };
    if(categoryId !== undefined) patch.category_id = categoryId;
    const { data, error } = await need().from('devices').update(patch).eq('id', id).select().single();
    if(devMissing(error)) return null;
    fail(error);
    return devFromRow(data);
  }
  async function deleteDevice(id, ownerId){
    if(String(id).startsWith('local-')){
      saveLocalDevices(ownerId, localDevices(ownerId).filter(d=>d.id!==id));
      return;
    }
    const { error } = await need().from('devices').delete().eq('id', id);
    if(devMissing(error)) return;
    fail(error);
  }

  /* Profession du compte : colonne profiles.profession si la migration est
     passée, sinon les métadonnées de la session. */
  async function currentProfession(profileRow){
    if(profileRow && profileRow.profession) return profileRow.profession;
    try{
      const { data } = await need().auth.getUser();
      return (data && data.user && data.user.user_metadata && data.user.user_metadata.profession) || 'personnel';
    }catch(e){ return 'personnel'; }
  }

  return {
    configured,
    currentProfession,
    listDevices, createDevice, updateDevice, deleteDevice,
    signUp, signIn, signInWithGoogle, signOut, askRick, currentSession, onAuthChange,
    loadWorkspace,
    createCategory, updateCategory, deleteCategory,
    createTeam, joinTeam, promoteMember, setCategoryAccess,
    createMemo, updateMemo, deleteMemo,
    addReminder, deleteReminder,
    saveExtensions, updateName,
    getStreamingToken,
    uploadAudio, downloadAudio, removeAudio, transcribeImported,
  };
})();

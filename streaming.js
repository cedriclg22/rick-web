/* ============================================================================
   Transcription live — AssemblyAI Universal Streaming (v3)
   ----------------------------------------------------------------------------
   Deux niveaux de séparation des voix, combinés :

   1. Par la source. Pendant une visio on capte DEUX pistes distinctes — le micro
      (vous) et le son de l'onglet partagé (vos interlocuteurs) — et on ouvre une
      session par piste. Votre voix ne peut donc jamais être confondue avec la
      leur : c'est garanti par le câblage audio, pas par un modèle.

   2. Par la diarisation. Sur la piste visio, où plusieurs personnes se partagent
      un seul flux, on active speaker_labels : AssemblyAI étiquette chaque tour
      de parole (A, B, C…). Inutile sur le micro, où il n'y a qu'une personne.

   Format attendu par l'API : PCM 16 bits little-endian, mono, 16 kHz,
   en trames binaires de 50 à 1000 ms.
============================================================================ */
const liveSTT = (() => {
  const WS_BASE     = 'wss://streaming.assemblyai.com/v3/ws';
  const SAMPLE_RATE = 16000;
  const CHUNK_SAMPLES = 800;           // 50 ms

  function conf(){ return (window.RICK_CONFIG || {}).assemblyai || {}; }
  // Sans langue épinglée, le modèle la devine par session — et dérive parfois
  // vers l'anglais sur un flux court ou bruité.
  function languageCodes(){ return conf().languageCodes || 'fr'; }
  function isLocalhost(){
    return ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
  }
  function available(){
    const c = conf();
    return !!(c.tokenUrl || c.useSupabaseFunction);
  }

  /* -------------------------------------------------------------- token -- */
  // Le jeton ne peut PAS être demandé depuis le navigateur : l'endpoint
  // d'AssemblyAI ne renvoie aucun en-tête CORS, et la clé n'a de toute façon
  // rien à faire dans le front. Il faut donc un intermédiaire côté serveur :
  //   - en production : l'Edge Function Supabase "assemblyai-token" ;
  //   - en local      : /aai-token du serveur whisper-server (la clé est dans
  //                     whisper-server/.env).
  async function getToken(){
    const c = conf();

    // `api` est un const de module, pas une propriété de window : on teste le nom
    const dataApi = (typeof api !== 'undefined') ? api : null;
    if(c.useSupabaseFunction && dataApi && dataApi.getStreamingToken){
      return await dataApi.getStreamingToken();
    }

    if(c.tokenUrl){
      let res;
      try{
        res = await fetch(c.tokenUrl, { method:'POST' });
      }catch(e){
        throw new Error("serveur de jetons injoignable — lance ./whisper-server/start.sh");
      }
      const data = await res.json().catch(()=>({}));
      if(!res.ok || !data.token){
        throw new Error(data.error || `jeton refusé (${res.status})`);
      }
      return data.token;
    }

    throw new Error("AssemblyAI non configuré (config.js / config.local.js).");
  }

  /* ------------------------------------------------- capture PCM 16 kHz -- */
  const WORKLET_SRC = `
    class Pcm16Worklet extends AudioWorkletProcessor {
      constructor(){ super(); this.buf = new Int16Array(${CHUNK_SAMPLES}); this.n = 0; this.on = true;
        this.port.onmessage = (e)=>{ if(e.data && 'on' in e.data) this.on = e.data.on; }; }
      process(inputs){
        const ch = inputs[0] && inputs[0][0];
        if(!ch || !this.on) return true;
        for(let i=0;i<ch.length;i++){
          const s = Math.max(-1, Math.min(1, ch[i]));
          this.buf[this.n++] = s < 0 ? s * 0x8000 : s * 0x7fff;
          if(this.n === this.buf.length){
            const out = new Int16Array(this.buf);
            this.port.postMessage(out.buffer, [out.buffer]);
            this.n = 0;
          }
        }
        return true;
      }
    }
    registerProcessor('pcm16-worklet', Pcm16Worklet);
  `;

  // L'enregistrement d'un worklet est propre à chaque AudioContext : mémoriser
  // une seule promesse globale ferait échouer la 2e session (celle de la visio),
  // qui retomberait sans bruit sur le ScriptProcessor déprécié.
  const workletReady = new WeakMap();
  function ensureWorklet(ctx){
    if(!ctx.audioWorklet) return Promise.reject(new Error('no audioWorklet'));
    if(!workletReady.has(ctx)){
      const url = URL.createObjectURL(new Blob([WORKLET_SRC], { type:'application/javascript' }));
      workletReady.set(ctx, ctx.audioWorklet.addModule(url).finally(()=>URL.revokeObjectURL(url)));
    }
    return workletReady.get(ctx);
  }

  /* Regroupe les mots consécutifs d'un même locuteur en blocs de texte. */
  function groupWordsBySpeaker(words){
    if(!Array.isArray(words) || !words.length) return null;
    const groups = [];
    for(const w of words){
      if(!w || !w.text) continue;
      // 'PENDING' = locuteur pas encore tranché, 'UNKNOWN' = non attribué :
      // dans les deux cas le mot se rattache au bloc en cours plutôt que de
      // créer un faux locuteur.
      const raw = (w.speaker || '').toUpperCase();
      const speaker = (raw && raw !== 'UNKNOWN' && raw !== 'PENDING') ? w.speaker : null;
      const last = groups[groups.length-1];
      // un mot non attribué reste rattaché au bloc en cours
      if(last && (speaker === null || last.speaker === speaker)) last.words.push(w.text);
      else groups.push({ speaker, words:[w.text] });
    }
    return groups.map(g=>({ speaker:g.speaker, text:g.words.join(' ').trim() })).filter(g=>g.text);
  }

  /* ------------------------------------------------------------ session -- */
  /**
   * Ouvre une session de transcription pour un MediaStream donné.
   * @param {MediaStream} stream  la piste à transcrire (micro OU son d'onglet)
   * @param {object} handlers     { onPartial(text), onFinal(text), onError(err), onOpen() }
   * @returns {Promise<{stop, setPaused, close}>}
   */
  async function open(stream, handlers = {}, options = {}){
    const token = await getToken();
    const params = new URLSearchParams({
      token,
      sample_rate: String(SAMPLE_RATE),
      encoding: 'pcm_s16le',
      format_turns: 'true',
      language_codes: languageCodes(),
    });
    // Diarisation : réservée aux flux à plusieurs voix (le son de la visio).
    if(options.speakerLabels){
      params.set('speaker_labels', 'true');
      params.set('max_speakers', String(options.maxSpeakers || 4));
    }

    const ws = new WebSocket(`${WS_BASE}?${params}`);
    ws.binaryType = 'arraybuffer';

    const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
    const source = ctx.createMediaStreamSource(stream);
    let node = null, paused = false, closed = false;
    const pending = [];   // trames produites avant l'ouverture du socket

    function send(buffer){
      if(paused || closed) return;
      if(ws.readyState === WebSocket.OPEN) ws.send(buffer);
      else if(ws.readyState === WebSocket.CONNECTING && pending.length < 200) pending.push(buffer);
    }

    try{
      await ensureWorklet(ctx);
      node = new AudioWorkletNode(ctx, 'pcm16-worklet');
      node.port.onmessage = (e)=> send(e.data);
      source.connect(node);
      // un worklet sans sortie connectée peut être mis en veille : on le relie
      // à une destination muette pour garantir qu'il continue de tourner
      const mute = ctx.createGain();
      mute.gain.value = 0;
      node.connect(mute).connect(ctx.destination);
    }catch(e){
      // repli ScriptProcessor pour les navigateurs sans AudioWorklet
      node = ctx.createScriptProcessor(2048, 1, 1);
      node.onaudioprocess = (ev)=>{
        const ch = ev.inputBuffer.getChannelData(0);
        const out = new Int16Array(ch.length);
        for(let i=0;i<ch.length;i++){
          const s = Math.max(-1, Math.min(1, ch[i]));
          out[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }
        send(out.buffer);
      };
      source.connect(node);
      const mute = ctx.createGain();
      mute.gain.value = 0;
      node.connect(mute).connect(ctx.destination);
    }

    ws.addEventListener('open', ()=>{
      while(pending.length) ws.send(pending.shift());
      handlers.onOpen && handlers.onOpen();
    });

    ws.addEventListener('message', (ev)=>{
      let msg;
      try{ msg = JSON.parse(ev.data); }catch(e){ return; }
      if(msg.type === 'Turn'){
        const text = (msg.transcript || '').trim();
        if(!text) return;
        // speaker_label vaut 'A', 'B', … (ou 'UNKNOWN') quand la diarisation est active
        const turnWho = msg.speaker_label && msg.speaker_label !== 'UNKNOWN' ? msg.speaker_label : null;

        if(msg.end_of_turn){
          // Le speaker_label du tour désigne la voix dominante : quand deux
          // personnes s'enchaînent sans blanc, le tour entier serait attribué à
          // une seule. On découpe donc sur le locuteur mot à mot.
          const groups = options.speakerLabels ? groupWordsBySpeaker(msg.words) : null;
          if(groups && groups.length > 1){
            groups.forEach(g=> handlers.onFinal && handlers.onFinal(g.text, g.speaker || turnWho));
          } else {
            const who = (groups && groups[0] && groups[0].speaker) || turnWho;
            handlers.onFinal && handlers.onFinal(text, who);
          }
        } else {
          handlers.onPartial && handlers.onPartial(text, turnWho);
        }
      } else if(msg.type === 'Error' || msg.error){
        handlers.onError && handlers.onError(new Error(msg.error || 'erreur AssemblyAI'));
      }
    });

    ws.addEventListener('error', ()=>{
      handlers.onError && handlers.onError(new Error('connexion AssemblyAI interrompue'));
    });

    // Une fermeture non sollicitée en cours d'enregistrement — jeton refusé,
    // réseau coupé, quota — ne déclenche pas forcément 'error'. Sans ce
    // gardien, la transcription se fige sans que rien ne le signale.
    ws.addEventListener('close', (ev)=>{
      if(closed || ev.code === 1000) return;
      handlers.onError && handlers.onError(
        new Error('session fermée (' + ev.code + (ev.reason ? ' — ' + ev.reason : '') + ')'));
    });

    function setPaused(p){
      paused = p;
      if(node && node.port) node.port.postMessage({ on: !p });
    }

    function teardown(){
      if(closed) return;
      closed = true;
      try{ if(node) node.disconnect(); }catch(e){}
      try{ source.disconnect(); }catch(e){}
      try{ ctx.close(); }catch(e){}
    }

    // Terminate laisse le serveur renvoyer le dernier tour avant de fermer.
    function stop(){
      try{
        if(ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify({ type:'Terminate' }));
      }catch(e){}
      teardown();
      setTimeout(()=>{ try{ ws.close(); }catch(e){} }, 1500);
    }

    return { stop, setPaused, close: ()=>{ teardown(); try{ ws.close(); }catch(e){} } };
  }

  return { available, open, isLocalhost };
})();

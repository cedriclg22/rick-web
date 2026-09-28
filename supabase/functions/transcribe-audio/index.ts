// Edge Function : transcrit un audio importé (fichier déposé par l'utilisateur).
//
// Le navigateur a déjà envoyé le fichier dans le bucket memo-audio sous
// `<memoId>.audio`. On le relit avec le jeton de l'appelant (les policies du
// bucket vérifient qu'il a accès au mémo), puis on l'envoie à OpenAI.
// Déploiement :
//   supabase functions deploy transcribe-audio
//   (utilise le secret OPENAI_API_KEY, déjà posé pour rick-chat)

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });

// Le plus précis d'abord ; whisper-1 en secours si le compte n'y a pas accès.
const MODELS = ['gpt-4o-transcribe', 'whisper-1'];
const MAX_BYTES = 25 * 1024 * 1024;   // limite de l'API OpenAI

// OpenAI devine le format d'après l'extension du nom de fichier.
const EXT: Record<string, string> = {
  'audio/mpeg': 'mp3', 'audio/mp3': 'mp3', 'audio/mp4': 'm4a', 'audio/x-m4a': 'm4a',
  'audio/m4a': 'm4a', 'audio/aac': 'm4a', 'audio/wav': 'wav', 'audio/x-wav': 'wav',
  'audio/wave': 'wav', 'audio/webm': 'webm', 'audio/ogg': 'ogg', 'audio/flac': 'flac',
  'audio/x-flac': 'flac', 'video/mp4': 'mp4', 'video/webm': 'webm',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'authentification requise' }, 401);

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return json({ error: 'OPENAI_API_KEY absent côté serveur' }, 500);

  let memoId = '';
  try {
    memoId = String((await req.json()).memoId || '');
  } catch {
    return json({ error: 'corps JSON invalide' }, 400);
  }
  if (!/^[0-9a-f-]{36}$/i.test(memoId)) return json({ error: 'mémo invalide' }, 400);

  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: who } = await sb.auth.getUser();
  if (!who?.user) return json({ error: 'session invalide' }, 401);

  const { data: blob, error: dlErr } = await sb.storage.from('memo-audio').download(`${memoId}.audio`);
  if (dlErr || !blob) return json({ error: 'audio introuvable' }, 404);
  if (blob.size > MAX_BYTES) return json({ error: 'fichier trop lourd (25 Mo maximum)' }, 413);

  const ext = EXT[blob.type] || 'mp3';
  let lastError = '';
  for (const model of MODELS) {
    const form = new FormData();
    form.append('file', new File([blob], `memo.${ext}`, { type: blob.type || 'audio/mpeg' }));
    form.append('model', model);
    form.append('language', 'fr');
    form.append('response_format', 'json');

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    if (r.ok) {
      const data = await r.json();
      return json({ text: (data.text || '').trim(), model });
    }
    let msg = `OpenAI ${r.status}`;
    try { msg = (await r.json()).error?.message || msg; } catch { /* corps illisible */ }
    lastError = r.status === 401 ? 'clé OpenAI invalide'
      : r.status === 429 ? 'quota OpenAI atteint ou trop de demandes' : msg;
    // modèle indisponible : on tente le suivant ; autre erreur : inutile d'insister
    if (r.status !== 404 && !/model/i.test(msg)) break;
  }
  return json({ error: lastError || 'transcription impossible' }, 502);
});

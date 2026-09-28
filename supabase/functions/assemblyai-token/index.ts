// Edge Function : délivre un jeton de streaming AssemblyAI de courte durée.
//
// La clé API reste un secret serveur (variable ASSEMBLYAI_API_KEY) et
// n'atteint jamais le navigateur. L'appelant doit être authentifié Supabase.
// Déploiement :
//   supabase functions deploy assemblyai-token
//   supabase secrets set ASSEMBLYAI_API_KEY=...

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  // Exige un appelant authentifié : pas de jeton pour un anonyme.
  if (!req.headers.get('Authorization')) {
    return json({ error: 'authentification requise' }, 401);
  }

  const key = Deno.env.get('ASSEMBLYAI_API_KEY');
  if (!key) return json({ error: 'ASSEMBLYAI_API_KEY absent côté serveur' }, 500);

  const url = 'https://streaming.assemblyai.com/v3/token'
    + '?expires_in_seconds=180&max_session_duration_seconds=3600';

  try {
    const r = await fetch(url, { headers: { Authorization: key } });
    const text = await r.text();
    if (!r.ok) return json({ error: `AssemblyAI ${r.status}: ${text}` }, 502);

    const data = JSON.parse(text);
    if (!data.token) return json({ error: 'réponse AssemblyAI sans jeton' }, 502);
    return json({ token: data.token });
  } catch (e) {
    return json({ error: String(e) }, 502);
  }
});

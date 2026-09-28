// Edge Function : chat IA sur les mémos vocaux de l'utilisateur.
//
// Le navigateur envoie la conversation ; la fonction relit les mémos visibles
// par l'appelant (RLS, avec SON jeton : il ne voit que ce qu'il voit dans
// l'app, équipe comprise), les donne à OpenAI et renvoie la réponse en flux
// texte brut, morceau par morceau.
// Déploiement :
//   supabase secrets set OPENAI_API_KEY=...
//   supabase functions deploy rick-chat

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

const MODEL = 'gpt-6-luna';   // le même que Rick Phone

// ~1M tokens de contexte : on garde une large marge (≈ 250k tokens de mémos).
const MAX_CORPUS_CHARS = 900_000;
const MAX_TURNS = 20;

const SYSTEM = `Tu es Rick, l'assistant des mémos vocaux de l'utilisateur. Il enregistre des mémos à la volée (idées, choses à faire, rendez-vous, comptes rendus) et te pose des questions dessus.

Réponds uniquement à partir des mémos fournis. Quand tu t'appuies sur un mémo, cite sa date et son titre, par exemple « (mardi 22 sept., « Rappeler le garage ») ». Si les mémos ne contiennent pas la réponse, dis-le simplement plutôt que de deviner.

Pour les questions du type « qu'est-ce que j'ai oublié », repère les intentions exprimées (« il faut que », « je dois », « penser à », « rappeler », « envoyer »…) sur la période demandée, puis regarde si un mémo plus récent indique que c'est fait. Liste ce qui reste ouvert et signale ce qui semble déjà réglé, en précisant que tu ne vois que ce qui a été dicté.

Quand des mémos sont joints à une question (bloc « Mémos joints »), la question porte d'abord sur eux : réponds à propos de ces mémos-là, en t'aidant des autres seulement si c'est utile.

Les dates relatives (« la semaine dernière », « hier ») se calculent à partir de la date du jour donnée plus bas. Réponds en français, de façon brève et directe, en texte simple : des listes à tirets si besoin, pas de tableaux ni de titres.`;

type Turn = { role: 'user' | 'assistant'; content: string; memoIds?: string[] };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', {
    timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'authentification requise' }, 401);

  const apiKey = Deno.env.get('OPENAI_API_KEY');
  if (!apiKey) return json({ error: 'OPENAI_API_KEY absent côté serveur' }, 500);

  let turns: Turn[];
  try {
    const body = await req.json();
    turns = (body.messages || [])
      .filter((t: Turn) => (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string' && t.content.trim())
      .map((t: Turn) => ({
        role: t.role, content: t.content,
        memoIds: Array.isArray(t.memoIds) ? t.memoIds.filter((x) => typeof x === 'string').slice(0, 10) : [],
      }))
      .slice(-MAX_TURNS);
  } catch {
    return json({ error: 'corps JSON invalide' }, 400);
  }
  if (!turns.length || turns[turns.length - 1].role !== 'user') {
    return json({ error: 'la conversation doit finir par une question' }, 400);
  }
  // L'API exige que la conversation commence par l'utilisateur.
  while (turns.length && turns[0].role !== 'user') turns.shift();

  // Client Supabase au nom de l'appelant : RLS filtre les mémos pour nous.
  const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: auth } },
    auth: { persistSession: false },
  });
  const { data: who } = await sb.auth.getUser();
  if (!who?.user) return json({ error: 'session invalide' }, 401);

  const [{ data: memos, error: mErr }, { data: cats }, { data: people }] = await Promise.all([
    sb.from('memos')
      .select('id, title, transcript, summary, created_at, owner_id, category_id')
      .order('created_at', { ascending: false }),
    sb.from('categories').select('id, name'),
    sb.from('profiles').select('id, name'),
  ]);
  if (mErr) return json({ error: mErr.message }, 500);

  const catName: Record<string, string> = {};
  (cats || []).forEach((c) => { catName[c.id] = c.name; });
  // Le nom de l'auteur n'aide que dans une équipe, pas pour ses propres mémos.
  const personName: Record<string, string> = {};
  (people || []).forEach((p) => { personName[p.id] = p.name; });
  const mine = (id: string) => id === who.user.id;

  // deno-lint-ignore no-explicit-any
  const fmtMemo = (m: any) => [
      `### ${fmtDate(m.created_at)} — ${m.title || 'Sans titre'}`,
      [m.category_id && catName[m.category_id] ? `Catégorie : ${catName[m.category_id]}` : '',
       !mine(m.owner_id) ? `Par : ${personName[m.owner_id] || 'un équipier'}` : ''].filter(Boolean).join(' · '),
      m.summary ? `Résumé : ${m.summary}` : '',
      `Transcription : ${m.transcript?.trim() || '(vide)'}`,
    ].filter(Boolean).join('\n');

  // Du plus récent au plus ancien jusqu'à la limite, puis remis dans l'ordre.
  const blocks: string[] = [];
  let size = 0;
  for (const m of memos || []) {
    const lines = fmtMemo(m);
    if (size + lines.length > MAX_CORPUS_CHARS) break;
    blocks.push(lines);
    size += lines.length;
  }
  const total = (memos || []).length;
  const left = total - blocks.length;
  blocks.reverse();

  const today = new Date().toLocaleDateString('fr-FR', {
    timeZone: 'Europe/Paris', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const corpus = `Date du jour : ${today} (heure de Paris).\n`
    + `Mémos de l'utilisateur : ${total}`
    + (left > 0 ? ` (les ${left} plus anciens ne sont pas inclus faute de place)` : '')
    + `.\n\n<memos>\n${blocks.join('\n\n') || '(aucun mémo enregistré)'}\n</memos>`;

  // Mémos glissés dans la barre : leur contenu complet accompagne la question
  // (RLS : un id qu'on ne voit pas n'est simplement pas trouvé).
  const byId = new Map((memos || []).map((m) => [m.id, m]));
  const withAttachments = (t: Turn) => {
    const found = (t.memoIds || []).map((id) => byId.get(id)).filter(Boolean);
    if (t.role !== 'user' || !found.length) return t.content;
    return `${t.content}\n\n<memos_joints>\n${found.map(fmtMemo).join('\n\n')}\n</memos_joints>`;
  };

  // Les mémos passent en tête des instructions, identiques d'une question à
  // l'autre : OpenAI met ce préfixe en cache automatiquement.
  const upstream = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL,
      instructions: `${SYSTEM}\n\n${corpus}`,
      input: turns.map((t) => ({ role: t.role, content: withAttachments(t) })),
      reasoning: { effort: 'low' },
      max_output_tokens: 8000,
      store: false,
      stream: true,
    }),
  });
  if (!upstream.ok || !upstream.body) {
    let msg = `OpenAI ${upstream.status}`;
    try { msg = (await upstream.json()).error?.message || msg; } catch { /* corps illisible */ }
    const status = upstream.status === 401 ? 'clé OpenAI invalide'
      : upstream.status === 429 ? 'quota OpenAI atteint ou trop de demandes' : msg;
    return json({ error: status }, 502);
  }

  // Flux SSE d'OpenAI → texte brut pour le navigateur.
  const stream = new ReadableStream({
    async start(controller) {
      const enc = new TextEncoder();
      const send = (t: string) => controller.enqueue(enc.encode(t));
      const reader = upstream.body!.getReader();
      const dec = new TextDecoder();
      let buf = '';
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let nl;
          while ((nl = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (!line.startsWith('data:')) continue;
            const data = line.slice(5).trim();
            if (!data || data === '[DONE]') continue;
            let ev;
            try { ev = JSON.parse(data); } catch { continue; }
            if (ev.type === 'response.output_text.delta') send(ev.delta);
            else if (ev.type === 'response.incomplete') send('\n\n(réponse coupée, trop longue)');
            else if (ev.type === 'response.failed' || ev.type === 'error') {
              send(`\n\n⚠️ ${ev.response?.error?.message || ev.message || 'erreur OpenAI'}`);
            }
          }
        }
      } catch (e) {
        send(`\n\n⚠️ ${String(e)}`);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { ...CORS, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache' },
  });
});

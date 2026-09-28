# Rick — version web (ordinateur)

Réplique web fonctionnelle de l'app mobile Rick : recorder vocal, agenda, extensions, carte.

## Live
https://rick-web-seven.vercel.app (Vercel, hébergement principal)

Miroir : https://cedriclg22.github.io/rick-web/ (GitHub Pages — peut être en retard si GitHub Actions est indisponible)

## Fichiers
| Fichier | Rôle |
|---|---|
| `index.html` | Structure : header, 4 vues (Library/Agenda/Store/Map), overlays (enregistrement, détail mémo) |
| `styles.css` | Design système clair/sombre, layout mobile (bottom nav) < 900px, layout desktop (sidebar) ≥ 900px |
| `app.js` | Rendu des vues, enregistrement, IA locale (mock), carte Leaflet ; miroir en mémoire des données du backend |
| `api.js` | Accès aux données Supabase (auth, comptes, équipes, catégories, mémos, audio) |
| `config.js` | URL + clé anon du projet Supabase |
| `supabase/schema.sql` | Schéma Postgres, règles RLS et bucket audio |
| `streaming.js` | Transcription live AssemblyAI (capture PCM, WebSocket, diarisation) |
| `supabase/functions/assemblyai-token/` | Edge Function qui délivre les jetons de streaming |
| `config.local.js` | Secrets de développement — **gitignoré** |

## Lancer en local
```bash
cd rick-web
python3 -m http.server 4321
# → http://localhost:4321
```

## Comptes, rôles et équipes (backend Supabase)

Les comptes et les données sont hébergés dans **Supabase** (Postgres + auth + stockage) : un compte créé sur un appareil est utilisable depuis n'importe quel autre.

### Mise en route (une fois)
1. Crée un projet sur [supabase.com](https://supabase.com) (formule gratuite).
2. Studio → **SQL Editor** → colle et exécute tout `supabase/schema.sql`. Ça crée les tables, les fonctions, les règles RLS et le bucket audio.
3. Studio → **Project Settings → API** : copie *Project URL* et la clé *anon public*.
4. Colle-les dans `config.js`.
5. Pour tester sans passer par les e-mails de confirmation : Studio → **Authentication → Providers → Email** → décoche *Confirm email*.

> La clé *anon* est publique par conception : ce sont les règles RLS qui protègent les données. Ne mets jamais la clé *service_role* dans `config.js`.

### Modèle
| Table | Rôle |
|---|---|
| `profiles` | un profil par compte (nom, rôle, équipe, extensions) — créé automatiquement à l'inscription, avec les 3 catégories personnelles par défaut |
| `teams` | nom + code d'invitation + admin |
| `categories` | soit personnelle (`owner_id`), soit d'équipe (`team_id`) |
| `category_access` | quelle catégorie d'équipe est ouverte à quel équipier |
| `memos` | mémos ; `team_id` non nul = mémo partagé avec l'équipe |
| `reminders` | rappels de lieu, strictement privés |
| bucket `memo-audio` | un fichier audio par mémo, lisible seulement si le mémo l'est |

### Rôles
- **admin** — crée / renomme / supprime les catégories de l'équipe, voit tous ses mémos, coche les catégories accessibles à chaque équipier, peut promouvoir un équipier admin.
- **équipier** — ne voit que les catégories d'équipe cochées par l'admin, et uniquement les mémos rangés dedans. Il garde ses catégories et mémos personnels, invisibles pour l'équipe.

À l'inscription : *Solo*, *Créer une équipe* (→ admin + code `RICK-1234`) ou *Rejoindre* (→ équipier). Un compte solo peut créer ou rejoindre une équipe plus tard depuis son panneau compte.

### Où sont appliquées les règles
Côté **serveur**, par les policies RLS de `supabase/schema.sql` — pas dans le front. Un équipier qui bidouillerait le JavaScript ne récupérerait rien de plus : Postgres ne lui renvoie tout simplement pas les lignes. Le changement de rôle et d'équipe passe obligatoirement par les fonctions `create_team` / `join_team` / `promote_member`, un trigger empêche de modifier `role` ou `team_id` en direct.

### Partager un mémo
Glisser un mémo sur une catégorie d'équipe met son `team_id` : il devient visible par les équipiers autorisés, avec le nom de son auteur. Le ressortir le rend personnel (réservé à l'auteur ou à l'admin).

### Fichiers
| Fichier | Rôle |
|---|---|
| `supabase/schema.sql` | schéma, fonctions, RLS, bucket audio |
| `config.js` | URL du projet + clé anon |
| `api.js` | toute la couche d'accès aux données (auth, workspace, CRUD, audio) |

## Transcription live à plusieurs voix (AssemblyAI)

Pendant une visio, Rick écoute **deux sources séparées** et transcrit les deux en direct :

| Source | Ce qu'elle capte | Étiquette |
|---|---|---|
| micro (`getUserMedia`) | votre voix | **Vous** |
| son de l'onglet partagé (`getDisplayMedia`) | vos interlocuteurs | **Visio · A**, **Visio · B**… |

### Comment les voix sont différenciées
Deux mécanismes se complètent :

1. **Par la source.** Une session de transcription par piste. Votre voix ne peut pas être confondue avec celle d'en face : c'est le câblage audio qui le garantit, pas un modèle.
2. **Par la diarisation.** Sur la piste visio, où plusieurs personnes partagent un seul flux, `speaker_labels` est activé et AssemblyAI étiquette chaque tour de parole. Le découpage se fait **mot à mot** (`words[].speaker`) et non sur le label global du tour : quand deux personnes s'enchaînent sans blanc, le tour est coupé au bon endroit plutôt qu'attribué en bloc au locuteur dominant.

### Détails techniques
- Endpoint : `wss://streaming.assemblyai.com/v3/ws`, audio **PCM 16 bits little-endian, mono, 16 kHz**, trames de 50 ms produites par un `AudioWorklet` (repli `ScriptProcessor`).
- `language_codes` est épinglé à `fr` dans `config.js`. Sans ça le modèle devine la langue par session et **dérive vers l'anglais** sur un flux court ou bruité — c'était la cause de transcriptions incompréhensibles pendant la mise au point.
- Le mémo enregistre le texte étiqueté (`Vous : …` / `Visio · A : …`) dès qu'il y a plus d'une voix, du texte brut sinon.
- Quand la transcription live a fonctionné, Whisper local n'est pas rappelé après coup — inutile de retranscrire deux fois.
- Deux pistes = **deux sessions facturées en parallèle** pendant la visio.

### La clé API ne doit jamais atteindre le navigateur
L'endpoint de jeton d'AssemblyAI **ne renvoie aucun en-tête CORS** : un appel direct depuis le front est de toute façon bloqué par le navigateur. Il faut un intermédiaire serveur, qui détient la clé et ne rend qu'un jeton valable quelques minutes :

- **En local** : `whisper-server` expose `POST /aai-token`. La clé est dans `whisper-server/.env` (gitignoré) :
  ```
  ASSEMBLYAI_API_KEY=<ta_clé>
  ```
  Lance `./whisper-server/start.sh` — `config.local.js` pointe déjà sur `http://127.0.0.1:5959/aai-token`.
- **En production** : déploie l'Edge Function `supabase/functions/assemblyai-token`, puis passe `useSupabaseFunction: true` dans `config.js`.
  ```bash
  supabase secrets set ASSEMBLYAI_API_KEY=<ta_clé>
  supabase functions deploy assemblyai-token
  ```

`config.local.js` et `whisper-server/.env` sont gitignorés, et `config.local.js` est aussi dans `.vercelignore`.

### Limite connue
La diarisation reste une estimation acoustique : sur des voix très proches, ou au mot exact où deux personnes se coupent, l'attribution peut se tromper d'un mot ou deux. La séparation *vous / eux*, elle, est toujours exacte puisqu'elle vient de la source.

## Fonctionnalités
- 🎙️ **Enregistrement + transcription live à plusieurs voix (AssemblyAI)** — voir la section dédiée ci-dessous. Repli automatique sur la Web Speech API du navigateur (`fr-FR`, micro seul) si AssemblyAI n'est pas joignable.
- 🖥️ **Capture visio + transcription Whisper locale (précise)** — bouton "Inclure le son d'un onglet (visio)" dans l'écran d'enregistrement : Chrome demande de partager un onglet/écran avec audio, ce son est mixé avec le micro et envoyé à un serveur Whisper tournant **en local** sur ton Mac (`whisper-server/`, modèle `large-v3-turbo` via `mlx-whisper`, aucune donnée envoyée à un tiers). Le mémo passe par un état "⏳ Transcription en cours" puis se met à jour avec le texte final. Si le serveur local n'est pas lancé, Rick bascule automatiquement sur l'aperçu micro (Web Speech) et affiche un avertissement.
  - **Lancer le serveur** : `./whisper-server/start.sh` (installe l'environnement au premier lancement, puis démarre sur `http://127.0.0.1:5959`). À garder ouvert dans un terminal pendant que tu utilises Rick.
  - **Important** : ne fonctionne que quand Rick tourne en local (`http://localhost:...`). Depuis la version en ligne (`https://cedriclg22.github.io/rick-web/`), le navigateur bloque les appels vers un serveur `http://` local pour des raisons de sécurité (mixed content) — dans ce cas, seul l'aperçu micro (Web Speech) fonctionne.
  - **Pourquoi pas de vraie transcription live des deux voix ?** L'API Web Speech du navigateur ne peut écouter que le micro par défaut, pas un flux audio personnalisé — donc le mixage micro+visio ne peut être transcrit qu'après coup (par Whisper), pas en direct pendant l'enregistrement.
- 🧠 **Analyse IA (mock local)** — au clic sur un mémo non analysé, génère titre / résumé / catégorie (Pro, Perso, Famille) / actions suggérées à partir de mots-clés dans la transcription.
- 📁 **Bibliothèque** — recherche, catégories, grille de mémos avec statut d'analyse.
- 🗓️ **Agenda** — calendrier mensuel, mémos du jour affichés en timeline.
- 🧩 **Store** — extensions (Gmail, WhatsApp, Telegram, Outlook, Slack, Google Agenda, Notion), maquette cliquable avec simulation de connexion (pas de vrai OAuth — nécessiterait des identifiants d'app + un backend).
- 🗺️ **Map** — vraie carte Leaflet/OpenStreetMap, géolocalisation navigateur, pose de rappels de lieu (clic sur la carte), persistés en localStorage.
- 🖥️ **Responsive** — navigation en bottom bar façon mobile en dessous de 900px, sidebar façon app desktop au-dessus.
- 💾 **Persistance** — mémos, catégories, rappels et extensions sont stockés dans Supabase et rattachés au compte connecté ; les fichiers audio vont dans le bucket `memo-audio` (avec un cache local IndexedDB pour la lecture immédiate).

## Pour aller plus loin
- **Vraie IA pour l'analyse** : remplacer les heuristiques `summarize()` / `detectActions()` / `guessCategory()` dans `app.js` par un appel à un LLM (Edge Function Supabase, ou un LLM local via Ollama).
- **Intégrations réelles (Store)** : brancher un vrai flow OAuth par extension (Gmail, Slack…), ce qui nécessite des identifiants d'app (client ID/secret) créés par toi sur chaque plateforme, et idéalement un petit backend pour stocker les tokens en sécurité.
- **Recorder hardware** : remplacer `getUserMedia`/Web Speech dans `startRecording()` par le flux du recorder physique.
- **whisper-server/** tourne en HTTP simple sans authentification (prévu pour un usage 100% local sur ta machine) — à sécuriser si jamais exposé au-delà de `127.0.0.1`.

> Aucune dépendance de build : fichiers statiques + Leaflet via CDN.

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
| `app.js` | État + persistance localStorage, rendu des vues, enregistrement, IA locale (mock), carte Leaflet |

## Lancer en local
```bash
cd rick-web
python3 -m http.server 4321
# → http://localhost:4321
```

## Fonctionnalités
- 🎙️ **Enregistrement + transcription live (aperçu)** — overlay plein écran, timer, visualiseur audio réactif au micro, aperçu de transcription en direct via Web Speech API (`fr-FR`, micro seul, nécessite Chrome + HTTPS/localhost).
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
- 💾 **Persistance** — tout est conservé dans `localStorage` (mémos, rappels, extensions).

## Pour aller plus loin
- **Vraie IA pour l'analyse** : remplacer les heuristiques `summarize()` / `detectActions()` / `guessCategory()` dans `app.js` par un appel à un LLM (pourrait réutiliser le même serveur local en ajoutant un endpoint, ou un LLM local via Ollama).
- **Intégrations réelles (Store)** : brancher un vrai flow OAuth par extension (Gmail, Slack…), ce qui nécessite des identifiants d'app (client ID/secret) créés par toi sur chaque plateforme, et idéalement un petit backend pour stocker les tokens en sécurité.
- **Recorder hardware** : remplacer `getUserMedia`/Web Speech dans `startRecording()` par le flux du recorder physique.
- **whisper-server/** tourne en HTTP simple sans authentification (prévu pour un usage 100% local sur ta machine) — à sécuriser si jamais exposé au-delà de `127.0.0.1`.

> Aucune dépendance de build : fichiers statiques + Leaflet via CDN.

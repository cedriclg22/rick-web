# Rick — version web (ordinateur)

Réplique web fonctionnelle de l'app mobile Rick : recorder vocal, agenda, extensions, carte.

## Live
https://cedriclg22.github.io/rick-web/

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
- 🎙️ **Enregistrement + transcription live** — overlay plein écran, timer, visualiseur audio réactif au micro, transcription live via Web Speech API (`fr-FR`, nécessite Chrome + HTTPS/localhost).
- 🧠 **Analyse IA (mock local)** — au clic sur un mémo non analysé, génère titre / résumé / catégorie (Pro, Perso, Famille) / actions suggérées à partir de mots-clés dans la transcription.
- 📁 **Bibliothèque** — recherche, catégories, grille de mémos avec statut d'analyse.
- 🗓️ **Agenda** — calendrier mensuel, mémos du jour affichés en timeline.
- 🧩 **Store** — extensions (Gmail, WhatsApp, Telegram, Outlook, Slack, Google Agenda, Notion), maquette cliquable avec simulation de connexion (pas de vrai OAuth — nécessiterait des identifiants d'app + un backend).
- 🗺️ **Map** — vraie carte Leaflet/OpenStreetMap, géolocalisation navigateur, pose de rappels de lieu (clic sur la carte), persistés en localStorage.
- 🖥️ **Responsive** — navigation en bottom bar façon mobile en dessous de 900px, sidebar façon app desktop au-dessus.
- 💾 **Persistance** — tout est conservé dans `localStorage` (mémos, rappels, extensions).

## Pour aller plus loin
- **Transcription réelle / IA réelle** : remplacer les heuristiques `summarize()` / `detectActions()` / `guessCategory()` dans `app.js` par un appel à un LLM.
- **Intégrations réelles (Store)** : brancher un vrai flow OAuth par extension (Gmail, Slack…), ce qui nécessite des identifiants d'app (client ID/secret) créés par toi sur chaque plateforme, et idéalement un petit backend pour stocker les tokens en sécurité.
- **Recorder hardware** : remplacer `getUserMedia`/Web Speech dans `startRecording()` par le flux du recorder physique.

> Aucune dépendance de build : fichiers statiques + Leaflet via CDN.

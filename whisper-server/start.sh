#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"

if [ ! -d ".venv" ]; then
  echo "Création de l'environnement virtuel..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip show mlx-whisper >/dev/null 2>&1 || pip install -q mlx-whisper flask flask-cors

echo "Démarrage du serveur Whisper local sur http://127.0.0.1:5959 ..."
python3 server.py

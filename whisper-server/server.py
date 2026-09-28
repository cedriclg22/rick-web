import os
import tempfile
import urllib.error
import urllib.request

from flask import Flask, request, jsonify
from flask_cors import CORS

MODEL = os.environ.get("RICK_WHISPER_MODEL", "mlx-community/whisper-large-v3-turbo")
ASSEMBLYAI_KEY = os.environ.get("ASSEMBLYAI_API_KEY", "")

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({
        "status": "ok",
        "model": MODEL,
        "assemblyai": bool(ASSEMBLYAI_KEY),
    })


@app.post("/aai-token")
def aai_token():
    """Fabrique un jeton de streaming AssemblyAI pour le navigateur.

    AssemblyAI n'autorise pas les appels navigateur sur son endpoint de jeton
    (pas d'en-tete CORS), et la cle ne doit de toute facon jamais etre servie
    au front. Elle reste donc ici, cote serveur, et le navigateur ne recoit
    qu'un jeton valable quelques minutes.

    En production, c'est l'Edge Function Supabase assemblyai-token qui joue ce
    role ; cet endpoint sert au developpement en local.
    """
    if not ASSEMBLYAI_KEY:
        return jsonify({"error": "ASSEMBLYAI_API_KEY non defini (voir whisper-server/.env)"}), 500

    url = (
        "https://streaming.assemblyai.com/v3/token"
        "?expires_in_seconds=180&max_session_duration_seconds=3600"
    )
    req = urllib.request.Request(url, headers={"Authorization": ASSEMBLYAI_KEY})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            import json
            data = json.loads(resp.read().decode("utf-8"))
        return jsonify({"token": data.get("token")})
    except urllib.error.HTTPError as exc:
        return jsonify({"error": f"AssemblyAI {exc.code}", "detail": exc.read().decode("utf-8")[:300]}), 502
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 502


@app.post("/transcribe")
def transcribe():
    if "audio" not in request.files:
        return jsonify({"error": "missing 'audio' file"}), 400

    audio_file = request.files["audio"]
    suffix = os.path.splitext(audio_file.filename or "")[1] or ".webm"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        audio_file.save(tmp.name)
        tmp_path = tmp.name

    try:
        # import tardif : le serveur demarre (et sert /aai-token) meme si le
        # modele Whisper n'est pas encore installe ou telecharge
        import mlx_whisper

        result = mlx_whisper.transcribe(
            tmp_path,
            path_or_hf_repo=MODEL,
            language="fr",
        )
        text = (result.get("text") or "").strip()
        return jsonify({"text": text})
    except Exception as exc:  # noqa: BLE001
        return jsonify({"error": str(exc)}), 500
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass


if __name__ == "__main__":
    print(f"Rick Whisper server — modele: {MODEL}")
    print(f"Jeton AssemblyAI: {'active' if ASSEMBLYAI_KEY else 'inactif (ASSEMBLYAI_API_KEY absent)'}")
    app.run(host="127.0.0.1", port=5959)

import os
import tempfile

from flask import Flask, request, jsonify
from flask_cors import CORS
import mlx_whisper

MODEL = os.environ.get("RICK_WHISPER_MODEL", "mlx-community/whisper-large-v3-turbo")

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"status": "ok", "model": MODEL})


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
    app.run(host="127.0.0.1", port=5959)

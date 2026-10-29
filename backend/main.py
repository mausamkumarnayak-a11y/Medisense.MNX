from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime
import requests
import json
import os

app = FastAPI(title="MediSense Clinical API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration from environment variables
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
MODEL = os.getenv("MODEL", "qwen3:8b")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")
OPENAI_BASE_URL = os.getenv(
    "OPENAI_BASE_URL",
    "https://api.groq.com/openai/v1" if os.getenv("GROQ_API_KEY") else "https://api.openai.com/v1",
)
OPENAI_MODEL = os.getenv(
    "OPENAI_MODEL",
    "llama-3.3-70b-versatile" if os.getenv("GROQ_API_KEY") else "gpt-4o-mini",
)

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "history.json")
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))


class MedicineRequest(BaseModel):
    name: str


class SymptomRequest(BaseModel):
    symptoms: str
    age: int = 25


# ---------- helpers ----------
def ask_ai(prompt: str):
    # If cloud LLM key is configured (Groq, OpenAI, OpenRouter, etc.), use cloud endpoint
    if OPENAI_API_KEY:
        headers = {
            "Authorization": f"Bearer {OPENAI_API_KEY}",
            "Content-Type": "application/json",
        }
        payload = {
            "model": OPENAI_MODEL,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a professional medical assistant. Reply ONLY with valid JSON and no conversational wrapper.",
                },
                {"role": "user", "content": prompt},
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2,
        }
        resp = requests.post(
            f"{OPENAI_BASE_URL.rstrip('/')}/chat/completions",
            headers=headers,
            json=payload,
            timeout=60,
        )
        resp.raise_for_status()
        content = resp.json()["choices"][0]["message"]["content"]
        return json.loads(content)

    # Default to Ollama endpoint (local or remote)
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": MODEL,
            "prompt": prompt,
            "stream": False,
            "format": "json",
            "think": False,
        },
        timeout=180,
    )
    return json.loads(response.json()["response"])


def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_history(items):
    try:
        with open(HISTORY_FILE, "w", encoding="utf-8") as f:
            json.dump(items[-200:], f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"Failed to save history: {e}")


def log_event(kind, query, summary):
    items = load_history()
    items.append(
        {
            "kind": kind,
            "query": query,
            "summary": summary,
            "time": datetime.now().strftime("%d %b %Y, %I:%M %p"),
        }
    )
    save_history(items)


def ai_online():
    if OPENAI_API_KEY:
        return True
    try:
        base = OLLAMA_URL.rsplit("/api/", 1)[0]
        requests.get(f"{base}/api/tags", timeout=2)
        return True
    except Exception:
        return False


# ---------- API routes ----------
@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "MediSense Clinical API",
        "ai_online": ai_online(),
        "model": OPENAI_MODEL if OPENAI_API_KEY else MODEL,
    }


@app.post("/medicine")
def medicine_info(req: MedicineRequest):
    prompt = f"""You are a medical information assistant.
Give general information about the medicine "{req.name}".
Reply ONLY in JSON with these keys:
"name", "used_for" (list), "side_effects" (list),
"precautions" (list), "general_advice" (string).
Use simple language. Do not give exact doses.
If the medicine name is not real, set "name" to "Unknown" and explain in "general_advice"."""
    try:
        result = ask_ai(prompt)
        name = result.get("name", req.name) if isinstance(result, dict) else req.name
        log_event("medicine", req.name, str(name))
        return result
    except Exception as e:
        return {"error": str(e)}


@app.post("/triage")
def triage(req: SymptomRequest):
    prompt = f"""You are a careful medical triage assistant.
Patient age: {req.age}
Symptoms: "{req.symptoms}"

Reply ONLY in JSON with these keys:
"urgency": exactly one of "Home care", "See a doctor", "Emergency"
"possible_causes": list of 2 to 4 common causes
"explanation": short, simple explanation
"tell_the_doctor": list of things to mention to a doctor
"common_medicines": list of common over-the-counter medicine names, or an empty list

Rules:
- Chest pain, trouble breathing, severe bleeding, fainting, stroke signs
  (face drooping, slurred speech), or thoughts of self-harm are ALWAYS "Emergency".
- If unsure, choose the safer, more urgent option.
- Never claim a diagnosis. Use simple language."""
    try:
        result = ask_ai(prompt)
        urgency = result.get("urgency", "Unknown") if isinstance(result, dict) else "Unknown"
        log_event("triage", req.symptoms, str(urgency))
        return result
    except Exception as e:
        return {"error": str(e)}


@app.get("/history")
def history():
    return load_history()[::-1]


@app.delete("/history")
def clear_history():
    save_history([])
    return {"cleared": True}


@app.get("/stats")
def stats():
    items = load_history()
    triage_items = [i for i in items if i["kind"] == "triage"]
    med_items = [i for i in items if i["kind"] == "medicine"]
    return {
        "total_checks": len(triage_items),
        "medicines_searched": len(med_items),
        "emergency": sum(1 for i in triage_items if i["summary"] == "Emergency"),
        "see_doctor": sum(1 for i in triage_items if i["summary"] == "See a doctor"),
        "home_care": sum(1 for i in triage_items if i["summary"] == "Home care"),
        "recent": items[-5:][::-1],
        "ai_online": ai_online(),
        "model": OPENAI_MODEL if OPENAI_API_KEY else MODEL,
    }


# ---------- Static Frontend Hosting (Unified Deployment) ----------
if os.path.isdir(FRONTEND_DIST):
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/")
    def serve_root():
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def home():
        return {
            "message": "MediSense backend is running",
            "docs": "/docs",
            "health": "/health",
        }


if __name__ == "__main__":
    import uvicorn

    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

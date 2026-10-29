# MediSense — Clinical Dashboard & AI Medical Triage

An intelligent clinical decision support and patient triage dashboard powered by FastAPI and React (Vite). MediSense provides preliminary symptom urgency assessments, pharmaceutical reference information, historical consultation logging, and real-time clinical activity metrics.

> **Disclaimer**: MediSense is an assistive clinical information demonstration. It is not formal medical advice, diagnosis, or treatment. In medical emergencies, immediately contact local emergency services (**112**).

---

## Architecture Overview

```
medisense/
├── backend/
│   ├── main.py              # FastAPI application & clinical endpoints
│   ├── requirements.txt     # Python backend dependencies
│   ├── Procfile             # Process definition for cloud platforms
│   └── history.json         # Local activity history log
├── frontend/
│   ├── src/                 # React UI components (Dashboard, Symptom Check, Medicine Info, History)
│   ├── public/              # Static assets and icons
│   ├── package.json         # Frontend dependencies and build scripts
│   └── vite.config.js       # Vite configuration
├── build.sh                 # Unified build script for single-service deployments
├── render.yaml              # Render Blueprint infrastructure-as-code
├── Procfile                 # Root process definition
└── requirements.txt         # Root dependency pointer
```

---

## Deployment on Render

You can deploy MediSense on [Render](https://render.com) using either of the two approaches below:

### Option 1: Automatic Blueprint (Recommended — 1 Click)

1. Fork or push this repository to your GitHub account (`mausamkumarnayak-a11y/Medisense.MNX`).
2. Log in to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** > **Blueprint**.
4. Connect the **Medisense.MNX** repository.
5. Render will automatically read [`render.yaml`](render.yaml) and configure:
   - **`medisense-backend`**: Python Web Service running FastAPI.
   - **`medisense-frontend`**: Static Site hosting the React dashboard with `VITE_API_URL` linked automatically.
6. *(Optional)* Add a free **`GROQ_API_KEY`** or **`OPENAI_API_KEY`** under `medisense-backend` Environment Variables if you want cloud AI evaluation on Render's free tier.
7. Click **Apply**.

---

### Option 2: Unified Free Web Service (Single Render Free Instance)

To host both frontend and backend on a **single free Render Web Service**:

1. In Render Dashboard, click **New +** > **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Environment**: `Python`
   - **Build Command**: `./build.sh`
   - **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `PYTHON_VERSION`: `3.11.9`
   - `GROQ_API_KEY` *(or `OPENAI_API_KEY` / remote `OLLAMA_URL`)*
5. Click **Create Web Service**. The backend will automatically serve both the API and the React production build on the same domain.

---

### Option 3: Manual Separate Services

#### 1. Backend Web Service
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables**:
  - `PYTHON_VERSION`: `3.11.9`
  - `PORT`: `10000`
  - `GROQ_API_KEY`: *(your key)* or `OLLAMA_URL`: *(your remote endpoint)*

#### 2. Frontend Static Site
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Rewrite Rule**: `/*` -> `/index.html`
- **Environment Variables**:
  - `VITE_API_URL`: `https://<your-backend-service-name>.onrender.com`

---

## Local Development

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## AI Engine Configuration

| Variable | Description | Default |
|---|---|---|
| `OLLAMA_URL` | Endpoint for local or remote Ollama | `http://localhost:11434/api/generate` |
| `MODEL` | Ollama model name | `qwen3:8b` |
| `GROQ_API_KEY` | Free high-speed cloud LLM key from Groq Console | *(none)* |
| `OPENAI_API_KEY` | OpenAI API key | *(none)* |
| `OPENAI_MODEL` | Cloud model name | `llama-3.3-70b-versatile` / `gpt-4o-mini` |
| `VITE_API_URL` | Frontend API backend endpoint | `http://127.0.0.1:8000` |

---

## License

MIT License. Designed with care for clinical and educational workflows.

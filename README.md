# AI Cognitive Alarm Platform ⏰🧠

An intelligent, multi-tier alarm and wake-up platform that combines cognitive challenges, reinforcement learning, behavioral habit tracking, and role-based analytics to help users wake up energized and build consistent morning routines.

---

## 🌟 Key Features

### 🧩 Cognitive Wake-Up Challenges
To dismiss or snooze an alarm, users must solve interactive cognitive puzzles tailored to wake up different areas of the brain:
- **Math Challenge**: Dynamic arithmetic calculations with varying difficulty levels.
- **Memory Flip Puzzle**: Card-matching memory test under timed constraints.
- **Pattern Memory**: Visual sequence replication challenge.
- **Stroop Effect Challenge**: Cognitive interference test differentiating between color text and display hue.
- **Word Scramble**: Verbal agility and anagram solving.

### 🤖 AI & Reinforcement Learning Engine
- **Q-Learning RL Engine**: Dynamically adapts alarm challenge difficulty, snooze penalties, and wake suggestions based on user response history.
- **XGBoost Predictive Models**: Predicts likelihood of snooze, wake success, response latency, and cognitive alertness.
- **Smart Sleep Analytics**: Tracks circadian consistency, sleep duration, habit scores, and streak milestones.

### 👥 Role-Based Portals & Dashboards
- **User Dashboard**: Alarm management, cognitive performance trends, sleep streak metrics, and quick puzzle drills.
- **Admin Dashboard**: User management, system metrics, and audit logs.
- **Coach / Mentor Dashboard**: Monitor student or client waking consistency, review habit reports, and assign personalized morning regimens.

### 📊 Comprehensive Reports & Export
- Visual analytics powered by Recharts.
- PDF Report generation using jsPDF for habit progress tracking.
- Audio synthesizers and customizable wake sounds.

---

## 🏗️ Architecture & File Structure

```
cognitive-alarm-platform/
├── backend/                      # Python FastAPI ML & RL Service
│   ├── ai_data/                  # Persistent AI Q-tables & XGBoost models
│   ├── Dockerfile                # Python 3.11-slim container with XGBoost support
│   ├── .dockerignore             # Docker build ignores
│   ├── main.py                   # FastAPI REST API endpoints
│   ├── ai_rl_engine.py           # Reinforcement Learning & XGBoost engine
│   ├── ml_engine.py              # ML feature extraction & habit scoring
│   ├── supabase_db.py            # Supabase database layer
│   ├── models.py & schemas.py    # Pydantic & SQLAlchemy data schemas
│   └── requirements.txt          # Production Python dependencies
│
├── frontend/                     # Next.js 16 & React 19 Client
│   ├── Dockerfile                # Production multi-stage Docker build
│   ├── .dockerignore             # Docker build ignores
│   ├── next.config.mjs           # Next.js config & API reverse proxy
│   ├── package.json              # Frontend dependencies and scripts
│   └── src/                      # App router, components, puzzles & views
│
├── legacy/                       # [Archived] Express.js & Vanilla JS Prototype
│   ├── app.js, db.js, index.html, server.js, styles.css
│   └── package.json
│
├── docker-compose.yml            # Multi-container orchestrator (Frontend + Backend)
├── .env.example                  # Unified environment variables template
├── package.json                  # Root orchestrator & development scripts
├── supabase_schema.sql           # Complete Supabase Postgres schema & RLS policies
└── LICENSE                       # MIT License
```

---

## ☁️ Cloud Deployment: Vercel (Frontend) + Render (Backend)

Deploying the frontend to **Vercel** and the backend to **Render** is the recommended cloud architecture.

### Part 1: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** &rarr; **Web Service** (or use **Blueprint** with the included `render.yaml`).
2. Connect your Git repository.
3. Configure the service:
   - **Name**: `cognitive-alarm-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Docker` (or `Python 3`)
   - **Dockerfile Path**: `./backend/Dockerfile` (or build command `pip install -r requirements.txt` and start command `uvicorn main:app --host 0.0.0.0 --port $PORT`)
   - **Health Check Path**: `/health`
4. Set Environment Variables on Render:
   - `SUPABASE_URL`: `https://<your-project>.supabase.co`
   - `SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
   - `SECRET_KEY`: `<a-secure-random-secret-key>`
   - `ALGORITHM`: `HS256`
   - `FRONTEND_URL`: `https://<your-app>.vercel.app` (your Vercel frontend URL)
5. Click **Create Web Service**. Once deployed, copy your Render URL:
   `https://cognitive-alarm-backend.onrender.com`

---

### Part 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New...** &rarr; **Project**.
2. Import your Git repository.
3. In **Project Configuration**:
   - **Framework Preset**: `Next.js`
   - **Root Directory**: click `Edit` and select `frontend`
4. Add Environment Variables on Vercel:
   - `BACKEND_URL`: `https://cognitive-alarm-backend.onrender.com` (your Render backend URL from Part 1)
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://<your-project>.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `<your-supabase-anon-key>`
5. Click **Deploy**. Vercel will build and deploy your Next.js application!
   *Note: Next.js will automatically proxy `/api/*` requests to your Render backend at the edge, preventing CORS issues.*

---

## 🐳 Docker Deployment (Local & Self-Hosted)

Run the full stack (Next.js Frontend + FastAPI AI Backend) with a single command:

### 1. Ensure Docker Desktop is Running
Make sure Docker Desktop (or the Docker daemon) is started on your computer.

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
# Edit .env if you wish to customize keys or credentials
```

### 3. Build & Start the Containers
```bash
docker compose up --build -d
# Or using npm:
npm run docker:up
```

### 4. Access the Application
- **Frontend Web App**: [http://localhost:3000](http://localhost:3000)
- **FastAPI Backend & Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

### Useful Docker Commands
```bash
# View live container logs
docker compose logs -f

# Check container health status
docker compose ps

# Stop containers
docker compose down
```

---

## 🚀 Manual Local Setup (Without Docker)

### Prerequisites
- **Node.js** (v18+ recommended)
- **Python** (v3.10+ recommended)
- **Supabase** account (or local PostgreSQL instance)

---

### 1. Backend Setup (FastAPI & ML Engine)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

---

### 2. Node.js Express Server Setup (Optional Local API)

```bash
# In the project root:
npm install
node server.js
```

---

### 3. Frontend Setup (Next.js / Vite React)

```bash
cd frontend
npm install
cp .env.example .env
# Set VITE_API_BASE_URL=/api

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Database Setup (Supabase)
Run the queries in `supabase_schema.sql` in your Supabase SQL Editor to set up the necessary tables, triggers, and Row Level Security (RLS) policies.

---

## 📄 License
This project is licensed under the MIT License.

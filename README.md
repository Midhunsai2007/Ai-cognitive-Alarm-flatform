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

## 🏗️ Architecture

```
cognitive-alarm-platform/
├── frontend/                     # Next.js & React 19 Client
│   ├── src/
│   │   ├── app/                  # Next.js App Router (ClientShell, layout, pages)
│   │   ├── components/           # UI components, Alarm modals, Cognitive Puzzles
│   │   ├── context/              # AuthContext, RoleContext, ThemeContext
│   │   ├── services/             # API client, Audio synthesizers, Supabase client
│   │   └── views/                # User, Admin, and Coach page views
│   └── package.json
│
├── backend/                      # Python FastAPI ML & RL Service
│   ├── main.py                   # FastAPI REST API endpoints
│   ├── ai_rl_engine.py           # Reinforcement Learning & XGBoost engine
│   ├── ml_engine.py              # ML feature extraction & habit scoring
│   ├── supabase_db.py            # Supabase database layer
│   ├── models.py & schemas.py    # Pydantic & SQLAlchemy data schemas
│   └── requirements.txt
│
├── server.js                     # Express.js REST API Server
├── db.js                         # Database access module
├── supabase_schema.sql           # Complete Supabase Postgres schema & RLS policies
└── package.json
```

---

## 🚀 Getting Started

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
# Set VITE_API_BASE_URL=http://localhost:8000/api

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Database Setup (Supabase)
Run the queries in `supabase_schema.sql` in your Supabase SQL Editor to set up the necessary tables, triggers, and Row Level Security (RLS) policies.

---

## 📄 License
This project is licensed under the MIT License.

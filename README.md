# JobLens

> **Your AI agent that finds the right jobs and prepares personalized applications.**

JobLens is a multi-agent AI system that analyzes your resume, scores it against any job description, tailors your resume for the role, writes your cover letter, and generates interview prep — all powered by a unified Career Knowledge Base.

No auto-applying. No black-box spraying. Just signal: you see exactly where you stand, what's missing, and what to do next — then you apply with confidence.

---

## Demo

```
Upload Resume  →  Paste Job Description  →  Get Match Score

JobLens Dashboard
─────────────────────────────────────────────────────────
  Resume Uploaded          ✔  John_Doe_Resume.pdf

  Job Match Score          91%   ████████████████████░░

  Strengths                ✔ React   ✔ Node.js   ✔ Docker
  Missing Skills           ✖ AWS     ✖ Redis

  Recommendation           Strong candidate — apply with tailored resume.

  [ Download Tailored Resume ]  [ Generate Cover Letter ]  [ View 15 Interview Questions ]
─────────────────────────────────────────────────────────
```

---

## Features

### 1. Resume Upload & Parsing
Upload your resume as PDF or DOCX. The Resume Agent extracts and structures:
- Skills
- Work experience (company, role, duration, bullets)
- Education
- Projects

Everything is embedded and stored in your **Career Knowledge Base** — a unified Qdrant vector store that all agents query.

### 2. Job Description Input
No scraping required. Provide a job description three ways:
- **Paste** raw JD text
- **Upload** a JD as PDF
- **Paste** a company careers page URL (best-effort extraction)

The JD is also embedded into the Knowledge Base so agents can retrieve relevant context across multiple JDs over time.

### 3. AI Match Score
The Match Agent semantically compares your profile against the job description — not just keyword counting.

```
Match Score: 91%

Strengths         ✔ React  ✔ Node.js  ✔ Docker  ✔ PostgreSQL
Missing Skills    ✖ AWS    ✖ Redis
Recommendation    Strong candidate. Consider adding a small AWS project to close the gap.
```

### 4. Resume Tailoring Agent
Generates a version of your resume optimized for the specific role:
- Reorders projects to lead with most relevant work
- Surfaces matching skills higher
- Rewrites bullet points with ATS-friendly keywords from the JD

It never invents experience — only reorganizes and rewords what you actually have.

#### Regenerate with a Custom Prompt
If the first version isn't quite right, guide the agent with a natural language instruction:

```
┌─────────────────────────────────────────────────────────┐
│  Not satisfied with the tailored resume?                │
│                                                         │
│  "Make it more senior and emphasize leadership roles"   │
│  "Focus only on backend experience, remove frontend"    │
│  "Use a more concise, one-page format"                  │
│  "Highlight open source contributions more"             │
│                                                         │
│  [ Regenerate with this prompt ]                        │
└─────────────────────────────────────────────────────────┘
```

Each regeneration uses the same Career Knowledge Base context — the agent re-runs with your original resume, the JD, and your new instruction combined. Every version is saved so you can compare and pick the best one.

**How it works under the hood:**

```
User prompt: "Make it more concise, one page only"
       │
       ▼
Resume Optimizer Agent
  ├── Fetches: original parsed resume from KB
  ├── Fetches: JD requirements from KB
  ├── Applies: user's regeneration instruction as a constraint
  └── Outputs: new tailored resume variant (v2, v3, ...)
```

### 5. Cover Letter Agent
One button. The agent reads your resume, the JD, and the company name to produce a focused, non-generic cover letter.

Supports the same regeneration pattern:

```
"Make it shorter — 3 paragraphs max"
"Use a more confident, direct tone"
"Emphasize my transition from frontend to full-stack"
[ Regenerate ]
```

### 6. Interview Preparation
The Interview Agent generates:
- Likely technical and behavioral questions for this specific role
- Topics to revise based on your skill gaps
- Talking points drawn from your own resume and projects

---

## Career Knowledge Base

Most tools index one PDF. JobLens builds a persistent, growing knowledge base:

| Source | What Gets Stored |
|---|---|
| Resume | Parsed skills, experience, education, projects |
| Job Descriptions | JD text, required skills, company context |
| GitHub READMEs | Project descriptions, tech used, outcomes |
| Certificates | Credential names, dates, issuing bodies |
| Portfolio content | Case studies, descriptions, links |

Whenever any agent needs context — for matching, tailoring, interview prep, regeneration, or Q&A — it retrieves from this unified store using semantic search.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        JobLens                              │
│                                                             │
│  User ──► Resume Upload / JD Input / URL                    │
│                │                                            │
│                ▼                                            │
│         Resume Agent ──► Career Knowledge Base (Qdrant)     │
│                                   │                         │
│           ┌───────────────────────┼────────────────────┐   │
│           ▼                       ▼                    ▼   │
│      Match Agent          Resume Optimizer        Cover Letter Agent  │
│      (score + gaps)       (tailored resume)       (draft + regen)     │
│                                                         │   │
│                                                         ▼   │
│                                               Interview Agent          │
│                                               (questions + prep)       │
│                                                                        │
│                        Dashboard (React)                               │
└────────────────────────────────────────────────────────────────────────┘
```

### Agent Roles

| Agent | Responsibility |
|---|---|
| Resume Agent | Parse uploaded resume, extract structured data, embed into KB |
| Match Agent | Semantic match between profile and JD; return score + gap list |
| Resume Optimizer | Reorder + rewrite resume; re-runs with user prompt for regeneration |
| Cover Letter Agent | Draft cover letter; supports regeneration with tone/length prompts |
| Interview Agent | Generate questions, revision topics, and talking points |

All agents are implemented as **LangGraph.js** nodes in a single stateful graph. LangChain.js handles LLM calls and Qdrant retrieval.

---

## Tech Stack

| Layer | Technology | Role |
|---|---|---|
| Frontend | React + TypeScript + Tailwind CSS | Dashboard UI |
| Backend | Node.js + Express.js + TypeScript | API, file handling, auth |
| AI Orchestration | LangGraph.js | Stateful multi-agent graph with regeneration loop |
| LLM + Retrieval | LangChain.js + Gemini API | Agent reasoning + RAG |
| Vector DB | Qdrant | Career Knowledge Base (semantic search) |
| Relational DB | PostgreSQL | Users, sessions, job history, resume versions |
| Auth | JWT + Google OAuth | Authentication |
| Containers | Docker + Compose | Local dev + deployment |

---

## Project Structure

```
joblens/
├── apps/
│   ├── frontend/                        # React + TypeScript + Tailwind
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── Upload.tsx
│   │       │   └── InterviewPrep.tsx
│   │       └── components/
│   │           ├── MatchScoreCard/
│   │           ├── ResumeViewer/
│   │           ├── RegeneratePromptBar/  # prompt input + version history
│   │           ├── CoverLetterModal/
│   │           └── SkillGapChart/
│   │
│   └── backend/                         # Node.js + Express + LangGraph.js
│       └── src/
│           ├── agents/
│           │   ├── resumeAgent.ts
│           │   ├── matchAgent.ts
│           │   ├── optimizerAgent.ts     # accepts regeneration prompt
│           │   ├── coverLetterAgent.ts   # accepts regeneration prompt
│           │   └── interviewAgent.ts
│           ├── graph/
│           │   └── careerGraph.ts        # LangGraph state machine
│           ├── kb/
│           │   └── knowledgeBase.ts      # Qdrant helpers
│           ├── routes/
│           ├── middleware/
│           └── db/                       # PostgreSQL schema + queries
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 20+
- Gemini API key
- Google OAuth credentials (for auth)

### 1. Clone & configure

```bash
git clone https://github.com/your-username/joblens.git
cd joblens
cp .env.example .env
# Fill in: GEMINI_API_KEY, DATABASE_URL, QDRANT_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET
```

### 2. Start all services

```bash
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000 |
| Qdrant UI | http://localhost:6333/dashboard |
| PostgreSQL | localhost:5432 |

### 3. Upload your resume

Go to `http://localhost:3000` → upload your PDF or DOCX → the Resume Agent parses and indexes it.

### 4. Analyze a job

Paste any job description → get your match score, tailored resume, and interview questions.

### 5. Regenerate until it's right

On any generated output (resume, cover letter), type a custom instruction and hit **Regenerate**. Compare versions and download the one you want.

---

## Environment Variables

```env
# LLM
GEMINI_API_KEY=

# Vector DB
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=joblens_kb

# Relational DB
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/joblens

# Auth
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# App
FRONTEND_URL=http://localhost:3000
PORT=4000
```

---

## Roadmap

### Phase 1 — Core Pipeline
- [ ] Resume upload + parsing (PDF/DOCX)
- [ ] JD input (paste / upload / URL)
- [ ] Career Knowledge Base (Qdrant setup + embedding pipeline)
- [ ] Match Agent with score + gap analysis

### Phase 2 — Generation Agents
- [ ] Resume Optimizer Agent (first-pass tailoring)
- [ ] Resume regeneration with custom prompt + version history
- [ ] Cover Letter Agent (first-pass generation)
- [ ] Cover letter regeneration with tone/length prompt
- [ ] Interview Prep Agent

### Phase 3 — Frontend
- [ ] Dashboard with match score card
- [ ] Tailored resume viewer + download
- [ ] Regenerate prompt bar with version switcher
- [ ] Cover letter modal + edit + regenerate
- [ ] Interview questions panel

### Phase 4 — Knowledge Base Expansion
- [ ] GitHub README ingestion
- [ ] Certificate upload
- [ ] Portfolio / case study input

### Phase 5 — Polish
- [ ] Google OAuth + JWT auth
- [ ] Job history (saved JDs + all generated versions)
- [ ] Export to PDF
- [ ] Docker production build

---

## Contributing

This project is being built collaboratively. To get started:

1. Pick a task from the roadmap above
2. Create a branch: `git checkout -b feature/your-task`
3. Make your changes and open a PR against `main`
4. Keep PRs focused — one feature or fix per PR

---

## License

MIT © 2024 JobLens

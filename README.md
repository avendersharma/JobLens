# 🚀 JobLens

### AI-Powered Career Assistant for Smarter Job Applications

JobLens is a multi-agent AI system that analyzes your resume, scores it against any job description, tailors your resume for the role, writes your cover letter, and generates interview prep — all powered by a unified Career Knowledge Base.

No auto-applying. No black-box spraying. Just signal: you see exactly where you stand, what's missing, and what to do next — then you apply with confidence.

---

# 🎬 Demo

### How JobLens Works

```text
Upload Resume  →  Paste Job Description  →  Get Match Score
```

### JobLens Dashboard

```text
─────────────────────────────────────────────────────────────
                        JOBLENS
─────────────────────────────────────────────────────────────

  Resume Uploaded
  ✔  John_Doe_Resume.pdf

  Job Match Score
  91%   ████████████████████░░

  Strengths
  ✔ React    ✔ Node.js    ✔ Docker    ✔ PostgreSQL

  Missing Skills
  ✖ AWS      ✖ Redis

  Recommendation
  Strong candidate — apply with tailored resume.

  [ Download Tailored Resume ]
  [ Generate Cover Letter ]
  [ View Interview Questions ]

─────────────────────────────────────────────────────────────
```

### 🔄 Application Flow

```text
        📄 Resume
            │
            ▼
      🤖 Resume Analysis
            │
            ▼
      🎯 Job Match Analysis
            │
       ┌────┼────┐
       ▼    ▼    ▼
   Strengths Gaps Score
       │
       ▼
   📝 Resume Tailoring
       │
       ├──────────────► ✉️ Cover Letter
       │
       └──────────────► 🎤 Interview Prep
```

---

# ✨ Features

## 📄 1. Resume Upload & Parsing

Upload your resume in **PDF or DOCX** format.

The Resume Agent extracts and structures:

* Skills
* Work experience
* Company and role
* Education
* Projects
* Relevant achievements

The extracted information is embedded and stored in the **Career Knowledge Base**, allowing other agents to retrieve relevant information when needed.

---

## 🎯 2. Job Description Input

JobLens supports multiple ways to provide a job description:

* **Paste** raw job description text
* **Upload** a JD as PDF
* **Provide** a company careers-page URL

The job description can also be embedded into the Knowledge Base so relevant context can be retrieved during analysis and generation.

---

## 📊 3. AI Match Score

The Match Agent performs a **semantic comparison** between your career profile and the target job description rather than relying only on keyword counting.

Example:

```text
Match Score: 91%

Strengths
✔ React
✔ Node.js
✔ Docker
✔ PostgreSQL

Missing Skills
✖ AWS
✖ Redis

Recommendation
Strong candidate. Consider adding a small AWS project
to close the gap.
```

This helps candidates understand not just their score, but **why they match and where they need improvement**.

---

## 📝 4. AI Resume Tailoring

The Resume Optimizer generates a version of your resume optimized for the target role.

It can:

* Reorder projects based on relevance
* Surface relevant skills
* Improve resume bullet points
* Use ATS-friendly terminology from the job description
* Preserve the candidate's actual experience

> **JobLens does not invent experience.**
> It reorganizes and rewords information that already exists in your career profile.

### 🔄 Custom Resume Regeneration

You can refine the generated resume using natural-language instructions.

For example:

```text
"Make it more concise."

"Focus only on backend experience."

"Make it one page."

"Emphasize leadership experience."

"Highlight open-source contributions."
```

Each regeneration uses the original resume, job description, Career Knowledge Base context, and your new instruction to produce another version.

---

## ✉️ 5. Personalized Cover Letter

The Cover Letter Agent generates a focused cover letter using:

* Your resume
* Job description
* Company information

You can also regenerate the letter with custom instructions:

```text
"Make it shorter — 3 paragraphs maximum."

"Use a more confident tone."

"Emphasize my backend experience."

"Focus more on my projects."
```

The same regeneration workflow can be used to refine the generated result.

---

## 🎤 6. Interview Preparation

The Interview Agent generates role-specific interview preparation including:

* Technical questions
* Behavioral questions
* Topics to revise
* Resume-based talking points
* Skill-gap focused preparation

This allows candidates to prepare based on the **actual role they are targeting** rather than relying only on generic interview questions.

---

# 🧠 Career Knowledge Base

JobLens uses a persistent **Career Knowledge Base** instead of treating every request as an isolated interaction.

Information can be stored from multiple career-related sources:

| Source              | Information                               |
| ------------------- | ----------------------------------------- |
| 📄 Resume           | Skills, experience, education, projects   |
| 💼 Job Descriptions | Requirements, skills, company context     |
| 🐙 GitHub READMEs   | Projects, technologies, outcomes          |
| 🏆 Certificates     | Credentials, dates, issuing organizations |
| 🌐 Portfolio        | Case studies, descriptions, links         |

When an agent needs additional context, it retrieves relevant information from the unified Knowledge Base using **semantic search**.

---

# 🤖 Multi-Agent Architecture

JobLens uses **LangGraph.js** to coordinate multiple specialized AI agents through a stateful workflow.

```text
                         ┌──────────────────┐
                         │       User       │
                         └────────┬─────────┘
                                  │
                    Resume / Job Description
                                  │
                                  ▼
                         ┌──────────────────┐
                         │   Resume Agent   │
                         └────────┬─────────┘
                                  │
                                  ▼
                    ┌─────────────────────────┐
                    │ Career Knowledge Base   │
                    │         Qdrant          │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
       ┌────────────┐    ┌──────────────┐   ┌──────────────┐
       │Match Agent │    │Resume         │   │Cover Letter  │
       │            │    │Optimizer      │   │Agent         │
       └─────┬──────┘    └──────┬───────┘   └──────┬───────┘
             │                  │                  │
             └──────────────────┼──────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Interview Agent │
                       └────────┬────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    Dashboard    │
                       └─────────────────┘
```

### Agent Responsibilities

| Agent                  | Responsibility                                           |
| ---------------------- | -------------------------------------------------------- |
| **Resume Agent**       | Parse uploaded resume and extract structured information |
| **Match Agent**        | Perform semantic job matching and identify skill gaps    |
| **Resume Optimizer**   | Tailor and regenerate resumes for specific roles         |
| **Cover Letter Agent** | Generate and regenerate personalized cover letters       |
| **Interview Agent**    | Generate role-specific questions and preparation         |

All agents are implemented as **LangGraph.js nodes**, while **LangChain.js** handles LLM calls and Qdrant retrieval.

---

# 🛠️ Tech Stack

| Layer                   | Technology                        | Purpose                                 |
| ----------------------- | --------------------------------- | --------------------------------------- |
| **Frontend**            | React + TypeScript + Tailwind CSS | Dashboard UI                            |
| **Backend**             | Node.js + Express.js + TypeScript | API, authentication & file handling     |
| **AI Orchestration**    | LangGraph.js                      | Stateful multi-agent workflow           |
| **LLM & RAG**           | LangChain.js + Gemini API         | AI reasoning & retrieval                |
| **Vector Database**     | Qdrant                            | Career Knowledge Base                   |
| **Relational Database** | PostgreSQL                        | Users, sessions, job history & versions |
| **Authentication**      | JWT + Google OAuth                | User authentication                     |
| **Containers**          | Docker + Docker Compose           | Local development & deployment          |

---

# 📁 Project Structure

```text
JobLens/
│
├── apps/
│   │
│   ├── frontend/
│   │   └── src/
│   │       ├── pages/
│   │       │   ├── Dashboard.tsx
│   │       │   ├── Upload.tsx
│   │       │   └── InterviewPrep.tsx
│   │       │
│   │       └── components/
│   │           ├── MatchScoreCard/
│   │           ├── ResumeViewer/
│   │           ├── RegeneratePromptBar/
│   │           ├── CoverLetterModal/
│   │           └── SkillGapChart/
│   │
│   └── backend/
│       └── src/
│           ├── agents/
│           │   ├── resumeAgent.ts
│           │   ├── matchAgent.ts
│           │   ├── optimizerAgent.ts
│           │   ├── coverLetterAgent.ts
│           │   └── interviewAgent.ts
│           │
│           ├── graph/
│           │   └── careerGraph.ts
│           │
│           ├── kb/
│           │   └── knowledgeBase.ts
│           │
│           ├── routes/
│           ├── middleware/
│           └── db/
│
├── docker-compose.yml
├── .env.example
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

Before running JobLens, make sure you have:

* Node.js 20+
* Docker
* Docker Compose
* Gemini API key
* Google OAuth credentials

---

## 1. Clone the Repository

```bash
git clone https://github.com/avendersharma/JobLens.git
cd JobLens
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file using the provided example:

```bash
cp .env.example .env
```

Then configure:

```env
# LLM
GEMINI_API_KEY=

# Vector Database
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION=joblens_kb

# PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/joblens

# Authentication
JWT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Application
FRONTEND_URL=http://localhost:3000
PORT=4000
```

> ⚠️ **Never commit your `.env` file or expose API keys publicly.**

The environment variables above are based on the project's existing configuration.

---

# 🐳 Run with Docker

Start all services:

```bash
docker compose up --build
```

### Available Services

| Service     | URL                               |
| ----------- | --------------------------------- |
| Frontend    | `http://localhost:3000`           |
| Backend API | `http://localhost:4000`           |
| Qdrant UI   | `http://localhost:6333/dashboard` |
| PostgreSQL  | `localhost:5432`                  |

Stop the services:

```bash
docker compose down
```

---

# 🔄 User Workflow

```text
1. Upload Resume
        ↓
2. Resume Agent parses the resume
        ↓
3. Career information is stored in the Knowledge Base
        ↓
4. Add a Job Description
        ↓
5. Match Agent analyzes the job
        ↓
6. Review match score & skill gaps
        ↓
7. Generate tailored resume
        ↓
8. Generate personalized cover letter
        ↓
9. Prepare for interview
        ↓
10. Regenerate outputs using custom instructions
```

---

# 📸 Screenshots

Add your actual application screenshots here.

### 🏠 Dashboard

![JobLens Dashboard](./screenshots/dashboard.png)

### 🎯 Job Match Analysis

![Job Match Analysis](./screenshots/job-match.png)

### 🎤 Interview Preparation

![Interview Preparation](./screenshots/interview-prep.png)

> **Tip:** Keep 2–3 high-quality screenshots. A dashboard, match analysis, and one generated result are enough for a strong portfolio README.

---

# 🗺️ Roadmap

## Phase 1 — Core Pipeline

* [ ] Resume upload & parsing
* [ ] Job description input
* [ ] Career Knowledge Base
* [ ] Match Agent with score and gap analysis

## Phase 2 — Generation Agents

* [ ] Resume Optimizer
* [ ] Resume regeneration with custom prompts
* [ ] Resume version history
* [ ] Cover Letter Agent
* [ ] Cover letter regeneration
* [ ] Interview Preparation Agent

## Phase 3 — Frontend

* [ ] Dashboard
* [ ] Match score interface
* [ ] Tailored resume viewer
* [ ] Resume version switcher
* [ ] Cover letter interface
* [ ] Interview question interface

## Phase 4 — Knowledge Base Expansion

* [ ] GitHub README ingestion
* [ ] Certificate ingestion
* [ ] Portfolio / case-study ingestion

## Phase 5 — Platform Improvements

* [ ] Job application tracking
* [ ] Job history
* [ ] Resume version comparison
* [ ] PDF export
* [ ] Production deployment

These roadmap items reflect the original project's planned development areas.

---

# 🔐 Security

JobLens uses environment variables to protect sensitive credentials.

Never commit:

```text
.env
API keys
JWT secrets
Google OAuth secrets
Database credentials
```

Make sure `.env` is included in `.gitignore`.

---

# 💡 Design Philosophy

JobLens is built around one simple idea:

> **Don't just tell candidates whether they match a job. Tell them why.**

The system focuses on:

* 🎯 Context-aware job matching
* 🧠 Semantic retrieval
* 📄 Personalized resume generation
* ✉️ Role-specific cover letters
* 🎤 Interview preparation
* 🔄 Iterative AI refinement
* 📊 Explainable skill gaps

The goal is not to blindly apply to hundreds of jobs.

The goal is to help candidates understand:

> **Where do I stand? What am I missing? How can I improve my application?**

---

# 👨‍💻 Author

## Avender Sharma

**Computer Science & Engineering**

* GitHub: [@avendersharma](https://github.com/avendersharma)
* Project: [JobLens](https://github.com/avendersharma/JobLens)

---

# 📄 License

This project is licensed under the **MIT License**.

---

⭐ **If you find JobLens interesting, consider giving the repository a star!**

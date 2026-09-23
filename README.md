# StudyMate
STUDYMATE – PROBLEM & SOLUTION BRIEF

Problem Statement:
Track 2 – Education
Problem Statement 3: Autonomous Learning Planner

Problem:
Students often struggle to organize their learning effectively because their study planning depends on multiple factors such as upcoming examinations, academic performance, weak topics, available time, and missed study sessions. A static timetable can show when a student has to study, but it cannot continuously adapt the plan according to the student's progress and changing constraints.

Solution:
StudyMate is an AI-powered autonomous learning-planning platform designed to help students organize and continuously improve their study plans.

StudyMate combines timetable management, examination tracking, performance analysis, learning-resource selection, and AI-powered study planning.

The AI learning planner analyzes the student's academic information and identifies priority learning gaps. It then selects appropriate learning resources and generates study activities around the student's available time and existing timetable.

The system tracks whether planned activities are completed or missed. Based on the student's progress and changes in availability, the planner reassesses the situation and can generate a revised study plan.

Core Workflow:
1. Analyze current performance.
2. Identify priority learning gaps.
3. Select suitable learning resources.
4. Generate a study schedule around available time and timetable constraints.
5. Track completed and missed learning activities.
6. Reassess student progress.
7. Replan future activities when performance or constraints change.
8. Verify that the revised plan satisfies the available time and learning objectives.

Existing StudyMate Features:
• Student dashboard
• Timetable management
• Add and manage classes
• Exam management
• Exam countdown
• Notes management
• CRUD-based academic data management

AI Enhancement:
The AI planner extends the existing StudyMate application by turning static academic information into an adaptive learning-planning workflow.

Goal:
The goal of StudyMate is to move from a simple academic management application toward an intelligent learning companion that continuously helps students decide what to study, when to study it, and how to adjust their plan when circumstances change.

## Local AI with Ollama

The **Generate Best Notes** button (AI Planner) calls the StudyMate backend at `POST /api/generate-notes`. The backend builds a personalized, mastery-adaptive prompt from the planner's learning-gap data and calls **Ollama** running on the local machine with the **Llama 3.2** model. The browser never talks to Ollama directly — only the backend does.

Every developer who wants to use AI note generation locally needs their own Ollama installation:

1. **Install Ollama:** https://ollama.com/download
2. **Verify the installation:**
   ```bash
   ollama --version
   ```
3. **Download the model** (one time, ~2 GB):
   ```bash
   ollama pull llama3.2
   ```
4. **Verify the model:**
   ```bash
   ollama list
   ```
   Optional quick test chat:
   ```bash
   ollama run llama3.2
   ```
5. **Configure environment variables** — copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env    # Windows: copy .env.example .env
   ```
   Contents:
   ```
   OLLAMA_BASE_URL=http://localhost:11434
   OLLAMA_MODEL=llama3.2
   ```
   `localhost` means **your own machine** — you never need anyone else's IP address. Keep Ollama running while using the app.
6. **Start StudyMate:**
   ```bash
   node dev-server.js
   ```
   Then open http://localhost:3000 (requires Node.js 18+).
7. **Test AI notes:** open **AI Planner → Generate Best Notes**, pick a learning gap, click **Generate Notes**. Notes appear in the modal; use *Save to Notes* to store them in the normal Notes module.

Notes:

- The backend (not the browser) communicates with Ollama at `${OLLAMA_BASE_URL}/api/generate` using the configured `OLLAMA_MODEL`.
- Alternative local workflow: `npx vercel dev` (requires the Vercel CLI and a linked Vercel project).
- **Production limitation:** a deployed Vercel function cannot reach your laptop's `localhost` Ollama. For the public deployment to generate notes, `OLLAMA_BASE_URL` must point to a publicly reachable Ollama server (set it in the Vercel dashboard). Local development works out of the box.

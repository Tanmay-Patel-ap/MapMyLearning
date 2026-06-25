# MapMyLearning

MapMyLearning is an AI-powered educational platform that generates interactive, roadmap.sh-style learning roadmaps for any topic using the Google Gemini API.

---

## Current Status: v0.3.1 — React Rewrite

### Key Features
* **Dashboard**: roadmap.sh-style dashboard with personal roadmaps, bookmarked roadmaps, and categorized public roadmaps (Role Based / Skill Based).
* **Public Roadmaps**: Curated roadmaps seeded in the database, grouped by category.
* **Bookmarks**: Heart icon toggle on public roadmap cards — instantly adds/removes from the bookmarked section without page refresh.
* **Roadmap Viewer**: Dedicated viewer to explore roadmap steps and resources.
* **AI Generation**: Generate custom roadmaps via Gemini AI with topic, category (role/skill), and goal specification.
* **User Authentication**: Secure Signup, Login, and Profile management using JWT and Bcrypt password hashing.
* **Monolithic Architecture**: Single `server.js` and component-based React frontend — split only when confident.
* **Responsive Design**: Dark theme UI with consistent `clamp()` side padding and `max-width: 1200px` centered layout.
* **Questionnaire Modal**: Step-by-step topic input with category toggle and goal/visibility options before generation.

---

## How It Works

1. **Dashboard**: Browse public roadmaps grouped by "Role Based" and "Skill Based" categories.
2. **Bookmark**: Click the heart icon on any public roadmap to save it to your bookmarked section.
3. **Generate**: Click "Create New" → fill in topic, category, goal → AI generates a structured roadmap.
4. **View**: Click a roadmap card to open the viewer with detailed steps and resources.
5. **Save**: From the viewer, save a public roadmap to your personal collection.

---

## Tech Stack

* **Frontend**: React 19, Vite, CSS3, FontAwesome
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose 9)
* **Auth**: JWT, BcryptJS
* **AI**: Google Gemini API

---

## Getting Started

### 1. Prerequisites
* Node.js 18+ and MongoDB Atlas cluster.
* A Google Gemini API Key.

### 2. Setup Environment
Create a `.env` file in the `server/` directory:
```text
GEMINI_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/mapmylearning
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
```

### 3. Install & Run (Production)
```bash
cd server
npm install
npm start
```
Server runs on port 5000 and serves the built React client at `/`.

### 4. Development Mode (two terminals)
```bash
# Terminal 1 — Backend
cd server
npm install
npm start

# Terminal 2 — Frontend (hot reload)
cd client
npm install
npm run dev
```
Vite dev server on port 3000 proxies `/api` to `localhost:5000`.

### 5. Seed Public Roadmaps
```bash
cd server
node seed/seedPublicRoadmaps.js
```

---

## Project Structure

```
client/                   — React + Vite frontend
  src/
    jsx/                  — React components
      App.jsx             — root component with state/API/routing
      Dashboard.jsx       — dashboard sections + cards
      Viewer.jsx          — roadmap step viewer
      Questionnaire.jsx   — 3-step generation modal
    css/                  — component-scoped styles
      app.css             — globals, navbar, auth forms, footer
      dashboard.css       — cards, progress, bookmarks
      viewer.css          — steps, resources
      questionnaire.css   — modal, categories, goals, visibility
    utils.js              — esc(), API constant
    main.jsx              — entry point
server/                   — Express monolithic backend
  server.js               — all models, routes, middleware, Gemini service
  seed/seedPublicRoadmaps.js
```

---

## Project Evolution

- **v0.1.0**: Basic Gemini roadmap generation (Completed ✅)
- **v0.2.0**: Express, MongoDB, and User Auth (Completed ✅)
- **v0.3.0**: Dashboard, public roadmaps, bookmarks, viewer (Completed ✅)
- **v0.3.1**: Rewrite Vanilla JS → React + Vite (Current ✅)
- **v0.4.0 (Upcoming)**: Interactive graph canvas with React Flow, node-based roadmap viewer, sidebar drawer, and per-node progress tracking.

---

## Author
**Aditya**

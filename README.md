# MapMyLearning

MapMyLearning is an AI-powered educational platform that generates interactive, roadmap.sh-style learning roadmaps for any topic using the Google Gemini API.

---

## Current Status: v0.3.0 — Dashboard & Public Roadmaps

### Key Features
* **Dashboard**: roadmap.sh-style dashboard with personal roadmaps, bookmarked roadmaps, and categorized public roadmaps (Role Based / Skill Based).
* **Public Roadmaps**: Curated roadmaps seeded in the database, grouped by category.
* **Bookmarks**: Heart icon toggle on public roadmap cards — instantly adds/removes from the bookmarked section without page refresh.
* **Roadmap Viewer**: Dedicated viewer to explore roadmap steps and resources.
* **AI Generation**: Generate custom roadmaps via Gemini AI with topic, category (role/skill), and goal specification.
* **User Authentication**: Secure Signup, Login, and Profile management using JWT and Bcrypt password hashing.
* **Modular Backend**: Server logic divided into controllers, models, routes, and services.
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

* **Frontend**: HTML5, CSS3, JavaScript (Vanilla), FontAwesome
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Auth**: JWT, BcryptJS
* **AI**: Google Gemini API

---

## Getting Started

### 1. Prerequisites
* Node.js and MongoDB installed.
* A Google Gemini API Key.

### 2. Setup Environment
Create a `.env` file in the `server/` directory:
```text
GEMINI_API_KEY=your_actual_api_key_here
MONGODB_URI=mongodb://localhost:27017/ai_roadmap
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=30d
PORT=5000
```

### 3. Seed Public Roadmaps
```bash
node server/seed/seedPublicRoadmaps.js
```

### 4. Installation & Run
```bash
# Install dependencies
npm install

# Start the server
npm start
```
The application will be available at `http://localhost:5000`.

---

## Project Evolution

- **v0.1.0**: Basic Gemini roadmap generation (Completed ✅)
- **v0.2.0**: Express, MongoDB, and User Auth (Completed ✅)
- **v0.3.0**: Dashboard, public roadmaps, bookmarks, viewer (Current ✅)
- **v0.4.0 (Upcoming)**: Interactive graph canvas with node-based roadmap viewer, sidebar drawer, and per-node progress tracking.

---

## Author
**Aditya**

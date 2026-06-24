# MapMyLearning

MapMyLearning is an AI-powered educational platform designed to simplify learning by generating structured, step-by-step roadmaps for any topic using the Google Gemini API.

---

## Current Status: v0.1.0-basic-gemini-roadmap ✅

This is the foundation version of the project, focusing on a clean, functional, and "human-readable" implementation of the core roadmap generation flow.

### Key Features
* **Minimalist Web GUI**: A simple, responsive interface built with vanilla HTML, CSS, and JS.
* **Instant Roadmap Generation**: Uses Gemini AI to create 6-8 logical learning steps for any topic.
* **Resource Suggestions**: Each step includes curated resources to jumpstart the learning process.
* **Lightweight Node.js Server**: A built-in HTTP server with zero external dependencies (excluding AI integration).
* **Robust Error Handling & Logging**:
    * **Server-side Logging**: Tracks every request, AI interaction, and system error with ISO timestamps.
    * **Client-side Logging**: Logs user actions and API responses to the browser console for easier debugging.
    * **API Retry Logic**: Automatically retries with alternative Gemini models if a specific model is unavailable.
    * **User-friendly Error Messages**: Clear status updates for missing inputs, API failures, or timeouts.

---

## How It Works

1. **User Input**: Enter a topic (e.g., "Quantum Computing" or "Baking").
2. **AI Orchestration**: The backend sends a structured prompt to Google Gemini.
3. **Structured Response**: Gemini returns a JSON-formatted roadmap.
4. **Interactive Display**: The frontend renders the roadmap as a series of clean, actionable cards.

---

## Tech Stack

* **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
* **Backend**: Node.js (Core HTTP module)
* **AI**: Google Gemini API (`gemini-3.5-flash`)

---

## Getting Started

### 1. Prerequisites
* Node.js installed on your machine.
* A Google Gemini API Key.

### 2. Setup Environment
Create a `.env` file in the `server/` directory:
```text
GEMINI_API_KEY=your_actual_api_key_here
PORT=5000
```

### 3. Installation & Run
```bash
# Start the server
npm start
```
The application will be available at `http://localhost:5000`.

---

## Project Evolution

Inspired by the simplicity and structure of advanced educational tools, this project is built to scale step-by-step:
- **Next Up**: Migration to React & Express for a more modular architecture.
- **Future**: Persistence with MongoDB, user authentication, and interactive AI-generated quizzes.

---

## Author
**Aditya**


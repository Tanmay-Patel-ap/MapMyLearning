# MapMyLearning

MapMyLearning is an AI-powered educational platform designed to simplify learning by generating structured, step-by-step roadmaps for any topic using the Google Gemini API.

---

## Current Status: v0.2.0-modular-auth-express 🚀

This version introduces a professional, modular backend architecture and a full user authentication system.

### Key Features
* **Modular Backend Architecture**: Server logic is divided into controllers, models, routes, and services for maximum maintainability.
* **User Authentication**: Secure Signup, Login, and Profile management using JWT (JSON Web Tokens) and Bcrypt password hashing.
* **Modern Dark UI**: A complete redesign with a sleek dark theme, responsive navigation, and interactive user menus.
* **Database Integration**: Powered by MongoDB for future persistence of user-generated roadmaps.
* **Express.js Framework**: Migrated from a basic HTTP server to a robust Express.js setup.
* **Enhanced AI Integration**: Improved roadmap generation logic with dedicated services and better parsing.

---

## How It Works

1. **User Auth**: Create an account or login to access personalized features.
2. **Topic Generation**: Enter a topic, and the system coordinates with Gemini AI.
3. **Modular Processing**: Requests flow through specialized routes and controllers to the AI service.
4. **Interactive Result**: View your custom roadmap with suggested resources in a modern, card-based layout.

---

## Tech Stack

* **Frontend**: HTML5, CSS3, JavaScript (Vanilla), FontAwesome
* **Backend**: Node.js, Express.js
* **Database**: MongoDB (Mongoose)
* **Auth**: JWT, BcryptJS
* **AI**: Google Gemini API (`gemini-3.5-flash`)

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

### 3. Installation & Run
```bash
# Install dependencies
npm install

# Start the server
npm start
```
The application will be available at `http://localhost:5000`.

---

## Project Evolution

This project is built to scale step-by-step:
- **v0.1.0**: Basic Gemini roadmap generation (Completed ✅)
- **v0.2.0**: Express, MongoDB, and User Auth (Completed ✅)
- **v0.3.0 (Upcoming)**: React migration and roadmap saving/sharing.
- **Future**: Interactive AI-generated quizzes and social learning features.

---

## Author
**Aditya**

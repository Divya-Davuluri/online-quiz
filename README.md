# 🎓 Online Quiz & Exam Platform

project link:https://online-quiz-liart.vercel.app/

A modern, full-stack examination management system built with **React (Vite)**, **Node.js (Express)**, and **Turso (LibSQL)**. This platform allows administrators to manage exams and students to take tests with real-time results and leaderboards.

## 🚀 Live Demo
- **Frontend (Vercel):** [https://online-quiz-liart.vercel.app](https://online-quiz-liart.vercel.app)
- **Backend (Render):** [https://online-quiz-eg39.onrender.com](https://online-quiz-eg39.onrender.com)
- **Database:** Turso (Cloud LibSQL)

---

## ✨ Features

### 👤 Student Portal
- **Dashboard:** Overview of available exams and personal performance.
- **Exam Interface:** Clean, timed interface for taking exams.
- **Results & History:** Detailed breakdown of past attempts and scores.
- **Leaderboard:** Track rankings against other students.

### 🔐 Admin Portal
- **Exam Management:** Create, edit, and publish exams.
- **Question Bank:** Add questions manually or import via Excel.
- **Student Management:** Monitor student activity and manage accounts.
- **Analytics:** Real-time dashboard showing total exams, students, and submission trends.

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, TailwindCSS, Lucide React, Framer Motion.
- **Backend:** Node.js, Express, JWT Authentication.
- **Database:** Turso (SQLite/LibSQL) for high-performance edge computing.
- **Deployment:** Vercel (Frontend) & Render (Backend).

---

## ⚙️ Setup & Installation

### 1. Prerequisites
- Node.js (v18+)
- Turso CLI (for cloud database)

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
JWT_SECRET=your_jwt_secret
TURSO_URL=libsql://your-db-url.turso.io
TURSO_AUTH_TOKEN=your_auth_token
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
Update `src/api.js` with your backend URL:
```javascript
const api = axios.create({
    baseURL: 'https://online-quiz-eg39.onrender.com/api',
});
```

### 4. Running Locally
```bash
# Start Backend
cd backend
npm start

# Start Frontend
cd frontend
npm run dev
```

---

## 📦 Deployment

### Backend (Render)
1. Connect your GitHub repository to Render.
2. Set the Environment Variables (`TURSO_URL`, `TURSO_AUTH_TOKEN`, `JWT_SECRET`) in the Render Dashboard.
3. Deploy.

### Frontend (Vercel)
1. Ensure `vercel.json` is present for SPA routing.
2. Connect the repository to Vercel and set the root directory to `frontend`.
3. Deploy.

---

## 📜 Database Schema
The system uses the following tables:
- `users`: Stores admin and student profiles.
- `exams`: Configuration for tests (time, passing score, etc.).
- `questions`: Question content and options.
- `attempts`: Records of student exam sessions.
- `answers`: Individual student responses.
- `leaderboard`: Global rankings.

---

## 🤝 Contributing
Feel free to fork this project and submit pull requests for any improvements or bug fixes.

---

## 📄 License
MIT License - Created for educational purposes.

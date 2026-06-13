# 🧠 Enterprise AI Knowledge Base & Copilot

> **An intelligent, AI-powered organizational knowledge hub** built with a conversational Gemini 2.5 Flash AI Copilot, real-time document processing, and a stunning premium glassmorphism UI.

[![GitHub](https://img.shields.io/badge/GitHub-PavaniPatluri-black?logo=github)](https://github.com/PavaniPatluri/knowledge-base)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com/pavanipatluris-projects/knowledge-base)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://knowledge-base-fl56.onrender.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![NestJS](https://img.shields.io/badge/NestJS-Backend-E0234E?logo=nestjs)](https://nestjs.com/)
[![Gemini](https://img.shields.io/badge/AI-Gemini%202.5%20Flash-4285F4?logo=google)](https://ai.google.dev/)

---

## 🌟 Overview

The **Intelligent Slack Knowledge Base** solves the universal problem of scattered organizational knowledge. Instead of digging through outdated wikis, shared drives, or old Slack threads, employees can simply **ask their AI Copilot** and get instant, contextual answers — drawn directly from your company's uploaded documents.

Built for enterprise teams, this platform centralizes documentation, surfaces knowledge gaps, and tracks engagement — all behind a beautiful, modern interface.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🤖 **AI Copilot Chat** | Conversational AI powered by Gemini 2.5 Flash with RAG pipeline |
| 📄 **Document Management** | Drag-and-drop uploads with real-time background processing |
| 📊 **Analytics Dashboard** | Executive insights with live charts, health scores & gap detection |
| 🏆 **Gamification** | Knowledge leaderboards with points and badges |
| 🔊 **Voice Input** | Hands-free speech-to-text interaction |
| 🎨 **Premium UI** | Glassmorphism, animated gradients, dark mode, micro-animations |
| ⚡ **Real-time Updates** | WebSocket-powered live document processing status |

---

## 🏗️ Tech Stack

**Frontend:** React 18, Vite, TailwindCSS v4, Framer Motion, Recharts, Socket.IO Client

**Backend:** Node.js, NestJS, Prisma ORM, Socket.IO, Multer

**Database:** SQLite (via Prisma)

**AI & ML:** Google Gemini 2.5 Flash API, LangChain, Vector Store (RAG Pipeline)

**Deployment:** Vercel (Frontend) + Render (Backend)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- A [Google Gemini API Key](https://ai.google.dev/)

### 1. Clone the Repository
```bash
git clone https://github.com/PavaniPatluri/knowledge-base.git
cd knowledge-base
```

### 2. Setup the Backend
```bash
cd backend
npm install

# Create your .env file
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY="your_gemini_api_key_here"
SLACK_BOT_TOKEN="xoxb-dummy-token"
SLACK_APP_TOKEN="xapp-dummy-token"

# Initialize the database
npx prisma db push

# Start the backend dev server (runs on port 3000)
npm run start:dev
```

### 3. Setup the Frontend
```bash
# Open a new terminal
cd frontend
npm install

# Start the frontend dev server (runs on port 5173)
npm run dev
```

### 4. Open the App
Navigate to **http://localhost:5173** in your browser 🎉

---

## 📁 Project Structure

```
knowledge-base/
├── frontend/               # React + Vite frontend
│   ├── src/
│   │   ├── pages/          # Dashboard, Chat, Documents, Teams, Admin
│   │   ├── components/     # ActivityFeed, CommandPalette, ThemeProvider
│   │   ├── lib/            # Socket.IO client, utilities
│   │   └── index.css       # Global styles + glassmorphism utilities
│   └── vercel.json         # Vercel deployment config
│
├── backend/                # NestJS backend
│   ├── src/
│   │   ├── ai/             # Gemini AI service + RAG pipeline
│   │   ├── documents/      # Upload, process, version management
│   │   ├── events/         # WebSocket gateway (Socket.IO)
│   │   ├── search/         # Semantic search service
│   │   ├── slack/          # Slack integration
│   │   └── analytics/      # Usage analytics
│   └── prisma/             # Database schema + migrations
│
├── submissions/            # Hackathon submission file
├── docker-compose.yml      # Docker orchestration
└── README.md
```

---

## 🎨 UI Highlights

The interface is designed to feel like a **next-generation AI product**, not a typical enterprise tool:

- **Deep Space Dark Mode** — rich charcoal/indigo backgrounds
- **Electric Purple & Neon Cyan Gradients** — on primary actions and AI chat bubbles
- **Frosted Glassmorphism** — translucent panels with `backdrop-blur`
- **Micro-animations** — hover lifts, scale transforms, staggered loads via Framer Motion
- **Animated Gradient Text** — on the AI assistant title and loading states

---

## 🧠 How the AI Works

The AI Copilot uses a **Retrieval-Augmented Generation (RAG)** approach:

1. **Upload** — User uploads a document (PDF, DOCX, TXT, MD)
2. **Process** — Backend splits the document into chunks and stores them in a vector store
3. **Query** — User asks a question in the chat
4. **Retrieve** — The system finds the most relevant document chunks using semantic similarity
5. **Generate** — Gemini 2.5 Flash synthesizes a conversational answer using the retrieved context
6. **Fallback** — If no relevant documents are found, the AI answers from general knowledge

---

## 🔮 Future Improvements

- [ ] Complete Slack Bot integration (listen to `@mentions` in channels)
- [ ] Migrate vector store to Pinecone/Weaviate for scalability
- [ ] Role-based access control (RBAC) for sensitive documents
- [ ] Multi-language support
- [ ] Scheduled document freshness reminders

---

## 📜 License

This project is licensed under the **MIT License** — feel free to fork and build on it!

---

<div align="center">
  Built with ❤️ by <a href="https://github.com/PavaniPatluri">Pavani Patluri</a>
</div>

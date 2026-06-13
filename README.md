# Enterprise AI Knowledge Base & Copilot

A state-of-the-art organizational knowledge base featuring an intelligent AI Copilot powered by Gemini 2.5 Flash. This platform allows teams to upload documents, track knowledge health metrics, and interact with a highly conversational, context-aware AI assistant.

## ✨ Features

- **Conversational AI Copilot:** Ask questions about company policies, onboarding materials, or any uploaded documents. Powered by Gemini 2.5 Flash, the AI answers using your organization's context or falls back to general knowledge if the documents are insufficient.
- **Premium GUI Aesthetic:** A visually stunning, modern interface featuring a vibrant dark mode, electric gradients, frosted glassmorphism, and responsive micro-animations.
- **Executive Insights Dashboard:** Real-time analytics on knowledge engagement, search success rates, and missing documentation detection.
- **Document Management:** Seamless drag-and-drop document uploads with automatic background processing, version history, and scope filtering (Personal, Team, Organization).
- **Gamified Leaderboards:** Encourages team contribution with knowledge points and badges for top contributors.
- **Voice Input Integration:** Built-in speech-to-text allowing hands-free interaction with the AI Copilot.

## 🏗️ Architecture

- **Frontend:** React, Vite, TailwindCSS (v4), Framer Motion, Recharts
- **Backend:** Node.js, NestJS, Prisma (SQLite for local development), Socket.IO
- **AI Integration:** Google Generative AI (`@google/generative-ai`), LangChain vector stores

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- A Google Gemini API Key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/PavaniPatluri/knowledge-base.git
   cd knowledge-base
   ```

2. **Setup the Backend**
   ```bash
   cd backend
   npm install
   
   # Create a .env file with your credentials
   echo "DATABASE_URL=\"file:./dev.db\"" > .env
   echo "GEMINI_API_KEY=\"your_gemini_api_key_here\"" >> .env
   
   # Initialize the database
   npx prisma db push
   
   # Start the backend server
   npm run start:dev
   ```

3. **Setup the Frontend**
   Open a new terminal window:
   ```bash
   cd frontend
   npm install
   
   # Start the frontend development server
   npm run dev
   ```

4. **Access the Application**
   Open your browser and navigate to `http://localhost:5173`

## 🎨 UI Customization

The UI utilizes a customized Tailwind CSS v4 setup. You can adjust the global color palette, animations, and premium glassmorphism settings directly within `frontend/src/index.css`.

## 📜 License

This project is licensed under the MIT License.

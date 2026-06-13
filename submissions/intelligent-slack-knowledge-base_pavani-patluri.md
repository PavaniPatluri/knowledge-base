# Intelligent Slack Knowledge Base

---

## Attendee Details

**Name:** Pavani Patluri
**GitHub Username:** PavaniPatluri
**LinkedIn Profile:** [Your LinkedIn Profile Link]
**GitHub Project Repository:** https://github.com/PavaniPatluri/knowledge-base

---

## Problem Statement Selected

Intelligent Slack Knowledge Base

---

## Project Description

The Intelligent Slack Knowledge Base is a state-of-the-art organizational platform featuring a conversational AI Copilot powered by Gemini 2.5 Flash. It is designed for enterprise teams and employees to seamlessly centralize their documentation, policies, and onboarding materials.

It solves the widespread problem of scattered organizational information by allowing users to instantly retrieve specific knowledge through a natural conversational interface, entirely eliminating the need for manual searching across outdated wikis and shared drives.

---

## Approach

I approached the problem by designing a full-stack application separated into a highly responsive React/Vite frontend and a robust NestJS backend. 

The primary user flow involves a central Document Management hub where users can drag-and-drop files. These files are processed asynchronously in the background. The AI solution utilizes a Retrieval-Augmented Generation (RAG) methodology—when a user asks a question, the AI retrieves relevant context from the uploaded documents and uses the Gemini 2.5 Flash model to synthesize a conversational and highly accurate answer.

To differentiate the project, I heavily focused on a premium User Experience (UX), designing a vibrant "glassmorphism" aesthetic with deep dark modes, neon gradients, and dynamic micro-animations to make the enterprise tool feel like a next-generation AI product.

---

## Tech Stack and Tools Used

**Frontend:** React, Vite, Tailwind CSS (v4), Framer Motion, Recharts
**Backend:** Node.js, NestJS, Prisma, Socket.IO
**Database:** SQLite (managed via Prisma ORM)
**AI Tools/API:** Google Gemini API (Gemini 2.5 Flash)
**Cloud/Deployment:** Local environment (Ready for Vercel/Render)
**Other Tools:** Antigravity AI Assistant, Git

---

## Key Features

1. **Conversational AI Copilot:** Context-aware chatbot powered by Gemini 2.5 Flash capable of answering specific organizational questions or falling back to general knowledge.
2. **Real-time Document Management:** Drag-and-drop file uploads with live status updates delivered via WebSockets (Socket.IO).
3. **Executive Insights Dashboard:** A premium analytics dashboard visualizing active queries, knowledge health scores, and AI-detected documentation gaps.

---

## What is Working?

The core RAG pipeline and AI conversational interface are fully functional and successfully integrating with the Gemini API. The document upload, real-time background processing updates (via WebSockets), and the completely redesigned premium user interface (including the Analytics Dashboard) are all fully working.

---

## What is Still in Progress?

While the knowledge base and AI standalone chat work flawlessly, the direct integration with the Slack API (creating the actual Slack Bot application to listen to commands inside a workspace) is still in progress. Additionally, I am planning to migrate the local file storage to a cloud vector database (like Pinecone or Weaviate) for scalable semantic search.

---

## Screenshots or Demo

**Deployed Link:** [Insert Vercel/Render Link if deployed]
**Demo Video Link:** [Insert YouTube/Loom Link]
**Screenshots:** [Insert Screenshot Links from your repo]

---

## Challenges Faced

One of the main challenges was navigating the Gemini API model versions; I initially encountered errors with deprecated models (like Gemini 1.5) and had to migrate the codebase and prompt structures to strictly utilize `gemini-2.5-flash`. Additionally, implementing real-time progress updates for file processing required setting up and handling persistent WebSocket connections between the NestJS backend and the React frontend.

---

## Learnings

I gained significant experience in prompt engineering and RAG architecture, specifically learning how to instruct an LLM to rely strictly on provided context while maintaining a conversational tone. I also deepened my understanding of modern UI/UX design, successfully implementing Tailwind v4, glassmorphism, and Framer Motion animations to elevate the perceived quality of a B2B application.

---

## Future Improvements

If I had more time, I would complete the Slack Bot integration so users can query the Knowledge Base directly from their Slack channels using `@Mentions` or `/commands`. I would also implement a role-based access control (RBAC) system to ensure sensitive documents are only queryable by authorized executives or HR personnel.

---

## Final Note

I wanted to ensure that this project wasn't just functionally sound, but visually stunning. I believe that internal enterprise tools shouldn't look boring, and integrating a premium "AI" aesthetic significantly boosts user engagement and adoption within an organization!

# WESBYTE

### *Generate. Refine. Edit. Deploy. All with AI.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 📖 Overview

Wesbyte is a production‑ready, AI‑powered no‑code website builder.  
Describe your dream website in plain English – the AI generates a complete, responsive layout instantly. Refine it through an intelligent chat interface, then visually customize every component with a drag‑and‑drop editor. Zero code required.

Built with **Next.js (App Router)** and **React**, it combines the best of generative AI and visual development tools (like Webflow/Framer) into a single seamless workflow.

---

## ✨ Features

### 🤖 AI Website Generation
- Generate full page structures from a natural language prompt
- Includes: Hero, Features, Pricing, FAQ, Testimonials, Footer, and more
- Smart content suggestions based on your industry/use case

### 💬 AI Refinement Interface
- Real‑time chat with AI to modify design, layout, styling, or copy
- Instant updates – no re‑generation delays
- Understands high‑level instructions (“make the CTA more prominent”, “use a softer colour palette”)

### 🎨 Visual Drag‑and‑Drop Editor
- Webflow‑like visual editing with **dnd‑kit**
- Move, resize, duplicate, or delete any component
- Component library: buttons, cards, navbars, forms, grids, images, text blocks
- Layer‑based structure panel (hierarchy + visibility toggles)
- Responsive preview: desktop / tablet / mobile
- Undo/redo system + automatic saving

### 🚀 Production & Export
- One‑click export as **React / Next.js** code (ready to deploy)
- Built‑in SEO configuration (meta tags, Open Graph, sitemap)
- Dark / light mode toggle for generated sites
- Deployment‑ready output (Vercel, Netlify, or any Node.js host)

---

## 🧱 Tech Stack

| Category        | Technologies                                                                 |
|----------------|-------------------------------------------------------------------------------|
| Framework       | Next.js (App Router), React 18                                                |
| Styling         | Tailwind CSS, Framer Motion (animations)                                      |
| Drag & Drop     | dnd‑kit                                                                       |
| State Management| Zustand (or Redux)                                                            |
| Backend         | Firebase / Supabase (authentication, database, storage)                       |
| AI Generation   | OpenAI API (GPT‑4 / GPT‑3.5‑turbo)                                            |
| Deployment      | Vercel (recommended)                                                          |

---

## ⚒️ Installation 

```bash
# 1. Clone the repository
git clone https://github.com/your-username/webgen-ai.git
cd webgen-ai

# 2. Install dependencies
npm install

# 3. Set up environment variables (see below)
cp .env.example .env.local

# 4. Run the development server
npm run dev```
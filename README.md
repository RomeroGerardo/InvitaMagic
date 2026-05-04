# InvitaMagic ✨

InvitaMagic is a modern, premium web application for creating, managing, and sharing beautiful event invitations. Built with React, TypeScript, and Supabase, it features an intuitive dashboard, seamless RSVP tracking, and AI-powered invitation text generation.

## 🚀 Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion (for smooth micro-interactions & animations)
- **State Management:** Zustand
- **Routing:** React Router DOM v6
- **Forms & Validation:** React Hook Form
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security)
- **AI Integration:** Groq API (via Supabase Edge Functions)
- **Utilities:** date-fns, lucide-react, react-helmet-async

## 🛠️ Features

- **User Authentication:** Secure signup and login via Supabase Auth.
- **Event Dashboard:** Create and manage events with a premium glassmorphism design.
- **AI Text Generation:** Automatically generate creative invitation descriptions using the Groq API based on event themes.
- **Public Invitation Views:** Shareable links (`/invitacion/:id`) with dynamic meta tags for optimal sharing on WhatsApp and social media.
- **Countdown Timer:** Real-time countdown clock to the event.
- **RSVP Tracking:** Guests can confirm attendance, and organizers see real-time statistics (confirmed, rejected, companions) on their dashboard.

## 🏁 Getting Started Locally

### Prerequisites

- Node.js (v18 or higher recommended)
- A Supabase account and project
- A Groq API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd InvitaMagic
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Copy the example environment file and fill in your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

4. **Database Setup:**
   Run the SQL script located in `supabase/schema.sql` in your Supabase project's SQL Editor to create the necessary tables (`events`, `guests`) and RLS policies.

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## 🚢 Deployment

This project is configured as a Single Page Application (SPA). A `vercel.json` file is included to handle client-side routing rewrites correctly.

1. Push your code to a GitHub repository.
2. Import the project into Vercel (or Netlify).
3. Ensure you add the environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) in the hosting platform's dashboard.
4. Deploy! The build command is `npm run build` and the output directory is `dist`.

---
*Developed as part of Romero Labs MVP sprints.*

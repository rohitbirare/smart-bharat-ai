# BharatSetu AI 🇮🇳
### An AI Civic Trust Copilot for India

> "India doesn't lack schemes. It lacks trust and guidance."

BharatSetu AI is a Gemini-powered civic companion that helps Indian citizens discover
government schemes they actually qualify for, navigate life events, and draft formal
complaint letters — without middlemen.

---

## 🚀 What Makes This Different

Every response is **generated live by Gemini AI** based on the exact details you enter —
there is no hardcoded scheme database driving the results.

1. **Civic Twin Dashboard** — enter age, state, profession, income and situation; Gemini
   reasons about real eligibility and explains *why*.
2. **Life Event Intelligence** — describe any life event in your own words; Gemini
   detects urgency, recommends services, and warns against common mistakes.
3. **Smart Complaint Agent** — describe a civic issue; Gemini drafts a submission-ready
   formal letter, identifies the correct department, and sets a priority.
4. **Civic Confidence Meter** — a live readiness ring showing how complete your
   complaint is before submission.
5. **Prompt Transparency Page** — every prompt sent to Gemini is shown in the app itself,
   with a "View Prompt Used" toggle on every result.
6. **Graceful Offline Fallback** — if no API key is set (or the API fails), the app shows
   clearly-labeled sample data instead of crashing.

---

## 🛠️ Tech Stack

- **Framework**: React + Vite
- **Styling**: Tailwind CSS v4
- **AI Engine**: Google Gemini API (`gemini-2.0-flash`, JSON mode)
- **Animations**: Framer Motion
- **Icons**: lucide-react
- **Routing**: React Router (HashRouter)
- **Storage**: localStorage (client-side history, no backend needed)

---

## 💻 Setup Instructions

### 1. Install dependencies
```bash
npm install
```

### 2. Add your Gemini API key
Get a free key from [Google AI Studio](https://aistudio.google.com/apikey), then:
```bash
cp .env.example .env
```
Edit `.env`:
```env
VITE_GEMINI_API_KEY=your_google_gemini_api_key
```

*Without a key, the app runs in offline mode with sample data on every page — safe for
a demo but not personalized.*

### 3. Run the dev server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173)

### 4. Build for production
```bash
npm run build
```
Output goes to `dist/` — ready to deploy to Vercel, Netlify, or any static host.

---

## 📁 Folder Structure

```
src/
  components/     Navbar, ConfidenceRing, AITransparency, LoadingSkeleton
  pages/          Landing, CivicTwin, LifeEvent, Complaint, History, HowItWorks
  services/       geminiService.js — single reusable Gemini API function
  utils/          storage.js, trackingId.js, mockData.js
```

---

## 🔮 Future Roadmap (Phase 2)

- Multilingual support (Hindi, Marathi, Tamil, Bengali)
- Family Civic Assistant — manage multiple household members' journeys
- Image-based complaint analysis (photo upload with auto severity detection)
- Firebase Auth for cross-device history sync

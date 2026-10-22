# Precision Resume Studio & Builder

A modern resume builder web app with **AI-powered job discovery and an agent
harness that applies to jobs for you**.

Built with React 19, Vite 8 and Tailwind CSS 4.

---

## Features

### Resume building
- **6 distinct templates**: Executive Classic (default), Modern Two-Tone,
  Minimalist ATS Pro, Emerald Horizon, Nordic Luxury, Grid Master (1-page)
- **Native DOCX export** - real `.docx` files with embedded photos, custom
  fonts, coloured headings and bullet points
- **High-resolution PDF export and print** - vector-sharp output
- **Live ATS score** - evaluates the resume against recruiter filters as you type
- **Theme customiser** - colours, fonts, spacing, single-page auto-fit
- **Resume ingestion** - upload a DOCX and auto-fill the form
- **Multi-provider AI** - Vyce AI, OpenAI, Groq, OpenRouter, DeepSeek, Mistral,
  Ollama (local) or any OpenAI-compatible endpoint, with model discovery

### Job discovery agent
Browser automation that searches **LinkedIn, Naukri and Indeed** for openings
and feeds them into the ATS matcher.

- Live scraping of three job boards, run in parallel with per-site retry
- UAE/Gulf aware - routes to regional Indeed hosts and normalises Gulf locations
- Automatic **title fan-out** when a narrow title matches almost nothing
- Optional sign-in for personalised/filtered results
- Every listing carries a working application URL

### Apply agent
Opens an application, fills the form from your resume, and attaches your
DOCX - across Greenhouse, Lever, Workday, Ashby, SmartRecruiters, Taleo,
iCIMS, SuccessFactors, BambooHR, JazzHR and Personio.

- **Never submits on its own** - you press Submit twice
- **Never answers protected-characteristic questions** (gender, ethnicity,
  veteran status, disability, religion, pronouns)
- **Never solves CAPTCHAs** - they are reported for you
- Reports what it filled, what it skipped, and what needs you, with a
  screenshot of the result

See [`JOB-HARNESS.md`](./JOB-HARNESS.md) for the full technical reference:
selectors, ATS field mapping, safety model and troubleshooting.

---

## Getting started

```bash
npm install
npx playwright install chromium

# terminal 1 - the discovery + apply agent service
npm run jobs:api          # http://localhost:3457

# terminal 2 - the app
npm run dev               # http://localhost:5173
```

### Configure AI

Open **AI Settings** in the app, or set an environment variable:

```bash
# .env.local
VITE_AI_API_KEY=your-key-here
```

> No API key is committed to this repository. The app falls back to an empty
> key and prompts you to configure one.

### Use job discovery

1. Click **JOB_MATCH** in the navbar
2. Click **Auto-Discover**
3. Optionally click **Logins** to add job board credentials and the absolute
   path to the resume file you want uploaded
4. Set your filters, then **Search Job Postings**
5. Click a result to load it into the ATS analyzer, or hit **Apply** to hand it
   to the apply agent

### Use the apply agent

1. Export your resume as DOCX
2. Paste its absolute path into **Job Board Logins -> Resume file for
   applications**
3. On any discovered job, click **Apply**
4. Optionally generate a cover letter with AI
5. **Prepare Application** fills the form; review the report, then press
   **Submit Application** twice if you want the agent to click it

---

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Serve the production build |
| `npm run lint` | Run oxlint |
| `npm run jobs:api` | Start the discovery + apply agent service on :3457 |
| `npm run jobs:test` | Run the scrapers standalone against the live sites |

---

## Project layout

```
src/
├── agents/                    # Node-side agent harness (.cjs - CommonJS)
│   ├── api-server.cjs         # Express API: /discover-jobs, /apply, /health
│   ├── browser-scrapers/      # Playwright job-board scrapers
│   └── apply-agent/           # Application filler + candidate profile
├── components/
│   ├── editor/                # Resume form panels
│   ├── preview/               # Live resume preview
│   ├── templates/             # The 6 resume templates
│   └── ui/                    # Modals (AI config, ATS, job match, apply...)
├── data/initialData.js        # Default resume + theme configuration
└── utils/                     # AI, ATS scoring, exporters, discovery, apply
```

The agent harness runs in Node, so its files use the `.cjs` extension - the
package itself is ESM (`"type": "module"`).

---

## Requirements

- Node 18+
- Google Chrome installed (the scrapers use the real browser; bundled
  Chromium gets blocked by Naukri and Indeed)

## License

MIT

# 📊 InvestorAI — AI Investment Research Agent

An AI-powered investment research agent that takes a company name, researches it across five key dimensions using web search and LLM analysis, and delivers a clear **INVEST** or **PASS** recommendation with detailed reasoning.

Built with **React** (frontend), **Node.js/Express** (backend), **LangChain.js + LangGraph.js** (AI orchestration), **Google Gemini** (LLM), and **Tavily** (web search).

---

## 🚀 Overview — What It Does

InvestorAI is an end-to-end investment research agent. You enter a company name, and the AI agent:

1. **🏢 Company Overview** — Researches the business model, products, leadership, and market position
2. **📊 Financial Analysis** — Analyzes revenue, profitability, key ratios, and balance sheet health
3. **📰 News & Sentiment** — Scans recent news and determines overall market sentiment
4. **⚔️ Competitive Analysis** — Evaluates competitive moat, key rivals, and SWOT
5. **📈 Market & Industry** — Assesses industry trends, regulatory environment, and macro factors

After completing all research phases, the agent aggregates the findings and delivers:
- A definitive **INVEST** or **PASS** verdict
- An **overall score** (0-100) with **confidence level**
- **Dimension scores** (Business Model, Financial Health, Growth Potential, etc.)
- **Key reasons**, **risk factors**, and **upcoming catalysts**
- **Recommended action** and **time horizon**

All research happens in real-time with **live streaming** via Server-Sent Events (SSE), so you see each phase complete as it happens.

---

## 🛠 How to Run It

### Prerequisites
- **Node.js** v18 or later
- **Google Gemini API Key** (free) — [Get it here](https://aistudio.google.com/apikey)
- **Tavily API Key** (free, 1000 searches/month) — [Get it here](https://tavily.com/)

### Setup Steps

```bash
# 1. Clone or unzip the project
cd ai-investment-research-agent

# 2. Create .env file with your API keys
cp .env.example .env
# Edit .env and add your keys:
#   GOOGLE_API_KEY=your_key_here
#   TAVILY_API_KEY=your_key_here

# 3. Install all dependencies (root + server + client)
npm run install:all

# 4. Start the development servers (both at once)
npm run dev
```

This starts:
- **Server** on `http://localhost:3001` (Express API)
- **Client** on `http://localhost:5173` (React + Vite)

Open `http://localhost:5173` in your browser and enter a company name to begin.

### Running Individually

```bash
# Server only
cd server && npm run dev

# Client only (in another terminal)
cd client && npm run dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_API_KEY` | ✅ Yes | Google Gemini API key for LLM analysis |
| `TAVILY_API_KEY` | ⚠️ Recommended | Tavily API key for web search (falls back to LLM knowledge if missing) |
| `PORT` | No | Server port (default: 3001) |

---

## 🏗 How It Works — Architecture

### System Architecture

```
┌─────────────────────┐          SSE Stream          ┌──────────────────────────┐
│                     │  ◄──────────────────────────  │                          │
│   React Frontend    │                               │   Node.js/Express API    │
│   (Vite, Port 5173) │  ──── GET /api/research ───►  │   (Port 3001)            │
│                     │                               │                          │
│  • CompanyInput     │                               │  ┌──────────────────────┐│
│  • ResearchTimeline │                               │  │  LangGraph.js Agent  ││
│  • InvestmentReport │                               │  │                      ││
│  • ScoreGauge       │                               │  │  StateGraph with     ││
│                     │                               │  │  6 sequential nodes  ││
└─────────────────────┘                               │  │                      ││
                                                      │  │  Each node uses:     ││
                                                      │  │  • Tavily Search     ││
                                                      │  │  • Gemini Analysis   ││
                                                      │  │  • LangChain Chains  ││
                                                      │  └──────────────────────┘│
                                                      └──────────────────────────┘
```

### Agent Pipeline (LangGraph State Graph)

```
START → research_overview → research_financials → research_news → research_competition → research_market → investment_decision → END
```

Each node follows this pattern:
1. **Search**: Uses `TavilySearchResults` (LangChain tool) to search the web for relevant data
2. **Analyze**: Passes search results to `ChatGoogleGenerativeAI` (Gemini) via a `ChatPromptTemplate` → `RunnableSequence` chain
3. **Return**: Returns analysis as a state update, which flows to the next node

The `investment_decision` node reads all prior analyses and produces a structured JSON verdict.

### Streaming Architecture

The server streams research progress to the client via **Server-Sent Events (SSE)**:

```
Client opens EventSource → Server runs LangGraph agent → 
  Each node completion emits SSE event → Client updates UI in real-time →
    Final decision emitted → Client shows report → Connection closed
```

Event types:
- `connected` — SSE connection established
- `phase_complete` — A research phase finished (with analysis data)
- `decision` — Final investment recommendation (structured JSON)
- `complete` — All research done
- `error` — Something went wrong

### Key Technologies Used

| Technology | Role | Why |
|-----------|------|-----|
| **LangGraph.js** | Agent orchestration | StateGraph for structured multi-step research pipeline with shared state |
| **LangChain.js** | AI framework | ChatPromptTemplate, RunnableSequence, StringOutputParser for composable chains |
| **Google Gemini** (`gemini-2.0-flash`) | LLM | Fast, free tier available, good analysis quality |
| **Tavily Search** | Web research | Native LangChain integration, structured search results |
| **React + Vite** | Frontend | Fast development, modern tooling |
| **Express** | Backend API | Lightweight, SSE support, middleware ecosystem |

---

## ⚖️ Key Decisions & Trade-offs

### What I Chose and Why

| Decision | Reasoning |
|----------|-----------|
| **LangGraph StateGraph** over basic chains | Shows structured agent architecture with shared state; each node enriches the research context |
| **Gemini 2.0 Flash** over GPT-4 | Free tier makes it easy to demo; fast response times; adequate analysis quality |
| **Tavily** over SerpAPI/Google Search | First-class LangChain integration; free tier (1000/month); returns clean, structured results |
| **SSE** over WebSockets | Simpler for uni-directional streaming; no library overhead; native browser `EventSource` API |
| **Separate React + Node** over Next.js | Assignment specified "React or Next.js (front end) · Node.js or Next.js (back end)"; separate services is clearer architecture |
| **Sequential graph** over parallel execution | Ensures each phase can build on prior context (e.g., financials analysis considers the overview) |
| **Fallback pipeline** in agent | If LangGraph has any API issues, the app still works via the direct pipeline — reliability first |
| **CSS-in-component** styles | Keeps component styles co-located; avoids class name conflicts; no build-time CSS tooling needed |

### What I Left Out

- **Authentication / User accounts** — Not needed for demo scope
- **Database / Persistence** — Research results are transient; in production, I'd store them in PostgreSQL
- **Rate limiting** — Would add for production to prevent API key abuse
- **Caching** — Would cache Tavily results for the same company within a time window
- **Real financial APIs** (Alpha Vantage, Yahoo Finance) — Would provide more structured financial data
- **PDF export** — Nice to have for sharing reports
- **Comparison mode** — Comparing two companies side-by-side

---

## 📋 Example Runs

### 1. Tesla (INVEST ✅)

**Overall Score: 74/100 | Confidence: 72%**

| Dimension | Score |
|-----------|-------|
| Business Model | 8/10 |
| Financial Health | 7/10 |
| Growth Potential | 9/10 |
| Competitive Position | 8/10 |
| Management Quality | 7/10 |
| Valuation | 5/10 |
| Risk Profile | 6/10 |
| Market Conditions | 7/10 |

**Summary**: Tesla maintains its leadership in the EV market with strong brand recognition, vertical integration from manufacturing to energy storage, and expanding presence in autonomous driving. Revenue growth remains robust, though valuation premium requires continued execution.

**Key Reasons**: Leading EV brand with global manufacturing scale; AI and autonomous driving optionality; Energy storage business growing rapidly

**Risks**: Premium valuation leaves little room for error; Increasing competition from Chinese EV makers; Regulatory and political uncertainty

---

### 2. Infosys (INVEST ✅)

**Overall Score: 68/100 | Confidence: 70%**

**Summary**: Infosys is a stable, profitable IT services giant with strong client relationships and growing digital/AI revenue streams. Conservative balance sheet and consistent dividend make it a reliable long-term hold, though growth rates are moderating.

**Key Reasons**: Strong recurring revenue from Fortune 500 clients; Healthy margins and cash generation; Well-positioned for enterprise AI adoption

**Risks**: Slower growth in traditional IT outsourcing; Visa and immigration policy uncertainties; Currency fluctuation exposure

---

### 3. WeWork (PASS ❌)

**Overall Score: 22/100 | Confidence: 85%**

**Summary**: WeWork's bankruptcy filing and massive debt burden make it an untenable investment. The company failed to achieve profitability despite years of operation, and the flexible workspace market has become increasingly competitive.

**Key Reasons**: Filed for bankruptcy; Unsustainable debt levels; Proven inability to reach profitability

**Risks**: Complete equity wipe-out possible; Ongoing lease obligations; No clear path to restructuring success

---

## 🔮 What I Would Improve With More Time

1. **Real financial data APIs** — Integrate Alpha Vantage or Yahoo Finance for precise stock prices, P/E ratios, and historical financials instead of relying on web search
2. **Parallel research phases** — Run overview, financials, news, competition, and market searches concurrently (then aggregate). Would cut research time by ~60%
3. **RAG with SEC filings** — Ingest 10-K and 10-Q filings for US-listed companies for deeper financial analysis
4. **Company comparison** — Side-by-side comparison of two or more companies
5. **Historical tracking** — Store past analyses in a database and show how the agent's recommendation has changed over time
6. **Interactive follow-up** — Let users ask follow-up questions about the research (e.g., "Tell me more about their debt situation")
7. **PDF/Report export** — Generate a downloadable PDF investment memo
8. **More sophisticated scoring** — Use weighted scoring based on the investor's risk profile (conservative vs aggressive)
9. **Deployment to Vercel** — Containerize the backend and deploy the frontend to Vercel for public access
10. **Unit & integration tests** — Add Jest tests for the agent pipeline and React Testing Library tests for components

---

## 🤖 LLM Chat Transcript

This project was built using AI assistance (Google Gemini / Claude) for:
- Scaffolding the project structure
- Writing LangChain.js agent code
- Designing the UI components
- Crafting research prompts for each phase
- Debugging SSE streaming issues

The full chat transcript of the development process is included in the `llm-chat-logs/` directory (if available).

**Key interactions:**
1. Discussed architecture choices (LangGraph vs basic chains)
2. Iterated on prompt engineering for investment-grade analysis
3. Debugged SSE streaming with React EventSource
4. Refined the UI design for the investment report

---

## 📁 Project Structure

```
.
├── package.json              # Root scripts (dev, install:all)
├── .env.example              # Environment variables template
├── .gitignore
├── README.md                 # This file
│
├── server/                   # Node.js/Express backend
│   ├── package.json
│   ├── index.js              # Express server with SSE endpoint
│   └── lib/
│       ├── agent.js          # LangGraph agent (core AI logic)
│       └── prompts.js        # Prompt templates for each research phase
│
└── client/                   # React frontend (Vite)
    ├── package.json
    ├── vite.config.js        # Vite config with API proxy
    ├── index.html
    └── src/
        ├── main.jsx          # React entry point
        ├── App.jsx           # Main app component
        ├── App.css           # App layout styles
        ├── index.css         # Global design system
        └── components/
            ├── Header.jsx          # App header with logo
            ├── CompanyInput.jsx    # Search input with examples
            ├── ResearchTimeline.jsx # Live research progress timeline
            ├── InvestmentReport.jsx # Full investment report with scores
            └── ScoreGauge.jsx      # SVG circular score gauge
```

---

## 📜 License

Built for the InsideIIM × Altuni AI Labs take-home assignment.

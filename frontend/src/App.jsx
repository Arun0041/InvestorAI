import { useState, useCallback, useRef } from "react";
import Header from "./components/Header";
import CompanyInput from "./components/CompanyInput";
import ResearchTimeline from "./components/ResearchTimeline";
import InvestmentReport from "./components/InvestmentReport";
import { BuildingIcon, BarChartIcon, NewspaperIcon, ShieldIcon, GlobeIcon, SparklesIcon } from "./components/Icons";
import "./App.css";

// Research phases definition — matches server-side agent nodes
const RESEARCH_PHASES = [
  {
    id: "overview",
    label: "Company Overview",
    icon: <BuildingIcon />,
    description: "Business model, products, and operations",
  },
  {
    id: "financials",
    label: "Financial Analysis",
    icon: <BarChartIcon />,
    description: "Revenue, profitability, and key metrics",
  },
  {
    id: "news",
    label: "News & Sentiment",
    icon: <NewspaperIcon />,
    description: "Recent developments and market sentiment",
  },
  {
    id: "competition",
    label: "Competitive Analysis",
    icon: <ShieldIcon />,
    description: "Market position and competitive advantages",
  },
  {
    id: "market",
    label: "Market & Industry",
    icon: <GlobeIcon />,
    description: "Industry trends and macroeconomic factors",
  },
];

function App() {
  const [company, setCompany] = useState("");
  const [isResearching, setIsResearching] = useState(false);
  const [phases, setPhases] = useState({});
  const [decision, setDecision] = useState(null);
  const [error, setError] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const eventSourceRef = useRef(null);

  const startResearch = useCallback((companyName) => {
    // Reset state for new research
    setCompany(companyName);
    setIsResearching(true);
    setPhases({});
    setDecision(null);
    setError(null);
    setCurrentPhase("overview");

    // Close any existing SSE connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    // Open SSE connection to research API
    const eventSource = new EventSource(
      `/api/research?company=${encodeURIComponent(companyName)}`
    );
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case "phase_complete": {
            // Add completed phase data
            setPhases((prev) => ({
              ...prev,
              [data.phase]: data.data,
            }));
            // Advance to next phase
            const currentIdx = RESEARCH_PHASES.findIndex(
              (p) => p.id === data.phase
            );
            if (currentIdx < RESEARCH_PHASES.length - 1) {
              setCurrentPhase(RESEARCH_PHASES[currentIdx + 1].id);
            } else {
              setCurrentPhase("decision");
            }
            break;
          }

          case "decision":
            setDecision(data.data);
            setCurrentPhase(null);
            break;

          case "complete":
            setIsResearching(false);
            setCurrentPhase(null);
            eventSource.close();
            break;

          case "error":
            setError(data.message);
            setIsResearching(false);
            setCurrentPhase(null);
            eventSource.close();
            break;

          case "connected":
            // Connection established, research starting
            break;

          default:
            break;
        }
      } catch (parseError) {
        console.error("Failed to parse SSE event:", parseError);
      }
    };

    eventSource.onerror = () => {
      setError(
        "Connection to the server was lost. Please check that the server is running on port 3001 and try again."
      );
      setIsResearching(false);
      setCurrentPhase(null);
      eventSource.close();
    };
  }, []);

  const stopResearch = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsResearching(false);
    setCurrentPhase(null);
  }, []);

  const hasResults = Object.keys(phases).length > 0 || isResearching;

  return (
    <div className="app">
      {/* Background effects */}
      <div className="app-bg">
        <div className="bg-gradient bg-gradient-1" />
        <div className="bg-gradient bg-gradient-2" />
        <div className="bg-grid" />
      </div>

      {/* Main content */}
      <div className="app-content">
        <Header />

        <main className="app-main">
          <CompanyInput
            onSubmit={startResearch}
            onStop={stopResearch}
            isResearching={isResearching}
          />

          {/* Error banner */}
          {error && (
            <div className="error-banner">
              <span className="error-icon">⚠️</span>
              <p className="error-text">{error}</p>
              <button
                onClick={() => setError(null)}
                className="error-close"
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}

          {/* Research timeline */}
          {hasResults && (
            <ResearchTimeline
              phases={RESEARCH_PHASES}
              completedPhases={phases}
              currentPhase={currentPhase}
              isResearching={isResearching}
            />
          )}

          {/* Investment report */}
          {decision && (
            <InvestmentReport
              decision={decision}
              company={company}
              phases={phases}
              phaseDefinitions={RESEARCH_PHASES}
            />
          )}

          {/* Empty state */}
          {!hasResults && !error && (
            <div className="empty-state">
              <div className="empty-icon"><SparklesIcon size="48" style={{ color: "var(--accent)" }} /></div>
              <h2 className="empty-title">Ready to Research</h2>
              <p className="empty-desc">
                Enter a company name above to start AI-powered investment
                research. The agent will analyze the company across five
                dimensions and deliver a data-driven invest/pass recommendation.
              </p>
              <div className="empty-features">
                {RESEARCH_PHASES.map((phase) => (
                  <div key={phase.id} className="empty-feature">
                    <span className="empty-feature-icon">{phase.icon}</span>
                    <span className="empty-feature-label">{phase.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            Built with React • Node.js • LangChain.js • LangGraph.js • Google
            Gemini • Tavily
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;

import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import ScoreGauge from "./ScoreGauge";
import { ClipboardIcon, TrendingUpIcon, SearchIcon, CheckCircleIcon, AlertTriangleIcon, ZapIcon } from "./Icons";

const SCORE_LABELS = {
  businessModel: "Business Model",
  financialHealth: "Financial Health",
  growthPotential: "Growth Potential",
  competitivePosition: "Competitive Position",
  managementQuality: "Management Quality",
  valuationAttractiveness: "Valuation",
  riskProfile: "Risk Profile",
  marketConditions: "Market Conditions",
};

function getScoreColor(score) {
  if (score >= 8) return "var(--score-excellent)";
  if (score >= 6.5) return "var(--score-good)";
  if (score >= 5) return "var(--score-average)";
  if (score >= 3.5) return "var(--score-poor)";
  return "var(--score-bad)";
}

export default function InvestmentReport({ decision, company, phases, phaseDefinitions }) {
  const [activeTab, setActiveTab] = useState("summary");
  const isInvest = decision?.verdict === "INVEST";

  if (!decision) return null;

  const tabs = [
    { id: "summary", label: "Summary", icon: <ClipboardIcon /> },
    { id: "scores", label: "Scores", icon: <TrendingUpIcon /> },
    { id: "details", label: "Research", icon: <SearchIcon /> },
  ];

  return (
    <div className="report-section">
      {/* ── Verdict Hero ── */}
      <div className={`verdict-hero ${isInvest ? "invest" : "pass"}`}>
        <div className="verdict-glow" />
        <div className="verdict-content">
          <div className="verdict-top">
            <span className={`verdict-badge ${isInvest ? "invest" : "pass"}`}>
              {isInvest ? "🟢" : "🔴"} {decision.verdict}
            </span>
            {decision.timeHorizon && (
              <span className="verdict-horizon">⏱ {decision.timeHorizon}</span>
            )}
          </div>

          <h2 className="verdict-company">{company}</h2>
          <p className="verdict-summary">{decision.summary}</p>

          {decision.targetAction && (
            <div className="verdict-action">
              <span className="action-label">Recommended Action:</span>
              <span className="action-text">{decision.targetAction}</span>
            </div>
          )}

          <div className="verdict-gauges">
            <ScoreGauge
              score={decision.overallScore}
              size={130}
              label="Overall Score"
            />
            <ScoreGauge
              score={decision.confidence}
              size={130}
              label="Confidence"
            />
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div className="report-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`report-tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <div className="report-content">
        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="tab-panel" key="summary">
            <div className="insights-grid">
              <InsightCard
                title="Key Reasons"
                icon={<CheckCircleIcon />}
                items={decision.keyReasons}
                variant="positive"
              />
              <InsightCard
                title="Risk Factors"
                icon={<AlertTriangleIcon />}
                items={decision.risks}
                variant="warning"
              />
              <InsightCard
                title="Upcoming Catalysts"
                icon={<ZapIcon />}
                items={decision.catalysts}
                variant="info"
              />
            </div>
          </div>
        )}

        {/* Scores Tab */}
        {activeTab === "scores" && (
          <div className="tab-panel" key="scores">
            <div className="scores-card">
              <h3 className="scores-title">Dimension Scores</h3>
              <div className="score-bars">
                {decision.scores &&
                  Object.entries(decision.scores).map(([key, value]) => (
                    <div key={key} className="score-bar-row">
                      <span className="score-bar-label">
                        {SCORE_LABELS[key] || key}
                      </span>
                      <div className="score-bar-track">
                        <div
                          className="score-bar-fill"
                          style={{
                            width: `${(value / 10) * 100}%`,
                            background: getScoreColor(value),
                            boxShadow: `0 0 8px ${getScoreColor(value)}40`,
                          }}
                        />
                      </div>
                      <span
                        className="score-bar-value"
                        style={{ color: getScoreColor(value) }}
                      >
                        {value}/10
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Research Details Tab */}
        {activeTab === "details" && (
          <div className="tab-panel" key="details">
            <div className="research-details">
              {phaseDefinitions.map((phase) => (
                <ResearchSection
                  key={phase.id}
                  phase={phase}
                  content={phases[phase.id]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        .report-section {
          animation: fadeInUp 0.6s var(--ease-out);
          margin-bottom: 3rem;
        }

        /* Verdict Hero */
        .verdict-hero {
          position: relative;
          padding: 2rem 2.5rem;
          border-radius: var(--radius-xl);
          overflow: hidden;
          margin-bottom: 1.5rem;
        }

        .verdict-hero.invest {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.06) 0%, rgba(34, 197, 94, 0.02) 100%);
          border: 1px solid var(--invest-border);
        }

        .verdict-hero.pass {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(239, 68, 68, 0.02) 100%);
          border: 1px solid var(--pass-border);
        }

        .verdict-glow {
          position: absolute;
          top: -100px;
          right: -100px;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          pointer-events: none;
        }

        .verdict-hero.invest .verdict-glow {
          background: radial-gradient(circle, rgba(34, 197, 94, 0.08) 0%, transparent 70%);
        }

        .verdict-hero.pass .verdict-glow {
          background: radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%);
        }

        .verdict-content {
          position: relative;
          z-index: 1;
        }

        .verdict-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .verdict-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          animation: scaleIn 0.5s var(--ease-spring);
        }

        .verdict-badge.invest {
          background: var(--invest-bg);
          color: var(--invest-light);
          border: 1px solid var(--invest-border);
          box-shadow: var(--shadow-glow-invest);
        }

        .verdict-badge.pass {
          background: var(--pass-bg);
          color: var(--pass-light);
          border: 1px solid var(--pass-border);
          box-shadow: var(--shadow-glow-pass);
        }

        .verdict-horizon {
          padding: 0.3rem 0.7rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .verdict-company {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .verdict-summary {
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.7;
          max-width: 700px;
          margin-bottom: 1rem;
        }

        .verdict-action {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          margin-bottom: 1.5rem;
          max-width: fit-content;
        }

        .action-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .action-text {
          font-size: 0.85rem;
          color: var(--text-accent);
          font-weight: 500;
        }

        .verdict-gauges {
          display: flex;
          gap: 2rem;
          justify-content: flex-start;
          flex-wrap: wrap;
        }

        /* Tabs */
        .report-tabs {
          display: flex;
          gap: 0.25rem;
          padding: 0.3rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          margin-bottom: 1rem;
          width: fit-content;
        }

        .report-tab {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1rem;
          background: none;
          border: none;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .report-tab:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.03);
        }

        .report-tab.active {
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-primary);
          font-weight: 600;
          box-shadow: var(--shadow-sm);
        }

        .tab-icon {
          font-size: 0.9rem;
        }

        /* Tab Panels */
        .tab-panel {
          animation: fadeIn 0.3s var(--ease-out);
        }

        /* Insights Grid */
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        /* Scores Card */
        .scores-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
        }

        .scores-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }

        .score-bars {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .score-bar-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .score-bar-label {
          width: 140px;
          flex-shrink: 0;
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .score-bar-track {
          flex: 1;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .score-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s var(--ease-out);
          min-width: 4px;
        }

        .score-bar-value {
          width: 40px;
          text-align: right;
          font-size: 0.78rem;
          font-weight: 700;
          font-family: var(--font-mono);
        }

        /* Research Details */
        .research-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        @media (max-width: 640px) {
          .verdict-hero {
            padding: 1.5rem;
          }
          .verdict-company {
            font-size: 1.3rem;
          }
          .verdict-gauges {
            gap: 1rem;
          }
          .score-bar-label {
            width: 100px;
            font-size: 0.72rem;
          }
          .report-tabs {
            width: 100%;
          }
          .report-tab {
            flex: 1;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
}

// ─── Insight Card Sub-component ────────────────────────────

function InsightCard({ title, icon, items, variant }) {
  if (!items || items.length === 0) return null;

  const variantStyles = {
    positive: {
      borderColor: "var(--invest-border)",
      iconBg: "var(--invest-bg)",
    },
    warning: {
      borderColor: "var(--pass-border)",
      iconBg: "var(--pass-bg)",
    },
    info: {
      borderColor: "rgba(34, 211, 238, 0.2)",
      iconBg: "rgba(34, 211, 238, 0.08)",
    },
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div
      className="insight-card"
      style={{ borderColor: style.borderColor }}
    >
      <div className="insight-header">
        <span
          className="insight-icon"
          style={{ background: style.iconBg }}
        >
          {icon}
        </span>
        <h4 className="insight-title">{title}</h4>
      </div>
      <ul className="insight-list">
        {items.map((item, idx) => (
          <li key={idx} className="insight-item">{item}</li>
        ))}
      </ul>

      <style>{`
        .insight-card {
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 1.25rem;
          transition: border-color var(--transition-fast);
        }

        .insight-card:hover {
          background: var(--bg-card-hover);
        }

        .insight-header {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          margin-bottom: 0.85rem;
        }

        .insight-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: var(--radius-sm);
          font-size: 0.95rem;
        }

        .insight-title {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .insight-list {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .insight-item {
          position: relative;
          padding-left: 1.1rem;
          font-size: 0.82rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        .insight-item::before {
          content: "";
          position: absolute;
          left: 0;
          top: 0.55em;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

// ─── Research Section Sub-component ────────────────────────

function ResearchSection({ phase, content }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!content) return null;

  return (
    <div className="research-section-item">
      <button
        className={`research-section-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="research-section-icon">{phase.icon}</span>
        <span className="research-section-label">{phase.label}</span>
        <svg
          className={`research-section-chevron ${isOpen ? "rotated" : ""}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="research-section-content">
          <div className="markdown-content">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </div>
      )}

      <style>{`
        .research-section-item {
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .research-section-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.85rem 1rem;
          background: var(--bg-card);
          border: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .research-section-toggle:hover {
          background: var(--bg-card-hover);
        }

        .research-section-toggle.open {
          border-bottom: 1px solid var(--border-subtle);
        }

        .research-section-icon {
          font-size: 1.1rem;
        }

        .research-section-label {
          flex: 1;
          text-align: left;
        }

        .research-section-chevron {
          color: var(--text-muted);
          transition: transform var(--transition-fast);
        }

        .research-section-chevron.rotated {
          transform: rotate(180deg);
        }

        .research-section-content {
          padding: 1.25rem;
          background: var(--bg-secondary);
          animation: fadeIn 0.2s var(--ease-out);
          max-height: 500px;
          overflow-y: auto;
        }
      `}</style>
    </div>
  );
}

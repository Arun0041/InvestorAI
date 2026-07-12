import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { SparklesIcon, ClipboardIcon } from "./Icons";

export default function ResearchTimeline({
  phases,
  completedPhases,
  currentPhase,
  isResearching,
}) {
  const [expandedPhase, setExpandedPhase] = useState(null);

  const getPhaseStatus = (phaseId) => {
    if (completedPhases[phaseId]) return "complete";
    if (phaseId === currentPhase) return "active";
    return "pending";
  };

  return (
    <div className="timeline-section">
      <div className="timeline-header">
        <h2 className="timeline-title">
          {isResearching ? (
            <>
              <span className="timeline-title-icon"><SparklesIcon style={{ color: "var(--accent)" }} /></span>
              Research in Progress
            </>
          ) : (
            <>
              <span className="timeline-title-icon"><ClipboardIcon style={{ color: "var(--invest)" }} /></span>
              Research Complete
            </>
          )}
        </h2>
        {isResearching && (
          <div className="timeline-progress">
            <div
              className="timeline-progress-bar"
              style={{
                width: `${(Object.keys(completedPhases).length / phases.length) * 100}%`,
              }}
            />
          </div>
        )}
      </div>

      <div className="timeline">
        {phases.map((phase, index) => {
          const status = getPhaseStatus(phase.id);
          const isExpanded = expandedPhase === phase.id;
          const hasData = !!completedPhases[phase.id];

          return (
            <div
              key={phase.id}
              className={`timeline-item timeline-item-${status}`}
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Connector line */}
              <div className="timeline-connector">
                <div className={`timeline-dot timeline-dot-${status}`}>
                  {status === "complete" && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {status === "active" && <div className="dot-pulse-ring" />}
                </div>
                {index < phases.length - 1 && (
                  <div className={`timeline-line timeline-line-${status}`} />
                )}
              </div>

              {/* Content */}
              <div className="timeline-content">
                <div
                  className="timeline-item-header"
                  onClick={() => hasData && setExpandedPhase(isExpanded ? null : phase.id)}
                  style={{ cursor: hasData ? "pointer" : "default" }}
                >
                  <span className="timeline-icon">{phase.icon}</span>
                  <div className="timeline-item-text">
                    <h3 className="timeline-item-label">{phase.label}</h3>
                    <p className="timeline-item-desc">{phase.description}</p>
                  </div>

                  <div className="timeline-item-status">
                    {status === "active" && (
                      <span className="status-badge status-active">
                        <svg className="status-spinner" width="12" height="12" viewBox="0 0 12 12">
                          <circle cx="6" cy="6" r="4.5" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="20 10" strokeLinecap="round" />
                        </svg>
                        Analyzing
                      </span>
                    )}
                    {status === "complete" && (
                      <span className="status-badge status-complete">✓ Done</span>
                    )}
                    {status === "pending" && (
                      <span className="status-badge status-pending">Pending</span>
                    )}
                  </div>

                  {hasData && (
                    <button className={`expand-btn ${isExpanded ? "expanded" : ""}`}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Expanded content */}
                {isExpanded && hasData && (
                  <div className="timeline-detail">
                    <div className="markdown-content">
                      <ReactMarkdown>{completedPhases[phase.id]}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .timeline-section {
          margin-bottom: 2rem;
          animation: fadeInUp 0.5s var(--ease-out);
        }

        .timeline-header {
          margin-bottom: 1.25rem;
        }

        .timeline-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }

        .timeline-title-icon {
          font-size: 1.2rem;
        }

        .timeline-progress {
          height: 3px;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 2px;
          margin-top: 0.75rem;
          overflow: hidden;
        }

        .timeline-progress-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent-teal) 100%);
          border-radius: 2px;
          transition: width 0.8s var(--ease-out);
          box-shadow: 0 0 12px var(--accent-glow);
        }

        .timeline {
          display: flex;
          flex-direction: column;
        }

        .timeline-item {
          display: flex;
          gap: 1rem;
          animation: slideInLeft 0.4s var(--ease-out) both;
        }

        /* Connector */
        .timeline-connector {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 28px;
          padding-top: 2px;
        }

        .timeline-dot {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          position: relative;
          transition: all var(--transition-default);
        }

        .timeline-dot-pending {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid var(--border-subtle);
        }

        .timeline-dot-active {
          background: var(--accent-glow);
          border: 2px solid var(--accent);
          box-shadow: 0 0 16px var(--accent-glow);
        }

        .timeline-dot-complete {
          background: var(--invest);
          border: 2px solid var(--invest);
          box-shadow: 0 0 12px var(--invest-glow);
        }

        .dot-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          border: 2px solid var(--accent);
          animation: pulseRing 1.5s ease-out infinite;
        }

        .timeline-line {
          width: 2px;
          flex: 1;
          min-height: 16px;
          margin: 4px 0;
          transition: background var(--transition-default);
        }

        .timeline-line-pending {
          background: var(--border-subtle);
        }

        .timeline-line-active {
          background: linear-gradient(180deg, var(--accent) 0%, var(--border-subtle) 100%);
        }

        .timeline-line-complete {
          background: var(--invest);
          opacity: 0.4;
        }

        /* Content */
        .timeline-content {
          flex: 1;
          padding-bottom: 1.25rem;
          min-width: 0;
        }

        .timeline-item-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.85rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .timeline-item-complete .timeline-item-header {
          border-color: var(--invest-border);
          background: var(--invest-bg);
        }

        .timeline-item-active .timeline-item-header {
          border-color: var(--border-accent);
          background: var(--accent-glow);
          animation: borderGlow 2s ease-in-out infinite;
        }

        .timeline-item-header:hover {
          background: var(--bg-card-hover);
        }

        .timeline-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .timeline-item-text {
          flex: 1;
          min-width: 0;
        }

        .timeline-item-label {
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .timeline-item-desc {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .timeline-item-status {
          flex-shrink: 0;
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.02em;
        }

        .status-active {
          background: var(--accent-glow);
          color: var(--accent-light);
          border: 1px solid rgba(124, 92, 252, 0.2);
        }

        .status-complete {
          background: var(--invest-bg);
          color: var(--invest-light);
          border: 1px solid var(--invest-border);
        }

        .status-pending {
          background: rgba(255, 255, 255, 0.03);
          color: var(--text-muted);
          border: 1px solid var(--border-subtle);
        }

        .status-spinner {
          animation: spin 1s linear infinite;
        }

        .expand-btn {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background: none;
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-sm);
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .expand-btn:hover {
          color: var(--text-primary);
          border-color: var(--border-default);
          background: rgba(255, 255, 255, 0.03);
        }

        .expand-btn.expanded {
          transform: rotate(180deg);
        }

        .timeline-detail {
          margin-top: 0.5rem;
          padding: 1rem 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-md);
          animation: fadeInUp 0.3s var(--ease-out);
          max-height: 400px;
          overflow-y: auto;
        }

        @media (max-width: 640px) {
          .timeline-item-header {
            flex-wrap: wrap;
          }
          .timeline-item-status {
            order: 3;
            width: 100%;
            margin-top: 0.3rem;
          }
          .expand-btn {
            order: 2;
          }
        }
      `}</style>
    </div>
  );
}

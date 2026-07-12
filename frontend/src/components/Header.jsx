import React from "react";

export default function Header() {
  return (
    <header className="header">
      <div className="header-logo">
        <div className="header-logo-icon">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
            <path
              d="M8 22L12 14L16 18L20 10L24 16"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="16" r="2" fill="white" />
            <defs>
              <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32">
                <stop stopColor="#7c5cfc" />
                <stop offset="1" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="header-text">
          <h1 className="header-title">
            Investor<span className="header-title-accent">AI</span>
          </h1>
          <p className="header-subtitle">AI-Powered Investment Research Agent</p>
        </div>
      </div>

      <div className="header-badges">
        <span className="header-badge">
          <span className="header-badge-dot" />
          LangChain.js
        </span>
        <span className="header-badge">
          <span className="header-badge-dot green" />
          Gemini AI
        </span>
      </div>

      <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.5rem 0;
          margin-bottom: 1rem;
          animation: fadeInDown 0.6s var(--ease-out);
        }

        .header-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .header-logo-icon {
          animation: float 4s ease-in-out infinite;
        }

        .header-text {
          display: flex;
          flex-direction: column;
        }

        .header-title {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
          color: var(--text-primary);
        }

        .header-title-accent {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-teal) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-subtitle {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: 0.02em;
          margin-top: 2px;
        }

        .header-badges {
          display: flex;
          gap: 0.6rem;
        }

        .header-badge {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          font-size: 0.72rem;
          color: var(--text-secondary);
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .header-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
        }

        .header-badge-dot.green {
          background: var(--invest);
          box-shadow: 0 0 8px var(--invest-glow);
        }

        @media (max-width: 640px) {
          .header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .header-badges {
            align-self: flex-start;
          }
        }
      `}</style>
    </header>
  );
}

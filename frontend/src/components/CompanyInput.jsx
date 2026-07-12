import React, { useState } from "react";

export default function CompanyInput({ onSubmit, onStop, isResearching }) {
  const [value, setValue] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim() && !isResearching) {
      onSubmit(value.trim());
    }
  };

  const exampleCompanies = ["Tesla", "Apple", "Infosys", "Reliance Industries", "NVIDIA"];

  return (
    <div className="company-input-wrapper">
      <form className="company-input-form" onSubmit={handleSubmit}>
        <div className={`input-container ${isResearching ? "researching" : ""}`}>
          <div className="input-icon">
            {isResearching ? (
              <svg className="spinner" width="20" height="20" viewBox="0 0 20 20">
                <circle
                  cx="10" cy="10" r="8"
                  fill="none"
                  stroke="var(--accent)"
                  strokeWidth="2"
                  strokeDasharray="40 60"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="9" cy="9" r="6" stroke="var(--text-muted)" strokeWidth="1.5" />
                <path d="M13.5 13.5L17 17" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            )}
          </div>

          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Enter a company name to research..."
            disabled={isResearching}
            className="company-input"
            autoFocus
          />

          {isResearching ? (
            <button type="button" onClick={onStop} className="input-btn stop-btn">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="2" width="10" height="10" rx="2" fill="currentColor" />
              </svg>
              Stop
            </button>
          ) : (
            <button
              type="submit"
              disabled={!value.trim()}
              className="input-btn submit-btn"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 3L14 8L8 13M14 8H2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Research
            </button>
          )}
        </div>
      </form>

      {!isResearching && (
        <div className="example-companies">
          <span className="example-label">Try:</span>
          {exampleCompanies.map((company) => (
            <button
              key={company}
              className="example-chip"
              onClick={() => {
                setValue(company);
                onSubmit(company);
              }}
            >
              {company}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .company-input-wrapper {
          margin-bottom: 2rem;
          animation: fadeInUp 0.6s var(--ease-out) 0.1s both;
        }

        .company-input-form {
          width: 100%;
        }

        .input-container {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.65rem 0.75rem 0.65rem 1rem;
          background: var(--bg-input);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-xl);
          transition: all var(--transition-default);
          position: relative;
        }

        .input-container:focus-within {
          border-color: var(--border-accent);
          background: var(--bg-input-focus);
          box-shadow: var(--shadow-glow-accent), 0 0 0 1px var(--border-accent);
        }

        .input-container.researching {
          border-color: var(--border-accent);
          animation: borderGlow 2s ease-in-out infinite;
        }

        .input-icon {
          flex-shrink: 0;
          display: flex;
          align-items: center;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        .company-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          color: var(--text-primary);
          font-family: var(--font-sans);
          font-size: 0.95rem;
          font-weight: 400;
          letter-spacing: -0.01em;
        }

        .company-input::placeholder {
          color: var(--text-muted);
        }

        .company-input:disabled {
          opacity: 0.6;
        }

        .input-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.55rem 1.1rem;
          border: none;
          border-radius: var(--radius-lg);
          font-family: var(--font-sans);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
          white-space: nowrap;
        }

        .submit-btn {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
          color: white;
          box-shadow: 0 2px 12px rgba(124, 92, 252, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(124, 92, 252, 0.4);
        }

        .submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .stop-btn {
          background: rgba(239, 68, 68, 0.15);
          color: var(--pass-light);
          border: 1px solid var(--pass-border);
        }

        .stop-btn:hover {
          background: rgba(239, 68, 68, 0.25);
        }

        .example-companies {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.85rem;
          padding-left: 0.25rem;
          animation: fadeIn 0.6s var(--ease-out) 0.3s both;
          flex-wrap: wrap;
        }

        .example-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .example-chip {
          padding: 0.3rem 0.7rem;
          background: var(--bg-card);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-family: var(--font-sans);
          font-size: 0.75rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .example-chip:hover {
          border-color: var(--border-accent);
          color: var(--text-accent);
          background: var(--accent-glow);
          transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .input-container {
            padding: 0.5rem;
          }
          .company-input {
            font-size: 0.88rem;
          }
        }
      `}</style>
    </div>
  );
}

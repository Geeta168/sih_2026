import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function RiskCard({ 
  riskScore = 24, 
  customStatus, 
  customText,
  isLoading = false,
  isSimulation = false
}) {
  // Clamp score between 0 and 100
  const score = Math.max(0, Math.min(100, Math.round(riskScore)));

  // Risk Classification
  let statusText = 'LOW RISK';
  let badgeClass = 'badge-safe';
  let strokeColor = '#10b981';
  let glowColor = 'rgba(16, 185, 129, 0.4)';
  let Icon = ShieldCheck;
  let explanation = 'Recommended route currently avoids major hazards.';

  if (score > 60) {
    statusText = 'HIGH RISK';
    badgeClass = 'badge-danger';
    strokeColor = '#ef4444';
    glowColor = 'rgba(239, 68, 68, 0.4)';
    Icon = ShieldAlert;
    explanation = 'Extreme proximity to drifting tabular icebergs detected.';
  } else if (score > 30) {
    statusText = 'MEDIUM RISK';
    badgeClass = 'badge-warning';
    strokeColor = '#f59e0b';
    glowColor = 'rgba(245, 158, 11, 0.4)';
    Icon = AlertTriangle;
    explanation = 'Moderate sea-ice drift and marginal clearance along path.';
  }

  if (customStatus) statusText = customStatus;
  if (customText) explanation = customText;

  // SVG Circular Gauge calculation
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  // We use a 270-degree arc for a clean gauge look
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-panel risk-card">
      <div className="panel-header">
        <div className="panel-title">
          <Icon className="title-icon" size={17} />
          <span>ROUTE RISK</span>
        </div>
        <span className={`panel-badge ${isLoading ? 'badge-cyan' : badgeClass}`}>
          {isLoading ? 'ANALYZING...' : isSimulation ? 'SIMULATION' : statusText}
        </span>
      </div>

      <div className="risk-card-content">
        {/* Large Circular Gauge */}
        <div className="gauge-wrapper">
          <svg className="gauge-svg" width="160" height="160" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="gauge-bg-circle"
              stroke="rgba(56, 189, 248, 0.12)"
              strokeWidth="10"
              fill="transparent"
            />
            {/* Ambient track glow */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              className="gauge-progress"
              stroke={strokeColor}
              strokeWidth="10"
              strokeLinecap="round"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: `drop-shadow(0 0 8px ${glowColor})`,
                transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.4s ease'
              }}
            />
          </svg>

          {/* Center Value Display */}
          <div className="gauge-center-content">
            <div className="gauge-value-row">
              <span className="gauge-value" style={{ color: strokeColor }}>{score}</span>
              <span className="gauge-max">/ 100</span>
            </div>
            <span className="gauge-status-label" style={{ color: strokeColor }}>
              {statusText}
            </span>
          </div>
        </div>

        {/* Informative Explanation */}
        <div className="risk-description-box">
          <p className="risk-description-text">
            {isLoading ? 'Analyzing environmental conditions...' : `"${explanation}"`}
          </p>
          <div className="risk-metrics-footer">
            <span className="risk-telemetry-tag">
              ALGORITHM: DIJKSTRA + OCEAN MASK
            </span>
            <span className="risk-telemetry-tag">
              CONFIDENCE: 94.2%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

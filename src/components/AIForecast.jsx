import React from 'react';
import { Cpu, Sparkles } from 'lucide-react';

export default function AIForecast({ 
  icebergHazard = 'LOW', 
  weatherRisk = 'MEDIUM', 
  confidence = 87,
  isSimulation = false,
  windSpeed = 18
}) {
  // Badges
  const getHazardBadge = (lvl) => {
    switch (lvl?.toUpperCase()) {
      case 'HIGH': return 'badge-danger';
      case 'MEDIUM': return 'badge-warning';
      default: return 'badge-safe';
    }
  };

  // Generate 20 segmented telemetry ticks for the confidence visualizer
  const totalTicks = 20;
  const activeTicks = Math.round((confidence / 100) * totalTicks);

  return (
    <div className="glass-panel ai-forecast-card">
      <div className="panel-header">
        <div className="panel-title">
          <Cpu className="title-icon" size={17} />
          <span>AI ENVIRONMENT FORECAST</span>
        </div>
        <div className="panel-badge badge-cyan">
          <Sparkles size={11} style={{ marginRight: 4, display: 'inline' }} />
          {isSimulation ? 'SIMULATION' : 'PROTOTYPE MODEL'}
        </div>
      </div>

      <div className="ai-forecast-content">
        {/* Risk Level Badges Row */}
        <div className="ai-risk-row">
          <div className="ai-risk-item">
            <span className="ai-risk-label">ICEBERG HAZARD</span>
            <div className="ai-risk-val-box">
              <span className={`panel-badge ${getHazardBadge(icebergHazard)}`}>
                {icebergHazard}
              </span>
              <span className="ai-risk-sub">Trajectory Clear</span>
            </div>
          </div>

          <div className="ai-risk-separator" />

          <div className="ai-risk-item">
            <span className="ai-risk-label">WEATHER RISK</span>
            <div className="ai-risk-val-box">
              <span className={`panel-badge ${getHazardBadge(weatherRisk)}`}>
                {weatherRisk}
              </span>
              <span className="ai-risk-sub">Wind profile {windSpeed}kts</span>
            </div>
          </div>
        </div>

        {/* AI Confidence Futuristic Visualizer */}
        <div className="ai-confidence-section">
          <div className="confidence-header-row">
            <span className="confidence-title">NAVIGATION CONFIDENCE</span>
            <span className="confidence-percentage">{confidence}%</span>
          </div>

          {/* Futuristic Segmented Bar Indicator */}
          <div className="confidence-bar-container">
            <div className="segmented-visualizer" role="progressbar" aria-valuenow={confidence} aria-valuemin="0" aria-valuemax="100">
              {Array.from({ length: totalTicks }).map((_, index) => {
                const isActive = index < activeTicks;
                const isHighEnd = index > totalTicks * 0.8;
                return (
                  <div
                    key={index}
                    className={`confidence-tick ${isActive ? 'tick-active' : 'tick-inactive'} ${isHighEnd && isActive ? 'tick-peak' : ''}`}
                    style={{
                      animationDelay: `${index * 35}ms`
                    }}
                  />
                );
              })}
            </div>
          </div>

          {/* Telemetry sub-metrics */}
          <div className="confidence-metadata-row">
            <span>MODEL: ENSEMBLE DRIFT + HYDROMET</span>
            <span>UNCERTAINTY: ±3.2%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

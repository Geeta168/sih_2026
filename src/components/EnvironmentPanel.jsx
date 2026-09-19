import React from 'react';
import { ShieldAlert, Wind, ThermometerSnowflake, Radio, Waves } from 'lucide-react';

export default function EnvironmentPanel({ 
  icebergCount = 42, 
  windSpeed = 18, 
  temperature = -18, 
  dataStatus = 'LIVE',
  isLive = false,
  isSimulation = false,
  isLoading = false
}) {
  return (
    <div className="glass-panel environment-panel">
      <div className="panel-header">
        <div className="panel-title">
          <Waves className="title-icon" size={17} />
          <span>ENVIRONMENT MONITOR</span>
        </div>
        <div className="panel-badge badge-cyan">
          {isLoading ? 'LOADING DATA...' : isSimulation ? 'SIMULATION' : isLive ? 'BACKEND OBSERVATIONS' : 'DEMO DATA'}
        </div>
      </div>

      <div className="environment-grid">
        {/* Card 1: ICEBERGS */}
        <div className="env-card">
          <div className="env-icon-wrapper env-icon-ice">
            <ShieldAlert size={18} />
          </div>
          <div className="env-details">
            <span className="env-label">ICEBERGS</span>
            <div className="env-val-row">
              <span className="env-val">{icebergCount}</span>
              <span className="env-unit">detected</span>
            </div>
          </div>
          <div className="env-subtag">{isLive ? 'API OBSERVATIONS' : 'FALLBACK DATASET'}</div>
        </div>

        {/* Card 2: WIND */}
        <div className="env-card">
          <div className="env-icon-wrapper env-icon-wind">
            <Wind size={18} />
          </div>
          <div className="env-details">
            <span className="env-label">WIND</span>
            <div className="env-val-row">
              <span className="env-val">{windSpeed}</span>
              <span className="env-unit">knots</span>
            </div>
          </div>
          <div className="env-subtag">{isSimulation ? 'SIMULATED +24H' : 'OBSERVED WEATHER'}</div>
        </div>

        {/* Card 3: TEMPERATURE */}
        <div className="env-card">
          <div className="env-icon-wrapper env-icon-temp">
            <ThermometerSnowflake size={18} />
          </div>
          <div className="env-details">
            <span className="env-label">TEMPERATURE</span>
            <div className="env-val-row">
              <span className="env-val">{temperature}°</span>
              <span className="env-unit">C</span>
            </div>
          </div>
          <div className="env-subtag">{isSimulation ? 'SIMULATED +24H' : 'HISTORICAL WEATHER'}</div>
        </div>

        {/* Card 4: DATA STATUS */}
        <div className="env-card">
          <div className="env-icon-wrapper env-icon-status">
            <Radio size={18} className="pulse-radio-icon" />
          </div>
          <div className="env-details">
            <span className="env-label">DATA STATUS</span>
            <div className="env-val-row">
              <span className="env-val status-live-text">{dataStatus}</span>
              <span className="env-pulse-dot" />
            </div>
          </div>
          <div className="env-subtag">{isSimulation ? 'SIMULATION' : isLive ? 'API ONLINE' : 'DEMO DATA'}</div>
        </div>
      </div>
    </div>
  );
}

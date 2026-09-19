import React from 'react';
import { RefreshCw, FastForward, CheckCircle, Zap } from 'lucide-react';

export default function RouteControls({
  onRecalculate,
  onSimulate,
  isRecalculating = false,
  isSimulating = false,
  simulationHour = 0,
  lastRecalculatedLatency = null,
  isSimulationData = false
}) {
  return (
    <div className="glass-panel route-controls-card">
      <div className="panel-header">
        <div className="panel-title">
          <Zap className="title-icon" size={17} />
          <span>ROUTE OPTIMIZATION & SIMULATION</span>
        </div>
        {simulationHour > 0 && (
          <span className="panel-badge badge-warning">
            +{simulationHour}H TRAJECTORY
          </span>
        )}
      </div>

      <div className="route-controls-content">
        <div className="button-group-row">
          {/* Recalculate Button */}
          <button
            type="button"
            className="control-btn primary-recalculate-btn"
            onClick={onRecalculate}
            disabled={isRecalculating || isSimulating}
          >
            <RefreshCw 
              size={16} 
              className={`btn-icon ${isRecalculating ? 'spin-animation' : ''}`} 
            />
            <span>{isRecalculating ? 'ANALYZING ENVIRONMENT...' : 'RECALCULATE SAFE ROUTE'}</span>
          </button>

          {/* Simulate 24H Button */}
          <button
            type="button"
            className="control-btn secondary-simulate-btn"
            onClick={onSimulate}
            disabled={isRecalculating || isSimulating}
          >
            <FastForward 
              size={16} 
              className={`btn-icon ${isSimulating ? 'pulse-animation' : ''}`} 
            />
              <span>{isSimulating ? 'SIMULATING 24 HOURS...' : 'SIMULATE 24H'}</span>
          </button>
        </div>

        {/* Dynamic Status / Execution Feedback */}
        <div className="controls-feedback-row">
          {isRecalculating ? (
            <div className="feedback-loading">
              <span className="spinner-dot" />
              <span>Dijkstra routing: Evaluating ocean grid against iceberg danger field...</span>
            </div>
          ) : isSimulating ? (
            <div className="feedback-loading">
              <span className="spinner-dot dot-amber" />
              <span>Simulating Weddell Sea Gyre current vector & Coriolis iceberg drift...</span>
            </div>
          ) : (
            <div className="feedback-ready">
              <CheckCircle size={13} className="text-safe" />
              <span>
                {isSimulationData
                  ? 'Simulation complete. Values are clearly marked as simulated.'
                  : lastRecalculatedLatency 
                  ? `Route verified optimal (${lastRecalculatedLatency}ms latency). Ready for waypoint update.`
                  : 'Engine active. Standby for manual or automated waypoint recalculation.'}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

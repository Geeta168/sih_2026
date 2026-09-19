import React from 'react';
import { Route, Fuel, Clock, Activity, CheckCircle2 } from 'lucide-react';

export default function RouteAnalysis({ 
  routeData, 
  selectedRoute = 'recommended', 
  onSelectRoute,
  isLoading = false
}) {
  const rec = {
    distance: routeData?.recommended_distance ?? 1240,
    fuel: routeData?.recommended_fuel ?? 99,
    time: routeData?.estimated_time_hours ?? 18.5,
    risk: routeData?.recommended_risk ?? 24
  };

  const sho = {
    distance: routeData?.shortest_distance ?? 1180,
    fuel: routeData?.shortest_fuel ?? 94,
    time: routeData?.shortest_time_hours ?? 17.2,
    risk: routeData?.shortest_risk ?? 61
  };

  const distanceDiff = rec.distance - sho.distance;
  const fuelDiff = rec.fuel - sho.fuel;
  const riskReductionPct = Math.round(((sho.risk - rec.risk) / sho.risk) * 100);

  return (
    <div className="glass-panel route-analysis-card">
      <div className="panel-header">
        <div className="panel-title">
          <Route className="title-icon" size={17} />
          <span>ROUTE ANALYSIS & COMPARISON</span>
        </div>
        <span className="panel-badge badge-cyan">
          {isLoading ? 'LOADING ROUTE...' : 'DUAL EVALUATION'}
        </span>
      </div>

      <div className="route-analysis-content">
        {/* Route Selector Tabs */}
        <div className="route-tabs">
          <button
            type="button"
            className={`route-tab-btn ${selectedRoute === 'recommended' ? 'active-recommended' : ''}`}
            onClick={() => onSelectRoute?.('recommended')}
          >
            <span className="tab-indicator rec-indicator" />
            <div className="tab-text-box">
              <span className="tab-name">RECOMMENDED ROUTE</span>
              <span className="tab-sub">AI Hazard Avoidance</span>
            </div>
            <span className="tab-pill badge-safe">SAFE</span>
          </button>

          <button
            type="button"
            className={`route-tab-btn ${selectedRoute === 'shortest' ? 'active-shortest' : ''}`}
            onClick={() => onSelectRoute?.('shortest')}
          >
            <span className="tab-indicator sho-indicator" />
            <div className="tab-text-box">
              <span className="tab-name">SHORTEST ROUTE</span>
              <span className="tab-sub">Direct Geodesic</span>
            </div>
            <span className="tab-pill badge-danger">HAZARDOUS</span>
          </button>
        </div>

        {/* Primary Recommended Route Telemetry Grid */}
        <div className="metrics-grid">
          <div className="metric-tile">
            <div className="metric-icon-box">
              <Route size={15} className="metric-icon" />
            </div>
            <div className="metric-data">
              <span className="metric-label">DISTANCE</span>
              <span className="metric-val">{rec.distance.toLocaleString()} <span className="unit">km</span></span>
            </div>
          </div>

          <div className="metric-tile">
            <div className="metric-icon-box">
              <Fuel size={15} className="metric-icon" />
            </div>
            <div className="metric-data">
              <span className="metric-label">EST. FUEL</span>
              <span className="metric-val">{rec.fuel} <span className="unit">L</span></span>
            </div>
          </div>

          <div className="metric-tile">
            <div className="metric-icon-box">
              <Clock size={15} className="metric-icon" />
            </div>
            <div className="metric-data">
              <span className="metric-label">EST. TIME</span>
              <span className="metric-val">{rec.time} <span className="unit">h</span></span>
            </div>
          </div>

          <div className="metric-tile highlight-risk-tile">
            <div className="metric-icon-box">
              <Activity size={15} className="metric-icon text-safe" />
            </div>
            <div className="metric-data">
              <span className="metric-label">RISK SCORE</span>
              <span className="metric-val text-safe">{rec.risk} <span className="unit">/ 100</span></span>
            </div>
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="comparison-table-wrapper">
          <div className="comparison-header-row">
            <span className="col-param">METRIC</span>
            <span className="col-sho">SHORTEST</span>
            <span className="col-rec">RECOMMENDED</span>
          </div>

          <div className="comparison-row">
            <span className="col-param">Distance</span>
            <span className="col-sho">{sho.distance} km</span>
            <span className="col-rec text-safe">{rec.distance} km</span>
          </div>

          <div className="comparison-row">
            <span className="col-param">Est. Fuel</span>
            <span className="col-sho">{sho.fuel} L</span>
            <span className="col-rec text-safe">{rec.fuel} L</span>
          </div>

          <div className="comparison-row">
            <span className="col-param">Risk Score</span>
            <span className="col-sho text-danger">{sho.risk} / 100</span>
            <span className="col-rec text-safe">{rec.risk} / 100</span>
          </div>
        </div>

        {/* AI Rationale Tradeoff Box */}
        <div className="tradeoff-callout">
          <div className="tradeoff-icon-col">
            <CheckCircle2 size={16} className="tradeoff-check-icon" />
          </div>
          <div className="tradeoff-text-col">
            <span className="tradeoff-title">DECISION SUPPORT RATIONALE</span>
            <p className="tradeoff-desc">
              The recommended route trades only <strong>+{distanceDiff} km</strong> (+{fuelDiff} L fuel) 
              to reduce navigation hazard risk by <strong>{riskReductionPct}%</strong>, successfully clearing the massive 82 NM A68A iceberg envelope.
            </p>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="demo-disclaimer-note">
          * Demo values generated for simulation until connected to live vessel telemetry.
        </div>
      </div>
    </div>
  );
}

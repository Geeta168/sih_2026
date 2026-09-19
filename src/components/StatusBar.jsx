import React from 'react';
import { Database, CloudSun, GitFork, Ship } from 'lucide-react';

export default function StatusBar({ 
  isLive = false, 
  vesselStatus = 'ACTIVE', 
  vesselCoords = [-65.0, -60.0],
  icebergCount = 42 
}) {
  return (
    <footer className="app-statusbar">
      <div className="statusbar-section statusbar-left">
        <div className="stream-badge">
          <span className="live-indicator-dot" />
          <span className="stream-text">{isLive ? 'DATA STREAM ACTIVE' : 'DEMO DATASET ACTIVE'}</span>
        </div>

        <div className="statusbar-divider" />

        <div className="statusbar-item">
          <Database size={13} className="status-item-icon" />
          <span className="item-label">ICEBERG DATABASE:</span>
          <span className="item-val">{icebergCount} LOADED</span>
        </div>

        <div className="statusbar-divider" />

        <div className="statusbar-item">
          <CloudSun size={13} className="status-item-icon" />
          <span className="item-label">WEATHER DATA:</span>
          <span className="item-val text-safe">{isLive ? 'MONITORED' : 'FALLBACK'}</span>
        </div>

        <div className="statusbar-divider" />

        <div className="statusbar-item">
          <GitFork size={13} className="status-item-icon" />
          <span className="item-label">ROUTE ENGINE:</span>
          <span className="item-val text-safe">DIJKSTRA ONLINE</span>
        </div>
      </div>

      <div className="statusbar-section statusbar-right">
        <div className="vessel-status-box">
          <Ship size={14} className="vessel-icon text-cyan" />
          <span className="vessel-label">RESEARCH VESSEL:</span>
          <span className="vessel-state text-safe">{vesselStatus}</span>
          <span className="vessel-coords">
            [{vesselCoords[0].toFixed(1)}°S, {Math.abs(vesselCoords[1]).toFixed(1)}°W]
          </span>
        </div>
      </div>
    </footer>
  );
}

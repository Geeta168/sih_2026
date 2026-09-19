import React from 'react';
import { Database, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DataSources({ isLive = false, totalIcebergs = 42 }) {
  const sources = [
    { name: 'Iceberg observations', detail: `${totalIcebergs} tracked records from the configured data source`, verified: true },
    { name: 'Antarctic weather observations', detail: 'Configured weather observation feed or demo fallback', verified: true },
    { name: 'Vessel position', detail: 'R/V POLARIS mission waypoint [-65.0, -60.0]', verified: true },
    { name: 'Navigation risk engine', detail: 'Dijkstra ocean-grid multi-factor penalty algorithm', verified: true },
  ];

  return (
    <div className="glass-panel data-sources-card">
      <div className="panel-header">
        <div className="panel-title">
          <Database className="title-icon" size={17} />
          <span>DATA SOURCES</span>
        </div>
        <span className={`panel-badge ${isLive ? 'badge-safe' : 'badge-cyan'}`}>
          {isLive ? 'LIVE FEED' : 'CSV TELEMETRY'}
        </span>
      </div>

      <div className="data-sources-content">
        <ul className="sources-list">
          {sources.map((item, idx) => (
            <li key={idx} className="source-item">
              <CheckCircle2 size={16} className="source-check-icon text-safe" />
              <div className="source-text-box">
                <span className="source-name">{item.name}</span>
                <span className="source-detail">{item.detail}</span>
              </div>
            </li>
          ))}
        </ul>

        <div className="source-disclaimer-box">
          <AlertCircle size={13} className="disclaimer-icon" />
          <span>
            {isLive 
              ? 'Connected to local engine service on port 5000.' 
              : 'Demo mode active: using bundled fallback values until the API is available.'}
          </span>
        </div>
      </div>
    </div>
  );
}

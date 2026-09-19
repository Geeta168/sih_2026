import React, { useState, useEffect } from 'react';
import { Snowflake, Radio, Clock, Compass } from 'lucide-react';

export default function Header({ isLive = false, systemStatus = 'SYSTEM OPERATIONAL' }) {
  const [utcTime, setUtcTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toUTCString().slice(17, 25);
      const dateString = now.toISOString().slice(0, 10);
      setUtcTime(`${dateString} • ${timeString} UTC`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="app-header">
      {/* Left: Branding */}
      <div className="header-brand">
        <div className="brand-icon-wrapper">
          <Snowflake className="brand-icon" size={24} />
          <div className="brand-glow" />
        </div>
        <div className="brand-text">
          <div className="brand-title-row">
            <span className="brand-title">POLARIS</span>
            <span className="brand-tag">v2.4 DSS</span>
          </div>
          <span className="brand-subtitle">ANTARCTIC NAVIGATION DSS</span>
        </div>
      </div>

      {/* Center: Mission Tag */}
      <div className="header-center">
        <div className="mission-pill">
          <Compass size={14} className="mission-icon" />
          <span className="mission-text">AI-POWERED MARITIME DECISION SUPPORT</span>
          <span className="mission-sector">SECTOR: WEDDELL SEA / PENINSULA</span>
        </div>
      </div>

      {/* Right: Operational Status & Telemetry */}
      <div className="header-status">
        <div className="telemetry-time">
          <Clock size={13} className="time-icon" />
          <span>{utcTime || '2026-09-19 • 02:18 UTC'}</span>
        </div>

        <div className="status-indicator-box">
          <div className="status-pulse-ring">
            <span className="status-dot" />
          </div>
          <div className="status-labels">
            <span className="status-headline">{systemStatus}</span>
            <span className="status-subline">
              <Radio size={10} className="status-radio-icon" />
              {isLive ? 'BACKEND CONNECTED (5000)' : 'AUTONOMOUS TELEMETRY (CSV)'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

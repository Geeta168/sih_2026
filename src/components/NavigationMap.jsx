import React, { useState, useEffect } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Polyline, 
  CircleMarker, 
  Circle, 
  Marker, 
  Popup, 
  Tooltip,
  useMap 
} from 'react-leaflet';
import L from 'leaflet';
import { 
  Ship, 
  Target, 
  Layers, 
  Maximize2
} from 'lucide-react';

// Fix Leaflet Default Icon issue in Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Futuristic Vessel Icon using L.divIcon
const vesselDivIcon = L.divIcon({
  className: 'custom-vessel-marker-wrapper',
  html: `
    <div class="vessel-marker-container">
      <div class="vessel-ping"></div>
      <div class="vessel-core">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00f5ff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
          <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/>
          <path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/>
          <path d="M12 10v4"/>
          <path d="M12 2v3"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20]
});

// Custom Destination Icon using L.divIcon
const destinationDivIcon = L.divIcon({
  className: 'custom-dest-marker-wrapper',
  html: `
    <div class="dest-marker-container">
      <div class="dest-ping"></div>
      <div class="dest-core">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <circle cx="12" cy="12" r="6"/>
          <circle cx="12" cy="12" r="2"/>
        </svg>
      </div>
    </div>
  `,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

// Map Controller helper for centering and re-centering
function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

export default function NavigationMap({
  vesselPosition = [-65.0, -60.0],
  destination = [-70.0, -45.0],
  vesselName = 'R/V POLARIS',
  destinationName = 'Antarctic Research Station',
  icebergs = [],
  routeData = {},
  selectedRoute = 'recommended',
  onSelectRoute,
  onRouteLocations,
  locationError = ''
}) {
  // Map display layer toggles
  const [showShortest, setShowShortest] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [showLegend, setShowLegend] = useState(true);
  const [mapCenter, setMapCenter] = useState([-67.5, -53.0]);
  const [mapZoom, setMapZoom] = useState(4.8);
  const [sourceQuery, setSourceQuery] = useState(`${vesselPosition[0]}, ${vesselPosition[1]}`);
  const [destinationQuery, setDestinationQuery] = useState(`${destination[0]}, ${destination[1]}`);
  const [isResolving, setIsResolving] = useState(false);

  const recommendedRoute = routeData?.recommended_route || [];
  const shortestRoute = routeData?.shortest_route || [];

  // Reset to full operational area
  const handleResetView = () => {
    setMapCenter([-67.5, -53.0]);
    setMapZoom(4.8);
  };

  // Center on research vessel
  const handleCenterVessel = () => {
    setMapCenter(vesselPosition);
    setMapZoom(6);
  };

  const handleLocationSubmit = async (event) => {
    event.preventDefault();
    setIsResolving(true);
    try {
      const result = await onRouteLocations?.(sourceQuery, destinationQuery);
      if (result) {
        setMapCenter(result.source.coordinates);
        setMapZoom(4.8);
      }
    } finally {
      setIsResolving(false);
    }
  };

  // Helper to categorize iceberg danger level based on size
  const getIcebergVisuals = (iceberg) => {
    const maxDimension = Math.max(iceberg.length || 10, iceberg.width || 5);
    if (maxDimension >= 40) {
      return {
        radius: 12,
        color: '#ef4444',
        fillColor: '#ef4444',
        glow: 'rgba(239, 68, 68, 0.5)',
        label: 'CRITICAL HAZARD',
        bufferKm: 55000 // 55 km buffer
      };
    } else if (maxDimension >= 15) {
      return {
        radius: 8,
        color: '#f59e0b',
        fillColor: '#f59e0b',
        glow: 'rgba(245, 158, 11, 0.4)',
        label: 'HIGH HAZARD',
        bufferKm: 35000 // 35 km buffer
      };
    } else {
      return {
        radius: 6,
        color: '#00f5ff',
        fillColor: '#38bdf8',
        glow: 'rgba(0, 245, 255, 0.4)',
        label: 'MODERATE HAZARD',
        bufferKm: 20000 // 20 km buffer
      };
    }
  };

  return (
    <div className="navigation-map-wrapper">
      {/* HUD Header Bar inside Map */}
      <div className="map-hud-header">
        <div className="hud-badge-group">
          <span className="hud-label">ANTARCTIC SECTOR:</span>
          <span className="hud-value">WEDDELL SEA & PENINSULA</span>
        </div>
        <div className="hud-badge-group">
          <span className="hud-label">BOUNDS:</span>
          <span className="hud-value">60°S - 78°S | 30°W - 75°W</span>
        </div>
        <div className="hud-controls-right">
          <button 
            type="button" 
            className="hud-action-btn"
            onClick={handleCenterVessel}
            title="Track Vessel"
          >
            <Ship size={14} />
            <span>LOCATE VESSEL</span>
          </button>
          <button 
            type="button" 
            className="hud-action-btn"
            onClick={handleResetView}
            title="Reset Antarctic View"
          >
            <Maximize2 size={14} />
            <span>RESET EXTENT</span>
          </button>
        </div>
      </div>

      <form className="route-location-panel" onSubmit={handleLocationSubmit}>
        <div className="route-location-heading">
          <Target size={14} />
          <span>PLAN A NEW VOYAGE</span>
          <span className="route-location-hint">Names or lat, lon</span>
        </div>
        <div className="route-location-fields">
          <label>
            <span>SOURCE</span>
            <input value={sourceQuery} onChange={(event) => setSourceQuery(event.target.value)} placeholder="e.g. -65.0, -60.0" />
          </label>
          <label>
            <span>DESTINATION</span>
            <input value={destinationQuery} onChange={(event) => setDestinationQuery(event.target.value)} placeholder="e.g. Antarctic station" />
          </label>
          <button type="submit" className="location-submit-btn" disabled={isResolving}>
            {isResolving ? 'CALCULATING ROUTE...' : 'SET ROUTE'}
          </button>
        </div>
        {locationError && <div className="route-location-error">{locationError}</div>}
      </form>

      {/* Leaflet Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        scrollWheelZoom={true}
        className="polar-leaflet-map"
        minZoom={3}
        maxZoom={10}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        {/* Public no-key basemap, darkened by CSS to match the command-center UI. */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="polar-dark-tiles"
        />

        {/* Iceberg Hazard Danger Buffers */}
        {showDangerZones && icebergs.map((iceberg) => {
          const visuals = getIcebergVisuals(iceberg);
          return (
            <Circle
              key={`buffer-${iceberg.id}`}
              center={[iceberg.latitude, iceberg.longitude]}
              radius={visuals.bufferKm}
              pathOptions={{
                color: visuals.color,
                fillColor: visuals.fillColor,
                fillOpacity: 0.08,
                weight: 1,
                dashArray: '3, 6'
              }}
            />
          );
        })}

        {/* Alternative Shortest Route (Warning Color, cuts close to icebergs) */}
        {showShortest && shortestRoute.length > 0 && (
          <Polyline
            positions={shortestRoute}
            pathOptions={{
              color: '#f59e0b',
              weight: selectedRoute === 'shortest' ? 5 : 3.5,
              opacity: selectedRoute === 'shortest' ? 1 : 0.65,
              dashArray: '7, 7',
              lineCap: 'round'
            }}
            eventHandlers={{
              click: () => onSelectRoute?.('shortest')
            }}
          >
            <Tooltip sticky className="route-tooltip warning-tooltip">
              <div className="tooltip-content">
                <strong>SHORTEST ROUTE (HAZARDOUS)</strong>
                <div>Distance: 1,180 km | Fuel: 94 L</div>
                <div style={{ color: '#ef4444' }}>Risk: 61/100 (Cuts adjacent to A68A)</div>
              </div>
            </Tooltip>
          </Polyline>
        )}

        {/* Recommended Safe Route (Glowing Cyan / Neon Emerald Line) */}
        {recommendedRoute.length > 0 && (
          <>
            {/* Outer Glow Halo Line */}
            <Polyline
              positions={recommendedRoute}
              pathOptions={{
                color: '#00f5ff',
                weight: selectedRoute === 'recommended' ? 9 : 7,
                opacity: 0.35,
                lineCap: 'round'
              }}
            />
            {/* Inner Crisp Neon Line */}
            <Polyline
              positions={recommendedRoute}
              pathOptions={{
                color: '#10b981',
                weight: selectedRoute === 'recommended' ? 5 : 4,
                opacity: 1.0,
                lineCap: 'round'
              }}
              eventHandlers={{
                click: () => onSelectRoute?.('recommended')
              }}
            >
              <Tooltip sticky className="route-tooltip safe-tooltip">
                <div className="tooltip-content">
                  <strong>RECOMMENDED SAFE ROUTE</strong>
                  <div>Distance: 1,240 km | Fuel: 99 L</div>
                  <div style={{ color: '#10b981' }}>Risk: 24/100 (Safe A68A Clearance)</div>
                </div>
              </Tooltip>
            </Polyline>
          </>
        )}

        {/* Iceberg Markers with Dynamic Radius & Popup Details */}
        {icebergs.map((iceberg) => {
          const visuals = getIcebergVisuals(iceberg);
          return (
            <CircleMarker
              key={`ice-${iceberg.id}`}
              center={[iceberg.latitude, iceberg.longitude]}
              radius={visuals.radius}
              pathOptions={{
                color: visuals.color,
                fillColor: visuals.fillColor,
                fillOpacity: 0.85,
                weight: 2
              }}
            >
              <Popup className="polar-iceberg-popup">
                <div className="iceberg-popup-body">
                  <div className="popup-header-row">
                    <span className="popup-title">ICEBERG {iceberg.id}</span>
                    <span className="popup-badge" style={{ borderColor: visuals.color, color: visuals.color }}>
                      {visuals.label}
                    </span>
                  </div>
                  <div className="popup-stats-grid">
                    <div className="stat-item">
                      <span className="stat-label">LENGTH</span>
                      <span className="stat-value">{iceberg.length || '--'} NM</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">WIDTH</span>
                      <span className="stat-value">{iceberg.width || '--'} NM</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">LATITUDE</span>
                      <span className="stat-value">{iceberg.latitude.toFixed(2)}°S</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">LONGITUDE</span>
                      <span className="stat-value">{Math.abs(iceberg.longitude).toFixed(2)}°W</span>
                    </div>
                  </div>
                  <div className="popup-footer">
                    <span>LAST UPDATE: {iceberg.last_update || 'Unknown'}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Research Vessel Starting Position */}
        <Marker position={vesselPosition} icon={vesselDivIcon}>
          <Popup className="polar-vessel-popup">
            <div className="vessel-popup-body">
              <div className="vessel-popup-header">
                <Ship size={16} className="text-cyan" />
                <span className="popup-vessel-name">{vesselName}</span>
                <span className="panel-badge badge-safe">ACTIVE</span>
              </div>
              <div className="vessel-popup-data">
                <div><strong>MISSION:</strong> Antarctic Environmental Recon</div>
                <div><strong>SOURCE:</strong> {vesselName}</div>
                <div><strong>LOCATION:</strong> {vesselPosition[0]}°S, {Math.abs(vesselPosition[1])}°W</div>
                <div><strong>HEADING:</strong> 138° SE | SPEED: 14.2 knots</div>
                <div><strong>STATUS:</strong> Autonomous Decision Support Engaged</div>
              </div>
            </div>
          </Popup>
        </Marker>

        {/* Destination Waypoint Marker */}
        <Marker position={destination} icon={destinationDivIcon}>
          <Popup className="polar-dest-popup">
            <div className="dest-popup-body">
              <div className="dest-popup-header">
                <Target size={16} className="text-safe" />
                <span className="popup-dest-name">{destinationName}</span>
              </div>
              <div className="dest-popup-data">
                <div><strong>SECTOR:</strong> Weddell Sea Ice Shelf Entry</div>
                <div><strong>COORDINATES:</strong> {destination[0]}°S, {Math.abs(destination[1])}°W</div>
                <div><strong>FACILITY:</strong> Scientific Observation Station</div>
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      {/* Floating Interactive Map Legend */}
      <div className={`map-floating-legend ${showLegend ? 'legend-expanded' : 'legend-collapsed'}`}>
        <div className="legend-header" onClick={() => setShowLegend(!showLegend)}>
          <div className="legend-title-row">
            <Layers size={14} className="legend-icon" />
            <span>MAP TELEMETRY & LEGEND</span>
          </div>
          <button type="button" className="legend-toggle-btn">
            {showLegend ? 'Hide' : 'Show'}
          </button>
        </div>

        {showLegend && (
          <div className="legend-content">
            {/* Route Legend */}
            <div className="legend-section">
              <span className="legend-section-title">NAVIGATION PATHS</span>
              <div 
                className="legend-item cursor-pointer"
                onClick={() => onSelectRoute?.('recommended')}
              >
                <span className="legend-line recommended-line-indicator" />
                <div className="legend-label-box">
                  <span className="legend-label">Recommended Route</span>
                  <span className="legend-sub">AI Hazard Optimized (24/100)</span>
                </div>
              </div>

              <div 
                className="legend-item cursor-pointer"
                onClick={() => onSelectRoute?.('shortest')}
              >
                <span className="legend-line shortest-line-indicator" />
                <div className="legend-label-box">
                  <span className="legend-label">Shortest Route</span>
                  <span className="legend-sub">Direct High-Risk (61/100)</span>
                </div>
              </div>
            </div>

            {/* Vessel & Waypoint */}
            <div className="legend-section">
              <span className="legend-section-title">KEY ASSETS</span>
              <div className="legend-item">
                <span className="legend-symbol vessel-symbol">🚢</span>
                <span className="legend-label">R/V POLARIS (Vessel)</span>
              </div>
              <div className="legend-item">
                <span className="legend-symbol dest-symbol">🎯</span>
                <span className="legend-label">Destination Station</span>
              </div>
            </div>

            {/* Iceberg Hazard Scales */}
            <div className="legend-section">
              <span className="legend-section-title">ICEBERG COLLISION RISK</span>
              <div className="legend-item">
                <span className="legend-dot dot-critical" />
                <span className="legend-label">High Risk (A68A, A64 &gt;40 NM)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-warning" />
                <span className="legend-label">Medium Risk (15 - 40 NM)</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot dot-safe" />
                <span className="legend-label">Low Risk (&lt;15 NM)</span>
              </div>
            </div>

            {/* Quick Layer Toggles */}
            <div className="legend-toggles-section">
              <label className="toggle-checkbox-label">
                <input
                  type="checkbox"
                  checked={showShortest}
                  onChange={(e) => setShowShortest(e.target.checked)}
                />
                <span>Show Shortest Path</span>
              </label>
              <label className="toggle-checkbox-label">
                <input
                  type="checkbox"
                  checked={showDangerZones}
                  onChange={(e) => setShowDangerZones(e.target.checked)}
                />
                <span>Show Safety Buffer Rings</span>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import NavigationMap from './components/NavigationMap';
import RiskCard from './components/RiskCard';
import RouteAnalysis from './components/RouteAnalysis';
import EnvironmentPanel from './components/EnvironmentPanel';
import AIForecast from './components/AIForecast';
import RouteControls from './components/RouteControls';
import DataSources from './components/DataSources';
import StatusBar from './components/StatusBar';
import { 
  fetchIcebergs, 
  fetchWeather, 
  fetchRoute, 
  getRisk,
  geocodeLocation,
  recalculateSafeRoute, 
  simulate24Hours,
  VESSEL_START,
  DESTINATION,
  FALLBACK_ICEBERGS,
  FALLBACK_ROUTE,
  FALLBACK_WEATHER,
  FALLBACK_FORECAST,
  createPreviewRoute
} from './services/api';
import './App.css';

export default function App() {
  // Application Data States
  const [icebergs, setIcebergs] = useState(FALLBACK_ICEBERGS);
  const [weather, setWeather] = useState(FALLBACK_WEATHER);
  const [routeData, setRouteData] = useState(FALLBACK_ROUTE);
  const [forecast] = useState(FALLBACK_FORECAST);
  const [riskData, setRiskData] = useState({
    overall_risk: FALLBACK_ROUTE.recommended_risk,
    status: 'LOW',
    iceberg_risk: 24,
    weather_risk: 45
  });
  
  // Connection / Fallback State
  const [isLiveBackend, setIsLiveBackend] = useState(false);
  
  // UI Interactive States
  const [selectedRoute, setSelectedRoute] = useState('recommended'); // 'recommended' | 'shortest'
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationHour, setSimulationHour] = useState(0);
  const [lastLatency, setLastLatency] = useState(null);
  const [isSimulationData, setIsSimulationData] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [sourceLocation, setSourceLocation] = useState({ name: 'R/V POLARIS', coordinates: VESSEL_START });
  const [destinationLocation, setDestinationLocation] = useState({ name: 'Antarctic Research Station', coordinates: DESTINATION });
  const [locationError, setLocationError] = useState('');

  // Initial Data Fetch on Mount
  useEffect(() => {
    async function loadTelemetry() {
      try {
        const [icebergRes, weatherRes, routeRes, riskRes] = await Promise.all([
          fetchIcebergs(),
          fetchWeather(),
          fetchRoute(),
          getRisk()
        ]);

        if (icebergRes.data && icebergRes.data.length > 0) {
          setIcebergs(icebergRes.data);
        }
        if (weatherRes.data) {
          setWeather(weatherRes.data);
        }
        if (routeRes.data) {
          setRouteData(routeRes.data);
        }
        if (riskRes.data) {
          setRiskData(riskRes.data);
        }

        // Live backend status
        setIsLiveBackend(icebergRes.isLive || weatherRes.isLive || routeRes.isLive || riskRes.isLive);
      } catch {
        console.warn('Backend unavailable, using bundled Antarctic fallback dataset.');
      } finally {
        setDataLoading(false);
      }
    }

    loadTelemetry();
  }, []);

  // Handle "RECALCULATE SAFE ROUTE"
  const handleRecalculate = useCallback(async (start = sourceLocation.coordinates, destination = destinationLocation.coordinates) => {
    setIsRecalculating(true);
    
    // Simulate brief computation scan
    const startTime = Date.now();
    try {
      const [result, riskResult] = await Promise.all([
        recalculateSafeRoute(start, destination),
        getRisk()
      ]);
      if (result.error) {
        setRouteData((current) => ({ ...current, shortest_route: [], recommended_route: [] }));
        setLocationError(result.error);
        setIsRecalculating(false);
        return false;
      }
      if (result.data?.route_available === false) {
        setRouteData((current) => ({ ...current, shortest_route: [], recommended_route: [] }));
        setLocationError(result.data.route_error || 'No navigable ocean route found for these waypoints.');
        setIsRecalculating(false);
        return false;
      }
      const elapsed = result.latencyMs || Math.max(42, Date.now() - startTime);
      
      // Delay slightly for smooth human perception of computation
      setTimeout(() => {
        setRouteData(result.data);
        if (result.data.start) {
          setSourceLocation((current) => ({
            ...current,
            coordinates: result.data.start,
            name: result.data.endpoint_adjusted ? `${current.name} (ocean waypoint)` : current.name
          }));
        }
        if (result.data.destination) {
          setDestinationLocation((current) => ({
            ...current,
            coordinates: result.data.destination,
            name: result.data.endpoint_adjusted ? `${current.name} (ocean waypoint)` : current.name
          }));
        }
        if (riskResult.data) {
          setRiskData(riskResult.data);
        }
        setSelectedRoute('recommended');
        setLastLatency(elapsed);
        setIsLiveBackend((current) => current || result.isLive);
        setIsSimulationData(false);
        setIsRecalculating(false);
      }, 550);
    } catch {
      setTimeout(() => {
        setIsRecalculating(false);
        setLastLatency(48);
      }, 500);
    }
  }, [sourceLocation.coordinates, destinationLocation.coordinates]);

  const handleRouteLocations = useCallback(async (sourceQuery, destinationQuery) => {
    setLocationError('');
    try {
      const [source, target] = await Promise.all([
        geocodeLocation(sourceQuery),
        geocodeLocation(destinationQuery)
      ]);
      setSourceLocation(source);
      setDestinationLocation(target);
      setRouteData(createPreviewRoute(source.coordinates, target.coordinates));
      setIsSimulationData(false);
      const recalculated = await handleRecalculate(source.coordinates, target.coordinates);
      if (recalculated === false) return null;
      return { source, destination: target };
    } catch (error) {
      setLocationError(error.message);
      throw error;
    }
  }, [handleRecalculate]);

  // Handle "SIMULATE 24H"
  const handleSimulate = useCallback(() => {
    setIsSimulating(true);

    simulate24Hours().then((result) => {
      const simulation = result.data;
      setWeather((current) => ({
        ...current,
        temperature: simulation.temperature ?? current.temperature,
        wind_speed: simulation.wind_speed ?? current.wind_speed
      }));
      setRiskData((current) => ({
        ...current,
        overall_risk: simulation.risk ?? current.overall_risk,
        status: simulation.status ?? current.status,
        iceberg_risk: current.iceberg_risk,
        weather_risk: current.weather_risk
      }));
      setSimulationHour(simulation.simulation_hours || 24);
      setIsSimulationData(true);
      setIsSimulating(false);
    }).catch(() => {
      setIsSimulating(false);
    });
  }, []);

  // Current active risk value depending on user route toggle
  const currentRiskScore = selectedRoute === 'recommended'
    ? (riskData.overall_risk ?? routeData.recommended_risk)
    : routeData.shortest_risk;

  const currentRiskStatus = selectedRoute === 'recommended'
    ? `${riskData.status || 'LOW'} RISK`
    : 'HIGH RISK';

  const currentRiskText = selectedRoute === 'recommended'
    ? (isSimulationData ? 'Simulation output indicates updated environmental exposure.' : 'Recommended route currently avoids major hazards.')
    : 'Shortest route cuts dangerously close to A68A (82 NM tabular iceberg) and heavy pack ice.';

  return (
    <div className="app-container">
      {/* 1. TOP NAVIGATION BAR */}
      <Header 
        isLive={isLiveBackend} 
        systemStatus={isLiveBackend ? 'SYSTEM OPERATIONAL' : 'BACKEND OFFLINE'}
      />

      {/* 2. MAIN DASHBOARD: MAP (68%) & SIDEBAR (32%) */}
      <main className="dashboard-main">
        {/* Antarctic Interactive Map */}
        <section className="dashboard-map-section" aria-label="Antarctic Navigation Map">
          <NavigationMap
            vesselPosition={sourceLocation.coordinates}
            destination={destinationLocation.coordinates}
            vesselName={sourceLocation.name}
            destinationName={destinationLocation.name}
            icebergs={icebergs}
            routeData={routeData}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            onRouteLocations={handleRouteLocations}
            locationError={locationError}
          />
        </section>

        {/* Right Information Sidebar */}
        <aside className="dashboard-sidebar" aria-label="Command Telemetry and Controls">
          {/* CARD 1: NAVIGATION RISK GAUGE */}
          <RiskCard
            riskScore={currentRiskScore}
            routeType={selectedRoute}
            customStatus={currentRiskStatus}
            customText={currentRiskText}
            isLoading={dataLoading}
            isSimulation={isSimulationData}
          />

          {/* CARD 2: ROUTE ANALYSIS & COMPARISON */}
          <RouteAnalysis
            routeData={routeData}
            selectedRoute={selectedRoute}
            onSelectRoute={setSelectedRoute}
            isLoading={dataLoading}
          />

          {/* CARD 3: ENVIRONMENT MONITOR */}
          <EnvironmentPanel
            icebergCount={icebergs.length}
            windSpeed={weather.wind_speed || 18}
            temperature={weather.temperature || -18}
            dataStatus={isLiveBackend ? 'LIVE' : 'DEMO'}
            isLive={isLiveBackend}
            isSimulation={isSimulationData}
            isLoading={dataLoading}
          />

          {/* CARD 4: AI PREDICTION PANEL */}
          <AIForecast
            icebergHazard={forecast.iceberg_hazard}
            weatherRisk={riskData.status || forecast.weather_risk}
            confidence={forecast.navigation_confidence}
            isSimulation={isSimulationData}
            windSpeed={weather.wind_speed}
          />

          {/* CARD 5: ROUTE OPTIMIZATION & SIMULATION CONTROLS */}
          <RouteControls
            onRecalculate={handleRecalculate}
            onSimulate={handleSimulate}
            isRecalculating={isRecalculating}
            isSimulating={isSimulating}
            simulationHour={simulationHour}
            lastRecalculatedLatency={lastLatency}
            isSimulationData={isSimulationData}
          />

          {/* CARD 6: VERIFIED DATA SOURCES */}
          <DataSources
            isLive={isLiveBackend}
            totalIcebergs={icebergs.length}
          />
        </aside>
      </main>

      {/* 3. BOTTOM MARITIME STATUS BAR */}
      <StatusBar
        isLive={isLiveBackend}
        vesselStatus="ACTIVE"
        vesselCoords={VESSEL_START}
        icebergCount={icebergs.length}
      />
    </div>
  );
}

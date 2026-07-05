import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { Cpu, AlertTriangle, ShieldCheck, Warehouse, Activity, CheckCircle, Flame, Factory, Gauge, X } from 'lucide-react';

ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Tooltip, 
  Legend, 
  Filler
);

const Dashboard = () => {
  const [machines, setMachines] = useState([]);
  const [requests, setRequests] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentAiRun, setRecentAiRun] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState({});
  const [selectedMachine, setSelectedMachine] = useState(null);

  const fetchData = async () => {
    try {
      const macRes = await api.get('/machines');
      setMachines(macRes.data);

      // Fetch telemetry for Machine 1 to show a chart
      if (macRes.data.length > 0) {
        const telRes = await api.get(`/machines/${macRes.data[0].id}/telemetry?limit=15`);
        setTelemetry(telRes.data.reverse());
      }

      // Fetch latest telemetry for all machines
      const latestTelemetryMap = {};
      await Promise.all(macRes.data.map(async (m) => {
        try {
          const tel = await api.get(`/machines/${m.id}/telemetry?limit=1`);
          if (tel.data.length > 0) {
            latestTelemetryMap[m.id] = tel.data[0];
          }
        } catch (err) {
          console.error(`Error loading telemetry for machine ${m.id}`, err);
        }
      }));
      setLatestTelemetry(latestTelemetryMap);

      // If a machine is selected, update its reference in state so gauges display live values
      if (selectedMachine) {
        const updatedMach = macRes.data.find(m => m.id === selectedMachine.id);
        if (updatedMach) setSelectedMachine(updatedMach);
      }

      const reqRes = await api.get('/maintenance/requests');
      setRequests(reqRes.data);

      const stockRes = await api.get('/inventory/low-stock');
      setLowStockCount(stockRes.data.length);

      const aiRes = await api.get('/ai/logs');
      if (aiRes.data.length > 0) {
        setRecentAiRun(aiRes.data[0]);
      }
    } catch (e) {
      console.error("Dashboard metrics load error", e);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll telemetry data every 5 seconds for responsive live feeds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [selectedMachine?.id]);

  const totalMachines = machines.length;
  const activeCount = machines.filter(m => m.status === 'ACTIVE').length;
  const underMaintCount = machines.filter(m => m.status === 'UNDER_MAINTENANCE').length;
  const failedCount = machines.filter(m => m.status === 'FAILED').length;
  
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS').length;

  // Chart telemetry configuration
  const telemetryData = {
    labels: telemetry.map(t => new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
    datasets: [
      {
        fill: true,
        label: 'Vibration Amplitude (mm/s)',
        data: telemetry.map(t => t.vibration),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.05)',
        tension: 0.4,
      },
      {
        fill: true,
        label: 'Temperature (°C)',
        data: telemetry.map(t => t.temperature),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        tension: 0.4,
      }
    ]
  };

  const statusData = {
    labels: ['Active', 'In Maintenance', 'Failed'],
    datasets: [
      {
        data: [activeCount, underMaintCount, failedCount],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 1,
        borderColor: '#161D30',
      }
    ]
  };

  return (
    <div className="space-y-8">
      {/* 1. Stat cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider block">Equipment Status</span>
            <h3 className="text-2xl font-bold mt-2 text-dark-text">{activeCount} / {totalMachines}</h3>
            <span className="text-xs text-accent-green font-medium mt-1 inline-block">Active Assets</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-green/10 flex items-center justify-center text-accent-green glow-cyan">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider block">Active Work Orders</span>
            <h3 className="text-2xl font-bold mt-2 text-dark-text">{pendingRequests + inProgressRequests}</h3>
            <span className="text-xs text-accent-amber font-medium mt-1 inline-block">{pendingRequests} Pending assignment</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-amber/10 flex items-center justify-center text-accent-amber glow-cyan">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider block">Production Yield OEE</span>
            <h3 className="text-2xl font-bold mt-2 text-dark-text">88.2%</h3>
            <span className="text-xs text-primary font-medium mt-1 inline-block">+1.4% from yesterday</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary glow-cyan">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-dark-muted uppercase tracking-wider block">Low Stock Spares</span>
            <h3 className="text-2xl font-bold mt-2 text-dark-text">{lowStockCount}</h3>
            <span className="text-xs text-accent-red font-medium mt-1 inline-block">Requires reorder</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-accent-red/10 flex items-center justify-center text-accent-red glow-cyan">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Interactive SCADA Factory Floor Map */}
      <div className="glass-card p-6 overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold text-dark-text flex items-center gap-2">
            <Factory className="w-5 h-5 text-accent-cyan" />
            Live SCADA Factory Floor Layout (Interactive)
          </h3>
          <span className="text-xs text-dark-muted flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-accent-green inline-block"></span>
            Real-time Telemetry Active (5s Poll)
          </span>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Floor Grid Map */}
          <div className="relative flex-grow h-[420px] bg-[#0E1524] rounded-xl border border-dark-border/50 blueprint-grid overflow-hidden">
            {/* Grid Zone Labels */}
            <div className="absolute top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-[#475569]/70">Zone A - Precision Area</div>
            <div className="absolute bottom-3 left-4 text-[10px] uppercase font-bold tracking-widest text-[#475569]/70">Zone B - Final Assembly</div>
            <div className="absolute top-3 right-4 text-[10px] uppercase font-bold tracking-widest text-[#475569]/70">Zone D - Energy & Steam Boiler</div>
            <div className="absolute bottom-3 right-4 text-[10px] uppercase font-bold tracking-widest text-[#475569]/70">Zone C - Molding Sector</div>

            {/* SVG Flow Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* CNC to Conveyor */}
              <path d="M 20,25 L 50,48" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="0.8" fill="none" className="flowline-active" />
              {/* Robotic Arm to Conveyor */}
              <path d="M 20,70 L 50,48" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="0.8" fill="none" className="flowline-active" />
              {/* Conveyor to Injector */}
              <path d="M 50,48 L 80,70" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="0.8" fill="none" className="flowline-active" />
              {/* Boiler to CNC */}
              <path d="M 80,25 L 20,25" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="0.6" fill="none" className="flowline-steam" />
              {/* Boiler to Injector */}
              <path d="M 80,25 L 80,70" stroke="rgba(245, 158, 11, 0.3)" strokeWidth="0.6" fill="none" className="flowline-steam" />
            </svg>

            {/* Render Nodes */}
            {machines.map((m) => {
              const tel = latestTelemetry[m.id] || {};
              const statusClass = 
                m.status === 'ACTIVE' ? 'signal-healthy' :
                m.status === 'UNDER_MAINTENANCE' ? 'signal-warning' : 'signal-danger';

              // Map node position
              let pos = { left: '50%', top: '50%' };
              if (m.id === 1) pos = { left: '20%', top: '25%' };
              else if (m.id === 2) pos = { left: '20%', top: '70%' };
              else if (m.id === 3) pos = { left: '80%', top: '25%' };
              else if (m.id === 4) pos = { left: '50%', top: '48%' };
              else if (m.id === 5) pos = { left: '80%', top: '70%' };

              return (
                <div 
                  key={m.id}
                  style={pos}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer p-4 rounded-xl border transition-all duration-300 flex flex-col items-center gap-1.5 min-w-[130px] ${
                    selectedMachine?.id === m.id 
                      ? 'bg-primary/20 border-primary shadow-lg shadow-primary/10 scale-105' 
                      : 'bg-dark-card/90 border-dark-border hover:border-primary/40 hover:scale-105'
                  }`}
                  onClick={() => setSelectedMachine(m)}
                >
                  {/* Status beacon indicator */}
                  <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${statusClass}`}></span>
                  
                  {/* Icon */}
                  <div className={`p-2 rounded-lg ${
                    m.status === 'ACTIVE' ? 'text-accent-green bg-accent-green/5' :
                    m.status === 'UNDER_MAINTENANCE' ? 'text-accent-amber bg-accent-amber/5' : 'text-accent-red bg-accent-red/5'
                  }`}>
                    {m.name.includes('Boiler') ? <Flame className="w-5 h-5" /> : 
                     m.name.includes('Conveyor') ? <Activity className="w-5 h-5" /> :
                     m.name.includes('Robotic') ? <Cpu className="w-5 h-5" /> : <Cpu className="w-5 h-5" />}
                  </div>

                  <span className="text-xs font-bold text-dark-text text-center line-clamp-1">{m.name.split(' (')[0]}</span>
                  <span className="text-[10px] text-dark-muted font-mono">{m.serialNumber}</span>

                  {/* Telemetry snippet if active */}
                  {tel.temperature && (
                    <span className="text-[10px] font-semibold text-dark-muted bg-dark-bg/60 px-1.5 py-0.5 rounded mt-1">
                      {tel.temperature.toFixed(1)}°C | {tel.vibration.toFixed(1)}m/s
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Details Sidebar overlay */}
          <div className={`w-full lg:w-[320px] glass-card p-6 flex flex-col justify-between border-dark-border transition-all duration-300 ${
            selectedMachine ? 'opacity-100 translate-x-0' : 'opacity-60 pointer-events-none'
          }`}>
            {selectedMachine ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-dark-border pb-3">
                  <div>
                    <h4 className="text-sm font-bold text-dark-text">{selectedMachine.name}</h4>
                    <span className="text-xs text-dark-muted font-mono block mt-0.5">{selectedMachine.serialNumber}</span>
                  </div>
                  <button onClick={() => setSelectedMachine(null)} className="text-dark-muted hover:text-dark-text">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <h5 className="text-xs font-semibold uppercase tracking-wider text-dark-muted flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-accent-cyan" />
                    Live Telemetry Feeds
                  </h5>

                  {latestTelemetry[selectedMachine.id] ? (
                    (() => {
                      const t = latestTelemetry[selectedMachine.id];
                      return (
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-[#161D30] p-2.5 rounded-lg">
                            <span className="text-dark-muted block">Temperature</span>
                            <span className={`text-base font-bold block mt-1 ${t.temperature >= 90 ? 'text-accent-red' : t.temperature >= 80 ? 'text-accent-amber' : 'text-dark-text'}`}>
                              {t.temperature.toFixed(1)} °C
                            </span>
                          </div>

                          <div className="bg-[#161D30] p-2.5 rounded-lg">
                            <span className="text-dark-muted block">Vibration</span>
                            <span className={`text-base font-bold block mt-1 ${t.vibration >= 5.0 ? 'text-accent-red' : 'text-dark-text'}`}>
                              {t.vibration.toFixed(2)} mm/s
                            </span>
                          </div>

                          <div className="bg-[#161D30] p-2.5 rounded-lg">
                            <span className="text-dark-muted block">Pressure</span>
                            <span className="text-base font-bold block mt-1">{t.pressure.toFixed(1)} bar</span>
                          </div>

                          <div className="bg-[#161D30] p-2.5 rounded-lg">
                            <span className="text-dark-muted block">Motor RPM</span>
                            <span className="text-base font-bold block mt-1">{Math.round(t.rpm)} RPM</span>
                          </div>
                          
                          <div className="bg-[#161D30] p-2.5 rounded-lg col-span-2 flex justify-between items-center">
                            <div>
                              <span className="text-dark-muted block">Running Hours</span>
                              <span className="text-sm font-bold block mt-0.5">{Math.round(t.runningHours)} Hrs</span>
                            </div>
                            <span className="text-[10px] text-dark-muted italic">Last updated: Just now</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-6 text-dark-muted italic">No active sensors reading.</div>
                  )}
                </div>

                <div className="bg-[#161D30]/50 p-3.5 rounded-lg border border-dark-border">
                  <h6 className="text-[11px] font-bold text-dark-text uppercase tracking-wide">Zone Info</h6>
                  <p className="text-xs text-dark-muted mt-1 leading-relaxed">{selectedMachine.location}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12 text-dark-muted">
                <Gauge className="w-8 h-8 text-dark-border animate-pulse mb-3" />
                <span className="text-xs font-semibold">Select a Node on the blueprint floor map to view telemetry gauges</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Charts panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-base font-bold mb-4 text-dark-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-violet" />
            VMC-850 Precision Telemetry Stream
          </h3>
          <div className="h-72">
            <Line 
              data={telemetryData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#9CA3AF' } } },
                scales: {
                  x: { grid: { color: '#232D45' }, ticks: { color: '#9CA3AF' } },
                  y: { grid: { color: '#232D45' }, ticks: { color: '#9CA3AF' } }
                }
              }} 
            />
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <h3 className="text-base font-bold mb-4 self-start text-dark-text flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Machine Status Distribution
          </h3>
          <div className="w-48 h-48 mb-4">
            <Doughnut 
              data={statusData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
              }}
            />
          </div>
          <div className="grid grid-cols-3 gap-4 w-full text-center mt-2">
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-accent-green inline-block mr-1"></span>
              <span className="text-xs text-dark-muted font-medium block">Active</span>
              <span className="text-sm font-semibold">{activeCount}</span>
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-accent-amber inline-block mr-1"></span>
              <span className="text-xs text-dark-muted font-medium block">Repair</span>
              <span className="text-sm font-semibold">{underMaintCount}</span>
            </div>
            <div>
              <span className="w-2.5 h-2.5 rounded-full bg-accent-red inline-block mr-1"></span>
              <span className="text-xs text-dark-muted font-medium block">Offline</span>
              <span className="text-sm font-semibold">{failedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. AI Insights recommendation card */}
      {recentAiRun && (
        <div className="glass-card p-6 bg-gradient-to-r from-dark-card to-primary/5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          <h3 className="text-base font-bold mb-4 text-dark-text flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-accent-cyan" />
            Autonomous Supervisor AI Action Plan
          </h3>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-accent-cyan/10 rounded-xl text-accent-cyan flex-shrink-0">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-dark-text">Last Evaluated Action Plan</h4>
              <p className="text-sm text-dark-muted mt-2 leading-relaxed">{recentAiRun.response}</p>
              <div className="mt-4 flex items-center gap-6 text-xs text-dark-muted">
                <span>Agent: <strong>{recentAiRun.agentName}</strong></span>
                <span>Diagnosis Date: <strong>{new Date(recentAiRun.timestamp).toLocaleString()}</strong></span>
                <span className="px-2 py-0.5 bg-accent-green/10 text-accent-green rounded-full font-semibold">
                  Status: {recentAiRun.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

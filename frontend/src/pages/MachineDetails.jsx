import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import api from '../utils/api';
import { Line } from 'react-chartjs-2';
import { 
  Cpu, 
  Activity, 
  Wrench, 
  BrainCircuit, 
  Send, 
  AlertTriangle, 
  Play, 
  Clock, 
  FileText, 
  CheckCircle,
  AlertCircle,
  Gauge
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MachineDetails = () => {
  const { id } = useParams();
  const [machine, setMachine] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [history, setHistory] = useState([]);
  
  // AI Co-Pilot State
  const [aiLoading, setAiLoading] = useState(false);
  const [chatPrompt, setChatPrompt] = useState('');
  const [aiLogs, setAiLogs] = useState([]); // conversation history
  const [reasoning, setReasoning] = useState([]);
  const [subAgents, setSubAgents] = useState(null);

  // Digital Twin SCADA Control State
  const [plcLogs, setPlcLogs] = useState([
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Connected to PLC-109 Modbus Gateway.`,
    `[${new Date().toLocaleTimeString()}] [SYSTEM] Live telemetry handshake complete.`
  ]);
  const [isCoolingOn, setIsCoolingOn] = useState(false);
  const [motorRpm, setMotorRpm] = useState(1800);
  const [isEmergencyHalt, setIsEmergencyHalt] = useState(false);

  const logsEndRef = useRef(null);
  const { hasRole } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const macRes = await api.get(`/machines/${id}`);
        setMachine(macRes.data);
        if (macRes.data.status === 'FAILED') {
          setIsEmergencyHalt(true);
          setMotorRpm(0);
        }

        const telRes = await api.get(`/machines/${id}/telemetry?limit=15`);
        setTelemetry(telRes.data.reverse());

        const histRes = await api.get(`/maintenance/machines/${id}/history`);
        setHistory(histRes.data);
      } catch (e) {
        console.error("Error loading machine details", e);
      }
    };
    fetchData();

    // Poll telemetry every 10 seconds for real-time charts
    const interval = setInterval(async () => {
      try {
        const telRes = await api.get(`/machines/${id}/telemetry?limit=15`);
        setTelemetry(telRes.data.reverse());
      } catch (e) {}
    }, 10000);

    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiLogs]);

  if (!machine) {
    return (
      <div className="flex justify-center items-center py-24 text-dark-muted">
        Loading telemetry data...
      </div>
    );
  }

  // Trigger Autocontrol Agent Diagnosis
  const handleTriggerDiagnosis = async () => {
    setAiLoading(true);
    setReasoning([]);
    setSubAgents(null);
    try {
      const response = await api.post('/ai/diagnose', {
        prompt: `Diagnose machine status: ${machine.name}. Telemetry parameters breached safety lines?`,
        machineId: machine.id
      });

      const { recommendation, reasoningChain, subAgentsOutputs } = response.data;
      
      setReasoning(reasoningChain);
      setSubAgents(subAgentsOutputs);

      setAiLogs(prev => [
        ...prev,
        { role: 'USER', content: 'Run automated supervisor scan.' },
        { role: 'ASSISTANT', content: recommendation }
      ]);
    } catch (err) {
      console.error(err);
      setAiLogs(prev => [
        ...prev,
        { role: 'USER', content: 'Run automated supervisor scan.' },
        { role: 'SYSTEM', content: 'Scan failed: ' + (err.message || 'Server timeout.') }
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Submit manual chat query
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatPrompt.trim()) return;

    const userText = chatPrompt;
    setChatPrompt('');
    setAiLogs(prev => [...prev, { role: 'USER', content: userText }]);
    setAiLoading(true);

    try {
      const response = await api.post('/ai/diagnose', {
        prompt: userText,
        machineId: machine.id
      });
      const { recommendation } = response.data;
      setAiLogs(prev => [...prev, { role: 'ASSISTANT', content: recommendation }]);
    } catch (err) {
      setAiLogs(prev => [...prev, { role: 'SYSTEM', content: 'Error: ' + (err.message || 'Failed to response.') }]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleToggleCooling = () => {
    const newState = !isCoolingOn;
    setIsCoolingOn(newState);
    const time = new Date().toLocaleTimeString();
    setPlcLogs(prev => [
      `[${time}] PLC CMD: SET_COOLING_FAN = ${newState ? 'ON' : 'OFF'}`,
      `[${time}] PLC STATUS: Simulating thermal reduction...`,
      ...prev
    ]);

    api.post('/notifications', {
      title: `${machine.name} Cooling Activated`,
      message: `Operator manually toggled cooling systems ON. Spindle temperature stabilizing.`,
      type: 'INFO'
    }).catch(err => console.error(err));
  };

  const handleRpmChange = (e) => {
    const newRpm = Number(e.target.value);
    setMotorRpm(newRpm);
    const time = new Date().toLocaleTimeString();
    setPlcLogs(prev => [
      `[${time}] PLC CMD: SET_MOTOR_SPEED = ${newRpm} RPM`,
      `[${time}] PLC STATUS: Frequency inverter locked at ${newRpm} RPM`,
      ...prev
    ]);
  };

  const handleEmergencyHalt = async () => {
    const time = new Date().toLocaleTimeString();
    
    if (!hasRole(['ROLE_ADMIN', 'ROLE_PRODUCTION_MANAGER'])) {
      setPlcLogs(prev => [
        `[${time}] [SECURITY ERROR] ACCESS DENIED: Operator does not possess PLC write authorization.`,
        ...prev
      ]);
      alert("Access Denied: You do not possess PLC write credentials to perform E-STOPS.");
      return;
    }

    setIsEmergencyHalt(true);
    setMotorRpm(0);
    setPlcLogs(prev => [
      `[${time}] !!! EMERGENCY HALT TRIGGERED !!!`,
      `[${time}] PLC CMD: STOP_ALL_MOTORS = TRUE`,
      `[${time}] PLC STATUS: Dynamic braking active. Rotation: 0 RPM.`,
      ...prev
    ]);

    try {
      await api.put(`/machines/${id}`, {
        name: machine.name,
        serialNumber: machine.serialNumber,
        model: machine.model,
        location: machine.location,
        status: 'FAILED',
        imageUrl: machine.imageUrl
      });
      const macRes = await api.get(`/machines/${id}`);
      setMachine(macRes.data);

      await api.post('/notifications', {
        title: `EMERGENCY STOP: ${machine.name}`,
        message: `Operator triggered manual E-STOP control panel. Machine status updated to FAILED. Emergency investigation required.`,
        type: 'CRITICAL'
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Chart configuration
  const telData = {
    labels: telemetry.map(t => new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })),
    datasets: [
      {
        label: 'Temp (°C)',
        data: telemetry.map(t => t.temperature),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Vibration (mm/s)',
        data: telemetry.map(t => t.vibration),
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.3,
      },
      {
        label: 'Pressure (bar)',
        data: telemetry.map(t => t.pressure),
        borderColor: '#06B6D4',
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        tension: 0.3,
      }
    ]
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Metadata & Telemetry */}
      <div className="lg:col-span-2 space-y-8">
        {/* Machine Profile Metadata */}
        <div className="glass-card p-6 flex flex-col md:flex-row gap-6">
          <div className="w-32 h-32 bg-dark-border rounded-xl flex items-center justify-center text-dark-muted overflow-hidden flex-shrink-0">
            {machine.imageUrl ? (
              <img src={machine.imageUrl} alt={machine.name} className="w-full h-full object-cover" />
            ) : (
              <Cpu className="w-14 h-14" />
            )}
          </div>
          <div className="space-y-2 flex-grow">
            <div className="flex items-center gap-3 justify-between">
              <h3 className="text-xl font-bold text-dark-text">{machine.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                machine.status === 'ACTIVE' ? 'bg-accent-green/10 text-accent-green border border-accent-green/20' :
                machine.status === 'UNDER_MAINTENANCE' ? 'bg-accent-amber/10 text-accent-amber border border-accent-amber/20' : 'bg-accent-red/10 text-accent-red border border-accent-red/20'
              }`}>
                {machine.status}
              </span>
            </div>
            <p className="text-sm text-dark-muted">Serial Number: <strong>{machine.serialNumber}</strong></p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-sm text-dark-muted">
              <div>Model: <strong>{machine.model}</strong></div>
              <div>Sector: <strong>{machine.location}</strong></div>
            </div>
          </div>
        </div>

        {/* Telemetry charts */}
        <div className="glass-card p-6">
          <h4 className="text-base font-bold mb-4 text-dark-text flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-cyan" />
            Real-Time Telemetry Graph
          </h4>
          <div className="h-64">
            <Line 
              data={telData}
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

        {/* Digital Twin SCADA Control Console */}
        <div className="glass-card p-6">
          <h4 className="text-base font-bold mb-4 text-dark-text flex items-center gap-2">
            <Cpu className="w-5 h-5 text-accent-cyan" />
            Digital Twin SCADA Control Panel
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Control Knobs */}
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-[#0E1524] border border-dark-border/40 p-4 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-dark-text block">Active Cooling Fan</span>
                  <span className="text-[10px] text-dark-muted block mt-0.5">Toggle auxiliary thermal mitigation fan</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleCooling}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isCoolingOn ? 'bg-accent-green' : 'bg-dark-border'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      isCoolingOn ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="bg-[#0E1524] border border-dark-border/40 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-dark-text">Motor Speed Control</span>
                  <span className="font-mono text-accent-cyan font-bold">{motorRpm} RPM</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={motorRpm}
                  disabled={isEmergencyHalt}
                  onChange={handleRpmChange}
                  className="w-full accent-accent-cyan cursor-pointer disabled:opacity-50"
                />
                <span className="text-[10px] text-dark-muted block">Direct frequency inverter speed adjust</span>
              </div>

              <button
                type="button"
                onClick={handleEmergencyHalt}
                disabled={isEmergencyHalt}
                className="w-full flex items-center justify-center gap-2 py-3 bg-accent-red hover:bg-accent-red-dark text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg glow-cyan disabled:opacity-50 disabled:cursor-not-allowed border border-accent-red/40"
              >
                <AlertTriangle className="w-4 h-4 animate-bounce" />
                Trigger Emergency Halt (E-Stop)
              </button>
            </div>

            {/* Terminal Command Output logs */}
            <div className="bg-[#0E1524] rounded-xl border border-dark-border/60 p-4 flex flex-col justify-between h-48">
              <span className="text-[10px] font-bold text-dark-muted uppercase tracking-widest block mb-2 border-b border-dark-border pb-1">
                PLC Controller Communication Logs
              </span>
              <div className="flex-grow overflow-y-auto font-mono text-[10px] text-accent-green space-y-1.5 scrollbar-thin pr-1">
                {plcLogs.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">{log}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance History */}
        <div className="glass-card p-6">
          <h4 className="text-base font-bold mb-4 text-dark-text flex items-center gap-2">
            <Wrench className="w-5 h-5 text-primary" />
            Historical Maintenance Ledger
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-dark-border text-dark-muted text-xs uppercase">
                  <th className="py-3 font-semibold">Technician</th>
                  <th className="py-3 font-semibold">Action Performed</th>
                  <th className="py-3 font-semibold">Downtime</th>
                  <th className="py-3 font-semibold">Cost</th>
                  <th className="py-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-dark-border/20 transition-colors">
                    <td className="py-3 font-medium text-dark-text">{h.performedByUsername || 'System'}</td>
                    <td className="py-3 text-dark-muted">{h.actionTaken}</td>
                    <td className="py-3 text-dark-muted">{h.downtimeHours}h</td>
                    <td className="py-3 text-dark-muted">${h.cost}</td>
                    <td className="py-3 text-dark-muted text-right">{new Date(h.performedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-dark-muted text-xs">
                      No repair history on record for this machine.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: AI Co-Pilot Panel */}
      <div className="glass-card p-6 flex flex-col h-[700px] justify-between border-primary/20 glow-violet">
        {/* Header */}
        <div className="border-b border-dark-border pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-accent-violet" />
            <h4 className="text-base font-bold text-dark-text">AI Co-Pilot Console</h4>
          </div>
          <button
            onClick={handleTriggerDiagnosis}
            disabled={aiLoading}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Run Scan
          </button>
        </div>

        {/* Chat log & reasoning paths */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {aiLogs.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center text-xs text-dark-muted px-4 space-y-2">
              <BrainCircuit className="w-12 h-12 text-dark-border animate-bounce" />
              <span>No active diagnoses. Click "Run Scan" to orchestrate autonomous maintenance checks.</span>
            </div>
          )}

          {aiLogs.map((log, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg text-sm max-w-[85%] ${
                log.role === 'USER'
                  ? 'bg-primary/10 text-dark-text border border-primary/20 ml-auto'
                  : log.role === 'SYSTEM'
                  ? 'bg-accent-red/10 text-accent-red border border-accent-red/20 mx-auto'
                  : 'bg-dark-border/40 text-dark-text mr-auto'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider text-dark-muted block mb-1">
                {log.role}
              </span>
              <p className="whitespace-pre-line leading-relaxed">{log.content}</p>
            </div>
          ))}

          {/* Supervisor Reasoning Logs overlay */}
          {reasoning.length > 0 && (
            <div className="p-3 bg-dark-bg/80 border border-dark-border rounded-lg text-xs space-y-1.5">
              <span className="font-bold text-accent-cyan flex items-center gap-1.5 mb-2">
                <Clock className="w-4 h-4" />
                Supervisor Agent Logs (Trace)
              </span>
              {reasoning.map((step, idx) => (
                <div key={idx} className="flex gap-2 text-dark-muted">
                  <span className="text-primary font-bold">✓</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}

          {aiLoading && (
            <div className="flex items-center gap-2 text-xs text-dark-muted pl-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <span>Supervisor coordinating sub-agents...</span>
            </div>
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendChat} className="border-t border-dark-border pt-4 flex gap-2">
          <input
            type="text"
            value={chatPrompt}
            onChange={(e) => setChatPrompt(e.target.value)}
            disabled={aiLoading}
            placeholder="Ask AI Co-Pilot (e.g. bearing wear SOP)..."
            className="flex-1 bg-dark-bg/60 border border-dark-border rounded-lg px-4 py-2 text-xs text-dark-text focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={aiLoading || !chatPrompt.trim()}
            className="p-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MachineDetails;

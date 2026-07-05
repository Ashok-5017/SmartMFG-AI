import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Bell, AlertTriangle, AlertCircle, Info, Check, CheckSquare, BrainCircuit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [alerts, setAlerts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/notifications');
      setAlerts(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.post(`/notifications/${id}/read`);
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoDiagnose = (alertTitle, alertMessage) => {
    // Generate diagnostic prompt
    const promptText = `Analyze telemetry anomaly: "${alertTitle}". Details: "${alertMessage}". Check cause and required spare parts.`;
    localStorage.setItem('copilot_autofill_prompt', promptText);
    navigate('/ai-insights');
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'CRITICAL': return <AlertCircle className="w-5 h-5 text-accent-red animate-pulse" />;
      case 'ALERT': return <AlertTriangle className="w-5 h-5 text-accent-amber" />;
      case 'WARNING': return <AlertTriangle className="w-5 h-5 text-accent-amber" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getAlertBorder = (type, read) => {
    if (read) return 'border-dark-border opacity-60';
    switch (type) {
      case 'CRITICAL': return 'border-accent-red/30 bg-accent-red/5 glow-cyan';
      case 'ALERT': return 'border-accent-amber/30 bg-accent-amber/5';
      case 'WARNING': return 'border-accent-amber/30 bg-accent-amber/5';
      default: return 'border-primary/20 bg-primary/5';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header operations */}
      <div className="flex justify-between items-center">
        <h3 className="text-base text-dark-muted">Alarm log records for manufacturing sectors</h3>
        {alerts.some(a => !a.read) && (
          <button
            onClick={handleMarkAllRead}
            className="flex items-center gap-1.5 px-4 py-2 border border-dark-border hover:bg-dark-border/40 rounded-lg text-xs font-semibold transition-colors"
          >
            <CheckSquare className="w-4 h-4" />
            Mark All Read
          </button>
        )}
      </div>

      {/* Alarm rows */}
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${getAlertBorder(alert.type, alert.read)}`}
          >
            <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
            <div className="flex-1 space-y-1">
              <div className="flex justify-between items-start gap-4">
                <h4 className="text-sm font-bold text-dark-text">{alert.title}</h4>
                <span className="text-[10px] text-dark-muted">
                  {new Date(alert.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-dark-muted leading-relaxed">{alert.message}</p>
            </div>
            
            <div className="flex items-center gap-2 self-center">
              {/* Diagnose button for anomalies */}
              {!alert.read && (alert.type === 'CRITICAL' || alert.type === 'ALERT' || alert.type === 'WARNING') && (
                <button
                  onClick={() => handleAutoDiagnose(alert.title, alert.message)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-accent-violet/10 hover:bg-accent-violet border border-accent-violet/20 hover:border-accent-violet text-accent-violet hover:text-white rounded text-[10px] font-bold transition-all shadow-sm"
                  title="Run AI Co-Pilot Diagnostics"
                >
                  <BrainCircuit className="w-3.5 h-3.5" />
                  AI Diagnose
                </button>
              )}

              {!alert.read && (
                <button
                  onClick={() => handleMarkAsRead(alert.id)}
                  className="p-1 text-dark-muted hover:text-dark-text hover:bg-dark-border/40 rounded transition-colors"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4 text-accent-green" />
                </button>
              )}
            </div>
          </div>
        ))}

        {alerts.length === 0 && (
          <div className="py-16 text-center text-dark-muted text-sm border-2 border-dashed border-dark-border rounded-2xl">
            No notification alerts on file.
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;

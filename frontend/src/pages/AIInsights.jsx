import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/api';
import { 
  BrainCircuit, 
  Send, 
  Terminal, 
  Clock, 
  Cpu, 
  Database,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

const AIInsights = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]); // execution log audits
  const [chat, setChat] = useState([
    { role: 'ASSISTANT', content: 'Greetings. I am the Supervisor Agent. I coordinate monitoring, predictive analysis, and inventory check sub-agents. Ask me a diagnostic question or request a machinery scan.' }
  ]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchLogs();
    
    // Check if there is an incoming redirect from notifications
    const autofillPrompt = localStorage.getItem('copilot_autofill_prompt');
    if (autofillPrompt) {
      localStorage.removeItem('copilot_autofill_prompt');
      triggerAutoDiagnose(autofillPrompt);
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat]);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/ai/logs');
      setLogs(response.data);
    } catch (e) {
      console.error(e);
    }
  };

  const triggerAutoDiagnose = async (queryText) => {
    setLoading(true);
    setChat(prev => [...prev, { role: 'USER', content: queryText }]);
    try {
      const response = await api.post('/ai/diagnose', {
        prompt: queryText
      });
      const { recommendation } = response.data;
      setChat(prev => [...prev, { role: 'ASSISTANT', content: recommendation }]);
      fetchLogs();
    } catch (err) {
      setChat(prev => [...prev, { role: 'SYSTEM', content: 'Execution error: ' + (err.message || 'Server timeout.') }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userText = prompt;
    setPrompt('');
    await triggerAutoDiagnose(userText);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT: Central Chat Console */}
      <div className="lg:col-span-2 glass-card p-6 flex flex-col h-[650px] justify-between border-primary/20 glow-violet">
        <div className="border-b border-dark-border pb-4 flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-accent-violet" />
          <h4 className="text-base font-bold text-dark-text">Supervisor Agent Chat Terminal</h4>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
          {chat.map((msg, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg text-sm max-w-[85%] ${
                msg.role === 'USER'
                  ? 'bg-primary/10 text-dark-text border border-primary/20 ml-auto'
                  : msg.role === 'SYSTEM'
                  ? 'bg-accent-red/10 text-accent-red border border-accent-red/20 mx-auto'
                  : 'bg-dark-border/40 text-dark-text mr-auto'
              }`}
            >
              <span className="text-[10px] uppercase font-semibold tracking-wider text-dark-muted block mb-1">
                {msg.role === 'USER' ? 'Operator' : 'Supervisor Agent'}
              </span>
              <p className="whitespace-pre-line leading-relaxed">{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-dark-muted pl-2">
              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <span>Supervisor coordinating sub-agents...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Send form */}
        <form onSubmit={handleSendChat} className="border-t border-dark-border pt-4 flex gap-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            placeholder="Ask Supervisor (e.g. check machine status, low spares)..."
            className="flex-1 bg-dark-bg/60 border border-dark-border rounded-lg px-4 py-2.5 text-xs text-dark-text focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="p-3 bg-primary hover:bg-primary-dark text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* RIGHT: Agent Run Logs Auditing */}
      <div className="glass-card p-6 flex flex-col h-[650px] justify-between">
        <div className="border-b border-dark-border pb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5 text-accent-cyan" />
          <h4 className="text-base font-bold text-dark-text">Orchestration Audit Trails</h4>
        </div>

        {/* Timeline list */}
        <div className="flex-grow overflow-y-auto py-4 space-y-4 pr-1">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-dark-bg/60 border border-dark-border rounded-lg text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-dark-text">{log.agentName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  log.status === 'SUCCESS' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
                }`}>
                  {log.status}
                </span>
              </div>
              <p className="text-dark-muted font-mono break-all line-clamp-2">Query: {log.request}</p>
              <div className="flex items-center justify-between text-[10px] text-dark-muted pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {log.executionTimeMs}ms
                </span>
                <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
              </div>
            </div>
          ))}

          {logs.length === 0 && (
            <div className="h-full flex items-center justify-center text-center text-xs text-dark-muted py-12">
              No audit logs on record.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;

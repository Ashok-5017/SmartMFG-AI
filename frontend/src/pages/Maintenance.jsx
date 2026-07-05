import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Wrench, Plus, CheckSquare, Clock, UserCheck, AlertTriangle, Trash } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [machines, setMachines] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // New request fields
  const [newRequest, setNewRequest] = useState({ machineId: '', title: '', description: '', priority: 'MEDIUM' });
  
  // Complete request fields
  const [completeLog, setCompleteLog] = useState({ requestId: '', machineId: '', actionTaken: '', downtimeHours: 0.0, cost: 0.00 });
  const [selectedSpareId, setSelectedSpareId] = useState('');
  const [selectedSpareQty, setSelectedSpareQty] = useState(1);
  const [usedSparesList, setUsedSparesList] = useState([]);

  const { user, hasRole } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const reqRes = await api.get('/maintenance/requests');
      setRequests(reqRes.data);

      const userRes = await api.get('/users');
      // Filter only engineers/technicians
      setUsers(userRes.data.filter(u => u.roles.includes('ROLE_MAINTENANCE_ENGINEER') || u.roles.includes('ROLE_ADMIN')));

      const macRes = await api.get('/machines');
      setMachines(macRes.data);

      const spareRes = await api.get('/inventory');
      setSpareParts(spareRes.data);
      if (spareRes.data.length > 0) {
        setSelectedSpareId(spareRes.data[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-accent-red/20 text-accent-red border-accent-red/30';
      case 'HIGH': return 'bg-accent-amber/20 text-accent-amber border-accent-amber/30';
      case 'MEDIUM': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-dark-muted/20 text-dark-muted border-dark-border';
    }
  };

  // Submit Work Request
  const handleAddRequest = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance/requests', {
        ...newRequest,
        requestedByUsername: user.username
      });
      setShowAddModal(false);
      setNewRequest({ machineId: '', title: '', description: '', priority: 'MEDIUM' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Assign to Technican
  const handleAssign = async (requestId, userId) => {
    try {
      await api.post(`/maintenance/requests/${requestId}/assign?userId=${userId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const addSparePartToUsage = () => {
    if (!selectedSpareId) return;
    const part = spareParts.find(p => p.id === Number(selectedSpareId));
    if (!part) return;

    // Check if already added
    const existing = usedSparesList.find(s => s.sparePartId === part.id);
    if (existing) {
      setUsedSparesList(prev => prev.map(s => 
        s.sparePartId === part.id 
          ? { ...s, quantityUsed: s.quantityUsed + selectedSpareQty }
          : s
      ));
    } else {
      setUsedSparesList(prev => [...prev, {
        sparePartId: part.id,
        sparePartName: part.name,
        partNumber: part.partNumber,
        quantityUsed: selectedSpareQty
      }]);
    }
    setSelectedSpareQty(1);
  };

  const removeSparePartFromUsage = (partId) => {
    setUsedSparesList(prev => prev.filter(s => s.sparePartId !== partId));
  };

  // Close out completed repair
  const handleCompleteRepair = async (e) => {
    e.preventDefault();
    try {
      await api.post('/maintenance/history', {
        machineId: completeLog.machineId,
        requestId: completeLog.requestId,
        performedById: user.id,
        actionTaken: completeLog.actionTaken,
        downtimeHours: parseFloat(completeLog.downtimeHours),
        cost: parseFloat(completeLog.cost),
        sparePartsUsed: usedSparesList
      });
      setShowCompleteModal(false);
      setCompleteLog({ requestId: '', machineId: '', actionTaken: '', downtimeHours: 0.0, cost: 0.00 });
      setUsedSparesList([]);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-base text-dark-muted">Manage operational schedules and troubleshoot tickets</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md glow-cyan"
        >
          <Plus className="w-5 h-5" />
          Create Ticket
        </button>
      </div>

      {/* Grid of Work Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {requests.map((req) => (
          <div key={req.id} className="glass-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(req.priority)}`}>
                  {req.priority}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  req.status === 'COMPLETED' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-amber/10 text-accent-amber'
                }`}>
                  {req.status}
                </span>
              </div>
              <h4 className="text-base font-bold text-dark-text">{req.title}</h4>
              <p className="text-sm text-dark-muted line-clamp-3">{req.description}</p>
              <span className="text-xs text-dark-muted block">Machine: <strong>{req.machineName}</strong></span>
            </div>

            {/* Actions Panel */}
            <div className="pt-4 border-t border-dark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-dark-muted">
                Assignee: <strong>{req.assignedToUsername || 'Unassigned'}</strong>
              </div>

              <div className="flex gap-2">
                {req.status === 'PENDING' && hasRole(['ROLE_ADMIN', 'ROLE_SUPERVISOR']) && (
                  <select
                    onChange={(e) => handleAssign(req.id, e.target.value)}
                    defaultValue=""
                    className="bg-dark-bg border border-dark-border rounded px-2.5 py-1.5 text-xs text-dark-text focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled>Assign Technician</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                )}

                {req.status !== 'COMPLETED' && (
                  <button
                    onClick={() => {
                      setCompleteLog(prev => ({ ...prev, requestId: req.id, machineId: req.machineId }));
                      setUsedSparesList([]);
                      setShowCompleteModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-green hover:bg-accent-green/80 text-white rounded text-xs font-bold transition-colors"
                  >
                    <CheckSquare className="w-4 h-4" />
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {requests.length === 0 && (
          <div className="col-span-full py-16 text-center text-dark-muted text-sm border-2 border-dashed border-dark-border rounded-2xl">
            No active maintenance requests or tickets found.
          </div>
        )}
      </div>

      {/* Add Request Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-md bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6">
            <h4 className="text-lg font-bold text-dark-text">Submit Work Request</h4>
            <form onSubmit={handleAddRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">Target Machine</label>
                <select
                  required
                  value={newRequest.machineId}
                  onChange={(e) => setNewRequest({ ...newRequest, machineId: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="" disabled>Select Equipment...</option>
                  {machines.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary"
                  placeholder="e.g., Temperature spike adjustment"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">Description</label>
                <textarea
                  required
                  rows="3"
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary"
                  placeholder="Describe the failure or routine task..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">Priority Scale</label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({ ...newRequest, priority: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="LOW">Low - Routine</option>
                  <option value="MEDIUM">Medium - Normal</option>
                  <option value="HIGH">High - Urgent</option>
                  <option value="CRITICAL">Critical - Immediate Action</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-dark-border hover:bg-dark-border/40 text-dark-text rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Request Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-dark-bg/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg bg-dark-card border border-dark-border rounded-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
            <h4 className="text-lg font-bold text-dark-text flex items-center gap-2">
              <CheckSquare className="w-6 h-6 text-accent-green" />
              Log Repair Completion
            </h4>
            <form onSubmit={handleCompleteRepair} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-dark-muted mb-1">Actions Taken</label>
                <textarea
                  required
                  rows="2"
                  value={completeLog.actionTaken}
                  onChange={(e) => setCompleteLog({ ...completeLog, actionTaken: e.target.value })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary"
                  placeholder="Describe repair specifics (e.g. replaced rollers, greased spindle)..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Downtime (Hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={completeLog.downtimeHours}
                    onChange={(e) => setCompleteLog({ ...completeLog, downtimeHours: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-dark-muted mb-1">Downtime Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={completeLog.cost}
                    onChange={(e) => setCompleteLog({ ...completeLog, cost: e.target.value })}
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none"
                  />
                </div>
              </div>

              {/* Spare Parts Consumed Section */}
              <div className="border-t border-dark-border pt-4 space-y-3">
                <label className="block text-xs font-semibold text-dark-text uppercase tracking-wide">Consume Spare Parts</label>
                
                <div className="flex gap-2 items-center">
                  <select
                    value={selectedSpareId}
                    onChange={(e) => setSelectedSpareId(e.target.value)}
                    className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-xs text-dark-text focus:outline-none cursor-pointer"
                  >
                    {spareParts.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.stockQuantity} in stock)</option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={selectedSpareQty}
                    onChange={(e) => setSelectedSpareQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 bg-dark-bg border border-dark-border rounded-lg px-2 py-2 text-xs text-dark-text text-center focus:outline-none"
                  />

                  <button
                    type="button"
                    onClick={addSparePartToUsage}
                    className="px-3 py-2 bg-[#161D30] hover:bg-primary text-xs font-bold rounded-lg border border-dark-border hover:border-primary text-dark-text hover:text-white transition-colors"
                  >
                    Add Part
                  </button>
                </div>

                {/* Used spares list */}
                {usedSparesList.length > 0 && (
                  <div className="bg-[#0E1524] rounded-lg border border-dark-border overflow-hidden text-xs">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-dark-border bg-dark-card/40 text-dark-muted uppercase text-[10px]">
                          <th className="px-3 py-2">Part Name</th>
                          <th className="px-3 py-2">Qty</th>
                          <th className="px-3 py-2 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-border">
                        {usedSparesList.map(item => (
                          <tr key={item.sparePartId} className="hover:bg-dark-border/25">
                            <td className="px-3 py-2 font-medium text-dark-text">{item.sparePartName}</td>
                            <td className="px-3 py-2 font-bold text-accent-cyan">{item.quantityUsed}</td>
                            <td className="px-3 py-2 text-right">
                              <button
                                type="button"
                                onClick={() => removeSparePartFromUsage(item.sparePartId)}
                                className="p-1 text-accent-red hover:bg-accent-red/10 rounded transition-colors"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 border border-dark-border hover:bg-dark-border/40 text-dark-text rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent-green hover:bg-accent-green/80 text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Complete & Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Maintenance;

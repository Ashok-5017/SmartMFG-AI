import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { Cpu, Search, PlusCircle, MapPin, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Machines = () => {
  const [machines, setMachines] = useState([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  useEffect(() => {
    const fetchMachines = async () => {
      try {
        const response = await api.get('/machines');
        setMachines(response.data);
      } catch (e) {
        console.error("Failed to load machines", e);
      }
    };
    fetchMachines();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-accent-green/10 text-accent-green border-accent-green/20';
      case 'UNDER_MAINTENANCE': return 'bg-accent-amber/10 text-accent-amber border-accent-amber/20';
      case 'FAILED': return 'bg-accent-red/10 text-accent-red border-accent-red/20';
      default: return 'bg-dark-muted/10 text-dark-muted border-dark-border';
    }
  };

  const filteredMachines = machines.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                          m.serialNumber.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || m.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search & Actions Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-dark-muted">
              <Search className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by machine name or serial..."
              className="w-full bg-dark-card border border-dark-border rounded-lg pl-10 pr-4 py-2.5 text-sm text-dark-text focus:outline-none focus:border-primary transition-colors"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-dark-card border border-dark-border rounded-lg px-4 py-2.5 text-sm text-dark-text focus:outline-none focus:border-primary transition-colors"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="UNDER_MAINTENANCE">In Maintenance</option>
            <option value="FAILED">Offline</option>
          </select>
        </div>

        {hasRole(['ROLE_ADMIN']) && (
          <button className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold transition-colors duration-200 shadow-md glow-cyan">
            <PlusCircle className="w-5 h-5" />
            Add Machine
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredMachines.map((machine) => (
          <div
            key={machine.id}
            onClick={() => navigate(`/machines/${machine.id}`)}
            className="glass-card overflow-hidden cursor-pointer flex flex-col justify-between"
          >
            {/* Header image / fallback */}
            <div className="h-44 bg-dark-border relative overflow-hidden flex items-center justify-center">
              {machine.imageUrl ? (
                <img
                  src={machine.imageUrl}
                  alt={machine.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Cpu className="w-16 h-16 text-dark-muted" />
              )}
              {/* Status flag overlay */}
              <span className={`absolute top-4 right-4 px-3 py-1 text-xs font-bold border rounded-full ${getStatusColor(machine.status)}`}>
                {machine.status.replace('_', ' ')}
              </span>
            </div>

            {/* Description Body */}
            <div className="p-6 space-y-4 flex-grow">
              <div>
                <h4 className="text-base font-bold text-dark-text truncate">{machine.name}</h4>
                <span className="text-xs text-dark-muted mt-1 block">S/N: {machine.serialNumber}</span>
              </div>

              <div className="space-y-2 text-sm text-dark-muted">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Model: {machine.model}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent-cyan" />
                  <span>{machine.location}</span>
                </div>
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 bg-dark-bg/40 border-t border-dark-border text-center text-xs font-semibold text-primary hover:underline">
              Open Telemetry Streams & AI Diagnostics →
            </div>
          </div>
        ))}

        {filteredMachines.length === 0 && (
          <div className="col-span-full py-16 text-center text-dark-muted text-sm border-2 border-dashed border-dark-border rounded-2xl">
            No machinery assets found matching filters.
          </div>
        )}
      </div>
    </div>
  );
};

export default Machines;

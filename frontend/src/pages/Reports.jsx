import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FileText, Download, Play, CheckCircle, FileSpreadsheet } from 'lucide-react';

const Reports = () => {
  const [compiling, setCompiling] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [machines, setMachines] = useState([]);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [reports, setReports] = useState([
    { id: 1, title: 'Daily Machine Health Summary', type: 'DAILY', date: '2026-07-04', url: '#' },
    { id: 2, title: 'Weekly OEE Efficiency Report', type: 'WEEKLY', date: '2026-06-29', url: '#' },
    { id: 3, title: 'Monthly Downtime & Spares Expense', type: 'MONTHLY', date: '2026-06-01', url: '#' }
  ]);
  const [newReport, setNewReport] = useState({ title: '', type: 'DAILY' });

  useEffect(() => {
    const loadMachines = async () => {
      try {
        const res = await api.get('/machines');
        setMachines(res.data);
        if (res.data.length > 0) {
          setSelectedMachineId(res.data[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load machines for reports", err);
      }
    };
    loadMachines();
  }, []);

  const handleCompile = (e) => {
    e.preventDefault();
    if (!newReport.title.trim()) return;

    setCompiling(true);
    setTimeout(() => {
      setReports(prev => [
        {
          id: Date.now(),
          title: newReport.title,
          type: newReport.type,
          date: new Date().toISOString().split('T')[0],
          url: '#'
        },
        ...prev
      ]);
      setNewReport({ title: '', type: 'DAILY' });
      setCompiling(false);
    }, 2500);
  };

  const handleExportCsv = async (e) => {
    e.preventDefault();
    if (!selectedMachineId) return;

    setExporting(true);
    try {
      const machId = Number(selectedMachineId);
      const machine = machines.find(m => m.id === machId);
      const response = await api.get(`/machines/${machId}/telemetry?limit=50`);
      const data = response.data;

      if (data.length === 0) {
        alert(`No telemetry readings available for ${machine ? machine.name : 'selected machine'}.`);
        setExporting(false);
        return;
      }

      // Compile CSV contents
      const headers = ["Timestamp", "Temperature_C", "Vibration_mms", "Pressure_bar", "RPM", "Voltage_V", "Current_A", "Humidity_Pct", "Running_Hours"];
      const csvRows = [headers.join(",")];

      data.forEach(item => {
        csvRows.push([
          new Date(item.timestamp).toISOString(),
          item.temperature.toFixed(2),
          item.vibration.toFixed(2),
          item.pressure.toFixed(2),
          item.rpm.toFixed(0),
          item.voltage.toFixed(2),
          item.current.toFixed(2),
          item.humidity.toFixed(2),
          item.runningHours.toFixed(1)
        ].join(","));
      });

      const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      const machineNameClean = machine ? machine.name.split(' (')[0].replace(/\s+/g, '_') : 'machine';
      
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `telemetry_export_${machineNameClean}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Export telemetry database log failed", err);
      alert("Failed to export telemetry spreadsheet.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Compiler Form */}
      <div className="space-y-6">
        <div className="glass-card p-6 h-fit space-y-4">
          <h4 className="text-base font-bold text-dark-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Request Report Compilation
          </h4>

          <form onSubmit={handleCompile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">Report Title</label>
              <input
                type="text"
                required
                value={newReport.title}
                onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                placeholder="e.g. CNC Spindle Maintenance Log"
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">Scope</label>
              <select
                value={newReport.type}
                onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="DAILY">Daily Summary</option>
                <option value="WEEKLY">Weekly Trends</option>
                <option value="MONTHLY">Monthly Audit</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={compiling}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors shadow-md"
            >
              <Play className="w-4 h-4" />
              {compiling ? 'Compiling Report...' : 'Compile Document'}
            </button>
          </form>
        </div>

        {/* Live Telemetry Direct Exporter Widget */}
        <div className="glass-card p-6 h-fit space-y-4">
          <h4 className="text-base font-bold text-dark-text flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-accent-cyan" />
            CSV Telemetry Exporter
          </h4>
          <p className="text-xs text-dark-muted leading-relaxed">
            Extract up to 50 raw telemetry log sequences directly from MySQL as an importable spreadsheet.
          </p>

          <form onSubmit={handleExportCsv} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-dark-muted mb-1">Select Machine</label>
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-primary cursor-pointer"
              >
                {machines.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={exporting || machines.length === 0}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-accent-cyan hover:bg-accent-cyan/90 text-dark-bg rounded-lg text-sm font-bold disabled:opacity-50 transition-colors shadow-md"
            >
              <Download className="w-4 h-4" />
              {exporting ? 'Extracting Data...' : 'Export Raw Data (CSV)'}
            </button>
          </form>
        </div>
      </div>

      {/* Generated Reports Ledger */}
      <div className="lg:col-span-2 glass-card p-6 space-y-4">
        <h4 className="text-base font-bold text-dark-text">Compiled Reports Ledger</h4>
        
        <div className="space-y-3">
          {reports.map((rep) => (
            <div key={rep.id} className="p-4 bg-dark-bg/40 border border-dark-border rounded-lg flex items-center justify-between hover:bg-dark-border/20 transition-colors">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-dark-text">{rep.title}</h5>
                  <div className="flex gap-4 text-xs text-dark-muted mt-1">
                    <span>Scope: <strong>{rep.type}</strong></span>
                    <span>Date: <strong>{rep.date}</strong></span>
                  </div>
                </div>
              </div>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dark-border hover:bg-dark-muted text-xs font-semibold rounded text-dark-text transition-colors">
                <Download className="w-4 h-4" />
                PDF
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;

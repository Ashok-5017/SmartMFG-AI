import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import { Bell, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);

  // Compute page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Operational Dashboard';
    if (path.startsWith('/machines')) return 'Machinery & Telemetry Streams';
    if (path === '/maintenance') return 'Maintenance Execution & Planner';
    if (path === '/inventory') return 'Spares & Inventory Levels';
    if (path === '/ai-insights') return 'AI Co-Pilot & Supervisor Agent';
    if (path === '/reports') return 'System Reports & Compilation';
    if (path === '/notifications') return 'Operational Alarms Ledger';
    return 'Smart Manufacturing Monitoring';
  };

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await api.get('/notifications');
        const unread = response.data.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (e) {
        // Fallback or ignore
      }
    };
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-dark-card border-b border-dark-border flex items-center justify-between px-8 fixed right-0 top-0 left-64 z-20">
      <h2 className="text-xl font-bold text-dark-text">{getPageTitle()}</h2>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <a href="/notifications" className="relative p-2 text-dark-muted hover:text-dark-text rounded-lg hover:bg-dark-border/40 transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent-red glow-cyan animate-pulse"></span>
          )}
        </a>
      </div>
    </header>
  );
};

export default Navbar;

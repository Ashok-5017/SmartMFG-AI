import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Cpu, 
  Wrench, 
  Warehouse, 
  BrainCircuit, 
  FileText, 
  Bell, 
  Settings, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout, hasRole } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ROLE_ADMIN', 'ROLE_MAINTENANCE_ENGINEER', 'ROLE_PRODUCTION_MANAGER', 'ROLE_OPERATOR'] },
    { name: 'Machines', path: '/machines', icon: Cpu, roles: ['ROLE_ADMIN', 'ROLE_MAINTENANCE_ENGINEER', 'ROLE_PRODUCTION_MANAGER', 'ROLE_OPERATOR'] },
    { name: 'Maintenance', path: '/maintenance', icon: Wrench, roles: ['ROLE_ADMIN', 'ROLE_MAINTENANCE_ENGINEER', 'ROLE_OPERATOR'] },
    { name: 'Inventory', path: '/inventory', icon: Warehouse, roles: ['ROLE_ADMIN', 'ROLE_INVENTORY_MANAGER', 'ROLE_MAINTENANCE_ENGINEER'] },
    { name: 'AI Co-Pilot', path: '/ai-insights', icon: BrainCircuit, roles: ['ROLE_ADMIN', 'ROLE_MAINTENANCE_ENGINEER', 'ROLE_PRODUCTION_MANAGER', 'ROLE_OPERATOR'] },
    { name: 'Reports', path: '/reports', icon: FileText, roles: ['ROLE_ADMIN', 'ROLE_PRODUCTION_MANAGER'] },
    { name: 'Notifications', path: '/notifications', icon: Bell, roles: ['ROLE_ADMIN', 'ROLE_MAINTENANCE_ENGINEER', 'ROLE_PRODUCTION_MANAGER', 'ROLE_OPERATOR'] },
  ];

  return (
    <aside className="w-64 bg-dark-card border-r border-dark-border flex flex-col h-screen fixed left-0 top-0 z-30">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-dark-border gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent-violet flex items-center justify-center glow-violet">
          <BrainCircuit className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-white to-dark-muted bg-clip-text text-transparent">SmartMFG AI</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          if (!hasRole(item.roles)) return null;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3'
                    : 'text-dark-muted hover:text-dark-text hover:bg-dark-border/40'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-dark-border">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-accent-cyan to-primary flex items-center justify-center font-bold text-white text-sm glow-cyan">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-dark-text truncate">{user?.username}</h4>
            <span className="text-xs text-dark-muted truncate block">
              {user?.roles?.[0]?.replace('ROLE_', '').replace('_', ' ')}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-accent-red hover:bg-accent-red/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

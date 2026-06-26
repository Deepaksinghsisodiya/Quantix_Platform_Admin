import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeMap: Record<string, string> = {
  '': 'Dashboard',
  'projects': 'Projects',
  'new': 'New Project',
  'tasks': 'Tasks',
  'kanban': 'Kanban',
  'users': 'Employees',
  'attendance': 'Attendance',
  'leaves': 'Leave Management',
  'shifts': 'Shifts',
  'roles': 'Roles & Permissions',
  'departments': 'Departments',
  'designations': 'Designations',
  'reports': 'Reports',
  'audit-logs': 'Audit Logs',
  'time-tracking': 'Time Tracking',
  'calendar': 'Calendar',
  'profile': 'My Profile',
};

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
      <Link to="/" className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors flex items-center gap-1">
        <Home size={14} />
      </Link>
 
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeMap[name] || name;
 
        // Skip IDs (UUIDs) or dynamic segments in the label if they are not in routeMap
        const isUuid = /^[0-9a-fA-F-]{36}$/.test(name);
        if (isUuid) return null;
 
        return (
          <React.Fragment key={routeTo}>
            <ChevronRight size={12} className="text-slate-350 dark:text-slate-700" />
            {isLast ? (
              <span className="text-gray-900 dark:text-white font-semibold tracking-tight">
                {displayName}
              </span>
            ) : (
              <Link to={routeTo} className="hover:text-accent-600 dark:hover:text-accent-400 transition-colors">
                {displayName}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

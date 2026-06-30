import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Suspense } from 'react';
import { SidebarWrapper } from './Sidebar/SidebarWrapper';
import { TopbarWrapper } from './Topbar/TopbarWrapper';
import { useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../modules/auth/slices/authSlice';
import PasswordWarningBanner from './components/PasswordWarningBanner';
// import { TimerTicker } from '../modules/time-tracking/components/TimerTicker';
// import { useActivityTracker } from '../modules/time-tracking/hooks/useActivityTracker';
import { CommandPalette } from '../shared/components/CommandPalette';
const AppShell: React.FC = () => {
  // useActivityTracker(); // Globally monitor activity
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const user = useAppSelector(selectCurrentUser);
  const location = useLocation();

  return (
    <div
      className="min-h-screen bg-zen-bg flex flex-col transition-colors duration-300"
      data-sidebar-collapsed={isCollapsed}
    >
      {/* Global Logic Components */}
      {/* <TimerTicker /> */}
      <CommandPalette />

      {/* Fixed Topbar */}
      <TopbarWrapper
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        isCollapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="flex flex-1">
        {/* Fixed Sidebar */}
        <SidebarWrapper
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          isCollapsed={isCollapsed}
          onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
        />

        {/* Main Content Area */}
        <main
          className={`
            flex-1 flex flex-col transition-all duration-300 ease-in-out mt-16 relative h-[calc(100vh-64px)] overflow-hidden bg-slate-50 dark:bg-slate-950/40
            ${isCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'}
          `}
        >
          {/* Global Ambient Glows - Shared across all dashboard pages */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-brand-300/20 to-indigo-400/5 rounded-full blur-[120px] dark:from-brand-900/10 dark:to-indigo-900/5 pointer-events-none z-0" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gradient-to-tl from-emerald-300/15 to-brand-400/5 rounded-full blur-[120px] dark:from-emerald-950/10 dark:to-brand-900/5 pointer-events-none z-0" />
          <div className="absolute top-[30%] right-[10%] w-[25%] h-[25%] bg-purple-300/10 rounded-full blur-[100px] dark:bg-purple-900/5 pointer-events-none z-0" />

          {/* Conditional Banner */}
          {!user?.isPasswordChanged && <PasswordWarningBanner />}

          <div className="flex-1 flex flex-col overflow-y-auto relative z-10">
            <Suspense fallback={
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-600/20 overflow-hidden z-[100]">
                <div className="h-full bg-accent-600 animate-[loading_1.5s_infinite_ease-in-out]" style={{ width: '30%' }}></div>
                <style>{`
                  @keyframes loading {
                    0% { transform: translateX(-100%); width: 30%; }
                    50% { width: 60%; }
                    100% { transform: translateX(400%); width: 30%; }
                  }
                `}</style>
              </div>
            }>
              <div key={location.pathname} className="animate-page-enter flex-1 flex flex-col min-h-full">
                <Outlet />
              </div>
            </Suspense>
          </div>

          {/* Portal root for constrained modals/drawers */}
          <div id="layout-portal-root" className="absolute inset-0 pointer-events-none z-[100]" />
        </main>
      </div>
    </div>
  );
};

export default AppShell;
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
      className="min-h-screen premium-mesh-bg flex flex-col transition-colors duration-300 relative overflow-hidden"
      data-sidebar-collapsed={isCollapsed}
    >
      {/* Ambient subtle grid pattern overlay */}
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-30 dark:opacity-20 z-0" />

      {/* Global Logic Components */}
      {/* <TimerTicker /> */}
      <CommandPalette />

      {/* Fixed Topbar */}
      <TopbarWrapper
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        isCollapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
      />

      <div className="flex flex-1 relative z-10">
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
            flex-1 flex flex-col transition-all duration-300 ease-in-out mt-16 relative h-[calc(100vh-64px)] overflow-hidden bg-transparent
            ${isCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[270px]'}
          `}
        >
          {/* Conditional Banner */}
          {!user?.isPasswordChanged && <PasswordWarningBanner />}

          <div
            className="flex-1 flex flex-col overflow-y-auto relative z-10 custom-scrollbar px-4 py-4 lg:px-6 lg:py-6"
          >
            <Suspense fallback={null}>
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
/**
 * MerchantShell — 2026-09-04, rebuilt on the admin AppShell 2026-09-21.
 *
 * The merchant self-service portal literally reuses the staff chrome: SidebarWrapper +
 * TopbarWrapper (the exact same fixed collapsible sidebar and topbar) fed with merchant
 * navigation and the merchant's identity. The centered header, horizontal pills and the
 * mobile bottom bar are gone; the page area is the same full-window scroll region.
 */
import React, { Suspense, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarWrapper } from '@/layout/Sidebar/SidebarWrapper';
import { TopbarWrapper } from '@/layout/Topbar/TopbarWrapper';
import { useGetSelfProfileQuery } from '@/modules/merchants/services/merchantSelfApi';
import type { MerchantSelfProfile } from '@/lib/api/merchantSelf';
import { MERCHANT_NAV, ENTERPRISE_ONLY_PATHS } from './merchantNav';
import { useAuth } from '@/modules/auth/hooks/useAuth';

const MerchantShell: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const profileQuery = useGetSelfProfileQuery();
  const merchant = (profileQuery.data?.data ?? null) as MerchantSelfProfile | null;
  const isEnterprise = merchant?.merchantType === 'Enterprise';
  const items = MERCHANT_NAV.filter((item) => !ENTERPRISE_ONLY_PATHS.has(item.path) || isEnterprise);

  const fullName =
    merchant?.displayName ||
    merchant?.contactName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.email ||
    'Merchant';
  const roleLabel = merchant
    ? merchant.merchantType === 'Enterprise'
      ? 'Enterprise Cloud'
      : 'Standalone'
    : 'Merchant';
  const avatarSrc = user?.profilePictureUrl || user?.profilePicture || user?.avatar || null;

  return (
    <div
      className="min-h-screen premium-mesh-bg flex flex-col transition-colors duration-300 relative overflow-hidden"
      data-sidebar-collapsed={isCollapsed}
    >
      {/* Ambient subtle grid pattern overlay */}
      <div className="pointer-events-none fixed inset-0 bg-grid-pattern opacity-30 dark:opacity-20 z-0" />

      {/* Fixed Topbar */}
      <TopbarWrapper
        onMenuToggle={() => setMobileOpen(!mobileOpen)}
        isCollapsed={isCollapsed}
        onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
        items={items}
        identity={{ name: fullName, role: roleLabel, avatar: avatarSrc }}
        profilePath="/merchant/profile"
        showNotificationBell={false}
      />

      <div className="flex flex-1 relative z-10">
        {/* Fixed Sidebar */}
        <SidebarWrapper
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          isCollapsed={isCollapsed}
          onCollapseToggle={() => setIsCollapsed(!isCollapsed)}
          items={items}
          badgeLabel="MERCHANT"
        />

        {/* Main Content Area */}
        <main
          className={`
            flex-1 flex flex-col transition-all duration-300 ease-in-out mt-16 relative h-[calc(100vh-64px)] overflow-hidden bg-transparent
            ${isCollapsed ? 'lg:ml-[76px]' : 'lg:ml-[270px]'}
          `}
        >
          <div className="flex-1 flex flex-col overflow-y-auto relative z-10 custom-scrollbar px-4 py-4 lg:px-6 lg:py-6">
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

export default MerchantShell;
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { toast } from 'sonner';
import { ATMAvatar } from '../../shared/ui/ATMAvatar';
import { NavGroup } from './navConfig';
import { useTheme } from '../../shared/context/ThemeContext';
import clsx from 'clsx';

interface Props {
  groups: NavGroup[];
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

/**
 * Sidebar - SaaS Minimal Edition.
 * A high-fidelity navigation system designed for clarity, depth, and enterprise scale.
 * Strictly adheres to the 'Zero Blur' and 'Slate Minimal' architecture.
 */
export const Sidebar: React.FC<Props> = ({ groups, mobileOpen, onClose, isCollapsed }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const config = useAppSelector((state) => state.settings.config);
  const { sidebarStyle } = useTheme();

  const appName = config.AppName || 'TimeForge';
  const logoUrl = config.CompanyLogo || config.AppLogo;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (location.pathname === path) return true;

    if (location.pathname.startsWith(path + '/')) {
      const allPaths = groups.flatMap((g) => g.items.map((i) => i.path));
      const hasMoreSpecificMatch = allPaths.some(
        (p) => p !== path && p.startsWith(path) && location.pathname.startsWith(p)
      );
      return !hasMoreSpecificMatch;
    }

    return false;
  };

  return (
    <>
      {/* Mobile Overlay - Zero Blur Enforcement */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/15 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 lg:z-30 lg:top-0",
          // Sidebar Style Variants
          sidebarStyle === 'dark' && 'bg-slate-900 text-slate-300 border-r border-slate-800',
          sidebarStyle === 'accent' && 'bg-accent-700 text-white/90 border-r border-accent-600',
          sidebarStyle === 'transparent' && 'bg-zen-surface/85 backdrop-blur-md border-r border-slate-100 dark:border-gray-900/60',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          isCollapsed ? 'lg:w-[70px]' : 'lg:w-[250px]'
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-6 h-16 lg:hidden border-b border-slate-50 dark:border-gray-800">
          <div className="flex items-center gap-3">
            {logoUrl ? (
              <img src={logoUrl} alt={appName} className="w-10 h-10 object-cover rounded-xl border-2 border-accent-100 dark:border-accent-500/30 shadow-sm" />
            ) : (
              <div className="w-10 h-10 bg-accent-600 rounded-xl flex items-center justify-center font-black text-white shadow-sm text-sm">
                {appName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-slate-800 dark:text-gray-100 tracking-tight">{appName}</span>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 dark:hover:bg-gray-900 rounded-xl transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Desktop Header */}
        <div className={clsx(
          "hidden lg:flex items-center border-b transition-all duration-300 shrink-0",
          sidebarStyle === 'transparent' ? 'border-slate-100 dark:border-gray-900/60' : 'border-white/10',
          isCollapsed ? 'h-16 justify-center px-2' : 'px-5 h-16 justify-start'
        )}>
          <div className="flex items-center gap-2.5 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt={appName} className="w-8 h-8 rounded-xl object-cover border border-slate-200/50 dark:border-slate-800/80 shadow-sm shrink-0" />
            ) : (
              <div className="w-8 bg-accent-600 rounded-xl aspect-square flex items-center justify-center font-black text-white shadow-sm text-xs shrink-0">
                {appName.substring(0, 2).toUpperCase()}
              </div>
            )}
            {!isCollapsed && (
              <span className={clsx(
                "font-black tracking-tight text-[0.95rem] truncate",
                sidebarStyle === 'transparent' ? 'text-slate-800 dark:text-gray-100' : 'text-white'
              )}>
                {appName}
              </span>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto pt-6 px-4 custom-scrollbar">
          <div className={clsx("flex flex-col", isCollapsed ? 'gap-6' : 'gap-8')}>
            {groups.map((group) => (
              <div key={group.label} className="space-y-2">
                {!isCollapsed && (
                  <div className="px-3 flex items-center gap-2 mb-1.5">
                    <div className={clsx("w-1 h-3 rounded-full bg-accent-500/60")} />
                    <h3 className={clsx("text-[0.68rem] font-bold uppercase tracking-[0.2em]", sidebarStyle === 'transparent' ? 'text-slate-400 dark:text-gray-500' : 'text-white/45')}>
                      {group.label}
                    </h3>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    const isRestricted = user?.isPasswordChanged === false && item.path !== '/';

                    return (
                      <NavLink
                        key={item.path}
                        to={isRestricted ? '#' : item.path}
                        onClick={(e) => {
                          if (isRestricted) {
                            e.preventDefault();
                            toast.error('Security Update Required — please complete the mandatory password update first.');
                            return;
                          }
                          window.innerWidth < 1024 && onClose();
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={clsx(
                          "group flex items-center rounded-xl transition-all duration-300 ease-out relative border border-transparent",
                          isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-2.5',
                          active
                            ? sidebarStyle === 'transparent'
                              ? 'text-accent-600 dark:text-accent-400 bg-accent-50/80 dark:bg-accent-500/10 border-accent-100/50 dark:border-accent-950/20 shadow-sm'
                              : 'text-white bg-white/15 border-white/10 shadow-sm'
                            : sidebarStyle === 'transparent'
                              ? 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50/50 dark:hover:bg-gray-900/40'
                              : 'text-white/60 hover:text-white hover:bg-white/10',
                          isRestricted && 'opacity-30 cursor-not-allowed'
                        )}
                      >
                        {/* High-Fidelity Active Indicator */}
                        {active && !isCollapsed && (
                          <div className={clsx(
                            "absolute left-0 w-1.5 h-5 rounded-r-full shadow-lg transition-transform",
                            sidebarStyle === 'transparent' ? 'bg-accent-500 shadow-accent-500/40' : 'bg-white shadow-white/30'
                          )} />
                        )}

                        <item.icon
                          size={isCollapsed ? 22 : 18}
                          strokeWidth={active ? 2.5 : 2}
                          className={clsx(
                            "shrink-0 transition-all duration-300",
                            active
                              ? sidebarStyle === 'transparent' ? 'text-accent-600 dark:text-accent-400 scale-105' : 'text-white scale-105'
                              : sidebarStyle === 'transparent' ? 'text-slate-400 group-hover:scale-110 group-hover:text-slate-700 dark:group-hover:text-gray-200' : 'text-white/50 group-hover:scale-110 group-hover:text-white'
                          )}
                        />

                        {!isCollapsed && (
                          <span className={clsx(
                            "text-[0.85rem] tracking-tight whitespace-normal break-words leading-tight transition-colors duration-300",
                            active ? 'font-semibold' : 'font-medium'
                          )}>
                            {item.label}
                          </span>
                        )}

                        {/* Hover Dot Accent */}
                        {!active && !isCollapsed && !isRestricted && (
                          <div className={clsx(
                            "ml-auto w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            sidebarStyle === 'transparent' ? 'bg-accent-500/50' : 'bg-white/50'
                          )} />
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={clsx(
          "p-4 border-t transition-all duration-300",
          sidebarStyle === 'transparent' ? 'bg-zen-surface/85 border-slate-100 dark:border-gray-900/60' : 'border-white/10'
        )}>
          <div className={clsx(
            "flex items-center gap-3 p-2 rounded-xl transition-all duration-300 border",
            isCollapsed ? 'justify-center border-transparent bg-transparent p-0' : '',
            !isCollapsed && sidebarStyle === 'transparent' && 'bg-slate-50/50 dark:bg-gray-900/30 border-slate-100/50 dark:border-gray-800/60',
            !isCollapsed && sidebarStyle !== 'transparent' && 'bg-white/10 border-white/10'
          )}>
            <ATMAvatar
              src={user?.profilePictureUrl || user?.profilePicture || user?.avatar}
              name={`${user?.firstName} ${user?.lastName}`}
              size={isCollapsed ? "xs" : "sm"}
              className="shadow-sm flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={clsx(
                  "text-[0.825rem] font-bold tracking-tight mb-1 whitespace-normal break-words",
                  sidebarStyle === 'transparent' ? 'text-slate-800 dark:text-gray-100' : 'text-white'
                )} style={{ lineHeight: '1.35' }}>
                  {user?.firstName} {user?.lastName}
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 shadow-sm shadow-emerald-500/50" />
                  <p className={clsx(
                    "text-[0.65rem] font-bold uppercase tracking-widest truncate",
                    sidebarStyle === 'transparent' ? 'text-slate-400 dark:text-gray-500' : 'text-white/50'
                  )}>
                    {user?.roleName}
                  </p>
                </div>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={() => dispatch(logout())}
                className={clsx(
                  "p-2 rounded-xl shadow-sm border border-transparent transition-all active:scale-90 flex-shrink-0 hover:scale-105",
                  sidebarStyle === 'transparent'
                    ? 'text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-gray-900 hover:border-rose-100 dark:hover:border-rose-900/30'
                    : 'text-white/40 hover:text-rose-400 hover:bg-white/10 hover:border-rose-400/30'
                )}
                title="Logout"
              >
                <LogOut size={14} strokeWidth={2.5} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { toast } from 'sonner';
import { ATMAvatar } from '../../shared/ui/ATMAvatar';
import { NavGroup, NavItem } from './navConfig';
import { useTheme } from '../../shared/context/ThemeContext';
import clsx from 'clsx';

/**
 * NOTE: navConfig.ts must extend NavItem with an optional `children?: NavItem[]` field
 * to support nested sub-menus (e.g. "Token Management" -> Generate Tokens / Batch Generate / Token Validity).
 * Example:
 *   { label: 'Token Management', path: '/tokens', icon: KeyRound, children: [
 *       { label: 'Generate Tokens', path: '/tokens/generate', icon: KeyRound },
 *       { label: 'Batch Generate', path: '/tokens/batch', icon: KeyRound },
 *       { label: 'Token Validity', path: '/tokens/validity', icon: KeyRound },
 *   ] }
 */

interface Props {
  groups: NavGroup[];
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export const Sidebar: React.FC<Props> = ({ groups, mobileOpen, onClose, isCollapsed }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const config = useAppSelector((state) => state.settings.config);
  const { sidebarStyle } = useTheme();

  const appName = config.AppName || 'Quantix Plateform';
  const logoUrl = config.CompanyLogo || config.AppLogo;

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (location.pathname === path) return true;
    if (location.pathname.startsWith(path + '/')) {
      const allPaths = groups.flatMap((g) => g.items.flatMap((i) => [i.path, ...(i.children?.map((c) => c.path) ?? [])]));
      const hasMoreSpecificMatch = allPaths.some((p) => p !== path && p.startsWith(path) && location.pathname.startsWith(p));
      return !hasMoreSpecificMatch;
    }
    return false;
  };

  const itemHasActiveChild = (item: NavItem): boolean =>
    isActive(item.path) || !!item.children?.some((c) => isActive(c.path));

  // ---- Group accordion state ----
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((group) => {
      initial[group.label] = group.items.some((item) => itemHasActiveChild(item));
    });
    return initial;
  });

  // ---- Nested item (sub-menu) expand state ----
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    groups.forEach((group) =>
      group.items.forEach((item) => {
        if (item.children?.length) initial[item.path] = item.children.some((c) => isActive(c.path));
      })
    );
    return initial;
  });

  useEffect(() => {
    setOpenGroups((prev) => {
      const next = { ...prev };
      groups.forEach((group) => {
        if (group.items.some((item) => itemHasActiveChild(item))) next[group.label] = true;
      });
      return next;
    });
    setOpenItems((prev) => {
      const next = { ...prev };
      groups.forEach((group) =>
        group.items.forEach((item) => {
          if (item.children?.some((c) => isActive(c.path))) next[item.path] = true;
        })
      );
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  const toggleItem = (path: string) => setOpenItems((prev) => ({ ...prev, [path]: !prev[path] }));

  const isDarkVariant = sidebarStyle === 'dark' || sidebarStyle === 'accent';
  const isRestrictedFor = (path: string) => user?.isPasswordChanged === false && path !== '/';

  const handleNavClick = (e: React.MouseEvent, path: string) => {
    if (isRestrictedFor(path)) {
      e.preventDefault();
      toast.error('Security Update Required — please complete the mandatory password update first.');
      return;
    }
    window.innerWidth < 1024 && onClose();
  };

  /** A leaf or parent nav link row, styled to match the Token Management reference design. */
  const renderLink = (
    item: NavItem,
    opts: { nested?: boolean; hasChildren?: boolean; expanded?: boolean; onToggle?: () => void } = {}
  ) => {
    const { nested, hasChildren, expanded, onToggle } = opts;
    const active = isActive(item.path);
    const restricted = isRestrictedFor(item.path);
    const showActivePill = active && nested; // selected sub-item gets the white-bordered pill look

    const content = (
      <>
        {/* Active rail indicator for top-level (non-nested, non-pill) items */}
        {active && !isCollapsed && !nested && (
          <span className={clsx(
            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full",
            sidebarStyle === 'transparent' ? 'bg-accent-500' : 'bg-white'
          )} />
        )}

        <item.icon
          size={isCollapsed ? 20 : nested ? 15 : 17}
          strokeWidth={active ? 2.4 : 2}
          className={clsx(
            "shrink-0 transition-transform duration-200 group-hover/item:scale-105",
            active
              ? sidebarStyle === 'transparent' ? 'text-accent-600 dark:text-accent-400' : 'text-white'
              : sidebarStyle === 'transparent' ? 'text-slate-400 group-hover/item:text-slate-700 dark:group-hover/item:text-gray-200' : 'text-white/45 group-hover/item:text-white'
          )}
        />

        {!isCollapsed && (
          <span className={clsx(
            "tracking-tight truncate leading-tight",
            nested ? 'text-[0.8rem]' : 'text-[0.83rem]',
            active ? 'font-semibold' : 'font-medium'
          )}>
            {item.label}
          </span>
        )}

        {!isCollapsed && hasChildren && (
          <ChevronDown
            size={13}
            strokeWidth={2.5}
            className={clsx(
              "ml-auto transition-transform duration-300 shrink-0",
              expanded ? 'rotate-0' : '-rotate-90',
              sidebarStyle === 'transparent' ? 'text-slate-400 dark:text-gray-500' : 'text-white/40'
            )}
          />
        )}

        {isCollapsed && (
          <span
            role="tooltip"
            className={clsx(
              "pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-lg z-50",
              "opacity-0 -translate-x-1 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all duration-150",
              "bg-slate-900 text-white dark:bg-gray-700"
            )}
          >
            {item.label}
          </span>
        )}
      </>
    );

    const rowClasses = clsx(
      "group/item peer relative flex items-center rounded-xl transition-all duration-200 ease-out border outline-none",
      "focus-visible:ring-2 focus-visible:ring-accent-500/50",
      isCollapsed ? 'justify-center p-2.5 mx-auto w-11 h-11' : nested ? 'gap-2.5 pl-3 pr-3 py-2 ml-2' : 'gap-3 pl-4 pr-3 py-2.5',
      showActivePill
        ? 'border-white/25 bg-white/[0.06] text-white font-semibold shadow-inner'
        : active
          ? sidebarStyle === 'transparent'
            ? 'text-accent-600 dark:text-accent-400 bg-accent-50 dark:bg-accent-500/10 border-accent-100/60 dark:border-accent-950/30 shadow-sm'
            : 'text-white bg-white/15 border-white/10 shadow-sm'
          : clsx(
              'border-transparent',
              sidebarStyle === 'transparent'
                ? 'text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-gray-900/40'
                : 'text-white/55 hover:text-white hover:bg-white/10'
            ),
      restricted && 'opacity-30 cursor-not-allowed pointer-events-none'
    );

    if (hasChildren) {
      return (
        <button type="button" onClick={onToggle} className={clsx(rowClasses, 'w-full')} aria-expanded={expanded}>
          {content}
        </button>
      );
    }

    return (
      <NavLink key={item.path} to={restricted ? '#' : item.path} onClick={(e) => handleNavClick(e, item.path)} className={rowClasses}>
        {content}
      </NavLink>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[2px] lg:hidden animate-in fade-in duration-200"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-[width,transform] duration-300 ease-in-out lg:translate-x-0 lg:z-30",
          sidebarStyle === 'dark' && 'bg-slate-900 text-slate-300 border-r border-slate-800',
          sidebarStyle === 'accent' && 'bg-accent-700 text-white/90 border-r border-accent-600',
          sidebarStyle === 'transparent' && 'bg-zen-surface/95 backdrop-blur-md border-r border-slate-100 dark:border-gray-900/60',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]',
          'w-[260px]'
        )}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between px-5 h-16 lg:hidden border-b border-slate-100 dark:border-gray-800 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            {logoUrl ? (
              <img src={logoUrl} alt={appName} className="w-9 h-9 object-cover rounded-xl border border-accent-100 dark:border-accent-500/30 shadow-sm shrink-0" />
            ) : (
              <div className="w-9 h-9 bg-accent-600 rounded-xl flex items-center justify-center font-black text-white shadow-sm text-xs shrink-0">
                {appName.substring(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-slate-800 dark:text-gray-100 tracking-tight truncate">{appName}</span>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-lg transition-colors shrink-0">
            <X size={18} />
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
              <span className={clsx("font-black tracking-tight text-[0.95rem] truncate", sidebarStyle === 'transparent' ? 'text-slate-800 dark:text-gray-100' : 'text-white')}>
                {appName}
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden pt-5 px-3 custom-scrollbar">
          <div className={clsx("flex flex-col", isCollapsed ? 'gap-4' : 'gap-1')}>
            {groups.map((group) => {
              const isGroupOpen = isCollapsed ? true : !!openGroups[group.label];
              const groupHasActive = group.items.some((item) => itemHasActiveChild(item));

              return (
                <div key={group.label} className="space-y-0.5">
                  {!isCollapsed ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.label)}
                      aria-expanded={isGroupOpen}
                      className={clsx(
                        "w-full px-2.5 py-2 flex items-center justify-between gap-2 rounded-lg transition-colors duration-200",
                        sidebarStyle === 'transparent' ? 'hover:bg-slate-50 dark:hover:bg-gray-900/40' : 'hover:bg-white/5'
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className={clsx("w-1 h-3 rounded-full transition-colors", groupHasActive ? 'bg-accent-500' : 'bg-accent-500/40')} />
                        <h3 className={clsx(
                          "text-[0.66rem] font-bold uppercase tracking-[0.18em] truncate",
                          sidebarStyle === 'transparent' ? 'text-slate-400 dark:text-gray-500' : 'text-white/40'
                        )}>
                          {group.label}
                        </h3>
                      </div>
                      <ChevronDown
                        size={14}
                        strokeWidth={2.5}
                        className={clsx(
                          "transition-transform duration-300 shrink-0",
                          isGroupOpen ? 'rotate-0' : '-rotate-90',
                          sidebarStyle === 'transparent' ? 'text-slate-400 dark:text-gray-500' : 'text-white/35'
                        )}
                      />
                    </button>
                  ) : (
                    <div className="flex justify-center py-1" aria-hidden="true">
                      <div className={clsx("w-7 h-px", sidebarStyle === 'transparent' ? 'bg-slate-200 dark:bg-gray-800' : 'bg-white/10')} />
                    </div>
                  )}

                  <div className={clsx("grid transition-all duration-300 ease-in-out", isGroupOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                    <div className="overflow-hidden">
                      <div className="space-y-1 pt-0.5 pb-1">
                        {group.items.map((item) => {
                          const hasChildren = !!item.children?.length;
                          const itemExpanded = isCollapsed ? true : !!openItems[item.path];

                          return (
                            <div key={item.path}>
                              {renderLink(item, {
                                hasChildren,
                                expanded: itemExpanded,
                                onToggle: () => toggleItem(item.path),
                              })}

                              {/* Nested sub-menu (Token Management style) */}
                              {hasChildren && !isCollapsed && (
                                <div className={clsx("grid transition-all duration-300 ease-in-out", itemExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0')}>
                                  <div className="overflow-hidden">
                                    <div className={clsx(
                                      "mt-1 ml-[18px] pl-3 space-y-1 py-1 border-l",
                                      isDarkVariant ? 'border-white/10' : 'border-slate-200 dark:border-gray-800'
                                    )}>
                                      {item.children!.map((child) => (
                                        <div key={child.path}>{renderLink(child, { nested: true })}</div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Collapsed-mode: flatten children as their own tooltip icons stacked below parent */}
                              {hasChildren && isCollapsed && (
                                <div className="mt-1 space-y-1">
                                  {item.children!.map((child) => (
                                    <div key={child.path}>{renderLink(child)}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer / User card */}
        <div className={clsx(
          "p-3 border-t shrink-0 transition-all duration-300",
          sidebarStyle === 'transparent' ? 'bg-zen-surface/95 border-slate-100 dark:border-gray-900/60' : 'border-white/10'
        )}>
          <div className={clsx(
            "flex items-center gap-3 rounded-xl transition-all duration-300 border",
            isCollapsed ? 'justify-center border-transparent bg-transparent p-0' : 'p-2.5',
            !isCollapsed && sidebarStyle === 'transparent' && 'bg-slate-50 dark:bg-gray-900/30 border-slate-100 dark:border-gray-800/60',
            !isCollapsed && sidebarStyle !== 'transparent' && 'bg-white/10 border-white/10'
          )}>
            <ATMAvatar
              src={user?.profilePictureUrl || user?.profilePicture || user?.avatar}
              name={`${user?.firstName} ${user?.lastName}`}
              size={isCollapsed ? "xs" : "sm"}
              className="shadow-sm shrink-0"
            />
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className={clsx("text-[0.8rem] font-bold tracking-tight mb-0.5 truncate", sidebarStyle === 'transparent' ? 'text-slate-800 dark:text-gray-100' : 'text-white')}>
                  {user?.firstName} {user?.lastName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 shadow-sm shadow-emerald-500/50" />
                  <p className={clsx("text-[0.63rem] font-bold uppercase tracking-widest truncate", sidebarStyle === 'transparent' ? 'text-slate-400 dark:text-gray-500' : 'text-white/50')}>
                    {user?.roleName}
                  </p>
                </div>
              </div>
            )}
            {!isCollapsed && (
              <button
                onClick={() => dispatch(logout())}
                aria-label="Logout"
                title="Logout"
                className={clsx(
                  "p-2 rounded-lg shrink-0 transition-all active:scale-90",
                  sidebarStyle === 'transparent' ? 'text-slate-400 hover:text-rose-500 hover:bg-white dark:hover:bg-gray-900' : 'text-white/40 hover:text-rose-300 hover:bg-white/10'
                )}
              >
                <LogOut size={15} strokeWidth={2.3} />
              </button>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={() => dispatch(logout())}
              aria-label="Logout"
              title="Logout"
              className={clsx(
                "group/logout relative mt-2 w-11 h-11 mx-auto flex items-center justify-center rounded-lg transition-all active:scale-90",
                isDarkVariant ? 'text-white/40 hover:text-rose-300 hover:bg-white/10' : 'text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20'
              )}
            >
              <LogOut size={16} strokeWidth={2.3} />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-semibold shadow-lg bg-slate-900 text-white dark:bg-gray-700 opacity-0 -translate-x-1 group-hover/logout:opacity-100 group-hover/logout:translate-x-0 transition-all duration-150 z-50"
              >
                Logout
              </span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
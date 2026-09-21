import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, LogOut, X, AppWindow } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout, selectCurrentUser } from '../../modules/auth/slices/authSlice';
import { toast } from 'sonner';
import { ATMAvatar } from '../../shared/ui/ATMAvatar';
import { NavItem } from './navConfig';
import clsx from 'clsx';

interface Props {
  items: NavItem[];
  mobileOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
}

export const Sidebar: React.FC<Props> = ({ items, mobileOpen, onClose, isCollapsed }) => {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const config = useAppSelector((state) => state.settings.config);
  // 2026-08-08 (branding): AppName = operator's DBA name from public settings; product default "Quantix".
  const appName = config.AppName || 'Quantix';
  const logoUrl = config.CompanyLogo || config.AppLogo;

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path;
  };

  // ---- Nested item (sub-menu) expand state ----
  const [openItems, setOpenItems] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    items.forEach((item) => {
      if (item.children?.length) {
        initial[item.path] = item.children.some((c) => isActive(c.path));
      }
    });
    return initial;
  });

  useEffect(() => {
    // When navigation happens, open only the parent whose child is active.
    setOpenItems(() => {
      const next: Record<string, boolean> = {};
      items.forEach((item) => {
        if (item.children?.some((c) => isActive(c.path))) {
          next[item.path] = true;
        }
      });
      return next;
    });
  }, [location.pathname, items]);

  const toggleItem = useCallback((path: string) => {
    // Accordion behaviour: opening one parent closes all the others.
    setOpenItems((prev) => {
      const next: Record<string, boolean> = {};
      Object.keys(prev).forEach((key) => {
        next[key] = false;
      });
      next[path] = !prev[path];
      return next;
    });
  }, []);

  const isRestrictedFor = (path: string) => user?.isPasswordChanged === false && path !== '/';

  const handleNavClick = useCallback(
    (e: React.MouseEvent, path: string) => {
      if (isRestrictedFor(path)) {
        e.preventDefault();
        toast.error('Security update required — please complete the mandatory password update first.');
        return;
      }
      if (window.innerWidth < 1024) onClose();
    },
    [onClose, user?.isPasswordChanged]
  );

  const renderLink = (
    item: NavItem,
    opts: { nested?: boolean; hasChildren?: boolean; expanded?: boolean; onToggle?: () => void } = {}
  ) => {
    const { nested, hasChildren, expanded, onToggle } = opts;
    const active = isActive(item.path);
    const restricted = isRestrictedFor(item.path);
    const hasActiveChild = hasChildren && item.children?.some((c) => isActive(c.path));

    const isPillActive = active && !nested && !hasChildren;
    const isChildActive = active && nested;

    const content = (
      <>
        {isPillActive && !isCollapsed && (
          <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full bg-primary-600 dark:bg-primary-500" />
        )}
        {!nested ? (
          <item.icon
            size={isCollapsed ? 20 : 17}
            strokeWidth={isPillActive || hasActiveChild ? 2.5 : 2}
            className={clsx(
              'shrink-0 transition-all duration-300 group-hover/item:scale-105',
              isPillActive
                ? 'text-primary-600 dark:text-primary-500'
                : hasActiveChild
                  ? 'text-slate-900 dark:text-slate-200'
                  : 'text-slate-500 group-hover/item:text-slate-700 dark:text-slate-400 dark:group-hover/item:text-slate-200'
            )}
          />
        ) : (
          <div className="relative shrink-0 w-3.5 h-3.5 mr-1 flex items-center justify-center">
            {/* Horizontal branch line connecting to the parent's vertical line */}
            <span
              className={clsx(
                "absolute left-[-16px] w-[14px] h-[1.5px] transition-colors duration-200",
                isChildActive
                  ? "bg-primary-600 dark:bg-primary-500"
                  : "bg-slate-200 dark:bg-slate-700 group-hover/item:bg-slate-300 dark:group-hover/item:bg-slate-600"
              )}
            />
            {/* Elegant Inner Dot */}
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full transition-all duration-300",
                isChildActive
                  ? "bg-primary-600 dark:bg-primary-500 scale-125"
                  : "bg-slate-300 dark:bg-slate-600 group-hover/item:bg-slate-400 dark:group-hover/item:bg-slate-500"
              )}
            />
          </div>
        )}

        {!isCollapsed && (
          <span
            className={clsx(
              'truncate tracking-normal leading-normal py-0.5 transition-colors duration-200',
              nested ? 'text-xs' : 'text-[13px]',
              isPillActive || isChildActive
                ? 'font-semibold text-slate-950 dark:text-white'
                : hasActiveChild
                  ? 'font-semibold text-slate-800 dark:text-slate-200'
                  : 'text-slate-600 group-hover/item:text-slate-950 dark:text-slate-400 dark:group-hover/item:text-slate-100 font-medium'
            )}
          >
            {item.label}
          </span>
        )}

        {!isCollapsed && hasChildren && (
          <ChevronDown
            size={14}
            strokeWidth={2}
            className={clsx(
              'ml-auto shrink-0 transition-transform duration-250',
              expanded ? 'rotate-0' : '-rotate-90',
              hasActiveChild ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
            )}
          />
        )}

        {isCollapsed && (
          <span
            role="tooltip"
            className={clsx(
              'pointer-events-none absolute left-full top-1/2 z-50 ml-3.5 -translate-y-1/2 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold shadow-xl border border-[var(--zen-border)] backdrop-blur-xl',
              'translate-x-[-6px] opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100',
              'bg-white text-slate-900 dark:bg-[#13151a] dark:text-white'
            )}
          >
            {item.label}
          </span>
        )}
      </>
    );

const rowClasses = clsx(
      'group/item peer relative flex items-center rounded-lg transition-all duration-200 ease-out outline-none',
      isCollapsed
        ? 'mx-auto h-10 w-10 justify-center p-2'
        : nested
          ? 'my-1 ml-1 gap-2.5 py-2 pl-4 pr-3'
          : 'my-1 gap-2.5 py-2 pl-3.5 pr-3',
      isPillActive
          ? 'bg-primary-50/90 dark:bg-primary-500/10 border-transparent text-primary-700 dark:text-primary-400 font-bold shadow-sm'
        : isChildActive
          ? 'bg-transparent border-transparent text-primary-600 dark:text-primary-400 font-semibold'
          : 'bg-transparent border border-transparent hover:bg-slate-100/80 hover:text-slate-950 dark:hover:bg-white/[0.04] dark:hover:text-white',
      restricted && 'cursor-not-allowed opacity-30'
    );

    if (hasChildren) {
      return (
        <button type="button" onClick={onToggle} className={clsx(rowClasses, 'w-full')} aria-expanded={expanded}>
          {content}
        </button>
      );
    }

    return (
      <NavLink
        key={item.path}
        to={restricted ? '#' : item.path}
        onClick={(e) => handleNavClick(e, item.path)}
        aria-current={active ? 'page' : undefined}
        aria-disabled={restricted || undefined}
        className={rowClasses}
      >
        {content}
      </NavLink>
    );
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 animate-in fade-in bg-black/40 backdrop-blur-sm duration-300 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col transition-[width,transform] duration-300 ease-in-out lg:z-30 lg:translate-x-0',
          'border-r border-[var(--zen-border)] bg-white/90 backdrop-blur-2xl text-slate-700 shadow-sm dark:bg-[#0d0f14]/90 dark:text-slate-300',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[270px]'
        )}
      >
        {/* Mobile header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--zen-border)] px-5 dark:border-white/[0.06] lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-9 w-9 shrink-0 rounded-xl border border-slate-200/70 object-cover shadow-sm dark:border-slate-800"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-xs font-bold text-white shadow-sm">
                <AppWindow className="h-[18px] w-[18px]" />
              </div>
            )}
            <span className="truncate font-bold tracking-tight text-slate-950 dark:text-white">{appName}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="shrink-0 rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Desktop header */}
        <div
          className={clsx(
            'hidden h-16 shrink-0 items-center border-b border-[var(--zen-border)] dark:border-white/[0.06] transition-all duration-300 lg:flex',
            isCollapsed ? 'justify-center px-2' : 'justify-start px-5'
          )}
        >
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-8 w-8 shrink-0 rounded-xl border border-slate-200/70 object-cover shadow-sm dark:border-slate-800"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
                <AppWindow className="h-4 w-4" />
              </div>
            )}
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  {appName}
                </span>
                <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  ADMIN
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Primary" className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 pt-3">
        {!isCollapsed && (
          <div className="px-3 pb-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">Menu</p>
          </div>
        )}
        <div className="flex flex-col gap-0.5">{items.map((item) => {
              const hasChildren = !!item.children?.length;
              const itemExpanded = isCollapsed ? true : !!openItems[item.path];

              return (
                <div key={item.path} className="space-y-0.5">
                  {renderLink(item, {
                    hasChildren,
                    expanded: itemExpanded,
                    onToggle: () => toggleItem(item.path),
                  })}

                  {/* Nested sub-menu — expanded state */}
                  {hasChildren && !isCollapsed && (
                    <div
                      className={clsx(
                        'grid transition-all duration-300 ease-in-out',
                        itemExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-200/80 dark:border-slate-800/80 pl-2.5">
                          {item.children!.map((child) => (
                            <div key={child.path}>{renderLink(child, { nested: true })}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested sub-menu — collapsed rail */}
                  {hasChildren && isCollapsed && (
                    <div className="mt-1 space-y-0.5">
                      {item.children!.map((child) => (
                        <div key={child.path}>{renderLink(child)}</div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer / user card */}
        <div className="shrink-0 border-t border-[var(--zen-border)] dark:border-white/[0.06] p-3.5 transition-all duration-300">
          <div
            className={clsx(
              'flex items-center gap-3 rounded-2xl border transition-all duration-300',
              isCollapsed
                ? 'justify-center border-transparent bg-transparent p-0'
                : 'border-slate-200/80 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900/60 dark:to-slate-900/40 p-2.5 shadow-sm'
            )}
          >
            <div className="relative shrink-0">
              <ATMAvatar
                src={user?.profilePictureUrl || user?.profilePicture || user?.avatar}
                name={fullName}
                size={isCollapsed ? 'xs' : 'sm'}
                className="shrink-0 ring-2 ring-slate-200 dark:ring-slate-700"
              />
              <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d0f14] shadow-sm shadow-emerald-500/50" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-900 dark:text-white">
                  {fullName}
                </p>
                <p className="truncate text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {user?.roleName || 'Administrator'}
                </p>
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => dispatch(logout())}
                aria-label="Logout"
                title="Logout"
                className="shrink-0 rounded-xl p-1.5 text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-95 dark:hover:bg-red-500/10 dark:hover:text-red-400"
              >
                <LogOut size={15} strokeWidth={2.2} />
              </button>
            )}
          </div>

          {isCollapsed && (
            <button
              onClick={() => dispatch(logout())}
              aria-label="Logout"
              title="Logout"
              className="group/logout relative mx-auto mt-2 flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-90 dark:hover:bg-red-500/10 dark:hover:text-red-400"
            >
              <LogOut size={16} strokeWidth={2.2} />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-3.5 -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-xl bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-150 group-hover/logout:translate-x-0 group-hover/logout:opacity-100 dark:bg-slate-800 border border-slate-700"
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
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
  const appName = config.AppName || 'Quantix Platform';
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
    setOpenItems((prev) => {
      const next = { ...prev };
      items.forEach((item) => {
        if (item.children?.some((c) => isActive(c.path))) {
          next[item.path] = true;
        }
      });
      return next;
    });
  }, [location.pathname, items]);

  const toggleItem = useCallback((path: string) => {
    setOpenItems((prev) => ({ ...prev, [path]: !prev[path] }));
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
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r bg-primary-600 dark:bg-primary-500" />
        )}
        {isChildActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-3.5 rounded-r bg-primary-600 dark:bg-primary-400" />
        )}
        {!nested ? (
          <item.icon
            size={isCollapsed ? 20 : 18}
            strokeWidth={isPillActive || hasActiveChild ? 2.2 : 1.6}
            className={clsx(
              'shrink-0 transition-all duration-300 group-hover/item:scale-110',
              isPillActive
                ? 'text-primary-600 dark:text-primary-400'
                : hasActiveChild
                  ? 'text-slate-800 dark:text-slate-200'
                  : 'text-slate-400 group-hover/item:text-slate-700 dark:text-slate-500 dark:group-hover/item:text-slate-350'
            )}
          />
        ) : (
          <span
            className={clsx(
              'ml-1.5 mr-2.5 h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300',
              isChildActive
                ? 'scale-125 bg-primary-600 dark:bg-primary-400 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                : 'bg-slate-300 group-hover/item:bg-slate-500 dark:bg-slate-600 dark:group-hover/item:bg-slate-400'
            )}
          />
        )}

        {!isCollapsed && (
          <span
            className={clsx(
              'truncate tracking-tight leading-none transition-colors duration-200',
              nested ? 'text-[12.5px]' : 'text-sm font-semibold',
              isPillActive || isChildActive
                ? 'font-bold text-slate-950 dark:text-white'
                : hasActiveChild
                  ? 'font-bold text-slate-900 dark:text-slate-100'
                  : 'text-slate-500 group-hover/item:text-slate-800 dark:text-slate-400 dark:group-hover/item:text-slate-200'
            )}
          >
            {item.label}
          </span>
        )}

        {!isCollapsed && hasChildren && (
          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className={clsx(
              'ml-auto shrink-0 transition-transform duration-300',
              expanded ? 'rotate-0' : '-rotate-90',
              hasActiveChild ? 'text-slate-800 dark:text-slate-200' : 'text-slate-450'
            )}
          />
        )}

        {isCollapsed && (
          <span
            role="tooltip"
            className={clsx(
              'pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 whitespace-nowrap rounded-xl px-3 py-1.8 text-xs font-bold shadow-xl border border-slate-200/50 dark:border-slate-800/80',
              'translate-x-[-8px] opacity-0 transition-all duration-200 group-hover/item:translate-x-0 group-hover/item:opacity-100',
              'bg-white text-slate-900 dark:bg-slate-950 dark:text-white'
            )}
          >
            {item.label}
          </span>
        )}
      </>
    );

    const rowClasses = clsx(
      'group/item peer relative flex items-center rounded-xl border transition-all duration-200 ease-out outline-none interactive-bounce',
      isCollapsed
        ? 'mx-auto h-11 w-11 justify-center p-2.5'
        : nested
          ? 'my-0.5 ml-1 gap-3 py-2 pl-3.5 pr-3'
          : 'my-1.5 gap-3 py-2.5 pl-4 pr-3.5',
      isPillActive
        ? 'bg-slate-100 dark:bg-slate-900/80 border-transparent text-slate-950 dark:text-white font-medium'
        : isChildActive
          ? 'bg-slate-100/50 dark:bg-slate-900/40 border-transparent text-primary-600 dark:text-primary-400 font-semibold'
          : 'bg-transparent border-transparent hover:bg-slate-100/60 hover:text-slate-900 hover:translate-x-1 dark:hover:bg-slate-800/40 dark:hover:text-white',
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
          className="fixed inset-0 z-40 animate-in fade-in bg-slate-950/15 backdrop-blur-[4px] duration-300 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col transition-[width,transform] duration-300 ease-in-out lg:z-30 lg:translate-x-0',
          'border-r border-slate-200/50 bg-white/80 backdrop-blur-xl text-slate-700 shadow-sm dark:border-slate-800/60 dark:bg-black/80 dark:text-slate-350',
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full',
          isCollapsed ? 'lg:w-[76px]' : 'lg:w-[270px]'
        )}
      >
        {/* Mobile header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/50 px-5 dark:border-slate-800/60 lg:hidden">
          <div className="flex min-w-0 items-center gap-3">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-9 w-9 shrink-0 rounded-xl border border-slate-200/50 object-cover shadow-sm dark:border-slate-800/80"
              />
            ) : (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-black text-white shadow-sm dark:bg-white dark:text-slate-900">
                <AppWindow className="h-4.5 w-4.5" />
              </div>
            )}
            <span className="truncate font-black tracking-tight text-slate-950 dark:text-white">{appName}</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800/50"
          >
            <X size={18} />
          </button>
        </div>

        {/* Desktop header */}
        <div
          className={clsx(
            'hidden h-16 shrink-0 items-center border-b border-[var(--zen-border)] transition-all duration-300 lg:flex',
            isCollapsed ? 'justify-center px-2' : 'justify-start px-5'
          )}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={appName}
                className="h-8 w-8 shrink-0 rounded-lg border border-[var(--zen-border)] object-cover shadow-sm"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm border border-[var(--zen-border)]">
                <AppWindow className="h-4 w-4" />
              </div>
            )}
            {!isCollapsed && (
              <span className="truncate text-sm font-semibold tracking-tight text-slate-900 dark:text-white">
                {appName}
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Primary" className="custom-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-3 pt-5">
          <div className="flex flex-col gap-1">
            {items.map((item) => {
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
                        <div className="ml-6 mt-1 space-y-0.5 border-l border-[var(--zen-border)] pl-3">
                          {item.children!.map((child) => (
                            <div key={child.path}>{renderLink(child, { nested: true })}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nested sub-menu — collapsed rail */}
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
        </nav>

        {/* Footer / user card */}
        <div className="shrink-0 border-t border-[var(--zen-border)] bg-[var(--zen-bg)] p-3 transition-all duration-300">
          <div
            className={clsx(
              'flex items-center gap-3 rounded-lg border transition-all duration-300',
              isCollapsed ? 'justify-center border-transparent bg-transparent p-0' : 'border-[var(--zen-border)] bg-[var(--zen-surface)] p-2.5 dark:bg-zinc-950/20'
            )}
          >
            <ATMAvatar
              src={user?.profilePictureUrl || user?.profilePicture || user?.avatar}
              name={fullName}
              size={isCollapsed ? 'xs' : 'sm'}
              className="shrink-0 shadow-sm"
            />

            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="mb-0.5 truncate text-xs font-semibold tracking-tight text-slate-900 dark:text-white">
                  {fullName}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <p className="truncate text-[9px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                className="shrink-0 rounded-lg p-2 text-slate-400 transition-all hover:bg-slate-50 hover:text-red-500 active:scale-90 dark:hover:bg-slate-800"
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
              className="group/logout relative mx-auto mt-2 flex h-11 w-11 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-50 hover:text-red-500 active:scale-90 dark:hover:bg-slate-800"
            >
              <LogOut size={16} strokeWidth={2.3} />
              <span
                role="tooltip"
                className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 translate-x-[-4px] whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-semibold text-white opacity-0 shadow-lg transition-all duration-150 group-hover/logout:translate-x-0 group-hover/logout:opacity-100 dark:bg-gray-700"
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
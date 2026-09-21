import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, ChevronDown, User,
  Key, LogOut, Search, Command, Loader2, FolderKanban,
  CheckSquare, Users as UsersIcon, Navigation,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { ATMAvatar } from '../../shared/ui/ATMAvatar';
import { User as UserType } from '../../modules/auth';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { navItems, NavItem } from '../Sidebar/navConfig';
import { NotificationBell } from './NotificationBell';
import clsx from 'clsx';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: string;
  url: string;
}

interface Props {
  user: UserType | null;
  isCollapsed: boolean;
  onCollapseToggle: () => void;
  onLogout: () => void;
  onMenuToggle: () => void;
  onChangePassword: () => void;
  /** Navigation source for the ⌘K search walk. Defaults to the staff navConfig. */
  items?: NavItem[];
  /** Identity overrides (merchant portal shows the merchant, not the auth user). */
  identity?: { name?: string | null; role?: string | null; avatar?: string | null };
  /** Where the Profile menu item navigates. Default "/profile". */
  profilePath?: string;
  /** Show the notifications bell. Defaults to true; the merchant portal hides it —
      the staff notifications endpoint is not available to merchant tokens. */
  showNotificationBell?: boolean;
}

export const Topbar: React.FC<Props> = ({
  user,
  isCollapsed,
  onCollapseToggle,
  onLogout,
  onMenuToggle,
  onChangePassword,
  items: searchWalkItems,
  identity,
  profilePath = '/profile',
  showNotificationBell = true,
}) => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const triggerSearch = (query: string) => { };
  const apiResults: any[] = [];
  const isFetching = false;

  // Combine Local Navigation and API Results
  const combinedResults = useMemo(() => {
    if (!searchValue.trim() || searchValue.trim().length < 2) return [];

    const query = searchValue.toLowerCase();
    const navMatches: SearchResult[] = [];

    const walk = (items: NavItem[], parentName?: string) => {
      items.forEach((item) => {
        if (item.label.toLowerCase().includes(query)) {
          navMatches.push({
            id: item.path,
            title: item.label,
            subtitle: parentName ? `${parentName} Sub-menu` : 'Main Menu',
            type: 'Navigation',
            url: item.path,
          });
        }
        if (item.children?.length) walk(item.children, item.label);
      });
    };
    walk(searchWalkItems || navItems);

    const dataResults = apiResults || [];
    return [...navMatches, ...dataResults];
  }, [searchValue, apiResults, searchWalkItems]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape' && showResults) {
        setShowResults(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResults]);

  // Handle outside click to close results
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchValue.trim().length >= 2) {
        triggerSearch(searchValue);
        setShowResults(true);
      } else {
        setShowResults(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchValue]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Project': return <FolderKanban size={14} className="text-slate-900 dark:text-white" />;
      case 'Task': return <CheckSquare size={14} className="text-slate-900 dark:text-white" />;
      case 'User': return <UsersIcon size={14} className="text-slate-900 dark:text-white" />;
      case 'Navigation': return <Navigation size={14} className="text-slate-900 dark:text-white" />;
      default: return <Search size={14} />;
    }
  };

  const iconBtn =
    'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-500 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-400 dark:hover:bg-white/[0.06] dark:hover:text-white';

  const fullName = identity?.name || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'User';
  const roleLabel = identity?.role || user?.roleName || 'Admin';
  const identityAvatar = identity?.avatar || user?.profilePictureUrl || user?.profilePicture || user?.avatar;

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/85 dark:bg-[#0d0f14]/85 backdrop-blur-2xl border-b border-[var(--zen-border)] z-40 px-4 md:px-6 flex items-center justify-between gap-3 transition-[left] duration-300 ease-in-out left-0 ${isCollapsed ? 'lg:left-[76px]' : 'lg:left-[270px]'
        }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="p-2 -ml-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-white/[0.06] transition-all active:scale-95 lg:hidden shrink-0"
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:flex items-center gap-2.5 min-w-0">
          <button
            onClick={onCollapseToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 mr-0.5 shrink-0 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/[0.06] dark:hover:text-white transition-all active:scale-95"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronsRight size={17} strokeWidth={2.2} /> : <ChevronsLeft size={17} strokeWidth={2.2} />}
          </button>
          <span className="h-5 w-px bg-slate-200/80 dark:bg-slate-800" />
          <Breadcrumb />
        </div>
      </div>

      {/* Middle Section: Global Search */}
      <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md relative" ref={searchRef}>
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors duration-200">
            {isFetching ? <Loader2 size={15} className="animate-spin text-primary-500" /> : <Search size={15} />}
          </div>
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Global search"
            className="block w-full h-9 pl-9 pr-12 bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 focus:border-primary-500 dark:focus:border-primary-400 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-400/10 rounded-xl text-xs transition-all duration-200 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-medium"
            placeholder="Search pages, merchants, tickets... (⌘K)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => searchValue.trim().length >= 2 && setShowResults(true)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-xs font-mono">
              <Command size={10} /> K
            </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#13151a] rounded-2xl shadow-2xl border border-[var(--zen-border)] py-2.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
            <div className="px-3.5 py-1.5 border-b border-slate-100 dark:border-slate-800/60 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Quick Jump</span>
              {isFetching && <Loader2 size={12} className="animate-spin text-primary-500" />}
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-1.5">
              {combinedResults.length === 0 ? (
                <div className="py-7 text-center">
                  <p className="text-xs font-medium text-slate-400 italic">No results found for "{searchValue}"</p>
                </div>
              ) : (
                combinedResults.map((res: SearchResult) => (
                  <button
                    key={`${res.type}-${res.id}`}
                    onClick={() => {
                      navigate(res.url);
                      setShowResults(false);
                      setSearchValue('');
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-all duration-150 group text-left"
                  >
                    <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors shrink-0 text-slate-600 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-300">
                      {getIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-none">{res.title}</p>
                        <ChevronRight size={12} className="text-slate-400 group-hover:text-primary-500 transition-colors shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1">{res.subtitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-3.5 py-1.5 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/60 mt-1.5">
              <p className="text-[9px] text-slate-400 text-center tracking-wider uppercase font-semibold">Press ESC to dismiss · ↑↓ to navigate</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-1 md:gap-1.5 shrink-0">
        <ThemeToggle />

        <span className="hidden sm:block h-5 w-px bg-slate-200/80 dark:bg-slate-800 mx-0.5" />

        {showNotificationBell && <NotificationBell />}

        <span className="hidden sm:block h-5 w-px bg-slate-200/80 dark:bg-slate-800 mx-0.5" />

        {/* Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((v) => !v)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            className={clsx(
              'flex items-center gap-2.5 rounded-xl p-1 transition-all duration-200',
              profileOpen
                ? 'bg-slate-100 dark:bg-white/[0.06]'
                : 'hover:bg-slate-100 dark:hover:bg-white/[0.06]'
            )}
          >
            <div className="relative">
              <ATMAvatar
                src={identityAvatar}
                name={fullName}
                size="sm"
                className="shadow-sm flex-shrink-0"
              />
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#0d0f14] shadow-sm shadow-emerald-500/50" />
            </div>
            <div className="hidden xl:flex flex-col items-start leading-none gap-1 shrink-0 text-left">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{fullName}</span>
              <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{roleLabel}</span>
            </div>
            <ChevronDown
              size={13}
              strokeWidth={2.2}
              className={clsx(
                'text-slate-400 ml-0.5 shrink-0 transition-transform duration-200',
                profileOpen && 'rotate-180'
              )}
            />
          </button>

          {profileOpen && (
            <div
              role="menu"
              aria-label="Profile menu"
              className="absolute right-0 top-full mt-2 w-64 origin-top-right rounded-2xl bg-white dark:bg-[#13151a] shadow-2xl border border-[var(--zen-border)] overflow-hidden z-[60] animate-in fade-in zoom-in-95 duration-200"
            >
              {/* User header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40">
                <ATMAvatar
                  src={identityAvatar}
                  name={fullName}
                  size="md"
                  className="shrink-0"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{fullName}</p>
                  <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">{user?.email || roleLabel}</p>
                </div>
              </div>

              <div className="p-1.5">
                <button
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); navigate(profilePath); }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                >
                  <span className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <User size={15} />
                  </span>
                  Profile Settings
                </button>

                <button
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); onChangePassword(); }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-white/[0.05] dark:hover:text-white"
                >
                  <span className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    <Key size={15} />
                  </span>
                  Update Password
                </button>

                <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800/60" />

                <button
                  role="menuitem"
                  onClick={() => { setProfileOpen(false); onLogout(); }}
                  className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all duration-150 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                >
                  <span className="h-7 w-7 inline-flex items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    <LogOut size={15} />
                  </span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
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
import { ATMDropdown } from '../../shared/ui/ATMDropdown';
import { User as UserType } from '../../modules/auth';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
import { navItems, NavItem } from '../Sidebar/navConfig';
import { NotificationBell } from './NotificationBell';

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
}

export const Topbar: React.FC<Props> = ({
  user,
  isCollapsed,
  onCollapseToggle,
  onLogout,
  onMenuToggle,
  onChangePassword,
}) => {
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [searchValue, setSearchValue] = useState('');
  const [showResults, setShowResults] = useState(false);
  const triggerSearch = (query: string) => {};
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
    walk(navItems);

    const dataResults = apiResults || [];
    return [...navMatches, ...dataResults];
  }, [searchValue, apiResults]);

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
      case 'Navigation': return <Navigation size={14} className="text-slate-950 dark:text-white" />;
      default: return <Search size={14} />;
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/70 dark:bg-black/70 backdrop-blur-md border-b border-slate-150/80 dark:border-slate-800/60 z-40 px-4 md:px-6 flex items-center justify-between transition-[left] duration-300 ease-in-out left-0 ${
        isCollapsed ? 'lg:left-[76px]' : 'lg:left-[270px]'
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition-all lg:hidden shrink-0"
        >
          <Menu size={22} />
        </button>

        <div className="hidden lg:flex items-center gap-2.5 min-w-0">
          <button
            onClick={onCollapseToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 text-slate-400 hover:text-slate-950 hover:bg-slate-100/60 dark:hover:bg-slate-800/30 rounded-xl transition-all mr-1 shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronsRight size={18} strokeWidth={2.2} /> : <ChevronsLeft size={18} strokeWidth={2.2} />}
          </button>
          <Breadcrumb />
        </div>
      </div>

      {/* Middle Section: Global Search with premium outline wrapper */}
      <div className="hidden md:flex flex-1 max-w-sm relative" ref={searchRef}>
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-brand-500 dark:group-focus-within:text-brand-400 transition-colors duration-300">
            {isFetching ? <Loader2 size={16} className="animate-spin text-brand-500 dark:text-brand-400" /> : <Search size={16} />}
          </div>
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Global search"
            className="block w-full pl-9 pr-12 py-2 bg-slate-100/50 dark:bg-slate-900/30 border border-[var(--zen-border)] focus:border-primary-500 dark:focus:border-primary-400 focus:bg-white dark:focus:bg-zinc-950 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-400/10 rounded-lg text-xs transition-all duration-300 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
            placeholder="Search pages, merchants, tickets..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => searchValue.trim().length >= 2 && setShowResults(true)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black text-slate-400 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-md shadow-sm">
              <Command size={9} /> K
            </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--zen-surface)] dark:bg-[var(--zen-card)] rounded-xl shadow-2xl border border-[var(--zen-border)] py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-2 flex items-center justify-between">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Results</span>
              {isFetching && <Loader2 size={12} className="animate-spin text-slate-900" />}
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-2">
              {combinedResults.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs font-semibold text-slate-500 italic">No results found for "{searchValue}"</p>
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
                    className="w-full flex items-center gap-3.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-lg transition-all duration-300 group text-left border-l-2 border-transparent hover:border-primary-600 dark:hover:border-primary-400"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-850 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-900 transition-all duration-300 border border-slate-200/50 dark:border-slate-800 shrink-0">
                      {getIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[12px] font-bold text-slate-900 dark:text-white truncate leading-none">{res.title}</p>
                        <ChevronRight size={12} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0" />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-1">{res.subtitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50/30 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-800/60 mt-2">
              <p className="text-[9px] text-slate-400 text-center tracking-wider uppercase font-semibold">Press ESC to close search</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <ThemeToggle />

        <NotificationBell />

        <ATMDropdown
          trigger={
            <button className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-150/60">
              <ATMAvatar
                src={user?.profilePictureUrl || user?.profilePicture || user?.avatar}
                name={`${user?.firstName} ${user?.lastName}`}
                size="sm"
                className="shadow-sm flex-shrink-0"
              />
              <div className="hidden xl:flex flex-col items-start leading-none gap-1 shrink-0">
                <span className="text-[13px] font-bold text-slate-900 dark:text-white">{user?.firstName} {user?.lastName}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user?.roleName}</span>
                </div>
              </div>
              <ChevronDown size={14} className="text-slate-400 ml-1 shrink-0" />
            </button>
          }
          items={[
            {
              label: 'Profile Settings',
              icon: <User size={15} />,
              onClick: () => navigate('/profile'),
            },
            {
              label: 'Update Password',
              icon: <Key size={15} />,
              onClick: onChangePassword,
            },
            {
              label: 'Sign Out',
              icon: <LogOut size={15} />,
              onClick: onLogout,
              variant: 'danger',
              divider: true,
            },
          ]}
        />
      </div>
    </header>
  );
};

export default Topbar;
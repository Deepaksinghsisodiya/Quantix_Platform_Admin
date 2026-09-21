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
      className={`fixed top-0 right-0 h-16 bg-white/75 dark:bg-[#09090b]/80 backdrop-blur-2xl border-b border-zinc-200/70 dark:border-white/[0.06] z-40 px-4 md:px-6 flex items-center justify-between transition-[left] duration-300 ease-in-out left-0 ${isCollapsed ? 'lg:left-[76px]' : 'lg:left-[270px]'
        }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="p-2 -ml-2 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60 rounded-xl transition-all lg:hidden shrink-0"
        >
          <Menu size={20} />
        </button>

        <div className="hidden lg:flex items-center gap-2.5 min-w-0">
          <button
            onClick={onCollapseToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60 dark:hover:text-white rounded-xl transition-all mr-1 shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronsRight size={17} strokeWidth={2.2} /> : <ChevronsLeft size={17} strokeWidth={2.2} />}
          </button>
          <Breadcrumb />
        </div>
      </div>

      {/* Middle Section: Global Search with glass container */}
      <div className="hidden md:flex flex-1 max-w-sm relative" ref={searchRef}>
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors duration-200">
            {isFetching ? <Loader2 size={15} className="animate-spin text-blue-500" /> : <Search size={15} />}
          </div>
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Global search"
            className="block w-full pl-9 pr-12 py-2 bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 focus:border-blue-500/60 dark:focus:border-blue-400/60 focus:bg-white dark:focus:bg-zinc-900 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-xs transition-all duration-200 outline-none text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 font-medium"
            placeholder="Search pages, merchants, tickets... (⌘K)"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => searchValue.trim().length >= 2 && setShowResults(true)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md shadow-xs font-mono">
              <Command size={10} /> K
            </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-zinc-200/80 dark:border-zinc-800/80 py-2.5 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
            <div className="px-3.5 py-1.5 border-b border-zinc-100 dark:border-zinc-800/80 mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Quick Jump</span>
              {isFetching && <Loader2 size={12} className="animate-spin text-blue-500" />}
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar px-1.5">
              {combinedResults.length === 0 ? (
                <div className="py-7 text-center">
                  <p className="text-xs font-medium text-zinc-400 italic">No results found for "{searchValue}"</p>
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
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50/60 dark:hover:bg-blue-950/25 rounded-xl transition-all duration-150 group text-left border border-transparent hover:border-blue-500/20"
                  >
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors shrink-0 text-zinc-600 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-300">
                      {getIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate leading-none">{res.title}</p>
                        <ChevronRight size={12} className="text-zinc-400 group-hover:text-blue-500 transition-colors shrink-0" />
                      </div>
                      <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-1">{res.subtitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-3.5 py-1.5 bg-zinc-50/50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-800/60 mt-1.5">
              <p className="text-[9px] text-zinc-400 text-center tracking-wider uppercase font-semibold">Press ESC to dismiss</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <ThemeToggle />

        <NotificationBell />

        <ATMDropdown
          trigger={
            <button className="flex items-center gap-2.5 p-1.5 hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 rounded-xl transition-all duration-200 border border-transparent hover:border-zinc-200/60 dark:hover:border-zinc-700/60">
              <div className="relative">
                <ATMAvatar
                  src={user?.profilePictureUrl || user?.profilePicture || user?.avatar}
                  name={`${user?.firstName} ${user?.lastName}`}
                  size="sm"
                  className="shadow-sm flex-shrink-0 ring-2 ring-blue-500/20"
                />
                <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900 shadow-sm shadow-emerald-500/50" />
              </div>
              <div className="hidden xl:flex flex-col items-start leading-none gap-1 shrink-0">
                <span className="text-xs font-bold text-zinc-900 dark:text-white">{user?.firstName} {user?.lastName}</span>
                <span className="text-[9px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">{user?.roleName || 'Admin'}</span>
              </div>
              <ChevronDown size={13} className="text-zinc-400 ml-0.5 shrink-0" />
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
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu, ChevronDown, User,
  Key, LogOut, Search, Command, Loader2, FolderKanban,
  CheckSquare, Users as UsersIcon, Navigation,
  ChevronRight,
  Edit2,
  ChevronsLeft,
  ChevronsRight
} from 'lucide-react';
import { Breadcrumb } from './Breadcrumb';
import { ATMAvatar } from '../../shared/ui/ATMAvatar';
import { ATMDropdown } from '../../shared/ui/ATMDropdown';
import { User as UserType } from '../../modules/auth';
import { ThemeToggle } from '../../shared/components/ThemeToggle';
// import { useLazyGlobalSearchQuery, SearchResult } from '../../modules/search/services/searchApi';
import { navItems, NavItem } from '../Sidebar/navConfig';
// import { NotificationBell } from '../../modules/notifications/components/NotificationBell';
// import NavbarTimerStatus from '../../modules/time-tracking/components/NavbarTimerStatus';

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
  // const [triggerSearch, { data: apiResults, isFetching }] = useLazyGlobalSearchQuery();
  const triggerSearch = (query: string) => {};
  const apiResults: any[] = [];
  const isFetching = false;

  // Combine Local Navigation and API Results — recurses into nested children
  // (e.g. "Generate Tokens" under "Token Management") so nested routes are searchable too.
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

  // Keyboard shortcut Ctrl+K / Cmd+K, plus Escape to close
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
  }, [searchValue, triggerSearch]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'Project': return <FolderKanban size={14} className="text-blue-500" />;
      case 'Task': return <CheckSquare size={14} className="text-orange-500" />;
      case 'User': return <UsersIcon size={14} className="text-green-500" />;
      case 'Navigation': return <Navigation size={14} className="text-blue-500" />;
      default: return <Search size={14} />;
    }
  };

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white dark:bg-[#0f172a] border-b border-slate-100 dark:border-slate-800/80 z-40 px-4 md:px-6 flex items-center justify-between transition-[left] duration-300 ease-in-out left-0 ${
        isCollapsed ? 'lg:left-[76px]' : 'lg:left-[270px]'
      }`}
    >
      {/* Left Section */}
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onMenuToggle}
          aria-label="Open menu"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all lg:hidden shrink-0"
        >
          <Menu size={22} />
        </button>

        <div className="hidden lg:flex items-center gap-2 min-w-0">
          <button
            onClick={onCollapseToggle}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="p-1.5 text-slate-450 hover:text-blue-600 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 rounded-xl transition-all mr-1 shrink-0"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronsRight size={18} strokeWidth={2.2} /> : <ChevronsLeft size={18} strokeWidth={2.2} />}
          </button>
          <Breadcrumb />
        </div>
      </div>

      {/* Middle Section: Global Search */}
      <div className="hidden md:flex flex-1 max-w-md px-8 relative" ref={searchRef}>
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors duration-300">
            {isFetching ? <Loader2 size={18} className="animate-spin text-blue-600" /> : <Search size={18} />}
          </div>
          <input
            ref={inputRef}
            type="text"
            role="searchbox"
            aria-label="Global search"
            className="block w-full pl-10 pr-12 py-2.5 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 focus:border-blue-500 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/10 rounded-xl text-sm transition-all duration-300 outline-none text-slate-900 dark:text-gray-100 placeholder:text-slate-400 font-medium"
            placeholder="Search projects, tasks, or pages..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onFocus={() => searchValue.trim().length >= 2 && setShowResults(true)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm">
              <Command size={10} /> K
            </kbd>
          </div>
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <div className="absolute top-full left-8 right-8 mt-2 bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800/85 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-2 flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Results</span>
              {isFetching && <Loader2 size={12} className="animate-spin text-blue-600" />}
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scrollbar px-2">
              {combinedResults.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm font-medium text-slate-500 italic">No results found for "{searchValue}"</p>
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
                    className="w-full flex items-center gap-4 px-3 py-2.5 hover:bg-blue-50/50 dark:hover:bg-blue-950/15 rounded-xl transition-all duration-300 group text-left border-l-2 border-transparent hover:border-blue-600"
                  >
                    <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-900/50 flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-850 transition-all duration-300 border border-slate-100 dark:border-slate-800/60 shrink-0">
                      {getIcon(res.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[13px] font-bold text-slate-900 dark:text-slate-100 truncate leading-none">{res.title}</p>
                        <ChevronRight size={14} className="text-slate-350 group-hover:text-blue-600 transition-colors shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-1">{res.subtitle}</p>
                    </div>
                  </button>
                ))
              )}
            </div>

            <div className="px-4 py-2 bg-slate-50/30 dark:bg-gray-900/10 border-t border-slate-100 dark:border-gray-900/60 mt-2">
              <p className="text-[9px] text-gray-400 text-center tracking-wider uppercase font-medium">Press ESC to close search</p>
            </div>
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* {user?.roleName?.toLowerCase() !== 'client' && <NavbarTimerStatus />} */}

        <ThemeToggle />

        {/* <NotificationBell /> */}

        <ATMDropdown
          trigger={
            <button className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50/80 dark:hover:bg-gray-900/60 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-100/50 dark:hover:border-gray-850/50">
              <ATMAvatar
                src={user?.profilePictureUrl || user?.profilePicture || user?.avatar}
                name={`${user?.firstName} ${user?.lastName}`}
                size="sm"
                className="shadow-sm flex-shrink-0"
              />
              <div className="hidden xl:flex flex-col items-start leading-none gap-1 shrink-0">
                <span className="text-[13px] font-bold text-gray-900 dark:text-gray-100">{user?.firstName} {user?.lastName}</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                  <span className="text-[9px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{user?.roleName}</span>
                </div>
              </div>
              <ChevronDown size={14} className="text-gray-400 ml-1 shrink-0" />
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
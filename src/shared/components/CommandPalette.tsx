import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, Users, FolderKanban, CheckSquare, Calendar, FolderClosed, Clock, FileText, Settings, ShieldAlert } from 'lucide-react';
import { useAppSelector } from '../../app/hooks';
import { selectCurrentUser } from '../../modules/auth/slices/authSlice';

interface CommandItem {
  name: string;
  category: string;
  path: string;
  icon: any;
  roles?: string[];
}

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const navigate = useNavigate();
  const user = useAppSelector(selectCurrentUser);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const items: CommandItem[] = [
    { name: 'Dashboard Overview', category: 'Navigation', path: '/', icon: Home },
    { name: 'Client Register', category: 'Navigation', path: '/clients', icon: Users, roles: ['Admin', 'ProjectManager', 'HR'] },
    { name: 'Project Registry', category: 'Navigation', path: '/projects', icon: FolderKanban },
    { name: 'Task Board', category: 'Navigation', path: '/tasks', icon: CheckSquare },
    { name: 'Ticket Support Center', category: 'Navigation', path: '/tickets', icon: ShieldAlert },
    { name: 'Corporate Calendar', category: 'Navigation', path: '/calendar', icon: Calendar },
    { name: 'File Hub Vault', category: 'Navigation', path: '/file-hub', icon: FolderClosed },
    { name: 'Attendance registry', category: 'Navigation', path: '/attendance', icon: Clock },
    { name: 'Leave Application Center', category: 'Navigation', path: '/leaves', icon: FileText },
    { name: 'System Settings', category: 'Admin', path: '/settings', icon: Settings, roles: ['Admin'] },
  ];

  // Filter items based on roles & search query
  const filteredItems = items.filter((item) => {
    // Role check
    if (item.roles && user?.roleName && !item.roles.includes(user.roleName)) {
      return false;
    }
    // Search check
    return item.name.toLowerCase().includes(search.toLowerCase()) || 
           item.category.toLowerCase().includes(search.toLowerCase());
  });

  // Listen for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Reset active item on search change
  useEffect(() => {
    setActiveIndex(0);
  }, [search]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearch('');
    }
  }, [isOpen]);

  // Handle keyboard list navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[activeIndex]) {
        navigate(filteredItems[activeIndex].path);
        setIsOpen(false);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[activeIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [activeIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-start justify-center pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/45 backdrop-blur-[3px] transition-opacity duration-300" 
        onClick={() => setIsOpen(false)} 
      />

      {/* Palette Container */}
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-gray-950 rounded-2xl border border-slate-100 dark:border-gray-800/80 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onKeyDown={handleKeyDown}
      >
        {/* Search ATMTextField */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-50 dark:border-gray-800/60">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search navigation registry... (Use Up/Down + Enter)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm font-semibold text-slate-800 dark:text-gray-100 placeholder-slate-400 bg-transparent outline-none border-none py-1 focus:ring-0"
          />
          <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-0.5 rounded border border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-900 px-1.5 font-mono text-[9px] font-bold text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div 
          ref={listRef}
          className="flex-1 max-h-[300px] overflow-y-auto py-2 px-2 custom-scrollbar space-y-0.5"
        >
          {filteredItems.length === 0 ? (
            <div className="py-6 text-center text-xs font-semibold text-slate-400 italic">
              No matching records found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const active = idx === activeIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group
                    ${active ? 'bg-accent-50/60 dark:bg-accent-950/20 text-accent-700 dark:text-accent-400' : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-900/40'}
                  `}
                >
                  <Icon 
                    size={16} 
                    className={`shrink-0 ${active ? 'text-accent-600 dark:text-accent-400' : 'text-slate-400 group-hover:text-slate-500'}`} 
                  />
                  <span className={`text-xs ${active ? 'font-bold' : 'font-medium'}`}>
                    {item.name}
                  </span>
                  <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-slate-300 dark:text-gray-600 group-hover:text-slate-400">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-slate-50 dark:border-gray-800/40 bg-slate-50/50 dark:bg-gray-900/20 flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Navigate with ↑↓ keys</span>
          <span>Open with Ctrl + K / Cmd + K</span>
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;

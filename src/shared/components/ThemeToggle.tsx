import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-slate-400 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-300 active:scale-95 relative flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`absolute inset-0 transform transition-all duration-500 ${
            theme === 'dark' ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
          } text-amber-500`}
          size={20}
        />
        <Moon
          className={`absolute inset-0 transform transition-all duration-500 ${
            theme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
          } text-primary-500 dark:text-primary-400`}
          size={20}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;

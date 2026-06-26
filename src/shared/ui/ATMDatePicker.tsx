import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from 'date-fns';

interface Props {
  name: string;
  label?: string;
  value: string; // ISO date
  onChange: (date: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
}

export const ATMDatePicker: React.FC<Props> = ({
  label,
  value,
  onChange,
  error,
  helperText,
  disabled,
  required,
  placeholder = 'ATMSelect date',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const handleDateClick = (date: Date) => {
    onChange(date.toISOString());
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`} ref={containerRef}>
      {label && (
        <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] flex items-center gap-1.5 px-1 leading-none">
          {label}
          {required && <span className="text-red-500 animate-pulse text-[14px] leading-none">*</span>}
        </label>
      )}

      <div className="relative group">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between px-5 py-4 text-sm rounded-[1.25rem] border-2 transition-all duration-300 min-h-[58px]
            ${disabled ? 'bg-gray-50 dark:bg-gray-900/50 cursor-not-allowed text-gray-400 dark:text-gray-600 opacity-60' : 'bg-zen-surface text-gray-900 dark:text-gray-100'}
            ${
              error
                ? 'border-red-500/50 dark:border-red-900/50 ring-4 ring-red-500/5 dark:ring-red-900/10 shadow-sm'
                : isOpen
                ? 'border-accent-600 dark:border-accent-500 ring-4 ring-accent-600/5 dark:ring-accent-500/10 shadow-md'
                : 'border-gray-100 dark:border-gray-800/50 hover:border-accent-200 dark:hover:border-accent-800 shadow-sm'
            }
          `}
        >
          <span className={!selectedDate ? 'text-gray-300 dark:text-gray-700 font-bold' : 'font-black uppercase tracking-tight'}>
            {selectedDate ? format(selectedDate, 'dd MMM yyyy') : placeholder}
          </span>
          <CalendarIcon size={18} strokeWidth={3} className={`transition-colors duration-500 ${isOpen ? 'text-accent-500' : 'text-gray-300 dark:text-gray-700'}`} />
        </button>

        {isOpen && (
          <div className="absolute z-[100] w-[300px] mt-2 bg-zen-card backdrop-blur-xl border-2 border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-top-4 duration-300">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/50">
              <h4 className="text-[11px] font-black text-gray-900 dark:text-gray-100 uppercase tracking-[0.2em]">
                {format(viewDate, 'MMMM yyyy')}
              </h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewDate(subMonths(viewDate, 1))}
                  className="p-2 rounded-xl hover:bg-zen-card text-gray-400 dark:text-gray-600 hover:text-accent-600 dark:hover:text-accent-400 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm"
                >
                  <ChevronLeft size={16} strokeWidth={3} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(addMonths(viewDate, 1))}
                  className="p-2 rounded-xl hover:bg-zen-card text-gray-400 dark:text-gray-600 hover:text-accent-600 dark:hover:text-accent-400 transition-all border border-transparent hover:border-gray-100 dark:hover:border-gray-700 shadow-sm"
                >
                  <ChevronRight size={16} strokeWidth={3} />
                </button>
              </div>
            </div>

            <div className="p-4 grid grid-cols-7 gap-1">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                <div key={day} className="text-[9px] font-black text-gray-300 dark:text-gray-700 text-center uppercase py-2 tracking-[0.2em]">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isTodayDate = isToday(day);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    className={`
                      h-9 text-[11px] font-black rounded-xl transition-all duration-300 relative group/day
                      ${!isCurrentMonth ? 'text-gray-200 dark:text-gray-800 opacity-30 grayscale' : 'text-gray-700 dark:text-gray-300 hover:bg-accent-50/50 dark:hover:bg-accent-950/30 hover:text-accent-600 dark:hover:text-accent-400'}
                      ${isSelected ? 'bg-accent-600 dark:bg-accent-500 text-white hover:bg-accent-700 dark:hover:bg-accent-600 hover:text-white shadow-lg shadow-accent-600/20 scale-110 z-10' : ''}
                      ${isTodayDate && !isSelected ? 'ring-2 ring-accent-500/20 dark:ring-accent-500/30 bg-accent-50/30 dark:bg-accent-900/10' : ''}
                    `}
                  >
                    {format(day, 'd')}
                    {isTodayDate && !isSelected && (
                       <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-500 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {(error || helperText) && (
        <p className={`text-[10px] font-black uppercase tracking-tight px-1 ${error ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-600'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
};

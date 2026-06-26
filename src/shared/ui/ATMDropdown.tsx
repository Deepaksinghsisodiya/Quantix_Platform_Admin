import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
  disabled?: boolean;
  divider?: boolean;
}

interface Props {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export const ATMDropdown: React.FC<Props> = ({
  trigger,
  items,
  align = 'right',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={triggerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={{
            position: 'absolute',
            top: coords.top + 6,
            left: align === 'right' ? coords.left + coords.width - 200 : coords.left,
            zIndex: 1000,
          }}
          className={`
            w-[200px] bg-zen-card border border-gray-100 dark:border-gray-800 rounded-xl shadow-2xl overflow-hidden
            animate-in fade-in zoom-in-95 duration-200
          `}
        >
          <div className="py-1.5">
            {items.map((item, index) => (
              <React.Fragment key={index}>
                {item.divider && <hr className="my-1.5 border-gray-100 dark:border-gray-800" />}
                <button
                  disabled={item.disabled}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick();
                      setIsOpen(false);
                    }
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                    ${item.variant === 'danger' ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-700 dark:text-gray-300'}
                  `}
                >
                  {item.icon && <span className="shrink-0 text-gray-400 dark:text-gray-500 group-hover:text-current">{item.icon}</span>}
                  <span className="font-semibold">{item.label}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

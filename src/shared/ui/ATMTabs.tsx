import React from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { cn } from '@/lib/utils/cn';

export interface TabItem {
  label: string;
  content: React.ReactNode;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface ATMTabsProps {
  tabs: TabItem[];
  defaultIndex?: number;
  onChange?: (index: number) => void;
  className?: string;
}

export const ATMTabs: React.FC<ATMTabsProps> = ({ 
  tabs, 
  defaultIndex = 0, 
  onChange, 
  className 
}) => {
  return (
    <TabGroup defaultIndex={defaultIndex} onChange={onChange}>
      <TabList
        className={cn(
          'flex gap-1 border-b border-gray-200 dark:border-gray-800',
          className,
        )}
      >
        {tabs.map((tab, idx) => (
          <Tab
            key={idx}
            className={({ selected }) =>
              cn(
                'relative inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold outline-none',
                'transition-all duration-300',
                'focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-t-xl',
                selected
                  ? 'text-accent-600 dark:text-accent-400 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300',
              )
            }
          >
            {({ selected }) => (
              <>
                {tab.icon && (
                  <span className="h-4 w-4 shrink-0" aria-hidden="true">
                    {tab.icon}
                  </span>
                )}
                {tab.label}
                {tab.badge != null && (
                  <span
                    className={cn(
                      'ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold',
                      selected
                        ? 'bg-accent-50 text-accent-700 dark:bg-accent-950/40 dark:text-accent-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
                    )}
                  >
                    {tab.badge}
                  </span>
                )}
                {/* Underline indicator */}
                {selected && (
                  <span className="absolute inset-x-0 -bottom-px h-0.5 bg-accent-600 dark:bg-accent-500" />
                )}
              </>
            )}
          </Tab>
        ))}
      </TabList>

      <TabPanels className="mt-4">
        {tabs.map((tab, idx) => (
          <TabPanel
            key={idx}
            className="outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded-xl"
          >
            {tab.content}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  );
};

export default ATMTabs;

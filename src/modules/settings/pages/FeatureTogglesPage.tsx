import React, { useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMBadge, BadgeColor } from '@/shared/ui/ATMBadge';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { ATMSwitch } from '@/shared/ui/ATMSwitch';
import { ATMCard } from '@/shared/ui/ATMCard';
import { cn } from '@/lib/utils/cn';

type Scope = 'Global' | 'Plan' | 'Tier' | 'Merchant';

interface FeatureToggle {
  id: string;
  name: string;
  category: string;
  scope: Scope;
  enabled: boolean;
  targetCount: number;
  lastChanged: string;
}

const SCOPE_STYLES: Record<Scope, BadgeColor> = {
  Global: 'primary',
  Plan: 'purple',
  Tier: 'warning',
  Merchant: 'success',
};

const INITIAL_TOGGLES: FeatureToggle[] = [
  { id: '1', name: 'Multi-Location Support', category: 'Core', scope: 'Plan', enabled: true, targetCount: 42, lastChanged: '2026-03-15' },
  { id: '2', name: 'Kitchen Display System', category: 'Restaurant', scope: 'Tier', enabled: true, targetCount: 128, lastChanged: '2026-03-10' },
  { id: '3', name: 'Real-Time Sync', category: 'Sync', scope: 'Global', enabled: true, targetCount: 0, lastChanged: '2026-03-01' },
  { id: '4', name: 'Customer Loyalty Program', category: 'CRM', scope: 'Plan', enabled: false, targetCount: 15, lastChanged: '2026-02-28' },
  { id: '5', name: 'Advanced Reporting', category: 'Analytics', scope: 'Tier', enabled: true, targetCount: 67, lastChanged: '2026-03-20' },
  { id: '6', name: 'Inventory Alerts', category: 'Inventory', scope: 'Global', enabled: true, targetCount: 0, lastChanged: '2026-03-12' },
  { id: '7', name: 'eCommerce Integration', category: 'eCommerce', scope: 'Plan', enabled: false, targetCount: 8, lastChanged: '2026-03-18' },
  { id: '8', name: 'Custom Receipts', category: 'Core', scope: 'Merchant', enabled: true, targetCount: 34, lastChanged: '2026-03-22' },
  { id: '9', name: 'Table Management', category: 'Restaurant', scope: 'Tier', enabled: true, targetCount: 95, lastChanged: '2026-03-08' },
  { id: '10', name: 'Beta: AI Demand Forecast', category: 'Analytics', scope: 'Merchant', enabled: false, targetCount: 3, lastChanged: '2026-03-25' },
];

export function FeatureTogglesPage() {
  const [toggles, setToggles] = useState<FeatureToggle[]>(INITIAL_TOGGLES);
  const [search, setSearch] = useState('');

  const grouped = useMemo(() => {
    const q = search.toLowerCase();
    const filtered = toggles.filter(
      (t) => t.name.toLowerCase().includes(q) || t.category.toLowerCase().includes(q),
    );
    const map: Record<string, FeatureToggle[]> = {};
    for (const t of filtered) {
      if (!map[t.category]) map[t.category] = [];
      map[t.category]!.push(t);
    }
    return map;
  }, [toggles, search]);

  const handleToggle = (id: string, checked: boolean) => {
    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: checked, lastChanged: '2026-03-29' } : t)),
    );
    toast.success('Toggle updated');
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Feature Toggles
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
            Enable or disable features by scope across the platform.
          </p>
        </div>
        <ATMButton variant="primary" size="md" icon={Plus} onClick={() => toast('Add Toggle dialog coming soon')}>
          Add Toggle
        </ATMButton>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <ATMTextField
          name="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search features..."
          size="sm"
        />
      </div>

      {/* Grouped tables */}
      <div className="flex flex-col gap-6">
        {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
          <div key={category} className="flex flex-col gap-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              {category}
            </h2>
            <ATMCard padding="none" className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30 text-xs font-extrabold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      <th className="px-4 py-3.5">Feature Name</th>
                      <th className="px-4 py-3.5">Scope</th>
                      <th className="px-4 py-3.5">Enabled</th>
                      <th className="px-4 py-3.5">Targets</th>
                      <th className="px-4 py-3.5">Last Changed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {items.map((toggle) => (
                      <tr key={toggle.id} className="transition-colors hover:bg-gray-55/40 dark:hover:bg-gray-800/10">
                        <td className="px-4 py-3 font-bold text-gray-900 dark:text-white">{toggle.name}</td>
                        <td className="px-4 py-3">
                          <ATMBadge color={SCOPE_STYLES[toggle.scope]} size="sm" label={toggle.scope} />
                        </td>
                        <td className="px-4 py-3">
                          <ATMSwitch
                            name={`toggle-${toggle.id}`}
                            checked={toggle.enabled}
                            onChange={(checked) => handleToggle(toggle.id, checked)}
                            size="sm"
                          />
                        </td>
                        <td className="px-4 py-3 tabular-nums text-gray-600 dark:text-gray-400 font-semibold">
                          {toggle.scope === 'Global' ? 'All' : toggle.targetCount}
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-450 font-semibold">{toggle.lastChanged}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </ATMCard>
          </div>
        ))}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="py-12 text-center text-sm text-gray-400 dark:text-gray-500 font-semibold">No features match your search.</div>
      )}
    </div>
  );
}

export default FeatureTogglesPage;

/**
 * DownloadsPage — FRS-SAP-1201 to 1205
 *
 * Application packages, mobile app tracking, version management,
 * distribution configuration, and hardware compatibility.
 */

import React, { useState } from 'react';
import { ATMBadge, ATMButton, ATMCard } from '@/shared/ui';
import { Download, Monitor, Package, X, ChevronRight, Smartphone, Upload, RotateCcw, Star, Globe, Cpu, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

/* -------------------------------------------------------------------------- */
/*  FRS-SAP-1201: Application Packages                                       */
/* -------------------------------------------------------------------------- */

interface SoftwarePackage {
  id: string;
  name: string;
  latestVersion: string;
  platforms: ('Windows' | 'Linux')[];
  downloads: number;
  availability: 'Enterprise Only' | 'Universal';
  description: string;
  versions: VersionEntry[];
  hardwareReqs: string;
}

interface VersionEntry {
  version: string;
  date: string;
  notes: string;
  isLatest: boolean;
  minVersion: string | null;
}

const PACKAGES: SoftwarePackage[] = [
  { id: 'pos-restaurant', name: 'POS-Restaurant', latestVersion: '2.1.0-alpha', platforms: ['Windows', 'Linux'], downloads: 1240, availability: 'Universal', description: 'Full-featured restaurant POS with table management, KDS integration, and delivery support.',
    versions: [
      { version: '2.1.0-alpha', date: '2026-03-15', notes: 'Unified POS terminal, table management improvements, delivery tracking.', isLatest: true, minVersion: '2.0.0-alpha' },
      { version: '2.0.0-alpha', date: '2026-02-01', notes: 'Initial alpha release with core restaurant features.', isLatest: false, minVersion: null },
    ], hardwareReqs: 'x64 CPU, 4 GB RAM, 2 GB disk, Windows 10+ or Ubuntu 22.04+' },
  { id: 'pos-retail', name: 'POS-Retail', latestVersion: '2.1.0-alpha', platforms: ['Windows', 'Linux'], downloads: 890, availability: 'Universal', description: 'Retail POS with barcode scanning, inventory integration, and customer management.',
    versions: [{ version: '2.1.0-alpha', date: '2026-03-15', notes: 'Unified POS terminal, improved barcode scanning, size guide support.', isLatest: true, minVersion: null }], hardwareReqs: 'x64 CPU, 4 GB RAM, 2 GB disk, Windows 10+ or Ubuntu 22.04+' },
  { id: 'kds', name: 'Kitchen Display System', latestVersion: '1.0.0-alpha', platforms: ['Windows', 'Linux'], downloads: 456, availability: 'Enterprise Only', description: 'Kitchen display for order routing, prep timers, and station management.',
    versions: [{ version: '1.0.0-alpha', date: '2026-03-10', notes: 'Initial release with order display, bump bar support, station routing.', isLatest: true, minVersion: null }], hardwareReqs: 'x64 CPU, 2 GB RAM, 1 GB disk, touchscreen recommended' },
  { id: 'inventory', name: 'Inventory', latestVersion: '1.0.0-alpha', platforms: ['Windows', 'Linux'], downloads: 678, availability: 'Universal', description: 'Inventory management with stock tracking, purchase orders, and vendor management.',
    versions: [{ version: '1.0.0-alpha', date: '2026-03-19', notes: 'Full inventory module: stock counts, POs, GRNs, vendor performance, alerts.', isLatest: true, minVersion: null }], hardwareReqs: 'x64 CPU, 2 GB RAM, 1 GB disk' },
  { id: 'dispatch', name: 'Dispatch', latestVersion: '1.0.0-alpha', platforms: ['Windows', 'Linux'], downloads: 234, availability: 'Enterprise Only', description: 'Delivery dispatch and driver management with route optimization.',
    versions: [{ version: '1.0.0-alpha', date: '2026-03-08', notes: 'Initial release with driver assignment, zone management.', isLatest: true, minVersion: null }], hardwareReqs: 'x64 CPU, 2 GB RAM, 1 GB disk' },
  { id: 'billing-display', name: 'Billing Display', latestVersion: '1.0.0-alpha', platforms: ['Windows', 'Linux'], downloads: 567, availability: 'Universal', description: 'Customer-facing display showing order totals, promotions, and QR codes.',
    versions: [{ version: '1.0.0-alpha', date: '2026-03-12', notes: 'Fullscreen display with slideshow, payment states, digital receipts.', isLatest: true, minVersion: null }], hardwareReqs: 'x64 CPU, 2 GB RAM, 512 MB disk, secondary display' },
  { id: 'sync-service', name: 'Sync Service', latestVersion: '1.1.0-alpha', platforms: ['Windows', 'Linux'], downloads: 345, availability: 'Enterprise Only', description: 'Background sync service for cloud data replication with conflict resolution.',
    versions: [
      { version: '1.1.0-alpha', date: '2026-03-10', notes: 'V2 architecture: independent process, IPC, tray icon, config file.', isLatest: true, minVersion: '1.0.0-alpha' },
      { version: '1.0.0-alpha', date: '2026-02-15', notes: 'Initial sync service with upload/download queues.', isLatest: false, minVersion: null },
    ], hardwareReqs: 'x64 CPU, 1 GB RAM, 256 MB disk, requires Enterprise POS' },
];

/* -------------------------------------------------------------------------- */
/*  FRS-SAP-1202: Mobile App Version Tracking                                */
/* -------------------------------------------------------------------------- */

interface MobileApp {
  id: string;
  name: string;
  platform: 'iOS' | 'Android';
  latestVersion: string;
  minVersion: string;
  storeUrl: string;
  status: 'Published' | 'Review' | 'Development';
}

const MOBILE_APPS: MobileApp[] = [
  { id: 'mob-rest-ios', name: 'MOB-Restaurant', platform: 'iOS', latestVersion: '1.2.0', minVersion: '1.0.0', storeUrl: 'https://apps.apple.com/app/quantix-restaurant', status: 'Published' },
  { id: 'mob-rest-android', name: 'MOB-Restaurant', platform: 'Android', latestVersion: '1.2.0', minVersion: '1.0.0', storeUrl: 'https://play.google.com/store/apps/details?id=io.quantix.restaurant', status: 'Published' },
  { id: 'mob-retail-ios', name: 'MOB-Retail', platform: 'iOS', latestVersion: '1.1.0', minVersion: '1.0.0', storeUrl: 'https://apps.apple.com/app/quantix-retail', status: 'Published' },
  { id: 'mob-retail-android', name: 'MOB-Retail', platform: 'Android', latestVersion: '1.1.0', minVersion: '1.0.0', storeUrl: 'https://play.google.com/store/apps/details?id=io.quantix.retail', status: 'Published' },
  { id: 'driver-ios', name: 'Driver', platform: 'iOS', latestVersion: '1.0.0', minVersion: '1.0.0', storeUrl: 'https://apps.apple.com/app/quantix-driver', status: 'Published' },
  { id: 'driver-android', name: 'Driver', platform: 'Android', latestVersion: '1.0.0', minVersion: '1.0.0', storeUrl: 'https://play.google.com/store/apps/details?id=io.quantix.driver', status: 'Published' },
  { id: 'employee-ios', name: 'Employee', platform: 'iOS', latestVersion: '0.9.0', minVersion: '0.9.0', storeUrl: '#', status: 'Development' },
  { id: 'employee-android', name: 'Employee', platform: 'Android', latestVersion: '0.9.0', minVersion: '0.9.0', storeUrl: '#', status: 'Development' },
  { id: 'manager-ios', name: 'Manager', platform: 'iOS', latestVersion: '1.0.0', minVersion: '1.0.0', storeUrl: 'https://apps.apple.com/app/quantix-manager', status: 'Review' },
  { id: 'manager-android', name: 'Manager', platform: 'Android', latestVersion: '1.0.0', minVersion: '1.0.0', storeUrl: 'https://play.google.com/store/apps/details?id=io.quantix.manager', status: 'Review' },
];

/* -------------------------------------------------------------------------- */
/*  FRS-SAP-1205: Hardware Compatibility                                     */
/* -------------------------------------------------------------------------- */

const HARDWARE_CATEGORIES = [
  { category: 'POS Terminals', items: ['Sunmi T2s', 'Sunmi V2 Pro', 'PAX A920 Pro', 'Ingenico AXIUM DX8000', 'Custom x86 terminals'] },
  { category: 'Receipt Printers', items: ['Epson TM-T88VII', 'Star TSP143IV', 'BIXOLON SRP-350V', 'Any ESC/POS compatible'] },
  { category: 'Barcode Scanners', items: ['Zebra DS2208', 'Honeywell Voyager 1202g', 'Socket Mobile S740', 'Any HID keyboard-wedge'] },
  { category: 'Cash Drawers', items: ['APG VB320-BL1616', 'Star CD3-1616', 'Any RJ11/RJ12 kick-driven'] },
  { category: 'Payment Terminals', items: ['Verifone V400m', 'Ingenico Lane/3000', 'PAX A80', 'Square Terminal', 'SumUp Air'] },
  { category: 'KDS Screens', items: ['Elo Touch 15"', 'Any HDMI/VGA touchscreen', 'iPad (via web KDS)', 'Android tablet 10"+'] },
];

const AVAILABILITY_VARIANT: Record<string, 'enterprise' | 'success'> = {
  'Enterprise Only': 'enterprise',
  Universal: 'success',
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function DownloadsPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile' | 'distribution' | 'hardware'>('desktop');

  const selected = PACKAGES.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">Downloads & Versions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage software packages, mobile apps, distribution, and hardware compatibility.
          </p>
        </div>
        <ATMButton variant="primary" size="sm" leftIcon={<Upload className="h-4 w-4" />} onClick={() => toast('Upload package wizard coming soon')}>
          Upload Package
        </ATMButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {[
          { key: 'desktop' as const, label: 'Desktop Packages', icon: <Monitor className="h-3.5 w-3.5" /> },
          { key: 'mobile' as const, label: 'Mobile Apps', icon: <Smartphone className="h-3.5 w-3.5" /> },
          { key: 'distribution' as const, label: 'Distribution', icon: <Globe className="h-3.5 w-3.5" /> },
          { key: 'hardware' as const, label: 'Hardware Guide', icon: <Cpu className="h-3.5 w-3.5" /> },
        ].map((tab) => (
          <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)} className={cn(
            'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors',
            activeTab === tab.key ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400',
          )}>{tab.icon}{tab.label}</button>
        ))}
      </div>

      {/* ================================================================ */}
      {/* Tab: Desktop Packages (FRS-SAP-1201/1203)                       */}
      {/* ================================================================ */}
      {activeTab === 'desktop' && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <button key={pkg.id} type="button" onClick={() => setSelectedId(pkg.id)} className={cn(
                'rounded-xl border p-5 text-left transition-all hover:shadow-md',
                selectedId === pkg.id ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
              )}>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800"><Package className="h-5 w-5 text-gray-600 dark:text-gray-400" /></div>
                  <ATMBadge variant={AVAILABILITY_VARIANT[pkg.availability]} size="sm">{pkg.availability}</ATMBadge>
                </div>
                <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-gray-100">{pkg.name}</h3>
                <ATMBadge variant="info" size="sm" className="mt-1">{pkg.latestVersion}</ATMBadge>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{pkg.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">{pkg.platforms.map((p) => (<span key={p} className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">{p}</span>))}</div>
                  <span className="flex items-center gap-1 text-xs text-gray-400"><Download className="h-3 w-3" />{pkg.downloads.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Version detail with management actions (FRS-SAP-1203) */}
          {selected && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{selected.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selected.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <ATMButton variant="secondary" size="sm" leftIcon={<Upload className="h-3.5 w-3.5" />} onClick={() => toast('Upload new version')}>New Version</ATMButton>
                  <button type="button" onClick={() => setSelectedId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Version</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Date</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Min Version</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Notes</th>
                      <th className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {selected.versions.map((v) => (
                      <tr key={v.version}>
                        <td className="px-4 py-2">
                          <div className="flex items-center gap-2">
                            <ATMBadge variant="info" size="sm">{v.version}</ATMBadge>
                            {v.isLatest && <ATMBadge variant="success" size="sm">Latest</ATMBadge>}
                          </div>
                        </td>
                        <td className="px-4 py-2 tabular-nums text-gray-600 dark:text-gray-400">{v.date}</td>
                        <td className="px-4 py-2 text-gray-500">{v.minVersion ?? '—'}</td>
                        <td className="max-w-xs px-4 py-2 text-gray-600 dark:text-gray-400">{v.notes}</td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <ATMButton variant="ghost" size="sm" leftIcon={<Download className="h-3 w-3" />}>Win</ATMButton>
                            <ATMButton variant="ghost" size="sm" leftIcon={<Download className="h-3 w-3" />}>Linux</ATMButton>
                            {!v.isLatest && (
                              <ATMButton variant="ghost" size="sm" leftIcon={<Star className="h-3 w-3" />} onClick={() => toast.success(`${v.version} marked as latest`)}>Mark Latest</ATMButton>
                            )}
                            {!v.isLatest && (
                              <ATMButton variant="ghost" size="sm" leftIcon={<RotateCcw className="h-3 w-3" />} onClick={() => toast.success(`Rolled back to ${v.version}`)}>Rollback</ATMButton>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">Hardware Requirements</h4>
                <p className="text-sm text-gray-700 dark:text-gray-300">{selected.hardwareReqs}</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================================================================ */}
      {/* Tab: Mobile Apps (FRS-SAP-1202)                                 */}
      {/* ================================================================ */}
      {activeTab === 'mobile' && (
        <ATMCard padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">App</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Platform</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Latest</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Min Version</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Store Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {MOBILE_APPS.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{app.name}</td>
                    <td className="px-4 py-3 text-center">
                      <ATMBadge variant={app.platform === 'iOS' ? 'default' : 'success'} size="sm">{app.platform}</ATMBadge>
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-gray-700 dark:text-gray-300">{app.latestVersion}</td>
                    <td className="px-4 py-3 text-center font-mono text-gray-500">{app.minVersion}</td>
                    <td className="px-4 py-3 text-center">
                      <ATMBadge variant={app.status === 'Published' ? 'success' : app.status === 'Review' ? 'warning' : 'default'} size="sm" dot>{app.status}</ATMBadge>
                    </td>
                    <td className="px-4 py-3">
                      {app.storeUrl !== '#' ? (
                        <a href={app.storeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400">
                          <ExternalLink className="h-3 w-3" />
                          {app.platform === 'iOS' ? 'App Store' : 'Play Store'}
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">Not published</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ATMCard>
      )}

      {/* ================================================================ */}
      {/* Tab: Distribution (FRS-SAP-1204)                                */}
      {/* ================================================================ */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <ATMCard title="Public Website Downloads">
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Public download page</p>
                  <p className="text-xs text-gray-500">https://quantix.io/downloads</p>
                </div>
                <ATMBadge variant="success" size="sm" dot>Live</ATMBadge>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Auto-update notifications</p>
                  <p className="text-xs text-gray-500">Notify Enterprise merchants when new versions are available via API</p>
                </div>
                <ATMBadge variant="success" size="sm">Enabled</ATMBadge>
              </div>
            </div>
          </ATMCard>

          {/* FRS-SAP-1204: Standalone offline bundle */}
          <ATMCard title="Standalone Installation Bundle" action={<ATMBadge variant="standalone" size="sm">Standalone Only</ATMBadge>}>
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Self-contained installation package for Standalone merchants. Includes offline setup wizard, POS application, and token activation module.
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Restaurant Bundle</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">POS-REST + Inventory + BDS + Offline Setup Wizard</p>
                  <div className="mt-2 flex items-center gap-2">
                    <ATMBadge variant="default" size="sm">Windows x64</ATMBadge>
                    <ATMBadge variant="default" size="sm">Linux x64</ATMBadge>
                  </div>
                  <ATMButton variant="secondary" size="sm" className="mt-2" leftIcon={<Download className="h-3 w-3" />}>Download Bundle</ATMButton>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Retail Bundle</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400">POS-RETAIL + Inventory + BDS + Offline Setup Wizard</p>
                  <div className="mt-2 flex items-center gap-2">
                    <ATMBadge variant="default" size="sm">Windows x64</ATMBadge>
                    <ATMBadge variant="default" size="sm">Linux x64</ATMBadge>
                  </div>
                  <ATMButton variant="secondary" size="sm" className="mt-2" leftIcon={<Download className="h-3 w-3" />}>Download Bundle</ATMButton>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Offline setup wizard guides the merchant through installation, token activation, and initial configuration without requiring internet.
              </p>
            </div>
          </ATMCard>

          <ATMCard title="Direct Download Links">
            <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">Generate direct download links for specific packages and versions.</p>
            <div className="space-y-2">
              {PACKAGES.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                  <span className="text-sm text-gray-900 dark:text-gray-100">{pkg.name} {pkg.latestVersion}</span>
                  <ATMButton variant="ghost" size="sm" onClick={() => toast.success('Direct link copied to clipboard')}>Copy Link</ATMButton>
                </div>
              ))}
            </div>
          </ATMCard>
        </div>
      )}

      {/* ================================================================ */}
      {/* Tab: Hardware Compatibility (FRS-SAP-1205)                      */}
      {/* ================================================================ */}
      {activeTab === 'hardware' && (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Supported hardware for Quantix POS ecosystem. All listed devices are tested and certified for compatibility.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {HARDWARE_CATEGORIES.map((cat) => (
              <ATMCard key={cat.category} title={cat.category} padding="md">
                <ul className="space-y-1.5">
                  {cat.items.map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </ATMCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DownloadsPage;

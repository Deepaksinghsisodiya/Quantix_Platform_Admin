import React, { useState } from 'react';
import { CreditCard, Mail, MessageSquare, Cloud, BarChart3, Check, X, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { cn } from '@/lib/utils/cn';

interface Integration {
  id: string;
  name: string;
  provider: string;
  icon: React.ReactNode;
  connected: boolean;
  summary: string;
  apiKey: string;
  endpointUrl: string;
}

const INITIAL_INTEGRATIONS: Integration[] = [
  { id: 'payment', name: 'Payment Gateway', provider: 'Stripe', icon: <CreditCard className="h-6 w-6" />, connected: true, summary: 'Live mode, 2 webhooks configured', apiKey: 'sk_live_***************************a4Bx', endpointUrl: 'https://api.stripe.com/v1' },
  { id: 'email', name: 'Email Provider', provider: 'SendGrid', icon: <Mail className="h-6 w-6" />, connected: true, summary: '12,450 emails sent this month', apiKey: 'SG.***************************kM2q', endpointUrl: 'https://api.sendgrid.com/v3' },
  { id: 'sms', name: 'SMS Provider', provider: 'Twilio', icon: <MessageSquare className="h-6 w-6" />, connected: false, summary: 'Not configured', apiKey: '', endpointUrl: 'https://api.twilio.com/2010-04-01' },
  { id: 'cdn', name: 'CDN', provider: 'Cloudflare', icon: <Cloud className="h-6 w-6" />, connected: true, summary: 'Zone active, 3 purge rules', apiKey: 'cf_***************************pR7j', endpointUrl: 'https://api.cloudflare.com/client/v4' },
  { id: 'monitoring', name: 'Monitoring', provider: 'Grafana', icon: <BarChart3 className="h-6 w-6" />, connected: false, summary: 'Not configured', apiKey: '', endpointUrl: 'https://grafana.quantix.io/api' },
];

export function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editApiKey, setEditApiKey] = useState('');
  const [editEndpoint, setEditEndpoint] = useState('');
  const [testing, setTesting] = useState(false);

  const selected = integrations.find((i) => i.id === selectedId) ?? null;

  const handleSelect = (integration: Integration) => {
    setSelectedId(integration.id);
    setEditApiKey(integration.apiKey);
    setEditEndpoint(integration.endpointUrl);
  };

  const handleTestConnection = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      toast.success('Connection successful');
    }, 1200);
  };

  const handleSave = () => {
    if (!selectedId) return;
    setIntegrations((prev) =>
      prev.map((i) =>
        i.id === selectedId
          ? { ...i, apiKey: editApiKey, endpointUrl: editEndpoint, connected: !!editApiKey }
          : i,
      ),
    );
    toast.success('Integration saved');
    setSelectedId(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-page-enter">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Integrations
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-semibold">
          Connect and manage third-party service providers.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => (
          <button
            key={integration.id}
            type="button"
            onClick={() => handleSelect(integration)}
            className={cn(
              'rounded-xl border p-5 text-left transition-all hover:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
              selectedId === integration.id
                ? 'border-accent-500 bg-accent-50/10 dark:border-accent-400 dark:bg-accent-950/10'
                : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900',
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {integration.icon}
              </div>
              <div className={cn(
                'flex h-3 w-3 rounded-full',
                integration.connected ? 'bg-emerald-500' : 'bg-red-500',
              )} />
            </div>
            <h3 className="mt-3 text-sm font-extrabold text-gray-900 dark:text-white">{integration.name}</h3>
            <p className="text-xs font-bold text-accent-600 dark:text-accent-400">{integration.provider}</p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 font-semibold">{integration.summary}</p>
          </button>
        ))}
      </div>

      {/* Configuration section */}
      {selected && (
        <ATMCard className="glass-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Configure {selected.name} ({selected.provider})
            </h3>
            <ATMButton variant="ghost" size="sm" onClick={() => setSelectedId(null)}>
              <X className="h-5 w-5" />
            </ATMButton>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 pt-2">
            <ATMTextField
              name="apiKey"
              type="password"
              label="API Key"
              value={editApiKey}
              onChange={(e) => setEditApiKey(e.target.value)}
              placeholder="Enter API key..."
            />
            <ATMTextField
              name="endpointUrl"
              type="url"
              label="Endpoint URL"
              value={editEndpoint}
              onChange={(e) => setEditEndpoint(e.target.value)}
              placeholder="https://api.example.com"
            />
          </div>

          <div className="mt-6 flex items-center gap-3">
            <ATMButton
              variant="secondary"
              size="sm"
              icon={testing ? Loader2 : Check}
              onClick={handleTestConnection}
              disabled={testing}
              isLoading={testing}
            >
              Test Connection
            </ATMButton>
            <ATMButton variant="primary" size="sm" icon={Save} onClick={handleSave}>
              Save
            </ATMButton>
          </div>
        </ATMCard>
      )}
    </div>
  );
}

export default IntegrationsPage;

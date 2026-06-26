import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge, StatusBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMSkeleton } from '@/shared/ui/ATMSkeleton';
import { ATMDrawer } from '@/shared/ui/ATMDrawer';
import { ATMTextField } from '@/shared/ui/ATMTextField';
import { toast } from 'sonner';
import { usePlans, useCreatePlan } from '../services/useBilling';
import {
  Check,
  Plus,
  Pencil,
  Archive,
  Users,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Display types (server SubscriptionPlan adapted in main component)
// ---------------------------------------------------------------------------

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: PlanFeature[];
  merchantCount: number;
  status: 'Active' | 'Deprecated' | 'Draft';
  color: string;
  popular?: boolean;
}

const STATUS_VARIANT: Record<string, 'success' | 'default' | 'warning'> = {
  Active: 'success',
  Deprecated: 'default',
  Draft: 'warning',
};

const PLAN_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899'];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PlanManagementPage() {
  const plansQuery = usePlans();
  const createPlanMutation = useCreatePlan();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanTier, setNewPlanTier] = useState('');
  const [newPlanMonthly, setNewPlanMonthly] = useState('');
  const [newPlanAnnual, setNewPlanAnnual] = useState('');
  const [newPlanTrial, setNewPlanTrial] = useState('14');
  const [newPlanMaxLocations, setNewPlanMaxLocations] = useState('');
  const [newPlanMaxTerminals, setNewPlanMaxTerminals] = useState('');
  const [newPlanFeatures, setNewPlanFeatures] = useState<string[]>(['']);

  const loading = plansQuery.isLoading;
  const isError = plansQuery.isError;

  // Adapter: server SubscriptionPlan (features: string[]) → page Plan with PlanFeature[].
  // Server doesn't yet expose merchantCount / popular / status — fall back as noted.
  const plans: Plan[] = useMemo(() => {
    const apiPlans = plansQuery.data?.data ?? [];
    return apiPlans.map((p, idx) => ({
      id: p.id,
      name: p.name,
      monthlyPrice: p.monthlyPrice,
      annualPrice: p.annualPrice,
      features: p.features.map((text) => ({ text, included: true })),
      // TODO Pass-26: hook missing — merchantCount not in SubscriptionPlan DTO; defaults to 0.
      merchantCount: 0,
      status: p.isActive ? 'Active' : 'Deprecated',
      color: PLAN_COLORS[idx % PLAN_COLORS.length] ?? '#6b7280',
      popular: false,
    }));
  }, [plansQuery.data]);

  const addFeature = () => setNewPlanFeatures([...newPlanFeatures, '']);
  const removeFeature = (idx: number) => setNewPlanFeatures(newPlanFeatures.filter((_, i) => i !== idx));
  const updateFeature = (idx: number, value: string) => {
    const updated = [...newPlanFeatures];
    updated[idx] = value;
    setNewPlanFeatures(updated);
  };

  const handleCreatePlan = async () => {
    const monthly = parseFloat(newPlanMonthly);
    const annual = parseFloat(newPlanAnnual);
    const maxLocations = parseInt(newPlanMaxLocations || '1', 10);
    const maxTerminals = parseInt(newPlanMaxTerminals || '1', 10);
    const features = newPlanFeatures.filter((f) => f.trim().length > 0);
    if (!newPlanName.trim() || !newPlanTier.trim() || !Number.isFinite(monthly) || !Number.isFinite(annual)) {
      toast.error('Please fill in name, tier, and prices.');
      return;
    }
    try {
      await createPlanMutation.mutateAsync({
        name: newPlanName.trim(),
        tier: newPlanTier.trim(),
        monthlyPrice: monthly,
        annualPrice: annual,
        currency: 'USD',
        features,
        maxLocations,
        maxTerminals,
      });
      toast.success(`Plan ${newPlanName.trim()} created.`);
      setDrawerOpen(false);
      setNewPlanName('');
      setNewPlanTier('');
      setNewPlanMonthly('');
      setNewPlanAnnual('');
      setNewPlanMaxLocations('');
      setNewPlanMaxTerminals('');
      setNewPlanFeatures(['']);
    } catch {
      toast.error('Failed to create plan.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <ATMPageHeader
        title={
          <div className="flex items-center gap-2">
            <span>Subscription Plans</span>
            {loading && <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />}
          </div>
        }
        subtitle="Manage subscription plans for Enterprise merchants"
        extraActions={<ATMBadge label="Enterprise Only" color="purple" />}
        action={{
          label: 'Create Plan',
          onClick: () => setDrawerOpen(true),
          icon: Plus,
        }}
      />

      {/* Plans grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <ATMSkeleton key={i} height="450px" />
          ))}
        </div>
      ) : isError ? (
        <ATMCard>
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
            <AlertTriangle className="h-10 w-10 text-red-500" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Failed to load plans.
            </p>
            <ATMButton
              variant="primary"
              size="sm"
              onClick={() => plansQuery.refetch()}
              icon={RefreshCw}
            >
              Retry
            </ATMButton>
          </div>
        </ATMCard>
      ) : plans.length === 0 ? (
        <ATMCard>
          <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
            No plans configured yet.
          </div>
        </ATMCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-[1.5rem] border bg-zen-card',
                'dark:bg-gray-900 transition-all duration-300 hover:shadow-lg hover:border-accent-500/20 dark:hover:border-accent-500/10',
                plan.popular
                  ? 'border-blue-400 ring-2 ring-blue-400/20 dark:border-blue-500 dark:ring-blue-500/20'
                  : 'border-gray-200 dark:border-gray-800',
              )}
            >
              {plan.popular && (
                <div className="bg-blue-500 py-1.5 text-center text-xs font-black uppercase tracking-widest text-white">
                  Most Popular
                </div>
              )}

              {/* Header */}
              <div className="border-b border-gray-100 dark:border-gray-800 p-6 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {plan.name}
                  </h3>
                  <StatusBadge status={plan.status} />
                </div>
                <div>
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                    {formatCurrency(plan.monthlyPrice)}
                  </span>
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500">/mo</span>
                </div>
                <p className="text-xs font-medium text-gray-400 dark:text-gray-500">
                  {formatCurrency(plan.annualPrice)}/year (save {Math.round((1 - plan.annualPrice / (plan.monthlyPrice * 12)) * 100)}%)
                </p>
              </div>

              {/* Features */}
              <div className="flex-1 p-6">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" strokeWidth={3} />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-gray-300 dark:text-gray-600 mt-0.5" strokeWidth={3} />
                      )}
                      <span
                        className={cn(
                          'text-sm font-medium',
                          feature.included
                            ? 'text-gray-600 dark:text-gray-300'
                            : 'text-gray-400 line-through dark:text-gray-600',
                        )}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-100 dark:border-gray-800 p-6 bg-slate-50/40 dark:bg-gray-950/20">
                <div className="mb-4 flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  <Users className="h-4 w-4" />
                  <span>{plan.merchantCount.toLocaleString()} merchants</span>
                </div>
                <div className="flex items-center gap-3">
                  <ATMButton
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    icon={Pencil}
                    onClick={() => {}}
                  >
                    Edit
                  </ATMButton>
                  <ATMButton
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    icon={Archive}
                    onClick={() => {}}
                  >
                    Deprecate
                  </ATMButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Plan Drawer */}
      <ATMDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Create New Plan"
        subtitle="Configure pricing tiers and features"
        size="lg"
        footer={
          <div className="flex justify-end gap-3 w-full">
            <ATMButton
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </ATMButton>
            <ATMButton
              onClick={handleCreatePlan}
              isLoading={createPlanMutation.isPending}
            >
              Create Plan
            </ATMButton>
          </div>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <ATMTextField
              name="planName"
              label="Plan Name"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              placeholder="e.g. Premium"
              required
            />
            <ATMTextField
              name="planTier"
              label="Tier (key)"
              value={newPlanTier}
              onChange={(e) => setNewPlanTier(e.target.value)}
              placeholder="e.g. premium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ATMTextField
              name="monthlyPrice"
              label="Monthly Price ($)"
              type="number"
              value={newPlanMonthly}
              onChange={(e) => setNewPlanMonthly(e.target.value)}
              placeholder="0.00"
              step="0.01"
              required
            />
            <ATMTextField
              name="annualPrice"
              label="Annual Price ($)"
              type="number"
              value={newPlanAnnual}
              onChange={(e) => setNewPlanAnnual(e.target.value)}
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <ATMTextField
            name="trialPeriod"
            label="Trial Period (days)"
            type="number"
            value={newPlanTrial}
            onChange={(e) => setNewPlanTrial(e.target.value)}
            min="0"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.2em] px-1">
                Features
              </label>
              <ATMButton
                variant="ghost"
                size="sm"
                icon={Plus}
                onClick={addFeature}
              >
                Add Feature
              </ATMButton>
            </div>
            <div className="space-y-3">
              {newPlanFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <ATMTextField
                    name={`feature-${idx}`}
                    value={feature}
                    onChange={(e) => updateFeature(idx, e.target.value)}
                    placeholder="Feature description"
                    className="flex-1 !gap-0"
                  />
                  {newPlanFeatures.length > 1 && (
                    <ATMButton
                      variant="ghost"
                      size="md"
                      icon={X}
                      onClick={() => removeFeature(idx)}
                      className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ATMTextField
              name="maxLocations"
              label="Max Locations"
              type="number"
              value={newPlanMaxLocations}
              onChange={(e) => setNewPlanMaxLocations(e.target.value)}
              placeholder="e.g. 5"
              min="1"
            />
            <ATMTextField
              name="maxTerminals"
              label="Max Terminals"
              type="number"
              value={newPlanMaxTerminals}
              onChange={(e) => setNewPlanMaxTerminals(e.target.value)}
              placeholder="e.g. 10"
              min="1"
            />
          </div>
        </div>
      </ATMDrawer>
    </div>
  );
}

export default PlanManagementPage;

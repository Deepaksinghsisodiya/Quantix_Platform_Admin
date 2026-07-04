import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatCurrency';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMButton } from '@/shared/ui/ATMButton';
import { ATMTable, ATMTableColumn } from '@/shared/components/ATMTable/ATMTable';
import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { RateCardFormModal } from '../components/RateCardFormModal';
import { RateCard } from '../types/rateCard.types';
import {
  addRateCard,
  updateRateCard,
  deleteRateCard,
  setDefaultRateCard,
} from '../store/rateCardSlice';
import {
  Plus,
  Pencil,
  Trash2,
  CheckCircle,
  Building,
  CreditCard,
  Database,
  Terminal,
  Grid,
  List,
  Sparkles,
  Info,
  DollarSign,
  Activity,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';

export const RateCardListPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const rateCards = useAppSelector((state) => state.rateCards.rateCards);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<RateCard | null>(null);
  const [deletingCardId, setDeletingCardId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCard(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (card: RateCard) => {
    setEditingCard(card);
    setModalOpen(true);
  };

  const handleFormSubmit = (values: Omit<RateCard, 'id'> & { id?: string }) => {
    if (editingCard && values.id) {
      dispatch(updateRateCard(values as RateCard));
      toast.success(`Rate Card "${values.name}" updated successfully!`);
    } else {
      dispatch(addRateCard(values));
      toast.success(`Rate Card "${values.name}" created successfully!`);
    }
  };

  const handleSetDefault = (id: string, name: string) => {
    dispatch(setDefaultRateCard(id));
    toast.success(`Rate Card "${name}" is now the active default!`);
  };

  const handleDeleteConfirm = () => {
    if (deletingCardId) {
      const card = rateCards.find((c) => c.id === deletingCardId);
      if (card?.isDefault) {
        toast.error('Cannot delete the default active Rate Card!');
        setDeletingCardId(null);
        return;
      }
      dispatch(deleteRateCard(deletingCardId));
      toast.success('Rate Card deleted successfully!');
      setDeletingCardId(null);
    }
  };

  const defaultCard = rateCards.find((c) => c.isDefault) || rateCards[0];

  const columns: ATMTableColumn<RateCard>[] = [
    {
      key: 'name',
      header: 'Rate Card Name',
      renderCell: (_, row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-bold text-slate-900 dark:text-white text-sm">
            {row.name}
          </span>
          <span className="text-[10px] font-mono text-slate-450 dark:text-slate-500">
            ID: {row.id}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      renderCell: (_, row) => (
        <ATMBadge
          color={row.isDefault ? 'success' : 'slate'}
          label={row.isDefault ? 'Active Default' : 'Inactive'}
          size="sm"
        />
      ),
      width: '140px',
    },
    {
      key: 'basePrice',
      header: 'Base Prices (D/W/M/Y)',
      renderCell: (_, row) => (
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <span>${row.baseDailyPrice}</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span>${row.baseWeeklyPrice}</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span>${row.baseMonthlyPrice}</span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span>${row.baseYearlyPrice}</span>
        </div>
      ),
      width: '200px',
    },
    {
      key: 'featuresSummary',
      header: 'Key Rates',
      renderCell: (_, row) => (
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Building className="h-3 w-3 text-slate-400" /> INV: ${row.modulePrices.INV}
          </span>
          <span className="flex items-center gap-1">
            <Terminal className="h-3 w-3 text-slate-400" /> Terminal: ${row.limitPrices.MTM}
          </span>
          <span className="flex items-center gap-1">
            <CreditCard className="h-3 w-3 text-slate-400" /> Snap QR: ${row.servicePrices.SNP}
          </span>
          <span className="flex items-center gap-1">
            <Database className="h-3 w-3 text-slate-400" /> Products/100: ${row.limitPrices.MPR}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      renderCell: (_, row) => (
        <div className="flex items-center gap-2">
          {!row.isDefault && (
            <ATMButton
              variant="outline"
              size="sm"
              icon={CheckCircle}
              onClick={() => handleSetDefault(row.id, row.name)}
              className="hover:border-emerald-500 hover:bg-emerald-50/20 text-slate-700 dark:text-slate-300"
            >
              Activate
            </ATMButton>
          )}
          <ATMButton
            variant="outline"
            size="sm"
            icon={Pencil}
            onClick={() => handleOpenEdit(row)}
          >
            Edit
          </ATMButton>
          {!row.isDefault && (
            <ATMButton
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={() => setDeletingCardId(row.id)}
              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
            />
          )}
        </div>
      ),
      width: '260px',
    },
  ];

  return (
    <div className="space-y-6">
      <ATMPageHeader
        title="Feature Rate Cards"
        subtitle="Manage baseline prices and incremental feature/limit costs used for dynamic plan calculations"
        action={{
          label: 'Create Rate Card',
          icon: Plus,
          onClick: handleOpenCreate,
        }}
      />

      {/* Hero Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ATMCard className="p-5 flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900/60 dark:to-slate-900/10">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Rate Formulas</p>
            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">{rateCards.length}</p>
          </div>
          <Layers className="h-8 w-8 text-blue-500 opacity-60" />
        </ATMCard>
        
        <ATMCard className="p-5 flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900/60 dark:to-slate-900/10">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Default active Card</p>
            <p className="text-sm font-extrabold mt-1.5 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 stroke-[3]" /> {defaultCard?.name || 'Standard Card'}
            </p>
          </div>
          <Activity className="h-8 w-8 text-emerald-500 opacity-60" />
        </ATMCard>

        <ATMCard className="p-5 flex items-center justify-between border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900/60 dark:to-slate-900/10">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Monthly Base</p>
            <p className="text-2xl font-black mt-1 text-slate-900 dark:text-white">
              {defaultCard ? formatCurrency(defaultCard.baseMonthlyPrice) : '$29.00'}
            </p>
          </div>
          <DollarSign className="h-8 w-8 text-indigo-500 opacity-60" />
        </ATMCard>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
          Formulas applied dynamically on subscription plan creation
        </p>
        
        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-850 p-0.5 rounded-[12px]">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-1.5 rounded-[8px] transition-all cursor-pointer',
              viewMode === 'grid'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-650'
            )}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-1.5 rounded-[8px] transition-all cursor-pointer',
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-800 text-slate-950 dark:text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-650'
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Grid View of Rate Cards */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rateCards.map((card) => {
            const isDefault = card.isDefault;
            return (
              <div
                key={card.id}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-[24px] border transition-all duration-300 bg-white dark:bg-slate-900/60 backdrop-blur-xl',
                  isDefault
                    ? 'border-slate-900 dark:border-slate-200 shadow-md ring-1 ring-slate-900/5 dark:ring-white/5'
                    : 'border-slate-200/60 dark:border-slate-800 shadow-sm hover:border-slate-400 dark:hover:border-slate-600'
                )}
              >
                {/* Header Band */}
                <div
                  className="h-20 relative flex items-end p-5 border-b border-slate-100 dark:border-slate-800/40"
                  style={{
                    background: isDefault
                      ? 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(16,185,129,0.12) 100%)'
                      : 'linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(59,130,246,0.08) 100%)',
                  }}
                >
                  <div className="absolute top-4 right-4">
                    <ATMBadge
                      color={isDefault ? 'success' : 'slate'}
                      label={isDefault ? 'Active Default' : 'Inactive'}
                      size="sm"
                    />
                  </div>
                  <div className="space-y-0.5 z-10">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1">
                      {isDefault && <Sparkles className="h-4 w-4 text-emerald-500 shrink-0" />}
                      {card.name}
                    </h3>
                  </div>
                </div>

                {/* Body details */}
                <div className="p-5 space-y-4 flex-1">
                  {/* Cycle prices block */}
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl border border-slate-150/40 dark:border-slate-850">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Base Daily</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200">${card.baseDailyPrice}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Base Weekly</span>
                      <span className="text-sm font-black text-slate-800 dark:text-slate-200">${card.baseWeeklyPrice}</span>
                    </div>
                    <div className="flex flex-col mt-2">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Base Monthly</span>
                      <span className="text-base font-black text-indigo-650 dark:text-indigo-400">${card.baseMonthlyPrice}</span>
                    </div>
                    <div className="flex flex-col mt-2">
                      <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Base Yearly</span>
                      <span className="text-base font-black text-slate-800 dark:text-slate-200">${card.baseYearlyPrice}</span>
                    </div>
                  </div>

                  {/* Pricing matrices mini preview */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 px-0.5">
                      <Info className="h-3 w-3" /> Cost Metrics
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-655 dark:text-slate-350">
                      <div className="flex items-center gap-1.5 py-1 px-2 rounded-xl bg-slate-50/40 dark:bg-slate-900 border border-slate-150/30 dark:border-slate-800/60 truncate">
                        <Building className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                        <span>INV: <strong>${card.modulePrices.INV}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 py-1 px-2 rounded-xl bg-slate-50/40 dark:bg-slate-900 border border-slate-150/30 dark:border-slate-800/60 truncate">
                        <Terminal className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                        <span>Terminal: <strong>${card.limitPrices.MTM}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 py-1 px-2 rounded-xl bg-slate-50/40 dark:bg-slate-900 border border-slate-150/30 dark:border-slate-800/60 truncate">
                        <CreditCard className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>Snap QR: <strong>${card.servicePrices.SNP}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5 py-1 px-2 rounded-xl bg-slate-50/40 dark:bg-slate-900 border border-slate-150/30 dark:border-slate-800/60 truncate">
                        <Database className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                        <span>Products: <strong>${card.limitPrices.MPR}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-5 pb-5 pt-3 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-slate-850 bg-slate-50/20 dark:bg-slate-950/20">
                  {!isDefault && (
                    <ATMButton
                      variant="outline"
                      size="sm"
                      icon={CheckCircle}
                      onClick={() => handleSetDefault(card.id, card.name)}
                      className="hover:border-emerald-500 hover:bg-emerald-50/10 text-emerald-600 dark:text-emerald-450 rounded-xl text-[11px] font-bold"
                    >
                      Activate
                    </ATMButton>
                  )}
                  <ATMButton
                    variant="outline"
                    size="sm"
                    icon={Pencil}
                    onClick={() => handleOpenEdit(card)}
                    className="rounded-xl text-[11px] font-bold"
                  >
                    Edit
                  </ATMButton>
                  {!isDefault && (
                    <button
                      type="button"
                      onClick={() => setDeletingCardId(card.id)}
                      className="h-8 w-8 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-all border border-transparent hover:border-red-100 dark:hover:border-red-950/40 cursor-pointer"
                      title="Delete Rate Card"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ATMCard className="p-0 overflow-hidden border border-slate-200 dark:border-slate-800">
          <ATMTable data={rateCards} columns={columns} />
        </ATMCard>
      )}

      <RateCardFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={editingCard}
      />

      <ATMConfirmModal
        isOpen={!!deletingCardId}
        title="Delete Rate Card?"
        description="Are you sure you want to permanently delete this rate card? This action cannot be undone."
        confirmLabel="Delete Card"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingCardId(null)}
      />
    </div>
  );
};

export default RateCardListPage;

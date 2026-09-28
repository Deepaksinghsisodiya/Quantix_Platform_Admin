import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { BusinessProblemList } from './BusinessProblemList';
import {
  useGetAdminBusinessProblemsQuery,
  useToggleActiveBusinessProblemMutation,
  useDeleteBusinessProblemMutation,
} from '../Service/BusinessProblemService';
import type { BusinessProblem } from '../Model/BusinessProblemTypes';

export const BusinessProblemListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeVariant, setActiveVariant] = useState<string>('Enterprise');
  const [deletingItem, setDeletingItem] = useState<BusinessProblem | null>(null);

  // Queries & Mutations
  const { data: problemsRes, isLoading, isFetching, isError, refetch } = useGetAdminBusinessProblemsQuery();
  const [toggleActive] = useToggleActiveBusinessProblemMutation();
  const [deleteProblem, deleteState] = useDeleteBusinessProblemMutation();

  const allProblems = useMemo(() => problemsRes?.data || [], [problemsRes?.data]);

  const counts = useMemo(
    () => ({
      Enterprise: allProblems.filter((p) => (p.siteVariant || '').toLowerCase() === 'enterprise').length,
      Restaurant: allProblems.filter((p) => (p.siteVariant || '').toLowerCase() === 'restaurant').length,
      Retail: allProblems.filter((p) => (p.siteVariant || '').toLowerCase() === 'retail').length,
    }),
    [allProblems]
  );

  const filteredItems = useMemo(
    () => allProblems.filter((p) => (p.siteVariant || '').toLowerCase() === activeVariant.toLowerCase()),
    [allProblems, activeVariant]
  );

  const handleToggleActive = async (item: BusinessProblem) => {
    try {
      await toggleActive(item.businessProblemId || item.id!).unwrap();
      toast.success(item.isActive ? 'Problem hidden from website.' : 'Problem published live to website.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    try {
      await deleteProblem(deletingItem.businessProblemId || deletingItem.id!).unwrap();
      toast.success('Business problem deleted successfully.');
      setDeletingItem(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete problem.');
    }
  };

  return (
    <>
      <BusinessProblemList
        items={filteredItems}
        counts={counts}
        activeVariant={activeVariant}
        onVariantChange={setActiveVariant}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() => navigate(`/content/business-problems/new?siteVariant=${activeVariant}`)}
        onOpenEdit={(item) => navigate(`/content/business-problems/${item.businessProblemId || item.id}/edit`)}
        onOpenDelete={(item) => setDeletingItem(item)}
        onToggleActive={handleToggleActive}
      />

      {/* Delete Confirmation Modal */}
      <ATMConfirmModal
        isOpen={!!deletingItem}
        title="Delete Business Problem"
        description={`Are you sure you want to delete '${deletingItem?.title}' from the ${deletingItem?.siteVariant} platform? This action cannot be undone.`}
        confirmLabel="Delete Problem"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingItem(null)}
      />
    </>
  );
};

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { ATMConfirmModal } from '@/shared/components/ATMConfirmModal';
import { HowItWorksList } from './HowItWorksList';
import {
  useGetAdminHowItWorksQuery,
  useToggleActiveHowItWorksStepMutation,
  useDeleteHowItWorksStepMutation,
  useReorderHowItWorksMutation,
} from '../Service/HowItWorksService';
import type { HowItWorksStepItem, SiteVariantTab } from '../Model/HowItWorksTypes';

export const HowItWorksListWrapper: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<SiteVariantTab>('Enterprise');
  const [deletingStep, setDeletingStep] = useState<HowItWorksStepItem | null>(null);

  // Queries & Mutations
  const { data: stepsRes, isLoading, isFetching, isError, refetch } = useGetAdminHowItWorksQuery(undefined);
  const [toggleActive] = useToggleActiveHowItWorksStepMutation();
  const [deleteStep, deleteState] = useDeleteHowItWorksStepMutation();
  const [reorderSteps, reorderState] = useReorderHowItWorksMutation();

  const allSteps = useMemo(() => stepsRes?.data || [], [stepsRes?.data]);

  const counts: Record<SiteVariantTab, number> = useMemo(
    () => ({
      Enterprise: allSteps.filter((s) => s.siteVariant === 'Enterprise').length,
      Restaurant: allSteps.filter((s) => s.siteVariant === 'Restaurant').length,
      Retail: allSteps.filter((s) => s.siteVariant === 'Retail').length,
    }),
    [allSteps]
  );

  const steps = useMemo(
    () =>
      allSteps
        .filter((s) => s.siteVariant === activeTab)
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [allSteps, activeTab]
  );

  const handleToggleActive = async (step: HowItWorksStepItem) => {
    try {
      await toggleActive(step.stepId || step.id).unwrap();
      toast.success(step.isActive ? 'Step hidden from website.' : 'Step published live to website.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to toggle step status.');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingStep) return;
    try {
      await deleteStep(deletingStep.stepId || deletingStep.id).unwrap();
      toast.success('How It Works step removed successfully.');
      setDeletingStep(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to delete step.');
    }
  };

  const handleMoveStep = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const reordered = [...steps];
    const moved = reordered[index];
    if (!moved) return;

    reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);

    const orderedIds = reordered.map((s) => s.stepId || s.id);
    try {
      await reorderSteps({ orderedIds }).unwrap();
      toast.success('Step display order updated.');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to update order.');
    }
  };

  return (
    <>
      <HowItWorksList
        steps={steps}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={counts}
        isLoading={isLoading || isFetching}
        isError={isError}
        onRetry={refetch}
        onOpenAdd={() =>
          navigate(`/content/how-it-works/new?siteVariant=${activeTab}&order=${steps.length + 1}`)
        }
        onOpenEdit={(step) =>
          navigate(`/content/how-it-works/${step.stepId || step.id}/edit`)
        }
        onOpenDelete={(step) => setDeletingStep(step)}
        onToggleActive={handleToggleActive}
        onMove={handleMoveStep}
        isReordering={reorderState.isLoading}
      />

      {/* Delete Confirmation Modal (only confirm remains as modal) */}
      <ATMConfirmModal
        isOpen={!!deletingStep}
        title="Delete How It Works Step"
        description={
          <span>
            Are you sure you want to delete step{' '}
            <strong className="text-slate-900 dark:text-white">
              &quot;{deletingStep?.stepNumber} — {deletingStep?.title}&quot;
            </strong>{' '}
            from the {deletingStep?.siteVariant} website roadmap? This action cannot be undone.
          </span>
        }
        confirmLabel="Delete Step"
        cancelLabel="Keep Step"
        variant="danger"
        isLoading={deleteState.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingStep(null)}
      />
    </>
  );
};

export default HowItWorksListWrapper;

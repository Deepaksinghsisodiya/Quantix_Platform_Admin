/**
 * Plans Module — Public Barrel Export
 * Conforming strictly to .agents/AGENTS.md §3.1 & §3.2
 */

// Types
export * from './types/plan.types';

// Services & Hooks
export * from './services/planApi';
export * from './services/usePlans';

// Components & UI Presenters
export * from './components/PlanCard';
export * from './components/PlanStatsSummary';
export * from './Form/PlanForm';
export * from './Detail/PlanDetailModal';

// Containers & Wrappers
export * from './Add/AddPlanWrapper';
export * from './Edit/EditPlanWrapper';
export * from './List/PlanListWrapper';
export * from './List/PlanListView';

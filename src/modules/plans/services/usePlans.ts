/**
 * Custom hooks wrapper for Plans Service
 */

import {
  useGetPlansListQuery,
  useGetPlanByIdQuery,
  useCreatePlanMutation,
  useUpdatePlanMutation,
  useTogglePlanStatusMutation,
  useDeletePlanMutation,
} from './planApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function usePlansList() {
  return useGetPlansListQuery();
}

export function usePlan(id: string | undefined) {
  return useGetPlanByIdQuery(id ?? '', { skip: !id });
}

export function useCreatePlanHook() {
  const [trigger, result] = useCreatePlanMutation();
  return wrapMutation(trigger, result);
}

export function useUpdatePlanHook() {
  const [trigger, result] = useUpdatePlanMutation();
  return wrapMutation(trigger, result);
}

export function useTogglePlanStatusHook() {
  const [trigger, result] = useTogglePlanStatusMutation();
  return wrapMutation(trigger, result);
}

export function useDeletePlanHook() {
  const [trigger, result] = useDeletePlanMutation();
  return wrapMutation(trigger, result);
}

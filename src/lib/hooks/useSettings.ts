import {
  useGetGlobalSettingsQuery,
  useUpdateGlobalSettingsMutation,
  useGetFeatureTogglesQuery,
  useGetEmailTemplatesQuery,
  useGetTokenConfigQuery,
  useGetCommissionConfigQuery,
  useGetGracePeriodConfigQuery,
} from '@/modules/settings/services/settingsApi';
import { wrapMutation } from '@/lib/utils/rtkQueryHelpers';

export function useGlobalSettings() {
  return useGetGlobalSettingsQuery();
}

export function useUpdateGlobalSettings() {
  const [trigger, result] = useUpdateGlobalSettingsMutation();
  return wrapMutation(trigger, result);
}

export function useFeatureToggles() {
  return useGetFeatureTogglesQuery();
}

export function useEmailTemplates() {
  return useGetEmailTemplatesQuery();
}

export function useTokenConfig() {
  return useGetTokenConfigQuery();
}

export function useCommissionConfig() {
  return useGetCommissionConfigQuery();
}

export function useGracePeriodConfig() {
  return useGetGracePeriodConfigQuery();
}


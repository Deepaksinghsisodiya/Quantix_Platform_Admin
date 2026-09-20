import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import { useGetPublicSettingsQuery } from '../../../modules/settings/services/settingsApi';
import { setSettings } from '../../../modules/settings/slices/settingsSlice';

interface ConfigLoaderProps {
  children: React.ReactNode;
}

/**
 * 2026-08-08 (branding): loads the anonymous public settings (DBA name, support email)
 * into settings.config so every screen — including pre-auth ones — brands itself with
 * the operator's DBA name. Mounted at App level; renders children immediately (no
 * loading gate) and falls back to the "Quantix" default until data arrives.
 */
const ConfigLoader: React.FC<ConfigLoaderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { data, isError } = useGetPublicSettingsQuery();

  useEffect(() => {
    if (data) {
      const settingsData = (data as any).data || data;
      dispatch(setSettings(settingsData));
      if (settingsData?.AppName) {
        document.title = settingsData.AppName;
      }
    }
  }, [data, dispatch]);

  useEffect(() => {
    if (isError) {
      toast.error('Could not load platform branding — using defaults.');
    }
  }, [isError]);

  return <>{children}</>;
};

export default ConfigLoader;

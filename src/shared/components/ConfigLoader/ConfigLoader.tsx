import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useGetPublicSettingsQuery } from '../../../modules/settings/services/settingsApi';
import { setSettings } from '../../../modules/settings/slices/settingsSlice';

interface ConfigLoaderProps {
  children: React.ReactNode;
}

const ConfigLoader: React.FC<ConfigLoaderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { data, isError } = useGetPublicSettingsQuery();

  useEffect(() => {
    if (data) {
      // Handle standard ApiResponse structure
      const settingsData = (data as any).data || data;
      dispatch(setSettings(settingsData));
    }
  }, [data, dispatch]);

  // Silently load settings in the background to avoid "Double Loader" flicker.
  // The AuthProvider or Suspense will handle the primary loading state.

  if (isError) {

  }

  return <>{children}</>;
};

export default ConfigLoader;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// SystemSetting is not used here, removing to fix TS error

interface SettingsState {
  config: Record<string, string>;
  isLoaded: boolean;
}

const initialState: SettingsState = {
  config: {},
  isLoaded: false,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<any>) => {
      const payload = action.payload;
      
      // If payload is already a flat dictionary (key-value), use it directly
      if (payload && !Array.isArray(payload) && typeof payload === 'object' && !payload.data) {
        state.config = payload;
      } 
      // If it's a grouped object (from GetAllSettings), we need to flatten it
      else if (payload && !Array.isArray(payload) && typeof payload === 'object' && !payload.key) {
        const flat: Record<string, string> = {};
        Object.values(payload).forEach((group: any) => {
          if (Array.isArray(group)) {
            group.forEach((s: any) => {
              flat[s.key] = s.value;
            });
          }
        });
        state.config = flat;
      }
      // If it's an array or standard ApiResponse
      else {
        const settingsArray = Array.isArray(payload) 
          ? payload 
          : (payload?.data && Array.isArray(payload.data) ? payload.data : []);

        state.config = settingsArray.reduce((acc: any, curr: any) => {
          acc[curr.key] = curr.value;
          return acc;
        }, {} as Record<string, string>);
      }

      state.isLoaded = true;
    },
    updateConfigValue: (state, action: PayloadAction<{ key: string; value: string }>) => {
      state.config[action.payload.key] = action.payload.value;
    },
  },
});

export const { setSettings, updateConfigValue } = settingsSlice.actions;
export default settingsSlice.reducer;

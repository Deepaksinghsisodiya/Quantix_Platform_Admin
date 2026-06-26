export interface SystemSetting {
  id: string;
  key: string;
  value: string;
  group: string;
  valueType: 'String' | 'Number' | 'Boolean' | 'Color' | 'JSON';
  description: string;
  isPublic: boolean;
  isReadOnly: boolean;
  updatedAt: string;
  updatedByName?: string;
}

export type SettingGroup = 
  | 'Branding'
  | 'Attendance'
  | 'Leave'
  | 'Security'
  | 'Infrastructure'
  | 'System'
  | 'Meetings'
  | 'WhatsApp';

export interface UpdateSettingRequest {
  value: string;
}

export interface BulkUpdateSettingsRequest {
  updates: Record<string, string>;
}

export interface SettingsGrouped {
  [group: string]: SystemSetting[];
}

export interface PublicSettings {
  [key: string]: string;
}

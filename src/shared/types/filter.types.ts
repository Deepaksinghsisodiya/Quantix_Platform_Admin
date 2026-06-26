export interface FilterConfig {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'dateRange';
  options?: { label: string; value: any }[];
}

export interface ActiveFilter {
  key: string;
  label: string;
  value: any;
  displayValue?: string;
}

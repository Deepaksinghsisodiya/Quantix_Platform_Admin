import { useAppSelector } from '../../app/hooks';

export const useConfig = () => {
  const config = useAppSelector((state) => state.settings.config);
  
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return 'N/A';
    const symbol = config.CurrencySymbol || '₹';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return '—';
    const d = new Date(date);
    const format = config.DateFormat || 'DD/MM/YYYY';
    
    // Simple mapper for common formats
    if (format === 'DD/MM/YYYY') return d.toLocaleDateString('en-GB');
    if (format === 'MM/DD/YYYY') return d.toLocaleDateString('en-US');
    if (format === 'YYYY-MM-DD') return d.toISOString().split('T')[0];
    
    return d.toLocaleDateString('en-IN');
  };

  return { config, formatCurrency, formatDate };
};

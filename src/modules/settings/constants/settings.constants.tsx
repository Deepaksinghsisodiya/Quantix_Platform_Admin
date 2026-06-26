import React from 'react';
import { CreditCard, Globe } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

export const CURRENCY_OPTIONS: SelectOption[] = [
  { value: '₹', label: 'Indian Rupee (INR)', icon: <CreditCard size={14} /> },
  { value: '$', label: 'US Dollar (USD)', icon: <CreditCard size={14} /> },
  { value: '€', label: 'Euro (EUR)', icon: <CreditCard size={14} /> },
  { value: '£', label: 'British Pound (GBP)', icon: <CreditCard size={14} /> },
  { value: 'د.إ', label: 'UAE Dirham (AED)', icon: <Globe size={14} /> },
  { value: 'ر.س', label: 'Saudi Riyal (SAR)', icon: <Globe size={14} /> },
  { value: '¥', label: 'Japanese Yen (JPY)', icon: <CreditCard size={14} /> },
  { value: 'A$', label: 'Australian Dollar (AUD)', icon: <CreditCard size={14} /> },
  { value: 'C$', label: 'Canadian Dollar (CAD)', icon: <CreditCard size={14} /> },
  { value: 'CHF', label: 'Swiss Franc (CHF)', icon: <CreditCard size={14} /> },
  { value: '元', label: 'Chinese Yuan (CNY)', icon: <CreditCard size={14} /> },
  { value: 'S$', label: 'Singapore Dollar (SGD)', icon: <CreditCard size={14} /> },
  { value: 'HK$', label: 'Hong Kong Dollar (HKD)', icon: <CreditCard size={14} /> },
  { value: 'NZ$', label: 'New Zealand Dollar (NZD)', icon: <CreditCard size={14} /> },
  { value: '₩', label: 'South Korean Won (KRW)', icon: <CreditCard size={14} /> },
  { value: 'kr', label: 'Swedish Krona (SEK)', icon: <CreditCard size={14} /> },
  { value: 'R$', label: 'Brazilian Real (BRL)', icon: <CreditCard size={14} /> },
  { value: '₽', label: 'Russian Ruble (RUB)', icon: <CreditCard size={14} /> },
  { value: 'R', label: 'South African Rand (ZAR)', icon: <CreditCard size={14} /> },
  { value: '₺', label: 'Turkish Lira (TRY)', icon: <CreditCard size={14} /> },
  { value: 'Mex$', label: 'Mexican Peso (MXN)', icon: <CreditCard size={14} /> },
  { value: '฿', label: 'Thai Baht (THB)', icon: <CreditCard size={14} /> },
  { value: '₱', label: 'Philippine Peso (PHP)', icon: <CreditCard size={14} /> },
  { value: 'Rp', label: 'Indonesian Rupiah (IDR)', icon: <CreditCard size={14} /> },
  { value: '₪', label: 'Israeli New Shekel (ILS)', icon: <CreditCard size={14} /> },
  { value: 'RM', label: 'Malaysian Ringgit (MYR)', icon: <CreditCard size={14} /> },
  { value: '₫', label: 'Vietnamese Dong (VND)', icon: <CreditCard size={14} /> },
];

export const DATE_FORMAT_OPTIONS: SelectOption[] = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (India/UK/EU)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (USA)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (International)' },
  { value: 'DD.MM.YYYY', label: 'DD.MM.YYYY (Germany/Russia)' },
  { value: 'YYYY/MM/DD', label: 'YYYY/MM/DD (East Asia)' },
];

export const LANGUAGE_OPTIONS: SelectOption[] = [
  { value: 'en-US', label: 'English (US)', icon: <Globe size={14} /> },
  { value: 'en-GB', label: 'English (UK)', icon: <Globe size={14} /> },
  { value: 'hi-IN', label: 'Hindi (India)', icon: <Globe size={14} /> },
  { value: 'es-ES', label: 'Spanish (Spain)', icon: <Globe size={14} /> },
  { value: 'fr-FR', label: 'French (France)', icon: <Globe size={14} /> },
  { value: 'de-DE', label: 'German (Germany)', icon: <Globe size={14} /> },
  { value: 'zh-CN', label: 'Chinese (Simplified)', icon: <Globe size={14} /> },
  { value: 'ja-JP', label: 'Japanese (Japan)', icon: <Globe size={14} /> },
  { value: 'ar-SA', label: 'Arabic (Saudi Arabia)', icon: <Globe size={14} /> },
  { value: 'pt-BR', label: 'Portuguese (Brazil)', icon: <Globe size={14} /> },
  { value: 'ru-RU', label: 'Russian (Russia)', icon: <Globe size={14} /> },
  { value: 'it-IT', label: 'Italian (Italy)', icon: <Globe size={14} /> },
  { value: 'ko-KR', label: 'Korean (South Korea)', icon: <Globe size={14} /> },
  { value: 'tr-TR', label: 'Turkish (Turkey)', icon: <Globe size={14} /> },
  { value: 'nl-NL', label: 'Dutch (Netherlands)', icon: <Globe size={14} /> },
  { value: 'id-ID', label: 'Indonesian (Indonesia)', icon: <Globe size={14} /> },
  { value: 'th-TH', label: 'Thai (Thailand)', icon: <Globe size={14} /> },
  { value: 'vi-VN', label: 'Vietnamese (Vietnam)', icon: <Globe size={14} /> },
];

export const WORKING_DAYS_OPTIONS: SelectOption[] = [
  { value: 'Monday,Tuesday,Wednesday,Thursday,Friday', label: 'Mon - Fri (Corporate)' },
  { value: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday', label: 'Mon - Sat (6 Days)' },
  { value: 'Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday', label: 'Mon - Sun (Full Week)' },
  { value: 'Sunday,Monday,Tuesday,Wednesday,Thursday', label: 'Sun - Thu (Middle East)' },
];

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Asia/Kolkata',             label: '(GMT+05:30) India — Chennai, Kolkata, Mumbai, New Delhi' },
  { value: 'UTC',                       label: '(GMT+00:00) UTC — Coordinated Universal Time' },
  { value: 'Europe/London',            label: '(GMT+00:00) London — Dublin, Edinburgh, Lisbon' },
  { value: 'Africa/Monrovia',          label: '(GMT+00:00) Monrovia, Reykjavik' },
  { value: 'Europe/Amsterdam',         label: '(GMT+01:00) Amsterdam, Berlin, Rome, Stockholm, Vienna' },
  { value: 'Europe/Belgrade',          label: '(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana' },
  { value: 'Europe/Paris',             label: '(GMT+01:00) Brussels, Copenhagen, Madrid, Paris' },
  { value: 'Europe/Warsaw',            label: '(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb' },
  { value: 'Africa/Lagos',             label: '(GMT+01:00) West Central Africa' },
  { value: 'Europe/Athens',            label: '(GMT+02:00) Athens, Bucharest' },
  { value: 'Africa/Cairo',             label: '(GMT+02:00) Cairo' },
  { value: 'Africa/Harare',            label: '(GMT+02:00) Harare, Pretoria' },
  { value: 'Europe/Helsinki',          label: '(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius' },
  { value: 'Asia/Jerusalem',           label: '(GMT+02:00) Jerusalem' },
  { value: 'Asia/Amman',               label: '(GMT+02:00) Amman' },
  { value: 'Asia/Baghdad',             label: '(GMT+03:00) Baghdad' },
  { value: 'Asia/Riyadh',              label: '(GMT+03:00) Kuwait, Riyadh' },
  { value: 'Europe/Moscow',            label: '(GMT+03:00) Moscow, St. Petersburg, Volgograd' },
  { value: 'Africa/Nairobi',           label: '(GMT+03:00) Nairobi' },
  { value: 'Asia/Tehran',              label: '(GMT+03:30) Tehran' },
  { value: 'Asia/Dubai',               label: '(GMT+04:00) Abu Dhabi, Muscat' },
  { value: 'Asia/Baku',                label: '(GMT+04:00) Baku' },
  { value: 'Asia/Yerevan',             label: '(GMT+04:00) Yerevan' },
  { value: 'Asia/Kabul',               label: '(GMT+04:30) Kabul' },
  { value: 'Asia/Yekaterinburg',       label: '(GMT+05:00) Ekaterinburg' },
  { value: 'Asia/Karachi',             label: '(GMT+05:00) Islamabad, Karachi' },
  { value: 'Asia/Colombo',             label: '(GMT+05:30) Sri Jayawardenepura' },
  { value: 'Asia/Kathmandu',           label: '(GMT+05:45) Kathmandu' },
  { value: 'Asia/Almaty',              label: '(GMT+06:00) Almaty, Novosibirsk' },
  { value: 'Asia/Dhaka',               label: '(GMT+06:00) Astana, Dhaka' },
  { value: 'Asia/Yangon',              label: '(GMT+06:30) Yangon (Rangoon)' },
  { value: 'Asia/Bangkok',             label: '(GMT+07:00) Bangkok, Hanoi, Jakarta' },
  { value: 'Asia/Krasnoyarsk',         label: '(GMT+07:00) Krasnoyarsk' },
  { value: 'Asia/Shanghai',            label: '(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi' },
  { value: 'Asia/Singapore',           label: '(GMT+08:00) Kuala Lumpur, Singapore' },
  { value: 'Asia/Taipei',              label: '(GMT+08:00) Taipei' },
  { value: 'Australia/Perth',          label: '(GMT+08:00) Perth' },
  { value: 'Asia/Irkutsk',             label: '(GMT+08:00) Irkutsk, Ulaanbaatar' },
  { value: 'Asia/Tokyo',               label: '(GMT+09:00) Osaka, Sapporo, Tokyo' },
  { value: 'Asia/Seoul',               label: '(GMT+09:00) Seoul' },
  { value: 'Asia/Yakutsk',             label: '(GMT+09:00) Yakutsk' },
  { value: 'Australia/Adelaide',       label: '(GMT+09:30) Adelaide' },
  { value: 'Australia/Darwin',         label: '(GMT+09:30) Darwin' },
  { value: 'Australia/Brisbane',       label: '(GMT+10:00) Brisbane' },
  { value: 'Australia/Sydney',         label: '(GMT+10:00) Canberra, Melbourne, Sydney' },
  { value: 'Pacific/Guam',             label: '(GMT+10:00) Guam, Port Moresby' },
  { value: 'Australia/Hobart',         label: '(GMT+10:00) Hobart' },
  { value: 'Asia/Vladivostok',         label: '(GMT+10:00) Vladivostok' },
  { value: 'Pacific/Noumea',           label: '(GMT+11:00) Magadan, Solomon Is., New Caledonia' },
  { value: 'Pacific/Auckland',         label: '(GMT+12:00) Auckland, Wellington' },
  { value: 'Pacific/Fiji',             label: '(GMT+12:00) Fiji, Kamchatka, Marshall Is.' },
  { value: 'Pacific/Tongatapu',        label: "(GMT+13:00) Nuku'alofa" },
  { value: 'Atlantic/Azores',          label: '(GMT-01:00) Azores' },
  { value: 'Atlantic/Cape_Verde',      label: '(GMT-01:00) Cape Verde Is.' },
  { value: 'America/Noronha',          label: '(GMT-02:00) Mid-Atlantic' },
  { value: 'America/Sao_Paulo',        label: '(GMT-03:00) Brasilia' },
  { value: 'America/Cayenne',          label: '(GMT-03:00) Georgetown' },
  { value: 'America/Godthab',          label: '(GMT-03:00) Greenland' },
  { value: 'America/St_Johns',         label: '(GMT-03:30) Newfoundland' },
  { value: 'America/Halifax',          label: '(GMT-04:00) Atlantic Time (Canada)' },
  { value: 'America/Caracas',          label: '(GMT-04:00) Caracas, La Paz' },
  { value: 'America/Manaus',           label: '(GMT-04:00) Manaus' },
  { value: 'America/Santiago',         label: '(GMT-04:00) Santiago' },
  { value: 'America/Bogota',           label: '(GMT-05:00) Bogota, Lima, Quito, Rio Branco' },
  { value: 'America/New_York',         label: '(GMT-05:00) Eastern Time (US & Canada)' },
  { value: 'America/Indiana/Indianapolis', label: '(GMT-05:00) Indiana (East)' },
  { value: 'America/Guatemala',        label: '(GMT-06:00) Central America' },
  { value: 'America/Chicago',          label: '(GMT-06:00) Central Time (US & Canada)' },
  { value: 'America/Mexico_City',      label: '(GMT-06:00) Guadalajara, Mexico City, Monterrey' },
  { value: 'America/Regina',           label: '(GMT-06:00) Saskatchewan' },
  { value: 'America/Phoenix',          label: '(GMT-07:00) Arizona' },
  { value: 'America/Chihuahua',        label: '(GMT-07:00) Chihuahua, La Paz, Mazatlan' },
  { value: 'America/Denver',           label: '(GMT-07:00) Mountain Time (US & Canada)' },
  { value: 'America/Los_Angeles',      label: '(GMT-08:00) Pacific Time (US & Canada)' },
  { value: 'America/Tijuana',          label: '(GMT-08:00) Tijuana, Baja California' },
  { value: 'America/Anchorage',        label: '(GMT-09:00) Alaska' },
  { value: 'Pacific/Honolulu',         label: '(GMT-10:00) Hawaii' },
  { value: 'Pacific/Midway',           label: '(GMT-11:00) Midway Island, Samoa' },
  { value: 'Pacific/Pago_Pago',        label: '(GMT-12:00) International Date Line West' },
];

export const getSettingOptions = (key: string): SelectOption[] | null => {
  switch (key) {
    case 'CurrencySymbol': return CURRENCY_OPTIONS;
    case 'DateFormat': return DATE_FORMAT_OPTIONS;
    case 'System_Language': return LANGUAGE_OPTIONS;
    case 'System_TimeZone': return TIMEZONE_OPTIONS;
    default: return null;
  }
};


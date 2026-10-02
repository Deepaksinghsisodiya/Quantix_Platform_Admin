import React, { useState } from 'react';
import { Code2, Check, AlertTriangle, FileCode } from 'lucide-react';

interface JsonLdEditorProps {
  value?: string;
  onChange: (newValue: string) => void;
  siteVariant: string;
}

export const JsonLdEditor: React.FC<JsonLdEditorProps> = ({
  value = '',
  onChange,
  siteVariant,
}) => {
  const [isValidJson, setIsValidJson] = useState<boolean>(true);

  const handleTextChange = (text: string) => {
    onChange(text);
    if (!text.trim()) {
      setIsValidJson(true);
      return;
    }
    try {
      JSON.parse(text);
      setIsValidJson(true);
    } catch {
      setIsValidJson(false);
    }
  };

  const loadSampleTemplate = () => {
    const sample = {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": `Quantix ${siteVariant} POS`,
      "applicationCategory": siteVariant.toLowerCase() === 'restaurant'
        ? "FoodAndBeverageApplication"
        : siteVariant.toLowerCase() === 'retail'
        ? "ShoppingApplication"
        : "BusinessApplication",
      "operatingSystem": "Web, Windows, Android, iOS",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1250"
      }
    };
    const formatted = JSON.stringify(sample, null, 2);
    onChange(formatted);
    setIsValidJson(true);
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Code2 className="w-3.5 h-3.5 text-orange-500" />
          <span>Structured Data (JSON-LD / Schema.org)</span>
        </label>

        <div className="flex items-center gap-2">
          {isValidJson ? (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" /> Valid JSON
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10.5px] font-medium text-red-600 dark:text-red-400">
              <AlertTriangle className="w-3 h-3" /> Invalid JSON Format
            </span>
          )}

          <button
            type="button"
            onClick={loadSampleTemplate}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10.5px] font-mono font-bold bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 transition-colors cursor-pointer"
          >
            <FileCode className="w-3 h-3" />
            <span>Load {siteVariant} Schema</span>
          </button>
        </div>
      </div>

      <textarea
        value={value}
        onChange={(e) => handleTextChange(e.target.value)}
        rows={6}
        placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "SoftwareApplication",\n  "name": "Quantix ${siteVariant} POS"\n}`}
        className={`w-full font-mono text-xs p-3 rounded-xl border bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 transition-all ${
          isValidJson
            ? 'border-slate-800 focus:ring-orange-500/40 focus:border-orange-500'
            : 'border-red-500 focus:ring-red-500/40'
        }`}
      />
    </div>
  );
};

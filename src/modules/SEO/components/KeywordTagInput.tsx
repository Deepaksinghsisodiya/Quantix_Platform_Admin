import React, { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';

interface KeywordTagInputProps {
  value: string; // Comma-separated string
  onChange: (newValue: string) => void;
  recommendedKeywords?: string[];
}

export const KeywordTagInput: React.FC<KeywordTagInputProps> = ({
  value,
  onChange,
  recommendedKeywords = [],
}) => {
  const [inputValue, setInputValue] = useState('');

  // Parse value into array
  const tags = value
    ? value
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0)
    : [];

  const addTag = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (tags.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }
    const newTags = [...tags, trimmed];
    onChange(newTags.join(', '));
    setInputValue('');
  };

  const removeTag = (indexToRemove: number) => {
    const newTags = tags.filter((_, idx) => idx !== indexToRemove);
    onChange(newTags.join(', '));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Tag className="w-3.5 h-3.5 text-orange-500" />
          <span>SEO Focus Ranking Keywords</span>
        </label>
        <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
          {tags.length} keyword{tags.length === 1 ? '' : 's'} added
        </span>
      </div>

      {/* Main Tag Container */}
      <div className="min-h-24 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-orange-500/40 focus-within:border-orange-500 transition-all flex flex-wrap items-center gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800/80 text-xs font-medium text-orange-800 dark:text-orange-200 shadow-xs"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="hover:bg-orange-200 dark:hover:bg-orange-900 p-0.5 rounded-full transition-colors cursor-pointer"
              title="Remove keyword"
            >
              <X className="w-3 h-3 text-orange-600 dark:text-orange-300" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? "Type keyword and press Enter or comma (e.g. 'restaurant pos')" : "Add more..."}
          className="flex-1 min-w-48 bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-1"
        />
      </div>

      {/* Recommended Suggestions */}
      {recommendedKeywords.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Suggested High-Traffic Keywords:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {recommendedKeywords.map((recKey, idx) => {
              const isAlreadyAdded = tags.some((t) => t.toLowerCase() === recKey.toLowerCase());
              if (isAlreadyAdded) return null;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => addTag(recKey)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-slate-100 dark:bg-slate-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-300 transition-colors border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>{recKey}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

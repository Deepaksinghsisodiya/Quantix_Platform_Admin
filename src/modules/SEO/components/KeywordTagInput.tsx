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
        <label className="flex items-center gap-1.5 text-xs font-bold text-surface-700 dark:text-surface-300">
          <Tag className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
          <span>SEO Focus Ranking Keywords</span>
        </label>
        <span className="text-[11px] font-mono font-medium text-surface-500 dark:text-surface-400">
          {tags.length} keyword{tags.length === 1 ? '' : 's'} added
        </span>
      </div>

      {/* Main Tag Container */}
      <div className="min-h-24 p-2.5 rounded-xl border border-surface-200 dark:border-surface-800 bg-surface-0 dark:bg-surface-950 focus-within:ring-2 focus-within:ring-primary-500/30 focus-within:border-primary-500 transition-all flex flex-wrap items-center gap-2">
        {tags.map((tag, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 text-xs font-medium text-primary-800 dark:text-primary-200 shadow-xs"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="hover:bg-primary-200 dark:hover:bg-primary-900 p-0.5 rounded-full transition-colors cursor-pointer text-primary-600 dark:text-primary-300"
              title="Remove keyword"
            >
              <X className="w-3 h-3" />
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
          className="flex-1 min-w-48 bg-transparent text-xs text-surface-900 dark:text-surface-100 placeholder:text-surface-400 focus:outline-none py-1"
        />
      </div>

      {/* Recommended Suggestions */}
      {recommendedKeywords.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-surface-500 dark:text-surface-400 block">
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
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono bg-surface-100 dark:bg-surface-800 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-surface-700 dark:text-surface-300 hover:text-primary-600 dark:hover:text-primary-300 transition-colors border border-surface-200 dark:border-surface-700 cursor-pointer"
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

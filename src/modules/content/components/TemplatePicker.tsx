import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutTemplate } from 'lucide-react';
import { useGetArticleTemplatesQuery, type ArticleTemplate, type ArticleTemplateKind } from '../services/templatesApi';

/**
 * 2026-09-08 (content Phase 4). "Start from a template" for the blog and help editors.
 *
 * Picking a template hands its fields to the editor; the editor decides what to overwrite. When
 * the body already has text the editor asks before replacing it, so a mis-click cannot wipe a
 * draft. Editing a template later never changes an article already written from it.
 */
interface Props {
  kind: Exclude<ArticleTemplateKind, 'Any'>;
  /** The editor already has body text — the picker will confirm before replacing it. */
  hasContent: boolean;
  onApply: (template: ArticleTemplate) => void;
}

export const TemplatePicker: React.FC<Props> = ({ kind, hasContent, onApply }) => {
  const query = useGetArticleTemplatesQuery({ kind });
  const templates = query.data?.data ?? [];

  const choose = (templateId: string) => {
    const template = templates.find((t) => t.templateId === templateId);
    if (!template) return;
    if (hasContent && !window.confirm(`Replace the current body with the "${template.name}" template?`)) return;
    onApply(template);
  };

  return (
    <div className="flex items-center gap-2">
      <LayoutTemplate className="h-4 w-4 text-slate-400" />
      {query.isError ? (
        <span className="text-xs text-red-600 dark:text-red-400">Templates could not be loaded.</span>
      ) : templates.length === 0 && !query.isLoading ? (
        <span className="text-xs text-slate-500 dark:text-slate-400">
          No templates yet — <Link to="/content/templates" className="text-indigo-600 hover:underline dark:text-indigo-400">create one</Link>.
        </span>
      ) : (
        <select
          value=""
          onChange={(e) => choose(e.target.value)}
          disabled={query.isLoading}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          aria-label="Start from a template"
        >
          <option value="">{query.isLoading ? 'Loading templates…' : 'Start from a template…'}</option>
          {templates.map((t) => (
            <option key={t.templateId} value={t.templateId}>{t.name}</option>
          ))}
        </select>
      )}
    </div>
  );
};

export default TemplatePicker;

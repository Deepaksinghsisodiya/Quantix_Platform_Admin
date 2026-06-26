import React from 'react';
import { Link } from 'react-router-dom';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { Newspaper, MessageSquare, FileText, ArrowRight, HelpCircle } from 'lucide-react';

export const ContentManagerDashboard: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <header className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">Content Manager</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-medium">
            Manage public website pages, blog entries, FAQ lists, help articles, and CRM leads.
          </p>
        </div>
        <ATMBadge label="Live" color="primary" />
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <QuickCard to="/content/blog" icon={Newspaper} title="Blog Manager" subtitle="Manage drafts & posts" />
        <QuickCard to="/content/help" icon={HelpCircle} title="Help Center" subtitle="Manage self-service articles" />
        <QuickCard to="/content/faq" icon={FileText} title="Public FAQ" subtitle="Update help questions" />
        <QuickCard to="/support/leads" icon={MessageSquare} title="Sales Leads" subtitle="Track pipeline opportunities" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="CRM Workspace & Responses">
          <ul className="space-y-3 font-semibold text-sm">
            <li>
              <Link to="/support/leads" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
                <span>Access Sales Leads Pipeline</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
            <li>
              <Link to="/support/canned-responses" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
                <span>Manage Support Canned Responses</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
            <li>
              <Link to="/content/marketing" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
                <span>Update Marketing Pages Content</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          </ul>
        </ATMCard>

        <ATMCard title="Content Quick Actions">
          <ul className="space-y-3 font-semibold text-sm">
            <li>
              <Link to="/content/blog/new" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
                <span>Create New Blog Post</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
            <li>
              <Link to="/content/help" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
                <span>Write New Help Center Article</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
            <li>
              <Link to="/content/faq" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
                <span>Add Custom Q&A Entry</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          </ul>
        </ATMCard>
      </div>
    </div>
  );
};

interface QuickCardProps {
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
}

function QuickCard({ to, icon: Icon, title, subtitle }: QuickCardProps) {
  return (
    <Link to={to} className="block group">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-accent-500/30 hover:shadow-lg transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 flex flex-col justify-between h-36">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{title}</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 group-hover:text-accent-500 transition-colors">{subtitle}</p>
          </div>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-950 p-2 text-gray-500 dark:text-gray-450 group-hover:bg-accent-50 group-hover:text-accent-500 dark:group-hover:bg-accent-950/20 transition-all">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-accent-600 group-hover:text-accent-700 dark:text-accent-400">
          <span>Open</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </Link>
  );
}

export default ContentManagerDashboard;

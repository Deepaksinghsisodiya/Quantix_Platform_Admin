import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ATMCard } from '@/shared/ui/ATMCard';
import { ATMStatsCard } from '@/shared/ui/ATMStatsCard';
import { ATMBadge } from '@/shared/ui/ATMBadge';
import { ATMPageHeader } from '@/shared/components/ATMPageHeader';
import { Newspaper, MessageSquare, FileText, ArrowRight, HelpCircle, Clock } from 'lucide-react';

export interface ContentCounts {
  readonly blogPosts: number;
  readonly helpArticles: number;
  readonly faqs: number;
  /** Leads still in the New state. */
  readonly newLeads: number;
}

interface ContentManagerDashboardProps {
  counts: ContentCounts;
  isFetching: boolean;
}

// 2026-09-05: real totals from the paged envelope — no more "200+" at a fetch cap.
const countLabel = (n: number) => n.toLocaleString();

/** 2026-09-04: counts replace the four link-only cards. */
export const ContentManagerDashboard: React.FC<ContentManagerDashboardProps> = ({ counts, isFetching }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full space-y-6 animate-fade-in">
      <ATMPageHeader
        icon={Newspaper}
        iconColor="theme"
        title="Content Manager"
        subtitle="Manage public website pages, blog entries, FAQ lists, help articles, and CRM leads."
        extraActions={
          <div className="flex items-center gap-3">
            {isFetching && <Clock className="h-4 w-4 animate-spin text-accent-500" />}
            <ATMBadge label="Live" color="primary" />
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ATMStatsCard
          label="Blog Posts"
          value={countLabel(counts.blogPosts)}
          icon={Newspaper}
          variant="accent"
          description="Drafts and published posts"
          onClick={() => navigate('/content/blog')}
        />
        <ATMStatsCard
          label="Help Articles"
          value={countLabel(counts.helpArticles)}
          icon={HelpCircle}
          variant="indigo"
          description="Self-service articles"
          onClick={() => navigate('/content/help')}
        />
        <ATMStatsCard
          label="FAQ Entries"
          value={countLabel(counts.faqs)}
          icon={FileText}
          variant="emerald"
          description="Public questions and answers"
          onClick={() => navigate('/content/faq')}
        />
        <ATMStatsCard
          label="New Leads"
          value={countLabel(counts.newLeads)}
          icon={MessageSquare}
          variant="amber"
          description="Not yet contacted"
          onClick={() => navigate('/content/leads')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ATMCard title="CRM Workspace & Responses">
          <ul className="space-y-3 font-semibold text-sm">
            <li>
              <Link to="/content/leads" className="flex items-center justify-between text-accent-600 hover:text-accent-700 dark:text-accent-400 dark:hover:text-accent-300">
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

export default ContentManagerDashboard;

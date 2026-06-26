import React, { useState } from 'react';
import { ATMBadge, ATMButton, ATMCard, ATMModal } from '@/shared/ui';
import { Plus, GripVertical, Pencil, Trash2, ChevronDown, ChevronUp, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils/cn';

/* -------------------------------------------------------------------------- */
/*  Types & Mock data                                                          */
/* -------------------------------------------------------------------------- */

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
}

const FAQ_CATEGORIES = ['General', 'Billing', 'Technical', 'Features'];

const ENTERPRISE_FAQS: FAQ[] = [
  { id: 'e1', question: 'What is included in the Enterprise plan?', answer: 'The Enterprise plan includes multi-location management, real-time cloud sync, advanced analytics, KDS integration, dedicated support, and custom API access. You also get priority onboarding and a dedicated account manager.', category: 'General', order: 1 },
  { id: 'e2', question: 'How does multi-location billing work?', answer: 'Enterprise billing is calculated per location with volume discounts. Each location is billed at the base plan rate, with automatic discounts applied at 5+, 10+, and 25+ location thresholds. Commission rates also decrease with volume.', category: 'Billing', order: 2 },
  { id: 'e3', question: 'Can I sync data across all my locations?', answer: 'Yes, real-time sync is a core Enterprise feature. All locations share a unified cloud database with conflict resolution. Changes propagate within seconds when online, and offline changes are queued automatically.', category: 'Technical', order: 3 },
  { id: 'e4', question: 'What happens if my internet goes down?', answer: 'Quantix POS continues operating in offline mode. All transactions are stored locally and automatically synced when connectivity is restored. The sync service handles conflict resolution using last-write-wins with configurable priority.', category: 'Technical', order: 4 },
  { id: 'e5', question: 'How do I add a new location?', answer: 'Navigate to the Location Management section in your admin dashboard and click "Add Location". Enter the location details, assign a plan tier, and provision terminals. The new location will automatically receive the latest menu and product data via sync.', category: 'Features', order: 5 },
  { id: 'e6', question: 'What support channels are available?', answer: 'Enterprise customers have access to priority email support (4-hour SLA), live chat during business hours, phone support for urgent issues, and a dedicated Slack channel for real-time communication with our team.', category: 'General', order: 6 },
];

const STANDALONE_FAQS: FAQ[] = [
  { id: 's1', question: 'What is a Standalone license?', answer: 'A Standalone license allows you to operate Quantix POS independently without cloud connectivity. The software runs locally with all core features. You purchase token-based licenses that activate the software on specific devices.', category: 'General', order: 1 },
  { id: 's2', question: 'How does token licensing work?', answer: 'Token licenses are one-time purchases that activate Quantix POS on a specific number of devices. Tokens are tied to hardware and include a validity period. You can manage and transfer tokens through the platform portal.', category: 'Billing', order: 2 },
  { id: 's3', question: 'Can I upgrade from Standalone to Enterprise?', answer: 'Yes, you can upgrade at any time. Contact our sales team to initiate the migration. Your existing data will be migrated to the cloud, and your remaining token validity will be credited toward your Enterprise subscription.', category: 'General', order: 3 },
  { id: 's4', question: 'Do I need internet for Standalone POS?', answer: 'No, Standalone POS operates fully offline. Internet is only required for initial token activation and optional software updates. All POS functionality works without connectivity.', category: 'Technical', order: 4 },
  { id: 's5', question: 'How do I get software updates?', answer: 'Software updates are available through the Downloads section of the platform portal. Download the latest version and install it on your devices. Updates are included in your license for the token validity period.', category: 'Technical', order: 5 },
  { id: 's6', question: 'What payment methods are accepted for tokens?', answer: 'We accept credit/debit cards (Visa, Mastercard, Amex), bank transfers, and PayPal. Enterprise customers can also pay via invoice with NET-30 terms.', category: 'Billing', order: 6 },
];

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

function FAQPage() {
  const [activeTab, setActiveTab] = useState<'enterprise' | 'standalone'>('enterprise');
  const [enterpriseFaqs, setEnterpriseFaqs] = useState<FAQ[]>(ENTERPRISE_FAQS);
  const [standaloneFaqs, setStandaloneFaqs] = useState<FAQ[]>(STANDALONE_FAQS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  const faqs = activeTab === 'enterprise' ? enterpriseFaqs : standaloneFaqs;
  const setFaqs = activeTab === 'enterprise' ? setEnterpriseFaqs : setStandaloneFaqs;

  const handleDelete = (id: string) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
    toast.success('FAQ deleted');
  };

  const handleAdd = () => {
    if (!newQuestion.trim() || !newAnswer.trim()) {
      toast.error('Please fill in both question and answer');
      return;
    }
    const newFaq: FAQ = {
      id: `${activeTab.charAt(0)}${Date.now()}`,
      question: newQuestion,
      answer: newAnswer,
      category: newCategory,
      order: faqs.length + 1,
    };
    setFaqs((prev) => [...prev, newFaq]);
    setNewQuestion('');
    setNewAnswer('');
    setNewCategory('General');
    setShowAddForm(false);
    toast.success('FAQ added');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
            FAQ Management
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage frequently asked questions for Enterprise and Standalone customers.
          </p>
        </div>
        <ATMButton variant="primary" size="md" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddForm(true)}>
          Add FAQ
        </ATMButton>
      </div>

      {/* Tab toggle */}
      <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 w-fit">
        {(['enterprise', 'standalone'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => { setActiveTab(tab); setExpandedId(null); }}
            className={cn(
              'px-4 py-2 text-sm font-medium capitalize transition-colors',
              tab === 'enterprise' ? 'rounded-l-lg' : 'rounded-r-lg',
              activeTab === tab
                ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
            )}
          >
            {tab} FAQs
          </button>
        ))}
      </div>

      {/* FAQ list */}
      <div className="space-y-2">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-center gap-3 px-4 py-3">
              {/* Drag handle (visual only) */}
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-gray-300 dark:text-gray-600" />

              {/* Order */}
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-gray-100 text-xs font-bold tabular-nums text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                {faq.order}
              </span>

              {/* Question */}
              <button
                type="button"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                className="flex flex-1 items-center gap-2 text-left"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{faq.question}</span>
              </button>

              {/* Category */}
              <ATMBadge variant="outline" size="sm">{faq.category}</ATMBadge>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <ATMButton variant="ghost" size="sm" onClick={() => toast('Edit modal coming soon')}>
                  <Pencil className="h-3.5 w-3.5" />
                </ATMButton>
                <ATMButton variant="ghost" size="sm" onClick={() => handleDelete(faq.id)}>
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </ATMButton>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
                  className="rounded p-1 text-gray-400 hover:text-gray-600"
                >
                  {expandedId === faq.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Expanded answer */}
            {expandedId === faq.id && (
              <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add FAQ modal */}
      <ATMModal open={showAddForm} onClose={() => setShowAddForm(false)} title="Add FAQ" size="md">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Enter the FAQ question..."
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Enter the answer..."
              rows={5}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              {FAQ_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <ATMButton variant="secondary" size="sm" onClick={() => setShowAddForm(false)}>Cancel</ATMButton>
            <ATMButton variant="primary" size="sm" onClick={handleAdd}>Add FAQ</ATMButton>
          </div>
        </div>
      </ATMModal>
    </div>
  );
}

export default FAQPage;

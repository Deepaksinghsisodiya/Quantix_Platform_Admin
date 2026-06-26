/**
 * Pass 40o (2026-05-25) â€” client-side invoice "download" via printable HTML view.
 *
 * The backend GetInvoicePdfDataAsync returns the InvoiceDto + merchant header
 * fields. For v1 we render those into a clean printable HTML page in a popup
 * window; the merchant uses the browser's "Save as PDF" or "Print" to produce
 * a PDF. A server-rendered PDF (QuestPDF) is a Pass-41+ enhancement; this v1
 * keeps zero new backend dependencies.
 */
import { merchantSelf } from '@/lib/api/merchantSelf';

interface InvoicePdfPayload {
  invoice: {
    invoiceId: string;
    invoiceNumber: string;
    invoiceType: string;
    invoiceDate: string;
    periodStartDate?: string;
    periodEndDate?: string;
    subtotalTokens?: number;
    taxTokens?: number;
    totalTokens?: number;
    subtotalCurrency?: number;
    taxCurrency?: number;
    totalCurrency?: number;
    currencyCode?: string;
    status: string;
    paidAt?: string | null;
    paymentReference?: string | null;
    lineItems?: string;
    notes?: string | null;
  };
  merchantCompanyName: string;
  merchantContactEmail: string;
  merchantAddress?: string | null;
}

export async function openInvoiceForDownload(invoiceId: string): Promise<void> {
  const res = await merchantSelf.downloadInvoice(invoiceId);
  const data = res.data as InvoicePdfPayload | undefined;
  if (!data) throw new Error('Invoice data missing from response.');

  const lines: Array<{ description?: string; tokens?: number; currency?: number }> = (() => {
    try { return JSON.parse(data.invoice.lineItems ?? '[]'); } catch { return []; }
  })();

  const html = `<!doctype html>
<html><head>
<meta charset="utf-8">
<title>Invoice ${escapeHtml(data.invoice.invoiceNumber)}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:system-ui,-apple-system,sans-serif;color:#222;padding:32px;line-height:1.5}
  header{display:flex;justify-content:space-between;align-items:start;border-bottom:2px solid #333;padding-bottom:16px;margin-bottom:24px}
  h1{font-size:28px;font-weight:700;letter-spacing:-0.5px}
  h2{font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#666;margin-bottom:4px}
  .meta{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:24px 0}
  .meta-block strong{display:block;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#999;margin-bottom:4px}
  table{width:100%;border-collapse:collapse;margin:24px 0}
  th,td{padding:10px 12px;text-align:left;border-bottom:1px solid #eee}
  th{background:#f6f6f6;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;color:#666}
  td.amt{text-align:right;font-variant-numeric:tabular-nums}
  .totals{margin-top:16px;display:flex;justify-content:flex-end}
  .totals table{width:300px}
  .totals td.amt{font-weight:600}
  .totals tr.grand td{border-top:2px solid #333;border-bottom:none;padding-top:12px;font-size:16px}
  .status{display:inline-block;padding:4px 10px;border-radius:4px;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:600}
  .status.paid{background:#dcfce7;color:#15803d}
  .status.issued{background:#dbeafe;color:#1d4ed8}
  .status.void{background:#fee2e2;color:#b91c1c}
  .actions{margin-top:32px;text-align:center}
  button{padding:10px 20px;border-radius:6px;border:none;font-size:14px;font-weight:600;cursor:pointer;margin:0 6px}
  .print{background:#2563eb;color:#fff}
  @media print{ .actions{display:none} body{padding:24px} }
</style>
</head><body>
<header>
  <div>
    <h1>Invoice</h1>
    <p style="color:#666;font-size:13px;margin-top:4px">#${escapeHtml(data.invoice.invoiceNumber)}</p>
  </div>
  <div style="text-align:right">
    <h2>Quantix Platform</h2>
    <p style="font-size:12px;color:#666">Token-based billing</p>
    <p style="margin-top:8px"><span class="status ${data.invoice.status.toLowerCase()}">${escapeHtml(data.invoice.status)}</span></p>
  </div>
</header>

<div class="meta">
  <div class="meta-block">
    <strong>Billed to</strong>
    <div>${escapeHtml(data.merchantCompanyName)}</div>
    <div style="color:#666;font-size:13px">${escapeHtml(data.merchantContactEmail)}</div>
    ${data.merchantAddress ? `<div style="color:#666;font-size:13px">${escapeHtml(data.merchantAddress)}</div>` : ''}
  </div>
  <div class="meta-block" style="text-align:right">
    <strong>Invoice date</strong>
    <div>${formatDate(data.invoice.invoiceDate)}</div>
    ${data.invoice.periodStartDate && data.invoice.periodEndDate ? `
      <div style="margin-top:8px"><strong>Period</strong></div>
      <div>${formatDate(data.invoice.periodStartDate)} â€” ${formatDate(data.invoice.periodEndDate)}</div>
    ` : ''}
    ${data.invoice.paidAt ? `
      <div style="margin-top:8px"><strong>Paid</strong></div>
      <div>${formatDate(data.invoice.paidAt)}</div>
      ${data.invoice.paymentReference ? `<div style="font-family:monospace;font-size:11px;color:#666">${escapeHtml(data.invoice.paymentReference)}</div>` : ''}
    ` : ''}
  </div>
</div>

<table>
  <thead>
    <tr><th>Description</th><th class="amt">Tokens</th><th class="amt">Amount</th></tr>
  </thead>
  <tbody>
    ${lines.length === 0
      ? `<tr><td colspan="3" style="color:#888;text-align:center;padding:24px">No line items.</td></tr>`
      : lines.map(l => `
        <tr>
          <td>${escapeHtml(l.description ?? '')}</td>
          <td class="amt">${(l.tokens ?? 0).toFixed(2)}</td>
          <td class="amt">${(l.currency ?? 0).toFixed(2)} ${escapeHtml(data.invoice.currencyCode ?? '')}</td>
        </tr>`).join('')}
  </tbody>
</table>

<div class="totals">
  <table>
    <tr><td>Subtotal</td><td class="amt">${(data.invoice.subtotalCurrency ?? 0).toFixed(2)} ${escapeHtml(data.invoice.currencyCode ?? '')}</td></tr>
    ${data.invoice.taxCurrency ? `<tr><td>Tax</td><td class="amt">${data.invoice.taxCurrency.toFixed(2)} ${escapeHtml(data.invoice.currencyCode ?? '')}</td></tr>` : ''}
    <tr class="grand"><td>Total</td><td class="amt">${(data.invoice.totalCurrency ?? 0).toFixed(2)} ${escapeHtml(data.invoice.currencyCode ?? '')}</td></tr>
  </table>
</div>

${data.invoice.notes ? `<div style="margin-top:24px;padding:12px;background:#f9fafb;border-radius:6px;font-size:13px;color:#555"><strong>Notes:</strong> ${escapeHtml(data.invoice.notes)}</div>` : ''}

<div class="actions">
  <button class="print" onclick="window.print()">Save as PDF / Print</button>
  <button onclick="window.close()">Close</button>
</div>
</body></html>`;

  const w = window.open('', '_blank', 'width=900,height=1100');
  if (!w) throw new Error('Pop-up blocked. Please allow pop-ups to download invoices.');
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s: string | null | undefined): string {
  if (!s) return '';
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
}

function formatDate(s?: string | null): string {
  if (!s) return '';
  try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return s; }
}

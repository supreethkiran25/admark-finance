import { BankTransaction, Expense, Invoice } from '../types/finance';
import { autoCategorizeMerchant } from './rulesEngine';

export interface ParsedCSVResult {
  transactions: Array<Omit<BankTransaction, 'id' | 'statementId'>>;
  headers: string[];
  totalRows: number;
  warnings: string[];
}

export function parseBankStatementCSV(rawContent: string): ParsedCSVResult {
  const lines = rawContent.split(/\r?\n/).filter(line => line.trim().length > 0);
  const warnings: string[] = [];

  if (lines.length === 0) {
    return { transactions: [], headers: [], totalRows: 0, warnings: ['File is empty.'] };
  }

  // Detect separator (comma or tab or semicolon)
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  // Helper to split CSV row taking quotes into account
  const splitRow = (row: string): string[] => {
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    if (delimiter !== ',') {
      return row.split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
    }
    const matches: string[] = [];
    let match;
    while ((match = regex.exec(row)) !== null) {
      if (match.index === regex.lastIndex) regex.lastIndex++;
      let val = match[1] ?? '';
      val = val.trim().replace(/^"|"$/g, '').replace(/""/g, '"');
      matches.push(val);
      if (regex.lastIndex >= row.length) break;
    }
    return matches.length > 0 ? matches : row.split(',');
  };

  const rawHeaders = splitRow(lines[0]).map(h => h.trim().toLowerCase());
  
  // Find column indices
  let dateIdx = rawHeaders.findIndex(h => h.includes('date') || h.includes('time'));
  let merchantIdx = rawHeaders.findIndex(h => h.includes('merchant') || h.includes('description') || h.includes('payee') || h.includes('name') || h.includes('details'));
  let debitIdx = rawHeaders.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('amount') || h.includes('out'));
  let creditIdx = rawHeaders.findIndex(h => h.includes('credit') || h.includes('deposit') || h.includes('in'));
  let balanceIdx = rawHeaders.findIndex(h => h.includes('balance'));
  let refIdx = rawHeaders.findIndex(h => h.includes('ref') || h.includes('id') || h.includes('trans') || h.includes('check'));

  if (dateIdx === -1) dateIdx = 0;
  if (merchantIdx === -1) merchantIdx = 1;
  if (debitIdx === -1) debitIdx = 2;

  const transactions: Array<Omit<BankTransaction, 'id' | 'statementId'>> = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitRow(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = cols[dateIdx] || new Date().toISOString().split('T')[0];
    const rawMerchant = cols[merchantIdx] || 'Unidentified Transaction';
    
    // Parse amounts
    const cleanNum = (str?: string): number => {
      if (!str) return 0;
      const cleaned = str.replace(/[$,\s]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : Math.abs(parsed);
    };

    let debit = 0;
    let credit = 0;

    if (creditIdx !== -1 && cols[creditIdx]) {
      credit = cleanNum(cols[creditIdx]);
    }
    if (debitIdx !== -1 && cols[debitIdx]) {
      const rawVal = cols[debitIdx].replace(/[$,\s]/g, '');
      const parsed = parseFloat(rawVal);
      if (creditIdx === -1) {
        // Single amount column: negative is debit, positive is credit
        if (parsed < 0) debit = Math.abs(parsed);
        else credit = parsed;
      } else {
        debit = Math.abs(parsed);
      }
    }

    const balance = balanceIdx !== -1 ? cleanNum(cols[balanceIdx]) : 0;
    const refNumber = refIdx !== -1 && cols[refIdx] ? cols[refIdx] : `BNK-REF-${1000 + i}`;

    const catResult = autoCategorizeMerchant(rawMerchant);

    transactions.push({
      date: rawDate,
      merchant: rawMerchant,
      debitAmount: debit,
      creditAmount: credit,
      accountBalance: balance,
      referenceNumber: refNumber,
      category: catResult.category,
      reconciliationStatus: 'Unmatched',
      ruleConfidence: catResult.confidence,
    });
  }

  return {
    transactions,
    headers: rawHeaders,
    totalRows: transactions.length,
    warnings,
  };
}

export function exportExpensesToCSV(expenses: Expense[]): void {
  const headers = [
    'Reference ID',
    'Date',
    'Payee / Description',
    'Employee',
    'Department',
    'Category',
    'Amount (USD)',
    'Tax (USD)',
    'Payment Method',
    'GL Code',
    'Status',
  ];

  const rows = expenses.map(e => [
    `"${e.referenceNumber}"`,
    `"${e.date}"`,
    `"${e.description.replace(/"/g, '""')}"`,
    `"${e.employee}"`,
    `"${e.department}"`,
    `"${e.category}"`,
    e.amount.toFixed(2),
    e.taxAmount.toFixed(2),
    `"${e.paymentMethod}"`,
    `"${e.glCode}"`,
    `"${e.status}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Expense_Report_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportInvoicesToCSV(invoices: Invoice[]): void {
  const headers = [
    'Invoice #',
    'Type',
    'Party Name',
    'Issue Date',
    'Due Date',
    'Subtotal',
    'Tax Amount',
    'Total Amount',
    'Status',
    'Payment Ref',
  ];

  const rows = invoices.map(inv => [
    `"${inv.invoiceNumber}"`,
    `"${inv.type}"`,
    `"${inv.partyName.replace(/"/g, '""')}"`,
    `"${inv.issueDate}"`,
    `"${inv.dueDate}"`,
    (inv.amount - inv.taxAmount).toFixed(2),
    inv.taxAmount.toFixed(2),
    inv.amount.toFixed(2),
    `"${inv.status}"`,
    `"${inv.paymentReference || 'N/A'}"`,
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

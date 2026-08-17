import { ExtractedTransaction } from './pdfParser';

export interface ParsedCSVResult {
  transactions: ExtractedTransaction[];
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

  // Detect separator
  const firstLine = lines[0];
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

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
  
  let dateIdx = rawHeaders.findIndex(h => h.includes('date') || h.includes('time'));
  let merchantIdx = rawHeaders.findIndex(h => h.includes('merchant') || h.includes('description') || h.includes('payee') || h.includes('name') || h.includes('details') || h.includes('narration'));
  let debitIdx = rawHeaders.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('amount') || h.includes('out'));
  let creditIdx = rawHeaders.findIndex(h => h.includes('credit') || h.includes('deposit') || h.includes('in'));
  let balanceIdx = rawHeaders.findIndex(h => h.includes('balance'));
  let refIdx = rawHeaders.findIndex(h => h.includes('ref') || h.includes('id') || h.includes('trans') || h.includes('check'));

  if (dateIdx === -1) dateIdx = 0;
  if (merchantIdx === -1) merchantIdx = 1;
  if (debitIdx === -1) debitIdx = 2;

  const transactions: ExtractedTransaction[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = splitRow(lines[i]);
    if (cols.length < 2) continue;

    const rawDate = cols[dateIdx] || new Date().toISOString().split('T')[0];
    const merchant = cols[merchantIdx] || `Bank Transaction #${i}`;
    
    // Parse amounts
    const parseAmt = (str: string | undefined): number => {
      if (!str) return 0;
      const clean = str.replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? 0 : Math.abs(parsed);
    };

    let debit = 0;
    let credit = 0;

    if (creditIdx !== -1 && debitIdx !== -1 && creditIdx !== debitIdx) {
      debit = parseAmt(cols[debitIdx]);
      credit = parseAmt(cols[creditIdx]);
    } else {
      const singleAmt = parseAmt(cols[debitIdx]);
      if (merchant.toLowerCase().includes('cr') || cols.some(c => c.toLowerCase() === 'cr')) {
        credit = singleAmt;
      } else {
        debit = singleAmt;
      }
    }

    const refNumber = refIdx !== -1 && cols[refIdx] ? cols[refIdx] : `TXN-${1000 + i}`;
    const accountBalance = balanceIdx !== -1 ? parseAmt(cols[balanceIdx]) : undefined;

    transactions.push({
      id: `tx-csv-${Date.now()}-${i}`,
      date: rawDate.includes('/') ? rawDate.split('/').reverse().join('-') : rawDate,
      rawDate,
      description: merchant,
      merchant,
      debitAmount: debit,
      creditAmount: credit,
      referenceNumber: refNumber,
      accountBalance,
      confidence: 0.98,
      status: 'Pending Review',
    });
  }

  return {
    transactions,
    headers: rawHeaders,
    totalRows: lines.length - 1,
    warnings,
  };
}

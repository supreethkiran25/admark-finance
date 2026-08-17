import * as XLSX from 'xlsx';
import { ExtractedTransaction } from './pdfParser';

/**
 * Parses an Excel (.xlsx / .xls) array buffer into ExtractedTransaction objects
 */
export function parseBankStatementExcel(arrayBuffer: ArrayBuffer): ExtractedTransaction[] {
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const jsonData = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });

  if (!jsonData || jsonData.length < 2) {
    throw new Error('The uploaded Excel spreadsheet contains no transaction rows.');
  }

  // Find header row index
  let headerIndex = -1;
  let dateCol = -1;
  let descCol = -1;
  let debitCol = -1;
  let creditCol = -1;
  let balanceCol = -1;
  let refCol = -1;

  for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
    const row = jsonData[i] as any[];
    if (!Array.isArray(row)) continue;

    const rowStr = row.map(c => String(c || '').toLowerCase());
    const dIdx = rowStr.findIndex(c => c.includes('date') || c.includes('txn date') || c.includes('value date'));
    const descIdx = rowStr.findIndex(c => c.includes('narration') || c.includes('description') || c.includes('particular') || c.includes('merchant'));

    if (dIdx !== -1 && descIdx !== -1) {
      headerIndex = i;
      dateCol = dIdx;
      descCol = descIdx;
      debitCol = rowStr.findIndex(c => c.includes('debit') || c.includes('dr') || c.includes('withdrawal'));
      creditCol = rowStr.findIndex(c => c.includes('credit') || c.includes('cr') || c.includes('deposit'));
      balanceCol = rowStr.findIndex(c => c.includes('balance') || c.includes('running'));
      refCol = rowStr.findIndex(c => c.includes('ref') || c.includes('chq') || c.includes('utr') || c.includes('id'));
      break;
    }
  }

  if (headerIndex === -1) {
    headerIndex = 0;
    dateCol = 0;
    descCol = 1;
    debitCol = 2;
    creditCol = 3;
    balanceCol = 4;
    refCol = 5;
  }

  const transactions: ExtractedTransaction[] = [];

  for (let i = headerIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i] as any[];
    if (!Array.isArray(row) || row.length === 0) continue;

    const rawDate = String(row[dateCol] || '').trim();
    const narration = String(row[descCol] || '').trim();
    if (!rawDate && !narration) continue;

    const parseNum = (val: any): number => {
      if (typeof val === 'number') return Math.abs(val);
      if (!val) return 0;
      const clean = String(val).replace(/[^0-9.-]/g, '');
      const parsed = parseFloat(clean);
      return isNaN(parsed) ? 0 : Math.abs(parsed);
    };

    let debit = debitCol !== -1 ? parseNum(row[debitCol]) : 0;
    let credit = creditCol !== -1 ? parseNum(row[creditCol]) : 0;
    const balance = balanceCol !== -1 ? parseNum(row[balanceCol]) : undefined;
    const ref = refCol !== -1 && row[refCol] ? String(row[refCol]).trim() : `TXN-XL-${1000 + i}`;

    if (debit === 0 && credit === 0) {
      const generalAmt = parseNum(row[2] || row[3]);
      if (narration.toLowerCase().includes('cr') || narration.toLowerCase().includes('credit')) {
        credit = generalAmt;
      } else {
        debit = generalAmt;
      }
    }

    let cleanDate = rawDate;
    if (typeof row[dateCol] === 'number') {
      const jsDate = new Date(Math.round((row[dateCol] - 25569) * 86400 * 1000));
      cleanDate = jsDate.toISOString().split('T')[0];
    }

    transactions.push({
      id: `tx-xl-${Date.now()}-${i}`,
      date: cleanDate || new Date().toISOString().split('T')[0],
      rawDate: String(row[dateCol] || ''),
      description: narration || `Excel Transaction #${i}`,
      merchant: narration || `Excel Transaction #${i}`,
      debitAmount: debit,
      creditAmount: credit,
      referenceNumber: ref,
      accountBalance: balance,
      confidence: 0.98,
      status: 'Pending Review',
    });
  }

  return transactions;
}

/**
 * Universal Excel exporter
 */
export function exportToExcel(data: any[], filename: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Export');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

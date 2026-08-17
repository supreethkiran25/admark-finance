import { BankLayoutProfile, BankCode } from './types';

export const BANK_PROFILES: BankLayoutProfile[] = [
  {
    bankCode: 'HDFC',
    bankDisplayName: 'HDFC Bank Ltd',
    signatureKeywords: ['hdfc bank', 'hdfcbank', 'hdfc bank limited', 'we understand your world'],
    dateFormats: ['DD/MM/YYYY', 'DD/MM/YY'],
    headerMarkers: [
      ['date', 'narration', 'chq', 'value', 'withdrawal', 'deposit', 'closing balance'],
      ['date', 'particulars', 'cheque', 'debit', 'credit', 'balance'],
    ],
    footerMarkers: ['statement summary', 'total', 'carried forward', 'page total', 'end of statement'],
    hasSeparateDebitCredit: true,
    amountHasDrCrSuffix: false,
    defaultColumns: [
      { name: 'date', headerAliases: ['date', 'txn date'] },
      { name: 'description', headerAliases: ['narration', 'particulars', 'transaction details'] },
      { name: 'reference', headerAliases: ['chq/ref no', 'cheque no', 'chq no', 'ref no'] },
      { name: 'valueDate', headerAliases: ['value dt', 'value date'] },
      { name: 'debit', headerAliases: ['withdrawal amt', 'withdrawal', 'debit amt', 'debit'] },
      { name: 'credit', headerAliases: ['deposit amt', 'deposit', 'credit amt', 'credit'] },
      { name: 'balance', headerAliases: ['closing balance', 'balance'] },
    ],
  },
  {
    bankCode: 'ICICI',
    bankDisplayName: 'ICICI Bank Ltd',
    signatureKeywords: ['icici bank', 'icicibank', 'hum hai na', 'khayaal aapka'],
    dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY'],
    headerMarkers: [
      ['tran date', 'value date', 'transaction details', 'cheque no', 'amount', 'balance'],
      ['date', 'particulars', 'chq no', 'withdrawal', 'deposit', 'balance'],
    ],
    footerMarkers: ['total amounts', 'page subtotal', 'legends', 'end of statement'],
    hasSeparateDebitCredit: true,
    amountHasDrCrSuffix: true,
    defaultColumns: [
      { name: 'date', headerAliases: ['tran date', 'date', 'transaction date'] },
      { name: 'valueDate', headerAliases: ['value date', 'val date'] },
      { name: 'description', headerAliases: ['transaction details', 'particulars', 'description'] },
      { name: 'reference', headerAliases: ['cheque no', 'chq no', 'ref no', 'utr'] },
      { name: 'debit', headerAliases: ['withdrawal', 'debit', 'dr amount'] },
      { name: 'credit', headerAliases: ['deposit', 'credit', 'cr amount'] },
      { name: 'balance', headerAliases: ['balance', 'running balance'] },
    ],
  },
  {
    bankCode: 'SBI',
    bankDisplayName: 'State Bank of India',
    signatureKeywords: ['state bank of india', 'sbi', 'the banker to every indian'],
    dateFormats: ['DD-MMM-YYYY', 'DD/MM/YYYY', 'DD-MM-YYYY'],
    headerMarkers: [
      ['txn date', 'value date', 'description', 'ref no', 'debit', 'credit', 'balance'],
      ['date', 'narration', 'ref/chq', 'debit', 'credit', 'balance'],
    ],
    footerMarkers: ['statement summary', 'in case of any discrepancy', 'computer generated statement'],
    hasSeparateDebitCredit: true,
    amountHasDrCrSuffix: false,
    defaultColumns: [
      { name: 'date', headerAliases: ['txn date', 'date'] },
      { name: 'valueDate', headerAliases: ['value date'] },
      { name: 'description', headerAliases: ['description', 'narration'] },
      { name: 'reference', headerAliases: ['ref no./cheque no.', 'ref no', 'cheque no'] },
      { name: 'debit', headerAliases: ['debit', 'withdrawal'] },
      { name: 'credit', headerAliases: ['credit', 'deposit'] },
      { name: 'balance', headerAliases: ['balance'] },
    ],
  },
  {
    bankCode: 'AXIS',
    bankDisplayName: 'Axis Bank Ltd',
    signatureKeywords: ['axis bank', 'axisbank', 'badhti ka naam zindagi'],
    dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY'],
    headerMarkers: [
      ['tran date', 'value date', 'particulars', 'chq no', 'debit', 'credit', 'balance'],
      ['date', 'particulars', 'cheque no', 'withdrawal', 'deposit', 'balance'],
    ],
    footerMarkers: ['statement summary', 'closing balance', 'page total', 'axis bank limited'],
    hasSeparateDebitCredit: true,
    amountHasDrCrSuffix: false,
    defaultColumns: [
      { name: 'date', headerAliases: ['tran date', 'date'] },
      { name: 'valueDate', headerAliases: ['value date'] },
      { name: 'description', headerAliases: ['particulars', 'description'] },
      { name: 'reference', headerAliases: ['chq no', 'cheque no', 'ref no'] },
      { name: 'debit', headerAliases: ['debit', 'withdrawal'] },
      { name: 'credit', headerAliases: ['credit', 'deposit'] },
      { name: 'balance', headerAliases: ['balance'] },
    ],
  },
  {
    bankCode: 'KOTAK',
    bankDisplayName: 'Kotak Mahindra Bank',
    signatureKeywords: ['kotak mahindra', 'kotak bank', 'let’s make money simple'],
    dateFormats: ['DD-MM-YYYY', 'DD/MM/YYYY'],
    headerMarkers: [
      ['sl. no.', 'date', 'narration', 'chq/ref no', 'withdrawal (dr)', 'deposit (cr)', 'balance'],
      ['date', 'description', 'reference', 'debit', 'credit', 'balance'],
    ],
    footerMarkers: ['statement summary', 'total', 'end of statement'],
    hasSeparateDebitCredit: true,
    amountHasDrCrSuffix: false,
    defaultColumns: [
      { name: 'date', headerAliases: ['date', 'txn date'] },
      { name: 'description', headerAliases: ['narration', 'description'] },
      { name: 'reference', headerAliases: ['chq/ref no', 'ref no'] },
      { name: 'debit', headerAliases: ['withdrawal (dr)', 'withdrawal', 'debit'] },
      { name: 'credit', headerAliases: ['deposit (cr)', 'deposit', 'credit'] },
      { name: 'balance', headerAliases: ['balance'] },
    ],
  },
  {
    bankCode: 'GENERIC_CURRENT',
    bankDisplayName: 'Commercial Current Bank Account',
    signatureKeywords: ['current account', 'bank statement', 'statement of account', 'account statement'],
    dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'DD-MMM-YYYY'],
    headerMarkers: [
      ['date', 'description', 'amount', 'balance'],
      ['date', 'narration', 'debit', 'credit', 'balance'],
      ['date', 'particulars', 'withdrawal', 'deposit', 'balance'],
    ],
    footerMarkers: ['total', 'summary', 'end of statement'],
    hasSeparateDebitCredit: true,
    amountHasDrCrSuffix: true,
    defaultColumns: [
      { name: 'date', headerAliases: ['date', 'txn date', 'value date'] },
      { name: 'description', headerAliases: ['narration', 'description', 'particulars', 'merchant', 'details'] },
      { name: 'reference', headerAliases: ['ref', 'chq', 'utr', 'cheque', 'reference'] },
      { name: 'debit', headerAliases: ['debit', 'withdrawal', 'dr'] },
      { name: 'credit', headerAliases: ['credit', 'deposit', 'cr'] },
      { name: 'balance', headerAliases: ['balance', 'running balance', 'bal'] },
    ],
  },
];

/**
 * Detects the Bank Profile from the raw text stream of Page 1
 */
export function detectBankProfile(firstPageText: string): BankLayoutProfile {
  const lower = firstPageText.toLowerCase();

  for (const profile of BANK_PROFILES) {
    for (const keyword of profile.signatureKeywords) {
      if (lower.includes(keyword)) {
        return profile;
      }
    }
  }

  return BANK_PROFILES.find(p => p.bankCode === 'GENERIC_CURRENT') || BANK_PROFILES[0];
}

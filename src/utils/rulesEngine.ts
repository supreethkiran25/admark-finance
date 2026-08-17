import { ExpenseCategory } from '../types/finance';

export interface CategoryRule {
  pattern: RegExp;
  category: ExpenseCategory;
  merchantName: string;
}

export const AUTO_RULES: CategoryRule[] = [
  // Cloud Services
  { pattern: /aws|amazon\s*web|amazon\s*services|ec2|s3|cloudfront/i, category: 'Cloud Services', merchantName: 'AWS Cloud Services' },
  { pattern: /google\s*cloud|gcp|google\s*storage/i, category: 'Cloud Services', merchantName: 'Google Cloud Platform' },
  { pattern: /azure|microsoft\s*cloud/i, category: 'Cloud Services', merchantName: 'Microsoft Azure' },
  { pattern: /digitalocean|linode|vultr|hetzner/i, category: 'Cloud Services', merchantName: 'DigitalOcean' },
  { pattern: /vercel|netlify|render|supabase|firebase/i, category: 'Cloud Services', merchantName: 'Vercel / Platform Services' },
  { pattern: /cloudflare/i, category: 'Cloud Services', merchantName: 'Cloudflare' },

  // Software & Subscriptions
  { pattern: /google\s*workspace|g\s*suite|google\s*apps/i, category: 'Software', merchantName: 'Google Workspace' },
  { pattern: /microsoft\s*365|office\s*365|github|copilot/i, category: 'Software', merchantName: 'GitHub / Microsoft' },
  { pattern: /slack|zoom|notion|jira|atlassian|linear|trello|asana/i, category: 'Software', merchantName: 'Collaboration Software' },
  { pattern: /openai|chatgpt|anthropic|claude|midjourney/i, category: 'Software', merchantName: 'AI Subscriptions' },
  { pattern: /hubspot|salesforce|postman|sentry|datadog/i, category: 'Software', merchantName: 'Developer / Ops Tools' },

  // Design Tools
  { pattern: /adobe|creative\s*cloud|photoshop|illustrator/i, category: 'Design Tools', merchantName: 'Adobe Systems' },
  { pattern: /figma/i, category: 'Design Tools', merchantName: 'Figma' },
  { pattern: /canva|sketch|framer|invision|spline/i, category: 'Design Tools', merchantName: 'Design Software' },

  // Employee Salaries
  { pattern: /salary|payroll|razorpayx\s*payroll|wages|staff\s*payout|stipend/i, category: 'Employee Salaries', merchantName: 'Employee Salaries' },

  // Office Expenses
  { pattern: /rent|wework|awfis|coworking|office\s*space|workspace|smartworks/i, category: 'Office Expenses', merchantName: 'Office Rent & Space' },
  { pattern: /maintenance|stationery|office\s*supplies|cleaning|pantry/i, category: 'Office Expenses', merchantName: 'Office Supplies & Upkeep' },

  // Food & Refreshments
  { pattern: /swiggy|zomato|starbucks|mcdonald|dominos|burger|cafe|coffee|chai\s*point|canteen|food/i, category: 'Food', merchantName: 'Food & Meals' },

  // Travel & Transport
  { pattern: /uber|ola|rapido|blusmart|cab|taxi/i, category: 'Travel', merchantName: 'Local Transport' },
  { pattern: /indigo|air\s*india|vistara|spicejet|flight|akasa|airline/i, category: 'Travel', merchantName: 'Airline Travel' },
  { pattern: /makemytrip|cleartrip|yatra|hotel|marriott|taj|hyatt|airbnb|booking\.com/i, category: 'Travel', merchantName: 'Hotel & Lodging' },
  { pattern: /irctc|railway|train|fastag|toll|petrol|fuel|hpcl|bpcl|ioc/i, category: 'Travel', merchantName: 'Travel & Commute' },

  // Marketing & Ads
  { pattern: /facebook\s*ads|meta\s*ads|google\s*ads|adwords|linkedin\s*ads|twitter\s*ads/i, category: 'Marketing', merchantName: 'Digital Advertising' },
  { pattern: /marketing|campaign|pr\s*newswire|mailchimp|sendgrid|klaviyo/i, category: 'Marketing', merchantName: 'Marketing & Outreach' },

  // Equipment & Hardware
  { pattern: /apple|dell|lenovo|hp|croma|reliance\s*digital|hardware|laptop|monitor/i, category: 'Equipment', merchantName: 'IT Hardware & Equipment' },

  // Utilities & Telecommunications
  { pattern: /airtel|jio|vodafone|vi|act\s*fiber|broadband|internet|wifi/i, category: 'Utilities', merchantName: 'Internet & Telecom' },
  { pattern: /electricity|bescom|tneb|bses|cesc|power|water\s*bill/i, category: 'Utilities', merchantName: 'Utilities & Power' },

  // Taxes
  { pattern: /income\s*tax|advance\s*tax|gst|gstn|traces|tds|challan|tax\s*payment/i, category: 'Taxes', merchantName: 'Government Tax Payment' },
];

export function autoCategorizeTransaction(narration: string): {
  category: ExpenseCategory;
  merchantName: string;
  confidence: number;
} {
  const cleanNarration = narration.trim();

  for (const rule of AUTO_RULES) {
    if (rule.pattern.test(cleanNarration)) {
      return {
        category: rule.category,
        merchantName: rule.merchantName,
        confidence: 0.95,
      };
    }
  }

  // Generic heuristic fallbacks
  if (/pos|purchase|card/i.test(cleanNarration)) {
    return { category: 'Miscellaneous', merchantName: cleanNarration.slice(0, 32), confidence: 0.6 };
  }
  if (/neft|rtgs|imps|upi/i.test(cleanNarration)) {
    return { category: 'Miscellaneous', merchantName: cleanNarration.slice(0, 32), confidence: 0.6 };
  }

  return {
    category: 'Miscellaneous',
    merchantName: cleanNarration.slice(0, 32) || 'Direct Bank Transaction',
    confidence: 0.5,
  };
}

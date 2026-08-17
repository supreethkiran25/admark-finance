import { CategorizationRule, ExpenseCategory, Department } from '../types/finance';

export const DEFAULT_RULES: CategorizationRule[] = [
  {
    id: 'rule-cloud',
    pattern: 'AWS|Amazon Web Services|Google Cloud|GCP|Azure|Vercel|Cloudflare|Supabase|Datadog|DigitalOcean',
    category: 'Cloud services',
    department: 'Engineering',
    isRegex: true,
    priority: 10,
    matchCount: 142,
    isActive: true,
    lastMatched: '2026-08-16',
  },
  {
    id: 'rule-software',
    pattern: 'GitHub|Figma|Slack|Notion|Linear|Atlassian|Jira|Zoom|1Password|OpenAI|Anthropic|HubSpot|Loom',
    category: 'Software subscriptions',
    department: 'Engineering',
    isRegex: true,
    priority: 9,
    matchCount: 98,
    isActive: true,
    lastMatched: '2026-08-15',
  },
  {
    id: 'rule-salaries',
    pattern: 'Gusto|Rippling|Deel|Payroll|Direct Deposit|ADP|Salary Disb|Contractor Payout',
    category: 'Salaries',
    department: 'Operations',
    isRegex: true,
    priority: 10,
    matchCount: 48,
    isActive: true,
    lastMatched: '2026-08-15',
  },
  {
    id: 'rule-marketing',
    pattern: 'Google Ads|Meta Ads|LinkedIn Marketing|X Ads|Ahrefs|Semrush|Clearbit|Apollo.io|Segment',
    category: 'Marketing',
    department: 'Sales & Marketing',
    isRegex: true,
    priority: 8,
    matchCount: 37,
    isActive: true,
    lastMatched: '2026-08-14',
  },
  {
    id: 'rule-travel',
    pattern: 'Delta|United Airlines|American Airlines|Uber|Lyft|Airbnb|Marriott|Hilton|Expedia|Amtrak',
    category: 'Travel',
    department: 'Sales & Marketing',
    isRegex: true,
    priority: 7,
    matchCount: 29,
    isActive: true,
    lastMatched: '2026-08-12',
  },
  {
    id: 'rule-food',
    pattern: 'Doordash|Uber Eats|Sweetgreen|Cava|Chipotle|Starbucks|Blue Bottle|Catering|Whole Foods|Dinner',
    category: 'Food',
    department: 'Operations',
    isRegex: true,
    priority: 6,
    matchCount: 53,
    isActive: true,
    lastMatched: '2026-08-16',
  },
  {
    id: 'rule-equipment',
    pattern: 'Apple Store|B&H Photo|Dell|Lenovo|Best Buy|Amazon Equipment|Keychron|Herman Miller|Monitor',
    category: 'Equipment',
    department: 'Facilities & IT',
    isRegex: true,
    priority: 8,
    matchCount: 16,
    isActive: true,
    lastMatched: '2026-08-10',
  },
  {
    id: 'rule-office',
    pattern: 'WeWork|Industrious|Staples|Office Depot|FedEx|UPS|Keycard|Desk Supplies|Cleaner',
    category: 'Office expenses',
    department: 'Operations',
    isRegex: true,
    priority: 7,
    matchCount: 22,
    isActive: true,
    lastMatched: '2026-08-01',
  },
  {
    id: 'rule-utilities',
    pattern: 'Verizon|AT&T|Comcast|ConEd|PG&E|Water Utility|Electric|Fiber Internet|T-Mobile',
    category: 'Utilities',
    department: 'Facilities & IT',
    isRegex: true,
    priority: 7,
    matchCount: 18,
    isActive: true,
    lastMatched: '2026-08-05',
  },
];

export interface CategorizationResult {
  category: ExpenseCategory;
  department: Department;
  confidence: number;
  matchedRuleId?: string;
}

export function autoCategorizeMerchant(
  text: string,
  rules: CategorizationRule[] = DEFAULT_RULES
): CategorizationResult {
  if (!text) {
    return { category: 'Miscellaneous', department: 'Operations', confidence: 0.1 };
  }

  const cleanText = text.trim();
  const sortedRules = [...rules]
    .filter(r => r.isActive)
    .sort((a, b) => b.priority - a.priority);

  for (const rule of sortedRules) {
    try {
      if (rule.isRegex) {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(cleanText)) {
          return {
            category: rule.category,
            department: rule.department,
            confidence: 0.95,
            matchedRuleId: rule.id,
          };
        }
      } else {
        if (cleanText.toLowerCase().includes(rule.pattern.toLowerCase())) {
          return {
            category: rule.category,
            department: rule.department,
            confidence: 0.9,
            matchedRuleId: rule.id,
          };
        }
      }
    } catch {
      // Ignore invalid regex in user input
    }
  }

  return {
    category: 'Miscellaneous',
    department: 'Operations',
    confidence: 0.2,
  };
}

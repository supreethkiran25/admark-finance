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
    pattern: 'RazorpayX|Gusto|Rippling|Deel|Payroll|Direct Deposit|Salary Disb|NEFT Salary|EPFO|ESIC',
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
    pattern: 'Google Ads|Google India|Meta Ads|LinkedIn Marketing|X Ads|Ahrefs|Semrush|Clearbit|Apollo.io|Segment',
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
    pattern: 'IndiGo|Air India|Vistara|Akasa|Uber|Ola|Airbnb|Marriott|Taj Hotels|ITC Hotels|MakeMyTrip|IRCTC',
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
    pattern: 'Swiggy|Zomato|Third Wave Coffee|Blue Tokai|Starbucks|Chai Point|Black Pearl|Sweetgreen|Catering|Dinner',
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
    pattern: 'Apple India|Amazon India|Croma|Reliance Digital|Dell India|Lenovo|Keychron|Herman Miller|Monitor',
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
    pattern: 'WeWork India|Awfis|IndiQube|Smartworks|Staples|Office Depot|Blue Dart|DTDC|Keycard|Desk Supplies',
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
    pattern: 'ACT Fibernet|Airtel Business|Tata Tele|Jio Fiber|BESCOM|Tata Power|BSES|Water Utility|Electricity',
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
      // Ignore invalid regex
    }
  }

  return {
    category: 'Miscellaneous',
    department: 'Operations',
    confidence: 0.2,
  };
}

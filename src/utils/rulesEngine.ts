import { CategorizationRule, ExpenseCategory, Department } from '../types/finance';

export const DEFAULT_RULES: CategorizationRule[] = [
  {
    id: 'rule-cloud',
    pattern: 'AWS|Amazon Web Services|Google Cloud|GCP|Azure|Vercel|Cloudflare|Datadog',
    category: 'Cloud services',
    department: 'Engineering',
    isRegex: true,
    priority: 10,
    matchCount: 142,
    isActive: true,
    lastMatched: '2026-08-16',
  },
  {
    id: 'rule-salaries',
    pattern: 'RazorpayX|Payroll|Direct Deposit|Salary Disb|NEFT Salary|EPFO|ESIC',
    category: 'Salaries',
    department: 'Operations',
    isRegex: true,
    priority: 10,
    matchCount: 48,
    isActive: true,
    lastMatched: '2026-08-15',
  },
  {
    id: 'rule-software',
    pattern: 'GitHub|Figma|Slack|Notion|Linear|Atlassian|Jira|Zoom|1Password|OpenAI|Anthropic',
    category: 'Software subscriptions',
    department: 'Engineering',
    isRegex: true,
    priority: 9,
    matchCount: 98,
    isActive: true,
    lastMatched: '2026-08-15',
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

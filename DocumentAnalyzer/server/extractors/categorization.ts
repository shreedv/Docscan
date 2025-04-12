/**
 * Automatic categorization for expenses based on document content
 */

import { ExpenseCategory } from "@/lib/extraction";

interface CategoryRule {
  category: ExpenseCategory;
  keywords: string[];
  vendors?: string[];
}

// Rules for categorizing expenses based on keywords and vendor names
const categoryRules: CategoryRule[] = [
  {
    category: 'Food & Dining',
    keywords: ['restaurant', 'cafe', 'coffee', 'burger', 'pizza', 'grill', 'diner', 'food', 'meal', 'breakfast', 'lunch', 'dinner'],
    vendors: ['mcdonalds', 'starbucks', 'subway', 'chipotle', 'panera', 'wendys', 'dominos', 'taco bell']
  },
  {
    category: 'Travel',
    keywords: ['hotel', 'motel', 'flight', 'airline', 'car rental', 'taxi', 'uber', 'lyft', 'train', 'bus', 'travel', 'transportation', 'airport'],
    vendors: ['marriott', 'hilton', 'airbnb', 'expedia', 'delta', 'united', 'southwest', 'hertz', 'enterprise']
  },
  {
    category: 'Office Supplies',
    keywords: ['office', 'supplies', 'paper', 'ink', 'toner', 'printer', 'pen', 'stapler', 'notebook', 'stationery'],
    vendors: ['staples', 'office depot', 'officemax', 'amazon']
  },
  {
    category: 'Utilities',
    keywords: ['electric', 'water', 'gas', 'utility', 'power', 'energy', 'bill', 'phone', 'internet', 'broadband', 'cable'],
    vendors: ['at&t', 'verizon', 'comcast', 'xfinity', 'sprint', 't-mobile']
  },
  {
    category: 'Technology',
    keywords: ['computer', 'laptop', 'monitor', 'software', 'hardware', 'electronics', 'camera', 'phone', 'tablet', 'subscription'],
    vendors: ['apple', 'microsoft', 'samsung', 'google', 'best buy', 'newegg', 'adobe', 'dropbox', 'zoom']
  },
  {
    category: 'Entertainment',
    keywords: ['movie', 'theater', 'concert', 'ticket', 'show', 'entertainment', 'music', 'streaming', 'netflix', 'spotify'],
    vendors: ['amc', 'netflix', 'spotify', 'hulu', 'disney+', 'hbo', 'ticketmaster']
  },
  {
    category: 'Medical',
    keywords: ['doctor', 'pharmacy', 'clinic', 'health', 'medical', 'medicine', 'prescription', 'hospital', 'dental', 'healthcare'],
    vendors: ['walgreens', 'cvs', 'rite aid', 'express scripts']
  },
];

/**
 * Categorize a document based on its content
 * 
 * @param text The OCR text from the document
 * @param vendor The extracted vendor name
 * @returns The most likely expense category
 */
export function categorizeExpense(text: string, vendor: string): ExpenseCategory {
  const lowerText = text.toLowerCase();
  const lowerVendor = vendor.toLowerCase();
  
  // Keep track of matches for each category
  const categoryScores: Record<ExpenseCategory, number> = {
    'Food & Dining': 0,
    'Travel': 0,
    'Office Supplies': 0,
    'Utilities': 0,
    'Technology': 0,
    'Entertainment': 0,
    'Medical': 0,
    'Other': 0
  };
  
  // Calculate score for each category
  for (const rule of categoryRules) {
    // Check for vendor match (strong indicator)
    if (rule.vendors) {
      for (const ruleVendor of rule.vendors) {
        if (lowerVendor.includes(ruleVendor) || ruleVendor.includes(lowerVendor)) {
          categoryScores[rule.category] += 5; // Vendor matches are strong indicators
        }
      }
    }
    
    // Check for keyword matches
    for (const keyword of rule.keywords) {
      if (lowerText.includes(keyword)) {
        categoryScores[rule.category] += 1;
      }
    }
  }
  
  // Find category with highest score
  let highestScore = 0;
  let bestCategory: ExpenseCategory = 'Other';
  
  for (const [category, score] of Object.entries(categoryScores) as [ExpenseCategory, number][]) {
    if (score > highestScore) {
      highestScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

/**
 * Get an icon name for a given category (for use with Lucide icons)
 */
export function getCategoryIcon(category: ExpenseCategory): string {
  switch (category) {
    case 'Food & Dining': return 'utensils';
    case 'Travel': return 'plane';
    case 'Office Supplies': return 'clipboard';
    case 'Utilities': return 'lightbulb';
    case 'Technology': return 'laptop';
    case 'Entertainment': return 'tv';
    case 'Medical': return 'stethoscope';
    case 'Other': return 'file-text';
  }
}
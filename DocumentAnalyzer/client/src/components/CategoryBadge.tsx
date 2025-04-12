import React from 'react';
import { Badge } from "@/components/ui/badge";
import { ExpenseCategory } from "@/lib/extraction";
import { 
  Utensils, 
  Plane, 
  Clipboard, 
  Lightbulb, 
  Laptop, 
  Tv, 
  Stethoscope, 
  FileText 
} from "lucide-react";

interface CategoryBadgeProps {
  category: ExpenseCategory;
}

/**
 * Map categories to their respective color classes
 */
const categoryColors: Record<ExpenseCategory, string> = {
  'Food & Dining': 'bg-orange-100 text-orange-800 border-orange-200',
  'Travel': 'bg-blue-100 text-blue-800 border-blue-200',
  'Office Supplies': 'bg-gray-100 text-gray-800 border-gray-200',
  'Utilities': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'Technology': 'bg-purple-100 text-purple-800 border-purple-200',
  'Entertainment': 'bg-pink-100 text-pink-800 border-pink-200',
  'Medical': 'bg-red-100 text-red-800 border-red-200',
  'Other': 'bg-green-100 text-green-800 border-green-200'
};

/**
 * Map categories to their respective icons
 */
const CategoryIcon = ({ category }: { category: ExpenseCategory }) => {
  const iconProps = { className: "mr-1 h-3 w-3" };
  
  switch (category) {
    case 'Food & Dining':
      return <Utensils {...iconProps} />;
    case 'Travel':
      return <Plane {...iconProps} />;
    case 'Office Supplies':
      return <Clipboard {...iconProps} />;
    case 'Utilities':
      return <Lightbulb {...iconProps} />;
    case 'Technology':
      return <Laptop {...iconProps} />;
    case 'Entertainment':
      return <Tv {...iconProps} />;
    case 'Medical':
      return <Stethoscope {...iconProps} />;
    case 'Other':
      return <FileText {...iconProps} />;
  }
};

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category }) => {
  return (
    <Badge 
      className={`inline-flex items-center rounded-md py-1 px-2 text-xs font-medium ${categoryColors[category]}`}
    >
      <CategoryIcon category={category} />
      {category}
    </Badge>
  );
};
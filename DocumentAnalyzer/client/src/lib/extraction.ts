export type ExtractionStatus = 
  | "idle" 
  | "uploading" 
  | "processing" 
  | "completed" 
  | "error";

export interface LineItem {
  description: string;
  quantity: number | string;
  unitPrice: string;
  amount: string;
}

export type ExpenseCategory = 
  | 'Food & Dining'
  | 'Travel'
  | 'Office Supplies'
  | 'Utilities'
  | 'Technology'
  | 'Entertainment'
  | 'Medical'
  | 'Other';

export interface ExtractedData {
  vendor: string;
  documentType: string;
  date: string;
  documentNumber: string;
  totalAmount: string;
  taxAmount: string;
  lineItems: LineItem[];
  notes: string;
  confidence?: number;
  category?: ExpenseCategory;
}

// Default empty data structure
export const emptyExtractedData: ExtractedData = {
  vendor: "",
  documentType: "Invoice",
  date: "",
  documentNumber: "",
  totalAmount: "",
  taxAmount: "",
  lineItems: [],
  notes: "",
  confidence: 0,
  category: "Other"
};

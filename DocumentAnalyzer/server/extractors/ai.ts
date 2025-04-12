import OpenAI from "openai";
import { ExtractedData, ExpenseCategory } from "@/lib/extraction";
import { categorizeExpense } from "./categorization";

// Initialize the OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key-for-dev" });

// Simple text pattern extraction helpers for fallback mode
function extractVendor(text: string): string {
  // Look for words that might be company names at the beginning of lines
  const lines = text.split('\n');
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].trim();
    if (line && line.length > 3 && !line.match(/^(date|invoice|amount|total|bill|receipt)/i)) {
      return line;
    }
  }
  return "Unknown Vendor";
}

function extractDate(text: string): string {
  // Match common date formats
  const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
  const match = text.match(dateRegex);
  
  if (match) {
    const day = match[1].padStart(2, '0');
    const month = match[2].padStart(2, '0');
    let year = match[3];
    if (year.length === 2) year = `20${year}`;
    return `${year}-${month}-${day}`;
  }
  
  return new Date().toISOString().split('T')[0]; // Today's date as fallback
}

function extractAmount(text: string): string {
  // Look for currency amounts, especially near the words "total" or "amount"
  const totalRegex = /total\D*(\d+[.,]\d{2})/i;
  const amountRegex = /(\$|€|£)?(\d+[.,]\d{2})/;
  
  const totalMatch = text.match(totalRegex);
  if (totalMatch) return totalMatch[1];
  
  const amountMatch = text.match(amountRegex);
  if (amountMatch) return amountMatch[2];
  
  return "0.00";
}

function createFallbackResponse(ocrText: string): ExtractedData {
  // Basic extraction using regex patterns
  const vendor = extractVendor(ocrText);
  return {
    vendor: vendor,
    documentType: ocrText.toLowerCase().includes("invoice") ? "Invoice" : "Receipt",
    date: extractDate(ocrText),
    documentNumber: Math.floor(Math.random() * 10000).toString().padStart(4, '0'),
    totalAmount: extractAmount(ocrText),
    taxAmount: "0.00",
    lineItems: [{
      description: "Item",
      quantity: 1,
      unitPrice: extractAmount(ocrText),
      amount: extractAmount(ocrText)
    }],
    notes: "Extracted using fallback mode. Please review and correct data as needed.",
    confidence: 30,
    category: categorizeExpense(ocrText, vendor)
  };
}

/**
 * Analyze OCR text and extract document data using OpenAI
 * @param ocrText The text extracted from the document via OCR
 * @returns Structured extracted data
 */
export async function analyzeDocumentData(ocrText: string): Promise<ExtractedData> {
  try {
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI document analyzer specializing in extracting structured data from receipts, invoices, and other financial documents.
           Extract all relevant information and format it as a JSON object. Be precise and thorough.`,
        },
        {
          role: "user",
          content: `Extract the following information from this document text and return it as a JSON object:
          - vendor: Company or vendor name
          - documentType: Type of document (Invoice, Receipt, Purchase Order, etc.)
          - date: Document date in YYYY-MM-DD format
          - documentNumber: Invoice/receipt number or identifier
          - totalAmount: Total amount (numeric, don't include currency symbol in the value)
          - taxAmount: Tax amount if present (numeric, don't include currency symbol)
          - lineItems: Array of items with properties: description, quantity (numeric), unitPrice (numeric), amount (numeric)
          - notes: Any notes or additional information
          - confidence: Your confidence score (0-100) in the extraction accuracy

          Here's the document text:
          ${ocrText}
          
          Return ONLY a valid JSON object with these fields, no explanation or other text.`,
        },
      ],
      response_format: { type: "json_object" },
    });

    // Parse the JSON response
    const content = response.choices[0].message.content;
    const extractedData = JSON.parse(typeof content === 'string' ? content : '{}') as ExtractedData;
    
    // If any fields are missing, provide empty defaults
    const vendor = extractedData.vendor || "";
    const formattedData = {
      vendor: vendor,
      documentType: extractedData.documentType || "Invoice",
      date: extractedData.date || "",
      documentNumber: extractedData.documentNumber || "",
      totalAmount: extractedData.totalAmount?.toString() || "",
      taxAmount: extractedData.taxAmount?.toString() || "",
      lineItems: extractedData.lineItems || [],
      notes: extractedData.notes || "",
      confidence: extractedData.confidence || 0,
      category: categorizeExpense(ocrText, vendor)
    };
    
    return formattedData;
  } catch (error) {
    console.error("AI analysis error:", error);
    
    // Use fallback extraction method if OpenAI API fails
    console.log("Using fallback extraction mode due to API error");
    return createFallbackResponse(ocrText);
  }
}

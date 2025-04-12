import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define expense categories
export const expenseCategoryEnum = z.enum([
  'Food & Dining',
  'Travel',
  'Office Supplies',
  'Utilities',
  'Technology',
  'Entertainment',
  'Medical',
  'Other'
]);

// Line item schema for document items
export const lineItemSchema = z.object({
  description: z.string(),
  quantity: z.union([z.number(), z.string()]),
  unitPrice: z.string(),
  amount: z.string(),
});

// Main documents table
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  vendor: text("vendor").notNull(),
  documentType: text("document_type").notNull(),
  date: text("date").notNull(),
  documentNumber: text("document_number").notNull(),
  totalAmount: text("total_amount").notNull(),
  taxAmount: text("tax_amount").notNull(),
  lineItems: jsonb("line_items").notNull().$type<z.infer<typeof lineItemSchema>[]>(),
  notes: text("notes"),
  confidence: integer("confidence"),
  category: text("category").default('Other'),
  ocrText: text("ocr_text"),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schema for documents
export const insertDocumentSchema = createInsertSchema(documents)
  .omit({ id: true, createdAt: true })
  .extend({
    lineItems: z.array(lineItemSchema),
    category: expenseCategoryEnum.optional().default('Other'),
  });

export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type Document = typeof documents.$inferSelect;

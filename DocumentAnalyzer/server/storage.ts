import { InsertDocument, Document, documents } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

// Storage interface for documents
export interface IStorage {
  getAllDocuments(): Promise<Document[]>;
  getDocument(id: number): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: number, document: InsertDocument): Promise<Document>;
  deleteDocument(id: number): Promise<void>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getAllDocuments(): Promise<Document[]> {
    try {
      // Get all documents sorted by createdAt in descending order (newest first)
      return await db.select().from(documents).orderBy(desc(documents.createdAt));
    } catch (error) {
      console.error("Failed to get all documents:", error);
      throw new Error("Failed to retrieve documents from database");
    }
  }

  async getDocument(id: number): Promise<Document | undefined> {
    try {
      const [document] = await db.select().from(documents).where(eq(documents.id, id));
      return document;
    } catch (error) {
      console.error(`Failed to get document with ID ${id}:`, error);
      throw new Error(`Failed to retrieve document ${id} from database`);
    }
  }

  async createDocument(insertDocument: InsertDocument): Promise<Document> {
    try {
      const [document] = await db.insert(documents).values(insertDocument).returning();
      return document;
    } catch (error) {
      console.error("Failed to create document:", error);
      throw new Error("Failed to save document to database");
    }
  }

  async updateDocument(id: number, updateDocument: InsertDocument): Promise<Document> {
    try {
      const [document] = await db
        .update(documents)
        .set(updateDocument)
        .where(eq(documents.id, id))
        .returning();
      
      if (!document) {
        throw new Error(`Document with ID ${id} not found`);
      }
      
      return document;
    } catch (error) {
      console.error(`Failed to update document with ID ${id}:`, error);
      throw new Error(`Failed to update document ${id} in database`);
    }
  }

  async deleteDocument(id: number): Promise<void> {
    try {
      const result = await db
        .delete(documents)
        .where(eq(documents.id, id))
        .returning({ id: documents.id });
      
      if (result.length === 0) {
        throw new Error(`Document with ID ${id} not found`);
      }
    } catch (error) {
      console.error(`Failed to delete document with ID ${id}:`, error);
      throw new Error(`Failed to delete document ${id} from database`);
    }
  }
}

export const storage = new DatabaseStorage();

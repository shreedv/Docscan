import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { extractTextFromImage } from "./extractors/ocr";
import { analyzeDocumentData } from "./extractors/ai";
import { insertDocumentSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Only accept images and PDFs
    if (
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPG, PNG, and PDF are allowed."));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  
  // Get all documents
  app.get("/api/documents", async (req: Request, res: Response) => {
    try {
      const documents = await storage.getAllDocuments();
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  // Get a single document by ID
  app.get("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      const document = await storage.getDocument(id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ error: "Failed to fetch document" });
    }
  });

  // Extract data from uploaded document
  app.post(
    "/api/documents/extract",
    upload.single("document"),
    async (req: Request, res: Response) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "No file uploaded" });
        }

        // Step 1: Extract text from the uploaded document using OCR
        const ocrText = await extractTextFromImage(req.file.buffer);

        // Step 2: Analyze the text with AI to extract structured data
        const extractedData = await analyzeDocumentData(ocrText);

        res.json(extractedData);
      } catch (error) {
        console.error("Error extracting document data:", error);
        res.status(500).json({ error: "Failed to extract document data" });
      }
    }
  );

  // Create a new document
  app.post("/api/documents", async (req: Request, res: Response) => {
    try {
      // Validate request body against the schema
      const validatedData = insertDocumentSchema.parse(req.body);

      // Create document in storage
      const newDocument = await storage.createDocument(validatedData);
      res.status(201).json(newDocument);
    } catch (error) {
      console.error("Error creating document:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to create document" });
    }
  });

  // Update an existing document
  app.put("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      // Validate request body against the schema
      const validatedData = insertDocumentSchema.parse(req.body);

      // Check if document exists
      const existingDoc = await storage.getDocument(id);
      if (!existingDoc) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Update document
      const updatedDocument = await storage.updateDocument(id, validatedData);
      res.json(updatedDocument);
    } catch (error) {
      console.error("Error updating document:", error);
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      res.status(500).json({ error: "Failed to update document" });
    }
  });

  // Delete a document
  app.delete("/api/documents/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid document ID" });
      }

      // Check if document exists
      const existingDoc = await storage.getDocument(id);
      if (!existingDoc) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Delete document
      await storage.deleteDocument(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ error: "Failed to delete document" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

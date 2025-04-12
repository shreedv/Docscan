import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import ExtractionProgress from "@/components/ExtractionProgress";
import ExtractedDataForm from "@/components/ExtractedDataForm";
import { ExtractedData, ExtractionStatus } from "@/lib/extraction";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ArrowRightIcon, CalendarIcon, PlusIcon } from "lucide-react";

type FileWithPreview = {
  file: File;
  preview: string;
};

const ExtractPage = () => {
  const [selectedFile, setSelectedFile] = useState<FileWithPreview | null>(null);
  const [extractionStatus, setExtractionStatus] = useState<ExtractionStatus>("idle");
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedFile({
        file,
        preview: e.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
    setExtractionStatus("idle");
    setExtractedData(null);
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setExtractionStatus("idle");
    setExtractedData(null);
  };

  const handleExtract = async () => {
    if (!selectedFile) return;

    try {
      setExtractionStatus("uploading");
      setProgress(10);

      // Create form data with file
      const formData = new FormData();
      formData.append("document", selectedFile.file);

      // Step 1: Upload file and get OCR text
      setProgress(30);
      const response = await fetch("/api/documents/extract", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Error extracting document data");
      }

      // Step 2: Update progress during AI processing
      setExtractionStatus("processing");
      setProgress(60);

      // Step 3: Get extracted data
      const data = await response.json();
      setExtractionStatus("completed");
      setProgress(100);
      setExtractedData(data);
    } catch (error) {
      console.error("Extraction error:", error);
      setExtractionStatus("error");
      toast({
        title: "Extraction failed",
        description: "There was an error extracting data from your document. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveData = async (data: ExtractedData) => {
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to save document data");
      }

      toast({
        title: "Success!",
        description: "Document data saved successfully.",
      });

      // Reset the state after saving
      setSelectedFile(null);
      setExtractionStatus("idle");
      setExtractedData(null);
    } catch (error) {
      console.error("Save error:", error);
      toast({
        title: "Save failed",
        description: "There was an error saving your document data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      {extractionStatus === "idle" && !selectedFile && !extractedData && (
        <div className="mb-8 bg-white shadow-sm rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to DocuExtract</h1>
          <p className="text-gray-600">Upload invoices, receipts, and documents to automatically extract important information using AI.</p>
          <div className="mt-4 flex flex-col sm:flex-row gap-2">
            <Button onClick={() => document.getElementById('file-input-trigger')?.click()}>
              <PlusIcon className="mr-2 h-5 w-5" />
              Upload a Document
            </Button>
            <Button variant="outline" onClick={() => window.location.href = '/history'}>
              <CalendarIcon className="mr-2 h-5 w-5" />
              View History
            </Button>
            <input 
              id="file-input-trigger" 
              type="file" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelected(file);
              }}
              accept=".jpg,.jpeg,.png,.pdf" 
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          {/* File Upload Area */}
          <FileUpload 
            selectedFile={selectedFile}
            onFileSelected={handleFileSelected}
            onClearSelection={handleClearSelection}
            onExtract={handleExtract}
            isExtracting={extractionStatus === "uploading" || extractionStatus === "processing"}
          />

          {/* Extraction Progress */}
          {(extractionStatus === "uploading" || extractionStatus === "processing") && (
            <ExtractionProgress status={extractionStatus} progress={progress} />
          )}
        </div>

        <div className="lg:col-span-2">
          {/* Empty State */}
          {!extractedData && extractionStatus !== "processing" && extractionStatus !== "uploading" && (
            <div className="bg-white shadow-sm rounded-lg p-8 flex flex-col items-center justify-center text-center h-full">
              <svg className="h-16 w-16 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No Document Selected</h3>
              <p className="mt-1 text-sm text-gray-500">Upload a document to extract data and view results here</p>
            </div>
          )}

          {/* Extracted Data Form */}
          {extractedData && (
            <ExtractedDataForm data={extractedData} onSaveData={handleSaveData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtractPage;

import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ExtractionStatus } from "@/lib/extraction";

interface ExtractionProgressProps {
  status: ExtractionStatus;
  progress: number;
}

const ExtractionProgress = ({ status, progress }: ExtractionProgressProps) => {
  const isUploaded = progress >= 30;
  const isOcrComplete = progress >= 60;
  const isAiProcessing = progress < 100;

  return (
    <Card className="mt-4">
      <CardContent className="p-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Extracting Data</h4>
        
        <div className="space-y-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle2 className="h-5 w-5 text-success-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-700">Document Upload</h3>
              <p className="text-xs text-gray-500">Document successfully uploaded</p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isUploaded ? (
                <CheckCircle2 className="h-5 w-5 text-success-500" />
              ) : (
                <Loader className="h-5 w-5 text-primary animate-spin" />
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-700">OCR Processing</h3>
              <p className="text-xs text-gray-500">
                {isUploaded ? "Text extracted from document" : "Extracting text from document..."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isOcrComplete ? (
                isAiProcessing ? (
                  <Loader className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-success-500" />
                )
              ) : (
                <div className="h-5 w-5 text-gray-400">
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
              )}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-gray-700">AI Analysis</h3>
              <p className="text-xs text-gray-500">
                {isOcrComplete 
                  ? (isAiProcessing ? "Analyzing document structure..." : "Document structure analyzed")
                  : "Waiting for OCR completion..."}
              </p>
            </div>
          </div>
          
          <div className="flex items-center text-gray-400">
            <div className="flex-shrink-0">
              {!isAiProcessing ? (
                <CheckCircle2 className="h-5 w-5 text-success-500" />
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${!isAiProcessing ? "text-gray-700" : "text-gray-400"}`}>
                Field Extraction
              </h3>
              <p className={`text-xs ${!isAiProcessing ? "text-gray-500" : "text-gray-400"}`}>
                {!isAiProcessing ? "Fields successfully extracted" : "Extracting dates, amounts, and details"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="relative">
            <Progress value={progress} className="h-2" />
          </div>
          <p className="mt-2 text-xs text-gray-500 text-center">This may take a moment depending on document complexity</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExtractionProgress;

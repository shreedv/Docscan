import { Button } from "@/components/ui/button";
import { Document } from "@shared/schema";
import { Calendar, CreditCard, FileText, Clipboard } from "lucide-react";
import { formatDate } from "@/utils/format";

interface HistoryListProps {
  documents: Document[];
  onDelete: (id: number) => void;
}

const HistoryList = ({ documents, onDelete }: HistoryListProps) => {
  return (
    <div className="flex flex-col space-y-4">
      {documents.map((doc) => (
        <div 
          key={doc.id} 
          className="bg-gray-50 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <div className="flex-1">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {doc.vendor} - {doc.documentType}
                </h4>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-4">
                  <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                    <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{formatDate(doc.date)}</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                    <CreditCard className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>${doc.totalAmount}</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                    <Clipboard className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                    <span>{doc.documentNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4 md:mt-0">
            <Button 
              size="sm" 
              variant="outline" 
              asChild
            >
              <a href={`/view/${doc.id}`}>View</a>
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              asChild
            >
              <a href={`/edit/${doc.id}`}>Edit</a>
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => onDelete(doc.id)}
            >
              <span className="sr-only">Delete</span>
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HistoryList;

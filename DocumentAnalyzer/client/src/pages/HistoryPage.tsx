import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, FileText, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Document } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import HistoryList from "@/components/HistoryList";

const HistoryPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  const { 
    data: documents, 
    isLoading, 
    isError, 
    refetch 
  } = useQuery<Document[]>({
    queryKey: ['/api/documents'],
  });

  useEffect(() => {
    if (documents) {
      const pages = Math.ceil(documents.length / 10);
      setTotalPages(pages > 0 ? pages : 1);
    }
  }, [documents]);

  // Calculate pagination
  const startIndex = (currentPage - 1) * 10;
  const endIndex = startIndex + 10;
  const currentDocuments = documents?.slice(startIndex, endIndex) || [];

  const handleDeleteDocument = async (id: number) => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      toast({
        title: 'Document deleted',
        description: 'The document has been successfully deleted.',
      });

      // Refetch documents to update the list
      refetch();
    } catch (error) {
      console.error('Error deleting document:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the document. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Extraction History</CardTitle>
        <CardDescription className="text-sm text-gray-500">View and manage your previously extracted documents</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <div className="flex gap-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-8">
            <p className="text-error-500">Failed to load documents. Please try again.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => refetch()}
            >
              Retry
            </Button>
          </div>
        ) : documents?.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents yet</h3>
            <p className="mt-1 text-sm text-gray-500">Upload and extract data from a document to see it here.</p>
            <div className="mt-6">
              <Button asChild>
                <a href="/">Upload Document</a>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <HistoryList 
              documents={currentDocuments} 
              onDelete={handleDeleteDocument} 
            />
            
            <div className="mt-6 flex justify-between">
              <div className="text-sm text-gray-500">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(endIndex, documents?.length || 0)}
                </span>{' '}
                of <span className="font-medium">{documents?.length}</span> results
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoryPage;

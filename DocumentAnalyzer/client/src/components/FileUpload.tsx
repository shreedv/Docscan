import { UploadCloud, FileText, Image, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/utils/format";
import { useState, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type FileWithPreview = {
  file: File;
  preview: string;
};

interface FileUploadProps {
  selectedFile: FileWithPreview | null;
  onFileSelected: (file: File) => void;
  onClearSelection: () => void;
  onExtract: () => void;
  isExtracting: boolean;
}

const FileUpload = ({ selectedFile, onFileSelected, onClearSelection, onExtract, isExtracting }: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [recentUploads, setRecentUploads] = useState<{ name: string, date: string }[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): boolean => {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPG, PNG, or PDF file.",
        variant: "destructive"
      });
      return false;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload a file smaller than 10MB.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };
  
  const processFile = (file: File) => {
    if (validateFile(file)) {
      onFileSelected(file);
      
      // Add to recent uploads
      setRecentUploads(prev => [
        { name: file.name, date: 'Just now' },
        ...prev.slice(0, 2)
      ]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };
  
  // Drag & Drop handlers
  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  }, []);
  
  // Camera capture functionality
  const startCamera = () => {
    setShowCamera(true);
    
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Error accessing camera:", err);
          toast({
            title: "Camera Error",
            description: "Unable to access your camera. Please check permissions.",
            variant: "destructive"
          });
          setShowCamera(false);
        });
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "camera-capture.jpg", { type: 'image/jpeg' });
          processFile(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.95);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setShowCamera(false);
  };

  return (
    <Card>
      <CardHeader className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <CardTitle className="text-lg font-medium text-gray-900">Upload Document</CardTitle>
        <CardDescription className="text-sm text-gray-500">Upload an image or PDF to extract data</CardDescription>
      </CardHeader>
      
      <CardContent className="p-6">
        {showCamera ? (
          <div className="camera-capture space-y-4">
            <div className="relative">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                className="w-full h-auto rounded-lg border border-gray-200"
              ></video>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            <div className="flex justify-between">
              <Button variant="outline" onClick={stopCamera}>
                Cancel
              </Button>
              <Button onClick={captureImage}>
                Capture Receipt
              </Button>
            </div>
          </div>
        ) : !selectedFile ? (
          <div>
            <div 
              className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary'}`}
              onClick={handleFileSelect}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
            >
              <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500">
                {dragActive ? 'Drop your file here' : 'Drag and drop your file here, or click to browse'}
              </p>
              <p className="mt-1 text-xs text-gray-400">Supports: JPG, PNG, PDF (max 10MB)</p>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".jpg,.jpeg,.png,.pdf" 
              />
            </div>
            
            <div className="mt-4 flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={startCamera}>
                <Camera className="mr-2 h-4 w-4" />
                Take Photo of Receipt
              </Button>
            </div>
            
            {recentUploads.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700">Recent uploads</h4>
                <ul className="mt-2 divide-y divide-gray-200">
                  {recentUploads.map((upload, idx) => (
                    <li key={idx} className="py-2 flex justify-between items-center">
                      <div className="flex items-center">
                        {upload.name.endsWith('.pdf') ? (
                          <FileText className="h-5 w-5 text-gray-400" />
                        ) : (
                          <Image className="h-5 w-5 text-gray-400" />
                        )}
                        <span className="ml-2 text-sm text-gray-600">{upload.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{upload.date}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Selected Document</h4>
              <button 
                type="button" 
                className="text-sm text-primary hover:text-primary/80"
                onClick={onClearSelection}
              >
                Change
              </button>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-2">
              <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded">
                <img 
                  className="object-contain w-full h-full rounded" 
                  src={selectedFile.preview} 
                  alt="Document preview" 
                />
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-sm text-gray-600 truncate">{selectedFile.file.name}</span>
                <span className="text-xs text-gray-500">{formatFileSize(selectedFile.file.size)}</span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button
                className="w-full"
                onClick={onExtract}
                disabled={isExtracting}
              >
                Extract Data
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;

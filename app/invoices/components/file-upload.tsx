"use client"

import { useState, useCallback } from "react"
import { Upload, File, X, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  title: string;
  description: string;
  accept: string;
  maxSizeInMB: number;
  onFileSelected: (file: File) => void;
  onFileRemoved?: () => void;
  selectedFile?: File | null;
  disabled?: boolean;
  fileIcon?: React.ReactNode;
  errorMessage?: string;
}

export function FileUpload({
  title,
  description,
  accept,
  maxSizeInMB,
  onFileSelected,
  onFileRemoved,
  selectedFile,
  disabled = false,
  fileIcon,
  errorMessage
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const handleFileSelection = () => {
    if (disabled) return;
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        onFileSelected(target.files[0]);
      }
    };
    input.click();
  };
  
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(true);
  }, [disabled]);
  
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
  }, [disabled]);
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (disabled) return;
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelected(e.dataTransfer.files[0]);
    }
  }, [disabled, onFileSelected]);
  
  return (
    <div className="mb-4">
      {!selectedFile ? (
        <div 
          className={cn(
            "border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors",
            isDragging && "border-primary bg-muted/50",
            errorMessage && "border-destructive",
            disabled && "opacity-60 cursor-not-allowed"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={disabled ? undefined : handleFileSelection}
        >
          <Upload className="h-10 w-10 text-muted-foreground mb-3" />
          <h3 className="font-medium text-base mb-1">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2 text-center">
            {description}
          </p>
          
          {errorMessage && (
            <div className="text-destructive text-sm mt-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-1" />
              {errorMessage}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 border rounded-md bg-muted/50 flex justify-between items-center">
          <div className="flex items-center">
            {fileIcon || <File className="h-8 w-8 text-blue-500 mr-3 flex-shrink-0" />}
            <div className="overflow-hidden">
              <h3 className="font-medium truncate">{selectedFile.name}</h3>
              <div className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onFileRemoved}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
} 
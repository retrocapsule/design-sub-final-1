'use client';

import { UploadButton } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core"; // Adjust path if needed
import { toast } from "sonner";
import { X, FileText, Trash2 } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

// Interface defining the structure of the file data we expect
interface UploadedFile {
  url: string;
  name: string;
  size: number;
}

// Props for the FileUpload component
interface FileUploadProps {
  value: UploadedFile[]; // The current array of uploaded file objects
  onChange: (files: UploadedFile[]) => void; // Function to update the form state
  endpoint: keyof OurFileRouter; // The specific Uploadthing endpoint to use
}

// The FileUpload component using Uploadthing's UploadButton
export function FileUpload({ value = [], onChange, endpoint }: FileUploadProps) {
  const uploadedFiles = value || [];

  // --- Debugging: Check if public App ID is loaded --- 
  useEffect(() => {
    console.log("[FileUpload] NEXT_PUBLIC_UPLOADTHING_APP_ID:", process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID);
    if (!process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID) {
        console.warn("[FileUpload] WARNING: NEXT_PUBLIC_UPLOADTHING_APP_ID is not set or accessible!");
    }
  }, []);
  // --- End Debugging ---

  // Function to handle removing a file from the list
  const handleRemove = (urlToRemove: string) => {
    onChange(uploadedFiles.filter((file) => file.url !== urlToRemove));
    toast.info("File removed.");
    // Note: This only removes it from the form state, not from Uploadthing storage.
  };

  return (
    <div className="space-y-4">
      {/* Display existing/uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded files ({uploadedFiles.length})</p>
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li key={file.url} className="flex items-center justify-between bg-slate-50 p-2 rounded-md">
                <div className="flex items-center overflow-hidden mr-2">
                  <FileText className="h-4 w-4 text-slate-500 mr-2 flex-shrink-0" />
                  <span className="text-sm truncate" title={file.name}>{file.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemove(file.url)}
                  type="button"
                  aria-label="Remove file"
                >
                  <Trash2 className="h-4 w-4 text-destructive hover:text-red-700" />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* UploadButton for adding new files */}
      <UploadButton<OurFileRouter, "designRequestUploader">
        endpoint={endpoint}
        onClientUploadComplete={(res) => {
          if (res) {
            // Map the fields returned by the core.ts onUploadComplete (likely under serverData)
            const newFiles: UploadedFile[] = res.map((fileInfo) => ({
              url: fileInfo.serverData.fileUrl,  // Access via serverData
              name: fileInfo.serverData.fileName, // Access via serverData
              size: fileInfo.serverData.fileSize, // Access via serverData
            }));
            onChange([...uploadedFiles, ...newFiles]); 
            toast.success(`${newFiles.length} file(s) uploaded successfully!`);
          }
        }}
        onUploadError={(error: Error) => {
          toast.error(`Upload failed: ${error.message}`);
        }}
      />
    </div>
  );
} 
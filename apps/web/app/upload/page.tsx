"use client";

import { FileUpload } from "@/components/file-upload";

export default function UploadPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">
        File Upload to IPFS
      </h1>
      <FileUpload />

      <div className="mt-12 max-w-2xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">How It Works</h2>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 mt-0.5">
              1
            </div>
            <div>
              <h3 className="font-medium">Select or Drop Files</h3>
              <p className="text-sm text-muted-foreground">
                Choose files from your device or drag and drop them into the
                upload area.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 mt-0.5">
              2
            </div>
            <div>
              <h3 className="font-medium">Upload to IPFS</h3>
              <p className="text-sm text-muted-foreground">
                Click the upload button to store your files on IPFS via Pinata.
              </p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-3 mt-0.5">
              3
            </div>
            <div>
              <h3 className="font-medium">Get IPFS Hash</h3>
              <p className="text-sm text-muted-foreground">
                After upload, you&apos;ll receive an IPFS hash to access your
                file.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

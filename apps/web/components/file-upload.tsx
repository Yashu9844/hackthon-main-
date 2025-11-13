'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Loader2, UploadCloud } from 'lucide-react';

type FileWithPreview = File & {
  preview: string;
};

export function FileUpload() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<{ipfsHash: string; pinSize: number; timestamp: string} | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles.map(file => Object.assign(file, {
      preview: URL.createObjectURL(file)
    })));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
    },
    maxFiles: 5,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const uploadToPinata = async () => {
    if (files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('file', file);
      });

      // Add metadata if needed
      formData.append('pinataMetadata', JSON.stringify({
        name: files[0].name,
      }));

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      setUploadResult({
        ipfsHash: result.IpfsHash,
        pinSize: result.PinSize,
        timestamp: result.Timestamp
      });
      
      setUploadProgress(100);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    URL.revokeObjectURL(newFiles[index].preview);
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Upload Files to IPFS via Pinata</CardTitle>
        <CardDescription>
          Drag and drop your files here, or click to select files
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-primary/10' : 'border-muted-foreground/25 hover:border-primary/50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-2">
            <UploadCloud className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {isDragActive 
                ? 'Drop the files here...' 
                : 'Drag and drop files here, or click to select files'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: Images, PDFs, Text files (max 50MB)
            </p>
          </div>
        </div>

        {files.length > 0 && (
          <div className="mt-6 space-y-4">
            <h4 className="text-sm font-medium">Selected Files</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={file.name} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 w-10 h-10 bg-muted rounded-md flex items-center justify-center">
                      {file.type.startsWith('image/') ? (
                        <img 
                          src={file.preview} 
                          alt={file.name} 
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          {file.name.split('.').pop()?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Button 
                onClick={uploadToPinata} 
                disabled={isUploading || files.length === 0}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${files.length} file${files.length !== 1 ? 's' : ''} to IPFS`
                )}
              </Button>
              
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-right mt-1">
                    {uploadProgress}% Complete
                  </p>
                </div>
              )}

              {uploadResult && (
                <div className="mt-4 p-4 bg-muted/50 rounded-md">
                  <h4 className="text-sm font-medium mb-2">Upload Successful!</h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">IPFS Hash:</span> {uploadResult.ipfsHash}</p>
                    <p><span className="font-medium">Size:</span> {uploadResult.pinSize} bytes</p>
                    <p><span className="font-medium">Timestamp:</span> {new Date(uploadResult.timestamp).toLocaleString()}</p>
                    <p className="mt-2">
                      <a 
                        href={`https://gateway.pinata.cloud/ipfs/${uploadResult.ipfsHash}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View on IPFS Gateway
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

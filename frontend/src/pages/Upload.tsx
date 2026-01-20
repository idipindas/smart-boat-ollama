import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { useFileUpload } from '../hooks/useFileUpload';
import Layout from '../components/layout/Layout';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import FileUploader from '../components/upload/FileUploader';
import UploadProgress from '../components/upload/UploadProgress';

const Upload: React.FC = () => {
  const { organizationId } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; size: string; chunksAdded: number }>
  >([]);

  const { uploadFile, progress, isUploading, error, reset } = useFileUpload(
    organizationId || ''
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    reset();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadFile(selectedFile);

    if (result.success) {
      addToast('success', `Document uploaded successfully! ${result.chunksAdded} chunks processed.`);
      setUploadedFiles((prev) => [
        ...prev,
        {
          name: selectedFile.name,
          size: formatFileSize(selectedFile.size),
          chunksAdded: result.chunksAdded || 0,
        },
      ]);
      setSelectedFile(null);
    } else {
      addToast('error', error || 'Failed to upload document');
    }
  };

  const handleGoToChat = () => {
    navigate('/chat');
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload Documents
          </h1>
          <p className="text-gray-600">
            Upload PDF documents to build your AI knowledge base
          </p>
        </div>

        <div className="space-y-6">
          {/* Upload Section */}
          <Card>
            <FileUploader
              onFileSelect={handleFileSelect}
              disabled={isUploading}
            />

            {/* Selected File */}
            {selectedFile && !isUploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={() => setSelectedFile(null)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleUpload}>Upload</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && selectedFile && (
              <div className="mt-6">
                <UploadProgress
                  fileName={selectedFile.name}
                  progress={progress}
                  fileSize={formatFileSize(selectedFile.size)}
                />
              </div>
            )}
          </Card>

          {/* Uploaded Files List */}
          {uploadedFiles.length > 0 && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Uploaded Documents
                </h2>
                <Button onClick={handleGoToChat} variant="secondary">
                  Go to Chat →
                </Button>
              </div>

              <div className="space-y-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {/* PDF Icon */}
                      <div className="w-10 h-10 bg-green-100 rounded flex items-center justify-center">
                        <svg
                          className="w-6 h-6 text-green-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      <div>
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">
                          {file.size} • {file.chunksAdded} chunks processed
                        </p>
                      </div>
                    </div>

                    <span className="text-sm font-medium text-green-600">
                      Uploaded
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Empty State */}
          {uploadedFiles.length === 0 && !selectedFile && (
            <Card className="text-center py-8">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    No documents uploaded yet
                  </h3>
                  <p className="text-sm text-gray-500">
                    Upload your first PDF to build your knowledge base
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Upload;

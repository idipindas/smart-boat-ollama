import { useState } from 'react';
import { api } from '../api/client';

export const useFileUpload = (organizationId: string) => {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<{ success: boolean; chunksAdded?: number }> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const response = await api.uploadDocument(organizationId, file, setProgress);
      setProgress(100);
      return { success: true, chunksAdded: response.chunks_added };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      return { success: false };
    } finally {
      setIsUploading(false);
    }
  };

  const reset = () => {
    setProgress(0);
    setError(null);
  };

  return { uploadFile, progress, isUploading, error, reset };
};

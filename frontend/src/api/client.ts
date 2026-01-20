import { API_BASE_URL } from '../utils/constants';
import type { CreateOrgResponse, UploadResponse, ChatResponse } from '../types/index';

export const api = {
  // POST /organizations
  createOrganization: async (name: string): Promise<CreateOrgResponse> => {
    const response = await fetch(`${API_BASE_URL}/organizations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to create organization');
    }

    return response.json();
  },

  // POST /upload
  uploadDocument: async (
    organizationId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable && onProgress) {
          const progress = (e.loaded / e.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            reject(new Error('Failed to parse response'));
          }
        } else {
          reject(new Error(xhr.responseText || 'Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error during upload'));
      });

      xhr.open('POST', `${API_BASE_URL}/upload?organization_id=${organizationId}`);
      xhr.send(formData);
    });
  },

  // POST /chat
  sendMessage: async (
    organizationId: string,
    sessionId: string,
    question: string
  ): Promise<ChatResponse> => {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        organization_id: organizationId,
        session_id: sessionId,
        question,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Failed to send message');
    }

    return response.json();
  },
};

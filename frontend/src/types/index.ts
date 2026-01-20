// Organization
export interface Organization {
  id: string;
  name: string;
}

// Chat Message
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// API Responses
export interface CreateOrgResponse {
  message: string;
  organization_id: string;
  note: string;
}

export interface UploadResponse {
  message: string;
  chunks_added: number;
}

export interface ChatResponse {
  answer: string;
}

// Toast Notification
export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

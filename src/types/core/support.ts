export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'account' | 'feature' | 'bug' | 'other';
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FAQEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
  helpful: number;
  lastUpdated: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  feedback: string;
  category: string;
  createdAt: string;
}
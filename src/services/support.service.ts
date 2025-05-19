import { supabase } from './database';
import { SupportTicket, FAQEntry } from '../types/core/support';

export class SupportService {
  async createSupportTicket(ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt'>): Promise<SupportTicket> {
    const { data, error } = await supabase
      .from('support_tickets')
      .insert([{
        ...ticket,
        status: 'open'
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getFAQs(): Promise<FAQEntry[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('category', { ascending: true });

    if (error) throw error;
    return data;
  }

  async searchKnowledgeBase(query: string): Promise<FAQEntry[]> {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .textSearch('content', query);

    if (error) throw error;
    return data;
  }

  async submitFeedback(userId: string, feedback: string, category: string) {
    const { error } = await supabase
      .from('user_feedback')
      .insert([{
        userId,
        feedback,
        category
      }]);

    if (error) throw error;
  }
}
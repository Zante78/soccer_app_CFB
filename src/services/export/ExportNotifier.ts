import { ExportError } from '../../utils/errorUtils';
import { supabase } from '../database';

export class ExportNotifier {
  async notifySuccess(userId: string, jobId: string): Promise<void> {
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Export erfolgreich',
        body: 'Ihr Export wurde erfolgreich abgeschlossen.',
        type: 'export',
        priority: 'low',
        data: { jobId, status: 'completed' }
      });

      if (error) {
        console.error('Failed to send success notification:', error);
      }
    } catch (error) {
      console.error('Failed to send success notification:', error);
    }
  }

  async notifyError(userId: string, jobId: string, error: unknown): Promise<void> {
    try {
      const errorMessage = error instanceof ExportError 
        ? error.message 
        : error instanceof Error
          ? error.message
          : 'Ein unerwarteter Fehler ist aufgetreten';

      const { error: dbError } = await supabase.from('notifications').insert({
        user_id: userId,
        title: 'Export fehlgeschlagen',
        body: errorMessage,
        type: 'export',
        priority: 'high',
        data: { 
          jobId, 
          status: 'failed',
          error: errorMessage
        }
      });

      if (dbError) {
        console.error('Failed to send error notification:', dbError);
      }
    } catch (error) {
      console.error('Failed to send error notification:', error);
    }
  }

  async notifyProgress(userId: string, jobId: string, progress: number): Promise<void> {
    // Only notify at 0%, 25%, 50%, 75% and 100%
    if (progress % 25 === 0) {
      try {
        const { error } = await supabase.from('notifications').insert({
          user_id: userId,
          title: 'Export Fortschritt',
          body: `Export ist zu ${progress}% abgeschlossen.`,
          type: 'export',
          priority: 'low',
          data: { 
            jobId, 
            status: 'processing',
            progress 
          }
        });

        if (error) {
          console.error('Failed to send progress notification:', error);
        }
      } catch (error) {
        console.error('Failed to send progress notification:', error);
      }
    }
  }
}
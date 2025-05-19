import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExportService } from '../services/export.service';
import { BatchProcessor } from '../services/export/BatchProcessor';
import { supabase } from '../services/database';

// Mock Supabase
vi.mock('../services/database', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn()
    })),
    storage: {
      from: vi.fn().mockReturnThis(),
      upload: vi.fn(),
      getPublicUrl: vi.fn()
    }
  }
}));

describe('ExportService', () => {
  let exportService: ExportService;

  beforeEach(() => {
    vi.clearAllMocks();
    exportService = ExportService.getInstance();
  });

  describe('createExportJob', () => {
    it('should create an export job with correct initial status', async () => {
      const mockJob = {
        id: '123',
        status: 'pending',
        config: { type: 'player', format: 'csv' }
      };

      (supabase.from().single as jest.Mock).mockResolvedValueOnce({
        data: mockJob,
        error: null
      });

      const result = await exportService.createExportJob(
        { type: 'player', format: 'csv' },
        'user-123'
      );

      expect(result).toEqual(mockJob);
      expect(supabase.from).toHaveBeenCalledWith('export_jobs');
    });

    it('should handle errors when creating export job', async () => {
      (supabase.from().single as jest.Mock).mockResolvedValueOnce({
        data: null,
        error: new Error('Database error')
      });

      await expect(
        exportService.createExportJob(
          { type: 'player', format: 'csv' },
          'user-123'
        )
      ).rejects.toThrow();
    });
  });

  describe('BatchProcessor', () => {
    it('should process items in batches with progress updates', async () => {
      const processor = new BatchProcessor({ batchSize: 2 });
      const items = [1, 2, 3, 4, 5];
      const processItem = vi.fn();
      const onProgress = vi.fn();

      await processor.processBatch(items, processItem, onProgress);

      expect(processItem).toHaveBeenCalledTimes(5);
      expect(onProgress).toHaveBeenCalledTimes(5);
      expect(onProgress).toHaveBeenLastCalledWith(5, 5);
    });

    it('should retry failed operations', async () => {
      const processor = new BatchProcessor({
        batchSize: 1,
        maxRetries: 2,
        retryDelay: 100
      });

      const processItem = vi.fn()
        .mockRejectedValueOnce(new Error('Fail'))
        .mockResolvedValueOnce(undefined);

      await processor.processBatch([1], processItem);

      expect(processItem).toHaveBeenCalledTimes(2);
    });
  });
});
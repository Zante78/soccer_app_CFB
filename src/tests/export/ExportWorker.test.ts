import { describe, it, expect, beforeEach } from 'vitest';
import { ExportWorker } from '../../services/export/ExportWorker';

describe('ExportWorker', () => {
  let worker: ExportWorker;
  const testData = [
    { id: 1, name: 'Test 1' },
    { id: 2, name: 'Test 2' }
  ];

  beforeEach(() => {
    worker = new ExportWorker('csv');
  });

  it('should format data to CSV correctly', async () => {
    const result = await worker.processExport(testData);
    expect(result).toBeInstanceOf(Blob);
    expect(result.type).toBe('text/csv');

    const text = await result.text();
    expect(text).toContain('id,name');
    expect(text).toContain('1,"Test 1"');
    expect(text).toContain('2,"Test 2"');
  });

  it('should cache results and return cached data', async () => {
    const cacheKey = 'test-key';
    
    // First call should process data
    const result1 = await worker.processExport(testData, cacheKey);
    
    // Second call should return cached data
    const result2 = await worker.processExport(testData, cacheKey);
    
    expect(result1).toEqual(result2);
  });

  it('should clear cache when requested', async () => {
    const cacheKey = 'test-key';
    
    // Cache some data
    await worker.processExport(testData, cacheKey);
    
    // Clear cache
    worker.clearCache();
    
    // Should process data again
    const result = await worker.processExport(testData, cacheKey);
    expect(result).toBeInstanceOf(Blob);
  });
});
export class ConcurrencyManager {
  private static instance: ConcurrencyManager;
  private activeJobs: Map<string, AbortController> = new Map();
  private readonly MAX_CONCURRENT_JOBS = 3;

  private constructor() {}

  public static getInstance(): ConcurrencyManager {
    if (!ConcurrencyManager.instance) {
      ConcurrencyManager.instance = new ConcurrencyManager();
    }
    return ConcurrencyManager.instance;
  }

  async acquireLock(jobId: string): Promise<AbortController> {
    while (this.activeJobs.size >= this.MAX_CONCURRENT_JOBS) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const controller = new AbortController();
    this.activeJobs.set(jobId, controller);
    return controller;
  }

  releaseLock(jobId: string): void {
    this.activeJobs.delete(jobId);
  }

  cancelJob(jobId: string): void {
    const controller = this.activeJobs.get(jobId);
    if (controller) {
      controller.abort();
      this.activeJobs.delete(jobId);
    }
  }

  getActiveJobCount(): number {
    return this.activeJobs.size;
  }
}
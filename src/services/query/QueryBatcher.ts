/**
 * Service für das Batching von Datenbankabfragen zur Reduzierung der Serveranfragen.
 */
export class QueryBatcher {
  private static instance: QueryBatcher;
  private batchTimeout: number = 50; // ms
  private maxBatchSize: number = 10;
  private queue: Map<string, Set<string>> = new Map();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): QueryBatcher {
    if (!QueryBatcher.instance) {
      QueryBatcher.instance = new QueryBatcher();
    }
    return QueryBatcher.instance;
  }

  /**
   * Fügt eine ID zur Batch-Queue hinzu
   */
  addToBatch(type: string, id: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.queue.has(type)) {
        this.queue.set(type, new Set());
      }

      const batch = this.queue.get(type)!;
      batch.add(id);

      // Lösche existierenden Timeout
      if (this.timeouts.has(type)) {
        clearTimeout(this.timeouts.get(type)!);
      }

      // Setze neuen Timeout oder führe sofort aus wenn Batch voll
      if (batch.size >= this.maxBatchSize) {
        this.executeBatch(type).then(resolve).catch(reject);
      } else {
        const timeout = setTimeout(() => {
          this.executeBatch(type).then(resolve).catch(reject);
        }, this.batchTimeout);
        this.timeouts.set(type, timeout);
      }
    });
  }

  /**
   * Führt die gesammelten Abfragen als Batch aus
   */
  private async executeBatch(type: string): Promise<any> {
    const batch = this.queue.get(type);
    if (!batch || batch.size === 0) return;

    const ids = Array.from(batch);
    this.queue.delete(type);
    this.timeouts.delete(type);

    try {
      // Hier die eigentliche Batch-Abfrage ausführen
      const results = await this.executeBatchQuery(type, ids);
      return results;
    } catch (error) {
      console.error('Batch query error:', error);
      throw error;
    }
  }

  private async executeBatchQuery(type: string, ids: string[]): Promise<any> {
    // Implementiere die spezifische Batch-Abfrage je nach Typ
    switch (type) {
      case 'players':
        return this.batchLoadPlayers(ids);
      case 'teams':
        return this.batchLoadTeams(ids);
      default:
        throw new Error(`Unknown batch type: ${type}`);
    }
  }

  private async batchLoadPlayers(ids: string[]) {
    // Implementiere Spieler-Batch-Abfrage
  }

  private async batchLoadTeams(ids: string[]) {
    // Implementiere Team-Batch-Abfrage
  }
}
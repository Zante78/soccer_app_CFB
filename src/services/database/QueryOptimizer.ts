import { supabase } from '../database';
import { PostgrestFilterBuilder } from '@supabase/postgrest-js';

export class QueryOptimizer {
  private static instance: QueryOptimizer;
  
  private constructor() {}

  public static getInstance(): QueryOptimizer {
    if (!QueryOptimizer.instance) {
      QueryOptimizer.instance = new QueryOptimizer();
    }
    return QueryOptimizer.instance;
  }

  optimizeQuery<T>(query: PostgrestFilterBuilder<any, any, T[]>): PostgrestFilterBuilder<any, any, T[]> {
    // Add common query optimizations
    query = this.addPagination(query);
    query = this.addCaching(query);
    query = this.addPreloading(query);
    
    return query;
  }

  private addPagination<T>(query: PostgrestFilterBuilder<any, any, T[]>): PostgrestFilterBuilder<any, any, T[]> {
    // Add default pagination if not already set
    if (!query.url.includes('limit=')) {
      query = query.limit(20);
    }
    return query;
  }

  private addCaching<T>(query: PostgrestFilterBuilder<any, any, T[]>): PostgrestFilterBuilder<any, any, T[]> {
    // Add cache headers
    const headers = new Headers();
    headers.append('Cache-Control', 'public, max-age=300'); // 5 minutes
    query.headers = headers;
    
    return query;
  }

  private addPreloading<T>(query: PostgrestFilterBuilder<any, any, T[]>): PostgrestFilterBuilder<any, any, T[]> {
    // Add preloading hints for related data
    const headers = new Headers(query.headers);
    headers.append('X-Preload', 'true');
    query.headers = headers;
    
    return query;
  }

  async executeOptimizedQuery<T>(
    query: PostgrestFilterBuilder<any, any, T[]>
  ): Promise<{ data: T[] | null; error: Error | null }> {
    try {
      const optimizedQuery = this.optimizeQuery(query);
      const { data, error } = await optimizedQuery;
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error) {
      console.error('Query execution error:', error);
      return { data: null, error: error as Error };
    }
  }
}
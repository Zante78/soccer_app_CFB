export interface AnalysisMetric {
  id: string;
  playerId: string;
  metricType: 'performance' | 'progress' | 'comparison';
  name: string;
  value: number;
  context?: Record<string, any>;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisReport {
  id: string;
  playerId: string;
  authorId: string;
  title: string;
  content: string;
  metrics: string[];
  reportDate: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisGoal {
  id: string;
  playerId: string;
  metricId?: string;
  title: string;
  description?: string;
  targetValue: number;
  currentValue: number;
  startDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceTrend {
  date: string;
  value: number;
  trend: number;
}

export interface PlayerStatistics {
  metricName: string;
  avgValue: number;
  minValue: number;
  maxValue: number;
  trend: number;
}
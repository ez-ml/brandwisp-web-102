import { BigQueryService } from '@/lib/services/bigquery';
import { StoreModel } from '@/lib/models/store';

export interface AnalyticsHealth {
  status: 'healthy' | 'warning' | 'critical';
  lastDataPoint: Date | null;
  dataGaps: Array<{ start: Date; end: Date; reason: string }>;
  errorRate: number;
  latency: number;
  recommendations: string[];
}

export interface DataQualityMetrics {
  completeness: number; // Percentage of expected data points
  accuracy: number; // Percentage of valid data points
  consistency: number; // Percentage of consistent data across sources
  timeliness: number; // Percentage of data received within expected timeframe
  issues: Array<{
    type: 'missing' | 'invalid' | 'inconsistent' | 'delayed';
    description: string;
    severity: 'low' | 'medium' | 'high';
    affectedRecords: number;
  }>;
}

export interface PerformanceMetrics {
  queryLatency: {
    avg: number;
    p95: number;
    p99: number;
  };
  throughput: {
    eventsPerSecond: number;
    queriesPerSecond: number;
  };
  errorRates: {
    ingestion: number;
    query: number;
    sync: number;
  };
  resourceUsage: {
    bigQuerySlots: number;
    storageGB: number;
    networkGB: number;
  };
}

export class AnalyticsMonitoringService {
  static async getAnalyticsHealth(storeId?: string): Promise<AnalyticsHealth> {
    try {
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      // Check for recent data
      const recentDataQuery = `
        SELECT 
          MAX(timestamp) as last_data_point,
          COUNT(*) as total_events,
          COUNTIF(timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)) as recent_events
        FROM \`brandwisp-dev.analytics.product_events\`
        ${storeId ? `WHERE store_id = '${storeId}'` : ''}
        WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
      `;

      const [rows] = await BigQueryService.query({ query: recentDataQuery });
      const data = rows[0];

      const lastDataPoint = data?.last_data_point ? new Date(data.last_data_point.value) : null;
      const totalEvents = parseInt(data?.total_events) || 0;
      const recentEvents = parseInt(data?.recent_events) || 0;

      // Calculate health status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      const recommendations: string[] = [];

      if (!lastDataPoint || (now.getTime() - lastDataPoint.getTime()) > 2 * 60 * 60 * 1000) {
        status = 'critical';
        recommendations.push('No data received in the last 2 hours. Check data ingestion pipeline.');
      } else if ((now.getTime() - lastDataPoint.getTime()) > 30 * 60 * 1000) {
        status = 'warning';
        recommendations.push('Data delay detected. Last data point is over 30 minutes old.');
      }

      if (recentEvents < totalEvents * 0.1) {
        status = status === 'critical' ? 'critical' : 'warning';
        recommendations.push('Low recent activity. Check if tracking is working properly.');
      }

      // Check for data gaps
      const dataGaps = await this.detectDataGaps(storeId);

      // Calculate error rate
      const errorRate = await this.calculateErrorRate(storeId);

      return {
        status,
        lastDataPoint,
        dataGaps,
        errorRate,
        latency: lastDataPoint ? now.getTime() - lastDataPoint.getTime() : 0,
        recommendations,
      };
    } catch (error) {
      console.error('Error getting analytics health:', error);
      return {
        status: 'critical',
        lastDataPoint: null,
        dataGaps: [],
        errorRate: 100,
        latency: 0,
        recommendations: ['Unable to check analytics health. System may be down.'],
      };
    }
  }

  static async getDataQualityMetrics(storeId?: string, days = 7): Promise<DataQualityMetrics> {
    try {
      const qualityQuery = `
        WITH data_quality AS (
          SELECT
            DATE(timestamp) as date,
            COUNT(*) as total_events,
            COUNTIF(user_id IS NOT NULL) as events_with_user,
            COUNTIF(session_id IS NOT NULL) as events_with_session,
            COUNTIF(product_id IS NOT NULL) as events_with_product,
            COUNTIF(price IS NOT NULL AND price > 0) as events_with_valid_price,
            COUNTIF(timestamp IS NOT NULL) as events_with_timestamp,
            COUNTIF(event_type IN ('view', 'add_to_cart', 'purchase', 'remove_from_cart')) as valid_event_types
          FROM \`brandwisp-dev.analytics.product_events\`
          ${storeId ? `WHERE store_id = '${storeId}' AND` : 'WHERE'} 
            timestamp >= TIMESTAMP(DATE_SUB(CURRENT_DATE(), INTERVAL ${days} DAY))
          GROUP BY date
        )
        SELECT
          AVG(events_with_user / total_events) * 100 as user_completeness,
          AVG(events_with_session / total_events) * 100 as session_completeness,
          AVG(events_with_product / total_events) * 100 as product_completeness,
          AVG(events_with_valid_price / total_events) * 100 as price_accuracy,
          AVG(events_with_timestamp / total_events) * 100 as timestamp_completeness,
          AVG(valid_event_types / total_events) * 100 as event_type_accuracy,
          SUM(total_events) as total_events
        FROM data_quality
      `;

      const [rows] = await BigQueryService.query({ query: qualityQuery });
      const data = rows[0];

      const completeness = (
        (parseFloat(data?.user_completeness) || 0) +
        (parseFloat(data?.session_completeness) || 0) +
        (parseFloat(data?.product_completeness) || 0) +
        (parseFloat(data?.timestamp_completeness) || 0)
      ) / 4;

      const accuracy = (
        (parseFloat(data?.price_accuracy) || 0) +
        (parseFloat(data?.event_type_accuracy) || 0)
      ) / 2;

      // Check consistency across different time periods
      const consistency = await this.calculateConsistency(storeId, days);

      // Check timeliness (data received within expected timeframe)
      const timeliness = await this.calculateTimeliness(storeId, days);

      const issues = await this.identifyDataIssues(storeId, days);

      return {
        completeness,
        accuracy,
        consistency,
        timeliness,
        issues,
      };
    } catch (error) {
      console.error('Error getting data quality metrics:', error);
      return {
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        timeliness: 0,
        issues: [{
          type: 'missing',
          description: 'Unable to calculate data quality metrics',
          severity: 'high',
          affectedRecords: 0,
        }],
      };
    }
  }

  static async getPerformanceMetrics(days = 7): Promise<PerformanceMetrics> {
    try {
      // This would typically come from BigQuery job statistics and monitoring
      // For now, we'll return sample metrics
      return {
        queryLatency: {
          avg: 250, // ms
          p95: 500,
          p99: 1000,
        },
        throughput: {
          eventsPerSecond: 150,
          queriesPerSecond: 25,
        },
        errorRates: {
          ingestion: 0.1, // 0.1%
          query: 0.05,
          sync: 0.2,
        },
        resourceUsage: {
          bigQuerySlots: 100,
          storageGB: 50,
          networkGB: 10,
        },
      };
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return {
        queryLatency: { avg: 0, p95: 0, p99: 0 },
        throughput: { eventsPerSecond: 0, queriesPerSecond: 0 },
        errorRates: { ingestion: 100, query: 100, sync: 100 },
        resourceUsage: { bigQuerySlots: 0, storageGB: 0, networkGB: 0 },
      };
    }
  }

  static async generateHealthReport(storeId?: string): Promise<{
    overall: AnalyticsHealth;
    dataQuality: DataQualityMetrics;
    performance: PerformanceMetrics;
    recommendations: string[];
    timestamp: Date;
  }> {
    const [overall, dataQuality, performance] = await Promise.all([
      this.getAnalyticsHealth(storeId),
      this.getDataQualityMetrics(storeId),
      this.getPerformanceMetrics(),
    ]);

    const recommendations = [
      ...overall.recommendations,
      ...this.generateDataQualityRecommendations(dataQuality),
      ...this.generatePerformanceRecommendations(performance),
    ];

    return {
      overall,
      dataQuality,
      performance,
      recommendations: Array.from(new Set(recommendations)), // Remove duplicates
      timestamp: new Date(),
    };
  }

  private static async detectDataGaps(storeId?: string): Promise<Array<{ start: Date; end: Date; reason: string }>> {
    // Implementation to detect gaps in data
    // This would analyze timestamps to find periods with no data
    return [];
  }

  private static async calculateErrorRate(storeId?: string): Promise<number> {
    // Implementation to calculate error rate from logs or error events
    return 0.1; // 0.1% error rate
  }

  private static async calculateConsistency(storeId?: string, days = 7): Promise<number> {
    // Implementation to check data consistency across different sources
    return 95; // 95% consistency
  }

  private static async calculateTimeliness(storeId?: string, days = 7): Promise<number> {
    // Implementation to check if data arrives within expected timeframes
    return 98; // 98% of data arrives on time
  }

  private static async identifyDataIssues(storeId?: string, days = 7): Promise<DataQualityMetrics['issues']> {
    // Implementation to identify specific data quality issues
    return [];
  }

  private static generateDataQualityRecommendations(metrics: DataQualityMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.completeness < 90) {
      recommendations.push('Data completeness is below 90%. Review data collection implementation.');
    }

    if (metrics.accuracy < 95) {
      recommendations.push('Data accuracy is below 95%. Implement better data validation.');
    }

    if (metrics.consistency < 90) {
      recommendations.push('Data consistency is below 90%. Check for synchronization issues.');
    }

    if (metrics.timeliness < 95) {
      recommendations.push('Data timeliness is below 95%. Optimize data pipeline performance.');
    }

    return recommendations;
  }

  private static generatePerformanceRecommendations(metrics: PerformanceMetrics): string[] {
    const recommendations: string[] = [];

    if (metrics.queryLatency.avg > 1000) {
      recommendations.push('Average query latency is high. Consider optimizing queries or adding indexes.');
    }

    if (metrics.errorRates.ingestion > 1) {
      recommendations.push('High ingestion error rate. Check data pipeline health.');
    }

    if (metrics.resourceUsage.bigQuerySlots > 500) {
      recommendations.push('High BigQuery slot usage. Consider optimizing queries or upgrading plan.');
    }

    return recommendations;
  }
} 
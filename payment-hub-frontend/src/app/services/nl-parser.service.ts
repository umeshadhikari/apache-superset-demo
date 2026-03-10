import { Injectable } from '@angular/core';
import { ChartConfig } from './superset-direct.service';

/**
 * Parsed intent from a natural-language chart query.
 */
export interface NlIntent {
  dataset: 'payments' | 'statements';
  datasourceId: number;
  groupByColumn: string;
  metric: string;           // 'count' | 'sum' | 'avg'
  metricColumn?: string;    // column to aggregate (e.g. 'amount', 'balance')
  vizType: string;          // Superset viz_type
  timeFilter?: string;      // 'this month', 'this week', 'today', etc.
  limit?: number;
  chartTitle: string;
}

// Column aliases → actual DB column names
const COLUMN_ALIASES: Record<string, string> = {
  channel: 'channel',
  channels: 'channel',
  status: 'status',
  statuses: 'status',
  type: 'payment_type',
  'payment type': 'payment_type',
  'payment_type': 'payment_type',
  'paymenttype': 'payment_type',
  currency: 'currency',
  currencies: 'currency',
  'error code': 'error_code',
  'error_code': 'error_code',
  'errorcode': 'error_code',
  errors: 'error_code',
  error: 'error_code',
  'transaction type': 'transaction_type',
  'transaction_type': 'transaction_type',
  description: 'description',
  account: 'account_id',
  'account id': 'account_id',
  'debit account': 'debit_account_id',
  'credit account': 'credit_account_id',
};

// Metric keywords → metric type + column
const METRIC_PATTERNS: { pattern: RegExp; metric: string; column?: string }[] = [
  { pattern: /total\s+amount|sum\s+(?:of\s+)?amount/i, metric: 'sum', column: 'amount' },
  { pattern: /average\s+amount|avg\s+amount|mean\s+amount/i, metric: 'avg', column: 'amount' },
  { pattern: /total\s+balance|sum\s+(?:of\s+)?balance/i, metric: 'sum', column: 'balance' },
  { pattern: /average\s+balance|avg\s+balance/i, metric: 'avg', column: 'balance' },
  { pattern: /total\s+debit|sum\s+debit/i, metric: 'sum', column: 'debit_amount' },
  { pattern: /total\s+credit|sum\s+credit/i, metric: 'sum', column: 'credit_amount' },
  { pattern: /count|number\s+of|how\s+many/i, metric: 'count' },
];

// Time filter keywords
const TIME_FILTERS: { pattern: RegExp; filter: string; grainSqlalchemy: string }[] = [
  { pattern: /today/i, filter: 'today', grainSqlalchemy: 'PT1H' },
  { pattern: /this\s+week/i, filter: 'this week', grainSqlalchemy: 'P1D' },
  { pattern: /this\s+month/i, filter: 'this month', grainSqlalchemy: 'P1D' },
  { pattern: /this\s+year/i, filter: 'this year', grainSqlalchemy: 'P1M' },
  { pattern: /last\s+7\s+days/i, filter: 'last 7 days', grainSqlalchemy: 'P1D' },
  { pattern: /last\s+30\s+days/i, filter: 'last 30 days', grainSqlalchemy: 'P1D' },
  { pattern: /last\s+month/i, filter: 'last month', grainSqlalchemy: 'P1D' },
  { pattern: /last\s+year/i, filter: 'last year', grainSqlalchemy: 'P1M' },
];

// Chart type hints
const VIZ_HINTS: { pattern: RegExp; vizType: string }[] = [
  { pattern: /\bpie\b/i, vizType: 'pie' },
  { pattern: /\bdonut\b/i, vizType: 'pie' },
  { pattern: /\bbar\b/i, vizType: 'dist_bar' },
  { pattern: /\bline\b|trend|over\s+time|timeline/i, vizType: 'echarts_timeseries_line' },
  { pattern: /\btable\b|\btabular\b/i, vizType: 'table' },
  { pattern: /\btreemap\b/i, vizType: 'treemap_v2' },
  { pattern: /\bfunnel\b/i, vizType: 'funnel' },
  { pattern: /\barea\b/i, vizType: 'echarts_area' },
  { pattern: /\bnumber\b|\bkpi\b|\bbig number\b/i, vizType: 'big_number_total' },
];

@Injectable({ providedIn: 'root' })
export class NlParserService {

  /**
   * Parse a natural language query and return structured intent.
   * Example: "show me payments by channel this month" →
   *   { dataset: 'payments', groupByColumn: 'channel', metric: 'count', timeFilter: 'this month', ... }
   */
  parse(query: string): NlIntent {
    const q = query.toLowerCase().trim();

    // 1. Detect dataset
    const isStatements = /statement/i.test(q);
    const dataset: 'payments' | 'statements' = isStatements ? 'statements' : 'payments';
    // Default dataset IDs (from the summary): payments=1, statements=2
    const datasourceId = isStatements ? 2 : 1;

    // 2. Detect group-by column (look for "by <column>")
    let groupByColumn = '';
    const byMatch = q.match(/\bby\s+(\w[\w\s]*?)(?:\s+(?:this|last|today|for|in|over|as|using|chart|pie|bar|line|table|area|funnel|treemap|trend)|\s*$)/);
    if (byMatch) {
      const colPhrase = byMatch[1].trim();
      groupByColumn = COLUMN_ALIASES[colPhrase] || colPhrase.replace(/\s+/g, '_');
    }

    // 3. Detect metric
    let metric = 'count';
    let metricColumn: string | undefined;
    for (const mp of METRIC_PATTERNS) {
      if (mp.pattern.test(q)) {
        metric = mp.metric;
        metricColumn = mp.column;
        break;
      }
    }

    // 4. Detect time filter
    let timeFilter: string | undefined;
    for (const tf of TIME_FILTERS) {
      if (tf.pattern.test(q)) {
        timeFilter = tf.filter;
        break;
      }
    }

    // 5. Detect chart type hint
    let vizType = '';
    for (const vh of VIZ_HINTS) {
      if (vh.pattern.test(q)) {
        vizType = vh.vizType;
        break;
      }
    }

    // 6. Smart default viz type if not specified
    if (!vizType) {
      if (timeFilter || /over\s+time|trend|timeline/i.test(q)) {
        vizType = 'echarts_timeseries_line';
      } else if (groupByColumn && metric === 'count') {
        vizType = 'pie';
      } else if (groupByColumn) {
        vizType = 'echarts_timeseries_bar';
      } else {
        vizType = 'big_number_total';
      }
    }

    // 7. Detect limit (top N)
    let limit: number | undefined;
    const topMatch = q.match(/top\s+(\d+)/i);
    if (topMatch) {
      limit = parseInt(topMatch[1], 10);
    }

    // 8. Build a readable chart title
    const chartTitle = this.buildTitle(dataset, groupByColumn, metric, metricColumn, timeFilter);

    return {
      dataset,
      datasourceId,
      groupByColumn,
      metric,
      metricColumn,
      vizType,
      timeFilter,
      limit,
      chartTitle,
    };
  }

  /**
   * Convert a parsed NL intent into a Superset ChartConfig payload.
   */
  toChartConfig(intent: NlIntent): ChartConfig {
    const metrics = this.buildMetrics(intent);
    const groupby = intent.groupByColumn ? [intent.groupByColumn] : [];
    const timeRange = intent.timeFilter ? this.mapTimeRange(intent.timeFilter) : 'No filter';

    const params: Record<string, any> = {
      viz_type: intent.vizType,
      datasource: `${intent.datasourceId}__table`,
      metrics,
      groupby,
      time_range: timeRange,
      row_limit: intent.limit || 100,
      adhoc_filters: [],
      color_scheme: 'fisGlobal',
      granularity_sqla: 'created_at',
      time_grain_sqla: 'P1D',
    };

    // viz-type-specific params
    switch (intent.vizType) {
      case 'pie':
        params['metric'] = metrics[0];          // pie form expects singular 'metric'
        params['innerRadius'] = 40;
        params['outerRadius'] = 70;
        params['show_labels'] = true;
        params['label_type'] = 'key_percent';
        params['show_labels_threshold'] = 5;
        params['date_format'] = 'smart_date';
        params['number_format'] = 'SMART_NUMBER';
        break;
      case 'big_number_total':
        params['metric'] = metrics[0];
        break;
      case 'echarts_timeseries_line':
      case 'echarts_timeseries_bar':
      case 'echarts_area':
        params['x_axis'] = 'created_at';
        params['contributionMode'] = null;
        params['show_legend'] = true;
        break;
      case 'dist_bar':
        params['columns'] = [];
        params['show_legend'] = true;
        break;
      case 'table':
        params['all_columns'] = groupby.length > 0
          ? [...groupby, ...(intent.metricColumn ? [intent.metricColumn] : [])]
          : ['id', 'status', 'amount', 'channel', 'created_at'];
        params['order_by_cols'] = [];
        break;
      case 'treemap_v2':
        params['metric'] = metrics[0];          // treemap form expects singular 'metric'
        params['show_labels'] = true;
        break;
      case 'funnel':
        params['metric'] = metrics[0];          // funnel form expects singular 'metric'
        break;
    }

    // Build clean query fields for query_context (no viz-specific keys)
    const queryFields = {
      columns: groupby,
      metrics,
      orderby: metrics.map((m: any) => [m, false]),
      row_limit: intent.limit || 100,
      time_range: timeRange,
      granularity_sqla: 'created_at',
      time_grain_sqla: 'P1D',
    };

    return {
      chartName: intent.chartTitle,
      vizType: intent.vizType,
      datasourceId: intent.datasourceId,
      datasourceType: 'table',
      params,
      queryFields,
    };
  }

  // ── Helpers ───────────────────────────────────────────────

  /**
   * Build metric list for the params.
   * Superset 3.x accepts:
   *   - Simple string: "count" for COUNT(*)
   *   - Object: { expressionType: "SQL", sqlExpression: "SUM(amount)", label: "..." }
   */
  private buildMetrics(intent: NlIntent): any[] {
    if (intent.metric === 'count') {
      // Use the simple string "count" — Superset resolves this to COUNT(*)
      return ['count'];
    }
    const col = intent.metricColumn || 'amount';
    const agg = intent.metric.toUpperCase();
    return [{
      expressionType: 'SQL',
      sqlExpression: `${agg}(${col})`,
      label: `${agg}(${col})`,
    }];
  }

  private mapTimeRange(filter: string): string {
    const map: Record<string, string> = {
      today: 'today',
      'this week': 'this week',
      'this month': 'this month',
      'this year': 'this year',
      'last 7 days': 'Last week',
      'last 30 days': 'Last month',
      'last month': 'Last month',
      'last year': 'Last year',
    };
    return map[filter] || 'No filter';
  }

  private buildTitle(
    dataset: string,
    column: string,
    metric: string,
    metricColumn: string | undefined,
    timeFilter: string | undefined
  ): string {
    const metricLabel =
      metric === 'count' ? 'Count' : `${metric.toUpperCase()}(${metricColumn || 'amount'})`;
    const colLabel = column
      ? column.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : '';
    const dsLabel = dataset.charAt(0).toUpperCase() + dataset.slice(1);
    const timeLabel = timeFilter ? ` — ${timeFilter}` : '';

    if (!colLabel) return `${dsLabel} ${metricLabel}${timeLabel}`;
    return `${dsLabel} ${metricLabel} by ${colLabel}${timeLabel}`;
  }
}

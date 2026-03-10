import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, switchMap, map, of, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChartConfig {
  chartName: string;
  vizType: string;
  datasourceId: number;
  datasourceType: string;
  params: Record<string, any>;
  /** Clean query definition used inside query_context (no viz-specific keys). */
  queryFields: {
    columns: string[];
    metrics: any[];
    orderby: any[];
    row_limit: number;
    time_range: string;
    granularity_sqla?: string;
    time_grain_sqla?: string;
  };
}

export interface NlChartResult {
  chartId: number;
  chartUrl: string;
  chartName: string;
  vizType: string;
  embedUrl: string;
}

/**
 * Direct Superset REST API client for creating charts on-the-fly.
 *
 * API calls go through the Angular dev-server proxy (/superset-api → :8088)
 * to avoid CORS issues. Iframe embed URLs still point directly to Superset.
 */
@Injectable({ providedIn: 'root' })
export class SupersetDirectService {
  /** Proxy prefix — Angular dev-server rewrites this to http://localhost:8088 */
  private readonly apiBase = '/superset-api';
  /** Direct Superset URL — used only for iframe embed src attributes */
  private readonly supersetUrl = environment.superset.baseUrl;
  private accessToken = '';
  private csrfToken = '';

  constructor(private http: HttpClient) {}

  /** Full flow: authenticate → create chart → return embed info. */
  createChartFromConfig(config: ChartConfig): Observable<NlChartResult> {
    // Always re-authenticate to avoid stale tokens
    this.accessToken = '';
    return this.authenticate().pipe(
      switchMap(() => this.fetchCsrf()),
      switchMap(() => this.postChart(config))
    );
  }

  /** Fetch available datasets from Superset. */
  getDatasets(): Observable<any[]> {
    return this.authenticate().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiBase}/api/v1/dataset/`, {
          headers: this.authHeaders(),
        })
      ),
      map((res) => res.result || [])
    );
  }

  /** Get columns for a specific dataset. */
  getDatasetColumns(datasetId: number): Observable<any> {
    return this.authenticate().pipe(
      switchMap(() =>
        this.http.get<any>(`${this.apiBase}/api/v1/dataset/${datasetId}`, {
          headers: this.authHeaders(),
        })
      ),
      map((res) => res.result)
    );
  }

  // ── Private helpers ─────────────────────────────────────────

  private authenticate(): Observable<string> {
    if (this.accessToken) return of(this.accessToken);

    return this.http
      .post<any>(`${this.apiBase}/api/v1/security/login`, {
        username: environment.superset.username,
        password: environment.superset.password,
        provider: 'db',
        refresh: true,
      })
      .pipe(
        tap((res) => (this.accessToken = res.access_token)),
        map((res) => res.access_token)
      );
  }

  private fetchCsrf(): Observable<string> {
    return this.http
      .get<any>(`${this.apiBase}/api/v1/security/csrf_token/`, {
        headers: this.authHeaders(),
        withCredentials: true,
      })
      .pipe(
        tap((res) => (this.csrfToken = res.result)),
        map((res) => res.result)
      );
  }

  private postChart(config: ChartConfig): Observable<NlChartResult> {
    const headers = this.authHeaders()
      .set('X-CSRFToken', this.csrfToken)
      .set('Content-Type', 'application/json');

    // Build a proper query_context so the explore page auto-executes.
    // The query_context.queries[] must only contain query-engine fields
    // (columns, metrics, orderby, row_limit, time_range, filters) —
    // NOT viz-specific params like innerRadius, show_labels, etc.
    const queryContext = {
      datasource: {
        id: config.datasourceId,
        type: config.datasourceType,
      },
      force: false,
      queries: [
        {
          columns: config.queryFields.columns,
          metrics: config.queryFields.metrics,
          orderby: config.queryFields.orderby,
          row_limit: config.queryFields.row_limit,
          time_range: config.queryFields.time_range,
          granularity_sqla: config.queryFields.granularity_sqla || null,
          time_grain_sqla: config.queryFields.time_grain_sqla || null,
          filters: [],
          extras: {
            time_grain_sqla: config.queryFields.time_grain_sqla || 'P1D',
          },
        },
      ],
      result_format: 'json',
      result_type: 'full',
    };

    const body: Record<string, any> = {
      slice_name: config.chartName,
      viz_type: config.vizType,
      datasource_id: config.datasourceId,
      datasource_type: config.datasourceType,
      params: JSON.stringify(config.params),
      query_context: JSON.stringify(queryContext),
    };

    return this.http
      .post<any>(`${this.apiBase}/api/v1/chart/`, body, {
        headers,
        withCredentials: true,
      })
      .pipe(
        map((res) => {
          const id = res.id;
          return {
            chartId: id,
            chartUrl: `${this.supersetUrl}/explore/?slice_id=${id}`,
            chartName: config.chartName,
            vizType: config.vizType,
            embedUrl: `${this.supersetUrl}/superset/explore/?slice_id=${id}&standalone=1&height=400`,
          };
        }),
        catchError((err) => {
          console.error('Superset chart creation failed:', err);
          const msg =
            err?.error?.message ||
            err?.error?.errors?.[0]?.message ||
            err?.message ||
            'Unknown Superset error';
          return throwError(() => new Error(msg));
        })
      );
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${this.accessToken}`);
  }
}

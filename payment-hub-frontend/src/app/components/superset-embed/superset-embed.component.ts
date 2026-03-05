import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupersetService } from '../../services/superset.service';
import { SupersetGuestToken } from '../../models/payment.model';
import { embedDashboard } from '@superset-ui/embedded-sdk';
import { environment } from '../../../environments/environment';
import { retry, timer } from 'rxjs';

/** UUID v4 pattern — used to distinguish SDK-embeddable UUIDs from numeric IDs. */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

@Component({
  standalone: false,
  selector: 'app-superset-embed',
  templateUrl: './superset-embed.component.html',
  styleUrls: ['./superset-embed.component.scss']
})
export class SupersetEmbedComponent implements OnInit, OnDestroy {

  @ViewChild('embedContainer', { static: false }) embedContainer!: ElementRef<HTMLDivElement>;

  dashboardId = '';
  loading = true;
  error = '';
  /** True when the guest token expired mid-session and a refresh is needed. */
  sessionExpired = false;
  /** True while offline */
  isOffline = false;
  /** Non-blocking slow-load warning */
  slowWarning = false;

  /** True when `dashboardId` is a UUID supported by the Embedded SDK. */
  isUuidMode = false;
  /** Safe iframe URL used when falling back to direct iframe embedding. */
  iframeSrc: SafeResourceUrl | null = null;

  private readonly supersetBaseUrl = environment.superset.baseUrl;
  private readonly LOAD_TIMEOUT_MS = 15_000;
  private loadTimer: ReturnType<typeof setTimeout> | null = null;

  /** Most recent guest token response — updated on every refresh by the Embedded SDK. */
  private cachedTokenInfo: SupersetGuestToken | null = null;

  private readonly offlineHandler = () => { this.isOffline = true; };
  private readonly onlineHandler  = () => { this.isOffline = false; this.retry(); };

  constructor(
    private route: ActivatedRoute,
    private supersetService: SupersetService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    window.addEventListener('offline', this.offlineHandler);
    window.addEventListener('online',  this.onlineHandler);

    this.dashboardId = this.route.snapshot.paramMap.get('dashboardId') || '';
    if (!this.dashboardId) {
      this.error = 'No dashboard ID provided.';
      this.loading = false;
      return;
    }
    if (UUID_PATTERN.test(this.dashboardId)) {
      this.isUuidMode = true;
      this.loadEmbeddedDashboard();
    } else {
      // Numeric or non-UUID identifier — render via direct iframe
      this.isUuidMode = false;
      const url = `${this.supersetBaseUrl}/superset/dashboard/${this.dashboardId}/?standalone=1`;
      this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      this.loading = false;
      this.startLoadTimer();
    }
  }

  ngOnDestroy(): void {
    window.removeEventListener('offline', this.offlineHandler);
    window.removeEventListener('online',  this.onlineHandler);
    this.clearLoadTimer();
    if (this.embedContainer?.nativeElement) {
      this.embedContainer.nativeElement.innerHTML = '';
    }
  }

  retry(): void {
    this.error = '';
    this.sessionExpired = false;
    this.slowWarning = false;
    this.loading = true;
    this.clearLoadTimer();
    if (this.isUuidMode) {
      this.loadEmbeddedDashboard();
    } else {
      this.startLoadTimer();
    }
  }

  onIframeLoad(): void {
    this.clearLoadTimer();
    this.loading = false;
    this.slowWarning = false;
  }

  private loadEmbeddedDashboard(): void {
    this.loading = true;
    this.error = '';

    // Fetch initial guest token to discover the Superset domain.
    // Retry up to 3 times with exponential backoff before showing an error.
    this.supersetService.getGuestToken(this.dashboardId).pipe(
      retry({ count: 3, delay: (_, attempt) => timer(Math.pow(2, attempt - 1) * 1000) })
    ).subscribe({
      next: (tokenInfo) => {
        this.cachedTokenInfo = tokenInfo;
        this.mountDashboard(tokenInfo.supersetDomain);
        this.startLoadTimer();
      },
      error: (err) => {
        this.error = this.buildErrorMessage(err);
        this.loading = false;
      }
    });
  }

  private mountDashboard(supersetDomain: string): void {
    try {
      embedDashboard({
        id: this.dashboardId,
        supersetDomain,
        mountPoint: this.embedContainer.nativeElement,
        fetchGuestToken: () => this.fetchGuestToken(),
        dashboardUiConfig: {
          hideTitle: false,
          hideChartControls: false,
          hideTab: false,
          filters: { visible: true, expanded: true }
        }
      }).then(() => {
        this.clearLoadTimer();
        this.loading = false;
        this.slowWarning = false;
      }).catch((err: Error) => {
        this.error = `Failed to embed dashboard: ${err.message}`;
        this.loading = false;
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.error = `Failed to embed dashboard: ${message}`;
      this.loading = false;
    }
  }

  private fetchGuestToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.supersetService.getGuestToken(this.dashboardId).subscribe({
        next: (res) => {
          this.cachedTokenInfo = res;
          this.sessionExpired = false;
          resolve(res.token);
        },
        error: (err) => {
          // Mid-session token expiry — surface a "session expired" overlay
          this.sessionExpired = true;
          reject(new Error(
            `Failed to fetch guest token for dashboard "${this.dashboardId}": ` +
            (err.status ? `HTTP ${err.status} — ` : '') +
            (err.message || 'Unknown error')
          ));
        }
      });
    });
  }

  private buildErrorMessage(err: { status?: number; message?: string }): string {
    if (err.status === 401) {
      return 'Authentication failed. Please refresh the page.';
    }
    if (err.status === 503) {
      return 'Apache Superset is temporarily unavailable. Please try again later.';
    }
    if (!navigator.onLine) {
      return 'You appear to be offline. Please check your network connection.';
    }
    return `Could not load dashboard: ${err.message || 'Unknown error'}`;
  }

  private startLoadTimer(): void {
    this.loadTimer = setTimeout(() => {
      if (this.loading) {
        this.slowWarning = true;
      }
    }, this.LOAD_TIMEOUT_MS);
  }

  private clearLoadTimer(): void {
    if (this.loadTimer !== null) {
      clearTimeout(this.loadTimer);
      this.loadTimer = null;
    }
  }
}



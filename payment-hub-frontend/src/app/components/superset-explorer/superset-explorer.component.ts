import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { SupersetService } from '../../services/superset.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-superset-explorer',
  templateUrl: './superset-explorer.component.html',
  styleUrls: ['./superset-explorer.component.scss']
})
export class SupersetExplorerComponent implements OnInit, OnDestroy {
  @ViewChild('supersetFrame') supersetFrame!: ElementRef<HTMLIFrameElement>;

  supersetUrl: SafeResourceUrl;
  supersetBaseUrl = environment.superset.baseUrl;

  /** True once the health check confirms Superset is unreachable. */
  iframeError = false;
  /** True while the health check or iframe is still loading. */
  loading = true;
  /** Non-empty string shows a slow-load warning banner (but does NOT kill the iframe). */
  showSlowWarning = false;
  /** True when the browser reports it is offline. */
  isOffline = false;

  private readonly LOAD_TIMEOUT_MS = 15_000;
  private loadTimer: ReturnType<typeof setTimeout> | null = null;
  private offlineHandler = () => { this.isOffline = true; };
  private onlineHandler  = () => { this.isOffline = false; this.retry(); };

  private blankLinkHandler: ((e: MouseEvent) => void) | null = null;

  constructor(
    private sanitizer: DomSanitizer,
    private supersetService: SupersetService
  ) {
    const url = `${environment.superset.baseUrl}/superset/welcome/`;
    this.supersetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
    window.addEventListener('offline', this.offlineHandler);
    window.addEventListener('online',  this.onlineHandler);
    this.runHealthCheck();
  }

  ngOnDestroy(): void {
    window.removeEventListener('offline', this.offlineHandler);
    window.removeEventListener('online',  this.onlineHandler);
    this.clearLoadTimer();
  }

  retry(): void {
    this.iframeError = false;
    this.showSlowWarning = false;
    this.loading = true;
    this.runHealthCheck();
  }

  onIframeError(): void {
    this.clearLoadTimer();
    this.iframeError = true;
    this.loading = false;
  }

  onIframeLoad(): void {
    this.clearLoadTimer();
    this.loading = false;
    this.showSlowWarning = false;

    const iframeWindow = this.supersetFrame?.nativeElement?.contentWindow;
    if (!iframeWindow) return;

    // Override window.open to navigate inside iframe instead of opening a new tab
    iframeWindow.open = (url?: string | URL, _target?: string, _features?: string): Window | null => {
      if (url) iframeWindow.location.href = url.toString();
      return iframeWindow;
    };

    // Remove any previously registered handler before adding a new one to avoid duplicates
    if (this.blankLinkHandler) {
      iframeWindow.document.removeEventListener('click', this.blankLinkHandler, true);
    }

    // Intercept all target="_blank" anchor clicks to stay in iframe
    this.blankLinkHandler = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (anchor && anchor.target === '_blank' && anchor.href) {
        const href = anchor.href;
        if (/^https?:\/\//i.test(href)) {
          e.preventDefault();
          iframeWindow.location.href = href;
        }
      }
    };
    iframeWindow.document.addEventListener('click', this.blankLinkHandler, true);
  }

  // ── Private helpers ───────────────────────────────────────────────────

  private runHealthCheck(): void {
    this.supersetService.healthCheck().subscribe({
      next: () => {
        this.iframeError = false;
        this.startLoadTimer();
      },
      error: () => {
        this.iframeError = true;
        this.loading = false;
      }
    });
  }

  private startLoadTimer(): void {
    this.clearLoadTimer();
    this.loadTimer = setTimeout(() => {
      if (this.loading) {
        this.showSlowWarning = true;
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

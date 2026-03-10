import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { environment } from '../../../environments/environment';
import { SupersetService } from '../../services/superset.service';
import { catchError, of } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-superset-explorer',
  templateUrl: './superset-explorer.component.html',
  styleUrls: ['./superset-explorer.component.scss']
})
export class SupersetExplorerComponent implements OnInit, OnDestroy {
  supersetUrl: SafeResourceUrl | null = null;
  supersetBaseUrl = environment.superset.baseUrl;

  /** True while the health check or iframe is loading */
  loading = true;
  /** Set after health check confirms Superset is unreachable */
  supersetReachable = true;
  /** Shown after LOAD_TIMEOUT_MS if the iframe has not fired `(load)` yet */
  slowWarning = false;
  /** User is offline */
  isOffline = false;
  /** Error message from health check */
  errorMessage = '';

  private readonly LOAD_TIMEOUT_MS = 15_000;
  private loadTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly offlineHandler = () => { this.isOffline = true; };
  private readonly onlineHandler  = () => { this.isOffline = false; this.retry(); };

  constructor(
    private sanitizer: DomSanitizer,
    private supersetService: SupersetService,
    private cdr: ChangeDetectorRef
  ) {}

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
    this.slowWarning = false;
    this.errorMessage = '';
    this.supersetReachable = true;
    this.loading = true;
    this.clearLoadTimer();
    this.runHealthCheck();
  }

  onIframeLoad(): void {
    this.clearLoadTimer();
    this.loading = false;
    this.slowWarning = false;
  }

  private runHealthCheck(): void {
    this.supersetService.healthCheck().pipe(
      catchError(() => of(false))
    ).subscribe(reachable => {
      if (reachable) {
        this.supersetReachable = true;
        this.errorMessage = '';
        const url = `${this.supersetBaseUrl}/superset/welcome/`;
        this.supersetUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.startLoadTimer();
      } else {
        this.supersetReachable = false;
        this.loading = false;
        this.errorMessage = 'Apache Superset is currently unavailable. Please try again later.';
      }
      this.cdr.detectChanges();
    });
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


import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SupersetService } from '../../services/superset.service';
import { SupersetGuestToken } from '../../models/payment.model';
import { embedDashboard } from '@superset-ui/embedded-sdk';

@Component({
  standalone: false,
  selector: 'app-superset-embed',
  templateUrl: './superset-embed.component.html',
  styleUrls: ['./superset-embed.component.scss']
})
export class SupersetEmbedComponent implements OnInit, OnDestroy {

  @ViewChild('embedContainer', { static: true }) embedContainer!: ElementRef<HTMLDivElement>;

  dashboardId = '';
  loading = true;
  error = '';

  /** Most recent guest token response — updated on every refresh by the Embedded SDK. */
  private cachedTokenInfo: SupersetGuestToken | null = null;

  constructor(
    private route: ActivatedRoute,
    private supersetService: SupersetService
  ) {}

  ngOnInit(): void {
    this.dashboardId = this.route.snapshot.paramMap.get('dashboardId') || '';
    if (!this.dashboardId) {
      this.error = 'No dashboard ID provided.';
      this.loading = false;
      return;
    }
    this.loadEmbeddedDashboard();
  }

  ngOnDestroy(): void {
    if (this.embedContainer?.nativeElement) {
      this.embedContainer.nativeElement.innerHTML = '';
    }
  }

  private loadEmbeddedDashboard(): void {
    this.loading = true;
    this.error = '';

    // Fetch initial guest token to discover the Superset domain
    this.supersetService.getGuestToken(this.dashboardId).subscribe({
      next: (tokenInfo) => {
        this.cachedTokenInfo = tokenInfo;
        this.mountDashboard(tokenInfo.supersetDomain);
      },
      error: (err) => {
        this.error = `Failed to reach backend for guest token: ${err.message || 'Unknown error'}`;
        this.loading = false;
      }
    });
  }

  private mountDashboard(supersetDomain: string): void {
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
      this.loading = false;
    }).catch((err: Error) => {
      this.error = `Failed to embed dashboard: ${err.message}`;
      this.loading = false;
    });
  }

  private fetchGuestToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.supersetService.getGuestToken(this.dashboardId).subscribe({
        next: (res) => {
          this.cachedTokenInfo = res;
          resolve(res.token);
        },
        error: (err) => reject(new Error(
          `Failed to fetch guest token for dashboard "${this.dashboardId}": ` +
          (err.status ? `HTTP ${err.status} — ` : '') +
          (err.message || 'Unknown error')
        ))
      });
    });
  }
}


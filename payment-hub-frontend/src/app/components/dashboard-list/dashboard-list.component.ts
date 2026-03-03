import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupersetDashboard } from '../../models/payment.model';
import { SupersetService } from '../../services/superset.service';
import { environment } from '../../../environments/environment';

@Component({
  standalone: false,
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
  dashboards: SupersetDashboard[] = [];
  loading = false;
  error = '';
  supersetBaseUrl = environment.superset.baseUrl;

  constructor(private supersetService: SupersetService, private router: Router) {}

  ngOnInit(): void {
    this.loadDashboards();
  }

  loadDashboards(): void {
    this.loading = true;
    this.supersetService.getDashboards().subscribe({
      next: (data) => {
        this.dashboards = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboards.';
        this.loading = false;
      }
    });
  }

  deleteDashboard(id: number | undefined): void {
    if (!id || !confirm('Are you sure you want to delete this dashboard?')) return;
    this.supersetService.deleteDashboard(id).subscribe({
      next: () => {
        this.dashboards = this.dashboards.filter(d => d.id !== id);
      },
      error: () => {
        this.error = 'Failed to delete dashboard.';
      }
    });
  }

  /** Navigate to the embedded Superset dashboard view. */
  embedDashboard(dashboard: SupersetDashboard): void {
    if (dashboard.supersetDashboardId) {
      this.router.navigate(['/superset-embed', dashboard.supersetDashboardId]);
    }
  }

  openInSuperset(dashboard: SupersetDashboard): void {
    const id = dashboard.supersetDashboardId;
    const url = id
      ? `${this.supersetBaseUrl}/superset/dashboard/${id}/`
      : `${this.supersetBaseUrl}/dashboard/list/`;
    window.open(url, '_blank');
  }
}

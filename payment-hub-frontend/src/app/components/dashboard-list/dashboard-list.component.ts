import { Component, OnInit } from '@angular/core';
import { SupersetDashboard } from '../../models/payment.model';
import { SupersetService } from '../../services/superset.service';

@Component({
  selector: 'app-dashboard-list',
  templateUrl: './dashboard-list.component.html',
  styleUrls: ['./dashboard-list.component.scss']
})
export class DashboardListComponent implements OnInit {
  dashboards: SupersetDashboard[] = [];
  loading = false;
  error = '';
  supersetBaseUrl = 'http://localhost:8088';

  constructor(private supersetService: SupersetService) {}

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

  openInSuperset(dashboard: SupersetDashboard): void {
    const url = dashboard.supersetUrl || this.supersetBaseUrl;
    window.open(url, '_blank');
  }
}

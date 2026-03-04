import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupersetTable, SupersetDashboard, SupersetColumn, SupersetRemoteDashboard } from '../../models/payment.model';
import { SupersetService } from '../../services/superset.service';

@Component({
  standalone: false,
  selector: 'app-dashboard-builder',
  templateUrl: './dashboard-builder.component.html',
  styleUrls: ['./dashboard-builder.component.scss']
})
export class DashboardBuilderComponent implements OnInit {
  tables: SupersetTable[] = [];
  selectedTable: SupersetTable | null = null;
  loading = false;
  saving = false;
  error = '';
  saveSuccess = false;
  savedDashboard: SupersetDashboard | null = null;

  /** Dashboards fetched from Superset for UUID linking. */
  supersetDashboards: SupersetRemoteDashboard[] = [];
  supersetDashboardsLoading = false;
  supersetDashboardsError = '';
  uuidWarning = '';

  chartTypes = ['Tabular', 'Bar Chart', 'Pie Chart', 'Line Chart', 'Scatter Plot'];

  dashboard: SupersetDashboard = {
    dashboardName: '',
    description: '',
    chartType: 'Tabular',
    selectedTables: [],
    xAxisColumn: '',
    yAxisColumn: '',
    supersetDashboardId: ''
  };

  constructor(private supersetService: SupersetService, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.supersetService.getTables().subscribe({
      next: (data) => {
        this.tables = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load available tables.';
        this.loading = false;
      }
    });
    this.loadSupersetDashboards();
  }

  loadSupersetDashboards(): void {
    this.supersetDashboardsLoading = true;
    this.supersetDashboardsError = '';
    this.supersetService.getSupersetDashboards().subscribe({
      next: (data) => {
        this.supersetDashboards = data;
        this.supersetDashboardsLoading = false;
      },
      error: () => {
        this.supersetDashboardsError = 'Could not fetch Superset dashboards. You can still enter a UUID manually.';
        this.supersetDashboardsLoading = false;
      }
    });
  }

  /** Auto-links a UUID when the user selects a Superset dashboard title from the dropdown. */
  onSupersetDashboardSelected(uuid: string): void {
    this.dashboard.supersetDashboardId = uuid;
    this.uuidWarning = '';
  }

  /**
   * Tries to auto-link the UUID by matching the current dashboard name
   * against Superset dashboard titles (case-insensitive).
   */
  autoLinkUuid(): void {
    const name = this.dashboard.dashboardName.trim().toLowerCase();
    if (!name) {
      this.uuidWarning = 'Enter a dashboard name first to use auto-link.';
      return;
    }
    const match = this.supersetDashboards.find(
      d => d.title.toLowerCase() === name
    );
    if (match) {
      this.dashboard.supersetDashboardId = match.uuid;
      this.uuidWarning = '';
    } else {
      this.uuidWarning = 'No Superset dashboard title exactly matches "' + this.dashboard.dashboardName + '". Please select or enter a UUID manually.';
    }
  }

  selectTable(table: SupersetTable): void {
    this.selectedTable = table;
  }

  isTableSelected(tableName: string): boolean {
    return this.dashboard.selectedTables.includes(tableName);
  }

  toggleTable(tableName: string): void {
    const idx = this.dashboard.selectedTables.indexOf(tableName);
    if (idx === -1) {
      this.dashboard.selectedTables.push(tableName);
    } else {
      this.dashboard.selectedTables.splice(idx, 1);
    }
  }

  getAvailableColumns(): SupersetColumn[] {
    const cols: SupersetColumn[] = [];
    this.tables
      .filter(t => this.dashboard.selectedTables.includes(t.tableName))
      .forEach(t => cols.push(...t.columns));
    return cols;
  }

  getPreviewText(): string {
    if (!this.dashboard.dashboardName) return 'Enter a dashboard name to see preview.';
    const tables = this.dashboard.selectedTables.join(', ') || 'None';
    const chart = this.dashboard.chartType;
    const x = this.dashboard.xAxisColumn || 'N/A';
    const y = this.dashboard.yAxisColumn || 'N/A';
    return `[${chart}] "${this.dashboard.dashboardName}"\nTables: ${tables}\nX: ${x} | Y: ${y}`;
  }

  saveDashboard(): void {
    if (!this.dashboard.dashboardName || this.dashboard.selectedTables.length === 0) {
      this.error = 'Please provide a dashboard name and select at least one table.';
      return;
    }
    if (!this.dashboard.supersetDashboardId) {
      this.uuidWarning = 'No Superset UUID entered. The dashboard cannot be embedded until a UUID is linked.';
    } else {
      this.uuidWarning = '';
    }
    this.saving = true;
    this.error = '';
    this.supersetService.createDashboard(this.dashboard).subscribe({
      next: (created) => {
        this.savedDashboard = created;
        this.saveSuccess = true;
        this.saving = false;
      },
      error: () => {
        this.error = 'Failed to save dashboard.';
        this.saving = false;
      }
    });
  }

  openInSuperset(dashboard: SupersetDashboard | null): void {
    const url = dashboard?.supersetUrl || 'http://localhost:8088';
    window.open(url, '_blank');
  }

  viewEmbedded(dashboard: SupersetDashboard | null): void {
    if (dashboard?.supersetDashboardId) {
      this.router.navigate(['/superset-embed', dashboard.supersetDashboardId]);
    }
  }

  resetForm(): void {
    this.dashboard = {
      dashboardName: '',
      description: '',
      chartType: 'Tabular',
      selectedTables: [],
      xAxisColumn: '',
      yAxisColumn: '',
      supersetDashboardId: ''
    };
    this.saveSuccess = false;
    this.savedDashboard = null;
    this.selectedTable = null;
    this.uuidWarning = '';
  }
}

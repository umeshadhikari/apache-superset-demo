import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SupersetTable, SupersetDashboard, SupersetColumn } from '../../models/payment.model';
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
  }
}

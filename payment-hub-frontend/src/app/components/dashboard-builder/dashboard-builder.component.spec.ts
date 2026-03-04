import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { DashboardBuilderComponent } from './dashboard-builder.component';
import { SupersetService } from '../../services/superset.service';
import { SupersetRemoteDashboard, SupersetTable } from '../../models/payment.model';

describe('DashboardBuilderComponent', () => {
  let component: DashboardBuilderComponent;
  let fixture: ComponentFixture<DashboardBuilderComponent>;
  let supersetServiceSpy: jasmine.SpyObj<SupersetService>;

  const mockTables: SupersetTable[] = [
    { tableName: 'payments', columns: [{ columnName: 'id', dataType: 'int' }] },
    { tableName: 'statements', columns: [] }
  ];

  const mockRemoteDashboards: SupersetRemoteDashboard[] = [
    { uuid: 'uuid-001', title: 'Live Payments' },
    { uuid: 'uuid-002', title: 'Monthly Statements' }
  ];

  beforeEach(async () => {
    supersetServiceSpy = jasmine.createSpyObj('SupersetService', [
      'getTables',
      'getDashboards',
      'createDashboard',
      'deleteDashboard',
      'getSupersetDashboards'
    ]);
    supersetServiceSpy.getTables.and.returnValue(of(mockTables));
    supersetServiceSpy.getSupersetDashboards.and.returnValue(of(mockRemoteDashboards));

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule],
      declarations: [DashboardBuilderComponent],
      providers: [
        { provide: SupersetService, useValue: supersetServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Domain table filtering ────────────────────────────────────────────

  it('should load only domain tables returned by the backend', () => {
    expect(component.tables).toEqual(mockTables);
    // Verifies that the component uses whatever the backend returns –
    // the filtering itself is tested in the backend.
    expect(component.tables.map(t => t.tableName)).not.toContain('ab_user');
  });

  // ── Superset dashboard list (UUID linking) ────────────────────────────

  it('should load Superset dashboards on init', () => {
    expect(supersetServiceSpy.getSupersetDashboards).toHaveBeenCalledTimes(1);
    expect(component.supersetDashboards).toEqual(mockRemoteDashboards);
  });

  it('should set supersetDashboardsError when loading fails', () => {
    supersetServiceSpy.getSupersetDashboards.and.returnValue(throwError(() => new Error('network')));
    component.loadSupersetDashboards();
    expect(component.supersetDashboardsError).toContain('Could not fetch Superset dashboards');
  });

  // ── onSupersetDashboardSelected ───────────────────────────────────────

  it('should fill UUID when a Superset dashboard is selected', () => {
    component.onSupersetDashboardSelected('uuid-001');
    expect(component.dashboard.supersetDashboardId).toBe('uuid-001');
    expect(component.uuidWarning).toBe('');
  });

  // ── autoLinkUuid ──────────────────────────────────────────────────────

  it('should auto-link UUID when dashboard name exactly matches a Superset title', () => {
    component.dashboard.dashboardName = 'Live Payments';
    component.autoLinkUuid();
    expect(component.dashboard.supersetDashboardId).toBe('uuid-001');
    expect(component.uuidWarning).toBe('');
  });

  it('should set uuidWarning when no Superset title matches the dashboard name', () => {
    component.dashboard.dashboardName = 'Unknown Dashboard';
    component.autoLinkUuid();
    expect(component.uuidWarning).toContain('No Superset dashboard title exactly matches');
  });

  it('autoLinkUuid should warn when dashboard name is empty', () => {
    component.dashboard.dashboardName = '';
    component.autoLinkUuid();
    expect(component.uuidWarning).toContain('Enter a dashboard name first');
  });

  // ── UUID warning on save ──────────────────────────────────────────────

  it('should set uuidWarning when saving without a UUID', () => {
    supersetServiceSpy.createDashboard.and.returnValue(of({
      dashboardName: 'Test', chartType: 'Tabular', selectedTables: ['payments']
    }));
    component.dashboard.dashboardName = 'Test Dashboard';
    component.dashboard.selectedTables = ['payments'];
    component.dashboard.supersetDashboardId = '';
    component.saveDashboard();
    expect(component.uuidWarning).toContain('No Superset UUID entered');
  });

  it('should clear uuidWarning when saving with a valid UUID', () => {
    supersetServiceSpy.createDashboard.and.returnValue(of({
      dashboardName: 'Test', chartType: 'Tabular', selectedTables: ['payments'],
      supersetDashboardId: 'uuid-001'
    }));
    component.dashboard.dashboardName = 'Test Dashboard';
    component.dashboard.selectedTables = ['payments'];
    component.dashboard.supersetDashboardId = 'uuid-001';
    component.uuidWarning = 'previous warning';
    component.saveDashboard();
    expect(component.uuidWarning).toBe('');
  });

  // ── resetForm ─────────────────────────────────────────────────────────

  it('should clear uuidWarning on resetForm', () => {
    component.uuidWarning = 'some warning';
    component.resetForm();
    expect(component.uuidWarning).toBe('');
  });
});

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SupersetTable, SupersetDashboard } from '../models/payment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupersetService {
  private baseUrl = `${environment.apiUrl}/api/superset`;

  constructor(private http: HttpClient) {}

  getTables(): Observable<SupersetTable[]> {
    return this.http.get<SupersetTable[]>(`${this.baseUrl}/tables`);
  }

  getDashboards(): Observable<SupersetDashboard[]> {
    return this.http.get<SupersetDashboard[]>(`${this.baseUrl}/dashboards`);
  }

  createDashboard(dashboard: SupersetDashboard): Observable<SupersetDashboard> {
    return this.http.post<SupersetDashboard>(`${this.baseUrl}/dashboards`, dashboard);
  }

  deleteDashboard(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/dashboards/${id}`);
  }
}

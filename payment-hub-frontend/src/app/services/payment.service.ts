import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment, DashboardStats } from '../models/payment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private baseUrl = `${environment.apiUrl}/api/payments`;

  constructor(private http: HttpClient) {}

  getAll(status?: string, paymentType?: string): Observable<Payment[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    if (paymentType) params = params.set('paymentType', paymentType);
    return this.http.get<Payment[]>(this.baseUrl, { params });
  }

  getByReference(reference: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.baseUrl}/${reference}`);
  }

  create(payment: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.baseUrl, payment);
  }

  updateStatus(reference: string, status: string): Observable<Payment> {
    return this.http.patch<Payment>(`${this.baseUrl}/${reference}/status`, { status });
  }

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }
}

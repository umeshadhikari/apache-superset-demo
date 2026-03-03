import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentFile } from '../models/payment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PaymentFileService {
  private baseUrl = `${environment.apiUrl}/api/payment-files`;

  constructor(private http: HttpClient) {}

  getAll(status?: string): Observable<PaymentFile[]> {
    let params = new HttpParams();
    if (status) params = params.set('status', status);
    return this.http.get<PaymentFile[]>(this.baseUrl, { params });
  }

  getByReference(reference: string): Observable<PaymentFile> {
    return this.http.get<PaymentFile>(`${this.baseUrl}/${reference}`);
  }

  upload(formData: FormData): Observable<PaymentFile> {
    return this.http.post<PaymentFile>(`${this.baseUrl}/upload`, formData);
  }

  updateStatus(reference: string, status: string): Observable<PaymentFile> {
    return this.http.patch<PaymentFile>(`${this.baseUrl}/${reference}/status`, { status });
  }
}

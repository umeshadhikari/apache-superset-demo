import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Statement } from '../models/payment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StatementService {
  private baseUrl = `${environment.apiUrl}/api/statements`;

  constructor(private http: HttpClient) {}

  getByAccount(accountId: string, fromDate?: string, toDate?: string): Observable<Statement[]> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate);
    if (toDate) params = params.set('toDate', toDate);
    return this.http.get<Statement[]>(`${this.baseUrl}/${accountId}`, { params });
  }
}

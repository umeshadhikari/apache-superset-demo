import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Account } from '../models/payment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private baseUrl = `${environment.apiUrl}/api/accounts`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Account[]> {
    return this.http.get<Account[]>(this.baseUrl);
  }

  getById(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/${accountId}`);
  }

  create(account: Account): Observable<Account> {
    return this.http.post<Account>(this.baseUrl, account);
  }
}

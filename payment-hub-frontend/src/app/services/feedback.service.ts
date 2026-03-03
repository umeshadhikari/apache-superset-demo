import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaymentFeedback } from '../models/payment.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private baseUrl = `${environment.apiUrl}/api/feedback`;

  constructor(private http: HttpClient) {}

  getByPaymentReference(paymentReference: string): Observable<PaymentFeedback[]> {
    return this.http.get<PaymentFeedback[]>(`${this.baseUrl}/${paymentReference}`);
  }

  create(feedback: PaymentFeedback): Observable<PaymentFeedback> {
    return this.http.post<PaymentFeedback>(this.baseUrl, feedback);
  }
}

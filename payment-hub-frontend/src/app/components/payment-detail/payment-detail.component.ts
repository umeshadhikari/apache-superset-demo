import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Payment, PaymentFeedback } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-payment-detail',
  templateUrl: './payment-detail.component.html',
  styleUrls: ['./payment-detail.component.scss']
})
export class PaymentDetailComponent implements OnInit {
  payment: Payment | null = null;
  feedbacks: PaymentFeedback[] = [];
  loading = false;
  feedbackLoading = false;
  error = '';
  updateError = '';
  updateSuccess = '';
  newStatus = '';
  statusOptions = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private paymentService: PaymentService,
    private feedbackService: FeedbackService
  ) {}

  ngOnInit(): void {
    const reference = this.route.snapshot.paramMap.get('reference');
    if (reference) {
      this.loadPayment(reference);
      this.loadFeedbacks(reference);
    }
  }

  loadPayment(reference: string): void {
    this.loading = true;
    this.paymentService.getByReference(reference).subscribe({
      next: (data) => {
        this.payment = data;
        this.newStatus = data.status;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load payment details.';
        this.loading = false;
      }
    });
  }

  loadFeedbacks(reference: string): void {
    this.feedbackLoading = true;
    this.feedbackService.getByPaymentReference(reference).subscribe({
      next: (data) => {
        this.feedbacks = data;
        this.feedbackLoading = false;
      },
      error: () => {
        this.feedbackLoading = false;
      }
    });
  }

  updateStatus(): void {
    if (!this.payment || !this.newStatus) return;
    this.updateError = '';
    this.updateSuccess = '';
    this.paymentService.updateStatus(this.payment.paymentReference, this.newStatus).subscribe({
      next: (updated) => {
        this.payment = updated;
        this.updateSuccess = 'Status updated successfully.';
      },
      error: () => {
        this.updateError = 'Failed to update status.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/payments']);
  }

  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      COMPLETED: 'badge-success',
      PENDING: 'badge-warning',
      FAILED: 'badge-danger',
      PROCESSING: 'badge-info',
      REJECTED: 'badge-secondary'
    };
    return map[status] || 'badge-secondary';
  }

  formatAmount(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency || 'USD' }).format(amount);
  }
}

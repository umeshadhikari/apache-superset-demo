import { Component, OnInit } from '@angular/core';
import { Payment } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-payments',
  templateUrl: './payments.component.html',
  styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent implements OnInit {
  payments: Payment[] = [];
  loading = false;
  error = '';
  selectedStatus = '';
  selectedType = '';

  statusOptions = ['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED'];
  typeOptions = ['', 'CREDIT_TRANSFER', 'DIRECT_DEBIT', 'BULK_PAYMENT', 'INTERNAL'];

  constructor(private paymentService: PaymentService, private router: Router) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.loading = true;
    this.error = '';
    this.paymentService.getAll(this.selectedStatus || undefined, this.selectedType || undefined).subscribe({
      next: (data) => {
        this.payments = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load payments. Please try again.';
        this.loading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadPayments();
  }

  viewDetail(reference: string): void {
    this.router.navigate(['/payments', reference]);
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

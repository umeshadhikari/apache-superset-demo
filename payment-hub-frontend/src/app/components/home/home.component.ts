import { Component, OnInit } from '@angular/core';
import { DashboardStats, Payment } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';
import { Router } from '@angular/router';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentPayments: Payment[] = [];
  loading = false;
  error = '';

  constructor(private paymentService: PaymentService, private router: Router) {}

  ngOnInit(): void {
    this.loading = true;
    this.paymentService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.recentPayments = data.recentPayments || [];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load dashboard statistics.';
        this.loading = false;
      }
    });
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
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

  formatAmount(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }
}

import { Component, OnInit } from '@angular/core';
import { PaymentFile } from '../../models/payment.model';
import { PaymentFileService } from '../../services/payment-file.service';

@Component({
  selector: 'app-payment-files',
  templateUrl: './payment-files.component.html',
  styleUrls: ['./payment-files.component.scss']
})
export class PaymentFilesComponent implements OnInit {
  paymentFiles: PaymentFile[] = [];
  filteredFiles: PaymentFile[] = [];
  loading = false;
  error = '';
  selectedStatus = '';

  statusOptions = ['', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REJECTED'];

  constructor(private paymentFileService: PaymentFileService) {}

  ngOnInit(): void {
    this.loadFiles();
  }

  loadFiles(): void {
    this.loading = true;
    this.error = '';
    this.paymentFileService.getAll(this.selectedStatus || undefined).subscribe({
      next: (data) => {
        this.paymentFiles = data;
        this.filteredFiles = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load payment files. Please try again.';
        this.loading = false;
      }
    });
  }

  onStatusChange(): void {
    this.loadFiles();
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

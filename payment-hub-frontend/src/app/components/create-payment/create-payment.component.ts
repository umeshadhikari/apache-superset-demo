import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Payment, Account } from '../../models/payment.model';
import { PaymentService } from '../../services/payment.service';
import { AccountService } from '../../services/account.service';

@Component({
  standalone: false,
  selector: 'app-create-payment',
  templateUrl: './create-payment.component.html',
  styleUrls: ['./create-payment.component.scss']
})
export class CreatePaymentComponent implements OnInit {
  paymentForm: FormGroup;
  accounts: Account[] = [];
  loading = false;
  submitting = false;
  error = '';
  success = '';

  paymentTypes = ['CREDIT_TRANSFER', 'DIRECT_DEBIT', 'BULK_PAYMENT', 'INTERNAL'];
  channels = ['ONLINE', 'MOBILE', 'BRANCH', 'ATM', 'API'];
  currencies = ['USD', 'EUR', 'GBP', 'KES', 'NGN', 'ZAR'];

  constructor(
    private fb: FormBuilder,
    private paymentService: PaymentService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.paymentForm = this.fb.group({
      paymentReference: ['', [Validators.required, Validators.minLength(6)]],
      debitAccountId: ['', Validators.required],
      creditAccountId: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      currency: ['USD', Validators.required],
      paymentType: ['CREDIT_TRANSFER', Validators.required],
      channel: ['ONLINE', Validators.required],
      description: [''],
      valueDate: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loading = true;
    this.accountService.getAll().subscribe({
      next: (data) => {
        this.accounts = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load accounts.';
        this.loading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.paymentForm.invalid) return;
    this.submitting = true;
    this.error = '';
    this.success = '';
    const payment: Payment = { ...this.paymentForm.value, status: 'PENDING' };
    this.paymentService.create(payment).subscribe({
      next: (created) => {
        this.success = `Payment ${created.paymentReference} created successfully!`;
        this.submitting = false;
        setTimeout(() => this.router.navigate(['/payments']), 2000);
      },
      error: () => {
        this.error = 'Failed to create payment. Please try again.';
        this.submitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/payments']);
  }
}

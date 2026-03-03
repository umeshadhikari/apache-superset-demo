import { Component, OnInit } from '@angular/core';
import { Account, Statement } from '../../models/payment.model';
import { AccountService } from '../../services/account.service';
import { StatementService } from '../../services/statement.service';

@Component({
  selector: 'app-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss']
})
export class StatementsComponent implements OnInit {
  accounts: Account[] = [];
  statements: Statement[] = [];
  selectedAccountId = '';
  fromDate = '';
  toDate = '';
  loading = false;
  error = '';

  constructor(
    private accountService: AccountService,
    private statementService: StatementService
  ) {}

  ngOnInit(): void {
    this.accountService.getAll().subscribe({
      next: (data) => { this.accounts = data; },
      error: () => { this.error = 'Failed to load accounts.'; }
    });
  }

  loadStatements(): void {
    if (!this.selectedAccountId) return;
    this.loading = true;
    this.error = '';
    this.statementService.getByAccount(
      this.selectedAccountId,
      this.fromDate || undefined,
      this.toDate || undefined
    ).subscribe({
      next: (data) => {
        this.statements = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load statements.';
        this.loading = false;
      }
    });
  }

  formatAmount(amount: number | undefined): string {
    if (amount == null || amount === 0) return '-';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
  }

  formatBalance(balance: number): string {
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(balance);
  }
}

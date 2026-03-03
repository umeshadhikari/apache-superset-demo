export interface Payment {
  id?: number;
  paymentReference: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  currency: string;
  paymentType: string;
  channel: string;
  status: string;
  description?: string;
  valueDate: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentFile {
  id?: number;
  fileReference: string;
  fileName: string;
  fileType: string;
  status: string;
  totalAmount: number;
  totalCount: number;
  currency: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Account {
  id?: number;
  accountId: string;
  accountName: string;
  accountType: string;
  currency: string;
  balance?: number;
  status?: string;
}

export interface PaymentFeedback {
  id?: number;
  paymentReference: string;
  status: string;
  message: string;
  errorCode?: string;
  createdAt?: string;
}

export interface Statement {
  id?: number;
  accountId: string;
  transactionDate: string;
  valueDate: string;
  description: string;
  debitAmount?: number;
  creditAmount?: number;
  balance: number;
  transactionType: string;
  channel: string;
  reference?: string;
}

export interface DashboardStats {
  totalPayments: number;
  totalAmount: number;
  pendingPayments: number;
  completedPayments: number;
  failedPayments: number;
  processingPayments?: number;
  recentPayments?: Payment[];
}

export interface SupersetColumn {
  columnName: string;
  dataType: string;
  description?: string;
}

export interface SupersetTable {
  tableName: string;
  description?: string;
  columns: SupersetColumn[];
}

export interface SupersetDashboard {
  id?: number;
  dashboardName: string;
  description?: string;
  chartType: string;
  selectedTables: string[];
  xAxisColumn?: string;
  yAxisColumn?: string;
  supersetUrl?: string;
  createdAt?: string;
}

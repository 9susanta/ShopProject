import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface DailyClosingSummary {
  date: string;
  totalSales: number;
  totalPurchases: number;
  totalPayLaterPayments: number;
  totalExpenses: number;
  totalIncome: number;
  totalGSTCollected: number;
  totalGSTPaid: number;
  netCash: number;
  netUPI: number;
  netCard: number;
  netPayLater: number;
  totalTransactions: number;
  totalCustomers: number;
  entries: AccountingLedgerEntry[];
}

export interface AccountingLedgerEntry {
  id: string;
  entryType: string;
  entryDate: string;
  amount: number;
  reference?: string;
  referenceId?: string;
  description?: string;
  gstAmount?: number;
  cgstAmount?: number;
  sgstAmount?: number;
  customerName?: string;
  supplierName?: string;
  createdAt: string;
}

// Re-export for convenience
export type { DailyClosingSummary as DailyClosingSummaryDto };
export type { AccountingLedgerEntry as AccountingLedgerEntryDto };

@Injectable({
  providedIn: 'root',
})
export class AccountingService {
  private api = inject(ApiService);

  getDailyClosingSummary(date?: string): Observable<DailyClosingSummary> {
    const url = date 
      ? `accounting/daily-closing/${date}`
      : 'accounting/daily-closing';
    return this.api.get<DailyClosingSummary>(url);
  }
}


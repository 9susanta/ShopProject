import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';

export interface DailySalesReport {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalTax: number;
  totalDiscount: number;
  totalCash: number;
  totalUPI: number;
  totalCard: number;
  totalPayLater: number;
  totalCustomers: number;
  sales: any[];
}

export interface GSTSlabSummary {
  rate: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalGSTAmount: number;
  transactionCount: number;
}

export interface GSTSummaryReport {
  startDate: string;
  endDate: string;
  totalSales: number;
  totalGST: number;
  totalCGST: number;
  totalSGST: number;
  slabSummaries: GSTSlabSummary[];
}

export interface FastMovingProduct {
  productId: string;
  productName: string;
  sku: string;
  totalQuantitySold: number;
  quantitySold: number;
  totalRevenue: number;
  revenue: number;
  numberOfSales: number;
  averageSalePrice: number;
}

export interface FastMovingProductsReport {
  startDate: string;
  endDate: string;
  products: FastMovingProduct[];
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  private api = inject(ApiService);

  getDailySalesReport(date?: string): Observable<DailySalesReport> {
    const params = date ? { date } : {};
    return this.api.get<DailySalesReport>('reports/daily-sales', { params });
  }

  getGSTSummaryReport(startDate?: string, endDate?: string): Observable<GSTSummaryReport> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    return this.api.get<GSTSummaryReport>('reports/gst-summary', { params });
  }

  getFastMovingProducts(startDate?: string, endDate?: string, topN?: number): Observable<FastMovingProductsReport> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (topN) params.topN = topN;
    return this.api.get<FastMovingProductsReport>('reports/fast-moving', { params });
  }
}


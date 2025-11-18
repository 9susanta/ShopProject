import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { environment } from '../../../environments/environment';

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
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

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

  getSlowMovingProducts(
    fromDate: string,
    toDate: string,
    daysThreshold: number = 90,
    minDaysSinceLastSale: number = 30
  ): Observable<any> {
    const params = new HttpParams()
      .set('startDate', fromDate)
      .set('endDate', toDate)
      .set('daysThreshold', daysThreshold.toString())
      .set('minDaysSinceLastSale', minDaysSinceLastSale.toString());
    return this.http.get<any>(`${this.apiUrl}/slow-moving`, { params });
  }

  getItemWiseSalesReport(
    fromDate: string,
    toDate: string,
    productId?: string,
    categoryId?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('fromDate', fromDate)
      .set('toDate', toDate);
    if (productId) params = params.set('productId', productId);
    if (categoryId) params = params.set('categoryId', categoryId);
    return this.http.get<any>(`${this.apiUrl}/item-wise-sales`, { params });
  }

  getLowStockReport(threshold?: number): Observable<any> {
    let params = new HttpParams();
    if (threshold) params = params.set('threshold', threshold.toString());
    return this.http.get<any>(`${this.apiUrl}/low-stock`, { params });
  }

  getExpiryReport(days: number = 30): Observable<any> {
    const params = new HttpParams().set('days', days.toString());
    return this.http.get<any>(`${this.apiUrl}/expiry`, { params });
  }

  getReorderSuggestions(onlyBelowReorderPoint: boolean = true): Observable<any> {
    const params = new HttpParams().set('onlyBelowReorderPoint', onlyBelowReorderPoint.toString());
    return this.http.get<any>(`${this.apiUrl}/reorder-suggestions`, { params });
  }

  getFastMovingProducts(startDate?: string, endDate?: string, topN?: number): Observable<FastMovingProductsReport> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (topN) params.topN = topN;
    return this.api.get<FastMovingProductsReport>('reports/fast-moving', { params });
  }
}


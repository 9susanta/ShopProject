// Backend DTO structure (matches C# DashboardDto)
export interface DashboardDto {
  todaySales: number;
  totalSalesThisMonth: number;
  totalSalesCountToday: number;
  totalSalesCountThisMonth: number;
  fastMovingProducts: FastMovingProductDto[];
  lowStockCount: number;
  expirySoonCount: number;
  recentImports: ImportJobDto[];
}

export interface FastMovingProductDto {
  productId: string;
  productName: string;
  sku: string;
  quantitySold: number;
  revenue: number;
}

export interface ImportJobDto {
  id: string;
  fileName: string;
  fileType: string;
  status: string;
  totalRows: number;
  processedRows: number;
  successfulRows: number;
  failedRows: number;
  errorReportPath?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

// Frontend model (for backward compatibility and UI)
export interface DashboardKPIs {
  todaySales: number;
  monthSales: number;
  lowStockCount: number;
  totalProducts: number;
  totalCategories: number;
}

export interface RecentImport {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
  totalRows: number;
  successRows: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  lowStockThreshold: number;
  categoryName?: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  recentImports: RecentImport[];
  lowStockProducts: LowStockProduct[];
}



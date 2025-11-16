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



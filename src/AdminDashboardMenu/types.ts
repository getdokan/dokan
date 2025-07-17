export interface ApiResponse< T > {
    data: T;
    success: boolean;
}

export interface TodoItem {
    icon: string;
    count: number;
    title: string;
}

export interface TodoData {
    vendor_approvals: TodoItem;
    product_approvals: TodoItem;
    pending_withdrawals: TodoItem;
    product_inquiries: TodoItem;
    pending_quotes: TodoItem;
    return_requests: TodoItem;
    open_support_tickets: TodoItem;
    pending_verifications: TodoItem;
}

export interface MonthlyOverviewItem {
    icon: string;
    current: number;
    previous: number | { total_orders: number; cancelled_orders: number };
    title: string;
    tooltip: string;
}

export interface MonthlyOverviewData {
    new_products: MonthlyOverviewItem;
    active_vendors: MonthlyOverviewItem;
    new_customers: MonthlyOverviewItem;
    order_cancellation_rate: MonthlyOverviewItem;
    abuse_reports: MonthlyOverviewItem;
    refund: MonthlyOverviewItem;
    support_tickets: MonthlyOverviewItem;
    reviews: MonthlyOverviewItem;
}

// Customer Metrics Types
export interface CustomerMetricsItem {
    icon: string;
    current: number;
    previous: number;
    title: string;
    tooltip: string;
}

export interface CustomerMetricsData {
    recurring_customers: CustomerMetricsItem;
}

export interface AllTimeStatsItem {
    icon: string;
    current: number;
    previous: number;
    title: string;
    tooltip: string;
}

export interface AllTimeStatsData {
    total_products: AllTimeStatsItem;
    total_vendors: AllTimeStatsItem;
    total_customers: AllTimeStatsItem;
    total_orders: AllTimeStatsItem;
    total_sales: AllTimeStatsItem;
    total_commissions: AllTimeStatsItem;
}

export interface SalesChartDataPoint {
    date: string;
    total_sales: number;
    net_sales: number;
    commissions: number;
    order_count: number;
}

export interface SalesChartData {
    current_month_daily: SalesChartDataPoint[];
    previous_month_daily: SalesChartDataPoint[];
}

export interface MonthPickerValue {
    month: string;
    year: string;
}

export type TrendDirection = 'up' | 'down';

// Analytics Types
export interface AnalyticsItem {
    icon: string;
    url: string;
    title: string;
}

export interface AnalyticsData {
    sales_overview: AnalyticsItem;
    revenue_insight: AnalyticsItem;
}

// Top Performing Vendors Types
export interface TopPerformingVendor {
    rank: number;
    vendor_name: string;
    total_earning: number;
    total_orders: number;
    total_commission: number;
}

export type TopPerformingVendorsData = TopPerformingVendor[];

// Most Reviewed Products Types
export interface MostReviewedProduct {
    rank: number;
    product_id: number;
    product_title: string;
    review_count: number;
}

export type MostReviewedProductsData = MostReviewedProduct[];

// Most Reported Vendors Types
export interface MostReportedVendor {
    rank: number;
    vendor_id: number;
    vendor_name: string;
    abuse_count: number;
    vendor_url: string;
}

export type MostReportedVendorsData = MostReportedVendor[];

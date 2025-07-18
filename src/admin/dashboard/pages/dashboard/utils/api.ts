import apiFetch from '@wordpress/api-fetch';
import {
    TodoData,
    MonthlyOverviewData,
    CustomerMetricsData,
    AllTimeStatsData,
    SalesChartData,
    AnalyticsData,
    TopPerformingVendorsData,
    MostReviewedProductsData,
    MostReportedVendorsData,
} from '../types';

const API_BASE = 'dokan/v1/admin/dashboard';

// Format date for API (YYYY-MM format)
export const formatDateForApi = ( month: number, year: number ): string => {
    return `${ year }-${ month.toString().padStart( 2, '0' ) }`;
};

// Todo Section API
export const fetchTodoData = async (): Promise< TodoData > => {
    return await apiFetch< TodoData >( {
        path: `${ API_BASE }/todo`,
        method: 'GET',
    } );
};

// Monthly Overview API
export const fetchMonthlyOverview = async (
    date?: string
): Promise< MonthlyOverviewData > => {
    const params = date ? `?date=${ date }` : '';
    return await apiFetch< MonthlyOverviewData >( {
        path: `${ API_BASE }/monthly-overview${ params }`,
        method: 'GET',
    } );
};

// Customer Metrics API
export const fetchCustomerMetrics = async (
    date?: string
): Promise< CustomerMetricsData > => {
    const params = date ? `?date=${ date }` : '';
    return await apiFetch< CustomerMetricsData >( {
        path: `${ API_BASE }/customer-metrics${ params }`,
        method: 'GET',
    } );
};

// All Time Stats API
export const fetchAllTimeStats = async (
    date?: string
): Promise< AllTimeStatsData > => {
    const params = date ? `?date=${ date }` : '';
    return await apiFetch< AllTimeStatsData >( {
        path: `${ API_BASE }/all-time-stats${ params }`,
        method: 'GET',
    } );
};

// Sales Chart API
export const fetchSalesChart = async (
    date?: string
): Promise< SalesChartData > => {
    const params = date ? `?date=${ date }` : '';
    return await apiFetch< SalesChartData >( {
        path: `${ API_BASE }/sales-chart${ params }`,
        method: 'GET',
    } );
};

// Analytics API
export const fetchAnalytics = async (): Promise< AnalyticsData > => {
    return await apiFetch< AnalyticsData >( {
        path: `${ API_BASE }/analytics`,
        method: 'GET',
    } );
};

// Top Performing Vendors API
export const fetchTopPerformingVendors =
    async (): Promise< TopPerformingVendorsData > => {
        return await apiFetch< TopPerformingVendorsData >( {
            path: `${ API_BASE }/top-performing-vendors`,
            method: 'GET',
        } );
    };

// Most Reviewed Products API
export const fetchMostReviewedProducts =
    async (): Promise< MostReviewedProductsData > => {
        return await apiFetch< MostReviewedProductsData >( {
            path: `${ API_BASE }/most-reviewed-products`,
            method: 'GET',
        } );
    };

// Most Reported Vendors API
export const fetchMostReportedVendors =
    async (): Promise< MostReportedVendorsData > => {
        return await apiFetch< MostReportedVendorsData >( {
            path: `${ API_BASE }/most-reported-vendors`,
            method: 'GET',
        } );
    };

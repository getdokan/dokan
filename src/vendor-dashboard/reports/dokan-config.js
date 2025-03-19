export const dokanConfig = {
    seller_id: '0',
    dashboardReportUrl: 'dashboard/reports',
    ...( typeof vendorAnalyticsDokanConfig !== 'undefined'
        ? vendorAnalyticsDokanConfig
        : {} ),
};

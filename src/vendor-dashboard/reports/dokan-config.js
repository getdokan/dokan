export const dokanConfig = {
    ...( typeof vendorAnalyticsDokanConfig !== 'undefined'
        ? vendorAnalyticsDokanConfig
        : {} ),
    seller_id: '0',
    dashboardReportUrl: 'dashboard',
};

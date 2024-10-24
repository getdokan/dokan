export const dokanConfig = {
    seller_id: '0',
    dashboardReportUrl: 'dashboard',
    ...( typeof vendorAnalyticsDokanConfig !== 'undefined'
        ? vendorAnalyticsDokanConfig
        : {} ),
};

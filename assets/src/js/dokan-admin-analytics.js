// TODO: Before removing the download chart hide filter, we need to remove the dashboard chart filter.
// Refer to `dokan/src/vendor-dashboard/reports/dashboard/dashboard-charts/config.js` for hide dashboard chart script.
wp.hooks.addFilter(
    'woocommerce_admin_dashboard_charts_filter',
    'dokan/hide-woocommerce-downloads-chart/callback',
    ( charts ) => charts.filter( chart => chart.endpoint !== 'downloads' && chart.key !== 'download_count' )
);

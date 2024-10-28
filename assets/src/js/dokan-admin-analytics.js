wp.hooks.addFilter(
    'woocommerce_admin_revenue_report_charts',
    'dokan/remove-woocommerce-revenue-coupon-data-from/callback',
    ( data ) => data.filter( item => item.key !== 'coupons' )
);

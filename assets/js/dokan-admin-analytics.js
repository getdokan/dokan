wp.hooks.addFilter("woocommerce_admin_revenue_report_charts","dokan/remove-woocommerce-revenue-coupon-data-from/callback",(e=>e.filter((e=>"coupons"!==e.key))));
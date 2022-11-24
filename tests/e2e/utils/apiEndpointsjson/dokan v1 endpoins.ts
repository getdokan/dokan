    // endpoints
    // getAlldokanEndpoints: `${SERVER_URL}/wp-json/dokan/v1`,      // get
    // stores
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/check`,      // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores`,        // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>`,     // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/current-visitor`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/stats`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/categories`,      // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/products`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/reviews`,     // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/contact`,     // post
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/status`,      // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/<store_id>/email`,       // post
    // get: `${SERVER_URL}/wp-json/dokan/v1/stores/batch`,      // post put patch
    // products
    // get: `${SERVER_URL}/wp-json/dokan/v1/products`,      // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/<product_id>`,     // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/summary`,      // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/<product_id>/related`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/top_rated`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/best_selling`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/featured`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/latest`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/multistep-categories`,     // get
    // product variations
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/<product_id>/variations`,      // get  post
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/<product_id>/variations/<variation_id>`,       // get post put patch delete
    // attributes
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/attributes`,       // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/<attribute_id>`,        // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/batch`,     // post put patch
    // attribute terms
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/<attribute_id>/terms`,      // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/<attribute_id>/terms/<term_id>`,        // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/products/attributes/<attribute_id>/terms/batch`,        // post put patch
    // orders
    // get: `${SERVER_URL}/wp-json/dokan/v1/orders`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan/v1/orders/<order_id>`,    // get post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/orders/summary`,        // get
    // order notes
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan/v1/orders/<order_id>/notes`,      // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/orders/<order_id>/notes/<note_id>`,     // get delete
    // withdraw
    // get: `${SERVER_URL}/wp-json/dokan/v1/withdraw`,      // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/withdraw/balance`,      // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/withdraw/<withdraw_id>`,        // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/withdraw/batch`,        // post put patch
    // settings
    // get: `${SERVER_URL}/wp-json/dokan/v1/settings`,      // get post put patch
    // dummy data
    // get: `${SERVER_URL}/wp-json/dokan/v1/dummy-data/status`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/dummy-data/import`,     // post
    // get: `${SERVER_URL}/wp-json/dokan/v1/dummy-data/clear`,      // delete
    // store categories
    // get: `${SERVER_URL}/wp-json/dokan/v1/store-categories`,      // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/store-categories/<category_id>`,        // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/store-categories/default-category`,     // get post put patch
    // coupons
    // get: `${SERVER_URL}/wp-json/dokan/v1/coupons`,       // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1//dokan/v1/coupons/<coupon_id>`,     // get post put patch delete
    // reports
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/sales_overview`,    // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/top_selling`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/top_earners`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reports/summary`,       // get
    // reviews
    // get: `${SERVER_URL}/wp-json/dokan/v1/reviews`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reviews/summary`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reviews/<review_id>`,       // post put patch
    // store reviews
    // get: `${SERVER_URL}/wp-json/dokan/v1/store-reviews`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/store-reviews/<review_id>`,     // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/store-reviews/<review_id>/restore`,     //  post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/store-reviews/batch`,       //  post put patch
    // announcements
    // get: `${SERVER_URL}/wp-json/dokan/v1/announcement`,      // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/announcement/<announcement_id>`,        // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/announcement/<announcement_id>/restore`,        //  post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/announcement/batch`,        // post put patch
    // refunds
    // get: `${SERVER_URL}/wp-json/dokan/v1refunds`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/<refund_id>`,       // delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/<refund_id>/approve`,       // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/<refund_id>/cancel`,        // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/refunds/batch`,     // post put patch
    // follow store
    // get: `${SERVER_URL}/wp-json/dokan/v1/follow-store`,      // get post
    // abuse reports
    // get: `${SERVER_URL}/wp-json/dokan/v1/abuse-reports`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/abuse-reports/<abuse-report_id>`,       // delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/abuse-reports/batch`,       //  delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/abuse-reports/abuse-reasons`,       // get
    // product advertisements
    // get: `${SERVER_URL}/wp-json/dokan/v1/product_adv/stores`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/product_adv`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/product_adv/create`,        // post
    // get: `${SERVER_URL}/wp-json/dokan/v1/product_adv/<product_adv_id>/expire`,       // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/product_adv/<product_adv_id>`,      // delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/product_adv/batch`,     // post put patch
    // wholesale customers
    // get: `${SERVER_URL}/wp-json/dokan/v1/wholesale/customers`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/wholesale/register`,        // post
    // get: `${SERVER_URL}/wp-json/dokan/v1/wholesale/customer/<wholesale_customer_id>`,        // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/wholesale/customers/batch`,     // post put patch
    // customers
    // get: `${SERVER_URL}/wp-json/dokan/v1/customers`,     // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/customers/<customer_id>`,       // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/customers/batch`,       // post put patch
    // request quote rules
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule`,      // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/<quote-rule_id>`,      // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/<quote-rule_id>/restore`,      // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-quote-rule/batch`,        // post put patch
    // request quotes
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote`,       // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/<request-quote_id>`,        // get post put patch delete
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/<request-quote_id>/restore`,        // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/batch`,     // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/dokan-request-quote/convert-to-order`,      // post
    // roles
    // get: `${SERVER_URL}/wp-json/dokan/v1/roles`,     // get
    // reverse withdrawal
    // get: `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/stores-balance`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/transactions/<reverse-withdrawal_id>`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/transaction-types`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/reverse-withdrawal/stores`,     // get
    // modules
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/modules`,       //get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/modules/activate`,         // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/modules/deactivate`,        //  post put patch
    // support tickets
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/batch`,      // post put patch
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/customers`,      // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/<support-ticket_id>`,        // get post
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/<support-ticket_id>/status`,         // post
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/<support-ticket_id>/email-notification`,         // post
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/support-ticket/<support-ticket_id>/comment`,        // delete
    // admin
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/report/summary`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/report/overview`,       // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/dashboard/feed`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/help`,      // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/changelog/lite`,        // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/changelog/pro`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/notices/admin`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/notices/promo`,     // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/logs`,      // get
    // get: `${SERVER_URL}/wp-json/dokan/v1/admin/logs/export`,       // get
require('dotenv').config();
// import { ApiUtils } from './apiUtils
const { SERVER_URL, QUERY } = process.env;


export const endPoints = {
    serverlUrl: `${SERVER_URL}`,
    getAllStoresCheck: `${SERVER_URL}/dokan/v1/stores/check`,   // get
    getAllStores: `${SERVER_URL}/dokan/v1/stores`,  // get 
    getSingleStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}`,  // get
    createStore: `${SERVER_URL}/dokan/v1/stores`,   // post
    updateStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}`, // post put patch
    deleteStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}${QUERY}reassign=0`,   // delete
    getStoreCurrentVisitor: `${SERVER_URL}/dokan/v1/stores/current-visitor`,    // get
    getStoreStats: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/stats`, // get
    getStoreCategories: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/categories`,   // get
    getStoreProducts: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/products`,   // get
    getStoreReviews: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/reviews`,     // get 
    createStoreReview: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/reviews`,   // post
    updateStoreStatus: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/status`,    // post put patch
    adminContactStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/contact`,   // post
    adminEmailStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/email`,   // post
    updateBatchStores: `${SERVER_URL}/dokan/v1/stores/batch`,   // post put patch   method:approved, pending, delete
    // products
    getProductsSummary: `${SERVER_URL}/dokan/v1/products/summary`,  // get
    getTopRatedProducts: `${SERVER_URL}/dokan/v1/products/top_rated`,   // get
    getBestSellingProducts: `${SERVER_URL}/dokan/v1/products/best_selling`, // get
    getFeaturedProducts: `${SERVER_URL}/dokan/v1/products/featured`,    // get
    getLatestProducts: `${SERVER_URL}/dokan/v1/products/latest`,    // get
    getAllMultistepCategories: `${SERVER_URL}/dokan/v1/products/multistep-categories`,  // get
    getAllProducts: `${SERVER_URL}/dokan/v1/products/`, // get
    getSingleProduct: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}`,    // get 
    getAllRelatedProducts: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/related`,   // get
    createProduct: `${SERVER_URL}/dokan/v1/products`,  // post
    updateProduct: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}`,   // post put patch
    deleteProduct: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}`,   // delete
    // product variations
    getAllProductVariations: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations`,  // get
    getSingleProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations/${variationId}`,    // get
    createProductVariation: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations`,   // post 
    updateProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations/${variationId}`,   // post put patch
    deleteProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations/${variationId}`,   // delete
    // product attributes
    getAllAttributes: `${SERVER_URL}/dokan/v1/products/attributes`, // get
    getSingleAttribute: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}`,   // get
    createAttribute: `${SERVER_URL}/dokan/v1/products/attributes/`, // post 
    updateAttribute: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}`,  // post put patch
    deleteAttribute: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}`,  // delete
    batchUpdateAttributes: `${SERVER_URL}/dokan/v1/products/attributes/batch`,  // post put patch  method: crearte, update, delete
    // product attribute terms
    getAllAttributeTerms: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms`,   // get
    getSingleAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`, // get
    createAttributeTerm: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms`,    // post 
    updateAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,    // post put patch
    deleteAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,    // delete
    updateBatchAttributeTerms: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/batch`,    // post put patch   method: create, update, delete
    // orders
    getOrdersSummary: `${SERVER_URL}/dokan/v1/orders/summary`,  // get
    getAllOrders: `${SERVER_URL}/dokan/v1/orders/`, // get
    getSingleOrder: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}`,    // get
    getOrdersBeforAfter: (before: string, after: string) => `${SERVER_URL}/dokan/v1/orders/${QUERY}after=${after}&before=${before}`,    // get
    updateOrder: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}`,   // post put patch 
    // order notes
    getAllOrderNotes: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes/`,   // get
    getSingleOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes/${noteId}`,    // get
    createOrderNote: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes`, // post
    deleteOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes/${noteId}`,   // delete
    // withdraws
    getBalanceDetails: `${SERVER_URL}/dokan/v1/withdraw/balance`,   // get
    getAllWithdrawsbyStatus: (status: string) => `${SERVER_URL}/dokan/v1/withdraw/${QUERY}status=${status}`,    //get //TODO
    getAllWithdraws: `${SERVER_URL}/dokan/v1/withdraw/`,    // get
    getSingleWithdraw: (withdrawId: string) => `${SERVER_URL}/dokan/v1/withdraw/${withdrawId}`, // get
    createWithdraw: `${SERVER_URL}/dokan/v1/withdraw/`, //post
    updateWithdraw: (withdrawId: string) => `${SERVER_URL}/dokan/v1/withdraw/${withdrawId}`,    // post put patch
    cancelAWithdraw: (withdrawId: string) => `${SERVER_URL}/dokan/v1/withdraw/${withdrawId}`,   // delete
    updateBatchWithdraws: `${SERVER_URL}/dokan/v1/withdraw/batch`,  // post put patch     method: approved, pending, delete, cancelled
    // settings
    getSettings: `${SERVER_URL}/dokan/v1/settings`, // get 
    updateSettings: `${SERVER_URL}/dokan/v1/settings`,  // post put patch
    // dummy data
    getDummyDataStatus: `${SERVER_URL}/dokan/v1/dummy-data/status`, // get
    importDummyData: `${SERVER_URL}/dokan/v1/dummy-data/import`, // post
    clearDummyData: `${SERVER_URL}/dokan/v1/dummy-data/clear`,  // delete
    // store categories
    getDefaultStoreCategory: `${SERVER_URL}/dokan/v1/store-categories/default-category`,    // get 
    setDefaultStoreCategory: `${SERVER_URL}/dokan/v1/store-categories/default-category`,    // post put patch
    getAllStoreCategories: `${SERVER_URL}/dokan/v1/store-categories`,   // get 
    getSingleStoreCategory: (categoryId: string) => `${SERVER_URL}/dokan/v1/store-categories/${categoryId}`, // get 
    createStoreCategory: `${SERVER_URL}/dokan/v1/store-categories`, // post 
    updateStoreCategory: (categoryId: string) => `${SERVER_URL}/dokan/v1/store-categories/${categoryId}`,   // post put patch 
    deleteStoreCategory: (categoryId: string) => `${SERVER_URL}/dokan/v1/store-categories/${categoryId}${QUERY}force=true`, // delete
    // coupons
    getAllCoupons: `${SERVER_URL}/dokan/v1/coupons`,    // get
    getSingleCoupon: (couponId: string) => `${SERVER_URL}/dokan/v1/coupons/${couponId}`,    // get 
    createCoupon: `${SERVER_URL}/dokan/v1/coupons/`,    // post
    updateCoupon: (couponId: string) => `${SERVER_URL}/dokan/v1/coupons/${couponId}`,   // post put patch
    deleteCoupon: (couponId: string) => `${SERVER_URL}/dokan/v1/coupons/${couponId}`,   // delete
    // reports
    getSalesOverviewReport: `${SERVER_URL}/dokan/v1/reports/sales_overview`,    // get
    getSummaryReport: `${SERVER_URL}/dokan/v1/reports/summary`, // get
    getTopEarnersReport: `${SERVER_URL}/dokan/v1/reports/top_earners`,  // get
    getTopSellingProductsReport: `${SERVER_URL}/dokan/v1/reports/top_selling`,  // get
    // product reviews
    getAllProductReviews: `${SERVER_URL}/dokan/v1/reviews`, // get
    getProductReviewSummary: `${SERVER_URL}/dokan/v1/reviews/summary`,  // get
    updateReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/reviews/${reviewId}`,   // post put patch 
    // store reviews
    getAllStoreReviews: `${SERVER_URL}/dokan/v1/store-reviews`, // get
    getSingleStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}`, // get 
    updateStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}`,    // post put patch
    deleteStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}`,    // delete
    restoreDeletedStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}/restore`,    // post put patch 
    updateBatchStoreReviews: `${SERVER_URL}/dokan/v1/store-reviews/batch`,  //  post put patch  method: trash, delete, restore
    // announcements
    getAllAnnouncements: `${SERVER_URL}/dokan/v1/announcement`, // get
    getSingleAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}`, // get 
    createAnnouncement: `${SERVER_URL}/dokan/v1/announcement`,  // post
    updateAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}`,    // post put patch 
    deleteAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}`,    // delete
    restoredeletedAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}/restore`,    //  post put patch 
    updateBatchAnnouncements: `${SERVER_URL}/dokan/v1/announcement/batch`,  // post put patch   method: trash, delete, restore
    // refunds
    getAllRefunds: `${SERVER_URL}/dokan/v1/refunds/`,   // get
    getAllRefundsByStatus: (status: string) => `${SERVER_URL}/dokan/v1/refunds/${QUERY}status=${status}`,   // get
    approveRefund: (refundId: string) => `${SERVER_URL}/dokan/v1/refunds/${refundId}/approve`,  // post put patch 
    cancelRefund: (refundId: string) => `${SERVER_URL}/dokan/v1/refunds/${refundId}/cancel`,    // post put patch 
    deleteRefund: (refundId: string) => `${SERVER_URL}/dokan/v1/refunds/${refundId}`,   // delete
    updateBatchRefunds: `${SERVER_URL}/dokan/v1/refunds/batch`,  // post put patch  method: completed, cancelled
    // follow store
    getStoreFollowStatus: (sellerId: string) => `${SERVER_URL}/dokan/v1/follow-store${QUERY}vendor_id=${sellerId}`, // get 
    followUnfollowStore: `${SERVER_URL}/dokan/v1/follow-store`, // post
    // abuse reports
    getAllAbuseReportReasons: `${SERVER_URL}/dokan/v1/abuse-reports/abuse-reasons`, // get 
    getAllAbuseReports: `${SERVER_URL}/dokan/v1/abuse-reports`, // get 
    deleteAbuseReport: (abuseReportId: string) => `${SERVER_URL}/dokan/v1/abuse-reports/${abuseReportId}`,  // delete 
    deleteBatchAbuseReports: `${SERVER_URL}/dokan/v1/abuse-reports/batch`,   //  delete  // method: items
    // product advertisements
    getAllProductAdvertisementStores: `${SERVER_URL}/dokan/v1/product_adv/stores`,  // get
    getAllProductAdvertisements: `${SERVER_URL}/dokan/v1/product_adv`,  // get 
    createProductAdvertisement: `${SERVER_URL}/dokan/v1/product_adv/create`,    // post
    expireProductAdvertisement: (productAdvertisementId: string) => `${SERVER_URL}/dokan/v1/product_adv/${productAdvertisementId}/expire`,  //  post put patch  
    deleteProductAdvertisement: (productAdvertisementId: string) => `${SERVER_URL}/dokan/v1/product_adv/${productAdvertisementId}`, // delete
    updateBatchProductAdvertisements: `${SERVER_URL}/dokan/v1/product_adv/batch`,   // post put patch   method: 
    // wholesale customers 
    getAllWholesaleCustomers: `${SERVER_URL}/dokan/v1/wholesale/customers`, // get
    createWholesaleCustomer: `${SERVER_URL}/dokan/v1/wholesale/register`,  // post
    updateWholesaleCustomer: (wholesaleCustomerId: string) => `${SERVER_URL}/dokan/v1/wholesale/customer/${wholesaleCustomerId}`,    // post put patch
    updateBatchWholesaleCustomer: `${SERVER_URL}/dokan/v1/wholesale/customers/batch`,    // post put patch  method: activate, deactivate, delete
    // customers
    getAllCustomers: `${SERVER_URL}/dokan/v1/customers`,    // get
    getSingleCustomer: (customerId: string) => `${SERVER_URL}/dokan/v1/customers/${customerId}`,    // get
    createCustomer: `${SERVER_URL}/dokan/v1/customers/`,    // post
    updateCustomer: (customerId: string) => `${SERVER_URL}/dokan/v1/customers/${customerId}`,    // post put patch
    deleteCustomer: (customerId: string) => `${SERVER_URL}/dokan/v1/customers/${customerId}${QUERY}force=true`, // delete
    updateBatchCustomers: `${SERVER_URL}/dokan/v1/customers/batch`, // post put patch   method: 
    // request quote rules
    // getAllQuoteRules: `${SERVER_URL}/dokan/v1/dokan-quote-rule/`,
    // getSingleQuoteRule: (quoteId: string) => `${SERVER_URL}/dokan/v1/dokan-quote-rule/${quoteId}`,
    // createlQuoteRules: `${SERVER_URL}/dokan/v1/dokan-quote-rule/`,
    // updateQuoteRule: (quoteId: string) => `${SERVER_URL}/dokan/v1/dokan-quote-rule/${quoteId}`,
    // deleteQuoteRule: (quoteId: string) => `${SERVER_URL}/dokan/v1/dokan-quote-rule/${quoteId}`,
    // restoreQuoteRule: (quoteId: string) => `${SERVER_URL}/dokan/v1/dokan-quote-rule/${quoteId}/restore`,
    // updateBatchQuoteRules: `${SERVER_URL}/dokan/v1/dokan-quote-rule/batch`, // method: 
    // request quotes
    // getAllRequestQuotes: `${SERVER_URL}/dokan/v1/dokan-request-quote`,
    // getSingleRequestQuote: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/dokan-request-quote/${quoteRequestId}`,
    // createRequestQuote: `${SERVER_URL}/dokan/v1/dokan-request-quote/`,
    // updateRequestQuote: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/dokan-request-quote/${quoteRequestId}`,
    // deleteRequestQuote: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/dokan-request-quote/${quoteRequestId}`,
    // restoreRequestQuote: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/dokan-request-quote/(${quoteRequestId}/restore`,
    // updateBatchRequestQuotes: `${SERVER_URL}/dokan/v1/dokan-request-quote/batch`,  // method: 
    // convertRequestQuoteToOrder: `${SERVER_URL}/dokan/v1/dokan-request-quote/convert-to-order`,
    // roles
    getAllUserRoles: `${SERVER_URL}/dokan/v1/roles`,    // get
    // reverse withdrawal
    getReverseWithdrawalTransactionTypes: `${SERVER_URL}/dokan/v1/reverse-withdrawal/transaction-types`,    // get
    getAllReverseWithdrawalStores: `${SERVER_URL}/dokan/v1/reverse-withdrawal/stores`,  // get
    getAllReverseWithdrawalStoreBalance: `${SERVER_URL}/dokan/v1/reverse-withdrawal/stores-balance`,    // get
    getAllReverseWithdrawalTransactions: (sellerId: string, dateFrom: string, dateTo: string) => `${SERVER_URL}/dokan/v1/reverse-withdrawal/transactions/${sellerId}${QUERY}trn_date[from]=${dateFrom}&trn_date[to]=${dateTo}&vendor_id=${sellerId}`,   // get
    // modules
    getAllModules: `${SERVER_URL}/dokan/v1/admin/modules`,  //get
    activateModule: `${SERVER_URL}/dokan/v1/admin/modules/activate`,    // post put patch 
    deactivateModule: `${SERVER_URL}/dokan/v1/admin/modules/deactivate`,    //  post put patch 
    // support tickets 
    getAllSupportTicketCustomers: `${SERVER_URL}/dokan/v1/admin/support-ticket/customers`,  // get
    getAllSupportTickets: `${SERVER_URL}/dokan/v1/admin/support-ticket`,    // get
    getSingleSupportTicket: (supportTicketId: string, vendorId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}${QUERY}vendor_id=${vendorId}`,   // get 
    createSupportTicketComment: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}`,  // post
    updateSupportTicketStatus: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}/status`,    // post
    updateSupportTicketEmailNotification: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}/email-notification`, // post
    deleteSupportTicketComment: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}/comment`,  // delete
    updateBatchSupportTickets: `${SERVER_URL}/dokan/v1/admin/support-ticket/batch`,  // post put patch  method: close
    //admin
    getAdminReportSummary: `${SERVER_URL}/dokan/v1/admin/report/summary`,   //get
    getAdminReportOverview: `${SERVER_URL}/dokan/v1/admin/report/overview`, //get
    getAdminDashboardFeed: `${SERVER_URL}/dokan/v1/admin/dashboard/feed`,   // get
    getAdminHelp: `${SERVER_URL}/dokan/v1/admin/help`,  // get
    getAdminChangelogLite: `${SERVER_URL}/dokan/v1/admin/changelog/lite`,   // get
    getAdminChangelogPro: `${SERVER_URL}/dokan/v1/admin/changelog/pro`, // get
    getAdminNotices: `${SERVER_URL}/dokan/v1/admin/notices/admin`,  // get
    getAdminPromoNotices: `${SERVER_URL}/dokan/v1/admin/notices/promo`, // get
    getAdminLogs: `${SERVER_URL}/dokan/v1/admin/logs`,  // get
    getAdminExportLogs: `${SERVER_URL}/dokan/v1/admin/logs/export`, // get






    wc: {

        // coupons
        getAllCoupons: `${SERVER_URL}/wc/v3/coupons`,
        getSingleCoupon: (couponId: string) => `${SERVER_URL}/wc/v3/coupons/${couponId}`,
        createCoupon: `${SERVER_URL}/wc/v3/customers/`,
        updateCoupon: (couponId: string) => `${SERVER_URL}/wc/v3/coupons/${couponId}`,
        deleteCoupon: (couponId: string) => `${SERVER_URL}/wc/v3/coupons/${couponId}`,
        updateBatchCoupons: `${SERVER_URL}/wc/v3/coupons/batch`,

        // customers
        getAllCustomers: `${SERVER_URL}/wc/v3/customers`,
        getSingleCustomer: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}`,
        createCustomer: `${SERVER_URL}/wc/v3/customers/`,
        updateCustomer: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}`,
        deleteCustomer: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}`,
        getCustomerDownloads: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}/downloads`,
        updateBatchCustomers: `${SERVER_URL}/wc/v3/customers/batch`,

        // orders
        getAllOrders: `${SERVER_URL}/wc/v3/orders`,
        getSingleOrder: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}`,
        createOrder: `${SERVER_URL}/wc/v3/orders/`,
        updateOrder: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}`,
        deleteOrder: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}`,
        updateBatchOrders: `${SERVER_URL}/wc/v3/orders/batch`,

        // order notes
        getAllOrderNotes: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes/`,
        getSingleOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes/${noteId}`,
        createOrderNote: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes`,
        deleteOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes/${noteId}`,

        // refunds
        getAllRefunds: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds/`,
        getSingleRefund: (orderId: string, refundId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds/${refundId}`,
        createRefund: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds`,
        deleteRefund: (orderId: string, refundId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds/${refundId}`,

        // products
        getAllProducts: `${SERVER_URL}/wc/v3/products/`,
        getSingleProduct: (productId: string) => `${SERVER_URL}/wc/v3/products/${productId}`,
        getProductsWithPagination: (perPage: string, pageNo: string) => `${SERVER_URL}/wc/v3/products/${QUERY}per_page=${perPage}&page=${pageNo}`,
        createProduct: `${SERVER_URL}/wc/v3/products/`,
        updateProduct: (productId: string) => `${SERVER_URL}/wc/v3/products/${productId}`,
        deleteProduct: (productId: string) => `${SERVER_URL}/wc/v3/products/${productId}`,
        updateBatchProducts: `${SERVER_URL}/wc/v3/products/batch`,

        // product variations
        getAllProductVariations: (productId: string) => `${SERVER_URL}/wc/v3/products/${productId}/variations`,
        getSingleProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/wc/v3/products/${productId}/variations/${variationId}`,
        createProductVariation: (productId: string) => `${SERVER_URL}/wc/v3/products/${productId}/variations`,
        updateProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/wc/v3/products/${productId}/variations/${variationId}`,
        deleteProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/wc/v3/products/${productId}/variations/${variationId}`,
        updateBatchProductVariations: (productId: string) => `${SERVER_URL}/wc/v3/products/${productId}/variations/batch`,

        // product attributes
        getAllAttributes: `${SERVER_URL}/wc/v3/products/attributes`,
        getSingleAttribute: (attributeId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}`,
        createAttribute: `${SERVER_URL}/wc/v3/products/attributes/`,
        updateAttribute: (attributeId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}`,
        deleteAttribute: (attributeId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}`,
        updateBatchAttributes: `${SERVER_URL}/wc/v3/products/attributes/batch`,

        // product attribute terms
        getAllAttributeTerms: (attributeId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}/terms`,
        getSingleAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}/terms/${attributeTermId}`,
        createAttributeTerm: (attributeId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}/terms`,
        updateAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}/terms/${attributeTermId}`,
        deleteAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}/terms/${attributeTermId}`,
        updateBatchAttributeTerms: (attributeId: string) => `${SERVER_URL}/wc/v3/products/attributes/${attributeId}/terms/batch`,

        // product categories
        getAllCategories: `${SERVER_URL}/wc/v3/products/categories`,
        getSingleCategory: (categoryId: string) => `${SERVER_URL}/wc/v3/products/categories/${categoryId}`,
        createCategory: `${SERVER_URL}/wc/v3/products/categories/`,
        updateCategory: (categoryId: string) => `${SERVER_URL}/wc/v3/products/categories/${categoryId}`,
        deleteCategory: (categoryId: string) => `${SERVER_URL}/wc/v3/products/categories/${categoryId}`,
        updateBatchCategories: `${SERVER_URL}/wc/v3/products/categories/batch`,

        // product shippping class
        getAllShippingClasses: `${SERVER_URL}/wc/v3/products/shipping_classes`,
        getSingleShippingClass: (shippingClassId: string) => `${SERVER_URL}/wc/v3/products/shipping_classes/${shippingClassId}`,
        createShippingClass: `${SERVER_URL}/wc/v3/products/shipping_classes/`,
        updateShippingClass: (shippingClassId: string) => `${SERVER_URL}/wc/v3/products/shipping_classes/${shippingClassId}`,
        deleteShippingClass: (shippingClassId: string) => `${SERVER_URL}/wc/v3/products/shipping_classes/${shippingClassId}`,
        updateBatchShippingClasse: `${SERVER_URL}/wc/v3/products/shipping_classes/batch`,

        // product tags
        getAllTags: `${SERVER_URL}/wc/v3/products/tags`,
        getSingleTag: (tagId: string) => `${SERVER_URL}/wc/v3/products/tags/${tagId}`,
        createTag: `${SERVER_URL}/wc/v3/products/tags/`,
        updateTag: (tagId: string) => `${SERVER_URL}/wc/v3/products/tags/${tagId}`,
        deleteTag: (tagId: string) => `${SERVER_URL}/wc/v3/products/tags/${tagId}`,
        updateBatchTag: `${SERVER_URL}/wc/v3/products/tags/batch`,

        // product reviews
        getAllReviews: `${SERVER_URL}/wc/v3/products/reviews`,
        getSingleReview: (reviewId: string) => `${SERVER_URL}/wc/v3/products/reviews/${reviewId}`,
        createReview: `${SERVER_URL}/wc/v3/products/reviews/`,
        updateReview: (reviewId: string) => `${SERVER_URL}/wc/v3/products/reviews/${reviewId}`,
        deleteReview: (reviewId: string) => `${SERVER_URL}/wc/v3/products/reviews/${reviewId}`,
        updateBatchReview: `${SERVER_URL}/wc/v3/products/reviews/batch`,

        // reports
        getAllReports: `${SERVER_URL}/wc/v3/reports/`,
        getSalesReport: `${SERVER_URL}/wc/v3/reports/sales`,
        getTopSellersReport: `${SERVER_URL}/wc/v3/reports/top_sellers`,
        getCouponstotalsReport: `${SERVER_URL}/wc/v3/reports/coupons/totals`,
        getCustomerstotalsReport: `${SERVER_URL}/wc/v3/reports/customers/totals`,
        getOrderstotalsReport: `${SERVER_URL}/wc/v3/reports/orders/totals`,
        getProductstotalsReport: `${SERVER_URL}/wc/v3/reports/products/totals`,
        getReviewstotalsReport: `${SERVER_URL}/wc/v3/reports/reviews/totals`,

        // tax rates
        getAllTaxRates: `${SERVER_URL}/wc/v3/taxes`,
        getSingleTaxRate: (taxId: string) => `${SERVER_URL}/wc/v3/taxes/${taxId}`,
        createTaxRate: `${SERVER_URL}/wc/v3/taxes/`,
        updateTaxRate: (taxId: string) => `${SERVER_URL}/wc/v3/taxes/${taxId}`,
        deleteTaxRate: (taxId: string) => `${SERVER_URL}/wc/v3/taxes/${taxId}`,
        updateBatchTaxRates: `${SERVER_URL}/wc/v3/taxes/batch`,

        // tax classes
        getAllTaxClasses: `${SERVER_URL}/wc/v3/taxes/classes`,
        createTaxClass: `${SERVER_URL}/wc/v3/taxes/classes`,
        deleteTaxClass: (slug: string) => `${SERVER_URL}/wc/v3/taxes/classes/${slug}`,

        // shipping zones
        getAllShippingZones: `${SERVER_URL}/wc/v3/shipping/zones`,
        getSingleShippingZone: (zoneId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}`,
        createShippingZone: `${SERVER_URL}/wc/v3/shipping/zones/`,
        updateShippingZone: (zoneId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}`,
        deleteShippingZone: (zoneId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}`,
        // shipping zone locations   
        getAllShippingZoneLocations: (zoneId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}/locations`,
        addShippingZoneLocation: (zoneId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}/locations`,
        // shipping zone methods
        getAllShippingZoneMethods: (zoneId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}/methods`,
        getSingleShippingZoneMethod: (zoneId: string, methodId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
        addShippingZoneMethod: (zoneId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}/methods`,
        updateShippingZoneMethod: (zoneId: string, methodId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
        deleteShippingZoneMethod: (zoneId: string, methodId: string) => `${SERVER_URL}/wc/v3/shipping/zones/${zoneId}/methods/${methodId}`,
        // shipping methods
        getAllShippingMethods: `${SERVER_URL}/wc/v3/shipping_methods`,
        getSingleShippingMethod: (shippingId: string) => `${SERVER_URL}/wc/v3/shipping_methods/${shippingId}`,

        // payment gateways 
        getAllPaymentGatways: `${SERVER_URL}/wc/v3/payment_gateways`,
        getSinglePaymentGatway: (paymentGatewayId: string) => `${SERVER_URL}/wc/v3/payment_gateways/${paymentGatewayId}`,
        updatePaymentGatway: (paymentGatewayId: string) => `${SERVER_URL}/wc/v3/payment_gateways/${paymentGatewayId}`,

        //settings
        getAllSettingsGroups: `${SERVER_URL}/wc/v3/settings`,
        getAllSettingOptions: (groupId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}`,
        getSingleSettingOption: (groupId: string, optionId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}/${optionId}`,
        updateSettingOption: (groupId: string, optionId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}/${optionId}`,
        updateBatchSettingOptions: (groupId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}/batch`,

        // systerm status
        getAllSystemStatus: `${SERVER_URL}/wc/v3/system_status`

    },

    wp: {

        // users
        getAllUsers: `${SERVER_URL}/wp/v2/users`,
        getAllUsersByRole: (role: string) => `${SERVER_URL}/wp/v2/users${QUERY}roles=${role}`,
        getcurrentUser: `${SERVER_URL}/wp/v2/users/me`,
        getUserById: (userId: string) => `${SERVER_URL}/wp/v2/users/${userId}`,
        createUser: `${SERVER_URL}/wp/v2/users`,
        updateUser: `${SERVER_URL}/wp/v2/users`,
        deleteUser: (userId: string) => `${SERVER_URL}/wp/v2/users/${userId}`,

        //plugins
        getAllPlugins: `${SERVER_URL}/wp/v2/plugins`,
        getAllPluginsByStatus: (status: string) => `${SERVER_URL}/wp/v2/plugins${QUERY}status=${status}`,
        getSinglePlugin: (plugin: string) => `${SERVER_URL}/wp/v2/plugins/${plugin}`,
        updatePlugin: (plugin: string) => `${SERVER_URL}/wp/v2/plugins/${plugin}`,
        deletePlugin: (plugin: string) => `${SERVER_URL}/wp/v2/plugins/${plugin}`,

        //media
        getAllMediaItmes: `${SERVER_URL}/wp/v2/media`,
        getSingleMediaItem: (mediaId: string) => `${SERVER_URL}/wp/v2/media/${mediaId}`,
        createMediaItem: `${SERVER_URL}/wp/v2/media`,
        updateMediaItem: (mediaId: string) => `${SERVER_URL}/wp/v2/media/${mediaId}`,
        deleteMediaItem: (mediaId: string) => `${SERVER_URL}/wp/v2/media/${mediaId}`,

        //settings
        getSiteSettings: `${SERVER_URL}/wp/v2/settings`,
        setSiteSetiings: `${SERVER_URL}/wp/v2/settings`,
    }



}
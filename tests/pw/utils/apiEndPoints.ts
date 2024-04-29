import 'dotenv/config';

// const { BASE_URL, SERVER_URL } = process.env;
const SERVER_URL = process.env.SERVER_URL ? process.env.SERVER_URL : process.env.BASE_URL + '/wp-json';

export const endPoints = {
    serverUrl: `${SERVER_URL}`,
    getAllDokanEndpointsV1: `${SERVER_URL}/dokan/v1`,
    getAllDokanEndpointsV2: `${SERVER_URL}/dokan/v2`,
    getAllDokanEndpointsAdmin: `${SERVER_URL}/dokan/v1/admin`,

    // stores
    getAllStores: `${SERVER_URL}/dokan/v1/stores`,
    getSingleStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}`,
    createStore: `${SERVER_URL}/dokan/v1/stores`,
    updateStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}`,
    deleteStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}`,
    getStoresSlugAvaility: `${SERVER_URL}/dokan/v1/stores/check`,
    getStoreCurrentVisitor: `${SERVER_URL}/dokan/v1/stores/current-visitor`,
    getStoreStats: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/stats`,
    getStoreCategories: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/categories`,
    getStoreProducts: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/products`,
    updateStoreStatus: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/status`,
    clientContactStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/contact`, // post
    adminEmailStore: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/email`, // post
    updateBatchStores: `${SERVER_URL}/dokan/v1/stores/batch`, // method: approved, pending, delete

    // products
    getAllProducts: `${SERVER_URL}/dokan/v1/products`,
    getSingleProduct: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}`,
    createProduct: `${SERVER_URL}/dokan/v1/products`,
    updateProduct: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}`,
    deleteProduct: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}`,
    getAllRelatedProducts: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/related`,
    getProductsSummary: `${SERVER_URL}/dokan/v1/products/summary`,
    getTopRatedProducts: `${SERVER_URL}/dokan/v1/products/top_rated`,
    getBestSellingProducts: `${SERVER_URL}/dokan/v1/products/best_selling`,
    getFeaturedProducts: `${SERVER_URL}/dokan/v1/products/featured`,
    getLatestProducts: `${SERVER_URL}/dokan/v1/products/latest`,
    getAllMultiStepCategories: `${SERVER_URL}/dokan/v1/products/multistep-categories`,

    // product attributes
    getAllAttributes: `${SERVER_URL}/dokan/v1/products/attributes`,
    getSingleAttribute: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}`,
    createAttribute: `${SERVER_URL}/dokan/v1/products/attributes`,
    updateAttribute: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}`,
    deleteAttribute: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}`,
    batchUpdateAttributes: `${SERVER_URL}/dokan/v1/products/attributes/batch`, // method: create, update, delete
    setDefaultAttribute: (productId: string) => `${SERVER_URL}/dokan/v1/products/attributes/set-default/${productId}`,
    updateProductAttribute: (productId: string) => `${SERVER_URL}/dokan/v1/products/attributes/edit-product/${productId}`,

    // product attribute terms
    getAllAttributeTerms: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms`,
    getSingleAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,
    createAttributeTerm: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms`,
    updateAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,
    deleteAttributeTerm: (attributeId: string, attributeTermId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/${attributeTermId}`,
    updateBatchAttributeTerms: (attributeId: string) => `${SERVER_URL}/dokan/v1/products/attributes/${attributeId}/terms/batch`, // method: create, update, delete

    // product variations
    getAllProductVariations: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations`,
    getSingleProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations/${variationId}`,
    createProductVariation: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations`,
    updateProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations/${variationId}`,
    deleteProductVariation: (productId: string, variationId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations/${variationId}`,
    batchUpdateProductVariations: (productId: string) => `${SERVER_URL}/dokan/v1/products/${productId}/variations/batch`, // method: create, update, delete

    // orders
    getOrdersSummary: `${SERVER_URL}/dokan/v1/orders/summary`,
    getAllOrders: `${SERVER_URL}/dokan/v1/orders`,
    getSingleOrder: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}`,
    updateOrder: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}`,

    // order notes
    getAllOrderNotes: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes`,
    getSingleOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes/${noteId}`,
    createOrderNote: (orderId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes`,
    deleteOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/dokan/v1/orders/${orderId}/notes/${noteId}`,

    // withdraws
    getWithdrawPaymentMethods: `${SERVER_URL}/dokan/v1/withdraw/payment_methods`,
    getBalanceDetails: `${SERVER_URL}/dokan/v1/withdraw/balance`,
    getAllWithdraws: `${SERVER_URL}/dokan/v1/withdraw`,
    getSingleWithdraw: (withdrawId: string) => `${SERVER_URL}/dokan/v1/withdraw/${withdrawId}`,
    createWithdraw: `${SERVER_URL}/dokan/v1/withdraw`, // post
    updateWithdraw: (withdrawId: string) => `${SERVER_URL}/dokan/v1/withdraw/${withdrawId}`,
    cancelWithdraw: (withdrawId: string) => `${SERVER_URL}/dokan/v1/withdraw/${withdrawId}`,
    updateBatchWithdraws: `${SERVER_URL}/dokan/v1/withdraw/batch`, // method: approved, pending, delete, cancelled
    getAllWithdrawMethodCharges: `${SERVER_URL}/dokan/v1/withdraw/charges`,
    getWithdrawCharge: `${SERVER_URL}/dokan/v1/withdraw/charge`,

    // store settings
    getSettings: `${SERVER_URL}/dokan/v1/settings`,
    updateSettings: `${SERVER_URL}/dokan/v1/settings`,

    // dummy data
    getDummyDataStatus: `${SERVER_URL}/dokan/v1/dummy-data/status`,
    importDummyData: `${SERVER_URL}/dokan/v1/dummy-data/import`,
    clearDummyData: `${SERVER_URL}/dokan/v1/dummy-data/clear`,

    // store categories
    getDefaultStoreCategory: `${SERVER_URL}/dokan/v1/store-categories/default-category`,
    setDefaultStoreCategory: `${SERVER_URL}/dokan/v1/store-categories/default-category`, // post
    getAllStoreCategories: `${SERVER_URL}/dokan/v1/store-categories`,
    getSingleStoreCategory: (categoryId: string) => `${SERVER_URL}/dokan/v1/store-categories/${categoryId}`,
    createStoreCategory: `${SERVER_URL}/dokan/v1/store-categories`,
    updateStoreCategory: (categoryId: string) => `${SERVER_URL}/dokan/v1/store-categories/${categoryId}`,
    deleteStoreCategory: (categoryId: string) => `${SERVER_URL}/dokan/v1/store-categories/${categoryId}`,

    // coupons
    getAllCoupons: `${SERVER_URL}/dokan/v1/coupons`,
    getSingleCoupon: (couponId: string) => `${SERVER_URL}/dokan/v1/coupons/${couponId}`,
    createCoupon: `${SERVER_URL}/dokan/v1/coupons`,
    updateCoupon: (couponId: string) => `${SERVER_URL}/dokan/v1/coupons/${couponId}`,
    deleteCoupon: (couponId: string) => `${SERVER_URL}/dokan/v1/coupons/${couponId}`,

    // reports
    getSalesOverviewReport: `${SERVER_URL}/dokan/v1/reports/sales_overview`,
    getSummaryReport: `${SERVER_URL}/dokan/v1/reports/summary`,
    getTopEarnersReport: `${SERVER_URL}/dokan/v1/reports/top_earners`,
    getTopSellingProductsReport: `${SERVER_URL}/dokan/v1/reports/top_selling`,

    // product reviews
    getAllProductReviews: `${SERVER_URL}/dokan/v1/reviews`,
    getProductReviewSummary: `${SERVER_URL}/dokan/v1/reviews/summary`,
    updateReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/reviews/${reviewId}`,

    // store reviews
    getStoreReviews: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/reviews`,
    createStoreReview: (sellerId: string) => `${SERVER_URL}/dokan/v1/stores/${sellerId}/reviews`,
    getAllStoreReviews: `${SERVER_URL}/dokan/v1/store-reviews`,
    getSingleStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}`,
    updateStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}`,
    deleteStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}`,
    restoreDeletedStoreReview: (reviewId: string) => `${SERVER_URL}/dokan/v1/store-reviews/${reviewId}/restore`, // put
    updateBatchStoreReviews: `${SERVER_URL}/dokan/v1/store-reviews/batch`, // method: trash, delete, restore

    // announcements
    getAllAnnouncements: `${SERVER_URL}/dokan/v1/announcement`,
    getSingleAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}`,
    createAnnouncement: `${SERVER_URL}/dokan/v1/announcement`,
    updateAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}`,
    deleteAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}`,
    restoreDeletedAnnouncement: (announcementId: string) => `${SERVER_URL}/dokan/v1/announcement/${announcementId}/restore`, // put
    updateBatchAnnouncements: `${SERVER_URL}/dokan/v1/announcement/batch`, // method: trash, delete, restore

    // announcement notice
    getSingleAnnouncementNotice: (noticeId: string) => `${SERVER_URL}/dokan/v1/announcement/notice/${noticeId}`,
    updateAnnouncementNotice: (noticeId: string) => `${SERVER_URL}/dokan/v1/announcement/notice/${noticeId}`,
    deleteAnnouncementNotice: (noticeId: string) => `${SERVER_URL}/dokan/v1/announcement/notice/${noticeId}`,

    // refunds
    getAllRefunds: `${SERVER_URL}/dokan/v1/refunds`,
    approveRefund: (refundId: string) => `${SERVER_URL}/dokan/v1/refunds/${refundId}/approve`, // put
    cancelRefund: (refundId: string) => `${SERVER_URL}/dokan/v1/refunds/${refundId}/cancel`, // put
    deleteRefund: (refundId: string) => `${SERVER_URL}/dokan/v1/refunds/${refundId}`,
    updateBatchRefunds: `${SERVER_URL}/dokan/v1/refunds/batch`, // method: completed, cancelled

    // follow store
    getStoreFollowStatus: `${SERVER_URL}/dokan/v1/follow-store`,
    followUnfollowStore: `${SERVER_URL}/dokan/v1/follow-store`, // post
    getFollowers: `${SERVER_URL}/dokan/v1/follow-store/followers`, // post

    // abuse reports
    getAllAbuseReportReasons: `${SERVER_URL}/dokan/v1/abuse-reports/abuse-reasons`,
    getAllAbuseReports: `${SERVER_URL}/dokan/v1/abuse-reports`,
    deleteAbuseReport: (abuseReportId: string) => `${SERVER_URL}/dokan/v1/abuse-reports/${abuseReportId}`,
    deleteBatchAbuseReports: `${SERVER_URL}/dokan/v1/abuse-reports/batch`, //  delete  // method: items

    // product advertisements
    getAllProductAdvertisementStores: `${SERVER_URL}/dokan/v1/product_adv/stores`,
    getAllProductAdvertisements: `${SERVER_URL}/dokan/v1/product_adv`,
    createProductAdvertisement: `${SERVER_URL}/dokan/v1/product_adv/create`,
    expireProductAdvertisement: (productAdvertisementId: string) => `${SERVER_URL}/dokan/v1/product_adv/${productAdvertisementId}/expire`, // put
    deleteProductAdvertisement: (productAdvertisementId: string) => `${SERVER_URL}/dokan/v1/product_adv/${productAdvertisementId}`,
    updateBatchProductAdvertisements: `${SERVER_URL}/dokan/v1/product_adv/batch`, // method: delete

    // wholesale customers
    getAllWholesaleCustomers: `${SERVER_URL}/dokan/v1/wholesale/customers`,
    createWholesaleCustomer: `${SERVER_URL}/dokan/v1/wholesale/register`,
    updateWholesaleCustomer: (wholesaleCustomerId: string) => `${SERVER_URL}/dokan/v1/wholesale/customer/${wholesaleCustomerId}`,
    updateBatchWholesaleCustomer: `${SERVER_URL}/dokan/v1/wholesale/customers/batch`, // method: activate, deactivate, delete

    // request quote rules
    getAllQuoteRules: `${SERVER_URL}/dokan/v1/request-for-quote/quote-rule`,
    getSingleQuoteRule: (quoteRuleId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/quote-rule/${quoteRuleId}`,
    createQuoteRule: `${SERVER_URL}/dokan/v1/request-for-quote/quote-rule`,
    updateQuoteRule: (quoteRuleId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/quote-rule/${quoteRuleId}`,
    deleteQuoteRule: (quoteRuleId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/quote-rule/${quoteRuleId}`,
    restoreQuoteRule: (quoteRuleId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/quote-rule/${quoteRuleId}/restore`, // put
    updateBatchQuoteRules: `${SERVER_URL}/dokan/v1/request-for-quote/quote-rule/batch`, // method: trash, delete, restore

    // request quotes
    getAllQuoteRequests: `${SERVER_URL}/dokan/v1/request-for-quote`,
    getSingleRequestQuote: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/${quoteRequestId}`,
    createQuoteRequest: `${SERVER_URL}/dokan/v1/request-for-quote`,
    updateRequestQuote: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/${quoteRequestId}`,
    deleteQuoteRequest: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/${quoteRequestId}`,
    restoreRequestQuote: (quoteRequestId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/${quoteRequestId}/restore`, // put
    updateBatchRequestQuotes: `${SERVER_URL}/dokan/v1/request-for-quote/batch`, // method: trash
    convertRequestQuoteToOrder: `${SERVER_URL}/dokan/v1/request-for-quote/convert-to-order`, // post
    // customers (rfq)
    getAllCustomers: `${SERVER_URL}/dokan/v1/request-for-quote/customers`,
    getSingleCustomer: (customerId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/customers/${customerId}`,
    createCustomer: `${SERVER_URL}/dokan/v1/request-for-quote/customers`,
    updateCustomer: (customerId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/customers/${customerId}`,
    deleteCustomer: (customerId: string) => `${SERVER_URL}/dokan/v1/request-for-quote/customers/${customerId}`,
    updateBatchCustomers: `${SERVER_URL}/dokan/v1/request-for-quote/customers/batch`, // method: create, update, delete
    // roles (rfq)
    getAllUserRoles: `${SERVER_URL}/dokan/v1/request-for-quote/roles`,

    // reverse withdrawal
    getReverseWithdrawalVendorDueStatus: `${SERVER_URL}/dokan/v1/reverse-withdrawal/vendor-due-status`,
    getReverseWithdrawalAddProductToCart: `${SERVER_URL}/dokan/v1/reverse-withdrawal/add-to-cart`,
    getReverseWithdrawalTransactionTypes: `${SERVER_URL}/dokan/v1/reverse-withdrawal/transaction-types`,
    getAllReverseWithdrawalStores: `${SERVER_URL}/dokan/v1/reverse-withdrawal/stores`,
    getAllReverseWithdrawalStoreBalance: `${SERVER_URL}/dokan/v1/reverse-withdrawal/stores-balance`,
    getAllReverseWithdrawalTransactions: `${SERVER_URL}/dokan/v1/reverse-withdrawal/transactions`,

    // modules
    getAllModules: `${SERVER_URL}/dokan/v1/admin/modules`,
    activateModule: `${SERVER_URL}/dokan/v1/admin/modules/activate`, // put
    deactivateModule: `${SERVER_URL}/dokan/v1/admin/modules/deactivate`, // put

    // support tickets
    getAllSupportTicketCustomers: `${SERVER_URL}/dokan/v1/admin/support-ticket/customers`,
    getAllSupportTickets: `${SERVER_URL}/dokan/v1/admin/support-ticket`,
    getSingleSupportTicket: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}`,
    createSupportTicketComment: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}`,
    updateSupportTicketStatus: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}/status`, // post
    updateSupportTicketEmailNotification: (supportTicketId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketId}/email-notification`, // post
    deleteSupportTicketComment: (supportTicketCommentId: string) => `${SERVER_URL}/dokan/v1/admin/support-ticket/${supportTicketCommentId}/comment`,
    updateBatchSupportTickets: `${SERVER_URL}/dokan/v1/admin/support-ticket/batch`, // method: close

    // admin
    getAdminReportSummary: `${SERVER_URL}/dokan/v1/admin/report/summary`,
    getAdminReportOverview: `${SERVER_URL}/dokan/v1/admin/report/overview`,
    getAdminDashboardFeed: `${SERVER_URL}/dokan/v1/admin/dashboard/feed`,
    getAdminHelp: `${SERVER_URL}/dokan/v1/admin/help`,
    getAdminChangelogLite: `${SERVER_URL}/dokan/v1/admin/changelog/lite`,
    getAdminChangelogPro: `${SERVER_URL}/dokan/v1/admin/changelog/pro`,
    getAdminNotices: `${SERVER_URL}/dokan/v1/admin/notices/admin`,
    getAdminPromoNotices: `${SERVER_URL}/dokan/v1/admin/notices/promo`,
    getAdminLogs: `${SERVER_URL}/dokan/v1/admin/logs`,
    getAdminExportLogs: `${SERVER_URL}/dokan/v1/admin/logs/export`,

    // seller badge
    getVerifiedSellerVerificationTypes: `${SERVER_URL}/dokan/v1/seller-badge/verification-types`,
    getAllSellerBadgeEvents: `${SERVER_URL}/dokan/v1/seller-badge/events`,
    getAllSellerBadges: `${SERVER_URL}/dokan/v1/seller-badge`,
    getSingleSellerBadge: (badgeId: string) => `${SERVER_URL}/dokan/v1/seller-badge/${badgeId}`,
    createSellerBadge: `${SERVER_URL}/dokan/v1/seller-badge`,
    updateSellerBadge: (badgeId: string) => `${SERVER_URL}/dokan/v1/seller-badge/${badgeId}`,
    deleteSellerBadge: (badgeId: string) => `${SERVER_URL}/dokan/v1/seller-badge/${badgeId}`,
    updateBatchSellerBadges: `${SERVER_URL}/dokan/v1/seller-badge/bulk-actions`,
    setSellerBadgeRowActions: `${SERVER_URL}/dokan/v1/seller-badge/row-actions`,
    getVendorUnseenSellerBadges: `${SERVER_URL}/dokan/v1/seller-badge/vendor-unseen-badges`,
    setSellerBadgeAsSeen: `${SERVER_URL}/dokan/v1/seller-badge/set-badge-as-seen`,

    // new v1

    // product
    getProductBlockDetails: (productId: string) => `${SERVER_URL}/dokan/v1/blocks/products/${productId}`,
    getVariableProductBlockDetails: (productId: string) => `${SERVER_URL}/dokan/v1/blocks/product-variation/${productId}`,

    // vendor dashboard
    getVendorDashboardStatistics: `${SERVER_URL}/dokan/v1/vendor-dashboard`,
    getVendorProfileInformation: `${SERVER_URL}/dokan/v1/vendor-dashboard/profile`,
    getVendorSalesReport: `${SERVER_URL}/dokan/v1/vendor-dashboard/sales`,
    getVendorProductReportsSummary: `${SERVER_URL}/dokan/v1/vendor-dashboard/products`,
    getVendorOrderReportsSummary: `${SERVER_URL}/dokan/v1/vendor-dashboard/orders`,
    getVendorStorePreferences: `${SERVER_URL}/dokan/v1/vendor-dashboard/preferences`,
    getVendorProfileProgressBarData: `${SERVER_URL}/dokan/v1/vendor-dashboard/profile-progressbar`,

    // vendor staff
    getAllVendorStaffs: `${SERVER_URL}/dokan/v1/vendor-staff`,
    getSingleVendorStaff: (staffId: string) => `${SERVER_URL}/dokan/v1/vendor-staff/${staffId}`,
    createVendorStaff: `${SERVER_URL}/dokan/v1/vendor-staff`,
    updateVendorStaff: (staffId: string) => `${SERVER_URL}/dokan/v1/vendor-staff/${staffId}`,
    deleteVendorStaff: (staffId: string) => `${SERVER_URL}/dokan/v1/vendor-staff/${staffId}`,
    getAllVendorStaffCapabilities: `${SERVER_URL}/dokan/v1/vendor-staff/capabilities`,
    getVendorStaffCapabilities: (staffId: string) => `${SERVER_URL}/dokan/v1/vendor-staff/${staffId}/capabilities`,
    updateVendorStaffCapabilities: (staffId: string) => `${SERVER_URL}/dokan/v1/vendor-staff/${staffId}/capabilities`,

    // v2

    // rank math
    rankMath: (productId: string) => `${SERVER_URL}/dokan/v2/rank-math/${productId}/store-current-editable-post`,

    // product duplicate
    createDuplicateProduct: (productId: string) => `${SERVER_URL}/dokan/v2/products/${productId}/duplicate`,

    getAllProductsV2: `${SERVER_URL}/dokan/v2/products`,
    getAllOrdersV2: `${SERVER_URL}/dokan/v2/products`,

    // product filter
    getProductsFilterByData: `${SERVER_URL}/dokan/v2/products/filter-by-data`,

    // withdraw
    getWithdrawSettings: `${SERVER_URL}/dokan/v2/withdraw/settings`,
    getWithdrawSummary: `${SERVER_URL}/dokan/v2/withdraw/summary`,
    getWithdrawDisbursementSettings: `${SERVER_URL}/dokan/v2/withdraw/disbursement`,
    updateWithdrawDisbursementSettings: `${SERVER_URL}/dokan/v2/withdraw/disbursement`,
    disableWithdrawDisbursement: `${SERVER_URL}/dokan/v2/withdraw/disbursement/disable`,

    // orders
    // all orders & order notes from v1 also work with v2
    updateBatchOrders: `${SERVER_URL}/dokan/v2/orders/bulk-actions`,

    // order downloads
    getAllOrderDownloads: (orderId: string) => `${SERVER_URL}/dokan/v2/orders/${orderId}/downloads`,
    createOrderDownload: (orderId: string) => `${SERVER_URL}/dokan/v2/orders/${orderId}/downloads`,
    deleteOrderDownload: (orderId: string) => `${SERVER_URL}/dokan/v2/orders/${orderId}/downloads`,

    // settings
    getStoreSettings: `${SERVER_URL}/dokan/v2/settings`,
    getSingleSettingGroup: (groupId: string) => `${SERVER_URL}/dokan/v2/settings/${groupId}`,
    getSubSettingFromSingleSettingGroup: (groupId: string, subGroupId: string) => `${SERVER_URL}/dokan/v2/settings/${groupId}/${subGroupId}`,
    getSubSubSettingFromSingleSettingGroup: (groupId: string, subGroupId: string, subSubSettingsId: string) => `${SERVER_URL}/dokan/v2/settings/${groupId}/${subGroupId}/${subSubSettingsId}`,
    updateSingleSettingGroup: (groupId: string) => `${SERVER_URL}/dokan/v2/settings/${groupId}`,
    updateSubSettingFromSingleSettingGroup: (groupId: string, subGroupId: string) => `${SERVER_URL}/dokan/v2/settings/${groupId}/${subGroupId}`,
    updateSubSubSettingFromSingleSettingGroup: (groupId: string, subGroupId: string, subSubSettingsId: string) => `${SERVER_URL}/dokan/v2/settings/${groupId}/${subGroupId}/${subSubSettingsId}`,

    // spmv
    getSpmvSettings: `${SERVER_URL}/dokan/v1/spmv-product/settings`,
    getSpmvProducts: `${SERVER_URL}/dokan/v1/spmv-product/search`,
    addToStore: `${SERVER_URL}/dokan/v1/spmv-product/add-to-store`, // post

    // product question answers
    getAllProductQuestions: `${SERVER_URL}/dokan/v1/product-questions`,
    getSingleProductQuestion: (questionId: string) => `${SERVER_URL}/dokan/v1/product-questions/${questionId}`,
    createProductQuestion: `${SERVER_URL}/dokan/v1/product-questions`,
    updateProductQuestion: (questionId: string) => `${SERVER_URL}/dokan/v1/product-questions/${questionId}`,
    deleteProductQuestion: (questionId: string) => `${SERVER_URL}/dokan/v1/product-questions/${questionId}`,
    updateBatchProductQuestions: `${SERVER_URL}/dokan/v1/product-questions/bulk_action`, // method: delete, read, unread

    getAllProductQuestionAnswers: `${SERVER_URL}/dokan/v1/product-answers`,
    getSingleProductQuestionAnswer: (answerId: string) => `${SERVER_URL}/dokan/v1/product-answers/${answerId}`,
    createProductQuestionAnswer: `${SERVER_URL}/dokan/v1/product-answers`,
    updateProductQuestionAnswer: (answerId: string) => `${SERVER_URL}/dokan/v1/product-answers/${answerId}`,
    deleteProductQuestionAnswer: (answerId: string) => `${SERVER_URL}/dokan/v1/product-answers/${answerId}`,

    wc: {
        // coupons
        getAllCoupons: `${SERVER_URL}/wc/v3/coupons`,
        getSingleCoupon: (couponId: string) => `${SERVER_URL}/wc/v3/coupons/${couponId}`,
        createCoupon: `${SERVER_URL}/wc/v3/coupons`,
        updateCoupon: (couponId: string) => `${SERVER_URL}/wc/v3/coupons/${couponId}`,
        deleteCoupon: (couponId: string) => `${SERVER_URL}/wc/v3/coupons/${couponId}`,
        updateBatchCoupons: `${SERVER_URL}/wc/v3/coupons/batch`,

        // customers
        getAllCustomers: `${SERVER_URL}/wc/v3/customers`,
        getSingleCustomer: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}`,
        createCustomer: `${SERVER_URL}/wc/v3/customers`,
        updateCustomer: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}`,
        deleteCustomer: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}`,
        getCustomerDownloads: (customerId: string) => `${SERVER_URL}/wc/v3/customers/${customerId}/downloads`,
        updateBatchCustomers: `${SERVER_URL}/wc/v3/customers/batch`,

        // orders
        getAllOrders: `${SERVER_URL}/wc/v3/orders`,
        getSingleOrder: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}`,
        createOrder: `${SERVER_URL}/wc/v3/orders`,
        updateOrder: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}`,
        deleteOrder: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}`,
        updateBatchOrders: `${SERVER_URL}/wc/v3/orders/batch`,

        // order notes
        getAllOrderNotes: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes`,
        getSingleOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes/${noteId}`,
        createOrderNote: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes`,
        deleteOrderNote: (orderId: string, noteId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/notes/${noteId}`,

        // refunds
        getAllRefunds: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds`,
        getSingleRefund: (orderId: string, refundId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds/${refundId}`,
        createRefund: (orderId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds`,
        deleteRefund: (orderId: string, refundId: string) => `${SERVER_URL}/wc/v3/orders/${orderId}/refunds/${refundId}`,

        // products
        getAllProducts: `${SERVER_URL}/wc/v3/products`,
        getSingleProduct: (productId: string) => `${SERVER_URL}/wc/v3/products/${productId}`,
        createProduct: `${SERVER_URL}/wc/v3/products`,
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
        createAttribute: `${SERVER_URL}/wc/v3/products/attributes`,
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
        createCategory: `${SERVER_URL}/wc/v3/products/categories`,
        updateCategory: (categoryId: string) => `${SERVER_URL}/wc/v3/products/categories/${categoryId}`,
        deleteCategory: (categoryId: string) => `${SERVER_URL}/wc/v3/products/categories/${categoryId}`,
        updateBatchCategories: `${SERVER_URL}/wc/v3/products/categories/batch`,

        // product shipping class
        getAllShippingClasses: `${SERVER_URL}/wc/v3/products/shipping_classes`,
        getSingleShippingClass: (shippingClassId: string) => `${SERVER_URL}/wc/v3/products/shipping_classes/${shippingClassId}`,
        createShippingClass: `${SERVER_URL}/wc/v3/products/shipping_classes`,
        updateShippingClass: (shippingClassId: string) => `${SERVER_URL}/wc/v3/products/shipping_classes/${shippingClassId}`,
        deleteShippingClass: (shippingClassId: string) => `${SERVER_URL}/wc/v3/products/shipping_classes/${shippingClassId}`,
        updateBatchShippingClass: `${SERVER_URL}/wc/v3/products/shipping_classes/batch`,

        // product tags
        getAllTags: `${SERVER_URL}/wc/v3/products/tags`,
        getSingleTag: (tagId: string) => `${SERVER_URL}/wc/v3/products/tags/${tagId}`,
        createTag: `${SERVER_URL}/wc/v3/products/tags`,
        updateTag: (tagId: string) => `${SERVER_URL}/wc/v3/products/tags/${tagId}`,
        deleteTag: (tagId: string) => `${SERVER_URL}/wc/v3/products/tags/${tagId}`,
        updateBatchTag: `${SERVER_URL}/wc/v3/products/tags/batch`,

        // product reviews
        getAllReviews: `${SERVER_URL}/wc/v3/products/reviews`,
        getSingleReview: (reviewId: string) => `${SERVER_URL}/wc/v3/products/reviews/${reviewId}`,
        createReview: `${SERVER_URL}/wc/v3/products/reviews`,
        updateReview: (reviewId: string) => `${SERVER_URL}/wc/v3/products/reviews/${reviewId}`,
        deleteReview: (reviewId: string) => `${SERVER_URL}/wc/v3/products/reviews/${reviewId}`,
        updateBatchReview: `${SERVER_URL}/wc/v3/products/reviews/batch`,

        // reports
        getAllReports: `${SERVER_URL}/wc/v3/reports`,
        getSalesReport: `${SERVER_URL}/wc/v3/reports/sales`,
        getTopSellersReport: `${SERVER_URL}/wc/v3/reports/top_sellers`,
        getCouponsTotalsReport: `${SERVER_URL}/wc/v3/reports/coupons/totals`,
        getCustomersTotalsReport: `${SERVER_URL}/wc/v3/reports/customers/totals`,
        getOrdersTotalsReport: `${SERVER_URL}/wc/v3/reports/orders/totals`,
        getProductsTotalsReport: `${SERVER_URL}/wc/v3/reports/products/totals`,
        getReviewsTotalsReport: `${SERVER_URL}/wc/v3/reports/reviews/totals`,

        // tax rates
        getAllTaxRates: `${SERVER_URL}/wc/v3/taxes`,
        getSingleTaxRate: (taxId: string) => `${SERVER_URL}/wc/v3/taxes/${taxId}`,
        createTaxRate: `${SERVER_URL}/wc/v3/taxes`,
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
        createShippingZone: `${SERVER_URL}/wc/v3/shipping/zones`,
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
        getAllPaymentGateways: `${SERVER_URL}/wc/v3/payment_gateways`,
        getSinglePaymentGateway: (paymentGatewayId: string) => `${SERVER_URL}/wc/v3/payment_gateways/${paymentGatewayId}`,
        updatePaymentGateway: (paymentGatewayId: string) => `${SERVER_URL}/wc/v3/payment_gateways/${paymentGatewayId}`,

        // settings
        getAllSettingsGroups: `${SERVER_URL}/wc/v3/settings`,
        getAllSettingOptions: (groupId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}`,
        getSingleSettingOption: (groupId: string, optionId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}/${optionId}`,
        updateSingleSettingOption: (groupId: string, optionId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}/${optionId}`,
        updateBatchSettingOptions: (groupId: string) => `${SERVER_URL}/wc/v3/settings/${groupId}/batch`,

        // system status
        getAllSystemStatus: `${SERVER_URL}/wc/v3/system_status`,

        // data
        getCurrentCurrency: `${SERVER_URL}/wc/v3/data/currencies/current`,

        booking: {
            getAllBookableProducts: `${SERVER_URL}/wc-bookings/v1/products`,
            getSingleBookableProduct: (productId: string) => `${SERVER_URL}/wc-bookings/v1/products/${productId}`,
            createBookableProduct: `${SERVER_URL}/wc-bookings/v1/products`,
            updateBookableProduct: (productId: string) => `${SERVER_URL}/wc-bookings/v1/products/${productId}`,
            deleteBookableProduct: (productId: string) => `${SERVER_URL}/wc-bookings/v1/products/${productId}`,
            updateBatchBookableProducts: `${SERVER_URL}/wc-bookings/v1/products/batch`,
            getBookingsSlots: `${SERVER_URL}/wc-bookings/v1/products/slots`,

            // categories
            getAllBookableProductCategories: `${SERVER_URL}/wc-bookings/v1/products/categories`,
            getSingleBookableProductCategory: (categoryId: string) => `${SERVER_URL}/wc-bookings/v1/products/categories/${categoryId}`,
            createBookableProductCategory: `${SERVER_URL}/wc-bookings/v1/products/categories`,
            updateBookableProductCategory: (categoryId: string) => `${SERVER_URL}/wc-bookings/v1/products/categories/${categoryId}`,
            deleteBookableProductCategory: (categoryId: string) => `${SERVER_URL}/wc-bookings/v1/products/categories/${categoryId}`,
            updateBatchBookableProductsCategories: `${SERVER_URL}/wc-bookings/v1/products/categories/batch`,

            // resource
            getAllBookableResources: `${SERVER_URL}/wc-bookings/v1/resources`,
            getSingleBookableResource: (productId: string) => `${SERVER_URL}/wc-bookings/v1/resources/${productId}`,
            createBookableResource: `${SERVER_URL}/wc-bookings/v1/resources`,
            updateBookableResource: (productId: string) => `${SERVER_URL}/wc-bookings/v1/resources/${productId}`,
            deleteBookableResource: (productId: string) => `${SERVER_URL}/wc-bookings/v1/resources/${productId}`,
            updateBatchBookableResources: `${SERVER_URL}/wc-bookings/v1/resources/batch`,

            // bookings
            getAllBookings: `${SERVER_URL}/wc-bookings/v1/bookings`,
            getSingleBooking: (productId: string) => `${SERVER_URL}/wc-bookings/v1/bookings/${productId}`,
            createBooking: `${SERVER_URL}/wc-bookings/v1/bookings`,
            updateBooking: (productId: string) => `${SERVER_URL}/wc-bookings/v1/bookings/${productId}`,
            deleteBooking: (productId: string) => `${SERVER_URL}/wc-bookings/v1/bookings/${productId}`,
            updateBatchBookings: `${SERVER_URL}/wc-bookings/v1/bookings/batch`,
        },

        productAddons: {
            getAllProductAddons: `${SERVER_URL}/wc-product-add-ons/v1/product-add-ons`,
            getSingleProductAddon: (productId: string) => `${SERVER_URL}/wc-product-add-ons/v1/product-add-ons/${productId}`,
            createProductAddon: `${SERVER_URL}/wc-product-add-ons/v1/product-add-ons`,
            updateProductAddon: (productId: string) => `${SERVER_URL}/wc-product-add-ons/v1/product-add-ons/${productId}`,
            deleteProductAddon: (productId: string) => `${SERVER_URL}/wc-product-add-ons/v1/product-add-ons/${productId}`,
        },
    },

    wp: {
        // users
        getAllUsers: `${SERVER_URL}/wp/v2/users`,
        getCurrentUser: `${SERVER_URL}/wp/v2/users/me`,
        getUserById: (userId: string) => `${SERVER_URL}/wp/v2/users/${userId}`,
        createUser: `${SERVER_URL}/wp/v2/users`,
        updateUser: (userId: string) => `${SERVER_URL}/wp/v2/users/${userId}`,
        deleteUser: (userId: string) => `${SERVER_URL}/wp/v2/users/${userId}`,

        // plugins
        getAllPlugins: `${SERVER_URL}/wp/v2/plugins`,
        getSinglePlugin: (plugin: string) => `${SERVER_URL}/wp/v2/plugins/${plugin}`,
        updatePlugin: (plugin: string) => `${SERVER_URL}/wp/v2/plugins/${plugin}`,
        deletePlugin: (plugin: string) => `${SERVER_URL}/wp/v2/plugins/${plugin}`,

        // pages
        getAllPages: `${SERVER_URL}/wp/v2/pages`,
        getSinglePage: (pageId: string) => `${SERVER_URL}/wp/v2/pages/${pageId}`,
        createPage: `${SERVER_URL}/wp/v2/pages`,
        updatePage: (pageId: string) => `${SERVER_URL}/wp/v2/pages/${pageId}`,
        deletePage: (pageId: string) => `${SERVER_URL}/wp/v2/pages/${pageId}`,

        // media
        getAllMediaItems: `${SERVER_URL}/wp/v2/media`,
        getSingleMediaItem: (mediaId: string) => `${SERVER_URL}/wp/v2/media/${mediaId}`,
        createMediaItem: `${SERVER_URL}/wp/v2/media`,
        updateMediaItem: (mediaId: string) => `${SERVER_URL}/wp/v2/media/${mediaId}`,
        deleteMediaItem: (mediaId: string) => `${SERVER_URL}/wp/v2/media/${mediaId}`,

        // settings
        getSiteSettings: `${SERVER_URL}/wp/v2/settings`,
        setSiteSettings: `${SERVER_URL}/wp/v2/settings`,

        // posts
        getAllPosts: `${SERVER_URL}/wp/v2/posts`,
        getSinglePost: (postId: string) => `${SERVER_URL}/wp/v2/posts/${postId}`,
        createPost: `${SERVER_URL}/wp/v2/posts`,
        createCustomPost: (postType: string) => `${SERVER_URL}/wp/v2/${postType}`,
        updatePost: (postId: string) => `${SERVER_URL}/wp/v2/posts/${postId}`,
        deletePost: (postId: string) => `${SERVER_URL}/wp/v2/posts/${postId}`,
    },
};

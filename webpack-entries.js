const entryPoints = {
    'dokan-tailwind': './src/tailwind.css',

    frontend: './src/dashboard/index.tsx',
    'dokan-admin-dashboard': './src/admin/dashboard/index.tsx',
    'setup-guide-banner': './src/admin/banner/SetupGuideBanner.tsx',
    'vue-frontend': './src/frontend/main.js',
    'vue-admin': './src/admin/main.js',
    'vue-bootstrap': './src/utils/Bootstrap.js',
    'vue-vendor': [ './src/utils/vue-vendor.js' ],
    'dokan-promo-notice': './src/promo-notice/main.js',
    'dokan-admin-notice': './src/admin/notice/main.js',
    'reverse-withdrawal': './assets/src/js/reverse-withdrawal.js',
    'product-category-ui': './assets/src/js/product-category-ui.js',
    'dokan-admin-product': './assets/src/js/dokan-admin-product.js',
    'vendor-address': './assets/src/js/vendor-address.js',
    'vendor-registration': './assets/src/js/vendor-registration.js',
    'customize-controls': './assets/src/js/customize-controls.js',
    'customize-preview': './assets/src/js/customize-preview.js',
    pointers: './assets/src/js/pointers.js',
    dokan: [
        './assets/src/js/orders.js',
        './assets/src/js/product-editor.js',
        './assets/src/js/script.js',
        './assets/src/js/store-lists.js',
        './assets/src/js/withdraw.js',
        './assets/src/js/dokan-daterangepicker.js',
    ],
    'login-form-popup': './assets/src/js/login-form-popup.js',
    'dokan-maps-compat': './assets/src/js/dokan-maps-compat.js',
    'dokan-admin': './assets/src/js/admin.js',
    'dokan-admin-onboard': '/src/admin/onboard/index.tsx',
    'dokan-setup-no-wc': [ './assets/src/js/setup-no-wc.js' ],
    helper: './assets/src/js/helper.js',
    'dokan-frontend': './assets/src/js/dokan-frontend.js',

    style: '/assets/src/less/style.less',
    rtl: '/assets/src/less/rtl.less',
    admin: '/assets/src/less/admin.less',
    plugin: '/assets/src/less/plugin.less',
    'global-admin': '/assets/src/less/global-admin.less',
    setup: '/assets/src/less/setup.less',
    'setup-no-wc-style': [ '/assets/src/less/setup-no-wc.less' ],
    'reverse-withdrawal-style': '/assets/src/less/reverse-withdrawal.less',
    'dokan-product-category-ui':
        '/assets/src/less/dokan-product-category-ui.less',
    'dokan-admin-product-style': '/assets/src/less/dokan-admin-product.less',
    'page-views': './assets/src/js/page-views.js',
    'dokan-setup-wizard-commission':
        './assets/src/js/setup-wizard/commission/index.js',
    // Category commission component styles.
    'dokan-category-commission': '/src/admin/components/Commission/index.js',
    'core-store': {
        import: '/src/stores/core/store.ts',
        library: {
            name: [ 'dokan', 'coreStore' ],
            type: 'window',
        },
    },
    'dokan-status': '/src/Status/index.tsx',
    'vendor-dashboard/reports/index': './src/vendor-dashboard/reports/index.js',
    // intelligence
    'dokan-intelligence': './src/intelligence/index.tsx',
    'products-store': {
        import: '/src/stores/products/store.ts',
        library: {
            name: [ 'dokan', 'productsStore' ],
            type: 'window',
        },
    },
    'product-categories-store': {
        import: '/src/stores/productCategories/store.ts',
        library: {
            name: [ 'dokan', 'productCategoriesStore' ],
            type: 'window',
        },
    },
};

module.exports = entryPoints;

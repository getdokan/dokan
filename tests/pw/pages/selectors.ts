import { helpers } from '@utils/helpers';

export const selector = {
    // Login

    // Selectors
    frontend: {
        // Fronted Menus
        home: '//a[contains(text(),"Home")]',
        cart: '//a[contains(text(),"Cart")]',
        checkout: '//a[contains(text(),"Checkout")]',
        dashboard: '//a[contains(text(),"Dashboard")]',
        myAccount: '//a[contains(text(),"My account")]',
        myOrders: '//a[contains(text(),"My Orders")]',
        samplePage: '//a[contains(text(),"Sample Page")]',
        shop: '//a[contains(text(),"Shop")]',
        storeList: '//a[contains(text(),"Store List")]',

        // Go to Vendor Dashboard
        goToVendorDashboard: '.dokan-btn.dokan-btn-theme.vendor-dashboard',

        // User Login
        username: '#username',
        userPassword: '#password',
        rememberMe: '#rememberme',
        logIn: '//button[@value="Log in"]',
        lostPassword: '.woocommerce-LostPassword > a',

        // User Logout
        customerLogout: '.woocommerce-MyAccount-navigation-link--customer-logout > a',
        vendorLogout: '.fa-power-off',

        // User Forget Password
        resetPasswordEmail: '#user_login',
        resetPasswordBtn: '.woocommerce-Button.button',

        // page not found
        pageNotFound: '//h1[text()="Oops! That page can’t be found."]',
    },

    backend: {
        // page not found
        pageNotFound: '//h1[text()="Oops! That page can’t be found."]',

        // setup
        alreadyInstalled: '//h1[contains(text(), "Already Installed")]',
        languageContinue: '#language-continue',
        letsGo: '//a[contains(text(), "go!")]',

        // db setup
        dbName: '#dbname',
        dbUserName: '#uname',
        dbPassword: '#pwd',
        dbHost: '#dbhost',
        dbTablePrefix: '#prefix',
        submit: '.step input',
        runTheInstallation: '.step a',

        // site info
        siteTitle: '#weblog_title',
        adminUserName: '#user_login',
        adminPassword: '#pass1',
        adminEmail: '#admin_email',
        searchEngineVisibility: '#blog_public',
        installWp: '#submit',
        successLoginIn: '.step a',

        // Admin Login
        email: '#user_login',
        password: '#user_pass',
        rememberMe: '#rememberme',
        login: '#wp-submit',
        dashboardMenu: '.wp-first-item > .wp-menu-name',
        dashboardText: '.wrap h1',

        // Admin Logout
        userMenu: '#wp-admin-bar-my-account',
        logout: '#wp-admin-bar-logout a',

        // Logout Message
        logoutSuccessMessage: '#login p',

        // Login Error
        loginError: '#login_error',
    },

    wpMedia: {
        // Wp Image Upload
        wpUploadFiles: '#menu-item-upload',
        uploadedMedia: 'div.attachment-preview',
        uploadedMediaFirst: '(//div[contains(@class,"attachment-preview")])[1]',
        selectFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@class="browser button button-hero"]',
        selectFilesInput: '//div[@class="supports-drag-drop" and @style="position: relative;"]//input[@type="file"]',
        selectUploadedMedia: '(//h2[contains(text(),"Media list")]/..//ul//li)[1]',
        select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
    },

    // Admin

    admin: {
        // Admin Dashboard
        aDashboard: {
            // Dashboard Menus
            dashboard: '.wp-first-item .wp-menu-name',
            posts: '.menu-icon-post .wp-menu-name',
            media: '.menu-icon-media .wp-menu-name',
            pages: '.menu-icon-page .wp-menu-name',
            comments: '.menu-icon-comments .wp-menu-name',
            emailLog: '.toplevel_page_email-log .wp-menu-name',
            dokanMenu: '#toplevel_page_dokan',
            dokan: '#toplevel_page_dokan .wp-menu-name',
            wooCommerce: '.toplevel_page_woocommerce .wp-menu-name',
            products: '.menu-icon-product .wp-menu-name',
            bookings: '.menu-icon-wc_booking .wp-menu-name',
            analytics: '.toplevel_page_wc-admin\\&path\\=\\/analytics\\/overview .wp-menu-name',
            marketing: '.toplevel_page_woocommerce-marketing .wp-menu-name',
            elementor: '.toplevel_page_elementor .wp-menu-name',
            templates: '.menu-icon-elementor_library .wp-menu-name',
            appearance: '.menu-icon-appearance .wp-menu-name',
            plugins: '.menu-icon-plugins .wp-menu-name',
            users: '.menu-icon-users .wp-menu-name',
            tools: '.menu-icon-tools .wp-menu-name',
            settings: '.menu-icon-settings .wp-menu-name',
            locoTranslate: '.toplevel_page_loco .wp-menu-name',
            // Collapse Menu
            collapseMenu: '#collapse-button',
        },

        // Dashboard
        dashboard: {
            // Menus
            home: '//li[@id="menu-dashboard"]//a[contains(text(),"Home")]',
            updates: '//li[@id="menu-dashboard"]//a[contains(text(),"Updates ")]',
        },
        // Posts
        posts: {
            // Menus
            allPosts: '//li[@id="menu-posts"]//a[contains(text(),"All Posts")]',
            addNew: '//li[@id="menu-posts"]//a[contains(text(),"Add New")]',
            categories: '//li[@id="menu-posts"]//a[contains(text(),"Categories")]',
            tags: '//li[@id="menu-posts"]//a[contains(text(),"Tags")]',
        },
        // Media
        media: {
            // Menus
            library: '//li[@id="menu-media"]//a[contains(text(),"Library")]',
            addNew: '//li[@id="menu-media"]//a[contains(text(),"Add New")]',
        },
        // Pages
        pages: {
            // Menus
            allPages: '//li[@id="menu-pages"]//a[contains(text(),"All Pages")]',
            addNew: '//li[@id="menu-pages"]//a[contains(text(),"Add New")]',
        },
        // Comments
        comments: {
            // Nav Tabs
            all: '//li[@class="all"]',
            mine: '//li[@class="mine"]',
            pending: '//li[@class="moderated"]',
            approved: '//li[@class="approved"]',
            spam: '//li[@class="spam"]',
            trash: '//li[@class="trash"]',
        },

        // widgets
        widgets: {
            listView: 'button.edit-widgets-header-toolbar__list-view-toggle',
            dokanStoreSidebar: '//span[text()="Dokan Store Sidebar"]/../../..//span[@class="block-editor-list-view__expander"]',
        },

        // EmailLog
        emailLog: {
            // Menus
            viewLogs: '//li[@id="toplevel_page_email-log"]//a[contains(text(),"View Logs")]',
            settings: '//li[@id="toplevel_page_email-log"]//a[contains(text(),"Settings")]',
            addOns: '//li[@id="toplevel_page_email-log"]//a[contains(text(),"Add-ons")]',
            systemInfo: '//li[@id="toplevel_page_email-log"]//a[contains(text(),"System Info")]',
        },
        // Dokan
        dokan: {
            // Dokan Menus
            menus: {
                dashboard: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Dashboard"]',
                withdraw: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Withdraw"]',
                vendors: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Vendors"]',
                abuseReports: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Abuse Reports"]',
                storeReviews: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Store Reviews"]',
                storeSupport: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Store Support"]',
                announcements: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Announcements"]',
                refunds: '//li[contains(@class,"toplevel_page_dokan")]//a[contains(text(),"Refunds")]',
                reports: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Reports"]',
                modules: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Modules"]',
                proFeature: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="PRO Features"]',
                tools: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Tools"]',
                verifications: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Verifications"]',
                advertising: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Advertising"]',
                wholesaleCustomer: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Wholesale Customer"]',
                help: '//li[contains(@class,"toplevel_page_dokan")]//span[text()="Help"]/..',
                settings: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="Settings"]',
                license: '//li[contains(@class,"toplevel_page_dokan")]//a[text()="License"]',
            },

            // dokan promotion
            promotion: {
                promotion: '.dokan-notice-slides .dokan-promotion',
                message: '.dokan-promotion .dokan-message',
            },

            // dokan notice
            notice: {
                noticeDiv: '.dokan-admin-notices',
                noticeDiv1: '.dokan-admin-notice.dokan-alert',
                closeNotice: '.close-notice',
                slider: '.slide-notice',
                sliderPrev: '.slide-notice .prev',
                sliderNext: '.slide-notice .next',
            },

            // promo banner
            promoBanner: {
                promoBanner: '.dokan-promo-banner',
                bannerThumbnail: '.dokan-promo-banner .thumbnail',
                promoContent: '.dokan-promo-banner .content',
                upgradeToPremium: '.btn-upgrade',
                closePromoBanner: '.close-banner',
            },

            //table loader
            loader: 'div.table-loader',

            // Dashboard
            dashboard: {
                // admin header
                header: {
                    dokanLogo: '.dokan-admin-header-logo',
                    getHelpMenu: '.dokan-admin-header-menu .menu-icon',
                },

                getHelp: {
                    whatsNew: '//div[@class="list-item"]//a[normalize-space()="What’s New"]',
                    getSupport: '//div[@class="list-item"]//a[normalize-space()="Get Support"]',
                    community: '//div[@class="list-item"]//a[normalize-space()="Community"]',
                    documentation: '//div[@class="list-item"]//a[normalize-space()="Documentation"]',
                    faq: '//div[@class="list-item"]//a[normalize-space()="FAQ"]',
                    basicAndFundamental: '//div[@class="list-item"]//a[normalize-space()="Basic & Fundamental"]',
                    requestAFeature: '//div[@class="list-item"]//a[normalize-space()="Request a Feature"]',
                    runSetupWizard: '//div[@class="list-item"]//a[normalize-space()="Run Setup Wizard"]',
                    importDummyData: '//div[@class="list-item"]//a[normalize-space()="Import dummy data"]',
                },

                // Dashboard Text
                dashboardText: '.dokan-dashboard h1',

                // At a Glance
                atAGlance: {
                    atAGlance: '.postbox.dokan-postbox.dokan-status',
                    collapsibleButton: '.dokan-status .handle-actions button',
                    netSalesThisMonth: '.sale strong',
                    commissionEarned: '.commission strong div',
                    signupThisMonth: '.vendor strong',
                    vendorAwaitingApproval: '.approval strong',
                    productCreatedThisMonth: '.product strong',
                    withdrawAwaitingApproval: '.withdraw strong',
                },

                // Overview
                overview: {
                    overview: '.postbox.dokan-postbox.overview-chart',
                    collapsibleButton: '.overview-chart .handle-actions button',
                    chart: '#line-chart',
                },

                // Dokan new Updates
                dokanNewUpdates: {
                    dokanNewUpdates: '//div[@class="postbox dokan-postbox"]',
                    collapsibleButton: '//div[@class="postbox dokan-postbox"]//div[@class="postbox-header"]//button',
                    newUpdatesList: '.rss-widget ul',
                },

                // SubscribeBox
                subscribeBox: {
                    subscribeBox: '.subscribe-box',
                    subscriberName: '//input[@placeholder="Your Name"]',
                    subscriberEmail: '//input[@placeholder="Your Email Address"]',
                    subscribeButton: '//button[normalize-space()="Subscribe"]',
                    thankYouMessage: '.thank-you',
                },
            },

            // Withdraw
            withdraw: {
                withdrawText: '.withdraw-requests h1',

                // Nav Tabs
                navTabs: {
                    pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
                    approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
                    cancelled: '//ul[@class="subsubsub"]//li//a[contains(text(),"Cancelled")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // approved, cancelled, delete, paypal
                    applyAction: '.tablenav.top .button.action',
                },

                // Filters
                filters: {
                    // filterByVendor: '//select[@id="filter-vendors"]/..//span[@class="select2-selection__arrow"]',
                    filterByVendor: '//span[@id="select2-filter-vendors-container"]/..//span[@class="select2-selection__arrow"]',
                    filterByPaymentMethods: '//span[@id="select2-filter-payment-methods-container"]/..//span[@class="select2-selection__arrow"]',
                    filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    clearFilter: 'a#clear-all-filtering',
                    result: 'li.select2-results__option.select2-results__option--highlighted',
                },

                // Logs
                exportWithdraws: 'a#export-all-logs',

                // Table
                table: {
                    withdrawTable: '.wp-list-table',
                    vendorColumn: 'thead th.seller',
                    amountColumn: 'thead th.amount',
                    statusColumn: 'thead th.status',
                    methodColumn: 'thead th.method_title',
                    detailsColumn: 'thead th.method_details',
                    noteColumn: 'thead th.note',
                    dateColumn: 'thead th.created',
                    actionsColumn: 'thead th.actions',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No requests found."]',
                withdrawCell: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..`,
                withdrawDelete: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..//span[@class="trash"]//a`,
                withdrawCancel: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..//span[@class="cancel"]//a`,
                withdrawApprove: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../../..//button[@title='Approve Request']`,
                withdrawAddNote: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../../..//button[@title='Add Note']`,
                withdrawNoteModalClose: '.dokan-modal-content .modal-header button',
                addNote: '.dokan-modal-content .modal-body textarea',
                updateNote: '.dokan-modal-content .modal-footer button',
            },

            // Reverse Withdraw
            reverseWithdraw: {
                reverseWithdrawText: '.dokan-reverse-withdrawal h1',

                addNewReverseWithdrawal: '.dokan-reverse-withdrawal button.page-title-action',

                // Fact Cards
                reverseWithdrawFactCards: {
                    totalCollectedCard: '//p[normalize-space()="Total Collected"]/../..',
                    totalCollected: '//p[normalize-space()="Total Collected"]/../..//h3',
                    remainingBalanceCard: '//p[normalize-space()="Remaining Balance"]/../..',
                    remainingBalance: '//p[normalize-space()="Remaining Balance"]/../..//h3',
                    TotalTransactionsCard: '//p[normalize-space()="Total Transactions"]/../..',
                    TotalTransactions: '//p[normalize-space()="Total Transactions"]/../..//h3',
                    TotalVendorsCard: '//p[normalize-space()="Total Vendors"]/../..',
                    TotalVendors: '//p[normalize-space()="Total Vendors"]/../..//h3',
                },

                // Filters
                filters: {
                    filterByStore: '.multiselect__select',
                    filterInput: '.multiselect__input',
                    clearFilter: '//button[normalize-space()="Clear"]',
                    filteredResult: (storeName: string) => `//span[contains(text(), '${storeName}')]/..`,
                },

                // Table
                table: {
                    revereWithdrawTable: '#dokan_reverse_withdrawal_list_table table',
                    storesColumn: 'thead th.store_name',
                    balanceColumn: 'thead th.balance',
                    lastPaymentDateColumn: 'thead th.last_payment_date',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No transaction found."]',
                reverseWithdrawCell: (storeName: string) => `//td//a[contains(text(), '${storeName}')]/../..`,

                addReverseWithdrawal: {
                    closeModal: '.modal-close.modal-close-link',
                    selectVendorDropdown: '//span[normalize-space()="Search vendor"]/../..//div[@class="multiselect__select"]',
                    selectVendorInput: '//input[@placeholder="Search vendor"]',
                    transactionType: (type: string) => `//input[@value="${type}"]/..`, // manual_product, manual_order, other
                    selectProductDropdown: '//span[normalize-space()="Search product"]/../..//div[@class="multiselect__select"]',
                    selectProductInput: '//input[@placeholder="Search product"]',
                    selectOrderDropdown: '//span[normalize-space()="Search order"]/../..//div[@class="multiselect__select"]',
                    selectOrderInput: '//input[@placeholder="Search order"]',
                    selectOption: (value: string) => `//div[@class="dokan-modal"]//li//span[contains(text(), "${value}")]/..`,
                    searchedResult: 'span.multiselect__option.multiselect__option--highlight',
                    withdrawalBalanceType: (type: string) => `//input[@value="${type}"]/..`, // debit, credit
                    reverseWithdrawalAmount: 'input.regular-text.wc_input_decimal',
                    note: '//textarea[@placeholder="Write reverse withdrawal note"]',
                    save: 'button.dokan-rw-footer-btn',
                },
            },

            // Vendors
            vendors: {
                vendorsText: '.vendor-list h1',
                addNewVendor: '//button[contains(text(), "Add New")]',
                storeCategories: '//a[normalize-space()="Store Categories"]',

                // Nav Tabs
                navTabs: {
                    cancelled: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                    approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
                    pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // approved, cancelled, delete, paypal
                    applyAction: '.tablenav.top .button.action',
                },

                // Filters
                filters: {
                    filterByBadges: '#badge_name',
                    clearFilter: '//select[@id="badge_name"]/..//button',
                },

                search: '#post-search-input',

                // Table
                table: {
                    vendorTable: '.vendor-list table',
                    storeColumn: 'thead th.store_name',
                    emailColumn: 'thead th.email',
                    categoryColumn: 'thead th.categories',
                    phoneColumn: 'thead th.phone',
                    RegisteredColumn: 'thead th.registered',
                    StatusColumn: 'thead th.enabled',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No vendors found."]',
                vendorViewDetails: (username: string) => `//td//a[contains(text(), '${username}')]`,
                vendorRow: (username: string) => `//td//a[contains(text(), '${username}')]/../../..`,
                vendorCell: (username: string) => `//td//a[contains(text(), '${username}')]/../..`,
                vendorEdit: (username: string) => `//td//a[contains(text(), '${username}')]/../..//span[@class="edit"]//a`,
                vendorProducts: (username: string) => `//td//a[contains(text(), '${username}')]/../..//span[@class="products"]//a`,
                vendorOrders: (username: string) => `//td//a[contains(text(), '${username}')]/../..//span[@class="orders"]//a`,
                statusSlider: (username: string) => `//td//a[contains(text(), '${username}')]/../../..//label[@class='switch tips']`,

                // Add New Vendors

                newVendor: {
                    // Menus
                    accountInfo: '//div[@class="tab-link"]//a[contains(text(), "Account Info")]',
                    address: '//div[@class="tab-link"]//a[contains(text(), "Address")]',
                    paymentOptions: '//div[@class="tab-link"]//a[contains(text(), "Payment Options")]',
                    addNewVendorCloseModal: '.modal-close',
                    next: '.button.button-primary',

                    // Account Info

                    vendorPicture: '.profile-image .dokan-upload-image',
                    banner: '.banner-image .dokan-upload-image button',
                    firstName: '#first-name',
                    lastName: '#last-name',
                    storeName: '#store-name',
                    storeUrl: '#user-nicename',
                    phoneNumber: '#store-phone',
                    email: '#store-email',
                    username: '#user-login',
                    generatePassword: '.button.button-secondary',
                    password: '#store-password',
                    companyName: '#company-name',
                    companyIdEuidNumber: '#company-id-number',
                    vatOrTaxNumber: '#vat-tax-number',
                    nameOfBank: '#dokan-bank-name',
                    bankIban: '#dokan-bank-iban',
                    // Address
                    street1: '#street-1',
                    street2: '#street-2',
                    city: '#city',
                    zip: '#zip',
                    // country: '.multiselect__single',
                    country: '//label[@for="country"]/..//div[@class="multiselect__select"]',
                    countryInput: '#country',
                    state: '//label[@for="state"]/..//div[@class="multiselect__select"]',
                    stateInput: '#state',
                    // Payment Options
                    accountName: '#account-name',
                    accountNumber: '#account-number',
                    bankName: '#bank-name',
                    bankAddress: '#bank-address',
                    routingNumber: '#routing-number',
                    iban: '#iban',
                    swift: '#swift',
                    payPalEmail: '#paypal-email',
                    enableSelling: '//span[contains(text(),"Enable Selling")]/..//span[@class="slider round"]',
                    publishProductDirectly: '//span[contains(text(), "Publish Product Directly")]/..//span[@class="slider round"]',
                    makeVendorFeature: '//span[contains(text(), "Make Vendor Featured")]/..//span[@class="slider round"]',
                    createVendor: '.button.button-primary.button-hero',
                },

                // Sweet Alert
                createAnother: '.swal2-confirm', // Sweet Alert Confirm
                editVendorInfo: '.swal2-cancel', // Sweet Alert Cancel
                closeSweetAlert: '.swal2-close', // Sweet Alert Close
                sweetAlertTitle: '#swal2-title', // sweet alert title

                vendorDetails: {
                    profileInfo: {
                        profileInfoDiv: 'div.profile-info',
                        profileImage: '.profile-info .profile-icon img',
                        featuredVendor: 'span[title="Featured Vendor"]',

                        storeName: '.profile-info .store-name',
                        storeRating: '.profile-info .star-rating',
                        storeCategory: '.profile-info .store-categoy-names',
                        storeAddress: '.profile-info .address',
                        phone: '.profile-info .phone',

                        sendEmail: '.profile-info .message',
                        sellingStatus: '.profile-info .status',
                    },

                    sendEmail: {
                        closeModal: '.modal-close.modal-close-link',
                        replyTo: 'input#replyto',
                        subject: 'input#subject',
                        message: 'textarea#message',
                        sendEmail: '.modal-footer button',
                    },

                    profileBanner: {
                        profileBanner: 'div.profile-banner',
                        visitStore: 'div.action-links a.visit-store ',
                        editStore: 'div.action-links a.router-link-active',
                    },

                    vendorSummary: {
                        vendorSummarySection: 'section.vendor-summary',

                        // badges
                        badgesAcquired: {
                            badgesAcquired: 'div.seller-badge-list-card',
                            noBadgesAvailable: '.no-badge-available',
                            badgesGallery: '.myGallery',
                        },

                        // products-revenue
                        productRevenue: {
                            productRevenueSection: '.vendor-summary div.products-revenue',

                            products: {
                                products: 'div.products-revenue .stat-summary.products',
                                productCount: 'ul.counts li.products .count',
                                soldItemCount: 'ul.counts li.items .count',
                                visitorsCount: 'ul.counts li.visitors .count',
                            },

                            revenue: {
                                revenue: 'div.products-revenue .revenue',
                                ordersCount: 'ul.counts li.orders .count',
                                grossSales: 'ul.counts li.gross .count',
                                totalEarning: 'ul.counts li.earning .count',
                            },

                            others: {
                                others: 'div.products-revenue .others',
                                commissionRate: 'ul.counts li.commision .count',
                                balance: 'ul.counts li.balance .count',
                                reviewsCount: 'ul.counts li.reviews .count',
                            },
                        },

                        // vendor info
                        vendorInfo: {
                            registeredSection: 'li.registered',
                            registeredDate: 'li.registered .date',

                            socialProfilesSection: 'li.social-profiles',
                            socialProfilesList: 'li.social-profiles .profiles',

                            paymentsSection: 'li.payments',
                            paymentMethods: 'li.payments .payment-methods',

                            publishStatusSection: 'li.publishing',
                        },
                    },
                },

                // Edit Vendor
                editVendor: {
                    editVendorIcon: '.dashicons-edit',
                    changeStorePhoto: '.profile-icon .dokan-upload-image img',
                    changeStoreBanner: '.profile-banner .dokan-upload-image img',

                    // Account Info
                    firstName: '#first-name',
                    lastName: '#last-name',
                    storeName: '#store-name',
                    phoneNumber: '#store-phone',
                    email: '#store-email',
                    companyName: '#company-name',
                    companyIdEuidNumber: '#company-id-number',
                    vatOrTaxNumber: '#vat-tax-number',
                    nameOfBank: '#dokan-bank-name',
                    bankIban: '#dokan-bank-iban',

                    // Address
                    street1: '#street-1',
                    street2: '#street-2',
                    city: '#city',
                    zipCode: '#zip',
                    country: '//input[@id="country"]/../..//div[@class="multiselect__select"]',
                    countryInput: '#country',
                    state: '//input[@id="state"]/../..//div[@class="multiselect__select"]',
                    stateInput: '#state',

                    // Social Options
                    facebook: '#facebook',
                    flickr: '#flickr',
                    twitter: '#twitter',
                    youtube: '#youtube',
                    linkedin: '#linkedin',
                    pinterest: '//label[@id="pinterest"]/..//input',
                    instagram: '#instagram',

                    // Payment Options
                    accountName: '#account-name',
                    accountNumber: '#account-number',
                    bankName: '#bank-name',
                    accountType: '#account-type', // personal, business
                    bankAddress: '#bank-address',
                    routingNumber: '#routing-number',
                    iban: '#iban',
                    swift: '#swift',
                    payPalEmail: '#paypal-email',
                    AdminCommissionType: '//label[@for="commission-type"]/..//span[@class="multiselect__single"]',
                    AdminCommissionFlat: '.wc_input_price',
                    AdminCommissionPercentage: '.wc_input_decimal',

                    enableSelling: '//span[contains(text(), "Enable Selling")]/..//label[@class="switch tips"]',
                    publishProductDirectly: '//span[contains(text(), "Publish Product Directly")]/..//label[@class="switch tips"]',
                    makeVendorFeature: '//span[contains(text(), "Make Vendor Featured")]/..//label[@class="switch tips"]',

                    // Vendor Subscription
                    AssignSubscriptionPack: '.multiselect--active > .multiselect__tags',

                    // Edit Options
                    cancelEdit: '//div[contains(@class, "action-links footer")]//button[contains(text(),"Cancel")]',
                    saveChanges: '//div[contains(@class, "action-links footer")]//button[contains(text(),"Save Changes")]',
                    cancelEditOnTop: '//div[contains(@class, "profile-banner")]//button[contains(text(),"Cancel")]',
                    saveChangesOnTop: '//div[contains(@class, "profile-banner")]//button[contains(text(),"Save Changes")]',
                    confirmSaveChanges: 'button.swal2-confirm',
                },

                storeCategory: {
                    addNewCategory: {
                        name: '#tag-name',
                        slug: '#tag-slug',
                        description: '#tag-description',
                        addNewCategory: '#submit',
                    },

                    editCategory: {
                        name: '#name',
                        slug: '#slug',
                        description: '#description',
                        update: 'button[type="submit"]',
                    },

                    search: '//input[@placeholder="Search Categories"]',

                    // Table
                    table: {
                        vendorTable: '#dokan-store-categories table',
                        nameColumn: 'thead th.name',
                        descriptionColumn: 'thead th.description',
                        slugColumn: 'thead th.slug',
                        countColumn: 'thead th.count',
                    },

                    numberOfRowsFound: '.tablenav.top .displaying-num',
                    noRowsFound: '//td[normalize-space()="No category found"]',
                    storeCategoryCell: (title: string) => `//td//a[contains(text(), '${title}')]/../..`,
                    storeCategoryEdit: (title: string) => `//td//a[contains(text(), '${title}')]/../..//span[@class='edit']//a`,
                    storeCategoryDelete: (title: string) => `//td//a[contains(text(), '${title}')]/../..//span[@class='delete']//a`,
                    storeCategorySetDefault: (title: string) => `//td//a[contains(text(), '${title}')]/../..//span[@class='set_as_default']//a`,
                },
            },

            // Abuse Reports
            abuseReports: {
                abuseReportsText: 'h1.wp-heading-inline',

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // delete
                    applyAction: '.tablenav.top .button.action',
                },

                // Filters
                filters: {
                    filterByAbuseReason: '(//select[@id="filter-products"]/..//select)[1]',
                    filterByProduct: '(//span[@class="select2-selection__arrow"])[1]',
                    filterByVendors: '(//span[@class="select2-selection__arrow"])[2]',
                    filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
                },

                // Table
                table: {
                    abuseReportsTable: '.wp-list-table',
                    reasonColumn: 'thead th.reason',
                    productColumn: 'thead th.product',
                    vendorColumn: 'thead th.vendor',
                    reportedByColumn: 'thead th.reported_by',
                    reportedAtColumn: 'thead th.reported_at',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No items found."]',
                abuseReportCell: (input: string) => `//a[contains(text(), '${input}')]/../..`, // abuse-reason, product-name, vendor-name
                abuseReportFirstCell: '(//a[@href="#view-report"])[1]',

                abuseReportModal: {
                    modalTitle: '.modal-header h1',
                    closeModal: '.modal-close',
                    reportedProduct: '//strong[normalize-space()="Reported Product:"]',
                    reason: '//strong[normalize-space()="Reason:"]',
                    description: '//strong[normalize-space()="Description:"]',
                    reportedBy: '//strong[normalize-space()="Reported by:"]',
                    reportedAt: '//strong[normalize-space()="Reported At:"]',
                    productVendor: '//strong[normalize-space()="Product Vendor:"]',
                },
            },

            // Store Reviews
            storeReviews: {
                storeReviewsText: '.dokan-store-reviews h1',

                // Nav Tabs
                navTabs: {
                    all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                    trash: '//ul[@class="subsubsub"]//li//a[contains(text(),"Trash")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // trash
                    applyAction: '.tablenav.top .button.action',
                },

                // Filters
                filters: {
                    filterByVendor: '.select2-selection__arrow',
                    filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    filterClear: '.select2-selection__clear',
                },

                // Table
                table: {
                    storeReviewsTable: '.dokan-store-reviews table',
                    titleColumn: 'thead th.title',
                    contentColumn: 'thead th.content',
                    customerColumn: 'thead th.customer',
                    vendorColumn: 'thead th.vendor',
                    ratingColumn: 'thead th.rating',
                    dateColumn: 'thead th.created_at',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No reviews found."]',
                storeReviewCell: (title: string) => `//td//a[contains(text(), '${title}')]/../..`,
                storeReviewFirstCell: '(//td[@class="column title"]//a[@href="#"]/../..)[1]',
                storeReviewFirstLink: '(//td[@class="column title"]//a[@href="#"])[1]',
                storeReviewEdit: '(//a[normalize-space()="Edit"])[1]',
                storeReviewDelete: '(//a[normalize-space()="Trash"])[1]',
                storeReviewRestore: '(//a[normalize-space()="Restore"])[1]',
                storeReviewPermanentlyDelete: '(//a[normalize-space()="Permanent Delete"])[1]',

                editReview: {
                    editReviewText: '//h1[normalize-space()="Edit Review"]',
                    modalClose: 'button.modal-close.modal-close-link',
                    ratings: '(//div[@class="modal-body"]//div[@class="vue-star-rating"] )[1]',
                    rating: (star: string) => `(//span[@class='vue-star-rating-pointer vue-star-rating-star'])[${star}]`,
                    title: '#store-review-title',
                    content: '#store-review-content',
                    update: 'input[value="Update Review"]',
                },
            },

            // Store Support
            storeSupport: {
                storeSupportText: '.admin-store-support-tickets h1',

                unreadTicketCount: 'span.pending-count.dokan-unread-ticket-count-badge-in-list',

                // Nav Tabs
                navTabs: {
                    open: '//ul[@class="subsubsub"]//li//a[contains(text(),"Open")]',
                    closed: '//ul[@class="subsubsub"]//li//a[contains(text(),"Closed")]',
                    all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // close
                    applyAction: '.tablenav.top .button.action',
                },

                // Filters
                filters: {
                    filterByVendors: '//select[@id="filter-vendors"]/..//span[@class="select2-selection__arrow"]',
                    filterByCustomers: '//select[@id="filter-customers"]/..//span[@class="select2-selection__arrow"]',
                    filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    filterButton: '//button[normalize-space()="Filter"]',
                    result: 'li.select2-results__option.select2-results__option--highlighted',
                },

                searchTicket: '#post-search-input',

                // Table
                table: {
                    storeSupportTable: '.admin-store-support-tickets table',
                    topicColumn: 'thead th.ID',
                    titleColumn: 'thead th.post_title',
                    vendorColumn: 'thead th.vendor_name',
                    customerColumn: 'thead th.customer_name',
                    statusColumn: 'thead th.post_status',
                    dateColumn: 'thead th.ticket_date',
                    actionColumn: 'thead th.action',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No tickets found."]',
                supportTicketCell: (ticketId: string) => `//strong[contains(text(), '#${ticketId}')]/../..`,
                supportTicketFirstCell: '(//td[@class="column ID"]//a)[1]',
                supportTicketLink: (ticketId: string) => `//strong[contains(text(), '#${ticketId}')]/..`,

                supportTicketDetails: {
                    backToTickets: '//span[@class="back-to-tickets"]//../..//a',

                    ticketTitle: '//span[contains(@class,"dokan-chat-title") and not(contains(@class,"dokan-chat-status"))]',
                    chatStatus: 'div.dokan-chat-status-box  span.dokan-chat-status',
                    chatBox: 'div.dokan-chat-box-container',

                    chatAuthor: 'select#sender', // admin, vendor
                    chatReply: 'textarea.dokan-chat-replay',
                    sendReply: 'button.dokan-send-replay',

                    ticketSummary: {
                        summaryDiv: 'div.dokan-chat-summary-holder',
                        summaryHeading: 'span.dokan-chat-summary',
                        summaryArrow: 'span.dokan-summary-arrow',

                        ticketId: 'div.dokan-summary-info.ticket-id',
                        vendorInfo: 'div.dokan-summary-info.dokan-vendor-info',
                        customerInfo: 'div.dokan-summary-info.dokan-customer-info',
                        messageCount: 'div.dokan-summary-info.conversation',
                        createdAt: '//div[normalize-space()="Created At:"]/..//div[@class="dokan-summary-info created-at"]',
                        emailNotification: '.dokan-summary-info label.switch.tips',
                        closeTicket: 'button.dokan-close-ticket',
                        reopenTicket: 'button.dokan-reopen-ticket',
                    },
                },
            },

            // Request for quotation
            requestForQuotation: {
                menus: {
                    quoteList: '//a[normalize-space()="Quotes List"]',
                    quoteRules: '//a[normalize-space()="Quote Rules"]',
                },

                quotesList: {
                    quotesText: '.dokan-quote-wrapper h1',

                    newQuote: '.page-title-action',

                    // Nav Tabs
                    navTabs: {
                        all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                        pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
                        draft: '//ul[@class="subsubsub"]//li//a[contains(text(),"Draft")]',
                        converted: '//ul[@class="subsubsub"]//li//a[contains(text(),"Converted")]',
                        approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
                        trash: '//ul[@class="subsubsub"]//li//a[contains(text(),"Trash")]',
                    },

                    // Bulk Actions
                    bulkActions: {
                        selectAll: 'thead .manage-column input',
                        selectAction: '.tablenav.top #bulk-action-selector-top', // trash
                        applyAction: '.tablenav.top .button.action',
                    },

                    // Table
                    table: {
                        quotesTable: '.dokan-quote-wrapper table',
                        quoteColumn: 'thead th.sl',
                        quoteTitleColumn: 'thead th.title',
                        customerEmailColumn: 'thead th.customer_email',
                        quoteStatusColumn: 'thead th.status',
                        dateColumn: 'thead th.created_at',
                    },

                    numberOfRowsFound: '.tablenav.top .displaying-num',
                    noRowsFound: '//td[normalize-space()="No quote found."]',
                    quoteCell: (title: string) => `//strong[contains(text(),'${title}')]/../..//td[@class='column sl']`,
                    quoteEdit: (title: string) => `//strong[contains(text(),'${title}')]/../..//td[@class='column sl']//span[@class="edit"]`,
                    quoteTrash: (title: string) => `//strong[contains(text(),'${title}')]/../..//td[@class='column sl']//span[@class="trash"]`,
                    quotePermanentlyDelete: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="delete"]`,
                    quoteRestore: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="restore"]`,

                    approveQuote: 'input[value="Approve Quote"]',
                    convertToOrder: 'input[value="Convert to Order"]',

                    addNewQuote: {
                        goBack: '//a[normalize-space()="Go Back"]',

                        // title
                        quoteTitle: '#title',

                        // customer information
                        quoteUserDropDown: '.multiselect__select',
                        quoteUserInput: '.multiselect__input',
                        fullName: 'input[name="name_field"]',
                        email: 'input[name="email_field"]',
                        companyName: 'input[placeholder="Company Name"]',
                        phoneNumber: 'input[name="phone_field"]',

                        // quote details
                        addProducts: 'input[value="Add product(s)"]',
                        quoteProductDropDown: '.dokan-modal .multiselect__select',
                        quoteProductInput: '.dokan-modal .multiselect__input',
                        quoteProductQuantity: '#quantity',
                        addToQuote: 'input[value="Add to quote"]',
                        offerPrice: '#offer_price',
                        offerProductQuantity: '#offer_product_quantity',
                        deleteQuoteProduct: '.dashicons.dashicons-no',

                        offerPriceByProductName: (product: string) => `//a[normalize-space()="${product}"]/../../..//input[@id="offer_price"]`,
                        offerProductQuantityByProductName: (product: string) => `//a[normalize-space()="${product}"]/../../..//input[@id="offer_product_quantity"]`,
                        deleteQuoteProductByProductName: (product: string) => `//a[normalize-space()="${product}"]/../../..//span[@class="dashicons dashicons-no"]`,

                        // publish
                        saveQuoteAsDraft: 'input[value="Save as Draft"]',
                        publishQuote: 'input[value="Publish"]',
                    },
                },

                quoteRules: {
                    quoteRulesText: '.dokan-announcement-wrapper h1',

                    newQuoteRule: '.page-title-action',

                    // Nav Tabs
                    navTabs: {
                        all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                        published: '//ul[@class="subsubsub"]//li//a[contains(text(),"Published")]',
                        draft: '//ul[@class="subsubsub"]//li//a[contains(text(),"Draft")]',
                        trash: '//ul[@class="subsubsub"]//li//a[contains(text(),"Trash")]',
                    },

                    // Bulk Actions
                    bulkActions: {
                        selectAll: 'thead .manage-column input',
                        selectAction: '.tablenav.top #bulk-action-selector-top', // trash
                        applyAction: '.tablenav.top .button.action',
                    },

                    // Table
                    table: {
                        quoteRulesTable: '.dokan-announcement-wrapper table',
                        titleColumn: 'thead th.rule_name',
                        userRolesColumn: 'thead th.selected_user_role',
                        hidePriceColumn: 'thead th.hide_price',
                        buttonTextColumn: 'thead th.button_text',
                        rulePriorityColumn: 'thead th.rule_priority',
                        ruleStatusColumn: 'thead th.status',
                        dateColumn: 'thead th.created_at',
                    },

                    numberOfRowsFound: '.tablenav.top .displaying-num',
                    noRowsFound: '//td[normalize-space()="No quote found."]',
                    quoteRulesCell: (title: string) => `//a[contains(text(),'${title}')]/../..`,
                    trashedQuoteRulesCell: (title: string) => `//strong[contains(text(),'${title}')]/../..`,
                    quoteRulesEdit: (title: string) => `//a[contains(text(),'${title}')]/../..//span[@class="edit"]`,
                    quoteRulesTrash: (title: string) => `//a[contains(text(),'${title}')]/../..//span[@class="trash"]`,
                    quoteRulesPermanentlyDelete: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="delete"]`,
                    quoteRulesRestore: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="restore"]`,

                    addNewQuoteRule: {
                        goBack: '//a[normalize-space()="Go Back"]',

                        // title
                        ruleTitle: '#title',

                        // rule settings
                        applyQuoteFor: (role: string) => `#${role}`,
                        applyQuoteFor1: (role: string) => `//label[normalize-space()="${role}"]/..//input`,
                        applyOnAllProducts: '#apply_on_all_product',
                        selectProductsDropDown: '.multiselect__select',
                        selectProductsInput: '.multiselect__input',
                        selectCategories: (category: string) => `//span[normalize-space()="${category}"]/..//input`,
                        hidePrice: '#announcement_sender_type', // 1, 0
                        hidePriceText: '//th[normalize-space()="Hide Price Text"]/..//input',
                        hideAddToCartButton: 'select[name="hide_cart_button"]', // replace, keep_and_add_new
                        customButtonLabel: '//th[normalize-space()="Custom Button Label"]/..//input',

                        // rule priority
                        priorityOrder: '//span[normalize-space()="Rule priority"]/../../..//input',

                        // publish
                        saveRuleAsDraft: 'input[value="Save as Draft"]',
                        publishRule: 'input[value="Publish"]',
                    },
                },
            },

            // Seller Badge
            sellerBadge: {
                sellerBadgeText: '.seller-badge-list h1',
                createBadge: '//a[normalize-space()="+ Create Badge"]',

                // Nav Tabs
                navTabs: {
                    all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                    published: '//ul[@class="subsubsub"]//li//a[contains(text(),"Published")]',
                    draft: '//ul[@class="subsubsub"]//li//a[contains(text(),"Draft")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // delete
                    applyAction: '.tablenav.top .button.action',
                },

                search: '#post-search-input',

                // Table
                table: {
                    sellerBadgeTable: '.seller-badge-list table',
                    badgesNameColumn: 'thead th.badge_name',
                    badgeEventColumn: 'thead th.event_type',
                    noOfVendorsColumn: 'thead th.vendor_count',
                    statusColumn: 'thead th.badge_status',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No badges found."]',
                sellerBadgeRow: (name: string) => `//a[contains(text(),'${name}')]/../../..`,
                sellerBadgeCell: (name: string) => `//a[contains(text(),'${name}')]/../..`,
                sellerBadgeLevel: (name: string) => `//a[contains(text(),'${name}')]/../../..//span[@class="level_count"]//strong`,
                sellerBadgeEdit: (name: string) => `//a[contains(text(),'${name}')]/../..//div[@class="row-actions"]//span[@class="edit"]//a`,
                sellerBadgePreview: (name: string) => `//a[contains(text(),'${name}')]/../..//div[@class="row-actions"]//span[@class="view"]//a`,
                sellerBadgeVendors: (name: string) => `//a[contains(text(),'${name}')]/../..//div[@class="row-actions"]//span[@class="show_vendors"]//a`,
                sellerBadgePublish: (name: string) => `//a[contains(text(),'${name}')]/../..//div[@class="row-actions"]//span[@class="publish"]//a`,
                sellerBadgeDraft: (name: string) => `//a[contains(text(),'${name}')]/../..//div[@class="row-actions"]//span[@class="draft"]//a`,
                sellerBadgeDelete: (name: string) => `//a[contains(text(),'${name}')]/../..//div[@class="row-actions"]//span[@class="delete"]//a`,

                confirmAction: '.swal2-actions .swal2-confirm',
                cancelAction: '.swal2-actions .swal2-cancel',
                successMessage: '.swal2-actions .swal2-confirm',

                previewBadgeDetails: {
                    modal: '.seller-badge-modal-content',

                    modalHeader: {
                        modalImage: '.modal-header .modal-img',
                        modalTitle: '.modal-header .modal-title',
                        modalClose: '.modal-header .modal-close',
                    },

                    levelBox: '.modal-level-box',
                },

                badgeDetails: {
                    // badge event
                    badgeEvents: {
                        badgeEventBox: 'div.badge__event-box',
                        badgeEventDropdown: '.seller-badge-event-dropdown',
                        badgeEvent: (name: string) => `//h3[normalize-space()="${name}"]/../..`,
                        badgePublishedStatus: (name: string) => `//h3[normalize-space()="${name}"]/..//i[contains(@class, "published")]`,
                        badgeName: 'input#title',
                    },

                    // badge  condition & level
                    badgeCondition: {
                        badgeConditionBox: 'div.badge__condition-box',
                        badgeLevel: 'span.badge-level',
                        startingLevelValue: '//span[normalize-space()="Level 1"]/..//input',
                        levelInputValue: (value: string) => `//span[normalize-space()="Level ${value}"]/..//input`,
                        addBadgeLevel: 'div.dokan-logical-container button',
                        removeBadgeLevel: '(//i[@class="remove-level"])[2]',
                        verifiedSellerMethod: '//option[normalize-space()="Select a method"]/..',
                        disabledVerifiedSellerMethod: '//select//option[@disabled="disabled"]',
                        verifiedSellerMethod1: (number: number) => `(//option[normalize-space()="Select a method"]/..)[${number}]`,
                        trendingProductPeriod: '.dokan-logical-container select',
                        trendingProductTopBestSellingProduct: '.dokan-logical-container input',
                    },

                    // badge photo
                    badgePhoto: {
                        uploadBadgeImage: '//div[@class="dokan-upload-image-container"]//img',
                        badgePhotoReset: '//a[normalize-space()="restore default."]',
                    },

                    // badge status
                    badgeStatus: {
                        badgeStatus: 'select#status',
                        create: '//button[normalize-space()="Create"]',
                        update: '//button[normalize-space()="Update"]',
                        goBack: '//button[normalize-space()="Go Back"]',
                    },

                    confirmBadgeUpdate: '.swal2-actions .swal2-confirm',
                    badgeAddedSuccessfully: '.swal2-actions .swal2-confirm',
                },
            },

            // Announcements
            announcements: {
                announcementText: '.dokan-announcement-wrapper h1',

                addNewAnnouncement: '//button[normalize-space()="Add Announcement"]',

                // Nav Tabs
                navTabs: {
                    all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                    published: '//ul[@class="subsubsub"]//li//a[contains(text(),"Published")]',
                    pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
                    scheduled: '//ul[@class="subsubsub"]//li//a[contains(text(),"Scheduled")]',
                    draft: '//ul[@class="subsubsub"]//li//a[contains(text(),"Draft")]',
                    trash: '//ul[@class="subsubsub"]//li//a[contains(text(),"Trash")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // trash
                    applyAction: '.tablenav.top .button.action',
                },

                // Table
                table: {
                    announcementTable: '.dokan-announcement-wrapper table',
                    titleColumn: 'thead th.title',
                    contentColumn: 'thead th.content',
                    sentToColumn: 'thead th.send_to',
                    statusColumn: 'thead th.status',
                    dateColumn: 'thead th.created_at',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No announcement found."]',
                announcementCell: (title: string) => `//a[contains(text(),'${title}')]/../..`,
                announcementCellPublished: (title: string) => `//strong[contains(text(),'${title}')]/../..`,
                announcementStatusPublished: (title: string) => `//strong[contains(text(),'${title}')]/../..//td[@class="column status"]//span[@class="publish"]`,
                announcementStatusScheduled: (title: string) => `//a[contains(text(),'${title}')]/../../..//td[@class="column status"]//span[@class="future"]`,
                announcementEdit: (title: string) => `//a[contains(text(),'${title}')]/../..//span[@class="edit"]`,
                announcementDelete: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="trash"]`,
                announcementPermanentlyDelete: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="delete"]`,
                announcementRestore: (title: string) => `//strong[contains(text(),'${title}')]/../..//span[@class="restore"]`,

                // add announcement
                addAnnouncement: {
                    title: '#titlediv input',
                    contentIframe: '#postdivrich iframe',
                    contentHtmlBody: '#tinymce',
                    sendAnnouncementTo: '#announcement_sender_type', // all_seller, selected_seller, enabled_seller, disabled_seller, featured_seller
                    saveAsDraft: 'input.draft-btn',
                    publish: 'input.publish-btn',

                    schedule: {
                        addSchedule: 'span#timestamp a',
                        month: 'fieldset#timestampdiv label select',
                        day: 'input#jj',
                        year: 'input#aa',
                        hour: 'input#hh',
                        minute: 'input#mm',
                        ok: '//button[normalize-space()="Ok"]',
                        cancel: '//button[normalize-space()="Cancel"]',
                    },
                },
            },

            // Refunds
            refunds: {
                refundRequestsText: '.dokan-refund-wrapper h1',

                // Nav Tabs
                navTabs: {
                    pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
                    approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
                    cancelled: '//ul[@class="subsubsub"]//li//a[contains(text(),"Cancelled")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // completed, cancelled
                    applyAction: '.tablenav.top .button.action',
                },

                // Search Refund
                search: '#post-search-input',

                // Table
                table: {
                    refundRequestTable: '.dokan-refund-wrapper table',
                    orderIdColumn: 'thead th.order_id',
                    vendorColumn: 'thead th.vendor',
                    refundAmountColumn: 'thead th.amount',
                    refundReasonColumn: 'thead th.reason',
                    paymentGatewayColumn: 'thead th.method',
                    dateColumn: 'thead th.date',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No request found."]',
                refundCell: (orderNumber: string) => `//strong[contains(text(),'#${orderNumber}')]/../..`,
                approveRefund: (orderNumber: string) => `//strong[contains(text(),'#${orderNumber}')]/../..//span[@class='completed']`,
                cancelRefund: (orderNumber: string) => `//strong[contains(text(),'#${orderNumber}')]/../..//span[@class='cancelled']`,
            },

            // Reports
            reports: {
                // Menus
                menus: {
                    reports: '//a[contains(@class, "nav-tab") and contains(text(),"Reports")]',
                    allLogs: '//a[contains(@class, "nav-tab") and contains(text(),"All Logs")]',
                },
                // Reports

                reports: {
                    // At a Glance
                    atAGlance: {
                        atAGlance: '.postbox.dokan-postbox.dokan-status',
                        collapsibleButton: '.dokan-status .handle-actions button',
                        netSalesThisMonth: '.sale strong',
                        commissionEarned: '.commission strong div',
                        signupThisMonth: '.vendor strong',
                        vendorAwaitingApproval: '.approval strong',
                        productCreatedThisMonth: '.product strong',
                        withdrawAwaitingApproval: '.withdraw strong',
                    },

                    // Overview
                    overview: {
                        overview: '.postbox.dokan-postbox.overview-chart',
                        collapsibleButton: '.overview-chart .handle-actions button',
                        chart: '#line-chart',
                    },

                    // filterMenus

                    filterMenus: {
                        byDay: '//ul[contains(@class, "dokan-report-sub")]//a[contains(text(),"By Day")]',
                        byYear: '//ul[contains(@class, "dokan-report-sub")]//a[contains(text(),"By Year")]',
                        byVendor: '//ul[contains(@class, "dokan-report-sub")]//a[contains(text(),"By Vendor")]',
                    },

                    filters: {
                        // By Year
                        filterByYearNumber: '.dokan-input',
                        // By Vendor
                        filterByStoreName: '.multiselect__tags',
                        filterByStoreNameInput: 'multiselect__input',
                    },

                    // calendar
                    calendar: 'div.report-date-range',

                    // show
                    show: '//button[normalize-space()="Show"]',
                },

                // All Logs

                allLogs: {
                    // Filter
                    filters: {
                        filterByStore: '//span[@id="select2-filter-vendors-container"]/..//span[@class="select2-selection__arrow"]',
                        filterByStoreInput: '//input[@class="select2-search__field" and @aria-owns="select2-filter-vendors-results"]',
                        // filterByStoreValues: '.select2-results ul li',
                        filterByStatus: '//span[@class="select2-selection select2-selection--multiple"]',
                        filterByStatusInput: '//input[@class="select2-search__field" and @placeholder="Filter by status"]',
                        searchedResult: '.select2-results__option.select2-results__option--highlighted',
                        // filterByStatusValues: '.select2-results ul li',
                        filterByDate: '.form-control',
                        clear: '//a[contains(text(),"Clear")]',
                    },

                    // Search
                    search: '#post-search-input',

                    // Logs
                    exportLogs: '#export-all-logs',

                    table: {
                        allLogsTable: '.reports-page table',
                        orderIdColumn: 'thead th.order_id',
                        storeColumn: 'thead th.vendor_id',
                        orderTotalColumn: 'thead th.order_total',
                        vendorEarningColumn: 'thead th.vendor_earning',
                        commissionColumn: 'thead th.commission',
                        gatewayFeeColumn: 'thead th.dokan_gateway_fee',
                        shippingColumn: 'thead th.shipping_total',
                        shippingTaxColumn: 'thead th.shipping_total_tax',
                        productTaxColumn: 'thead th.tax_total',
                        statusColumn: 'thead th.status',
                        DateColumn: 'thead th.date',
                    },

                    // Order Details
                    numberOfRowsFound: '.tablenav.top .displaying-num',
                    orderIdRow: (orderNumber: string) => `//a[normalize-space()='#${orderNumber}']/..//..`,
                    orderIdCell: (orderNumber: string) => `//a[normalize-space()='#${orderNumber}']/..`,
                    orderIdOrderTotal: (orderNumber: string) => `//a[normalize-space()='#${orderNumber}']/..//..//td[@class="column order_total"]//div`,

                    orderDetails: {
                        orderId: '.column.order_id > a',
                        store: '.column.vendor_id > a',
                        orderTotal: '.column.order_total > div',
                        vendorEarning: '.column.vendor_earning > div',
                        commission: '.column.commission > div',
                        gatewayFee: '.column.dokan_gateway_fee > div',
                        shippingCost: '.column.shipping_total > div',
                        tax: '.column.tax_total > div',
                        orderStatus: 'td.column.status',
                        orderDate: 'td.column.date ',
                    },
                },
            },

            // Modules
            modules: {
                lite: {
                    moduleText: '#lite-modules h1',

                    // dokan upgrade popup
                    popup: {
                        dokanUpgradePopup: '#dokan-upgrade-popup',
                        closeDokanUpgradePopup: '#dokan-upgrade-popup .close',
                        upgradeToProText: '.upgrade-text',
                        upgradeToPro: '.upgrade-button',
                        proCard: '.promo-card',
                        alreadyUpdated: '.already-updated',
                    },

                    // modules
                    moduleCard: '.plugin-card',
                },

                pro: {
                    moduleText: '.dokan-modules-wrap h1',

                    // module plan
                    modulePlan: {
                        planName: '.plan-name',
                        upgradePlan: '.module-plan .upgrade-plan',
                    },

                    // Nav Tabs
                    navTabs: {
                        myModules: '//li//a[contains(text(),"My Modules")]',
                        active: '//li//a[contains(text(),"Active")]',
                        inActive: '//li//a[contains(text(),"Inactive")]',
                    },

                    // filter
                    moduleFilter: '.module-category-filter',
                    moduleFilterCheckBox: (category: string) => `//label[contains(text(),"${category}")]/..//input`,
                    clearFilter: '//a[normalize-space()="Clear filter"]',
                    moduleCategoryTag: (category: string) => `//span[normalize-space()="${category}"]`,
                    moduleCategoryTypes: {
                        productManagement: '.product-management',
                        integration: '.integration',
                        uiUx: '.ui-ux',
                        shipping: '.shipping',
                        storeManagement: '.store-management',
                        payment: '.payment',
                        orderManagement: '.order-management',
                        vendorManagement: '.vendor-management',
                    },

                    // Search Box
                    searchBox: '.search-box input',
                    clearSearch: '.search-box svg',

                    // view mode
                    currentLayout: '.my-modules',
                    moduleViewMode: '.module-view-mode',

                    // module card
                    moduleCard: '.module-card',
                    moduleCardByName: (moduleName: string) => `//a[normalize-space()="${moduleName}"]/../../..`,
                    moduleIcon: '.module-icon',
                    moduleCheckbox: '.module-checkbox input',
                    moduleName: '.module-details a',
                    moduleDescription: '.module-details p',
                    moduleCategory: '.module-details span',
                    moduleActivationSwitch: '.switch.tips span',
                    moduleDocs: '//a[normalize-space()="Docs"]',
                    moduleVideos: '//a[normalize-space()="Video"]',

                    // All Module Activation
                    firstModuleCheckbox: '(//div[@class="module-checkbox"]//input)[1]',
                    selectAllBulkAction: '.bulk-actions li input',
                    activeAll: '.activate',
                    deActivateAll: '.deactivate',
                    cancelBulkAction: '.cancel',

                    // No Modules Message
                    noModulesFound: '.not-found h5',
                },
            },

            // pro features
            proFeatures: {
                dokanProFeatures: '.dokan-pro-features',

                // header section
                headerSection: '.header-section',

                // vender capabilities
                vendorCapabilitiesBanner: '.vendor-capabilities-banner',
                checkOutAllVendorFunctionalities: '//a[normalize-space()="Check Out All Vendor Functionalities"]',

                // service section
                serviceSection: '.service-section',
                serviceList: '.service-section .service-list',
                andManyMore: '//a[normalize-space()="And Many More"]',

                // compare section
                comparisonSection: '.comparison-section',
                comparisonBoxDokanLite: '.comparison-section .compare-box.dokan-lite',
                comparisonBoxDokanPro: '.comparison-section .compare-box.dokan-pro',

                // pricing section
                pricingSection: '.pricing-section',
                pricingTable: '.pricing-section .pricing-wrapper',

                // payment section
                paymentSection: '.payment-section',
                guaranteeSection: '.payment-section .guarantee-section',
                paymentOptions: '.payment-section .payment-area',

                // testimonial section
                testimonialSection: '.testimonial-section',
                testimonials: '.testimonial-section .testimonial-wrapper',

                // cta section
                ctaSection: '.cta-section',
                upgradeToPro: '//a[normalize-space()="Upgrade to Pro"]',
            },

            // Tools
            tools: {
                toolsText: '.tools-page h1',

                // Page Installation
                pageInstallation: {
                    pageInstallation: '//span[normalize-space()="Page Installation"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Page Installation"]/../../..//button',
                    allPagesCreated: '//a[normalize-space()="All Pages Created"]',
                },

                // Regenerate Order Sync Tab
                regenerateOrderSyncTable: {
                    regenerateOrderSyncTable: '//span[normalize-space()="Regenerate Order Sync Table"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Regenerate Order Sync Table"]/../../..//button',
                    reBuild: '//a[normalize-space()="Re-build"]',
                },

                // Regenerate Order commission
                regenerateOrderCommission: {
                    regenerateOrderSyncTable: '//span[normalize-space()="Regenerate Order Commission"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Regenerate Order Commission"]/../../..//button',
                    regenerate: '//span[normalize-space()="Regenerate Order Commission"]/../../..//a[normalize-space()="Regenerate"]',
                },

                // Check for Duplicate Orders
                checkForDuplicateOrders: {
                    checkForDuplicateOrders: '//span[normalize-space()="Check for Duplicate Orders"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Check for Duplicate Orders"]/../../..//button',
                    checkOrders: '//a[normalize-space()="Check Orders"]',
                },

                // Dokan Setup Wizard
                dokanSetupWizard: {
                    dokanSetupWizard: '//span[normalize-space()="Dokan Setup Wizard"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Dokan Setup Wizard"]/../../..//button',
                    openSetupWizard: '//a[normalize-space()="Open Setup Wizard"]',
                },

                // regenerate Variable Product Variations Author Ids
                regenerateVariableProductVariationsAuthorIds: {
                    regenerateVariableProductVariationsAuthorIds: '//span[normalize-space()="Regenerate Variable Product Variations Author IDs"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Regenerate Variable Product Variations Author IDs"]/../../..//button',
                    regenerate: '//span[normalize-space()="Regenerate Variable Product Variations Author IDs"]/../../..//a[normalize-space()="Regenerate"]',
                },

                // Import Dummy Data
                importDummyData: {
                    importDummyData: '//span[normalize-space()="Import Dummy Data"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Import Dummy Data"]/../../..//button',
                    import: '//span[normalize-space()="Import Dummy Data"]/../../..//a',
                },

                // Test Distance Matrix API (Google MAP)
                testDistanceMatrixApi: {
                    testDistanceMatrixApi: '//span[normalize-space()="Test Distance Matrix API (Google MAP)"]/../../..',
                    collapsibleButton: '//span[normalize-space()="Test Distance Matrix API (Google MAP)"]/../../..//button[@class="handlediv"]',
                    address1: '#address1',
                    address2: '#address2',
                    getDistance: '//button[normalize-space()="Get Distance"]',
                    enabledSuccess: '//div[@class="formatted-message success"]',
                },
            },

            // Product QA
            productQA: {
                productQuestionAnswersText: '.product-questions-answers h1',

                unreadQuestionCount: '//a[contains(text(),"Product Q&A")]/..//span[@class="pending-count"]',

                // Nav Tabs
                navTabs: {
                    all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                    unread: '//ul[@class="subsubsub"]//li//a[contains(text(),"Unread")]',
                    read: '//ul[@class="subsubsub"]//li//a[contains(text(),"Read")]',
                    unanswered: '//ul[@class="subsubsub"]//li//a[contains(text(),"Unanswered")]',
                    answered: '//ul[@class="subsubsub"]//li//a[contains(text(),"Answered")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // read, unread, delete
                    applyAction: '.tablenav.top .button.action',
                    confirmAction: '.swal2-actions .swal2-confirm',
                    bulkActionSuccessMessage: '//h2[text()="Bulk action successful."]',
                },

                // Filters
                filters: {
                    filterByVendors: '(//select[@id="filter-vendors"]/..//span[@class="select2-selection__arrow"])[1]',
                    filterByProducts: '(//select[@id="filter-products"]/..//span[@class="select2-selection__arrow"])[2]',
                    resetFilterByVensors: '//select[@id="filter-products"]/..//button[@class="button"]',
                    filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    result: 'li.select2-results__option.select2-results__option--highlighted',
                },

                // Table
                table: {
                    questionColumn: 'thead th.question',
                    productColumn: 'thead th.product',
                    vendorColumn: 'thead th.vendor',
                    dateColumn: 'thead th.created',
                    statusColumn: 'thead th.status',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No question found."]',
                productQuestionCell: (input: string) => `//strong[contains(text(), '${input}')]/..`,
                productQuestionFirstCell: '(//tbody//tr//td//a)[1]',

                // question details
                questionDetails: {
                    productQuestionAnswersText: '//h2[text()="Product Questions & Answers"]',

                    goBack: '//a[contains(text(),"← Go Back")]',

                    questionDetails: {
                        editQuestion: '(//button[normalize-space()="Edit"])[1]',
                        questionInput: 'textarea#comment.block',
                        saveQuestion: '(//button[normalize-space()="Save"])[1]',
                        questionText: '//div[ contains(@class, "break-words") and not(contains(@class, "prose")) ]',
                    },

                    status: {
                        visibleStatus: '//dd[text()[normalize-space()="Visible"]]',
                        hiddenStatus: '//dd[text()[normalize-space()="Hidden"]]',
                        hideFromProductPage: '//button[normalize-space()="Hide From Product Page"]',
                        showInProductPage: '//button[normalize-space()="Show In Product Page"]',
                        deleteQuestion: '(//button[normalize-space()="Delete"])[1]',
                    },

                    answer: {
                        questionAnswerIframe: '//iframe[contains(@id, "dokan-product-qa-admin-answer-editor")]',
                        questionAnswerHtmlBody: '#tinymce',
                        saveAnswer: '//button[normalize-space()="Save"]',
                        editAnswer: '(//button[normalize-space()="Edit"])[2]',
                        answerText: 'div.prose p',
                        deleteAnswer: '(//button[normalize-space()="Delete"])[2]',
                    },

                    confirmAction: '.swal2-actions .swal2-confirm',

                    visibilityStatusSaveSuccessMessage: '//h2[text()="Visibility status changed successfully."]',
                    questionSaveSuccessMessage: '//h2[text()="Question updated successfully."]',
                    answerSaveSuccessMessage: '//h2[text()="Answer created successfully."]',
                    answerUpdateSuccessMessage: '//h2[text()="Answer updated successfully."]',
                    answerDeleteSuccessMessage: '//h2[text()="Answer deleted successfully."]',
                    questionDeleteSuccessMessage: '//h2[text()="Question deleted successfully."]',
                },
            },

            // Verifications
            verifications: {
                verificationRequestsText: '//h2[normalize-space()="Verification Requests"]',

                // Nav Tabs
                navTabs: {
                    pending: '//ul[@class="subsubsub"]//li//a[contains(text(),"Pending")]',
                    approved: '//ul[@class="subsubsub"]//li//a[contains(text(),"Approved")]',
                    rejected: '//ul[@class="subsubsub"]//li//a[contains(text(),"Rejected")]',
                },

                // Table
                table: {
                    verificationTable: '.verification-table',
                    storeNameColumn: '//thead//th[contains(text(),"Store Name")]',
                    photoIdColumn: '//thead//th[contains(text(),"Photo ID")]',
                    addressColumn: '//thead//th[contains(text(),"Address")]',
                    phoneNumberColumn: '//thead//th[contains(text(),"Phone Number")]',
                    companyColumn: '//thead//th[contains(text(),"Company")]',
                },

                vendorRow: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..`,

                idRequest: {
                    approveRequest: (storeName: string) => `(//a[normalize-space()="${storeName}"]/../../..//a[@data-status="approved"])[1]`,
                    rejectRequest: (storeName: string) => `(//a[normalize-space()="${storeName}"]/../../..//a[@data-status="rejected"])[1]`,
                    disapproveRequest: (storeName: string) => `(//a[normalize-space()="${storeName}"]/../../..//a[@data-status="disapproved"])[1]`,
                },

                addressRequest: {
                    approveRequest: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..//a[@data-type="address"][normalize-space()="Approve"]`,
                    rejectRequest: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..//a[@data-type="address"][normalize-space()="Reject"]`,
                    disapproveRequest: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..//a[@data-type="address"][normalize-space()="Disapprove"]`,
                    proofOfResidence: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..//a[normalize-space()="Proof of residence"]`,
                },

                phoneRequest: {
                    // todo:
                },

                companyRequest: {
                    approveRequest: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..//a[@data-type="company_verification_files"][normalize-space()="Approve"]`,
                    rejectRequest: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..//a[@data-type="company_verification_files"][normalize-space()="Reject"]`,
                    disapproveRequest: (storeName: string) => `//a[normalize-space()="${storeName}"]/../../..//a[@data-type="company_verification_files"][normalize-space()="Disapprove"]`,
                },
            },

            // Advertising
            productAdvertising: {
                productAdvertisingText: '.product-advertisement-list h1',

                addNewProductAdvertising: '//button[normalize-space()="Add New Advertisement"]',

                // Nav Tabs
                navTabs: {
                    all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                    active: '//ul[@class="subsubsub"]//li//a[contains(text(),"Active")]',
                    expired: '//ul[@class="subsubsub"]//li//a[contains(text(),"Expired")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // delete
                    applyAction: '//div[@class="tablenav top"]//button[normalize-space()="Apply"]',
                },

                // Filters
                filters: {
                    allStoresDropdown: '//input[@placeholder="Filter by store"]/../..//div[@class="multiselect__select"]',
                    createdViaDropdown: '(//div[@class="multiselect__select"])[2]',
                    filterByStoreInput: 'input[placeholder="Filter by store"]',
                    filterByCreatedVia: (createdVia: string) => `//li[@class="multiselect__element"]//span[contains(@class,"multiselect__option")]//span[contains(text(), "${createdVia}")]`,
                    clearFilter: '//button[normalize-space()="Clear"]',
                    // todo:  add date-range filter locator
                },

                // Search
                search: '#post-search-input',

                // Table
                table: {
                    productAdvertisingTable: '#product_advertisement_list_table table',
                    productNameColumn: 'thead th.product_title',
                    storeNameColumn: 'thead th.store',
                    createdViaColumn: 'thead th.created_via',
                    orderIdColumn: 'thead th.order_id',
                    costColumn: 'thead th.price',
                    expiresColumn: 'thead th.expires_at',
                    dateColumn: 'thead th.added',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No advertisement found."]',
                advertisedProductCell: (productName: string) => `//a[normalize-space()="${productName}"]/../..`,
                advertisedProductOrderIdCell: (orderNumber: number) => `//a[normalize-space()="${orderNumber}"]/../..`,
                advertisedProductExpire: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="expire"]`,
                advertisedProductDelete: (productName: string) => `//a[normalize-space()="${productName}"]/../..//span[@class="delete"]`,

                confirmAction: '.swal2-actions .swal2-confirm', // todo:  merge this type of locators
                actionSuccessful: '.swal2-actions .swal2-confirm', // todo:  merge this type of locators

                addNewAdvertisement: {
                    closeModal: '.modal-header button',
                    selectStoreDropdown: '//label[normalize-space()="Select Store"]/..//div[@class="multiselect__select"]',
                    selectStoreInput: '#filter-vendors',
                    selectedStore: '//label[normalize-space()="Select Store"]/..//span[@class="multiselect__option multiselect__option--highlight"]//span',
                    selectProductDropdown: '//label[normalize-space()="Select Product"]/..//div[@class="multiselect__select"]',
                    selectProductInput: '#filter-products',
                    selectedProduct: '//label[normalize-space()="Select Product"]/..//span[@class="multiselect__option multiselect__option--highlight"]//span',
                    addReverseWithdrawalEntry: '#reverse-withdrawal-entry',
                    addNew: '.modal-footer button',
                },
            },

            // Wholesale Customer
            wholesaleCustomer: {
                wholesaleCustomerText: '.wholesale-customer-list h1',

                // Nav Tabs
                navTabs: {
                    all: '//ul[@class="subsubsub"]//li//a[contains(text(),"All")]',
                    active: '//ul[@class="subsubsub"]//li//a[contains(text(),"Active")]',
                    deActive: '//ul[@class="subsubsub"]//li//a[contains(text(),"Deactive")]',
                },

                // Bulk Actions
                bulkActions: {
                    selectAll: 'thead .manage-column input',
                    selectAction: '.tablenav.top #bulk-action-selector-top', // activate, deactivate
                    applyAction: '.tablenav.top .button.action',
                },

                search: '#post-search-input',

                // Table
                table: {
                    wholesaleCustomerTable: '.wholesale-customer-list table',
                    nameColumn: 'thead th.full_name',
                    emailColumn: 'thead th.email',
                    usernameColumn: 'thead th.username',
                    rolesColumn: 'thead th.role',
                    registeredColumn: 'thead th.registered',
                    statusColumn: 'thead th.wholesale_status',
                },

                numberOfRowsFound: '.tablenav.top .displaying-num',
                noRowsFound: '//td[normalize-space()="No customers found."]',
                wholesaleCustomerCell: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']`,
                wholesaleCustomerEdit: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']//span[@class='edit']//a`,
                wholesaleCustomerOrders: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']//span[@class='orders']//a`,
                wholesaleCustomerRemove: (username: string) => `//td[contains(text(), '${username}')]/..//td[@class='column full_name']//span[@class='delete']//a`,
                statusSlider: (username: string) => `//td[contains(text(), '${username}')]/..//label[@class='switch tips']`,
                enableStatusUpdateSuccessMessage: '.notification-content',
            },

            // Help
            help: {
                helpText: '.dokan-help-page h1',

                // basics
                basics: {
                    basics: '//span[contains(text(), "Basics")]/../../..',
                    collapsibleButton: '//span[contains(text(), "Basics")]/../../..//button',
                    basicsList: '//span[contains(text(), "Basics")]/../../..//ul',
                },

                // payment And Shipping
                paymentAndShipping: {
                    paymentAndShipping: '//span[contains(text(), "Payment and Shipping")]/../../..',
                    collapsibleButton: '//span[contains(text(), "Payment and Shipping")]/../../..//button',
                    paymentAndShippingList: '//span[contains(text(), "Basics")]/../../..//ul',
                },

                // vendor related questions
                vendorRelatedQuestions: {
                    vendorRelatedQuestions: '//span[contains(text(), "Vendor Related Questions")]/../../..',
                    collapsibleButton: '//span[contains(text(), "Vendor Related Questions")]/../../..//button',
                    vendorRelatedQuestionsList: '//span[contains(text(), "Basics")]/../../..//ul',
                },

                // miscellaneous
                miscellaneous: {
                    miscellaneous: '//span[contains(text(), "Miscellaneous")]/../../..',
                    collapsibleButton: '//span[contains(text(), "Miscellaneous")]/../../..//button',
                    miscellaneousList: '//span[contains(text(), "Miscellaneous")]/../../..//button',
                },
            },

            spmv: {
                spmvDiv: '#dokan-spmv-products-admin',
                searchVendor: '#dokan-spmv-products-admin input.select2-search__field',
                searchedResult: (storeName: string) => `//div[contains(text(),"${storeName}") and @class="dokan-spmv-vendor-dropdown-results__title"]`,
                highlightedResult: '.select2-results__option.select2-results__option--highlighted',
                assignVendor: '#dokan-spmv-products-admin-assign-vendors-btn',
                unassignVendor: (storeName: string) => `//span[normalize-space()="${storeName}"]/../..//span[@class="delete-product"]`,
            },

            // Dokan Settings
            settings: {
                // settings pro advertisement
                proAdvertisementBanner: {
                    settingsBanner: '#dokan-settings-banner',
                    upgradeToPro: '//a[normalize-space()="Upgrade to Pro"]',
                    checkOutAllVendorFunctionalities: '//a[normalize-space()="Check Out All Vendor Functionalities"]',
                },

                settingsText: '.dokan-settings h1',

                sections: {
                    settingsMenuSection: '.nab-section',
                    settingsMenuDetailsSection: '.nab-section',
                },

                header: {
                    settingsHeader: '.settings-header',
                    settingsTitle: '.settings-title',
                    settingsContent: '.settings-content',
                    settingsDocumentation: '.settings-document-button',
                },

                fields: '.dokan-settings-fields',

                saveChanges: '//input[@id="submit" and @value="Save Changes"]',

                search: {
                    searchBox: '.search-box',
                    input: '#dokan-admin-search',
                    close: '.search-box span.dashicons',
                },

                backToTop: '.back-to-top.tips',

                // Setting Menus
                menus: {
                    general: '//div[@class="nav-title" and contains(text(),"General")]',
                    sellingOptions: '//div[@class="nav-title" and contains(text(),"Selling Options")]',
                    withdrawOptions: '//div[@class="nav-title" and contains(text(),"Withdraw Options")]',
                    reverseWithdrawal: '//div[@class="nav-title" and contains(text(),"Reverse Withdrawal")]',
                    pageSettings: '//div[@class="nav-title" and contains(text(),"Page Settings")]',
                    appearance: '//div[@class="nav-title" and contains(text(),"Appearance")]',
                    menuManager: '//div[@class="nav-title" and contains(text(),"Menu Manager")]',
                    privacyPolicy: '//div[@class="nav-title" and contains(text(),"Privacy Policy")]',
                    colors: '//div[@class="nav-title" and contains(text(),"Colors")]',
                    liveSearch: '//div[@class="nav-title" and contains(text(),"Live Search")]',
                    storeSupport: '//div[@class="nav-title" and contains(text(),"Store Support")]',
                    sellerVerification: '//div[@class="nav-title" and contains(text(),"Seller Verification")]',
                    verificationSmsGateways: '//div[@class="nav-title" and contains(text(),"Verification SMS Gateways")]',
                    emailVerification: '//div[@class="nav-title" and contains(text(),"Email Verification")]',
                    socialApi: '//div[@class="nav-title" and contains(text(),"Social API")]',
                    shippingStatus: '//div[@class="nav-title" and contains(text(),"Shipping Status")]',
                    quote: '//div[@class="nav-title" and contains(text(),"Quote Settings")]',
                    liveChat: '//div[@class="nav-title" and contains(text(),"Live Chat")]',
                    rma: '//div[@class="nav-title" and contains(text(),"RMA")]',
                    wholesale: '//div[@class="nav-title" and contains(text(),"Wholesale")]',
                    euComplianceFields: '//div[@class="nav-title" and contains(text(),"EU Compliance Fields")]',
                    deliveryTime: '//div[@class="nav-title" and contains(text(),"Delivery Time")]',
                    productAdvertising: '//div[@class="nav-title" and contains(text(),"Product Advertising")]',
                    geolocation: '//div[@class="nav-title" and contains(text(),"Geolocation")]',
                    productReportAbuse: '//div[@class="nav-title" and contains(text(),"Product Report Abuse")]',
                    singleProductMultiVendor: '//div[@class="nav-title" and contains(text(),"Single Product MultiVendor")]',
                    vendorSubscription: '//div[@class="nav-title" and contains(text(),"Vendor Subscription")]',
                    vendorAnalytics: '//div[@class="nav-title" and contains(text(),"Vendor Analytics")]',
                },

                // General
                general: {
                    // Site settings
                    adminAreaAccess: '.admin_access .switch',

                    vendorStoreUrl: '#dokan_general\\[custom_store_url\\]',
                    vendorSetupWizardLogo: '#dokan_general\\[setup_wizard_logo_url\\]',
                    disableWelcomeWizard: '#dokan_general\\[disable_welcome_wizard\\]',
                    setupWizardMessageIframe: 'iframe',
                    setupWizardMessageHtmlBody: '#tinymce',
                    sellingProductTypes: (type: string) => `//label[contains(@for,'sell_${type}-global_digital_mode')]`,
                    logShipStationApiRequest: '#dokan_general\\[enable_shipstation_logging\\]',
                    dataClear: '#dokan_general\\[data_clear_on_uninstall\\]',
                    confirmDataClear: '.swal2-confirm',
                    cancelDataClear: '.swal2-cancel',

                    // Vendor Store settings
                    storeTermsAndConditions: '.seller_enable_terms_and_conditions .switch',
                    storeProductPerPage: '#dokan_general\\[store_products_per_page\\]',
                    enableTermsAndCondition: '.enable_tc_on_reg .switch',
                    enableSingSellerMode: '#dokan_general\\[enable_single_seller_mode\\]',
                    storCategory: (category: string) => `//label[contains(@for,'${category}-store_category_type')]`,

                    // product page settings
                    showVendorInfo: '.show_vendor_info .switch',
                    enableMoreProductsTab: '.enabled_more_products_tab .switch',

                    generalSaveChanges: '#submit',
                },

                // Selling
                selling: {
                    // Commission
                    commissionType: '#dokan_selling\\[commission_type\\]',
                    adminCommission: '#dokan_selling\\[admin_percentage\\]',
                    shippingFeeRecipient: (feeReceiver: string) => `//label[contains(@for,'${feeReceiver}-shipping_fee_recipient')]`,
                    productTaxFeeRecipient: (feeReceiver: string) => `//label[contains(@for,'${feeReceiver}-tax_fee_recipient')]`,
                    shippingTaxFeeRecipient: (feeReceiver: string) => `//label[contains(@for,'${feeReceiver}-shipping_tax_fee_recipient')]`,
                    processRefundViaAPI: '#dokan_selling\\[automatic_process_api_refund\\]',

                    // Vendor Capability
                    enableSelling: '.new_seller_enable_selling .switch',
                    onePageProductCreate: '.one_step_product_create .switch',
                    disableProductPopup: '.disable_product_popup .switch',
                    orderStatusChange: '.order_status_change .switch',
                    selectAnyCategory: '.dokan_any_category_selection .switch',
                    newProductStatus: (status: string) => `//label[contains(@for,'${status}-product_status')]`,
                    duplicateProduct: '.vendor_duplicate_product .switch',
                    editedProductStatus: '.edited_product_status .switch',
                    productMailNotification: '.product_add_mail .switch',
                    productCategorySelection: (category: string) => `//label[contains(@for,'${category}-product_category_style')]`,
                    vendorsCanCreateTags: '.product_vendors_can_create_tags .switch',
                    orderDiscount: '//div[contains(text(),"Order Discount")]//label[@class="switch tips"]',
                    productDiscount: '//div[contains(text(),"Product Quantity Discount")]//label[@class="switch tips"]',

                    hideCustomerInfo: '.hide_customer_info .switch',
                    vendorProductReviewStatusChange: '.seller_review_manage .switch',
                    guestProductEnquiry: '.enable_guest_user_enquiry .switch',
                    newVendorEnableAuction: '.new_seller_enable_auction .switch',
                    enableMinMaxQuantities: '.enable_min_max_quantity .switch',
                    enableMinMaxAmount: '.enable_min_max_amount .switch',
                    disableShipping: '.disable_shipping_tab .switch',
                    sellingOptionsSaveChanges: '#submit',
                },

                // Withdraw
                withdraw: {
                    // Withdraw Options
                    withdrawMethodsPaypal: '//div[normalize-space(text())="PayPal"]',
                    withdrawMethodsBankTransfer: '//div[contains(text()," Bank Transfer")]//label',
                    withdrawMethodsWireCard: '//div[contains(text(),"Wirecard")]//label',
                    withdrawMethodsPaypalMarketplace: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan-paypal-marketplace\\]',
                    withdrawMethodsDokanCustom: '//div[contains(text(),"Custom")]//label',
                    withdrawMethodsRazorpay: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan_razorpay\\]',
                    withdrawMethodsMangoPay: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan_mangopay\\]',
                    withdrawMethodsStripe: '//div[contains(text(),"Stripe")]//label',
                    withdrawMethodsStripeExpress: '#dokan_withdraw\\[withdraw_methods\\]\\[dokan_stripe_express\\]',
                    withdrawMethodsSkrill: '//div[contains(text(),"Skrill")]//label',
                    customMethodName: '#dokan_withdraw\\[withdraw_method_name\\]',
                    customMethodType: '#dokan_withdraw\\[withdraw_method_type\\]',
                    // withdraw charge
                    payPalChargePercentage: '//h4[@class="field_heading" and text()="PayPal"]/../..//input[@id="percentage-val-id"]',
                    payPalChargeFixed: '//h4[@class="field_heading" and text()="PayPal"]/../..//input[@id="fixed-val-id"]',
                    bankTransferChargePercentage: '//h4[@class="field_heading" and text()="Bank Transfer"]/../..//input[@id="percentage-val-id"]',
                    bankTransferChargeFixed: '//h4[@class="field_heading" and text()="Bank Transfer"]/../..//input[@id="fixed-val-id"]',
                    skrillChargePercentage: '//h4[@class="field_heading" and text()="Skrill"]/../..//input[@id="percentage-val-id"]',
                    skrillChargeFixed: '//h4[@class="field_heading" and text()="Skrill"]/../..//input[@id="fixed-val-id"]',
                    customChargePercentage: '//h4[@class="field_heading" and text()="Custom"]/../..//input[@id="percentage-val-id"]',
                    custompayPalChargeFixed: '//h4[@class="field_heading" and text()="Custom"]/../..//input[@id="fixed-val-id"]',
                    minimumWithdrawAmount: '#dokan_withdraw\\[withdraw_limit\\]',
                    orderStatusForWithdrawCompleted: '//div[contains(text(),"Completed")]//label',
                    orderStatusForWithdrawProcessing: '//div[contains(text(),"Processing")]//label',
                    orderStatusForWithdrawOnHold: '//div[contains(text(),"On-hold")]//label',
                    excludeCodPayments: '.exclude_cod_payment .switch',
                    withdrawThreshold: '#dokan_withdraw\\[withdraw_date_limit\\]',
                    hideWithdrawOption: '.hide_withdraw_option .switch',
                    // Disbursement Schedule Settings
                    withdrawDisbursementManual: '//div[contains(text(),"Manual Withdraw")]//label',
                    withdrawDisbursementAuto: '//div[contains(text(),"Schedule Disbursement")]//label',
                    disburseMentQuarterlySchedule: '//div[contains(text(),"Quarterly")]//label',
                    disburseMentMonthlySchedule: '//div[contains(text(),"Monthly")]//label',
                    disburseMentBiweeklySchedule: '//div[contains(text(),"Biweekly (Twice Per Month)")]//label',
                    disburseMentWeeklySchedule: '//div[contains(text(),"Weekly")]//label',
                    quarterlyScheduleMonth: 'select[name="dokan_withdraw[quarterly_schedule][month]"]',
                    quarterlyScheduleWeek: 'select[name="dokan_withdraw[quarterly_schedule][week]"]',
                    quarterlyScheduleDay: 'select[name="dokan_withdraw[quarterly_schedule][days]"]',
                    monthlyScheduleWeek: 'select[name="dokan_withdraw[monthly_schedule][week]"]',
                    monthlyScheduleDay: 'select[name="dokan_withdraw[monthly_schedule][days]"]',
                    biweeklyScheduleWeek: 'select[name="dokan_withdraw[biweekly_schedule][week]"]',
                    biweeklyScheduleDay: 'select[name="dokan_withdraw[biweekly_schedule][days]"]',
                    weeklyScheduleDay: 'select[name="dokan_withdraw[weekly_schedule]"]',
                    withdrawSaveChanges: '#submit',
                },

                // Reverse Withdraw Settings
                reverseWithdraw: {
                    // Reverse Withdraw Settings
                    enableReverseWithdrawal: '.enabled.dokan-settings-field-type-switcher .switch',
                    enableReverseWithdrawalForThisGateway: '.payment_gateways.dokan-settings-field-type-multicheck .switch',
                    billingType: '#dokan_reverse_withdrawal\\[billing_type\\]',
                    monthlyBillingDate: '#dokan_reverse_withdrawal\\[monthly_billing_day\\]',
                    reverseBalanceThreshold: '#dokan_reverse_withdrawal\\[reverse_balance_threshold\\]',
                    gracePeriod: '#dokan_reverse_withdrawal\\[due_period\\]',
                    disableAddToCartButton: '//div[contains(text(),"Disable Add to Cart Button")]//label',
                    hideWithdrawMenu: '//div[contains(text(),"Hide Withdraw Menu")]//label',
                    MakeVendorStatusInactive: '//div[contains(text(),"Make Vendor Status Inactive")]//label',
                    displayNoticeDuringGracePeriod: '.display_notice.dokan-settings-field-type-switcher .switch',
                    sendAnnouncement: '.send_announcement.dokan-settings-field-type-switcher .switch',
                    reverseWithdrawSaveChanges: '#submit',
                },

                // Pages
                page: {
                    // Page Settings
                    dashboard: 'select#dokan_pages\\[dashboard\\]',
                    myOrders: 'select#dokan_pages\\[my_orders\\]',
                    storeListing: 'select#dokan_pages\\[store_listing\\]',
                    termsAndConditions: 'select#dokan_pages\\[reg_tc_page\\]',
                    pageSaveChanges: '#submit',
                },

                // Appearance
                appearance: {
                    // Appearance
                    showMapOnStorePage: '.store_map .switch',
                    mapApiSource: (source: string) => `//label[contains(@for,'${source}-map_api_source')]`,
                    googleMapApiKey: '#dokan_appearance\\[gmap_api_key\\]',
                    mapBoxAccessToken: '#dokan_appearance\\[mapbox_access_token\\]',
                    googleReCAPTCHA: '.recaptcha_validation_label .dashicons',
                    googleReCAPTCHAValidationSiteKey: '//h3[contains(text()," Site Key")]//..//..//input',
                    googleReCAPTCHAValidationSecretKey: '//h3[contains(text(),"Secret Key")]//..//..//input]',
                    showContactFormOnStorePage: '.contact_seller .switch',
                    storeHeaderTemplate1: '.radio-image:nth-child(1) .button',
                    storeHeaderTemplate2: '.radio-image:nth-child(2) .button',
                    storeHeaderTemplate3: '.radio-image:nth-child(3) .button',
                    storeHeaderTemplate4: '.radio-image:nth-child(4) .button',
                    storeBannerWidth: '#dokan_appearance\\[store_banner_width\\]',
                    storeBannerHeight: '#dokan_appearance\\[store_banner_height\\]',
                    storeOpeningClosingTimeWidget: '.store_open_close .switch',
                    enableStoreSidebarFromTheme: '.enable_theme_store_sidebar .switch',

                    hideVendorInfoEmailAddress: '//div[contains(text(),"Email Address")]//label[@class="switch tips"]',
                    hideVendorInfoPhoneNumber: '//div[contains(text(),"Phone Number")]//label[@class="switch tips"]',
                    hideVendorInfoStoreAddress: '//div[contains(text(),"Store Address")]//label[@class="switch tips"]',
                    appearanceSaveChanges: '#submit',
                },

                // Menu Manager
                menuManager: {
                    leftMenu: '//a[contains(text(),"Left Menu")]',
                    settingsSubMenu: '//a[contains(text(),"Settings Sub Menu")]',
                    resetAll: 'div.menu-manager-reset-all',
                    confirmReset: '.swal2-confirm',
                    cancelReset: '.swal2-cancel',
                    menuParent: '(//div[@class="tabs-details"]//div)[2]',
                    allMenus: 'div.menu_manager_menu_tab div.menu-item',
                    menuGrabber: (menuName: string) => `//span[text()='${menuName}']/../..`,
                    menuEdit: (menuName: string) => `//span[text()='${menuName}']/../..//div[@class='action-icon-wrapper edit-icon-wrapper']`,
                    menuNameInput: '//div[@class="first-part"]//input',
                    menuNameConfirm: '//div[@class="menu-item"]//div[@class="action-icon-wrapper check-icon-wrapper"]',
                    menuNameCancel: '//div[@class="menu-item"]//div[@class="action-icon-wrapper cancel-icon-wrapper"]',
                    menuSwithcher: (menuName: string) => `//span[text()='${menuName}']/../..//label[@class="switch tips"]`,
                    menuManagerSaveChanges: '#submit',
                    noPermissionNotice: '//strong[text()="You have no permission to view this page"]',
                },

                // Privacy Policy
                privacyPolicy: {
                    // Privacy Policy
                    enablePrivacyPolicy: '.enable_privacy .switch',
                    privacyPage: '#dokan_privacy\\[privacy_page\\]',
                    privacyPolicyIframe: 'iframe',
                    privacyPolicyHtmlBody: '#tinymce',
                    privacyPolicySaveChanges: '#submit',
                },

                // Colors
                colors: {
                    predefineColorPalette: '//h3[normalize-space()="Pre-defined Color Palette"]/../..',
                    customColorPalette: '//h3[normalize-space()="Custom Color Palette"]/../..',

                    colorPalette: {
                        default: '#default',
                        petalParty: '//input[@id="petal party"]',
                        pinky: '#pinky',
                        ocean: '#ocean',
                        sweety: '#sweety',
                        summerSplash: '//input[@id="summer splash"]',
                        tree: '#tree',
                    },

                    customColors: {
                        // todo: need to update all locators
                        buttonTextColor: '.btn_text span',
                        buttonBackgroundColor: '.btn_primary span',
                        buttonBorderColor: '.btn_primary_border span',
                        buttonHoverTextColor: '.btn_hover_text span',
                        buttonHoverColor: '.btn_hover span',
                        buttonHoverBorderColor: '.btn_hover_border span',
                        dashboardNavigationText: '.dash_nav_text span',
                        dashboardNavigationActiveMenu: '.dash_active_link span',
                        dashboardNavigationBackground: '.dash_nav_bg span',
                        dashboardMenuBorder: '.dash_nav_border span',
                    },

                    colorsSaveChanges: '#submit',
                },

                // Live Search
                liveSearch: {
                    liveSearchOptions: '#dokan_live_search_setting\\[live_search_option\\]',
                    liveSearchSaveChanges: '#submit',
                },

                // Store Support
                storeSupport: {
                    // Store Support
                    displayOnOrderDetails: '.enabled_for_customer_order .switch',
                    displayOnSingleProductPage: '#dokan_store_support_setting\\[store_support_product_page\\]',
                    supportButtonLabel: '#dokan_store_support_setting\\[support_button_label\\]',
                    storeSupportSaveChanges: '#submit',
                },

                // Seller Verification
                sellerVerifications: {
                    // Seller Verification
                    // Facebook
                    facebookAppId: '#dokan_verification\\[fb_app_id\\]',
                    facebookAppSecret: '#dokan_verification\\[fb_app_secret\\]',
                    // Twitter
                    consumerKey: '#dokan_verification\\[twitter_app_id\\]',
                    consumerSecret: '#dokan_verification\\[twitter_app_secret\\]',
                    // Google
                    googleClientId: '#dokan_verification\\[google_app_id\\]',
                    googleClientSecret: '#dokan_verification\\[google_app_secret\\]',
                    // Linkedin
                    linkedinClientId: '#dokan_verification\\[linkedin_app_id\\]',
                    linkedinClientSecret: '#dokan_verification\\[linkedin_app_secret\\]',
                },

                // Verification Sms Gateways
                verificationSmsGateway: {
                    // Verification Sms Gateways
                    senderName: '#dokan_verification_sms_gateways\\[sender_name\\]',
                    smsText: '#dokan_verification_sms_gateways\\[sms_text\\]',
                    smsSentSuccess: '#dokan_verification_sms_gateways\\[sms_sent_msg\\]',
                    smsSentError: '#dokan_verification_sms_gateways\\[sms_sent_error\\]',
                    activeGateway: '#dokan_verification_sms_gateways\\[active_gateway\\]',
                    // Nexmo
                    apiKey: '#dokan_verification_sms_gateways\\[nexmo_username\\]',
                    apiSecret: '#dokan_verification_sms_gateways\\[nexmo_pass\\]',
                },

                // Email Verification
                emailVerification: {
                    // Email Verification
                    enableEmailVerification: '//label[@for="dokan_email_verification[enabled]"]//label[@class="switch tips"]',
                    registrationNotice: 'textarea#dokan_email_verification\\[registration_notice\\]',
                    loginNotice: 'textarea#dokan_email_verification\\[login_notice\\]',
                    emailVerificationSaveChanges: '#submit',
                },

                // Social API
                socialApi: {
                    enableSocialLogin: '#dokan_social_api\\[enabled\\]',
                },

                // Shipping Status
                shippingStatus: {
                    allowShipmentTracking: 'label[for="dokan_shipping_status_setting[enabled]"] label',

                    // Shipping Providers
                    shippingProviders: {
                        australiaPost: '//input[@value="sp-australia-post"]/..',
                        canadaPost: '//input[@value="sp-canada-post"]/..',
                        cityLink: '//input[@value="sp-city-link"]/..',
                    },

                    customShippingStatusInput: 'input.regular-text',
                    customShippingStatusAdd: 'a.dokan-repetable-add-item-btn',

                    shippingStatusSaveChanges: '#submit',
                },

                // Quote
                quote: {
                    // Configuration
                    enableQuoteForOutOfStockProducts: 'label[for="dokan_quote_settings[enable_out_of_stock]"] label.switch',
                    enableAjaxAddToQuote: 'label[for="dokan_quote_settings[enable_ajax_add_to_quote]"] label.switch',
                    redirectToQuotePage: 'label[for="dokan_quote_settings[redirect_to_quote_page]"] label.switch',

                    // Quote Attributes Settings
                    decreaseOfferedPrice: 'input#dokan_quote_settings\\[decrease_offered_price\\]',
                    enableConvertToOrder: 'label[for="dokan_quote_settings[enable_convert_to_order]"] label.switch',
                    enableQuoteConverterDisplay: 'label[for="dokan_quote_settings[enable_quote_converter_display]"] label.switch',

                    quoteSaveChanges: '#submit',
                },

                // Live Chat
                liveChat: {
                    enableLiveChat: '#dokan_live_chat\\[enable\\]',
                    chatProviderFacebookMessenger: '#dokan_live_chat\\[provider\\]\\[messenger\\]',
                    chatProviderTalkJs: '#dokan_live_chat\\[provider\\]\\[talkjs\\]',
                    chatProviderTawkTo: '#dokan_live_chat\\[provider\\]\\[tawkto\\]',
                    chatProviderWhatsApp: '#dokan_live_chat\\[provider\\]\\[whatsapp\\]',

                    // Fb
                    messengerColor: '.button > span',

                    // Talkjs
                    talkJsAppId: '#dokan_live_chat\\[app_id\\]',
                    talkJsAppSecret: '#dokan_live_chat\\[app_secret\\]',

                    // Whatsapp
                    openingPattern: '#dokan_live_chat\\[wa_opening_method\\]',
                    preFilledMessage: '#dokan_live_chat\\[wa_pre_filled_message\\]',

                    // Chat Button
                    chatButtonOnVendorPage: '#dokan_live_chat\\[chat_button_seller_page\\]',
                    chatButtonOnProductPage: '#dokan_live_chat\\[chat_button_product_page\\]',
                    liveChatSaveChanges: '#submit',
                },

                // Rma
                rma: {
                    orderStatus: '#dokan_rma\\[rma_order_status\\]',
                    enableRefundRequests: '.rma_enable_refund_request .switch',
                    enableCouponRequests: '.rma_enable_coupon_request .switch',
                    reasonsForRmaSingle: (reason: string) => `//li[contains(text(),'${reason}')]//span[@class="dashicons dashicons-no-alt remove-item"]`,
                    reasonsForRma: '.remove-item',
                    reasonsForRmaInput: '.regular-text',
                    reasonsForRmaAdd: '.dokan-repetable-add-item-btn',
                    refundPolicyIframe: 'iframe',
                    refundPolicyHtmlBody: '#tinymce',
                    rmaSaveChanges: '#submit',
                },

                // Wholesale
                wholesale: {
                    whoCanSeeWholesalePrice: (type: string) => `//label[contains(@for,'${type}_user-wholesale_price_display')]`,
                    showWholesalePriceOnShopArchive: '.display_price_in_shop_archieve .switch',
                    needApprovalForCustomer: '.need_approval_for_wholesale_customer .switch',
                    wholesaleSaveChanges: '#submit',
                },

                // Eu Compliance Fields
                euCompliance: {
                    vendorExtraFieldsCompanyName: '//input[@value="dokan_company_name"]//..',
                    vendorExtraFieldsCompanyIdOrEuidNumber: '//input[@value="dokan_company_id_number"]//..',
                    vendorExtraFieldsVatOrTaxNumber: '//input[@value="dokan_vat_number"]//..',
                    vendorExtraFieldsNameOfBank: '//input[@value="dokan_bank_name"]//..',
                    vendorExtraFieldsBankIban: '//input[@value="dokan_bank_iban"]//..',
                    displayInVendorRegistrationForm: '.vendor_registration .switch',
                    customerExtraFieldsCompanyIdOrEuidNumber: '//input[@value="billing_dokan_company_id_number"]//..',
                    customerExtraFieldsVatOrTaxNumber: '//input[@value="billing_dokan_vat_number"]//..',
                    customerExtraFieldsNameOfBank: '//input[@value="billing_dokan_bank_name"]//..',
                    customerExtraFieldsBankIban: '//input[@value="billing_dokan_bank_iban"]//..',
                    enableGermanizedSupportForVendors: '.enabled_germanized .switch',
                    vendorsWillBeAbleToOverrideInvoiceNumber: '.override_invoice_number .switch',
                    euComplianceFieldsSaveChanges: '#submit',
                },

                // Delivery Time
                deliveryTime: {
                    allowVendorSettings: '.allow_vendor_override_settings .switch',
                    homeDelivery: '//div[contains(text(), "Home Delivery")]//label[@class="switch tips"]',
                    storePickup: '//div[contains(text(), "Store Pickup")]//label[@class="switch tips"]',
                    deliveryDateLabel: '#dokan_delivery_time\\[delivery_date_label\\]',
                    deliveryBlockedBuffer: '#dokan_delivery_time\\[preorder_date\\]',
                    timeSlot: '#dokan_delivery_time\\[time_slot_minutes\\]',
                    orderPerSlot: '#dokan_delivery_time\\[order_per_slot\\]',
                    deliveryBoxInfo: '#dokan_delivery_time\\[delivery_box_info\\]',
                    requireDeliveryDateAndTime: '.selection_required .switch',
                    deliveryDay: (day: string) => `//h3[contains(text(), '${day}')]/../..//label[@class='switch tips']`,
                    openingTime: (day: string) => `//input[@id="dokan_delivery_time[delivery_day_${day.toLowerCase()}][opening_time]"]/..`,
                    openingTimeDatePicker: (time: string) => `(//li[contains(text(),'${time}')])[2]`,
                    closingTime: (day: string) => `//input[@id="dokan_delivery_time[delivery_day_${day.toLowerCase()}][closing_time]"]/..`,
                    closingTimeDatePicker: (time: string) => `(//li[contains(text(),'${time}')])[1]`,
                    fullDay: 'li.fullDayClock',
                    deliveryTimeSaveChanges: '#submit',
                },

                // Product Advertising
                productAdvertising: {
                    noOfAvailableSlot: '#dokan_product_advertisement\\[total_available_slot\\]',
                    expireAfterDays: '#dokan_product_advertisement\\[expire_after_days\\]',
                    vendorCanPurchaseAdvertisement: '.per_product_enabled .switch',
                    advertisementCost: '#dokan_product_advertisement\\[cost\\]',
                    enableAdvertisementInSubscription: '.vendor_subscription_enabled .switch',
                    markAdvertisedProductAsFeatured: '.featured .switch',
                    displayAdvertisedProductOnTop: '.catalog_priority .switch',
                    outOfStockVisibility: '.hide_out_of_stock_items .switch',
                    productAdvertisingSaveChanges: '#submit',
                },

                // Geolocation
                geolocation: {
                    locationMapPosition: (position: string) => `//label[contains(@for,'${position}-show_locations_map')]`,
                    showMap: (type: string) => `//label[contains(@for,'${type}-show_location_map_pages')]`,
                    showFiltersBeforeLocationMap: '.show_filters_before_locations_map .switch',
                    productLocationTab: '.show_product_location_in_wc_tab .switch',
                    radiusSearchUnit: (unit: string) => `//label[contains(@for,'${unit}-distance_unit')]`,
                    radiusSearchMinimumDistance: '#dokan_geolocation\\[distance_min\\]',
                    radiusSearchMaximumDistance: '#dokan_geolocation\\[distance_max\\]',
                    mapZoomLevel: '#dokan_geolocation\\[map_zoom\\]',
                    defaultLocation: '.search-address',
                    mapResultFirst: '(//div[contains(@class,"pac-container")]//div[@class="pac-item"])[1]',
                    geolocationSaveChanges: '#submit',
                },

                // Product Report Abuse
                productReportAbuse: {
                    reportedBy: '#dokan_report_abuse\\[reported_by_logged_in_users_only\\]',
                    reasonsForAbuseReportList: '.dokan-settings-repeatable-list li',
                    reasonsForAbuseReportSingle: (reason: string) => `//li[contains(text(),'${reason}')]//span[@class="dashicons dashicons-no-alt remove-item"]`,
                    reasonsForAbuseReportInput: '.regular-text',
                    reasonsForAbuseReportAdd: '.dokan-repetable-add-item-btn',
                    productReportAbuseSaveChanges: '#submit',
                },

                // Single Product Multi Vendor
                spmv: {
                    enableSingleProductMultipleVendor: '.enable_pricing .switch',
                    sellItemButtonText: '#dokan_spmv\\[sell_item_btn\\]',
                    availableVendorDisplayAreaTitle: '#dokan_spmv\\[available_vendor_list_title\\]',
                    availableVendorSectionDisplayPosition: '#dokan_spmv\\[available_vendor_list_position\\]',
                    showSpmvProducts: '#dokan_spmv\\[show_order\\]',
                    singleProductMultiVendorSaveChanges: '#submit',
                },

                // Vendor Subscription
                vendorSubscriptions: {
                    subscription: '#dokan_product_subscription\\[subscription_pack\\]',
                    enableProductSubscription: '.enable_pricing .switch',
                    enableSubscriptionInRegistrationForm: '.enable_subscription_pack_in_reg .switch',
                    enableEmailNotification: '.notify_by_email .switch',
                    noOfDays: '#dokan_product_subscription\\[no_of_days_before_mail\\]',
                    productStatus: '#dokan_product_subscription\\[product_status_after_end\\]',
                    cancellingEmailSubject: '#dokan_product_subscription\\[cancelling_email_subject\\]',
                    cancellingEmailBody: '#dokan_product_subscription\\[cancelling_email_body\\]',
                    alertEmailSubject: '#dokan_product_subscription\\[alert_email_subject\\]',
                    alertEmailBody: '#dokan_product_subscription\\[alert_email_body\\]',
                    vendorSubscriptionSaveChanges: '#submit',
                },

                // Vendor Analytics
                vendorAnalytics: {
                    vendorAnalyticsSaveChanges: '#submit',
                },

                // Update Settings
                dokanUpdateSuccessMessage: '#setting-message_updated > p > strong',
            },

            // License
            license: {
                licenseText: '.appsero-license-settings-wrapper h1',

                activateSection: {
                    licenseSection: '.appsero-license-settings.appsero-license-section',
                    licenseKeyInput: '.license-input-fields .license-input-key input',
                    activateLicense: '//button[contains(text(),"Activate License")]',
                },

                deactivateLicense: 'button.deactive-button',
                refreshLicense: 'button.appsero-license-refresh-button',
                activateLicenseInfo: 'div.active-license-info',

                successNotice: 'div.notice-success.appsero-license-section',
                errorNotice: 'div.notice-error.appsero-license-section',
            },

            // Dokan Setup Wizard
            setupWizard: {
                letsGo: '.button-primary',
                notWrightNow: '//a[contains(text(),"Not right now")]',

                // Store
                vendorStoreURL: '#custom_store_url',
                // shippingFeeRecipient: "#select2-shipping_fee_recipient-container",
                // shippingFeeRecipientValues: ".select2-results ul li",
                // taxFeeRecipient: "#select2-tax_fee_recipient-container",
                // taxFeeRecipientValues: ".select2-results ul li",
                // mapApiSource: "#select2-map_api_source-container",
                // mapApiSourceValues: ".select2-results ul li",
                shippingFeeRecipient: '#shipping_fee_recipient',
                taxFeeRecipient: '#tax_fee_recipient',
                mapApiSource: '#map_api_source',
                googleMapApiKey: '#gmap_api_key',
                mapBoxAccessToken: '#mapbox_access_token',
                shareEssentialsOff: '.switch-label',
                sellingProductTypes: '#dokan_digital_product',
                // sellingProductTypes: "#select2-dokan_digital_product-container",
                // Values: ".select2-results ul li",
                continue: '//input[@value="Continue"]',
                skipThisStep: '//a[contains(text(),"Skip this step")]',

                // Selling
                newVendorEnableSelling: '//label[@for="new_seller_enable_selling" and @class="switch-label"]',
                commissionType: '.commission_type.wc-enhanced-select',
                commissionTypeValues: '.select2-results ul li',
                adminCommission: '#admin_percentage',
                orderStatusChange: '//label[@for="order_status_change" and @class="switch-label"]',

                // Withdraw
                payPal: '//label[@for="withdraw_methods[paypal]" and @class="switch-label"]',
                bankTransfer: '//label[@for="withdraw_methods[bank]" and @class="switch-label"]',
                wireCard: '//label[@for="withdraw_methods[dokan-moip-connect]" and @class="switch-label"]',
                stripe: '//label[@for="withdraw_methods[dokan-stripe-connect]" and @class="switch-label"]',
                custom: '//label[@for="withdraw_methods[dokan_custom]" and @class="switch-label"]',
                skrill: '//label[@for="withdraw_methods[skrill]" and @class="switch-label"]',
                minimumWithdrawLimit: '#withdraw_limit',
                orderStatusForWithdrawCompleted: '//label[@for="withdraw_order_status[wc-completed]"]',
                orderStatusForWithdrawProcessing: '//label[@for="withdraw_order_status[wc-processing]"]',

                // Recommended
                wooCommerceConversionTracking: '//label[@for="dokan_recommended_wc_conversion_tracking"]',
                weMail: '//label[@for="dokan_recommended_wemail"]',
                texty: '//label[@for="dokan_recommended_texty"]',
                continueRecommended: '.button-primary',

                // Ready!
                visitDokanDashboard: '//a[contains(text(),"Visit Dokan Dashboard")]',
                moreSettings: '//a[contains(text(),"More Settings")]',
                ReturnToTheWordPressDashboard: '.wc-return-to-dashboard',
            },

            // Dummy data
            dummyData: {
                runTheImporter: '.dokan-import-continue-btn',
                importComplete: '//p[normalize-space()="Import complete!"]',
                viewVendors: '//a[normalize-space()="View vendors"]',
                viewProducts: '//a[normalize-space()="View products"]',
                clearDummyData: '.cancel-btn.dokan-import-continue-btn',
                confirmClearDummyData: '.swal2-actions .swal2-confirm',
            },
        },

        // Woocommerce
        wooCommerce: {
            // Woocommerce Menu
            settingsMenu: '//li[contains(@class,"toplevel_page_woocommerce")]//a[text()="Settings"]',

            // Woocommerce Settings
            settings: {
                // Settings Menu
                general: '//a[contains(@class,"nav-tab") and text()="General"]',
                products: '//a[contains(@class,"nav-tab") and text()="Products"]',
                tax: '//a[contains(@class,"nav-tab") and text()="Tax"]',
                shipping: '//a[contains(@class,"nav-tab") and text()="Shipping"]',
                payments: '//a[contains(@class,"nav-tab") and text()="Payments"]',
                accounts: '//a[contains(text(),"Accounts & Privacy")]',

                // General
                // Store Address
                addressLine1: '#woocommerce_store_address',
                addressLine2: '#woocommerce_store_address_2',
                city: '#woocommerce_store_city',
                countryOrState: '#select2-woocommerce_default_country-g1-container',
                PostcodeOrZip: '#woocommerce_store_postcode',
                // General Options
                sellingLocation: '#select2-woocommerce_allowed_countries-container',
                shippingLocation: '#select2-woocommerce_ship_to_countries-container',
                defaultCustomerLocation: '#select2-woocommerce_default_customer_address-container',
                enableTaxes: '#woocommerce_calc_taxes',
                enableShipping: '#select2-woocommerce_ship_to_countries-container',
                enableShippingValues: '.select2-results ul li',
                enableCoupon: '#woocommerce_enable_coupons',
                calculateCouponDiscountsSequentially: '#woocommerce_calc_discounts_sequentially',
                // Currency Options
                currency: '#select2-woocommerce_currency-container',
                currencyPosition: '#select2-woocommerce_currency_pos-container',
                currencyPositionValues: '.select2-results ul li',
                thousandSeparator: '#woocommerce_price_thousand_sep',
                decimalSeparator: '#woocommerce_price_decimal_sep',
                numberOfDecimals: '#woocommerce_price_num_decimals',
                generalSaveChanges: '.woocommerce-save-button',

                // Tax
                // Tax Menus
                taxOptions: '//ul[@class="subsubsub"]//a[contains(text(),"Tax options")]',
                standardRates: '//ul[@class="subsubsub"]//a[contains(text(),"Standard rates")]',
                reducedRateRates: '//ul[@class="subsubsub"]//a[contains(text(),"Reduced rate rates")]',
                zeroRateRates: '//ul[@class="subsubsub"]//a[contains(text(),"Zero rate rates")]',

                // Tax Options
                pricesEnteredWithTaxPricesInclusiveOfTax: '//label[contains(text(),"Yes, I will enter prices inclusive of tax")]//input[@name="woocommerce_prices_include_tax"]',
                pricesEnteredWithTaxPricesExclusiveOfTax: '//label[contains(text(),"No, I will enter prices exclusive of tax")]//input[@name="woocommerce_prices_include_tax"]',
                calculateTaxBasedOn: '#select2-woocommerce_tax_based_on-container',
                shippingTaxClass: '#select2-woocommerce_shipping_tax_class-container',
                rounding: '#woocommerce_tax_round_at_subtotal',
                additionalTaxClasses: '#woocommerce_tax_classes',
                displayPricesInTheShop: '#select2-woocommerce_tax_display_shop-container',
                displayPricesDuringCartAndCheckout: '#select2-woocommerce_tax_display_cart-container',
                priceDisplaySuffix: '#woocommerce_price_display_suffix',
                displayTaxTotals: '#select2-woocommerce_tax_total_display-container',
                taxSaveChanges: '.woocommerce-save-button',

                // Add Tax
                taxTable: '.wc_tax_rates',
                insertRow: '.plus',
                taxRate: '.rate input',
                taxRateSaveChanges: '.woocommerce-save-button',

                // Shipping
                addShippingZone: '.page-title-action',
                zoneName: '#zone_name',
                // zoneRegions: ".select2-search__field",
                zoneRegions: '#zone_locations',
                shippingZoneCell: (shippingZone: string) => `//a[contains(text(), '${shippingZone}')]/..`,
                editShippingZone: (shippingZone: string) => `//a[contains(text(), '${shippingZone}')]/..//div//a[contains(text(), 'Edit')]`,
                deleteShippingZone: (shippingZone: string) => `//a[contains(text(), '${shippingZone}')]/..//div//a[contains(text(), 'Delete')]`,
                addShippingMethods: '.wc-shipping-zone-add-method',
                shippingMethod: '.wc-shipping-zone-method-selector select',
                addShippingMethod: '#btn-ok',
                shippingMethodCell: (shippingMethodName: string) => `//a[contains(text(),'${shippingMethodName}')]/..`,
                editShippingMethod: (shippingMethodName: string) => `//a[contains(text(),'${shippingMethodName}')]/..//div//a[contains(text(), 'Edit')]`,
                deleteShippingMethod: (shippingMethodName: string) => `//a[contains(text(),'${shippingMethodName}')]/..//div//a[contains(text(), 'Delete')]`,

                // Edit Shipping Methods
                // Flat Rate
                flatRateMethodTitle: '#woocommerce_flat_rate_title',
                flatRateTaxStatus: '#woocommerce_flat_rate_tax_status',
                flatRateCost: '#woocommerce_flat_rate_cost',
                // Free Shipping
                freeShippingTitle: '#woocommerce_free_shipping_title',
                freeShippingRequires: '#woocommerce_free_shipping_requires',
                freeShippingMinimumOrderAmount: '#woocommerce_free_shipping_min_amount',
                freeShippingCouponsDiscounts: '#woocommerce_free_shipping_ignore_discounts',
                // Local Pickup
                localPickupTitle: '#woocommerce_local_pickup_title',
                localPickupTaxStatus: '#woocommerce_local_pickup_tax_status',
                localPickupCost: '#woocommerce_local_pickup_cost',
                // Dokan Table Rate Shipping
                dokanTableRateShippingMethodTitle: '#woocommerce_dokan_table_rate_shipping_title',
                // Dokan Distance Rate Shipping
                dokanDistanceRateShippingMethodTitle: '#woocommerce_dokan_distance_rate_shipping_title',
                // Vendor Shipping
                vendorShippingMethodTitle: '#woocommerce_dokan_vendor_shipping_title',
                vendorShippingTaxStatus: '#woocommerce_dokan_vendor_shipping_tax_status',

                // Shipping Method save Changes
                shippingMethodSaveChanges: '#btn-ok',
                // Shipping Zone save Changes
                shippingZoneSaveChanges: '.button.wc-shipping-zone-method-save',

                // Payments
                // Enable Methods
                enableDirectBankTransfer: '//a[contains(text(),"Direct bank transfer")]/../..//span',
                enableCheckPayments: '//a[contains(text(),"Check payments")]/../..//span',
                enableCashOnDelivery: '//a[contains(text(),"Cash on delivery")]/../..//span',
                enableDokanWireCardConnect: '//a[contains(text(),"Dokan Wirecard Connect")]/../..//td[@class="status"]//span',
                enableDokanPayPalAdaptivePayments: '//a[contains(text(),"Dokan PayPal Adaptive Payments")]/../..//td[@class="status"]//span',
                enableDokanPayPalMarketplace: '//a[contains(text(),"Dokan PayPal Marketplace")]/../..//td[@class="status"]//span',
                enableDokanStripeConnect: '//a[contains(text(),"Dokan Stripe Connect")]/../..//td[@class="status"]//span',
                enableDokanMangoPay: '//a[contains(text(),"Dokan MangoPay")]/../..//td[@class="status"]//span',
                enableDokanRazorpay: '//a[contains(text(),"Dokan Razorpay")]/../..//td[@class="status"]//span',
                enableDokanStripeExpress: '//a[contains(text(),"Dokan Stripe Express")]/../..//td[@class="status"]//span',
                // Setup or Manage Payment Methods
                setupDirectBankTransfer: '//a[contains(text(),"Direct bank transfer")]/../..//td[@class="action"]//a',
                setupCheckPayments: '//a[contains(text(),"Check payments")]/../..//td[@class="action"]//a',
                setupCashOnDelivery: '//a[contains(text(),"Cash on delivery")]/../..//td[@class="action"]//a',
                setupDokanWireCardConnect: '//a[contains(text(),"Dokan Wirecard Connect")]/../..//td[@class="action"]//a',
                setupDokanPayPalAdaptivePayments: '//a[contains(text(),"Dokan PayPal Adaptive Payments")]/../..//td[@class="action"]//a',
                setupDokanPayPalMarketplace: '//a[contains(text(),"Dokan PayPal Marketplace")]/../..//td[@class="action"]//a',
                setupDokanStripeConnect: '//a[contains(text(),"Dokan Stripe Connect")]/../..//td[@class="action"]//a',
                setupDokanMangoPay: '//a[contains(text(),"Dokan MangoPay")]/../..//td[@class="action"]//a',
                setupDokanRazorpay: '//a[contains(text(),"Dokan Razorpay")]/../..//td[@class="action"]//a',
                setupDokanStripeExpress: '//a[contains(text(),"Dokan Stripe Express")]/../..//td[@class="action"]//a',
                paymentMethodsSaveChanges: '.woocommerce-save-button',

                // Stripe
                stripe: {
                    // Stripe Connect
                    enableDisableStripe: '#woocommerce_dokan-stripe-connect_enabled',
                    title: '#woocommerce_dokan-stripe-connect_title',
                    description: '#woocommerce_dokan-stripe-connect_description',
                    nonConnectedSellers: '#woocommerce_dokan-stripe-connect_allow_non_connected_sellers',
                    displayNoticeToConnectSeller: '#woocommerce_dokan-stripe-connect_display_notice_to_non_connected_sellers',
                    displayNoticeInterval: '#woocommerce_dokan-stripe-connect_display_notice_interval',
                    threeDSecureAndSca: '#woocommerce_dokan-stripe-connect_enable_3d_secure',
                    sellerPaysTheProcessingFeeIn3DsMode: '#woocommerce_dokan-stripe-connect_seller_pays_the_processing_fee',
                    testMode: '#woocommerce_dokan-stripe-connect_testmode',
                    stripeCheckout: '#woocommerce_dokan-stripe-connect_stripe_checkout',
                    stripeCheckoutLocale: '#select2-woocommerce_dokan-stripe-connect_stripe_checkout_locale-container',
                    checkoutImage: '#woocommerce_dokan-stripe-connect_stripe_checkout_image',
                    checkoutButtonLabel: '#woocommerce_dokan-stripe-connect_stripe_checkout_label',
                    savedCards: '#woocommerce_dokan-stripe-connect_saved_cards',
                    // Test Credentials
                    testPublishableKey: '#woocommerce_dokan-stripe-connect_test_publishable_key',
                    testSecretKey: '#woocommerce_dokan-stripe-connect_test_secret_key',
                    testClientId: '#woocommerce_dokan-stripe-connect_test_client_id',
                    stripeSaveChanges: '.woocommerce-save-button',
                },

                // Paypal Marketplace
                paypalMarketPlace: {
                    enableDisablePayPalMarketplace: '#woocommerce_dokan_paypal_marketplace_enabled',
                    title: '#woocommerce_dokan_paypal_marketplace_title',
                    description: '#woocommerce_dokan_paypal_marketplace_description',
                    payPalMerchantId: '#woocommerce_dokan_paypal_marketplace_partner_id',
                    // API Credentials
                    payPalSandbox: '#woocommerce_dokan_paypal_marketplace_test_mode',
                    sandboxClientId: '#woocommerce_dokan_paypal_marketplace_test_app_user',
                    sandBoxClientSecret: '#woocommerce_dokan_paypal_marketplace_test_app_pass',
                    payPalPartnerAttributionId: '#woocommerce_dokan_paypal_marketplace_bn_code',
                    disbursementMode: '#select2-woocommerce_dokan_paypal_marketplace_disbursement_mode-container',
                    disbursementModeValues: '.select2-results ul li',
                    paymentButtonType: '#select2-woocommerce_dokan_paypal_marketplace_button_type-container',
                    paymentButtonTypeValues: '.select2-results ul li',
                    allowUnbrandedCreditCard: '#woocommerce_dokan_paypal_marketplace_ucc_mode',
                    marketplaceLogo: '#woocommerce_dokan_paypal_marketplace_marketplace_logo',
                    displayNoticeToConnectSeller: '#woocommerce_dokan_paypal_marketplace_display_notice_on_vendor_dashboard',
                    sendAnnouncementToConnectSeller: '#woocommerce_dokan_paypal_marketplace_display_notice_to_non_connected_sellers',
                    sendAnnouncementInterval: '#woocommerce_dokan_paypal_marketplace_display_notice_interval',
                    paypalMarketPlaceSaveChanges: '.woocommerce-save-button',
                },

                // Dokan Mangopay
                dokanMangoPay: {
                    enableDisableMangoPayPayment: '#woocommerce_dokan_mangopay_enabled',
                    title: '#woocommerce_dokan_mangopay_title',
                    description: '#woocommerce_dokan_mangopay_description',
                    // API Credentials
                    mangoPaySandbox: '#woocommerce_dokan_mangopay_sandbox_mode',
                    sandboxClientId: '#woocommerce_dokan_mangopay_sandbox_client_id',
                    sandBoxApiKey: '#woocommerce_dokan_mangopay_sandbox_api_key',
                    // Payment Options
                    chooseAvailableCreditCards: '//label[contains(text(),"Choose Available Credit Cards ")]/../..//input[@class="select2-search__field"]',
                    chooseAvailableCreditCardsValues: '.select2-results ul li',
                    chooseAvailableDirectPaymentServices: '//label[contains(text(),"Choose Available Direct Payment Services")]/../..//input[@class="select2-search__field"]',
                    chooseAvailableDirectPaymentServicesValues: '.select2-results ul li',
                    savedCards: '#woocommerce_dokan_mangopay_saved_cards',
                    threeDs2: '#woocommerce_dokan_mangopay_disabled_3DS2',
                    // Fund Transfers and Payouts
                    transferFunds: '#select2-woocommerce_dokan_mangopay_disburse_mode-container',
                    transferFundsValues: '.select2-results ul li',
                    payoutMode: '#woocommerce_dokan_mangopay_instant_payout',
                    // Types and Requirements of Vendors
                    typeOfVendors: '#select2-woocommerce_dokan_mangopay_default_vendor_status-container',
                    typeOfVendorsValues: '.select2-results ul li',
                    businessRequirement: '#select2-woocommerce_dokan_mangopay_default_business_type-container',
                    businessRequirementValues: '.select2-results ul li',
                    // Advanced Settings
                    displayNoticeToNonConnectedSellers: '#woocommerce_dokan_mangopay_notice_on_vendor_dashboard',
                    sendAnnouncementToNonConnectedSellers: '#woocommerce_dokan_mangopay_announcement_to_sellers',
                    announcementInterval: '#woocommerce_dokan_mangopay_notice_interval',
                    dokanMangopaySaveChanges: '.woocommerce-save-button',
                },

                dokanRazorpay: {
                    enableDisableDokanRazorpay: '#woocommerce_dokan_razorpay_enabled',
                    title: '#woocommerce_dokan_razorpay_title',
                    description: '#woocommerce_dokan_razorpay_description',
                    // API Credentials
                    razorpaySandbox: '#woocommerce_dokan_razorpay_test_mode',
                    testKeyId: '#woocommerce_dokan_razorpay_test_key_id',
                    testKeySecret: '#woocommerce_dokan_razorpay_test_key_secret',
                    disbursementMode: '#select2-woocommerce_dokan_razorpay_disbursement_mode-container',
                    disbursementModeValues: '.select2-results ul li',
                    sellerPaysTheProcessingFee: '#woocommerce_dokan_razorpay_seller_pays_the_processing_fee',
                    displayNoticeToConnectSeller: '#woocommerce_dokan_razorpay_display_notice_on_vendor_dashboard',
                    sendAnnouncementToConnectSeller: '#woocommerce_dokan_razorpay_display_notice_to_non_connected_sellers',
                    sendAnnouncementInterval: '#woocommerce_dokan_razorpay_display_notice_interval',
                    dokanRazorpaySaveChanges: '.woocommerce-save-button',
                },

                stripeExpress: {
                    // Stripe Express
                    enableOrDisableStripeExpress: '#woocommerce_dokan_stripe_express_enabled',
                    title: '#woocommerce_dokan_stripe_express_title',
                    description: '#woocommerce_dokan_stripe_express_description',
                    // API Credentials
                    testMode: '#woocommerce_dokan_stripe_express_testmode',
                    testPublishableKey: '#woocommerce_dokan_stripe_express_test_publishable_key',
                    testSecretKey: '#woocommerce_dokan_stripe_express_test_secret_key',
                    testWebhookSecret: '#woocommerce_dokan_stripe_express_test_webhook_key',
                    // Payment and Disbursement
                    choosePaymentMethods: '//select[@id="woocommerce_dokan_stripe_express_enabled_payment_methods"]/..//span[@class="select2-selection select2-selection--multiple"]',
                    choosePaymentMethodsValues: '.select2-results ul li',
                    takeProcessingFeesFromSellers: '#woocommerce_dokan_stripe_express_sellers_pay_processing_fee',
                    savedCards: '#woocommerce_dokan_stripe_express_saved_cards',
                    capturePaymentsManually: '#woocommerce_dokan_stripe_express_capture',
                    disburseFunds: '#select2-woocommerce_dokan_stripe_express_disburse_mode-container',
                    disbursementModeValues: '.select2-results ul li',
                    customerBankStatement: '#woocommerce_dokan_stripe_express_statement_descriptor',
                    // Payment Request Options (Apple Pay / Google Pay)
                    paymentRequestButtons: '#woocommerce_dokan_stripe_express_payment_request',
                    buttonType: '#woocommerce_dokan_stripe_express_payment_request_button_type',
                    buttonTheme: '#woocommerce_dokan_stripe_express_payment_request_button_theme',
                    buttonLocations: '//select[@id="woocommerce_dokan_stripe_express_payment_request_button_locations"]/..//span[@class="select2-selection select2-selection--multiple"]',
                    buttonLocationsValues: '.select2-results ul li',
                    buttonSize: '#woocommerce_dokan_stripe_express_payment_request_button_size',
                    // Advanced Settings
                    displayNoticeToNonConnectedSellers: '#woocommerce_dokan_stripe_express_notice_on_vendor_dashboard',
                    sendAnnouncementToNonConnectedSellers: '#woocommerce_dokan_stripe_express_announcement_to_sellers',
                    announcementInterval: '#woocommerce_dokan_stripe_express_notice_interval',
                    debugLog: '#woocommerce_dokan_stripe_express_debug',
                    stripeExpressSaveChanges: '.woocommerce-save-button',
                },

                // Accounts
                automaticPasswordGeneration: '#woocommerce_registration_generate_password',
                accountSaveChanges: '.woocommerce-save-button',

                // Update Success Message
                updatedSuccessMessage: '#message.updated.inline p',
            },
        },

        // Products
        products: {
            // Products Menus
            allProductsMenu: '//li[@id="menu-posts-product"]//a[text()="All Products"]',
            addNewMenu: '//li[@id="menu-posts-product"]//a[text()="Add New"]',
            categoriesMenu: '//li[@id="menu-posts-product"]//a[text()="Categories"]',
            tagsMenu: '//li[@id="menu-posts-product"]//a[text()="Tags"]',
            addOnsMenu: '//li[@id="menu-posts-product"]//a[text()="Add-ons"]',
            attributesMenu: '//li[@id="menu-posts-product"]//a[text()="Attributes"]',

            // Product
            product: {
                // Add New Product
                productName: '#title',
                // Product Data
                productType: '#product-type',
                virtual: '#\\_virtual',
                downloadable: '#\\_downloadable',

                // Add New Product Sub Menus
                general: '.general_options a',
                inventory: '.inventory_options a',
                shipping: '.shipping_options a',
                linkedProducts: '.linked_product_options a',
                attributes: '.attribute_options a',
                generateVariations: 'button.generate_variations',
                variations: '.variations_options a',
                advanced: '.advanced_options a',
                auction: '.auction_tab_options a',
                bookingAvailability: '.bookings_availability_options a',
                bookingCosts: '.bookings_pricing_options a',

                // General
                regularPrice: 'div#general_product_data  input#\\_regular_price',
                salePrice: '#\\_sale_price',
                salePriceDateFrom: '#\\_sale_price_dates_from',
                salePriceDateTo: '#\\_sale_price_dates_to',
                addDownloadableFiles: '.insert',
                fileName: '.file_name > .input_text',
                fileUrl: '.file_url > .input_text',
                chooseFile: '.upload_file_button',
                downloadLimit: '#\\_download_limit',
                downloadExpiry: '#\\_download_expiry',
                taxStatus: '#\\_tax_status',
                taxClass: '#\\_tax_class',
                enableWholesale: '#enable_wholesale',
                wholesalePrice: '#wholesale_price',
                minimumQuantityForWholesale: '#wholesale_quantity',
                enableMinMaxRule: '#product_wise_activation',
                minimumQuantityToOrder: '#min_quantity',
                maximumQuantityToOrder: '#max_quantity',
                minimumAmountToOrder: '#min_amount',
                maximumAmountToOrder: '#max_amount',
                orderRules: '#\\_donot_count',
                categoryRules: '#ignore_from_cat',

                // External Product
                productUrl: '#\\_product_url',
                buttonText: '#\\_button_text',

                // Simple Subscription
                subscriptionPrice: '#\\_subscription_price',
                subscriptionPeriodInterval: '#\\_subscription_period_interval',
                subscriptionPeriod: '#\\_subscription_period',
                expireAfter: '#\\_subscription_length',
                signUpFee: '#\\_subscription_sign_up_fee',
                subscriptionTrialLength: '#\\_subscription_trial_length',
                subscriptionTrialPeriod: '#\\_subscription_trial_period',
                // Dokan Subscription
                numberOfProducts: '#\\_no_of_product',
                packValidity: '#\\_pack_validity',
                advertisementSlot: '#\\_dokan_advertisement_slot_count',
                expireAfterDays: '#\\_dokan_advertisement_validity',
                dokanSubscriptionAdminCommissionType: '#\\_subscription_product_admin_commission_type',
                dokanSubscriptionAdminCommissionSingle: '.show_if_product_pack #admin_commission',
                dokanSubscriptionAdminCommissionCombined: '.subscription_additional_fee > .input-text',
                allowedProductTypes: '.dokan_subscription_allowed_product_types .select2-search__field',
                allowedCategoriesUncategorized: '._vendor_allowed_categories .select2-search__field',
                restrictGalleryImageUpload: '#\\_enable_gallery_restriction',
                recurringPayment: '#\\_enable_recurring_payment',
                billingCycleRange: '#\\_dokan_subscription_period_interval',
                billingCyclePeriodInterval: '#\\_dokan_subscription_period',
                billingCycleStop: '#\\_dokan_subscription_length',
                enableTrial: '#dokan_subscription_enable_trial',
                trialPeriodRange: '.dokan-subscription-range',
                trialPeriodPeriod: '//select[@name="dokan_subscription_trial_period_types"]',
                // Auction
                itemCondition: '#\\_auction_item_condition',
                auctionType: '#\\_auction_type',
                proxyBidding: '#\\_auction_proxy',
                startPrice: '#\\_auction_start_price',
                bidIncrement: '#\\_auction_bid_increment',
                reservedPrice: '#\\_auction_reserved_price',
                buyItNowPrice: '//label[contains(text(),"Buy it now price")]/..//input[@id="_regular_price"]',
                auctionDatesFrom: '#\\_auction_dates_from',
                auctionDatesTo: '#\\_auction_dates_to',

                // Booking
                bookingDurationType: '#\\_wc_booking_duration_type',
                bookingDuration: '#\\_wc_booking_duration',
                bookingDurationMin: '#\\_wc_booking_min_duration',
                bookingDurationMax: '#\\_wc_booking_max_duration',
                bookingDurationUnit: '#\\_wc_booking_duration_unit',
                calendarDisplayMode: '#\\_wc_booking_calendar_display_mode',
                requiresConfirmation: '#\\_wc_booking_requires_confirmation',
                canBeCancelled: '#\\_wc_booking_user_can_cancel',
                // Booking Availability
                MaxBookingsPerBlock: '#\\_wc_booking_qty',
                MinimumBlockBookableMinDate: '#\\_wc_booking_min_date',
                MinimumBlockBookableMinDateUnit: '#\\_wc_booking_min_date_unit',
                MaximumBlockBookableMaxDate: '#\\_wc_booking_max_date',
                MaximumBlockBookableMaxDateUnit: '#\\_wc_booking_max_date_unit',
                RequireABufferPeriodOf: '#\\_wc_booking_buffer_period',
                AdjacentBuffering: '#\\_wc_booking_apply_adjacent_buffer',
                AllDatesAre: '#\\_wc_booking_default_date_availability',
                CheckRulesAgainst: '#\\_wc_booking_check_availability_against',
                RestrictSelectableDay: '#\\_wc_booking_has_restricted_days',
                // Booking Costs
                baseCost: '#\\_wc_booking_cost',
                blockCost: '#\\_wc_booking_block_cost',
                displayCost: '#\\_wc_display_cost',

                // Inventory
                sku: '#\\_sku',
                manageStock: '#\\_manage_stock',
                stockQuantity: '#\\_stock',
                allowBackOrders: '#\\_backorders',
                lowStockThreshold: '#\\_low_stock_amount',
                stockStatus: '#\\_stock_status',
                soldIndividually: '#\\_sold_individually',
                // Shipping
                weightKg: '#\\_weight',
                length: '#product_length',
                width: '#product_width',
                height: '#product_height',
                shippingClass: '#product_shipping_class',
                // Linked Products
                upSells: '//label[contains(text(),"Grouped products")]/..//input[@class="select2-search__field"]',
                crossSells: '//label[contains(text(),"Upsells")]/..//input[@class="select2-search__field"]',
                // Attributes
                addExistingAttribute: '#product_attributes .select2-selection__arrow',
                addExistingAttributeInput: '.select2-search.select2-search--dropdown .select2-search__field',
                addExistingAttributeValues: '.select2-results ul li',
                customProductAttribute: '.attribute_taxonomy',
                addAttribute: '.add_attribute',
                attributeName: '.attribute_name .attribute_name',
                attributeValues: '.woocommerce_attribute_data textarea',
                selectAll: '.select_all_attributes',
                selectNone: '.minus',
                addNewAttribute: '.button.add_new_attribute',
                visibleOnTheProductPage: '//input[contains(@name, "attribute_visibility")]',
                usedForVariations: '//input[contains(@name, "attribute_variation")]',
                saveAttributes: '.save_attributes',
                // Variations
                productVariations: '.woocommerce_variation',
                addVariations: '#field_to_edit',
                go: '.bulk_edit', // invokes default js alert
                // Advanced
                purchaseNote: '#\\_purchase_note',
                menuOrder: '#menu_order',
                enableReviews: '#comment_status',
                adminCommissionType: '#\\_per_product_admin_commission_type',
                adminCommissionSingle: '.show_if_simple #admin_commission',
                adminCommissionCombined: '.additional_fee > .input-text',
                // Vendor
                // storeName: '#dokan_product_author_override',
                // storeName: 'div#sellerdiv span.select2-selection__arrow', // todo: dokansellerdiv on git action nd sellerdiv on local why
                storeName: '//div[contains(@id, "sellerdiv")]//span[@class="select2-selection__arrow"]',
                // storeNameOptions: '#dokan_product_author_override option',
                storeNameInput: '.select2-search.select2-search--dropdown .select2-search__field',
                storeNameOption: (text: string) => `//select[@id='dokan_product_author_override']//option[contains(text(),'${text}')]`, // Select Option by text

                // Category
                category: (categoryName: string) => `//label[contains(text(), ' ${categoryName}')]/input`,
                // Tags
                tagInput: '#new-tag-product_tag',
                addTag: '.tagadd',
                // Status
                editStatus: '.edit-post-status.hide-if-no-js',
                status: '#post-status-select #post_status',
                // Publish
                saveDraft: '#save-post',
                preview: '#post-preview',
                publish: '#publishing-action #publish',
                updatedSuccessMessage: '.updated.notice.notice-success p',
            },

            // Categories
            category: {
                name: '#tag-name',
                slug: '#tag-slug',
                parentCategory: '#parent',
                description: '#tag-description',
                commissionType: '#per_category_admin_commission_type',
                adminCommissionFromThisCategory: '.wc_input_price:nth-child(2)',
                displayType: '#display_type',
                uploadOrAddImage: '.upload_image_button',
                addNewCategory: '#submit',
                categoryCell: (categoryName: string) => `//td[contains(text(), '${categoryName.toLowerCase()}')]/..`,
            },

            // Attributes
            attribute: {
                name: '#attribute_label',
                slug: '#attribute_name',
                enableArchives: '#attribute_public',
                defaultSortOrder: '#attribute_orderby',
                addAttribute: '#submit',
                attributeCell: (attributeName: string) => `//td[contains(text(), '${attributeName.toLowerCase()}')]/..`,
                configureTerms: (attributeName: string) => `//td[contains(text(), '${attributeName.toLowerCase()}')]/..//a[normalize-space()="Configure terms"]`,
                // Terms
                attributeTerm: '#tag-name',
                attributeTermSlug: '#tag-slug',
                description: '#tag-description',
                addAttributeTerm: '#submit',
                attributeTermCell: (attributeTerm: string) => `//td[contains(text(), '${attributeTerm.toLowerCase()}')]/..`,
            },
        },

        // Bookings
        bookings: {
            // Menus
            allBooking: '//li[@id="menu-posts-wc_booking"]//a[contains(text(),"All Bookings")]',
            resources: '//li[@id="menu-posts-wc_booking"]//a[contains(text(),"Resources")]',
            addBooking: '//li[@id="menu-posts-wc_booking"]//a[contains(text(),"Add Booking")]',
            calendar: '//li[@id="menu-posts-wc_booking"]//a[contains(text(),"Calendar")]',
            sendNotification: '//li[@id="menu-posts-wc_booking"]//a[contains(text(),"Send Notification")]',
            settings: '//li[@id="menu-posts-wc_booking"]//a[contains(text(),"Settings")]',
        },

        // Marketing
        marketing: {
            // Menus
            coupons: '//li[@id="toplevel_page_woocommerce-marketing"]//a[contains(text(),"Coupons")]',

            // Coupon

            addCoupon: '//a[contains(text(),"Add coupon")]',

            addNewCoupon: {
                // Coupon Sub Menus
                general: 'a[href="#general_coupon_data"]',
                vendorLimits: 'a[href="#vendor_usage_limit_coupon_data"]',
                usageRestriction: 'a[href="#usage_restriction_coupon_data"]',
                usageLimits: 'a[href="#usage_limit_coupon_data"]',

                couponCode: '#title',
                couponDescription: '#woocommerce-coupon-description',

                // General
                discountType: '#discount_type', // percent, fixed_cart, fixed_product, sign_up_fee, sign_up_fee_percent, recurring_fee, recurring_percent, booking_person
                couponAmount: '#coupon_amount',
                allowFreeShipping: '#free_shipping',
                couponExpiryDate: '#expiry_date',

                // Vendor Limits
                enableForAllVendors: '#admin_coupons_enabled_for_vendor',
                couponPriceDeduct: '#coupon_commissions_type',
                vendors: '.dokan-admin-coupons-include-vendors .select2-search__field',
                products: '.dokan-coupons-include-product-search-group .select2-search__field',
                excludeProducts: '//label[contains(text(),"Exclude products")]/..//input[@class="select2-search__field"]',
                showOnStores: '#admin_coupons_show_on_stores',
                notifyVendors: '#admin_coupons_send_notify_to_vendors',

                // Usage Restriction
                minimumSpend: '#minimum_amount',
                maximumSpend: '#maximum_amount',
                individualUseOnly: '#individual_use',
                excludeSaleItems: '#exclude_sale_items',
                productCategories: '//label[contains(text(),"Product categories")]/..//input[@class="select2-search__field"]',
                excludeCategories: '//label[contains(text(),"Exclude categories")]/..//input[@class="select2-search__field"]',
                allowedEmails: '#customer_email',

                // Usage Limits
                usageLimitPerCoupon: '//input[@id="usage_limit"]',
                usageLimitPerUser: '#usage_limit_per_user',

                publish: '#publish',
                publishSuccessMessage: '#message.notice-success p',
                publishSuccess: '//p[normalize-space()="Coupon updated."]',
            },
        },

        // Appearance
        appearance: {
            // Menus
            themes: '//li[@id="menu-appearance"]//a[contains(text(),"Themes")]',
            addNew: '//div[@class="wrap"]//a[contains(text(),"Add New")]',
            searchTheme: '#wp-filter-search-input',
        },

        // Plugins
        plugins: {
            // Plugins Menus
            installedPlugins: '//a[text()="Installed Plugins"]',
            plugin: (pluginSlug: string) => `//tr[@data-slug='${pluginSlug}']`,

            // Add New Plugins
            addNew: '.page-title-action',
            searchPlugin: '#search-plugins',
            uploadPlugin: '.upload',
            chooseFile: '#pluginzip',
            installNow: '#install-plugin-submit',
            activatePlugin: (plugin: string) => `a#activate-${plugin}`,
            deactivatePlugin: (plugin: string) => `a#deactivate-${plugin}`,

            deactivateReason: {
                deactivateReasonModal: (plugin: string) => `div#${plugin}-wd-dr-modal`,
                reason: (reasonNumber: number) => `//div[contains(@class, 'wd-dr-modal')]//ul[@class="wd-de-reasons"]//li[${reasonNumber}]`,
                skipAndDeactivate: `div.wd-dr-modal div.wd-dr-modal-footer a.dont-bother-me`,
                cancel: `div.wd-dr-modal div.wd-dr-modal-footer button.wd-dr-cancel-modal`,
                submitAndDeactivate: `div.wd-dr-modal div.wd-dr-modal-footer button.wd-dr-submit-modal`,
            },
        },

        // Users
        users: {
            // Users Menu
            menus: {
                allUsers: '//li[@id="menu-users"]//a[contains(text(),"All Users")]',
                addNew: '//li[@id="menu-users"]//a[contains(text(),"Add New")]',
                profile: '//li[@id="menu-users"]//a[contains(text(),"Profile")]',
            },

            // All Users
            allUsersAddNew: '.page-title-action',
            editUser: '.visible > .edit > a',

            // Add New User
            newUser: {
                username: '#user_login',
                email: '#email',
                firstName: '#first_name',
                lastName: '#last_name',
                website: '#url',
                language: '#locale',
                password: '#pass1',
                sendUserNotification: '#send_user_notification',
                role: '#role',
                addNewUser: '#createusersub',
            },

            // Edit User info
            userInfo: {
                // Personal Info
                role: '#role',
                firstName: '#first_name',
                lastName: '#last_name',
                nickname: '#nickname',
                displayNamePubliclyAs: '#display_name',

                // Contact Info
                email: '#email',
                website: '#url',

                // About the User
                biographicalInfo: '#description',

                // Account Management
                setNewPassword: '.wp-generate-pw',
                newPassword: '#pass1',

                // Customer Billing Address
                billingAddress: {
                    firstName: '#billing_first_name',
                    lastName: '#billing_last_name',
                    company: '#billing_company',
                    address1: '#billing_address_1',
                    address2: '#billing_address_2',
                    city: '#billing_city',
                    postcode: '#billing_postcode',
                    // country: '#select2-billing_country-container',
                    // countryInput: '.select2-results ul li',
                    country: '//select[@id="billing_country"]/..//span[@class="select2-selection__arrow"]',
                    countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    state: '//select[@id="billing_state"]/..//span[@class="select2-selection__arrow"]',
                    stateInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    phone: '#billing_phone',
                    email: '#billing_email',
                    companyIdOrEuidNumber: '#billing_dokan_company_id_number',
                    vatOrTaxNumber: '#billing_dokan_vat_number',
                    bank: '#billing_dokan_bank_name',
                    bankIban: '#billing_dokan_bank_iban',
                },

                // Customer Shipping Address
                shippingAddress: {
                    copyFromBillingAddress: '#copy_billing',
                    firstName: '#shipping_first_name',
                    lastName: '#shipping_last_name',
                    company: '#shipping_company',
                    address1: '#shipping_address_1',
                    address2: '#shipping_address_2',
                    city: '#shipping_city',
                    postcode: '#shipping_postcode',
                    country: '//select[@id="shipping_country"]/..//span[@class="select2-selection__arrow"]',
                    countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    state: '//select[@id="shipping_state"]/..//span[@class="select2-selection__arrow"]',
                    stateInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    phone: '#shipping_phone',
                },

                // Dokan Options
                dokanOptions: {
                    banner: '.dokan-banner .button-area a',
                    storeName: '//input[@name="dokan_store_name"]',
                    storeUrl: '#seller-url',
                    address1: '//input[@name="dokan_store_address[street_1]"]',
                    address2: '//input[@name="dokan_store_address[street_2]"]',
                    city: '//input[@name="dokan_store_address[city]"]',
                    postcode: '//input[@name="dokan_store_address[zip]"]',
                    // country: '#select2-country-container',
                    // countryValues: '.select2-results ul li',
                    // state: '##select2-state-container',
                    // stateValues: '.select2-results ul li',
                    country: '(//span[@class="select2-selection__arrow"])[1]',
                    countryInput: '.select2-search.select2-search--dropdown .select2-search__field',
                    state: '(//span[@class="select2-selection__arrow"])[2]',
                    stateInput: '.select2-search.select2-search--dropdown .select2-search__field',

                    phone: '//input[@name="dokan_store_phone"]',
                    companyName: '//input[@name="dokan_company_name"]',
                    companyIdOrEuidNumber: '//input[@name="dokan_company_id_number"]',
                    vatOrTaxNumber: '//input[@name="dokan_vat_number"]',
                    bank: '//input[@name="dokan_bank_name"]',
                    bankIban: '//input[@name="dokan_bank_iban"]',
                    facebook: '//input[@name="dokan_social[fb]"]',
                    twitter: '//input[@name="dokan_social[twitter]"]',
                    pinterest: '//input[@name="dokan_social[pinterest]"]',
                    linkedin: '//input[@name="dokan_social[linkedin]"]',
                    youtube: '//input[@name="dokan_social[youtube]"]',
                    instagram: '//input[@name="dokan_social[instagram]"]',
                    flickr: '//input[@name="dokan_social[flickr]"]',
                    selling: '#dokan_enable_selling',
                    publishing: '#dokan_publish',
                    adminCommissionType: '#dokan_admin_percentage_type',
                    adminCommission: '#admin-commission',
                    featuredVendor: '#dokan_feature',
                    withdrawThreshold: '#withdraw_date_limit',
                    auction: '#dokan_disable_auction',
                    // Dokan Subscription
                    assignSubscriptionPack: '.dps_assign_pack select',
                },
            },

            // Update User
            updateUser: 'input#submit',
            updateSuccessMessage: '//strong[normalize-space()="User updated."]',
        },

        // Tools
        tools: {
            // Menus
            import: '//li[@id="menu-tools"]//a[text()="Import"]',
            export: '//li[@id="menu-tools"]//a[text()="Export"]',
        },

        // Settings
        settings: {
            // Settings Menus
            general: '//li[@id="menu-settings"]//a[text()="General"]',
            writing: '//li[@id="menu-settings"]//a[text()="Writing"]',
            reading: '//li[@id="menu-settings"]//a[text()="Reading"]',
            discussion: '//li[@id="menu-settings"]//a[text()="Discussion"]',
            media: '//li[@id="menu-settings"]//a[text()="Media"]',
            permalinks: '//li[@id="menu-settings"]//a[text()="Permalinks"]',
            privacy: '//li[@id="menu-settings"]//a[text()="Privacy"]',

            // General Settings
            siteTitle: '#blogname',
            tagline: '#blogdescription',
            wordPressAddressUrl: '#siteurl',
            siteAddressUrl: '#home',
            administrationEmailAddress: '#new_admin_email',
            membership: '#users_can_register',
            newUserDefaultRole: '#default_role',
            siteLanguage: '#WPLANG',
            timezone: '#timezone_string',
            customDateFormat: '//input[@id="date_format_custom_radio" and @name="date_format"]',
            timeFormat: '//input[@id="time_format_custom_radio" and @name="time_format"]',
            weekStartsOn: '#start_of_week',
            generalSaveChanges: '#submit',

            // Permalinks Settings
            // Common Settings
            numeric: '//input[@value="/archives/%post_id%"]/..',
            // postName: "//input[@value='/%postname%/' and @type='radio']/..",
            postName: '#permalink-input-post-name',
            // Optional Settings
            shopBaseWithCategory: '//input[@value="/shop/%product_cat%/"]',
            customBase: '#woocommerce_custom_selection',
            customBaseInput: '#woocommerce_permalink_structure',
            permalinkSaveChanges: '#submit',

            // Update Settings
            updatedSuccessMessage: '#setting-error-settings_updated strong',
        },
    },

    // Vendor

    vendor: {
        // Vendor Registration
        vRegistration: {
            // Vendor Registration
            regEmail: 'input#reg_email',
            regPassword: 'input#reg_password',
            regVendor: '//input[@value="seller"]',
            firstName: 'input#first-name',
            lastName: 'input#last-name',
            shopName: 'input#company-name',
            shopUrl: 'input#seller-url',
            street1: 'input#dokan_address\\[street_1\\]',
            street2: 'input#dokan_address\\[street_2\\]',
            city: 'input#dokan_address\\[city\\]',
            zipCode: 'input#dokan_address\\[zip\\]',
            country: 'select#dokan_address_country',
            state: 'select#dokan_address_state',
            companyName: 'input#dokan-company-name',
            companyId: 'input#dokan-company-id-number',
            vatNumber: 'input#dokan-vat-number',
            bankName: 'input#dokan-bank-name',
            bankIban: 'input#dokan-bank-iban',
            phone: 'input#shop-phone',
            subscriptionPack: '#dokan-subscription-pack',
            subscriptionPackOptions: '#dokan-subscription-pack option',
            // Register Button
            register: 'button.woocommerce-Button',
        },

        // Vendor Setup Wizard
        vSetup: {
            // Intro
            setupLogo: 'h1#wc-logo',
            setupLogoImage: 'h1#wc-logo img',
            setupwizardContent: '//div[@class="wc-setup-content"]//div//p',
            letsGo: '.lets-go-btn',
            notRightNow: '.not-right-now-btn',

            // Store Setup
            street1: '#address\\[street_1\\]',
            street2: '#address\\[street_2\\]',
            city: '#address\\[city\\]',
            zipCode: '#address\\[zip\\]',
            country: '#select2-addresscountry-container',
            countryInput: '//input[@class="select2-search__field" and @aria-owns="select2-addresscountry-results"]',
            state: '#select2-calc_shipping_state-container',
            // state: '//span[@id="select2-calc_shipping_state-container"]/..//span[@class="select2-selection__arrow"]',
            stateInput: '//input[@class="select2-search__field" and @aria-owns="select2-calc_shipping_state-results"]',
            // state: '#calc_shipping_state',
            storeCategories: '//select[contains(@id,"dokan_store_categories")]/..//span[@class="select2-selection select2-selection--multiple"]',
            storeCategoriesInput: '//input[@class="select2-search__field" and @aria-owns="select2-dokan_store_categories-results"]',
            highlightedResult: '.select2-results__option.select2-results__option--highlighted',
            selectedStoreCategories: '//select[contains(@id,"dokan_store_categories")]/..//li[@class="select2-selection__choice"]',
            map: 'input#dokan-map-add',
            mapResultFirst: '(//ul//li[@class="ui-menu-item"]//div[@class="ui-menu-item-wrapper"])[1]',
            mapResultByName: (location: string) => `//li[@class="ui-menu-item"]//div[contains(text(), "${location}")],`, // New York, NY, USA
            email: '//input[@id="show_email"]/..//label',
            continueStoreSetup: '.store-step-continue',
            skipTheStepStoreSetup: '.store-step-skip-btn',

            // Payment Setup
            // Paypal
            paypal: '//input[@name="settings[paypal][email]"]',
            // Bank
            bankAccountName: '#ac_name',
            bankAccountType: '#ac_type',
            bankRoutingNumber: '//input[@name="settings[bank][routing_number]"]',
            bankAccountNumber: '//input[@name="settings[bank][ac_number]"]',
            bankName: '//input[@name="settings[bank][bank_name]"]',
            bankAddress: '//textarea[@name="settings[bank][bank_addr]"]',
            bankIban: '//input[@name="settings[bank][iban]"]',
            bankSwiftCode: '//input[@name="settings[bank][swift]"]',
            declaration: '#declaration',
            // Custom Payment Method
            customPayment: '//input[@name="settings[dokan_custom][value]"]',
            // Paypal Marketplace
            paypalMarketplace: '#vendor_paypal_email_address',
            paypalMarketplaceSigUp: '.vendor_paypal_connect',
            // Stripe
            ConnectWithStripe: '.dokan-stripe-connect-link',
            // Skrill
            skrill: '//input[@name="settings[skrill][email]"]',
            // Continue from Payment Setup
            continuePaymentSetup: '.payment-continue-btn',
            skipTheStepPaymentSetup: '.payment-step-skip-btn',

            // Last Step
            goToStoreDashboard: '.wc-setup-actions.step .button',
            returnToMarketplace: '.wc-return-to-dashboard',
        },

        // Vendor Dashboard
        vDashboard: {
            dokanAlert: '.dokan-alert.dokan-alert-warning',

            // Dashboard Menus
            menuParent: '#dokan-navigation ul.dokan-dashboard-menu',
            menus: {
                menuByText: (menu: string) => `//div[@id='dokan-navigation']//ul//li//a[contains(text(), "${menu}")]`,
                dashboard: 'ul.dokan-dashboard-menu li.dashboard a',
                products: 'ul.dokan-dashboard-menu li.products a',
                orders: 'ul.dokan-dashboard-menu li.orders a',
                userSubscriptions: 'ul.dokan-dashboard-menu li.user-subscription a',
                requestQuotes: 'ul.dokan-dashboard-menu li.requested-quotes a',
                coupons: 'ul.dokan-dashboard-menu li.coupons a',
                reports: 'ul.dokan-dashboard-menu li.reports a',
                deliveryTime: 'ul.dokan-dashboard-menu li.delivery-time-dashboard a',
                reviews: 'ul.dokan-dashboard-menu li.reviews a',
                withdraw: 'ul.dokan-dashboard-menu li.withdraw a',
                reverseWithdrawal: 'ul.dokan-dashboard-menu li.reverse-withdrawal a',
                badges: 'ul.dokan-dashboard-menu li.seller-badge a',
                productQA: 'ul.dokan-dashboard-menu li.product-questions-answers a',
                returnRequest: 'ul.dokan-dashboard-menu li.return-request a',
                staff: 'ul.dokan-dashboard-menu li.staffs a',
                followers: 'ul.dokan-dashboard-menu li.followers a',
                booking: 'ul.dokan-dashboard-menu li.booking a',
                announcements: 'ul.dokan-dashboard-menu li.announcement a',
                analytics: 'ul.dokan-dashboard-menu li.analytics a',
                tools: 'ul.dokan-dashboard-menu li.tools a',
                auction: 'ul.dokan-dashboard-menu li.auction a',
                support: 'ul.dokan-dashboard-menu li.support a',
                settings: 'ul.dokan-dashboard-menu li.settings a',
                visitStore: '//i[@class="fas fa-external-link-alt"]/..',
                editAccount: '.fa-user',

                //submenus
                store: '.submenu-item.store',
                addons: '.submenu-item.product-addon',
                payment: '.submenu-item.payment',
                verification: '.submenu-item.verification',
                shipping: '.submenu-item.shipping',
                shipStation: '.submenu-item.shipstation',
                social: '.submenu-item.social',
                rma: '.submenu-item.rma',
                seo: '.submenu-item.seo',
            },

            // profile Progress
            profileProgress: {
                profileProgressDiv: '.dokan-profile-completeness',
                dokanProgressBar: '.dokan-progress',
                dokanProgressBarText: '.dokan-progress-bar',
                nextStep: '.dokan-alert.dokan-alert-info.dokan-panel-alert',
            },

            // At a Glance
            atAGlance: {
                atAGlanceDiv: '.dashboard-widget.big-counter',

                netSalesTitle: '//div[normalize-space()="Net Sales"]',
                earningTitle: '//div[normalize-space()="Earning"]',
                pageviewTitle: '//div[normalize-space()="Pageview"]',
                orderTitle: '//div[normalize-space()="Order"]',

                salesValue: '//div[@class="title" and contains(text(), "Net Sales")]/..//div[@class="count"]',
                earningValue: '//div[@class="title" and contains(text(), "Earning")]/..//div[@class="count"]',
                pageViewValue: '//div[@class="title" and contains(text(), "Pageview")]/..//div[@class="count"]',
                orderValue: '//div[@class="title" and contains(text(), "Order")]/..//div[@class="count"]',
            },

            // sells graph
            graph: {
                graphDiv: '.dashboard-widget.sells-graph',
                widgetTitle: '.sells-graph .widget-title',
                chart: '.chart-container',
            },

            // orders
            orders: {
                ordersDiv: '.dashboard-widget.orders',
                widgetTitle: '.orders .widget-title',
                totalTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Total"]',
                completedTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Completed"]',
                pendingTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Pending"]',
                processingTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Processing"]',
                cancelledTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Cancelled"]',
                refundedTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Refunded"]',
                onholdTitle: '//div[@class="dashboard-widget orders"]//span[normalize-space()="On hold"]',

                totalValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Total"]/..//span[@class="count"]',
                completedValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Completed"]/..//span[@class="count"]',
                pendingValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Pending"]/..//span[@class="count"]',
                processingValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Processing"]/..//span[@class="count"]',
                cancelledValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Cancelled"]/..//span[@class="count"]',
                refundedValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="Refunded"]/..//span[@class="count"]',
                onholdValue: '//div[@class="dashboard-widget orders"]//span[normalize-space()="On hold"]/..//span[@class="count"]',

                pieChart: '#order-stats',
            },

            // reviews
            reviews: {
                reviewsDiv: '.dashboard-widget.reviews',
                widgetTitle: '.reviews .widget-title',
                allTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="All"]',
                pendingTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Pending"]',
                spamTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Spam"]',
                trashTitle: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Trash"]',

                allValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="All"]/..//span[@class="count"]',
                pendingValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Pending"]/..//span[@class="count"]',
                spamValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Spam"]/..//span[@class="count"]',
                trashValue: '//div[@class="dashboard-widget reviews"]//span[normalize-space()="Trash"]/..//span[@class="count"]',
            },

            // products
            products: {
                productsDiv: '.dashboard-widget.products',
                addNewProduct: '//a[normalize-space()="+ Add new product"]',
                widgetTitle: '.products .widget-title',
                totalTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Total"]',
                liveTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Live"]',
                offlineTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Offline"]',
                pendingReviewTitle: '//div[@class="dashboard-widget products"]//span[normalize-space()="Pending Review"]',

                totalValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Total"]/..//span[@class="count"]',
                liveValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Live"]/..//span[@class="count"]',
                offlineValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Offline"]/..//span[@class="count"]',
                pendingReviewValue: '//div[@class="dashboard-widget products"]//span[normalize-space()="Pending Review"]/..//span[@class="count"]',
            },

            // announcement
            announcement: {
                announcementDiv: '.dashboard-widget.dokan-announcement-widget',
                widgetTitle: '.dokan-announcement-widget .widget-title',
                seeAll: '//a[normalize-space()="See All"]',

                // announcementContent: '.dokan-dashboard-announce-content',
                // announcementDate: '.dokan-dashboard-announce-date',
            },
        },

        // Products
        product: {
            // Menus
            menus: {
                all: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"All")]',
                online: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Online")]',
                draft: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Draft")]',
                pendingReview: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Pending Review")]',
                inStock: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"In stock")]',
            },

            // Import Export Product
            importExport: {
                import: '//span[@class="dokan-add-product-link"]//a[contains(text(),"Import")]',
                export: '//span[@class="dokan-add-product-link"]//a[contains(text(),"Export")]',
            },

            // Filter
            filters: {
                filterByDate: 'select#filter-by-date',
                filterByCategory: 'select#product_cat',
                filterByType: 'select#filter-by-type', // simple, variable, external, grouped, subscription, variable-subscription
                filterByOther: '//select[@name="filter_by_other"]', // featured, top_rated, best_selling
                filter: '//button[normalize-space()="Filter"]',
                reset: '//a[normalize-space()="Reset"]',
            },

            // Search product
            search: {
                searchInput: 'input[placeholder="Search Products"]',
                searchBtn: 'button[name="product_listing_search"]',
            },

            // Bulk Action
            bulkActions: {
                selectAll: '#cb-select-all',
                selectAction: '#bulk-product-action-selector', // edit, delete, publish
                applyAction: '#bulk-product-action',
            },

            // Table
            table: {
                productTable: '#dokan-product-list-table',
                imageColumn: '//th[normalize-space()="Image"]',
                nameColumn: '//th[normalize-space()="Name"]',
                statusColumn: '//th[normalize-space()="Status"]',
                productAdvertisementColumn: '//th[@class="product-advertisement-th"]',
                skuColumn: '//th[normalize-space()="SKU"]',
                stockColumn: '//th[normalize-space()="Stock"]',
                priceColumn: '//th[normalize-space()="Price"]',
                typeColumn: '//th[normalize-space()="Type"]',
                viewsColumn: '//th[normalize-space()="Views"]',
                dateColumn: '//th[normalize-space()="Date"]',
            },

            // Product Sub Options
            numberOfRowsFound: '#dokan-product-list-table tbody tr',
            productCell: (productName: string) => `//strong//a[contains(text(),'${productName}')]/../..`,
            productLink: (productName: string) => `//strong//a[contains(text(),'${productName}')]`,
            editProduct: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="edit"]//a`,
            buyAdvertisement: (productName: string) => `//a[contains(text(),'${productName}')]/../../..//td[@class="product-advertisement-td"]//span`,
            advertisementStatus: (productName: string) => `//a[contains(text(),'${productName}')]/../../..//td[@class="product-advertisement-td"]//i[contains(@class,'fa fa-circle')]`,
            permanentlyDelete: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="delete"]//a`,
            view: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="view"]//a`,
            quickEdit: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="item-inline-edit"]//a`,
            duplicate: (productName: string) => `//a[contains(text(),'${productName}')]/../..//span[@class="duplicate"]//a`,

            // Create Product
            create: {
                closeCreateProductPopup: 'a.iziModal-button-close', // todo: need to update, everywhere
                addNewProduct: 'span.dokan-add-product-link .dokan-btn.dokan-btn-theme:first-child',
                productPopup: '#dokan-add-product-popup',
                productName: '//input[@name="post_title"]',
                productImage: '.dokan-feat-image-btn',
                productAddGalleryImage: '.fa-plus',
                productPrice: '#_regular_price',
                productDiscountedPrice: '#_sale_price',
                productDiscountedPriceSchedule: '.sale_schedule',
                productScheduleFrom: '.dokan-start-date',
                productScheduleTo: '.dokan-end-date',
                productScheduleCancel: '.cancel_sale_schedule.dokan-hide',
                productTags: '.select2-search__field',
                productDescription: 'textarea[placeholder="Enter some short description about this product..."]',
                createProduct: '#dokan-create-new-product-btn',
                createAndNewProduct: '#dokan-create-and-add-new-product-btn',
            },

            // category
            category: {
                productCategoryModalOnProductPopup: '#dokan-add-new-product-form  #dokan-category-open-modal',
                productCategoryModal: '.dokan-select-product-category.dokan-category-open-modal',
                productCategory: '#select2-product_cat-container',
                productCategorySearchInput: '#dokan-single-cat-search-input',
                productCategorySearchResult: '#dokan-cat-search-res-ul li',
                searchedResultText: '.dokan-cat-search-res-item',
                productCategoryDone: '#dokan-single-cat-select-btn',
                productCategoryAlreadySelectedPopup: '.swal2-confirm',
                productCategoryModalClose: '#dokan-category-close-modal',
                productCategoryValues: '.select2-results ul li',
            },

            // Edit Product
            edit: {
                productEditContainer: '.product-edit-new-container.product-edit-container',

                viewProduct: '.dokan-right .dokan-btn',
                title: '#post_title',

                // Permalink
                permalinkEdit: '.edit-slug',
                confirmPermalinkEdit: '.cancel',
                cancelPermalinkEdit: '.save',

                // Image
                addProductImage: '.dokan-feat-image-btn',
                uploadedProductImage: '.image-wrap img',
                removeProductImage: '.close.dokan-remove-feat-image',
                addGalleryImage: '.fa-plus',
                uploadGalleryImage: '#dokan-product-images .image',
                removeGalleryImage: '.action-delete',

                // Product Type
                productType: '#product_type',
                downloadable: '#\\_downloadable',
                virtual: '#\\_virtual',
                price: '#\\_regular_price',
                discountedPrice: '#\\_sale_price',
                discountedPriceSchedule: '.sale_schedule',
                scheduleFrom: '.dokan-start-date',
                scheduleTo: '.dokan-end-date',
                scheduleCancel: '.cancel_sale_schedule',
                category: '#select2-product_cat-container',
                tags: '.select2-search__field',

                // External Product
                productUrl: '#\\_product_url',
                buttonText: '#\\_button_text',

                // Simple Subscription
                subscriptionPrice: '#\\_subscription_price',
                subscriptionPeriodInterval: '#\\_subscription_period_interval',
                subscriptionPeriod: '#\\_subscription_period',
                expireAfter: '#\\_subscription_length',
                signUpFee: '#\\_subscription_sign_up_fee',
                subscriptionTrialLength: '#\\_subscription_trial_length',
                subscriptionTrialPeriod: '#\\_subscription_trial_period',
            },
            // Short Description
            shortDescription: {
                shortDescriptionIframe: '.dokan-product-short-description iframe',
                shortDescriptionHtmlBody: '#tinymce',
            },

            // Description
            description: {
                descriptionIframe: '.dokan-product-description iframe',
                descriptionHtmlBody: '#tinymce',
            },

            // Inventory
            inventory: {
                sku: '#\\_sku',
                stockStatus: '#\\_stock_status',
                enableProductStockManagement: '#\\_manage_stock',
                stockQuantity: '//input[@name="_stock"]',
                lowStockThreshold: '//input[@name="_low_stock_amount"]',
                allowBackOrders: '#\\_backorders',
                allowOnlyOneQuantityOfThisProductToBeBoughtInASingleOrder: '#\\_sold_individually',
            },

            // Downloadable options
            downloadableOptions: {
                addFile: 'a.insert-file-row.dokan-btn',
                addDownloadableFiles: '.insert',
                fileName: 'input[placeholder="File Name"]',
                fileUrl: 'input[placeholder="https://"]',
                chooseFile: 'a.upload_file_button',
                deleteFile: 'a.dokan-product-delete',
                downloadLimit: '#\\_download_limit',
                downloadExpiry: '#\\_download_expiry',
            },

            // Geolocation
            geolocation: {
                sameAsStore: '#\\_dokan_geolocation_use_store_settings',
                productLocation: '#\\_dokan_geolocation_product_location',
            },

            // Add-Ons
            addOns: {
                addField: '.wc-pao-add-field',
                type: '#wc-pao-addon-content-type-0',
                displayAs: '#wc-pao-addon-content-display-0',
                titleRequired: '#wc-pao-addon-content-name-0',
                formatTitle: '#wc-pao-addon-content-title-format',
                enableDescription: 'wc-pao-addon-description-enable-0',
                addDescription: '#wc-pao-addon-description-0',
                requiredField: '#wc-pao-addon-required-0',
                import: '.wc-pao-import-addons',
                export: '.wc-pao-export-addons',
                excludeAddons: '\\_product_addons_exclude_global',
                expandAll: '.wc-pao-expand-all',
                closeAll: '.wc-pao-close-all',

                // Add-Ons Option
                options: {
                    enterAnOption: '.wc-pao-addon-content-label > input',
                    optionPriceType: '.wc-pao-addon-option-price-type',
                    optionPrice: '.wc-pao-addon-content-price input',
                    addOption: '.wc-pao-add-option',
                    removeOptionCrossIcon: '.wc-pao-addon-content-remove > .button',
                    cancelRemoveOption: '.swal2-cancel',
                    okRemoveOption: '.swal2-confirm',
                },
            },

            // Shipping
            shipping: {
                shippingContainer: 'div.dokan-shipping-container.hide_if_virtual',
                thisProductRequiresShipping: '#\\_disable_shipping',
                weight: '#\\_weight',
                length: '#\\_length',
                width: '#\\_width',
                height: '#\\_height',
                shippingClass: '#product_shipping_class',
                shippingSettings: '.help-block > a',
            },

            // Tax
            tax: {
                taxStatus: '#\\_tax_status',
                taxClass: '#\\_tax_class',
            },

            // Linked Products
            linkedProduct: {
                upSells: '//label[contains(text(),"Upsells")]/..//input[@class="select2-search__field"]',
                crossSells: '//label[contains(text(),"Cross-sells ")]/..//input[@class="select2-search__field"]',
            },

            // Attribute
            attribute: {
                customProductAttribute: '#predefined_attribute',
                addAttribute: '.add_new_attribute',
                visibleOnTheProductPage: '//input[contains(@name, "attribute_visibility")]',
                usedForVariations: '//input[contains(@name, "attribute_variation")]',
                selectTerms: '.dokan-attribute-values .select2-search__field',
                selectAll: 'button.dokan-select-all-attributes',
                selectNone: 'button.dokan-select-no-attributes',
                addNew: 'button.dokan-add-new-attribute',
                removeAttribute: '.dokan-product-remove-attribute',
                confirmRemoveAttribute: '.swal2-confirm',
                cancelRemoveAttribute: '.swal2-cancel',
                saveAttributes: '.dokan-save-attribute',
                addVariations: '#field_to_edit',
                go: '.do_variation_action',
                confirmGo: '.swal2-confirm',
                okSuccessAlertGo: '.swal2-confirm',
                cancelGo: '.swal2-cancel.swal2-styled',
                variationPrice: '.swal2-input',
                okVariationPrice: '.swal2-confirm',
                cancelVariationPrice: '.swal2-cancel',
                saveVariationChanges: '.save-variation-changes',
                cancelVariationChanges: '.cancel-variation-changes',
                defaultAttribute: '.dokan-variation-default-select > .dokan-form-control',
            },

            // Discount Options
            discount: {
                enableBulkDiscount: 'input#\\_is_lot_discount',
                lotMinimumQuantity: 'input#\\_lot_discount_quantity',
                lotDiscountInPercentage: 'input#\\_lot_discount_amount',
            },

            // Rma Options
            rma: {
                overrideYourDefaultRmaSettingsForThisProduct: '#dokan_rma_product_override',
                label: '#dokan-rma-label',
                type: '#dokan-warranty-type',
                length: '#dokan-warranty-length',
                lengthValue: '//input[@name="warranty_length_value"]',
                lengthDuration: '#dokan-warranty-length-duration',
                refundReasonsFirst: '(//label[normalize-space()="Refund Reasons:"]/..//input)[1]',
                refundReasons: '//label[normalize-space()="Refund Reasons:"]/..//input',
                rmaPolicyIframe: '#wp-warranty_policy-wrap iframe',
                rmaPolicyHtmlBody: '#tinymce',
            },

            // Wholesale Options
            wholesale: {
                enableWholeSaleForThisProduct: '#wholesale\\[enable_wholesale\\]',
                wholesalePrice: '#dokan-wholesale-price',
                minimumQuantityForWholesale: '#dokan-wholesale-qty',
            },

            // Min-Max Options
            minMax: {
                enableMinMaxRulesThisProduct: 'input#product_wise_activation',
                minimumQuantity: 'input#min_quantity',
                maximumQuantity: 'input#max_quantity',
                minimumAmount: 'input#min_amount',
                maximumAmount: 'input#max_amount',
                orderRulesDoNotCount: '#\\_donot_count',
                categoryRulesExclude: '#ignore_from_cat',
            },

            // Other Options
            otherOptions: {
                productStatus: '#post_status',
                visibility: '#\\_visibility',
                purchaseNote: '#\\_purchase_note',
                enableProductReviews: '#\\_enable_reviews',
            },

            // Advertise Product
            advertisement: {
                advertiseThisProduct: '#dokan_advertise_single_product',
                confirmAdvertiseThisProduct: '.swal2-confirm',
                okSuccessAlertAdvertiseThisProduct: '.swal2-confirm',
                cancelAdvertiseThisProduct: '.swal2-cancel',
            },

            // catalog mode
            catalogMode: {
                removeAddToCart: '#catalog_mode_hide_add_to_cart_button',
                hideProductPrice: '#catalog_mode_hide_product_price',
            },

            // Save Product
            saveProduct: '.dokan-btn-lg',
            updatedSuccessMessage: '.dokan-message',

            quickEditProduct: {
                // title : (productName: string) => `//fieldset//input[contains(@value, "${productName}")]`,
                title: '(//tr[@class="dokan-product-list-inline-edit-form"]//input[@class="dokan-form-control"])[1]',
                update: '(//button[@type="button"][normalize-space()="Update"])[1]',
            },

            confirmAction: '.swal2-actions .swal2-confirm',
            cancelAction: '.swal2-actions .swal2-cancel',
            successMessage: '.swal2-actions .swal2-confirm',
            dokanMessage: '.dokan-message',
            dokanSuccessMessage: '.dokan-alert.dokan-alert-success strong',
        },

        // Orders
        orders: {
            // Menus
            menus: {
                all: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "All")]',
                completed: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Completed")]',
                processing: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Processing")]',
                onHold: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "On-hold")]',
                pending: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Pending")]',
                cancelled: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Cancelled")]',
                refunded: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Refunded")]',
                failed: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(), "Failed")]',
            },

            // Export Order
            export: {
                exportAll: '//input[@name="dokan_order_export_all"]',
                exportFiltered: '//input[@name="dokan_order_export_filtered"]',
            },

            // Filter
            filters: {
                filterByCustomer: {
                    dropDown: '.select2-selection .select2-selection__arrow',
                    input: '.select2-search__field',
                    searchedResult: '.select2-results__option--highlighted',
                },

                filterByDate: {
                    dateRangeInput: 'input#order_filter_date_range',
                    startDateInput: 'input#order_filter_start_date',
                    endDateInput: 'input#order_filter_end_date',
                },

                filter: '//button[normalize-space()="Filter"]',
                reset: '//a[normalize-space()="Reset"]',
            },

            search: {
                searchInput: '//input[@placeholder="Search Orders"]',
                searchBtn: '//button[normalize-space()="Filter"]',
            },

            // Bulk Actions
            bulkActions: {
                selectAll: '#cb-select-all',
                selectAction: '#bulk-order-action-selector', // wc-on-hold, wc-processing, wc-completed
                applyAction: '#bulk-order-action',
            },

            // Table
            table: {
                orderTable: '.dokan-table.dokan-table-striped',
                orderColumn: '//th[normalize-space()="Order"]',
                totalColumn: '//th[normalize-space()="Order Total"]',
                earningColumn: '//th[normalize-space()="Earning"]',
                statusColumn: '//th[normalize-space()="Status"]',
                customerColumn: '//th[normalize-space()="Customer"]',
                dateColumn: '//th[normalize-space()="Date"]',
                shipmentColumn: '//th[normalize-space()="Shipment"]',
                actionColumn: '//th[normalize-space()="Action"]',
            },

            numberOfRowsFound: '.dokan-table.dokan-table tbody tr',
            // Order Details from Table
            orderTotalTable: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-total']//bdi`,
            orderTotalAfterRefundTable: (orderNumber: string) => `///strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-total']//ins//bdi`,
            vendorEarningTable: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-earning']//span[@class="woocommerce-Price-amount amount"]`,
            orderStatusTable: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//td[@class='dokan-order-status']//span`,

            // Order Sub-Actions
            orderLink: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/..`,
            processing: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//a[@data-original-title='Processing']`,
            complete: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//a[@data-original-title='Complete']`,
            view: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//a[@data-original-title='View']`,

            // order details
            orderDetails: {
                orderNumber: '//strong[contains(text(),"Order#")]',
                orderDate: '//span[contains(text(),"Order Date:")]/..',
                orderTotal: '//td[contains(text(),"Order Total:")]/..//bdi',
                orderTotalBeforeRefund: '//td[contains(text(),"Order Total:")]/..//del',
                orderTotalAfterRefund: '//td[contains(text(),"Order Total:")]/..//ins//bdi',
                discount: '//td[contains(text(),"Discount")]/..//bdi',
                shippingMethod: '//tr[contains(@class,"shipping")]//td[@class="name"]//div[@class="view"]',
                shippingCost: '//td[contains(text(),"Shipping")]/..//bdi',
                tax: '//td[contains(text(),"Tax")]/..//bdi',
                refunded: '.total.refunded-total bdi',

                // todo: add lite order details locators
                // lite
                total: '//th[contains(text(),"Total:")]/..//td//span[@class="woocommerce-Price-amount amount"]',
            },

            // general details
            generalDetails: {
                generalDetailsDiv: '//strong[normalize-space()="General Details"]/../..',
                orderDetails: '.list-unstyled.order-status',
                customerDetails: '.list-unstyled.customer-details',
            },

            // status
            status: {
                currentOrderStatus: '.order-status .dokan-label',
                selectedOrderStatus: '//select[@id="order_status"]//option[@selected="selected"]',
                edit: '.dokan-edit-status',
                orderStatus: '#order_status', // wc-pending, wc-processing, wc-completed, wc-cancelled, wc-refunded, wc-failed, wc-checkout-draft
                updateOrderStatus: '//input[@name="dokan_change_status"]',
            },

            // Refund
            refund: {
                refundDiv: '#woocommerce-order-items',
                requestRefund: '.dokan-btn.refund-items',
                productQuantity: (productName: string) => `//td[@class='name' and @data-sort-value='${productName}']/..//td[@class='quantity']//div[@class="view"]`,
                productCost: (productName: string) => `//td[@class='name' and @data-sort-value='${productName}']/..//td[@class='line_cost']//div[@class="view"]`,
                productTax: (productName: string) => `//td[@class='name' and @data-sort-value='${productName}']/..//td[@class='line_tax']//div[@class="view"]`,
                refundProductQuantity: (productName: string) => `//td[@class='name' and @data-sort-value='${productName}']/..//td[@class='quantity']//div[@class='refund']//input`,
                refundProductCostAmount: (productName: string) => `//td[@class='name' and @data-sort-value='${productName}']/..//input[@class='refund_line_total wc_input_price']`,
                refundProductTaxAmount: (productName: string) => `//td[@class='name' and @data-sort-value='${productName}']/..//input[@class='refund_line_tax wc_input_price']`,
                shippingCost: '//tbody[@id="order_shipping_line_items"]//td[@class="line_cost"]//div[@class="view"]',
                shippingTax: '//tbody[@id="order_shipping_line_items"]//td[@class="line_tax"]//div[@class="view"]',
                refundShippingAmount: '//tbody[@id="order_shipping_line_items"]//td[@class="line_cost"]//input[@class="refund_line_total wc_input_price"]',
                refundShippingTaxAmount: '//tbody[@id="order_shipping_line_items"]//td[@class="line_tax"]//input[@class="refund_line_tax wc_input_price"]',

                refundReason: '#refund_reason',
                refundManually: '.dokan-btn.do-manual-refund',
                confirmRefund: '.swal2-confirm.swal2-styled.swal2-default-outline',
                refundRequestSuccessMessage: '#swal2-html-container',
                refundRequestSuccessMessageOk: '.swal2-confirm.swal2-styled.swal2-default-outline',
                cancelRefund: '.dokan-btn.cancel-action',
            },

            // add note
            orderNote: {
                orderNoteDiv: '//strong[normalize-space()="Order Notes"]/../..',
                orderNoteInput: '#add-note-content',
                orderNoteType: '#order_note_type', // Customer note, Private note
                addNote: 'input[value="Add Note"]',
            },

            // tracking number
            trackingDetails: {
                addTrackingNumber: '#dokan-add-tracking-number',
                shippingProvider: '#shipping_provider',
                trackingNumber: '#tracking_number',
                dateShipped: '#shipped-date',
                addTrackingDetails: '#add-tracking-details',
                cancelAddTrackingDetails: '#dokan-cancel-tracking-note',
            },

            // shipment
            shipment: {
                shipmentDiv: '//strong[normalize-space()="Shipments"]/../..',
                createNewShipment: '#create-tracking-status-action',
                shipmentOrderItem: (productName: string) => `//div[@id="dokan-order-shipping-status-tracking-panel"]//td//a[contains( text(),"${productName}")]/../..//input[@name="shipment_order_item_select"]`,
                shipmentOrderItemQty: (productName: string) => `//div[@id="dokan-order-shipping-status-tracking-panel"]//td//a[contains( text(),"${productName}")]/../..//input[@class="shipping_order_item_qty"]`,
                shippingStatus: '#shipping_status', // ss_delivered, ss_cancelled, ss_proceccing, ss_ready_for_pickup, ss_pickedup, ss_on_the_way
                shippingProvider: '#shipping_status_provider', // sp-dhl, sp-dpd, sp-fedex, sp-polish-shipping-providers, sp-ups, sp-usps, sp-other
                dateShipped: '#shipped_status_date',
                trackingNumber: '#tracking_status_number',
                comments: '#tracking_status_comments',
                notifyCustomer: '#shipped_status_is_notify',
                createShipment: '#add-tracking-status-details',
                cancelCreateShipment: '#cancel-tracking-status-details',
            },

            // downloadable product permission
            downloadableProductPermission: {
                downloadableProductPermissionDiv: '//strong[normalize-space()="Downloadable Product Permission"]/../..',
                downloadableProductInput: '.select2-search__field',
                grantAccess: '.grant_access',
                revokeAccess: '.revoke_access',
                confirmAction: '.swal2-actions .swal2-confirm',
                cancelAction: '.swal2-actions .swal2-cancel',
            },
        },

        // User Subscriptions
        vUserSubscriptions: {
            // Filter
            filters: {
                filterByCustomer: '//select[@id="dokan-filter-customer"]/..//span[@class="select2-selection__arrow"]',
                filterByCustomerInput: '.select2-search__field',
                filterByDate: 'input#order_date_filter',
                filter: '.dokan-btn',
                result: '.select2-results__option.select2-results__option--highlighted',
            },

            // table
            table: {
                table: '.dokan-user-subscription-content table',
                statusColumn: '//th[normalize-space()="Status"]',
                subscriptionColumn: '//th[normalize-space()="Subscription"]',
                itemColumn: '//th[normalize-space()="Item"]',
                totalColumn: '//th[normalize-space()="Total"]',
                startColumn: '//th[normalize-space()="Start"]',
                nextPaymentColumn: '//th[normalize-space()="Next Payment"]',
                endColumn: '//th[normalize-space()="End"]',
            },

            noSubscriptionsFound: '//div[@class="dokan-error" and contains(text(), "No subscription found")]',
            numberOfRowsFound: '.dokan-table.dokan-table tbody tr',

            // Edit Subscription
            subscription: 'td a strong',
            // Edit Subscription Order Status
            editSubscriptionOrderStatus: '.dokan-edit-status small',
            subscriptionOrderStatus: '#order_status',
            updateSubscriptionOrderStatus: '//input[@name="dokan_vps_change_status"]',
            cancelSubscriptionOrderStatus: '.dokan-btn-default',
            // Downloadable Product Permission
            chooseADownloadableProduct: '.select2-search__field',
            grantAccess: '.grant_access',
            downloadsRemaining: '.form-input',
            accessExpires: 'td .short ',
            removeAccess: '.revoke_access',
            confirmRemoveAccess: '.swal2-confirm',
            cancelRemoveAccess: '.swal2-cancel',
            // Subscription Schedule
            billingInterval: '#\\_billing_interval',
            billingPeriod: '#\\_billing_period',
            nextPayment: '#next_payment',
            nextPaymentHour: '#next_payment_hour',
            nextPaymentMinute: '#next_payment_minute',
            endDate: '#end',
            endDateHour: '#end_hour',
            endDateMinute: '#end_minute',
            updateSchedule: '//input[@name="dokan_change_subscription_schedule"]',
            // Subscription Notes
            addNoteContent: '#add-note-content',
            orderNoteType: '#order_note_type',
            addNote: '.btn',

            dokanError: '.dokan-error',
        },

        vRequestQuotes: {
            requestQuotesText: '//h3[normalize-space()="Request Quotes"]',
            noQuoteMessage: '//div[contains(@class, "woocommerce-message woocommerce-message--info")]',
            goToShop: '//a[normalize-space()="Go to shop"]',

            // table
            table: {
                quoteTable: 'table.my_account_quotes',
                quoteColumn: '//th[normalize-space()="Quote #"]',
                quoteNameColumn: '//th[normalize-space()="Quote Name"]',
                statusColumn: '//th[normalize-space()="Status"]',
                dateColumn: '//th[normalize-space()="Date"]',
                actionColumn: '//th[normalize-space()="Action"]',
            },

            viewQuoteDetails: (quoteTitle: string) => `//td[normalize-space()="${quoteTitle}"]/..//a[@class="woocommerce-button button view"]`,

            quoteDetails: {
                basicDetails: {
                    requestQuotesText: '//h3[normalize-space()="Request Quotes"]',

                    basicDetailsTable: '//table[contains(@class,"quote_details") and not(contains(@class,"cart"))]',
                    quoteNumberText: '//th[@class="quote-number"]',
                    customerNameText: '//th[@class="customer-name"]',
                    customerEmailText: '//th[@class="customer-email"]',
                    quoteDateText: '//th[@class="quote-date"]',
                    quoteStatusText: '//th[@class="quote-status"]',

                    quoteNumberValue: '//td[@class="quote-number"]',
                    customerNameValue: '//td[@class="customer-name"]',
                    customerEmailValue: '//td[@class="customer-email"]',
                    quoteDateValue: '//td[@class="quote-date"]',
                    quoteStatusValue: '//th[@class="quote-status"]/..//td',
                },

                quoteItemDetails: {
                    quoteDetailsText: '//h2[normalize-space()="Quote Details"]',

                    table: {
                        quoteDetailsTable: '//table[contains(@class,"quote_details") and contains(@class,"cart")]',
                        productColumn: '//th[@class="product-name"]',
                        priceColumn: '//th[normalize-space()="Price"]',
                        offeredPriceColumn: '//th[normalize-space()="Offered Price"]',
                        quantityColumn: '//th[@class="product-quantity"]',
                        subtotalColumn: '//th[normalize-space()="Subtotal"]',
                        offeredSubtotalColumn: '//th[normalize-space()="Offered Subtotal"]',
                    },
                },

                quoteTotals: {
                    quoteTotalsTitle: '//h2[normalize-space()="Quote totals"]',
                    quoteTotalsDiv: '.cart_totals',
                    quoteTotalsTable: '//div[@class="cart_totals"]//table[contains(@class,"table_quote_totals")]',

                    subTotalText: '//tr[@class="cart-subtotal"]//th',
                    offeredPriceSubtotalText: '//tr[@class="cart-subtotal offered"]//th',

                    subTotalValue: '//td[@data-title="Subtotal (standard)"]',
                    offeredPriceSubtotalValue: '//td[@data-title="Offered Price Subtotal"]',
                },

                offeredPriceInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//input[@class="input-text offered-price-input text"]`,
                quantityInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//div[@class="quantity"]//input`,

                updateQuote: 'button[name="dokan_update_quote"]',
                approveThisQuote: 'button[name="approved_by_vendor_button"]',
                convertToOrder: 'button[name="dokan_convert_to_order_customer"]',

                message: '.woocommerce-message',
            },
        },

        // Coupons
        vCoupon: {
            couponText: '.dokan-dashboard-header .left-header-content .entry-title',

            // Menus
            menus: {
                myCoupons: '//a[normalize-space()="My Coupons"]',
                marketplaceCoupons: '//a[normalize-space()="Marketplace Coupons"]',
            },

            marketPlaceCoupon: {
                marketPlaceCoupon: '#marketplace-coupon',
                couponCell: (couponCode: string) => `//td[contains(@class, "coupon-code")]//span[contains(text(), "${couponCode}")]`,
            },

            // Table
            table: {
                couponsTable: '#vendor-own-coupon .dokan-table',
                codeColumn: '//th[normalize-space()="Code"]',
                couponTypeColumn: '//th[normalize-space()="Coupon type"]',
                couponAmountColumn: '//th[normalize-space()="Coupon amount"]',
                productIdsColumn: '//th[normalize-space()="Product IDs"]',
                usageOrLimitColumn: '//th[normalize-space()="Usage / Limit"]',
                expiryDateColumn: '//th[normalize-space()="Expiry date"]',
            },

            couponRow: (couponCode: string) => `//span[normalize-space()="${couponCode}"]/../../../../..`,
            couponCell: (couponCode: string) => `//span[normalize-space()="${couponCode}"]/../../../..`,
            couponLink: (couponCode: string) => `//span[normalize-space()="${couponCode}"]/..`,
            couponEdit: (couponCode: string) => `//span[normalize-space()="${couponCode}"]/../../../..//div[@class="row-actions"]//span[@class="edit"]`,
            couponDelete: (couponCode: string) => `//span[normalize-space()="${couponCode}"]/../../../..//div[@class="row-actions"]//span[@class="delete"]`,

            // Create Coupon
            addNewCoupon: '.dokan-btn',
            couponTitle: '#title',
            description: '#description',
            discountType: '#discount_type',
            amount: '#coupon_amount',
            emailRestrictions: '#email_restrictions',
            usageLimit: '#usage_limit',
            usageLimitPerUser: '#usage_limit_per_user',
            expireDate: '#dokan-expire',
            excludeSaleItems: '#checkboxes-2',
            minimumAmount: '#minium_ammount',
            product: '//label[contains(text(), "Product")]/..//input[@class="select2-search__field"]',
            selectAll: '.dokan-coupon-product-select-all',
            clear: '.dokan-coupon-product-clear-all',
            applyForNewProducts: '#apply_new_products',
            excludeProducts: '//label[contains(text(), "Exclude products")]/..//input[@class="select2-search__field"]',
            showOnStore: '#checkboxes-3',
            createCoupon: '.dokan-btn-danger',

            // Coupon Dashboard
            createdCoupon: '.coupon-code.column-primary strong span',
            couponSaveSuccessMessage: 'Coupon has been saved successfully!', // todo:  move all success message to test data
            couponUpdateSuccessMessage: 'Coupon has been updated successfully!',

            dokanMessage: '.dokan-message',

            // Coupon Error
            couponError: '.dokan-alert.dokan-alert-danger',
        },

        // Reports
        vReports: {
            reportsText: '//h1[normalize-space()="Reports"]',

            // Menus
            menus: {
                overview: '//ul[@class="dokan_tabs"]//a[contains(text(), "Overview")]',
                salesByDay: '//ul[@class="dokan_tabs"]//a[contains(text(), "Sales by day")]',
                topSelling: '//ul[@class="dokan_tabs"]//a[contains(text(), "Top selling")]',
                topEarning: '//ul[@class="dokan_tabs"]//a[contains(text(), "Top earning")]',
                statement: '//ul[@class="dokan_tabs"]//a[contains(text(), "Statement")]',
            },

            // chart
            chart: {
                legendDetails: '.dokan-reports-sidebar ul.chart-legend',
                chartDiv: 'div.chart-container',
                chartLegend: 'div.chart.chart-legend-container',
                chart: 'div.chart-placeholder.main',
            },

            // date picker
            datePicker: {
                dateRangePickerinput: 'input.dokan-daterangepicker',
                dateRangePickerFromInputHidden: 'input.dokan-daterangepicker-start-date',
                dateRangePickerToInputHidden: 'input.dokan-daterangepicker-end-date',
                show: 'input[value="Show"]',
            },

            topSelling: {
                // table
                table: {
                    topSellingTable: '.table.table-striped',
                    productColumn: '//th[normalize-space()="Product"]',
                    salesColumn: '//th[normalize-space()="Sales"]',
                },

                noProductsFound: '//td[normalize-space()="No products found in given range."]',
            },

            topEarning: {
                // table
                table: {
                    topEarningTable: '.table.table-striped',
                    productColumn: '//th[normalize-space()="Product"]',
                    salesColumn: '//th[normalize-space()="Sales"]',
                    earningColumn: '//th[normalize-space()="Earning"]',
                },

                noProductsFound: '//td[normalize-space()="No products found in given range."]',
            },

            statement: {
                exportStatements: '.dokan-right',

                // table
                table: {
                    statementsTable: '.table.table-striped',
                    balanceDateColumn: '//th[normalize-space()="Balance Date"]',
                    trnDateColumn: '//th[normalize-space()="Trn Date"]',
                    idColumn: '//th[normalize-space()="ID"]',
                    typeColumn: '//th[normalize-space()="Type"]',
                    debitColumn: '//th[normalize-space()="Debit"]',
                    creditColumn: '//th[normalize-space()="Credit"]',
                    balanceColumn: '//th[normalize-space()="Balance"]',
                },

                noStatementsFound: '//td[normalize-space()="No Result found!"]',
            },
        },

        // Deliverytime
        vDeliveryTime: {
            deliveryTimeAndStorePickup: '//h1[normalize-space()="Delivery Time & Store Pickup"]',

            // Filter
            filter: {
                deliveryTimeFilter: '#delivery-type-filter', // delivery, store-pickup
                filter: '//button[normalize-space()="Filter"]',
            },

            // calendar Navigation
            navigation: {
                month: '.fc-dayGridMonth-button',
                week: '.fc-timeGridWeek-button',
                day: '.fc-timeGridDay-button',
                list: '.fc-listWeek-button',
                today: '.fc-today-button',
                previous: '.fc-prev-button',
                next: '.fc-next-button',
            },

            deliveryTimeCalender: 'div#delivery-time-calendar',
        },

        // Review
        vReviews: {
            reviewsText: '//h1[normalize-space()="Reviews"]',

            // Menus
            menus: {
                approved: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Approved")]',
                pending: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Pending")]',
                spam: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Spam")]',
                trash: '//div[@id="dokan-comments_menu"]//a[contains(text(), "Trash")]',
            },

            // Bulk Action
            bulkActions: {
                selectAll: '.dokan-check-all',
                selectAction: 'select[name="comment_status"]', // none, hold, spam, trash, approve, delete
                applyAction: 'input[value="Apply"]',
            },

            // table
            table: {
                table: '#dokan-comments-table',
                authorColumn: '//th[normalize-space()="Author"]',
                commentColumn: '//th[normalize-space()="Comment"]',
                linkToColumn: '//th[normalize-space()="Link To"]',
                ratingColumn: '//th[normalize-space()="Rating"]',
            },

            noReviewsFound: '//td[normalize-space()="No Results Found"]',
            numberOfRowsFound: '.dokan-reviews-content tbody tr',

            // Review Actions
            reviewRow: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/../..`,
            reviewMessageCell: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..`,
            unApproveReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//ul[@class='dokan-cmt-row-actions']//a[contains(text(),'Unapprove')]`,
            approveReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//ul[@class='dokan-cmt-row-actions']//a[contains(text(),'Approve')]`,
            spamReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//ul[@class='dokan-cmt-row-actions']//a[contains(text(),'Spam')]`,
            trashReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//ul[@class='dokan-cmt-row-actions']//a[contains(text(),'Trash')]`,
            restoreReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//ul[@class='dokan-cmt-row-actions']//a[contains(text(),'Restore')]`,
            permanentlyDeleteReview: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/..//ul[@class='dokan-cmt-row-actions']//a[contains(text(),'Delete Permanently')]`,
            reviewLink: (reviewMessage: string) => `//div[contains(text(),'${reviewMessage}')]/../..//td[@class="col-link"]//a`,
            viewReview: '//a[contains(text(),"View Comment")]',

            reviewDetails: {
                reviewer: 'strong.woocommerce-review__author',
                reviewPublishDate: 'time.woocommerce-review__published-date',
                reviewMessage: '.comment-text .description p',
                rating: '#reviews div.star-rating',
                reviewMessageByMessage: (reviewMessage: string) => `//div[@class="description"]//p[contains(text(), '${reviewMessage}')]`,
            },
        },

        // Withdraw
        vWithdraw: {
            withdrawText: '.dokan-dashboard-content.dokan-withdraw-content h1',

            // balance
            balance: {
                balanceDiv: '//strong[normalize-space()="Balance"]/../..',
                balancePro: '//p[contains(text(),"Your Balance:")]//a//span[@class="woocommerce-Price-amount amount"]',
                balanceLite: '//p[contains(text(),"Your Balance:")]//strong[1]',
                minimumWithdrawAmount: '//p[contains(text(),"Your Balance:")]//strong[2]',
            },

            // payment details
            paymentDetails: {
                manual: {
                    paymentDetailsDiv: '//strong[normalize-space()="Payment Details"]/../..',
                    lastPaymentSection: '//strong[normalize-space()="Last Payment"]/..',
                },
                schedule: {
                    ScheduleSection: '//input[@id="dokan-schedule-enabler-switch"]/../../..',
                },
            },

            // withdraw payment methods
            withdrawPaymentMethods: {
                paymentMethodsDiv: '#dokan-withdraw-payment-method-list',
                paymentMethods: '#dokan-withdraw-payment-method-list .dokan-panel-inner-container',
                makeMethodDefault: (methodName: string) => `//div[@id='dokan-withdraw-payment-method-list']//strong[contains( text(), '${methodName}')]/../..//button[contains(@class, 'dokan-btn')]`,
                setupMethod: (methodName: string) => `//strong[contains( text(), '${methodName}')]/../..//a[@class='dokan-btn']`,
                defaultMethod: (methodName: string) => `//div[@id='dokan-withdraw-payment-method-list']//strong[contains( text(), '${methodName}')]/../..//button[contains(@class, 'dokan-btn-default')]`,
                defaultPaymentMethodUpdateSuccessMessage: 'Default method update successful.',
            },

            // view payments
            viewPayments: {
                viewPayments: '#dokan-withdraw-display-requests-button',

                menus: {
                    pendingRequests: '//ul[contains(@class,"subsubsub")]//a[contains(text(), "Pending Requests")]',
                    approvedRequests: '//ul[contains(@class,"subsubsub")]//a[contains(text(), "Approved Requests")]',
                    cancelledRequests: '//ul[contains(@class,"subsubsub")]//a[contains(text(), "Cancelled Requests")]',
                },

                requestWithdraw: '#dokan-request-withdraw-button',
                withdrawDashboard: '.dokan-add-product-link a',

                table: {
                    withdrawTable: '.dokan-table.dokan-table-striped',
                    amountColumn: '//th[normalize-space()="Amount"]',
                    methodColumn: '//th[normalize-space()="Method"]',
                    dateColumn: '//th[normalize-space()="Date"]',
                    cancelColumn: '//th[normalize-space()="Cancel"]',
                    statusColumn: '//th[normalize-space()="Status"]',
                },

                noRowsFound: '//td[normalize-space()="No pending withdraw request"]',
            },

            // Manual Withdraw Request
            manualWithdrawRequest: {
                requestWithdraw: '#dokan-request-withdraw-button',
                closeModal: '.iziModal-button-close',
                withdrawAmount: '#withdraw-amount',
                withdrawMethod: '#withdraw-method',
                submitRequest: '#dokan-withdraw-request-submit',
                withdrawRequestSaveSuccessMessage: 'Withdraw request successful.',
                cancelWithdrawRequestSuccess: '.dokan-alert.dokan-alert-success',
                cancelWithdrawRequestSaveSuccessMessage: 'Your request has been cancelled successfully!',
                cancelRequest: '//strong[normalize-space()="Pending Requests"]/..//a[normalize-space()="Cancel"]',
                pendingRequest: '//strong[normalize-space()="Pending Requests"]',
                pendingRequestAlert: '.dokan-alert.dokan-alert-danger',
                pendingRequestAlertMessage: 'You already have pending withdraw request(s). Please submit your request after approval or cancellation of your previous request.',
            },

            // Auto withdraw Disbursement Schedule
            autoWithdrawDisbursement: {
                enableSchedule: '//input[@id="dokan-schedule-enabler-switch"]/..',
                editSchedule: '#dokan-withdraw-display-schedule-popup',
                closeModal: '.mfp-close', // todo: need to update, everywhere
                preferredPaymentMethod: '#preferred-payment-method',
                preferredSchedule: (schedule: string) => `#withdraw-schedule-${schedule}\\>`,
                onlyWhenBalanceIs: '#minimum-withdraw-amount',
                maintainAReserveBalance: '#withdraw-remaining-amount',
                changeSchedule: '#dokan-withdraw-schedule-request-submit',
                scheduleMessage: '//div[@class="dokan-switch-container"]/..//p',
                dokanBottomPopup: '#swal2-html-container', // todo:  make it global and use to assert every popup massage frontend
                withdrawScheduleSaveSuccessMessage: 'Withdraw schedule changed successfully.',
            },
        },

        // badges
        vBadges: {
            badgesText: '#dokan-seller-badge .entry-title',

            description: '//p[contains(text(), "Vendors with a good selling history on our marketplace are identified by seller badges")]',

            search: '#post-search-input',

            // filters
            filterBadges: '.tablenav.top .actions select', // all, my_badges, available_badges

            // table
            table: {
                table: '#dokan-seller-badge table',
                acquiredBadgeColumn: 'thead th[class="column badge_logo"]',
                descriptionColumn: 'thead th[class="column badge_description"]',
                actionColumn: 'thead th[class="column badge_view"]',
            },

            sellerBadgeCell: (name: string) => `//strong[contains(text(),'${name}')]/../..`,
            numberOfBadgesFound: '.tablenav.top .displaying-num',

            congratsModal: {
                closeModal: '.modal-close.modal-close-link',
                sellerBadgeModal: '.seller-badge-modal .seller-badge-modal-content',
                modalBody: '.modal-body',
                congratsMessage: '//div[@class="modal-title"]//h2[contains(text(), "Congratulations!")]',
                acquiredBadges: '//div[@class="modal-sub-title"]//h3[contains(text(), "Acquired Badge & Level:")]',
            },
        },

        // product question and answeres
        vProductQA: {
            productQuestionAnswersText: '.dokan-dashboard-header h1.entry-title',

            // filters
            filters: {
                filterByProducts: '.dokan-product-qa-filter-form span.select2-selection__arrow',
                filterInput: '.select2-search.select2-search--dropdown .select2-search__field',
                result: 'li.select2-results__option.select2-results__option--highlighted',
                filter: 'input[value="Filter"]',
                reset: '.dokan-product-qa-filter-form a',
            },

            // table
            table: {
                table: '.product-qa-listing-table',
                questionColumn: '//th[normalize-space()="Question"]',
                productsColumn: '//th[normalize-space()="Products"]',
                dateColumn: '//th[normalize-space()="Date"]',
                actionColumn: '//th[normalize-space()="Action"]',
            },

            noQuestionFound: '//td[contains(text(), "No question found.")]',
            questionLink: (question: string) => `//a[contains(.,'${question}')]`,
            firstQuestionLink: '(//table[contains(@class,"product-qa-listing-table")]//tbody//tr//a)[1]',
            questionCell: (question: string) => `//a[contains(.,'${question}')]/..`,
            questionDetailsView: (question: string) => `//a[contains(.,'${question}')]/../..//a[@data-original-title='View']`,

            questionDetails: {
                questionDetails: {
                    questionDetailsDiv: '.dokan-product-qa-single-left-content .dokan-panel',
                    questionDetailsTitle: '//div[normalize-space()="Question Details"]',
                    ProductTitle: '//strong[text()="Product:"]',
                    QuestionerTitle: '//strong[text()="Questioner:"]',
                    QuestionTitle: '//strong[text()="Question:"]',

                    ProductValue: '//strong[text()="Product:"]/../..//td[2]',
                    QuestionerValue: '//strong[text()="Questioner:"]/../..//td[2]',
                    QuestionValue: '//strong[text()="Question:"]/../..//td[2]',
                },

                status: {
                    statusDiv: '.dokan-product-qa-single-right-content .dokan-panel',
                    statusTitle: '//div[normalize-space()="Status"]',
                    statusDetails: '.dokan-product-qa-single-right-content .dokan-panel .dokan-panel-body p',

                    deleteQuestion: 'button.dokan-product-qa-delete-question',
                },

                answer: {
                    answerDiv: '//div[normalize-space()="Answer"]/..',
                    answerTitle: '//div[normalize-space()="Answer"]',

                    addMedia: 'button#insert-media-button',
                    visualButton: 'button#dokan-product-qa-answer-tmce',
                    textButton: 'button#dokan-product-qa-answer-html',

                    questionAnswerIframe: 'iframe#dokan-product-qa-answer_ifr',
                    questionAnswerHtmlBody: '#tinymce',
                    saveAnswer: 'button#dokan_product_qa_save_answer',
                },

                editAnswer: 'button#dokan_product_qa_edit_answer',
                answerDetails: 'div.details-value p',
                deleteAnswer: 'button#dokan_product_qa_delete_answer',
                confirmAction: '.swal2-actions .swal2-confirm',
                answerSaveSuccessMessage: '//div[text()="Answer saved successfully."]',
                answerDeleteSuccessMessage: '//div[text()="Answer deleted successfully."]',
                questionDeleteSuccessMessage: '//div[text()="Question deleted successfully."]',
            },
        },

        // reverse withdrawal
        vReverseWithdrawal: {
            reverseWithdrawalText: '//h1[normalize-space()="Reverse Withdrawal"]',

            reverseWithdrawalNotice: {
                noticeDiv: 'div.dokan-alert.dokan-alert-danger',
                noticeText: 'div.dokan-alert.dokan-alert-danger strong',
            },

            reverseBalanceSection: {
                reverseBalanceSection: 'div.reverse-balance-section',
                reversePayBalance: 'div.reverse-balance',
                reversePayBalanceAmount: 'div.reverse-balance .woocommerce-Price-amount.amount',
                reverseThreshold: 'div.reverse-threshold',
                reverseThresholdAmount: 'div.reverse-threshold .woocommerce-Price-amount.amount',
            },

            payNow: 'input#reverse_pay',
            confirmAction: '.swal2-actions .swal2-confirm',

            filters: {
                dateRangeInput: 'input#trn_date_filter',
                startDateInput: 'input#trn_date_form_filter_alt',
                endDateInput: 'input#trn_date_to_filter_alt',
                filter: '//input[@value="Filter"]',
            },

            table: {
                reverseWithdrawalTable: '.dokan-table.dokan-table-striped',
                transactionIdColumn: '//th[normalize-space()="Transaction ID"]',
                dateColumn: '//th[normalize-space()="Date"]',
                transactionTypeColumn: '//th[normalize-space()="Transaction Type"]',
                noteColumn: '//th[normalize-space()="Note"]',
                debitColumn: '//th[normalize-space()="Debit"]',
                creditColumn: '//th[normalize-space()="Credit"]',
                balanceColumn: '//th[normalize-space()="Balance"]',
            },

            noRowsFound: '//td[normalize-space()="No transactions found!"]',
            numberOfRowsFound: '.dokan-table.dokan-table-striped tbody tr',
            openingBalanceRow: '//td[normalize-space()="Opening Balance"]/..',
            totalBalanceRow: '//b[normalize-space()="Balance:"]/../..',
        },

        // Return Request
        vReturnRequest: {
            // Menus
            menus: {
                all: '//ul[contains(@class,"request-statuses-filter")]//a[contains(text(),"All")]',
                new: '//ul[contains(@class,"request-statuses-filter")]//a[contains(text(),"New")]',
                completed: '//ul[contains(@class,"request-statuses-filter")]//a[contains(text(),"Completed")]',
                processing: '//ul[contains(@class,"request-statuses-filter")]//a[contains(text(),"Processing")]',
            },

            // table
            table: {
                table: '.rma-request-listing-table',
                detailsColumn: '//th[normalize-space()="Details"]',
                productsColumn: '//th[normalize-space()="Products"]',
                typeColumn: '//th[normalize-space()="Type"]',
                statusColumn: '//th[normalize-space()="Status"]',
                lastUpdatedColumn: '//th[normalize-space()="Last Updated"]',
            },

            noRowsFound: '//td[normalize-space()="No request found"]',
            numberOfRowsFound: '.rma-request-listing-table tbody tr',

            // Refund Request table Actions
            returnRequestCell: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../..`,
            manage: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../..//a[@class='request-manage']`,
            delete: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../..//a[@class='request-delete']`,
            view: (orderNumber: string) => `//strong[contains(text(),'Order ${orderNumber}')]/../../..//i[@class='far fa-eye']`,

            // return request details
            returnRequestDetails: {
                backToList: '.left-header-content a',

                basicDetails: {
                    basicDetails: '//div[normalize-space()="Details"]/..',
                    orderId: '//strong[normalize-space()="Order ID :"]',
                    customerName: '//strong[normalize-space()="Customer Name :"]',
                    requestType: '//strong[normalize-space()="Request Type :"]',
                    products: '//strong[normalize-space()="Products :"]',
                },

                additionalDetails: {
                    additionalDetailsDiv: '.additional-details',
                    reason: '//p[normalize-space()="Reason"]/..//p[@class="details-value"]',
                    reasonDetails: '//p[normalize-space()="Reason Details"]/..//p[@class="details-value"]',
                },

                // status
                status: {
                    statusDiv: '//div[normalize-space()="Status"]/..',
                    lastUpdated: '//strong[normalize-space()="Last Updated"]',
                    changeStatus: 'select#status', // new, processing, completed, rejected, reviewing
                    update: '//input[@value="Update"]',
                    sendRefund: '.dokan-send-refund-request',
                },

                // conversations
                conversations: {
                    conversationsDiv: '//div[normalize-space()="Conversations"]/..',
                    message: '#message',
                    sendMessage: 'input[name="dokan_rma_send_message"]',
                },

                modal: {
                    taxRefundColumn: '//div[@class="iziModal-content"]//th[contains(text(),"Tax Refund")]',
                    subTotalRefundColumn: '//div[@class="iziModal-content"]//th[contains(text(),"Subtotal Refund")]',

                    taxAmount: (productName: string) => `(//a[contains(text(),'${productName}')]/../..//bdi)[1]`,
                    subTotal: (productName: string) => `(//a[contains(text(),'${productName}')]/../..//bdi)[2]`,
                    taxRefund: (productName: string) => `//div[@class="iziModal-content"]//td//a[contains(text(),'${productName}')]/../..//input[contains(@name,"refund_tax")]`,
                    subTotalRefund: (productName: string) => `//div[@class="iziModal-content"]//td//a[contains(text(),'${productName}')]/../..//input[contains(@name,"refund_amount")]`,

                    sendRequest: '//div[@class="iziModal-content"]//input[@name="dokan_refund_submit"]',
                    sendRequestSuccessMessage: '.dokan-alert.dokan-alert-info',
                },
            },
        },

        // Staff
        vStaff: {
            staffText: '.dokan-staffs-content h1',

            // Table
            table: {
                vendorStaffTable: '.dokan-table.dokan-table-striped.vendor-staff-table',
                nameColumn: '//th[normalize-space()="Name"]',
                emailColumn: '//th[normalize-space()="Email"]',
                phoneColumn: '//th[normalize-space()="Phone"]',
                registeredDateColumn: '//th[normalize-space()="Registered Date"]',
            },

            noRowsFound: '//div[@class ="dokan-error" and normalize-space()="No staff found"]',
            staffCell: (staffName: string) => `//td//a[contains(text(),"${staffName}")]/..`,

            // Add Staff
            addStaff: {
                addNewStaff: '.dokan-btn',
                firstName: '#first_name',
                lastName: '#last_name',
                email: '#email',
                phone: '#phone',
                createStaff: '.dokan-btn',

                dokanAlert: '.dokan-alert-danger',
                userAlreadyExists: '//strong[normalize-space()="Sorry, that username already exists!"]',
            },

            // Edit Staff
            editStaff: {
                editStaff: (staffName: string) => `//a[contains(text(), "${staffName}")]/..//span[@class="edit"]//a`,
                password: '#reg_password',
                updateStaff: '//input[@name="staff_creation"]',
            },

            deleteStaff: {
                deleteStaff: (staffName: string) => `//a[contains(text(), "${staffName}")]/..//span[@class="delete"]//a`,
                okDelete: '.swal2-confirm',
                cancelDelete: '.swal2-cancel',
                deleteSuccessMessage: '.dokan-alert.dokan-alert-success',
            },

            // Manage Permission
            managePermission: {
                managePermission: (staffName: string) => `//a[contains(text(), "${staffName}")]/..//span[@class="permission"]//a`,

                // Overview
                overview: {
                    viewSalesOverview: '#dokan_view_sales_overview',
                    viewSalesReportChart: '#dokan_view_sales_report_chart',
                    viewAnnouncement: '#dokan_view_announcement',
                    viewOrderReport: '#dokan_view_order_report',
                    viewReviewReport: '#dokan_view_review_reports',
                    viewProductStatusReport: '#dokan_view_product_status_report',
                },

                // Order
                order: {
                    viewOrder: '#dokan_view_order',
                    manageOrder: '#dokan_manage_order',
                    manageOrderNote: '#dokan_manage_order_note',
                    manageRefund: '#dokan_manage_refund',
                    exportOrder: '#dokan_export_order',
                },

                // Review
                review: {
                    viewReviews: '#dokan_view_reviews',
                    manageReviews: '#dokan_manage_reviews',
                },

                // Product
                product: {
                    addProduct: '#dokan_add_product',
                    editProduct: '#dokan_edit_product',
                    deleteProduct: '#dokan_delete_product',
                    viewProduct: '#dokan_view_product',
                    duplicateProduct: '#dokan_duplicate_product',
                    importProduct: '#dokan_import_product',
                    exportProduct: '#dokan_export_product',
                },

                // Booking
                booking: {
                    manageBookingProducts: '#dokan_manage_booking_products',
                    manageBookingCalendar: '#dokan_manage_booking_calendar',
                    manageBookings: '#dokan_manage_bookings',
                    manageBookingResource: '#dokan_manage_booking_resource',
                    addBookingProduct: '#dokan_add_booking_product',
                    editBookingProduct: '#dokan_edit_booking_product',
                    deleteBookingProduct: '#dokan_delete_booking_product',
                },

                // Store Support
                storeSupport: {
                    manageSupportTicket: '#dokan_manage_support_tickets',
                },

                // Report
                report: {
                    viewOverviewReport: '#dokan_view_overview_report',
                    viewDailySalesReport: '#dokan_view_daily_sale_report',
                    viewTopSellingReport: '#dokan_view_top_selling_report',
                    viewTopEarningReport: '#dokan_view_top_earning_report',
                    viewStatementReport: '#dokan_view_statement_report',
                },

                // Coupon
                coupon: {
                    addCoupon: '#dokan_add_coupon',
                    editCoupon: '#dokan_edit_coupon',
                    deleteCoupon: '#dokan_delete_coupon',
                },

                // Withdraw
                withdraw: {
                    manageWithdraw: '#dokan_manage_withdraw',
                },

                // Menu
                menu: {
                    viewOverviewMenu: '#dokan_view_overview_menu',
                    viewProductMenu: '#dokan_view_product_menu',
                    viewOrderMenu: '#dokan_view_order_menu',
                    viewCouponMenu: '#dokan_view_coupon_menu',
                    viewReportMenu: '#dokan_view_report_menu',
                    viewReviewMenu: '#dokan_view_review_menu',
                    viewWithdrawMenu: '#dokan_view_withdraw_menu',
                    viewStoreSettingsMenu: '#dokan_view_store_settings_menu',
                    viewPaymentSettingsMenu: '#dokan_view_store_payment_menu',
                    viewShippingSettingsMenu: '#dokan_view_store_shipping_menu',
                    viewSocialSettingsMenu: '#dokan_view_store_social_menu',
                    viewSeoSettingsMenu: '#dokan_view_store_seo_menu',
                    // viewBookingMenu:'#dokan_view_booking_menu', // todo:  add booking check
                    viewToolsMenu: '#dokan_view_tools_menu',
                    // viewAuctionMenu:'#dokan_view_auction_menu', // todo:  add auction check
                    viewVerificationSettingsMenu: '#dokan_view_store_verification_menu',
                },

                // Auction
                auction: {
                    addAuctionProduct: '#dokan_add_auction_product',
                    editAuctionProduct: '#dokan_edit_auction_product',
                    deleteAuctionProduct: '#dokan_delete_auction_product',
                },

                updateStaffPermission: '.dokan-btn',
            },
        },

        vFollowers: {
            storeFollowersText: '//h1[normalize-space()="Store Followers"]',

            table: {
                followersTable: '.dokan-table.dokan-table-striped.product-listing-table.dokan-inline-editable-table',
                nameColumn: '//th[normalize-space()="Name"]',
                followedAtColumn: '//th[normalize-space()="Followed At"]',
            },

            noRowsFound: '//td[normalize-space()="Your store does not have any follower."]',
            numberOfRowsFound: 'table.dokan-table tbody tr',
        },

        // Booking
        vBooking: {
            allBookingProductText: '.dokan-dashboard-content h1',

            addNewBookingProduct: '//a[contains(text(),"Add New Booking Product")]',
            addBookingBtn: '//a[normalize-space()="Add Booking"]',

            // Menus
            menus: {
                allBookingProduct: '//ul[@class="dokan_tabs"]//a[contains(text(),"All Booking Product")]',
                manageBookings: '//ul[@class="dokan_tabs"]//a[contains(text(),"Manage Bookings")]',
                calendar: '//ul[@class="dokan_tabs"]//a[contains(text(),"Calendar")]',
                manageResources: '//ul[@class="dokan_tabs"]//a[contains(text(),"Manage Resources")]',
            },

            // Filter
            filters: {
                filterByDate: '#filter-by-date',
                filterByCategory: '#product_cat',
                filterByOther: 'select[name="filter_by_other"]',
                filter: '//button[normalize-space()="Filter"]',
            },

            // Search product
            search: {
                searchInput: 'input[name="product_search_name"]',
                search: 'button[name="product_listing_search"]',
            },

            // table
            table: {
                table: 'table.dokan-table.product-listing-table',
                imageColumn: '//th[normalize-space()="Image"]',
                nameColumn: '//th[normalize-space()="Name"]',
                statusColumn: '//th[normalize-space()="Status"]',
                skuColumn: '//th[normalize-space()="SKU"]',
                stockColumn: '//th[normalize-space()="Stock"]',
                priceColumn: '//th[normalize-space()="Price"]',
                typeColumn: '//th[normalize-space()="Type"]',
                viewsColumn: '//th[normalize-space()="Views"]',
                dateColumn: '//th[normalize-space()="Date"]',
            },

            noProductFound: '//td[normalize-space()="No product found"]',
            numberOfRowsFound: '.product-listing-table tbody tr',
            productCell: (name: string) => `//p//a[normalize-space()="${name}"]/../..`,
            edit: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="edit"]`,
            permanentlyDelete: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="delete"]`,
            duplicate: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="duplicate"]`,
            view: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="view"]`,

            confirmDelete: '.swal2-confirm',
            cancelDelete: '.swal2-cancel',
            dokanSuccessMessage: '.dokan-alert.dokan-alert-success strong',

            // Create Booking Product
            booking: {
                viewProduct: '.view-product',
                productName: '#post_title',
                ProductImage: '.dokan-feat-image-btn',
                virtual: '#\\_virtual',
                accommodationBooking: '#\\_is_dokan_accommodation',
                productCategory: '#select2-product_cat-container',
                productCategoryInput: '.select2-search--dropdown > .select2-search__field',
                tags: '.select2-search__field',

                // Accommodation Booking Options
                minimumNumberOfNightsAllowedInABooking: '#\\_wc_booking_min_duration',
                maximumNumberOfNightsAllowedInABooking: '#\\_wc_booking_max_duration',
                checkInTime: '#\\_dokan_accommodation_checkin_time',
                checkOutTime: '#\\_dokan_accommodation_checkout_time',

                // General Booking Options
                bookingDurationType: '#\\_wc_booking_duration_type',
                bookingDuration: 'input#\\_wc_booking_duration',
                bookingDurationMin: 'input#\\_wc_booking_min_duration',
                bookingDurationMax: 'input#\\_wc_booking_max_duration',
                bookingDurationUnit: '#\\_wc_booking_duration_unit',

                calendarDisplayMode: '#\\_wc_booking_calendar_display_mode',

                // Checkboxes
                enableCalendarRangePicker: '#\\_wc_booking_enable_range_picker',
                requiresConfirmation: '#\\_wc_booking_requires_confirmation',
                canBeCancelled: '#\\_wc_booking_user_can_cancel',
                bookingCanBeCancelledLimit: '#\\_wc_booking_cancel_limit',
                bookingCanBeCancelledLimitUnit: '#\\_wc_booking_cancel_limit_unit',

                // Shipping
                thisProductRequiresShipping: '#\\_disable_shipping',
                weight: '#\\_weight',
                length: '#\\_length',
                width: '#\\_width',
                height: '#\\_height',
                shippingClass: '#product_shipping_class',
                shippingSettings: '.help-block > a',

                // Tax
                taxStatus: '#\\_tax_status',
                taxClass: '#\\_tax_class',

                // Availability
                maxBookingsPerBlock: '#\\_wc_booking_qty',
                minimumBookingWindowIntoTheFutureDate: '#\\_wc_booking_min_date',
                minimumBookingWindowIntoTheFutureDateUnit: '#\\_wc_booking_min_date_unit',
                maximumBookingWindowIntoTheFutureDate: '#\\_wc_booking_max_date',
                maximumBookingWindowIntoTheFutureDateUnit: '#\\_wc_booking_max_date_unit',
                requireABufferPeriodOfMonthsBetweenBookings: '#\\_wc_booking_buffer_period',
                adjacentBuffering: '#\\_wc_booking_apply_adjacent_buffer',
                allDatesAre: '#\\_wc_booking_default_date_availability',
                checkRulesAgainst: '#\\_wc_booking_check_availability_against',
                restrictStartAndEndDays: '#dokan_booking_has_restricted_days_field',
                sunday: '#\\_wc_booking_restricted_days\\[0\\]',
                monday: '#\\_wc_booking_restricted_days\\[1\\]',
                tuesday: '#\\_wc_booking_restricted_days\\[2\\]',
                wednesday: '#\\_wc_booking_restricted_days\\[3\\]',
                thursday: '#\\_wc_booking_restricted_days\\[4\\]',
                friday: '#\\_wc_booking_restricted_days\\[5\\]',
                saturday: '#\\_wc_booking_restricted_days\\[6\\]',

                // Setavailabilityrange
                addRangeAvailability: '//div[@id="bookings_availability"]//a[contains(text(),"Add Range")]',
                rangeTypeAbility: '.wc_booking_availability_type > select',
                rangeFromAbility: '.from_date > .date-picker ',
                rangeToAbility: '.to_date > .date-picker ',
                bookableAbility: '//select[@name="wc_booking_availability_bookable[]"]',
                priorityAbility: '.priority > input',
                cancelAbility: '#availability_rows .remove',

                // Costs
                baseCost: '#\\_wc_booking_cost',
                blockCost: '#\\_wc_booking_block_cost',
                displayCost: '#\\_wc_display_cost',

                // Cost-range
                addRangeCost: 'dokan-booking-range-table > tfoot .button',
                rangeTypeCostRange: '.wc_booking_pricing_type > select',
                rangeFromCostRange: '.from_date > .date-picker',
                rangeToCostRange: '.to_date > .date-picker ',
                baseCostModifier: '//select[@name="wc_booking_pricing_base_cost_modifier[]"]',
                baseCostRange: '//input[@name="wc_booking_pricing_base_cost[]"]',
                blockCostModifier: '//select[@name="wc_booking_pricing_cost_modifier[]"]',
                blockCostRange: '//input[@name="wc_booking_pricing_cost[]"]',
                cancelCostRange: '#pricing_rows .remove',

                // Extra Options

                // Has Persons
                hasPersons: '#\\_wc_booking_has_persons',
                minPersons: '#\\_wc_booking_min_persons_group',
                maxPersons: '#\\_wc_booking_max_persons_group',
                multiplyAllCostsByPersonCount: '#\\_wc_booking_person_cost_multiplier',
                countPersonsAsBookings: '#\\_wc_booking_person_qty_multiplier',
                enablePersonTypes: '#\\_wc_booking_has_person_types',

                // Add Person
                addPersonType: '.add_person',
                personTypeName: '//label[contains(text(),"Person Type Name:")]/..//input',
                personBaseCost: '//label[contains(text(),"Base Cost:")]/..//input',
                personBlockCost: '//label[contains(text(),"Block Cost:")]/..//input',
                description: '.person_description',
                min: '//label[contains(text(),"Min:")]/..//input',
                max: '//label[contains(text(),"Max:")]/..//input',
                unlink: '.unlink_booking_person', // invokes default js alert

                // Has Resources
                hasResources: '#\\_wc_booking_has_resources',

                // Add Resource
                label: '#\\_wc_booking_resource_label',
                resourcesAre: '#\\_wc_booking_resources_assignment',
                addResourceId: '.add_resource_id',
                addResource: '.add_resource',
                resourceBaseCost: '//label[contains(text(),"Base Cost:")]/..//input',
                resourceBlockCost: '//label[contains(text(),"Block Cost:")]/..//input',
                removeResource: '.remove_booking_resource.button', // invokes default js alert

                // Short Description
                shortDescriptionIframe: '.dokan-product-short-description iframe',
                shortDescriptionHtmlBody: '#tinymce',

                // Description
                descriptionIframe: '.dokan-auction-post-content iframe',
                descriptionHtmlBody: '#tinymce',

                // Inventory
                sku: '#\\_sku',
                stockStatus: '#\\_stock_status',
                enableProductStockManagement: '#\\_manage_stock',
                stockQuantity: '//input[@name="_stock"]',
                lowStockThreshold: '//input[@name="_low_stock_amount"]',
                allowBackOrders: '#\\_backorders',
                allowOnlyOneQuantityOfThisProductToBeBoughtInASingleOrder: '#\\_sold_individually',

                // Geolocation
                sameAsStore: '#\\_dokan_geolocation_use_store_settings',
                productLocation: '#\\_dokan_geolocation_product_location',

                // add-ons
                addField: '.wc-pao-add-field',
                type: '#wc-pao-addon-content-type-0',
                displayAs: '#wc-pao-addon-content-display-0',
                titleRequired: '#wc-pao-addon-content-name-0',
                formatTitle: '#wc-pao-addon-content-title-format',
                enableDescription: 'wc-pao-addon-description-enable-0',
                addDescription: '#wc-pao-addon-description-0',
                requiredField: '#wc-pao-addon-required-0',
                bookingsMultiplyCostByPersonCount: '#addon_wc_booking_person_qty_multiplier_0',
                bookingsMultiplyCostByBlockCount: '#addon_wc_booking_block_qty_multiplier_0',
                import: '.wc-pao-import-addons',
                export: '.wc-pao-export-addons',
                excludeAddons: '#\\_product_addons_exclude_global',
                expandAll: '.wc-pao-expand-all',
                closeAll: '.wc-pao-close-all',

                // Add-Ons Option
                enterAnOption: '.wc-pao-addon-content-label > input',
                optionPriceType: '.wc-pao-addon-option-price-type',
                optionPrice: '.wc-pao-addon-content-price input',
                addOption: '.wc-pao-add-option',
                removeOptionCrossIcon: '.wc-pao-addon-content-remove > .button',
                cancelRemoveOption: '.swal2-cancel',
                okRemoveOption: '.swal2-confirm',

                // Other Options
                productStatus: '#post_status',
                visibility: '#\\_visibility',
                purchaseNote: '#\\_purchase_note',
                enableProductReviews: '#\\_enable_reviews',

                // Save Product
                saveProduct: '.dokan-btn-lg',
            },

            viewBooking: {
                productImage: '.woocommerce-product-gallery__image--placeholder img.wp-post-image',
                productName: '.product_title.entry-title',
                price: '.summary .price .woocommerce-Price-amount.amount',
                bookingCalendar: 'div#wc-bookings-booking-form',
                bookNow: '.single_add_to_cart_button',
                getSupport: '.dokan-store-support-btn',
            },

            // Add Booking
            addBooking: {
                selectCustomerDropdown: '//span[@id="select2-customer_id-container"]/..//span[@class="select2-selection__arrow"]',
                selectCustomerInput: '.select2-search__field',
                searchedResult: '.select2-results__option.select2-results__option--highlighted',
                selectABookableProductDropdown: '//span[@id="select2-bookable_product_id-container"]/..//span[@class="select2-selection__arrow"]',
                selectABookableProduct: (productName: string) => `//li[contains(@class,"select2-results__option") and contains(text(), '${productName}')]`,

                createANewCorrespondingOrderForThisNewBooking: '//input[@name="booking_order" and @value="new"]',
                assignThisBookingToAnExistingOrderWithThisId: '//input[@name="booking_order" and @value="existing"]',
                bookingOrderId: '.text',
                dontCreateAnOrderForThisBooking: '//label[normalize-space()="Don"t create an order for this booking."]/..//input',
                next: '.button-primary',
                selectCalendarDay: (month: number, day: number) => `//td[@title="This date is available" and @ data-month="${month}"]//a[@data-date="${day}"]`,

                addBooking: 'input[value="Add Booking"][type="submit"]',

                successMessage: '.woocommerce-message',
            },

            // Manage Booking
            manageBookings: {
                manageBookingsText: '//h1[normalize-space()="Manage Bookings"]',

                // Menus
                menus: {
                    all: '//ul[contains(@class,"order-statuses-filter")]//a[contains(text(),"All")]',
                    unPaid: '//ul[contains(@class,"order-statuses-filter")]//span[contains(text(),"Un-paid")]/..',
                    paidAndConfirmed: '//ul[contains(@class,"order-statuses-filter")]//span[contains(text(),"Paid & Confirmed")]/..',
                    completed: '//ul[contains(@class,"order-statuses-filter")]//span[contains(text(),"Complete")]/..',
                },

                noBookingsFound: '//div[normalize-space()="No Bookings found"]',

                view: '.dokan-btn',
                editBookingStatus: '.dokan-edit-status',
                selectOrderStatus: '#booking_order_status',
                UpdateOrderStatus: '.dokan-btn-success',
                cancelUpdateOrderStatus: 'dokan-btn-default',
            },

            // calendar
            calendar: {
                calendarText: '//h1[normalize-space()="Calendar"]',
                calendar: '.wc_bookings_calendar_form',

                filterBookings: '#calendar-bookings-filter',

                month: {
                    month: '//select[@name="calendar_month"]',
                    year: '//select[@name="calendar_year"]',
                    // previous: '.prev',
                    // next: '.next',
                    dayView: '.day',
                },

                day: {
                    calendarDay: '//input[@placeholder="yyyy-mm-dd"]',
                    monthView: '.month',
                },
            },

            // Manage Resources
            manageResources: {
                manageResourcesText: '.dokan-dashboard-content h1',

                addNewResource: '.dokan-btn.dokan-right',

                // table
                table: {
                    table: 'table.dokan-table.product-listing-table',
                    nameColumn: '//th[normalize-space()="Name"]',
                    parentColumn: '//th[normalize-space()="Parent"]',
                },

                noResourceFound: '//td[normalize-space()="No Resource found"]',

                resource: {
                    resourceName: '.swal2-input',
                    cancelAddNewResource: '.swal2-cancel',
                    confirmAddNewResource: '.swal2-confirm',
                    resourceRow: (resourceName: string) => `//a[contains(text(),'${resourceName}')]/../..`,
                    resourceCell: (resourceName: string) => `//a[contains(text(),'${resourceName}')]/..`,
                    editResource: (resourceName: string) => `//a[contains(text(),'${resourceName}')]/../..//a[contains(text(),'Edit')]`,
                    deleteResource: (resourceName: string) => `//a[contains(text(),'${resourceName}')]/../..//button[contains(text(),'Remove')]`,

                    // Edit Resource
                    resourceTitle: '#post_title',
                    availableQuantity: '#\\_wc_booking_qty',
                    rangeTypeResource: '.wc_booking_availability_type > select',
                    rangeFromResource: '.from_date > .date-picker',
                    rangeToResource: '.to_date > .date-picker ',
                    bookableResource: '//select[contains(@name,"wc_booking_availability_type")]',
                    priorityResource: '.priority > input',
                    addRangeResource: '.button',
                    saveResource: '.dokan-btn-lg',
                },
            },
        },

        // Analytics
        vAnalytics: {
            analyticsText: '//h1[normalize-space()="Analytics"]',

            // Menus
            menus: {
                general: '//a[normalize-space()="General"]',
                topPages: '//a[normalize-space()="Top pages"]',
                location: '//a[normalize-space()="Location"]',
                system: '//a[normalize-space()="System"]',
                promotions: '//a[normalize-space()="Promotions"]',
                keyword: '//a[normalize-space()="Keyword"]',
            },

            datePicker: {
                dateRangePickerinput: 'input.dokan-daterangepicker',
                dateRangePickerFromInputHidden: 'input.dokan-daterangepicker-start-date',
                dateRangePickerToInputHidden: 'input.dokan-daterangepicker-end-date',
                show: 'input[value="Show"]',
            },

            noAnalyticsFound: '//div[@class="tab-pane active" and normalize-space()="There is no analytics found for your store."]',
        },

        // Announcements
        vAnnouncement: {
            announcementText: '.dokan-notice-listing h1',

            announcementDiv: '.dokan-announcement-wrapper-item',
            announcementDate: '.dokan-annnouncement-date',
            announcementHeading: '.dokan-announcement-heading',
            announcementContent: '.dokan-announcement-content',
            removeAnnouncement: '.remove_announcement',

            announcementLink: (title: string) => `//div[@class="dokan-announcement-heading"]//h3[contains(text(),"${title}")]/..`,
            firstAnnouncementLink: (title: string) => `(//div[@class="dokan-announcement-heading"]//h3[contains(text(),"${title}")]/..)[1]`,
            deleteAnnouncement: (title: string) => `//div[@class="dokan-announcement-heading"]//h3[contains(text(),"${title}")]/../../../..//a[@class="remove_announcement"]`,
            confirmDeleteAnnouncement: '.swal2-confirm',
            cancelDeleteAnnouncement: '.swal2-cancel',

            // announcement details
            announcement: {
                title: '.dokan-notice-single-notice-area .entry-title',
                date: '.dokan-single-announcement-date',
                content: '.dokan-notice-single-notice-area .entry-content',
                backToAllNotice: '//a[normalize-space()="Back to all Notice"]',
            },
        },

        // Tools
        vTools: {
            toolsText: '//h1[normalize-space()="Tools"]',

            // Menus
            menus: {
                import: '//ul[@class="dokan_tabs"]//a[contains(text(),"Import")]',
                export: '//ul[@class="dokan_tabs"]//a[contains(text(),"Export")]',
            },

            // Import
            import: {
                // xml
                xml: {
                    importXmlText: '//h1[normalize-space()="Import XML"]',
                    chooseXmlFile: '//div[@id="import"]//input[@name="import"]',
                    xml: '//input[@value="Import"]',
                    completionMessage: '//p[contains(text(), "All done.")]',
                },

                // csv
                csv: {
                    importCsvText: '//h1[normalize-space()="Import CSV"]',
                    csv: '#import > .dokan-btn',

                    chooseCsv: '#upload',
                    updateExistingProducts: '#woocommerce-importer-update-existing',
                    continue: '.button',
                    runTheImporter: '.button',
                    viewImportLog: '.woocommerce-importer-done-view-errors',
                    viewProducts: '.button',
                    completionMessage: '.woocommerce-importer-done',
                },
            },

            // Export
            export: {
                // xml
                xml: {
                    exportXmlText: '//h1[normalize-space()="Export XML"]',
                    all: '#export_all',
                    product: '#export_product',
                    variation: '#export_variation_product',
                    exportXml: '//input[@value="Export"]',
                },

                // csv
                csv: {
                    exportCsvText: '//h1[normalize-space()="Export CSV"]',
                    exportCsv: '#export > .dokan-btn',
                    whichColumns: '//label[normalize-space()="Which columns should be exported?"]/../..//input[@class="select2-search__field"]',
                    whichProductTypes: '//label[normalize-space()="Which product types should be exported?"]/../..//input[@class="select2-search__field"]',
                    customMeta: '#woocommerce-exporter-meta',
                    generateCsv: '.woocommerce-exporter-button',
                },
            },
        },

        // Auction
        vAuction: {
            // Menus
            menus: {
                all: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"All")]',
                online: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"Online")]',
                pendingReview: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"Pending Review")]',
                draft: '//ul[contains(@class,"dokan-listing-filter")]//a[contains(text(),"Draft")]',
            },

            addNewActionProduct: '.dokan-add-product-link .dokan-btn-theme',
            actionsActivity: '.button-ml .dokan-btn',

            // Filter
            filters: {
                dateRange: 'input#auction_date_range',
                filter: '//button[normalize-space()="Filter"]',
                filterReset: '//a[normalize-space()="Reset"]',
            },

            // Search
            search: 'input[name ="search"]',

            // table
            table: {
                table: 'table.dokan-table.product-listing-table',
                imageColumn: '//th[normalize-space()="Image"]',
                nameColumn: '//th[normalize-space()="Name"]',
                statusColumn: '//th[normalize-space()="Status"]',
                sKUColumn: '//th[normalize-space()="SKU"]',
                stockColumn: '//th[normalize-space()="Stock"]',
                priceColumn: '//th[normalize-space()="Price"]',
                typeColumn: '//th[normalize-space()="Type"]',
                viewsColumn: '//th[normalize-space()="Views"]',
                dateColumn: '//th[normalize-space()="Date"]',
            },

            noAuctionsFound: '//td[normalize-space()="No product found"]',
            productCell: (name: string) => `//a[normalize-space()="${name}"]/../..`,
            edit: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="edit"]`,
            permanentlyDelete: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="delete"]`,
            view: (name: string) => `//a[normalize-space()="${name}"]/../..//span[@class="view"]`,

            confirmDelete: '.swal2-confirm',
            cancelDelete: '.swal2-cancel',
            dokanSuccessMessage: '.dokan-alert.dokan-alert-success',

            // Create Auction Product
            auction: {
                // basic info
                productName: '.dokan-auction-post-title input[name="post_title"]',
                productShortDescription: '#post_excerpt',
                ProductImage: '.dokan-feat-image-btn',
                uploadProductImage: '#\\__wp-uploader-id-1',
                addGalleryImage: '.fa-plus',
                uploadGalleryImage: '#\\__wp-uploader-id-4',
                category: 'select2-product_cat-container',
                categoryValues: '.select2-results ul li',
                productTag: '.select2-search__field',
                downloadable: '#\\_downloadable',
                virtual: '#\\_virtual',

                // General Options
                itemCondition: '#\\_auction_item_condition',
                auctionType: '#\\_auction_type',
                enableProxyBiddingForThisAuctionProduct: '.dokan-form-group > .checkbox > label',
                startPrice: '#\\_auction_start_price',
                bidIncrement: '#\\_auction_bid_increment',
                reservedPrice: '#\\_auction_reserved_price',
                buyItNowPrice: '#\\_regular_price',
                auctionStartDate: '#\\_auction_dates_from',
                auctionEndDate: '#\\_auction_dates_to',
                enableAutomaticRelistingForThisAuction: '#\\_auction_automatic_relist',
                relistIfFailAfterNHours: '#\\_auction_relist_fail_time',
                relistIfNotPaidAfterNHours: '#\\_auction_relist_not_paid_time',
                relistAuctionDurationInH: '#\\_auction_relist_duration',

                // Shipping
                thisProductRequiresShipping: '#\\_disable_shipping',
                weight: '#\\_weight',
                length: '#\\_length',
                width: '#\\_width',
                height: '#\\_height',
                shippingClass: '#product_shipping_class',
                shippingSettings: '.help-block a',

                // Tax
                taxStatus: '#\\_tax_status',
                taxClass: '#\\_tax_class',

                // Short Description
                shortDescription: '#post-excerpt',

                // Description
                productDescriptionIframe: '.dokan-auction-post-content iframe',
                productDescriptionHtmlBody: '#tinymce',

                // Add Auction
                addAuctionProduct: '//input[@name="update_auction_product"]',
                updateAuctionProduct: '//input[@name="update_auction_product"]',
            },

            viewAuction: {
                productImage: '.woocommerce-product-gallery__image--placeholder img.wp-post-image',
                productName: '.product_title.entry-title',
                startingOrCurrentBid: '.summary .auction-price .amount',
                itemCondition: '.curent-bid',
                auctionTime: '#countdown.auction-time',
                auctionEnd: '.auction-end',
                reversePriceStatus: '.reserve.hold',

                noBidOption: '//div[@class="woocommerce-info" and contains(text(), "You are not allowed to bid your own product.")]',
                bidQuantity: 'div.quantity.buttons_added',
                bidButton: '.bid_button',
                buyNow: '.single_add_to_cart_button',
                getSupport: '.dokan-store-support-btn',

                auctionHistoryTab: '#tab-title-simle_auction_history',
            },

            // Auction Activity
            actionActivity: {
                actionActivityText: '//h1[contains(text(), "Auctions Activity")]',
                backToActions: '//a[normalize-space()="Auctions"]',

                // Filter
                filters: {
                    filterByDate: {
                        dateRangeInput: 'input#auction-activity-datetime-range',
                        startDateInput: 'input#_auction_dates_from',
                        endDateInput: 'input#_auction_dates_to',
                    },

                    filter: 'button[name="auction_activity_date_filter"]',
                    filterReset: 'button#auction-clear-filter-button',
                },

                // Search
                search: {
                    searchInput: 'input[name="auction_activity_search"]',
                    search: '.search-box .dokan-btn',
                },

                // table
                table: {
                    table: 'table.dokan-table.product-listing-table',
                    auctionColumn: '//th[normalize-space()="Auction"]',
                    userNameColumn: '//th[normalize-space()="User Name"]',
                    userEmailColumn: '//th[normalize-space()="User Email"]',
                    bidColumn: '//th[normalize-space()="Bid"]',
                    dateColumn: '//th[normalize-space()="Date"]',
                    proxyColumn: '//th[normalize-space()="Proxy"]',
                },

                noActivityFound: '//td[normalize-space()="No Auctions Activity Found!"]',
                numOfRowsFound: '.dokan-table.product-listing-table tbody tr',
            },
        },

        // Support
        vSupport: {
            // Menus
            menus: {
                allTickets: '//ul[contains(@class,"dokan-support-topic-counts")]//a[contains(text(), "All Tickets")]',
                openTickets: '//ul[contains(@class,"dokan-support-topic-counts")]//a[contains(text(), "Open Tickets")]',
                closedTickets: '//ul[contains(@class,"dokan-support-topic-counts")]//a[contains(text(), "Closed Tickets")]',
            },

            // Filter
            filters: {
                filterByCustomer: '//select[@id="dokan-search-support-customers"]/..//span[@class="select2-selection__arrow"]',
                filterByCustomerInput: '.select2-search__field',

                filterByDate: {
                    dateRangeInput: 'input#support_ticket_date_filter',
                    startDateInput: 'input#support_ticket_start_date_filter_alt',
                    endDateInput: 'input#support_ticket_end_date_filter_alt',
                },

                tickedIdOrKeyword: '#dokan-support-ticket-search-input',
                search: '//input[@class="dokan-btn" and @value="Search"]',
                result: '.select2-results__option.select2-results__option--highlighted',
            },

            // table
            table: {
                table: '.dokan-support-table',
                topicColumn: '//th[normalize-space()="Topic"]',
                titleColumn: '//th[normalize-space()="Title"]',
                customerColumn: '//th[normalize-space()="Customer"]',
                statusColumn: '//th[normalize-space()="Status"]',
                dateColumn: '//th[normalize-space()="Date"]',
                actionColumn: '//th[normalize-space()="Action"]',
            },

            numOfRowsFound: 'table.dokan-support-table tbody tr',
            noSupportTicketFound: '//div[@class="dokan-error" and contains(text(), "No tickets found!")]',
            storeSupportLink: (id: string) => `//strong[normalize-space()="#${id}"]/..`,
            storeSupportCellById: (id: string) => `//strong[normalize-space()="#${id}"]/../..`,
            storeSupportCellByTitle: (title: string) => `//a[normalize-space()="${title}"]/..`,
            storeSupportsCellByCustomer: (customerName: string) => `//strong[contains(text(),'${customerName}')]/../..`,

            supportTicketDetails: {
                backToTickets: '.dokan-dashboard-content > a',

                basicDetails: {
                    basicDetailsDiv: 'div.dokan-support-single-title',
                    ticketTitle: '//span[contains(@class,"dokan-chat-title") and not(contains(@class,"dokan-chat-status"))]',
                    ticketId: 'span.dokan-chat-title.dokan-chat-status',
                },

                chatStatus: {
                    status: 'div.dokan-chat-status-box  span.dokan-chat-status',
                    open: 'div.dokan-chat-status-box span.dokan-chat-status.chat-open',
                    closed: 'div.dokan-chat-status-box span.dokan-chat-status.chat-closed',
                },

                orderReference: {
                    orderReferenceSpan: 'span.order-reference',
                    orderReferenceText: (orderId: string) => `//strong[normalize-space()="Referenced Order #${orderId}"]`,
                    orderReferenceLink: (orderId: string) => `//strong[normalize-space()="Referenced Order #${orderId}"]/..`,
                },

                chatBox: {
                    mainChat: 'div.dokan-dss-chat-box.main-topic',
                    otherChats: 'ul.dokan-support-commentlist',
                },

                replyBox: {
                    addReplyText: '//strong[normalize-space()="Add Reply"]',
                    closeTicketText: '//strong[normalize-space()="Ticket Closed"]',
                    replyBoxDiv: 'div.dokan-panel.dokan-panel-default.dokan-dss-panel-default',
                    addReply: '#dokan-support-commentform #comment',
                    submitReply: '#submit',
                },
            },

            // Manage Ticket

            ticketStatus: 'div.dokan-chat-status-box span.dokan-chat-status',
            chatReply: '#comment',
            changeStatus: 'select.dokan-support-topic-select', //  1
            submitReply: '#submit',
            okEmptySubmit: '.swal2-confirm',

            // Close Ticket
            closeTicket: '//td[@data-title="Action"]//a[contains(@class, "dokan-support-status-change") and  @data-original-title="Close Topic" ]',

            // reOpen Ticket
            reOpenTicket: '//td[@data-title="Action"]//a[contains(@class, "dokan-support-status-change") and  @data-original-title="Re-open Topic" ]',

            confirmCloseTicket: '.swal2-confirm',
            cancelCloseTicket: '.swal2-cancel',
        },

        // Vendor Account Details
        vAccountDetails: {
            firstName: '#account_first_name',
            lastName: '#account_last_name',
            email: '#account_email',
            currentPassword: '#password_current',
            NewPassword: '#password_1',
            confirmNewPassword: '#password_2',
            saveChanges: '.dokan-btn',
            saveSuccessMessage: 'Account details changed successfully.',
        },

        // Search Similar Product
        vSpmv: {
            // Search similar product spmv
            search: {
                searchDiv: '.dokan-spmv-add-new-product-search-box-area',
                subHeader: '//p[@class="sub-header"]',
                toggleBtn: '#dokan-spmv-area-toggle-button',
                // toggleBtn: '#dokan-spmv-area-toggle-button i.fa-caret-down',
                searchInput: 'input[name="search"]',
                search: 'input.dokan-btn-search',
                orCreateNew: '.dokan-spmv-add-new-product-search-box-area .dokan-product-listing a',
            },

            // table
            table: {
                table: '#dokan-spmv-product-list-table',
                productNameColumn: '//th[normalize-space()="Product Name"]',
                priceColumn: '//th[normalize-space()="Price"]',
                vendorColumn: '//th[normalize-space()="Vendor"]',
                actionsColumn: '//th[normalize-space()="Actions"]',
            },

            noProductsFound: '//td[normalize-space()="No product found."]',
            numberOfRowsFound: '#dokan-spmv-product-list-table tbody tr',
            resultCount: '.woocommerce-result-count',
            sortProduct: 'select.orderby', // popularity, rating, date, price, price-desc, bid_asc, bid_desc, auction_end, auction_started, auction_activity
            editProduct: (productName: string) => `//a[normalize-space()="${productName}"]/../../..//a[@class="dokan-btn"]`,
            addToStore: 'button.dokan-spmv-clone-product',

            productDetails: {
                sellThisItem: 'button[name="dokan_sell_this_item"]',
            },
        },

        // Settings
        vSettings: {
            store: '.store > a',
            addons: '.product-addon > a',
            payment: '.payment > a',
            verification: '.verification > a',
            deliveryTime: '.delivery-time > a',
            shipping: '.shipping > a',
            shipStation: '.shipstation > a',
            socialProfile: '.social > a',
            rma: '.rma > a',
            storeSEO: '.seo > a',
        },

        // Store Settings
        vStoreSettings: {
            settingsText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            // Wp Image Upload
            wpUploadFiles: '#menu-item-upload',
            uploadedMedia: '.attachment-preview',
            selectFiles: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[@class="browser button button-hero"]',
            select: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-select")]',
            crop: '//div[@class="supports-drag-drop" and @style="position: relative;"]//button[contains(@class, "media-button-insert")]',

            // Banner and Profile Image
            banner: '.dokan-banner .dokan-banner-drag',
            bannerImage: '//div[@class="image-wrap"]//img[@class="dokan-banner-img"]',
            removeBannerImage: '.close.dokan-remove-banner-image',
            profilePicture: '.dokan-pro-gravatar-drag',
            profilePictureImage: '//div[@class="dokan-left gravatar-wrap"]//img[@class="dokan-gravatar-img"]',
            removeProfilePictureImage: '.dokan-close.dokan-remove-gravatar-image',

            // Basic Store Info
            storeName: '#dokan_store_name',
            phoneNo: '#setting_phone',

            // store categories
            storeCategories: {
                storeCategoryDropDown: '//label[contains(text(), "Store Category")]/..//span[@class="select2-selection__arrow"]',
                storeCategoryInput: '//span[@class="select2-search select2-search--dropdown"]//input[@role="searchbox"]',
                storeCategoriesInput: '//label[contains(text(), "Store Categories")]/..//input[@class="select2-search__field"]',
                result: '.select2-results__option.select2-results__option--highlighted',
            },

            multipleLocation: '#multiple-store-location',
            addLocation: '#show-add-store-location-section-btn',
            editLocation: '.store-pickup-location-edit-btn',
            locationName: '#store-location-name-input',

            // Address
            address: {
                street: '#dokan_address\\[street_1\\]',
                street2: '#dokan_address\\[street_2\\]',
                city: '#dokan_address\\[city\\]',
                postOrZipCode: '#dokan_address\\[zip\\]',
                country: '#dokan_address_country',
                state: '#dokan-states-box #dokan_address_state',
                saveLocation: '#dokan-save-store-location-btn',
                cancelSaveLocation: '#cancel-store-location-section-btn',
                deleteSaveLocation: '.store-pickup-location-delete-btn',
            },

            // Company Info
            companyInfo: {
                companyName: '#settings_dokan_company_name',
                companyId: '#settings_dokan_company_id_number',
                vatOrTaxNumber: '#setting_vat_number',
                nameOfBank: '#setting_bank_name',
                bankIban: '#setting_bank_iban',
            },

            // Email
            email: '//label[contains(text(), "Email")]/..//input[@type="checkbox"]',

            // Map
            map: '#dokan-map-add',

            // Terms and Conditions
            termsAndConditions: '//label[contains(text(), "Terms and Conditions")]/..//input[@type="checkbox"]',
            termsAndConditionsIframe: '#dokan_tnc_text iframe',
            termsAndConditionsHtmlBody: '#tinymce',

            // Store Opening Closing Time
            storeOpeningClosingTime: '#dokan-store-time-enable',

            // lite locators
            lite: {
                openingClosingTimeEnable: (day: string) => `select[name="${day}[working_status]"]`,
                openingTimeInput: (day: string) => `input#opening-time\\[${day}\\]`,
                closingTimeInput: (day: string) => `input#closing-time\\[${day}\\]`,
            },
            // openingTime: (day: string) => `#opening-time-${day}`,
            // closingTime: (day: string) => `#closing-time-${day}`,
            // addNewRow: (day: string) => `#store-tab-${day} .added-store-opening-time > .fa`,
            // deleteOneRow: '.remove-store-closing-time > .fa',
            openingClosingTimeSwitch: (day: string) => `//label[@for='${day}-working-status']/p[@class='switch tips']`,
            openingTime: (day: string) => `input#opening-time-${day}`,
            openingTimeHiddenInput: (day: string) => `//input[@name='opening_time[${day}][]']`,
            closingTime: (day: string) => `input#closing-time-${day}`,
            closingTimeHiddenInput: (day: string) => `//input[@name='closing_time[${day}][]']`,
            storeOpenNotice: '//input[@name="dokan_store_open_notice"]',
            storeCloseNotice: '//input[@name="dokan_store_close_notice"]',

            // Vacation
            goToVacation: '#dokan-seller-vacation-activate',
            closingStyle: 'label .form-control',
            setVacationMessageInstantly: '//textarea[@id="dokan-seller-vacation-message" and @name="setting_vacation_message"]',
            setVacationMessageDatewise: '//textarea[@id="dokan-seller-vacation-message" and @name="dokan_seller_vacation_datewise_message"]',
            vacationDateRange: '#dokan-seller-vacation-date-from-range',
            vacationDateRangeFrom: 'input#dokan-seller-vacation-date-from',
            vacationDateRangeTo: 'input#dokan-seller-vacation-date-to',
            saveVacationEdit: '#dokan-seller-vacation-save-edit',
            cancelVacationEdit: '#dokan-seller-vacation-cancel-edit',
            noVacationIsSet: '//td[contains( text(),"No vacation is set")]',
            vacationRow: '//td[@class="dokan-seller-vacation-list-action"]/..',
            editSavedVacationSchedule: '.dokan-seller-vacation-list-action .fas',
            deleteSavedVacationSchedule: '.dokan-seller-vacation-remove-schedule',
            confirmDeleteSavedVacationSchedule: '.swal2-confirm',
            cancelDeleteSavedVacationSchedule: '.swal2-cancel',

            // catalog mode
            removeAddToCartButton: 'input#catalog_mode_hide_add_to_cart_button',
            hideProductPrice: 'input#catalog_mode_hide_product_price',
            enableRequestQuoteSupport: 'input#catalog_mode_request_a_quote_support',

            // Discount
            enableStoreWideDiscount: '#lbl_setting_minimum_quantity',
            minimumOrderAmount: '#setting_minimum_order_amount',
            percentage: '#setting_order_percentage',

            // Biography
            biographyIframe: '#wp-vendor_biography-wrap iframe',
            biographyHtmlBody: '#tinymce',

            // Store Support
            showSupportButtonInStore: '#support_checkbox',
            showSupportButtonInSingleProduct: '#support_checkbox_product',
            supportButtonText: '#dokan_support_btn_name',

            // Min-Max
            enableMinMaxQuantities: '#enable_vendor_min_max_quantity',
            minimumProductQuantityToPlaceAnOrder: '#min_quantity_to_order',
            maximumProductQuantityToPlaceAnOrder: '#max_quantity_to_order',
            enableMinMaxAmount: '#enable_vendor_min_max_amount',
            minimumAmountToPlaceAnOrder: '#min_amount_to_order',
            maximumAmountToPlaceAnOrder: '#max_amount_to_order',
            selectProducts: '//label[contains(text(), "Select Products")]/..//input[contains(@class,"select2-search__field")]',
            selectAll: '.dokan-min-max-product-select-all',
            clear: '.dokan-min-max-product-clear-all',
            selectCategory: 'select#product_cat',
            selectCategorySearch: '//select[@id="product_cat"]/..//input[@class="select2-search__field"]',
            selectCategorySearchedResult: '.select2-results__option.select2-results__option--highlighted',
            alreadySelectedOption: (option: string) => `//li[@class="select2-selection__choice" and @title="${option}"]`,

            // Update Settings
            updateSettingsTop: 'button.dokan-update-setting-top-button',
            updateSettings: '//input[@name="dokan_update_store_settings"]',
            updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success p',
        },

        // addon settings
        vAddonSettings: {
            productAddonsText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            createNewAddon: '.dokan-pa-all-addons .dokan-btn',
            createNew: '//a[normalize-space()="Create New"]',

            // table
            table: {
                addonTable: '#global-addons-table',
                nameColumn: 'th[scope="col"]',
                priorityColumn: '//th[normalize-space()="Priority"]',
                productCategoriesColumn: '//th[normalize-space()="Product Categories"]',
                numberOfFieldsColumn: '//th[normalize-space()="Number of Fields"]',
            },

            noRowsFound: '//td[normalize-space()="No add-ons found."]',
            firstAddonRow: '#the-list tr td .edit a',
            addonRow: (addon: string) => `//a[contains(text(), '${addon}')]/../..`,
            editAddon: (addon: string) => `//a[contains(text(), '${addon}')]/..//a[contains(text(), 'Edit')]`,
            deleteAddon: (addon: string) => `//a[contains(text(), '${addon}')]/..//a[contains(text(), 'Delete')]`,

            backToAddonLists: '.back-to-addon-lists-btn',

            addon: {
                name: '#addon-reference',
                priority: '#addon-priority',
                productCategories: '.select2-search__field',
                result: 'li.select2-results__option.select2-results__option--highlighted',

                // Addon fields
                addonFieldsRow: (addonField: string) => `//h3[@class="wc-pao-addon-name" and contains(text(), "${addonField}")]/../..//span[@class="wc-pao-addon-toggle"]`,
                addField: '.wc-pao-add-field',
                type: 'select.wc-pao-addon-type-select',
                displayAs: '.wc-pao-addon-display-select',
                titleRequired: '.wc-pao-addon-content-name',
                formatTitle: '#wc-pao-addon-content-title-format',
                enableDescription: '.wc-pao-addon-description-enable',
                addDescription: '.wc-pao-addon-description.show',
                requiredField: '.wc-pao-addon-required-setting input',
                enterAnOption: '//input[@placeholder="Enter an option"]',
                optionPriceType: '.wc-pao-addon-option-price-type',
                optionPriceInput: '.wc-pao-addon-content-price .wc_input_price',
                import: '.wc-pao-import-addons',
                export: '.wc-pao-export-addons',
                expandAll: '.wc-pao-expand-all',
                closeAll: '.wc-pao-close-all',
                publishOrUpdate: '#submit',
                addonUpdateSuccessMessage: '.dokan-alert.dokan-alert-success',
            },
        },

        // Payment Settings
        vPaymentSettings: {
            paymentMethodText: '.dokan-dashboard-content.dokan-settings-content h1',

            paymentMethods: {
                paymentMethodsDiv: '.dokan-payment-settings-summary',
                addPaymentMethodDropDown: '#toggle-vendor-payment-method-drop-down',
                noOfPaymentMethods: '//button[contains(text(),"Manage")]',
            },

            // Paypal
            paypal: '.payment-field-paypal .dokan-form-control',

            // Bank Transfer
            bankAccountName: '//input[@name="settings[bank][ac_name]"]',
            bankAccountType: '#ac_type',
            bankAccountNumber: '//input[@name="settings[bank][ac_number]"]',
            bankName: '//input[@name="settings[bank][bank_name]"]',
            bankAddress: '//textarea[@name="settings[bank][bank_addr]"]',
            bankRoutingNumber: '//input[@name="settings[bank][routing_number]"]',
            bankIban: '//input[@name="settings[bank][iban]"]',
            bankSwiftCode: '//input[@name="settings[bank][swift]"]',
            declaration: '#declaration',
            addAccount: 'button.save.dokan-btn',
            disconnectAccount: 'button.dokan_payment_disconnect_btn',

            // Skrill
            skrill: '//input[@name="settings[skrill][email]"]',

            // Custom Payment Method
            customPayment: '//input[@name="settings[dokan_custom][value]"]',

            // payment email
            paymentEmail: 'input.dokan-form-control',

            // disconnect
            disconnectPayment: '//button[normalize-space()="Disconnect"]',

            // Update Settings
            updateSettings: 'input.dokan-btn',
            updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success p',

            // Stripe
            ConnectWithStripe: '.dokan-stripe-connect-link',

            // Paypal Marketplace
            paypalMarketplace: '#vendor_paypal_email_address',
            paypalMarketplaceSigUp: '.vendor_paypal_connect',

            // Razorpay
            rzSignup: '.vendor_razorpay_connect',
            rzClosePopup: '.mfp-close', // todo: need to update, everywhere
            // Existing Account Info
            rzIHaveAlreadyAnAccount: '#dokan_razorpay_existing_user_chekbox',
            rzAccountId: '#dokan_razorpay_account_id',
            rzConnectExistingAccount: '#dokan_razorpay_vendor_register_button',
            // New Account Info
            rzAccountName: '#razorpay_account_name',
            rzAccountEmail: '#razorpay_account_email',
            rzYourCompanyName: '#razorpay_business_name',
            rzYourCompanyType: '#razorpay_business_type',
            rzBankAccountName: '#razorpay_beneficiary_name',
            rzBankAccountNumber: '#razorpay_account_number',
            rzBankIfscCode: '#razorpay_ifsc_code',
            rzBankAccountType: '#razorpay_account_type',
            rzConnectAccount: '#dokan_razorpay_vendor_register_button',

            // Mangopay
            // Mangopay Payment Setup Options
            accountForm: '.dokan-mp-account',
            bankAccount: '.dokan-mp-bank',
            verification: '.dokan-mp-verification',
            eWallets: '.dokan-mp-wallets',

            // Connect & Account Info
            dateOfBirth: '#dokan-mangopay-user-birthday',
            nationality: '#dokan-mangopay-user-nationality',
            typeOfUser: '#dokan-mangopay-user-status',
            typeOfBusiness: '#dokan-mangopay-business-type',
            companyNumber: '#dokan-mangopay-company-number',
            address: '#dokan-mangopay-address1',
            addressDetails: '#dokan-mangopay-address2',
            country: '#dokan-mangopay-country',
            state: '#dokan-mangopay-state',
            city: '#dokan-mangopay-city',
            postcode: '#dokan-mangopay-postcode',
            connect: '#dokan-mangopay-account-connect',
            disconnect: '#dokan-mangopay-account-disconnect',
            update: '#dokan-mangopay-account-connect',
            // Bank Account
            addNew: '#dokan-mp-bank-account-add-new',
            accountType: '#dokan-mangopay-vendor-acccount-type',
            // Iban
            ibanIban: '#dokan-mangopay-vendor-acccount-IBAN-iban',
            ibanBic: '#dokan-mangopay-vendor-acccount-IBAN-bic',
            // Gb
            gbAccountNumber: '#dokan-mangopay-vendor-acccount-GB-account_number',
            gbSortCode: '#dokan-mangopay-vendor-acccount-GB-sort_code',
            // Us
            usAccountNumber: '#dokan-mangopay-vendor-acccount-US-account_number',
            usAba: '#dokan-mangopay-vendor-acccount-US-aba',
            usDepositAccountType: '#dokan-mangopay-vendor-acccount-US-datype',
            // Ca
            caBankName: '#dokan-mangopay-vendor-acccount-CA-bank_name',
            caInstitutionNumber: '#dokan-mangopay-vendor-acccount-CA-inst_number',
            caBranchCode: '#dokan-mangopay-vendor-acccount-CA-branch_code',
            caAccountNumber: '#dokan-mangopay-vendor-acccount-CA-account_number',
            // Others
            othersCountry: '#dokan-mangopay-vendor-acccount-OTHER-country',
            othersBic: '#dokan-mangopay-vendor-acccount-OTHER-bic',
            othersAccountNumber: '#dokan-mangopay-vendor-acccount-OTHER-account_number',
            // Account Holders Details
            accountHolderDetails: {
                accountHoldersName: '#dokan-mangopay-vendor-account-name',
                accountHoldersAddress: '#dokan-mangopay-vendor-account-address1',
                accountHoldersAddressDetails: '#dokan-mangopay-vendor-account-address2',
                accountHoldersCountry: '#dokan-mangopay-vendor-account-country',
                accountHoldersState: '#dokan-mangopay-vendor-account-state',
                city: '#dokan-mangopay-vendor-account-city',
                postcode: '#dokan-mangopay-vendor-account-postcode',
                submit: '#dokan-mp-bank-account-create',
                cancel: '#dokan-mp-bank-account-cancel',
            },

            // Verification
            kyc: {
                documentType: '#dokan-kyc-file-type',
                chooseFiles: '#dokan-kyc-file',
                // Ubo
                Ubo: {
                    createAnUboDeclaration: '#ubo_create_declaration_button',
                    addUbo: '#ubo_add_button',
                    FirstName: '#dokan_mp_first_name',
                    LastName: '#dokan_mp_last_name',
                    DateOfBirth: '#dokan_mp_birthday',
                    Nationality: '#dokan_mp_nationality',
                    Address: '#dokan_mp_address_line1',
                    AddressDetails: '#dokan_mp_address_line2',
                    Country: '#dokan_mp_country',
                    State: '#dokan_mp_region',
                    City: '#dokan_mp_city',
                    Postcode: '#dokan_mp_postal_code',
                    BirthplaceCity: '#dokan_mp_birthplace_city_field',
                    BirthplaceCountry: '#dokan_mp_birthplace_country_field',
                    sendUbo: 'add_button_ubo_element',
                    cancelUbo: 'cancel_button_ubo_element',
                },
                submit: '#dokan-mangopay-submit-kyc',
            },
        },

        // Verification Settings
        vVerificationSettings: {
            verificationText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            // Id Verification
            id: {
                idVerificationDiv: 'div#dokan_v_id',
                idVerificationText: '//strong[normalize-space()="ID Verification"]',

                idPendingFeedback: 'div#dokan_v_id_feedback.dokan-alert-warning',
                cancelIdVerificationRequest: 'button#dokan_v_id_cancel',

                idApproveFeedback: 'div#dokan_v_id_feedback.dokan-alert-success',
                startIdVerification: '#dokan_v_id_click',
                passport: '//input[@value="passport"]',
                nationalIdCard: '//input[@value="national_id"]',
                drivingLicense: '//input[@value="driving_license"]',
                uploadPhoto: 'a.dokan-gravatar-drag',
                previousUploadedPhoto: '//div[@class="gravatar-wrap"]//img[@class="dokan-gravatar-img"]',
                removePreviousUploadedPhoto: '.dokan-close.dokan-remove-gravatar-image',
                submitId: '#dokan_v_id_submit',
                cancelSubmitId: '#dokan_v_id_cancel_form',

                idUpdateSuccessMessage: 'div#feedback.dokan-alert.dokan-alert-success',
            },

            // Address Verification
            address: {
                addressVerificationDiv: '//strong[normalize-space()="Address Verification"]/../..',
                addressVerificationText: '//strong[normalize-space()="Address Verification"]',

                addressPendingFeedback: 'div#d_v_address_feedback.dokan-alert-warning',
                cancelAddressVerificationRequest: 'button#dokan_v_address_cancel',

                addressApproveFeedback: 'div#d_v_address_feedback.dokan-alert-success',
                startAddressVerification: '#dokan_v_address_click',
                street: '#dokan_address\\[street_1\\]',
                street2: '#dokan_address\\[street_2\\]',
                city: '#dokan_address\\[city\\]',
                postOrZipCode: '#dokan_address\\[zip\\]',
                country: '#dokan_address_country',
                state: '#dokan_address_state',
                uploadResidenceProof: '#vendor-proof',
                previousUploadedResidenceProof: '.vendor_img_container img',
                removePreviousUploadedResidenceProof: '.dokan-close.dokan-remove-proof-image',
                submitAddress: '#dokan_v_address_submit',
                cancelSubmitAddress: '.dokan-form-group > #dokan_v_address_cancel',

                addressUpdateSuccessMessage: 'div#feedback.dokan-alert.dokan-alert-success',
            },

            // Company Verification
            company: {
                companyVerificationDiv: '//strong[normalize-space()="Company Verification"]/../..',
                companyVerificationText: '//strong[normalize-space()="Company Verification"]',

                companyPendingFeedback: 'div#d_v_company_feedback.dokan-alert-warning',
                cancelCompanyVerificationRequest: 'button#dokan_v_company_cancel',

                companyApproveFeedback: 'div#d_v_company_feedback.dokan-alert-success',
                startCompanyVerification: '#dokan_v_company_click',
                uploadedCompanyFileClose: '.dokan-btn.dokan-btn-danger',
                uploadFiles: 'a.dokan-files-drag',
                uploadedFileFirst: '(//a[@onclick="companyVerificationRemoveList(event)"])[1]',
                cancelSelectedInfo: '.fa-times',
                submitCompanyInfo: '#dokan_v_company_submit',
                cancelSubmitCompanyInfo: '.dokan-w5 > #dokan_v_company_cancel',

                companyInfoUpdateSuccessMessage: 'div#feedback.dokan-alert.dokan-alert-success',
            },
        },

        // Delivery Time Settings
        vDeliveryTimeSettings: {
            settingsText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            // Delivery Support
            homeDelivery: '//input[@type="checkbox" and @name="delivery"]',
            storePickup: '#enable-store-location-pickup',
            deliveryBlockedBuffer: '#pre_order_date',
            timeSlot: '#delivery_time_slot',
            orderPerSlot: '#order_per_slot',

            // Delivery Day
            deliveryDaySwitches: '.dokan-status p.switch.tips',
            deliveryDaySwitch: (day: string) => `//label[@for='${day}-working-status']//p[@class='switch tips']`,
            deliveryDaySwitchColor: (day: string) => `//label[@for='${day}-working-status']//p[@class='switch tips']//div[contains(@class,'minitoggle')]`,

            // Individual Day Settings
            openingTime: (day: string) => `input#delivery-opening-time-${day}`,
            openingTimeHiddenInput: (day: string) => `//input[@name='delivery_opening_time[${day}][]']`,
            closingTime: (day: string) => `input#delivery-closing-time-${day}`,
            closingTimeHiddenInput: (day: string) => `//input[@name='delivery_closing_time[${day}][]']`,

            closeDeliveryTime: (day: string) => `//label[normalize-space()="${helpers.capitalize(day)}" and @for="working-days"]/..//a[@class="remove-store-closing-time"]`,
            addHours: (day: string) => `//label[normalize-space()="${helpers.capitalize(day)}" and @for="working-days"]/..//a[@class="added-store-opening-time "]`,

            updateSettings: '.dokan-btn.dokan-btn-danger.dokan-btn-theme',
            settingsSuccessMessage: '.dokan-message strong',
        },

        // Shipping Settings
        vShippingSettings: {
            shippingSettingsText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            // Shipping Policies
            shippingPolicies: {
                clickHereToAddShippingPolicies: '//a[normalize-space()="Click here to add Shipping Policies"]',
                backToZoneList: '.router-link-active',
                processingTime: '#shipping-settings #dps_pt',
                shippingPolicy: '#shipping-settings #_dps_shipping_policy',
                refundPolicy: '//label[normalize-space()="Refund Policy"]/..//textarea[@class="dokan-form-control"]',
                saveSettings: '.dokan-btn-danger',
            },

            // table
            table: {
                shippingZone: '.shipping-zone-table',
                zoneNameColumn: '//th[normalize-space()="Zone Name"]',
                regionsColumn: '//th[normalize-space()="Region(s)"]',
                shippingMethodColumn: '//th[normalize-space()="Shipping Method"]',
            },

            // Zone-wise Shipping Settings
            ZonWiseAddShippingMethod: (zone: string) => `//a[contains(text(),'${zone}')]/../..//a[contains(text(),'Add Shipping Method')]`,
            shippingZoneCell: (shippingZone: string) => `//a[contains(text(), '${shippingZone}')]/..`,
            editShippingZone: (shippingZone: string) => `//a[contains(text(), '${shippingZone}')]/..//div//a[contains(text(), 'Edit')]`,
            addShippingMethod: '//a[contains(text(),"Add Shipping Method")]',
            shippingMethod: '#shipping_method',
            shippingMethodPopupAddShippingMethod: '.button.button-primary.button-large',
            shippingMethodCell: (shippingMethodName: string) => `//td[contains(text(),'${shippingMethodName}')]/..`,
            editShippingMethod: (shippingMethodName: string) => `//td[contains(text(),'${shippingMethodName}')]/..//div//a[contains(text(), 'Edit')]`,
            deleteShippingMethod: (shippingMethodName: string) => `//td[contains(text(),'${shippingMethodName}')]/..//div//a[contains(text(), 'Delete')]`,

            // Edit Shipping Methods
            // Flat Rate
            flatRateMethodTitle: '#method_title',
            flatRateCost: '#method_cost',
            flatRateTaxStatus: '#method_tax_status',
            flatRateDescription: '#method_description',
            flatRateNoShippingClassCost: '#no_class_cost',
            flatRateCalculationType: '#calculation_type',
            // Free Shipping
            freeShippingTitle: '#method_title',
            freeShippingMinimumOrderAmount: '#minimum_order_amount',
            // Local Pickup
            localPickupTitle: '#method_title',
            localPickupCost: '#method_cost',
            localPickupTaxStatus: '#method_tax_status',
            localPickupDescription: '#method_description',
            // Dokan Table Rate Shipping
            tableRateShippingMethodTitle: '#table_rate_title',
            tableRateShippingTaxStatus: '//select[@name="table_rate_tax_status"]',
            tableRateShippingTaxIncludedInShippingCosts: '//select[@name="table_rate_prices_include_tax"]',
            tableRateShippingHandlingFee: '#table_rate_order_handling_fee',
            tableRateShippingMaximumShippingCost: '#table_rate_max_shipping_cost',
            // Rates
            tableRateShippingCalculationType: '#dokan_table_rate_calculation_type',
            tableRateShippingHandlingFeePerOrder: '#dokan_table_rate_handling_fee',
            tableRateShippingMinimumCostPerOrder: '#dokan_table_rate_min_cost',
            tableRateShippingMaximumCostPerOrder: '#dokan_table_rate_max_cost',
            tableRateShippingUpdateSettings: '//input[@name="dokan_update_table_rate_shipping_settings"]',
            tableRateShippingUpdateSettingsSuccessMessage: '.dokan-message Strong',
            // Dokan Distance Rate Shipping
            distanceRateShippingMethodTitle: '#distance_rate_title',
            distanceRateShippingTaxStatus: '#distance_rate_tax_status',
            distanceRateShippingTransportationMode: '#dokan_distance_rate_mode',
            distanceRateShippingAvoid: '#dokan_distance_rate_avoid',
            distanceRateShippingDistanceUnit: '#dokan_distance_rate_unit',
            distanceRateShippingShowDistance: '#dokan_distance_rate_show_distance',
            distanceRateShippingShowDuration: '#dokan_distance_rate_show_duration',
            // Shipping Address
            distanceRateShippingAddress1: '#dokan_distance_rate_address_1',
            distanceRateShippingAddress2: '#dokan_distance_rate_address_2',
            distanceRateShippingCity: '#dokan_distance_rate_city',
            distanceRateShippingZipOrPostalCode: '#dokan_distance_rate_postal_code',
            distanceRateShippingStateOrProvince: '#dokan_distance_rate_state_province',
            distanceRateShippingCountry: '#dokan_distance_rate_country',
            distanceRateShippingUpdateSettings: '//input[@name="dokan_update_distance_rate_shipping_settings"]',
            distanceRateShippingUpdateSettingsSuccessMessage: '.dokan-message Strong',
            // Edit save Shipping Settings
            shippingSettingsSaveSettings: '.button.button-primary.button-large',

            // Save Changes
            saveChanges: '//input[@value="Save Changes"]',
            updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success span',

            // Previous Shipping Settings
            previousShippingSettings: {
                previousShippingSettings: '//a[contains( text(), "Click Here")]',
                backToZoneWiseShippingSettings: '.dokan-page-help a',
                enableShipping: '//input[@type="checkbox" and @name="dps_enable_shipping"]',
                defaultShippingPrice: '#shipping_type_price',
                perProductAdditionalPrice: '#additional_product',
                perQtyAdditionalPrice: '#additional_qty',
                processingTime: '#dps_pt',
                shippingPolicy: '//label[contains(text(),"Shipping Policy")]/..//textarea[@name="dps_ship_policy"]',
                refundPolicy: '//label[contains(text(),"Refund Policy")]/..//textarea[@name="dps_refund_policy"]',
                shipsFrom: '//select[@name="dps_form_location"]',
                shipTo: '(//select[@name="dps_country_to[]"])[1]',
                cost: '(//input[@name="dps_country_to_price[]"])[1]',
                addLocation: '.dokan-btn-default',
                previousShippingSaveSettings: '//input[@name="dokan_update_shipping_options"]',
            },
        },

        // shipStation settings
        vShipStationSettings: {
            shipStationText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            authenticationKey: '//label[normalize-space()="Authentication Key"]/..//code',
            selectedStatus: '//label[@for="dokan-shipstation-export-statuses"]/..//li[@class="select2-selection__choice"]',
            exportOrderStatusesInput: '//label[normalize-space()="Export Order Statuses"]/..//span[@class="select2-selection select2-selection--multiple"]//input[@class="select2-search__field"]',
            shippedOrderStatusDropdown: '.select2-selection__arrow',
            shippedOrderStatusInput: '(//input[@class="select2-search__field"])[2]',
            result: '.select2-results__option.select2-results__option--highlighted',

            saveChanges: '#dokan-store-shipstation-form-submit',
            saveSuccessMessage: '#swal2-html-container',
            successOk: '.swal2-confirm',
        },

        // social profile settings
        vSocialProfileSettings: {
            socialProfileText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            platforms: {
                facebook: '#settings\\[social\\]\\[fb\\]',
                twitter: '#settings\\[social\\]\\[twitter\\]',
                pinterest: '#settings\\[social\\]\\[pinterest\\]',
                linkedin: '#settings\\[social\\]\\[linkedin\\]',
                youtube: '#settings\\[social\\]\\[youtube\\]',
                instagram: '#settings\\[social\\]\\[instagram\\]',
                flickr: '#settings\\[social\\]\\[flickr\\]',
            },

            // updateSettings: '.dokan-btn.dokan-btn-danger.dokan-btn-theme',
            updateSettings: 'input[value="Update Settings"]',
            // updateSettings: "//input[@name='dokan_update_profile_settings']/..",
            // updateSettings: "//input[@class='dokan-btn dokan-btn-danger dokan-btn-theme']/..",
            updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success p',
        },

        // rma settings
        vRmaSettings: {
            returnAndWarrantyText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            label: '#dokan-rma-label',
            type: '#dokan-warranty-type',
            length: '#dokan-warranty-length',
            lengthValue: '//input[@name="warranty_length_value"]',
            lengthDuration: '#dokan-warranty-length-duration',
            refundReasons: '#dokan-store-rma-form .checkbox input',
            refundReasonsFirst: '(//form[@id="dokan-store-rma-form"]//div[@class="checkbox"]//input)[1]',
            refundPolicyIframe: 'iframe',
            refundPolicyHtmlBody: '#tinymce',
            saveChanges: '#dokan-store-rma-form-submit',
            updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success',
        },

        // Store Seo Settings
        vStoreSeoSettings: {
            storeSeoText: '.dokan-settings-content h1',
            visitStore: '//a[normalize-space()="Visit Store"]',

            seoTitle: '#dokan-seo-meta-title',
            metaDescription: '#dokan-seo-meta-desc',
            metaKeywords: '#dokan-seo-meta-keywords',

            facebook: {
                facebookTitle: '#dokan-seo-og-title',
                facebookDescription: '#dokan-seo-og-desc',
                facebookImage: '//label[contains( text(), "Facebook Image :")]/..//a[contains(@class, "dokan-gravatar-drag")]',
            },

            twitter: {
                twitterTitle: '#dokan-seo-twitter-title',
                twitterDescription: '#dokan-seo-twitter-desc',
                twitterImage: '//label[contains( text(), "Twitter Image")]/..//a[contains(@class, "dokan-gravatar-drag")]',
            },

            saveChanges: '#dokan-store-seo-form-submit',
            updateSettingsSuccessMessage: '.dokan-alert.dokan-alert-success',
        },
    },

    // Customer

    customer: {
        // Customer Registration
        cRegistration: {
            regEmail: '#reg_email',
            regPassword: '#reg_password',
            regAsCustomer: '//input[@value="customer"]',
            regCustomerWelcomeMessage: '//div[@class="woocommerce-MyAccount-content"]//p[contains(text(),"Hello")]',
            // Register Button
            register: '.woocommerce-Button',
        },

        // Customer Home Menus
        cHomeMenus: {
            home: '//ul[@class="nav-menu"]//a[contains(text(),"Home")]',
            cart: '//ul[@class="nav-menu"]//a[contains(text(),"Cart")]',
            checkout: '//ul[@class="nav-menu"]//a[contains(text(),"Checkout")]',
            dashboard: '//ul[@class="nav-menu"]//a[contains(text(),"Dashboard")]',
            myAccount: '//ul[@class="nav-menu"]//a[contains(text(),"My account")]',
            myOrders: '//ul[@class="nav-menu"]//a[contains(text(),"My Orders")]',
            requestForQuote: '//ul[@class="nav-menu"]//a[contains(text(),"Request for Quote")]',
            samplePage: '//ul[@class="nav-menu"]//a[contains(text(),"Sample Page")]',
            shop: '//ul[@class="nav-menu"]//a[contains(text(),"Shop")]',
            storeList: '//ul[@class="nav-menu"]//a[contains(text(),"Store List")]',
        },

        // Customer My Account
        cMyAccount: {
            dashboard: '.woocommerce-MyAccount-navigation-link--dashboard a',
            orders: '.woocommerce-MyAccount-navigation-link--orders a',
            subscriptions: '.woocommerce-MyAccount-navigation-link--subscriptions a',
            downloads: '.woocommerce-MyAccount-navigation-link--downloads a',
            addresses: '.woocommerce-MyAccount-navigation-link--edit-address a',
            paymentMethods: '.woocommerce-MyAccount-navigation-link--payment-methods a',
            rmaRequests: '.woocommerce-MyAccount-navigation-link--rma-requests a',
            accountDetails: '.woocommerce-MyAccount-navigation-link--edit-account a',
            vendors: 'woocommerce-MyAccount-navigation-link--following a',
            sellerSupportTickets: '.woocommerce-MyAccount-navigation-link--support-tickets a',
            bookings: '.woocommerce-MyAccount-navigation-link--bookings a',
            auctions: '.woocommerce-MyAccount-navigation-link--auctions-endpoint a',
            logout: '.woocommerce-MyAccount-navigation-link--customer-logout a',
        },

        // Customer Dashboard
        cDashboard: {
            // Become Vendor
            becomeVendor: '//a[contains(text(),"Become a Vendor")]',
            firstName: '#first-name',
            lastName: '#last-name',
            shopName: '#company-name',
            shopUrl: '#seller-url',
            address: '#seller-address',
            phone: '#shop-phone',
            companyName: '#dokan-company-name',
            companyId: '#dokan-company-id-number',
            vatNumber: '#dokan-vat-number',
            bankName: '#dokan-bank-name',
            bankIban: '#dokan-bank-iban',
            termsAndConditions: '#tc_agree',
            subscriptionPack: '#dokan-subscription-pack',
            becomeAVendor: '.dokan-btn',

            // Become Wholesale Customer
            becomeWholesaleCustomer: '#dokan-become-wholesale-customer-btn',
            wholesaleRequestReturnMessage: '.dokan-wholesale-migration-wrapper div.woocommerce-info',
        },

        // Customer Orders
        cOrders: {
            // Request Warranty
            requestWarranty: {
                view: (orderNumber: string) => `//a[contains(text(),'${orderNumber}')]/../..//a[contains(@class,'woocommerce-button button view')]`,
                recentOrdersWarrantyRequest: (orderNumber: string) => `//td[@class='${orderNumber}']/..//a[@class='button request_warranty']`,

                ordersWarrantyRequest: (orderNumber: string) => `//a[contains(text(),'#${orderNumber}')]/../..//a[@class='woocommerce-button button request_warranty']`,
                warrantyRequestItemCheckbox: (productName: string) => `//a[contains(text(),'${productName}')]/../..//input[@type='checkbox' and contains(@name,'request_item')]`,
                warrantyRequestItemQuantity: (productName: string) => `//a[contains(text(),'${productName}')]/../..//select[contains(@name,'request_item_qty')]`,
                warrantyRequestType: '#type', // replace, refund, coupon
                warrantyRequestReason: '#reasons',
                warrantyRequestDetails: '#warranty_request_details',
                warrantySubmitRequest: 'input[name="warranty_submit_request"]',
            },

            // Order Details
            orderDetails: {
                orderDetailsLInk: (orderNumber: string) => `//a[contains(text(), '#${orderNumber}')]/../..//a[contains(text(), 'View')]`,
                orderNumber: '//div[@class="woocommerce-MyAccount-content"]//p//mark[@class="order-number"]',
                orderDate: '//div[@class="woocommerce-MyAccount-content"]//p//mark[@class="order-date"]',
                orderStatus: '//div[@class="woocommerce-MyAccount-content"]//p//mark[@class="order-status"]',
                subTotal: '//th[contains(text(),"Subtotal:")]/..//span[@class="woocommerce-Price-amount amount"]',
                orderDiscount: '//th[contains(text(),"Order Discount:")]/..//span[@class="woocommerce-Price-amount amount"]',
                quantityDiscount: '//th[contains(text(),"Quantity Discount:")]/..//span[@class="woocommerce-Price-amount amount"]',
                discount: '//th[text()="Discount:"]/..//span[@class="woocommerce-Price-amount amount"]',
                shippingMethod: '//th[contains(text(),"Shipping:")]/..//small',
                shippingCost: '//th[contains(text(),"Shipping:")]/..//span[@class="woocommerce-Price-amount amount"]',
                tax: '//th[contains(text(),"Tax:")]/..//span[@class="woocommerce-Price-amount amount"]',
                paymentMethod: '//th[contains(text(),"Payment method:")]/..//td',
                orderTotal: '//th[contains(text(),"Total:")]/..//span[@class="woocommerce-Price-amount amount"]',
            },
        },

        // Customer Subscription
        cSubscription: {
            view: (orderNumber: string) => `//a[contains(text(),'Order #${orderNumber}')]/../..//a[@class="woocommerce-button button view"]`,

            subscriptionDetails: {
                subscriptionHeading: 'h1.entry-title',

                // actions
                actions: {
                    cancel: 'td a.button.cancel',
                    changeAddress: 'td a.button.change_address',
                    changePayment: 'td a.button.change_payment_method',
                    reActivate: 'td a.button.reactivate',
                    renewNow: 'td a.button.subscription_renewal_early',
                },

                changePaymentMethod: '//input[@id="place_order"]', // todo: add & move to separate group -> payment change locators

                // todo: add more locators
            },
        },

        // Customer Downloads
        cDownloads: {
            view: (orderNumber: string) => `//a[contains(text(),'Order #${orderNumber}')]/../..//a[@class="woocommerce-button button view"]`,
        },

        // Customer Address
        cAddress: {
            // Billing Address
            billing: {
                editBillingAddress: '//h3[contains(text(),"Billing address")]/..//a[@class="edit"]',
                billingFirstName: '#billing_first_name',
                billingLastName: '#billing_last_name',
                billingCompanyName: '#billing_company',
                billingCompanyID: '#billing_dokan_company_id_number',
                billingVatOrTaxNumber: '#billing_dokan_vat_number',
                billingNameOfBank: '#billing_dokan_bank_name',
                billingBankIban: '#billing_dokan_bank_iban',
                // billingCountryOrRegion: "#select2-billing_country-container",
                billingCountryOrRegion: '(//span[@class="select2-selection__arrow"])[1]',
                billingCountryOrRegionInput: '.select2-search.select2-search--dropdown .select2-search__field',
                billingCountryOrRegionValues: '.select2-results ul li',
                billingStreetAddress: '#billing_address_1',
                billingStreetAddress2: '#billing_address_2',
                billingTownCity: '#billing_city',
                // billingState: "#select2-billing_state-container",
                billingState: '(//span[@class="select2-selection__arrow"])[2]',
                billingStateInput: '.select2-search.select2-search--dropdown .select2-search__field',
                billingStateValues: '.select2-results ul li',
                billingZipCode: '#billing_postcode',
                billingPhone: '#billing_phone',
                billingEmailAddress: '#billing_email',
                billingSaveAddress: '//button[@name="save_address"]',
                // Success Message
                successMessage: '.woocommerce-message',
            },

            // Shipping Address
            shipping: {
                editShippingAddress: '//h3[contains(text(),"Shipping address")]/..//a[@class="edit"]',
                shippingFirstName: '#shipping_first_name',
                shippingLastName: '#shipping_last_name',
                shippingCompanyName: '#shipping_company',
                // shippingCountryOrRegion: "#select2-shipping_country-container",
                shippingCountryOrRegion: '(//span[@class="select2-selection__arrow"])[1]',
                shippingCountryOrRegionInput: '.select2-search.select2-search--dropdown .select2-search__field',
                shippingCountryOrRegionValues: '.select2-results ul li',
                shippingStreetAddress: '#shipping_address_1',
                shippingStreetAddress2: '#shipping_address_2',
                shippingTownCity: '#shipping_city',
                // shippingState: "#select2-shipping_state-container",
                shippingState: '(//span[@class="select2-selection__arrow"])[2]',
                shippingStateInput: '.select2-search.select2-search--dropdown .select2-search__field',
                shippingStateValues: '.select2-results ul li',
                shippingZipCode: '#shipping_postcode',
                shippingSaveAddress: '//button[@name="save_address"]',

                // Success Message
                successMessage: '.woocommerce-message',
            },
        },

        // Customer Rma Requests
        cRma: {
            allRequestText: '//h2[normalize-space()="All Requests"]',

            // table
            table: {
                rmaRequestsTable: 'table.my_account_orders.table.table-striped',
                orderIdColumn: '//th[@class="rma-order-id"]',
                vendor: '//th[@class="rma-vendor"]',
                type: '//th[@class="rma-details"]',
                status: '//th[@class="rma-status"]',
            },

            noRowsFound: '//td[normalize-space()="No request found"]',
            numberOfRowsFound: 'table tbody tr.order',

            view: (orderNumber: string) => `//a[contains(text(),'Order #${orderNumber}')]/../..//a[@class="woocommerce-button button view"]`,
            // Conversations
            message: '#message',
            sendMessage: '.woocommerce-button',
        },

        // Customer Payment Methods
        cPaymentMethods: {
            deleteMethod: '.delete',
            addPaymentMethod: '.woocommerce-MyAccount-content .button',

            // Stripe Card
            stripeCardIframe: '#dokan-stripe-card-element iframe',
            stripeCardNumber: '.CardNumberField-input-wrapper .InputElement',
            // stripeCardNumber1: "//input[@name='cardnumber']/..",
            // stripeCardNumber: "//input[@name='cardnumber']",
            stripeCardExpiryDate: '.CardField-expiry .InputElement',
            stripeCardCvc: '.CardField-cvc .InputElement',

            addPaymentMethodCard: '#place_order',
        },

        // Customer Account Details
        cAccountDetails: {
            firstName: '#account_first_name',
            lastName: '#account_last_name',
            displayName: '#account_display_name',
            email: '#account_email',
            currentPassword: '#password_current',
            NewPassword: '#password_1',
            confirmNewPassword: '#password_2',
            saveChanges: '.woocommerce-Button',
        },

        // Customer Followed Vendors
        cVendors: {
            noVendorFound: '.dokan-error',

            // Store card
            storeCard: {
                storeCardDiv: 'div.store-wrapper',
                storeCardHeader: 'div.store-header',
                // header details
                storeBanner: 'div.store-banner',
                openCloseStatus: 'span.dokan-store-is-open-close-status',

                storeCardContent: 'div.store-content',
                // content details
                featuredLabel: 'div.featured-label',
                storeData: 'div.store-data',
                storeAddress: 'p.store-address',
                storePhone: 'p.store-phone',

                storeCardFooter: 'div.store-footer',
                // footer details
                storeAvatar: 'div.seller-avatar',
                visitStore: 'a[title="Visit Store"]',
                followUnFollowButton: 'button.dokan-follow-store-button',
            },

            visitStore: (storeName: string) => `//a[text()='${storeName}']/../../../../..//a[@title='Visit Store']`,
            followUnFollowStore: (storeName: string) => `//a[text()='${storeName}']/../../../../..//button[contains(@class,'dokan-follow-store-button')]`,
            currentFollowStatus: (storeName: string) => `//a[text()='${storeName}']/../../../../..//button[contains(@class,'dokan-follow-store-button')]//span[@class='dokan-follow-store-button-label-current']`,
        },

        // Customer Support Tickets
        cSupportTickets: {
            // Menus
            menus: {
                allTickets: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"All Tickets")]',
                openTickets: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Open Tickets")]',
                closedTickets: '//ul[contains(@class,"subsubsub")]//a[contains(text(),"Closed Tickets")]',
            },

            // table
            table: {
                table: '.dokan-support-table',
                topicColumn: '//th[normalize-space()="Topic"]',
                storeNameColumn: '//th[normalize-space()="Store Name"]',
                titleColumn: '//th[normalize-space()="Title"]',
                statusColumn: '//th[normalize-space()="Status"]',
                dateColumn: '//th[normalize-space()="Date"]',
            },

            noSupportTicketFound: '//div[@class="dokan-error" and contains(text(), "No tickets found!")]',
            firstSupportTicket: '(//div[@class="dokan-support-topics-list"]//tr//td//a)[1]',
            supportTicketLink: (ticketId: string) => `//tr//td[normalize-space()="#${ticketId}"]//a`,

            supportTicketDetails: {
                backToTickets: '//a[contains(text(),"← Back to Tickets")]',

                basicDetails: {
                    basicDetailsDiv: 'div.dokan-support-single-title',
                    ticketTitle: '//span[contains(@class,"dokan-chat-title") and not(contains(@class,"dokan-chat-status"))]',
                    ticketId: 'span.dokan-chat-title.dokan-chat-status',
                },

                chatStatus: {
                    status: 'div.dokan-chat-status-box  span.dokan-chat-status',
                    open: 'div.dokan-chat-status-box span.dokan-chat-status.chat-open',
                    closed: 'div.dokan-chat-status-box span.dokan-chat-status.chat-closed',
                },

                orderReference: {
                    orderReferenceSpan: 'span.order-reference',
                    orderReferenceText: (orderId: string) => `//strong[normalize-space()="Referenced Order #${orderId}"]`,
                    orderReferenceLink: (orderId: string) => `//strong[normalize-space()="Referenced Order #${orderId}"]/..`,
                },

                chatBox: {
                    mainChat: 'div.dokan-dss-chat-box.main-topic',
                    otherChats: 'ul.dokan-support-commentlist',
                },

                replyBox: {
                    addReplyText: '//strong[normalize-space()="Add Reply"]',
                    replyBoxDiv: 'div.dokan-panel.dokan-panel-default.dokan-dss-panel-default',
                    addReply: '#dokan-support-commentform #comment',
                    submitReply: '#submit',
                },

                chatText: (text: string) => `//div[contains(@class, 'dokan-chat-text')]//p[contains(text(),'${text}')]`,

                closedTicket: {
                    closedTicketHeading: '//strong[normalize-space()="Ticket Closed"]',
                    closedTicketMessage: '.dokan-alert.dokan-alert-warning',
                },
            },
        },

        // Customer Bookings
        cBookings: {
            selectCalendarDay: (month: number, day: number) => `//td[@title="This date is available" and @ data-month="${month}"]//a[@data-date="${day}"]`,
            view: (orderNumber: string) => `//a[contains(text(),'Order #${orderNumber}')]/../..//a[@class="woocommerce-button button view"]`,
            bookNow: 'button.wc-bookings-booking-form-button',
        },

        // Customer Auctions Settings
        cAuctions: {
            view: (orderNumber: string) => `//a[contains(text(),'Order #${orderNumber}')]/../..//a[@class="woocommerce-button button view"]`,
            bidValue: '//input[@name="bid_value"]',
            plus: '//input[@value="+"]',
            minus: '//input[@value="-"]',
            bid: '.bid_button',
        },

        // Customer Shop Page
        cShop: {
            shopText: '//h1[normalize-space()="Shop"]',

            map: {
                locationMap: '#dokan-geolocation-locations-map',
                map: '//button[normalize-space()="Map"]',
                satellite: '//button[normalize-space()="Satellite"]',
                fullScreenToggle: '//button[@title="Toggle fullscreen view"]',
                pegman: '//button[@title="Drag Pegman onto the map to open Street View"]',
                zoomIn: '//button[@title="Zoom in"]',
                zoomOut: '//button[@title="Zoom out"]',
                productOnMap: {
                    productPin: '//div[@id="dokan-geolocation-locations-map"]//img[contains(@src, "maps.gstatic.com/mapfiles/transparent.png")]/../..//div[@role="button"]',
                    productCluster: '//div[@id="dokan-geolocation-locations-map"]//div[contains(@style, "dokan-pro/modules/geolocation/assets/images")]',
                    productOnMap: '//span[normalize-space()="To navigate, press the arrow keys."]/..//div',
                    productPopup: '.dokan-geo-map-info-window',
                    productListPopup: '.dokan-geo-map-info-windows-in-popup',
                    productOnList: (productName: string) => `//h3[@class="info-title"]//a[contains(text(),"${productName}")]`,
                    closePopup: 'button.icon-close',
                },
            },

            // Filter
            filters: {
                searchProduct: '.dokan-form-control',
                location: '.location-address input',
                selectCategory: '#product_cat',
                radiusSlider: '.dokan-range-slider',
                search: '.dokan-btn',
            },

            mapResultFirst: '(//div[contains(@class,"pac-container")]//div[@class="pac-item"])[1]',

            searchProductLite: '(//input[@class="search-field"])[1]',

            // sort
            sort: '.woocommerce-ordering .orderby', // popularity, rating, date, price, price-desc

            // Product Card
            productCard: {
                card: '#main .products',
                productDetailsLink: '#main .products .woocommerce-LoopProduct-link',
                productTitle: '#main .products .woocommerce-loop-product__title',
                productPrice: '#main .products .price',
                addToCart: '#main .products a.add_to_cart_button',
                viewCart: 'a.added_to_cart',
                bidNow: '.button.product_type_auction',
            },

            // Pagination
            pagination: {
                pagination: '(//nav[@class="woocommerce-pagination"])[1]',
                previous: '.prev',
                next: '.next',
            },
        },

        // Customer Single Product
        cSingleProduct: {
            // Product Details
            productDetails: {
                productImage: '.woocommerce-product-gallery__wrapper img.wp-post-image',
                productTitle: '.product_title.entry-title',
                quantity: '.quantity input.qty',
                addToCart: '.single_add_to_cart_button',
                viewCart: '.woocommerce .woocommerce-message > .button',
                category: '.product_meta .posted_in',
            },

            // Sub menus
            menus: {
                description: '.tabs description_tab a',
                shipping: '.tabs .shipping_tab a',
                reviews: '.tabs .reviews_tab a',
                questionsAnswers: '.tabs .product_qa_tab a',
                vendorInfo: '.tabs .seller_tab a',
                location: '.tabs .geolocation_tab a',
                moreProducts: '.tabs .more_seller_product_tab a',
                warrantyPolicy: '.tabs .refund_policy_tab a',
                productEnquiry: '.tabs .seller_enquiry_form_tab a',
            },

            // Product description
            description: {
                content: 'div[id="tab-description"] p',
            },

            // Shipping
            shipping: {
                shippingCountryTitle: '#tab-shipping p',
                shippingCountries: '#tab-shipping p strong',
            },

            // Product Reviews
            reviews: {
                noReviews: '.woocommerce-noreviews',
                ratings: '.comment-form-rating .stars',
                rating: (star: string) => `.star-${star}`,
                reviewMessage: '#comment',
                submitReview: '#submit',
                submittedReview: (reviewMessage: string) => `//div[@class='comment_container']//div[@class='description']// p[text()='${reviewMessage}']`,
                awaitingApprovalReview: (reviewMessage: string) =>
                    `//div[@class='comment_container']//div[@class='description']// p[text()='${reviewMessage}']/../..//p//em[@class='woocommerce-review__awaiting-approval']`,
                duplicateCommentAlert: '#error-page .wp-die-message p',
                backFromDuplicateCommentAlert: '//a[contains(text(),"« Back")]',
            },

            // question and answeres
            questionsAnswers: {
                searchInput: 'input[placeholder="Search Questions & Answers"]',
                loginPostQuestion: '//button[text()="Login to post your Question"]',
                postQuestion: '//button[text()="Post your Question"]',
                questionInput: 'textarea#comment.block',
                cacelButton: '//span[text()="Close"]//..',
                cancelPost: '//button[text()="Cancel"]',
                post: '//button[text()="Post"]',
                clearResult: '//button[text()="Clear Result"]',
                matchingResult: 'h3.text-black.text-base',
            },

            // Product vendor info
            vendorInfo: {
                storeName: '.store-name',
                vendor: '.seller-name',
                storeAddress: '.store-address',
            },

            // Product Location
            location: {
                productLocation: 'div[id="tab-geolocation"] address',
                map: '#dokan-geolocation-locations-map',
            },

            // More Products
            moreProducts: {
                noProductsDiv: 'div#tab-more_seller_product',
                moreProductsDiv: '#tab-more_seller_product .products',
                product: '#tab-more_seller_product .product',
            },

            // warrantyPolicy
            warrantyPolicy: {
                content: 'div[id="tab-refund_policy"] p',
            },

            // Product Enquiry
            productEnquiry: {
                productEnquiryHeading: '//h3[normalize-space()="Product Enquiry"]',
                enquiryMessage: '#dokan-enq-message',
                submitEnquiry: 'input.dokan-btn-theme',
                submitEnquirySuccessMessage: '.alert.alert-success',

                // guest user
                guest: {
                    guestName: '#name',
                    guestEmail: '#dokan-product-enquiry #email',
                },
            },

            // related product
            relatedProducts: {
                relatedProductHeading: '//h2[normalize-space()="Related products"]',
                products: '.related.products .products',
            },

            // vendor highlighted info
            vendorHighlightedInfo: {
                vendorInfoDiv: '.dokan-vendor-info-wrap',
                vendorImage: '.dokan-vendor-image',
                vendorInfo: '.dokan-vendor-info',
                vendorName: '.dokan-vendor-name',
                vendorRating: '.dokan-vendor-rating',
            },

            // Get Support
            getSupport: {
                getSupport: '.dokan-store-support-btn',
                closeGetSupportPopup: 'button.icon-close',
                subject: '#dokan-support-subject',
                getSupportOrderId: '.dokan-select',
                message: '#dokan-support-msg',
                submitGetSupport: '#support-submit-btn',
            },

            // Report Abuse
            reportAbuse: {
                reportAbuse: 'a.dokan-report-abuse-button',
                reportReasonByNumber: (reasonNumber: string) => `li:nth-child(${reasonNumber}) input`, // By Number
                reportReasonByName: (reasonName: string) => `//input[@value='${reasonName}']/..`, // By Name
                reportDescription: 'textarea[name="description"]',
                reportSubmit: '#dokan-report-abuse-form-submit-btn',
                reportSubmitSuccessMessage: '#swal2-html-container',
                confirmReportSubmit: '.swal2-confirm',

                // non logged User
                nonLoggedUser: {
                    loginPopup: 'div#dokan-modal-login-form-popup',
                    userName: '#dokan-login-form-username',
                    userPassword: '#dokan-login-form-password',
                    login: '#dokan-login-form-submit-btn',
                    createAccount: '.dokan-btn.dokan-btn-theme',
                },

                // guest user
                guestName: '//input[@name="customer_name"]',
                guestEmail: '//input[@name="customer_email"]',
            },

            // Other Available Vendor
            otherAvailableVendor: {
                OtherAvailableVendorViewStore: '.fa-external-link-alt',
                OtherAvailableVendorViewProduct: '.view',
                OtherAvailableVendorAddToCart: '.fa-shopping-cart',
            },

            // Product addon
            productAddon: {
                addOnSelect: '.wc-pao-addon-select',
            },
        },

        cSpmv: {
            otherAvailableVendorDiv: 'div.dokan-other-vendor-camparison',
            availableVendorDisplayAreaTitle: 'div.dokan-other-vendor-camparison h3',
            availableVendorTable: '.table.dokan-other-vendor-camparison-table',
            otherVendorAvailableTab: 'li#tab-title-vendor_comaprison',

            availableVendorDetails: {
                vendor: {
                    vendorCell: '.table-row .table-cell.vendor',
                    avatar: '.table-row .table-cell.vendor .avatar',
                    vendorLink: '.table-row .table-cell.vendor a',
                },

                price: {
                    priceCell: '.table-row .table-cell.price',
                    priceAmount: '.table-row .table-cell.price .amount',
                },

                rating: {
                    ratingCell: '.table-row .table-cell.rating',
                    rating: '.table-row .table-cell.rating .woocommerce-product-rating',
                },

                actions: {
                    actionsCell: '.table-row .table-cell.action-area',
                    viewStore: '.table-row .table-cell.action-area .link',
                    viewProduct: '.table-row .table-cell.action-area .view',
                    addToCart: '.table-row .table-cell.action-area .cart',

                    viewStoreByVendor: (storeName: string) => `//a[normalize-space()="${storeName}"]/../..//div[@class="table-cell action-area"]//a[@class="dokan-btn tips link"]`,
                    viewProductByVendor: (storeName: string) => `//a[normalize-space()="${storeName}"]/../..//div[@class="table-cell action-area"]//a[@class="dokan-btn tips view"]`,
                    addToCartByVendor: (storeName: string) => `//a[normalize-space()="${storeName}"]/../..//div[@class="table-cell action-area"]//a[@class="dokan-btn tips cart"]`,
                },
            },
        },

        // Customer Store List Page
        cStoreList: {
            storeListText: '//h1[normalize-space()="Store List"]',

            map: {
                locationMap: '#dokan-geolocation-locations-map',
                map: '//button[normalize-space()="Map"]',
                satellite: '//button[normalize-space()="Satellite"]',
                fullScreenToggle: '//button[@title="Toggle fullscreen view"]',
                pegman: '//button[@title="Drag Pegman onto the map to open Street View"]',
                zoomIn: '//button[@title="Zoom in"]',
                zoomOut: '//button[@title="Zoom out"]',
                storeOnMap: {
                    storePin: '//div[@id="dokan-geolocation-locations-map"]//img[contains(@src, "maps.gstatic.com/mapfiles/transparent.png")]/../..//div[@role="button"]',
                    storeCluster: '//div[@id="dokan-geolocation-locations-map"]//div[contains(@style, "dokan-pro/modules/geolocation/assets/images")]',
                    storeOnMap: '//span[normalize-space()="To navigate, press the arrow keys."]/..//div',
                    storePopup: '.dokan-geo-map-info-window',
                    storeListPopup: '.dokan-geo-map-info-windows-in-popup',
                    storeOnList: (storeName: string) => `//h3[@class="info-title"]//a[contains(text(),"${storeName}")]`,
                    closePopup: 'button.icon-close',
                },
            },

            currentLayout: '.entry-content #dokan-seller-listing-wrap',

            // Filters
            filters: {
                filterDiv: 'div#dokan-store-listing-filter-wrap',

                totalStoreCount: 'p.item.store-count',
                filterButton: 'button.dokan-store-list-filter-button',

                // Sortby
                sortBy: '#stores_orderby', // most_recent, total_orders, random

                // View Style
                gridView: '.dashicons-screenoptions',
                listView: '.dashicons-menu-alt',

                filterDetails: {
                    searchVendor: '.store-search-input',
                    location: '.location-address input',
                    radiusSlider: 'input.dokan-range-slider',
                    categoryInput: '.category-input',
                    featured: '#featured',
                    openNow: '#open-now',
                    ratings: '.store-ratings.item',
                    rating: (star: string) => `.star-${star}`,

                    apply: '#apply-filter-btn',
                },
            },

            category: (category: string) => `//div[@class="category-box store_category"]//ul//li[contains(text(), '${category}')]`,
            categoryFirst: '(//div[@class="category-box store_category"]//ul//li)[1]',
            mapResultFirst: '(//div[contains(@class,"pac-container")]//div[@class="pac-item"])[1]',

            // Store card
            storeCard: {
                storeCardDiv: 'div.store-wrapper',
                storeCardHeader: 'div.store-header',
                // header details
                storeBanner: 'div.store-banner',
                openCloseStatus: 'span.dokan-store-is-open-close-status',

                storeCardContent: 'div.store-content',
                // content details
                featuredLabel: 'div.featured-label',
                storeData: 'div.store-data',
                storeAddress: 'p.store-address',
                storePhone: 'p.store-phone',

                storeCardFooter: 'div.store-footer',
                // footer details
                storeAvatar: 'div.seller-avatar',
                visitStore: 'a[title="Visit Store"]',
                followUnFollowButton: 'button.dokan-follow-store-button',
            },

            visitStore: (storeName: string) => `//a[text()='${storeName}']/../../../../..//a[@title='Visit Store']`,
            followUnFollowStore: (storeName: string) => `//a[text()='${storeName}']/../../../../..//button[contains(@class,'dokan-follow-store-button')]`,
            currentFollowStatus: (storeName: string) => `//a[text()='${storeName}']/../../../../..//button[contains(@class,'dokan-follow-store-button')]//span[@class='dokan-follow-store-button-label-current']`,
            followUnFollowStoreSingleStore: 'button.dokan-follow-store-button',
            currentFollowStatusSingleStore: 'span.dokan-follow-store-button-label-current',
        },

        // Customer Single Store
        cSingleStore: {
            singleStoreDiv: 'div.dokan-single-store',
            // Store Profile Summary
            storeProfile: {
                storeProfileSummary: '.dokan-single-store .profile-info-summery',

                storeBanner: '.profile-info-img',

                profileInfoHead: '.profile-info-head',
                profileImage: '.profile-img.profile-img-circle',
                storeName: '.profile-info-head .store-name',

                profileInfo: '.profile-info',
                storeInfo: '.dokan-store-info',
                storeAddress: '.dokan-store-address',
                storePhone: '.dokan-store-phone',
                storeEmail: '.dokan-store-email',
                // storeRating: '.dokan-store-rating',
                // storeOpenClose: '.dokan-store-open-close',
                storeSocial: '.store-social',
            },

            // Store open close time
            storeTime: {
                storeTimeDropDown: '.store-open-close-notice',
                storeTimeDiv: '#vendor-store-times',
                storeTimeHeading: '.store-times-heading',
                storeDays: '#vendor-store-times .store-days',
                storeTimes: '#vendor-store-times .store-times',
            },

            // Social icons
            storeSocialIcons: {
                facebook: '.fa-facebook-square',
                twitter: '.fa-square-x-twitter',
                pinterest: '.fa-pinterest-square',
                linked: '.fa-linkedin',
                youtube: '.fa-youtube-square',
                instagram: '.fa-instagram',
                flickr: '.fa-flickr',
            },

            // Store Tabs
            storeTabs: {
                follow: '.dokan-follow-store-button',
                getSupport: 'button.dokan-store-support-btn',
                share: '.dokan-share-btn',

                products: '//div[@class="dokan-store-tabs"]//a[contains(text(),"Products")]',
                toc: '//div[@class="dokan-store-tabs"]//a[contains(text(),"Terms and Conditions")]',
                reviews: '//div[@class="dokan-store-tabs"]//a[contains(text(),"Reviews")]',
            },

            // Search product
            search: {
                input: '.product-name-search',
                button: '.search-store-products',
            },

            searchedProduct: '.woocommerce-loop-product__title',

            // Sort
            sortBy: '.orderby', // popularity, rating, date, price, price-desc

            storeProducts: '.seller-items',

            // Product Card
            productCard: {
                card: '.seller-items .product',
                productDetailsLink: '.seller-items .product .woocommerce-LoopProduct-link',
                productTitle: '.seller-items .product .woocommerce-loop-product__title',
                productPrice: '.seller-items .product .price',
                addToCart: '.seller-items .product .add_to_cart_button',
            },

            // Pagination
            pagination: '.dokan-pagination',

            // Review
            review: {
                close: 'button.icon-close',
                noReviewsFound: '//span[normalize-space()="No Reviews found"]',
                write: '//button[normalize-space()="Write a Review"]',
                // write: '.add-review-btn',
                edit: '.edit-review-btn',
                rating: '.jq-ry-rated-group.jq-ry-group',
                title: '#dokan-review-title',
                message: '#dokan-review-details',
                submit: '#support-submit-btn',
                submittedReview: (reviewMessage: string) => `//div[@class='review_comment_container']//div[@class='description']// p[text()='${reviewMessage}']`,

                reviewDetails: {
                    author: '#dokan-store-review-single p strong[itemprop="author"]',
                    rating: '#dokan-store-review-single .dokan-rating div',
                    title: '#dokan-store-review-single .description h4',
                    content: '#dokan-store-review-single .description p',
                    edit: '.edit-review-btn',
                },
            },

            // Get Support
            getSupport: {
                // close: '.mfp-close', // todo:  this locator don't exits delete this from all
                close: 'button.icon-close',
                subject: 'input#dokan-support-subject',
                orderId: 'select.dokan-select',
                message: 'textarea#dokan-support-msg',
                submit: 'input#support-submit-btn',

                // guest User
                userName: '#login-name',
                userPassword: '#login-password',
                login: '#support-submit-btn',
                createAccount: '.dokan-btn.dokan-btn-theme',
            },

            // Share Store
            sharePlatForms: {
                facebook: '.jssocials-share-facebook a',
                twitter: '.jssocials-share-twitter a',
                linkedin: '.jssocials-share-linkedin a',
                pinterest: '.jssocials-share-pinterest a',
                mail: '.jssocials-share-email a',
            },

            // terms and conditions
            toc: {
                tocContent: '#store-toc-wrapper #store-toc p',
            },

            // store coupon
            storeCoupon: {
                storeCouponDiv: '.store-coupon-wrap',
                couponTitle: '.coupon-title',
                couponBody: '.coupon-body',
                couponCode: '..coupon-code',
                coupon: (code: string) => `//span[@class="coupon-code"]//strong[normalize-space()="${code}"]`,
            },

            storeContactForm: {
                storeContactForm: '#dokan-form-contact-seller',
                name: '//form[@id="dokan-form-contact-seller"]//input[@placeholder="Your Name"]',
                email: '//form[@id="dokan-form-contact-seller"]//input[@placeholder="you@example.com"]',
                message: '//form[@id="dokan-form-contact-seller"]//textarea[@name="message"]',
                sendMessage: 'input[name="store_message_send"]',
                successMessage: 'div.alert.alert-success',
                privacyPolicy: 'div.dokan-privacy-policy-text p',
                privacyPolicyLink: 'a.dokan-privacy-policy-link',
            },
            storeMap: 'div#dokan-store-location',
            storeOpenCloseTime: 'div.dokan-store-open-close',
        },

        cMyOrders: {
            myOrdersText: '//h1[normalize-space()="My Orders"]',
            recentOrdersText: '//h2[normalize-space()="Recent Orders"]',

            // Table
            table: {
                myOrdersTable: '.shop_table.my_account_orders.table',
                orderColumn: 'th.order-number',
                dateColumn: 'th.order-date',
                statusColumn: 'th.order-status',
                totalColumn: '//span[normalize-space()="Total"]/..',
                vendorColumn: '//span[normalize-space()="Vendor"]/..',
                actionsColumn: 'th.order-actions',
            },

            noOrdersFound: '.dokan-info',
            orderNumber: (orderNumber: string) => `//a[normalize-space()="${orderNumber}"]`,
            orderView: (orderNumber: string) => `//a[normalize-space()="${orderNumber}"]/../..//a[@class="button view"]`,
            orderPay: (orderNumber: string) => `//a[normalize-space()="${orderNumber}"]/../..//a[@class="button pay"]`,
            orderCancel: (orderNumber: string) => `//a[normalize-space()="${orderNumber}"]/../..//a[@class="button cancel"]`,
            orderRequestWarranty: (orderNumber: string) => `//a[normalize-space()="${orderNumber}"]/../..//a[@class="button request_warranty"]`,
        },

        cRequestForQuote: {
            singleProductDetails: {
                addToQuote: '.cart a.dokan_request_button',
                viewQuote: '.added_to_quote',
            },

            orderDetails: {
                quoteNoteOnOrderDetails: '//td[normalize-space()="Created by converting quote to order."]',
            },

            // request for quote
            requestForQuote: {
                requestForQuoteText: '//h1[normalize-space()="Request for Quote"]',
                noQuotesFound: '//p[@class="cart-empty"]',
                returnToShop: '//a[normalize-space()="Return To Shop"]',

                quoteItemDetails: {
                    quoteDetailsText: '//h2[normalize-space()="Quote Details"]',

                    table: {
                        quoteDetailsTable: '//table[contains(@class,"quote_details") and contains(@class,"cart")]',
                        productColumn: '//th[@class="product-name"]',
                        priceColumn: '//th[normalize-space()="Price"]',
                        offeredPriceColumn: '//th[normalize-space()="Offered Price"]',
                        quantityColumn: '//th[@class="product-quantity"]',
                        subtotalColumn: '//th[normalize-space()="Subtotal"]',
                        offeredSubtotalColumn: '//th[normalize-space()="Offered Subtotal"]',
                    },
                },

                quoteTotals: {
                    quoteTotalsTitle: '//h2[normalize-space()="Quote totals"]',
                    quoteTotalsDiv: '.cart_totals',
                    quoteTotalsTable: '//div[@class="cart_totals"]//table[contains(@class,"table_quote_totals")]',

                    subTotalText: '//tr[@class="cart-subtotal"]',
                    offeredPriceSubtotalText: '//tr[@class="cart-subtotal offered"]//th',

                    subTotalValue: '//td[@data-title="Subtotal (standard)"]',
                    offeredPriceSubtotalValue: '//td[@data-title="Offered Price Subtotal"]',
                },

                offeredPriceInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//input[@class="input-text offered-price-input text"]`,
                quantityInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//div[@class="quantity"]//input`,

                updateQuote: 'button#dokan_update_quote_btn',
                placeQuote: 'button[name="dokan_checkout_place_quote"]',

                guest: {
                    fullName: 'input[name="name_field"]',
                    email: 'input[name="email_field"]',
                    companyName: 'input[name="company_field"]',
                    phoneNumber: 'input[name="phone_field"]',
                },

                message: '.woocommerce-message',
            },

            // requested quote
            requestedQuote: {
                requestedQuoteText: '//h1[normalize-space()="Requested Quotes"]',

                noQuoteMessage: '//div[contains(@class, "woocommerce-message woocommerce-message--info")]',
                goToShop: '//a[normalize-space()="Go to shop"]',

                // table
                table: {
                    quoteTable: 'table.my_account_quotes',
                    quoteColumn: '//th[normalize-space()="Quote #"]',
                    quoteNameColumn: '//th[normalize-space()="Quote Name"]',
                    statusColumn: '//th[normalize-space()="Status"]',
                    dateColumn: '//th[normalize-space()="Date"]',
                    actionColumn: '//th[normalize-space()="Action"]',
                },

                pagination: 'ul.pagination',

                viewQuoteDetails: (quoteId: string) => `//td[normalize-space()="Quote ${quoteId}"]/..//a[@class="woocommerce-button button view"]`,

                // requested quote details
                requestedQuoteDetails: {
                    requestedQuoteText: '//h1[normalize-space()="Requested Quotes"]',

                    basicDetails: {
                        basicDetailsTable: '(//table[@class="shop_table shop_table_responsive table_quote_totals dokan-table order-items"])[1]',
                        quoteNumberText: '//th[normalize-space()="Quote #"]',
                        quoteDateText: '//th[normalize-space()="Quote Date"]',
                        quoteStatusText: '//th[normalize-space()="Current Status"]',

                        quoteNumberValue: '//th[normalize-space()="Quote #"]/..//td',
                        quoteDateValue: '//th[normalize-space()="Quote Date"]/..//td',
                        quoteStatusValue: '//th[normalize-space()="Current Status"]/..//td',
                    },

                    viewOrder: '//a[normalize-space()="View Order"]',

                    quoteItemDetails: {
                        quoteDetailsText: '//h2[normalize-space()="Quote Details"]',

                        table: {
                            quoteDetailsTable: '//table[contains(@class,"quote_details") and contains(@class,"cart")]',
                            productColumn: '//th[@class="product-name"]',
                            priceColumn: '//th[normalize-space()="Price"]',
                            offeredPriceColumn: '//th[normalize-space()="Offered Price"]',
                            quantityColumn: '//th[@class="product-quantity"]',
                            subtotalColumn: '//th[normalize-space()="Subtotal"]',
                            offeredSubtotalColumn: '//th[normalize-space()="Offered Subtotal"]',
                        },
                    },

                    quoteTotals: {
                        quoteTotalsTitle: '//h2[normalize-space()="Quote totals"]',
                        quoteTotalsDiv: '.cart_totals',
                        quoteTotalsTable: '//div[@class="cart_totals"]//table[contains(@class,"table_quote_totals")]',

                        subTotalText: '//tr[@class="cart-subtotal"]',
                        offeredPriceSubtotalText: '//tr[@class="cart-subtotal offered"]//th',

                        subTotalValue: '//td[@data-title="Subtotal (standard)"]',
                        offeredPriceSubtotalValue: '//td[@data-title="Offered Price Subtotal"]',
                    },

                    offeredPriceInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//input[@class="input-text offered-price-input text"]`,
                    quantityInput: (productName: string) => `//a[normalize-space()="${productName}"]/../..//div[@class="quantity"]//input`,

                    updateQuote: 'button[name="dokan_update_quote"]',

                    message: '.woocommerce-message',
                },
            },
        },

        // Customer Header Cart
        cHeaderCart: {
            // Cart Content
            cartContent: '.cart-contents .woocommerce-Price-amount',
            removeItem: '.remove',
            viewCart: '//p[contains(@class,"woocommerce-mini-cart__buttons")]//a[contains(text(),"View cart")]',
            checkout: '//p[contains(@class,"woocommerce-mini-cart__buttons")]//a[contains(text(),"Checkout")]',
        },

        // Customer Cart
        cCart: {
            cartPageHeader: 'h1.entry-title',

            // Edit Cart
            cartItem: (productName: string) => `//tr[@class='wc-block-cart-items__row']//a[@class= 'wc-block-components-product-name' and contains(text(),'${productName}')]`,
            removeItem: (productName: string) => `//a[contains(text(),'${productName}')]/..//button[@class='wc-block-cart-item__remove-link']`,
            quantity: (productName: string) => `//a[contains(text(),'${productName}')]/..//input[@class='wc-block-components-quantity-selector__input']`,
            addCoupon: 'a[aria-label="Add a coupon"]',
            couponCode: 'form#wc-block-components-totals-coupon__form input',
            applyCoupon: 'form#wc-block-components-totals-coupon__form  button',
            removeCoupon: (couponCode: string) => `//span[contains(text(), '${couponCode.toLowerCase()}')]/..//button`,

            cartDetails: {
                cartTotal: 'tr.cart-subtotal span.woocommerce-Price-amount.amount',
                shipping: '//ul[@id="shipping_method"]//input[@checked="checked"]/..//span[@class="woocommerce-Price-amount amount"]',
                tax: 'tr.tax-rate span.woocommerce-Price-amount.amount',
                orderTotal: 'tr.order-total span.woocommerce-Price-amount.amount',
            },

            // Shipping Methods
            shippingMethod: (vendorName: string, shippingMethod: string) => `//th[contains(text(),'Shipping:  ${vendorName}')]/..//label[contains(text(),'${shippingMethod}')]/..//input`, // For Vendor-Wise or Admin Shipping Method
            vendorShippingMethod: (shippingMethod: string) => `//label[contains(text(),'${shippingMethod}')]/..//input`, // For Unique Shipping Method

            // Proceed to Checkout
            // proceedToCheckout: '.checkout-button.button.wc-forward, .wp-block-woocommerce-proceed-to-checkout-block a', //todo: remove in future
            // proceedToCheckout: 'div.wc-block-cart__submit-container a.wc-block-cart__submit-button',
            proceedToCheckout: '//a[.="Proceed to Checkout"]',
            // proceedToCheckout: '//span[contains (text(), "Proceed to Checkout")]/..',

            // Remove All Item
            productCrossIcon: '.product-remove a',
            removeFirstItem: '(//button[@class="wc-block-cart-item__remove-link"])[1]',
            cartEmptyMessage: '.wp-block-woocommerce-empty-cart-block .wc-block-cart__empty-cart__title',
        },

        cWholesale: {
            shop: {
                wholesalePrice: 'span.dokan-wholesale-price',
                wholesaleAmount: 'span.dokan-wholesale-price span.woocommerce-Price-amount.amount',
            },

            singleProductDetails: {
                wholesaleInfo: 'p.dokan-wholesale-meta',
                wholesalePrice: 'p.dokan-wholesale-meta .woocommerce-Price-amount.amount',
                minimumQuantity: '(//p[@class="dokan-wholesale-meta"]//strong)[2]',
            },
        },

        // Customer Checkout
        cCheckout: {
            checkoutPageHeader: '.entry-title',

            orderDetails: {
                orderDetailsHeading: 'h3#order_review_heading',
                orderDetailsDiv: 'div#order_review',

                cartTotal: 'tr.cart-subtotal span.woocommerce-Price-amount.amount',
                shipping: '//ul[@id="shipping_method"]//input[@checked="checked"]/..//span[@class="woocommerce-Price-amount amount"]',
                tax: 'tr.tax-rate span.woocommerce-Price-amount.amount',
                orderTotal: 'tr.order-total span.woocommerce-Price-amount.amount',
            },

            // Billing Details
            billingAddress: {
                billingFirstName: '#billing_first_name',
                billingLastName: '#billing_last_name',
                billingCompanyName: '#billing_company',
                billingCompanyIDOrEuidNumber: '#billing_dokan_company_id_number',
                billingVatOrTaxNumber: '#billing_dokan_vat_number',
                billingNameOfBank: '#billing_dokan_bank_name',
                billingBankIban: '#billing_dokan_bank_iban',
                // billingCountryOrRegion: "#select2-billing_country-container",
                billingCountryOrRegion: '.select2-selection__arrow',
                billingCountryOrRegionValues: '.select2-results ul li',
                billingStreetAddress: '#billing_address_1',
                billingStreetAddress2: '#billing_address_2',
                billingTownCity: '#billing_city',
                billingPhone: '#billing_phone',
                billingEmailAddress: '#billing_email',
                billingState: '#select2-billing_state-container',
                billingStateValues: '.select2-results ul li',
                billingZipCode: '#billing_postcode',
            },

            // Shipping Details
            shippingAddress: {
                shipToADifferentAddress: '#ship-to-different-address-checkbox',
                shippingFirstName: '#shipping_first_name',
                shippingLastName: '#shipping_last_name',
                shippingCompanyName: '#shipping_company',
                // shippingCountryOrRegion: "#select2-shipping_country-container",
                shippingCountryOrRegion: '.select2-selection__arrow',

                shippingCountryOrRegionValues: '.select2-results ul li',
                shippingStreetAddress: '#shipping_address_1',
                shippingStreetAddress2: '#shipping_address_2',
                shippingTownCity: '#shipping_city',
                // shippingState: "#select2-shipping_state-container",
                shippingState: '.select2-selection__arrow',
                shippingStateValues: '.select2-results ul li',
                shippingZipCode: '#shipping_postcode',
            },

            // Order Comments
            orderComments: '#order_comments',

            // Shipping Methods
            shippingMethod: (vendorName: string, shippingMethod: string) => `//th[contains(text(),'Shipping:  ${vendorName}')]/..//label[contains(text(),'${shippingMethod}')]/..//input`, // For Vendor-Wise or Admin Shipping Method
            vendorShippingMethod: (shippingMethod: string) => `//label[contains(text(),'${shippingMethod}')]/..//input`, // For Unique Shipping Method

            // Payment Methods
            directBankTransfer: '.payment_method_bacs label, label[for="radio-control-wc-payment-method-options-bacs"]',
            checkPayments: '.payment_method_cheque label, label[for="radio-control-wc-payment-method-options-cheque"]',
            cashOnDelivery: '.payment_method_cod label, label[for="radio-control-wc-payment-method-options-cod"]',
            paypalAdaptive: '.payment_method_dokan_paypal_adaptive label',
            stripeConnect: '.wc_payment_method.payment_method_dokan-stripe-connect label[for="payment_method_dokan-stripe-connect"]',
            wireCardCreditCard: '.payment_method_dokan-moip-connect label',
            paypalMarketPlace: '.wc_payment_method.payment_method_dokan_paypal_marketplace label',
            stripeExpress: '.wc_payment_method.payment_method_dokan_stripe_express label',

            // Place Order
            placeOrder: '#place_order, button.wc-block-components-checkout-place-order-button',
            // placeOrder: '//button[contains(@class,"wc-block-components-checkout-place-order-button")]',
            // placeOrder: '//button[contains(@class,"components-button wc-block-components-button")]',
        },

        cPayWithStripe: {
            strip: '#payment_method_dokan-stripe-connect',
            savedTestCard4242: '//label[contains(text(),"Visa ending in 4242")]/..//input',
            userNewPaymentMethod: '#wc-dokan-stripe-connect-payment-token-new',
            stripeConnectIframe: 'div#dokan-stripe-card-element iframe[title="Secure card payment input frame"]',
            creditCard: '#card-tab',
            cardNumber: 'input[name="cardnumber"]',
            expDate: 'input[name="exp-date"]',
            cvc: 'input[name="cvc"]',
            savePaymentInformation: '#wc-dokan-stripe-connect-new-payment-method',
        },

        cPayWithPaypalMarketPlace: {
            paypalMarketPlace: '.payment_method_dokan_paypal_marketplace label',
        },

        cPayWithRazorpay: {
            razorPay: '.payment_method_dokan_razorpay label',
        },

        cPayWithMangoPay: {
            mangoPay: '.payment_method_dokan_mangopay label',
            creditCard: '//input[@name="dokan_mangopay_payment_type"]',
            cardType: '#dokan-mangopay-card-type',
            registeredCard: '#dokan-mangopay-payment-type-registeredcard',
            registerCardType: '#registered_card_type',
            cardNumber: '#dokan-mp-ccnumber',
            cvc: '#dokan-mp-cccrypto',
            expDateMonth: '#preauth_ccdate_month',
            expDateYear: '#preauth_ccdate_year',
            register: '#save_preauth_card_button',
        },

        cPayWithStripeExpress: {
            savedTestCard4242: '//label[contains(text(),"Visa ending in 4242")]/..//input',
            userNewPaymentMethod: '#wc-dokan_stripe_express-payment-token-new',
            savePaymentInformation: '#wc-dokan_stripe_express-new-payment-method',
            stripeExpressIframe: '#dokan-stripe-express-element iframe',
            creditCard: '#card-tab',
            gPay: '#google_pay-tab',
            iDeal: '#ideal-tab',
            iDealBanks: '#Field-bankInput',
            cardNumber: '#Field-numberInput',
            expDate: '#Field-expiryInput',
            cvc: '#Field-cvcInput',
        },

        cDeliveryTime: {
            deliveryTimeDiv: 'div#dokan-delivery-time-box',

            deliveryDetailsText: '//h3[normalize-space()="Delivery details"]',
            deliveryTimeZone: 'div.delivery-timezone.dokan-delivery-time-tooltip',

            deliveryTimeBody: 'div.delivery-time-body',
            vendorInfo: 'div.delivery-time-body .vendor-info',

            delivery: '//div[@class="dokan-store-location-selector"]//div[@data-selector="delivery"]',
            storePickup: '//div[@class="dokan-store-location-selector"]//div[@data-selector="store-pickup"]',

            deliveryTimeInput: '//input[@class="delivery-time-date-picker form-control input"]',
            deliveryTimeInputHidden: '//input[@class="delivery-time-date-picker flatpickr-input"]',
            deliveryDate: (date: string) => `//div[contains(@class,"flatpickr-calendar")]//div[@class="dayContainer"]//span[contains(@class,"flatpickr-day") and @aria-label="${date}"]`,

            timePicker: 'select.delivery-time-slot-picker',
            locationPicker: 'select.delivery-store-location-picker',

            orderDetails: {
                deliveryTimeDetails: 'div#dokan-delivery-time-slot-order-details',
                storePickupDetails: 'div#dokan-store-location-order-details',
                deliveryTimeTitle: 'div#dokan-delivery-time-slot-order-details .main strong',
                storePickupTitle: 'div#dokan-store-location-order-details .main strong',
            },
        },

        cOrderReceived: {
            orderReceivedHeading: '//h1[normalize-space()="Order received"]',
            orderReceivedSuccessMessage: '.woocommerce-notice.woocommerce-notice--success.woocommerce-thankyou-order-received',

            // Order Details
            orderDetails: {
                // basic info
                orderNumber: '.woocommerce-order-overview__order.order strong',
                orderDate: '.woocommerce-order-overview__date.date strong',
                email: '.woocommerce-order-overview__email.email strong',
                total: '.woocommerce-order-overview__total.total strong',
                paymentMethod: '.woocommerce-order-overview__payment-method.method strong',

                subTotal: '//th[normalize-space()="Subtotal:"]//..//span[@class="woocommerce-Price-amount amount"]',
                shippingMethod: '//th[normalize-space()="Shipping:"]/..//small',
                shippingCost: '//th[normalize-space()="Shipping:"]/..//span[@class="woocommerce-Price-amount amount"]',
                tax: '//th[normalize-space()="Tax:"]//..//span[@class="woocommerce-Price-amount amount"]',
                orderPaymentMethod: '//th[normalize-space()="Payment method:"]//..//td',
                orderTotal: '//th[normalize-space()="Total:"]//..//span[@class="woocommerce-Price-amount amount"]',

                subOrders: {
                    subOrders: '//h2[normalize-space()="Sub Orders"]',
                    multiVendorNote: '.dokan-info',
                    multiOrders: '.my_account_orders',
                    // note: 'This order has products from multiple vendors. So we divided this order into multiple vendor orders. Each order will be handled by their respective vendor independently.'
                },
            },

            // customer details
            customerDetails: {
                customerDetailsSection: '.woocommerce-customer-details .addresses',
                // Billing address
                billingAddressHeading: '//h2[normalize-space()="Billing address"]',
                billingAddress: '.woocommerce-column--billing-address  address',
                // shipping address
                shippingAddressHeading: '//h2[normalize-space()="Shipping address"]',
                shippingAddress: '.woocommerce-column--shipping-address  address',
            },

            getSupport: '.dokan-store-support-btn',
        },

        cOrderDetails: {
            // Order Details
            orderDetails: {
                orderDetailsHeading: '.woocommerce-order-details',
                orderDetailsTable: '.woocommerce-table--order-details',

                orderNumber: '.order-number',
                orderDate: '.order-date',
                orderStatus: '.order-status',

                // title
                subTotalTitle: '//th[normalize-space()="Subtotal:"]',
                shipping: '//th[normalize-space()="Shipping:"]',
                paymentMethodTitle: '//th[normalize-space()="Payment method:"]',
                orderTotalTitle: '//th[normalize-space()="Total:"]',

                // values
                subTotalValue: '//th[normalize-space()="Subtotal:"]//..//span[@class="woocommerce-Price-amount amount"]',
                shippingMethodValue: '//th[normalize-space()="Shipping:"]/..//small',
                shippingCostValue: '//th[normalize-space()="Shipping:"]/..//span[@class="woocommerce-Price-amount amount"]',
                paymentMethodValue: '//th[normalize-space()="Payment method:"]//..//td',
                orderTotalValue: '//th[normalize-space()="Total:"]//..//span[@class="woocommerce-Price-amount amount"]',
            },

            // order update  [shows when order note exists]
            orderUpdates: {
                orderReceivedHeading: '//h2[normalize-space()="Order updates"]',
                allOrderNotes: 'ol.woocommerce-OrderUpdates.commentlist.notes',
                singleOrderNote: 'div.woocommerce-OrderUpdate-description.description p',
                orderNote: (note: string) => `//div[@class="woocommerce-OrderUpdate-description description"]//p[contains(text(),"${note}")]`,
            },

            // customer details
            customerDetails: {
                customerDetailsSection: '.woocommerce-customer-details .addresses',
                // Billing address
                billingAddressHeading: '//h2[normalize-space()="Billing address"]',
                billingAddress: '.woocommerce-column--billing-address  address',
                // shipping address
                shippingAddressHeading: '//h2[normalize-space()="Shipping address"]',
                shippingAddress: '.woocommerce-column--shipping-address  address',
            },

            orderAgain: '.order-again .button',
            getSupport: '.dokan-store-support-btn',
        },

        cDokanSelector: {
            dokanAlertSuccessMessage: '.white-popup.dokan-alert-success',
            dokanSuccessMessage: '.dokan-alert.dokan-alert-success',
            dokanAlertClose: 'button.icon-close',
        },

        cWooSelector: {
            wooCommerceSuccessMessage: '.woocommerce-message',
            wooCommerceError: '.woocommerce-error',
            wooCommerceInfo: '.woocommerce-info',
            wooCommerceNoriceBanner: 'div.wc-block-components-notice-banner',
            wooCommerceNoriceBannerContent: 'div.wc-block-components-notice-banner__content',
        },
    },
};

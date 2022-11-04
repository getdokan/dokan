import {faker} from '@faker-js/faker'
import {helpers} from './helpers'


export const data = {

    // Fixed  test data

    PluginSlugList: ['dokan-lite', 'dokan-pro', 'woocommerce', 'woocommerce-bookings', 'woocommerce-product-add-ons', 'woocommerce-simple-auction', 'woocommerce-subscriptions', 'elementor', 'elementor-pro',],
    // wooCommerce
    // Shipping
    shippingMethods: ['flat_rate', 'free_shipping', 'local_pickup', 'dokan_table_rate_shipping', 'dokan_distance_rate_shipping', 'dokan_vendor_shipping'],
    taxStatus: ['taxable', 'none'],
    freeShippingRequires: ['coupon', 'min_amount', 'either', 'both'],
    // Payment
    razorpayDisbursementMode: ['Immediate', 'On Order Complete', 'Delayed'],
    payPalMarketplaceDisbursementMode: ['Immediate', 'On Order Complete', 'Delayed'],
    payPalMarketplacePaymentButtonType: ['Smart Payment Buttons', 'Standard Button'],
    mangopayAvailableCreditCards: ['CB/Visa/Mastercard', 'Maestro*', 'Bancontact/Mister Cash', 'Przelewy24*', 'Diners*', 'PayLib', 'iDeal*', 'MasterPass*', 'Bankwire Direct*'],
    mangopayAvailableDirectPaymentServices: ['Sofort*', 'Giropay*'],
    mangopayTransferFunds: ['On payment completed', 'On order completed', 'Delayed'],
    mangopayTypeOfVendors: ['Individuals', 'Business', 'Either'],
    mangopayBusinessRequirement: ['Organizations', 'Soletraders', 'Businesses', 'Any'],
    stripeExpressDisbursementMode: ['On payment completed', 'On order completed', 'Delayed'],
    stripeExpressPaymentMethods: ['Credit/Debit Card', 'iDEAL'],
    stripeExpressButtonType: ['default', 'buy', 'donate', 'book'],
    stripeExpressButtonTheme: ['dark', 'light', 'light-outline'],
    stripeExpressButtonLocations: ['Checkout', 'Product', 'Cart'],
    stripeExpressButtonSize: ['default', 'medium', 'large'],
    // Dokan
    // Setup Wizard
    setupWizardShippingFeeRecipient: ['Vendor', 'Admin'],
    setupWizardTaxFeeRecipient: ['Vendor', 'Admin'],
    setupWizardMapApiSource: ['Google Maps', 'Mapbox'],
    setupWizardSellingProductTypes: ['Physical', 'Digital', 'Both'],
    setupWizardCommissionType: ['Flat', 'Percentage', 'Combine'],

    // Admin

    // General Settings
    sellingProductTypes: ['sell_both', 'sell_physical', 'sell_digital'],
    storeCategory: ['none', 'Single', 'Multiple'],
    // Selling Options Settings
    commissionType: ['flat', 'percentage', 'combine'],
    shippingFeeRecipient: ['seller', 'admin'],
    taxFeeRecipient: ['seller', 'admin'],
    newProductStatus: ['publish', 'pending'],
    productCategory: ['single', 'multiple'],
    // Withdraw
    quarterlyScheduleMonth: ['january', 'february', 'march'],
    quarterlyScheduleWeek: ['1', '2', '3', 'L'],
    quarterlyScheduleDay: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    monthlyScheduleWeek: ['1', '2', '3', 'L'],
    monthlyScheduleDay: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    biweeklyScheduleWeek: ['1', '2'],
    biweeklyScheduleDay: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    weeklyScheduleDay: ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    // Privacy Policy Settings
    privacyPolicy: ['2', '3', '4', '5', '6', '7', '8', '9', '10'],
    // getSupport settings
    displayOnSingleProductPage: ['above_tab', 'inside_tab', 'dont_show'],
    // Rma Settings
    rmaOrderStatus: ['wc-pending', 'wc-processing', 'wc-on-hold', 'wc-completed', 'wc-cancelled', 'wc-refunded', 'wc-failed'],
    enableRefundRequests: ['yes', 'no'],
    enableCouponRequests: ['yes', 'no'],
    // Wholesale Customer Settings
    needApprovalForCustomer: ['yes', 'no'],
    // Delivery Time Settings
    storeOpeningClosingTime: ['12:00 AM', '11:30 PM'],
    // Geolocation Settings
    locationMapPosition: ['top', 'left', 'right'],
    showMap: ['all', 'store_listing', 'shop'],
    radiusSearchUnit: ['km', 'miles'],
    // Spmv Settings
    availableVendorSectionDisplayPosition: ['below_tabs', 'inside_tabs', 'after_tabs'],
    showSpmvProducts: ['show_all', 'min_price', 'max_price', 'top_rated_vendor'],
    // Vendor Subscription Settings
    subscription: ['2', '4', '5', '6', '8', '9', '10', '11', '15', '-1'],
    productStatus: ['publish', 'pending', 'draft'],
    // Products
    productTypes: ['simple', 'grouped', 'external', 'variable', 'product_pack', 'subscription', 'variable-subscription', 'booking', 'auction'],
    productTaxStatus: ['taxable', 'shipping', 'none'],
    productTaxClass: ['taxable', 'reduced-rate', 'zero-rate'],
    subscriptionExpire: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'],
    subscriptionPeriodInterval: ['0', '1', '2', '3', '4', '5', '6'],
    subscriptionPeriod: ['day', 'week', 'month', 'year'],
    subscriptionTrialPeriod: ['day', 'week', 'month', 'year'],
    auctionItemCondition: ['new', 'used'],
    auctionType: ['normal', 'reverse'],
    bookingDurationType: ['fixed', 'customer'],
    bookingDurationUnit: ['month', 'day', 'hour', 'minute'],
    calenderDisplayMode: ['', 'always_visible'],

    // Vendor

    withdrawPaymentMethods: ['paypal', 'bank', 'dokan_custom', 'skrill'],
    reserveBalance: ['0', '5', '10', '15', '50', '100', '200', '300', '500', '1000', '2000', '3000', '5000', '10000'],
    orderStatus: ['wc-pending', 'wc-processing', 'wc-on-hold', 'wc-completed', 'wc-cancelled', 'wc-refunded', 'wc-failed'],
    // Rma Settings
    rmaType: ['no_warranty', 'included_warranty', 'addon_warranty'],
    rmaLength: ['limited', 'lifetime'],
    rmaLengthDuration: ['days', 'weeks', 'months', 'years'],
    // Auction
    itemCondition: ['new', 'used'],
    actionType: ['normal', 'reverse'],
    // Shipping Policy
    shippingPolicy: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], // TODO: replace with select text values
    vendorShippingMethods: ['flat_rate', 'free_shipping', 'local_pickup', 'dokan_table_rate_shipping', 'dokan_distance_rate_shipping'],
    flatRateCalculationType: ['class', 'order'],
    flatRateCalculationType1: ['item', 'line', 'class'], // TODO: replace with select text values, one option missing
    tableRateTaxIncludedInShippingCosts: ['yes', 'no'],
    distanceRateTransportationMode: ['driving', 'walking', 'Bicycling'],
    distanceRateAvoid: ['none', 'tolls', 'highways', 'ferries'],
    distanceRateDistanceUnit: ['metric', 'imperial'],
    //addon
    addonType: ['multiple_choice', 'checkbox', 'custom_text', 'custom_textarea', 'file_upload', 'custom_price', 'input_multiplier', 'heading'],
    addonDisplayAs: ['select', 'radiobutton', 'images'],
    addonFormatTitle: ['label', 'heading', 'hide'],
    addonOptionPriceType: ['flat_fee', 'quantity_based', 'percentage_based'],
    //vendor store settings
    vacationClosingStyle: ['instantly', 'datewise'],
    //Stripe express
    iDealBanks: ['abn_amro', 'asn_bank', 'bunq', 'handelsbanken', 'ing', 'knab', 'rabobank', 'regiobank', 'revolut', 'sns_bank', 'triodos_bank', 'van_lanschot'],
    //bank details
    bankAccountType: ['personal', 'business'],


    // Generated  test data

    user: {
        username: () => faker.name.firstName('male'),
        userDetails: {
            firstName: () => faker.name.firstName('male'),
            lastName: () => faker.name.lastName('male'),
            role: 'customer',
        }
    },

    product: {
        publishSuccessMessage: 'Product published. ',
        draftUpdateSuccessMessage: 'Product draft updated. ',
        pendingProductUpdateSuccessMessage: 'Product updated. ',

        status: {
            publish: 'publish',
            draft: 'draft',
            pending: 'pending'
        },

        stockStatus: {
            outOfStock: 'outofstock'
        },

        type: {
            simple: 'simple',
            variable: 'variable',
            simpleSubscription: 'subscription',
            variableSubscription: '',
            external: 'external',
            vendorSubscription: 'product_pack',
        },

        name: {
            simple: () => faker.commerce.productName() + (' (Simple)'),
            variable: () => faker.commerce.productName() + (' (Variable)'),
            external: () => faker.commerce.productName() + (' (External)'),
            grouped: () => faker.commerce.productName() + (' (Grouped)'),
            simpleSubscription: () => faker.commerce.productName() + (' (Simple Subscription)'),
            variableSubscription: () => faker.commerce.productName() + (' (Variable Subscription)'),
            dokanSubscription: {
                nonRecurring: () => 'Dokan Subscription ' + faker.helpers.arrayElement(['Gold', 'Silver', 'Platinum', 'Premium'],) + ' ' + faker.random.alpha({
                    count: 5,
                    casing: 'upper'
                },) + (' (Product Pack)'),
            },
            booking: () => faker.commerce.productName() + (' (Booking)'),
            auction: () => faker.commerce.productName() + (' (Auction)'),
        },
        price: {
            // price: faker.commerce.price(100, 200, 2),
            // price: faker.datatype.number({min:1, max:200, precision: 0.01}),
            // price: faker.finance.amount(1, 200, 2),
            price_int: () => faker.finance.amount(100, 200, 0),
            price_random: () => faker.finance.amount(100, 200, faker.helpers.arrayElement([0, 2])), // 0 = no decimals, 2 = 2 decimals
            price_frac: () => faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2])),
            price_frac_comma: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            auctionPrice: () => faker.commerce.price(10, 100, 0),
            price: () => data.product.price.price_frac_comma()
        },
        category: {
            unCategorized: 'Uncategorized',
            clothings: 'Clothings',
            categories: faker.helpers.arrayElement(["Electronic Devices", "Electronic Accessories", "Men's Fashion", "Clothings", "Women's Fashion"]),
        },
        store: {
            adminStore: process.env.ADMIN + 'store',
            vendorStore1: process.env.VENDOR + 'store',
            vendorStore2: process.env.VENDOR1 + 'store',
        },

        attribute: {
            size: {
                attributeName: 'size',
                attributeTerms: ['s', 'l', 'm'],
            },
            color: {
                attributeName: 'color',
                attributeTerms: ["red", "blue", "black", "yellow", "white"]
            },
        },

        simple: {
            productType: 'simple',
            productName: () => faker.commerce.productName() + (' (Simple)'),
            category: 'Uncategorized',
            regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            storeName: 'vendorStore1',
            status: 'publish',
            stockStatus: false,
        },

        variable: {
            productType: 'variable',
            productName: () => faker.commerce.productName() + (' (Variable)'),
            category: 'Uncategorized',
            regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            storeName: 'vendorStore1',
            status: 'publish',
            stockStatus: false,
            attribute: 'size',
            attributeTerms: ['s', 'l', 'm'],
            variations: {
                linkAllVariation: 'link_all_variations',
                variableRegularPrice: 'variable_regular_price',
            },
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        external: {
            productType: 'external',
            productName: () => faker.commerce.productName() + (' (External)'),
            productUrl: '/product/p1_v1/',
            buttonText: 'Buy product',
            category: 'Uncategorized',
            regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            storeName: 'vendorStore1',
            status: 'publish',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        simpleSubscription: {
            productType: 'subscription',
            productName: () => faker.commerce.productName() + (' (Simple Subscription)'),
            category: 'Uncategorized',
            regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            subscriptionPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            subscriptionPeriodInterval: '1',
            subscriptionPeriod: 'month',
            expireAfter: '0',
            subscriptionTrialLength: '0',
            subscriptionTrialPeriod: 'day',
            storeName: 'vendorStore1',
            status: 'publish',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        variableSubscription: {
            productType: 'variable-subscription',
            productName: () => faker.commerce.productName() + (' (Variable Subscription)'),
            category: 'Uncategorized',
            subscriptionPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            subscriptionPeriodInterval: '1',
            subscriptionPeriod: 'month',
            expireAfter: '0',
            subscriptionTrialLength: '0',
            subscriptionTrialPeriod: 'day',
            storeName: 'vendorStore1',
            status: 'publish',
            attribute: 'size',
            attributeTerms: ['s', 'l', 'm'],
            variations: {
                linkAllVariation: 'link_all_variations',
                variableRegularPrice: 'variable_regular_price',
            },
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        vendorSubscription: {
            productType: 'product_pack',
            productName: () => 'Dokan Subscription ' + faker.helpers.arrayElement(['Gold', 'Silver', 'Platinum', 'Premium'],) + ' ' + faker.random.alpha({
                count: 5,
                casing: 'upper'
            },) + (' (Product Pack)'),
            category: 'Uncategorized',
            regularPrice: () => (faker.finance.amount(100, 200, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            numberOfProducts: '-1',
            packValidity: '0',
            advertisementSlot: '-1',
            expireAfterDays: '-1',
            storeName: 'admin',
            status: 'publish',
        },

        booking: {
            productName: () => faker.commerce.productName() + (' (Booking)'),
            productType: 'booking',
            category: 'Uncategorized',
            bookingDurationType: 'customer',
            bookingDuration: '2',
            bookingDurationMax: '2',
            bookingDurationUnit: 'day',
            calendarDisplayMode: 'always_visible',
            maxBookingsPerBlock: '5',
            minimumBookingWindowIntoTheFutureDate: '0',
            minimumBookingWindowIntoTheFutureDateUnit: 'month',
            maximumBookingWindowIntoTheFutureDate: '5',
            maximumBookingWindowIntoTheFutureDateUnit: 'month',
            baseCost: '20',
            blockCost: '10',
        },
        auction: {
            productName: () => faker.commerce.productName() + (' (Auction)'),
            productType: 'auction',
            category: 'Uncategorized',
            itemCondition: 'new',
            auctionType: 'normal',
            regularPrice: () => (faker.finance.amount(10, 100, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            bidIncrement: () => (faker.finance.amount(40, 50, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            reservedPrice: () => (faker.finance.amount(400, 500, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            buyItNowPrice: () => (faker.finance.amount(900, 1000, faker.helpers.arrayElement([1, 2]))).replace('.', ','),
            startDate: helpers.currentDateTime.replace(/,/g, ''),
            endDate: helpers.addDays(helpers.currentDateTime, 60).replace(/,/g, ''),
            saveSuccessMessage: '× Success! The product has been updated successfully. View Product →',
        },

        // Review
        review: {
            rating: faker.datatype.number({min: 1, max: 5}),
            reviewMessage: () => faker.datatype.uuid(),
        },

        // Report

        report: {
            // reportReason: faker.random.arrayElement(['This content is spam', 'This content should marked as adult', 'This content is abusive', 'This content is violent', 'This content suggests the author might be risk of hurting themselves', 'This content infringes upon my copyright', 'This content contains my private information', 'Other', 'This product is fake']),
            reportReason: faker.helpers.arrayElement(['This content is spam', 'This content should marked as adult', 'This content is abusive', 'This content is violent', 'This content suggests the author might be risk of hurting themselves', 'This content infringes upon my copyright', 'This content contains my private information', 'Other']),
            reportReasonDescription: 'report reason description',
            reportSubmitSuccessMessage: 'Your report has been submitted. Thank you for your response.'
        },

        // Enquiry
        enquiry: {
            enquiryDetails: 'enquiry details',
            enquirySubmitSuccessMessage: 'Email sent successfully!',
        },
    },

    store: {
        rating: faker.helpers.arrayElement(['width: 20%', 'width: 40%', 'width: 60%', 'width: 80%', 'width: 100%']),
        reviewTitle: 'store review title',
        reviewMessage: () => faker.datatype.uuid(),

    },

    order: {
        orderStatus: {
            pending: 'wc-pending',
            processing: 'wc-processing',
            onhold: 'wc-on-hold',
            completed: 'wc-completed',
            cancelled: 'wc-cancelled',
            refunded: 'wc-refunded',
            failed: 'wc-failed',
        },
        // Refund
        refund: {
            itemQuantity: '1',
            refundRequestType: 'refund',
            refundRequestReasons: 'defective',
            refundRequestDetails: 'I would like to return this product',
            refundSubmitSuccessMessage: 'Request has been successfully submitted'
        }
    },

    card: {
        strip: {
            striptNon3D: '4242424242424242',
            stript3D: '4000002500003155',
            expiryMonth: '12',
            expiryYear: '50',
            number: '4000002500003155',
            expiryDate: '1250',
            cvc: '111'
        },
        mangopay: {
            creditCard: '4972485830400049',
            expiryMonth: '12',
            expiryYear: '50',
            cvc: '111'
        },

    },

    paymentDetails: {
        stripExpress: {
            paymentMethod: 'card',
            cardInfo: {
                cardNumber: '4242424242424242',
                expiryMonth: '12',
                expiryYear: '50',
                expiryDate: '1250', //MMYY
                cvc: '111'
            },
        },
    },

    coupon: {
        title: 'VC_' + faker.random.alpha({count: 5, casing: 'upper'},),
        amount: faker.datatype.number({min: 1, max: 10},).toString(),
        existingCouponErrorMessage: 'Coupon title already exists',
    },

    urls: {
        facebook: 'https://www.facebook.com/',
        twitter: 'https://www.twitter.com/',
        pinterest: 'https://www.pinterest.com/',
        linkedin: 'https://www.linkedin.com/',
        youtube: 'https://www.youtube.com/',
        instagram: 'https://www.instagram.com/',
        flickr: 'https://www.flickr.com/',
        saveSuccessMessage: 'Your information has been saved successfully',
    },

    wpSettings: {
        saveSuccessMessage: 'Your settings have been saved.',
        general: {
            timezone: 'UTC+6',
            saveSuccessMessage: 'Settings saved.',
        },
        permalink: {
            customBaseInput: '/product/',
            saveSuccessMessage: 'Permalink structure updated.',
        },
    },

    tax: {
        taxRate: '5',
        enableTax: true,
        saveSuccessMessage: 'Your settings have been saved.',
    },

    shipping: {
        enableShipping: 'Ship to all countries you sell to',
        disableShipping: 'Disable shipping & shipping calculations',
        shippingZone: 'US',
        shippingMethods: {
            flatRate: {
                shippingZone: 'US',
                shippingCountry: 'United States (US)',
                selectShippingMethod: 'flat_rate',
                shippingMethod: 'Flat rate',
                taxStatus: 'taxable',
                shippingCost: '20'
            },

            freeShipping: {
                shippingZone: 'US',
                shippingCountry: 'United States (US)',
                selectShippingMethod: 'free_shipping',
                shippingMethod: 'Free shipping',
                freeShippingRequires: 'min_amount',
                freeShippingMinimumOrderAmount: '200',
            },

            localPickup: {
                shippingZone: 'US',
                shippingCountry: 'United States (US)',
                selectShippingMethod: 'local_pickup',
                shippingMethod: 'Local pickup',
                taxStatus: 'taxable',
                shippingCost: '20'
            },

            tableRateShipping: {
                shippingZone: 'US',
                shippingCountry: 'United States (US)',
                selectShippingMethod: 'dokan_table_rate_shipping',
                shippingMethod: 'Vendor Table Rate',
            },

            distanceRateShipping: {
                shippingZone: 'US',
                shippingCountry: 'United States (US)',
                selectShippingMethod: 'dokan_distance_rate_shipping',
                shippingMethod: 'Vendor Distance Rate',
            },

            vendorShipping: {
                shippingZone: 'US',
                shippingCountry: 'United States (US)',
                selectShippingMethod: 'dokan_vendor_shipping',
                shippingMethod: 'Vendor Shipping',
                taxStatus: 'taxable',
            },
        },

        shippingTaxStatus: 'taxable',
        saveSuccessMessage: 'Your settings have been saved.',
    },

    payment: {
        saveSuccessMessage: 'Your settings have been saved.',
        currency: {
            dollar: 'United States (US) dollar ($)',
            euro: 'Euro (€)',
            rupee: 'Indian rupee (₹)',
            currencyOptions: {
                thousandSeparator: ',',
                decimalSeparator: ',',
                numberOfDecimals: '2',
            },
            saveSuccessMessage: 'Your settings have been saved.',
        },
        basicPayment: {
            toggleEanbledClass: 'woocommerce-input-toggle--enabled',
            toggleDisabledClass: 'woocommerce-input-toggle--disabled'

        },
        stripeConnect: {
            title: 'Dokan Credit card (Stripe)',
            description: 'Pay with your credit card via Stripe.',
            displayNoticeInterval: '7',
            stripeCheckoutLocale: 'English',
            testPublishableKey: 'pk_test_',
            testSecretKey: 'sk_test_',
            testClientId: 'ca_',

        },
        paypalMarketPlace: {
            title: 'PayPal Marketplace',
            description: 'Pay via PayPal Marketplace you can pay with your credit card if you don\'t have a PayPal account',
            payPalMerchantId: 'partner_',
            sandboxClientId: 'client_',
            sandBoxClientSecret: 'secret_',
            payPalPartnerAttributionId: 'weDevs_SP_Dokan',
            disbursementMode: 'Delayed',
            paymentButtonType: 'Smart Payment Buttons',
            marketplaceLogoPath: '/wp-content/plugins/dokan/assets/images/dokan-logo.png',
            announcementInterval: '7',
        },
        mangoPay: {
            title: 'MangoPay',
            description: 'Pay via MangoPay',
            sandboxClientId: 'client_',
            sandBoxApiKey: 'secret_',
            availableCreditCards: 'CB/Visa/Mastercard',
            availableDirectPaymentServices: 'Sofort*',
            transferFunds: 'On payment completed',
            typeOfVendors: 'Either',
            businessRequirement: 'Any',
            announcementInterval: '7',
        },
        razorPay: {
            title: 'Razorpay',
            description: 'Pay securely by Credit or Debit card or Internet Banking through Razorpay.',
            testKeyId: 'rzp_test',
            testKeySecret: 'rzp_test',
            disbursementMode: 'Delayed',
            announcementInterval: '7',

        },
        stripeExpress: {
            title: 'Dokan Express Payment Methods',
            description: 'Pay with your credit card via Stripe.',
            testPublishableKey: 'pk_test_',
            testSecretKey: 'sk_test_',
            testWebhookSecret: 'webHook_test_',
            paymentMethods: {
                card: 'Credit/Debit Card',
                ideal: 'iDEAL',
            },
            disbursementMode: 'Delayed',
            customerBankStatement: 'Dokan',
            paymentRequestButtonType: 'default',
            paymentRequestButtonTheme: 'dark',
            paymentRequestButtonLocation: {
                product: 'Product',
                cart: 'Cart'
            },
            announcementInterval: '7,'

        },

    },

    dokanSettings: {

        general: {
            vendorStoreUrl: 'store',
            sellingProductTypes: 'sell_both',
            storeProductPerPage: '12',
            storCategory: 'none',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        selling: {
            commissionType: 'percentage',
            adminCommission: '10',
            shippingFeeRecipient: 'seller',
            taxFeeRecipient: 'seller',
            newProductStatus: 'publish',
            productCategorySelection: 'single',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        withdraw: {
            customMethodName: 'Bksh',
            customMethodType: 'Phone',
            minimumWithdrawAmount: '5',
            withdrawThreshold: '0',
            quarterlyScheduleMonth: 'march',
            quarterlyScheduleWeek: '1',
            quarterlyScheduleDay: 'monday',
            monthlyScheduleWeek: '1',
            monthlyScheduleDay: 'monday',
            biweeklyScheduleWeek: '1',
            biweeklyScheduleDay: 'monday',
            weeklyScheduleDay: 'monday',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        page: {
            termsAndConditionsPage: 'Sample Page',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        appreance: {
            googleMapApiKey: process.env.GOOGLE_MAP_API_KEY,
            mapBoxApiKey: process.env.MAPBOX_API_KEY,
            storeBannerWidth: '625',
            storeBannerHeight: '300',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        privacyPolicy: {
            privacyPage: '2',
            privacyPolicyHtmlBody: 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        storeSupport: {
            displayOnSingleProductPage: 'above_tab',
            supportButtonLabel: 'Get Support',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        rma: {
            orderStatus: 'wc-processing',
            rmaReasons: ['Defective', 'Wrong Product', 'Other'],
            refundPolicyHtmlBody: 'Refund Policy',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        wholesale: {
            whoCanSeeWholesalePrice: 'all_user',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        euCompliance: {
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        deliveryTime: {
            deliveryDateLabel: 'Delivery Date',
            deliveryBlockedBuffer: '0',
            deliveryBoxInfo: 'This store needs %DAY% day(s) to process your delivery request',
            deliveryDay: {
                sunday: 'Sunday',
                monday: 'Monday',
                tuesday: 'Tuesday',
                wednesday: 'Wednesday',
                thursday: 'Thursday',
                friday: 'Friday',
                saturday: 'Saturday'
            },
            openingTime: '12:00 AM',
            closingTime: '11:30 PM',
            timeSlot: '30',
            orderPerSlot: '0',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        productAdvertising: {
            noOfAvailableSlot: '100',
            expireAfterDays: '10',
            advertisementCost: '15',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        geolocation: {
            locationMapPosition: 'top',
            showMap: 'all',
            radiusSearchUnit: 'km',
            radiusSearchMinimumDistance: '0',
            radiusSearchMaximumDistance: '10',
            mapZoomLevel: '11',
            defaultLocation: 'New York',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        productReportAbuse: {
            reasonsForAbuseReport: 'This product is fake',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        spmv: {
            sellItemButtonText: 'Sell This Item',
            availableVendorDisplayAreaTitle: 'Other Available Vendor',
            availableVendorSectionDisplayPosition: 'below_tabs',
            showSpmvProducts: 'show_all',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
        vendorSubscription: {
            displayPage: '2',
            noOfDays: '2',
            productStatus: 'draft',
            cancellingEmailSubject: 'Subscription Package Cancel notification',
            cancellingEmailBody: 'Dear subscriber, Your subscription has expired. Please renew your package to continue using it.',
            alertEmailSubject: 'Subscription Ending Soon',
            alertEmailBody: 'Dear subscriber, Your subscription will be ending soon. Please renew your package in a timely',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

    },

    module: {
        noModuleMessage: 'No modules found.',
    },

    dokanSetupWizard: {
        vendorStoreURL: 'store',
        shippingFeeRecipient: 'Vendor',
        taxFeeRecipient: 'Vendor',
        mapApiSource: 'Google Maps',
        googleMapApiKey: process.env.GOOGLE_MAP_API_KEY,
        sellingProductTypes: 'Both',
        commissionTypeValues: 'Percentage',
        adminCommission: '10',
        minimumWithdrawLimit: '5',
    },

    vendorSetupWizard: {
        choice: false,
        storeProductsPerPage: '12',
        street1: 'abc street',
        street2: 'xyz street',
        country: 'United States (US)',
        city: 'New York',
        zipCode: '10006',
        state: 'New York',
        paypal: () => faker.internet.email(),
        bankAccountName: 'accountName',
        bankAccountType: faker.helpers.arrayElement(['personal', 'business']),
        bankAccountNumber: faker.random.alphaNumeric(10),
        bankName: 'bankName',
        bankAddress: 'bankAddress',
        bankRoutingNumber: faker.random.alphaNumeric(10),
        bankIban: faker.random.alphaNumeric(10),
        bankSwiftCode: faker.random.alphaNumeric(10),
        customPayment: '1234567890',
        skrill: faker.internet.email(),
    },

    subUrls: {
        backend: {
            login: 'wp-login.php',
            adminLogin: 'wp-admin',
            adminDashboard: 'wp-admin',
            dokanSettings: 'wp-admin/admin.php?page=dokan#/settings',
            woocommerceSettings: 'wp-admin/admin.php?page=wc-settings',
            plugins: 'wp-admin/plugins.php',
        },
        frontend: {
            myAccount: 'my-account',
            shop: 'shop',
            storeListing: 'store-listing',
            cart: 'cart',
            checkout: 'checkout',
            dashboard: 'dashboard',

        },
        ajax: 'https://dokan2.test/wp-admin/admin-ajax.php'
    },

    admin: {
        username: process.env.ADMIN,
        password: process.env.ADMIN_PASSWORD,
    },

    vendor: {
        username: process.env.VENDOR,
        password: process.env.VENDOR_PASSWORD,

        vendor2: {
            username: process.env.VENDOR2,
            password: process.env.VENDOR_PASSWORD,
        },

        vendorInfo: {
            email: () => faker.internet.email(),
            emailDomain: '@gmail.com',
            password: process.env.VENDOR_PASSWORD,
            password1: process.env.VENDOR_PASSWORD + '1',
            firstName: () => faker.name.firstName('male'),
            lastName: () => faker.name.lastName('male'),
            userName: faker.name.firstName('male'), //TODO: update all faker with function, also handle assignin one member value to other
            shopName: faker.company.name(),
            shopUrl: faker.company.name(),
            companyName: faker.company.name(),
            companyId: faker.random.alphaNumeric(5),
            vatNumber: faker.random.alphaNumeric(10),
            bankName: faker.address.state(), //TODO: fix this
            bankIban: faker.finance.iban(),
            phoneNumber: faker.phone.number('(###) ###-####'),
            street1: 'abc street',
            street2: 'xyz street',
            country: 'United States (US)',
            countrySelectValue: 'US',
            stateSelectValue: 'NY',
            city: 'New York',
            zipCode: '10006',
            state: 'New York',
            accountName: 'accountName',
            accountNumber: faker.random.alphaNumeric(10),
            // bankName: 'bankName',
            bankAddress: 'bankAddress',
            routingNumber: faker.random.alphaNumeric(10),
            swiftCode: faker.random.alphaNumeric(10),
            iban: faker.random.alphaNumeric(10),

            //shop details
            banner: 'tests/e2e/utils/sampleData/banner.png',
            profilePicture: 'tests/e2e/utils/sampleData/avatar.png',
            storeName: 'vendorStore1',
            productsPerPage: '12',
            mapLocation: 'New York',
            termsAndConditions: 'Vendor Terms and Conditions',
            biography: 'Vendor biography',
            supportButtonText: 'Get Support',
            openingClosingTime: {
                days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
                openingTime: '06:00 AM',
                closingTime: '11:30 PM',
            },
            vacation: {
                vacationDayFrom: () => helpers.addDays(helpers.currentDate, helpers.getRandomArbitraryInteger(31, 365)),
                vacationDayTo: () => helpers.addDays(data.vendor.vendorInfo.vacation.vacationDayFrom, 31),
                closingStyle: 'datewise',
                vacationMessage: 'We are currently out of order',

            },
            discount: {
                minimumOrderAmount: '200',
                minimumOrderAmountPercentage: '10',
            },
            minMax: {
                minimumProductQuantity: '1',
                maximumProductQuantity: '20',
                minimumAmount: '10',
                maximumAmount: '1000000',
                category: 'Uncategorized'
            },
            storeSettingsSaveSuccessMessage: 'Your information has been saved successfully',
        },

        shipping: {
            shippingPolicy: {
                processingTime: '3',
                shippingPolicy: 'shipping policy',
                refundPolicy: 'refund policy',
                saveSuccessMessage: 'Settings save successfully',
            },
            shippingZone: 'US',
            shippingCountry: 'United States (US)',
            shippingMethods: {
                flatRate: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'flat_rate',
                    shippingMethod: 'Flat Rate',
                    taxStatus: 'taxable',
                    shippingCost: '20',
                    description: 'Flat rate',
                    calculationType: 'class',
                    saveSuccessMessage: 'Zone settings save successfully',
                },

                freeShipping: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'free_shipping',
                    shippingMethod: 'Free Shipping',
                    freeShippingRequires: 'min_amount',
                    freeShippingMinimumOrderAmount: '200',
                    saveSuccessMessage: 'Zone settings save successfully',
                },

                localPickup: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'local_pickup',
                    shippingMethod: 'Local Pickup',
                    taxStatus: 'taxable',
                    shippingCost: '20',
                    description: 'Local Pickup',
                    saveSuccessMessage: 'Zone settings save successfully',

                },

                tableRateShipping: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'dokan_table_rate_shipping',
                    shippingMethod: 'Table Rate',
                    taxStatus: 'taxable',
                    taxIncludedInShippingCosts: 'no',
                    handlingFee: '10',
                    maximumShippingCost: '200',
                    calculationType: 'item',
                    handlingFeePerOrder: '10',
                    minimumCostPerOrder: '10',
                    maximumCostPerOrder: '200',
                    saveSuccessMessage: 'Table rates has been saved successfully!',

                },

                distanceRateShipping: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'dokan_distance_rate_shipping',
                    shippingMethod: 'Distance Rate',
                    taxStatus: 'taxable',
                    transportationMode: 'driving',
                    avoid: 'none',
                    distanceUnit: 'metric',
                    street1: 'abc street',
                    street2: 'xyz street',
                    city: 'New York',
                    zipCode: '10006',
                    state: 'New York',
                    country: 'United States (US)',
                    saveSuccessMessage: 'Distance rates has been saved successfully!',
                },

                vendorShipping: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'dokan_vendor_shipping',
                    shippingMethod: 'Vendor Shipping',
                    taxStatus: 'taxable',
                },
            },

            shippingTaxStatus: 'taxable',
            saveSuccessMessage: 'Zone settings save successfully',
        },

        payment: {
            email: () => faker.internet.email(),
            bankAccountName: 'accountName',
            bankAccountNumber: faker.random.alphaNumeric(10),
            bankName: 'bankName',
            bankAddress: 'bankAddress',
            bankRoutingNumber: faker.random.alphaNumeric(10),
            bankIban: faker.random.alphaNumeric(10),
            bankSwiftCode: faker.random.alphaNumeric(10),
            saveSuccessMessage: 'Your information has been saved successfully',
        },

        verification: {
            file: '../utils/sampleData/avatar.png',
            file2: 'tests/e2e/utils/sampleData/avatar.png',
            street1: 'abc street',
            street2: 'xyz street',
            city: 'New York',
            zipCode: '10006',
            country: 'US',
            state: 'NY',
            idRequestSubmitSuccessMessage: 'Your ID verification request is Sent and pending approval',
            addressRequestSubmitSuccessMessage: 'Your Address verification request is Sent and Pending approval',
            companyRequestSubmitSuccessMessage: 'Your company verification request is sent and pending approval',

        },

        deliveryTime: {
            deliveryBlockedBuffer: '0',
            days: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
            openingTime: '06:00 AM',
            closingTime: '12:00 PM',
            timeSlot: '30',
            orderPerSlot: '10',
            saveSuccessMessage: 'Delivery settings has been saved successfully!',
        },

        rma: {
            label: 'Warranty',
            type: 'included_warranty',
            rmaLength: 'limited',
            lengthValue: '1',
            lengthDuration: 'weeks',
            refundPolicyHtmlBody: 'Refund Policy Vendor',
            saveSuccessMessage: 'Settings saved successfully',

        },
        withdraw: {
            withdrawMethod: {
                default: 'paypal',
                paypal: 'Paypal',
                skrill: 'Skrill',
            },
            defaultWithdrawMethod: {
                paypal: 'PayPal',
                skrill: 'Skrill',
            },
            preferredPaymentMethod: 'dokan_custom',
            preferredSchedule: 'weekly',
            minimumWithdrawAmount: '5',
            reservedBalance: '15',
        },

        addon: {
            name: () => 'Add-ons Group #' + helpers.randomNumber(),
            priority: '10',
            category: 'Uncategorized',
            type: 'multiple_choice',
            displayAs: 'select',
            titleRequired: 'Add-on Title',
            formatTitle: 'label',
            addDescription: 'Add-on description',
            enterAnOption: 'Option 1',
            optionPriceType: 'flat_fee',
            optionPriceInput: '30',
            saveSuccessMessage: 'Add-on saved successfully',
        },

        registrationErrorMessage: 'Error: An account is already registered with your email address. Please log in.',
    },
    customer: {
        username: process.env.CUSTOMER,
        password: process.env.CUSTOMER_PASSWORD,

        customer2: {
            username: process.env.CUSTOMER2,
            password: process.env.CUSTOMER_PASSWORD,
        },

        customerInfo: {
            emailDomain: '@gmail.com',
            email: faker.internet.email(),
            password: process.env.CUSTOMER_PASSWORD,
            password1: process.env.CUSTOMER_PASSWORD + '1',
            firstName: () => faker.name.firstName('male'),
            lastName: () => faker.name.lastName('male'),
            // username: () => this.customer.customerInfo.firstName, //TODO: handel callback  & not works
            // storename: () => this.customer.customerInfo.firstName + 'store',
            username: () => faker.name.firstName('male'),
            storename: () => faker.name.firstName('male') + 'store',
            companyName: faker.company.name(),
            companyId: faker.random.alphaNumeric(5),
            vatNumber: faker.random.alphaNumeric(10),
            bankIban: faker.finance.iban(),
            phone: faker.phone.number('(###) ###-####'),
            street1: 'abc street', //TODO: address should be global or not
            street2: 'xyz street',
            country: 'United States (US)',
            countrySelectValue: 'US',
            stateSelectValue: 'NY',
            city: 'New York',
            zipCode: '10006',
            state: 'New York',
            accountName: 'accountName',
            accountNumber: faker.random.alphaNumeric(10),
            bankName: 'bankName',
            bankAddress: 'bankAddress',
            routingNumber: faker.random.alphaNumeric(10),
            swiftCode: faker.random.alphaNumeric(10),
            iban: faker.random.alphaNumeric(10),

            addressChangeSuccessMessage: 'Address changed successfully.',
            getSupport: {
                subject: 'get Support Subject',
                message: 'get Support Message',
                supportSubmitSuccessMessage: 'Thank you. Your ticket has been submitted!',
            },
        },
        rma: {
            sendMessage: "Message send successfully"
        },
        account: {
            updateSuccessMessage: "Account details changed successfully.",
        },
        follow: {
            following: 'Following',
        },
        registrationErrorMessage: 'Error: An account is already registered with your email address. Please log in.',
    },

    key: {
        arrowDown: 'ArrowDown',
        enter: 'Enter',
    },

    plugin: {
        // PluginSlugList: ['dokan-lite', 'dokan-pro', 'woocommerce', 'woocommerce-bookings', 'woocommerce-product-add-ons', 'woocommerce-simple-auction', 'woocommerce-subscriptions', 'elementor', 'elementor-pro',],
        PluginSlugList: ['dokan-lite', 'dokan-pro', 'woocommerce', 'woocommerce-bookings', 'woocommerce-product-add-ons', 'woocommerce-simple-auction', 'woocommerce-subscriptions',],
        activeClass: 'active',
    },

    woocommerce: {
        saveSuccessMessage: 'Your settings have been saved.',
    },

    wholesale: {
        wholesaleRequestSendMessage: "Your wholesale customer request send to the admin. Please wait for approval",
        becomeWholesaleCustomerSuccessMessage: 'You are succefully converted as a wholesale customer',
        wholesaleCapabilityActivate: 'Wholesale capability activate',
    },

    address: {
        street1: 'abc street',
        street2: 'xyz street',
        country: 'United States (US)',
        countrySelectValue: 'US',
        stateSelectValue: 'NY',
        city: 'New York',
        zipCode: '10006',
        state: 'New York',
    },

    // predefined  test data

    predefined: {
        simpleProduct: {
            product1: {
                name: 'p1_v1 (simple)',
                productName: () => 'p1_v1 (simple)',
            },
            product2: 'p2_v1 (simple)',
            productfrac1: 'p1_F1_v1 (simple)',
            productfrac2: 'p2_F2_v1 (simple)'
        },
        variableProduct: {
            product1: 'p1_v1 (variable)'
        },
        simpleSubscription: {
            product1: 'p1_v1 (simple subscription)'
        },
        variableSubscription: {
            product1: 'p1_v1 (variable subscription)'
        },
        externalProduct: {
            product1: 'p1_v1 (external/affiliate)'
        },
        auctionProduct: {
            product1: 'p1_v1 (auction)'
        },
        bookingProduct: {
            product1: 'p1_v1 (booking)'
        },
        saleProduct: {
            product1: 'p1_v1 (sale)'
        },
        vendorSubscription: {
            nonRecurring: 'Dokan_Subscription_Non_recurring'
        },
        coupon: {
            coupon1: {
                title: 'c1_v1',
            },
        },
        vendorInfo: {
            firstName: () => 'vendor1',
            lastName: () => 'v1',
            username: 'vendor1',
            shopName: 'vendorStore1',
        },

        vendorStores: {
            vendor1: 'vendorStore1',
            venor2: 'vendorStore2'
        },
        customerInfo: {
            firstName: () => 'customer1',
            lastName: () => 'c1',
            username: () => 'customer1',
        }

    }
}

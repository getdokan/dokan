import { faker } from '@faker-js/faker';
import { helpers } from '@utils/helpers';
import 'dotenv/config';

const {
    ADMIN,
    ADMIN_PASSWORD,
    VENDOR,
    VENDOR2,
    CUSTOMER,
    CUSTOMER2,
    USER_PASSWORD,
    SITE_PATH,
    BASE_URL,
    SITE_LANGUAGE,
    SITE_TITLE,
    ADMIN_EMAIL,
    DB_HOST_NAME,
    DATABASE,
    DB_USER_NAME,
    DB_USER_PASSWORD,
    DB_PREFIX,
    GMAP,
    MAPBOX,
    LICENSE_KEY,
    CATEGORY_ID,
    VONAGE_API_KEY,
    VONAGE_API_SECRET,
    FB_APP_ID,
    FB_APP_SECRET,
    TALKJS_APP_ID,
    TALKJS_APP_SECRET,
    PRINTFUL_APP_ID,
    PRINTFUL_APP_SECRET,
} = process.env;

const basicAuth = (username: string, password: string) => 'Basic ' + Buffer.from(username + ':' + password).toString('base64');

interface user {
    username: string;
    password: string;
}

interface admin {
    username: string;
    password: string;
}

export { admin, user };

export const data = {
    systemInfo: 'playwright/systemInfo.json',

    header: {
        userAuth: (username: string, password: string = USER_PASSWORD) => {
            return { extraHTTPHeaders: { Authorization: basicAuth(username, password) } };
        },

        adminAuth: { extraHTTPHeaders: { Authorization: basicAuth(ADMIN, ADMIN_PASSWORD) } },
        vendorAuth: { extraHTTPHeaders: { Authorization: basicAuth(VENDOR, ADMIN_PASSWORD) } },
        vendor2Auth: { extraHTTPHeaders: { Authorization: basicAuth(VENDOR2, ADMIN_PASSWORD) } },
        customerAuth: { extraHTTPHeaders: { Authorization: basicAuth(CUSTOMER, ADMIN_PASSWORD) } },
    },

    auth: {
        adminAuthFile: 'playwright/.auth/adminStorageState.json',
        vendorAuthFile: 'playwright/.auth/vendorStorageState.json',
        vendor2AuthFile: 'playwright/.auth/vendor2StorageState.json',
        customerAuthFile: 'playwright/.auth/customerStorageState.json',
        customer2AuthFile: 'playwright/.auth/customer2StorageState.json',

        adminAuth: {
            storageState: 'playwright/.auth/adminStorageState.json',
        },

        vendorAuth: {
            storageState: 'playwright/.auth/vendorStorageState.json',
        },

        vendor2Auth: {
            storageState: 'playwright/.auth/vendor2StorageState.json',
        },

        customerAuth: {
            storageState: 'playwright/.auth/customerStorageState.json',
        },

        customer2Auth: {
            storageState: 'playwright/.auth/customer2StorageState.json',
        },

        noAuth: {
            storageState: { cookies: [], origins: [] },
        },
    },

    // keyboard key
    key: {
        escape: 'Escape',
        arrowDown: 'ArrowDown',
        enter: 'Enter',
        home: 'Home',
        end: 'End',
    },

    plugin: {
        pluginsLite: ['basic-auth', 'dokan', 'woocommerce'],
        plugins: ['basic-auth', 'dokan', 'dokan-pro', 'woocommerce', 'woocommerce-bookings', 'woocommerce-product-addons', 'woocommerce-simple-auctions', 'woocommerce-subscriptions'],
        dokanPro: ['dokan-pro'],
        activeClass: 'active',
        pluginName: {
            dokanLite: 'dokan-lite',
            dokanPro: 'dokan-pro',
        },
        pluginList: {
            basicAuth: 'Basic-Auth-master/basic-auth',
            dokanLite: 'dokan/dokan',
            dokanPro: 'dokan-pro/dokan-pro',
            woocommerce: 'woocommerce/woocommerce',
            woocommerceBookings: 'woocommerce-bookings/woocommerce-bookings',
            woocommerceProductAddons: 'woocommerce-product-addons/woocommerce-product-addons',
            woocommerceSimpleAuctions: 'woocommerce-simple-auctions/woocommerce-simple-auctions',
            woocommerceSubscriptions: 'woocommerce-subscriptions/woocommerce-subscriptions',
        },
    },

    woocommerce: {
        saveSuccessMessage: 'Your settings have been saved.',
    },

    // Product
    product: {
        publishSuccessMessage: 'Product published. ',
        draftUpdateSuccessMessage: 'Product draft updated. ',
        pendingProductUpdateSuccessMessage: 'Product updated. ',
        createUpdateSaveSuccessMessage: 'Success! The product has been saved successfully.',
        updateSuccessMessage: 'Product updated. ',

        status: {
            publish: 'publish',
            draft: 'draft',
            pending: 'pending',
        },

        stockStatus: {
            outOfStock: 'outofstock',
        },

        tax: {
            status: 'taxable', // 'taxable', 'shipping', 'none'
            taxClass: 'taxable', // 'taxable', 'reduced-rate', 'zero-rate'
        },

        type: {
            simple: 'simple',
            variable: 'variable',
            simpleSubscription: 'subscription',
            variableSubscription: 'variable-subscription',
            external: 'external',
            vendorSubscription: 'product_pack',
            booking: 'booking',
            auction: 'auction',
        },

        name: {
            simple: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
            variable: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Variable)`,
            external: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (External)`,
            grouped: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Grouped)`,
            simpleSubscription: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple Subscription)`,
            variableSubscription: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Variable Subscription)`,
            dokanSubscription: { nonRecurring: () => `Dokan Subscription_${faker.string.alpha({ length: 5, casing: 'upper' })} (Product Pack)` },
            booking: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Booking)`,
            auction: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Auction)`,
        },

        price: {
            // price: faker.commerce.price(100, 200, 2),
            // price: faker.number.int({ min: 1, max: 200, precision: 0.01 }),
            // price: faker.finance.amount({ min: 1, max: 200, dec: 2 }),
            price_int: () => faker.finance.amount({ min: 100, max: 200, dec: 0 }),
            price_random: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([0, 2]) }), // 0 = no decimals, 2 = 2 decimals
            price_frac: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }),
            price_frac_comma: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            auctionPrice: () => faker.commerce.price({ min: 10, max: 100, dec: 0 }),
            price: () => data.product.price.price_frac_comma(),
        },

        category: {
            unCategorized: 'Uncategorized',
            clothings: 'clothings',
            randomCategory: () => `category_${faker.string.alpha(5)}`,
            categories: ['clothings', 'electronics'],
            multistepCategories: ['gadgets', 'Wearables', 'smartwatches', 'fitness-trackers'],
        },

        store: {
            adminStore: `${ADMIN}store`,
            vendorStore1: `${VENDOR}store`,
        },

        attribute: {
            size: {
                attributeName: 'size',
                attributeTerms: ['s', 'l', 'm'],
            },

            color: {
                attributeName: 'color',
                attributeTerms: ['red', 'blue', 'black', 'yellow', 'white'],
            },

            randomAttribute: () => ({
                attributeName: `attribute_${faker.string.alpha(5)}`,
                attributeTerms: [`attributeTerm_${faker.string.alpha(5)}`],
            }),
        },

        simple: {
            productType: 'simple',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple)`,
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            storeName: `${VENDOR}store`,
            status: 'publish',
            stockStatus: false,
            editProduct: '',
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        downloadable: {
            productType: 'simple',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Downloadable)`,
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            storeName: `${VENDOR}store`,
            status: 'publish',
            stockStatus: false,
            editProduct: '',
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',

            downloadableOptions: {
                fileName: 'avatar',
                fileUrl: 'utils/sampleData/avatar.png',
                downloadLimit: '200',
                downloadExpiry: '361',
            },
        },

        virtual: {
            productType: 'simple',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Virtual)`,
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            storeName: `${VENDOR}store`,
            status: 'publish',
            stockStatus: false,
            editProduct: '',
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        variable: {
            productType: 'variable',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Variable)`,
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            storeName: `${VENDOR}store`,
            status: 'publish',
            stockStatus: false,
            attribute: 'sizes',
            attributeTerms: ['s', 'l', 'm'],
            variations: {
                linkAllVariation: 'link_all_variations',
                variableRegularPrice: 'variable_regular_price',
            },
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        external: {
            productType: 'external',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (External)`,
            productUrl: '/product/p1_v1-simple/',
            buttonText: 'Buy product',
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            storeName: `${VENDOR}store`,
            status: 'publish',
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        grouped: {
            productType: 'grouped',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Grouped)`,
            groupedProducts: ['p1_v1 (simple)'],
            category: 'Uncategorized',
            storeName: `${VENDOR}store`,
            status: 'publish',
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        simpleSubscription: {
            productType: 'subscription',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Simple Subscription)`,
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            subscriptionPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            subscriptionPeriodInterval: '1', // '0', '1', '2', '3', '4', '5', '6'
            subscriptionPeriod: 'month', // 'day', 'week', 'month', 'year'
            expireAfter: '0', // '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'
            subscriptionTrialLength: '0',
            subscriptionTrialPeriod: 'day', // 'day', 'week', 'month', 'year'
            storeName: `${VENDOR}store`,
            status: 'publish',
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        variableSubscription: {
            productType: 'variable-subscription',
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Variable Subscription)`,
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            subscriptionPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            subscriptionPeriodInterval: '1',
            subscriptionPeriod: 'month',
            expireAfter: '0',
            subscriptionTrialLength: '0',
            subscriptionTrialPeriod: 'day',
            storeName: `${VENDOR}store`,
            status: 'publish',
            attribute: 'sizes',
            attributeTerms: ['s', 'l', 'm'],
            variations: {
                linkAllVariation: 'link_all_variations',
                variableRegularPrice: 'variable_regular_price',
            },
            description: 'test description',
            saveSuccessMessage: 'Success! The product has been saved successfully. View Product →',
        },

        vendorSubscription: {
            productType: 'product_pack',
            productName: () => `Dokan Subscription_${faker.string.alpha({ length: 5, casing: 'upper' })} (Product Pack)`,
            category: 'Uncategorized',
            regularPrice: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            numberOfProducts: '-1',
            packValidity: '0',
            advertisementSlot: '-1',
            expireAfterDays: '-1',
            storeName: `${VENDOR}store`,
            status: 'publish',
            description: 'test description',
        },

        booking: {
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Booking)`,
            name: '',
            productType: 'booking',
            category: 'Uncategorized',
            bookingDurationType: 'customer', // 'fixed', 'customer'
            bookingDuration: '2',
            bookingDurationMin: '1',
            bookingDurationMax: '20',
            bookingDurationUnit: 'day', // 'month', 'day', 'hour', 'minute'
            calendarDisplayMode: 'always_visible', // '', 'always_visible'
            maxBookingsPerBlock: '5',
            minimumBookingWindowIntoTheFutureDate: '0',
            minimumBookingWindowIntoTheFutureDateUnit: 'month',
            maximumBookingWindowIntoTheFutureDate: '5',
            maximumBookingWindowIntoTheFutureDateUnit: 'month',
            baseCost: '20',
            blockCost: '10',
            storeName: `${VENDOR}store`,
            saveSuccessMessage: 'Success! The product has been saved successfully.',

            resource: {
                resourceName: () => `Booking Resource_${faker.string.nanoid(10)}`,
                name: '',
                quantity: String(faker.number.int({ min: 1, max: 100 })),
            },
        },

        // Auction
        auction: {
            productName: () => `${faker.commerce.productName()}_${faker.string.nanoid(5)} (Auction)`,
            name: '',
            productType: 'auction',
            category: 'Uncategorized',
            itemCondition: 'new', // 'new', 'used'
            auctionType: 'normal', // 'normal', 'reverse'
            regularPrice: () => faker.finance.amount({ min: 10, max: 100, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            bidIncrement: () => faker.finance.amount({ min: 40, max: 50, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            reservedPrice: () => faker.finance.amount({ min: 400, max: 500, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            buyItNowPrice: () => faker.finance.amount({ min: 900, max: 1000, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),
            startDate: helpers.currentDateTime,
            endDate: helpers.addDays(helpers.currentDateTime, 20, 'full'),
            relistIfFailAfterNHours: '1',
            relistIfNotPaidAfterNHours: '2',
            relistAuctionDurationInH: '3',
            storeName: `${VENDOR}store`,
            // saveSuccessMessage: '× Success! The product has been updated successfully. View Product →',
            saveSuccessMessage: 'Success! The product has been updated successfully.',
        },

        // Review
        review: {
            rating: String(faker.number.int({ min: 1, max: 5 })),
            reviewMessage: () => faker.string.nanoid(10),
        },

        // Report
        report: {
            reportReason: faker.helpers.arrayElement([
                'This content is spam',
                'This content should marked as adult',
                'This content is abusive',
                'This content is violent',
                'This content suggests the author might be risk of hurting themselves',
                'This content infringes upon my copyright',
                'This content contains my private information',
                'Other',
            ]),
            reportReasonDescription: 'report reason description',
            reportSubmitSuccessMessage: 'Your report has been submitted. Thank you for your response.',

            // non logged user
            username: CUSTOMER,
            password: USER_PASSWORD,

            // guest user
            guestName: () => faker.person.firstName('male'),
            guestEmail: () => `${faker.person.firstName('male')}@email.com`,
        },

        // Enquiry
        enquiry: {
            enquiryDetails: 'enquiry details',
            enquirySubmitSuccessMessage: 'Email sent successfully!',

            // guest user
            guestName: () => faker.person.firstName('male'),
            guestEmail: () => `${faker.person.firstName('male')}@email.com`,
        },

        productInfo: {
            title: `${faker.commerce.productName()}_${faker.string.nanoid(5)}`,

            permalink: `_${faker.string.nanoid(10)}`,

            price: () => faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }).replace('.', ','),

            discount: {
                regularPrice: faker.finance.amount({ min: 100, max: 200, dec: faker.helpers.arrayElement([1, 2]) }),
                discountPrice: '10',
                startDate: helpers.currentDate,
                endDate: helpers.addDays(helpers.currentDateTime, 2),
            },

            tags: {
                tags: ['accessories'],
                randomTags: [faker.string.nanoid(5)],
            },

            images: {
                cover: 'utils/sampleData/avatar.png',
                gallery: ['utils/sampleData/avatar.png'],
            },

            description: {
                shortDescription: 'test short description',
                description: 'test long description',
            },

            downloadableOptions: {
                fileName: 'avatar',
                fileUrl: 'utils/sampleData/avatar.png',
                downloadLimit: '100',
                downloadExpiry: '365',
            },

            otherOptions: {
                status: 'draft', // publish,
                visibility: 'hidden', // visible, catalog, search, hidden
                purchaseNote: 'test purchase note',
                enableReview: true,
            },

            inventory: () => ({
                sku: faker.string.nanoid(10),
                stockStatus: 'outofstock', // instock, outofstock, onbackorder
                stockManagement: true,
                stockQuantity: '100',
                lowStockThreshold: '10',
                backorders: 'notify', // no, notify, yes
                oneQuantity: true,
            }),

            geolocation: 'NYC, NY, USA',

            shipping: {
                weight: '10',
                length: '20',
                width: '30',
                height: '40',
                shippingClass: 'heavy',
            },

            tax: {
                status: 'taxable', // taxable, shipping, none
                class: 'zero-rate', // reduced-rate, zero-rate
            },

            linkedProducts: {
                upSells: ['p1_v1 (simple)'],
                crossSells: ['p1_v1 (simple)'],
            },

            attribute: {
                attributeName: 'sizes',
                randomAttributeName: faker.string.nanoid(7),
                attributeTerm: faker.string.nanoid(5),
            },

            euCompliance: {
                saleLabel: 'old-price', // new-price, old-price, rrp
                saleRegularLabel: 'new-price', // new-price, old-price, rrp
                unit: 'kg', // cm, g, in, kcal, kg, kj, l, lbs, m, ml, mm, oz, yd, %c2%b5g
                minimumAge: '18', // 12, 16,18, 19, 25
                productUnits: '1',
                basePriceUnits: '20',
                deliveryTime: '-1',
                freeShipping: true,
                regularUnitPrice: '50',
                saleUnitPrice: '',
                optionalMiniDescription: 'test mini description',
            },

            addon: {
                type: 'multiple_choice', // 'multiple_choice', 'checkbox', 'custom_text', 'custom_textarea', 'file_upload', 'custom_price', 'input_multiplier', 'heading'
                displayAs: 'select', // 'select', 'radiobutton', 'images'
                title: `Test Add-on Title_${faker.string.nanoid(10)}`,
                formatTitle: 'label', // 'label', 'heading', 'hide'
                addDescription: 'Add-on description',
                enterAnOption: 'Option 1',
                optionPriceType: 'flat_fee', // 'flat_fee', 'quantity_based', 'percentage_based'
                optionPriceInput: '30',
            },

            amountDiscount: {
                minimumOrderAmount: '200',
                discountPercentage: '10',
            },

            quantityDiscount: {
                minimumQuantity: '100',
                discountPercentage: '10,00', // todo: handle in test assertion pass number and convert to string with 2 decimal with woo decimal separator
            },

            wholesaleOption: {
                wholesalePrice: '90',
                minimumQuantity: '10',
            },

            minMax: {
                minimumProductQuantity: '1',
                maximumProductQuantity: '20',
            },

            commission: {
                commissionType: 'fixed', // 'fixed','category_based'  [category commission will only be applicable to dokan subscription product]
                commissionPercentage: '2',
                commissionFixed: '2',
                commissionCategory: {
                    allCategory: true, // true for all category, false for specific category
                    category: 'All Categories',
                },
            },
        },
    },

    // store
    store: {
        rating: faker.helpers.arrayElement(['width: 20%', 'width: 40%', 'width: 60%', 'width: 80%', 'width: 100%']),
        reviewTitle: 'store review title',
        reviewMessage: () => faker.string.nanoid(10),
    },

    // store list
    storeList: {
        sort: 'most_recent',
        layout: {
            grid: 'grid',
            list: 'list',
        },
    },

    // order
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
    },

    // order  Note
    orderNote: {
        customer: {
            note: 'test order note',
            noteType: 'Customer note',
        },
        private: {
            note: 'test private order note',
            noteType: 'Private note',
        },

        note: () => `test order note_${faker.string.nanoid(10)}`,
    },

    // order Tracking Details
    orderTrackingDetails: {
        shippingProvider: 'test shipping provider',
        trackingNumber: '1234567890',
        dateShipped: helpers.currentDate,
    },

    // order Shipment Details
    orderShipmentDetails: {
        shipmentOrderItem: 'p1_v1 (simple)',
        shipmentOrderItemQty: '1',
        shippingStatus: 'ss_proceccing', // ss_delivered, ss_cancelled, ss_proceccing, ss_ready_for_pickup, ss_pickedup, ss_on_the_way
        shippingProvider: 'sp-dhl', // sp-dhl, sp-dpd, sp-fedex, sp-polish-shipping-providers, sp-ups, sp-usps, sp-other
        dateShipped: helpers.currentDate,
        trackingNumber: '1234567890',
        comments: 'test shipment comment',
    },

    rma: {
        // requestWarranty
        requestWarranty: {
            itemQuantity: '1',
            refundRequestType: 'refund',
            refundRequestReasons: 'defective',
            refundRequestDetails: 'I would like to return this product',
            refundSubmitSuccessMessage: 'Request has been successfully submitted',
        },
    },

    paymentDetails: {
        strip: {
            striptNon3D: '4242424242424242',
            stript3D: '4000002500003155',
            cardNumber: '4242424242424242',
            expiryMonth: '12',
            expiryYear: '50',
            number: '4000002500003155',
            expiryDate: '1250',
            cvc: '111',
        },

        mangopay: {
            creditCard: '4972485830400049',
            expiryMonth: '12',
            expiryYear: '50',
            cvc: '111',
        },

        stripExpress: {
            paymentMethod: 'card',
            cardInfo: {
                cardNumber: '4242424242424242',
                expiryMonth: '12',
                expiryYear: '50',
                expiryDate: '1250', // MMYY
                cvc: '111',
            },
        },
    },

    // coupon
    coupon: {
        // title: () => `VC_${faker.string.alpha({ count: 5, casing: 'upper' })}`,
        couponTitle: () => `VC_${faker.string.nanoid(10)}`,
        title: '',
        amount: () => faker.number.int({ min: 1, max: 10 }).toString(),
        discount_type: () => faker.helpers.arrayElement(['percent', 'fixed_product']), // percent, fixed_product, booking_person, sign_up_fee, sign_up_fee_percent, recurring_fee, recurring_percent
        discountType: 'percent',
        description: 'test Coupon description',
        existingCouponErrorMessage: 'Coupon title already exists',
        editCoupon: '',
    },

    // address
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
        priority: '10',
        enableTax: true,
        saveSuccessMessage: 'Your settings have been saved.',
    },

    shipping: {
        enableShipping: 'Ship to all countries you sell to',
        disableShipping: 'Disable shipping & shipping calculations',

        zone: () => ({
            zoneName: faker.string.alpha(3).toUpperCase(),
            zoneRegion: 'United States (US)',
            saveSuccessMessage: 'Your settings have been saved.',
        }),

        methods: {
            flatRate: {
                selectMethodName: 'flat_rate',
                methodName: 'Flat rate',
                taxStatus: 'taxable', // 'none', 'taxable'
                shippingCost: '20',
            },

            freeShipping: {
                selectMethodName: 'free_shipping',
                methodName: 'Free shipping',
                freeShippingRequires: 'both', // 'coupon', 'min_amount', 'either', 'both'
                freeShippingMinimumOrderAmount: '200',
            },

            tableRateShipping: {
                selectMethodName: 'dokan_table_rate_shipping',
                methodName: 'Vendor Table Rate',
            },

            distanceRateShipping: {
                selectMethodName: 'dokan_distance_rate_shipping',
                methodName: 'Vendor Distance Rate',
            },

            vendorShipping: {
                selectMethodName: 'dokan_vendor_shipping',
                methodName: 'Vendor Shipping',
                taxStatus: 'taxable', // 'none
            },
        },

        shippingTaxStatus: 'taxable',
        saveSuccessMessage: 'Your settings have been saved.',
    },

    payment: {
        saveSuccessMessage: 'Your settings have been saved.',
        currency: {
            dollar: 'United States (US) dollar ($) — USD',
            euro: 'Euro (€) — EUR',
            rupee: 'Indian rupee (₹) — INR',
            currencyOptions: {
                thousandSeparator: ',',
                decimalSeparator: ',',
                numberOfDecimals: '2',
            },
            saveSuccessMessage: 'Your settings have been saved.',
        },

        basicPayment: {
            toggleEnabledClass: 'woocommerce-input-toggle--enabled',
            toggleDisabledClass: 'woocommerce-input-toggle--disabled',
        },

        stripeConnect: {
            title: 'Dokan Credit card (Stripe)',
            description: 'Pay with your credit card via Stripe.',
            displayNoticeInterval: '7',
            testPublishableKey: 'pk_test_',
            testSecretKey: 'sk_test_',
            testClientId: 'ca_',
        },

        paypalMarketPlace: {
            title: 'PayPal Marketplace',
            description: "Pay via PayPal Marketplace you can pay with your credit card if you don't have a PayPal account",
            payPalMerchantId: 'partner_',
            sandboxClientId: 'client_',
            sandBoxClientSecret: 'secret_',
            payPalPartnerAttributionId: 'weDevs_SP_Dokan',
            disbursementMode: 'Delayed', // 'Immediate', 'On Order Complete', 'Delayed'
            paymentButtonType: 'Smart Payment Buttons', // 'Smart Payment Buttons', 'Standard Button'
            marketplaceLogoPath: '/wp-content/plugins/dokan/assets/images/dokan-logo.png',
            announcementInterval: '7',
        },

        mangoPay: {
            title: 'MangoPay',
            description: 'Pay via MangoPay',
            sandboxClientId: 'client_',
            sandBoxApiKey: 'secret_',
            availableCreditCards: 'CB/Visa/Mastercard', // 'CB/Visa/Mastercard', 'Maestro*', 'Bancontact/Mister Cash', 'Przelewy24*', 'Diners*', 'PayLib', 'iDeal*', 'MasterPass*', 'Bankwire Direct*'
            availableDirectPaymentServices: 'Sofort*', // 'Sofort*', 'Giropay*'],
            transferFunds: 'On payment completed', // 'On payment completed', 'On order completed', 'Delayed'
            typeOfVendors: 'Either', // 'Individuals', 'Business', 'Either'
            businessRequirement: 'Any', // 'Organizations', 'Soletraders', 'Businesses', 'Any'
            announcementInterval: '7',
        },

        razorPay: {
            title: 'Razorpay',
            description: 'Pay securely by Credit or Debit card or Internet Banking through Razorpay.',
            testKeyId: 'rzp_test',
            testKeySecret: 'rzp_test',
            disbursementMode: 'Delayed', // 'Immediate', 'On Order Complete', 'Delayed'
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
            iDealBanks: ['abn_amro', 'asn_bank', 'bunq', 'handelsbanken', 'ing', 'knab', 'rabobank', 'regiobank', 'revolut', 'sns_bank', 'triodos_bank', 'van_lanschot'],
            disbursementMode: 'Delayed', // 'On payment completed', 'On order completed', 'Delayed'
            customerBankStatement: 'Dokan',
            paymentRequestButtonType: 'default', // 'default', 'buy', 'donate', 'book'
            paymentRequestButtonTheme: 'dark', // 'dark', 'light', 'light-outline'
            paymentRequestButtonLocation: {
                product: 'Product',
                cart: 'Cart',
            },
            announcementInterval: '7,',
        },
    },

    // commission [for all dokan setup wizard, dokan selling settings, dokan subscription product]
    commission: {
        fixed: {
            commissionType: 'fixed', // 'fixed','category_based'
            commissionPercentage: '10',
            commissionFixed: '10',
            commissionCategory: {
                allCategory: true, // true for all category, false for specific category
                category: 'All Categories',
            },
        },

        allCategory: {
            commissionType: 'category_based', // 'fixed','category_based'
            commissionPercentage: '5',
            commissionFixed: '5',
            commissionCategory: {
                allCategory: true, // true for all category, false for specific category
                category: 'All Categories',
            },
        },

        specficCategory: {
            commissionType: 'category_based', // 'fixed','category_based'
            commissionPercentage: '2',
            commissionFixed: '2',
            commissionCategory: {
                allCategory: false, // true for all category, false for specific category
                category: CATEGORY_ID,
            },
        },
    },

    // Dokan Setup Wizard
    dokanSetupWizard: {
        vendorStoreURL: 'store',
        shippingFeeRecipient: 'seller', // 'seller', 'admin'
        taxFeeRecipient: 'seller', // 'seller', 'admin'
        mapApiSource: 'google_maps', // 'google_maps', 'mapbox'
        googleMapApiKey: GMAP,
        sellingProductTypes: 'sell_both', // 'physical', 'digital', 'sell_both',
        commission: {
            commissionType: 'fixed', // 'fixed','category_based'
            commissionPercentage: '10',
            commissionFixed: '0',
            commissionCategory: {
                allCategory: true, // true for all category, false for specific category
                category: 'All Categories',
            },
        },
        minimumWithdrawLimit: '5',
    },

    // Vendor Setup Wizard
    vendorSetupWizard: {
        setupWizardEnabled: true,
        choice: true,
        storeProductsPerPage: '12',
        street1: 'abc street',
        street2: 'xyz street',
        country: 'United States (US)',
        city: 'New York',
        zipCode: '10006',
        state: 'New York',
        storeCategory: 'Uncategorized',
        mapLocation: 'New York',
        paypal: () => faker.internet.email(),
        bankAccountName: 'accountName',
        bankAccountType: faker.helpers.arrayElement(['personal', 'business']),
        bankAccountNumber: faker.string.alphanumeric(10),
        bankName: 'bankName',
        bankAddress: 'bankAddress',
        bankRoutingNumber: faker.string.alphanumeric(10),
        bankIban: faker.finance.iban(),
        bankSwiftCode: faker.string.alphanumeric(10),
        customPayment: '1234567890',
        skrill: faker.internet.email(),
        file: 'utils/sampleData/avatar.png',
    },

    storeShare: {
        facebook: 'facebook',
        twitter: 'twitter',
        linkedin: 'linkedin',
        pinterest: 'pinterest',
    },

    subUrls: {
        ajax: '/admin-ajax.php',
        post: '/post.php',
        gmap: '/maps/api',

        backend: {
            dbSetup: 'wp-admin/install.php',
            login: 'wp-login.php',
            adminLogin: 'wp-admin',
            adminLogout: 'wp-login.php?action=logout',
            adminDashboard: 'wp-admin',
            pages: 'wp-admin/edit.php?post_type=page',
            addNewPage: 'wp-admin/post-new.php?post_type=page',
            user: 'wp-admin/user-edit.php',
            setupWP: 'wp-admin/install.php',
            general: 'wp-admin/options-general.php',
            permalinks: 'wp-admin/options-permalink.php',
            plugins: 'wp-admin/plugins.php',
            activatePlugin: 'wp-admin/plugins.php?action=activate',
            deactivatePlugin: 'wp-admin/plugins.php?action=deactivate',
            widgets: 'wp-admin/widgets.php',
            editUser: (userId: string) => `wp-admin/user-edit.php?user_id=${userId}`,

            dokan: {
                setupWizard: 'wp-admin/admin.php?page=dokan-setup',
                dokan: 'wp-admin/admin.php?page=dokan#',

                // only lite
                liteModules: 'wp-admin/admin.php?page=dokan#/pro-modules',
                proFeatures: 'wp-admin/admin.php?page=dokan#/premium',

                // lite and pro
                withdraw: 'wp-admin/admin.php?page=dokan#/withdraw?status=pending',
                reverseWithdraws: 'wp-admin/admin.php?page=dokan#/reverse-withdrawal',
                vendors: 'wp-admin/admin.php?page=dokan#/vendors',
                vendorDetails: (sellerId: string) => `wp-admin/admin.php?page=dokan#/vendors/${sellerId}`,
                vendorDetailsEdit: (sellerId: string) => `wp-admin/admin.php?page=dokan#/vendors/${sellerId}?edit=true`,
                storeCategories: 'wp-admin/admin.php?page=dokan#/store-categories',
                abuseReports: 'wp-admin/admin.php?page=dokan#/abuse-reports',
                storeReviews: 'wp-admin/admin.php?page=dokan#/store-reviews',
                storeSupport: 'wp-admin/admin.php?page=dokan#/admin-store-support',
                requestForQuote: 'wp-admin/admin.php?page=dokan#/request-for-quote',
                requestForQuoteRules: 'wp-admin/admin.php?page=dokan#/request-for-quote/quote-rules',
                sellerBadge: 'wp-admin/admin.php?page=dokan#/dokan-seller-badge',
                announcements: 'wp-admin/admin.php?page=dokan#/announcement',
                refunds: 'wp-admin/admin.php?page=dokan#/refund?status=pending',
                reports: 'wp-admin/admin.php?page=dokan#/reports',
                allLogs: 'wp-admin/admin.php?page=dokan#/reports?tab=logs',
                modules: 'wp-admin/admin.php?page=dokan#/modules',
                tools: 'wp-admin/admin.php?page=dokan#/tools',
                productQA: 'wp-admin/admin.php?page=dokan#/product-qa',
                questionDetails: (questionId: string) => `wp-admin/admin.php?page=dokan#/product-qa/${questionId}`,
                subscriptions: 'wp-admin/admin.php?page=dokan#/subscriptions',
                verifications: 'wp-admin/admin.php?page=dokan#/verifications?status=pending',
                productAdvertising: 'wp-admin/admin.php?page=dokan#/product-advertising',
                wholeSaleCustomer: 'wp-admin/admin.php?page=dokan#/wholesale-customer',
                help: 'wp-admin/admin.php?page=dokan#/help',
                settings: 'wp-admin/admin.php?page=dokan#/settings',
                license: 'wp-admin/admin.php?page=dokan_updates',

                // others
                downloadOrderLogs: 'wp-admin/admin.php?download-order-log-csv',
                subscribe: 'https://api.getwemail.io/v1/embed/subscribe',
            },

            wc: {
                products: 'wp-admin/edit.php?post_type=product',
                productDetails: (productId: string) => `wp-admin/post.php?post=${productId}&action=edit`,
                addNewProducts: 'wp-admin/post-new.php?post_type=product',
                addNewCategories: 'wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product',
                addNewAttributes: 'wp-admin/edit.php?post_type=product&page=product_attributes',
                searchAttribute: 'wp-admin/admin-ajax.php?action=woocommerce_json_search_product_attributes',
                term: 'wp-admin/admin-ajax.php?term',
                taxonomyTerms: 'wp-admin/admin-ajax.php?action=woocommerce_json_search_taxonomy_terms',
                taxonomy: 'wp-admin/edit-tags.php?taxonomy',
                coupons: 'wp-admin/edit.php?post_type=shop_coupon',
                addCoupon: 'wp-admin/post-new.php?post_type=shop_coupon',
                orders: 'wp-admin/edit.php?post_type=shop_order',
                settings: 'wp-admin/admin.php?page=wc-settings',
                taxSettings: 'wp-admin/admin.php?page=wc-settings&tab=tax',
                shippingSettings: 'wp-admin/admin.php?page=wc-settings&tab=shipping',
                shippingZone: (zoneId: string) => `wp-admin/admin.php?page=wc-settings&tab=shipping&zone_id=${zoneId}`,
                paymentSettings: 'wp-admin/admin.php?page=wc-settings&tab=checkout',
                accountSettings: 'wp-admin/admin.php?page=wc-settings&tab=account',
            },
        },

        frontend: {
            // customer
            myAccount: 'my-account',
            myOrders: 'my-orders',
            requestForQuote: 'request-quote',
            requestedQuote: 'my-account/request-a-quote',
            accountMigration: 'my-account/account-migration',
            myAccountToProductQA: 'my-account/?product_qa',
            orderCancel: 'cart/?cancel_order',
            orderAgain: 'cart/?order_again',
            orderPay: 'checkout/order-pay',
            orderReceived: 'checkout/order-received',
            customerLogout: 'my-account/customer-logout',

            rmaRequests: 'my-account/rma-requests',
            viewRmaRequests: 'my-account/view-rma-requests',
            requestWarranty: 'my-account/request-warranty',
            followingStores: 'my-account/following',
            supportTickets: 'my-account/support-tickets',

            productCustomerPage: 'product',
            ordersCustomerPage: 'orders',
            shop: 'shop',
            shopSort: 'shop/?orderby',
            storeListing: 'store-listing',
            storeListingSort: 'store-listing/?stores_orderby',
            cart: 'cart',
            checkout: 'checkout',
            addToCart: 'wc-ajax=add_to_cart',
            applyCoupon: 'wc-ajax=apply_coupon',
            removeCoupon: 'wc-ajax=remove_coupon',
            refreshedFragment: 'wc-ajax=get_refreshed_fragments',
            placeOrder: '?wc-ajax=checkout',
            billingAddress: 'my-account/edit-address/billing',
            shippingAddress: 'my-account/edit-address/shipping',
            editAddress: 'my-account/edit-address',
            shippingAddressCheckout: 'wc-ajax=update_order_review',
            bookedDayBlocks: '?wc-ajax=wc_bookings_find_booked_day_blocks',
            editAccountCustomer: 'my-account/edit-account',
            becomeVendor: 'my-account/account-migration',
            productDetails: (productName: string) => `product/${productName}`,
            orderDetails: (orderId: string) => `my-account/view-order/${orderId}`,
            orderReceivedDetails: (orderId: string, orderKey: string) => `checkout/order-received/${orderId}/?key=${orderKey}`,
            vendorDetails: (storeName: string) => `store/${storeName}`,
            storeReviews: (storeName: string) => `store/${storeName}/reviews`,
            quoteDetails: (quotId: string) => `my-account/request-a-quote/${quotId}`,
            supportTicketDetails: (ticketId: string) => `my-account/support-tickets/${ticketId}`,
            productSubscriptionDetails: (subscriptionId: string) => `my-account/view-subscription/${subscriptionId}`,
            talkjs: 'app.talkjs.com/api',

            productReview: 'wp-comments-post.php',
            submitSupport: 'wp-comments-post.php',

            // vendor dashboard
            vDashboard: {
                setupWizard: '?page=dokan-seller-setup',
                dashboard: 'dashboard',
                products: 'dashboard/products',
                spmv: 'dashboard/products-search',
                orders: 'dashboard/orders',
                userSubscriptions: 'dashboard/user-subscription',
                requestQuotes: 'dashboard/requested-quotes',
                quoteDetails: (quotId: string) => `dashboard/requested-quotes/${quotId}`,
                coupons: 'dashboard/coupons',
                reports: 'dashboard/reports',
                statement: 'dashboard/reports/?chart=sales_statement',
                deliveryTime: 'dashboard/delivery-time-dashboard',
                reviews: 'dashboard/reviews',
                withdraw: 'dashboard/withdraw',
                withdrawRequests: 'dashboard/withdraw-requests',
                reverseWithdrawal: 'dashboard/reverse-withdrawal',
                badges: 'dashboard/seller-badge',
                productQA: 'dashboard/product-questions-answers',
                questionDetails: (questionId: string) => `dashboard/product-questions-answers/?question_id=${questionId}`,
                returnRequest: 'dashboard/return-request',
                staff: 'dashboard/staffs',
                followers: 'dashboard/followers',
                booking: 'dashboard/booking',
                addBookingProduct: 'dashboard/booking/new-product',
                addBooking: 'dashboard/booking/add-booking',
                manageBooking: 'dashboard/booking/my-bookings',
                bookingCalendar: 'dashboard/booking/calendar',
                manageResources: 'dashboard/booking/resources',
                announcements: 'dashboard/announcement',
                analytics: 'dashboard/analytics',
                subscriptions: 'dashboard/subscription',
                tools: 'dashboard/tools',
                export: 'dashboard/tools/#export',
                csvImport: 'dashboard/tools/csv-import',
                csvExport: 'dashboard/tools/csv-export',
                auction: 'dashboard/auction',
                auctionActivity: 'dashboard/auction-activity',
                inbox: 'dashboard/inbox',
                auctionProductEdit: (productId: string) => `dashboard/auction/?product_id=${productId}&action=edit`,
                storeSupport: 'dashboard/support',

                // sub menus
                settingsStore: 'dashboard/settings/store',
                settingsAddon: 'dashboard/settings/product-addon',
                settingsAddonEdit: (addonId: string) => `dashboard/settings/product-addon/?edit=${addonId}`,
                settingsPayment: 'dashboard/settings/payment',
                settingsPrintful: 'dashboard/settings/printful',
                printful: 'https://www.printful.com/oauth/authorize',

                // payment settings
                paypal: 'dashboard/settings/payment-manage-paypal',
                bankTransfer: 'dashboard/settings/payment-manage-bank',
                customPayment: 'dashboard/settings/payment-manage-dokan_custom',
                skrill: 'dashboard/settings/payment-manage-skrill',

                settingsVerification: 'dashboard/settings/verification',
                settingsDeliveryTime: 'dashboard/settings/delivery-time',
                settingsShipping: 'dashboard/settings/shipping',
                settingsShipstation: 'dashboard/settings/shipstation',
                settingsSocialProfile: 'dashboard/settings/social',
                settingsRma: 'dashboard/settings/rma',
                settingsSeo: 'dashboard/settings/seo',

                editAccountVendor: 'dashboard/edit-account',
            },
        },

        api: {
            wp: {
                pages: 'wp/v2/pages',
            },

            dokan: {
                products: 'dokan/v1/products',
                stores: 'dokan/v1/stores',
                storeCategories: 'dokan/v1/store-categories',
                withdraws: 'dokan/v1/withdraw',
                reverseWithdraws: 'dokan/v1/reverse-withdrawal',
                abuseReports: 'dokan/v1/abuse-reports',
                logs: 'dokan/v1/admin/logs',
                announcements: 'dokan/v1/announcement',
                deliveryTime: 'dokan/v1/delivery-time',
                dummyData: 'dokan/v1/dummy-data',
                dummyDataImport: 'dokan/v1/dummy-data/import',
                refunds: 'dokan/v1/refunds',
                modules: 'dokan/v1/admin/modules',
                multistepCategories: 'dokan/v1/products/multistep-categories',
                storeReviews: 'dokan/v1/store-reviews',
                productAdvertising: 'dokan/v1/product_adv',
                wholesaleRegister: 'dokan/v1/wholesale/register',
                wholesaleCustomers: 'dokan/v1/wholesale/customers',
                storeSupport: 'dokan/v1/admin/support-ticket',
                quotes: 'dokan/v1/request-for-quote',
                quoteRules: 'dokan/v1/request-for-quote/quote-rule',
                sellerBadge: 'dokan/v1/seller-badge',
                sellerBadgeEvent: 'dokan/v1/seller-badge/events',
                productQuestions: 'dokan/v1/product-questions',
                productQuestionsBulkActions: 'dokan/v1/product-questions/bulk_action',
                productAnswers: 'dokan/v1/product-answers',
                subscriptions: 'dokan/v1/subscription',
                verifications: 'dokan/v1/verification-requests',
                verificationMethods: 'dokan/v1/verification-methods',
            },

            wc: {
                products: 'wc/v3/products',
                orders: 'wc/v3/orders',
                customers: 'wc/v3/customers',
                store: 'wc/store',
                paymentGateways: 'wc/v3/payment_gateways',
            },
        },
    },

    // user
    user: {
        username: () => faker.person.firstName('male'),
        password: USER_PASSWORD,

        userDetails: {
            emailDomain: '@email.com',
            name: () => faker.person.firstName('male'),
            firstName: () => faker.person.firstName('male'),
            lastName: () => faker.person.lastName('male'),
            // email: faker.internet.email(),
            email: () => `${faker.person.firstName('male')}@email.com`,
            role: 'customer',
        },
    },

    // admin
    admin: {
        username: ADMIN,
        password: ADMIN_PASSWORD,
    },

    // vendor
    vendor: {
        username: VENDOR,
        password: USER_PASSWORD,
        lastname: `${VENDOR} ln`,
        storeName: `${VENDOR}store`,

        vendor2: {
            username: VENDOR2,
            password: USER_PASSWORD,
        },

        vendorInfo: {
            emailDomain: '@email.com',
            email: () => `${faker.person.firstName('male')}@email.com`,
            password: USER_PASSWORD,
            password1: `${USER_PASSWORD}1`,
            firstName: () => faker.person.firstName('male'),
            lastName: () => faker.person.lastName('male'),
            userName: faker.person.firstName('male'),
            shopName: () => faker.company.name(),
            shopUrl: () => faker.company.name(),

            // eu compliance data
            companyName: faker.company.name(),
            companyId: faker.string.alphanumeric(5),
            vatNumber: faker.string.alphanumeric(10),
            bankIban: faker.finance.iban(),

            phoneNumber: faker.phone.number(),
            phone: '0123456789',
            street1: 'abc street',
            street2: 'xyz street',
            country: 'United States (US)',
            countrySelectValue: 'US',
            stateSelectValue: 'NY',
            city: 'New York',
            zipCode: '10006',
            state: 'New York',
            accountName: 'accountName',
            accountNumber: faker.string.alphanumeric(10),
            accountType: 'personal', //'personal' 'business',
            bankName: 'bankName',
            bankAddress: 'bankAddress',
            routingNumber: faker.string.alphanumeric(10),
            swiftCode: faker.string.alphanumeric(10),
            iban: faker.string.alphanumeric(10),
            role: 'seller',
            nanoid: faker.string.nanoid(10),

            // shop details
            banner: 'utils/sampleData/banner.png',
            profilePicture: 'utils/sampleData/avatar.png',
            storeName: `${VENDOR}store`,
            productsPerPage: '12',
            mapLocation: 'New York',
            termsAndConditions: 'Vendor Terms and Conditions',
            biography: 'Vendor biography',
            supportButtonText: 'Get Support',

            // address fields enable flag (on vendor registration)
            addressFieldsEnabled: false,

            // commission
            commission: {
                commissionType: 'fixed', // 'fixed','category_based'
                commissionPercentage: '5',
                commissionFixed: '5',
                commissionCategory: {
                    allCategory: true, // true for all category, false for specific category
                    category: 'All Categories',
                },
            },

            // subscription pack
            vendorSubscriptionPack: 'Dokan_Subscription_Non_recurring',

            account: {
                updateSuccessMessage: 'Account details changed successfully.',
            },

            openingClosingTime: {
                days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
                statusLite: 'open', // open, close
                openingTime: '12:00 am',
                closingTime: '11:30 pm',
                storeOpenNotice: 'Store is open',
                storeCloseNotice: 'Store is closed',
            },

            vacation: {
                closingStyle: 'datewise',

                instantly: {
                    closingStyle: 'instantly',
                    vacationMessage: 'We are currently out of order',
                },

                datewise: {
                    vacationDayFrom: () => helpers.addDays(helpers.currentDate, helpers.getRandomArbitraryInteger(31, 100), 'compact'),
                    vacationDayTo: (from: string) => helpers.addDays(from, 31, 'compact'),
                    closingStyle: 'datewise',
                    vacationMessage: 'We are currently out of order',
                },
            },

            storeSettingsSaveSuccessMessage: 'Your information has been saved successfully',

            socialProfileUrls: {
                facebook: 'https://www.facebook.com/',
                twitter: 'https://www.twitter.com/',
                pinterest: 'https://www.pinterest.com/',
                linkedin: 'https://www.linkedin.com/',
                youtube: 'https://www.youtube.com/',
                instagram: 'https://www.instagram.com/',
                flickr: 'https://www.flickr.com/',
            },

            payment: {
                // email: () => faker.internet.email(),
                email: () => `${faker.person.firstName('male')}@email.com`,
                bankAccountName: 'accountName',
                bankAccountType: faker.helpers.arrayElement(['personal', 'business']),
                bankAccountNumber: faker.string.alphanumeric(10),
                bankName: 'bankName',
                bankAddress: 'bankAddress',
                bankRoutingNumber: faker.string.alphanumeric(10),
                bankIban: faker.finance.iban(),
                bankSwiftCode: faker.string.alphanumeric(10),
            },

            sendEmail: {
                subject: 'test email subject',
                message: 'test email message',
            },

            amountDiscount: {
                minimumOrderAmount: '200',
                discountPercentage: '10',
            },

            liveChat: {
                pageId: '',
            },

            minMax: {
                minimumProductQuantity: '1',
                maximumProductQuantity: '20',
                minimumAmount: '10',
                maximumAmount: '1000000',
                category: 'Uncategorized',
            },
        },

        shipping: {
            shippingPolicy: {
                processingTime: '3', // '1', '2', '3', '4', '5', '6', '7', '8', '9'
                shippingPolicy: 'shipping policy',
                refundPolicy: 'refund policy',
                saveSuccessMessage: 'Settings save successfully',
            },

            shippingZone: 'US',
            shippingCountry: 'United States (US)',
            methods: faker.helpers.arrayElement(['flat_rate', 'free_shipping', 'local_pickup', 'dokan_table_rate_shipping', 'dokan_distance_rate_shipping']),
            shippingMethods: {
                flatRate: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'flat_rate',
                    shippingMethod: 'Flat Rate',
                    shippingMethodTitle: 'Flat Rate',
                    taxStatus: 'taxable',
                    shippingCost: '20',
                    description: 'Flat rate',
                    calculationType: 'class', // 'item', 'line', 'class', 'order'
                    shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
                    zoneSaveSuccessMessage: 'Zone settings save successfully',
                    saveSuccessMessage: 'Zone settings save successfully',
                },

                freeShipping: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'free_shipping',
                    shippingMethod: 'Free Shipping',
                    shippingMethodTitle: 'Free Shipping',
                    freeShippingOption: 'min_amount', // 'coupon', 'min_amount', 'either', 'both'
                    freeShippingRequires: 'min_amount',
                    freeShippingMinimumOrderAmount: '200',
                    shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
                    zoneSaveSuccessMessage: 'Zone settings save successfully',
                    saveSuccessMessage: 'Zone settings save successfully',
                },

                localPickup: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'local_pickup',
                    shippingMethod: 'Local Pickup',
                    shippingMethodTitle: 'Local Pickup',
                    taxStatus: 'taxable',
                    shippingCost: '20',
                    description: 'Local Pickup',
                    shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
                    zoneSaveSuccessMessage: 'Zone settings save successfully',
                    saveSuccessMessage: 'Zone settings save successfully',
                },

                tableRateShipping: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'dokan_table_rate_shipping',
                    shippingMethod: 'Table Rate',
                    shippingMethodTitle: 'Table Rate',
                    taxStatus: 'taxable',
                    taxIncludedInShippingCosts: 'no', // 'yes', 'no'
                    handlingFee: '10',
                    maximumShippingCost: '200',
                    calculationType: 'item',
                    handlingFeePerOrder: '10',
                    minimumCostPerOrder: '10',
                    maximumCostPerOrder: '200',
                    shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
                    zoneSaveSuccessMessage: 'Zone settings save successfully',
                    saveSuccessMessage: 'Zone settings save successfully',
                    tableRateSaveSuccessMessage: 'Table rates has been saved successfully!',
                },

                distanceRateShipping: {
                    shippingZone: 'US',
                    shippingCountry: 'United States (US)',
                    selectShippingMethod: 'dokan_distance_rate_shipping',
                    shippingMethod: 'Distance Rate',
                    shippingMethodTitle: 'Distance Rate',
                    taxStatus: 'taxable',
                    transportationMode: 'driving', // 'driving', 'walking', 'Bicycling'
                    avoid: 'none', // 'none', 'tolls', 'highways', 'ferries'
                    distanceUnit: 'metric', // 'metric', 'imperial'
                    street1: 'abc street',
                    street2: 'xyz street',
                    city: 'New York',
                    zipCode: '10006',
                    state: 'New York',
                    country: 'United States (US)',
                    shippingMethodSaveSuccessMessage: 'Shipping method added successfully',
                    zoneSaveSuccessMessage: 'Zone settings save successfully',
                    saveSuccessMessage: 'Zone settings save successfully',
                    distanceRateSaveSuccessMessage: 'Distance rates has been saved successfully!',
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
            methodName: '',
            email: () => `${faker.person.firstName('male')}@email.com`,
            bankAccountName: 'accountName',
            bankAccountType: faker.helpers.arrayElement(['personal', 'business']),
            bankAccountNumber: faker.string.alphanumeric(10),
            bankName: 'bankName',
            bankAddress: 'bankAddress',
            bankRoutingNumber: faker.string.alphanumeric(10),
            bankIban: faker.finance.iban(),
            bankSwiftCode: faker.string.alphanumeric(10),
            saveSuccessMessage: 'Your information has been saved successfully',
        },

        verification: {
            method: 'National ID',
            file: 'utils/sampleData/avatar.png',
        },

        toc: 'test Vendor terms and conditions',

        deliveryTime: {
            deliveryBlockedBuffer: '0',
            timeSlot: '30',
            orderPerSlot: '100',
            days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            choice: 'full-day',
            openingTime: '12:00 am',
            closingTime: '11:30 pm',
            fullDay: 'Full day',
            saveSuccessMessage: 'Delivery settings has been saved successfully!',
        },

        shipStation: {
            status: 'Processing',
        },

        socialProfileUrls: {
            facebook: 'https://www.facebook.com/',
            twitter: 'https://www.twitter.com/',
            pinterest: 'https://www.pinterest.com/',
            linkedin: 'https://www.linkedin.com/',
            youtube: 'https://www.youtube.com/',
            instagram: 'https://www.instagram.com/',
            flickr: 'https://www.flickr.com/',
            threads: 'https://www.threads.net/',
            saveSuccessMessage: 'Your information has been saved successfully',
        },

        // Rma Settings
        rma: {
            label: 'Warranty',
            type: 'included_warranty', // 'no_warranty', 'included_warranty', 'addon_warranty'
            length: 'limited', // 'limited', 'lifetime'
            lengthValue: '1',
            lengthDuration: 'weeks', // 'days', 'weeks', 'months', 'years'
            addon: {
                cost: '10',
                durationLength: '1',
                durationType: 'months', // 'days','weeks', 'months', 'years'
            },
            refundPolicy: 'Refund Policy Vendor',
            saveSuccessMessage: 'Settings saved successfully',
        },

        seo: {
            seoTitle: 'test seo title',
            metaDescription: 'test meta description',
            metaKeywords: 'test meta keywords',
            facebookTitle: 'test facebook title',
            facebookDescription: 'test facebook description',
            facebookImage: 'utils/sampleData/avatar.png',
            twitterTitle: 'test twitter title',
            twitterDescription: 'test twitter description',
            twitterImage: 'utils/sampleData/avatar.png',
        },

        withdraw: {
            withdrawMethod: {
                default: 'paypal',
                paypal: 'Paypal',
                skrill: 'Skrill',
                custom: 'dokan_custom',
            },

            defaultWithdrawMethod: {
                paypal: 'PayPal',
                skrill: 'Skrill',
                bankTransfer: 'Bank Transfer',
            },

            preferredPaymentMethod: 'paypal',
            preferredSchedule: 'weekly', // monthly,quarterly, biweekly,weekly
            currentBalance: '',
            minimumWithdrawAmount: '5', // '0', '5', '10', '15', '50', '100', '200', '300', '500', '1000', '2000', '3000', '5000', '10000'
            reservedBalance: '10',
            scheduleMessageInitial: 'Please update your withdraw schedule selection to get payment automatically.',
        },

        // addon
        addon: () => ({
            name: `Test Addons Group_${faker.string.nanoid(10)}`,
            priority: '10',
            category: 'Uncategorized',
            type: 'multiple_choice', // 'multiple_choice', 'checkbox', 'custom_text', 'custom_textarea', 'file_upload', 'custom_price', 'input_multiplier', 'heading'
            displayAs: 'select', // 'select', 'radiobutton', 'images'
            title: `Test Add-on Title_${faker.string.nanoid(10)}`,
            formatTitle: 'label', // 'label', 'heading', 'hide'
            addDescription: 'Add-on description',
            enterAnOption: 'Option 1',
            optionPriceType: 'flat_fee', // 'flat_fee', 'quantity_based', 'percentage_based'
            optionPriceInput: '30',
            saveSuccessMessage: 'Add-on saved successfully',
            deleteSuccessMessage: 'Add-on deleted successfully',
        }),

        registrationErrorMessage: 'Error: An account is already registered with your email address. Please log in.',
    },

    staff: () => ({
        // username: `faker.person.firstName('male')_${faker.string.nanoid(10)}`,
        firstName: faker.person.firstName('male'),
        lastName: faker.person.lastName('male'),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        password: USER_PASSWORD,
    }),

    // customer
    customer: {
        username: CUSTOMER,
        password: USER_PASSWORD,
        lastname: 'ln',
        fullName: `${CUSTOMER} c1`,
        email: `${CUSTOMER}@email.com`,

        customer2: {
            username: CUSTOMER2,
            password: USER_PASSWORD,
        },

        customerInfo: {
            emailDomain: '@email.com',
            email: () => `${faker.person.firstName('male')}@email.com`,
            password: USER_PASSWORD,
            password1: `${USER_PASSWORD}1`,
            firstName: () => faker.person.firstName('male'),
            lastName: () => faker.person.lastName('male'),
            username: () => faker.person.firstName('male'),
            shopName: () => `${faker.person.firstName('male')}store`,
            role: 'customer',
            companyName: faker.company.name(),
            companyId: faker.string.alphanumeric(5),
            vatNumber: faker.string.alphanumeric(10),
            bankName: 'bankName',
            bankAddress: 'bankAddress',
            bankIban: faker.finance.iban(),
            phone: faker.phone.number(),
            street1: 'abc street',
            street2: 'xyz street',
            country: 'United States (US)',
            countrySelectValue: 'US',
            stateSelectValue: 'NY',
            city: 'New York',
            zipCode: '10006',
            state: 'New York',
            accountName: 'accountName',
            accountNumber: faker.string.alphanumeric(10),
            routingNumber: faker.string.alphanumeric(10),
            swiftCode: faker.string.alphanumeric(10),
            iban: faker.string.alphanumeric(10),
            biography: 'Customer biography',
            billing: {
                firstName: CUSTOMER,
                lastName: 'c1',
                companyName: faker.company.name(),
                companyId: faker.string.alphanumeric(5),
                vatNumber: faker.string.alphanumeric(10),
                bankName: 'bankName',
                bankIban: faker.finance.iban(),
                street1: 'abc street',
                street2: 'xyz street',
                city: 'New York',
                zipCode: '10003',
                country: 'United States (US)',
                state: 'New York',
                email: `${CUSTOMER}@email.com`,
                phone: '0123456789',
            },
            shipping: {
                email: `${CUSTOMER}@email.com`,
                firstName: CUSTOMER,
                lastName: 'c1',
                companyName: faker.company.name(),
                street1: 'abc street',
                street2: 'xyz street',
                city: 'New York',
                zipCode: '10003',
                country: 'United States (US)',
                state: 'New York',
                phone: '0123456789',
            },

            // subscription
            vendorSubscriptionPack: 'Dokan_Subscription_Non_recurring',
        },

        getSupport: {
            subject: 'get Support Subject',
            message: 'get Support Message',
            orderId: '',
            supportSubmitSuccessMessage: 'Thank you. Your ticket has been submitted!',
            username: CUSTOMER,
            userPassword: USER_PASSWORD,
        },

        supportTicket: {
            message: () => faker.string.nanoid(10),
        },

        rma: {
            sendMessage: 'Message send successfully',
        },

        account: {
            updateSuccessMessage: 'Account details changed successfully.',
        },

        follow: {
            following: 'Following',
        },

        address: {
            addressChangeSuccessMessage: 'Address changed successfully.',
        },

        registration: {
            registrationErrorMessage: 'Error: An account is already registered with your email address. Please log in.',
        },
    },

    // date
    date: {
        previousDate: helpers.addDays(helpers.currentDate, -1, 'compact'),
        currentDate: helpers.currentDate,
        nextDay: helpers.addDays(helpers.currentDate, 1, 'compact'),

        // dateRange compact formate
        dateRange: {
            startDate: helpers.currentDate,
            endDate: helpers.addDays(helpers.currentDate, 1, 'compact'),
        },

        // dateRange full format
        dateRangeFull: {
            startDate: helpers.currentDateTimeFullFormat,
            endDate: helpers.addDays(helpers.currentDateTimeFullFormat, 1, 'complete'),
        },
    },

    // store category
    storeCategory: () => ({
        name: `test category_${faker.string.nanoid(10)}`,
        description: 'test category description',
    }),

    // store review
    storeReview: {
        review: () => ({
            rating: '4',
            ratingByWidth: faker.helpers.arrayElement(['width: 20%', 'width: 40%', 'width: 60%', 'width: 80%', 'width: 100%']),
            title: `test title_${faker.string.nanoid(10)}`,
            content: `test content_${faker.string.nanoid(10)}`,
        }),
        filter: {
            byVendor: `${VENDOR}store`,
        },
    },

    // store support
    storeSupport: {
        title: 'test support ticket',

        filter: {
            byCustomer: CUSTOMER,
            byVendor: `${VENDOR}store`,
        },

        chatReply: {
            reply: `chat reply${faker.string.nanoid(10)}`,
            asAdmin: 'admin chat reply',
            asVendor: 'vendor chat reply',
        },
    },

    // Reverse withdraw
    reverseWithdraw: {
        store: `${VENDOR2}store`,
        transactionType: 'manual_product', // manual_product, manual_order, other
        product: '',
        withdrawalBalanceType: 'debit', // debit, credit
        amount: '500',
        note: 'test reverse withdraw note',
        saveSuccessMessage: 'Reverse withdrawal created successfully.',
    },

    // request for quotation
    requestForQuotation: {
        userRole: {
            administrator: 'administrator',
            editor: 'editor',
            author: 'author',
            contributor: 'contributor',
            subscriber: 'subscriber',
            customer: 'customer',
            shopManager: 'shop_manager',
            vendor: 'seller',
            vendorStaff: 'vendor_staff',
            wholesaleCustomer: 'dokan_wholesale_customer',
            guest: 'guest',
        },

        quoteRule: () => ({
            title: `test rule_${faker.string.nanoid(10)}`,
            userRole: 'customer',
            applyOnAllProducts: false,
            specificProducts: true,
            includeProducts: 'p1_v1 (simple)',
            // excludeProducts: 'p1_v2 (simple)',
            specificCategories: false,
            categories: ['Uncategorized'],
            specificVendors: false,
            includeVendors: 'vendor1store',
            excludeVendors: 'vendor2store',
            // expireLimit: '20', // todo: fix after api is updated
            hidePrice: true,
            hidePriceText: 'Price is hidden',
            hideAddToCartButton: true,
            keepBothCartQuoteButton: true,
            customButtonLabel: 'Add to quote',
            order: '0',
        }),

        trashedQuoteRule: {
            title: 'trashed quote rule',
            status: 'trash',
        },

        quote: () => ({
            id: '',
            title: `test quote_${faker.string.nanoid(10)}`,
            user: CUSTOMER,
            fullName: 'Jhon Doe',
            email: `${CUSTOMER}@email.com`,
            companyName: 'abc',
            phoneNumber: '0123456789',
            vendor: `${VENDOR2}store`,
            product: 'p1_v2 (simple)',
            quantity: '5',
            offerPrice: '80',
            offerProductQuantity: '10',
            shippingCost: '20',
        }),

        trashedQuote: {
            title: 'trashed quote',
            status: 'trash',
        },

        convertedQuote: {
            title: `converted quote_${faker.string.nanoid(10)}`,
        },

        vendorUpdateQuote: {
            productName: '',
            offeredPrice: '80',
            shippingCost: '20',
            reply: 'test reply',
        },

        customerQuoteProduct: {
            productName: '',
            offeredPrice: '30',
            quantity: '20',
            shippingCost: '',
            expectedDelivery: helpers.addDays(helpers.currentDateTime, 2),
            additionalMessage: 'test quote message',
        },

        guest: () => ({
            fullName: faker.person.fullName({ sex: 'male' }),
            email: `${faker.person.firstName('male')}@email.com`,
            phoneNumber: faker.phone.number(),

            address: {
                country: 'United States (US)',
                countrySelectValue: 'US',
                stateSelectValue: 'NY',
                city: 'New York',
                postCode: '10006',
                addressLine1: 'abc street',
                addressLine2: 'xyz street',
            },
        }),
    },

    // seller badge
    sellerBadge: {
        eventName: {
            // product related badges
            productsPublished: 'Products Published',
            numberOfItemsSold: 'Number of Items Sold',
            featuredProducts: 'Featured Products',
            trendingProduct: 'Trending Product',

            // seller related badges
            featuredSeller: 'Featured Seller',
            exclusiveToPlatform: 'Exclusive to Platform',
            verifiedSeller: 'Verified Seller',
            yearsActive: 'Years Active',

            // Order Related Badges
            numberOfOrders: 'Number of Orders',
            // Sale Amount Related Badges
            saleAmount: 'Sale Amount',

            // Customer Related Badges
            customerReview: 'Customer Review',
            storeSupportCount: 'Store Support Count',
        },

        badgeName: '',
        verificationMethod: '',
        trendingProductPeriod: 'week', // week, month
        trendingProductTopBestSellingProduct: '3',

        startingLevelValue: '1',
        maxLevel: 5,

        verifiedSellerMethod: {
            idVerification: 'id_verification',
            companyVerification: 'company_verification',
            addressVerification: 'address_verification',
            phoneVerification: 'phone_verification',
            socialProfiles: 'social_profiles',
        },

        badgeStatus: 'published', // published, draft
    },

    //  question answers
    questionAnswers: () => ({
        question: `test question_${faker.string.nanoid(5)}`,
        editQuestion: `edited test question_${faker.string.nanoid(5)}`,
        answer: `test answer_${faker.string.nanoid(5)}`,
        editAnswer: `edited test answer_${faker.string.nanoid(5)}`,
        guest: {
            username: CUSTOMER2,
            password: USER_PASSWORD,
        },

        filter: {
            byVendor: `${VENDOR}store`,
            byProduct: 'p1_v1 (simple)',
        },
    }),

    // announcement
    announcement: {
        receiverType: {
            allVendors: 'all_seller',
            selectedVendors: 'selected_seller',
            enabledVendors: 'enabled_seller',
            disabledVendors: 'disabled_seller',
            featuredVendors: 'featured_seller',
        },

        randomTitle: () => `test announcement_${faker.string.nanoid(10)}`,
        title: 'test announcement title',
        content: 'test announcement Content',
        receiver: 'all_seller',
        publishType: 'immediately',
        scheduleDate: helpers.futureDate('', 10),
    },

    // modules
    modules: {
        noModuleMessage: 'No modules found.',
        moduleStats: {
            totalModules: 40,
            modulesVideoLink: 19,
            productManagement: 15,
            integration: 6,
            uiUx: 2,
            shipping: 3,
            storeManagement: 10,
            payment: 6,
            orderManagement: 2,
            vendorManagement: 1,
        },

        modules: [
            'booking',
            'color_scheme_customizer',
            'delivery_time',
            'elementor',
            'export_import',
            'follow_store',
            'geolocation',
            'germanized',
            'live_chat',
            'live_search',
            'moip',
            'paypal_marketplace',
            'product_addon',
            'product_enquiry',
            'report_abuse',
            'rma',
            'seller_vacation',
            'shipstation',
            'auction',
            'spmv',
            'store_reviews',
            'stripe',
            'printful',
            'product_advertising',
            'product_subscription',
            'vendor_analytics',
            'vendor_staff',
            'vsp',
            'vendor_verification',
            'wholesale',
            'rank_math',
            'table_rate_shipping',
            'mangopay',
            'order_min_max',
            'razorpay',
            'seller_badge',
            'stripe_express',
            'request_for_quotation',
        ],

        modulesName: {
            auctionIntegration: 'Auction Integration',
            colorSchemeCustomize: 'Color Scheme Customize',
            deliveryTime: 'Delivery Time',
            elementor: 'Elementor',
            eUComplianceFields: 'EU Compliance Fields',
            followStore: 'Follow Store',
        },

        moduleCategory: {
            productManagement: 'Product Management',
            integration: 'Integration',
            uiUx: 'UI & UX',
            shipping: 'Shipping',
            storeManagement: 'Store Management',
            payment: 'Payment',
            orderManagement: 'Order Management',
            vendorManagement: 'Vendor Management',
        },

        layout: {
            grid: 'my-modules grid-view',
            list: 'my-modules list-view',
        },
    },

    // tools
    tools: {
        distanceMatrixApi: {
            address1: 'R9PG+W7 Dhaka',
            address2: 'R9H7+HF Dhaka',
            address3: 'P2J3+93 New York, USA',
            address4: 'M2CP+FG New York, USA',
        },
    },

    // product advertisement
    productAdvertisement: {
        advertisedProductStore: `${VENDOR}store`,
        advertisedProduct: 'p1_v1 (simple)',

        filter: {
            byStore: `${VENDOR}store`,
            createVia: {
                admin: 'Admin',
                order: 'Order',
                subscription: 'Subscription',
                freePurchase: 'Free Purchase',
            },
        },
    },

    // wholesale customers
    wholesale: {
        wholesaleRequestSendMessage: 'Your wholesale customer request send to the admin. Please wait for approval',
        becomeWholesaleCustomerSuccessMessage: 'You are succefully converted as a wholesale customer',
        wholesaleCapabilityActivate: 'Wholesale capability activate',
    },

    // vendor staff
    vendorStaff: {
        basicMenu: ['dokan_view_product_menu', 'dokan_view_order_menu', 'dokan_view_coupon_menu'],
        basicMenuNames: ['products', 'orders', 'coupons'],
        menus: [
            'dokan_view_overview_menu',
            'dokan_view_product_menu',
            'dokan_view_order_menu',
            'dokan_view_coupon_menu',
            'dokan_view_report_menu',
            'dokan_view_review_menu',
            'dokan_view_withdraw_menu',
            'dokan_view_store_settings_menu',
            'dokan_view_store_payment_menu',
            'dokan_view_store_shipping_menu',
            'dokan_view_store_social_menu',
            'dokan_view_store_seo_menu',
            'dokan_view_booking_menu',
            'dokan_view_tools_menu',
            'dokan_view_auction_menu',
            'dokan_view_store_verification_menu',
        ],
    },

    // dokan settings
    dokanSettings: {
        // general settings
        general: {
            settingTitle: 'General Settings',
            vendorStoreUrl: 'store',
            setupWizardMessage: "Thank you for choosing The Marketplace to power your online store! This quick setup wizard will help you configure the basic settings. It's completely optional and shouldn't take longer than two minutes.",
            sellingProductTypes: 'both', // 'both', 'physical', 'digital'
            storeProductPerPage: '12',
            storCategory: 'multiple', // 'none', 'single', 'multiple'
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // selling options settings
        selling: {
            settingTitle: 'Selling Option Settings',
            commission: {
                commissionType: 'fixed', // 'fixed','category_based'
                commissionPercentage: '10',
                commissionFixed: '10',
                commissionCategory: {
                    allCategory: true, // true for all category, false for specific category
                    category: 'All Categories',
                },
            },
            shippingFeeRecipient: 'seller', // 'seller', 'admin'
            productTaxFeeRecipient: 'seller', // 'seller', 'admin'
            shippingTaxFeeRecipient: 'seller', // 'seller', 'admin'
            newProductStatus: 'publish', // 'publish', 'pending'
            productCategorySelection: 'single', // 'single', 'multiple'
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // withdraw
        withdraw: {
            settingTitle: 'Withdraw Settings',
            customMethodName: 'Bksh',
            customMethodType: 'Phone',
            charge: {
                paypal: '5',
                bank: '5',
                skrill: '5',
                custom: '5',
            },
            minimumWithdrawAmount: '5',
            withdrawThreshold: '0',
            quarterlyScheduleMonth: 'march', // 'january', 'february', 'march'
            quarterlyScheduleWeek: '1', // '1', '2', '3', 'L'
            quarterlyScheduleDay: 'monday', // 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
            monthlyScheduleWeek: '1', // '1', '2', '3', 'L'
            monthlyScheduleDay: 'monday', // 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
            biweeklyScheduleWeek: '1', // '1', '2'
            biweeklyScheduleDay: 'monday', // 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
            weeklyScheduleDay: 'monday', // 'saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // reverse withdraw
        reverseWithdraw: {
            settingTitle: 'Reverse Withdrawal Settings',
            billingType: 'by_amount', // 'by_month'
            reverseBalanceThreshold: '21',
            gracePeriod: '7',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // pages
        page: {
            settingTitle: 'Site and Store Page Settings',
            dashboard: 'Dashboard',
            myOrders: 'My Orders',
            storeListing: 'Store List',
            termsAndConditions: 'Terms And Conditions',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // appearance
        appearance: {
            settingTitle: 'Appearance Settings',
            mapApiSource: 'google_maps', // 'google_maps', 'mapbox'
            googleMapApiKey: GMAP,
            mapBoxApiKey: MAPBOX,
            storeBannerWidth: '625',
            storeBannerHeight: '300',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // menuManager
        menuManager: {
            menus: [
                'Products',
                'Orders',
                'Request Quotes',
                'Coupons',
                'Reports',
                'Delivery Time',
                'Reviews',
                'Withdraw',
                'Reverse Withdrawal',
                'Badge',
                'Product Q&A',
                'Return Request',
                'Staff',
                'Followers',
                // 'Subscription',
                'Booking',
                'Announcements',
                'Analytics',
                'Tools',
                'Auction',
                'Support',
            ],
            settingTitle: 'Menu Manager Settings',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // privacy policy
        privacyPolicy: {
            settingTitle: 'Privacy Settings',
            privacyPage: '2', // '2', '3', '4', '5', '6', '7', '8', '9', '10'
            privacyPolicyContent: 'Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our [dokan_privacy_policy]',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // colors
        colors: {
            settingTitle: 'Colors Settings',
            paletteChoice: 'pre-defined',
            colorPalette: 'default',
            predefinedPalette: {
                default: 'default',
                petalParty: 'petal party',
                pinky: 'pinky',
                ocean: 'ocean',
                sweety: 'sweety',
                summerSplash: 'summer splash',
                tree: 'tree',
            },

            paletteValues: {
                default: {
                    buttonText: '#FFFFFF',
                    buttonBackground: '#F05025',
                    buttonBorder: '#DA502B',
                    buttonHoverText: '#FFFFFF',
                    buttonHoverBackground: '#DD3B0F',
                    buttonHoverBorder: '#C83811',
                    dashboardSidebarMenuText: '#CFCFCF',
                    dashboardSidebarBackground: '#1B233B',
                    dashboardSidebarActiveMenuText: '#FFFFFF',
                    dashboardSidebarActiveMenuBackground: '#F05025',
                },
                tree: {
                    buttonText: '#FFFFFF', // rgb(255, 255, 255)
                    buttonBackground: '#1CB6A7', // rgb(28, 182, 167)
                    buttonBorder: '#1AA89B', // rgb(26, 168, 155)
                    buttonHoverText: '#FFFFFF', // rgb(255, 255, 255)
                    buttonHoverBackground: '#1DADA0', // rgb(29, 173, 160)
                    buttonHoverBorder: '#148C81', //rgb(20, 140, 129)
                    dashboardSidebarMenuText: '#ABF5EE', // rgb(171, 245, 238)',
                    dashboardSidebarBackground: '#1BAC9E', // rgb(27, 172, 158)
                    dashboardSidebarActiveMenuText: '#FFFFFF', // rgb(255, 255, 255)
                    dashboardSidebarActiveMenuBackground: '#167D7F', // rgb(22, 125, 127)
                },
                custom: {
                    buttonText: '#FFFFFF', // White
                    buttonBackground: '#007BFF', // Azure
                    buttonBorder: '#0056B3', // Egyptian Blue
                    buttonHoverText: '#FFFFFF', // White
                    buttonHoverBackground: '#0056B3', // Egyptian Blue
                    buttonHoverBorder: '#004085', // Indigo Dye
                    dashboardSidebarMenuText: '#CFCFCF', // Silver
                    dashboardSidebarBackground: '#343A40', // Oil
                    dashboardSidebarActiveMenuText: '#FFFFFF', // White
                    dashboardSidebarActiveMenuBackground: '#007BFF', // Azure
                },
                custom2: {
                    buttonText: '#FFFFFF', // White
                    buttonBackground: '#3498DB', // Sky Blue
                    buttonBorder: '#2980B9', // Dark Sky Blue
                    buttonHoverText: '#FFFFFF', // White
                    buttonHoverBackground: '#2980B9', // Dark Sky Blue
                    buttonHoverBorder: '#1F618D', // Navy Blue
                    dashboardSidebarMenuText: '#555555', // Dark Gray
                    dashboardSidebarBackground: '#F2F2F2', // Light Gray
                    dashboardSidebarActiveMenuText: '#FFFFFF', // White
                    dashboardSidebarActiveMenuBackground: '#3498DB', // Sky Blue
                },
            },
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // social api
        socialApi: {
            settingTitle: 'Social Settings',
            platform: 'facebook',
            facebook: {
                appId: FB_APP_ID,
                appSecret: FB_APP_SECRET,
            },
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // shipping status
        shippingStatus: {
            settingTitle: 'Shipping Status Settings',
            customShippingStatus: 'Test shipping status',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // quote
        quote: {
            settingTitle: 'Quote Settings',
            decreaseOfferedPrice: '0',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // live search
        liveSearch: {
            settingTitle: 'Live Search Settings',
            liveSearchOption: 'suggestion_box', // suggestion_box, old_live_search
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Store support
        storeSupport: {
            settingTitle: 'Store Support Settings',
            displayOnSingleProductPage: 'above_tab', // 'above_tab', 'inside_tab', 'dont_show'
            supportButtonLabel: 'Get Support',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Vendor Verification
        vendorVerification: {
            settingTitle: 'Vendor Verification Settings',
            verifiedIcons: {
                circleSolid: 'check_circle_solid',
                circleRegular: 'check_circle_regular',
                solid: 'check_solid',
                doubleSolid: 'check_double_solid',
                squireRegular: 'check_squire_regular',
                userCheckSolid: 'user_check_solid',
                certificateSolid: 'certificate_solid',

                byIcon: {
                    circleSolid: 'fas fa-check-circle',
                    circleRegular: 'far fa-check-circle',
                    solid: 'fas fa-check',
                    doubleSolid: 'fas fa-check-double',
                    squireRegular: 'fas fa-check-square',
                    userCheckSolid: 'fas fa-user-check',
                    certificateSolid: 'fas fa-certificate',
                },
            },

            verificationMethods: {
                nationalId: 'National ID',
                drivingLicense: 'Driving License',
                address: 'Address',
                company: 'Company',
            },

            customMethod: {
                title: `test verification method_${faker.string.nanoid(10)}`,
                help_text: 'test help-text',
                required: false,
            },

            updateMethod: {
                title: `test verification method updated_${faker.string.nanoid(10)}`,
                help_text: 'test help-text updated',
                required: true,
            },

            socialProfile: {
                facebook: 'facebook_app_details',
                twitter: 'twitter_app_details',
                google: 'google_details',
                linkedin: 'linkedin_details',
            },

            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Verification Sms Gateways
        verificationSmsGateway: {
            settingTitle: 'Verification SMS Gateways Settings',
            senderName: 'weDevs Team',
            smsText: 'Your verification code is: %CODE%',
            smsSentSuccess: 'SMS sent. Please enter your verification code',
            smsSentError: 'Unable to send sms. Contact admin',
            activeGateway: 'nexmo', // nexmo, twilio
            vonage: {
                apiKey: VONAGE_API_KEY,
                apiSecret: VONAGE_API_SECRET,
            },

            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Email verification
        emailVerification: {
            settingTitle: 'Email Verification Settings',
            registrationNotice: 'Please check your email and complete email verification to login.',
            loginNotice: 'Please check your email and complete email verification to login.',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // live chat
        liveChat: {
            settingTitle: 'Live Chat Settings',
            chatProvider: 'talkjs', // messenger, talkjs, tawkto, whatsapp
            talkJsAppId: TALKJS_APP_ID,
            talkJsAppSecret: TALKJS_APP_SECRET,
            chatButtonPosition: 'above_tab', // above_tab, inside_tab, dont_show
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Rma Settings
        rma: {
            settingTitle: 'RMA Settings',
            orderStatus: 'wc-processing', // 'wc-pending', 'wc-processing', 'wc-on-hold', 'wc-completed', 'wc-cancelled', 'wc-refunded', 'wc-failed'
            rmaReasons: ['Defective', 'Wrong Product', 'Other'],
            refundPolicyHtmlBody: 'Refund Policy',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Wholesale
        wholesale: {
            settingTitle: 'Wholesale Settings',
            whoCanSeeWholesalePrice: 'all', // 'all', 'wholesale_customer'
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // EuCompliance
        euCompliance: {
            settingTitle: 'EU Compliance Settings',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // delivery time
        deliveryTime: {
            settingTitle: 'Delivery Time Settings',
            deliveryDateLabel: 'Delivery Date',
            deliveryBlockedBuffer: '0',
            deliveryBoxInfo: 'This store needs %DAY% day(s) to process your delivery request',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            choice: 'full-day',
            openingTime: '12:00 am',
            closingTime: '11:30 pm',
            timeSlot: '30',
            orderPerSlot: '0',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Product advertising
        productAdvertising: {
            settingTitle: 'Product Advertisement Settings',
            noOfAvailableSlot: '100',
            expireAfterDays: '10',
            advertisementCost: '15',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Geolocation Settings
        geolocation: {
            settingTitle: 'Geolocation Settings',
            locationMapPosition: 'top', // 'top', 'left', 'right'
            showMap: 'all', // 'all', 'store_listing', 'shop'
            radiusSearchUnit: 'km', // 'km', 'miles'
            radiusSearchMinimumDistance: '0',
            radiusSearchMaximumDistance: '10',
            mapZoomLevel: '11',
            defaultLocation: 'New York',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Product report abuse
        productReportAbuse: {
            settingTitle: 'Product Report Abuse Settings',
            reasonsForAbuseReport: 'This product is fake',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Spmv Settings
        spmv: {
            settingTitle: 'SPMV Settings',
            sellItemButtonText: 'Sell This Item',
            availableVendorDisplayAreaTitle: 'Other Available Vendor',
            availableVendorSectionDisplayPosition: 'below_tabs', // 'below_tabs', 'inside_tabs', 'after_tabs'
            showSpmvProducts: 'show_all', // 'show_all', 'min_price', 'max_price', 'top_rated_vendor'
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        printful: {
            settingTitle: 'Printful Settings',
            clientId: PRINTFUL_APP_ID,
            secretKey: PRINTFUL_APP_SECRET,
            popupTitle: 'Size Guide',
            popupTextColor: '#000000',
            popupBackgroundColor: '#FFFFFF',
            tabBackgroundColor: '#EEEEEE',
            activeTabBackgroundColor: '#DDDDDD',
            sizeGuideButtonText: 'Size Guide',
            buttonTextColor: '#1064A9',
            primaryMeasurementUnit: 'inches', // inches, centimetre
            optionNames: ['Size Guide Popup Text Color', 'Size Guide Popup Background Color', 'Size Guide Tab Background Color', 'Size Guide Active Tab Background Color', 'Size Guide Button Text Color'],
            optionValues: ['#000000', '#FFFFFF', '#EEEEEE', '#DDDDDD', '#1064A9'],
            saveSuccessMessage: 'Setting has been saved successfully.',
        },

        // Vendor Subscription Settings
        vendorSubscription: {
            settingTitle: 'Vendor Subscription Settings',
            displayPage: 'Sample Page', // '2', '4', '5', '6', '8', '9', '10', '11', '15', '-1'
            noOfDays: '2',
            productStatus: 'draft', // 'publish', 'pending', 'draft'
            cancellingEmailSubject: 'Subscription Package Cancel notification',
            cancellingEmailBody: 'Dear subscriber, Your subscription has expired. Please renew your package to continue using it.',
            alertEmailSubject: 'Subscription Ending Soon',
            alertEmailBody: 'Dear subscriber, Your subscription will be ending soon. Please renew your package in a timely',
            saveSuccessMessage: 'Setting has been saved successfully.',
        },
    },

    storeContactData: {
        name: CUSTOMER,
        email: `${CUSTOMER}@email.com`,
        message: 'Test Message',
    },

    // eu compliance data
    euComplianceData: () => ({
        companyName: faker.company.name(),
        companyId: faker.string.alphanumeric(5),
        vatNumber: faker.string.alphanumeric(10),
        bankName: faker.string.alphanumeric(7),
        bankIban: faker.finance.iban(),
    }),

    colorCode: {
        blue: 'rgb(0, 144, 255)',
        gray: 'rgb(215, 218, 221)',
    },

    // dokan license
    dokanLicense: {
        correctKey: LICENSE_KEY,
        incorrectKey: 'ABC-123-DEF-456-GHI-789',
    },

    // dokan shortcodes
    dokanShortcodes: {
        dashboard: '[dokan-dashboard]',
        dokanSubscriptionPacks: '[dps_product_pack]',
        vendorRegistration: '[dokan-vendor-registration]',
        bestSellingProduct: '[dokan-best-selling-product]',
        topRatedProduct: '[dokan-top-rated-product]',
        customerMigration: '[dokan-customer-migration]',
        geolocationFilter: '[dokan-geolocation-filter-form]',
        stores: '[dokan-stores]',
        myOrders: '[dokan-my-orders]',
        requestQuote: '[dokan-request-quote]',
    },

    pageTitle: `shortcode_${faker.string.nanoid(5)}`,

    deliveryTime: {
        date: helpers.currentDateFJY,
    },

    bookings: {
        startDate: new Date(),
        endDate: helpers.futureDate(new Date(), 1), // future date must be less than maximum duration
    },

    uniqueId: {
        uuid: faker.string.uuid(),
        nanoId: faker.string.nanoid(10),
        nanoIdRandom: () => faker.string.nanoid(10),
    },

    // predefined  test data
    predefined: {
        vendor2: {
            simpleProduct: {
                product1: {
                    name: 'p1_v2 (simple)',
                    productName: () => 'p1_v2 (simple)',
                },
            },
        },

        simpleProduct: {
            product1: {
                name: 'p1_v1 (simple)',
                productName: () => 'p1_v1 (simple)',
            },
            product2: 'p2_v1 (simple)',
            productFrac1: 'p1_F1_v1 (simple)',
            productFrac2: 'p2_F2_v1 (simple)',
        },

        variableProduct: {
            product1: 'p1_v1 (variable)',
        },

        simpleSubscription: {
            product1: 'sub1_v1 (simple subscription)',
        },

        variableSubscription: {
            product1: 'p1_v1 (variable subscription)',
        },

        externalProduct: {
            product1: 'p1_v1 (external/affiliate)',
        },

        auctionProduct: {
            product1: 'p1_v1 (auction)',
        },

        bookingProduct: {
            product1: 'p1_v1 (booking)',
        },

        saleProduct: {
            product1: 'p1_v1 (sale)',
        },

        vendorSubscription: {
            nonRecurring: 'Dokan_Subscription_Non_recurring',
        },

        coupon: {
            couponCode: 'c1_v1',
        },

        spmv: {
            productName: () => `spmv_${faker.string.nanoid(10)}`,
            product1: 'spmv_a1',
        },

        vendorInfo: {
            firstName: () => 'vendor1',
            lastName: () => 'v1',
            username: 'vendor1',
            shopName: `${VENDOR}store`,
        },

        vendorStores: {
            followFromStoreListing: 'storeListing',
            followFromSingleStore: 'singleStore',
            vendor1: `${VENDOR}store`,
            vendor2: `${VENDOR2}store`,
            vendor1FullName: `${VENDOR} v1`,
            shopUrl: `${VENDOR}store`,
        },

        customerInfo: {
            firstName: () => 'customer1',
            lastName: () => 'c1',
            username: () => 'customer1',
            username1: 'customer1',
        },

        categories: {
            uncategorized: 'Uncategorized',
            clothings: 'clothings',
        },
    },

    status: {
        on: 'on',
        off: 'off',
    },

    // image
    image: {
        avatar: 'utils/sampleData/avatar.png',
        dokan: 'utils/sampleData/dokan.png',
        license: 'utils/sampleData/license.png',
    },

    // install wordpress
    installWp: {
        // db info
        dbInfo: {
            dbHost: DB_HOST_NAME,
            dbName: DATABASE,
            dbUserName: DB_USER_NAME,
            dbPassword: DB_USER_PASSWORD,
            dbTablePrefix: `${DB_PREFIX}_`,
            update: {
                DB_HOST_NAME: DB_HOST_NAME,
                DATABASE: DATABASE,
                DB_USER_NAME: DB_USER_NAME,
                DB_USER_PASSWORD: DB_USER_PASSWORD,
                DB_PREFIX: `${DB_PREFIX}_`,
            },
        },

        // debugInfo
        debugInfo: {
            WP_DEBUG: true,
            SCRIPT_DEBUG: true,
            WP_DEBUG_LOG: true,
            WP_DEBUG_DISPLAY: true,
        },

        // site info
        siteInfo: {
            language: SITE_LANGUAGE ?? 'en_US',
            url: BASE_URL ?? 'http://localhost:9999',
            title: SITE_TITLE ?? 'Test Playground',
            admin: ADMIN ?? 'admin',
            password: ADMIN_PASSWORD ?? 'admin',
            email: ADMIN_EMAIL ?? 'shashwata@wedevs.com',
        },

        // theme
        themes: {
            storefront: 'storefront',
        },

        // plugins
        plugins: {
            basicAuth: 'Basic-Auth',
            woocommerce: 'woocommerce',
            dokan: 'dokan',
            dokanLite: 'dokan-lite',
            dokanPro: 'dokan-pro',
            woocommerceBookings: 'woocommerce-bookings',
            woocommerceSubscriptions: 'woocommerce-subscriptions',
            woocommerceProductAddons: 'woocommerce-product-addons',
            woocommerceSimpleAuctions: 'woocommerce-simple-auctions',
        },
    },

    // command
    commands: {
        wpcli: {
            resetSite: `wp db reset --yes`,
            downloadWp: `wp core download --locale=en_US --force`,
            createConfig: (db: any) => `wp config create --dbhost="${db.dbHost}" --dbname="${db.dbName}" --dbuser="${db.dbUserName}" --dbpass="${db.dbPassword}"  --dbprefix="${db.dbTablePrefix}" --force`,
            dropDb: `wp db drop --yes`,
            createDb: `wp db create`,
            cleanDb: `wp db clean --yes`,
            setConfig: (key: string, value: string) => `wp config set ${key} ${value} --add`,
            setDebugConfig: (key: string, value: boolean) => `wp config set ${key} ${value} --add --raw`,
            installWp: (core: any) => `wp core install --locale="${core.language}" --url="${core.url}" --title="${core.title}" --admin_user="${core.admin}" --admin_password="${core.password}" --admin_email="${core.email}"`,
            installTheme: (theme: string) => `wp theme install ${theme} --activate`,
            installPlugin: (plugin: string) => `wp plugin install ${plugin} --activate --force`,
            activatePlugin: (plugin: string) => `wp plugin activate ${plugin}`,
            activateTheme: (theme: string) => `wp theme activate ${theme}`,
            rewritePermalink: `wp rewrite structure /%postname%/`,
        },
        makePath: (path: string) => `mkdir -p ${path}`,
        deleteFolder: (path: string) => `rm -rf ${path}`,
        removeLiteRequired: `cd ${SITE_PATH}/wp-content/plugins/dokan-pro && sed -i '''' '''s/Requires Plugins: woocommerce, dokan-lite/Requires Plugins: woocommerce, dokan/''' dokan-pro.php`,
        cloneBasicAuth: (path: string) => `cd ${path} && git clone https://github.com/WP-API/Basic-Auth.git`,
        cloneDokanLite: (path: string) => `cd ${path} && git clone -b develop https://github.com/getdokan/dokan.git`,
        cloneDokanPro: (path: string) => `cd ${path} && git clone -b test_utils https://github.com/getdokan/dokan-pro.git`,
        checkoutToDevelop: (path: string) => `cd ${path} && git checkout develop`,
        buildPlugin: (path: string) => `cd ${path} && composer i --no-dev && composer du -o && npm i && npm run build`,
    },

    cssStyle: {
        inlineBlock: 'display: inline-block;',
        visibleStyle: 'visibility:visible;',
        // style="visibility:visible;"
        // style="display: block;"
        // style="pointer-events: none;"
    },
};

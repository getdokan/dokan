import { z } from 'zod';

const linksSchema = z.object({
    self: z.array(z.object({ href: z.string().url() })).optional(),
    collection: z.array(z.object({ href: z.string().url() })).optional(),
    up: z.array(z.object({ href: z.string().url() })).optional(),
});

const productReviewSchema = z.object({
    id: z.string().or(z.number()),
    date_created: z.string().optional(), // Assuming date_created is always a string in ISO format
    review: z.string().optional(),
    rating: z.string().or(z.number()),
    name: z.string().optional(),
    email: z.string().optional(), // Assuming email follows a standard email format
    verified: z.boolean().optional(),
});

const productImageSchema = z.object({
    id: z.string().or(z.number()),
    date_created: z.string(),
    date_created_gmt: z.string(),
    date_modified: z.string(),
    date_modified_gmt: z.string(),
    src: z.string(),
    name: z.string(),
    alt: z.string(),
    position: z.number(),
});

const productDimensionsSchema = z.object({
    length: z.string(),
    width: z.string(),
    height: z.string(),
});

const productCategorySchema = z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    slug: z.string(),
});

const productAttributeSchema = z.object({
    id: z.string().or(z.number()),
    slug: z.string(),
    name: z.string(),
    option: z.string().optional(),
});

const productMetaDataSchema = z.object({
    id: z.string().or(z.number()).optional(),
    key: z.string().optional(),
    value: z.any().optional(),
});

const productSchema = z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    slug: z.string(),
    permalink: z.string().url(),
    date_created: z.coerce.date(),
    date_created_gmt: z.coerce.date(),
    date_modified: z.coerce.date(),
    date_modified_gmt: z.coerce.date(),
    type: z.string(),
    status: z.string(),
    featured: z.boolean(),
    catalog_visibility: z.string(),
    description: z.string(),
    short_description: z.string(),
    sku: z.string().optional(),
    price: z.string(),
    regular_price: z.string(),
    sale_price: z.string().optional(),
    date_on_sale_from: z.null(),
    date_on_sale_from_gmt: z.null(),
    date_on_sale_to: z.null(),
    date_on_sale_to_gmt: z.null(),
    on_sale: z.boolean(),
    purchasable: z.boolean(),
    total_sales: z.string().or(z.number()),
    virtual: z.boolean(),
    downloadable: z.boolean(),
    downloads: z.array(z.unknown()),
    download_limit: z.number(),
    download_expiry: z.number(),
    external_url: z.string().optional(),
    button_text: z.string().optional(),
    tax_status: z.string(),
    tax_class: z.string().optional(),
    manage_stock: z.boolean(),
    stock_quantity: z.number().nullable(),
    backorders: z.string(),
    backorders_allowed: z.boolean(),
    backordered: z.boolean(),
    low_stock_amount: z.string().optional(),
    sold_individually: z.boolean(),
    weight: z.string().optional(),
    dimensions: productDimensionsSchema,
    shipping_required: z.boolean(),
    shipping_taxable: z.boolean(),
    shipping_class: z.string().optional(),
    shipping_class_id: z.string().or(z.number()),
    reviews_allowed: z.boolean(),
    average_rating: z.string().regex(/^\d+(\.\d+)?$/),
    rating_count: z.number(),
    upsell_ids: z.array(z.unknown()),
    cross_sell_ids: z.array(z.unknown()),
    parent_id: z.string().or(z.number()).optional(),
    purchase_note: z.string().optional(),
    categories: z.array(productCategorySchema),
    tags: z.array(z.unknown()),
    images: z.array(productImageSchema),
    attributes: z.array(productAttributeSchema),
    default_attributes: z.array(z.unknown()),
    variations: z.array(z.unknown()),
    grouped_products: z.array(z.unknown()),
    menu_order: z.number(),
    price_html: z.string(),
    related_ids: z.array(z.number()),
    meta_data: z.array(productMetaDataSchema).optional(),
    stock_status: z.string().optional(),
    has_options: z.boolean().optional(),
    post_password: z.string().optional(),
    tax_amount: z.string().optional(),
    regular_display_price: z.string().optional(),
    sales_display_price: z.string().optional(),
    barcode: z.string().optional(),
    _links: linksSchema,
});

const productVariationSchema = z.object({
    id: z.string().or(z.number()),
    date_created: z.string(),
    date_created_gmt: z.string(),
    date_modified: z.string(),
    date_modified_gmt: z.string(),
    description: z.string(),
    permalink: z.string(),
    sku: z.string(),
    price: z.string(),
    regular_price: z.string(),
    sale_price: z.string(),
    date_on_sale_from: z.null(),
    date_on_sale_from_gmt: z.null(),
    date_on_sale_to: z.null(),
    date_on_sale_to_gmt: z.null(),
    on_sale: z.boolean(),
    visible: z.boolean(),
    purchasable: z.boolean(),
    virtual: z.boolean(),
    downloadable: z.boolean(),
    downloads: z.array(z.unknown()), // Assuming downloads is an array of unknown objects
    download_limit: z.number(),
    download_expiry: z.number(),
    tax_status: z.string(),
    tax_class: z.string(),
    manage_stock: z.boolean(),
    stock_quantity: z.null(),
    in_stock: z.boolean(),
    backorders: z.string(),
    backorders_allowed: z.boolean(),
    backordered: z.boolean(),
    weight: z.string(),
    dimensions: productDimensionsSchema,
    shipping_class: z.string(),
    shipping_class_id: z.string().or(z.number()),
    image: productImageSchema,
    attributes: z.array(
        z.object({
            id: z.string().or(z.number()),
            slug: z.string(),
            name: z.string(),
            option: z.string(),
        }),
    ),
    menu_order: z.number(),
    meta_data: z.array(productMetaDataSchema),
    _links: linksSchema,
});

// store settings

const addressSchema = z
    .object({
        street_1: z.string().optional(),
        street_2: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
        country: z.string().optional(),
        state: z.string().optional(),
    })
    .or(z.array(z.any()));

const socialSchema = z
    .object({
        fb: z.string().url().or(z.string().optional()),
        youtube: z.string().url().or(z.string().optional()),
        twitter: z.string().url().or(z.string().optional()),
        linkedin: z.string().url().or(z.string().optional()),
        pinterest: z.string().url().or(z.string().optional()),
        instagram: z.string().url().or(z.string().optional()),
        flickr: z.string().url().or(z.string().optional()),
    })
    .or(z.array(z.any()));

const paypalSchema = z
    .object({
        email: z.string().email().or(z.string().optional()),
    })
    .or(z.array(z.any()));

const bankSchema = z
    .object({
        ac_name: z.string(),
        ac_type: z.string(),
        ac_number: z.string(),
        bank_name: z.string(),
        bank_addr: z.string(),
        routing_number: z.string(),
        iban: z.string(),
        swift: z.string(),
    })
    .or(z.array(z.any()));

const skrillSchema = z
    .object({
        email: z.string(),
    })
    .or(z.array(z.any()));

const dokan_custom = z
    .object({
        withdraw_method_name: z.string().optional(),
        withdraw_method_type: z.string().optional(),
        value: z.string().optional(),
    })
    .or(z.array(z.any()));

const paymentSchema = z
    .object({
        paypal: paypalSchema.optional(),
        bank: bankSchema.optional(),
        skrill: skrillSchema.optional(),
        dokan_custom: dokan_custom.optional(),
        stripe: z.any().optional(),
        stripe_express: z.boolean().optional(),
        dokan_razorpay: z.boolean().optional(),
        dokan_moip_connect: z.boolean().optional(),
    })
    .or(z.array(z.any()));

const storeOpenClose = z.object({
    enabled: z.boolean().or(z.string()),
    time: z
        .object({
            enabled: z.boolean().or(z.string()).optional(),
            time: z.any().optional(),
            status: z.string().optional(),
            opening_time: z.array(z.string()).optional(),
            closing_time: z.array(z.string()).optional(),
        })
        .or(z.any()).optional(),
    open_notice: z.string(),
    close_notice: z.string(),
});

const timeSchema = z.object({
    status: z.string().optional(),
    opening_time: z.array(z.string()).optional(),
    closing_time: z.array(z.string()).optional(),
});

const storeTimeSchema = z.object({
    monday: timeSchema,
    tuesday: timeSchema,
    wednesday: timeSchema,
    thursday: timeSchema,
    friday: timeSchema,
    saturday: timeSchema,
    sunday: timeSchema,
});

const catalogModeSchema = z.object({
    hide_add_to_cart_button: z.string(),
    hide_product_price: z.string(),
    request_a_quote_enabled: z.string(),
});

const orderMinMaxSchema = z.object({
    enable_vendor_min_max_quantity: z.string(),
    min_quantity_to_order: z.string(),
    max_quantity_to_order: z.string(),
    vendor_min_max_products: z.array(z.any()), // Adjust this based on the actual structure
    vendor_min_max_product_cat: z.array(z.any()).or(z.string()), // Adjust this based on the actual structure
    enable_vendor_min_max_amount: z.string(),
    min_amount_to_order: z.string(),
    max_amount_to_order: z.string(),
});

const categorySchema = z.object({
    term_id: z.string().or(z.number()).optional(),
    name: z.string(),
    slug: z.string(),
    term_group: z.number(),
    term_taxonomy_id: z.string().or(z.number()).optional(),
    taxonomy: z.string(),
    description: z.string(),
    parent: z.number(),
    count: z.number(),
    filter: z.string(),
});

const vendorStoreLocationPickupSchema = z.object({
    multiple_store_location: z.string(),
});

const bankPaymentRequiredFieldsSchema = z.object({
    ac_name: z.string(),
    ac_type: z.string(),
    ac_number: z.string(),
    routing_number: z.string(),
});

const activePaymentMethodsSchema = z.object({
    paypal: z.string(),
    bank: z.string(),
});

const profileCompletionSchema = z.object({
    closed_by_user: z.boolean(),
    phone: z.number().optional(),
    store_name: z.number().optional(),
    address: z.number().optional(),
    location: z.number().optional(),
    Bank: z.number().optional(),
    paypal: z.number().optional(),
    skrill: z.number().optional(),
    fb: z.number().optional(),
    youtube: z.number().optional(),
    twitter: z.number().optional(),
    linkedin: z.number().optional(),
    next_todo: z.string(),
    progress: z.number(),
    progress_vals: z.object({
        banner_val: z.number(),
        profile_picture_val: z.number(),
        store_name_val: z.number(),
        address_val: z.number(),
        phone_val: z.number(),
        map_val: z.number(),
        payment_method_val: z.number(),
        social_val: z.object({
            fb: z.number(),
            twitter: z.number(),
            youtube: z.number(),
            linkedin: z.number(),
        }),
    }),
});

const ratingSchema = z.object({
    rating: z.string(),
    count: z.number(),
});

const storyCategorySchema = z.object({
    id: z.string().or(z.number()).optional(),
    count: z.number(),
    description: z.string(),
    link: z.string().url(),
    name: z.string(),
    slug: z.string(),
    taxonomy: z.string(),
    meta: z.array(z.any()), // Adjust this based on the actual structure
    _links: linksSchema,
});

const storeSeo = z
    .object({
        'dokan-seo-meta-title': z.string().optional(),
        'dokan-seo-meta-desc': z.string().optional(),
        'dokan-seo-meta-keywords': z.string().optional(),
        'dokan-seo-og-title': z.string().optional(),
        'dokan-seo-og-desc': z.string().optional(),
        'dokan-seo-og-image': z.string().optional(),
        'dokan-seo-twitter-title': z.string().optional(),
        'dokan-seo-twitter-desc': z.string().optional(),
        'dokan-seo-twitter-image': z.string().optional(),
    })
    .or(z.array(z.unknown()));

const storeSchema = z.object({
    id: z.string().or(z.number()).optional(),
    store_name: z.string(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().optional(),
    social: socialSchema,
    phone: z.string(),
    show_email: z.boolean().or(z.string()),
    address: addressSchema,
    location: z.string().optional(),
    banner: z.string().or(z.number()).optional(),
    banner_id: z.string().or(z.number()).optional(),
    gravatar: z.string().or(z.number()).optional(),
    gravatar_id: z.string().or(z.number()).optional(),
    shop_url: z.string().url().optional(),
    toc_enabled: z.boolean().optional(),
    store_toc: z.string().optional(),
    featured: z.boolean().optional(),
    rating: ratingSchema.optional(),
    enabled: z.boolean().optional(),
    registered: z.string().optional(),
    payment: paymentSchema.optional(),
    trusted: z.boolean().optional(),
    store_open_close: storeOpenClose.optional(),
    enable_tnc: z.string().optional(),
    store_tnc: z.string().optional(),
    show_min_order_discount: z.string().optional(),
    store_seo: storeSeo.optional(),
    dokan_store_time_enabled: z.string().optional(),
    dokan_store_open_notice: z.string().optional(),
    dokan_store_close_notice: z.string().optional(),
    find_address: z.string().optional(),
    dokan_category: z.string().optional(),
    sale_only_here: z.boolean().optional(),
    company_name: z.string().optional(),
    vat_number: z.string().optional(),
    company_id_number: z.string().optional(),
    bank_name: z.string().optional(),
    bank_iban: z.string().optional(),
    categories: z
        .array(
            z.object({
                id: z.string().or(z.number()).optional(),
                name: z.string(),
                slug: z.string(),
            }),
        )
        .optional(),
    admin_category_commission: z.any().optional(),
    admin_commission: z.string().optional(),
    admin_additional_fee: z.string().optional(),
    admin_commission_type: z.string().optional(),
    _links: linksSchema.optional(),
});

const metaDataSchema = z.object({
    id: z.string().or(z.number()),
    key: z.string(),
    value: z.unknown(),
});

const taxSchema = z.object({
    id: z.string().or(z.number()),
    total: z.string(),
    subtotal: z.string(),
});

const lineItemSchema = z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    product_id: z.string().or(z.number()),
    variation_id: z.string().or(z.number()),
    quantity: z.number(),
    tax_class: z.string(),
    subtotal: z.string(),
    subtotal_tax: z.string(),
    total: z.string(),
    total_tax: z.string(),
    taxes: z.array(taxSchema),
    meta_data: z.array(z.any()), // Assuming meta_data can have various structures
    sku: z.string().nullable().optional(),
    price: z.number(),
    image: z
        .object({
            id: z.string().or(z.number()).optional(),
            src: z.string().optional(),
        })
        .or(z.string())
        .optional(),
    parent_name: z.string().optional(),
});

const taxLineSchema = z.object({
    id: z.string().or(z.number()),
    rate_code: z.string(),
    rate_id: z.string().or(z.number()),
    label: z.string(),
    compound: z.boolean(),
    tax_total: z.string(),
    shipping_tax_total: z.string(),
    rate_percent: z.number(),
    meta_data: z.array(z.any()), // Assuming meta_data can have various structures
});

const shippingLineSchema = z.object({
    id: z.string().or(z.number()),
    method_title: z.string(),
    method_id: z.string().or(z.number()).optional(),
    instance_id: z.string().or(z.number()).optional(),
    total: z.string(),
    total_tax: z.string(),
    taxes: z.array(taxSchema),
    meta_data: z.array(z.any()), // Assuming meta_data can have various structures
});

const userAddressSchema = z.object({
    first_name: z.string(),
    last_name: z.string(),
    company: z.string().optional(),
    address_1: z.string(),
    address_2: z.string(),
    city: z.string(),
    state: z.string(),
    postcode: z.string(),
    country: z.string(),
    email: z.string().optional(),
    phone: z.string().optional(),
});

const orderSchema = z.object({
    id: z.string().or(z.number()),
    parent_id: z.string().or(z.number()),
    status: z.string(),
    currency: z.string(),
    version: z.string(),
    prices_include_tax: z.boolean(),
    date_created: z.string(),
    date_modified: z.string(),
    discount_total: z.string(),
    discount_tax: z.string(),
    shipping_total: z.string(),
    shipping_tax: z.string(),
    cart_tax: z.string(),
    total: z.string(),
    total_tax: z.string(),
    customer_id: z.string().or(z.number()),
    order_key: z.string(),
    billing: userAddressSchema.optional(),
    shipping: userAddressSchema.optional(),
    payment_method: z.string(),
    payment_method_title: z.string(),
    transaction_id: z.string().or(z.number()).optional(),
    customer_ip_address: z.string().optional(),
    customer_user_agent: z.string().optional(),
    created_via: z.string(),
    customer_note: z.string().optional(),
    date_completed: z.string().nullable().optional(),
    date_paid: z.string().nullable().optional(),
    cart_hash: z.string().optional(),
    number: z.string(),
    meta_data: z.array(metaDataSchema).optional(),
    line_items: z.array(lineItemSchema),
    tax_lines: z.array(taxLineSchema),
    shipping_lines: z.array(shippingLineSchema),
    fee_lines: z.array(z.any()), // Assuming fee_lines can have various structures
    coupon_lines: z.array(z.any()), // Assuming coupon_lines can have various structures
    refunds: z.array(z.any()), // Assuming refunds can have various structures
    payment_url: z.string().optional(),
    is_editable: z.boolean().optional(),
    needs_payment: z.boolean().optional(),
    needs_processing: z.boolean().optional(),
    date_created_gmt: z.string(),
    date_modified_gmt: z.string(),
    date_completed_gmt: z.string().nullable().optional(),
    date_paid_gmt: z.string().nullable().optional(),
    currency_symbol: z.string().optional(),
    _links: linksSchema,
});

const ordersSummarySchema = z.object({
    'wc-pending': z.number(),
    'wc-completed': z.number(),
    'wc-on-hold': z.number(),
    'wc-processing': z.number(),
    'wc-refunded': z.number(),
    'wc-cancelled': z.number(),
    'wc-failed': z.number(),
    'wc-checkout-draft': z.number(),
    total: z.number(),
});

const orderDownloadSchema = z.object({
    permission_id: z.string().or(z.number()),
    download_id: z.string().or(z.number()),
    product_id: z.string().or(z.number()),
    order_id: z.string().or(z.number()),
    order_key: z.string(),
    user_email: z.string().email(),
    user_id: z.string().or(z.number()),
    downloads_remaining: z.string(), // Assuming it's an empty string when not specified
    access_granted: z.string(), // Assuming this is always a string in a specific format
    access_expires: z.any(),
    download_count: z.string().or(z.number()),
});

const orderNoteSchema = z.object({
    id: z.string().or(z.number()),
    date_created: z.string(),
    date_created_gmt: z.string(),
    note: z.string(),
    customer_note: z.boolean(),
});

const customerSchema = z.object({
    id: z.string().or(z.number()),
    date_created: z.string(),
    date_created_gmt: z.string(),
    date_modified: z.string(),
    date_modified_gmt: z.string(),
    email: z.string().email(),
    first_name: z.string(),
    last_name: z.string(),
    role: z.string(),
    username: z.string(),
    billing: userAddressSchema.optional(),
    shipping: userAddressSchema.optional(),
    is_paying_customer: z.boolean(),
    avatar_url: z.string().url(),
    meta_data: z.array(metaDataSchema).optional(),
    orders_count: z.number(),
    total_spent: z.string(),
    _links: linksSchema,
});

const couponSchema = z.object({
    id: z.string().or(z.number()),
    code: z.string(),
    amount: z.string(),
    date_created: z.coerce.date(),
    date_created_gmt: z.coerce.date(),
    date_modified: z.coerce.date(),
    date_modified_gmt: z.coerce.date(),
    discount_type: z.string(),
    description: z.string(),
    date_expires: z.nullable(z.string()),
    date_expires_gmt: z.nullable(z.string()),
    usage_count: z.number(),
    individual_use: z.boolean(),
    product_ids: z.array(z.number()),
    excluded_product_ids: z.array(z.string()),
    usage_limit: z.nullable(z.number()),
    usage_limit_per_user: z.nullable(z.number()),
    limit_usage_to_x_items: z.nullable(z.number()),
    free_shipping: z.boolean(),
    product_categories: z.array(z.string()),
    excluded_product_categories: z.array(z.string()),
    exclude_sale_items: z.boolean(),
    minimum_amount: z.string(),
    maximum_amount: z.string(),
    email_restrictions: z.array(z.string()),
    used_by: z.array(z.string()),
    meta_data: z.array(metaDataSchema).optional(),
    _links: linksSchema,
});

const dateEntrySchema = z.object({
    year: z.string(),
    month: z.string(),
    title: z.string(),
});

const refundSchema = z.object({
    id: z.string().or(z.number()),
    order_id: z.string().or(z.number()),
    vendor: z.object({
        id: z.string().or(z.number()),
        store_name: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        social: socialSchema,
        phone: z.string(),
        show_email: z.boolean(),
        address: addressSchema,
        location: z.string(),
        banner: z.string(),
        banner_id: z.string().or(z.number()),
        gravatar: z.string().url(),
        gravatar_id: z.string().or(z.number()),
        shop_url: z.string().url(),
        toc_enabled: z.boolean(),
        store_toc: z.string(),
        featured: z.boolean(),
        rating: ratingSchema,
        enabled: z.boolean(),
        registered: z.string(),
        payment: paymentSchema,
        trusted: z.boolean(),
        store_open_close: storeOpenClose,
        sale_only_here: z.boolean(),
        current_subscription: z
            .object({
                name: z.number(),
                label: z.string(),
            })
            .optional(),
        assigned_subscription: z.number().optional(),
        assigned_subscription_info: z
            .object({
                subscription_id: z.string().or(z.number()),
                has_subscription: z.boolean(),
                expiry_date: z.string(),
                published_products: z.number(),
                remaining_products: z.number(),
                recurring: z.boolean(),
                start_date: z.string(),
            })
            .optional(),
        company_name: z.string(),
        vat_number: z.string(),
        company_id_number: z.string(),
        bank_name: z.string(),
        bank_iban: z.string(),
        categories: z.array(categorySchema).optional(),
    }),
    amount: z.string(),
    reason: z.string(),
    item_qtys: z.record(z.number()),
    item_totals: z.record(z.string()),
    tax_totals: z.record(z.record(z.number())),
    restock_items: z.number(),
    created: z.string(),
    status: z.string(),
    method: z.string(),
    type: z.string(),
    api: z.boolean(),
    _links: linksSchema,
});

const transactionTypeSchema = z.object({
    id: z.string().or(z.number()).optional(),
    title: z.string(),
});

const roleSchema = z.object({
    name: z.string(),
    capabilities: z.record(z.boolean()),
});

const withdrawSchema = z.object({
    id: z.string().or(z.number()),
    user: z.object({
        id: z.string().or(z.number()),
        store_name: z.string(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string(),
        social: socialSchema.optional(),
        phone: z.string(),
        show_email: z.boolean(),
        address: addressSchema.optional(),
        location: z.string(),
        banner: z.string(),
        banner_id: z.string().or(z.number()),
        gravatar: z.string(),
        gravatar_id: z.string().or(z.number()),
        shop_url: z.string(),
        toc_enabled: z.boolean(),
        store_toc: z.string(),
        featured: z.boolean(),
        rating: ratingSchema.optional(),
        enabled: z.boolean(),
        registered: z.string(),
        payment: paymentSchema.optional(),
        trusted: z.boolean(),
        store_open_close: storeOpenClose,
        sale_only_here: z.boolean().optional(),
        company_name: z.string().optional(),
        vat_number: z.string().optional(),
        company_id_number: z.string().optional(),
        bank_name: z.string().optional(),
        bank_iban: z.string().optional(),
        categories: z.array(categorySchema).optional(),
    }),
    amount: z.number(),
    created: z.string(),
    status: z.string(),
    method: z.string(),
    method_title: z.string(),
    note: z.string(),
    details: z.union([
        z.object({
            paypal: z.object({
                email: z.string(),
            }),
        }),
        z.object({
            bank: z.object({
                ac_name: z.string(),
                ac_type: z.string(),
                ac_number: z.string(),
                bank_name: z.string(),
                bank_addr: z.string(),
                routing_number: z.string(),
                iban: z.string(),
                swift: z.string(),
            }),
        }),
        z.object({
            skrill: z.object({
                email: z.string(),
            }),
        }),
    ]),
    ip: z.string(),
    _links: linksSchema,
});

const paymentMethodSchema = z.object({
    id: z.string().or(z.number()).optional(),
    title: z.string(),
});

const chargeDataSchema = z.object({
    fixed: z.string().or(z.number()),
    percentage: z.string().or(z.number()),
});

const settingV2Schema = z.object({
    id: z.string().or(z.number()).optional(),
    label: z.string(),
    description: z.string(),
    parent_id: z.string().or(z.number()).optional(),
    sub_groups: z.array(z.any()), // Adjust the type of sub_groups if you know the specific structure
    _links: z.object({
        options: z.object({ href: z.string().url() }),
        collection: z.object({ href: z.string().url() }),
        self: z.object({ href: z.string().url() }),
    }),
});
const linkSchema = z.object({
    href: z.string().url(),
});

const settingV2LinksSchema = z.object({
    self: linkSchema,
    collection: linkSchema,
    options: linkSchema.optional(), // options is optional because not all objects have it
});

const infoSchema = z.object({
    text: z.string(),
    url: z.string(),
    icon: z.string(),
});

const settingV2GroupSchema = z.object({
    id: z.string().or(z.number()).optional(),
    title: z.string(),
    desc: z.string(),
    icon: z.string(),
    info: z.array(infoSchema).optional(),
    type: z.string(),
    parent_id: z.string().or(z.number()).optional(),
    tab: z.string().optional(),
    card: z.string().optional(),
    editable: z.boolean().optional(),
    fields: z.array(z.any()).optional(),
    placeholder: z.string().optional(),
    required: z.boolean().optional(),
    multiple: z.boolean().optional(),
    value: z.any(),
    url: z.boolean().optional(),
    options: z.any(),
    _links: settingV2LinksSchema.optional(),
});

const attributeSchema = z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    slug: z.string(),
    type: z.enum(['select']),
    order_by: z.enum(['menu_order', 'name', 'name_num', 'id']),
    has_archives: z.boolean(),
    _links: linksSchema,
});

const attributeTermSchema = z.object({
    id: z.string().or(z.number()),
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    menu_order: z.number(),
    count: z.number(),
    _links: linksSchema,
});

const abuseReportSchema = z.object({
    id: z.string().or(z.number()),
    reason: z.string(),
    product: z.object({
        id: z.string().or(z.number()),
        title: z.string(),
        admin_url: z.string().url(),
    }),
    vendor: z.object({
        id: z.string().or(z.number()),
        name: z.string(),
        admin_url: z.string().url(),
    }),
    reported_by: z
        .object({
            id: z.string().or(z.number()),
            name: z.string(),
            email: z.string().email(),
            admin_url: z.string().url(),
        })
        .optional(),
    description: z.string(),
    reported_at: z.coerce.date(),
});

const announcementSchema = z.object({
    id: z.string().or(z.number()),
    notice_id: z.string().or(z.number()),
    vendor_id: z.string().or(z.number()),
    title: z.string(),
    content: z.string(),
    status: z.enum(['all', 'publish', 'pending', 'draft', 'future', 'trash']),
    read_status: z.enum(['read', 'unread', '']),
    date: z.string(),
    date_gmt: z.string(),
    human_readable_date: z.string(),
    announcement_sellers: z
        .array(
            z.object({
                id: z.string().or(z.number()),
                name: z.string(),
                shop_name: z.string(),
                email: z.string().nullable(),
            }),
        )
        .optional(),
    announcement_type: z.string().optional(),
    _links: linksSchema,
});

const advertisedProductSchema = z.object({
    id: z.string().or(z.number()),
    product_id: z.string().or(z.number()),
    product_title: z.string(),
    vendor_id: z.string().or(z.number()),
    store_name: z.string(),
    created_via: z.string(),
    order_id: z.string().or(z.number()),
    price: z.string(),
    expires_at: z.string(),
    status: z.string().or(z.number()),
    post_status: z.string(),
    added: z.string(),
    _links: linksSchema,
});

const quoteRuleSchema = z.object({
    id: z.string().or(z.number()).optional(),
    rule_name: z.string(),
    selected_user_role: z.any(),
    category_ids: z.any(),
    product_categories: z.any(),
    product_ids: z.any(),
    hide_price: z.string(),
    hide_cart_button: z.string(),
    button_text: z.string(),
    apply_on_all_product: z.string(),
    rule_priority: z.string(),
    status: z.string(),
    created_at: z.string(),
    _links: linksSchema,
});

const quoteRequestSchema = z.object({
    id: z.string().or(z.number()).optional(),
    title: z.string(),
    customer_name: z.string(),
    customer_email: z.string(),
    status: z.string(),
    created_at: z.string(),
    _links: linksSchema,
});

const verificationTypeSchema = z.object({
    id: z.string().or(z.number()).optional(),
    title: z.string(),
    disabled: z.boolean(),
});

const badgeEventSchema = z.object({
    id: z.string().or(z.number()).optional(),
    title: z.string(),
    description: z.string(),
    condition_text: z.object({
        prefix: z.string(),
        suffix: z.string(),
        type: z.string(),
    }),
    hover_text: z.string(),
    group: z.object({
        key: z.string(),
        title: z.string(),
        type: z.string().optional(),
    }),
    has_multiple_levels: z.boolean(),
    badge_logo: z.string().url(),
    badge_logo_raw: z.string(),
    input_group_icon: z.object({
        condition: z.string(),
        data: z.string(),
    }),
    status: z.string(),
    created: z.boolean(),
});

const badgeSchema = z.object({
    id: z.string().or(z.number()),
    badge_name: z.string(),
    badge_logo: z.string().url(),
    badge_logo_raw: z.string(),
    default_logo: z.string(),
    formatted_default_logo: z.string().url(),
    event_type: z.string(),
    formatted_hover_text: z.string(),
    event: badgeEventSchema,
    badge_status: z.string(),
    formatted_badge_status: z.string(),
    level_count: z.number(),
    vendor_count: z.number(),
    acquired_level_count: z.number(),
    created_by: z.number(),
    created_at: z.string(),
    levels: z.array(z.any()), // Adjust this based on the actual structure of levels
    _links: z.object({
        self: z.array(
            z.object({
                href: z.string().url(),
            }),
        ),
        collection: z.array(
            z.object({
                href: z.string().url(),
            }),
        ),
    }),
});

const badgeCreateUpdateSchema = z.object({
    id: z.string().or(z.number()),
    action: z.enum(['insert', 'update']),
});

const productQuestionAnswerSchema = z.object({
    id: z.string().or(z.number()),
    question_id: z.string().or(z.number()),
    answer: z.string(),
    user_id: z.string().or(z.number()),
    created_at: z.string(),
    updated_at: z.string(),
    human_readable_created_at: z.string(),
    human_readable_updated_at: z.string(),
    user_display_name: z.string(),
    _links: linksSchema,
});

const productQuestionSchema = z.object({
    id: z.string().or(z.number()),
    product_id: z.string().or(z.number()),
    question: z.string(),
    user_id: z.string().or(z.number()),
    read: z.number(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    answer: productQuestionAnswerSchema.omit({ _links: true }).optional(),
    user_display_name: z.string(),
    human_readable_created_at: z.string(),
    human_readable_updated_at: z.string(),
    display_human_readable_created_at: z.boolean(),
    display_human_readable_updated_at: z.boolean(),
    product: z.object({
        id: z.string().or(z.number()),
        title: z.string(),
        image: z.string(),
    }),
    vendor: z.object({
        id: z.string().or(z.number()),
        name: z.string(),
        avatar: z.string(),
    }),
    _links: linksSchema,
});

const storeReviewSchemaStoreEndpoint = z.object({
    id: z.string().or(z.number()),
    author: z.object({
        id: z.string().or(z.number()),
        name: z.string(),
        email: z.string().email(),
        url: z.string().optional(),
        avatar: z.string().url(),
    }),
    title: z.string(),
    content: z.string(),
    permalink: z.string().nullable().optional(),
    product_id: z.number().nullable().optional(),
    approved: z.boolean(),
    date: z.string(), // You might want to use z.date() if you want to enforce a date format
    rating: z.number(),
});

const storeReviewSchema = z.object({
    id: z.string().or(z.number()),
    title: z.string(),
    content: z.string(),
    status: z.string(),
    created_at: z.coerce.date(),
    customer: z.object({
        id: z.string().or(z.number()),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email(),
        display_name: z.string(),
    }),
    vendor: z.object({
        id: z.string().or(z.number()),
        first_name: z.string(),
        last_name: z.string(),
        shop_name: z.string(),
        shop_url: z.string().url(),
        avatar: z.string().url(),
        banner: z.string(),
    }),
    rating: z.number(),
    _links: linksSchema,
});

const supportTicketSchema = z.object({
    ID: z.number(),
    post_author: z.string(),
    post_date: z.coerce.date(),
    post_date_gmt: z.coerce.date(),
    post_content: z.string(),
    post_title: z.string(),
    post_excerpt: z.string(),
    post_status: z.string(),
    comment_status: z.string(),
    ping_status: z.string(),
    post_password: z.string(),
    post_name: z.string(),
    to_ping: z.string(),
    pinged: z.string(),
    post_modified: z.coerce.date(),
    post_modified_gmt: z.coerce.date(),
    post_content_filtered: z.string(),
    post_parent: z.number(),
    guid: z.string().url(),
    menu_order: z.number(),
    post_type: z.string(),
    post_mime_type: z.string(),
    comment_count: z.string(),
    filter: z.string(),
    vendor_name: z.string().optional(),
    customer_name: z.string().optional(),
    vendor_id: z.string().or(z.number()).optional(),
    store_url: z.string().optional(),
    ticket_date: z.string().optional(),
    reading: z.string().optional(),
    ancestors: z.array(z.any()).optional(), // Adjust this based on the actual structure
    page_template: z.string().optional(),
    post_category: z.array(z.any()).optional(), // Adjust this based on the actual structure
    tags_input: z.array(z.any()).optional(), // Adjust this based on the actual structure
    _links: linksSchema.optional(),
});

const vendorStaffCapabilitiesSchema = z.object({
    read: z.boolean().optional(),
    vendor_staff: z.boolean(),
    dokandar: z.boolean(),
    delete_pages: z.boolean(),
    publish_posts: z.boolean(),
    edit_posts: z.boolean(),
    delete_published_posts: z.boolean(),
    edit_published_posts: z.boolean(),
    delete_posts: z.boolean(),
    manage_categories: z.boolean(),
    moderate_comments: z.boolean(),
    upload_files: z.boolean(),
    edit_shop_orders: z.boolean(),
    edit_product: z.boolean(),
    dokan_view_sales_overview: z.boolean().optional(),
    dokan_view_sales_report_chart: z.boolean().optional(),
    dokan_view_announcement: z.boolean().optional(),
    dokan_view_order_report: z.boolean().optional(),
    dokan_view_review_reports: z.boolean(),
    dokan_view_product_status_report: z.boolean().optional(),
    dokan_add_product: z.boolean().optional(),
    dokan_edit_product: z.boolean(),
    dokan_delete_product: z.boolean(),
    dokan_view_product: z.boolean(),
    dokan_duplicate_product: z.boolean(),
    dokan_import_product: z.boolean(),
    dokan_export_product: z.boolean(),
    dokan_view_order: z.boolean(),
    dokan_manage_order: z.boolean(),
    dokan_manage_order_note: z.boolean(),
    dokan_manage_reviews: z.boolean(),
    dokan_view_overview_menu: z.boolean(),
    dokan_view_product_menu: z.boolean(),
    dokan_view_order_menu: z.boolean(),
    dokan_view_review_menu: z.boolean(),
    dokan_view_store_settings_menu: z.boolean(),
    dokan_view_store_shipping_menu: z.boolean(),
    dokan_view_store_social_menu: z.boolean(),
    dokan_view_store_seo_menu: z.boolean(),
    dokan_export_order: z.boolean(),
});

const vendorStaffSchema = z.object({
    ID: z.string(),
    user_login: z.string(),
    user_nicename: z.string(),
    user_email: z.string(),
    user_url: z.string(),
    user_registered: z.string(),
    user_activation_key: z.string(),
    user_status: z.string(),
    display_name: z.string(),
    phone: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    registered_at: z.string(),
    avatar: z.string(),
    capabilities: vendorStaffCapabilitiesSchema,
});

const verificationMethodSchema = z.object({
    id: z.string().or(z.number()),
    title: z.string(),
    help_text: z.string(),
    status: z.boolean(),
    required: z.boolean(),
    kind: z.string(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    _links: linksSchema,
});

const verificationRequestSchema = z.object({
    id: z.string().or(z.number()),
    vendor_id: z.string().or(z.number()),
    method_id: z.string().or(z.number()),
    status: z.string(),
    status_title: z.string(),
    documents: z.array(z.string().or(z.number())),
    note: z.string(),
    additional_info: z.any(),
    checked_by: z.number(),
    created_at: z.coerce.date(),
    updated_at: z.coerce.date(),
    vendor: storeSchema,
    method: verificationMethodSchema.omit({ _links: true }),
    document_urls: z.record(
        z.object({
            url: z.any(),
            title: z.string(),
        }),
    ),
    _links: linksSchema,
});

const vendorSubscriptionPackageSchema = z.object({
    id: z.number().or(z.string()),
    title: z.string(),
});

const vendorSubscriptionNonRecurringPackageSchema = z.object({
    name: z.number().or(z.string()),
    label: z.string(),
});

const vendorSubscriptionSchema = z.object({
    id: z.number().or(z.string()),
    store_name: z.string(),
    order_link: z.string(),
    order_id: z.string(),
    subscription_id: z.string(),
    subscription_title: z.string(),
    is_on_trial: z.boolean(),
    subscription_trial_until: z.any(),
    start_date: z.string(),
    end_date: z.string(),
    current_date: z.string(),
    status: z.boolean(),
    is_recurring: z.boolean(),
    has_active_cancelled_sub: z.boolean(),
});

const wholesaleCustomerSchema = z.object({
    id: z.string().or(z.number()),
    first_name: z.string(),
    last_name: z.string(),
    username: z.string(),
    name: z.string(),
    email: z.string(),
    avatar: z.string(),
    url: z.string(),
    role: z.string(),
    registerd_date: z.string(),
    wholesale_status: z.string(),
    _links: linksSchema,
});

const shipmentSchema = z.object({
    id: z.number().or(z.string()),
    order_id: z.number().or(z.string()),
    shipping_provider: z.string(),
    shipping_provider_label: z.string(),
    shipped_status: z.string(),
    shipping_status_label: z.string(),
    shipment_description: z.array(
        z.object({
            id: z.number().or(z.string()),
            content: z.string(),
        }),
    ),
    shipping_number: z.string(),
    shipped_date: z.string(),
    is_notify: z.string(),
    item_id: z.array(z.number()),
    item_qty: z.record(z.string(), z.number()),
    other_provider: z.string(),
    other_p_url: z.string().url(),
    items: z.record(
        z.string(),
        z.object({
            id: z.number(),
            order_id: z.number(),
            name: z.string(),
            product_id: z.number(),
            variation_id: z.number(),
            quantity: z.number(),
            tax_class: z.string(),
            subtotal: z.string(),
            subtotal_tax: z.string(),
            total: z.string(),
            total_tax: z.string(),
            taxes: z.object({
                total: z.record(z.string(), z.string()),
                subtotal: z.record(z.string(), z.string()),
            }),
        }),
    ),
    _links: linksSchema,
});

export const schemas = {
    // roles schema
    rolesSchema: z.object({
        roles: z.object({
            administrator: roleSchema,
            editor: roleSchema,
            author: roleSchema,
            contributor: roleSchema,
            subscriber: roleSchema,
            customer: roleSchema.optional(),
            shop_manager: roleSchema.optional(),
            seller: roleSchema.optional(),
            vendor_staff: roleSchema.optional(),
            translator: roleSchema.optional(),
        }),

        role_objects: z.object({
            administrator: roleSchema,
            editor: roleSchema,
            author: roleSchema,
            contributor: roleSchema,
            subscriber: roleSchema,
            customer: roleSchema.optional(),
            shop_manager: roleSchema.optional(),
            seller: roleSchema.optional(),
            vendor_staff: roleSchema.optional(),
            translator: roleSchema.optional(),
        }),
        role_names: z.record(z.string()),
        role_key: z.array(z.string()),
        use_db: z.array(z.boolean()),
    }),

    admin: {
        //report overview schema
        reportOverviewSchema: z.object({
            labels: z.array(z.string()),
            datasets: z.array(
                z.object({
                    label: z.string(),
                    borderColor: z.string(),
                    fill: z.boolean(),
                    data: z.array(z.union([z.string(), z.number()])),
                    tooltipLabel: z.string().optional(),
                    tooltipPrefix: z.string().optional(),
                }),
            ),
        }),

        // report summary schema
        reportSummarySchema: z.object({
            products: z.object({
                this_month: z.number(),
                last_month: z.number(),
                this_period: z.null(),
                class: z.string(),
                parcent: z.number(),
            }),
            withdraw: z.object({
                pending: z.union([z.string(), z.number()]),
                completed: z.union([z.string(), z.number()]),
                cancelled: z.union([z.string(), z.number()]),
            }),
            vendors: z.object({
                inactive: z.number(),
                active: z.number(),
                this_month: z.number(),
                last_month: z.number(),
                this_period: z.null(),
                class: z.string(),
                parcent: z.number(),
            }),
            sales: z.object({
                this_month: z.number(),
                last_month: z.number(),
                this_period: z.null(),
                class: z.string(),
                parcent: z.number(),
            }),
            orders: z.object({
                this_month: z.number(),
                last_month: z.number(),
                this_period: z.null(),
                class: z.string(),
                parcent: z.number(),
            }),
            earning: z.object({
                this_month: z.number(),
                last_month: z.number(),
                this_period: z.null(),
                class: z.string(),
                parcent: z.number(),
            }),
        }),

        //admin dashboard feed schema
        adminDashboardFeedSchema: z.array(
            z.object({
                link: z.string(),
                title: z.string(),
                desc: z.string(),
                summary: z.string(),
                date: z.string(),
                author: z.string(),
            }),
        ),

        //admin help schema
        adminHelpSchema: z.array(
            z.object({
                title: z.string(),
                icon: z.string(),
                questions: z.array(
                    z.object({
                        title: z.string(),
                        link: z.string(),
                    }),
                ),
            }),
        ),

        //admin notices schema
        adminNoticesSchema: z.array(
            z.object({
                type: z.string(),
                title: z.string(),
                description: z.string().optional(),
                priority: z.number(),
                show_close_button: z.boolean().optional(),
                ajax_data: z
                    .object({
                        action: z.string(),
                        nonce: z.string().optional(),
                        key: z.string().optional(),
                        dokan_promotion_dismissed: z.boolean().optional(),
                        _wpnonce: z.string().optional(),
                    })
                    .optional(),
                actions: z
                    .array(
                        z.object({
                            type: z.string(),
                            text: z.string(),
                            action: z.string().optional(),
                            target: z.string().optional(),
                            loading_text: z.string().optional(),
                            completed_text: z.string().optional(),
                            reload: z.boolean().optional(),
                            ajax_data: z
                                .object({
                                    action: z.string(),
                                    nonce: z.string().optional(),
                                })
                                .optional(),
                        }),
                    )
                    .optional(),
            }),
        ),

        //changelog schema lite
        changelogLiteSchema: z.string(),

        //changelog schema pro
        changelogProSchema: z.string(),

        //admin promo notice schema
        adminPromoNoticeSchema: z.array(z.unknown()),

        //admin logs schema
        adminLogsSchema: z.array(
            z.object({
                order_id: z.string().or(z.number()),
                vendor_id: z.string().or(z.number()).optional(),
                vendor_name: z.string(),
                previous_order_total: z.string(),
                order_total: z.string(),
                vendor_earning: z.string().or(z.number()),
                commission: z.string(),
                dokan_gateway_fee: z.union([z.string(), z.number()]),
                gateway_fee_paid_by: z.string(),
                shipping_total: z.string(),
                shipping_total_refunded: z.string(),
                shipping_total_remains: z.string(),
                has_shipping_refund: z.boolean(),
                shipping_total_tax: z.string(),
                shipping_total_tax_refunded: z.string(),
                shipping_total_tax_remains: z.string(),
                has_shipping_tax_refund: z.boolean(),
                tax_total: z.string(),
                tax_total_refunded: z.string(),
                tax_total_remains: z.string(),
                has_tax_refund: z.boolean(),
                status: z.string(),
                date: z.string(),
                has_refund: z.boolean(),
                shipping_recipient: z.string(),
                shipping_tax_recipient: z.string(),
                tax_recipient: z.string(),
            }),
        ),

        //admin export logs schema
        adminExportLogsSchema: z.object({
            step: z.string().or(z.number()),
            percentage: z.number(),
            columns: z
                .object({
                    order_id: z.string().or(z.number()).optional(),
                    vendor_id: z.string().or(z.number()).optional(),
                    vendor_name: z.string(),
                    previous_order_total: z.string(),
                    order_total: z.string(),
                    vendor_earning: z.string(),
                    commission: z.string(),
                    dokan_gateway_fee: z.string(),
                    gateway_fee_paid_by: z.string(),
                    shipping_total: z.string(),
                    tax_total: z.string(),
                    status: z.string(),
                    date: z.string(),
                })
                .optional(),
        }),
    },

    // customers schema
    customersSchema: {
        customerSchema: customerSchema,
        customersSchema: z.array(customerSchema),
        batchUpdateCustomersSchema: z.object({
            create: z.array(customerSchema).optional(),
            update: z.array(customerSchema).optional(),
            delete: z.array(customerSchema).optional(),
        }),
    },

    // attributes schema
    attributesSchema: {
        attributeSchema: attributeSchema,
        attributesSchema: z.array(attributeSchema),
        batchUpdateAttributesSchema: z.object({
            create: z.array(attributeSchema).optional(),
            update: z.array(attributeSchema).optional(),
            delete: z.array(attributeSchema).optional(),
        }),
        setDefaultAttributeSchema: z.boolean(),
        updateProductAttributeSchema: z.boolean(),
    },

    // attribute terms schema
    attributeTermsSchema: {
        attributeTermSchema: attributeTermSchema,
        attributeTermsSchema: z.array(attributeTermSchema),
        batchUpdateAttributesSchema: z.object({
            update: z.array(attributeTermSchema),
        }),
    },

    // coupons schema
    couponsSchema: {
        couponSchema: couponSchema,
        couponsSchema: z.array(couponSchema),
    },

    // products schema
    productsSchema: {
        productSchema: productSchema,
        productsSchema: z.array(productSchema),
        productSummarySchema: z.object({
            post_counts: z.object({
                publish: z.number().optional(),
                future: z.number().optional(),
                draft: z.number().optional(),
                pending: z.number().optional(),
                private: z.number().optional(),
                trash: z.number().optional(),
                'auto-draft': z.number().optional(),
                inherit: z.number().optional(),
                'request-pending': z.number().optional(),
                'request-confirmed': z.number().optional(),
                'request-failed': z.number().optional(),
                'request-completed': z.number().optional(),
                'wc-active': z.number().optional(),
                'wc-switched': z.number().optional(),
                'wc-expired': z.number().optional(),
                'wc-pending-cancel': z.number().optional(),
                'wc-pending': z.number().optional(),
                'wc-processing': z.number().optional(),
                'wc-on-hold': z.number().optional(),
                'wc-completed': z.number().optional(),
                'wc-cancelled': z.number().optional(),
                'wc-refunded': z.number().optional(),
                'wc-failed': z.number().optional(),
                'wc-checkout-draft': z.number(),
                complete: z.number().optional(),
                paid: z.string().or(z.number()).optional(),
                confirmed: z.number().optional(),
                unpaid: z.string().or(z.number()).optional(),
                'pending-confirmation': z.number().optional(),
                cancelled: z.number().optional(),
                'in-cart': z.number().optional(),
                'was-in-cart': z.number().optional(),
                vacation: z.number().optional(),
                open: z.number().optional(),
                closed: z.number().optional(),
                total: z.number().optional(),
            }),
            products_url: z.string(),
        }),

        multistepCategories: z.record(
            z.object({
                term_id: z.string().or(z.number()).optional(),
                name: z.string(),
                parent_id: z.string().or(z.number()).optional(),
                children: z.array(z.any()),
                parents: z.array(z.any()),
                breadcumb: z.array(z.string()),
            }),
        ),
    },

    // product variations schema
    productVariationsSchema: {
        productVariationSchema: productVariationSchema,
        productVariationsSchema: z.array(productVariationSchema),
        batchUpdateProductVariationsSchema: z.object({
            create: z.array(productVariationSchema).optional(),
            update: z.array(productVariationSchema).optional(),
            delete: z.array(productVariationSchema).optional(),
        }),
    },

    // product reviews schema
    productReviewsSchema: {
        productReviewSchema: productReviewSchema,
        productReviewsSchema: z.array(productReviewSchema),
        productReviewsSummarySchema: z.object({
            comment_counts: z.object({
                moderated: z.number(),
                approved: z.number(),
                spam: z.number(),
                trash: z.number(),
                total: z.number(),
            }),
            reviews_url: z.string(),
        }),
        updateProductReviewSchema: productReviewSchema.omit({ id: true }),
    },

    // product blocks schema
    productBlocksSchema: {
        productBlockSchema: z.object({
            general: z.object({
                name: z.string(),
                slug: z.string(),
                price: z.string(),
                type: z.string(),
                downloadable: z.boolean(),
                virtual: z.boolean(),
                regular_price: z.string(),
                sale_price: z.string(),
                date_on_sale_from: z.null().optional(),
                date_on_sale_to: z.null().optional(),
                images: z.array(
                    z.object({
                        id: z.string().or(z.number()),
                        date_created: z.string(),
                        date_created_gmt: z.string(),
                        date_modified: z.string(),
                        date_modified_gmt: z.string(),
                        src: z.string(),
                        name: z.string(),
                        alt: z.string(),
                        position: z.number(),
                    }),
                ),
                tags: z.array(z.unknown()), // Assuming tags can be any type
                description: z.string(),
                short_description: z.string(),
                post_status: z.string(),
                status: z.string(),
                catalog_visibility: z.string(),
                categories: z.array(
                    z.object({
                        id: z.string().or(z.number()),
                        name: z.string(),
                        slug: z.string(),
                    }),
                ),
                chosen_cat: z.array(z.number()),
                external_url: z.string().optional(),
                button_text: z.string().optional(),
            }),
            inventory: z.object({
                sku: z.string(),
                stock_status: z.string(),
                manage_stock: z.boolean(),
                stock_quantity: z.null().optional(),
                low_stock_amount: z.string(),
                backorders: z.string(),
                sold_individually: z.boolean(),
            }),
            downloadable: z.object({
                downloads: z.array(z.unknown()), // Assuming downloads can be any type
                enable_limit_expiry: z.boolean(),
                download_limit: z.number(),
                download_expiry: z.number(),
            }),
            advanced: z.object({
                purchase_note: z.string(),
                reviews_allowed: z.boolean(),
            }),
            geolocation: z
                .object({
                    use_store_settings: z.string(),
                    dokan_geo_latitude: z.string(),
                    dokan_geo_longitude: z.string(),
                    dokan_geo_public: z.string(),
                    dokan_geo_address: z.string(),
                    store_has_settings: z.boolean(),
                    store_settings_url: z.string(),
                })
                .optional(),
            product_advertising: z
                .object({
                    advertisement_data: z
                        .object({
                            vendor_id: z.string().or(z.number()),
                            product_id: z.string().or(z.number()),
                            subscription_status: z.boolean(),
                            remaining_slot: z.number(),
                            global_remaining_slot: z.number(),
                            subscription_remaining_slot: z.number(),
                            listing_price: z.string(),
                            expires_after_days: z.string(),
                            subscription_expires_after_days: z.number(),
                            already_advertised: z.boolean(),
                            can_advertise_for_free: z.boolean(),
                            expire_date: z.string(),
                            post_status: z.string(),
                        })
                        .optional(),
                    dokan_advertise_single_product: z.boolean(),
                })
                .optional(),
            rma: z
                .object({
                    dokan_rma_product_override: z.boolean(),
                    warranty_label: z.string(),
                    warranty_type: z.string(),
                    warranty_length: z.string(),
                    warranty_length_value: z.string(),
                    warranty_length_duration: z.string(),
                    warranty_reason: z.array(z.string()),
                    addon_settings: z.array(z.unknown()), // Assuming addon_settings can be any type
                    warranty_policy: z.string(),
                })
                .optional(),
            wholesale: z
                .object({
                    wholesale_price: z.string(),
                    wholesale_quantity: z.string(),
                    enable_wholesale: z.string().or(z.boolean()),
                })
                .optional(),
            order_min_max: z
                .object({
                    min_quantity: z.string().or(z.number()),
                    max_quantity: z.string().or(z.number()),
                })
                .optional(),
            linked: z
                .object({
                    upsell_ids: z.array(z.number()),
                    cross_sell_ids: z.array(z.number()),
                    grouped_products: z.array(z.number()),
                })
                .optional(),
            shipping_tax: z
                .object({
                    _disable_shipping: z.boolean(),
                    _weight: z.string(),
                    _length: z.string(),
                    _width: z.string(),
                    _height: z.string(),
                    shipping_class: z.string(),
                    _overwrite_shipping: z.boolean(),
                    _additional_price: z.string(),
                    _additional_qty: z.string(),
                    _dps_processing_time: z.string(),
                    _tax_status: z.string(),
                    _tax_class: z.string(),
                })
                .optional(),
            attributes: z
                .object({
                    _has_attribute: z.boolean(),
                    _create_variations: z.boolean(),
                    _product_attributes: z.array(z.unknown()), // Assuming _product_attributes can be any type
                    _default_attributes: z.array(z.unknown()), // Assuming _default_attributes can be any type
                })
                .optional(),
        }),
    },

    // product filter schema
    productFilterSchema: z.object({
        allDates: z.array(dateEntrySchema),
    }),

    // stores schema
    storesSchema: {
        storeSchema: storeSchema,
        storesSchema: z.array(storeSchema),
        storeStatsSchema: z.object({
            products: z.object({
                total: z.number(),
                sold: z.number(),
                visitor: z.number(),
            }),
            revenue: z.object({
                orders: z.number(),
                sales: z.number(),
                earning: z.number(),
            }),
            others: z.object({
                commission_rate: z.string().nullable().optional(),
                additional_fee: z.string().or(z.number()).nullable().optional(),
                commission_type: z.string().optional(),
                balance: z.number(),
                reviews: z.number(),
            }),
        }),

        storeCurrentVisitorSchema: z.object({
            user: z.object({
                user_login: z.string(),
                email: z.string().email(),
                first_name: z.string(),
                last_name: z.string(),
                display_name: z.string(),
            }),
        }),

        storeCategoriesSchema: z
            .object({
                term_id: z.string().or(z.number()),
                name: z.string(),
                slug: z.string(),
                term_group: z.number(),
                term_taxonomy_id: z.string().or(z.number()),
                taxonomy: z.string(),
                description: z.string(),
                parent: z.number(),
                count: z.number(),
                filter: z.string(),
                thumbnail: z.string().url(),
                image: z.string().url(),
                icon: z.string(),
                icon_color: z.string(),
                display_type: z.string(),
                admin_commission_type: z.string(),
                commission: z.array(z.any()),
            })
            .or(z.any()),
        storeProductsSchema: z.array(productSchema),
        storeReviewsSchema: z.array(storeReviewSchemaStoreEndpoint),
        storeSlugCheckSchema: z.object({ url: z.string(), available: z.boolean() }),
        clientContactStoreSchema: z.object({
            store_id: z.string().or(z.number()),
            data: z.string(),
            sender_name: z.string(),
            sender_email: z.string(),
            sender_message: z.string(),
        }),
        adminEmailStoreSchema: z.object({
            success: z.boolean(),
        }),
        batchUpdateStoreSchema: z.object({
            approved: z.array(storeSchema).optional(),
            pending: z.array(storeSchema).optional(),
        }),
    },

    // store categories schema
    storeCategoriesSchema: {
        storyCategorySchema: storyCategorySchema,
        storeCategoriesSchema: z.array(storyCategorySchema),
        deleteStoryCategorySchema: z.object({
            deleted: z.boolean(),
            previous: storyCategorySchema.omit({ _links: true }),
        }),
    },

    // orders schema
    ordersSchema: {
        orderSchema: orderSchema,
        ordersSchema: z.array(orderSchema),
        ordersSummarySchema: ordersSummarySchema,
        batchUpdateOrderSchema: z.object({ success: z.boolean() }),
    },

    // order downloads schema
    orderDownloadsSchema: {
        orderDownloadSchema: orderDownloadSchema,
        orderDownloadsSchema: z.object({ downloads: z.array(orderDownloadSchema) }),
        createOrderDownloadSchema: z.record(z.string(), z.string()),
        deleteOrderDownloadSchema: z.object({ success: z.boolean() }),
    },

    // order notes schema
    orderNotesSchema: {
        orderNoteSchema: orderNoteSchema,
        orderNotesSchema: z.array(orderNoteSchema),
        createOrderNoteSchema: orderNoteSchema.omit({ date_created: true, date_created_gmt: true }),
        deleteOrderNoteSchema: orderNoteSchema.omit({ date_created: true, date_created_gmt: true }),
    },

    // refunds schema
    refundsSchema: {
        refundSchema: refundSchema,
        refundsSchema: z.array(refundSchema),
        batchUpdateRefundsSchema: z.object({
            success: z
                .object({ completed: z.array(z.number()).optional() })
                .or(z.array(z.unknown()))
                .optional(),
            failed: z
                .object({ completed: z.array(z.number()).optional() })
                .or(z.array(z.unknown()))
                .optional(),
        }),
    },

    // reports schema
    reportsSchema: {
        // sales overview schema
        salesOverviewSchema: z.object({
            seller_id: z.string().or(z.number()),
            order_counts: z.array(z.unknown()), // Assuming it can contain any data type
            coupons: z.array(z.unknown()), // Assuming it can contain any data type
            order_items: z.array(z.unknown()), // Assuming it can contain any data type
            refunded_order_items: z.number(),
            orders: z.array(z.unknown()), // Assuming it can contain any data type
            full_refunds: z.array(z.unknown()), // Assuming it can contain any data type
            partial_refunds: z.array(z.unknown()), // Assuming it can contain any data type
            refund_lines: z.array(z.unknown()), // Assuming it can contain any data type
            total_tax_refunded: z.number(),
            total_shipping_refunded: z.number(),
            total_shipping_tax_refunded: z.number(),
            total_refunds: z.number(),
            refunded_orders: z.array(z.unknown()), // Assuming it can contain any data type
            total_tax: z.string(),
            total_shipping: z.string(),
            total_shipping_tax: z.string(),
            total_sales: z.string(),
            net_sales: z.string(),
            average_sales: z.string(),
            average_total_sales: z.string(),
            total_coupons: z.string(),
            total_refunded_orders: z.number(),
            total_orders: z.number(),
            total_items: z.number(),
        }),
        // summary report schema
        summaryReportSchema: z.object({
            pageviews: z.number(),
            orders_count: ordersSummarySchema,
            sales: z.number(),
            seller_balance: z.string(),
        }),
        // top earners schema
        topEarnersSchema: z.array(
            z.object({
                id: z.string().or(z.number()),
                title: z.string(),
                url: z.string(),
                edit_url: z.string(),
                sold_qty: z.string().optional(), // Assuming sold_qty can be any string format
            }),
        ),
        // top selling products schema
        topSellingProductsSchema: z.any(),
    },

    // commission schema
    commission: z.number(),

    // withdraws schema
    withdrawsSchema: {
        withdrawPaymentMethod: z.array(paymentMethodSchema),

        // getBalanceDetailsSchema
        getBalanceDetailsSchema: z.object({
            current_balance: z.number(),
            withdraw_limit: z.string(),
            withdraw_threshold: z.number(),
            withdraw_methods: z.array(z.string()),
            last_withdraw: z
                .array(
                    z
                        .object({
                            id: z.string().or(z.number()).optional(),
                            user_id: z.string().or(z.number()).optional(),
                            amount: z.string().optional(),
                            date: z.string().optional(),
                            status: z.string().optional(),
                            method: z.string().optional(),
                            note: z.string().optional(),
                            details: z.string().optional(),
                            ip: z.string().optional(),
                        })
                        .optional(),
                )
                .optional(),
        }),
        withdrawSchema: withdrawSchema,
        withdrawsSchema: z.array(withdrawSchema),

        batchUpdateWithdrawsSchema: z.object({
            success: z
                .object({
                    approved: z.array(z.unknown()).optional(),
                })
                .or(z.array(z.unknown())),
            failed: z
                .object({
                    approved: z.array(z.unknown()).optional(),
                })
                .or(z.array(z.unknown())),
        }),

        withdrawChargesSchema: z.object({
            paypal: chargeDataSchema.optional(),
            bank: chargeDataSchema.optional(),
            skrill: chargeDataSchema.optional(),
            dokan_custom: chargeDataSchema.optional(),
            'dokan-stripe-connect': chargeDataSchema.optional(),
        }),

        chargeDetailsSchema: z.object({
            charge: z.number(),
            receivable: z.number(),
            charge_data: chargeDataSchema,
        }),
    },

    // withdraw settings schema
    withdrawSettingsSchema: {
        withdrawSettingsSchema: z.object({
            withdraw_method: z.enum(['paypal', 'bank', 'skrill', 'dokan_custom']),
            payment_methods: z.array(
                z.object({
                    label: z.string(),
                    value: z.string(),
                }),
            ),
        }),

        withdrawSummarySchema: z.object({
            total: z.number(),
            pending: z.number(),
            approved: z.number(),
            cancelled: z.number(),
        }),

        withdrawDisbursementSettingsSchema: z.object({
            enabled: z.boolean(),
            selected_schedule: z.enum(['quarterly', 'monthly', 'biweekly', 'weekly']),
            minimum_amount_list: z.array(z.number()),
            minimum_amount_selected: z.number(),
            reserve_balance_list: z.array(z.number()),
            reserve_balance_selected: z.number(),
            default_method: z.enum(['paypal', 'bank', 'skrill', 'dokan_custom']),
            schedules: z.record(
                z.object({
                    next: z.string(),
                    title: z.string(),
                    description: z.string(),
                }),
            ),
            active_methods: z.array(z.string()),
            method_additional_info: z.array(z.string()),
            minimum_amount_needed: z.number(),
            is_schedule_selected: z.boolean(),
        }),

        updateWithdrawDisbursementSettingsSchema: z.object({
            success: z.boolean(),
        }),

        disableWithdrawDisbursementSettingsSchema: z.object({
            success: z.boolean(),
        }),
    },

    // reverse withdraws schema
    reverseWithdrawalSchema: {
        transactionTypesSchema: z.array(transactionTypeSchema),
        reverseWithdrawalStoresSchema: z.array(
            z.object({
                id: z.string().or(z.number()),
                name: z.string(),
            }),
        ),
        reverseWithdrawalStoreBalanceSchema: z.array(
            z.object({
                store_name: z.string(),
                vendor_id: z.string().or(z.number()),
                debit: z.string(), // Assuming debit and credit can be represented as strings with decimal places
                credit: z.string(),
                balance: z.number(), // Assuming balance is represented as a number
                last_payment_date: z.string(), // Assuming last_payment_date is a string representation
                _links: linksSchema,
            }),
        ),
        reverseWithdrawalTransactionsSchema: z.array(
            z.object({
                id: z.string().or(z.number()),
                trn_id: z.string().or(z.number()),
                trn_url: z.string(),
                trn_date: z.string(), // Assuming trn_date is a string representation of a date
                trn_type: z.string(),
                trn_type_raw: z.string(),
                vendor_id: z.string().or(z.number()),
                note: z.string(),
                debit: z.string().or(z.number()),
                credit: z.string().or(z.number()),
                balance: z.string().or(z.number()),
                _links: linksSchema,
            }),
        ),
        reverseWithdrawalVendorDueStatusSchema: z.object({
            status: z.boolean(),
            due_date: z.string(),
            balance: z.number(),
            formatted_balance: z.string(),
            billing_type: z.string(),
            formatted_billing_type: z.string(),
            billing_day: z.number(),
            due_period: z.number(),
            threshold: z.number(),
            formatted_threshold: z.string(),
            payable_amount: z.number(),
            formatted_payable_amount: z.string(),
            display_notice: z.boolean(),
            formatted_failed_actions: z.string(),
            formatted_action_taken_message: z.string(),
        }),
        reverseWithdrawalAddProductToCartSchema: z.object({
            status: z.boolean(),
        }),
    },

    // dummy data schema
    dummyDataSchema: {
        dummyDataStatusSchema: z.object({ import_status: z.enum(['yes', 'no']) }),
        importDummyDataSchema: z.object({
            result: z.object({
                imported: z.array(z.number()),
                failed: z.array(z.unknown()),
                updated: z.array(z.unknown()),
                skipped: z.array(z.unknown()),
            }),
            vendor_index: z.number(),
        }),
        clearDummyDataClearSchema: z.object({ message: z.string() }),
    },

    // vendor dashboard schema
    vendorDashboardSchema: {
        // statistics schema
        statisticsSchema: z.object({
            balance: z.string(),
            orders: ordersSummarySchema,
            products: z.object({
                publish: z.number(),
                future: z.number(),
                draft: z.number(),
                pending: z.number(),
                private: z.number(),
                trash: z.number(),
                'auto-draft': z.number(),
                inherit: z.number(),
                'request-pending': z.number(),
                'request-confirmed': z.number(),
                'request-failed': z.number(),
                'request-completed': z.number(),
                'wc-active': z.number().optional(),
                'wc-switched': z.number().optional(),
                'wc-expired': z.number().optional(),
                'wc-pending-cancel': z.number().optional(),
                'wc-pending': z.number(),
                'wc-processing': z.number(),
                'wc-on-hold': z.number(),
                'wc-completed': z.number(),
                'wc-cancelled': z.number(),
                'wc-refunded': z.number(),
                'wc-failed': z.number(),
                'wc-checkout-draft': z.number(),
                complete: z.number().optional(),
                paid: z.string().or(z.number()).optional(),
                confirmed: z.number().optional(),
                unpaid: z.string().or(z.number()).optional(),
                'pending-confirmation': z.number().optional(),
                cancelled: z.number().optional(),
                'in-cart': z.number().optional(),
                'was-in-cart': z.number().optional(),
                vacation: z.number().optional(),
                open: z.number().optional(),
                closed: z.number().optional(),
                total: z.number(),
            }),
            sales: z.string(),
            earnings: z.string(),
            views: z.any(),
        }),

        // profile schema
        profileSchema: z.object({
            store_name: z.string(),
            social: socialSchema,
            payment: paymentSchema,
            phone: z.string(),
            show_email: z.string(),
            address: addressSchema.optional(),
            location: z.string(),
            banner: z.number(),
            icon: z.string().or(z.number()),
            gravatar: z.number(),
            enable_tnc: z.string(),
            store_tnc: z.string(),
            show_min_order_discount: z.string(),
            store_seo: storeSeo.optional(),
            dokan_store_time_enabled: z.string(),
            dokan_store_open_notice: z.string(),
            dokan_store_close_notice: z.string(),
            dokan_store_time: z.any().optional(),
            sale_only_here: z.boolean().optional(),
            company_name: z.string().optional(),
            vat_number: z.string().optional(),
            company_id_number: z.string().optional(),
            bank_name: z.string().optional(),
            bank_iban: z.string().optional(),
            profile_completion: profileCompletionSchema.optional(),
            current_subscription: z
                .object({
                    name: z.union([z.string(), z.number()]),
                    label: z.string(),
                })
                .optional(),
            assigned_subscription: z.number().optional(),
            assigned_subscription_info: z
                .object({
                    subscription_id: z.string().or(z.number()),
                    has_subscription: z.boolean(),
                    expiry_date: z.string(),
                    published_products: z.number(),
                    remaining_products: z.number(),
                    recurring: z.boolean(),
                    start_date: z.string(),
                })
                .optional(),
            categories: z.array(categorySchema.optional()).optional(),
        }),

        // sale report schema
        salesReportSchema: z.array(
            z.object({
                post_date: z.string().or(z.number()),
                total_sales: z.string().or(z.number()),
                total_orders: z.string().or(z.number()),
                total_earnings: z.string().or(z.number()),
                total_products: z.string().or(z.number()),
            }),
        ),

        // product report summary schema
        productReportsSummarySchema: z.object({
            publish: z.number(),
            future: z.number(),
            draft: z.number(),
            pending: z.number(),
            private: z.number(),
            trash: z.number(),
            'auto-draft': z.number(),
            inherit: z.number(),
            'request-pending': z.number(),
            'request-confirmed': z.number(),
            'request-failed': z.number(),
            'request-completed': z.number(),
            'wc-active': z.number().optional(),
            'wc-switched': z.number().optional(),
            'wc-expired': z.number().optional(),
            'wc-pending-cancel': z.number().optional(),
            'wc-pending': z.number(),
            'wc-processing': z.number(),
            'wc-on-hold': z.number(),
            'wc-completed': z.number(),
            'wc-cancelled': z.number(),
            'wc-refunded': z.number(),
            'wc-failed': z.number(),
            'wc-checkout-draft': z.number(),
            complete: z.number().optional(),
            paid: z.string().or(z.number()).optional(),
            confirmed: z.number().optional(),
            unpaid: z.string().or(z.number()).optional(),
            'pending-confirmation': z.number().optional(),
            cancelled: z.number().optional(),
            'in-cart': z.number().optional(),
            'was-in-cart': z.number().optional(),
            vacation: z.number().optional(),
            open: z.number().optional(),
            closed: z.number().optional(),
            total: z.number(),
        }),

        // order report summary schema
        orderReportsSummarySchema: ordersSummarySchema,

        // store preferences schema
        storePreferencesSchema: z.object({
            currency: z.string(),
            currency_position: z.string(),
            currency_symbol: z.string(),
            decimal_separator: z.string(),
            thousand_separator: z.string(),
            decimal_point: z.number(),
            tax_calculation: z.string(),
            tax_display_cart: z.string(),
            tax_round_at_subtotal: z.string(),
            coupon_enabled: z.string(),
            coupon_compound: z.string(),
            weight_unit: z.string(),
            dimension_unit: z.string(),
            product_reviews: z.string(),
            product_ratings: z.string(),
            stock_management: z.string(),
            timezone: z.string(),
            date_format: z.string(),
            time_format: z.string(),
            language: z.string(),
        }),

        // profile completion schema
        profileCompletionSchema: z.object({
            progress: z.number(),
            next_todo: z.string(),
            next_todo_slug: z.string(),
            next_progress_text: z.string(),
            progress_vals: z.number(),
            progresses: z.array(
                z.object({
                    key: z.string(),
                    title: z.string(),
                    slug: z.string(),
                    value: z.number(),
                    completed: z.number(),
                }),
            ),
            closed_by_user: z.boolean(),
        }),
    },

    // settings schema
    settingsSchema: {
        storeSettingsSchema: z.object({
            store_name: z.string(),
            social: socialSchema,
            payment: paymentSchema,
            phone: z.string(),
            show_email: z.string(),
            address: addressSchema,
            location: z.string(),
            banner: z.number(),
            icon: z.string().or(z.number()),
            gravatar: z.number(),
            enable_tnc: z.string(),
            store_tnc: z.string(),
            show_min_order_discount: z.string(),
            store_seo: storeSeo.optional(),
            dokan_store_time_enabled: z.string(),
            dokan_store_open_notice: z.string(),
            dokan_store_close_notice: z.string(),
            dokan_store_time: storeTimeSchema.optional(),
            sale_only_here: z.boolean().optional(),
            company_name: z.string().optional(),
            vat_number: z.string().optional(),
            company_id_number: z.string().optional(),
            bank_name: z.string().optional(),
            bank_iban: z.string().optional(),
            profile_completion: profileCompletionSchema.optional(),
            find_address: z.string().optional(),
            catalog_mode: catalogModeSchema.optional(),
            order_min_max: orderMinMaxSchema.optional(),
            categories: z.array(categorySchema).optional(),
            vendor_biography: z.string().optional(),
            show_support_btn_product: z.string().optional(),
            support_btn_name: z.string().optional(),
            show_support_btn: z.string().optional(),
            setting_go_vacation: z.string().optional(),
            settings_closing_style: z.string().optional(),
            setting_vacation_message: z.string().optional(),
            seller_vacation_schedules: z.array(z.any()).optional(),
            vendor_store_location_pickup: vendorStoreLocationPickupSchema.optional(),
            bank_payment_required_fields: bankPaymentRequiredFieldsSchema,
            active_payment_methods: activePaymentMethodsSchema,
        }),

        setStoreSchema: z.object({
            id: z.string().or(z.number()),
            store_name: z.string(),
            first_name: z.string(),
            last_name: z.string(),
            email: z.string().email(),
            social: socialSchema,
            phone: z.string(),
            show_email: z.boolean(),
            address: addressSchema,
            location: z.string(),
            banner: z.string(),
            banner_id: z.string().or(z.number()),
            gravatar: z.string(),
            gravatar_id: z.string().or(z.number()),
            shop_url: z.string().url(),
            toc_enabled: z.boolean(),
            store_toc: z.string(),
            featured: z.boolean(),
            rating: ratingSchema,
            enabled: z.boolean(),
            registered: z.string(),
            payment: paymentSchema,
            trusted: z.boolean(),
            store_open_close: timeSchema.optional(),
            sale_only_here: z.boolean().optional(),
            company_name: z.string().optional(),
            vat_number: z.string().optional(),
            company_id_number: z.string().optional(),
            bank_name: z.string().optional(),
            bank_iban: z.string().optional(),
            categories: z.array(categorySchema).optional(),
            _links: linksSchema,
        }),

        storeSettingsV2Schema: z.array(settingV2Schema),
        settingV2GroupSchema: settingV2GroupSchema,
        singleSettingGroupV2StoreSchema: z.array(settingV2GroupSchema),
    },

    // modules schema
    modulesSchema: z.array(
        z.object({
            id: z.string().or(z.number()).optional(),
            name: z.string(),
            description: z.string(),
            thumbnail: z.string().url(),
            plan: z.array(z.string()),
            active: z.boolean(),
            available: z.boolean(),
            doc_id: z.union([z.string(), z.number()]).nullable().optional(),
            doc_link: z.string().optional(),
            mod_link: z.string().nullable().optional(),
            pre_requisites: z.string().nullable().optional(),
            categories: z.array(z.string()).nullable().optional(),
            video_id: z.string().nullable().optional(),
        }),
    ),

    // abuse reports schema
    abuseReportsSchema: {
        abuseReportReasonsSchema: z.array(
            z.object({
                id: z.string().or(z.number()).optional(),
                value: z.string(),
            }),
        ),
        abuseReportSchema: abuseReportSchema,
        abuseReportsSchema: z.array(abuseReportSchema),
    },

    // announcements schema
    announcementsSchema: {
        announcementSchema: announcementSchema,
        announcementsSchema: z.array(announcementSchema),
        batchUpdateAnnouncementsSchema: z.object({ success: z.boolean() }),
        deleteAnnouncementNoticeSchema: z.object({ success: z.boolean() }),
    },

    // follow stores schema
    followStoresSchema: {
        followStatusSchema: z.object({ status: z.boolean() }),
        followUnfollowSchema: z.object({ status: z.enum(['following', 'unfollowed']) }),
        followersSchema: z.array(
            z.object({
                id: z.string().or(z.number()),
                first_name: z.string(),
                last_name: z.string(),
                full_name: z.string(),
                avatar_url: z.string().url(),
                avatar_url_2x: z.string().url(),
                followed_at: z.coerce.date(),
                formatted_followed_at: z.string(),
            }),
        ),
    },

    // product advertisements schema
    productAdvertisementsSchema: {
        // advertised product stores schema
        advertisedProductStoresSchema: z.array(
            z.object({
                vendor_id: z.string().or(z.number()).optional(),
                store_name: z.string(),
            }),
        ),
        advertisedProductSchema: advertisedProductSchema,
        advertisedProductsSchema: z.array(advertisedProductSchema),
        createAdvertisedProductSchema: advertisedProductSchema.omit({ _links: true }),

        // expire product advertisement schema
        expireProductAdvertisementSchema: z.string().or(z.number()),

        // delete product advertisement schema
        deleteProductAdvertisementSchema: z.string().or(z.number()),

        // update batch advertisement schema
        updateBatchProductAdvertisementSchema: z.string().or(z.number()),
    },

    // product QA schema
    productQaSchema: {
        productQuestionSchema: productQuestionSchema,
        productQuestionsSchema: z.array(productQuestionSchema),
        batchUpdateProductQuestionsSchema: z.object({ message: z.string() }),
        productQuestionAnswerSchema: productQuestionAnswerSchema,
        productQuestionAnswersSchema: z.array(productQuestionAnswerSchema),
    },

    // quote rules schema
    quoteRuleSchema: {
        quoteRuleSchema: quoteRuleSchema,
        quoteRulesSchema: z.array(quoteRuleSchema),
        batchUpdateQuoteRulesSchema: z.boolean(),
    },

    // quote requests schema
    quoteRequestsSchema: {
        quoteRequestSchema: quoteRequestSchema,
        quoteRequestsSchema: z.array(quoteRequestSchema),

        singleQuoteRequestSchema: z.object({
            quote_id: z.string().or(z.number()).optional(),
            title: z.string(),
            customer_info: z.object({
                name_field: z.string(),
                email_field: z.string().email(),
                company_field: z.string(),
                phone_field: z.string(),
            }),

            customer: z.object({
                user_id: z.string().or(z.number()),
                user_login: z.string(),
                user_email: z.string(),
            }),

            products: z.array(
                z.object({
                    id: z.string().or(z.number()),
                    images: z.array(z.unknown()), // Assuming images can be any array
                    permalink: z.string().url(),
                    name: z.string(),
                    store: z.object({}),
                    price: z.string(), // Assuming price and other numeric values are strings
                    offer_price: z.string(),
                    offer_product_quantity: z.string(),
                }),
            ),

            quote_details: z.array(
                z.object({
                    id: z.string().or(z.number()).optional(),
                    quote_id: z.string().or(z.number()).optional(),
                    product_id: z.string().or(z.number()).optional(),
                    quantity: z.string(),
                }),
            ),
            status: z.string(),
            _links: linksSchema,
        }),

        createQuoteRequestSchema: z.array(
            z.object({
                data: quoteRequestSchema.omit({ _links: true }),
                headers: z.array(z.unknown()),
                status: z.number(),
            }),
        ),

        batchUpdateQuoteRequestsSchema: z.boolean(),
    },

    // rank math schema
    rankMathSchema: z.boolean(),

    // seller badge schema
    sellerBadgeSchema: {
        verificationTypesSchema: z.object({
            id_verification: verificationTypeSchema,
            company_verification: verificationTypeSchema,
            address_verification: verificationTypeSchema,
            phone_verification: verificationTypeSchema,
            social_profiles: verificationTypeSchema,
        }),

        badgeEventsSchema: z.array(badgeEventSchema),

        badgeSchema: badgeSchema,
        badgesSchema: z.array(badgeSchema),

        badgeSeenSchema: z.boolean(),

        badgeCreateUpdateSchema: badgeCreateUpdateSchema,

        deleteBadgeSchema: z.object({
            deleted: z.boolean(),
        }),

        batchUpdateBadgesSchema: z.array(badgeCreateUpdateSchema),
    },

    // spmv schema
    spmvSchema: {
        spmvSettingsSchema: z.object({ isEnabled: z.boolean() }),
        spmvProductsSchema: z.array(
            z.object({
                average_rating: z.string(),
                title: z.string(),
                image: z.string(),
                permalink: z.string(),
                review_count: z.number(),
                type: z.string(),
                id: z.string().or(z.number()),
                price: z.string(),
                price_html: z.string(),
                category_list: z.string(),
                vendor_name: z.string(),
                action: z.string(),
            }),
        ),

        addToStoreSchema: z.object({
            status: z.boolean(),
            success_message: z.string(),
        }),
    },

    // store reviews schema
    storeReviewsSchema: {
        storeReviewSchemaStoreEndpoint: storeReviewSchemaStoreEndpoint,
        storeReviewsSchemaStoreEndpoint: z.array(storeReviewSchemaStoreEndpoint),
        storeReviewSchema: storeReviewSchema,
        storeReviewsSchema: z.array(storeReviewSchema),
        batchUpdateStoreReviewsSchema: z.boolean(),
    },

    // support ticket schema
    supportTicketsSchema: {
        supportTicketCustomerSchema: z.array(
            z.object({
                ID: z.string(),
                display_name: z.string(),
            }),
        ),
        supportTicketSchema: supportTicketSchema,
        supportTicketsSchema: z.array(supportTicketSchema),
        singleSupportTicketSchema: z.object({
            topic: supportTicketSchema, // Assuming topic can be any array structure
            comments: z.array(z.any()), // Assuming comments can be any array structure
            store_info: z.object({
                store_name: z.string(),
                social: socialSchema,
                payment: paymentSchema,
                phone: z.string(),
                show_email: z.string(), // Assuming "yes" or "no"
                address: addressSchema,
                location: z.string(),
                banner: z.number(),
                icon: z.string().or(z.number()),
                gravatar: z.number(),
                enable_tnc: z.string(), // Assuming "on" or "off"
                store_tnc: z.string(),
                show_min_order_discount: z.string(), // Assuming "yes" or "no"
                store_seo: storeSeo.optional(),
                dokan_store_time_enabled: z.string(), // Assuming "yes" or "no"
                dokan_store_open_notice: z.string(),
                dokan_store_close_notice: z.string(),
                sale_only_here: z.boolean(),
                company_name: z.string(),
                vat_number: z.string(),
                company_id_number: z.string(),
                bank_name: z.string(),
                bank_iban: z.string(),
                categories: z.array(categorySchema).optional(),
                store_url: z.string(),
            }),
            site_image_url: z.string(),
            site_title: z.string(),
            unread_topics_count: z.number(),
            dokan_admin_email_notification_global: z.boolean(),
            dokan_admin_email_notification: z.string(),
        }),
        supportTicketCommentSchema: z.number(),
        supportTicketStatusSchema: z.object({
            success: z.boolean(),
            data: z.object({
                result: z.string(),
                message: z.string(),
            }),
        }),
        supportTicketEmailSchema: z.object({
            result: z.boolean(),
            message: z.string(),
            type: z.string(),
        }),
        deleteSupportTicketSchema: z.boolean(),
        batchUpdateSupportTicketSchema: z.object({ closed: z.array(z.number()) }).or(z.array(z.unknown())),
    },

    // vendor staff schema
    vendorStaffSchema: {
        vendorStaffSchema: vendorStaffSchema,
        vendorStaffsSchema: z.array(vendorStaffSchema),
        staffCapabilitiesSchema: z.object({
            all: z.object({
                overview: z.record(z.string()).optional(),
                report: z.record(z.string()).optional(),
                order: z.record(z.string()).optional(),
                coupon: z.record(z.string()).optional(),
                review: z.record(z.string()).optional(),
                withdraw: z.record(z.string()).optional(),
                product: z.record(z.string()).optional(),
                menu: z.record(z.string()).optional(),
                booking: z.record(z.string()).optional(),
                store_support: z.record(z.string()).optional(),
                auction: z.record(z.string()).optional(),
            }),
            default: z.array(z.string()),
        }),
        staffCapabilities: vendorStaffCapabilitiesSchema,
    },

    // vendor verifications schema
    vendorVerificationSchema: {
        verificationMethodSchema: verificationMethodSchema,
        verificationMethodsSchema: z.array(verificationMethodSchema),
        verificationRequestSchema: verificationRequestSchema,
        verificationRequestsSchema: z.array(verificationRequestSchema),
    },

    // vendor subscriptions schema
    vendorSubscriptionsSchema: {
        vendorSubscriptionsSchema: z.array(vendorSubscriptionSchema),
        vendorSubscriptionPackagesSchema: z.array(vendorSubscriptionPackageSchema),
        vendorSubscriptionNonRecurringPackagesSchema: z.array(vendorSubscriptionNonRecurringPackageSchema),
        activeSubscriptionPackSchema: z.object({
            name: z.number().or(z.string()),
            label: z.string(),
        }),
        updateSubscriptionSchema: vendorSubscriptionSchema.or(
            z.object({
                code: z.string(),
                message: z.string(),
                data: z.object({
                    status: z.number(),
                }),
            }),
        ),
        batchUpdateSubscriptionSchema: z.array(z.number().or(z.string())),
        saveCommissionSchema: z.number(),
    },

    // wholesale customers schema
    wholesaleCustomersSchema: {
        wholesaleCustomerSchema: wholesaleCustomerSchema,
        wholesaleCustomersSchema: z.array(wholesaleCustomerSchema),
        updateWholesaleCustomerSchema: customerSchema,
        batchUpdateWholesaleCustomersSchema: z.object({
            approved: z.array(z.number()).optional(),
            pending: z.array(z.number()).optional(),
        }),
    },

    // shipping status schema
    shippingStatusSchema: {
        shippingStatusSchema: z.object({
            enabled: z.boolean(),
            status_list: z.array(
                z.object({
                    id: z.string(),
                    value: z.string(),
                    must_use: z.string().optional(),
                    desc: z.string().optional(),
                }),
            ),
            providers: z.record(z.string(), z.string()),
        }),
        shipmentSchema: shipmentSchema,
        shipmentsSchema: z.array(shipmentSchema),
    },
};

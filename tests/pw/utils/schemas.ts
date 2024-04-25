import { z } from 'zod';

const verificationTypeSchema = z.object({
    id: z.string(),
    title: z.string(),
    disabled: z.boolean(),
});

const badgeEventSchema = z.object({
    id: z.string(),
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
    id: z.number(),
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
    id: z.number(),
    action: z.enum(['insert', 'update']),
});

// store settings
const socialSchema = z.object({
    fb: z.string().url(),
    youtube: z.string().url(),
    twitter: z.string().url(),
    linkedin: z.string().url(),
    pinterest: z.string().url(),
    instagram: z.string().url(),
    flickr: z.string().url(),
});

const paypalSchema = z.object({
    email: z.string().email(),
});

const bankSchema = z.object({
    ac_name: z.string(),
    ac_type: z.string(),
    ac_number: z.string(),
    bank_name: z.string(),
    bank_addr: z.string(),
    routing_number: z.string(),
    iban: z.string(),
    swift: z.string(),
});

const skrillSchema = z.object({
    email: z.string().email(),
});

const paymentSchema = z.object({
    paypal: paypalSchema,
    bank: bankSchema,
    stripe: z.boolean(),
    skrill: skrillSchema,
});

const addressSchema = z.object({
    street_1: z.string(),
    street_2: z.string(),
    city: z.string(),
    zip: z.string(),
    country: z.string(),
    state: z.string(),
});

const timeSchema = z.object({
    status: z.string(),
    opening_time: z.array(z.string()),
    closing_time: z.array(z.string()),
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
    vendor_min_max_product_cat: z.array(z.any()), // Adjust this based on the actual structure
    enable_vendor_min_max_amount: z.string(),
    min_amount_to_order: z.string(),
    max_amount_to_order: z.string(),
});

const categorySchema = z.object({
    term_id: z.number(),
    name: z.string(),
    slug: z.string(),
    term_group: z.number(),
    term_taxonomy_id: z.number(),
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
    phone: z.number(),
    store_name: z.number(),
    address: z.number(),
    location: z.number(),
    Bank: z.number(),
    paypal: z.number(),
    skrill: z.number(),
    fb: z.number(),
    youtube: z.number(),
    twitter: z.number(),
    linkedin: z.number(),
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

const linksSchema = z.object({
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
});

const storyCategorySchema = z.object({
    id: z.number(),
    count: z.number(),
    description: z.string(),
    link: z.string().url(),
    name: z.string(),
    slug: z.string(),
    taxonomy: z.string(),
    meta: z.array(z.any()), // Adjust this based on the actual structure
    _links: linksSchema,
});

const storeReviewSchema1 = z.object({
    id: z.number(),
    author: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string().email(),
        url: z.union([z.string().url(), z.literal('')]),
        avatar: z.string().url(),
    }),
    title: z.string(),
    content: z.string(),
    permalink: z.string().nullable(),
    product_id: z.number().nullable(),
    approved: z.boolean(),
    date: z.string(), // You might want to use z.date() if you want to enforce a date format
    rating: z.number(),
});

const storeReviewSchema = z.object({
    id: z.number(),
    title: z.string(),
    content: z.string(),
    status: z.string(),
    created_at: z.coerce.date(),
    customer: z.object({
        id: z.number(),
        first_name: z.string(),
        last_name: z.string(),
        email: z.string().email(),
        display_name: z.string(),
    }),
    vendor: z.object({
        id: z.number(),
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
    vendor_name: z.string(),
    customer_name: z.string(),
    vendor_id: z.string(),
    store_url: z.string().url(),
    ticket_date: z.string(),
    reading: z.string(),
    ancestors: z.array(z.any()), // Adjust this based on the actual structure
    page_template: z.string(),
    post_category: z.array(z.any()), // Adjust this based on the actual structure
    tags_input: z.array(z.any()), // Adjust this based on the actual structure
    _links: linksSchema,
});

const productQuestionSchema = z.object({
    id: z.number(),
    product_id: z.number(),
    question: z.string(),
    user_id: z.number(),
    read: z.number(),
    status: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
    answer: z.object({
        id: z.number(),
        question_id: z.number(),
        answer: z.string(),
        user_id: z.number(),
        created_at: z.string(),
        updated_at: z.string(),
        human_readable_created_at: z.string(),
        human_readable_updated_at: z.string(),
        user_display_name: z.string(),
    }),
    user_display_name: z.string(),
    human_readable_created_at: z.string(),
    human_readable_updated_at: z.string(),
    display_human_readable_created_at: z.boolean(),
    display_human_readable_updated_at: z.boolean(),
    product: z.object({
        id: z.number(),
        title: z.string(),
        image: z.string(),
    }),
    vendor: z.object({
        id: z.number(),
        name: z.string(),
        avatar: z.string(),
    }),
    _links: linksSchema,
});

const productQuestionAnswerSchema = z.object({
    id: z.number(),
    question_id: z.number(),
    answer: z.string(),
    user_id: z.number(),
    created_at: z.string(),
    updated_at: z.string(),
    human_readable_created_at: z.string(),
    human_readable_updated_at: z.string(),
    user_display_name: z.string(),
    _links: linksSchema,
});

export const schemas = {
    abuseReportsSchema: {
        abuseReportReasonsSchema: z.array(
            z.object({
                id: z.string(),
                value: z.string(),
            }),
        ),

        abuseReportSchema: z.object({
            id: z.number(),
            reason: z.string(),
            product: z.object({
                id: z.number(),
                title: z.string(),
                admin_url: z.string().url(),
            }),
            vendor: z.object({
                id: z.number(),
                name: z.string(),
                admin_url: z.string().url(),
            }),
            reported_by: z
                .object({
                    id: z.number(),
                    name: z.string(),
                    email: z.string().email(),
                    admin_url: z.string().url(),
                })
                .nullable(),
            description: z.string(),
            reported_at: z.coerce.date(),
        }),

        abuseReportsSchema: z.array(
            z.object({
                id: z.number(),
                reason: z.string(),
                product: z.object({
                    id: z.number(),
                    title: z.string(),
                    admin_url: z.string().url().nullable(),
                }),
                vendor: z.object({
                    id: z.number(),
                    name: z.string(),
                    admin_url: z.string().url().nullable(),
                }),
                reported_by: z.object({
                    id: z.number(),
                    name: z.string(),
                    email: z.string().email(),
                    admin_url: z.string().url().nullable(),
                }),
                description: z.string(),
                reported_at: z.coerce.date(),
            }),
        ),
    },

    admin: {
        //reportOverviewSchema
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

        // reportSummarySchema
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

        //adminDashboardFeedSchema
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

        //adminHelpSchema
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

        //adminNoticesSchema
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

        //changelogLiteSchema
        changelogLiteSchema: z.string(), //todo: update schema

        //changelogProSchema
        changelogProSchema: z.string(), //todo: update schema

        //adminPromoNoticeSchema
        adminPromoNoticeSchema: z.array(z.unknown()), //todo: update schema

        //adminLogsSchema
        adminLogsSchema: z.array(
            z.object({
                order_id: z.string(),
                vendor_id: z.string(),
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

        //adminExportLogsSchema
        adminExportLogsSchema: z.object({
            step: z.string().or(z.number()),
            percentage: z.number(),
            columns: z
                .object({
                    order_id: z.string(),
                    vendor_id: z.string(),
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
                .or(z.null()),
        }),
    },

    announcementsSchema: {
        announcementSchema: z.object({
            id: z.number(),
            notice_id: z.number(),
            vendor_id: z.number(),
            title: z.string(),
            content: z.string(),
            status: z.enum(['all', 'publish', 'pending', 'draft', 'future', 'trash']),
            read_status: z.enum(['read', 'unread', '']),
            date: z.string(),
            date_gmt: z.string(),
            human_readable_date: z.string(),
            announcement_sellers: z.array(
                z.object({
                    id: z.string(),
                    name: z.string(),
                    shop_name: z.string(),
                    email: z.string().email(),
                }),
            ),
            announcement_type: z.string(),
            _links: z.object({
                self: z.array(z.object({ href: z.string() })),
                collection: z.array(z.object({ href: z.string() })),
            }),
        }),

        m: z.coerce.date(),
        announcementsSchema: z.array(
            z.object({
                id: z.number(),
                notice_id: z.number(),
                vendor_id: z.number(),
                title: z.string(),
                content: z.string(),
                status: z.enum(['all', 'publish', 'pending', 'draft', 'future', 'trash']),
                read_status: z.enum(['read', 'unread', '']),
                date: z.coerce.date(),
                date_gmt: z.coerce.date().or(z.string()),
                human_readable_date: z.string(),
                announcement_sellers: z.array(
                    z.object({
                        id: z.string().or(z.number()),
                        name: z.string(),
                        shop_name: z.string(),
                        email: z.string().email(),
                    }),
                ),
                announcement_type: z.string(),
                _links: z.object({
                    self: z.array(z.object({ href: z.string() })),
                    collection: z.array(z.object({ href: z.string() })),
                }),
            }),
        ),

        batchUpdateAnnouncementsSchema: z.object({
            success: z.boolean(),
        }),

        announcementNoticeSchema: z.object({
            id: z.number(),
            notice_id: z.number(),
            vendor_id: z.number(),
            title: z.string(),
            content: z.string(),
            status: z.string(),
            read_status: z.string(),
            date: z.coerce.date(),
            date_gmt: z.coerce.date(),
            human_readable_date: z.string(),
            _links: z.object({
                self: z.array(z.object({ href: z.string() })),
                collection: z.array(z.object({ href: z.string() })),
            }),
        }),

        deleteAnnouncementNoticeSchema: z.object({
            success: z.boolean(),
        }),
    },

    attributesSchema: {
        attributeSchema: z.object({
            id: z.number(),
            name: z.string(),
            slug: z.string(),
            type: z.enum(['select']),
            order_by: z.enum(['menu_order', 'name', 'name_num', 'id']),
            has_archives: z.boolean(),
            _links: z.object({
                self: z.array(z.object({ href: z.string().url() })),
                collection: z.array(z.object({ href: z.string().url() })),
            }),
        }),

        attributesSchema: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
                type: z.enum(['select']),
                order_by: z.enum(['menu_order', 'name', 'name_num', 'id']),
                has_archives: z.boolean(),
                _links: z.object({
                    self: z.array(z.object({ href: z.string().url() })),
                    collection: z.array(z.object({ href: z.string().url() })),
                }),
            }),
        ),

        batchUpdateAttributesSchema: z.object({
            create: z
                .array(
                    z.object({
                        id: z.number(),
                        name: z.string(),
                        slug: z.string(),
                        type: z.enum(['select']),
                        order_by: z.enum(['menu_order', 'name', 'name_num', 'id']),
                        has_archives: z.boolean(),
                        _links: z.object({
                            self: z.array(z.object({ href: z.string().url() })),
                            collection: z.array(z.object({ href: z.string().url() })),
                        }),
                    }),
                )
                .optional(),
            update: z
                .array(
                    z.object({
                        id: z.number(),
                        name: z.string(),
                        slug: z.string(),
                        type: z.enum(['select']),
                        order_by: z.enum(['menu_order', 'name', 'name_num', 'id']),
                        has_archives: z.boolean(),
                        _links: z.object({
                            self: z.array(z.object({ href: z.string().url() })),
                            collection: z.array(z.object({ href: z.string().url() })),
                        }),
                    }),
                )
                .optional(),
            delete: z
                .array(
                    z.object({
                        id: z.number(),
                        name: z.string(),
                        slug: z.string(),
                        type: z.enum(['select']),
                        order_by: z.enum(['menu_order', 'name', 'name_num', 'id']),
                        has_archives: z.boolean(),
                        _links: z.object({
                            self: z.array(z.object({ href: z.string().url() })),
                            collection: z.array(z.object({ href: z.string().url() })),
                        }),
                    }),
                )
                .optional(),
        }),

        setDefaultAttributeSchema: z.boolean(),
        updateProductAttributeSchema: z.boolean(),
    },

    attributeTermsSchema: {
        attributeTermSchema: z.object({
            id: z.number(),
            name: z.string(),
            slug: z.string(),
            description: z.string(),
            menu_order: z.number(),
            count: z.number(),
            _links: z.object({
                self: z.array(z.object({ href: z.string() })),
                collection: z.array(z.object({ href: z.string() })),
            }),
        }),

        attributeTermsSchema: z.array(
            z.object({
                id: z.number(),
                name: z.string(),
                slug: z.string(),
                description: z.string(),
                menu_order: z.number(),
                count: z.number(),
                _links: z.object({
                    self: z.array(z.object({ href: z.string() })),
                    collection: z.array(z.object({ href: z.string() })),
                }),
            }),
        ),

        batchUpdateAttributesSchema: z.object({
            update: z.array(
                z.object({
                    id: z.number(),
                    name: z.string(),
                    slug: z.string(),
                    description: z.string(),
                    menu_order: z.number(),
                    count: z.number(),
                    _links: z.object({
                        self: z.array(z.object({ href: z.string() })),
                        collection: z.array(z.object({ href: z.string() })),
                    }),
                }),
            ),
        }),
    },

    couponsSchema: {
        couponSchema: z.object({
            id: z.number(),
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
            meta_data: z.array(
                z.object({
                    id: z.number(),
                    key: z.string(),
                    value: z.string(),
                }),
            ),
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
        }),

        couponsSchema: z.array(
            z.object({
                id: z.number(),
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
                meta_data: z.array(
                    z.object({
                        id: z.number(),
                        key: z.string(),
                        value: z.string(),
                    }),
                ),
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
            }),
        ),
    },

    customersSchema: {
        customerSchema: z.object({
            id: z.number(),
            date_created: z.string(),
            date_created_gmt: z.string(),
            date_modified: z.string(),
            date_modified_gmt: z.string(),
            email: z.string().email(),
            first_name: z.string(),
            last_name: z.string(),
            role: z.string(),
            username: z.string(),
            billing: z
                .object({
                    first_name: z.string(),
                    last_name: z.string(),
                    company: z.string(),
                    address_1: z.string(),
                    address_2: z.string(),
                    city: z.string(),
                    postcode: z.string(),
                    country: z.string(),
                    state: z.string(),
                    email: z.union([z.string().email(), z.literal('')]),
                    phone: z.string(),
                })
                .optional(),
            shipping: z
                .object({
                    first_name: z.string(),
                    last_name: z.string(),
                    company: z.string(),
                    address_1: z.string(),
                    address_2: z.string(),
                    city: z.string(),
                    postcode: z.string(),
                    country: z.string(),
                    state: z.string(),
                    phone: z.string(),
                })
                .optional(),
            is_paying_customer: z.boolean(),
            avatar_url: z.string().url(),
            meta_data: z.array(
                z.object({
                    id: z.number(),
                    key: z.string(),
                    value: z.unknown(),
                }),
            ),
            orders_count: z.number(),
            total_spent: z.string(),
            _links: z.object({
                self: z.array(z.object({ href: z.string().url() })),
                collection: z.array(z.object({ href: z.string().url() })),
            }),
        }),

        customersSchema: z.array(
            z.object({
                id: z.number(),
                date_created: z.string(),
                date_created_gmt: z.string(),
                date_modified: z.string(),
                date_modified_gmt: z.string(),
                email: z.string().email(),
                first_name: z.string(),
                last_name: z.string(),
                role: z.string(),
                username: z.string(),
                billing: z
                    .object({
                        first_name: z.string(),
                        last_name: z.string(),
                        company: z.string(),
                        address_1: z.string(),
                        address_2: z.string(),
                        city: z.string(),
                        postcode: z.string(),
                        country: z.string(),
                        state: z.string(),
                        email: z.union([z.string().email(), z.literal('')]),
                        phone: z.string(),
                    })
                    .optional(),
                shipping: z
                    .object({
                        first_name: z.string(),
                        last_name: z.string(),
                        company: z.string(),
                        address_1: z.string(),
                        address_2: z.string(),
                        city: z.string(),
                        postcode: z.string(),
                        country: z.string(),
                        state: z.string(),
                        phone: z.string(),
                    })
                    .optional(),
                is_paying_customer: z.boolean(),
                avatar_url: z.string().url(),
                meta_data: z.array(
                    z.object({
                        id: z.number(),
                        key: z.string(),
                        value: z.unknown(),
                    }),
                ),
                orders_count: z.number(),
                total_spent: z.string(),
                _links: z.object({
                    self: z.array(z.object({ href: z.string().url() })),
                    collection: z.array(z.object({ href: z.string().url() })),
                }),
            }),
        ),

        batchUpdateCustomersSchema: z.object({
            create: z
                .array(
                    z.object({
                        id: z.number(),
                        date_created: z.string(),
                        date_created_gmt: z.string(),
                        date_modified: z.string(),
                        date_modified_gmt: z.string(),
                        email: z.string().email(),
                        first_name: z.string(),
                        last_name: z.string(),
                        role: z.string(),
                        username: z.string(),
                        billing: z
                            .object({
                                first_name: z.string(),
                                last_name: z.string(),
                                company: z.string(),
                                address_1: z.string(),
                                address_2: z.string(),
                                city: z.string(),
                                postcode: z.string(),
                                country: z.string(),
                                state: z.string(),
                                email: z.union([z.string().email(), z.literal('')]),
                                phone: z.string(),
                            })
                            .optional(),
                        shipping: z
                            .object({
                                first_name: z.string(),
                                last_name: z.string(),
                                company: z.string(),
                                address_1: z.string(),
                                address_2: z.string(),
                                city: z.string(),
                                postcode: z.string(),
                                country: z.string(),
                                state: z.string(),
                                phone: z.string(),
                            })
                            .optional(),
                        is_paying_customer: z.boolean(),
                        avatar_url: z.string().url(),
                        meta_data: z.array(
                            z.object({
                                id: z.number(),
                                key: z.string(),
                                value: z.unknown(),
                            }),
                        ),
                        orders_count: z.number(),
                        total_spent: z.string(),
                        _links: z.object({
                            self: z.array(z.object({ href: z.string().url() })),
                            collection: z.array(z.object({ href: z.string().url() })),
                        }),
                    }),
                )
                .optional(),
            update: z
                .array(
                    z.object({
                        id: z.number(),
                        date_created: z.string(),
                        date_created_gmt: z.string(),
                        date_modified: z.string(),
                        date_modified_gmt: z.string(),
                        email: z.string().email(),
                        first_name: z.string(),
                        last_name: z.string(),
                        role: z.string(),
                        username: z.string(),
                        billing: z
                            .object({
                                first_name: z.string(),
                                last_name: z.string(),
                                company: z.string(),
                                address_1: z.string(),
                                address_2: z.string(),
                                city: z.string(),
                                postcode: z.string(),
                                country: z.string(),
                                state: z.string(),
                                email: z.union([z.string().email(), z.literal('')]),
                                phone: z.string(),
                            })
                            .optional(),
                        shipping: z
                            .object({
                                first_name: z.string(),
                                last_name: z.string(),
                                company: z.string(),
                                address_1: z.string(),
                                address_2: z.string(),
                                city: z.string(),
                                postcode: z.string(),
                                country: z.string(),
                                state: z.string(),
                                phone: z.string(),
                            })
                            .optional(),
                        is_paying_customer: z.boolean(),
                        avatar_url: z.string().url(),
                        meta_data: z.array(
                            z.object({
                                id: z.number(),
                                key: z.string(),
                                value: z.unknown(),
                            }),
                        ),
                        orders_count: z.number(),
                        total_spent: z.string(),
                        _links: z.object({
                            self: z.array(z.object({ href: z.string().url() })),
                            collection: z.array(z.object({ href: z.string().url() })),
                        }),
                    }),
                )
                .optional(),
            delete: z
                .array(
                    z.object({
                        id: z.number(),
                        date_created: z.string(),
                        date_created_gmt: z.string(),
                        date_modified: z.string(),
                        date_modified_gmt: z.string(),
                        email: z.string().email(),
                        first_name: z.string(),
                        last_name: z.string(),
                        role: z.string(),
                        username: z.string(),
                        billing: z
                            .object({
                                first_name: z.string(),
                                last_name: z.string(),
                                company: z.string(),
                                address_1: z.string(),
                                address_2: z.string(),
                                city: z.string(),
                                postcode: z.string(),
                                country: z.string(),
                                state: z.string(),
                                email: z.union([z.string().email(), z.literal('')]),
                                phone: z.string(),
                            })
                            .optional(),
                        shipping: z
                            .object({
                                first_name: z.string(),
                                last_name: z.string(),
                                company: z.string(),
                                address_1: z.string(),
                                address_2: z.string(),
                                city: z.string(),
                                postcode: z.string(),
                                country: z.string(),
                                state: z.string(),
                                phone: z.string(),
                            })
                            .optional(),
                        is_paying_customer: z.boolean(),
                        avatar_url: z.string().url(),
                        meta_data: z.array(
                            z.object({
                                id: z.number(),
                                key: z.string(),
                                value: z.unknown(),
                            }),
                        ),
                        orders_count: z.number(),
                        total_spent: z.string(),
                        _links: z.object({
                            self: z.array(z.object({ href: z.string().url() })),
                            collection: z.array(z.object({ href: z.string().url() })),
                        }),
                    }),
                )
                .optional(),
        }),
    },

    dummyDataSchema: {
        dummyDataStatusSchema: z.object({
            import_status: z.enum(['yes', 'no']),
        }),
        importDummyDataSchema: z.object({
            result: z.object({
                imported: z.array(z.number()),
                failed: z.array(z.unknown()),
                updated: z.array(z.unknown()),
                skipped: z.array(z.unknown()),
            }),
            vendor_index: z.number(),
        }),
        clearDummyDataClearSchema: z.object({
            message: z.string(),
        }),
    },

    followStoresSchema: {
        followStatusSchema: z.object({
            status: z.boolean(),
        }),
        followUnfollowSchema: z.object({
            status: z.enum(['following', 'unfollowed']),
        }),
        followersSchema: z.array(
            z.object({
                id: z.number(),
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

    modulesSchema: z.array(
        z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            thumbnail: z.string().url(),
            plan: z.array(z.string()),
            active: z.boolean(),
            available: z.boolean(),
            doc_id: z.union([z.string(), z.number()]).nullable(),
            doc_link: z.string().nullable(),
            mod_link: z.string().nullable(),
            pre_requisites: z.string().nullable(),
            categories: z.array(z.string()).nullable(),
            video_id: z.string().nullable(),
        }),
    ),

    orderDownloadsSchema: {}, //TODO:

    orderNotesSchema: {}, //TODO:

    ordersSchema: {}, //TODO:

    productAdvertisementsSchema: {}, //TODO:

    productBlocksSchema: {}, //TODO:

    productDuplicateSchema: {}, //TODO:

    productFilterSchema: {}, //TODO:

    productReviewsSchema: {}, //TODO:

    productsSchema: {}, //TODO:

    productVariationsSchema: {}, //TODO:

    quoteRequestsSchema: {}, //TODO:

    quoteRulesSchema: {
        quoteRuleSchema: z.object({
            id: z.string(),
            rule_name: z.string(),
            selected_user_role: z.array(z.string()),
            category_ids: z.array(z.string()), //TODO: need to update
            product_categories: z.array(z.string()), //TODO: need to update
            product_ids: z.string(),
            hide_price: z.string(),
            hide_cart_button: z.string(),
            button_text: z.string(),
            apply_on_all_product: z.string(),
            rule_priority: z.string(),
            status: z.string(),
            created_at: z.string(),
            _links: z.object({
                self: z.array(z.object({ href: z.string() })),
                collection: z.array(z.object({ href: z.string() })),
            }),
        }),
        quoteRulesSchema: z.array(
            z.object({
                id: z.string(),
                rule_name: z.string(),
                selected_user_role: z.array(z.string()),
                category_ids: z.array(z.string()), //TODO: need to update
                product_categories: z.array(z.string()), //TODO: need to update
                product_ids: z.string(),
                hide_price: z.string(),
                hide_cart_button: z.string(),
                button_text: z.string(),
                apply_on_all_product: z.string(),
                rule_priority: z.string(),
                status: z.string(),
                created_at: z.string(),
                _links: z.object({
                    self: z.array(z.object({ href: z.string() })),
                    collection: z.array(z.object({ href: z.string() })),
                }),
            }),
        ),
    },

    rankMathSchema: {}, //TODO:

    refundsSchema: {}, //TODO:

    reportsSchema: {}, //TODO:

    reverseWithdrawalSchema: {}, //TODO:

    rolesSchema: {}, //TODO:

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
            icon: z.string(),
            gravatar: z.number(),
            enable_tnc: z.string(),
            store_tnc: z.string(),
            show_min_order_discount: z.string(),
            store_seo: z.array(z.any()), // Adjust this based on the actual structure
            dokan_store_time_enabled: z.string(),
            dokan_store_open_notice: z.string(),
            dokan_store_close_notice: z.string(),
            dokan_store_time: storeTimeSchema,
            sale_only_here: z.boolean(),
            company_name: z.string(),
            vat_number: z.string(),
            company_id_number: z.string(),
            bank_name: z.string(),
            bank_iban: z.string(),
            profile_completion: profileCompletionSchema,
            find_address: z.string(),
            catalog_mode: catalogModeSchema,
            order_min_max: orderMinMaxSchema,
            categories: z.array(categorySchema),
            vendor_biography: z.string(),
            show_support_btn_product: z.string(),
            support_btn_name: z.string(),
            show_support_btn: z.string(),
            setting_go_vacation: z.string(),
            settings_closing_style: z.string(),
            setting_vacation_message: z.string(),
            seller_vacation_schedules: z.array(z.any()), // Adjust this based on the actual structure
            vendor_store_location_pickup: vendorStoreLocationPickupSchema,
            bank_payment_required_fields: bankPaymentRequiredFieldsSchema,
            active_payment_methods: activePaymentMethodsSchema,
        }),

        setStoreSchema: z.object({
            id: z.number(),
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
            banner_id: z.number(),
            gravatar: z.string(),
            gravatar_id: z.number(),
            shop_url: z.string().url(),
            toc_enabled: z.boolean(),
            store_toc: z.string(),
            featured: z.boolean(),
            rating: ratingSchema,
            enabled: z.boolean(),
            registered: z.string(),
            payment: paymentSchema,
            trusted: z.boolean(),
            store_open_close: timeSchema,
            sale_only_here: z.boolean(),
            company_name: z.string(),
            vat_number: z.string(),
            company_id_number: z.string(),
            bank_name: z.string(),
            bank_iban: z.string(),
            categories: z.array(categorySchema),
            _links: linksSchema,
        }),
    },

    settingsGroupSchema: {}, //TODO:

    spmvSchema: {
        spmvSettingsSchema: z.object({
            success: z.boolean(),
        }),

        spmvProductsSchema: z.array(
            z.object({
                average_rating: z.string(),
                title: z.string(),
                image: z.string(),
                permalink: z.string(),
                review_count: z.number(),
                type: z.string(),
                id: z.number(),
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

    storeCategoriesSchema: {
        storyCategorySchema: storyCategorySchema,
        storeCategoriesSchema: z.array(storyCategorySchema),
        deleteStoryCategorySchema: z.object({
            deleted: z.boolean(),
            previous: storyCategorySchema.omit({ _links: true }),
        }),
    },

    storeReviewsSchema: {
        storeReviewSchema1: storeReviewSchema1,
        storeReviewsSchema1: z.array(storeReviewSchema1),
        storeReviewSchema: storeReviewSchema,
        storeReviewsSchema: z.array(storeReviewSchema),
        batchUpdateBadgesSchema: z.boolean(),
    },

    storesSchema: {}, //TODO:

    supportTicketsSchema: {
        supportTicketCustomerSchema: z.array(
            z.object({
                ID: z.string(),
                display_name: z.string(),
            }),
        ),
        supportTicketSchema: supportTicketSchema,
        supportTicketsSchema: z.array(supportTicketSchema),

        batchUpdateSupportTicketSchema: z.object({
            closed: z.array(z.number()),
        }),
    },

    vendorDashboardSchema: {}, //TODO:

    vendorStaffSchema: {
        staff: z.object({
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
            capabilities: z.object({
                read: z.boolean(),
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
                dokan_view_sales_overview: z.boolean(),
                dokan_view_sales_report_chart: z.boolean(),
                dokan_view_announcement: z.boolean(),
                dokan_view_order_report: z.boolean(),
                dokan_view_review_reports: z.boolean(),
                dokan_view_product_status_report: z.boolean(),
                dokan_add_product: z.boolean(),
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
            }),
        }),

        allStaffCapabilities: z.object({
            all: z.object({
                overview: z.object({
                    dokan_view_sales_overview: z.string(),
                    dokan_view_sales_report_chart: z.string(),
                    dokan_view_announcement: z.string(),
                    dokan_view_order_report: z.string(),
                    dokan_view_review_reports: z.string(),
                    dokan_view_product_status_report: z.string(),
                }),
                report: z.object({
                    dokan_view_overview_report: z.string(),
                    dokan_view_daily_sale_report: z.string(),
                    dokan_view_top_selling_report: z.string(),
                    dokan_view_top_earning_report: z.string(),
                    dokan_view_statement_report: z.string(),
                }),
                order: z.object({
                    dokan_view_order: z.string(),
                    dokan_manage_order: z.string(),
                    dokan_manage_order_note: z.string(),
                    dokan_manage_refund: z.string(),
                    dokan_export_order: z.string(),
                }),
                coupon: z.object({
                    dokan_add_coupon: z.string(),
                    dokan_edit_coupon: z.string(),
                    dokan_delete_coupon: z.string(),
                }),
                review: z.object({
                    dokan_view_reviews: z.string(),
                    dokan_manage_reviews: z.string(),
                }),
                withdraw: z.object({
                    dokan_manage_withdraw: z.string(),
                }),
                product: z.object({
                    dokan_add_product: z.string(),
                    dokan_edit_product: z.string(),
                    dokan_delete_product: z.string(),
                    dokan_view_product: z.string(),
                    dokan_duplicate_product: z.string(),
                    dokan_import_product: z.string(),
                    dokan_export_product: z.string(),
                }),
                menu: z.object({
                    dokan_view_overview_menu: z.string(),
                    dokan_view_product_menu: z.string(),
                    dokan_view_order_menu: z.string(),
                    dokan_view_coupon_menu: z.string(),
                    dokan_view_report_menu: z.string(),
                    dokan_view_review_menu: z.string(),
                    dokan_view_withdraw_menu: z.string(),
                    dokan_view_store_settings_menu: z.string(),
                    dokan_view_store_payment_menu: z.string(),
                    dokan_view_store_shipping_menu: z.string(),
                    dokan_view_store_social_menu: z.string(),
                    dokan_view_store_seo_menu: z.string(),
                    dokan_view_booking_menu: z.string(),
                    dokan_view_tools_menu: z.string(),
                    dokan_view_store_verification_menu: z.string(),
                    dokan_view_auction_menu: z.string(),
                }),
                booking: z.object({
                    dokan_manage_booking_products: z.string(),
                    dokan_manage_booking_calendar: z.string(),
                    dokan_manage_bookings: z.string(),
                    dokan_manage_booking_resource: z.string(),
                    dokan_add_booking_product: z.string(),
                    dokan_edit_booking_product: z.string(),
                    dokan_delete_booking_product: z.string(),
                }),
                store_support: z.object({
                    dokan_manage_support_tickets: z.string(),
                }),
                auction: z.object({
                    dokan_add_auction_product: z.string(),
                    dokan_edit_auction_product: z.string(),
                    dokan_delete_auction_product: z.string(),
                }),
            }),
            default: z.array(z.string()),
        }),

        staffCapabilities: z.object({
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
            capabilities: z
                .object({
                    read: z.boolean(),
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
                    dokan_view_sales_overview: z.boolean(),
                    dokan_view_sales_report_chart: z.boolean(),
                    dokan_view_announcement: z.boolean(),
                    dokan_view_order_report: z.boolean(),
                    dokan_view_review_reports: z.boolean(),
                    dokan_view_product_status_report: z.boolean(),
                    dokan_add_product: z.boolean(),
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
                })
                .optional(),
        }),

        updateCapabilities: z.object({
            dokan_view_sales_overview: z.boolean(),
            dokan_view_sales_report_chart: z.boolean(),
            dokan_view_announcement: z.boolean(),
            dokan_view_order_report: z.boolean(),
            dokan_view_review_reports: z.boolean(),
            dokan_view_product_status_report: z.boolean(),
            dokan_add_product: z.boolean(),
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
            read: z.boolean(),
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
        }),
    },

    wholesaleCustomersSchema: {
        wholesaleCustomersSchema: z.object({
            id: z.number(),
            first_name: z.string(),
            last_name: z.string(),
            username: z.string(),
            name: z.string(),
            email: z.string(),
            avatar: z.string(),
            url: z.string(),
            role: z.string(),
            registered_date: z.string(),
            wholesale_status: z.string(),
            _links: z.object({
                self: z.array(
                    z.object({
                        href: z.string(),
                    }),
                ),
                collection: z.array(
                    z.object({
                        href: z.string(),
                    }),
                ),
            }),
        }),
    }, //TODO:

    withdrawsSchema: {
        // getBalanceDetailsSchema
        getBalanceDetailsSchema: z.object({
            current_balance: z.number(),
            withdraw_limit: z.string(),
            withdraw_threshold: z.number(),
            withdraw_methods: z.enum(['paypal', 'bank']), //TODO: add more
            last_withdraw: z
                .array(
                    z.object({
                        id: z.string(),
                        user_id: z.string(),
                        amount: z.string(),
                        date: z.string(),
                        status: z.string(),
                        method: z.string(),
                        note: z.string(),
                        details: z.string(),
                        ip: z.string(),
                    }),
                )
                .optional(),
        }),

        allWithdrawsSchema: z.object({
            id: z.string(),
            user: z.object({
                id: z.string(),
                store_name: z.string(),
                first_name: z.string(),
                last_name: z.string(),
                email: z.string(),
                social: z.record(z.string()), // assuming social is a record of strings
                phone: z.string(),
                show_email: z.boolean(),
                address: z.object({
                    street_1: z.string(),
                    street_2: z.string(),
                    city: z.string(),
                    zip: z.string(),
                    country: z.string(),
                    state: z.string(),
                }),
                location: z.string(),
                banner: z.string(),
                banner_id: z.string(),
                gravatar: z.string(),
                gravatar_id: z.string(),
                shop_url: z.string(),
                toc_enabled: z.boolean(),
                store_toc: z.string(),
                featured: z.boolean(),
                rating: z.object({
                    rating: z.string(),
                    count: z.number(),
                }),
                enabled: z.boolean(),
                registered: z.string(),
                payment: z.object({
                    bank: z
                        .object({
                            ac_name: z.string(),
                            ac_type: z.string(),
                            ac_number: z.string(),
                            bank_name: z.string(),
                            bank_addr: z.string(),
                            routing_number: z.string(),
                            iban: z.string(),
                            swift: z.string(),
                            declaration: z.string(),
                        })
                        .nullable(), // Assuming bank is optional
                    paypal: z
                        .object({
                            email: z.string(),
                        })
                        .nullable(), // Assuming paypal is optional
                    stripe_express: z.boolean(),
                }),
                trusted: z.boolean(),
                store_open_close: z.object({
                    enabled: z.boolean(),
                    time: z.record(
                        z.object({
                            status: z.string(),
                            opening_time: z.array(z.string()),
                            closing_time: z.array(z.string()),
                        }),
                    ),
                    open_notice: z.string(),
                    close_notice: z.string(),
                }),
                sale_only_here: z.boolean(),
                company_name: z.string(),
                vat_number: z.string(),
                company_id_number: z.string(),
                bank_name: z.string(),
                bank_iban: z.string(),
                categories: z.array(
                    z.object({
                        term_id: z.number(),
                        name: z.string(),
                        slug: z.string(),
                        term_group: z.number(),
                        term_taxonomy_id: z.number(),
                        taxonomy: z.string(),
                        description: z.string(),
                        parent: z.number(),
                        count: z.number(),
                        filter: z.string(),
                    }),
                ),
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
            _links: z.object({
                self: z.array(z.object({ href: z.string().url() })),
                collection: z.array(z.object({ href: z.string().url() })),
            }),

            WithdrawPaymentMethods: z.array(
                z.object({
                    id: z.string(),
                    title: z.string(),
                }),
            ),

            batchUpdateWithdraw: z.object({
                success: z.array(z.unknown()),
                failed: z.object({
                    approved: z.array(z.number()),
                }),
            }),
        }),
    }, //TODO:

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
            active_methods: z.array(z.enum(['PayPal', 'Bank Transfer', 'Skrill', 'bkash'])), //todo: 'bkash' shouldn't be in the enum
            method_additional_info: z.array(z.enum(['paypal', 'bank', 'skrill', 'dokan_custom'])),
            minimum_amount_needed: z.number(),
            is_schedule_selected: z.boolean(),
        }),

        updateWithdrawDisbursementSettingsSchema: z.object({
            success: z.boolean(),
        }),
    }, //TODO:

    productQaSchema: {
        productQuestionSchema: productQuestionSchema,
        productQuestionsSchema: z.array(productQuestionSchema),

        batchUpdateProductQuestionsSchema: z.object({
            message: z.string(),
        }),

        productQuestionAnswerSchema: productQuestionAnswerSchema,
        productQuestionAnswersSchema: z.array(productQuestionAnswerSchema),
    },
};

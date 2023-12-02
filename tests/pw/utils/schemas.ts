import { z } from 'zod';

export const schemas = {
    abuseReportsSchema: {
        abuseReportReasonsSchema: z.array(
            z.object({
                id: z.string(),
                value: z.string(),
            }),
        ),

        abuseReportSchema: z.array(
            z.object({
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
                reported_by: z.object({
                    id: z.number(),
                    name: z.string(),
                    email: z.string().email(),
                    admin_url: z.string().url(),
                }),
                description: z.string(),
                reported_at: z.string(), //todo add date format
            }),
        ),

        // abuseReportsSchema: z.array(schemas.abuseReportsSchema.abuseReportsSchema),
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
                vendor_earning: z.string(),
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
            step: z.number(),
            percentage: z.number(),
            columns: z.object({
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
            }),
        }),
    },

    announcementsSchema: {
        announcementSchema: z.object({
            id: z.number(),
            title: z.string(),
            content: z.string(),
            status: z.string(),
            created_at: z.string(),
            sender_type: z.string(),
            sender_ids: z.array(
                z.object({
                    id: z.number(),
                    name: z.string(),
                    shop_name: z.string(),
                }),
            ),
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
    },

    attributesSchema: {}, //TODO:
    attributeTeermsSchema: {}, //TODO:
    couponsSchema: {
        //todo: this schema might be sufficient for all
        couponSchema: z.object({
            id: z.number(),
            code: z.string(),
            amount: z.string(),
            date_created: z.string(), //todo add date format
            date_created_gmt: z.string(),
            date_modified: z.string(),
            date_modified_gmt: z.string(),
            discount_type: z.string(),
            description: z.string(),
            date_expires: z.nullable(z.string()),
            date_expires_gmt: z.nullable(z.string()),
            usage_count: z.number(),
            individual_use: z.boolean(),
            product_ids: z.array(z.string()),
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
    },
    customersSchema: {}, //TODO:

    dokanEndpointsSchema: {}, //TODO:

    dummyDataSchema: {}, //TODO:

    followStoresSchema: {
        followstatusSchema: z.object({
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

    modulesSchema: {
        //todo: this schema might be sufficient for all
        modulesSchema: z.object({
            id: z.string(),
            name: z.string(),
            description: z.string(),
            thumbnail: z.string().url(),
            plan: z.enum(['starter', 'liquidweb', 'professional', 'business', 'enterprise']),
            active: z.boolean(),
            available: z.boolean(),
            doc_id: z.string().nullable(),
            doc_link: z.string().nullable(),
            mod_link: z.string().nullable(),
            pre_requisites: z.string().nullable(),
            categories: z.array(z.string()).nullable(),
            video_id: z.string().nullable(),
        }),
    },
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

    quoteRulesSchema: {}, //TODO:

    rankMathSchema: {}, //TODO:

    refundsSchema: {}, //TODO:

    reportsSchema: {}, //TODO:

    reverseWithdrawalSchema: {}, //TODO:

    rolesSchema: {}, //TODO:

    sellerBadgeSchema: {}, //TODO:

    settingsSchema: {}, //TODO:

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

    storeCategoriesSchema: {}, //TODO:

    storeReviewsSchema: {}, //TODO:

    storesSchema: {}, //TODO:

    supportTicketsSchema: {}, //TODO:

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
            active_methods: z.array(z.enum(['PayPal', 'Bank Transfer', 'Skrill', 'bkash'])),
            method_additional_info: z.array(z.enum(['paypal', 'bank', 'skrill', 'dokan_custom'])),
            minimum_amount_needed: z.number(),
            is_schedule_selected: z.boolean(),
        }),

        updateWithdrawDisbursementSettingsSchema: z.object({
            success: z.boolean(),
        }),
    }, //TODO:
};

export type VerificationRequest = {
    id: number;
    vendor_id: number;
    method_id: number;
    status: string;
    status_title: string;
    documents: string[];
    note: string;
    additional_info: any[];
    checked_by: number;
    created_at: string;
    updated_at: string;
    vendor: {
        store_name: string;
        social: Record< string, string >;
        payment: {
            paypal: { email: string };
            bank: {
                ac_name: string;
                ac_type: string;
                ac_number: string;
                bank_name: string;
                bank_addr: string;
                routing_number: string;
                iban: string;
                swift: string;
            };
            dokan_custom: { value: string };
            dokan_paypal_marketplace: { email: string };
        };
        phone: string;
        show_email: string;
        address: {
            street_1: string;
            street_2: string;
            city: string;
            zip: string;
            country: string;
            state: string;
            location_name: string;
        };
        location: string;
        banner: number;
        icon: string;
        gravatar: number;
        enable_tnc: string;
        store_tnc: string;
        show_min_order_discount: string;
        store_seo: any[];
        dokan_store_time_enabled: string;
        dokan_store_open_notice: string;
        dokan_store_close_notice: string;
        dokan_store_time: {
            [ day: string ]: {
                status: string;
                opening_time: any[];
                closing_time: any[];
            };
        };
        sale_only_here: boolean;
        company_name: string;
        vat_number: string;
        company_id_number: string;
        bank_name: string;
        bank_iban: string;
        profile_completion: {
            closed_by_user: boolean;
            phone: number;
            banner: number;
            store_name: number;
            address: number;
            Bank: number;
            paypal: number;
            next_todo: string;
            progress: number;
            progress_vals: {
                banner_val: number;
                profile_picture_val: number;
                store_name_val: number;
                address_val: number;
                phone_val: number;
                payment_method_val: number;
                social_val: {
                    fb: number;
                    twitter: number;
                    youtube: number;
                    linkedin: number;
                };
            };
        };
        find_address: string;
        order_min_max: {
            min_amount_to_order: string;
            max_amount_to_order: string;
        };
        vendor_biography: string;
        show_support_btn_product: string;
        support_btn_name: string;
        show_support_btn: string;
        setting_go_vacation: string;
        settings_closing_style: string;
        setting_vacation_message: string;
        seller_vacation_schedules: any[];
        enable_manual_order: boolean;
        current_subscription: {
            name: string;
            label: string;
        };
        assigned_subscription: string;
        assigned_subscription_info: {
            subscription_id: string;
            has_subscription: boolean;
            expiry_date: string;
            published_products: string;
            remaining_products: number;
            recurring: boolean;
            start_date: string;
        };
        vendor_store_location_pickup: {
            multiple_store_location: string;
            default_location_name: string;
            enable_store_pickup_location: string;
        };
        store_locations: any[];
        setting_minimum_order_amount: string;
        setting_order_percentage: string;
    };
    method: {
        id: number;
        title: string;
        help_text: string;
        status: boolean;
        required: boolean;
        kind: string;
        created_at: string;
        updated_at: string;
    };
    document_urls: {
        [ key: string ]: {
            url: string;
            title: string;
        };
    };
    _links: {
        self: {
            href: string;
            targetHints?: {
                allow: string[];
            };
        }[];
        collection: {
            href: string;
        }[];
    };
};

export type VerificationRequestList = VerificationRequest[];

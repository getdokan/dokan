export type StoreCategory = {
    id: number;
    name: string;
    slug: string;
};

export type PaymentDetails = {
    paypal?: {
        email: string;
    };
    bank?: {
        ac_name: string;
        ac_number: string;
        bank_name: string;
        bank_addr: string;
        routing_number: string;
        iban: string;
        swift: string;
        ac_type: string;
        declaration: string;
    };
    skrill?: {
        email: string;
    };
    dokan_custom?: {
        withdraw_method_name: string;
        withdraw_method_type: string;
        value: string;
    };
    dokan_razorpay?: boolean;
    stripe_express?: boolean;
    'dokan-moip-connect'?: boolean;
};

export type VendorSocial = {
    fb?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    pinterest?: string;
    instagram?: string;
    flickr?: string;
    threads?: string;
};

export type Vendor = {
    id: number;
    store_name: string;
    first_name: string;
    last_name: string;
    email?: string;
    social?: VendorSocial;
    phone?: string;
    show_email?: boolean;
    address?: {
        street_1: string;
        street_2: string;
        city: string;
        zip: string;
        country: string;
        state: string;
        location_name: string;
    };
    location?: string;
    banner?: string;
    banner_id?: number;
    gravatar?: string;
    gravatar_id?: number;
    shop_url: string;
    toc_enabled?: boolean;
    store_toc?: string;
    featured: boolean;
    rating?: {
        rating: string;
        count: number;
    };
    enabled: boolean;
    registered: string;
    payment: PaymentDetails;
    trusted: boolean;
    reset_sub_category?: boolean;
    store_open_close?: {
        enabled: boolean;
        time: {
            monday: {
                status: string;
                opening_time: string[];
                closing_time: string[];
            };
            tuesday: {
                status: string;
                opening_time: string[];
                closing_time: string[];
            };
            wednesday: {
                status: string;
                opening_time: string[];
                closing_time: string[];
            };
            thursday: {
                status: string;
                opening_time: string[];
                closing_time: string[];
            };
            friday: {
                status: string;
                opening_time: string[];
                closing_time: string[];
            };
            saturday: {
                status: string;
                opening_time: string[];
                closing_time: string[];
            };
            sunday: {
                status: string;
                opening_time: string[];
                closing_time: string[];
            };
        };
        open_notice: string;
        close_notice: string;
    };
    sale_only_here?: boolean;
    company_name?: string;
    vat_number?: string;
    company_id_number?: string;
    bank_name?: string;
    bank_iban?: string;
    categories?: StoreCategory[];
    enable_manual_order?: boolean;
    admin_category_commission?: any[];
    admin_commission?: string;
    admin_additional_fee?: string;
    admin_commission_type?: string;
    vendor_biography?: string;
    _links?: {
        self: {
            href: string;
            targetHints: {
                allow: string[];
            };
        }[];
        collection: {
            href: string;
        }[];
    };
};

export type VendorQueryParams = {
    page?: number;
    per_page?: number;
    search?: string;
    status?: 'active' | 'inactive' | 'disabled';
    orderby?: string;
    order?: 'asc' | 'desc';
    featured?: boolean;
    store_categories?: string | string[];
    badge_id?: number;
};

export type VendorStats = {
    products: {
        total: number;
        sold: number;
        visitor: number;
    };
    revenue: {
        orders: number;
        sales: number;
        earning: number;
    };
    others: {
        commission_rate: string;
        additional_fee: string;
        commission_type: string;
        balance: number;
        reviews: number;
    };
};

export type VendorsStoreState = {
    vendors: Vendor[];
    loading: boolean;
    error?: string;
    queryParams: VendorQueryParams;
    vendorStats: Record< number, VendorStats >;
};

// Reusable primitives
type URLString = string;
type DateTimeString = string;

// Social links
export interface SocialLinks {
    fb: URLString;
    youtube: URLString;
    twitter: URLString;
    linkedin: URLString;
    pinterest: URLString;
    instagram: URLString;
    flickr: URLString;
}

// Address
export interface StoreAddress {
    street_1: string;
    street_2: string;
    city: string;
    zip: string;
    state: string;
    country: string;
}

// Rating payload
export interface StoreRating {
    // In the sample it's a string: "No Ratings found yet"
    // If API can return numeric ratings, change to: rating: string | number
    rating: string;
    count: number;
}

// Payment methods
export interface PaypalPayment {
    // WordPress may include numeric-string keys; keep optional and flexible
    0?: 'email' | string;
    email?: string;
    [ k: string ]: unknown;
}

export interface BankPayment {
    ac_name: string;
    ac_type: string;
    ac_number: string;
    bank_name: string;
    bank_addr: string;
    routing_number: string;
    iban: string;
    swift: string;
}

export interface DokanCustomPayment {
    withdraw_method_name: string;
    withdraw_method_type: string;
    value: string;
}

export interface StorePayment {
    paypal: PaypalPayment;
    bank: BankPayment;
    stripe: boolean;
    dokan_razorpay: boolean;
    'dokan-moip-connect': boolean; // hyphenated key must be quoted
    dokan_custom: DokanCustomPayment;
}

// Store open/close scheduling
export interface StoreOpenCloseTime {
    enabled: boolean;
    time: any[]; // Replace any[] with actual time-slot shape if known
    open_notice: string;
    close_notice: string;
}

export interface StoreOpenClose {
    enabled: boolean;
    time: StoreOpenCloseTime;
    open_notice: string;
    close_notice: string;
}

// HAL-style links
export type HttpMethod = 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH';

export interface LinkTargetHints {
    allow: HttpMethod[];
}

export interface HalLink {
    href: URLString;
    targetHints?: LinkTargetHints;
}

export interface StoreLinks {
    self: HalLink[];
    collection: Array< { href: URLString } >;
}

// Main store item interface
export interface Vendor {
    id: number;
    store_name: string;
    first_name: string;
    last_name: string;
    email: string;

    social: SocialLinks;

    phone: string;
    show_email: boolean;

    address: StoreAddress;
    location: string;

    banner: URLString;
    banner_id: number;

    gravatar: URLString;
    gravatar_id: number;

    shop_url: URLString;

    toc_enabled: boolean;
    store_toc: string;

    featured: boolean;

    rating: StoreRating;

    enabled: boolean;
    registered: DateTimeString;

    payment: StorePayment;

    trusted: boolean;
    reset_sub_category: boolean;

    store_open_close: StoreOpenClose;

    sale_only_here: boolean;

    company_name: string;
    vat_number: string;
    company_id_number: string;

    bank_name: string;
    bank_iban: string;

    enable_manual_order: boolean;

    admin_category_commission: unknown[]; // refine if you know the item structure
    admin_commission: string;
    admin_additional_fee: string;
    admin_commission_type: string;

    vendor_biography: string;

    _links: StoreLinks;
}

export interface Address {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone: string;
}

export interface MetaData {
    id: number;
    key: string;
    value: string;
}

export export interface ProductImage {
    id: string;
    src: string;
}

export interface LineItem {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: MetaData[];
    sku: string;
    price: number;
    image: ProductImage;
}

export interface ShippingLine {
    id: number;
    method_title: string;
    method_id: string;
    instance_id: string;
    total: string;
    total_tax: string;
    taxes: any[];
    meta_data: MetaData[];
}

export interface Link {
    href: string;
}

export interface Links {
    self: Link[];
    collection: Link[];
    customer: Link[];
}

export export interface CouponLine {
    id: number;
    code: string;
    discount: string;
    discount_tax: string;
    meta_data: MetaData[];
    discount_type: string;
    nominal_amount: number;
    free_shipping: boolean;
}

export type OrderStatus =
    | 'pending'
    | 'processing'
    | 'on-hold'
    | 'completed'
    | 'cancelled'
    | 'refunded'
    | 'failed'
    | 'trash'
    | string;

export interface Order {
    id: number;
    parent_id: number;
    number: string;
    order_key: string;
    created_via: string;
    version: string;
    status: OrderStatus;
    currency: string;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    prices_include_tax: boolean;
    customer_id: number;
    customer_ip_address: string;
    customer_user_agent: string;
    customer_note: string;
    billing: Address;
    shipping: Address;
    payment_method: string;
    payment_method_title: string;
    transaction_id: string;
    date_paid: string | null;
    date_paid_gmt: string | null;
    date_completed: string | null;
    date_completed_gmt: string | null;
    cart_hash: string;
    meta_data: MetaData[];
    line_items: LineItem[];
    tax_lines: any[];
    shipping_lines: ShippingLine[];
    fee_lines: any[];
    coupon_lines: CouponLine[];
    refunds: any[];
    order_shipment: string;
    _links: Links;
    order_type?: string
}

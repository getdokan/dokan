/**
 * Types for the first-party React order details view.
 *
 * Shapes mirror `GET /dokan/v1/orders/<id>` (OrderController::get_formatted_item_data)
 * and the server-side marker payload published by
 * `WeDevs\Dokan\Order\VendorPanelOrderDetails`.
 */

export interface DetailsAddress {
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
    phone?: string;
}

export interface DetailsLineItemMeta {
    id: number;
    key: string;
    value: unknown;
    display_key?: string;
    display_value?: string;
}

export interface DetailsLineItem {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    sku: string | null;
    price: number;
    subtotal: string;
    subtotal_tax?: string;
    total: string;
    total_tax?: string;
    image?: string;
    meta_data?: DetailsLineItemMeta[];
}

export interface DetailsShippingLine {
    id: number;
    method_title: string;
    method_id?: string;
    total: string;
    [ key: string ]: unknown;
}

export interface DetailsFeeLine {
    id: number;
    name?: string;
    total: string;
    [ key: string ]: unknown;
}

export interface DetailsCouponLine {
    id: number;
    code: string;
    discount: string;
    discount_tax?: string;
    [ key: string ]: unknown;
}

export interface DetailsTaxLine {
    id: number;
    rate_code?: string;
    label?: string;
    tax_total?: string;
    shipping_tax_total?: string;
    [ key: string ]: unknown;
}

export interface DetailsRefund {
    id: number;
    refund: string;
    total: string;
}

/**
 * Pro appends this through the `dokan_rest_prepare_shop_order_object` filter.
 */
export interface RefundSummaryItem {
    qty_refunded: number;
    total_refunded: string;
}

export interface RefundSummary {
    total_refunded: string;
    remaining: string;
    items: Record< string, RefundSummaryItem >;
    has_pending_request: boolean;
}

export interface OrderMetaData {
    id: number;
    key: string;
    value: unknown;
}

export interface DetailsOrder {
    id: number;
    number: string;
    status: string;
    currency: string;
    date_created: string | null;
    customer_id: number;
    customer_ip_address: string;
    customer_note: string;
    billing: DetailsAddress;
    shipping: DetailsAddress;
    payment_method: string;
    payment_method_title: string;
    line_items: DetailsLineItem[];
    shipping_lines: DetailsShippingLine[];
    fee_lines: DetailsFeeLine[];
    coupon_lines: DetailsCouponLine[];
    tax_lines: DetailsTaxLine[];
    refunds: DetailsRefund[];
    meta_data?: OrderMetaData[];
    discount_total: string;
    shipping_total: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    earning: string | null;
    order_shipment: string;
    refund_summary?: RefundSummary;
    [ key: string ]: unknown;
}

export interface OrderNote {
    id: number;
    date_created: string;
    date_created_gmt: string;
    note: string;
    customer_note: boolean;
}

export interface OrderDownloadPermission {
    permission_id: number;
    product_id: number;
    product_name: string;
    product_image: string;
    download_id: string;
    file_name: string;
    download_count: number;
    downloads_remaining: string;
    access_expires: string | null;
}

export interface OrderStatusOption {
    value: string;
    label: string;
}

/**
 * The server-side marker payload for the order-details route.
 */
export interface OrderDetailsMarker {
    panel_route_enabled?: boolean;
    view?: 'react' | 'fragment';
    statuses?: OrderStatusOption[];
    status_change_allowed?: boolean;
    sections?: Record< string, boolean >;
}

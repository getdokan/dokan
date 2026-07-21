export interface OrderBilling {
    first_name: string;
    last_name: string;
    company: string;
    email: string;
    phone: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

export interface OrderRefund {
    id: number;
    refund: string;
    total: string;
}

export interface OrderItem {
    id: number;
    number: string;
    status: string;
    currency: string;
    total: string;
    earning: string | null;
    date_created: string;
    date_created_gmt: string;
    billing: OrderBilling;
    customer_id: number;
    order_shipment: string;
    refunds?: OrderRefund[];
}

export type OrderStatus = string;

export interface OrderFilterState {
    page: number;
    per_page: number;
    status: string;
    search: string;
    customer_id?: number;
    after?: string;
    before?: string;
}

export interface OrderStatusCount {
    value: string;
    label: string;
    count: number;
}

export interface OrderDetailsInlineScript {
    handle: string;
    position: 'before' | 'after';
    code: string;
}

export interface OrderDetailsMeta {
    id: number;
    number: string;
    status: string;
    status_label: string;
    date_created: string | null;
}

/**
 * Response of `GET /dokan/v1/orders/<id>/details-html`.
 *
 * The details view stays server-rendered PHP so every Pro and third-party hook keeps
 * firing; the panel receives its markup as an HTML fragment.
 */
export interface OrderDetailsFragment {
    html: string;
    inline_scripts: OrderDetailsInlineScript[];
    order: OrderDetailsMeta;
}

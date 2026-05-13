export interface ProductImage {
    id: number;
    src: string;
    name: string;
    alt: string;
}

export interface ProductCategory {
    id: number;
    name: string;
    slug: string;
}

export interface ProductRowAction {
    title: string;
    url: string;
    class: string;
}

export interface ProductAdvertisement {
    already_advertised: boolean;
    expire_date?: string;
    advertise_url?: string;
}

export interface ProductItem {
    id: number;
    name: string;
    slug: string;
    type: string;
    status: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    price_html: string;
    on_sale: boolean;
    manage_stock: boolean;
    stock_quantity: number | null;
    in_stock: boolean;
    total_sales: number;
    virtual: boolean;
    downloadable: boolean;
    categories: ProductCategory[];
    images: ProductImage[];
    date_created: string;
    date_modified: string;
    permalink: string;
    earning: number | null;
    page_view: number;
    row_actions: Record< string, ProductRowAction > | null;
    edit_url?: string;
    advertisement?: ProductAdvertisement | null;
}

export type ProductStatus =
    | 'all'
    | 'publish'
    | 'draft'
    | 'pending'
    | 'future'
    | 'reject'
    | ( string & {} );

export interface ProductFilterState {
    page: number;
    per_page: number;
    status: ProductStatus;
    search: string;
    category?: number | '';
    type?: string;
    year_month?: string;
    in_stock?: boolean;
    product_brand?: number | '';
    filter_by_other?: string;
}

export interface ProductStatusCount {
    value: string;
    label: string;
    count: number;
}

/** Fresh subscription limits returned by /dokan/v1/products/summary after each action. */
export interface SubscriptionRemaining {
    remaining_products: true | number;
    can_post_product: boolean;
}

export interface ProductSummary {
    post_counts: Record< string, number >;
    products_url: string;
    instock_count: number;
    outofstock_count: number;
    subscription_remaining?: SubscriptionRemaining;
    months?: ProductMonthOption[];
}

export interface ProductMonthOption {
    value: string; // "YYYYMM", e.g. "202501"
    label: string; // "January 2025"
}

export interface ProductCategoryOption {
    value: number;
    label: string;
}

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

export type ProductStatus = 'all' | 'publish' | 'draft' | 'pending' | 'future';

export interface ProductFilterState {
    page: number;
    per_page: number;
    status: ProductStatus;
    search: string;
    category?: number | '';
    type?: string;
    year_month?: string;
    in_stock?: boolean;
}

export interface ProductStatusCount {
    value: string;
    label: string;
    count: number;
}

export interface ProductSummary {
    post_counts: Record< string, number >;
    products_url: string;
    instock_count: number;
    outofstock_count: number;
}

export interface ProductMonthOption {
    value: string; // "YYYYMM", e.g. "202501"
    label: string; // "January 2025"
}

export interface ProductCategoryOption {
    value: number;
    label: string;
}

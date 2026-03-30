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
    permalink: string;
}

export type ProductStatus = 'all' | 'publish' | 'draft' | 'pending';

export interface ProductFilterState {
    page: number;
    per_page: number;
    status: ProductStatus;
    search: string;
}

export interface ProductStatusCount {
    value: string;
    label: string;
    count: number;
}

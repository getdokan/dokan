interface ProductDimensions {
    length: string;
    width: string;
    height: string;
}

interface ProductImage {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    src: string;
    name: string;
    alt: string;
    position: number;
}

interface ProductCategory {
    id: number;
    name: string;
    slug: string;
}

interface ProductMetaData {
    id: number;
    key: string;
    value: string | number | any[];
}

interface StoreAddress {
    street_1: string;
    street_2: string;
    city: string;
    zip: string;
    country: string;
    state: string;
}

interface Store {
    id: number;
    name: string;
    url: string;
    avatar: string;
    address: StoreAddress;
}

interface RowAction {
    title: string;
    url: string;
    class: string;
    other?: string;
}

interface RowActions {
    edit: RowAction;
    delete: RowAction;
    view: RowAction;
    'quick-edit': RowAction;
    duplicate: RowAction;
}

interface ApiLink {
    href: string;
}

interface ApiLinks {
    self: ApiLink[];
    collection: ApiLink[];
}

interface Product {
    id: number;
    name: string;
    slug: string;
    post_author: string;
    permalink: string;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    type: string;
    status: string;
    featured: boolean;
    catalog_visibility: string;
    description: string;
    short_description: string;
    sku: string;
    price: string;
    regular_price: string;
    sale_price: string;
    date_on_sale_from: string | null;
    date_on_sale_from_gmt: string | null;
    date_on_sale_to: string | null;
    date_on_sale_to_gmt: string | null;
    price_html: string;
    on_sale: boolean;
    purchasable: boolean;
    total_sales: number;
    virtual: boolean;
    downloadable: boolean;
    downloads: any[]; // You can define a specific type if needed
    download_limit: number;
    download_expiry: number;
    external_url: string;
    button_text: string;
    tax_status: string;
    tax_class: string;
    manage_stock: boolean;
    stock_quantity: number | null;
    low_stock_amount: string;
    in_stock: boolean;
    backorders: string;
    backorders_allowed: boolean;
    backordered: boolean;
    sold_individually: boolean;
    weight: string;
    dimensions: ProductDimensions;
    shipping_required: boolean;
    shipping_taxable: boolean;
    shipping_class: string;
    shipping_class_id: number;
    reviews_allowed: boolean;
    average_rating: string;
    rating_count: number;
    related_ids: number[];
    upsell_ids: number[];
    cross_sell_ids: number[];
    parent_id: number;
    purchase_note: string;
    categories: ProductCategory[];
    tags: any[]; // You can define a specific type if needed
    images: ProductImage[];
    attributes: any[]; // You can define a specific type if needed
    default_attributes: any[]; // You can define a specific type if needed
    variations: any[]; // You can define a specific type if needed
    grouped_products: any[]; // You can define a specific type if needed
    menu_order: number;
    meta_data: ProductMetaData[];
    store: Store;
    row_actions: RowActions;
    _links: ApiLinks;
}

// Optional: Type guard to check if a product is a subscription
const isSubscriptionProduct = (product: Product): boolean => {
    return product.type === 'subscription';
};

export type {
    Product,
    ProductDimensions,
    ProductImage,
    ProductCategory,
    ProductMetaData,
    Store,
    StoreAddress,
    RowAction,
    RowActions,
    ApiLink,
    ApiLinks
};

export { isSubscriptionProduct };

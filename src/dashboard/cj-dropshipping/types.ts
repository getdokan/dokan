export type CJStatus = {
    can_use: boolean;
    blocked_reason: string;
    message: string;
    accepted_terms: boolean;
    available: boolean;
    default_markup: number;
    terms: string[];
    warehouses: Record< string, string >;
    currency: string;
};

export type CJSearchItem = {
    pid: string;
    name: string;
    sku: string;
    image: string;
    cost: number;
    inventory: number;
    delivery_cycle: string;
};

export type CJSearchResult = {
    items: CJSearchItem[];
    total: number;
    pages: number;
};

export type CJVariant = {
    vid: string;
    sku: string;
    name: string;
    key: string;
    image: string;
    cost: number;
    weight_g: number;
    stock: Record< string, number >;
    imported_product_id: number;
};

export type CJProduct = {
    pid: string;
    name: string;
    sku: string;
    image: string;
    images: string[];
    description: string;
    option_name: string;
    on_sale: boolean;
    variants: CJVariant[];
};

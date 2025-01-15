export interface CustomerAddress {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    postcode: string;
    country: string;
    state: string;
    email?: string;
    phone: string;
}

export interface CustomerLinks {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
}

export interface Customer {
    id: number;
    date_created: string;
    date_created_gmt: string;
    date_modified: string;
    date_modified_gmt: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    username: string;
    billing: CustomerAddress;
    shipping: CustomerAddress;
    is_paying_customer: boolean;
    avatar_url: string;
    _links: CustomerLinks;
}

export interface CustomerState {
    items: Record<number, Customer>;
    isLoading: Record<string, boolean>;
    errors: Record<string, string | null>;
}

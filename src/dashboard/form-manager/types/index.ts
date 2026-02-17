export interface DokanFormManagerData {
    /** Flat array of form items (type 'section' | 'field') from server. */
    form_items: FlatFormItem[];
    is_new_product: string;
    product_id: string;
    view_product_url: string;
    form_manager_nonce: string;
    vendor_earning: number;
    variations: any[];
}

export interface DependencyCondition {
    field: string;
    section?: string;
    operator: 'equal' | 'not_equal';
    value: string | boolean | number;
}

/**
 * Single item in the flat form array from backend.
 * Same structure for section and field; discriminated by type.
 * Sections: type 'section', parent_id null. Fields: type 'field', parent_id section id.
 * Use as FormField when the item is a field (e.g. in getFieldConfig, handlers).
 */
export type FlatFormItem = {
    type: 'section' | 'field';
    id: string;
    parent_id: string | null;
    label: string;
    description?: string;
    order?: number;
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
    value?: any;
    default?: any;
    variant?: string;
    options?: { label: string; value: string }[] | Record< string, string >;
    dependencies?: DependencyCondition[];
    visibility?: boolean;
    is_custom?: boolean;
};

/** Alias for FlatFormItem when used as a field (e.g. getFieldConfig, handlers). */
export type FormField = FlatFormItem;

export type FieldConfig = Partial< FlatFormItem > & {
    type?: string;
    Edit?: any;
    elements?: any[];
    [ key: string ]: any;
};

export type FieldHandler = ( field?: FormField ) => FieldConfig;

export type VariationType = {
    id: number;
    parent_id: number;
    menu_order: number;
    attributes: {
        label: string;
        value: string;
        selected_value: {
            label: string;
            value: string;
        };
        options: any;
    }[];
};

export interface Attribute {
    id: number;
    name: string;
    value: string;
    options: any[];
    visible: boolean;
    variation: boolean;
    position: number;
    is_taxonomy?: boolean;
    terms?: { label: string; value: number }[];
}

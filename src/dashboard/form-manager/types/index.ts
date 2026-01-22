import { Field } from '@wordpress/dataviews';

export interface DokanFormManagerData {
    sections: Section[];
    is_new_product: string;
    product_id: string;
    view_product_url: string;
    form_manager_nonce: string;
    vendor_earning: number;
    variations: any[];
}

export interface DependencyCondition {
    field: string;
    operator: 'equal' | 'not_equal';
    value: string | boolean | number;
}
export interface Section {
    id: string;
    title: string;
    description: string;
    order: number;
    fields: FormField[];
    dependency_condition?: DependencyCondition;
}

export type FormField = {
    id: string;
    section_id: string;
    name: string;
    title: string;
    is_custom: boolean;
    placeholder: string;
    help_content: string;
    tooltip: string;
    description: string;
    required: boolean;
    value: any;
    field_type: string;
    options: { label: string; value: string }[] | Record< string, string >;
    errors: string;
    dependency_condition: DependencyCondition;
    hidden_scope: string[];
    visibility: boolean;
    order: number;
} & Field< any >;

export type FieldConfig = Partial< FormField > & {
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

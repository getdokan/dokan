export interface DependencyCondition {
    key: string;
    comparison: '==' | '!=' | 'empty' | 'not_empty' | '===' | '!==' | 'not_equal' | 'equal';
    value?: string | boolean | number;
}

/**
 * Single item in the flat form array from backend.
 * Same structure for section and field; discriminated by type.
 * Sections: type 'section', section_id null. Fields: type 'field', section_id = parent section id.
 * Use as FormField when the item is a field (e.g. in getFieldConfig, handlers).
 */
export type FlatFormItem = {
    type: string;
    id: string;
    section_id: string | null;
    label: string;
    labels?: Record< string, string >;
    description?: string | React.ReactNode;
    order?: number;
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
    error_message?: string;
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

export interface DependencyCondition {
    key: string;
    comparison: '==' | '!=' | 'empty' | 'not_empty' | '===' | '!==' | 'not_equal' | 'equal' | 'contains';
    value?: string | boolean | number;
    type?: 'visibility' | 'options';
}

/**
 * Single item in the flat form array from backend.
 * Same structure for section and field; discriminated by type.
 * Sections: type 'section', section_id null. Fields: type 'field', section_id = parent section id.
 * Use as FormField when the item is a field (e.g. in getFieldConfig, handlers).
 */
export type FlatFormItem = {
    id: string;
    section_id: string | null;
    type: string;
    label: string;
    labels?: Record< string, string >;
    description?: string | React.ReactNode;
    priority: number;
    placeholder?: string;
    tooltip?: string;
    required?: boolean;
    requireds?: Record< string, boolean >;
    value?: any;
    default?: any;
    variant: string;
    options?: { label: string; value: string }[] | Record< string, string >;
    options_map?: Record< string, { label: string; value: string }[] >;
    dependencies?: DependencyCondition[];
    visibility?: boolean;
    visibilities?: Record< string, boolean >;
    is_custom?: boolean;
};

export type FieldConfig = Partial< FlatFormItem > & {
    Edit?: any;
    elements?: any[];
    [ key: string ]: any;
};

export type FieldHandler = ( field?: FlatFormItem ) => FieldConfig;

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
    default?: string;
}

export interface DefaultAttribute {
    id: number;
    name: string;
    option: string;
}

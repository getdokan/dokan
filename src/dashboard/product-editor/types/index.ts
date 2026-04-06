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
export type FormItem = {
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
    variant?: string;
    options?: { label: string; value: string }[] | Record< string, string >;
    options_map?: Record< string, { label: string; value: string }[] >;
    dependencies?: DependencyCondition[];
    prefix?: string;
    visibility?: boolean;
    visibilities?: Record< string, boolean >;
    is_custom?: boolean;
};

export type FieldConfig = Partial< FormItem > & {
    Edit?: any;
    elements?: any[];
    [ key: string ]: any;
};

export type FieldHandler = ( field?: FormItem ) => FieldConfig;

export type FieldValidator = ( field: FormItem, value: any ) => string | null;

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

/**
 * Layout configuration for a layout item.
 * Supports type, alignment, styles, and other layout-specific properties.
 */
export type LayoutConfig = {
    type: string;
    alignment?: string;
    styles?: Record< string, Record< string, string > >;
    withHeader?: boolean;
    isCollapsible?: boolean;
    [ key: string ]: any;
};

/**
 * Responsive breakpoint override for a layout item.
 * When viewport width is at or below `maxWidth`, the `layout` overrides the default.
 */
export type ResponsiveBreakpoint = {
    maxWidth: number;
    layout: LayoutConfig;
};

/**
 * Single item in the flat layout array from backend.
 * Layout items define containers (columns, cards, rows, groups) with parent-child
 * relationships via parent_id. Field IDs are listed in the children array.
 */
export type LayoutItem = {
    id: string;
    parent_id: string | null;
    layout?: LayoutConfig;
    responsive?: ResponsiveBreakpoint[];
    label?: string;
    description?: string;
    priority?: number;
    children?: string[];
    after?: string;
};

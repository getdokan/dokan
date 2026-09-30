export interface DependencyCondition {
    key: string;
    comparison: '==' | '!=' | 'empty' | 'not_empty' | '===' | '!==' | 'not_equal' | 'equal' | 'contains';
    value?: string | boolean | number;
    type?: 'visibility' | 'options';
}

/**
 * Supported validation rule names coming from the PHP schema.
 *
 * Word form and symbol form are interchangeable:
 * - required                  : field value must not be empty
 * - greater_than          / '>'  : value must be >  comparand
 * - greater_than_or_equal / '>=' : value must be >= comparand
 * - less_than             / '<'  : value must be <  comparand
 * - less_than_or_equal    / '<=' : value must be <= comparand
 * - empty                    : value must be empty
 * - not_empty                : value must not be empty
 *
 * Comparand is either `params.value` (literal) or `params.field` (sibling field id).
 */
export type ValidationRuleName =
    | 'required'
    | 'greater_than'          | '>'
    | 'greater_than_or_equal' | '>='
    | 'less_than'             | '<'
    | 'less_than_or_equal'    | '<='
    | 'empty'
    | 'not_empty';

/**
 * A single validation entry in the `validations` array of a FormItem.
 *
 * Multiple entries are combined with AND logic — *all* rules must pass.
 * `dependencies` mirrors the field's own dependency format; when provided the
 * validation is skipped unless those conditions are met.
 */
export interface ValidationRule {
    /** The rule to evaluate. */
    rules: ValidationRuleName;
    /** Human-readable error message returned when the rule fails. */
    message: string;
    /**
     * Optional parameters consumed by the rule.
     * - greater_than / less_than: { value?: number | string; field?: string; type?: 'number' | 'string' }
     *   `field` references another field id in the form data whose value is
     *   used as the comparison operand.
     *   `type` determines whether the comparison evaluates numerically (default) or lexicographically ('string').
     */
    params: Record< string, any >;
    /**
     * Dependency conditions (same format as FormItem.dependencies).
     * When provided the validation fires only when *all* conditions are met.
     */
    dependencies?: DependencyCondition[];
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
    multiple?: boolean;
    options?: { label: string; value: string }[] | Record< string, string >;
    options_map?: Record< string, { label: string; value: string }[] >;
    dependencies?: DependencyCondition[];
    validations?: ValidationRule[];
    prefix?: string;
    visibility?: boolean;
    visibilities?: Record< string, boolean >;
    disabled?: boolean;
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

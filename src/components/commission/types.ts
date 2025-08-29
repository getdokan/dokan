export interface Category {
    term_id: string | number;
    name: string;
    parent_id: string | number;
    parents: number[];
    children: Category[];
}

export interface CommissionValues {
    all?: {
        percentage: string;
        flat: string;
    };
    items?: {
        [ categoryId: string ]: {
            percentage: string;
            flat: string;
        };
    };
}

export interface SettingsElement {
    hook_key: string;
    children?: SettingsElement[];
    display?: boolean;
    value?: any;
    categories?: { [ key: string ]: Category };
}

export interface CommissionInputsProps {
    categoryId: string | number;
    isAllCategory?: boolean;
    onCommissionChange: (
        value: string,
        type: 'percentage' | 'flat',
        categoryId: string | number,
        shouldDebounce?: boolean
    ) => void;
    onAllCategoryChange: (
        value: string,
        type: 'percentage' | 'flat',
        shouldDebounce?: boolean
    ) => void;
    onBlur: (
        value: string,
        type: 'percentage' | 'flat',
        categoryId: string | number,
        isAllCategory?: boolean
    ) => void;
    getCommissionValue: (
        type: 'percentage' | 'flat',
        categoryId: string | number
    ) => string;
    formatValue: ( value: string ) => string;
    currency: {
        symbol: string;
        thousand: string;
        decimal: string;
        precision: number;
    };
}

export interface CategoryRowProps {
    category: Category;
    level?: number;
    isExpanded: boolean;
    hasChildren: boolean;
    onToggle: ( id: string | number ) => void;
    commissionInputsProps: CommissionInputsProps;
}

export interface CategoryBasedCommissionProps {
    // Core data
    categories: { [ key: string ]: Category };
    commissionValues: CommissionValues;

    // Configuration
    currency: {
        symbol: string;
        thousand: string;
        decimal: string;
        precision: number;
    };
    resetSubCategoryValue?: boolean;

    // Callbacks
    onCommissionChange: ( updatedCommission: CommissionValues ) => void;

    // Display options
    display?: boolean;
    debounceDelay?: number;
}

export interface FixedCommissionInputValues {
    admin_percentage: number;
    additional_fee: number;
}

export interface CombineInputProps {
    // Core data
    values: FixedCommissionInputValues;

    // Configuration
    currency: {
        symbol: string;
        thousand: string;
        decimal: string;
        precision: number;
    };

    // Display content
    title?: string;
    description?: string;
    hookKey?: string;

    // Callbacks
    onValueChange: ( updatedValues: FixedCommissionInputValues ) => void;

    // Display options
    display?: boolean;
    debounceDelay?: number;
}

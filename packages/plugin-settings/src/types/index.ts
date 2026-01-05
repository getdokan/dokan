/**
 * Settings Element Dependency type.
 */
export interface SettingsElementDependency {
    key?: string;
    value?: unknown;
    currentValue?: unknown;
    to_self?: boolean;
    self?: string;
    attribute?: string;
    effect?: string;
    comparison?: string;
}

/**
 * Settings Element Option type.
 */
export interface SettingsElementOption {
    title: string;
    value: string | number;
    description?: string;
    icon?: string;
    image?: string;
    preview?: string;
}

/**
 * Settings Element type.
 */
export interface SettingsElement {
    id: string;
    type: string;
    variant?: string;
    title?: string;
    new_title?: string;
    description?: string;
    tooltip?: string;
    icon?: string;
    display?: boolean;
    hook_key?: string;
    dependency_key?: string;
    doc_link?: string;
    css_class?: string;
    wrapper_class?: string;
    helper_text?: string;
    image_url?: string;
    priority?: number;
    disabled?: boolean;
    readonly?: boolean;
    placeholder?: string | number;
    value?: SettingsValue;
    default?: SettingsValue;
    options?: SettingsElementOption[];
    children?: SettingsElement[];
    dependencies?: SettingsElementDependency[];
    // Field-specific properties
    min?: number;
    max?: number;
    step?: number;
    increment?: number;
    rows?: number;
    multiple?: boolean;
    prefix?: string;
    suffix?: string;
    divider?: boolean;
    radio_variant?: 'simple' | 'card' | 'template' | string;
    items?: Array< {
        key: string;
        title: string;
        required?: boolean;
        order?: number | string;
    } >;
    enable_state?: {
        label: string;
        value: string | number;
    };
    disable_state?: {
        label: string;
        value: string | number;
    };
}

/**
 * Settings Value type.
 */
export type SettingsValue =
    | string
    | number
    | boolean
    | ( string | number )[]
    | Record< string, unknown >
    | null
    | undefined;

/**
 * Settings State type for Redux store.
 */
export interface SettingsState {
    settings: SettingsElement[];
    originalSettings: SettingsElement[];
    dependencies: SettingsElementDependency[];
    loading: boolean;
    saving: boolean;
    needSaving: boolean;
    searchText: string;
    error: string | null;
}

/**
 * Store configuration type.
 */
export interface StoreConfig {
    storeName: string;
    restEndpoint: string;
}

/**
 * Settings Page configuration type.
 */
export interface SettingsPageConfig {
    storeName: string;
    textDomain?: string;
    legacySettingsUrl?: string;
    filterPrefix?: string;
    showLegacyLink?: boolean;
}

/**
 * Field Props type.
 */
export interface FieldProps {
    element: SettingsElement;
    onValueChange?: ( element: SettingsElement ) => void;
}

/**
 * Settings Parser Props type.
 */
export interface SettingsParserProps {
    element: SettingsElement;
    onValueChange?: ( element: SettingsElement ) => void;
}

export type SettingsElementDependency = {
    key?: string;
    value?: any;
    currentValue?: any;
    to_self?: boolean;
    self?: string;
    attribute?: string;
    effect?: string;
    comparison?: string;
};

export type SettingsElement = {
    radio_variant?: 'simple' | 'card' | 'template' | string;
    id: string;
    type: string;
    variant?: string;
    icon?: string;
    title?: string;
    new_title?: string;
    description?: string;
    tooltip?: string;
    value?:
        | string
        | number
        | Array< string | number | number[] >
        | Record< string, string | number >
        | boolean;
    default?: string;
    options?: Array< { title: string; value: string | number } >;
    readonly?: boolean;
    disabled?: boolean;
    placeholder?: string | number;
    display?: boolean;
    min?: number;
    max?: number;
    increment?: number;
    hook_key?: string;
    dependency_key?: string;
    children?: Array< SettingsElement >;
    dependencies?: Array< SettingsElementDependency >;
    prefix?: string;
    suffix?: string;
    enable_state?: {
        label: string;
        value: string | number;
    };
    disable_state?: {
        label: string;
        value: string | number;
    };
    doc_link?: string;
    css_class?: string;
    helper_text?: string;
};

export interface SettingsProps {
    element: SettingsElement;
    onValueChange: ( element: SettingsElement ) => void;
    getSetting: ( id: string ) => SettingsElement | undefined;
}

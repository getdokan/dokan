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

export type SettingsElementValidation = {
    rules?: string;
    params?: any;
    message?: string;
    self?: string;
    currentValue?: any;
    isValid?: boolean;
    errorMessage?: string;
};

export interface SettingsElementOption {
    title: string;
    value: string | number;
    description?: string;
    icon?: string;
    image?: string;
    preview?: string;
}

export interface SettingsElement {
    hook_key: string;
    id: string;
    type: string;
    title: string;
    icon: string;
    display: boolean;
    children: SettingsElement[];
    description?: string;
    dependency_key: string;
    dependencies: SettingsElementDependency[];
    validations?: SettingsElementValidation[];
    validationError?: string;
    options?: SettingsElementOption[];
    variant?: string;
    image_url?: string;
    priority?: number;
    value?:
        | string
        | number
        | boolean
        | ( string | number )[]
        | Record< string, any >;
    default?:
        | string
        | number
        | boolean
        | ( string | number )[]
        | Record< string, any >;
    css_class?: string;
    disabled?: boolean;
    doc_link?: string;
}

export type SettingsState = {
    settings: SettingsElement[];
    originalSettings: SettingsElement[];
    dependencies: SettingsElementDependency[];
    validations: SettingsElementValidation[];
    loading: boolean;
    saving: boolean;
    needSaving: boolean;
    hasValidationErrors: boolean;
    searchText: string;
    changedElements: Record< string, SettingsElement >;
};

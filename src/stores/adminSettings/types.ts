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
    options?: SettingsElementOption[];
    variant?: string;
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
}

export type SettingsState = {
    settings: SettingsElement[];
    dependencies: SettingsElementDependency[];
    loading: boolean;
    saving: boolean;
    needSaving: boolean;
};

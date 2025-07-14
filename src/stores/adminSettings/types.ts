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

export interface SettingsElement {
    id: string;
    type: string;
    title: string;
    icon: string;
    display: boolean;
    children: SettingsElement[];
    description?: string;
    dependency_key: string;
    dependencies: SettingsElementDependency[];
}

export type SettingsState = {
    settings: SettingsElement[];
    dependencies: SettingsElementDependency[];
    loading: boolean;
    saving: boolean;
    needSaving: boolean;
};

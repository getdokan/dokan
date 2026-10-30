// Shapes shared by the Vendor Registration Form block's editor code.

export type View = 'visitor' | 'social' | 'customer';

export interface RegistrySection {
    id: string;
    title: string;
    hidden: boolean;
    locked: boolean;
}

export interface RegistryRow {
    id: string;
    section: string;
    position: number;
    label: string;
    type: string;
    input_name: string;
    saved_in: string;
    source: string;
    locked: boolean;
    required: boolean;
    hidden: boolean;
    woocommerce_setting: string;
    keeps_section_visible: boolean;
    hook: string;
    // Extension rows: extra labels the owner can override, e.g. each EU field.
    edit_labels?: Record< string, string >;
    // Extension rows: a note and link shown in the row's panel.
    settings_note?: string;
    settings_link?: string;
    settings_link_text?: string;
}

export interface FieldOption {
    label: string;
    value: string;
}

// A row as saved in the block's `sections` attribute.
export interface SavedRow {
    id: string;
    custom?: boolean;
    type?: string;
    label?: string;
    placeholder?: string;
    help?: string;
    required?: boolean;
    hidden?: boolean;
    metaKey?: string;
    options?: FieldOption[];
    labels?: Record< string, string >;
}

export interface SavedSection {
    id: string;
    custom?: boolean;
    title?: string;
    hidden?: boolean;
    step?: string;
    rows?: SavedRow[];
}

export interface Step {
    id: string;
    title: string;
}

// A row as the editor works with it: registry defaults plus saved overrides.
export interface Row {
    id: string;
    custom: boolean;
    type: string;
    label: string;
    placeholder: string;
    help: string;
    required: boolean;
    hidden: boolean;
    locked: boolean;
    metaKey: string;
    options: FieldOption[];
    labels: Record< string, string >;
    registry?: RegistryRow;
}

export interface Section {
    id: string;
    title: string;
    custom: boolean;
    hidden: boolean;
    locked: boolean;
    step: string;
    rows: Row[];
}

export interface Setup {
    splitSteps: boolean;
    steps: Step[];
    sections: Section[];
}

export interface LoginSettings {
    enabled: boolean;
    position: 'left' | 'right' | 'link';
    heading: string;
    linkText: string;
    usernameLabel: string;
    passwordLabel: string;
    buttonText: string;
    showRemember: boolean;
    showLostPassword: boolean;
}

export interface BlockAttributes {
    splitSteps: boolean;
    steps: Step[];
    sections: SavedSection[];
    texts: Record< string, string >;
    termsPageId?: number;
    login: Partial< LoginSettings >;
    styles: Record< string, string | number >;
    // Add-on settings, keyed by add-on, e.g. Dokan Pro's social buttons.
    extensions?: Record< string, unknown >;
}

export interface EditorData {
    sections: RegistrySection[];
    rows: RegistryRow[];
    registeredRowIds: string[];
    suggestedSteps: { steps: Step[]; sections: Record< string, string > };
    customTypes: string[];
    optionTypes: string[];
    metaPrefix: string;
    reservedKeys: string[];
    texts: Record< string, string >;
    login: LoginSettings;
    woocommerce: {
        generateUsername: boolean;
        generatePassword: boolean;
        usesCheckoutBlock: boolean;
        settingsUrl: string;
    };
    dokan: {
        onboardingPageId: number;
        termsEnabled: boolean;
        termsPageId: number;
        addressEnabled: boolean;
        storeUrlBase: string;
        restNamespace: string;
    };
    // Set by add-ons that print social buttons, e.g. Dokan Pro with social login on.
    social?: unknown;
}

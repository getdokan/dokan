import { Vendor } from '@dokan/definitions/dokan-vendors';

export interface FormProps {
    vendor: Vendor;
    requiredFields: Record< any, any >;
    formKey?: string;
    createForm?: boolean;
    // Bump to switch to the tab holding the first validation error and scroll to it.
    focusErrorsTrigger?: number;
}

export interface SectionProps {
    vendor: Vendor;
    formKey: string;
    createForm: boolean;
    isRequired: ( key: string ) => boolean;
    getError: ( key: string ) => string;
    setData: (
        key: string,
        value: any,
        /** @deprecated DOKAN_SINCE Ignored; writes always merge into the live vendor. */
        existingVendor?: object
    ) => Promise< any >;
}

export interface TabData {
    name: string;
    title: string;
    className: string;
    component: any;
    renderAsFunction: boolean;
    // Field keys rendered by this tab, used to locate validation errors.
    fields?: string[];
}

export interface CountryOption {
    label: string;
    value: string;
}

export interface StateOption {
    label: string;
    value: string;
}

export interface CommissionType {
    label: string;
    value: string;
}

export interface Settings {
    new_seller_enable_selling: 'automatically' | 'manually' | 'verified_only';
    allow_vendor_create_manual_order: boolean;
}

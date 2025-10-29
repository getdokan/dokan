import { Vendor } from '@dokan/definitions/dokan-vendors';

export interface FormProps {
    vendor: Vendor;
    requiredFields: Record< any, any >;
    formKey?: string;
    createForm?: boolean;
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
        existingVendor?: object
    ) => Promise< any >;
}

export interface TabData {
    name: string;
    title: string;
    className: string;
    component: any;
    renderAsFunction: boolean;
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

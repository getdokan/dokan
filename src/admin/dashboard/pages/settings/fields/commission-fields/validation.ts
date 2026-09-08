import { __ } from '@wordpress/i18n';

const isBlank = ( value: unknown ): boolean =>
    value === undefined || value === null || String( value ).trim() === '';

// plugin-ui can't validate the object-shaped commission values, so mirror the legacy rule here (the server `validation_func` enforces the same).

// Fixed commission requires both the percentage and the flat fee.
export const fixedCommissionError = ( value?: {
    admin_percentage?: string;
    additional_fee?: string;
} ): string =>
    isBlank( value?.admin_percentage ) || isBlank( value?.additional_fee )
        ? __( 'Both percentage and fixed fee is required.', 'dokan-lite' )
        : '';

// The All-Categories rate requires both the percentage and the flat fee.
export const categoryCommissionError = ( value?: {
    all?: { percentage?: string; flat?: string };
} ): string => {
    const all = value?.all;
    return isBlank( all?.percentage ) || isBlank( all?.flat )
        ? __( 'Admin Commission is required.', 'dokan-lite' )
        : '';
};

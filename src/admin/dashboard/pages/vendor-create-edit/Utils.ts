import apiFetch from '@wordpress/api-fetch';
import { Vendor } from '@dokan/definitions/dokan-vendors';

export const validateForm = async (
    checkVendor: Vendor,
    requiredInputFields: Record< string, string >
) => {
    const errors: string[] = [];

    Object.keys( requiredInputFields ).forEach( ( key ) => {
        if ( ! checkVendor[ key ] && requiredInputFields[ key ] ) {
            errors.push( key );
        }
    } );

    return errors;
};

export const requestCreateVendor = async (vendor: Vendor ) => {
    try {
        return await apiFetch( {
            path: '/dokan/v1/stores/',
            method: 'POST',
            data: vendor,
        } );
    } catch ( error ) {
        throw error;
    }
};

export const requestEditVendor = async ( vendor: Vendor ) => {
    try {
        const response = await apiFetch( {
            path: `/dokan/v1/stores/${ vendor?.id }`,
            method: 'POST',
            data: vendor,
        } );
        return response;
    } catch ( error ) {
        throw error;
    }
};

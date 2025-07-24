import apiFetch from '@wordpress/api-fetch';
import { AdminNoticesData } from '../types';

// Admin Notices API
export const fetchAdminNotices = async (
    endpoint: string = 'admin',
    scope?: string
): Promise< AdminNoticesData > => {
    const params = scope ? `?scope=${ scope }` : '';
    return await apiFetch< AdminNoticesData >( {
        path: `dokan/v1/admin/notices/${ endpoint }${ params }`,
        method: 'GET',
    } );
};

export const dismissAdminNotice = async ( ajaxData: {
    action: string;
    nonce: string;
    [ key: string ]: any;
} ): Promise< any > => {
    const formData = new FormData();
    Object.entries( ajaxData ).forEach( ( [ key, value ] ) => {
        formData.append( key, value );
    } );

    return await apiFetch( {
        url: window.ajaxurl || '/wp-admin/admin-ajax.php',
        method: 'POST',
        body: formData,
    } );
};

export const executeNoticeAction = async ( ajaxData: {
    action: string;
    nonce: string;
    [ key: string ]: any;
} ): Promise< any > => {
    const formData = new FormData();
    Object.entries( ajaxData ).forEach( ( [ key, value ] ) => {
        formData.append( key, value );
    } );

    return await apiFetch( {
        url: window.ajaxurl || '/wp-admin/admin-ajax.php',
        method: 'POST',
        body: formData,
    } );
};

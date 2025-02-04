import { Field } from '../types';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

export const API_ENDPOINTS = {
    GENERATE: '/dokan/v1/ai/generate',
};
export const generateAiContent = async (
    prompt: string,
    field: Field
): Promise< string > => {
    const data = await apiFetch( {
        path: API_ENDPOINTS.GENERATE,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        data: {
            prompt,
            id: field.id,
            type: field.type,
        },
    } );
    // @ts-ignore
    const content = data.response || data;
    return content || __( 'No content generated', 'dokan' );
};

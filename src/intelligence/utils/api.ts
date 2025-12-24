import apiFetch from '@wordpress/api-fetch';

export const API_ENDPOINTS = {
    GENERATE: '/dokan/v1/ai/generate',
};
export const generateAiContent = async ( prompt: string, field = {} ) => {
    const data = await apiFetch( {
        path: API_ENDPOINTS.GENERATE,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        data: {
            prompt,
            payload: field,
        },
    } );
    // @ts-ignore
    return data.response;
};

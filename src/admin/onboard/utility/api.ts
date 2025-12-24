// api.ts
import apiFetch from '@wordpress/api-fetch';
import { FormData, OnboardingData } from '../types';

const apiPath = '/dokan/v1/admin/onboarding';
/**
 * Format plugins from API response format to form data format
 * @param plugins
 */
export const formatPlugins = ( plugins: any[] ) => {
    return plugins.map( ( plugin ) => {
        const pluginDetails = plugin?.basename?.split( '/' ) || [ '', '' ];
        return {
            id: plugin?.slug,
            info: {
                name: plugin?.title,
                'repo-slug': pluginDetails[ 0 ] || '',
                file: pluginDetails[ 1 ] || '',
            },
        };
    } );
};

/**
 * Fetch onboarding data from the API
 */
export const getOnboardingData = async (): Promise< OnboardingData > => {
    return await apiFetch( {
        path: apiPath,
        method: 'GET',
    } );
};

/**
 * Submit onboarding data to the API
 * @param formData
 */
export const postOnboardingData = async (
    formData: FormData
): Promise< any > => {
    const submitData = {
        onboarding: true,
        marketplace_goal: formData.marketplace_goal,
        custom_store_url: formData.custom_store_url,
        share_essentials: formData.share_essentials,
        plugins: formData.plugins,
    };

    return await apiFetch( {
        path: apiPath,
        method: 'POST',
        data: submitData,
    } );
};

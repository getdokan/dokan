// api.ts
import apiFetch from '@wordpress/api-fetch';
import { FormData, OnboardingData } from '../types';

/**
 * Format plugins from API response format to form data format
 * @param plugins
 */
export const formatPlugins = ( plugins: any[] ) => {
    return plugins.map( ( plugin ) => {
        const pluginDetails = plugin?.plugins[ 0 ]?.basename?.split( '/' ) || [
            '',
            '',
        ];
        return {
            id: plugin?.plugins[ 0 ]?.slug,
            info: {
                name: plugin?.plugins[ 0 ]?.name,
                'repo-slug': pluginDetails[ 0 ] || '',
                file: pluginDetails[ 1 ] || '',
            },
        };
    } );
};

/**
 * Fetch onboarding data from the API
 */
export const fetchOnboardingData = async (): Promise< OnboardingData > => {
    return await apiFetch( {
        path: '/dokan/v1/admin-onboarding',
        method: 'GET',
    } );
};

/**
 * Submit onboarding data to the API
 * @param formData
 */
export const submitOnboardingData = async (
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
        path: '/dokan/v1/admin-onboarding',
        method: 'POST',
        data: submitData,
    } );
};

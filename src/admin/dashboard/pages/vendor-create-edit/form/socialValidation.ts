import { __, sprintf } from '@wordpress/i18n';
import {
    getSocialPlatformsConfig,
    getSocialPlatform as getPlatformConfig,
} from '@src/admin/dashboard/config/socialPlatforms';

// Re-export for backward compatibility
export { getSocialPlatformsConfig as getSocialPlatforms };
export { getPlatformConfig as getSocialPlatform };

/**
 * Validate if URL contains the correct domain for the social platform
 * @param url
 * @param platformId
 */
export const validateSocialUrl = (
    url: string,
    platformId: string
): { isValid: boolean; errorMessage: string } => {
    // Empty is valid - optional field
    if ( ! url || url.trim() === '' ) {
        return { isValid: true, errorMessage: '' };
    }

    const platform = getPlatformConfig( platformId );

    if ( ! platform ) {
        return { isValid: true, errorMessage: '' };
    }

    // Check if URL contains any of the valid domains
    const urlLower = url.toLowerCase();
    const isValidDomain = platform.domains.some( ( domain ) =>
        urlLower.includes( domain )
    );

    if ( ! isValidDomain ) {
        const domainsList = platform.domains.join( ', ' );
        return {
            isValid: false,
            errorMessage: sprintf(
                // translators: %1$s is the platform name, %2$s is the list of valid domains
                __(
                    'Please enter a valid %1$s URL (must contain: %2$s)',
                    'dokan-lite'
                ),
                platform.name,
                domainsList
            ),
        };
    }

    return { isValid: true, errorMessage: '' };
};

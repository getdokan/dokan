import { __, sprintf } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';

export interface SocialPlatform {
    id: string;
    name: string;
    domains: string[];
    placeholder: string;
}

/**
 * Get social platforms configuration with filter support
 * Extensions can use this filter to add custom social platforms
 */
export const getSocialPlatforms = (): Record< string, SocialPlatform > => {
    const defaultPlatforms: Record< string, SocialPlatform > = {
        fb: {
            id: 'fb',
            name: 'Facebook',
            domains: [ 'facebook.com', 'fb.com', 'fb.me' ],
            placeholder: 'https://facebook.com/username',
        },
        twitter: {
            id: 'twitter',
            name: 'X (Twitter)',
            domains: [ 'x.com', 'twitter.com' ],
            placeholder: 'https://x.com/username',
        },
        pinterest: {
            id: 'pinterest',
            name: 'Pinterest',
            domains: [ 'pinterest.com', 'pin.it' ],
            placeholder: 'https://pinterest.com/username',
        },
        linkedin: {
            id: 'linkedin',
            name: 'LinkedIn',
            domains: [ 'linkedin.com' ],
            placeholder: 'https://linkedin.com/in/username',
        },
        youtube: {
            id: 'youtube',
            name: 'YouTube',
            domains: [ 'youtube.com', 'youtu.be' ],
            placeholder: 'https://youtube.com/c/username',
        },
        instagram: {
            id: 'instagram',
            name: 'Instagram',
            domains: [ 'instagram.com' ],
            placeholder: 'https://instagram.com/username',
        },
        flickr: {
            id: 'flickr',
            name: 'Flickr',
            domains: [ 'flickr.com' ],
            placeholder: 'https://flickr.com/photos/username',
        },
        threads: {
            id: 'threads',
            name: 'Threads',
            domains: [ 'threads.net' ],
            placeholder: 'https://threads.net/username',
        },
    };

    // Apply filter to allow extensions to modify platforms
    // @ts-ignore
    return applyFilters(
        'dokan_vendor_social_platforms',
        defaultPlatforms
    ) as Record< string, SocialPlatform >;
};

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

    const platforms = getSocialPlatforms();
    const platform = platforms[ platformId ];

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

/**
 * Get platform configuration by ID
 * @param platformId
 */
export const getSocialPlatform = (
    platformId: string
): SocialPlatform | undefined => {
    const platforms = getSocialPlatforms();
    return platforms[ platformId ];
};

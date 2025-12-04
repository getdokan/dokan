import { __ } from '@wordpress/i18n';
import { applyFilters } from '@wordpress/hooks';
// Social icon components
import Facebook from '@src/admin/dashboard/icons/socials/Facebook';
import YouTube from '@src/admin/dashboard/icons/socials/YouTube';
import Twitter from '@src/admin/dashboard/icons/socials/Twitter';
import LinkedIn from '@src/admin/dashboard/icons/socials/LinkedIn';
import Pinterest from '@src/admin/dashboard/icons/socials/Pinterest';
import Instagram from '@src/admin/dashboard/icons/socials/Instagram';
import Threads from '@src/admin/dashboard/icons/socials/Threads';
import TikTok from '@src/admin/dashboard/icons/socials/TikTok';
import Flickr from 'admin/dashboard/icons/socials/Flickr';

export interface SocialPlatformConfig {
    id: string;
    key: string; // For backward compatibility with vendor.social object keys
    name: string;
    label: string;
    domains: string[];
    placeholder: string;
    icon: JSX.Element;
    getIcon?: ( size?: string ) => JSX.Element; // Dynamic icon with custom size
}

/**
 * Get icon component for a platform with specified size
 * @param IconComponent
 * @param size
 */
const getIconComponent = (
    IconComponent: any,
    size: string = 'w-[27px] h-[27px]'
): JSX.Element => {
    return <IconComponent className={ size } />;
};

/**
 * Get centralized social platforms configuration
 * This is the single source of truth for all social platform data
 * Used by: Form fields, Display components, Validation, etc.
 * @param iconSize - Custom icon size (default: 27px for display, use 40px for forms)
 */
export const getSocialPlatformsConfig = (
    iconSize: string = 'w-[27px] h-[27px]'
): Record< string, SocialPlatformConfig > => {
    const defaultPlatforms: Record< string, SocialPlatformConfig > = {
        fb: {
            id: 'fb',
            key: 'fb',
            name: 'Facebook',
            label: __( 'Facebook', 'dokan-lite' ),
            domains: [ 'facebook.com', 'fb.com', 'fb.me' ],
            placeholder: 'https://facebook.com/username',
            icon: getIconComponent( Facebook, iconSize ),
            getIcon: ( size ) => getIconComponent( Facebook, size ),
        },
        twitter: {
            id: 'twitter',
            key: 'twitter',
            name: 'X (Twitter)',
            label: __( 'X', 'dokan-lite' ),
            domains: [ 'x.com', 'twitter.com' ],
            placeholder: 'https://x.com/username',
            icon: getIconComponent( Twitter, iconSize ),
            getIcon: ( size ) => getIconComponent( Twitter, size ),
        },
        pinterest: {
            id: 'pinterest',
            key: 'pinterest',
            name: 'Pinterest',
            label: __( 'Pinterest', 'dokan-lite' ),
            domains: [ 'pinterest.com', 'pin.it' ],
            placeholder: 'https://pinterest.com/username',
            icon: getIconComponent( Pinterest, iconSize ),
            getIcon: ( size ) => getIconComponent( Pinterest, size ),
        },
        linkedin: {
            id: 'linkedin',
            key: 'linkedin',
            name: 'LinkedIn',
            label: __( 'Linkedin', 'dokan-lite' ),
            domains: [ 'linkedin.com' ],
            placeholder: 'https://linkedin.com/in/username',
            icon: getIconComponent( LinkedIn, iconSize ),
            getIcon: ( size ) => getIconComponent( LinkedIn, size ),
        },
        youtube: {
            id: 'youtube',
            key: 'youtube',
            name: 'YouTube',
            label: __( 'Youtube', 'dokan-lite' ),
            domains: [ 'youtube.com', 'youtu.be' ],
            placeholder: 'https://youtube.com/c/username',
            icon: getIconComponent( YouTube, iconSize ),
            getIcon: ( size ) => getIconComponent( YouTube, size ),
        },
        tiktok: {
            id: 'tiktok',
            key: 'tiktok',
            name: 'TikTok',
            label: __( 'TikTok', 'dokan-lite' ),
            domains: [ 'tiktok.com', 'vm.tiktok.com', 'www.tiktok.com' ],
            placeholder: 'https://tiktok.com/@username',
            icon: getIconComponent( TikTok, iconSize ),
            getIcon: ( size ) => getIconComponent( TikTok, size ),
        },
        instagram: {
            id: 'instagram',
            key: 'instagram',
            name: 'Instagram',
            label: __( 'Instagram', 'dokan-lite' ),
            domains: [ 'instagram.com' ],
            placeholder: 'https://instagram.com/username',
            icon: getIconComponent( Instagram, iconSize ),
            getIcon: ( size ) => getIconComponent( Instagram, size ),
        },
        flickr: {
            id: 'flickr',
            key: 'flickr',
            name: 'Flickr',
            label: __( 'Flickr', 'dokan-lite' ),
            domains: [ 'flickr.com' ],
            placeholder: 'https://flickr.com/photos/username',
            icon: getIconComponent( Flickr, iconSize ),
            getIcon: ( size ) => getIconComponent( Flickr, size ),
        },
        threads: {
            id: 'threads',
            key: 'threads',
            name: 'Threads',
            label: __( 'Threads', 'dokan-lite' ),
            domains: [ 'threads.net' ],
            placeholder: 'https://threads.net/username',
            icon: getIconComponent( Threads, iconSize ),
            getIcon: ( size ) => getIconComponent( Threads, size ),
        },
    };

    // Apply filter to allow extensions to modify platforms
    // @ts-ignore
    return applyFilters(
        'dokan_social_platforms_config',
        defaultPlatforms
    ) as Record< string, SocialPlatformConfig >;
};

/**
 * Get social platforms as array (ordered for rendering)
 * @param iconSize - Custom icon size (default: 27px for display, use 'w-10 h-10' for forms)
 */
export const getSocialPlatformsArray = (
    iconSize?: string
): SocialPlatformConfig[] => {
    const platforms = getSocialPlatformsConfig( iconSize );
    return Object.values( platforms );
};

/**
 * Get single platform configuration by ID
 * @param platformId
 * @param iconSize   - Custom icon size
 */
export const getSocialPlatform = (
    platformId: string,
    iconSize?: string
): SocialPlatformConfig | undefined => {
    const platforms = getSocialPlatformsConfig( iconSize );
    return platforms[ platformId ];
};

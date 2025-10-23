import { VendorSocial } from '@dokan/definitions/dokan-vendors';
import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { DokanTooltip as Tooltip } from '@dokan/components';
import Facebook from '@src/admin/dashboard/icons/socials/Facebook';
import YouTube from '@src/admin/dashboard/icons/socials/YouTube';
import Twitter from '@src/admin/dashboard/icons/socials/Twitter';
import LinkedIn from '@src/admin/dashboard/icons/socials/LinkedIn';
import Pinterest from '@src/admin/dashboard/icons/socials/Pinterest';
import Instagram from '@src/admin/dashboard/icons/socials/Instagram';
import Threads from '@src/admin/dashboard/icons/socials/Threads';

export interface SocialLinksProps {
    social: VendorSocial;
}

const SocialLinks = ( { social }: SocialLinksProps ) => {
    let socialPlatforms = [
        {
            key: 'fb',
            label: __( 'Facebook', 'dokan-lite' ),
            url: social.fb,
            icon: <Facebook />,
        },
        {
            key: 'youtube',
            label: __( 'YouTube', 'dokan-lite' ),
            url: social.youtube,
            icon: <YouTube />,
        },
        {
            key: 'twitter',
            label: __( 'Twitter', 'dokan-lite' ),
            url: social.twitter,
            icon: <Twitter />,
        },
        {
            key: 'linkedin',
            label: __( 'LinkedIn', 'dokan-lite' ),
            url: social.linkedin,
            icon: <LinkedIn />,
        },
        {
            key: 'pinterest',
            label: __( 'Pinterest', 'dokan-lite' ),
            url: social.pinterest,
            icon: <Pinterest />,
        },
        {
            key: 'instagram',
            label: __( 'Instagram', 'dokan-lite' ),
            url: social.instagram,
            icon: <Instagram />,
        },
        {
            key: 'threads',
            label: __( 'Threads', 'dokan-lite' ),
            url: social.threads,
            icon: <Threads />,
        },
    ];

    // @ts-ignore
    socialPlatforms = wp.hooks.applyFilters(
        'dokan_admin_dashboard_social_platforms_map',
        socialPlatforms
    );
    const availablePlatforms = socialPlatforms.filter(
        ( platform ) => platform.url
    );

    if ( availablePlatforms.length === 0 ) {
        return (
            <p className="text-neutral-700 text-sm font-normal">
                { __( 'No Social Links Added', 'dokan-lite' ) }
            </p>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-1">
            { availablePlatforms.map( ( platform ) => (
                <Tooltip
                    content={ platform.label }
                    key={ platform.key }
                    direction="top"
                    contentClass="bg-gray-800 text-white p-2 rounded-md"
                >
                    <span
                        className="w-7 h-7 flex hover:cursor-pointer"
                        aria-label={ platform.label }
                    >
                        { typeof platform.icon === 'string' ? (
                            <RawHTML key={ platform.key + '_icon' }>
                                { platform.icon }
                            </RawHTML>
                        ) : (
                            platform.icon
                        ) }
                    </span>
                </Tooltip>
            ) ) }
        </div>
    );
};

export default SocialLinks;

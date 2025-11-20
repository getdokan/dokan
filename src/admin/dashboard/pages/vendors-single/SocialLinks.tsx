import { VendorSocial } from '@dokan/definitions/dokan-vendors';
import { __ } from '@wordpress/i18n';
import { RawHTML, useMemo } from '@wordpress/element';
import { DokanTooltip as Tooltip } from '@dokan/components';
import { getSocialPlatformsArray } from '@src/admin/dashboard/config/socialPlatforms';

export interface SocialLinksProps {
    social: VendorSocial;
}

const SocialLinks = ( { social }: SocialLinksProps ) => {
    const platformsConfig = useMemo( () => getSocialPlatformsArray(), [] );

    // Map platforms to include URL from vendor social data
    const socialPlatforms = useMemo(
        () =>
            platformsConfig.map( ( platform ) => ( {
                key: platform.key,
                label: platform.label,
                url: social[ platform.key as keyof VendorSocial ],
                icon: platform.icon,
            } ) ),
        [ platformsConfig, social ]
    );

    const availablePlatforms = useMemo(
        () => socialPlatforms.filter( ( platform ) => platform.url ),
        [ socialPlatforms ]
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
                    <a
                        href={ platform.url ?? '#' }
                        target="_blank"
                        rel="noreferrer"
                    >
                        { typeof platform.icon === 'string' ? (
                            <RawHTML
                                key={ platform.key + '_icon' }
                                className="w-7 h-7 flex hover:cursor-pointer"
                                aria-label={ platform.label }
                            >
                                { platform.icon }
                            </RawHTML>
                        ) : (
                            platform.icon
                        ) }
                    </a>
                </Tooltip>
            ) ) }
        </div>
    );
};

export default SocialLinks;

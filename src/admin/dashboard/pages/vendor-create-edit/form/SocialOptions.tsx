import { __ } from '@wordpress/i18n';
import { useMemo } from '@wordpress/element';
import { Card } from '@getdokan/dokan-ui';
import { Slot } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { SocialField } from './SocialField';
import { SectionProps } from './types';
import { getSocialPlatforms } from './socialValidation';
// Social icon components
import Facebook from '@src/admin/dashboard/icons/socials/Facebook';
import YouTube from '@src/admin/dashboard/icons/socials/YouTube';
import Twitter from '@src/admin/dashboard/icons/socials/Twitter';
import LinkedIn from '@src/admin/dashboard/icons/socials/LinkedIn';
import Pinterest from '@src/admin/dashboard/icons/socials/Pinterest';
import Instagram from '@src/admin/dashboard/icons/socials/Instagram';
import Threads from '@src/admin/dashboard/icons/socials/Threads';
import Flickr from 'admin/dashboard/icons/socials/Flickr';

interface SocialFieldConfig {
    platformId: string;
    label: string;
    icon: JSX.Element;
    slotName: string;
}

export const SocialOptions = ( { vendor, setData }: SectionProps ) => {
    const socialPlatforms = useMemo( () => getSocialPlatforms(), [] );

    // Social fields configuration - can be filtered for extensibility
    const socialFields: SocialFieldConfig[] = useMemo(
        () =>
            applyFilters( 'dokan_vendor_social_fields_config', [
                {
                    platformId: 'fb',
                    label: __( 'Facebook', 'dokan-lite' ),
                    icon: <Facebook className="w-10 h-10" />,
                    slotName: 'dokan-vendor-edit-after-fb-social-information',
                },
                {
                    platformId: 'twitter',
                    label: __( 'X', 'dokan-lite' ),
                    icon: <Twitter className="w-10 h-10" />,
                    slotName: 'dokan-vendor-edit-after-x-social-information',
                },
                {
                    platformId: 'pinterest',
                    label: __( 'Pinterest', 'dokan-lite' ),
                    icon: <Pinterest className="w-10 h-10" />,
                    slotName:
                        'dokan-vendor-edit-after-pinterest-social-information',
                },
                {
                    platformId: 'linkedin',
                    label: __( 'Linkedin', 'dokan-lite' ),
                    icon: <LinkedIn className="w-10 h-10" />,
                    slotName:
                        'dokan-vendor-edit-after-linkedin-social-information',
                },
                {
                    platformId: 'youtube',
                    label: __( 'Youtube', 'dokan-lite' ),
                    icon: <YouTube className="w-10 h-10" />,
                    slotName:
                        'dokan-vendor-edit-after-youtube-social-information',
                },
                {
                    platformId: 'instagram',
                    label: __( 'Instagram', 'dokan-lite' ),
                    icon: <Instagram className="w-10 h-10" />,
                    slotName:
                        'dokan-vendor-edit-after-instagram-social-information',
                },
                {
                    platformId: 'flickr',
                    label: __( 'Flickr', 'dokan-lite' ),
                    icon: <Flickr className="w-10 h-10" />,
                    slotName:
                        'dokan-vendor-edit-after-flickr-social-information',
                },
                {
                    platformId: 'threads',
                    label: __( 'Threads', 'dokan-lite' ),
                    icon: <Threads className="w-10 h-10" />,
                    slotName:
                        'dokan-vendor-edit-after-threads-social-information',
                },
            ] ) as SocialFieldConfig[],
        []
    );

    return (
        <>
            { /*Social information section*/ }
            <div className="mt-6">
                <Card className="bg-white">
                    <div className="p-8 flex flex-col gap-8">
                        { socialFields.map( ( field ) => {
                            const platform =
                                socialPlatforms[ field.platformId ];
                            if ( ! platform ) {
                                return null;
                            }

                            return (
                                <div key={ field.platformId }>
                                    <SocialField
                                        icon={ field.icon }
                                        label={ field.label }
                                        id={ field.platformId }
                                        platformId={ field.platformId }
                                        value={
                                            vendor?.social?.[
                                                field.platformId
                                            ] || ''
                                        }
                                        placeholder={ platform.placeholder }
                                        onChange={ ( value ) => {
                                            setData( 'social', {
                                                ...vendor?.social,
                                                [ field.platformId ]: value,
                                            } );
                                        } }
                                    />
                                    <Slot name={ field.slotName } />
                                </div>
                            );
                        } ) }
                    </div>
                </Card>
            </div>
        </>
    );
};

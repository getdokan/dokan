import { useMemo } from '@wordpress/element';
import { Card } from '@getdokan/dokan-ui';
import { Slot } from '@wordpress/components';
import { applyFilters } from '@wordpress/hooks';
import { SocialField } from './SocialField';
import { SectionProps } from './types';
import { getSocialPlatformsArray } from '@src/admin/dashboard/config/socialPlatforms';

export const SocialOptions = ( { vendor, setData }: SectionProps ) => {
    const socialPlatforms = useMemo(
        () => getSocialPlatformsArray( 'w-10 h-10' ),
        []
    );

    return (
        <>
            { /*Social information section*/ }
            <div className="mt-6">
                <Card className="bg-white">
                    <div className="p-8 flex flex-col gap-8">
                        { socialPlatforms.map( ( platform ) => {
                            const slotName = `dokan-vendor-edit-after-${ platform.id }-social-information`;

                            return (
                                <div key={ platform.id }>
                                    <SocialField
                                        icon={ platform.icon }
                                        label={ platform.label }
                                        id={ platform.id }
                                        platformId={ platform.id }
                                        value={
                                            vendor?.social?.[ platform.key ] ||
                                            ''
                                        }
                                        placeholder={ platform.placeholder }
                                        onChange={ ( value ) => {
                                            setData( 'social', {
                                                ...vendor?.social,
                                                [ platform.key ]: value,
                                            } );
                                        } }
                                    />
                                    <Slot name={ slotName } />
                                </div>
                            );
                        } ) }
                    </div>
                </Card>
            </div>
        </>
    );
};

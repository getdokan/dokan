import { Vendor } from '@dokan/definitions/dokan-vendors';
import { Card } from '@getdokan/dokan-ui';
import { User } from 'lucide-react';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
import { Slot } from '@wordpress/components';

interface GeneralTabProps {
    vendor: Vendor;
}

const InfoRow = ( {
    label,
    value,
    showDivider,
    defaultValue = __( '--', 'dokan-lite' ),
} ) => (
    <div
        className={ twMerge(
            'flex flex-col gap-1',
            showDivider ? 'border-b-0 md:border-r-[2px]' : ''
        ) }
    >
        <h4 className="text-zinc-500 text-xs font-normal">{ label }</h4>
        <p className="text-neutral-700 text-sm font-semibold break-words overflow-wrap-break-word">
            { value || defaultValue }
        </p>
    </div>
);

const GeneralTab = ( { vendor }: GeneralTabProps ) => {
    const getCountryFromCountryCode = ( countryCode ) => {
        if ( '' === countryCode ) {
            return;
        }

        // @ts-ignore
        return window?.dokanAdminDashboard?.countries[ countryCode ] ?? '';
    };

    const getStateFromStateCode = ( stateCode, countryCode ) => {
        if ( '' === stateCode ) {
            return;
        }

        // @ts-ignore
        const states = window?.dokanAdminDashboard?.states[ countryCode ] ?? '';
        const state = states && states[ stateCode ] ? states[ stateCode ] : '';

        return typeof state !== 'undefined' ? state : [];
    };

    const getStatesFromCountryCode = ( countryCode ) => {
        if ( '' === countryCode ) {
            return;
        }

        const states = [];
        // @ts-ignore
        const statesObject = window?.dokanAdminDashboard?.states;

        for ( const state in statesObject ) {
            if ( state !== countryCode ) {
                continue;
            }

            if ( statesObject[ state ] && statesObject[ state ].length < 1 ) {
                continue;
            }

            for ( const name in statesObject[ state ] ) {
                states.push( {
                    name: statesObject[ state ][ name ],
                    code: name,
                } );
            }
        }

        return states;
    };

    const getState = ( countryCode ) => {
        const states = getStatesFromCountryCode( countryCode );
        const savedState = vendor?.address?.state ?? '';

        if ( states && states.length < 1 ) {
            return savedState;
        }

        return getStateFromStateCode( savedState, countryCode );
    };

    return (
        <div>
            <div className="flex flex-col gap-8">
                { /*General section*/ }
                <div>
                    <div className="text-black bg-[#dadada] w-fit rounded-full pt-1 pb-1 pl-2 pr-2 flex justify-center items-center text-sm mb-4">
                        <User size="12" strokeWidth="3" />
                        <span className="ml-1">
                            { __( 'Profile & Address', 'dokan-lite' ) }
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Card className="bg-white shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoRow
                                    showDivider={ true }
                                    label={ __( 'Name', 'dokan-lite' ) }
                                    value={ `${ vendor?.first_name || '--' } ${
                                        vendor?.last_name || '--'
                                    }` }
                                />
                                <InfoRow
                                    showDivider={ true }
                                    label={ __( 'Country', 'dokan-lite' ) }
                                    value={ getCountryFromCountryCode(
                                        vendor?.address?.country
                                    ) }
                                />
                                <InfoRow
                                    showDivider={ false }
                                    label={ __( 'City', 'dokan-lite' ) }
                                    value={ vendor?.address?.city ?? '--' }
                                />
                            </div>
                        </Card>
                        <Card className="bg-white shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoRow
                                    showDivider={ true }
                                    label={ __( 'State', 'dokan-lite' ) }
                                    value={ getState(
                                        vendor?.address?.country
                                    ) }
                                />
                                <InfoRow
                                    showDivider={ true }
                                    label={ __( 'Address', 'dokan-lite' ) }
                                    value={ `${
                                        vendor?.address?.street_1 ?? '--'
                                    } ${ vendor?.address?.street_2 ?? '--' }` }
                                />
                                <InfoRow
                                    showDivider={ false }
                                    label={ __( 'Zip', 'dokan-lite' ) }
                                    value={ vendor?.address?.zip ?? '--' }
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                <Slot
                    name="dokan-admin-dashboard-vendor-single-generaltab-section-after"
                    fillProps={ {
                        vendor,
                    } }
                />
            </div>
        </div>
    );
};

export default GeneralTab;

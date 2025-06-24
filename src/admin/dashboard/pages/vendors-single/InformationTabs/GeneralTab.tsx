import { Vendor, VendorStats } from '@dokan/definitions/dokan-vendors';
import { Card } from '@getdokan/dokan-ui';
import { Map, MapPin, User } from 'lucide-react';
import Badge from '@dokan/components/Badge';
import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';
import NoInformation from '@dokan/admin/dashboard/pages/vendors-single/components/NoInformation';

interface GeneralTabProps {
    vendor: Vendor;
    vendorStats: VendorStats | null;
}



function chunkArray< T >( arr: T[], chunkSize: number ): T[][] {
    const result: T[][] = [];
    for ( let i = 0; i < arr.length; i += chunkSize ) {
        result.push( arr.slice( i, i + chunkSize ) );
    }
    return result;
}

const InfoRow = ( { label, value, showDivider } ) => (
    <div
        className={ twMerge(
            'flex flex-col gap-1',
            showDivider ? 'border-b-0 md:border-r-[2px]' : ''
        ) }
    >
        <h4 className="text-zinc-500 text-xs font-normal">{ label }</h4>
        <p className="text-neutral-700 text-sm font-semibold">{ value }</p>
    </div>
);

const GeneralTab = ( { vendor, vendorStats }: GeneralTabProps ) => {
    return (
        <div>
            <div className="flex flex-col gap-8">
                { /*General section*/ }
                <div>
                    <div className="text-black bg-[#dadada] w-fit rounded-full pt-1 pb-1 pl-2 pr-2 flex justify-center items-center text-sm mb-4">
                        <User size="12" strokeWidth="3" />
                        <span className="ml-1">
                            { __( 'Profile & Bank Info', 'dokan' ) }
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Card className="bg-white shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoRow
                                    showDivider={ true }
                                    label="Country"
                                    value="Saudi Arabia"
                                />
                                <InfoRow
                                    showDivider={ true }
                                    label="City"
                                    value="Riyadh"
                                />
                                <InfoRow
                                    showDivider={ false }
                                    label="Apartment"
                                    value="7D, Block - D"
                                />
                            </div>
                        </Card>
                        <Card className="bg-white shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoRow
                                    showDivider={ true }
                                    label="Country"
                                    value="Saudi Arabia"
                                />
                                <InfoRow
                                    showDivider={ true }
                                    label="City"
                                    value="Riyadh"
                                />
                                <InfoRow
                                    showDivider={ false }
                                    label="Apartment"
                                    value="7D, Block - D"
                                />
                            </div>
                        </Card>
                    </div>
                </div>

                { /*General section*/ }
                <div>
                    <div className="text-black bg-[#dadada] w-fit rounded-full pt-1 pb-1 pl-2 pr-2 flex justify-center items-center text-sm mb-4">
                        <MapPin size="12" strokeWidth="3" />
                        <span className="ml-1">
                            { __( 'Address Details', 'dokan' ) }
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Card className="bg-white shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoRow
                                    showDivider={ true }
                                    label="Country"
                                    value="Saudi Arabia"
                                />
                                <InfoRow
                                    showDivider={ true }
                                    label="City"
                                    value="Riyadh"
                                />
                                <InfoRow
                                    showDivider={ false }
                                    label="Apartment"
                                    value="7D, Block - D"
                                />
                            </div>
                        </Card>
                        <Card className="bg-white shadow p-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InfoRow
                                    showDivider={ true }
                                    label="Country"
                                    value="Saudi Arabia"
                                />
                                <InfoRow
                                    showDivider={ true }
                                    label="City"
                                    value="Riyadh"
                                />
                                <InfoRow
                                    showDivider={ false }
                                    label="Apartment"
                                    value="7D, Block - D"
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralTab;

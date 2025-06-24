import { Landmark } from 'lucide-react';
import { __ } from '@wordpress/i18n';
import { Card } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';
import { useEffect, useState } from '@wordpress/element';

const InfoRow = ( { label, value, showDivider } ) => (
    <div
        className={ twMerge(
            'flex flex-col gap-1',
            showDivider ? 'border-b-0 md:border-r-[2px]' : ''
        ) }
    >
        <h4 className="text-zinc-500 text-xs font-normal">{ label }</h4>
        <p className="text-neutral-700 text-sm font-semibold break-words overflow-wrap-break-word">
            { value }
        </p>
    </div>
);

function EuVendorTaxFields( { vendor } ) {
    const [ fields, setFields ] = useState( [] );

    function chunkArray< T >( arr: T[], chunkSize: number ): T[][] {
        const result: T[][] = [];
        for ( let i = 0; i < arr.length; i += chunkSize ) {
            result.push( arr.slice( i, i + chunkSize ) );
        }
        return result;
    }

    const getFieldsHtml = () => {
        return fields.map( ( field, fIndex ) => {
            return (
                <Card className="bg-white shadow p-6" key={ fIndex }>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        { Object.values( field ).map( ( item, index ) => {
                            return (
                                <InfoRow
                                    key={ index }
                                    showDivider={
                                        Object.values( field ).length !==
                                        index + 1
                                    }
                                    label={ item?.label }
                                    value={ item?.value }
                                />
                            );
                        } ) }
                    </div>
                </Card>
            );
        } );
    };

    useEffect( () => {
        const vendorEnabledCustomLabels =
            window?.dokanAdminDashboard?.dokan_cf_vendor_labels || {};

        const allFields = [];
        if ( vendorEnabledCustomLabels.hasOwnProperty( 'company_name' ) ) {
            allFields.push( {
                label: vendorEnabledCustomLabels?.company_name,
                value: vendor?.company_name || '--',
            } );
        }

        if ( vendorEnabledCustomLabels.hasOwnProperty( 'company_id_number' ) ) {
            allFields.push( {
                label: vendorEnabledCustomLabels?.company_id_number,
                value: vendor?.company_id_number || '--',
            } );
        }

        if ( vendorEnabledCustomLabels.hasOwnProperty( 'vat_number' ) ) {
            allFields.push( {
                label: vendorEnabledCustomLabels?.vat_number,
                value: vendor?.vat_number || '--',
            } );
        }

        if ( vendorEnabledCustomLabels.hasOwnProperty( 'bank_name' ) ) {
            allFields.push( {
                label: vendorEnabledCustomLabels?.bank_name,
                value: vendor?.bank_name || '--',
            } );
        }

        if ( vendorEnabledCustomLabels.hasOwnProperty( 'bank_iban' ) ) {
            allFields.push( {
                label: vendorEnabledCustomLabels?.bank_iban,
                value: vendor?.bank_iban || '--',
            } );
        }

        setFields( chunkArray( allFields, 3 ) );
    }, [] );

    return (
        <div>
            <div className="text-black bg-[#dadada] w-fit rounded-full pt-1 pb-1 pl-2 pr-2 flex justify-center items-center text-sm mb-4">
                <Landmark size="12" strokeWidth="3" />
                <span className="ml-1">{ __( 'Bank Info', 'dokan' ) }</span>
            </div>
            <div className="flex flex-col gap-4">{ getFieldsHtml() }</div>
        </div>
    );
}

export default EuVendorTaxFields;

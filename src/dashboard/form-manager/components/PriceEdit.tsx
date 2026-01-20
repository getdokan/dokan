import { DokanPriceInput } from '@src/components';
import { formatPrice } from '@src/utilities';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import CustomField from './CustomField';

const PriceEdit = ( { data, field, onChange }: any ) => {
    const [ vendorEarning, setVendorEarning ] = useState(
        Number( data.vendor_earning )
    );

    const vendorEarningHandler = async ( price: number ) => {
        if ( field.id === 'regular_price' ) {
            // fetch the vendor earning
            try {
                const response = await apiFetch( {
                    path: addQueryArgs( '/dokan/v1/commission', {
                        amount: price,
                        product_id: data.id,
                        category_ids: data.category_ids || [],
                        context: 'seller',
                    } ),
                } );
                setVendorEarning( Number( response ) );
            } catch ( error ) {
                setVendorEarning( 0 );
            }
        }
    };

    const LabelRenderer = () => {
        if ( field.id === 'regular_price' ) {
            return (
                <div className="flex gap-1 items-center">
                    { field.label }{ ' ' }
                    { vendorEarning > 0 && (
                        <span className="text-xs font-normal text-gray-500">
                            ( { __( 'Your Earn:', 'dokan-lite' ) }{ ' ' }
                            { formatPrice( vendorEarning ) } )
                        </span>
                    ) }
                </div>
            );
        }

        return field.label;
    };

    return (
        <CustomField label={ <LabelRenderer /> } error={ field.error }>
            <DokanPriceInput
                label=""
                value={ data[ field.id ] }
                namespace={ `field.${ field.id }` }
                className="form-manager-price-input"
                input={ {
                    id: field.id,
                    placeholder: field.placeholder || '',
                } }
                onChange={ ( _, rawValue ) => {
                    onChange( { [ field.id ]: rawValue } );
                    void vendorEarningHandler( rawValue );
                } }
            />
        </CustomField>
    );
};

export default PriceEdit;

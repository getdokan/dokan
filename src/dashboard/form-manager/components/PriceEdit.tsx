import { formatPrice } from '@src/utilities';
import { DokanPriceInput } from '@src/components';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { addQueryArgs } from '@wordpress/url';
import CustomField from './CustomField';

const PriceEdit = ( { data, field, onChange }: any ) => {
    const [ vendorEarning, setVendorEarning ] = useState(
        Number( data[ field.id ] )
    );

    const vendorEarningHandler = async ( price: number ) => {
        if ( field.id === 'regular_price' ) {
            // fetch the vendor earning
            try {
                const path = addQueryArgs( '/dokan/v1/commission', {
                    amount: price,
                    product_id: data.id,
                    category_ids: data.category_ids || [],
                    context: 'seller',
                } );
                const response = await apiFetch( { path } );
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
                    <span className="text-xs font-normal text-gray-500">
                        ( Your Earn: { formatPrice( vendorEarning ) } )
                    </span>
                </div>
            );
        }

        return field.label;
    };

    return (
        <CustomField label={ <LabelRenderer /> }>
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

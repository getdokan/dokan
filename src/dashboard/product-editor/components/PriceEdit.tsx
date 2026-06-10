import { DokanPriceInput } from '@src/components';
import { formatNumber, formatPrice, unformatNumber } from '@src/utilities';
import apiFetch from '@wordpress/api-fetch';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import CustomField, { getValidationError } from './CustomField';
import { decodeEntities } from '@wordpress/html-entities';

const PriceEdit = ( { data, field, onChange, validity }: any ) => {
    const [ vendorEarning, setVendorEarning ] = useState(
        Number( data.vendor_earning )
    );

    // Regular and sale prices can never be negative; restrict input to
    // positive values for these fields only, leaving other price fields
    // (and other DokanPriceInput consumers) free to allow negatives.
    const isPositiveOnly =
        field.id === 'regular_price' || field.id === 'sale_price';

    // Keep the locale-formatted string for display; the store stays canonical.
    const [ displayValue, setDisplayValue ] = useState< string | number >( () =>
        formatNumber( data[ field.id ] ?? '' )
    );

    // Re-sync the display when the stored value changes outside this input
    // (e.g. switching products or external store updates). Comparing the
    // canonical values keeps the value the user is actively typing intact.
    useEffect( () => {
        const stored = data[ field.id ] ?? '';
        setDisplayValue( ( current ) =>
            Number( unformatNumber( current ) ) === Number( stored )
                ? current
                : formatNumber( stored )
        );
    }, [ data, field.id ] );

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
                            { decodeEntities(
                                formatPrice( vendorEarning ) as string
                            ) }{ ' ' }
                            )
                        </span>
                    ) }
                </div>
            );
        }

        return field.label;
    };

    return (
        <CustomField
            field={ field }
            label={ <LabelRenderer /> }
            error={ getValidationError( validity ) }
        >
            <DokanPriceInput
                label=""
                value={ displayValue }
                namespace={ `dokan-field-${ field.id }` }
                className="product-editor-price-input"
                { ...( isPositiveOnly && {
                    maskRule: { numeralPositiveOnly: true },
                } ) }
                input={ {
                    id: field.id,
                    placeholder: field.placeholder || '',
                } }
                onChange={ ( formattedValue, rawValue ) => {
                    setDisplayValue( formattedValue );
                    const value = Number( rawValue );
                    onChange( { [ field.id ]: value } );
                    void vendorEarningHandler( value );
                } }
            />
        </CustomField>
    );
};

export default PriceEdit;

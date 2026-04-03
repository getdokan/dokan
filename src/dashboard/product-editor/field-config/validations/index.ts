import { __ } from '@wordpress/i18n';
import { FieldValidator } from '../../types';


export const isEmpty = ( v: any ) => {
    if ( v === null || v === undefined ) {
        return true;
    }
    if ( typeof v === 'string' ) {
        return v.trim().length === 0;
    }
    if ( Array.isArray( v ) ) {
        return v.length === 0;
    }
    return false;
};

export const salePriceValidator: FieldValidator = ( _field, value ) => {
    if (
        ! isEmpty( value?.sale_price ) &&
        ! isEmpty( value?.regular_price )
    ) {
        const salePrice = parseFloat( value.sale_price );
        const regularPrice = parseFloat( value.regular_price );

        if ( ! isNaN( salePrice ) && ! isNaN( regularPrice ) && salePrice >= regularPrice ) {
            return __(
                'Sale price must be less than the regular price.',
                'dokan-lite'
            );
        }
    }
    return null;
};

export const fieldValidators: Record< string, FieldValidator > = {
    sale_price: salePriceValidator,
};

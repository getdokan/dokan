import { DokanTooltip } from '@src/components';
import { Info } from 'lucide-react';
import { getFieldConfigFrom } from '../field-config';
import { FormItem } from '../types';
import { resolveDependency } from '../utils';
import { __ } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { RawHTML } from '@wordpress/element';

export const getFieldConfig = ( field: FormItem ) => {
    /**
     * Helper function to normalize options into an array of label/value objects.
     */
    const getElementsFromOptions = ( field?: FormItem ) => {
        const { options } = field || {};
        if ( ! options ) {
            return [];
        }

        let normalizedOptions = [];
        if ( Array.isArray( options ) ) {
            normalizedOptions = [ ...options ]; // Clone to prevent mutation of the original array
        } else {
            normalizedOptions = Object.entries( options ).map(
                ( [ value, label ] ) => ( {
                    label,
                    value,
                } )
            );
        }
        return normalizedOptions;
    };
    const mappedField = {
        ...field,
        label: (
            <div className="flex gap-1 items-center">
                <RawHTML className="dokan-form-field-label">
                    { decodeEntities( field.label ) }
                </RawHTML>
                { field.tooltip && (
                    <DokanTooltip content={ field.tooltip }>
                        <Info size={ 16 } />
                    </DokanTooltip>
                ) }
            </div>
        ),
        type: field.variant,
        placeholder: field.placeholder,
        elements: getElementsFromOptions( field ),
        isValid: {
            required: field.required || false,
            // Disable built-in "Value must be one of the elements." so custom validation is used.
            elements: false,
            custom: ( value: any ) => {
                const isEmpty = ( v: any ) => {
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
                if ( field.required && isEmpty( value?.[ field.id ] ) ) {
                    return __( 'Please fill out this field.', 'dokan-lite' );
                }
                return null;
            },
        },
        isVisible: ( data: Record< string, any > ) => {
            if ( field.visibility === false ) {
                return false;
            }
            return resolveDependency( field, data );
        },
    };

    const specificConfig = getFieldConfigFrom( field );
    Object.assign( mappedField, specificConfig );

    if ( field.description ) {
        mappedField.description = (
            <span>{ decodeEntities( field.description as string ) }</span>
        );
    }

    return mappedField;
};

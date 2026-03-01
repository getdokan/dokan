import { DokanTooltip } from '@src/components';
import { Info } from 'lucide-react';
import { sanitizeHTML } from '../../../utilities';
import { getFieldConfigFrom } from '../field-config';
import { FormField } from '../types';
import { resolveDependency } from '../utils';

export const getFieldConfig = ( field: FormField ) => {
    /**
     * Helper function to normalize options into an array of label/value objects.
     */
    const getElementsFromOptions = ( field?: FormField ) => {
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
                <span
                    className="dokan-form-field-label"
                    dangerouslySetInnerHTML={ {
                        __html: sanitizeHTML( field.label ),
                    } }
                />
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
            <span
                dangerouslySetInnerHTML={ {
                    __html: sanitizeHTML( field.description as string ),
                } }
            />
        );
    }

    return mappedField;
};

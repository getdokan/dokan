import {
    SettingsElement,
    SettingsElementValidation,
} from '../../../stores/adminSettings/types';
import { sprintf, __ } from '@wordpress/i18n';

/**
 * Check if a value is empty.
 *
 * @param {any} value The value to check.
 *
 * @return {boolean} True if empty, false otherwise.
 */
const isValueEmpty = ( value: any ): boolean => {
    if (
        value === undefined ||
        value === null ||
        String( value ).trim() === ''
    ) {
        return true;
    }

    if ( typeof value === 'object' ) {
        if ( Array.isArray( value ) ) {
            return value.length === 0;
        }

        const keys = Object.keys( value );
        if ( keys.length === 0 ) {
            return true;
        }

        // Special handling for combine_input
        if (
            keys.includes( 'additional_fee' ) &&
            keys.includes( 'admin_percentage' )
        ) {
            return (
                isValueEmpty( value.additional_fee ) ||
                isValueEmpty( value.admin_percentage )
            );
        }

        // Special handling for category_based_commission
        if ( keys.includes( 'all' ) && typeof value.all === 'object' ) {
            return (
                isValueEmpty( value.all.flat ) ||
                isValueEmpty( value.all.percentage )
            );
        }

        // For other objects, it's empty if all values are empty
        return Object.values( value ).every( ( val ) => isValueEmpty( val ) );
    }

    return false;
};

/**
 * Extract values list from params for in_array/not_in validation.
 * Handles both indexed arrays and associative arrays with 'values' key.
 *
 * @param {any} params The validation params.
 *
 * @return {any[]} Array of values to check against.
 */
const getValuesFromParams = ( params: any ): any[] => {
    if ( ! params ) {
        return [];
    }

    // If params has 'values' key (normalized structure from PHP)
    if ( params.values && Array.isArray( params.values ) ) {
        return params.values.filter( ( item: any ) => ! isValueEmpty( item ) );
    }

    // If params is already an array (legacy indexed array)
    if ( Array.isArray( params ) ) {
        return params.filter( ( item ) => ! isValueEmpty( item ) );
    }

    // If params is an object (associative array), extract values
    if ( typeof params === 'object' ) {
        return Object.values( params ).filter(
            ( item ) => ! isValueEmpty( item )
        );
    }

    return [];
};

/**
 * Extract min value from params.
 * Handles both indexed arrays and associative arrays with 'min' key.
 *
 * @param {any} params The validation params.
 *
 * @return {number} The minimum value.
 */
const getMinFromParams = ( params: any ): number => {
    if ( ! params ) {
        return 0;
    }

    // If params has 'min' key (normalized structure from PHP)
    if ( params.min !== undefined && params.min !== null ) {
        return parseFloat( params.min );
    }

    // If params is an array (legacy indexed array), first element is min
    if ( Array.isArray( params ) && params.length > 0 ) {
        return parseFloat( params[ 0 ] );
    }

    // If params is a string/number
    if ( typeof params === 'string' || typeof params === 'number' ) {
        return parseFloat( params as string );
    }

    return 0;
};

/**
 * Extract max value from params.
 * Handles both indexed arrays and associative arrays with 'max' key.
 *
 * @param {any} params The validation params.
 *
 * @return {number} The maximum value.
 */
const getMaxFromParams = ( params: any ): number => {
    if ( ! params ) {
        return Infinity;
    }

    // If params has 'max' key (normalized structure from PHP)
    if ( params.max !== undefined && params.max !== null ) {
        return parseFloat( params.max );
    }

    // If params is an array (legacy indexed array), second element is max
    if ( Array.isArray( params ) && params.length > 1 ) {
        return parseFloat( params[ 1 ] );
    }

    // If params is a string/number
    if ( typeof params === 'string' || typeof params === 'number' ) {
        return parseFloat( params as string );
    }

    return Infinity;
};

const validateRule = (
    value: any,
    rule: string,
    params: SettingsElementValidation[ 'params' ]
): { isValid: boolean; errorMessage: string } => {
    switch ( rule ) {
        case 'required':
        case 'not_empty':
            return {
                isValid: ! isValueEmpty( value ),
                errorMessage: __( 'This field is required.', 'dokan-lite' ),
            };

        case 'not_in':
            const restrictedList = getValuesFromParams( params );

            if ( restrictedList.length === 0 || isValueEmpty( value ) ) {
                return { isValid: true, errorMessage: '' };
            }

            const isRestricted = restrictedList.some(
                ( item ) =>
                    String( item ).toLowerCase() ===
                    String( value ).toLowerCase()
            );
            return {
                isValid: ! isRestricted,
                errorMessage: __( 'This value is restricted.', 'dokan-lite' ),
            };

        case 'in_array':
            const allowedList = getValuesFromParams( params );

            if ( allowedList.length === 0 ) {
                return { isValid: true, errorMessage: '' };
            }

            if ( isValueEmpty( value ) ) {
                return {
                    isValid: false,
                    errorMessage: __( 'This field is required.', 'dokan-lite' ),
                };
            }

            const isAllowed = allowedList.some(
                ( item ) =>
                    String( item ).toLowerCase() ===
                    String( value ).toLowerCase()
            );
            return {
                isValid: isAllowed,
                errorMessage: __( 'Selected value is invalid.', 'dokan-lite' ),
            };

        case 'min_value':
            const minValue = getMinFromParams( params );
            return {
                isValid:
                    isValueEmpty( value ) || parseFloat( value ) >= minValue,
                errorMessage: sprintf(
                    /* translators: %s: minimum value */
                    __( 'Minimum value is %s.', 'dokan-lite' ),
                    minValue
                ),
            };

        case 'max_value':
            const maxValue = getMaxFromParams( params );
            return {
                isValid:
                    isValueEmpty( value ) || parseFloat( value ) <= maxValue,
                errorMessage: sprintf(
                    /* translators: %s: maximum value */
                    __( 'Maximum value is %s.', 'dokan-lite' ),
                    maxValue
                ),
            };

        default:
            return { isValid: true, errorMessage: '' };
    }
};

const validateElement = (
    element: SettingsElement,
    validation: SettingsElementValidation
): { isValid: boolean; errorMessage: string } => {
    const rules = validation.rules?.split( '|' ) || [];
    const value = element.value;

    for ( const rule of rules ) {
        const result = validateRule( value, rule.trim(), validation.params );
        if ( ! result.isValid ) {
            let errorMessage = validation.message || result.errorMessage;

            if ( errorMessage.includes( '%s' ) ) {
                errorMessage = ( sprintf as any )(
                    errorMessage,
                    String( value )
                ); // eslint-disable-line @wordpress/valid-sprintf
            }

            return {
                isValid: false,
                errorMessage,
            };
        }
    }

    return { isValid: true, errorMessage: '' };
};

const settingsValidationApplicator = (
    settings: SettingsElement[],
    validations: SettingsElementValidation[]
): { settings: SettingsElement[]; hasErrors: boolean } => {
    let hasErrors = false;

    const processedSettings = settings.map( ( element ) => {
        const elementValidations = validations.filter(
            ( validation ) => validation.self === element.dependency_key
        );

        let validationError = '';

        elementValidations.forEach( ( validation ) => {
            const result = validateElement( element, validation );
            if ( ! result.isValid ) {
                validationError = result.errorMessage;
                hasErrors = true;
            }
        } );

        const updatedElement = {
            ...element,
            validationError,
        };

        if ( element.children && element.children.length > 0 ) {
            const childResult = settingsValidationApplicator(
                [ ...element.children ],
                validations
            );
            updatedElement.children = childResult.settings;
            if ( childResult.hasErrors ) {
                hasErrors = true;
            }
        }

        return updatedElement;
    } );

    return { settings: processedSettings, hasErrors };
};

export default settingsValidationApplicator;

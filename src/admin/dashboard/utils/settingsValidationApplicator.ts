import {
    SettingsElement,
    SettingsElementValidation,
} from '../../../stores/adminSettings/types';
import { sprintf, __ } from '@wordpress/i18n';

const validateRule = (
    value: any,
    rule: string,
    params: SettingsElementValidation[ 'params' ]
): { isValid: boolean; errorMessage: string } => {
    switch ( rule ) {
        case 'required':
            return {
                isValid: value !== undefined && value !== null && value !== '',
                errorMessage: __( 'This field is required.', 'dokan-lite' ),
            };

        case 'not_empty':
            return {
                isValid:
                    typeof value === 'string'
                        ? value.trim().length > 0
                        : !! value,
                errorMessage: __( 'This field cannot be empty.', 'dokan-lite' ),
            };

        case 'not_in':
            const restrictedList = Array.isArray( params ) ? params : [];
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
            const allowedList = Array.isArray( params ) ? params : [];
            const isAllowed = allowedList.some(
                ( item ) =>
                    String( item ).toLowerCase() ===
                    String( value ).toLowerCase()
            );
            return {
                isValid: isAllowed,
                errorMessage: __( 'Selected value is invalid.', 'dokan-lite' ),
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

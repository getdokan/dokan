import { dispatch, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
    DokanBaseTextField,
    DokanFieldLabel,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { FieldValidationError } from '../../../../../../stores/adminSettings/types';

interface ValidationRule {
    type: 'pattern' | 'reserved_values';
    value: string | string[];
    error_type: string;
}

interface TextFieldElement {
    hook_key: string;
    id: string;
    display: boolean;
    title?: string;
    description?: string;
    tooltip?: string;
    image_url?: string;
    placeholder?: string;
    disabled?: boolean;
    type?: string;
    value?: string;
    defaultValue?: string;
    required?: boolean;
    validation_error_messages?: Record< string, string >;
    validation_rules?: ValidationRule[];
}

/**
 * Validate a value against the field's validation rules (client-side).
 *
 * @param value   The value to validate.
 * @param element The field element with validation configuration.
 * @return Validation error object or null if valid.
 */
function validateField(
    value: string,
    element: TextFieldElement
): FieldValidationError | null {
    // Check required (client-side validation)
    if ( element.required && ( ! value || value.trim() === '' ) ) {
        return {
            hook_key: element.hook_key,
            field: element.id,
            error_type: 'required',
            message:
                element.validation_error_messages?.required ||
                __( 'This field is required.', 'dokan-lite' ),
        };
    }

    // Skip other validations if value is empty and not required
    if ( ! value || value.trim() === '' ) {
        return null;
    }

    // Check validation rules
    if ( element.validation_rules && element.validation_rules.length > 0 ) {
        for ( const rule of element.validation_rules ) {
            if ( rule.type === 'pattern' && typeof rule.value === 'string' ) {
                // Validate against regex pattern
                const regex = new RegExp( rule.value );
                if ( ! regex.test( value ) ) {
                    return {
                        hook_key: element.hook_key,
                        field: element.id,
                        error_type: rule.error_type,
                        message:
                            element.validation_error_messages?.[
                                rule.error_type
                            ] || __( 'Invalid value.', 'dokan-lite' ),
                    };
                }
            } else if (
                rule.type === 'reserved_values' &&
                Array.isArray( rule.value )
            ) {
                // Check if value is in reserved values list
                if ( rule.value.includes( value ) ) {
                    return {
                        hook_key: element.hook_key,
                        field: element.id,
                        error_type: rule.error_type,
                        message:
                            element.validation_error_messages?.[
                                rule.error_type
                            ] || __( 'This value is reserved.', 'dokan-lite' ),
                    };
                }
            }
        }
    }

    return null;
}

export default function DokanTextField( {
    element,
}: {
    element: TextFieldElement;
} ) {
    const fieldError = useSelect(
        ( select ) => select( settingsStore ).getFieldError( element.hook_key ),
        [ element.hook_key ]
    );

    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement: TextFieldElement ) => {
        const newValue = updatedElement.value || '';

        // Update the settings value first
        dispatch( settingsStore ).updateSettingsValue( updatedElement );

        // Perform client-side validation after updating value
        // This ensures setFieldErrors runs last and controls needSaving correctly
        const validationError = validateField( newValue, element );

        if ( validationError ) {
            // Set the specific field error (this will set needSaving to false)
            dispatch( settingsStore ).setFieldErrors( [ validationError ] );
        } else {
            // Clear errors if validation passes (this will restore needSaving based on changes)
            dispatch( settingsStore ).clearFieldErrors();
        }
    };

    const hasTitle = Boolean( element.title && element.title.length > 0 );
    const hasError = Boolean( fieldError );

    return (
        <div
            className="grid-cols-12 grid gap-2 justify-between w-full p-4"
            id={ element.hook_key }
        >
            { hasTitle && (
                <div className={ 'sm:col-span-8 col-span-12' }>
                    <DokanFieldLabel
                        title={ element.title }
                        titleFontWeight="bold"
                        helperText={ element.description }
                        tooltip={ element.tooltip }
                        imageUrl={ element?.image_url }
                        wrapperClassNames={ 'w-full' }
                    />
                </div>
            ) }
            <div
                className={
                    hasTitle ? 'sm:col-span-4 col-span-12' : 'col-span-12'
                }
            >
                <DokanBaseTextField
                    value={ element.value || element?.defaultValue || '' }
                    onChange={ ( val ) =>
                        onValueChange( { ...element, value: val } )
                    }
                    placeholder={ element.placeholder }
                    disabled={ element.disabled }
                    inputType={ element.type || 'text' }
                />
            </div>
            { hasError && (
                <p className="text-red-500 text-sm col-span-12">
                    { fieldError.message }
                </p>
            ) }
        </div>
    );
}

import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { useSettings, Input, type SettingsElement } from '@wedevs/plugin-ui';

// `vendor_text` variant — a text input whose label can carry the red
// "(Required)" marker the built-in text field has no slot for. Validation
// still runs through the engine: `updateValue` re-checks `element.validations`,
// so `not_empty` (and the shared save-disabled/error state) behaves exactly
// like the native field.
const VendorTextField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const value = String( element.value ?? element.default ?? '' );
    const error = element.validationError as string | undefined;

    return (
        <div className="dokan-vendor-text-field flex w-full flex-col gap-2 p-4">
            <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                { element.title }
                { element.required && (
                    <span className="text-xs font-normal text-red-500">
                        { __( '(Required)', 'dokan-lite' ) }
                    </span>
                ) }
            </span>
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }
            <Input
                value={ value }
                onChange={ ( event ) =>
                    updateValue( fieldKey, event.target.value )
                }
                placeholder={
                    element.placeholder
                        ? String( element.placeholder )
                        : undefined
                }
                aria-invalid={ error ? true : undefined }
                className={ error ? 'border-red-500' : undefined }
            />
            { error && (
                <div className="text-sm text-red-600">
                    <RawHTML>{ error }</RawHTML>
                </div>
            ) }
        </div>
    );
};

export default VendorTextField;

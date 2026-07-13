import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import { Info } from 'lucide-react';

// `vendor_textarea` variant — a plain textarea whose label can carry the red "(Required)" marker, with an icon-led helper note below (the built-in `textarea` offers neither).
const VendorTextareaField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const value = String( element.value ?? element.default ?? '' );
    const error = element.validationError as string | undefined;

    return (
        <div className="dokan-vendor-textarea-field flex w-full flex-col gap-2 p-4">
            <label
                htmlFor={ `${ fieldKey }-textarea` }
                className="flex items-center gap-1.5 text-sm font-semibold text-gray-900"
            >
                { element.title }
                { element.required && (
                    <span className="text-xs font-normal text-red-500">
                        { __( '(Required)', 'dokan-lite' ) }
                    </span>
                ) }
            </label>
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }
            <textarea
                id={ `${ fieldKey }-textarea` }
                rows={ 4 }
                className="w-full rounded-md border border-gray-300 bg-white p-3 text-sm text-gray-900 placeholder:text-gray-400"
                placeholder={
                    element.placeholder
                        ? String( element.placeholder )
                        : __( 'Write here', 'dokan-lite' )
                }
                value={ value }
                onChange={ ( event ) =>
                    updateValue( fieldKey, event.target.value )
                }
            />
            { /* Same quiet inline-note anatomy as the Min-Max disclaimer, with the icon in the link colour. */ }
            { element.helper_text && (
                <span className="flex items-start gap-2 text-[13px] leading-normal text-gray-500">
                    <Info
                        size={ 16 }
                        className="text-dokan-link mt-px shrink-0"
                    />
                    { element.helper_text }
                </span>
            ) }
            { error && (
                <div className="text-sm text-red-600">
                    <RawHTML>{ error }</RawHTML>
                </div>
            ) }
        </div>
    );
};

export default VendorTextareaField;

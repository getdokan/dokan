import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import {
    useSettings,
    RichTextEditor,
    type SettingsElement,
} from '@wedevs/plugin-ui';

// `vendor_rich_text` variant — a rich-text field whose label carries the red "(Required)" marker the built-in `rich_text` lacks (legacy "TOC Details *").
const VendorRichTextField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const value = String( element.value ?? element.default ?? '' );
    const error = element.validationError as string | undefined;

    return (
        <div className="dokan-vendor-rich-text-field flex w-full flex-col gap-2 p-4">
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
            <RichTextEditor
                value={ value }
                onChange={ ( next: string ) => updateValue( fieldKey, next ) }
                placeholder={
                    element.placeholder
                        ? String( element.placeholder )
                        : undefined
                }
            />
            { error && (
                <div className="text-sm text-red-600">
                    <RawHTML>{ error }</RawHTML>
                </div>
            ) }
        </div>
    );
};

export default VendorRichTextField;

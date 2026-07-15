import { RawHTML } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';

type RadioOption = {
    value: string;
    label: string;
    description?: string;
};

// `vendor_radio` variant — a plain vertical radio list (plugin-ui only ships card-styled radio variants) with an optional muted description per option.
const VendorRadioField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const current = String( element.value ?? element.default ?? '' );
    const options = ( element.options ?? [] ) as RadioOption[];
    const error = element.validationError as string | undefined;

    return (
        <div className="dokan-vendor-radio-field flex w-full flex-col gap-3 p-4">
            <div className="flex flex-col gap-1">
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
            </div>
            <div className="flex flex-col gap-3.5">
                { options.map( ( option ) => (
                    // eslint-disable-next-line jsx-a11y/label-has-associated-control
                    <label
                        key={ option.value }
                        className="flex cursor-pointer items-start gap-3"
                    >
                        <input
                            type="radio"
                            name={ fieldKey }
                            value={ option.value }
                            checked={ current === option.value }
                            onChange={ () =>
                                updateValue( fieldKey, option.value )
                            }
                            className="mt-0.5 size-4 cursor-pointer"
                            // The forms layer renders radios appearance:none with a stock blue checked fill (accent-color is ignored there); paint the checked one with the customizer colour directly.
                            style={
                                current === option.value
                                    ? {
                                          backgroundColor:
                                              'var(--dokan-button-background-color, var(--color-dokan-btn, #7047eb))',
                                          borderColor:
                                              'var(--dokan-button-background-color, var(--color-dokan-btn, #7047eb))',
                                      }
                                    : undefined
                            }
                        />
                        <span className="flex flex-col gap-0.5">
                            <span className="text-sm text-gray-700">
                                { option.label }
                            </span>
                            { option.description && (
                                <span className="text-xs text-gray-500">
                                    { option.description }
                                </span>
                            ) }
                        </span>
                    </label>
                ) ) }
            </div>
            { error && (
                <div className="text-sm text-red-600">
                    <RawHTML>{ error }</RawHTML>
                </div>
            ) }
        </div>
    );
};

export default VendorRadioField;

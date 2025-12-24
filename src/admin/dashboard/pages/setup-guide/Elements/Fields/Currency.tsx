import { RawHTML, useState } from '@wordpress/element';
import { DokanCurrencyInput } from './DokanCurrencyInput';
import { SettingsProps } from '../../StepSettings';
import { __ } from '@wordpress/i18n';

const Currency = ( { element, onValueChange }: SettingsProps ) => {
    const [ localValue, setLocalValue ] = useState( element.value );
    const [ fieldError, setFieldError ] = useState( null );
    if ( ! element.display ) {
        return <></>;
    }

    const handleValueChange = ( formattedValue: string, unformattedValue ) => {
        setFieldError( null );
        setLocalValue( formattedValue );
        // handle negative values
        if ( unformattedValue < 0 ) {
            setFieldError( __( 'Invalid value', 'dokan' ) );
            return;
        }

        onValueChange( {
            ...element,
            value: formattedValue,
        } );
    };

    return (
        <div
            id={ element.hook_key }
            className="@container/currency grid grid-cols-12 p-4 gap-2"
        >
            <div className="flex flex-col @sm/currency:col-span-8 col-span-12 gap-1">
                <h2 className="text-sm @sm/currency:text-base leading-6 font-semibold text-gray-900">
                    <RawHTML>{ element?.title }</RawHTML>
                </h2>
                <p className="text-xs @sm/currency:text-sm font-normal text-[#828282] mt-1">
                    <RawHTML>{ element?.description }</RawHTML>
                </p>
            </div>
            <div className="@sm/currency:col-span-4 col-span-12 flex items-center @sm/currency:justify-end">
                <DokanCurrencyInput
                    namespace={ `currency-${ element.id }` }
                    value={ localValue }
                    onChange={ ( formattedValue, unformattedValue ) => {
                        handleValueChange( formattedValue, unformattedValue );
                    } }
                    label={ '' }
                    input={ {
                        autoComplete: 'off',
                        id: element?.id,
                        name: element?.id,
                        placeholder: String( element?.placeholder ),
                        type: element.type,
                    } }
                    errors={ fieldError ? [ fieldError ] : [] }
                    className="w-24 h-10 rounded-l-none border-l-0 focus:!ring-0 focus:!outline-none "
                />
            </div>
        </div>
    );
};

export default Currency;

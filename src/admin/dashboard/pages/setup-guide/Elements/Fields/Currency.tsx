import { MaskedInput } from '@getdokan/dokan-ui';
import { SettingsProps } from '../../StepSettings';
import { useDebounceCallback } from 'usehooks-ts';
import { RawHTML, useState } from '@wordpress/element';

const Currency = ( { element, onValueChange }: SettingsProps ) => {
    const [ localValue, setLocalValue ] = useState( element.value );

    if ( ! element.display ) {
        return <></>;
    }

    const handleValueChange = ( newValue ) => {
        setLocalValue( newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    const debouncedWithdrawAmount = useDebounceCallback(
        handleValueChange,
        500
    );

    const currencySymbol =
        window?.dokanWithdrawDashboard?.currency?.symbol ?? '';

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
                <MaskedInput
                    addOnLeft={ currencySymbol }
                    value={ String( localValue ) }
                    onChange={ ( e ) => {
                        debouncedWithdrawAmount( e.target.value );
                    } }
                    maskRule={ {
                        numeral: true,
                        numeralDecimalMark:
                            window?.dokanWithdrawDashboard?.currency?.decimal ??
                            '.',
                        delimiter:
                            window?.dokanWithdrawDashboard?.currency
                                ?.thousand ?? ',',
                        numeralDecimalScale:
                            window?.dokanWithdrawDashboard?.currency
                                ?.precision ?? 2,
                    } }
                    input={ {
                        autoComplete: 'off',
                        id: element?.id,
                        name: element?.id,
                        placeholder: String( element?.placeholder ),
                        type: element.type,
                    } }
                    className={ `w-24 h-10 rounded-r rounded-l-none border-l-0 focus:border-gray-300` }
                />
            </div>
        </div>
    );
};

export default Currency;

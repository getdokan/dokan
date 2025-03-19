import { MaskedInput } from '@getdokan/dokan-ui';
import { useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';
import { useDebounceCallback } from 'usehooks-ts';

const Currency = ( { element, onValueChange }: SettingsProps ) => {
    const [ localValue, setLocalValue ] = useState( element.value );

    const handleValueChange = ( event ) => {
        setLocalValue( event.target.value );
        onValueChange( {
            ...element,
            value: event.target.value,
        } );
    };

    const debouncedWithdrawAmount = useDebounceCallback(
        handleValueChange,
        500
    );

    const currencySymbol =
        window?.dokanWithdrawDashboard?.currency?.symbol ?? '';

    if ( ! element.display ) {
        return <></>;
    }

    return (
        <div
            id={ element.hook_key + '_div' }
            className="w-full @container/currency"
        >
            <div className="flex justify-between flex-wrap w-full p-4 gap-4">
                <div className="flex flex-col w-[70%]">
                    <h2 className="text-sm @sm/currency:text-base leading-6 font-semibold text-gray-900">
                        { element?.title }
                    </h2>
                    <p className="text-xs @sm/currency:text-sm font-normal text-[#828282] mt-1">
                        { element?.description }
                    </p>
                </div>
                <div className="@sm:w-36  ">
                    <MaskedInput
                        addOnLeft={ currencySymbol }
                        value={ String( localValue ) }
                        onChange={ ( e ) => {
                            debouncedWithdrawAmount( e.target.value );
                        } }
                        maskRule={ {
                            numeral: true,
                            numeralDecimalMark:
                                window?.dokanWithdrawDashboard?.currency
                                    ?.decimal ?? '.',
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
                        className={ ` h-12 rounded-r rounded-l-none` }
                    />
                </div>
            </div>
        </div>
    );
};

export default Currency;

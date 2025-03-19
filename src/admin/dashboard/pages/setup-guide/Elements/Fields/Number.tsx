import { MaskedInput } from '@getdokan/dokan-ui';
import { useState } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';
import { useDebounceCallback } from 'usehooks-ts';

const Number = ( { element, onValueChange }: SettingsProps ) => {
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
        <div id={ element.hook_key + '_div' } className=" @container ">
            <div className=" flex justify-between p-4 items-center flex-row @max-sm:flex-col w-full ">
                <div className="flex flex-col">
                    <h2 className="text-sm leading-6 font-semibold text-gray-900">
                        { element?.title }
                    </h2>
                    <p className=" text-sm font-normal text-[#828282]">
                        { element?.description }
                    </p>
                </div>
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
                    className={ `w-16 h-12 rounded-r  rounded-l-none` }
                />
                { /*<SimpleInput*/ }
                { /*    input={ {*/ }
                { /*        autoComplete: 'off',*/ }
                { /*        id: element?.id,*/ }
                { /*        name: element?.id,*/ }
                { /*        placeholder: String( element?.placeholder ),*/ }
                { /*        type: element.type,*/ }
                { /*    } }*/ }
                { /*    addOnLeft={*/ }
                { /*        <span*/ }
                { /*            className="w-7 h-7 flex justify-center items-center"*/ }
                { /*            dangerouslySetInnerHTML={ { __html: element?.prefix } }*/ }
                { /*        />*/ }
                { /*    }*/ }
                { /*    required*/ }
                { /*    value={ String( localValue ) }*/ }
                { /*    onChange={ handleValueChange }*/ }
                { /*    className={ `w-32 h-12  focus:outline-none ${*/ }
                { /*        hasPrefix ? '!pl-16' : ''*/ }
                { /*    }` }*/ }
                { /*/>*/ }
            </div>
        </div>
    );
};

export default Number;

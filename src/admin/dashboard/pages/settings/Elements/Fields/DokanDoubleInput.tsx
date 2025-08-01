import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import { SettingsElement } from '../../types';
import { twMerge } from 'tailwind-merge';
import { dispatch } from '@wordpress/data';
import settingsStore from '../../../../../../stores/adminSettings';

interface DokanDoubleInputElement extends SettingsElement {
    label: string;
    tooltip?: React.ReactNode;
    firstLabel: string;
    firstValue: string | number;
    firstValueType: string;
    secondLabel: string;
    secondValue: string | number;
    secondValueType: string;
    className?: string;
    display?: boolean;
    firstPrefix?: string;
    secondPrefix?: string;
    value?: { first: string | number; second: string | number };
}

const DokanDoubleInput = ( {
    element,
}: {
    element: DokanDoubleInputElement;
} ) => {
    if ( ! element.display ) {
        return null;
    }

    const onValueChange = ( updatedElement ) => {
        // Dispatch the updated value to the settings store
        dispatch( settingsStore ).updateSettingsValue( updatedElement );
    };
    return (
        <div
            className={ twMerge(
                'flex justify-between p-5 items-center',
                element.className
            ) }
        >
            { /* Field label with tooltip */ }
            <DokanFieldLabel
                title={ element.label }
                titleFontWeight="bold"
                tooltip={ element.tooltip }
            />
            <div className="flex gap-4 ">
                <TextField
                    value={ String( element.firstValue ) }
                    onChange={ ( val ) =>
                        onValueChange( {
                            ...element,
                            firstValue: val,
                            value: {
                                first: val,
                                second: element.secondValue,
                            },
                        } )
                    }
                    inputType={ element.firstValueType }
                    label={ element.firstLabel }
                    prefix={ element.firstPrefix }
                    inputClassName="bg-white border-[#E9E9E9]  rounded h-10 px-4 text-[#25252D] text-sm"
                />

                <TextField
                    value={ String( element.secondValue ) }
                    onChange={ ( val ) =>
                        onValueChange( {
                            ...element,
                            secondValue: val,
                            value: {
                                first: element.firstValue,
                                second: val,
                            },
                        } )
                    }
                    inputType={ element.secondValueType }
                    label={ element.secondLabel }
                    prefix={ element.secondPrefix }
                    inputClassName="bg-white border-[#E9E9E9] rounded h-10 px-4 text-[#25252D] text-sm"
                    containerClassName="w-full"
                />
            </div>
        </div>
    );
};

export default DokanDoubleInput;

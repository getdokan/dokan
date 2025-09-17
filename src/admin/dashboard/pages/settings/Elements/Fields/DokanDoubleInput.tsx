import { dispatch } from '@wordpress/data';
import { twMerge } from 'tailwind-merge';
import {
    DokanBaseTextField,
    DokanFieldLabel,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { SettingsElement } from '../../types';

export interface DokanDoubleInputElement extends SettingsElement {
    label: string;
    tooltip?: string;
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
                title={ element.title }
                titleFontWeight="bold"
                helperText={ element.description }
                tooltip={ element.helper_text }
                imageUrl={ element?.image_url }
            />
            <div className="flex gap-4 ">
                <DokanBaseTextField
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
                    prefix={ element.firstPrefix }
                    inputClassName="bg-white border-[#E9E9E9]  rounded h-10 px-4 text-[#25252D] text-sm"
                />

                <DokanBaseTextField
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
                    prefix={ element.secondPrefix }
                    inputClassName="bg-white border-[#E9E9E9] rounded h-10 px-4 text-[#25252D] text-sm"
                    containerClassName="w-full"
                />
            </div>
        </div>
    );
};

export default DokanDoubleInput;

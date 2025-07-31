import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import { SettingsElement } from '../../types';
import { twMerge } from 'tailwind-merge';
import { dispatch } from '@wordpress/data';
import settingsStore from '../../../../../../stores/adminSettings';

interface DokanDoubleTextFieldElement extends SettingsElement {
    label: string;
    tooltip?: React.ReactNode;
    firstLabel: string;
    firstValue: string | number;
    secondLabel: string;
    secondValue: string | number;
    className?: string;
    display?: boolean;
    firstPrefix?: string;
    secondPrefix?: string;
}

const DokanDoubleTextField = ( {
    element,
}: {
    element: DokanDoubleTextFieldElement;
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
            <div className="flex gap-6 ">
                <TextField
                    value={ String( element.firstValue ) }
                    onChange={ () =>
                        onValueChange( {
                            ...element,
                            firstValue: element.firstValue,
                        } )
                    }
                    label={ element.firstLabel }
                    disabled
                    prefix={ element.firstPrefix }
                    inputClassName="bg-white border-[#E9E9E9] rounded h-10 px-4 text-[#25252D] text-sm"
                />

                <TextField
                    value={ String( element.secondValue ) }
                    onChange={ () =>
                        onValueChange( {
                            ...element,
                            secondValue: element.secondValue,
                        } )
                    }
                    label={ element.secondLabel }
                    disabled
                    prefix={ element.secondPrefix }
                    inputClassName="bg-white border-[#E9E9E9] rounded h-10 px-4 text-[#25252D] text-sm"
                    containerClassName="w-full"
                />
            </div>
        </div>
    );
};

export default DokanDoubleTextField;

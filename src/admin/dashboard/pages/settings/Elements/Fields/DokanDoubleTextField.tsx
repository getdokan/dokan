import { dispatch } from '@wordpress/data';
import { twMerge } from 'tailwind-merge';
import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import settingsStore from '../../../../../../stores/adminSettings';
import { SettingsElement } from '../../types';

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
                'grid-cols-12 grid  p-5 items-center',
                element.className
            ) }
        >
            <div className={ 'sm:col-span-5 col-span-12' }>
                <DokanFieldLabel
                    title={ element.title }
                    titleFontWeight="bold"
                    helperText={ element.description }
                    tooltip={ element.helper_text }
                    imageUrl={ element?.image_url }
                />
            </div>
            <div className="sm:col-span-7 col-span-12 gap-4 grid grid-cols-2 ">
                <TextField
                    value={ String( element.firstValue ) }
                    onChange={ () =>
                        onValueChange( {
                            ...element,
                            firstValue: element.firstValue,
                        } )
                    }
                    prefix={ element.firstPrefix }
                />

                <TextField
                    value={ String( element.secondValue ) }
                    onChange={ () =>
                        onValueChange( {
                            ...element,
                            second_value: element.secondValue,
                        } )
                    }
                    prefix={ element.secondPrefix }
                />
            </div>
        </div>
    );
};

export default DokanDoubleTextField;

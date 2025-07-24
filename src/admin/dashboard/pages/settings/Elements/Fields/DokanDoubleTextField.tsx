import {
    DokanFieldLabel,
    TextField,
} from '../../../../../../components/fields';
import { SettingsElement } from '../../types';
import { __ } from '@wordpress/i18n';
import { twMerge } from 'tailwind-merge';

interface DokanDoubleTextFieldElement extends SettingsElement {
    label: string;
    tooltip?: React.ReactNode;
    firstLabel: string;
    firstValue: string | number;
    secondLabel: string;
    secondValue: string | number;
    className?: string;
    display?: boolean;
}

const DokanDoubleTextField = ( {
    element,
}: {
    element: DokanDoubleTextFieldElement;
} ) => {
    if ( element.display === false ) {
        return null;
    }
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
                    onChange={ () => {} }
                    label={ element.firstLabel }
                    disabled
                    prefix={ __( 'Width', 'dokan-lite' ) }
                    inputClassName="bg-white border-[#E9E9E9] rounded h-10 px-4 text-[#25252D] text-sm"
                />

                <TextField
                    value={ String( element.secondValue ) }
                    onChange={ () => {} }
                    label={ element.secondLabel }
                    disabled
                    prefix={ __( 'Height', 'dokan-lite' ) }
                    inputClassName="bg-white border-[#E9E9E9] rounded h-10 px-4 text-[#25252D] text-sm"
                    containerClassName="w-full"
                />
            </div>
        </div>
    );
};

export default DokanDoubleTextField;

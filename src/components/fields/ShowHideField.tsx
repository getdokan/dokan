import { useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import DokanBaseTextField from './DokanBaseTextField';
import EyeIcon from '../Icons/EyeIcon';
import EyeOffIcon from '../Icons/EyeOffIcon';

interface ShowHideFieldProps {
    value: string;
    label?: string;
    tooltip?: React.ReactNode;
    disabled?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    helperText?: string;
    placeholder?: string;
    actionClassName?: string;
    displayValue?: boolean;
    handleDisplayValue?: () => void;
    onChange?: ( value: string ) => void;
}

const ShowHideField = ( {
    value,
    disabled = false,
    helperText = '',
    placeholder = '',
    actionClassName = '',
    handleDisplayValue,
    displayValue,
    onChange = () => {},
}: ShowHideFieldProps ) => {
    const [ showValue, setShowValue ] = useState( displayValue || false );

    // Toggle visibility of the value
    const handleToggleVisibility = () => {
        setShowValue( ! showValue );
        if ( handleDisplayValue ) {
            handleDisplayValue();
        }
    };

    const renderToggleButton = () => {
        return (
            <button
                type="button"
                onClick={ handleToggleVisibility }
                className={ twMerge(
                    'flex w-28 items-center justify-center bg-white gap-2.5 px-6 py-2.5 border border-dokan-info hover:border-dokan-info-hover rounded-[5px] text-[#393939] font-medium text-sm',
                    actionClassName
                ) }
            >
                <span className="w-4 h-4 flex items-center justify-center">
                    { showValue ? <EyeIcon /> : <EyeOffIcon /> }
                </span>
                <span>{ showValue ? 'Hide' : 'View' }</span>
            </button>
        );
    };

    // Display value based on visibility setting

    return (
        <div className={ 'w-full' }>
            <DokanBaseTextField
                value={ value }
                onChange={ ( val ) => {
                    onChange( val );
                } }
                disabled={ disabled }
                required={ false }
                inputType={ showValue ? 'text' : 'password' }
                placeholder={ placeholder }
                helperText={ helperText }
                inputClassName={ twMerge(
                    'bg-white w-full',
                    ! showValue ? 'text-[#828282]' : '',
                    disabled ? 'bg-[#F1F1F4]' : ''
                ) }
                actionsButtons={ renderToggleButton() }
                wrapperClassName={ 'w-full' }
            />
        </div>
    );
};

export default ShowHideField;

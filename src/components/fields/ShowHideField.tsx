import { useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import TextField from './TextField';
import DokanFieldLabel from './DokanFieldLabel';
import EyeIcon from '../Icons/EyeIcon';
import EyeOffIcon from '../Icons/EyeOffIcon';

interface ShowHideFieldProps {
    value: string;
    label: string;
    tooltip?: React.ReactNode;
    disabled?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    helperText?: string;
    placeholder?: string;
    actionClassName?: string;
    displayValue?: boolean;
    handleDisplayValue?: () => void;
}

const ShowHideField: React.FC< ShowHideFieldProps > = ( {
    value,
    label,
    tooltip,
    disabled = false,
    containerClassName = '',
    labelClassName = '',
    helperText = '',
    placeholder = '',
    actionClassName = '',
    handleDisplayValue,
    displayValue,
} ) => {
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
        <div className={ twMerge( '@container', containerClassName ) }>
            <div className="flex flex-col gap-2">
                <DokanFieldLabel
                    title={ label }
                    titleFontWeight="light"
                    tooltip={ tooltip }
                    className={ labelClassName }
                />

                <div className="flex @sm:flex-col items-center gap-4">
                    <div className="flex-1">
                        <TextField
                            value={ value }
                            onChange={ () => {} } // Read-only field
                            disabled={ disabled }
                            required={ false }
                            inputType={ showValue ? 'text' : 'password' }
                            placeholder={ placeholder }
                            helperText={ helperText }
                            inputClassName={ twMerge(
                                'bg-white',
                                ! showValue ? 'text-[#828282]' : '',
                                disabled ? 'bg-[#F1F1F4]' : ''
                            ) }
                            actionsButtons={ renderToggleButton() }
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowHideField;

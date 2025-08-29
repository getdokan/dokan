import { useState } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import DokanBaseTextField from './DokanBaseTextField';
import CopyIcon from '../Icons/CopyIcon';
import { __ } from '@wordpress/i18n';

interface CopyButtonFieldProps {
    value: string;
    label?: string;
    tooltip?: React.ReactNode;
    disabled?: boolean;
    containerClassName?: string;
    labelClassName?: string;
    helperText?: string;
    placeholder?: string;
    actionClassName?: string;
    onChange?: ( value: string ) => void;
    inputProps?: React.InputHTMLAttributes< HTMLInputElement >;
}

const CopyButtonField = ( {
    value,
    label,
    tooltip,
    disabled = false,
    containerClassName = '',
    labelClassName = '',
    helperText = '',
    placeholder = '',
    actionClassName = '',
    onChange,
    inputProps = {},
}: CopyButtonFieldProps ) => {
    const [ copied, setCopied ] = useState( false );

    // Handle copying to clipboard
    const handleCopy = () => {
        navigator.clipboard.writeText( value ).then( () => {
            setCopied( true );
            setTimeout( () => {
                setCopied( false );
            }, 2000 );
        } );
    };

    const renderCopyButton = () => {
        return (
            <button
                type="button"
                onClick={ handleCopy }
                className={ twMerge(
                    'flex items-center justify-center bg-white gap-2.5 px-6 py-2.5 border border-dokan-info hover:border-dokan-info-hover rounded-[5px] text-[#393939] font-medium text-sm',
                    actionClassName
                ) }
            >
                <span className="w-4 h-4 flex items-center justify-center">
                    <CopyIcon />
                </span>
                <span>
                    { copied
                        ? __( 'Copied', 'dokan-lite' )
                        : __( 'Copy', 'dokan-lite' ) }
                </span>
            </button>
        );
    };

    return (
        <div className="w-full">
            <DokanBaseTextField
                value={ value }
                onChange={ ( newValue ) => {
                    if ( onChange ) {
                        onChange( newValue );
                    }
                } }
                disabled={ disabled }
                required={ false }
                inputType="text"
                placeholder={ placeholder }
                helperText={ helperText }
                inputClassName={ twMerge(
                    'bg-[#F1F1F4 ] h-full max-w-full',
                    disabled ? 'bg-[#F1F1F4]' : ''
                ) }
                actionsButtons={ renderCopyButton() }
                inputProps={ inputProps }
            />
        </div>
    );
};

export default CopyButtonField;

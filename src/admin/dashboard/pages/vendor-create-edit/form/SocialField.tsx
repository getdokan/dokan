import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import DebouncedInput from '@src/components/DebouncedInput';
import { validateSocialUrl } from './socialValidation';

interface SocialFieldProps {
    icon?: JSX.Element;
    label: string;
    id: string;
    platformId: string;
    value: string;
    onChange: ( value: string ) => void;
    placeholder?: string;
}

export const SocialField = ( {
    icon,
    label,
    id,
    platformId,
    value,
    onChange,
    placeholder = __( 'https://example.com', 'dokan-lite' ),
}: SocialFieldProps ) => {
    const [ validationError, setValidationError ] = useState( '' );

    const handleChange = ( newValue: string ) => {
        // Validate the URL
        const validation = validateSocialUrl( newValue, platformId );

        if ( ! validation.isValid ) {
            setValidationError( validation.errorMessage );
        } else {
            setValidationError( '' );
        }

        // Call the parent onChange
        onChange( newValue );
    };

    return (
        <div className="flex flex-col" data-platform-id={ platformId }>
            <div className="flex items-center">
                <div className="min-w-[180px] flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10">
                        { icon }
                    </span>
                    <label
                        htmlFor={ id }
                        className="text-[#25252D] font-medium text-[14px]"
                    >
                        { label }
                    </label>
                </div>
                <div className="w-full">
                    <DebouncedInput
                        value={ value }
                        onChange={ handleChange }
                        input={ {
                            placeholder,
                            id,
                            type: 'text',
                        } }
                        errors={ validationError }
                    />
                </div>
            </div>
        </div>
    );
};

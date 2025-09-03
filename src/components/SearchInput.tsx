import { useState, useEffect } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import { SimpleInput } from '@getdokan/dokan-ui';
import { Search, X } from 'lucide-react';
import { __ } from '@wordpress/i18n';

interface SearchInputProps {
    value?: string;
    onChange?: ( val: string ) => void;
    delay?: number;
    input?: any;
    leftIcon?: any; // customizable left icon
    clearable?: boolean; // show clear button when has value
}

const SearchInput = ( {
    value: externalValue = '',
    onChange,
    delay = 300,
    input,
    leftIcon,
    clearable = true,
    ...props
}: SearchInputProps ) => {
    const [ internalValue, setInternalValue ] = useState( externalValue );

    // Create debounced function using WordPress compose
    const debouncedOnChange = useDebounce( onChange, delay );

    // Update internal value when external value changes
    useEffect( () => {
        setInternalValue( externalValue );
    }, [ externalValue ] );

    const handleChange = ( event: any ) => {
        const newValue = event.target.value;
        setInternalValue( newValue );
        if ( debouncedOnChange ) {
            debouncedOnChange( newValue );
        }
    };

    const handleClear = () => {
        setInternalValue( '' );
        if ( onChange ) {
            onChange( '' );
        }
    };

    return (
        <div className="relative">
            { /* Left icon */ }
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                { leftIcon ?? <Search size={ 16 } /> }
            </div>

            { /* Input field with left padding to make space for icon */ }
            <SimpleInput
                { ...props }
                input={ {
                    ...input,
                    placeholder:
                        input?.placeholder ?? __( 'Search', 'dokan-lite' ),
                } }
                className={ `dokan-react-search-input ${
                    ( props as any )?.className ?? ''
                }` }
                value={ internalValue }
                onChange={ handleChange }
                addOnLeft={ '\u00A0' }
                addOnRight={ '\u00A0' }
                style={ { paddingLeft: 36 } }
            />

            { /* Clear button */ }
            { clearable && internalValue ? (
                <button
                    type="button"
                    onClick={ handleClear }
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search input"
                >
                    <X size={ 16 } />
                </button>
            ) : null }
        </div>
    );
};

export default SearchInput;

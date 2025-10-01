import { useState, useEffect } from '@wordpress/element';
import { useDebounce } from '@wordpress/compose';
import { SimpleInput } from "@getdokan/dokan-ui";

const DebouncedInput = ( {
    value: externalValue = '',
    onChange,
    delay = 300,
    component = '',
    ...props
} ) => {
    const [ internalValue, setInternalValue ] = useState( externalValue );

    // Create debounced function using WordPress compose
    const debouncedOnChange = useDebounce( onChange, delay );

    // Update internal value when external value changes
    useEffect( () => {
        setInternalValue( externalValue );
    }, [ externalValue ] );

    // Handle input changes
    const handleChange = ( event ) => {
        const newValue = event.target.value;
        setInternalValue( newValue );

        // Call debounced onChange
        if ( debouncedOnChange ) {
            debouncedOnChange( newValue );
        }
    };

    const Component = component ?? '';
    if ( Component ) {
        return (
            <Component
                { ...props }
                // @ts-ignore
                value={ internalValue }
                onChange={ handleChange }
            />
        );
    }

    return (
        <SimpleInput
            { ...props }
            value={ internalValue }
            onChange={ handleChange }
        />
    );
};

export default DebouncedInput;

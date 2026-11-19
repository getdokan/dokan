import { useState, useEffect, useMemo, useRef } from '@wordpress/element';
import { debounce } from '@wordpress/compose';
import { SimpleInput } from '@getdokan/dokan-ui';

const DebouncedInput = ( {
    value: externalValue = '',
    onChange,
    delay = 500,
    component = '',
    flushOnUnmount = false,
    ...props
} ) => {
    const [ internalValue, setInternalValue ] = useState( externalValue );

    // Keep the latest onChange so the debounced call never fires a stale closure.
    const onChangeRef = useRef( onChange );
    onChangeRef.current = onChange;

    // Stable debounced function: parent re-renders must not cancel pending input.
    const debouncedOnChange = useMemo(
        () =>
            debounce( ( newValue ) => {
                onChangeRef.current?.( newValue );
            }, delay ),
        [ delay ]
    );

    // Opt-in: deliver (not drop) pending input when unmounting, e.g. on a tab switch.
    useEffect( () => {
        return () => {
            if ( flushOnUnmount ) {
                debouncedOnChange.flush();
            } else {
                debouncedOnChange.cancel();
            }
        };
    }, [ debouncedOnChange, flushOnUnmount ] );

    // Update internal value when external value changes
    useEffect( () => {
        setInternalValue( externalValue );
    }, [ externalValue ] );

    // Handle input changes
    const handleChange = ( event ) => {
        const newValue = event.target.value;
        setInternalValue( newValue );

        debouncedOnChange( newValue );
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

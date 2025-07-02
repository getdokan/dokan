import React from 'react';
import { Checkbox, HelperText, InputLabel } from '../fields';

interface CheckboxOption {
    label: string;
    value: string;
}

interface CheckboxGroupProps {
    label?: string;
    values: string[];
    options: CheckboxOption[];
    onChange: ( values: string[] ) => void;
    helperText?: string;
    error?: string;
    disabled?: boolean;
}

const CheckboxGroup: React.FC< CheckboxGroupProps > = ( {
    label,
    values,
    options,
    onChange,
    helperText,
    error,
    disabled,
} ) => {
    const handleChange = ( value: string ) => {
        if ( values.includes( value ) ) {
            onChange( values.filter( ( v ) => v !== value ) );
        } else {
            onChange( [ ...values, value ] );
        }
    };

    return (
        <div className="flex flex-col gap-1 w-full mb-4">
            { label && <InputLabel title={ label } /> }
            <div className="flex flex-row gap-4">
                { options.map( ( opt ) => (
                    <Checkbox
                        key={ opt.value }
                        checked={ values.includes( opt.value ) }
                        onChange={ () => handleChange( opt.value ) }
                        label={ opt.label }
                        disabled={ disabled }
                    />
                ) ) }
            </div>
            { ( helperText || error ) && (
                <HelperText error={ !! error }>
                    { error || helperText }
                </HelperText>
            ) }
        </div>
    );
};

export default CheckboxGroup;

import React from 'react';
import { HelperText, InputLabel, ToggleSwitch } from '../fields';

interface ToggleRowProps {
    label?: string;
    checked: boolean;
    onChange: ( checked: boolean ) => void;
    helperText?: string;
    error?: string;
    disabled?: boolean;
}

const ToggleRow: React.FC< ToggleRowProps > = ( {
    label,
    checked,
    onChange,
    helperText,
    error,
    disabled,
} ) => (
    <div className="flex flex-col gap-1 w-full mb-4">
        { label && <InputLabel title={ label } /> }
        <ToggleSwitch
            checked={ checked }
            onChange={ onChange }
            disabled={ disabled }
        />
        { ( helperText || error ) && (
            <HelperText error={ !! error }>{ error || helperText }</HelperText>
        ) }
    </div>
);

export default ToggleRow;

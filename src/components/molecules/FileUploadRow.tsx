import React from 'react';
import { FileUploadField, HelperText, InputLabel } from '../fields';

interface FileUploadRowProps {
    label?: string;
    onChange: ( file: File | null ) => void;
    helperText?: string;
    error?: string;
    disabled?: boolean;
}

const FileUploadRow: React.FC< FileUploadRowProps > = ( {
    label,
    onChange,
    helperText,
    error,
    disabled,
} ) => (
    <div className="flex flex-col gap-1 w-full mb-4">
        { label && <InputLabel title={ label } /> }
        <FileUploadField onChange={ onChange } disabled={ disabled } />
        { ( helperText || error ) && (
            <HelperText error={ !! error }>{ error || helperText }</HelperText>
        ) }
    </div>
);

export default FileUploadRow;

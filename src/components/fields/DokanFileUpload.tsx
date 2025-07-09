import { useRef } from '@wordpress/element';
import Upload from '../Upload';
import { Button, FormInput } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

interface DokanFileUploadProps {
    onUrlImport?: ( url: string ) => void;
    className?: string;
    inputClassName?: string;
}

function DokanFileUpload( {
    onUrlImport,
    className = '',
}: DokanFileUploadProps ) {
    const urlInputRef = useRef< HTMLInputElement >( null );

    const handleMediaSelect = ( file: any ) => {
        if ( file && file.url ) {
            if ( urlInputRef.current ) {
                urlInputRef.current.value = file.url;
            }
            if ( onUrlImport ) {
                onUrlImport( file.url );
            }
        }
    };

    return (
        <div className={ `flex items-center gap-4 ${ className }` }>
            <FormInput
                type="text"
                name="dokan-file-upload-url"
                ref={ urlInputRef }
                placeholder="No file selected"
                readOnly
                disabled={ true }
                className={ twMerge(
                    'text-[#828282] bg-[#F1F1F4] border border-[#E9E9E9] disabled:opacity-90',
                    className
                ) }
            />
            <Upload onSelect={ handleMediaSelect }>
                <Button
                    type="button"
                    color="secondary"
                    className={ twMerge(
                        'bg-white w-44 max-w-full border border-[#e9e9e9] rounded px-6 h-10 flex items-center justify-center font-inter font-semibold text-[13px] text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500',
                        className
                    ) }
                >
                    + Choose File
                </Button>
            </Upload>
        </div>
    );
}

export default DokanFileUpload;

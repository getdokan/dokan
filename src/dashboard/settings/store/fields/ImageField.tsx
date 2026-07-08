import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Pencil, Trash } from 'lucide-react';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import { MediaUploader } from '@dokan/components';

type Attachment = {
    id: number;
    url: string;
};

// `vendor_image` variant — wp.media picker that stores the ATTACHMENT ID
// (legacy banner/gravatar fidelity; plugin-ui's built-in media field stores
// URL strings, which would break every legacy reader). Figma treatment:
// label + spec line, preview with Change (pencil) and trash beside it;
// `shape: 'round'` renders the circular logo preview.
const ImageField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const isRound = 'round' === ( element.shape as string );
    // The schema seeds the preview URL; a fresh selection swaps in the attachment's own URL.
    const [ previewUrl, setPreviewUrl ] = useState< string >(
        ( element.image_url as string ) || ''
    );

    const handleSelect = ( attachment: Attachment ) => {
        setPreviewUrl( attachment?.url || '' );
        updateValue( fieldKey, attachment?.id ? Number( attachment.id ) : 0 );
    };

    const handleRemove = () => {
        setPreviewUrl( '' );
        updateValue( fieldKey, 0 );
    };

    return (
        <div className="dokan-vendor-image-field flex w-full flex-col gap-1.5 p-4">
            <span className="text-sm font-semibold text-gray-900">
                { element.title }
            </span>
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }

            { previewUrl ? (
                <div className="mt-2 flex items-center gap-4">
                    <img
                        src={ previewUrl }
                        alt={ ( element.title as string ) || '' }
                        className={
                            isRound
                                ? 'h-20 w-20 rounded-full border border-gray-200 object-cover'
                                : 'max-h-48 w-auto max-w-[420px] rounded-md border border-gray-200 object-cover'
                        }
                    />
                    <div className="flex items-center gap-2">
                        <MediaUploader
                            onSelect={ handleSelect }
                            title={ ( element.title as string ) || undefined }
                            className="flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            { __( 'Change', 'dokan-lite' ) }
                        </MediaUploader>
                        <button
                            type="button"
                            aria-label={ __( 'Remove image', 'dokan-lite' ) }
                            onClick={ handleRemove }
                            className="box-border! flex h-8! w-8! min-w-0! shrink-0 items-center justify-center rounded-md! border! border-gray-300! bg-white! p-0! text-gray-500 hover:text-red-600"
                        >
                            { /* Inline size survives the theme's button/svg rules (same fight WeeklyTimeSlots' icon buttons solve). */ }
                            <Trash size={ 16 } />
                        </button>
                    </div>
                </div>
            ) : (
                <MediaUploader
                    onSelect={ handleSelect }
                    title={ ( element.title as string ) || undefined }
                    className={
                        isRound
                            ? 'mt-2 flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border border-dashed border-gray-300 bg-gray-50 text-center text-[11px] leading-tight text-gray-500 hover:border-gray-400'
                            : 'mt-2 flex h-28 w-full max-w-[420px] cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:border-gray-400'
                    }
                >
                    { __( 'Click to upload', 'dokan-lite' ) }
                </MediaUploader>
            ) }
        </div>
    );
};

export default ImageField;

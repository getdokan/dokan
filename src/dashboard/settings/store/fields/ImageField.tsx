import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import { MediaUploader } from '@dokan/components';

type Attachment = {
    id: number;
    url: string;
};

// `vendor_image` variant — wp.media picker that stores the ATTACHMENT ID
// (legacy banner/gravatar fidelity; plugin-ui's built-in media field stores
// URL strings, which would break every legacy reader).
const ImageField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const attachmentId = Number( element.value ?? element.default ?? 0 );
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
        <div className="dokan-vendor-image-field flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-900">
                { element.title }
            </span>
            { element.description && (
                <span className="text-xs text-gray-500">
                    { element.description }
                </span>
            ) }

            { previewUrl ? (
                <div className="relative inline-flex w-fit">
                    <img
                        src={ previewUrl }
                        alt={ ( element.title as string ) || '' }
                        className="max-h-40 max-w-full rounded-md border border-gray-200 object-cover"
                    />
                    <button
                        type="button"
                        aria-label={ __( 'Remove image', 'dokan-lite' ) }
                        onClick={ handleRemove }
                        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm hover:text-red-600"
                    >
                        &times;
                    </button>
                </div>
            ) : (
                <MediaUploader
                    onSelect={ handleSelect }
                    title={ ( element.title as string ) || undefined }
                    className="flex h-24 w-full max-w-md cursor-pointer items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50 text-sm text-gray-500 hover:border-gray-400"
                >
                    { __( 'Click to upload', 'dokan-lite' ) }
                </MediaUploader>
            ) }

            { attachmentId > 0 && ! previewUrl && (
                <span className="text-xs text-gray-400">
                    { __( 'Selected media', 'dokan-lite' ) }
                </span>
            ) }
        </div>
    );
};

export default ImageField;

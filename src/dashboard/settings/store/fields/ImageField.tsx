import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Pencil, Trash, Upload } from 'lucide-react';
import { useSettings, type SettingsElement } from '@wedevs/plugin-ui';
import { MediaUploader } from '@dokan/components';

type Attachment = {
    id: number;
    url: string;
};

// Store-awning placeholder shown for an empty logo — mirrors the admin
// vendor-edit StoreImage default so both screens read the same.
const LogoPlaceholder = () => (
    <svg
        width="48"
        height="48"
        viewBox="0 0 65 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <path
            d="M17.9173 33.4384C20.9654 33.4384 23.65 31.9344 25.3073 29.6312C26.9043 31.9295 29.5541 33.4384 32.5597 33.4384C35.5574 33.4384 38.205 31.9374 39.8037 29.6492C41.4514 31.9412 44.1368 33.4384 47.1688 33.4384C52.9852 33.4384 57.384 27.7999 55.9629 22.1559L53.19 11.1427C52.7689 9.46929 51.2687 8.30078 49.5424 8.30078H15.4398C13.7138 8.30078 12.2139 9.46929 11.7925 11.1427L9.03759 22.0905C8.25149 25.2125 9.28471 27.933 11.1092 30.41V52.002C11.1092 54.0747 12.7823 55.7612 14.8561 55.7612H50.14C52.2138 55.7612 53.8875 54.0747 53.8875 52.002V37.999C53.8875 37.0907 53.1237 36.3542 52.2149 36.3542C51.306 36.3542 50.5423 37.0904 50.5423 37.999V52.002C50.5423 52.2614 50.3991 52.5161 50.14 52.5161H39.7972V39.671C39.7972 38.7627 39.0591 38.0143 38.1502 38.0143H26.8467C25.9379 38.0143 25.1998 38.7627 25.1998 39.671V52.5161H14.8561C14.597 52.5161 14.4546 52.2611 14.4546 52.002V32.7478C15.4682 33.1992 16.6945 33.4384 17.9173 33.4384ZM41.419 11.5458H49.5421C49.7581 11.5458 49.9455 11.7141 49.9981 11.9233L52.7705 22.9472C53.672 26.5286 50.8819 30.1435 47.1822 30.1435C43.9958 30.1435 41.419 27.5563 41.419 24.3694V11.5458ZM27.0246 11.5458H38.175V24.3694C38.175 27.4655 35.754 30.1489 32.5935 30.1489C29.3815 30.1489 27.0246 27.4355 27.0246 24.317V11.5458ZM28.5449 41.3607H36.452V52.5161H28.5449V41.3607ZM12.2262 22.8929L14.983 11.9233C15.0359 11.7141 15.2244 11.5461 15.4398 11.5461H23.6791V24.317C23.6791 27.5315 21.083 30.1467 17.8696 30.1489C14.1306 30.1467 11.3138 26.5182 12.2262 22.8929Z"
            fill="#9CA3AF"
        />
    </svg>
);

// `vendor_image` variant — wp.media picker that stores the ATTACHMENT ID
// (legacy banner/gravatar fidelity; plugin-ui's built-in media field stores
// URL strings, which would break every legacy reader).
//
// Figma/admin treatment: the field title + spec sit on one row with the
// Change/Upload and delete controls; the preview renders full-width below.
// A banner falls back to `placeholder_url` (the default store banner) and the
// round logo falls back to the store-awning glyph, so the field never looks
// empty. Delete only shows once the vendor has set their own image.
const ImageField = ( { element }: { element: SettingsElement } ) => {
    const { updateValue } = useSettings();
    const fieldKey = ( element.dependency_key as string ) || element.id;
    const isRound = 'round' === ( element.shape as string );
    const placeholderUrl = ( element.placeholder_url as string ) || '';

    // The schema seeds the preview URL; a fresh selection swaps in the attachment's own URL.
    const [ previewUrl, setPreviewUrl ] = useState< string >(
        ( element.image_url as string ) || ''
    );
    const hasCustomImage = '' !== previewUrl;
    const displayUrl = previewUrl || placeholderUrl;

    const handleSelect = ( attachment: Attachment ) => {
        setPreviewUrl( attachment?.url || '' );
        updateValue( fieldKey, attachment?.id ? Number( attachment.id ) : 0 );
    };

    const handleRemove = () => {
        setPreviewUrl( '' );
        updateValue( fieldKey, 0 );
    };

    return (
        <div className="dokan-vendor-image-field flex w-full flex-col gap-3 p-4">
            { /* Title + spec on the left, Change/Upload and delete inline on the right (admin pattern). */ }
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-gray-900">
                        { element.title }
                    </span>
                    { element.description && (
                        <span className="text-xs text-gray-500">
                            { element.description }
                        </span>
                    ) }
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <MediaUploader
                        onSelect={ handleSelect }
                        title={ ( element.title as string ) || undefined }
                        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                        { hasCustomImage ? (
                            <Pencil size={ 14 } />
                        ) : (
                            <Upload size={ 14 } />
                        ) }
                        { hasCustomImage
                            ? __( 'Change', 'dokan-lite' )
                            : __( 'Upload', 'dokan-lite' ) }
                    </MediaUploader>
                    { hasCustomImage && (
                        <button
                            type="button"
                            aria-label={ __( 'Remove image', 'dokan-lite' ) }
                            onClick={ handleRemove }
                            className="box-border! flex h-8! w-8! min-w-0! shrink-0 items-center justify-center rounded-md! border! border-gray-300! bg-white! p-0! text-gray-500 hover:text-red-600"
                        >
                            { /* Inline size survives the theme's button/svg rules (same fight WeeklyTimeSlots' icon buttons solve). */ }
                            <Trash size={ 16 } />
                        </button>
                    ) }
                </div>
            </div>

            { /* Preview: round 150x150-max logo, or full-width banner clamped so a tall image can't blow up the card. */ }
            { isRound ? (
                <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                    { displayUrl ? (
                        <img
                            src={ displayUrl }
                            alt={ ( element.title as string ) || '' }
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <LogoPlaceholder />
                    ) }
                </div>
            ) : (
                // Admin vendor-edit treatment: a full-width, fixed-height banner
                // frame filled with object-cover (no aspect distortion), so any
                // banner reads as a consistent store header.
                <div className="flex h-[300px] w-full items-center justify-center overflow-hidden rounded-md border border-gray-200 bg-gray-50">
                    <img
                        src={ displayUrl }
                        alt={ ( element.title as string ) || '' }
                        className="h-full w-full object-cover"
                    />
                </div>
            ) }
        </div>
    );
};

export default ImageField;

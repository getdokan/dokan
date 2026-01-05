/**
 * Dokan Image Upload Field
 *
 * A custom image upload field using WordPress media library.
 */

import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import type { FieldProps } from '@wedevs/plugin-settings/types';

interface MediaItem {
    id: number;
    url: string;
    alt: string;
}

export const DokanImageUpload = ( {
    element,
    value,
    onChange,
}: FieldProps ) => {
    const imageUrl = typeof value === 'object' ? value?.url : value;
    const imageId = typeof value === 'object' ? value?.id : null;

    const handleSelect = ( media: MediaItem ) => {
        onChange( {
            id: media.id,
            url: media.url,
            alt: media.alt,
        } );
    };

    const handleRemove = () => {
        onChange( null );
    };

    return (
        <div className="dokan-image-upload-field">
            <label className="components-base-control__label">
                { element.title }
            </label>

            <MediaUploadCheck>
                <div className="dokan-image-upload-wrapper">
                    { imageUrl ? (
                        <div className="dokan-image-preview">
                            <img
                                src={ imageUrl }
                                alt={ element.title }
                                style={ {
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                } }
                            />
                            <div className="dokan-image-actions">
                                <MediaUpload
                                    onSelect={ handleSelect }
                                    allowedTypes={ [ 'image' ] }
                                    value={ imageId || undefined }
                                    render={ ( { open } ) => (
                                        <Button
                                            variant="secondary"
                                            onClick={ open }
                                            size="small"
                                        >
                                            { __( 'Replace', 'dokan-lite' ) }
                                        </Button>
                                    ) }
                                />
                                <Button
                                    variant="tertiary"
                                    onClick={ handleRemove }
                                    size="small"
                                    isDestructive
                                >
                                    { __( 'Remove', 'dokan-lite' ) }
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <MediaUpload
                            onSelect={ handleSelect }
                            allowedTypes={ [ 'image' ] }
                            render={ ( { open } ) => (
                                <Button
                                    variant="secondary"
                                    onClick={ open }
                                    className="dokan-upload-button"
                                >
                                    { element.placeholder ||
                                        __( 'Upload Image', 'dokan-lite' ) }
                                </Button>
                            ) }
                        />
                    ) }
                </div>
            </MediaUploadCheck>

            { element.description && (
                <p className="components-base-control__help">
                    { element.description }
                </p>
            ) }
        </div>
    );
};

export default DokanImageUpload;

import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import type { FileUploadProps } from '../types';

interface MediaItem {
    id: number;
    url: string;
    title: string;
    filename: string;
    type: string;
}

/**
 * FileUpload Component
 *
 * A file upload using WordPress media library.
 */
const FileUpload = ( {
    id,
    value,
    onChange,
    disabled = false,
    className = '',
    allowedTypes = [ 'image' ],
    buttonText,
    previewMode = 'image',
}: FileUploadProps ) => {
    const handleSelect = useCallback(
        ( media: MediaItem ) => {
            onChange?.( media.url );
        },
        [ onChange ]
    );

    const handleRemove = useCallback( () => {
        onChange?.( '' );
    }, [ onChange ] );

    const currentValue = value as string;

    return (
        <div className={ `flex flex-col gap-3 ${ className }` }>
            <MediaUploadCheck>
                <MediaUpload
                    onSelect={ handleSelect }
                    allowedTypes={ allowedTypes }
                    value={ currentValue }
                    render={ ( { open } ) => (
                        <div className="flex flex-col gap-3">
                            { /* Preview */ }
                            { currentValue && previewMode !== 'none' && (
                                <div className="relative group">
                                    { previewMode === 'image' ? (
                                        <img
                                            src={ currentValue }
                                            alt=""
                                            className="max-w-xs max-h-32 rounded-md border border-gray-200 object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border border-gray-200">
                                            <svg
                                                className="w-8 h-8 text-gray-400"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={ 2 }
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                            <span className="text-sm text-gray-600 truncate max-w-xs">
                                                { currentValue.split( '/' ).pop() }
                                            </span>
                                        </div>
                                    ) }
                                </div>
                            ) }

                            { /* Buttons */ }
                            <div className="flex items-center gap-2">
                                <button
                                    id={ id }
                                    type="button"
                                    onClick={ open }
                                    disabled={ disabled }
                                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={ 2 }
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    { buttonText ||
                                        ( currentValue
                                            ? __( 'Change', 'wedevs-plugin-ui' )
                                            : __( 'Upload', 'wedevs-plugin-ui' ) ) }
                                </button>

                                { currentValue && (
                                    <button
                                        type="button"
                                        onClick={ handleRemove }
                                        disabled={ disabled }
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        { __( 'Remove', 'wedevs-plugin-ui' ) }
                                    </button>
                                ) }
                            </div>
                        </div>
                    ) }
                />
            </MediaUploadCheck>
        </div>
    );
};

export default FileUpload;


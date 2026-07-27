import { __ } from '@wordpress/i18n';

type UploadTypes = {
    onSelect: ( value: any ) => void;
    children: React.ReactNode;
    multiple?: boolean;
    className?: string;
    as?: React.ElementType;
    title?: string;
    buttonText?: string;
    uploaderParams?: Record< string, string >;
};

const Upload = ( {
    onSelect,
    children,
    multiple = false,
    className,
    title,
    buttonText,
    uploaderParams,
    ...props
}: UploadTypes ) => {
    const uploadHandler = () => {
        // @ts-ignore
        const mediaFrame = wp.media( {
            title: title || __( 'Select or Upload Media', 'dokan-lite' ),
            button: {
                text: buttonText || __( 'Use this media' ),
            },
            multiple, // Set to true to allow multiple selection
        } );
        if ( uploaderParams ) {
            // Extra plupload multipart params, e.g. `type: 'downloadable_product'` routes uploads into woocommerce_uploads.
            mediaFrame.on( 'ready', () => {
                // A frame has no uploader when the upload limit is exceeded or the browser is unsupported.
                const uploaderWindow = mediaFrame.uploader;

                if ( ! uploaderWindow ) {
                    return;
                }

                // Once plupload is live only param() reaches it; before that the pending options are the only target.
                if ( uploaderWindow.uploader ) {
                    uploaderWindow.uploader.param( { ...uploaderParams } );
                    return;
                }

                // Merge so WordPress' own params (nonce, post_id) survive alongside ours.
                uploaderWindow.options.uploader.params = {
                    ...uploaderWindow.options.uploader.params,
                    ...uploaderParams,
                };
            } );
        }
        mediaFrame.on( 'select', () => {
            const attachment = mediaFrame.state().get( 'selection' );
            if ( multiple ) {
                onSelect( attachment.map( ( att: any ) => att.toJSON() ) );
                return;
            }
            const single = attachment.first().toJSON();

            if ( single ) {
                onSelect( single );
            }
        } );
        mediaFrame.open();
    };
    if ( props.as ) {
        const AsComponent = props.as;
        return (
            <AsComponent
                { ...props }
                onClick={ uploadHandler }
                className={ className }
            >
                { children }
            </AsComponent>
        );
    }
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus
        <div role="button" onClick={ uploadHandler } className={ className }>
            { children }
        </div>
    );
};

export default Upload;

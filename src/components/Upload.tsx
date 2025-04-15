import { __ } from '@wordpress/i18n';

type UploadTypes = {
    onSelect: ( value: any ) => void;
    children: React.ReactNode;
    multiple?: boolean;
    className?: string;
    as?: React.ElementType;
    title?: string;
    buttonText?: string;
};

const Upload = ( {
    onSelect,
    children,
    multiple = false,
    className,
    title,
    buttonText,
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
        <button type="button" onClick={ uploadHandler } className={ className }>
            { children }
        </button>
    );
};

export default Upload;

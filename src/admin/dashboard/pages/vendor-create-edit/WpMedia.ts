import { __ } from '@wordpress/i18n';

export type TSize = {
    height: number;
    width: number;
    orientation: string;
    url: string;
};

export interface IWpMedia {
    alt: string;
    author: string;
    authorLink: string;
    authorName: string;
    caption: string;
    compat: { item: string; meta: string };
    context: string;
    date: Record< string, object >;
    dateFormatted: string;
    description: string;
    editLink: string;
    filename: string;
    filesizeHumanReadable: string;
    filesizeInBytes: number;
    height: number;
    icon: string;
    id: number;
    link: string;
    menuOrder: number;
    meta: boolean;
    mime: string;
    modified: Record< string, object >;
    name: string;
    nonces: { update: string; delete: string; edit: string };
    orientation: string;
    sizes: {
        full: TSize;
        medium: TSize;
        thumbnail: TSize;
    };
    status: string;
    subtype: string;
    title: string;
    type: string;
    uploadedTo: number;
    uploading: boolean;
    url: string;
    width: number;
}
export type IWpMediaData = Array< IWpMedia >;

export default function wpMedia(
    callback: ( media: IWpMediaData ) => void,
    croppingWidth?: number,
    croppingHeight?: number
) {
    const calculateImageSelectOptions = ( attachment, controller ) => {
        let xInit = croppingWidth
            ? parseInt( croppingWidth, 10 )
            : parseInt( dokanAdminDashboard.store_banner_dimension.width, 10 );
        let yInit = croppingHeight
            ? parseInt( croppingHeight, 10 )
            : parseInt( dokanAdminDashboard.store_banner_dimension.height, 10 );
        const flexWidth = !! parseInt(
            dokanAdminDashboard.store_banner_dimension[ 'flex-width' ],
            10
        );
        const flexHeight = !! parseInt(
            dokanAdminDashboard.store_banner_dimension[ 'flex-height' ],
            10
        );

        let ratio, xImg, yImg, realHeight, realWidth, imgSelectOptions;

        realWidth = attachment.get( 'width' );
        realHeight = attachment.get( 'height' );

        const control = controller.get( 'control' );

        controller.set(
            'canSkipCrop',
            ! control.mustBeCropped(
                flexWidth,
                flexHeight,
                xInit,
                yInit,
                realWidth,
                realHeight
            )
        );

        ratio = xInit / yInit;
        xImg = realWidth;
        yImg = realHeight;

        if ( xImg / yImg > ratio ) {
            yInit = yImg;
            xInit = yInit * ratio;
        } else {
            xInit = xImg;
            yInit = xInit / ratio;
        }

        imgSelectOptions = {
            handles: true,
            keys: true,
            instance: true,
            persistent: true,
            imageWidth: realWidth,
            imageHeight: realHeight,
            x1: 0,
            y1: 0,
            x2: xInit,
            y2: yInit,
        };

        if ( flexHeight === false && flexWidth === false ) {
            imgSelectOptions.aspectRatio = xInit + ':' + yInit;
        }
        if ( flexHeight === false ) {
            imgSelectOptions.maxHeight = yInit;
        }
        if ( flexWidth === false ) {
            imgSelectOptions.maxWidth = xInit;
        }

        return imgSelectOptions;
    };

    let fileFrame = null;

    if ( fileFrame ) {
        fileFrame.open();
        return;
    }

    const fileStatesOptions = {
        library: wp.media.query(),
        multiple: false, // set it true for multiple image
        title: __( 'Select & Crop Image', 'dokan-lite' ),
        priority: 20,
        filterable: 'uploaded',
        autoSelect: true,
        suggestedWidth: 500,
        suggestedHeight: 300,
    };

    const cropControl = {
        id: 'control-id',
        params: {
            width: croppingWidth
                ? parseInt( croppingWidth, 10 )
                : parseInt(
                      dokanAdminDashboard.store_banner_dimension.width,
                      10
                  ),
            height: croppingHeight
                ? parseInt( croppingHeight, 10 )
                : parseInt(
                      dokanAdminDashboard.store_banner_dimension.height,
                      10
                  ),
            flex_width: !! parseInt(
                dokanAdminDashboard.store_banner_dimension[ 'flex-width' ],
                10
            ),
            flex_height: !! parseInt(
                dokanAdminDashboard.store_banner_dimension[ 'flex-height' ],
                10
            ),
        },
    };

    cropControl.mustBeCropped = function (
        flexW,
        flexH,
        dstW,
        dstH,
        imgW,
        imgH
    ) {
        // If the width and height are both flexible
        // then the user does not need to crop the image.
        if ( true === flexW && true === flexH ) {
            return false;
        }

        // If the width is flexible and the cropped image height matches the current image height,
        // then the user does not need to crop the image.
        if ( true === flexW && dstH === imgH ) {
            return false;
        }

        // If the height is flexible and the cropped image width matches the current image width,
        // then the user does not need to crop the image.
        if ( true === flexH && dstW === imgW ) {
            return false;
        }

        // If the cropped image width matches the current image width,
        // and the cropped image height matches the current image height
        // then the user does not need to crop the image.
        if ( dstW === imgW && dstH === imgH ) {
            return false;
        }

        // If the destination width is equal to or greater than the cropped image width
        // then the user does not need to crop the image...
        if ( imgW <= dstW ) {
            return false;
        }

        return true;
    };

    const fileStates = [
        new wp.media.controller.Library( fileStatesOptions ),
        new wp.media.controller.CustomizeImageCropper( {
            imgSelectOptions: calculateImageSelectOptions,
            control: cropControl,
        } ),
    ];

    const mediaOptions = {
        title: __( 'Select Image', 'dokan-lite' ),
        button: {
            text: __( 'Select Image', 'dokan-lite' ),
            close: false,
        },
        multiple: false,
    };

    mediaOptions.states = fileStates;

    fileFrame = wp.media( mediaOptions );

    fileFrame.on( 'select', () => {
        fileFrame.setState( 'cropper' );
    } );

    fileFrame.on( 'cropped', ( croppedImage ) => {
        callback( croppedImage );
        fileFrame = null;
    } );

    fileFrame.on( 'skippedcrop', () => {
        const selection = fileFrame.state().get( 'selection' );

        const files = selection.map( ( attachment ) => {
            return attachment.toJSON();
        } );

        const file = files.pop();

        callback( file );

        fileFrame = null;
    } );

    fileFrame.on( 'close', () => {
        fileFrame = null;
    } );

    fileFrame.on( 'ready', () => {
        fileFrame.uploader.options.uploader.params = {
            type: 'dokan-vendor-option-media',
        };
    } );

    fileFrame.open();
}

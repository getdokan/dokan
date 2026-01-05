import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Quill, { QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';
import '../styles/richtext.css';
import type { BaseFieldProps } from '../types';

export interface RichTextProps extends BaseFieldProps {
    /**
     * Quill editor options
     */
    quillOptions?: Partial< QuillOptions >;

    /**
     * Custom toolbar configuration
     */
    toolbar?: boolean | string | Array< string | object >;

    /**
     * Media upload handler (for image/video)
     */
    onMediaUpload?: ( type: 'image' | 'video' ) => Promise< {
        url: string;
        alt?: string;
        title?: string;
    } >;

    /**
     * Placeholder text
     */
    placeholder?: string;

    /**
     * Theme ('snow' | 'bubble')
     */
    theme?: 'snow' | 'bubble';

    /**
     * Sanitize HTML function
     */
    sanitizeHTML?: ( html: string ) => string;
}

/**
 * Opens WordPress media uploader (if available).
 * @param onSelect
 * @param type
 */
const openWpMediaUploader = (
    onSelect: ( url: string, attachment: any ) => void,
    type = 'image'
) => {
    // @ts-ignore
    if ( typeof wp === 'undefined' || ! wp.media ) {
        return;
    }

    // @ts-ignore
    const frame = wp.media( {
        title: __( 'Select or Upload Media', 'wedevs-plugin-ui' ),
        button: {
            text: __( 'Use this media', 'wedevs-plugin-ui' ),
        },
        library: {
            type,
        },
        multiple: false,
    } );

    frame.on( 'select', () => {
        const attachment = frame.state().get( 'selection' ).first().toJSON();
        onSelect( attachment.url, attachment );
    } );

    frame.open();
};

/**
 * RichText Component
 *
 * A WYSIWYG rich text editor using Quill.
 */
const RichText = forwardRef< Quill, RichTextProps >( ( props, ref ) => {
    const {
        value,
        defaultValue,
        onChange,
        disabled = false,
        readOnly = false,
        placeholder,
        quillOptions,
        toolbar = true,
        onMediaUpload,
        theme = 'snow',
        sanitizeHTML: customSanitizeHTML,
        className = '',
    } = props;

    const containerRef = useRef< HTMLDivElement >( null );
    const quillInstanceRef = useRef< Quill | null >( null );
    const onChangeRef = useRef( onChange );
    const isInternalChange = useRef( false );

    // Default sanitize function (basic)
    const sanitizeHTML = customSanitizeHTML || ( ( html: string ) => html );

    // Expose the Quill instance via the forwarded ref
    useImperativeHandle( ref, () => quillInstanceRef.current as Quill, [] );

    useEffect( () => {
        onChangeRef.current = onChange;
    }, [ onChange ] );

    // Initialize the Quill editor
    useEffect( () => {
        if ( ! containerRef.current ) {
            return;
        }

        const editorContainer = containerRef.current.appendChild(
            containerRef.current.ownerDocument.createElement( 'div' )
        );

        // Custom image handler
        const customImageHandler = () => {
            const quill = quillInstanceRef.current;
            if ( ! quill ) {
                return;
            }

            const handleImage = ( url: string, alt?: string ) => {
                const range = quill.getSelection( true );
                const imgHtml = sanitizeHTML(
                    `<img src="${ url }" alt="${ alt || '' }" />`
                );
                quill.clipboard.dangerouslyPasteHTML(
                    range.index,
                    imgHtml,
                    'user'
                );
                quill.setSelection( range.index + 1, 'silent' );
            };

            if ( onMediaUpload ) {
                onMediaUpload( 'image' )
                    .then( ( media ) => {
                        handleImage( media.url, media.alt );
                    } )
                    .catch( () => {
                        // Fallback to WordPress media uploader if available
                        openWpMediaUploader( ( url, attachment ) => {
                            handleImage(
                                url,
                                attachment.alt || attachment.title
                            );
                        }, 'image' );
                    } );
            } else {
                // Use WordPress media uploader if available
                openWpMediaUploader( ( url, attachment ) => {
                    handleImage( url, attachment.alt || attachment.title );
                }, 'image' );
            }
        };

        // Custom video handler
        const customVideoHandler = () => {
            const quill = quillInstanceRef.current;
            if ( ! quill ) {
                return;
            }

            const handleVideo = ( url: string ) => {
                const range = quill.getSelection( true );
                const videoHtml = sanitizeHTML(
                    `<video class="ql-video" height="280" width="500" controls src="${ url }"></video>`
                );
                quill.clipboard.dangerouslyPasteHTML(
                    range.index,
                    videoHtml,
                    'user'
                );
                quill.setSelection( range.index + 1, 'silent' );
            };

            if ( onMediaUpload ) {
                onMediaUpload( 'video' )
                    .then( ( media ) => {
                        handleVideo( media.url );
                    } )
                    .catch( () => {
                        openWpMediaUploader( ( url ) => {
                            handleVideo( url );
                        }, 'video' );
                    } );
            } else {
                openWpMediaUploader( ( url ) => {
                    handleVideo( url );
                }, 'video' );
            }
        };

        // Default toolbar configuration
        const defaultToolbar = Array.isArray( toolbar )
            ? toolbar
            : toolbar === true
            ? [
                  [ { header: [ 1, 2, 3, 4, 5, 6, false ] } ],
                  [ 'bold', 'italic', 'underline', 'strike', 'blockquote' ],
                  [ { list: 'ordered' }, { list: 'bullet' } ],
                  [ { indent: '-1' }, { indent: '+1' } ],
                  [ { color: [] }, { background: [] } ],
                  [ 'link', 'image', 'video' ],
                  [ 'clean' ],
              ]
            : [];

        const defaultModules: QuillOptions[ 'modules' ] = {
            toolbar:
                toolbar === false
                    ? false
                    : {
                          container: defaultToolbar,
                          handlers: {
                              image: customImageHandler,
                              video: customVideoHandler,
                          },
                      },
        };

        // Merge with custom modules
        const modules: QuillOptions[ 'modules' ] = {
            ...defaultModules,
            ...quillOptions?.modules,
            toolbar:
                toolbar === false
                    ? false
                    : {
                          ...( defaultModules.toolbar as object ),
                          ...( quillOptions?.modules?.toolbar as object ),
                          handlers: {
                              ...(
                                  defaultModules.toolbar as {
                                      handlers?: object;
                                  }
                               )?.handlers,
                              ...(
                                  quillOptions?.modules?.toolbar as {
                                      handlers?: object;
                                  }
                               )?.handlers,
                          },
                      },
        };

        const quill = new Quill( editorContainer, {
            theme,
            modules,
            readOnly: readOnly || disabled,
            placeholder:
                placeholder || __( 'Enter your content…', 'wedevs-plugin-ui' ),
            ...quillOptions,
        } );

        quillInstanceRef.current = quill;

        const initialValue =
            ( value as string ) || ( defaultValue as string ) || '';
        if ( initialValue ) {
            quill.clipboard.dangerouslyPasteHTML(
                sanitizeHTML( initialValue )
            );
        }

        quill.on( 'text-change', ( delta, oldDelta, source ) => {
            if ( source === 'user' && onChangeRef.current ) {
                const newHtml = quill.root.innerHTML;
                isInternalChange.current = true;
                onChangeRef.current( newHtml === '<p><br></p>' ? '' : newHtml );
            }
        } );

        return () => {
            quillInstanceRef.current = null;
            if ( containerRef.current ) {
                containerRef.current.innerHTML = '';
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    // Handle value prop changes
    useEffect( () => {
        if ( isInternalChange.current ) {
            isInternalChange.current = false;
            return;
        }

        const quill = quillInstanceRef.current;
        const currentValue = ( value as string ) || '';
        if ( quill && currentValue !== quill.root.innerHTML ) {
            const selection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML(
                sanitizeHTML( currentValue )
            );
            if ( selection ) {
                quill.setSelection(
                    selection.index,
                    selection.length,
                    'silent'
                );
            }
        }
    }, [ value, sanitizeHTML ] );

    // Handle read-only state changes
    useEffect( () => {
        quillInstanceRef.current?.enable( ! readOnly && ! disabled );
    }, [ readOnly, disabled ] );

    return (
        <div
            ref={ containerRef }
            className={ `plugin-ui-rich-text ${ className }` }
        />
    );
} );

RichText.displayName = 'RichText';

export default RichText;

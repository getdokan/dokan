import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Quill, { QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * Opens the WordPress media uploader to select an image or video.
 *
 * @param onSelect - Callback function when media is selected
 * @param type     - Media type ('image' or 'video')
 */
const openWpMediaUploader = (
    onSelect: ( url: string, attachment: Record< string, unknown > ) => void,
    type = 'image'
) => {
    // @ts-ignore - WordPress global
    if ( typeof wp === 'undefined' || ! wp.media ) {
        return;
    }

    // @ts-ignore - WordPress global
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
 * Basic HTML sanitizer for security.
 *
 * @param html - HTML string to sanitize
 */
const sanitizeHTML = ( html: string ): string => {
    const doc = new DOMParser().parseFromString( html, 'text/html' );
    // Remove script tags
    const scripts = doc.querySelectorAll( 'script' );
    scripts.forEach( ( script ) => script.remove() );
    // Remove event handlers
    const allElements = doc.querySelectorAll( '*' );
    allElements.forEach( ( el ) => {
        Array.from( el.attributes ).forEach( ( attr ) => {
            if ( attr.name.startsWith( 'on' ) ) {
                el.removeAttribute( attr.name );
            }
        } );
    } );
    return doc.body.innerHTML;
};

export interface RichTextProps extends Omit< QuillOptions, 'modules' > {
    /**
     * The HTML content to display in the editor.
     */
    value?: string;

    /**
     * Callback that returns the new HTML content when it changes.
     */
    onChange?: ( value: string ) => void;

    /**
     * Placeholder text when editor is empty.
     */
    placeholder?: string;

    /**
     * Whether the editor is read-only.
     */
    readOnly?: boolean;

    /**
     * Additional CSS classes.
     */
    className?: string;

    /**
     * Minimum height of the editor.
     */
    minHeight?: number | string;

    /**
     * Enable WordPress media uploader for images.
     */
    enableWpMedia?: boolean;

    /**
     * Custom toolbar configuration.
     */
    toolbar?: QuillOptions[ 'modules' ][ 'toolbar' ];

    /**
     * Custom modules configuration.
     */
    modules?: QuillOptions[ 'modules' ];
}

/**
 * RichText Component
 *
 * A Quill-based rich text editor with WordPress integration.
 */
const RichText = forwardRef< Quill, RichTextProps >( ( props, ref ) => {
    const {
        value = '',
        onChange,
        placeholder,
        readOnly = false,
        className = '',
        minHeight = 200,
        enableWpMedia = true,
        toolbar,
        modules: customModules,
        theme = 'snow',
        ...quillProps
    } = props;

    const containerRef = useRef< HTMLDivElement >( null );
    const quillInstanceRef = useRef< Quill | null >( null );
    const onChangeRef = useRef( onChange );
    const isInternalChange = useRef( false );

    // Expose the Quill instance via the forwarded ref.
    useImperativeHandle( ref, () => quillInstanceRef.current as Quill, [] );

    useEffect( () => {
        onChangeRef.current = onChange;
    }, [ onChange ] );

    // Initialize the Quill editor.
    useEffect( () => {
        if ( ! containerRef.current ) {
            return;
        }

        const editorContainer = containerRef.current.appendChild(
            containerRef.current.ownerDocument.createElement( 'div' )
        );

        // WordPress media handlers
        const wpImageHandler = () => {
            const quill = quillInstanceRef.current;
            if ( ! quill ) return;

            openWpMediaUploader( ( url, attachment ) => {
                const range = quill.getSelection( true );
                const altText =
                    ( attachment.alt as string ) ||
                    ( attachment.title as string ) ||
                    '';
                quill.clipboard.dangerouslyPasteHTML(
                    range.index,
                    `<img src="${ url }" alt="${ altText }" />`,
                    'user'
                );
                quill.setSelection( range.index + 1, 'silent' );
            }, 'image' );
        };

        const wpVideoHandler = () => {
            const quill = quillInstanceRef.current;
            if ( ! quill ) return;

            openWpMediaUploader( ( url ) => {
                const range = quill.getSelection( true );
                quill.clipboard.dangerouslyPasteHTML(
                    range.index,
                    `<video class="ql-video" height="280" width="500" controls src="${ url }"></video>`,
                    'user'
                );
                quill.setSelection( range.index + 1, 'silent' );
            }, 'video' );
        };

        // Default toolbar configuration
        const defaultToolbar = toolbar || [
            [ { header: [ 1, 2, 3, 4, 5, 6, false ] } ],
            [ 'bold', 'italic', 'underline', 'strike', 'blockquote' ],
            [ { list: 'ordered' }, { list: 'bullet' } ],
            [ { indent: '-1' }, { indent: '+1' } ],
            [ { color: [] }, { background: [] } ],
            [ 'link', 'image' ],
            [ 'clean' ],
        ];

        const defaultModules: QuillOptions[ 'modules' ] = {
            toolbar: {
                container: defaultToolbar,
                handlers: enableWpMedia
                    ? {
                          image: wpImageHandler,
                          video: wpVideoHandler,
                      }
                    : {},
            },
        };

        // Merge modules
        const modules: QuillOptions[ 'modules' ] = {
            ...defaultModules,
            ...customModules,
        };

        const quill = new Quill( editorContainer, {
            theme,
            modules,
            readOnly,
            placeholder,
            ...quillProps,
        } );

        quillInstanceRef.current = quill;

        if ( value ) {
            quill.clipboard.dangerouslyPasteHTML( sanitizeHTML( value ) );
        }

        quill.on( 'text-change', ( _delta, _oldDelta, source ) => {
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

    // Handle external value changes
    useEffect( () => {
        if ( isInternalChange.current ) {
            isInternalChange.current = false;
            return;
        }

        const quill = quillInstanceRef.current;
        if ( quill && value !== quill.root.innerHTML ) {
            const selection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML( sanitizeHTML( value || '' ) );
            if ( selection ) {
                quill.setSelection(
                    selection.index,
                    selection.length,
                    'silent'
                );
            }
        }
    }, [ value ] );

    // Toggle read-only state
    useEffect( () => {
        quillInstanceRef.current?.enable( ! readOnly );
    }, [ readOnly ] );

    const minHeightStyle =
        typeof minHeight === 'number' ? `${ minHeight }px` : minHeight;

    return (
        <div
            ref={ containerRef }
            className={ `plugin-ui-richtext ${ className }` }
            style={ {
                // @ts-ignore - CSS custom property
                '--plugin-ui-richtext-min-height': minHeightStyle,
            } }
        />
    );
} );

RichText.displayName = 'RichText';

export default RichText;


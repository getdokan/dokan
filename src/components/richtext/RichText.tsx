import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
} from '@wordpress/element';
import Quill, { QuillOptions } from 'quill';
import 'quill/dist/quill.snow.css';
import './styles.scss';

/**
 * Opens the WordPress media uploader to select an image or video.
 * For usage example and Documentation for this component please go through dokan-lite/docs/frontend/richtext.md
 *
 * @param {function(string, object): void} onSelect       - Callback function to run when media is selected. It receives the URL and the full attachment object.
 * @param {string}                         [type='image'] - The type of media to select ('image' or 'video').
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
        title: 'Select or Upload Media',
        button: {
            text: 'Use this media',
        },
        library: {
            type, // 'image' or 'video'
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
 * Props for the RichText component.
 * Extends QuillOptions to allow full editor customization.
 */
interface RichTextProps extends QuillOptions {
    /** The HTML content to display in the editor. */
    value: string;
    /** Callback that returns the new HTML content when it changes. */
    onChange: ( value: string ) => void;
}

/**
 * A flexible and controlled Quill Rich Text Editor component for React.
 * It allows full customization of the Quill editor by accepting any valid QuillOptions as props.
 * It also forwards a ref to the Quill instance for advanced imperative control.
 */
const RichText = forwardRef< Quill, RichTextProps >( ( props, ref ) => {
    const {
        value,
        onChange,
        readOnly = false,
        theme = 'snow',
        modules: customModules,
        ...quillProps
    } = props;

    const containerRef = useRef< HTMLDivElement >( null );
    const quillInstanceRef = useRef< Quill | null >( null );
    const onChangeRef = useRef( onChange );

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

        const customImageHandler = () => {
            const quill = quillInstanceRef.current;
            if ( ! quill ) {
                return;
            }

            openWpMediaUploader( ( url, attachment ) => {
                const range = quill.getSelection( true );
                const altText = attachment.alt || attachment.title || '';
                quill.clipboard.dangerouslyPasteHTML(
                    range.index,
                    `<img src="${ url }" alt="${ altText }" />`,
                    'user'
                );
                quill.setSelection( range.index + 1, 'silent' );
            }, 'image' );
        };

        const customVideoHandler = () => {
            const quill = quillInstanceRef.current;
            if ( ! quill ) {
                return;
            }

            openWpMediaUploader( ( url ) => {
                const range = quill.getSelection( true );
                quill.clipboard.dangerouslyPasteHTML(
                    range.index,
                    `<video controls src="${ url }"></video>`,
                    'user'
                );
                quill.setSelection( range.index + 1, 'silent' );
            }, 'video' );
        };

        const defaultModules: QuillOptions[ 'modules' ] = {
            toolbar: {
                container: [
                    [ { header: [ 1, 2, 3, 4, 5, 6, false ] } ],
                    [ 'bold', 'italic', 'underline', 'strike', 'blockquote' ],
                    [ { list: 'ordered' }, { list: 'bullet' } ],
                    [ { indent: '-1' }, { indent: '+1' } ],
                    [ { color: [] }, { background: [] } ],
                    [ 'link', 'image', 'video' ],
                    [ 'clean' ],
                ],
                handlers: {
                    image: customImageHandler,
                    video: customVideoHandler,
                },
            },
        };

        // Deep merge modules, giving precedence to custom modules.
        const modules: QuillOptions[ 'modules' ] = {
            ...defaultModules,
            ...customModules,
            toolbar: {
                ...( defaultModules.toolbar as object ),
                ...( customModules?.toolbar as object ),
                handlers: {
                    ...( defaultModules.toolbar as { handlers?: object } )
                        ?.handlers,
                    ...( customModules?.toolbar as { handlers?: object } )
                        ?.handlers,
                },
            },
        };

        const quill = new Quill( editorContainer, {
            theme,
            modules,
            readOnly,
            ...quillProps,
        } );

        quillInstanceRef.current = quill;

        if ( value ) {
            quill.clipboard.dangerouslyPasteHTML( value );
        }

        quill.on( 'text-change', ( delta, oldDelta, source ) => {
            if ( source === 'user' && onChangeRef.current ) {
                const newHtml = quill.root.innerHTML;
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

    // Effect to handle changes to the `value` prop
    useEffect( () => {
        const quill = quillInstanceRef.current;
        if ( quill && value !== quill.root.innerHTML ) {
            const selection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML( value || '' );
            if ( selection ) {
                quill.setSelection( selection, 'silent' );
            }
        }
    }, [ value ] );

    // Effect to toggle the read-only state.
    useEffect( () => {
        quillInstanceRef.current?.enable( ! readOnly );
    }, [ readOnly ] );

    return <div ref={ containerRef }></div>;
} );

RichText.displayName = 'Editor';

export default RichText;

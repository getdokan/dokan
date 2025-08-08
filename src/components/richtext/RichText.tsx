import { useEffect, useRef } from '@wordpress/element';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import './styles.scss';

/**
 * Opens the WordPress media uploader to select an image or video.
 *
 * @param {function(string, object): void} onSelect       - Callback function to run when media is selected. It receives the URL and the full attachment object.
 * @param {string}                         [type='image'] - The type of media to select ('image' or 'video').
 */
const openWpMediaUploader = ( onSelect, type = 'image' ) => {
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
 * A flexible and controlled Quill Rich Text Editor component for React.
 *
 * @param {Object}                 props                  - The component props.
 * @param {string}                 props.value            - The HTML content to display in the editor.
 * @param {function(string): void} props.onChange         - Callback that returns the new HTML content when it changes.
 * @param {boolean}                [props.readOnly=false] - Sets the editor to read-only mode.
 * @param {string}                 [props.theme='snow']   - The theme to use for the editor (e.g., 'snow', 'bubble').
 * @param {Object}                 [props.modules]        - Custom Quill modules configuration. Merged with defaults.
 * @param {Object}                 [props.rest]           - Any other props will be passed to the Quill constructor.
 */
function RichText( props ) {
    const {
        value,
        onChange,
        readOnly = false,
        theme = 'snow',
        modules: customModules,
        ...rest
    } = props;

    const containerRef = useRef( null );
    const quillInstanceRef = useRef( null );
    const onChangeRef = useRef( onChange );

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

        // Custom handlers for image and video uploads
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

        // Define default modules and merge with custom ones
        const defaultModules = {
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

        // Deep merge the modules, giving precedence to custom modules
        const modules = {
            ...defaultModules,
            ...customModules,
            toolbar: {
                ...defaultModules.toolbar,
                ...( customModules && customModules.toolbar ),
                handlers: {
                    ...defaultModules.toolbar.handlers,
                    ...( customModules &&
                        customModules.toolbar &&
                        customModules.toolbar.handlers ),
                },
            },
        };

        const quill = new Quill( editorContainer, {
            theme,
            modules,
            readOnly,
            ...rest,
        } );

        quillInstanceRef.current = quill;

        if ( value ) {
            quill.clipboard.dangerouslyPasteHTML( value );
        }

        quill.on( 'text-change', ( delta, oldDelta, source ) => {
            if ( source === 'user' && onChangeRef.current ) {
                const newHtml = quill.root.innerHTML;
                if ( newHtml === '<p><br></p>' && ! value ) {
                    onChangeRef.current( '' );
                } else {
                    onChangeRef.current( newHtml );
                }
            }
        } );

        return () => {
            quillInstanceRef.current = null;
            if ( containerRef.current ) {
                containerRef.current.innerHTML = '';
            }
        };
        // The effect should only run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [] );

    // Effect to handle changes to the `value` prop
    useEffect( () => {
        const quill = quillInstanceRef.current;
        if ( quill && value !== quill.root.innerHTML ) {
            const selection = quill.getSelection();
            quill.clipboard.dangerouslyPasteHTML( value || '' );
            if ( selection ) {
                quill.setSelection( selection );
            }
        }
    }, [ value ] );

    // Effect to toggle the read-only state.
    useEffect( () => {
        const quill = quillInstanceRef.current;
        if ( quill ) {
            quill.enable( ! readOnly );
        }
    }, [ readOnly ] );

    return <div ref={ containerRef }></div>;
}

RichText.displayName = 'Editor';

export default RichText;

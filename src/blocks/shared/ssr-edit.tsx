import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { Button, Disabled, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

type SSREditProps = {
    name: string;
    attributes: Record< string, unknown >;
    setAttributes?: ( attrs: Record< string, unknown > ) => void;
    children?: any;
};

/**
 * Shared editor canvas for Dokan's dynamic store blocks: the server render
 * (with preview-vendor data outside a store context) plus optional
 * InspectorControls passed as children.
 *
 * The preview is wrapped in <Disabled> so its links, images and forms cannot
 * swallow pointer events — a click anywhere on the block selects the block.
 * The trade-off is that hover-driven previews (the store-hours popover) only
 * behave on the front end.
 *
 * When setAttributes is passed, a "Reset block settings" control is appended
 * to the inspector: it returns every attribute — including the style, colour
 * and typography ones the block supports add — to its block.json default, the
 * per-block counterpart of the template's own Reset.
 * @param root0
 * @param root0.name
 * @param root0.attributes
 * @param root0.setAttributes
 * @param root0.children
 */
const SSREdit = ( {
    name,
    attributes,
    setAttributes,
    children,
}: SSREditProps ) => {
    const blockProps = useBlockProps();

    const resetAll = () => {
        const type = getBlockType( name );

        if ( ! type || ! setAttributes ) {
            return;
        }

        /*
         * Only the block's own settings reset. Every attribute these blocks
         * declare carries a default, which is what separates them from the
         * editor-injected ones (lock, metadata, className, align, style…) a
         * reset must not touch — wiping those would unlock locked blocks and
         * throw away template alignment. The pinned vendor survives too: it is
         * a data binding, not a setting.
         */
        const defaults: Record< string, unknown > = {};

        for ( const [ key, def ] of Object.entries( type.attributes ?? {} ) ) {
            if ( key === 'storeId' ) {
                continue;
            }

            if ( def && typeof def === 'object' && 'default' in def ) {
                const value = ( def as { default: unknown } ).default;

                if ( attributes[ key ] !== value ) {
                    defaults[ key ] = value;
                }
            }
        }

        if ( Object.keys( defaults ).length ) {
            setAttributes( defaults );
        }
    };

    return (
        <div { ...blockProps }>
            { children }
            { setAttributes && (
                <InspectorControls>
                    <PanelBody
                        title={ __( 'Reset', 'dokan-lite' ) }
                        initialOpen={ false }
                    >
                        <Button
                            variant="secondary"
                            isDestructive
                            onClick={ resetAll }
                            __next40pxDefaultSize
                        >
                            { __( 'Reset block settings', 'dokan-lite' ) }
                        </Button>
                        <p>
                            { __(
                                'Returns this block\u2019s own settings to their defaults. The store selection is kept, and colors or typography set through the style panels reset from those panels.',
                                'dokan-lite'
                            ) }
                        </p>
                    </PanelBody>
                </InspectorControls>
            ) }
            <Disabled>
                <ServerSideRender block={ name } attributes={ attributes } />
            </Disabled>
        </div>
    );
};

export default SSREdit;

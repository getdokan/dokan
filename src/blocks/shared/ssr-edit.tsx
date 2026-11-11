import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { getBlockType } from '@wordpress/blocks';
import { Button, Disabled, PanelBody } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import ServerSideRender from '@wordpress/server-side-render';

/**
 * Drop the block support styles that add up when applied twice.
 *
 * useBlockProps() already puts them on the editor wrapper, and the server render
 * prints them again on its own wrapper. Text colour, typography (text align) and
 * link colour are kept: they look the same applied twice, and the markup reads them.
 *
 * @since DOKAN_SINCE
 *
 * @param attributes Block attributes.
 */
export const withoutStackingSupports = (
    attributes: Record< string, unknown >
): Record< string, unknown > => {
    const {
        backgroundColor,
        gradient,
        borderColor,
        style,
        ...rest
    } = attributes;

    if ( ! style || typeof style !== 'object' ) {
        return rest;
    }

    const { spacing, border, shadow, color, ...restStyle } = style as Record<
        string,
        any
    >;

    if ( color && typeof color === 'object' ) {
        const { background, gradient: colorGradient, ...restColor } = color;

        if ( Object.keys( restColor ).length ) {
            restStyle.color = restColor;
        }
    }

    return { ...rest, style: restStyle };
};

type SSREditProps = {
    name: string;
    attributes: Record< string, unknown >;
    setAttributes?: ( attrs: Record< string, unknown > ) => void;
    children?: any;
    interactive?: boolean;
};

/**
 * Shared editor canvas for Dokan's dynamic store blocks: the server render
 * (with preview-vendor data outside a store context) plus optional
 * InspectorControls passed as children.
 *
 * The preview is wrapped in <Disabled> so its links, images and forms cannot
 * swallow pointer events — a click anywhere on the block selects the block.
 * The trade-off is that hover-driven previews (the store-hours popover) only
 * behave on the front end. Blocks whose preview carries its own editor
 * behaviour pass `interactive` to opt out.
 *
 * When setAttributes is passed, a "Reset block settings" control is appended
 * to the inspector: it returns every attribute — including the style, colour
 * and typography ones the block supports add — to its block.json default, the
 * per-block counterpart of the template's own Reset.
 *
 * @since DOKAN_SINCE
 *
 * @param root0
 * @param root0.name
 * @param root0.attributes
 * @param root0.setAttributes
 * @param root0.children
 * @param root0.interactive
 */
const SSREdit = ( {
    name,
    attributes,
    setAttributes,
    children,
    interactive = false,
}: SSREditProps ) => {
    const blockProps = useBlockProps();
    const previewAttributes = withoutStackingSupports( attributes );

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
         * throw away template alignment.
         */
        const defaults: Record< string, unknown > = {};

        for ( const [ key, def ] of Object.entries( type.attributes ?? {} ) ) {
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
                                'Resets this block\u2019s settings. Reset colors and fonts from the Styles panel.',
                                'dokan-lite'
                            ) }
                        </p>
                    </PanelBody>
                </InspectorControls>
            ) }
            { interactive ? (
                <ServerSideRender
                    block={ name }
                    attributes={ previewAttributes }
                />
            ) : (
                <Disabled>
                    <ServerSideRender
                        block={ name }
                        attributes={ previewAttributes }
                    />
                </Disabled>
            ) }
        </div>
    );
};

export default SSREdit;

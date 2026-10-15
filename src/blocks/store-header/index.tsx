import { createBlock, parse, registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import {
    Button,
    PanelBody,
    SelectControl,
    Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import type { StoreBlockEditProps } from '../shared/types';
import metadata from './block.json';
import './style.scss';

type StoreHeaderAttributes = {
    headerLayout: string;
};

type HeaderLayoutData = {
    layouts?: Record< string, string >;
    default?: string;
};

type Pattern = { name: string; content?: string };

type ParsedBlock = ReturnType< typeof parse >[ number ];

/*
 * The header's colours win over the ones baked into the pattern through this
 * block's stylesheet, which stops loading once the block is split. So the split
 * drops the pattern's own colours wherever the header sets one.
 */
const withoutPatternColors = (
    blocks: ParsedBlock[],
    wrapper: Record< string, any >
): ParsedBlock[] => {
    const hasBackground = !! (
        wrapper.backgroundColor ||
        wrapper.gradient ||
        wrapper.style?.color?.background ||
        wrapper.style?.color?.gradient
    );
    const hasText = !! ( wrapper.textColor || wrapper.style?.color?.text );

    return blocks.map( ( block ) => {
        const attrs = { ...block.attributes };
        const color = { ...( attrs.style?.color ?? {} ) };

        if ( hasBackground ) {
            delete attrs.backgroundColor;
            delete attrs.gradient;
            delete color.background;
            delete color.gradient;
        }

        if ( hasText ) {
            delete attrs.textColor;
            delete color.text;
        }

        if ( attrs.style ) {
            attrs.style = { ...attrs.style, color };
        }

        return { ...block, attributes: attrs };
    } );
};

/*
 * Switching layouts is a dropdown here rather than deleting the header and
 * inserting a different pattern, which is the whole reason this block exists.
 * The patterns remain for merchants who want to compose a header themselves.
 */
const LAYOUTS = [
    {
        value: '',
        label: __( 'Use the marketplace default', 'dokan-lite' ),
    },
    { value: 'panel', label: __( 'Panel — beside the banner', 'dokan-lite' ) },
    {
        value: 'default',
        label: __( 'Banner above, details below', 'dokan-lite' ),
    },
    { value: 'stacked', label: __( 'Stacked and centred', 'dokan-lite' ) },
    { value: 'split', label: __( 'Split — no banner', 'dokan-lite' ) },
    { value: 'minimal', label: __( 'Compact — no banner', 'dokan-lite' ) },
];

// Blocks\Assets hands the editor the layout => pattern map and the resolved default.
const layoutData = (): HeaderLayoutData =>
    ( window as unknown as { dokanStoreHeaderLayouts?: HeaderLayoutData } )
        .dokanStoreHeaderLayouts ?? {};

/**
 * Editor for the store header block.
 *
 * @param root0
 * @param root0.attributes
 * @param root0.setAttributes
 * @param root0.clientId
 */
const Edit = ( {
    attributes,
    setAttributes,
    clientId,
}: StoreBlockEditProps< StoreHeaderAttributes > & {
    clientId: string;
} ) => {
    const { replaceBlocks } = useDispatch( 'core/block-editor' );

    // The pattern this header renders right now, by its registered slug.
    const data = layoutData();
    const layoutKey = attributes.headerLayout || data.default || 'panel';
    const patternName = data.layouts?.[ layoutKey ];

    const pattern = useSelect(
        ( select ) => {
            if ( ! patternName ) {
                return undefined;
            }

            const patterns: Pattern[] =
                ( select( 'core' ) as any ).getBlockPatterns?.() ?? [];

            return patterns.find( ( item ) => item.name === patternName );
        },
        [ patternName ]
    );

    /*
     * Splits this block into the pattern it renders, so every part of the
     * header becomes an ordinary editable block. The pattern is wrapped in a
     * group that keeps this block's colour, spacing, alignment and classes,
     * so the page does not change until the merchant edits one of the pieces.
     */
    const customize = () => {
        if ( ! pattern?.content ) {
            return;
        }

        const { headerLayout, className, ...wrapper } =
            attributes as StoreHeaderAttributes & Record< string, any >;
        const textAlign = wrapper.style?.typography?.textAlign;
        const classes = [
            'wp-block-dokan-store-header',
            `is-header-${ layoutKey }`,
            textAlign ? `has-text-align-${ textAlign }` : '',
            className ?? '',
        ]
            .filter( Boolean )
            .join( ' ' );

        replaceBlocks(
            clientId,
            createBlock(
                'core/group',
                { ...wrapper, className: classes, layout: { type: 'default' } },
                withoutPatternColors( parse( pattern.content ), wrapper )
            )
        );
    };

    return (
        <SSREdit
            name={ metadata.name }
            attributes={ attributes }
            setAttributes={ setAttributes }
        >
            <InspectorControls>
                <PanelBody title={ __( 'Header Layout', 'dokan-lite' ) }>
                    <SelectControl
                        label={ __( 'Layout', 'dokan-lite' ) }
                        value={ attributes.headerLayout ?? '' }
                        options={ LAYOUTS }
                        onChange={ ( headerLayout ) =>
                            setAttributes( { headerLayout } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />

                    { ! attributes.headerLayout && (
                        <Notice status="info" isDismissible={ false }>
                            { __(
                                'Following the layout chosen in Dokan settings. Pick one here to override it for this template only.',
                                'dokan-lite'
                            ) }
                        </Notice>
                    ) }
                </PanelBody>

                <PanelBody title={ __( 'Customize', 'dokan-lite' ) }>
                    <Button
                        variant="secondary"
                        onClick={ customize }
                        disabled={ ! pattern?.content }
                        __next40pxDefaultSize
                    >
                        { __( 'Customize this header', 'dokan-lite' ) }
                    </Button>
                    <p>
                        { __(
                            'Splits the header into separate blocks — picture, name, details, social links and banner — so each can be edited on its own. The layout dropdown no longer applies afterwards.',
                            'dokan-lite'
                        ) }
                    </p>
                </PanelBody>
            </InspectorControls>
        </SSREdit>
    );
};

registerBlockType( metadata.name, {
    edit: Edit,
    save: () => null,
} );

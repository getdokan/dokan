import { registerBlockType } from '@wordpress/blocks';
import {
    InnerBlocks,
    InspectorControls,
    useBlockProps,
    useInnerBlocksProps,
} from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import metadata from './block.json';
import './style.scss';

/*
 * A container block, so it is edited live rather than server-rendered: the
 * merchant arranges real child blocks inside it. render.php only wraps the
 * already-rendered children and fires the two widget-area actions around them.
 */
const TEMPLATE = [
    [ 'dokan/store-category-menu', {} ],
    [ 'dokan/store-location-map', {} ],
    [ 'dokan/store-open-close-hours', {} ],
    [ 'dokan/store-contact-form', {} ],
];

type StoreSidebarAttributes = { isSticky: boolean };

const Edit = ( {
    attributes,
    setAttributes,
}: {
    attributes: StoreSidebarAttributes;
    setAttributes: ( attrs: Partial< StoreSidebarAttributes > ) => void;
} ) => {
    const blockProps = useBlockProps( { className: 'dokan-store-sidebar' } );
    const innerBlocksProps = useInnerBlocksProps( blockProps, {
        template: TEMPLATE,
    } );

    // Sticky is not previewed: the editor canvas does not scroll the way a page does.
    return (
        <>
            <InspectorControls>
                <PanelBody title={ __( 'Sidebar Settings', 'dokan-lite' ) }>
                    <ToggleControl
                        label={ __( 'Sticky on scroll', 'dokan-lite' ) }
                        help={ __(
                            'Keeps the sidebar in view while the products scroll. Themes with their own sticky header may need the offset adjusted.',
                            'dokan-lite'
                        ) }
                        checked={ !! attributes.isSticky }
                        onChange={ ( isSticky ) =>
                            setAttributes( { isSticky } )
                        }
                        __nextHasNoMarginBottom
                    />
                </PanelBody>
            </InspectorControls>
            <div { ...innerBlocksProps } />
        </>
    );
};

registerBlockType( metadata.name, {
    edit: Edit,
    save: () => <InnerBlocks.Content />,
} );

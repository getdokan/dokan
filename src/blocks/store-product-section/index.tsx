import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    TextControl,
    Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import StorePanel from '../shared/store-panel';
import metadata from './block.json';
import './style.scss';

const SECTIONS = [
    { value: 'featured', label: __( 'Featured Products', 'dokan-lite' ) },
    { value: 'latest', label: __( 'Latest Products', 'dokan-lite' ) },
    {
        value: 'best_selling',
        label: __( 'Best Selling Products', 'dokan-lite' ),
    },
    { value: 'top_rated', label: __( 'Top Rated Products', 'dokan-lite' ) },
];

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => (
        <SSREdit name={ metadata.name } attributes={ attributes }>
            <InspectorControls>
                <PanelBody
                    title={ __( 'Product Section Settings', 'dokan-lite' ) }
                >
                    <SelectControl
                        label={ __( 'Section', 'dokan-lite' ) }
                        value={ attributes.sectionId ?? 'featured' }
                        options={ SECTIONS }
                        onChange={ ( sectionId ) =>
                            setAttributes( { sectionId } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <TextControl
                        label={ __( 'Heading', 'dokan-lite' ) }
                        help={ __(
                            'Leave empty to use the section default.',
                            'dokan-lite'
                        ) }
                        value={ attributes.title ?? '' }
                        onChange={ ( title ) => setAttributes( { title } ) }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />

                    <Notice status="warning" isDismissible={ false }>
                        { __(
                            'Store pages already render every enabled product section automatically, above the product grid. To place this section yourself, first hide it under Appearance → Customize → Store, or it will appear twice.',
                            'dokan-lite'
                        ) }
                    </Notice>
                </PanelBody>
            </InspectorControls>

            <StorePanel
                attributes={ attributes }
                setAttributes={ setAttributes }
            />
        </SSREdit>
    ),
    save: () => null,
} );

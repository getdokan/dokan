import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import metadata from './block.json';

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => (
        <SSREdit name={ metadata.name } attributes={ attributes }>
            <InspectorControls>
                <PanelBody title={ __( 'Store List Settings', 'dokan-lite' ) }>
                    <RangeControl
                        label={ __( 'Stores per page', 'dokan-lite' ) }
                        value={ attributes.perPage }
                        onChange={ ( perPage ) => setAttributes( { perPage } ) }
                        min={ 1 }
                        max={ 50 }
                    />
                    <RangeControl
                        label={ __( 'Columns', 'dokan-lite' ) }
                        value={ attributes.columns }
                        onChange={ ( columns ) => setAttributes( { columns } ) }
                        min={ 1 }
                        max={ 6 }
                    />
                    <ToggleControl
                        label={ __( 'Featured vendors only', 'dokan-lite' ) }
                        checked={ attributes.featured }
                        onChange={ ( featured ) => setAttributes( { featured } ) }
                    />
                    <ToggleControl
                        label={ __( 'Vendors with products only', 'dokan-lite' ) }
                        checked={ attributes.withProductsOnly }
                        onChange={ ( withProductsOnly ) =>
                            setAttributes( { withProductsOnly } )
                        }
                    />
                    <TextControl
                        label={ __( 'Store categories', 'dokan-lite' ) }
                        help={ __(
                            'Comma separated store category slugs. Requires the store category feature.',
                            'dokan-lite'
                        ) }
                        value={ attributes.category }
                        onChange={ ( category ) => setAttributes( { category } ) }
                    />
                    <SelectControl
                        label={ __( 'Order by', 'dokan-lite' ) }
                        value={ attributes.orderby }
                        options={ [
                            { value: '', label: __( 'Site default', 'dokan-lite' ) },
                            { value: 'most_recent', label: __( 'Most Recent', 'dokan-lite' ) },
                            { value: 'total_orders', label: __( 'Most Popular', 'dokan-lite' ) },
                            { value: 'random', label: __( 'Random', 'dokan-lite' ) },
                        ] }
                        onChange={ ( orderby ) => setAttributes( { orderby } ) }
                    />
                </PanelBody>
            </InspectorControls>
        </SSREdit>
    ),
    save: () => null,
} );

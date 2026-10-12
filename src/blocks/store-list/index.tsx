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
import './style.scss';

// Sorting is filterable and Pro modules add to it, so the list comes from the server.
const sortOptions = (): Record< string, string > =>
    ( window as any )?.dokanBlocksData?.sortOptions ?? {};

// Admin settings win: an element switched off site-wide is not offered here at all.
const adminAllows = ( key: string ): boolean =>
    ( window as any )?.dokanBlocksData?.settings?.[ key ] !== false;

const cardElements = () =>
    [
        {
            key: 'showAvatar',
            label: __( 'Store avatar', 'dokan-lite' ),
            help: __( 'The round store icon on each card.', 'dokan-lite' ),
        },
        {
            key: 'showFeatured',
            label: __( 'Featured tag', 'dokan-lite' ),
        },
        {
            key: 'showOpenClose',
            label: __( 'Open/closed status', 'dokan-lite' ),
            enabled: adminAllows( 'openClose' ),
        },
        {
            key: 'showRating',
            label: __( 'Rating', 'dokan-lite' ),
        },
        {
            key: 'showAddress',
            label: __( 'Store address', 'dokan-lite' ),
            enabled: adminAllows( 'address' ),
        },
        {
            key: 'showPhone',
            label: __( 'Phone number', 'dokan-lite' ),
            enabled: adminAllows( 'phone' ),
        },
    ].filter( ( element ) => element.enabled !== false );

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
                        onChange={ ( featured ) =>
                            setAttributes( { featured } )
                        }
                    />
                    <ToggleControl
                        label={ __(
                            'Vendors with products only',
                            'dokan-lite'
                        ) }
                        checked={ attributes.withProductsOnly }
                        onChange={ ( withProductsOnly ) =>
                            setAttributes( { withProductsOnly } )
                        }
                    />
                    { adminAllows( 'storeCategory' ) && (
                        <TextControl
                            label={ __( 'Store categories', 'dokan-lite' ) }
                            help={ __(
                                'Comma separated store category slugs. Requires the store category feature.',
                                'dokan-lite'
                            ) }
                            value={ attributes.category }
                            onChange={ ( category ) =>
                                setAttributes( { category } )
                            }
                        />
                    ) }
                    <TextControl
                        label={ __( 'Fallback store name', 'dokan-lite' ) }
                        help={ __(
                            'Shown when a vendor has not named their store. Leave empty to show nothing.',
                            'dokan-lite'
                        ) }
                        value={ attributes.defaultStoreName }
                        onChange={ ( defaultStoreName ) =>
                            setAttributes( { defaultStoreName } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={ __( 'Order by', 'dokan-lite' ) }
                        value={ attributes.orderby }
                        options={ [
                            {
                                value: '',
                                label: __( 'Site default', 'dokan-lite' ),
                            },
                            ...Object.entries( sortOptions() ).map(
                                ( [ value, label ] ) => ( { value, label } )
                            ),
                        ] }
                        onChange={ ( orderby ) => setAttributes( { orderby } ) }
                    />
                </PanelBody>

                <PanelBody
                    title={ __( 'Card Elements', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    { cardElements().map( ( { key, label, help } ) => (
                        <ToggleControl
                            key={ key }
                            label={ label }
                            help={ help }
                            checked={ attributes[ key ] }
                            onChange={ ( value ) =>
                                setAttributes( { [ key ]: value } )
                            }
                        />
                    ) ) }
                </PanelBody>
            </InspectorControls>
        </SSREdit>
    ),
    save: () => null,
} );

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import metadata from './block.json';
import './style.scss';

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => (
        <SSREdit name={ metadata.name } attributes={ attributes }>
            <InspectorControls>
                <PanelBody title={ __( 'Filter Bar Settings', 'dokan-lite' ) }>
                    <ToggleControl
                        label={ __( 'Show store count', 'dokan-lite' ) }
                        checked={ attributes.showStoreCount }
                        onChange={ ( showStoreCount ) =>
                            setAttributes( { showStoreCount } )
                        }
                    />
                    <ToggleControl
                        label={ __( 'Show search', 'dokan-lite' ) }
                        checked={ attributes.showSearch }
                        onChange={ ( showSearch ) =>
                            setAttributes( { showSearch } )
                        }
                    />
                    <ToggleControl
                        label={ __( 'Show sorting', 'dokan-lite' ) }
                        checked={ attributes.showSort }
                        onChange={ ( showSort ) =>
                            setAttributes( { showSort } )
                        }
                    />
                    <ToggleControl
                        label={ __(
                            'Show grid/list view toggle',
                            'dokan-lite'
                        ) }
                        checked={ attributes.showViewToggle }
                        onChange={ ( showViewToggle ) =>
                            setAttributes( { showViewToggle } )
                        }
                    />
                </PanelBody>
            </InspectorControls>
        </SSREdit>
    ),
    save: () => null,
} );

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import StorePanel from '../shared/store-panel';
import metadata from './block.json';
import './style.scss';

const LEVELS = [ 1, 2, 3, 4, 5, 6 ].map( ( level ) => ( {
    value: String( level ),
    label: `H${ level }`,
} ) );

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => (
        <SSREdit
            name={ metadata.name }
            attributes={ attributes }
            setAttributes={ setAttributes }
        >
            <InspectorControls>
                <PanelBody title={ __( 'Store Name Settings', 'dokan-lite' ) }>
                    <SelectControl
                        label={ __( 'Heading level', 'dokan-lite' ) }
                        value={ String( attributes.level ?? 1 ) }
                        options={ LEVELS }
                        onChange={ ( level ) =>
                            setAttributes( { level: Number( level ) } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <ToggleControl
                        label={ __( 'Link to store page', 'dokan-lite' ) }
                        checked={ !! attributes.isLink }
                        onChange={ ( isLink ) => setAttributes( { isLink } ) }
                        __nextHasNoMarginBottom
                    />
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

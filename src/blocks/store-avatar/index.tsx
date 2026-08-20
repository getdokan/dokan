import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import StorePanel from '../shared/store-panel';
import metadata from './block.json';
import './style.scss';

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => (
        <SSREdit
            name={ metadata.name }
            attributes={ attributes }
            setAttributes={ setAttributes }
        >
            <InspectorControls>
                <PanelBody
                    title={ __( 'Profile Picture Settings', 'dokan-lite' ) }
                >
                    <SelectControl
                        label={ __( 'Shape', 'dokan-lite' ) }
                        value={ attributes.shape ?? 'circle' }
                        options={ [
                            {
                                value: 'circle',
                                label: __( 'Circle', 'dokan-lite' ),
                            },
                            {
                                value: 'square',
                                label: __( 'Square', 'dokan-lite' ),
                            },
                        ] }
                        onChange={ ( shape ) => setAttributes( { shape } ) }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <RangeControl
                        label={ __( 'Size (px)', 'dokan-lite' ) }
                        value={ attributes.size ?? 150 }
                        onChange={ ( size ) =>
                            setAttributes( { size: Number( size ) || 150 } )
                        }
                        min={ 32 }
                        max={ 400 }
                        step={ 2 }
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

import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, RangeControl, ToggleControl } from '@wordpress/components';
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
                    title={ __( 'Store Banner Settings', 'dokan-lite' ) }
                >
                    <RangeControl
                        label={ __( 'Height (px)', 'dokan-lite' ) }
                        help={ __(
                            'Set to 0 to use the marketplace default banner height.',
                            'dokan-lite'
                        ) }
                        value={ attributes.height ?? 0 }
                        onChange={ ( height ) =>
                            setAttributes( { height: Number( height ) || 0 } )
                        }
                        min={ 0 }
                        max={ 800 }
                        step={ 10 }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <RangeControl
                        label={ __( 'Focal point — horizontal', 'dokan-lite' ) }
                        help={ __(
                            'Which part of the banner stays visible when it is cropped.',
                            'dokan-lite'
                        ) }
                        value={ attributes.focalX ?? 50 }
                        onChange={ ( focalX ) => {
                            const value = Number( focalX );
                            setAttributes( {
                                focalX: Number.isFinite( value ) ? value : 50,
                            } );
                        } }
                        min={ 0 }
                        max={ 100 }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <RangeControl
                        label={ __( 'Focal point — vertical', 'dokan-lite' ) }
                        value={ attributes.focalY ?? 50 }
                        onChange={ ( focalY ) => {
                            const value = Number( focalY );
                            setAttributes( {
                                focalY: Number.isFinite( value ) ? value : 50,
                            } );
                        } }
                        min={ 0 }
                        max={ 100 }
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

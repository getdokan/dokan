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
                <PanelBody title={ __( 'Social Icon Settings', 'dokan-lite' ) }>
                    <RangeControl
                        label={ __( 'Icon size (px)', 'dokan-lite' ) }
                        value={ attributes.iconSize ?? 24 }
                        onChange={ ( iconSize ) =>
                            setAttributes( {
                                iconSize: Number( iconSize ) || 24,
                            } )
                        }
                        min={ 10 }
                        max={ 96 }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <ToggleControl
                        label={ __( 'Open in new tab', 'dokan-lite' ) }
                        checked={ !! attributes.openInNewTab }
                        onChange={ ( openInNewTab ) =>
                            setAttributes( { openInNewTab } )
                        }
                        __nextHasNoMarginBottom
                    />
                    <ToggleControl
                        label={ __( 'Show network names', 'dokan-lite' ) }
                        help={ __(
                            'Names are always available to screen readers.',
                            'dokan-lite'
                        ) }
                        checked={ !! attributes.showLabels }
                        onChange={ ( showLabels ) =>
                            setAttributes( { showLabels } )
                        }
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

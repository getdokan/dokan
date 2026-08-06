import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, ToggleControl, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import StorePanel from '../shared/store-panel';
import metadata from './block.json';
import './style.scss';

const FIELDS = [
    { key: 'showAddress', label: __( 'Show address', 'dokan-lite' ) },
    { key: 'showPhone', label: __( 'Show phone', 'dokan-lite' ) },
    { key: 'showEmail', label: __( 'Show email', 'dokan-lite' ) },
    { key: 'showRating', label: __( 'Show rating', 'dokan-lite' ) },
    { key: 'showOpenClose', label: __( 'Show opening hours', 'dokan-lite' ) },
];

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => (
        <SSREdit name={ metadata.name } attributes={ attributes }>
            <InspectorControls>
                <PanelBody title={ __( 'Store Info Settings', 'dokan-lite' ) }>
                    { FIELDS.map( ( field ) => (
                        <ToggleControl
                            key={ field.key }
                            label={ field.label }
                            checked={ !! attributes[ field.key ] }
                            onChange={ ( value ) =>
                                setAttributes( { [ field.key ]: value } )
                            }
                            __nextHasNoMarginBottom
                        />
                    ) ) }

                    <Notice status="info" isDismissible={ false }>
                        { __(
                            'These toggles can only hide a field. Fields hidden by the marketplace privacy settings, or by the vendor, stay hidden regardless.',
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

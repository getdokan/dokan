import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    ToggleControl,
    Notice,
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
                <PanelBody title={ __( 'Tab Content Settings', 'dokan-lite' ) }>
                    <RangeControl
                        label={ __( 'Columns', 'dokan-lite' ) }
                        help={ __(
                            'Set to 0 to use the theme default.',
                            'dokan-lite'
                        ) }
                        value={ attributes.columns ?? 0 }
                        onChange={ ( columns ) =>
                            setAttributes( { columns: Number( columns ) || 0 } )
                        }
                        min={ 0 }
                        max={ 6 }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <ToggleControl
                        label={ __( 'Show pagination', 'dokan-lite' ) }
                        checked={ !! attributes.showPagination }
                        onChange={ ( showPagination ) =>
                            setAttributes( { showPagination } )
                        }
                        __nextHasNoMarginBottom
                    />

                    <Notice status="info" isDismissible={ false }>
                        { __(
                            'The editor always previews the products tab. Terms and Conditions, and any tabs added by extensions, render on the front end when their tab is open.',
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

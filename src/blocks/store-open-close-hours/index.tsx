import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import type { StoreBlockEditProps } from '../shared/types';
import metadata from './block.json';
import './style.scss';

type StoreOpenCloseHoursAttributes = {
    title: string;
    showTitle: boolean;
};

registerBlockType( metadata.name, {
    edit: ( {
        attributes,
        setAttributes,
    }: StoreBlockEditProps< StoreOpenCloseHoursAttributes > ) => (
        <SSREdit
            name={ metadata.name }
            attributes={ attributes }
            setAttributes={ setAttributes }
        >
            <InspectorControls>
                <PanelBody title={ __( 'Settings', 'dokan-lite' ) }>
                    <ToggleControl
                        label={ __( 'Show title', 'dokan-lite' ) }
                        checked={ !! attributes.showTitle }
                        onChange={ ( showTitle ) =>
                            setAttributes( { showTitle } )
                        }
                        __nextHasNoMarginBottom
                    />
                    { !! attributes.showTitle && (
                        <TextControl
                            label={ __( 'Title', 'dokan-lite' ) }
                            help={ __(
                                'Leave empty to use the default title.',
                                'dokan-lite'
                            ) }
                            value={ attributes.title ?? '' }
                            onChange={ ( title ) => setAttributes( { title } ) }
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    ) }
                </PanelBody>
            </InspectorControls>
        </SSREdit>
    ),
    save: () => null,
} );

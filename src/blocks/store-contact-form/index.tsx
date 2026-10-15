import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import ColorPanel from '../shared/color-panel';
import TextList from '../shared/text-list';
import type { StoreBlockEditProps } from '../shared/types';
import metadata from './block.json';
import './style.scss';

type StoreContactFormAttributes = {
    title: string;
    showTitle: boolean;
    buttonText: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    messagePlaceholder: string;
    buttonColor: string;
    buttonTextColor: string;
};

// Every text is optional; the placeholder is the wording shipped today.
const TEXTS = [
    {
        key: 'buttonText',
        label: __( 'Send button', 'dokan-lite' ),
        placeholder: __( 'Send Message', 'dokan-lite' ),
    },
    {
        key: 'namePlaceholder',
        label: __( 'Name placeholder', 'dokan-lite' ),
        placeholder: __( 'Your Name', 'dokan-lite' ),
    },
    {
        key: 'emailPlaceholder',
        label: __( 'Email placeholder', 'dokan-lite' ),
        placeholder: __( 'you@example.com', 'dokan-lite' ),
    },
    {
        key: 'messagePlaceholder',
        label: __( 'Message placeholder', 'dokan-lite' ),
        placeholder: __( 'Type your message…', 'dokan-lite' ),
    },
];

registerBlockType( metadata.name, {
    edit: ( {
        attributes,
        setAttributes,
    }: StoreBlockEditProps< StoreContactFormAttributes > ) => (
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
                <PanelBody
                    title={ __( 'Form Text', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    <TextList
                        fields={ TEXTS }
                        attributes={ attributes }
                        setAttributes={ setAttributes }
                    />
                </PanelBody>
            </InspectorControls>

            <ColorPanel
                title={ __( 'Button', 'dokan-lite' ) }
                settings={ [
                    {
                        label: __( 'Button background', 'dokan-lite' ),
                        value: attributes.buttonColor,
                        onChange: ( buttonColor ) =>
                            setAttributes( { buttonColor } ),
                    },
                    {
                        label: __( 'Button text', 'dokan-lite' ),
                        value: attributes.buttonTextColor,
                        onChange: ( buttonTextColor ) =>
                            setAttributes( { buttonTextColor } ),
                    },
                ] }
            />
        </SSREdit>
    ),
    save: () => null,
} );

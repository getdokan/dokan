import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    SelectControl,
    TextControl,
    ToggleControl,
    Notice,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import IconControl from '../shared/icon-control';
import ColorPanel from '../shared/color-panel';
import type { IconSuggestion } from '../shared/icon-control';
import type { StoreBlockEditProps } from '../shared/types';
import metadata from './block.json';
import './style.scss';

type StoreInfoAttributes = {
    showAddress: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showRating: boolean;
    showOpenClose: boolean;
    showIcons: boolean;
    infoLayout: 'list' | 'inline';
    addressIcon: string;
    phoneIcon: string;
    emailIcon: string;
    ratingIcon: string;
    openCloseIcon: string;
    addressLabel: string;
    phoneLabel: string;
    emailLabel: string;
    ratingLabel: string;
    openCloseLabel: string;
    openText: string;
    closedText: string;
    iconColor: string;
    iconSize: 'small' | 'medium' | 'large';
    boldLabels: boolean;
};

type Line = {
    toggle: keyof StoreInfoAttributes;
    icon: keyof StoreInfoAttributes;
    label: keyof StoreInfoAttributes;
    title: string;
    labelPlaceholder: string;
    icons: IconSuggestion[];
};

// One entry per line of the list, in render order.
const LINES: Line[] = [
    {
        toggle: 'showAddress',
        icon: 'addressIcon',
        label: 'addressLabel',
        title: __( 'Address', 'dokan-lite' ),
        labelPlaceholder: __( 'Find us', 'dokan-lite' ),
        icons: [
            {
                value: 'fas fa-map-marker-alt',
                label: __( 'Map marker', 'dokan-lite' ),
            },
            { value: 'fas fa-map', label: __( 'Map', 'dokan-lite' ) },
            { value: 'fas fa-home', label: __( 'Home', 'dokan-lite' ) },
        ],
    },
    {
        toggle: 'showPhone',
        icon: 'phoneIcon',
        label: 'phoneLabel',
        title: __( 'Phone', 'dokan-lite' ),
        labelPlaceholder: __( 'Call us', 'dokan-lite' ),
        icons: [
            { value: 'fas fa-mobile-alt', label: __( 'Mobile', 'dokan-lite' ) },
            { value: 'fas fa-phone', label: __( 'Phone', 'dokan-lite' ) },
            { value: 'fab fa-whatsapp', label: __( 'WhatsApp', 'dokan-lite' ) },
        ],
    },
    {
        toggle: 'showEmail',
        icon: 'emailIcon',
        label: 'emailLabel',
        title: __( 'Email', 'dokan-lite' ),
        labelPlaceholder: __( 'Email us', 'dokan-lite' ),
        icons: [
            { value: 'far fa-envelope', label: __( 'Envelope', 'dokan-lite' ) },
            {
                value: 'fas fa-envelope',
                label: __( 'Envelope, solid', 'dokan-lite' ),
            },
            { value: 'fas fa-at', label: __( 'At sign', 'dokan-lite' ) },
        ],
    },
    {
        toggle: 'showRating',
        icon: 'ratingIcon',
        label: 'ratingLabel',
        title: __( 'Rating', 'dokan-lite' ),
        labelPlaceholder: __( 'Rated', 'dokan-lite' ),
        icons: [
            { value: 'fas fa-star', label: __( 'Star', 'dokan-lite' ) },
            {
                value: 'far fa-star',
                label: __( 'Star, outline', 'dokan-lite' ),
            },
            {
                value: 'fas fa-thumbs-up',
                label: __( 'Thumbs up', 'dokan-lite' ),
            },
        ],
    },
    {
        toggle: 'showOpenClose',
        icon: 'openCloseIcon',
        label: 'openCloseLabel',
        title: __( 'Opening hours', 'dokan-lite' ),
        labelPlaceholder: __( 'Hours', 'dokan-lite' ),
        icons: [
            {
                value: 'fas fa-shopping-cart',
                label: __( 'Cart', 'dokan-lite' ),
            },
            { value: 'far fa-clock', label: __( 'Clock', 'dokan-lite' ) },
            { value: 'fas fa-store', label: __( 'Store', 'dokan-lite' ) },
        ],
    },
];

registerBlockType( metadata.name, {
    edit: ( {
        attributes,
        setAttributes,
    }: StoreBlockEditProps< StoreInfoAttributes > ) => (
        <SSREdit
            name={ metadata.name }
            attributes={ attributes }
            setAttributes={ setAttributes }
        >
            <InspectorControls>
                <PanelBody title={ __( 'Store Info Settings', 'dokan-lite' ) }>
                    { LINES.map( ( line ) => (
                        <ToggleControl
                            key={ line.toggle }
                            label={ line.title }
                            checked={ !! attributes[ line.toggle ] }
                            onChange={ ( value ) =>
                                setAttributes( { [ line.toggle ]: value } )
                            }
                            __nextHasNoMarginBottom
                        />
                    ) ) }

                    <ToggleControl
                        label={ __( 'Show icons', 'dokan-lite' ) }
                        checked={ !! attributes.showIcons }
                        onChange={ ( showIcons ) =>
                            setAttributes( { showIcons } )
                        }
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={ __( 'Layout', 'dokan-lite' ) }
                        value={ attributes.infoLayout ?? 'list' }
                        options={ [
                            {
                                value: 'list',
                                label: __( 'List', 'dokan-lite' ),
                            },
                            {
                                value: 'inline',
                                label: __( 'Inline', 'dokan-lite' ),
                            },
                        ] }
                        onChange={ ( infoLayout ) =>
                            setAttributes( { infoLayout } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />

                    <Notice status="info" isDismissible={ false }>
                        { __(
                            'These toggles can only hide a field. Fields hidden by the marketplace privacy settings, or by the vendor, stay hidden regardless.',
                            'dokan-lite'
                        ) }
                    </Notice>
                </PanelBody>

                <PanelBody
                    title={ __( 'Labels and Icons', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    { LINES.filter( ( line ) => attributes[ line.toggle ] ).map(
                        ( line ) => (
                            <div
                                key={ line.icon }
                                className="dokan-store-info-line-settings"
                            >
                                <TextControl
                                    label={ line.title }
                                    help={ __(
                                        'Label shown before the value. Leave empty for none.',
                                        'dokan-lite'
                                    ) }
                                    placeholder={ line.labelPlaceholder }
                                    value={
                                        ( attributes[
                                            line.label
                                        ] as string ) ?? ''
                                    }
                                    onChange={ ( value ) =>
                                        setAttributes( {
                                            [ line.label ]: value,
                                        } )
                                    }
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                { attributes.showIcons && (
                                    <IconControl
                                        label={ __( 'Icon', 'dokan-lite' ) }
                                        value={
                                            ( attributes[
                                                line.icon
                                            ] as string ) ?? ''
                                        }
                                        suggestions={ line.icons }
                                        onChange={ ( value ) =>
                                            setAttributes( {
                                                [ line.icon ]: value,
                                            } )
                                        }
                                    />
                                ) }
                            </div>
                        )
                    ) }

                    { attributes.showOpenClose && (
                        <>
                            <TextControl
                                label={ __( 'Open text', 'dokan-lite' ) }
                                help={ __(
                                    'A message the vendor wrote still shows first.',
                                    'dokan-lite'
                                ) }
                                placeholder={ __( 'Store Open', 'dokan-lite' ) }
                                value={ attributes.openText ?? '' }
                                onChange={ ( openText ) =>
                                    setAttributes( { openText } )
                                }
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                            <TextControl
                                label={ __( 'Closed text', 'dokan-lite' ) }
                                placeholder={ __(
                                    'Store Closed',
                                    'dokan-lite'
                                ) }
                                value={ attributes.closedText ?? '' }
                                onChange={ ( closedText ) =>
                                    setAttributes( { closedText } )
                                }
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </>
                    ) }

                    <ToggleControl
                        label={ __( 'Bold labels', 'dokan-lite' ) }
                        checked={ !! attributes.boldLabels }
                        onChange={ ( boldLabels ) =>
                            setAttributes( { boldLabels } )
                        }
                        __nextHasNoMarginBottom
                    />
                    { attributes.showIcons && (
                        <SelectControl
                            label={ __( 'Icon size', 'dokan-lite' ) }
                            value={ attributes.iconSize ?? 'medium' }
                            options={ [
                                {
                                    value: 'small',
                                    label: __( 'Small', 'dokan-lite' ),
                                },
                                {
                                    value: 'medium',
                                    label: __( 'Medium', 'dokan-lite' ),
                                },
                                {
                                    value: 'large',
                                    label: __( 'Large', 'dokan-lite' ),
                                },
                            ] }
                            onChange={ ( iconSize ) =>
                                setAttributes( { iconSize } )
                            }
                            __next40pxDefaultSize
                            __nextHasNoMarginBottom
                        />
                    ) }
                </PanelBody>
            </InspectorControls>

            { attributes.showIcons && (
                <ColorPanel
                    title={ __( 'Icons', 'dokan-lite' ) }
                    settings={ [
                        {
                            label: __( 'Icon color', 'dokan-lite' ),
                            value: attributes.iconColor,
                            onChange: ( iconColor ) =>
                                setAttributes( { iconColor } ),
                        },
                    ] }
                />
            ) }
        </SSREdit>
    ),
    save: () => null,
} );

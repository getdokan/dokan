import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls, useSettings } from '@wordpress/block-editor';
import {
    FontSizePicker,
    PanelBody,
    RangeControl,
    SelectControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';

import SSREdit from '../shared/ssr-edit';
import IconControl from '../shared/icon-control';
import ColorPanel from '../shared/color-panel';
import TextList from '../shared/text-list';
import metadata from './block.json';
import './style.scss';

type SizeSetting = { key: 'storeNameSize' | 'storeDetailsSize'; label: string };

const CARD_TEXT_SIZES: SizeSetting[] = [
    { key: 'storeNameSize', label: __( 'Store name', 'dokan-lite' ) },
    { key: 'storeDetailsSize', label: __( 'Store details', 'dokan-lite' ) },
];

/**
 * Font size pickers for the card text, offering the theme's size presets.
 *
 * @param root0
 * @param root0.attributes
 * @param root0.setAttributes
 */
const CardTextSizes = ( {
    attributes,
    setAttributes,
}: {
    attributes: Record< string, any >;
    setAttributes: ( attrs: Record< string, unknown > ) => void;
} ) => {
    const [ fontSizes ] = useSettings( 'typography.fontSizes' );

    return (
        <>
            { CARD_TEXT_SIZES.map( ( { key, label } ) => (
                <div key={ key } className="dokan-store-list-size-control">
                    <p>{ label }</p>
                    <FontSizePicker
                        fontSizes={ fontSizes ?? [] }
                        value={ attributes[ key ] || undefined }
                        onChange={ ( next?: string | number ) =>
                            setAttributes( {
                                // A bare number from the slider is pixels.
                                [ key ]:
                                    typeof next === 'number'
                                        ? `${ next }px`
                                        : next ?? '',
                            } )
                        }
                        withReset
                        __next40pxDefaultSize
                    />
                </div>
            ) ) }
        </>
    );
};

// Sorting is filterable and Pro modules add to it, so the list comes from the server.
const sortOptions = (): Record< string, string > =>
    ( window as any )?.dokanBlocksData?.sortOptions ?? {};

// Admin settings win: an element switched off site-wide is not offered here at all.
const adminAllows = ( key: string ): boolean =>
    ( window as any )?.dokanBlocksData?.settings?.[ key ] !== false;

const cardElements = () =>
    [
        {
            key: 'showAvatar',
            label: __( 'Store avatar', 'dokan-lite' ),
            help: __( 'The round store icon on each card.', 'dokan-lite' ),
        },
        {
            key: 'showFeatured',
            label: __( 'Featured tag', 'dokan-lite' ),
        },
        {
            key: 'showOpenClose',
            label: __( 'Open/closed status', 'dokan-lite' ),
            enabled: adminAllows( 'openClose' ),
        },
        {
            key: 'showRating',
            label: __( 'Rating', 'dokan-lite' ),
        },
        {
            key: 'showAddress',
            label: __( 'Store address', 'dokan-lite' ),
            enabled: adminAllows( 'address' ),
        },
        {
            key: 'showPhone',
            label: __( 'Phone number', 'dokan-lite' ),
            enabled: adminAllows( 'phone' ),
        },
    ].filter( ( element ) => element.enabled !== false );

// Every text is optional; the placeholder is the wording shipped today.
const TEXTS = [
    {
        key: 'featuredText',
        label: __( 'Featured badge', 'dokan-lite' ),
        placeholder: __( 'Featured', 'dokan-lite' ),
    },
    {
        key: 'openText',
        label: __( 'Open badge', 'dokan-lite' ),
        placeholder: __( 'Open', 'dokan-lite' ),
    },
    {
        key: 'closedText',
        label: __( 'Closed badge', 'dokan-lite' ),
        placeholder: __( 'Closed', 'dokan-lite' ),
    },
    {
        key: 'visitStoreText',
        label: __( 'Visit store link', 'dokan-lite' ),
        placeholder: __( 'Visit Store', 'dokan-lite' ),
    },
    {
        key: 'noVendorText',
        label: __( 'No vendors message', 'dokan-lite' ),
        placeholder: __( 'No vendor found!', 'dokan-lite' ),
    },
    {
        key: 'prevText',
        label: __( 'Previous page link', 'dokan-lite' ),
        placeholder: __( '← Previous', 'dokan-lite' ),
    },
    {
        key: 'nextText',
        label: __( 'Next page link', 'dokan-lite' ),
        placeholder: __( 'Next →', 'dokan-lite' ),
    },
];

const PHONE_ICONS = [
    { value: 'fas fa-phone', label: __( 'Phone', 'dokan-lite' ) },
    { value: 'fas fa-mobile-alt', label: __( 'Mobile', 'dokan-lite' ) },
    { value: 'fab fa-whatsapp', label: __( 'WhatsApp', 'dokan-lite' ) },
];

const ADDRESS_ICONS = [
    { value: 'fas fa-map-marker-alt', label: __( 'Map marker', 'dokan-lite' ) },
    { value: 'fas fa-map', label: __( 'Map', 'dokan-lite' ) },
    { value: 'fas fa-home', label: __( 'Home', 'dokan-lite' ) },
];

const ALIGNMENTS = [
    { value: '', label: __( 'Default', 'dokan-lite' ) },
    { value: 'left', label: __( 'Left', 'dokan-lite' ) },
    { value: 'center', label: __( 'Center', 'dokan-lite' ) },
    { value: 'right', label: __( 'Right', 'dokan-lite' ) },
];

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => (
        <SSREdit
            name={ metadata.name }
            attributes={ attributes }
            setAttributes={ setAttributes }
        >
            <InspectorControls>
                <PanelBody title={ __( 'Store List Settings', 'dokan-lite' ) }>
                    <RangeControl
                        label={ __( 'Stores per page', 'dokan-lite' ) }
                        value={ attributes.perPage }
                        onChange={ ( perPage ) => setAttributes( { perPage } ) }
                        min={ 1 }
                        max={ 50 }
                    />
                    <RangeControl
                        label={ __( 'Columns', 'dokan-lite' ) }
                        value={ attributes.columns }
                        onChange={ ( columns ) => setAttributes( { columns } ) }
                        min={ 1 }
                        max={ 6 }
                    />
                    <ToggleControl
                        label={ __( 'Featured vendors only', 'dokan-lite' ) }
                        checked={ attributes.featured }
                        onChange={ ( featured ) =>
                            setAttributes( { featured } )
                        }
                    />
                    <ToggleControl
                        label={ __(
                            'Vendors with products only',
                            'dokan-lite'
                        ) }
                        checked={ attributes.withProductsOnly }
                        onChange={ ( withProductsOnly ) =>
                            setAttributes( { withProductsOnly } )
                        }
                    />
                    { adminAllows( 'storeCategory' ) && (
                        <TextControl
                            label={ __( 'Store categories', 'dokan-lite' ) }
                            help={ __(
                                'Comma separated store category slugs. Requires the store category feature.',
                                'dokan-lite'
                            ) }
                            value={ attributes.category }
                            onChange={ ( category ) =>
                                setAttributes( { category } )
                            }
                        />
                    ) }
                    <TextControl
                        label={ __( 'Fallback store name', 'dokan-lite' ) }
                        help={ __(
                            'Shown when a vendor has not named their store. Leave empty to show nothing.',
                            'dokan-lite'
                        ) }
                        value={ attributes.defaultStoreName }
                        onChange={ ( defaultStoreName ) =>
                            setAttributes( { defaultStoreName } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={ __( 'Order by', 'dokan-lite' ) }
                        value={ attributes.orderby }
                        options={ [
                            {
                                value: '',
                                label: __( 'Site default', 'dokan-lite' ),
                            },
                            ...Object.entries( sortOptions() ).map(
                                ( [ value, label ] ) => ( { value, label } )
                            ),
                        ] }
                        onChange={ ( orderby ) => setAttributes( { orderby } ) }
                    />
                </PanelBody>

                <PanelBody
                    title={ __( 'Card Elements', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    { cardElements().map( ( { key, label, help } ) => (
                        <ToggleControl
                            key={ key }
                            label={ label }
                            help={ help }
                            checked={ attributes[ key ] }
                            onChange={ ( value ) =>
                                setAttributes( { [ key ]: value } )
                            }
                        />
                    ) ) }
                </PanelBody>

                <PanelBody
                    title={ __( 'Card Layout', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    <SelectControl
                        label={ __( 'Store picture shape', 'dokan-lite' ) }
                        value={ attributes.avatarShape ?? 'circle' }
                        options={ [
                            {
                                value: 'circle',
                                label: __( 'Circle', 'dokan-lite' ),
                            },
                            {
                                value: 'rounded',
                                label: __( 'Rounded', 'dokan-lite' ),
                            },
                            {
                                value: 'square',
                                label: __( 'Square', 'dokan-lite' ),
                            },
                        ] }
                        onChange={ ( avatarShape ) =>
                            setAttributes( { avatarShape } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={ __( 'Store picture position', 'dokan-lite' ) }
                        help={ __(
                            'Grid view. The address and phone keep clear of the picture.',
                            'dokan-lite'
                        ) }
                        value={ attributes.avatarPosition ?? '' }
                        options={ [
                            {
                                value: '',
                                label: __( 'Default', 'dokan-lite' ),
                            },
                            {
                                value: 'left',
                                label: __( 'Left', 'dokan-lite' ),
                            },
                            {
                                value: 'center',
                                label: __( 'Center', 'dokan-lite' ),
                            },
                            {
                                value: 'right',
                                label: __( 'Right', 'dokan-lite' ),
                            },
                        ] }
                        onChange={ ( avatarPosition ) =>
                            setAttributes( { avatarPosition } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    <SelectControl
                        label={ __( 'Card text alignment', 'dokan-lite' ) }
                        value={ attributes.cardAlign ?? '' }
                        options={ ALIGNMENTS }
                        onChange={ ( cardAlign ) =>
                            setAttributes( { cardAlign } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                    { attributes.showPhone && (
                        <IconControl
                            label={ __( 'Phone icon', 'dokan-lite' ) }
                            value={ attributes.phoneIcon ?? '' }
                            suggestions={ PHONE_ICONS }
                            onChange={ ( phoneIcon ) =>
                                setAttributes( { phoneIcon } )
                            }
                        />
                    ) }
                    { attributes.showAddress && (
                        <>
                            <IconControl
                                label={ __( 'Address icon', 'dokan-lite' ) }
                                value={ attributes.addressIcon ?? '' }
                                suggestions={ ADDRESS_ICONS }
                                defaultLabel={ __(
                                    'No icon (default)',
                                    'dokan-lite'
                                ) }
                                allowNone={ false }
                                onChange={ ( addressIcon ) =>
                                    setAttributes( { addressIcon } )
                                }
                            />
                            <TextControl
                                label={ __( 'Address label', 'dokan-lite' ) }
                                help={ __(
                                    'Shown before the address. Leave empty for none.',
                                    'dokan-lite'
                                ) }
                                value={ attributes.addressLabel ?? '' }
                                onChange={ ( addressLabel ) =>
                                    setAttributes( { addressLabel } )
                                }
                                __next40pxDefaultSize
                                __nextHasNoMarginBottom
                            />
                        </>
                    ) }
                </PanelBody>

                <PanelBody
                    title={ __( 'Text', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    <TextList
                        fields={ TEXTS }
                        attributes={ attributes }
                        setAttributes={ setAttributes }
                    />
                </PanelBody>
            </InspectorControls>

            <InspectorControls>
                <PanelBody
                    title={ __( 'Card Text Size', 'dokan-lite' ) }
                    initialOpen={ false }
                >
                    <CardTextSizes
                        attributes={ attributes }
                        setAttributes={ setAttributes }
                    />
                </PanelBody>
            </InspectorControls>

            <ColorPanel
                title={ __( 'Card', 'dokan-lite' ) }
                settings={ [
                    {
                        label: __( 'Card background', 'dokan-lite' ),
                        value: attributes.cardBackgroundColor,
                        onChange: ( cardBackgroundColor ) =>
                            setAttributes( { cardBackgroundColor } ),
                    },
                    {
                        label: __( 'Store name', 'dokan-lite' ),
                        value: attributes.storeNameColor,
                        onChange: ( storeNameColor ) =>
                            setAttributes( { storeNameColor } ),
                    },
                    {
                        label: __( 'Store details', 'dokan-lite' ),
                        value: attributes.storeDetailsColor,
                        onChange: ( storeDetailsColor ) =>
                            setAttributes( { storeDetailsColor } ),
                    },
                ] }
            />
        </SSREdit>
    ),
    save: () => null,
} );

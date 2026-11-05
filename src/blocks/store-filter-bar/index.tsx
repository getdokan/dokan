import { registerBlockType } from '@wordpress/blocks';
import { Fragment } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl, ToggleControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import ColorPanel from '../shared/color-panel';
import TextList from '../shared/text-list';
import metadata from './block.json';
import './style.scss';

type FilterField = { key: string; label: string; placeholder?: string };

// Sorting is filterable and Pro modules add to it, so the list comes from the server.
const sortOptions = (): Record< string, string > =>
    ( window as any )?.dokanBlocksData?.sortOptions ?? {};

// Filter fields extensions draw into the panel, so their labels can be edited here too.
const extensionFields = (): FilterField[] =>
    ( window as any )?.dokanBlocksData?.filterFields ?? [];

// Each section is a toggle, optionally followed by the label that section renders.
const sections = [
    {
        toggle: 'showStoreCount',
        label: __( 'Show store count', 'dokan-lite' ),
        text: 'storeCountText',
        textLabel: __( 'Store count text', 'dokan-lite' ),
        // translators: %s is typed by the editor and marks where the store count appears.
        help: __(
            'Use %s where the number should appear. Leave empty for the default wording. The number follows the first Store List block on the page.',
            'dokan-lite'
        ),
        // translators: %s is the number of stores.
        placeholder: __( 'Total stores showing: %s', 'dokan-lite' ),
    },
    {
        toggle: 'showSearch',
        label: __( 'Show filter panel', 'dokan-lite' ),
        toggleHelp: __(
            'The Filter button and the panel it opens — vendor search, plus any filters extensions add such as category, rating or location.',
            'dokan-lite'
        ),
        text: 'filterButtonText',
        textLabel: __( 'Filter button label', 'dokan-lite' ),
        placeholder: __( 'Filter', 'dokan-lite' ),
    },
    {
        toggle: 'showSort',
        label: __( 'Show sorting', 'dokan-lite' ),
        text: 'sortLabel',
        textLabel: __( 'Sorting label', 'dokan-lite' ),
        placeholder: __( 'Sort by:', 'dokan-lite' ),
    },
    {
        toggle: 'showViewToggle',
        label: __( 'Show grid/list view toggle', 'dokan-lite' ),
    },
];

const PANEL_TEXTS = [
    {
        key: 'searchPlaceholder',
        label: __( 'Search placeholder', 'dokan-lite' ),
        placeholder: __( 'Search Vendors', 'dokan-lite' ),
    },
    {
        key: 'applyText',
        label: __( 'Apply button', 'dokan-lite' ),
        placeholder: __( 'Apply', 'dokan-lite' ),
    },
    {
        key: 'cancelText',
        label: __( 'Cancel button', 'dokan-lite' ),
        placeholder: __( 'Cancel', 'dokan-lite' ),
    },
];

registerBlockType( metadata.name, {
    edit: ( { attributes, setAttributes } ) => {
        const hidden: string[] = attributes.hiddenSortOptions ?? [];
        const labels: Record< string, string > = attributes.filterLabels ?? {};

        const toggleSortOption = ( key: string, visible: boolean ) =>
            setAttributes( {
                hiddenSortOptions: visible
                    ? hidden.filter( ( item ) => item !== key )
                    : [ ...hidden, key ],
            } );

        const setLabel = ( key: string, value: string ) => {
            const next = { ...labels };

            // An empty label falls back to the extension's wording, so it is not stored.
            if ( value ) {
                next[ key ] = value;
            } else {
                delete next[ key ];
            }

            setAttributes( { filterLabels: next } );
        };

        // view.js drives the preview's controls and blocks navigation, so it stays clickable.
        return (
            <SSREdit
                name={ metadata.name }
                attributes={ attributes }
                setAttributes={ setAttributes }
                interactive
            >
                <InspectorControls>
                    <PanelBody
                        title={ __( 'Filter Bar Settings', 'dokan-lite' ) }
                    >
                        { sections.map( ( section ) => (
                            <Fragment key={ section.toggle }>
                                <ToggleControl
                                    label={ section.label }
                                    help={ section.toggleHelp }
                                    checked={ attributes[ section.toggle ] }
                                    onChange={ ( value ) =>
                                        setAttributes( {
                                            [ section.toggle ]: value,
                                        } )
                                    }
                                />
                                { section.text &&
                                    attributes[ section.toggle ] && (
                                        <TextControl
                                            label={ section.textLabel }
                                            help={ section.help }
                                            value={ attributes[ section.text ] }
                                            onChange={ ( value ) =>
                                                setAttributes( {
                                                    [ section.text ]: value,
                                                } )
                                            }
                                            placeholder={ section.placeholder }
                                            __next40pxDefaultSize
                                            __nextHasNoMarginBottom
                                        />
                                    ) }
                            </Fragment>
                        ) ) }
                    </PanelBody>

                    { attributes.showSearch && (
                        <PanelBody
                            title={ __( 'Filter Panel Text', 'dokan-lite' ) }
                            initialOpen={ false }
                        >
                            <TextList
                                fields={ PANEL_TEXTS }
                                attributes={ attributes }
                                setAttributes={ setAttributes }
                            />
                            { extensionFields().map( ( field ) => (
                                <TextControl
                                    key={ field.key }
                                    label={ field.label }
                                    placeholder={ field.placeholder }
                                    value={ labels[ field.key ] ?? '' }
                                    onChange={ ( value ) =>
                                        setLabel( field.key, value )
                                    }
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                            ) ) }
                        </PanelBody>
                    ) }

                    { attributes.showSort && (
                        <PanelBody
                            title={ __( 'Sorting Options', 'dokan-lite' ) }
                            initialOpen={ false }
                        >
                            { Object.entries( sortOptions() ).map(
                                ( [ key, label ] ) => (
                                    <ToggleControl
                                        key={ key }
                                        label={ label }
                                        checked={ ! hidden.includes( key ) }
                                        onChange={ ( visible ) =>
                                            toggleSortOption( key, visible )
                                        }
                                    />
                                )
                            ) }
                        </PanelBody>
                    ) }
                </InspectorControls>

                <ColorPanel
                    title={ __( 'Buttons', 'dokan-lite' ) }
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
        );
    },
    save: () => null,
} );

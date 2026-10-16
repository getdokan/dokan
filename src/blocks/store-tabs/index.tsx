import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, TextControl } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import IconControl from '../shared/icon-control';
import ColorPanel from '../shared/color-panel';
import type { StoreBlockEditProps } from '../shared/types';
import metadata from './block.json';
import './style.scss';

type StoreTabsAttributes = {
    tabLabels: Record< string, string >;
    tabIcons: Record< string, string >;
    activeColor: string;
};

type TabOption = { value: string; label: string };

/*
 * The tab list is server-side — extensions add theirs through `dokan_store_tabs`
 * — so Blocks\Assets hands the editor the list, Pro's tabs included.
 */
const storeTabs = (): TabOption[] =>
    (
        window as unknown as {
            dokanStoreTabPreview?: { tabs?: TabOption[] };
        }
     ).dokanStoreTabPreview?.tabs ?? [];

const TAB_ICONS = [
    { value: 'fas fa-box-open', label: __( 'Box', 'dokan-lite' ) },
    { value: 'fas fa-store', label: __( 'Store', 'dokan-lite' ) },
    { value: 'fas fa-star', label: __( 'Star', 'dokan-lite' ) },
    { value: 'fas fa-file-alt', label: __( 'Document', 'dokan-lite' ) },
    { value: 'fas fa-user', label: __( 'Person', 'dokan-lite' ) },
    { value: 'far fa-comments', label: __( 'Comments', 'dokan-lite' ) },
];

registerBlockType( metadata.name, {
    edit: ( {
        attributes,
        setAttributes,
    }: StoreBlockEditProps< StoreTabsAttributes > ) => {
        const labels = attributes.tabLabels ?? {};
        const icons = attributes.tabIcons ?? {};

        // Empty values are not stored, so a cleared field falls back to the tab's own title.
        const setEntry = (
            attribute: 'tabLabels' | 'tabIcons',
            key: string,
            value: string
        ) => {
            const next = { ...( attributes[ attribute ] ?? {} ) };

            if ( value ) {
                next[ key ] = value;
            } else {
                delete next[ key ];
            }

            setAttributes( { [ attribute ]: next } );
        };

        return (
            <SSREdit
                name={ metadata.name }
                attributes={ attributes }
                setAttributes={ setAttributes }
            >
                <InspectorControls>
                    <PanelBody title={ __( 'Tabs', 'dokan-lite' ) }>
                        <p>
                            { __(
                                'Rename a tab or give it an icon. The store template is shared, so a change here applies to every store page.',
                                'dokan-lite'
                            ) }
                        </p>
                        { storeTabs().map( ( tab ) => (
                            <div
                                key={ tab.value }
                                className="dokan-store-tabs-tab-settings"
                            >
                                <TextControl
                                    label={ tab.label }
                                    placeholder={ tab.label }
                                    value={ labels[ tab.value ] ?? '' }
                                    onChange={ ( value ) =>
                                        setEntry(
                                            'tabLabels',
                                            tab.value,
                                            value
                                        )
                                    }
                                    __next40pxDefaultSize
                                    __nextHasNoMarginBottom
                                />
                                <IconControl
                                    label={ __( 'Icon', 'dokan-lite' ) }
                                    value={ icons[ tab.value ] ?? '' }
                                    suggestions={ TAB_ICONS }
                                    defaultLabel={ __(
                                        'No icon (default)',
                                        'dokan-lite'
                                    ) }
                                    allowNone={ false }
                                    onChange={ ( value ) =>
                                        setEntry( 'tabIcons', tab.value, value )
                                    }
                                />
                            </div>
                        ) ) }
                    </PanelBody>
                </InspectorControls>

                <ColorPanel
                    title={ __( 'Tabs', 'dokan-lite' ) }
                    settings={ [
                        {
                            label: __( 'Active tab', 'dokan-lite' ),
                            value: attributes.activeColor,
                            onChange: ( activeColor ) =>
                                setAttributes( { activeColor } ),
                        },
                    ] }
                />
            </SSREdit>
        );
    },
    save: () => null,
} );

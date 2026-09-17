import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    SelectControl,
    ToggleControl,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import metadata from './block.json';
import './style.scss';

type TabOption = { value: string; label: string };

/*
 * The store tabs are server-side — extensions add theirs through
 * `dokan_store_tabs` — so Blocks\Manager hands the editor the list.
 */
const previewTabs = (): TabOption[] => {
    const tabs = (
        window as unknown as {
            dokanStoreTabPreview?: { tabs?: TabOption[] };
        }
     ).dokanStoreTabPreview?.tabs;

    return tabs?.length
        ? tabs
        : [ { value: 'products', label: __( 'Products', 'dokan-lite' ) } ];
};

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

                    <SelectControl
                        label={ __( 'Preview tab', 'dokan-lite' ) }
                        help={ __(
                            'Which tab the editor previews, with sample data. On the store page this block shows the tab the visitor opens.',
                            'dokan-lite'
                        ) }
                        value={ attributes.previewTab ?? 'products' }
                        options={ previewTabs() }
                        onChange={ ( previewTab ) =>
                            setAttributes( { previewTab } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />
                </PanelBody>
            </InspectorControls>
        </SSREdit>
    ),
    save: () => null,
} );

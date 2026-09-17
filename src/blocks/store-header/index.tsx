import { registerBlockType } from '@wordpress/blocks';
import { InspectorControls } from '@wordpress/block-editor';
import { PanelBody, SelectControl, Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import SSREdit from '../shared/ssr-edit';
import type { StoreBlockEditProps } from '../shared/types';
import metadata from './block.json';
import './style.scss';

type StoreHeaderAttributes = {
    headerLayout: string;
};

/*
 * Switching layouts is a dropdown here rather than deleting the header and
 * inserting a different pattern, which is the whole reason this block exists.
 * The patterns remain for merchants who want to compose a header themselves.
 */
const LAYOUTS = [
    {
        value: '',
        label: __( 'Use the marketplace default', 'dokan-lite' ),
    },
    { value: 'panel', label: __( 'Panel — beside the banner', 'dokan-lite' ) },
    {
        value: 'default',
        label: __( 'Banner above, details below', 'dokan-lite' ),
    },
    { value: 'stacked', label: __( 'Stacked and centred', 'dokan-lite' ) },
    { value: 'split', label: __( 'Split — no banner', 'dokan-lite' ) },
    { value: 'minimal', label: __( 'Compact — no banner', 'dokan-lite' ) },
];

registerBlockType( metadata.name, {
    edit: ( {
        attributes,
        setAttributes,
    }: StoreBlockEditProps< StoreHeaderAttributes > ) => (
        <SSREdit
            name={ metadata.name }
            attributes={ attributes }
            setAttributes={ setAttributes }
        >
            <InspectorControls>
                <PanelBody title={ __( 'Header Layout', 'dokan-lite' ) }>
                    <SelectControl
                        label={ __( 'Layout', 'dokan-lite' ) }
                        value={ attributes.headerLayout ?? '' }
                        options={ LAYOUTS }
                        onChange={ ( headerLayout ) =>
                            setAttributes( { headerLayout } )
                        }
                        __next40pxDefaultSize
                        __nextHasNoMarginBottom
                    />

                    { ! attributes.headerLayout && (
                        <Notice status="info" isDismissible={ false }>
                            { __(
                                'Following the layout chosen in Dokan settings. Pick one here to override it for this template only.',
                                'dokan-lite'
                            ) }
                        </Notice>
                    ) }
                </PanelBody>
            </InspectorControls>
        </SSREdit>
    ),
    save: () => null,
} );

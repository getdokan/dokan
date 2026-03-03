import { useWindowDimensions } from '@src/hooks';
import { useCallback, useMemo } from '@wordpress/element';
import { FlatFormItem } from '../types';
import {
    appendToLeftColumn,
    collectUsedFields,
    getFieldHeading as getFieldHeadingUtils,
    getRemainingFields,
    injectRemainingFields,
    layoutBuilder,
} from '../utils';
import { __ } from '@wordpress/i18n';

/**
 * Custom hook to manage form layouts.
 * Uses flat form items only; layout and field config are derived from formItems.
 *
 * @param {Array}  formItems Flat array of sections and fields from the server.
 * @param {Object} product  The current product data for dependency checking.
 *
 * @return {Object} Object containing the processed form layouts.
 */
export default function useLayouts(
    formItems: FlatFormItem[],
    product: Record< string, any >
) {
    const { width } = useWindowDimensions();

    /**
     * helper to get label and description for a field.
     *
     * @param {string} fieldId The ID of the field.
     *
     * @return {Object} Object containing label and description.
     */
    const getFieldHeading = useCallback(
        ( fieldId: string ) => {
        return getFieldHeadingUtils( formItems, fieldId );
    }, [ formItems ] );

    // Define root layout based on window width
    const rootLayout = useMemo( () => {
        if ( width && width > 768 ) {
            return {
                type: 'row',
                alignment: 'start',
                styles: {
                    left_column: { flex: '1' },
                    right_column: { flex: '0 0 20%', minWidth: '250px' },
                },
            };
        }
        return {
            type: 'regular',
        };
    }, [ width ] );

    // Build the static layout structure (sections, cards, field placement).
    // This only depends on formItems and rootLayout — NOT on product data.
    const layoutStructure = useMemo( () => {
        const layouts = [
            {
                id: 'main_layout',
                layout: rootLayout,
                children: [
                    {
                        id: 'left_column',
                        children: [
                            {
                                id: 'general',
                                layout: {
                                    type: 'card',
                                },
                                children: [
                                    'name',
                                    'slug',
                                    'type',
                                    {
                                        id: 'digital-options',
                                        layout: {
                                            type: 'regular',
                                        },
                                        label: __( 'Digital Product Options', 'dokan-lite' ),
                                        children: [ 'downloadable', 'virtual' ],
                                    },
                                    'external_url',
                                    'button_text',
                                    'category_ids',
                                    'product_tag',
                                    'product_brand',
                                    'regular_price',
                                    'sale_price',
                                    'create_schedule_for_discount',
                                    {
                                        id: 'product-discount-schedule',
                                        layout: {
                                            type: 'row',
                                        },
                                        children: [
                                            'date_on_sale_from',
                                            'date_on_sale_to',
                                        ],
                                    },
                                ],
                            },
                            {
                                id: 'description_section',
                                layout: {
                                    type: 'card',
                                },
                                children: [
                                    'short_description',
                                    'description',
                                ],
                            },
                            {
                                id: 'inventory',
                                layout: {
                                    type: 'card',
                                    withHeader: true,
                                },
                                children: [
                                    'sku',
                                    'global_unique_id',
                                    'manage_stock',
                                    'stock_status',
                                    'stock_quantity',
                                    'low_stock_amount',
                                    'backorders',
                                    'sold_individually',
                                ],
                                ...getFieldHeading( 'inventory' ),
                            },
                            {
                                id: 'shipping',
                                layout: {
                                    type: 'card',
                                    withHeader: true,
                                },
                                children: [
                                    '_disable_shipping',
                                    {
                                        id: 'shipping-dimension',
                                        layout: {
                                            type: 'row',
                                        },
                                        children: [
                                            'weight',
                                            'length',
                                            'width',
                                            'height',
                                        ],
                                    },
                                    'shipping_class',
                                    'tax_status',
                                    'tax_class',
                                    '_overwrite_shipping',
                                    {
                                        id: 'overwrite_shipping_price_qty',
                                        layout: {
                                            type: 'row',
                                        },
                                        children: [
                                            '_additional_price',
                                            '_additional_qty',
                                        ],
                                    },
                                    '_dps_processing_time',
                                ],
                                ...getFieldHeading( 'shipping' ),
                            },
                        ],
                    },
                    {
                        id: 'right_column',
                        children: [
                            {
                                id: 'organize-product',
                                layout: {
                                    type: 'card',
                                    isCollapsible: false,
                                },
                                children: [
                                    'status',
                                    'catalog_visibility',
                                    'image_id',
                                    'gallery_image_ids',
                                    'reviews_allowed',
                                ],
                            },
                            {
                                id: 'purchase_note_section',
                                layout: {
                                    type: 'card',
                                    withHeader: true,
                                    isCollapsible: false,
                                },
                                children: [ 'purchase_note' ],
                                ...getFieldHeading( 'purchase_note' ),
                            },
                        ],
                    },
                ],
            },
        ];

        const usedFields = collectUsedFields( layouts );
        const remainingFieldsBySection = getRemainingFields(
            formItems,
            usedFields
        );
        let updatedLayouts = injectRemainingFields(
            layouts,
            remainingFieldsBySection
        );

        const newSections = Object.keys( remainingFieldsBySection ).map(
            ( sectionId ) => ( {
                id: sectionId,
                layout: {
                    type: 'card',
                    withHeader: true,
                },
                children: remainingFieldsBySection[ sectionId ],
                ...getFieldHeading( sectionId ),
            } )
        );

        if ( newSections.length > 0 ) {
            updatedLayouts = appendToLeftColumn( updatedLayouts, newSections );
        }

        return updatedLayouts;
    }, [ rootLayout, getFieldHeading, formItems ] );

    // Apply product-dependent visibility and dependency filtering.
    // This runs on product changes but reuses the cached layout structure.
    const formLayouts = useMemo( () => {
        return {
            fields: layoutBuilder(
                layoutStructure,
                formItems,
                product,
            ),
        };
    }, [ layoutStructure, formItems, product ] );

    return { formLayouts, width };
}

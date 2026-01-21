import { useWindowDimensions } from '@src/hooks';
import { useCallback, useMemo } from '@wordpress/element';
import { FormField, Section } from '../types';
import {
    appendToLeftColumn,
    collectUsedFields,
    getField,
    getRemainingFields,
    injectRemainingFields,
    layoutBuilder,
} from '../utils';

/**
 * Custom hook to manage form layouts.
 * Processes sections and fields to generate the structure for the form.
 *
 * @param {Array}  sections The available sections in the form.
 * @param {Array}  fields   All available form fields.
 * @param {Object} product  The current product data for dependency checking.
 *
 * @return {Object} Object containing the processed form layouts.
 */
export default function useLayouts(
    sections: Section[],
    fields: FormField[],
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
            const field = getField( sections, fieldId );
            if ( ! field ) {
                return {};
            }
            return {
                label: field.title,
                description: field.description,
            };
        },
        [ sections ]
    );

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

    const formLayouts = useMemo( () => {
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
                                    'product_type',
                                    {
                                        id: 'digital-options',
                                        layout: {
                                            type: 'regular',
                                        },
                                        label: 'Digital Product Options',
                                        children: [ 'downloadable', 'virtual' ],
                                    },
                                    'product_url',
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
                                id: 'description',
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
                                    'shipping_class_id',
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
                            {
                                id: 'linked',
                                layout: {
                                    type: 'card',
                                    withHeader: true,
                                },
                                children: [
                                    'upsell_ids',
                                    'crosssell_ids',
                                    'children',
                                ],
                                ...getFieldHeading( 'linked' ),
                            },
                            {
                                id: 'downloadable-options',
                                layout: {
                                    type: 'card',
                                    withHeader: true,
                                },
                                children: [
                                    'downloads',
                                    'download_limit',
                                    'download_expiry',
                                ],
                                ...getFieldHeading( 'downloadable' ),
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
                                id: 'purchase_note',
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

        // Collect all used field IDs from the layout
        const usedFields = collectUsedFields( layouts );
        const remainingFieldsBySection = getRemainingFields(
            sections,
            usedFields
        );
        let updatedLayouts = injectRemainingFields(
            layouts,
            remainingFieldsBySection
        );

        // Create new cards for sections not found in the existing layout
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

        return {
            fields: layoutBuilder(
                updatedLayouts,
                sections,
                fields,
                product,
                product.product_type
            ),
        };
    }, [ rootLayout, getFieldHeading, sections, fields, product ] );

    return { formLayouts, width };
}

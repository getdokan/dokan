import { sanitizeHTML } from '@src/utilities';
import { useCallback, useMemo } from '@wordpress/element';
import { checkDependency } from '../components/FieldRenderer';
import { FormField, Section } from '../types';

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
    /**
     * Helper to find a field or section by ID.
     * Searches through sections and their nested fields.
     *
     * @param {string} fieldId The ID of the field to find.
     * @return {object|null} The field or section object if found, null otherwise.
     */
    const getField = useCallback(
        ( fieldId: string ) => {
            const section = sections.find( ( sec ) => sec.id === fieldId );
            if ( section ) {
                return section;
            }

            for ( const sec of sections ) {
                if ( sec.fields.length ) {
                    for ( const field of sec.fields ) {
                        if ( field.id === fieldId ) {
                            return field;
                        }
                    }
                }
            }
            return null;
        },
        [ sections ]
    );

    /**
     * helper to get label and description for a field.
     *
     * @param {string} fieldId The ID of the field.
     * @return {Object} Object containing label and description.
     */
    const getFieldHeading = useCallback(
        ( fieldId: string ) => {
            const field = getField( fieldId );
            if ( ! field ) {
                return {};
            }
            return {
                label: field.title,
                description: field.description,
            };
        },
        [ getField ]
    );

    /**
     * Recursive function to process layout fields.
     * Handles string references, card creation, and child processing.
     * Also filters out empty cards (cards with no visible children).
     *
     * @param {Array} layoutFields The fields to process for the layout.
     * @return {Array} valid processed fields.
     */
    const processLayout = useCallback(
        ( layoutFields: any[] ) => {
            const processedFields = layoutFields.map( ( field ) => {
                if ( typeof field === 'string' ) {
                    const fieldData = fields.find( ( f ) => f.id === field );
                    if ( ! fieldData ) {
                        return null;
                    }
                    const condition = fieldData.dependency_condition;
                    if ( ! checkDependency( condition, product ) ) {
                        return null;
                    }
                    return field;
                }
                const newField = { ...field };

                if (
                    newField.layout?.type === 'card' &&
                    newField.description
                ) {
                    newField.label = (
                        <div className="dokan-form-card-header-content">
                            <div className="dokan-form-card-title">
                                { newField.label }
                            </div>
                            <div
                                className="dokan-form-card-description"
                                dangerouslySetInnerHTML={ {
                                    __html: sanitizeHTML(
                                        newField.description
                                    ),
                                } }
                            />
                        </div>
                    );
                    delete newField.description;
                }

                if ( newField.children ) {
                    newField.children = processLayout( newField.children );
                }

                if ( newField.layout && ! newField.children?.length ) {
                    return null;
                }

                return newField;
            } );
            return processedFields.filter( Boolean );
        },
        [ fields, product ]
    );

    const formLayouts = useMemo( () => {
        const layouts = [
            {
                id: 'main-layout',
                layout: {
                    type: 'row',
                    alignment: 'start',
                    styles: {
                        'left-column': { flex: 5, marginRight: '10px' },
                        'right-column': { flex: 2 },
                    },
                },
                children: [
                    {
                        id: 'left-column',
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
                                    'regular_price',
                                    'sale_price',
                                    '_create_schedule_for_discount',
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
                                    {
                                        id: 'product-image',
                                        layout: {
                                            type: 'row',
                                            alignment: 'start',
                                            styles: {
                                                image_id: {
                                                    flex: '0 0 232px',
                                                    width: '232px',
                                                    height: '232px',
                                                },
                                                gallery_image_ids: {
                                                    flex: '1 1 0%',
                                                },
                                            },
                                        },
                                        children: [
                                            'image_id',
                                            'gallery_image_ids',
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
                                    '_global_unique_id',
                                    'stock_status',
                                    'manage_stock',
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
                                    'tax_status',
                                    'tax_class',
                                    'shipping_class_id',
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
                                    'cross_sell_ids',
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
                        id: 'right-column',
                        children: [
                            {
                                id: 'organize-product',
                                layout: {
                                    type: 'card',
                                    isCollapsible: false,
                                },
                                label: 'Organize Product',
                                children: [
                                    'status',
                                    'catalog_visibility',
                                    'tag_ids',
                                    'brand_ids',
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

        return processLayout( layouts );
    }, [ getFieldHeading, processLayout ] );

    return { formLayouts };
}

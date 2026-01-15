import { useWindowDimensions } from '@src/hooks';
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
    const { width } = useWindowDimensions();
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
    const layoutBuilder = useCallback(
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
                    newField.children = layoutBuilder( newField.children );
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
        const usedFields = new Set< string >();

        /**
         * Helper to collect all used field IDs from the layout.
         *
         * @param {Array} items Layout items.
         */
        const collectUsedFields = ( items: any[] ) => {
            items.forEach( ( item ) => {
                if ( typeof item === 'string' ) {
                    usedFields.add( item );
                    return;
                }
                if ( item.children ) {
                    collectUsedFields( item.children );
                }
            } );
        };
        collectUsedFields( layouts );

        const remainingFieldsBySection: Record< string, string[] > = {};

        // Identify fields that are not in the layout
        sections.forEach( ( section ) => {
            section.fields.forEach( ( field ) => {
                if ( usedFields.has( field.id ) ) {
                    return;
                }

                // Use field's section_id if available, otherwise fall back to the section's id
                const targetSectionId = field.section_id || section.id;

                if ( ! remainingFieldsBySection[ targetSectionId ] ) {
                    remainingFieldsBySection[ targetSectionId ] = [];
                }

                remainingFieldsBySection[ targetSectionId ].push( field.id );
            } );
        } );

        /**
         * Helper to inject remaining fields into the layout.
         *
         * @param {Array} items Layout items.
         * @return {Array} Updated layout items.
         */
        const injectRemainingFields = ( items: any[] ): any[] => {
            return items.map( ( item ) => {
                if ( typeof item === 'string' ) {
                    return item;
                }
                const newItem = { ...item };

                // Append if section ID matches
                if ( newItem.id && remainingFieldsBySection[ newItem.id ] ) {
                    newItem.children = [
                        ...( newItem.children || [] ),
                        ...remainingFieldsBySection[ newItem.id ],
                    ];
                    delete remainingFieldsBySection[ newItem.id ];
                }

                if ( newItem.children ) {
                    newItem.children = injectRemainingFields(
                        newItem.children
                    );
                }
                return newItem;
            } );
        };

        let updatedLayouts = injectRemainingFields( layouts );

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
            // Append new sections to the left column
            const appendToLeftColumn = ( items: any[] ): any[] => {
                return items.map( ( item ) => {
                    if (
                        typeof item !== 'string' &&
                        item.id === 'left_column'
                    ) {
                        return {
                            ...item,
                            children: [ ...item.children, ...newSections ],
                        };
                    }
                    if ( typeof item !== 'string' && item.children ) {
                        return {
                            ...item,
                            children: appendToLeftColumn( item.children ),
                        };
                    }
                    return item;
                } );
            };
            updatedLayouts = appendToLeftColumn( updatedLayouts );
        }

        return layoutBuilder( updatedLayouts );
    }, [ getFieldHeading, layoutBuilder, sections, rootLayout ] );

    return { formLayouts };
}

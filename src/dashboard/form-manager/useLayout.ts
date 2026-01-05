import { useMemo } from '@wordpress/element';
import { Section } from './types';

const sections = ( window as any ).dokanFormManager.sections as Section[];
export default function useLayout() {
    const getLabelAndDescription = ( sectionId: string ) => {
        const section = sections.find( ( sec ) => sec.id === sectionId );
        if ( ! section ) {
            // search each subsection
            for ( const sec of sections ) {
                if ( sec.fields.length ) {
                    for ( const field of sec.fields ) {
                        if ( field.id === sectionId ) {
                            return {
                                label: field.title,
                                description: field.description,
                            };
                        }
                    }
                }
            }
            return {};
        }
        return { label: section.title, description: section.description };
    };
    const fields = useMemo( () => {
        return [
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
                                        type: 'group',
                                        label: 'Digital Product Options',
                                        children: [ 'downloadable', 'virtual' ],
                                    },
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
                                                    marginRight: '10px',
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
                                ...getLabelAndDescription( 'inventory' ),
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
                                    '_overwrite_shipping',
                                    '_additional_price',
                                    '_additional_qty',
                                    '_dps_processing_time',
                                    'tax_status',
                                    'tax_class',
                                ],
                                ...getLabelAndDescription( 'shipping' ),
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
                                ...getLabelAndDescription( 'linked' ),
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
                                ...getLabelAndDescription( 'downloadable' ),
                            },
                            {
                                id: 'others',
                                layout: {
                                    type: 'card',
                                    withHeader: true,
                                },
                                children: [ 'product_url', 'button_text' ],
                                ...getLabelAndDescription( 'others' ),
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
                                ...getLabelAndDescription( 'purchase_note' ),
                            },
                        ],
                    },
                ],
            },
        ];
    }, [] );

    const initialData = useMemo( () => {
        const entries = sections.flatMap( ( section ) => {
            return section.fields.map( ( field ) => {
                if ( field.id === 'image_id' && field.value ) {
                    return [ field.id, field.value.id ];
                }
                if (
                    field.id === 'gallery_image_ids' &&
                    Array.isArray( field.value )
                ) {
                    return [
                        field.id,
                        field.value.map( ( img: any ) => img.id ),
                    ];
                }
                return [ field.id, field.value || '' ];
            } );
        } );
        return Object.fromEntries( entries );
    }, [] );

    return { fields, sections, initialData };
}

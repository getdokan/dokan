import { Section } from './types';

const sections = ( window as any ).dokanFormManager.sections as Section[];

const getDescription = ( sectionId: string ) => {
    const section = sections.find( ( sec ) => sec.id === sectionId );
    return section ? section.description : undefined;
};

const fields = [
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
                                    styles: {
                                        image_id: {
                                            flex: 2,
                                        },
                                        gallery_image_ids: { flex: 2 },
                                    },
                                },
                                children: [ 'image_id', 'gallery_image_ids' ],
                            },
                        ],
                    },
                    {
                        id: 'description',
                        layout: {
                            type: 'card',
                        },
                        children: [ 'short_description', 'description' ],
                    },
                    {
                        id: 'inventory',
                        layout: {
                            type: 'card',
                            withHeader: true,
                        },
                        label: 'Inventory',
                        description: getDescription( 'inventory' ),
                        children: [
                            'sku',
                            'stock_status',
                            'stock_quantity',
                            'low_stock_amount',
                            'backorders',
                            'sold_individually',
                        ],
                    },
                    {
                        id: 'shipping',
                        layout: {
                            type: 'card',
                            withHeader: true,
                        },
                        label: 'Shipping',
                        description: getDescription( 'shipping' ),
                        children: [
                            '_disable_shipping',
                            'weight',
                            'length',
                            'width',
                            'height',
                            'shipping_class_id',
                            '_overwrite_shipping',
                            '_additional_price',
                            '_additional_qty',
                            '_dps_processing_time',
                            'tax_status',
                            'tax_class',
                        ],
                    },
                    {
                        id: 'linked',
                        layout: {
                            type: 'card',
                            withHeader: true,
                        },
                        label: 'Linked Products',
                        description: getDescription( 'linked' ),
                        children: [
                            'upsell_ids',
                            'cross_sell_ids',
                            'children',
                        ],
                    },
                    {
                        id: 'downloadable-options',
                        layout: {
                            type: 'card',
                            withHeader: true,
                        },
                        label: 'Downloadable Options',
                        description: getDescription( 'downloadable-options' ),
                        children: [
                            'downloads',
                            'download_limit',
                            'download_expiry',
                        ],
                    },
                    {
                        id: 'others',
                        layout: {
                            type: 'card',
                        },
                        label: 'Others',
                        children: [ 'product_url', 'button_text' ],
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
                            'reviews_allowed',
                        ],
                    },
                    {
                        id: 'purchase-note',
                        layout: {
                            type: 'card',
                            isCollapsible: false,
                            withHeader: true,
                        },
                        label: 'Purchase Note',
                        description: getDescription( 'purchase-note' ),
                        children: [ 'purchase_note' ],
                    },
                ],
            },
        ],
    },
];

export { sections };

export default {
    fields,
};

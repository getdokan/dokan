const fields = [
    {
        id: 'main-layout',
        layout: {
            type: 'row',
            alignment: 'start',
            styles: {
                'left-column': { flex: 2, marginRight: '10px' },
                'right-column': { flex: 1 },
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
                            'date_on_sale_from',
                            'date_on_sale_to',
                            'image_id',
                            'gallery_image_ids',
                            'short_description',
                            'description',
                            'product_url',
                            'button_text',
                        ],
                    },
                    {
                        id: 'inventory',
                        layout: {
                            type: 'card',
                        },
                        label: 'Inventory',
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
                        },
                        label: 'Shipping',
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
                        },
                        label: 'Linked Products',
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
                        },
                        label: 'Downloadable Options',
                        children: [
                            'downloads',
                            'download_limit',
                            'download_expiry',
                        ],
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
                        },
                        label: 'Purchase Note',
                        description: 'Customer will get this in order email.',
                        children: [ 'purchase_note' ],
                    },
                ],
            },
        ],
    },
];

export default {
    fields,
};

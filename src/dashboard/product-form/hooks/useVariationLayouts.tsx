import { useMemo } from '@wordpress/element';
import { FlatFormItem } from '../types';
import { layoutBuilder } from '../utils';

const useVariationLayouts = (
    formItems: FlatFormItem[],
    product: Record< string, any >
) => {
    const formLayouts = useMemo( () => {
        const layouts = [
            {
                id: 'variation-image-sku',
                layout: {
                    type: 'row',
                    alignment: 'start',
                },
                children: [
                    {
                        id: 'image-and-digital-options',
                        layout: {
                            type: 'row',
                            alignment: 'start',
                            styles: {
                                image_id: {
                                    width: 'max-content',
                                },
                                'variable-downloadable-options': {
                                    flex: '1',
                                },
                            },
                        },
                        children: [
                            'image_id',
                            {
                                id: 'variable-downloadable-options',
                                children: [
                                    'enabled',
                                    'downloadable',
                                    'virtual',
                                    'manage_stock',
                                ],
                            },
                        ],
                    },
                    {
                        id: 'variation_sku',
                        layout: {
                            type: 'regular',
                        },
                        children: [ 'sku' ],
                    },
                ],
            },
            {
                id: 'variation-prices',
                layout: {
                    type: 'row',
                    alignment: 'start',
                },
                children: [ 'regular_price', 'sale_price' ],
            },
            'create_schedule_for_discount',
            {
                id: 'variation-product-discount-schedule',
                layout: {
                    type: 'row',
                },
                children: [ 'date_on_sale_from', 'date_on_sale_to' ],
            },
            {
                id: 'allow-stock_quantity-backorders',
                layout: {
                    type: 'row',
                    alignment: 'start',
                },
                children: [ 'stock_quantity', 'backorders' ],
            },
            'low_stock_amount',
            'tax_class',
            'description',
            {
                id: 'variation-downloads-fields',
                layout: {
                    type: 'card',
                    withHeader: true,
                },
                children: [
                    'downloads',
                    {
                        id: 'variation-downloads-settings',
                        layout: {
                            type: 'row',
                            alignment: 'start',
                        },
                        children: [ 'download_limit', 'download_expiry' ],
                    },
                ],
            },
        ];

        return {
            fields: layoutBuilder( layouts, formItems, product, 'variation' ),
        };
    }, [ formItems, product ] );

    return {
        formLayouts,
    };
};

export default useVariationLayouts;

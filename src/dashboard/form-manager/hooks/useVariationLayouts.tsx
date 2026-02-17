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
                    alignment: 'center',
                    styles: {
                        image_id: {
                            width: 'max-content',
                        },
                        variation_sku: {
                            flex: '1',
                        },
                    },
                },
                children: [
                    'image_id',
                    {
                        id: 'variation_sku',
                        layout: {
                            type: 'regular',
                        },
                        children: [ 'sku', 'global_unique_id' ],
                    },
                ],
            },
            {
                id: 'variable-digital-options',
                layout: {
                    type: 'row',
                    alignment: 'start',
                    styles: {
                        enabled: {
                            width: 'max-content',
                        },
                        downloadable: {
                            width: 'max-content',
                        },
                        virtual: {
                            width: 'max-content',
                        },
                        manage_stock: {
                            flex: '1',
                        },
                    },
                },
                children: [
                    'enabled',
                    'downloadable',
                    'virtual',
                    'manage_stock',
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
            'stock_quantity',
            'low_stock_amount',
            'backorders',
            'stock_status',
            '_disable_shipping',
            {
                id: 'variation-shipping-dimension',
                layout: {
                    type: 'row',
                },
                children: [ 'weight', 'length', 'width', 'height' ],
            },
            'tax_status',
            'tax_class',
            'description',
            {
                id: 'variation-downloadable-options',
                layout: {
                    type: 'card',
                    withHeader: true,
                },
                children: [
                    'downloads',
                    {
                        id: 'variation-digital-options-settings',
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
            fields: layoutBuilder(
                layouts,
                formItems,
                product,
                'variation'
            ),
        };
    }, [ formItems, product ] );

    return {
        formLayouts,
    };
};

export default useVariationLayouts;

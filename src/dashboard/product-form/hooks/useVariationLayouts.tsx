import { useMemo } from '@wordpress/element';
import { FlatFormItem } from '../types';
import {
    collectUsedFields,
    getFieldHeading,
    getRemainingFields,
    layoutBuilder,
} from '../utils';
import { useWindowDimensions } from '@dokan/hooks';

const useVariationLayouts = (
    formItems: FlatFormItem[],
    product: Record< string, any >
) => {
    const { width } = useWindowDimensions();
    const rootLayout = useMemo( () => {
        if ( width && width > 768 ) {
            return {
                type: 'row',
                alignment: 'start',
            };
        }
        return {
            type: 'regular',
        };
    }, [ width ] );
    const formLayouts = useMemo( () => {
        const layouts = [
            {
                id: 'variation-image-sku',
                layout: rootLayout,
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
            {
                id: 'variation-wholesale-section',
                ...getFieldHeading( formItems, 'wholesale_section' ),
                children: [
                    'enable_wholesale',
                    {
                        id: 'variation-wholesale-section',
                        layout: {
                            type: 'row',
                            alignment: 'start',
                        },
                        children: [ 'wholesale_price', 'wholesale_quantity' ],
                    },
                ],
            },
            {
                id: 'variation-order-min-max-section',
                ...getFieldHeading( formItems, 'min_max_section' ),
                children: [ 'min_quantity', 'max_quantity' ],
            },
        ];

        const usedFields = collectUsedFields( layouts );
        // Only show custom fields in variation layouts, not module-registered fields.
        const customFormItems = formItems.filter( ( item ) => item.is_custom );
        const remainingFieldsBySection = getRemainingFields(
            customFormItems,
            usedFields
        );

        // Flatten remaining custom fields directly into the layout (no card/header wrapping).
        const remainingFields = Object.values( remainingFieldsBySection ).flat();
        const updatedLayouts = remainingFields.length > 0
            ? [ ...layouts, ...remainingFields ]
            : layouts;

        return {
            fields: layoutBuilder( updatedLayouts, formItems, product ),
        };
    }, [ formItems, product ] );

    return {
        formLayouts,
    };
};

export default useVariationLayouts;

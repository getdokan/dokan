import { addFilter } from '@wordpress/hooks';
import { __ } from '@wordpress/i18n';
import { dokanConfig } from './dokan-config';

const addSellerFilters = ( filters ) => {
    return [
        {
            label: __( 'Seller', 'dev-blog-example' ),
            param: 'seller_id',
            showFilters: () => false,
            defaultValue: 'USD',
            filters: [
                {
                    value: dokanConfig?.seller_id,
                },
            ],
        },

        ...filters,
    ];
};

const reportsToFilterBySeller = [
    'products',
    'revenue',
    'orders',
    'categories',
    // 'coupons',
    //   "taxes",
    'variations',
    'stock',
    'dashboard',
];

for ( let i = 0; i < reportsToFilterBySeller.length; i++ ) {
    console.log(
        `dokan_analytics_${ reportsToFilterBySeller[ i ] }_report_filters`
    );
    addFilter(
        `dokan_analytics_${ reportsToFilterBySeller[ i ] }_report_filters`,
        'dokan',
        addSellerFilters
    );
}

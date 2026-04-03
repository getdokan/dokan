/**
 * WordPress Slot/Fill names for the product listing page.
 *
 * These mirror the PHP `do_action` hooks in templates/products/products-listing-row.php,
 * allowing Pro modules and third-party plugins to inject content into each column.
 *
 * Fill usage example (in a Pro module):
 *
 *   import { Fill } from '@wordpress/components';
 *   import { PRODUCT_LIST_SLOTS } from '@dokan/products';
 *
 *   <Fill name={ PRODUCT_LIST_SLOTS.AfterTypeColumn }>
 *       { ( { item } ) => item.type === 'simple' ? <SimpleProBadge /> : null }
 *   </Fill>
 *
 * @since 4.2.8
 */
export const PRODUCT_LIST_SLOTS = {
    /** Pro registers a Fill here to inject a custom product type icon. */
    TypeIcon: 'dokan_product_listing_product_type',

    /** Mirrors: do_action( 'dokan_product_list_table_after_column_content_type', $product ) */
    AfterTypeColumn: 'dokan_product_list_table_after_column_content_type',

    /** Mirrors: do_action( 'dokan_product_list_table_after_column_content_status', $product ) */
    AfterStatusColumn: 'dokan_product_list_table_after_column_content_status',

    /** Mirrors: do_action( 'dokan_product_list_table_after_status_table_data', $post, $product, ... ) */
    AfterAdvertiseColumn: 'dokan_product_list_table_after_status_table_data',

    /** Mirrors: do_action( 'dokan_product_list_table_after_column_content_name', $product ) */
    AfterNameColumn: 'dokan_product_list_table_after_column_content_name',

    /** Mirrors: do_action( 'dokan_product_list_table_after_column_content_stock', $product ) */
    AfterStockColumn: 'dokan_product_list_table_after_column_content_stock',

    /** Mirrors: do_action( 'dokan_product_list_table_after_column_content_price', $product ) */
    AfterPriceColumn: 'dokan_product_list_table_after_column_content_price',
} as const;

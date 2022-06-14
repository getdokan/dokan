<?php

namespace WeDevs\Dokan\REST;

use WP_REST_Server;
use WeDevs\Dokan\Abstracts\DokanRESTController;

/**
* Dokan Dummy Data Controller Class
*
* @since DOKAN_SINCE
*
* @package dokan
*/
class DummyDataController extends DokanRESTController {

    /**
     * Endpoint namespace
     *
     * @var string
     */
    protected $namespace = 'dokan/v1';

    /**
     * Route name
     *
     * @var string
     */
    protected $base = 'dummy-data';

    /**
     * Register the routes for orders.
     */
    public function register_routes() {
        register_rest_route(
            $this->namespace, '/' . $this->base . '/status', array(
				array(
					'methods'             => WP_REST_Server::READABLE,
					'callback'            => array( $this, 'import_dummy_data_status' ),
					'permission_callback' => array( $this, 'get_permissions_check' ),
				),
            )
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/import', array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'import_dummy_data' ),
					'permission_callback' => array( $this, 'get_permissions_check' ),
					'args'                => $this->get_collection_params(),
				),
				'schema' => array( $this, 'get_public_item_schema' ),
            )
        );

        register_rest_route(
            $this->namespace, '/' . $this->base . '/clear', array(
				array(
					'methods'             => WP_REST_Server::DELETABLE,
					'callback'            => array( $this, 'clear_dummy_data' ),
					'permission_callback' => array( $this, 'get_permissions_check' ),
				),
            )
        );
    }

    /**
     * Returns dokan import status.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function import_dummy_data_status() {
        return get_option( 'dokan_dummy_data_import_success', 'no' );
    }

        /**
     * Imports dummy vendors and products.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function import_dummy_data( $request ) {
        $_post_data = wp_unslash( wc_clean( $request ) );

        if ( ! isset( $_post_data['csv_file_data'] ) ) {
            wp_send_json_error( __( 'Csv file not found', 'dokan-lite' ) );
        }

        $csv_file_data   = $_post_data['csv_file_data'];
        $vendor_products = isset( $csv_file_data['vendor_products'] ) ? $csv_file_data['vendor_products'] : [];
        $vendor_data     = isset( $csv_file_data['vendor_data'] ) ? $csv_file_data['vendor_data'] : [];
        $vendor_index    = isset( $csv_file_data['vendor_index'] ) ? absint( $csv_file_data['vendor_index'] ) : 0;
        $total_vendors   = isset( $csv_file_data['total_vendors'] ) ? absint( $csv_file_data['total_vendors'] ) : 0;

        $created_vendor          = dokan()->dummy_data_importer->create_dummy_vendor( $vendor_data );
        $created_products_result = dokan()->dummy_data_importer->create_dummy_products_for_vendor( $created_vendor->id, $vendor_products );

        if ( $vendor_index + 1 >= $total_vendors ) {
            update_option( 'dokan_dummy_data_import_success', 'yes', true );
        }

        return array(
            'result'       => $created_products_result,
            'vendor_index' => $vendor_index + 1,
        );
    }

    /**
     * Clears dokan dummy data.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function clear_dummy_data() {
        $result = dokan()->dummy_data_importer->clear_all_dummy_data();
        delete_option( 'dokan_dummy_data_import_success' );

        return $result;
    }

    /**
     * Checking if have any permission.
     *
     * @since DOKAN_SINCE
     *
     * @return boolean
     */
    public function get_permissions_check() {
        $permission = true;

        if ( empty( $_REQUEST['nonce'] ) || ! wp_verify_nonce( sanitize_key( $_REQUEST['nonce'] ), 'dokan_admin' ) ) {
            $permission = false;
        }

        if ( ! current_user_can( 'manage_woocommerce' ) && $permission ) {
            $permission = false;
        }

        return $permission;
    }


    /**
     * Get the Order's schema, conforming to JSON Schema.
     *
     * @return array
     */
    public function get_item_schema() {
        $weight_unit    = get_option( 'woocommerce_weight_unit' );
        $dimension_unit = get_option( 'woocommerce_dimension_unit' );
        $schema = [
            '$schema'    => 'http://json-schema.org/draft-04/schema#',
            'title'      => 'Dokan dummy data',
            'type'       => 'object',
            'properties' => [
                'vendor_products' => [
                    'description' => __( 'Vendors products data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'id' => [
                                'description' => __( 'Unique identifier for the resource.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'name' => [
                                'description' => __( 'Product name.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'slug' => [
                                'description' => __( 'Product slug.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'permalink' => [
                                'description' => __( 'Product URL.', 'dokan-lite' ),
                                'type'        => 'string',
                                'format'      => 'uri',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'date_created' => [
                                'description' => __( "The date the product was created, in the site's timezone.", 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'date_created_gmt' => [
                                'description' => __( 'The date the product was created, as GMT.', 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'date_modified' => [
                                'description' => __( "The date the product was last modified, in the site's timezone.", 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'date_modified_gmt' => [
                                'description' => __( 'The date the product was last modified, as GMT.', 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'type' => [
                                'description' => __( 'Product type.', 'dokan-lite' ),
                                'type'        => 'string',
                                'default'     => 'simple',
                                'enum'        => array_keys( wc_get_product_types() ),
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'status' => [
                                'description' => __( 'Product status (post status).', 'dokan-lite' ),
                                'type'        => 'string',
                                'default'     => 'publish',
                                'enum'        => array_keys( get_post_statuses() ),
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'featured' => [
                                'description' => __( 'Featured product.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => false,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'catalog_visibility' => [
                                'description' => __( 'Catalog visibility.', 'dokan-lite' ),
                                'type'        => 'string',
                                'default'     => 'visible',
                                'enum'        => [ 'visible', 'catalog', 'search', 'hidden' ],
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'description' => [
                                'description' => __( 'Product description.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'short_description' => [
                                'description' => __( 'Product short description.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'sku' => [
                                'description' => __( 'Unique identifier.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'price' => [
                                'description' => __( 'Current product price.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'regular_price' => [
                                'description' => __( 'Product regular price.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'sale_price' => [
                                'description' => __( 'Product sale price.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'date_on_sale_from' => [
                                'description' => __( "Start date of sale price, in the site's timezone.", 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'date_on_sale_from_gmt' => [
                                'description' => __( 'Start date of sale price, as GMT.', 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'date_on_sale_to' => [
                                'description' => __( "End date of sale price, in the site's timezone.", 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'date_on_sale_to_gmt' => [
                                'description' => __( 'End date of sale price, as GMT.', 'dokan-lite' ),
                                'type'        => 'date-time',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'price_html' => [
                                'description' => __( 'Price formatted in HTML.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'on_sale' => [
                                'description' => __( 'Shows if the product is on sale.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'purchasable' => [
                                'description' => __( 'Shows if the product can be bought.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'total_sales' => [
                                'description' => __( 'Amount of sales.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'virtual' => [
                                'description' => __( 'If the product is virtual.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => false,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'downloadable' => [
                                'description' => __( 'If the product is downloadable.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => false,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'downloads' => [
                                'description' => __( 'List of downloadable files.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type' => 'object',
                                    'properties' => [
                                        'id'   => [
                                            'description' => __( 'File MD5 hash.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'name' => [
                                            'description' => __( 'File name.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'file' => [
                                            'description' => __( 'File URL.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                    ],
                                ],
                            ],
                            'download_limit' => [
                                'description' => __( 'Number of times downloadable files can be downloaded after purchase.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'default'     => - 1,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'download_expiry' => [
                                'description' => __( 'Number of days until access to downloadable files expires.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'default'     => - 1,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'external_url' => [
                                'description' => __( 'Product external URL. Only for external products.', 'dokan-lite' ),
                                'type'        => 'string',
                                'format'      => 'uri',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'button_text' => [
                                'description' => __( 'Product external button text. Only for external products.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'tax_status' => [
                                'description' => __( 'Tax status.', 'dokan-lite' ),
                                'type'        => 'string',
                                'default'     => 'taxable',
                                'enum'        => [ 'taxable', 'shipping', 'none' ],
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'tax_class' => [
                                'description' => __( 'Tax class.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'manage_stock' => [
                                'description' => __( 'Stock management at product level.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => false,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'stock_quantity' => [
                                'description' => __( 'Stock quantity.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'in_stock' => [
                                'description' => __( 'Controls whether or not the product is listed as "in stock" or "out of stock" on the frontend.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => true,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'backorders' => [
                                'description' => __( 'If managing stock, this controls if backorders are allowed.', 'dokan-lite' ),
                                'type'        => 'string',
                                'default'     => 'no',
                                'enum'        => [ 'no', 'notify', 'yes' ],
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'backorders_allowed' => [
                                'description' => __( 'Shows if backorders are allowed.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'backordered' => [
                                'description' => __( 'Shows if the product is on backordered.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'sold_individually' => [
                                'description' => __( 'Allow one item to be bought in a single order.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => false,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'weight' => [
                                /* translators: %s: weight unit */
                                'description' => sprintf( __( 'Product weight (%s).', 'dokan-lite' ), $weight_unit ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'dimensions' => [
                                'description' => __( 'Product dimensions.', 'dokan-lite' ),
                                'type'        => 'object',
                                'context'     => [ 'view', 'edit' ],
                                'properties'  => [
                                    'length' => [
                                        /* translators: %s: dimension unit */
                                        'description' => sprintf( __( 'Product length (%s).', 'dokan-lite' ), $dimension_unit ),
                                        'type'        => 'string',
                                        'context'     => [ 'view', 'edit' ],
                                    ],
                                    'width' => [
                                        /* translators: %s: dimension unit */
                                        'description' => sprintf( __( 'Product width (%s).', 'dokan-lite' ), $dimension_unit ),
                                        'type'        => 'string',
                                        'context'     => [ 'view', 'edit' ],
                                    ],
                                    'height' => [
                                        /* translators: %s: dimension unit */
                                        'description' => sprintf( __( 'Product height (%s).', 'dokan-lite' ), $dimension_unit ),
                                        'type'        => 'string',
                                        'context'     => [ 'view', 'edit' ],
                                    ],
                                ],
                            ],
                            'shipping_required' => [
                                'description' => __( 'Shows if the product need to be shipped.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'shipping_taxable' => [
                                'description' => __( 'Shows whether or not the product shipping is taxable.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'shipping_class' => [
                                'description' => __( 'Shipping class slug.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'shipping_class_id' => [
                                'description' => __( 'Shipping class ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'reviews_allowed' => [
                                'description' => __( 'Allow reviews.', 'dokan-lite' ),
                                'type'        => 'boolean',
                                'default'     => true,
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'average_rating' => [
                                'description' => __( 'Reviews average rating.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'rating_count' => [
                                'description' => __( 'Amount of reviews that the product have.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'related_ids' => [
                                'description' => __( 'List of related products IDs.', 'dokan-lite' ),
                                'type'        => 'array',
                                'items'       => [
                                    'type' => 'integer',
                                ],
                                'context'     => [ 'view', 'edit' ],
                                'readonly'    => true,
                            ],
                            'upsell_ids' => [
                                'description' => __( 'List of up-sell products IDs.', 'dokan-lite' ),
                                'type'        => 'array',
                                'items'       => [
                                    'type' => 'integer',
                                ],
                                'context' => [ 'view', 'edit' ],
                            ],
                            'cross_sell_ids' => [
                                'description' => __( 'List of cross-sell products IDs.', 'dokan-lite' ),
                                'type'        => 'array',
                                'items'       => [
                                    'type' => 'integer',
                                ],
                                'context' => [ 'view', 'edit' ],
                            ],
                            'parent_id' => [
                                'description' => __( 'Product parent ID.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'purchase_note' => [
                                'description' => __( 'Optional note to send the customer after purchase.', 'dokan-lite' ),
                                'type'        => 'string',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'categories' => [
                                'description' => __( 'List of categories.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type'       => 'object',
                                    'properties' => [
                                        'id'   => [
                                            'description' => __( 'Category ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'name' => [
                                            'description' => __( 'Category name.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'slug' => [
                                            'description' => __( 'Category slug.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                    ],
                                ],
                            ],
                            'tags' => [
                                'description' => __( 'List of tags.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type' => 'object',
                                    'properties' => [
                                        'id'   => [
                                            'description' => __( 'Tag ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'name' => [
                                            'description' => __( 'Tag name.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'slug' => [
                                            'description' => __( 'Tag slug.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                    ],
                                ],
                            ],
                            'images' => [
                                'description' => __( 'List of images.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type'       => 'object',
                                    'properties' => [
                                        'id' => [
                                            'description' => __( 'Image ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'date_created' => [
                                            'description' => __( "The date the image was created, in the site's timezone.", 'dokan-lite' ),
                                            'type'        => 'date-time',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'date_created_gmt' => [
                                            'description' => __( 'The date the image was created, as GMT.', 'dokan-lite' ),
                                            'type'        => 'date-time',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'date_modified' => [
                                            'description' => __( "The date the image was last modified, in the site's timezone.", 'dokan-lite' ),
                                            'type'        => 'date-time',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'date_modified_gmt' => [
                                            'description' => __( 'The date the image was last modified, as GMT.', 'dokan-lite' ),
                                            'type'        => 'date-time',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'src' => [
                                            'description' => __( 'Image URL.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'format'      => 'uri',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'name' => [
                                            'description' => __( 'Image name.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'alt' => [
                                            'description' => __( 'Image alternative text.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'position' => [
                                            'description' => __( 'Image position. 0 means that the image is featured.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                    ],
                                ],
                            ],
                            'attributes' => [
                                'description' => __( 'List of attributes.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type' => 'object',
                                    'properties' => [
                                        'id'        => [
                                            'description' => __( 'Attribute ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'name' => [
                                            'description' => __( 'Attribute name.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'position' => [
                                            'description' => __( 'Attribute position.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'visible' => [
                                            'description' => __( "Define if the attribute is visible on the \"Additional information\" tab in the product's page.", 'dokan-lite' ),
                                            'type'        => 'boolean',
                                            'default'     => false,
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'variation' => [
                                            'description' => __( 'Define if the attribute can be used as variation.', 'dokan-lite' ),
                                            'type'        => 'boolean',
                                            'default'     => false,
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'options'   => [
                                            'description' => __( 'List of available term names of the attribute.', 'dokan-lite' ),
                                            'type'        => 'array',
                                            'context'     => [ 'view', 'edit' ],
                                            'items'       => [
                                                'type' => 'string',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                            'default_attributes' => [
                                'description' => __( 'Defaults variation attributes.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type'       => 'object',
                                    'properties' => [
                                        'id'     => [
                                            'description' => __( 'Attribute ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'name'   => [
                                            'description' => __( 'Attribute name.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'option' => [
                                            'description' => __( 'Selected attribute term name.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                    ],
                                ],
                            ],
                            'variations' => [
                                'description' => __( 'List of variations IDs.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type' => 'integer',
                                ],
                                'readonly'    => true,
                            ],
                            'grouped_products' => [
                                'description' => __( 'List of grouped products ID.', 'dokan-lite' ),
                                'type'        => 'array',
                                'items'       => [
                                    'type' => 'integer',
                                ],
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'menu_order' => [
                                'description' => __( 'Menu order, used to custom sort products.', 'dokan-lite' ),
                                'type'        => 'integer',
                                'context'     => [ 'view', 'edit' ],
                            ],
                            'meta_data' => [
                                'description' => __( 'Meta data.', 'dokan-lite' ),
                                'type'        => 'array',
                                'context'     => [ 'view', 'edit' ],
                                'items'       => [
                                    'type'       => 'object',
                                    'properties' => [
                                        'id'    => [
                                            'description' => __( 'Meta ID.', 'dokan-lite' ),
                                            'type'        => 'integer',
                                            'context'     => [ 'view', 'edit' ],
                                            'readonly'    => true,
                                        ],
                                        'key'   => [
                                            'description' => __( 'Meta key.', 'dokan-lite' ),
                                            'type'        => 'string',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                        'value' => [
                                            'description' => __( 'Meta value.', 'dokan-lite' ),
                                            'type'        => 'mixed',
                                            'context'     => [ 'view', 'edit' ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
                'vendor_products' => [
                    'description' => __( 'Vendors profile data.', 'dokan-lite' ),
                    'type'        => 'array',
                    'context'     => [ 'view', 'edit' ],
                    'items'       => [
                        'type'       => 'object',
                        'properties' => [
                            'email' => [
                                'description'  => __( 'Vendor email.', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'password' => [
                                'description'  => __( 'Vendor password.', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'store_name' => [
                                'description'  => __( 'Vendor store name.', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'social' => [
                                'description'  => __( 'Vendor social', 'dokan-lite' ),
                                'type'         => 'array',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'payment' => [
                                'description'  => __( 'Vendor payments', 'dokan-lite' ),
                                'type'         => 'array',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'phone' => [
                                'description'  => __( 'Vendor phone', 'dokan-lite' ),
                                'type'         => 'array',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'show_email' => [
                                'description'  => __( 'Vendor show email', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'address' => [
                                'description'  => __( 'Vendor address', 'dokan-lite' ),
                                'type'         => 'array',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'location' => [
                                'description'  => __( 'Vendor location', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'banner' => [
                                'description'  => __( 'Vendor banner', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'icon' => [
                                'description'  => __( 'Vendor icon', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'gravatar' => [
                                'description'  => __( 'Vendor gravatar', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'show_more_tpab' => [
                                'description'  => __( 'Vendor show more tpab', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'show_ppp' => [
                                'description'  => __( 'Vendor show product per page', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'enable_tnc' => [
                                'description'  => __( 'Enable terms and condition', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'store_seo' => [
                                'description'  => __( 'Store seo', 'dokan-lite' ),
                                'type'         => 'array',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'dokan_store_time' => [
                                'description'  => __( 'Store time open close array.', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'enabled' => [
                                'description'  => __( 'Vendor enabled.', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                            'trusted' => [
                                'description'  => __( 'Vendor is trusted.', 'dokan-lite' ),
                                'type'         => 'string',
                                'context'      => [ 'view', 'edit' ],
                            ],
                        ],
                    ],
                ],
                'vendor_index'                  => [
                    'description' => __( 'Vendor item index to import.', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
                'total_vendors'                  => [
                    'description' => __( 'Total vendors', 'dokan-lite' ),
                    'type'        => 'integer',
                    'context'     => [ 'view', 'edit' ],
                ],
            ],
        ];

        return $this->add_additional_fields_schema( $schema );
    }
}

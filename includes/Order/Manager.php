<?php

namespace WeDevs\Dokan\Order;

use DateTimeZone;
use Exception;
use WC_Order;
use WC_Order_Refund;
use WeDevs\Dokan\Cache;
use WP_Error;

/**
 * Order Management API
 *
 * @since 2.8
 * @since DOKAN_SINCE added HPOS support
 */
class Manager {

    /**
     * Get all orders
     *
     * @since 3.0.0
     * @since 3.6.3 rewritten to include filters
     * @since DOKAN_SINCE added HPOS support
     *
     * @return WP_Error|int[]|WC_Order[]
     */
    public function all( $args = [] ) {
        $default = [
            'seller_id'   => 0,
            'customer_id' => 0,
            'order_id'    => 0,
            'status'      => 'all',
            'order_date'  => '', // only for backward compatibility, will be removed in the future, if date is passed in args, it will be ignored
            'date'        => [
                'from' => '',
                'to'   => '',
            ],
            'search'      => '',
            'include'     => [],
            'exclude'     => [],
            'order_by'    => 'post_date',
            'order'       => 'DESC',
            'paged'       => 1,
            'limit'       => 10,
            'return'      => 'objects', // objects, ids, count
        ];

        $args = wp_parse_args( $args, $default );

        global $wpdb;

        $fields  = '';
        $groupby = '';
        $orderby = '';
        $limits  = '';

        if ( dokan_is_hpos_enabled() ) {
            // HPOS usage is enabled.
            $order_table_name = $this->get_order_table_name();
            $join             = " LEFT JOIN {$order_table_name} p ON do.order_id = p.id";
            $join             .= " LEFT JOIN $wpdb->posts post ON do.order_id = post.ID";
            $where            = ' AND p.post_status != %s';
            $query_args       = [ 1, 1, 'trash' ];
        } else {
            // Traditional CPT-based orders are in use.
            $join       = " LEFT JOIN $wpdb->posts p ON do.order_id = p.ID";
            $where      = ' AND p.post_status != %s';
            $query_args = [ 1, 1, 'trash' ];
        }

        // determine which fields to return
        if ( in_array( $args['return'], [ 'objects', 'ids' ], true ) ) {
            $fields = 'do.order_id';
        } elseif ( in_array( $args['return'], [ 'count' ], true ) ) {
            $fields = 'COUNT(do.order_id) AS count';
        }

        // now apply filtering on the fields
        // filter by seller id
        if ( ! $this->is_empty( $args['seller_id'] ) ) {
            $seller_ids = implode( "','", array_map( 'absint', (array) $args['seller_id'] ) );
            $where      .= " AND do.seller_id IN ('$seller_ids')";
        }

        // filter customer id
        if ( ! $this->is_empty( $args['customer_id'] ) ) {
            $customer_ids = implode( ',', array_map( 'absint', (array) $args['customer_id'] ) );
            if ( dokan_is_hpos_enabled() ) {
                $where .= "  AND p.customer_id IN ($customer_ids)";
            } else {
                $join  .= " LEFT JOIN $wpdb->postmeta pm ON p.ID = pm.post_id";
                $where .= " AND pm.meta_key = '_customer_user' AND pm.meta_value IN ($customer_ids)";
            }
        }

        // filter order id
        if ( ! $this->is_empty( $args['order_id'] ) ) {
            $order_ids = implode( ',', array_map( 'absint', (array) $args['order_id'] ) );
            $where     .= " AND do.order_id IN ($order_ids)";
        }

        // filter status
        if ( ! $this->is_empty( $args['status'] ) && 'all' !== $args['status'] ) {
            $status = implode( "','", esc_sql( (array) $args['status'] ) );
            $where  .= " AND do.order_status IN ('$status')";
        }

        // include order ids
        if ( ! $this->is_empty( $args['include'] ) ) {
            $include = implode( ',', array_map( 'absint', (array) $args['include'] ) );
            $where   .= " AND do.order_id IN ($include)";
        }

        // exclude order ids
        if ( ! $this->is_empty( $args['exclude'] ) ) {
            $exclude = implode( ',', array_map( 'absint', (array) $args['exclude'] ) );
            $where   .= " AND do.order_id NOT IN ($exclude)";
        }

        // date filter
        $date_from  = false;
        $date_to    = false;
        $date_field = dokan_is_hpos_enabled() ? 'p.date_created_gmt' : 'p.post_date';
        // check if start date is set
        if ( ! $this->is_empty( $args['date']['from'] ) ) {
            // convert date string to object
            $date_from = dokan_current_datetime()->modify( $args['date']['from'] );
            $date_from = dokan_is_hpos_enabled() && $date_from ? $date_from->setTimezone( new DateTimeZone( 'UTC' ) ) : $date_from;
        }

        // check if end date is set
        if ( ! $this->is_empty( $args['date']['to'] ) ) {
            // convert date string to object
            $date_to = dokan_current_datetime()->modify( $args['date']['to'] );
            $date_to = dokan_is_hpos_enabled() && $date_to ? $date_to->setTimezone( new DateTimeZone( 'UTC' ) ) : $date_to;
        }

        if ( $date_from && $date_to ) {
            $date_from = $date_from->format( 'Y-m-d' );
            $date_to   = $date_to->format( 'Y-m-d' );
            //swap dates if start date is after end date
            if ( $date_from > $date_to ) {
                $args['date'] = [
                    'from' => $date_to,
                    'to'   => $date_from,
                ];
            } else {
                $args['date'] = [
                    'from' => $date_from,
                    'to'   => $date_to,
                ];
            }

            $where        .= " AND DATE( $date_field ) BETWEEN %s AND %s";
            $query_args[] = $args['date']['from'];
            $query_args[] = $args['date']['to'];
            // if only start date is set
        } elseif ( $date_from ) {
            $where        .= " AND DATE( $date_field ) >= %s";
            $query_args[] = $date_from->format( 'Y-m-d' );
            // if only end date is set
        } elseif ( $date_to ) {
            $where        .= " AND DATE( $date_field ) <= %s";
            $query_args[] = $date_to->format( 'Y-m-d' );
            // if only single date is set
        } elseif ( is_string( $args['date'] ) && ! empty( $args['date'] ) ) {
            // backward compatibility for old filter
            $where        .= " AND DATE( $date_field ) = %s";
            $query_args[] = $args['date'];
        } elseif ( ! $this->is_empty( $args['order_date'] ) ) {
            // backward compatibility for old filter
            $order_date = dokan_current_datetime()->modify( $args['order_date'] );
            $order_date = dokan_is_hpos_enabled() && $order_date ? $order_date->setTimezone( new DateTimeZone( 'UTC' ) ) : $order_date;
            if ( $order_date ) {
                $where        .= " AND DATE( $date_field ) = %s";
                $query_args[] = $order_date->format( 'Y-m-d' );
            }
        }

        // filter by search parameter
        if ( ! $this->is_empty( $args['search'] ) ) {
            $search       = '%' . $wpdb->esc_like( $args['search'] ) . '%';
            $where        .= dokan_is_hpos_enabled() ? ' AND p.id LIKE %s' : ' AND p.ID LIKE %s'; // mysql is case-insensitive but others might create problems
            $query_args[] = $search;
        }

        // fix order by parameter
        if ( ! in_array( strtoupper( $args['order'] ), [ 'ASC', 'DESC' ], true ) ) {
            $args['order'] = 'DESC';
        }

        // fix order by parameter
        $supported_order_by = [
            'post_date'    => dokan_is_hpos_enabled() ? 'p.date_created_gmt' : 'p.post_date',
            'id'           => 'do.id',
            'order_id'     => 'do.order_id',
            'seller_id'    => 'do.seller_id',
            'order_status' => 'do.order_status',
        ];
        if ( ! empty( $args['order_by'] ) && array_key_exists( $args['order_by'], $supported_order_by ) ) {
            $orderby = "ORDER BY {$supported_order_by[ $args['order_by'] ]} {$args['order']}"; //no need for prepare, we've already whitelisted the parameters

            //second order by in case of similar value on first order by field
            if ( 'order_id' !== $args['order_by'] ) {
                $orderby .= ", do.order_id {$args['order']}";
            }
        }

        // pagination param
        if ( ! empty( $args['limit'] ) && -1 !== intval( $args['limit'] ) && 'count' !== $args['return'] ) {
            $limit  = absint( $args['limit'] );
            $page   = absint( $args['paged'] );
            $page   = $page > 0 ? $page : 1;
            $offset = ( $page - 1 ) * $limit;

            $limits       = 'LIMIT %d, %d';
            $query_args[] = $offset;
            $query_args[] = $limit;
        }

        $cache_group = 'seller_order_data';
        $cache_key   = 'seller_orders_all_' . md5( wp_json_encode( $args ) ); // Use all arguments to create a hash used as cache key
        if ( is_numeric( $args['seller_id'] ) ) {
            $cache_group = "seller_order_data_{$args['seller_id']}";
        } elseif ( ! $this->is_empty( $args['seller_id'] ) && 1 === count( $args['seller_id'] ) ) {
            $cache_group = "seller_order_data_{$args['seller_id'][0]}";
        }

        $orders = Cache::get( $cache_key, $cache_group );

        if ( 'count' === $args['return'] && false === $orders ) {
            // get count of entries
            // @codingStandardsIgnoreStart
            $orders = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT $fields FROM {$wpdb->prefix}dokan_orders AS do $join WHERE %d=%d $where",
                    $query_args
                )
            );

            // check for query error
            if ( ! empty( $wpdb->last_error ) ) {
                return new WP_Error( 'order_manager_db_error', $wpdb->last_error, $wpdb->last_query );
            }

            // @codingStandardsIgnoreEnd
            Cache::set( $cache_key, $orders, $cache_group );
        } elseif ( in_array( $args['return'], [ 'objects', 'ids' ], true ) && false === $orders ) {
            // @codingStandardsIgnoreStart
            $orders = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT $fields FROM {$wpdb->prefix}dokan_orders AS do $join WHERE %d=%d $where $groupby $orderby $limits",
                    $query_args
                )
            );
            // @codingStandardsIgnoreEnd

            // check for query error
            if ( ! empty( $wpdb->last_error ) ) {
                return new WP_Error( 'order_manager_db_error', $wpdb->last_error, $wpdb->last_query );
            }

            if ( 'objects' === $args['return'] ) {
                $order_objects = [];
                foreach ( $orders as $order_id ) {
                    $order = $this->get( $order_id );
                    if ( $order ) {
                        // only send legit order object, this will prevent some fatal error in case order object is not found
                        $order_objects[] = $order;
                    }
                }
                $orders = $order_objects;
                unset( $order_objects );
            }

            Cache::set( $cache_key, $orders, $cache_group );
        }

        return $orders;
    }

    /**
     * Get single order details
     *
     * @since 3.0.0
     *
     * @return bool|WC_Order|WC_Order_Refund
     */
    public function get( $id ) {
        return wc_get_order( $id );
    }

    /**
     * Count orders for a seller
     *
     * @since DOKAN_SINCE moved this function from functions.php file
     *
     * @param int $seller_id
     *
     * @return array
     */
    public function count_orders( $seller_id ) {
        global $wpdb;

        $cache_group = "seller_order_data_{$seller_id}";
        $cache_key   = "count_orders_{$seller_id}";
        $counts      = Cache::get( $cache_key, $cache_group );

        if ( false === $counts ) {
            $counts = [
                'wc-pending'        => 0,
                'wc-completed'      => 0,
                'wc-on-hold'        => 0,
                'wc-processing'     => 0,
                'wc-refunded'       => 0,
                'wc-cancelled'      => 0,
                'wc-failed'         => 0,
                'wc-checkout-draft' => 0,
                'total'             => 0,
            ];
            $counts = apply_filters( 'dokan_order_status_count', $counts );

            $query = $wpdb->prepare(
                "SELECT do.order_status as order_status, count(do.id) as order_count
                FROM {$wpdb->prefix}dokan_orders AS do
                LEFT JOIN $wpdb->posts p ON do.order_id = p.ID
                WHERE
                    do.seller_id = %d AND
                    p.post_type = 'shop_order' AND
                    p.post_status != 'trash'
                GROUP BY do.order_status",
                [ $seller_id ]
            );

            $results = $wpdb->get_results( $query ); // phpcs:ignore

            if ( $results ) {
                foreach ( $results as $count ) {
                    if ( isset( $counts[ $count->order_status ] ) ) {
                        $counts[ $count->order_status ] = intval( $count->order_count );
                        $counts['total']                += $counts[ $count->order_status ];
                    }
                }
            }

            $counts = (object) $counts;
            Cache::set( $cache_key, $counts, $cache_group );
        }

        return $counts;
    }

    /**
     * Check if an order with same id is exists in database
     *
     * @since DOKAN_SINCE
     *
     * @param int|WC_Order $order_id
     *
     * @return boolean
     */
    public function is_order_already_synced( $order_id ) {
        global $wpdb;

        if ( $order_id instanceof WC_Order ) {
            $order_id = $order_id->get_id();
        }

        if ( ! $order_id || ! is_numeric( $order_id ) ) {
            return false;
        }

        $order_id = $wpdb->get_var( $wpdb->prepare( "SELECT 1 FROM {$wpdb->prefix}dokan_orders WHERE order_id=%d LIMIT 1", $order_id ) );

        return wc_string_to_bool( $order_id );
    }

    /**
     * Get order of current logged-in users or by given customer id
     *
     * @since DOKAN_SINCE
     *
     * @param array $args
     *
     * @return \stdClass|WC_Order[]|int[]
     */
    public function get_customer_orders( $args ) {
        // fix customer id if not provided
        $customer_id = ! empty( $args['customer_id'] ) ? intval( $args['customer_id'] ) : dokan_get_current_user_id();
        $args        = [
            'customer_id' => $customer_id,
            'limit'       => ! empty( $args['limit'] ) ? intval( $args['limit'] ) : 10,
            'paged'       => ! empty( $args['paged'] ) ? absint( $args['paged'] ) : 1,
            'return'      => ! empty( $args['return_type'] ) && in_array( $args['return_type'], [ 'ids', 'objects' ], true ) ? sanitize_text_field( $args['return_type'] ) : 'ids',
        ];

        return wc_get_orders(
            apply_filters( 'woocommerce_my_account_my_orders_query', $args )
        );
    }

    /**
     * Get Customer Order IDs by Seller
     *
     * @since DOKAN_SINCE
     *
     * @param int $customer_id
     * @param int $seller_id
     *
     * @return int[]|null on failure
     */
    public function get_customer_order_ids_by_seller( $customer_id, $seller_id ) {
        if ( ! $customer_id || ! $seller_id ) {
            return null;
        }

        $args = [
            'customer_id' => $customer_id,
            'meta_key'    => '_dokan_vendor_id', // phpcs:ignore
            'meta_value'  => $seller_id, // phpcs:ignore
            'return'      => 'ids',
            'limit'       => -1,
        ];

        $orders = wc_get_orders( apply_filters( 'dokan_get_customer_orders_by_seller', $args ) );

        return ! empty( $orders ) ? $orders : null;
    }

    /**
     * @param int|WC_Order $parent_order
     *
     * @return WC_Order[]
     */
    public function get_child_orders( $parent_order ) {
        $parent_order_id = is_numeric( $parent_order ) ?? $parent_order->get_id();
        return wc_get_orders(
            [
                'parent' => $parent_order_id,
                'limit'  => -1,
            ]
        );
    }

    /**
     * Delete dokan order
     *
     * @since DOKAN_SINCE
     *
     * @param int      $order_id
     * @param int|null $seller_id
     *
     * @return void
     */
    public function delete_seller_order( $order_id, $seller_id = null ) {
        global $wpdb;

        $where = [
            'order_id' => $order_id,
        ];

        $where_format = [ '%d' ];

        if ( is_numeric( $seller_id ) ) {
            $where['seller_id'] = $seller_id;
            $where_format[]     = '%d';
        }

        $wpdb->delete( $wpdb->prefix . 'dokan_orders', $where, $where_format );

        // todo: delete all order references from vendor_balance, withdraw and refund table
        // todo: remove action of wp_trash_post, wp_untrash_post, wp_delete_post if necessary
    }

    /**
     * Delete dokan order with suborders
     *
     * @since DOKAN_SINCE
     *
     * @param int $order_id
     *
     * @return void
     */
    public function delete_seller_order_with_suborders( $order_id ) {
        // delete main order
        $this->delete_seller_order( $order_id );

        $sub_orders = wc_get_orders(
            [
                'parent' => $order_id,
                'limit'  => -1,
            ]
        );

        if ( $sub_orders ) {
            foreach ( $sub_orders as $sub_order ) {
                $sub_order->delete( true );
            }
        }
    }

    /**
     * Creates a sub order
     *
     * @param WC_Order $parent_order
     * @param integer  $seller_id
     * @param array    $seller_products
     *
     * @return void|WP_Error
     */
    public function create_sub_order( $parent_order, $seller_id, $seller_products ) {
        dokan_log( 'Creating sub order for vendor: #' . $seller_id );

        $bill_ship = [
            'billing_country',
            'billing_first_name',
            'billing_last_name',
            'billing_company',
            'billing_address_1',
            'billing_address_2',
            'billing_city',
            'billing_state',
            'billing_postcode',
            'billing_email',
            'billing_phone',
            'shipping_country',
            'shipping_first_name',
            'shipping_last_name',
            'shipping_company',
            'shipping_address_1',
            'shipping_address_2',
            'shipping_city',
            'shipping_state',
            'shipping_postcode',
        ];

        try {
            $order = new WC_Order();

            // save billing and shipping address
            foreach ( $bill_ship as $key ) {
                if ( is_callable( [ $order, "set_{$key}" ] ) ) {
                    $order->{"set_{$key}"}( $parent_order->{"get_{$key}"}() );
                }
            }

            // now insert line items
            $this->create_line_items( $order, $seller_products );

            // do shipping
            $this->create_shipping( $order, $parent_order );

            // do tax
            $this->create_taxes( $order, $parent_order, $seller_products );

            // add coupons if any
            $this->create_coupons( $order, $parent_order, $seller_products );

            // save other details
            $order->set_created_via( 'dokan' );
            $order->set_cart_hash( $parent_order->get_cart_hash() );
            $order->set_customer_id( $parent_order->get_customer_id() );
            $order->set_currency( $parent_order->get_currency() );
            $order->set_prices_include_tax( $parent_order->get_prices_include_tax() );
            $order->set_customer_ip_address( $parent_order->get_customer_ip_address() );
            $order->set_customer_user_agent( $parent_order->get_customer_user_agent() );
            $order->set_customer_note( $parent_order->get_customer_note() );
            $order->set_payment_method( $parent_order->get_payment_method() );
            $order->set_payment_method_title( $parent_order->get_payment_method_title() );
            $order->update_meta_data( '_dokan_vendor_id', $seller_id );
            $order->save(); // need to save order data before passing it to a hook

            do_action( 'dokan_create_sub_order_before_calculate_totals', $order, $parent_order, $seller_products );

            // finally, let the order re-calculate itself and save
            $order->calculate_totals();
            $order->set_status( $parent_order->get_status() );
            $order->set_parent_id( $parent_order->get_id() );
            $order->save();

            // update total_sales count for sub-order
            wc_update_total_sales_counts( $order->get_id() );

            dokan_log( 'Created sub order : #' . $order->get_id() );

            do_action( 'dokan_checkout_update_order_meta', $order->get_id(), $seller_id );
        } catch ( Exception $e ) {
            return new WP_Error( 'dokan-suborder-error', $e->getMessage() );
        }
    }

    /**
     * Create line items for order
     *
     * @param object $order wc_get_order
     * @param array  $products
     *
     * @return void
     */
    private function create_line_items( $order, $products ) {
        foreach ( $products as $item ) {
            $product_item = new \WC_Order_Item_Product();

            $product_item->set_name( $item->get_name() );
            $product_item->set_product_id( $item->get_product_id() );
            $product_item->set_variation_id( $item->get_variation_id() );
            $product_item->set_quantity( $item->get_quantity() );
            $product_item->set_tax_class( $item->get_tax_class() );
            $product_item->set_subtotal( $item->get_subtotal() );
            $product_item->set_subtotal_tax( $item->get_subtotal_tax() );
            $product_item->set_total_tax( $item->get_total_tax() );
            $product_item->set_total( $item->get_total() );
            $product_item->set_taxes( $item->get_taxes() );

            $metadata = $item->get_meta_data();
            if ( $metadata ) {
                foreach ( $metadata as $meta ) {
                    $product_item->add_meta_data( $meta->key, $meta->value );
                }
            }

            $order->add_item( $product_item );
        }

        do_action( 'dokan_after_create_line_items', $order );
    }

    /**
     * Create tax line items
     *
     * @param WC_Order $order
     * @param WC_Order $parent_order
     * @param array    $products
     *
     * @return void
     */
    private function create_taxes( $order, $parent_order, $products ) {
        $shipping  = $order->get_items( 'shipping' );
        $tax_total = 0;

        foreach ( $products as $item ) {
            $tax_total += $item->get_total_tax();
        }

        foreach ( $parent_order->get_taxes() as $tax ) {
            $seller_shipping = reset( $shipping );

            $item = new \WC_Order_Item_Tax();
            $item->set_props(
                [
                    'rate_id'            => $tax->get_rate_id(),
                    'label'              => $tax->get_label(),
                    'compound'           => $tax->get_compound(),
                    'rate_code'          => \WC_Tax::get_rate_code( $tax->get_rate_id() ),
                    'tax_total'          => $tax_total,
                    'shipping_tax_total' => is_bool( $seller_shipping ) ? '' : $seller_shipping->get_total_tax(),
                ]
            );

            $order->add_item( $item );
        }
    }

    /**
     * Create shipping for a sub-order if neccessary
     *
     * @param WC_Order $order
     * @param WC_Order $parent_order
     *
     * @return void
     */
    private function create_shipping( $order, $parent_order ) {
        dokan_log( sprintf( '#%d - Creating Shipping.', $order->get_id() ) );

        // Get all shipping methods for parent order
        $shipping_methods = $parent_order->get_shipping_methods();
        $order_seller_id  = (int) dokan_get_seller_id_by_order( $order->get_id() );

        $applied_shipping_method = '';

        if ( $shipping_methods ) {
            foreach ( $shipping_methods as $method_item_id => $shipping_object ) {
                $shipping_seller_id = (int) wc_get_order_item_meta( $method_item_id, 'seller_id', true );

                if ( $order_seller_id === $shipping_seller_id ) {
                    $applied_shipping_method = $shipping_object;
                    break;
                }
            }
        }

        $shipping_method = apply_filters( 'dokan_shipping_method', $applied_shipping_method, $order->get_id(), $parent_order );

        // bail out if no shipping methods found
        if ( ! $shipping_method ) {
            dokan_log( sprintf( '#%d - No shipping method found. Aborting.', $order->get_id() ) );

            return;
        }

        if ( is_a( $shipping_method, 'WC_Order_Item_Shipping' ) ) {
            $item = new \WC_Order_Item_Shipping();

            dokan_log( sprintf( '#%d - Adding shipping item.', $order->get_id() ) );

            $item->set_props(
                [
                    'method_title' => $shipping_method->get_name(),
                    'method_id'    => $shipping_method->get_method_id(),
                    'total'        => $shipping_method->get_total(),
                    'taxes'        => $shipping_method->get_taxes(),
                ]
            );

            $metadata = $shipping_method->get_meta_data();

            if ( $metadata ) {
                foreach ( $metadata as $meta ) {
                    $item->add_meta_data( $meta->key, $meta->value );
                }
            }

            $order->add_item( $item );
            $order->set_shipping_total( $shipping_method->get_total() );
        }
    }

    /**
     * Create coupons for a sub-order if neccessary
     *
     * @param WC_Order $order
     * @param WC_Order $parent_order
     * @param array    $products
     *
     * @return void
     */
    private function create_coupons( $order, $parent_order, $products ) {
        $used_coupons = $parent_order->get_items( 'coupon' );
        $product_ids  = array_map(
            function ( $item ) {
                return $item->get_product_id();
            }, $products
        );

        if ( ! $used_coupons ) {
            return;
        }

        $seller_id = dokan_get_seller_id_by_order( $order->get_id() );

        if ( ! $seller_id ) {
            return;
        }

        foreach ( $used_coupons as $item ) {
            $coupon = new \WC_Coupon( $item->get_code() );

            if (
                $coupon &&
                ! is_wp_error( $coupon ) &&
                ( array_intersect( $product_ids, $coupon->get_product_ids() ) ||
                  apply_filters( 'dokan_is_order_have_admin_coupon', false, $coupon, [ $seller_id ], $product_ids )
                )
            ) {
                $new_item = new \WC_Order_Item_Coupon();
                $new_item->set_props(
                    [
                        'code'         => $item->get_code(),
                        'discount'     => $item->get_discount(),
                        'discount_tax' => $item->get_discount_tax(),
                    ]
                );

                $new_item->add_meta_data( 'coupon_data', $coupon->get_data() );

                $order->add_item( $new_item );
            }
        }
    }

    /**
     * Monitors a new order and attempts to create sub-orders
     *
     * If an order contains products from multiple vendor, we can't show the order
     * to each seller dashboard. That's why we need to divide the main order to
     * some sub-orders based on the number of sellers.
     *
     * @param int $parent_order_id
     *
     * @return void
     */
    public function maybe_split_orders( $parent_order_id ) {
        $parent_order = $this->get( $parent_order_id );

        dokan_log( sprintf( 'New Order #%d created. Init sub order.', $parent_order_id ) );

        if ( wc_string_to_bool( $parent_order->get_meta( 'has_sub_order' ) ) === true ) {
            $child_orders = wc_get_orders(
                [
                    'parent' => $parent_order->get_id(),
                    'limit'  => -1,
                ]
            );

            foreach ( $child_orders as $child_order ) {
                $child_order->delete( true );
            }
        }

        $vendors = dokan_get_sellers_by( $parent_order_id );

        // return if we've only ONE seller
        if ( count( $vendors ) === 1 ) {
            dokan_log( '1 vendor only, skipping sub order.' );

            $temp      = array_keys( $vendors );
            $seller_id = reset( $temp );

            do_action( 'dokan_create_parent_order', $parent_order, $seller_id );

            $parent_order->update_meta_data( '_dokan_vendor_id', $seller_id );
            $parent_order->save_meta_data();

            // if the request is made from rest api then insert the order data to the sync table
            if ( defined( 'REST_REQUEST' ) ) {
                do_action( 'dokan_checkout_update_order_meta', $parent_order_id, $seller_id );
            }

            return;
        }

        // flag it as it has a suborder
        $parent_order->update_meta_data( 'has_sub_order', true );
        $parent_order->save_meta_data();

        dokan_log( sprintf( 'Got %s vendors, starting sub order.', count( $vendors ) ) );

        // seems like we've got multiple sellers
        foreach ( $vendors as $seller_id => $seller_products ) {
            $this->create_sub_order( $parent_order, $seller_id, $seller_products );
        }

        dokan_log( sprintf( 'Completed sub order for #%d.', $parent_order_id ) );
    }

    /**
     * This will check if given var is empty or not.
     *
     * @since 3.6.3
     *
     * @param mixed $item
     *
     * @return bool
     */
    protected function is_empty( $item ) {
        if ( empty( $item ) ) {
            return true;
        }

        // if var is an array, check if it's empty or not
        if ( is_array( $item ) && isset( $item[0] ) && intval( $item[0] ) === 0 ) {
            return true;
        }

        return false;
    }

    /**
     * Get the custom orders table name for wc.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    private function get_order_table_name() {
        return \Automattic\WooCommerce\Internal\DataStores\Orders\OrdersTableDataStore::get_orders_table_name();
    }
}

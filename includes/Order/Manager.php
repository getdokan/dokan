<?php

namespace WeDevs\Dokan\Order;

use Exception;
use WC_Order;
use WC_Order_Item_Coupon;
use WC_Order_Refund;
use WeDevs\Dokan\Cache;
use WeDevs\Dokan\Utilities\OrderUtil;
use WP_Error;

/**
 * Order Management API
 *
 * @since 2.8
 * @since 3.8.0 added HPOS support
 */
class Manager {

    /**
     * Get all orders
     *
     * @since 3.0.0
     * @since 3.6.3 rewritten to include filters
     * @since 3.8.0 added HPOS support
     *
     * @return WP_Error|int[]|WC_Order[]
     */
    public function all( $args = [] ) {
        $query_args = apply_filters( 'dokan_get_vendor_orders_args', wp_parse_args( $this->get_backward_compatibility_args( $args ), $args ), $args, [] );

        if ( ! OrderUtil::is_hpos_enabled() ) {
            $meta = $query_args['meta_query'] ?? [];
            unset( $query_args['meta_query'] );

            $handle_meta = function ( $query ) use ( $meta ) {
                if ( [] === $meta ) {
                    return $query;
                }

                if ( ! isset( $query['meta_query'] ) ) {
                    $query['meta_query'] = $meta; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                } else {
                    $query['meta_query'] = array_merge( $query['meta_query'], $meta ); // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                }

                return $query;
            };

            add_filter( 'woocommerce_order_data_store_cpt_get_orders_query', $handle_meta, 10, 1 );
        }

        $orders = wc_get_orders( $query_args );

        if ( ! OrderUtil::is_hpos_enabled() ) {
            remove_filter( 'woocommerce_order_data_store_cpt_get_orders_query', $handle_meta, 10 );
        }

        if ( isset( $args['return'] ) && 'count' === $args['return'] ) {
            return apply_filters( 'dokan_get_vendor_orders_count', $orders->total, $args );
        }

        return apply_filters( 'dokan_get_vendor_orders', $orders, $args );
    }

    /**
     * Get backward compatibility args
     *
     * @since 3.8.0
     *
     * @param array $args
     *
     * @return array
     */
    protected function get_backward_compatibility_args( $args = [] ) {
        $default = [
            'type'                => 'shop_order',
            'seller_id'           => 0,
            'customer_id'         => 0,
            'order_id'            => 0,
            'status'              => 'all',
            'order_date'          => '', // only for backward compatibility, will be removed in the future, if date is passed in args, it will be ignored
            'date'                => [
                'from' => '',
                'to'   => '',
            ],
            'search'              => '',
            'include'             => [],
            'exclude'             => [],
            'orderby'             => 'date',
            'order'               => 'DESC',
            'limit'               => 10,
            'paged'               => 1, // do nothing if offset is used
            'offset'              => '',
            'return'              => 'objects', // objects, ids, count
            'meta_query'          => [], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
            'meta_query_relation' => 'AND',
        ];

        $args = wp_parse_args( $args, $default );

        $query_args = [
            'limit'      => $args['limit'],
            'paged'      => $args['paged'],
            'offset'     => $args['offset'],
            'order'      => $args['order'],
            'return'     => $args['return'],
            'meta_query' => $args['meta_query'] ?? [], // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
        ];

        // fix meta query relation
        $query_args['meta_query']['relation'] = $args['meta_query_relation'];

        // now apply filtering on the field
        // filter by seller id
        if ( ! $this->is_empty( $args['seller_id'] ) ) {
            $seller_ids                 = array_filter( array_map( 'absint', (array) $args['seller_id'] ) );
            $query_args['meta_query'][] = [
                [
                    'key'     => '_dokan_vendor_id',
                    'value'   => $seller_ids,
                    'compare' => 'IN',
                    'type'    => 'NUMERIC',
                ],
            ];
        }

        // filter customer id
        if ( ! $this->is_empty( $args['customer_id'] ) ) {
            $customer_ids              = array_filter( array_map( 'absint', (array) $args['customer_id'] ) );
            $query_args['customer_id'] = $customer_ids;
        }

        // filter order id
        if ( ! $this->is_empty( $args['order_id'] ) ) {
            $order_ids = array_filter( array_map( 'absint', (array) $args['order_id'] ) );
            if ( OrderUtil::is_hpos_enabled() ) {
                $query_args['id'] = $order_ids;
            } else {
                $query_args['post__in'] = $order_ids;
            }
        }

        // filter status
        if ( ! $this->is_empty( $args['status'] ) && 'all' !== $args['status'] ) {
            $query_args['status'] = (array) $args['status'];
        }

        // include order ids
        if ( ! $this->is_empty( $args['include'] ) ) {
            $include = array_filter( array_map( 'absint', (array) $args['include'] ) );
            if ( OrderUtil::is_hpos_enabled() ) {
                $query_args['id'] = $include;
            } else {
                $query_args['post__in'] = $include;
            }
        }

        // exclude order ids
        if ( ! $this->is_empty( $args['exclude'] ) ) {
            $exclude               = array_filter( array_map( 'absint', (array) $args['exclude'] ) );
            $query_args['exclude'] = $exclude;
        }

        // date filter
        $date_from = false;
        $date_to   = false;
        // check if the start date is set
        if ( ! $this->is_empty( $args['date']['from'] ) ) {
            // convert date string to object
            $date_from = dokan_current_datetime()->modify( $args['date']['from'] );
        }

        // check if the end date is set
        if ( ! $this->is_empty( $args['date']['to'] ) ) {
            // convert date string to object
            $date_to = dokan_current_datetime()->modify( $args['date']['to'] );
        }

        if ( $date_from && $date_to ) {
            $date_from                  = $date_from->format( 'Y-m-d' );
            $date_to                    = $date_to->format( 'Y-m-d' );
            $query_args['date_created'] = $date_from . '...' . $date_to;
            // if only start date is set
        } elseif ( $date_from ) {
            $query_args['date_created'] = '>=' . $date_from->format( 'Y-m-d' );
            // if only end date is set
        } elseif ( $date_to ) {
            $query_args['date_created'] = '<=' . $date_to->format( 'Y-m-d' );
            // if only a single date is set
        } elseif ( is_string( $args['date'] ) && ! empty( $args['date'] ) ) {
            // backward compatibility for old filter
            $query_args['date_created'] = $args['date'];
        } elseif ( ! $this->is_empty( $args['order_date'] ) ) {
            // backward compatibility for old filter
            $query_args['date_created'] = $args['order_date'];
        }

        // filter by search parameter
        if ( ! $this->is_empty( $args['search'] ) ) {
            if ( OrderUtil::is_hpos_enabled() ) {
                $query_args['id'] = (int) $args['search'];
            } else {
                $query_args['post__in'] = [ (int) $args['search'] ];
            }
        }

        // fix order by parameter
        if ( ! in_array( strtoupper( $args['order'] ), [ 'ASC', 'DESC' ], true ) ) {
            $query_args['order'] = 'DESC';
        }

        // fix order by parameter
        if ( isset( $args['order_by'] ) ) {
            $args['orderby'] = $args['order_by'];
        }

        // get supported orderby paramter
        $supported_order_by = [
            'name'      => 'name',
            'type'      => 'type',
            'rand'      => 'rand',
            'modified'  => 'modified',
            'post_date' => 'date',
            'date'      => 'date',
            'id'        => 'ID',
            'order_id'  => 'ID',
            'seller_id' => 'seller_id',
        ];

        if ( ! array_key_exists( $args['orderby'], $supported_order_by ) ) {
            $args['orderby'] = 'date';
        }

        switch ( $args['orderby'] ) {
            case 'seller_id':
                $query_args = array_merge(
                    $query_args, [
                        'orderby'   => 'meta_value',
                        'meta_key'  => '_dokan_vendor_id', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
                        'meta_type' => 'NUMERIC',
                    ]
                );
                break;

            default:
                $query_args['orderby'] = $supported_order_by[ $args['orderby'] ];
                break;
        }

        // fix return parameter
        if ( 'count' === $query_args['return'] ) {
            $query_args['limit']    = 1;
            $query_args['return']   = 'ids';
            $query_args['paginate'] = true;
        }

        return $query_args;
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
     * @since 3.8.0 moved this function from functions.php file
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

            $order_table_name = OrderUtil::get_order_table_name();
            if ( OrderUtil::is_hpos_enabled() ) {
                // HPOS usage is enabled.
                // phpcs:disable
                $query = $wpdb->prepare(
                    "SELECT do.order_status as order_status, count(do.id) as order_count
                    FROM {$wpdb->prefix}dokan_orders AS do
                    LEFT JOIN $order_table_name p ON do.order_id = p.id
                    WHERE
                        do.seller_id = %d AND
                        p.status != 'trash'
                    GROUP BY do.order_status",
                    [ $seller_id ]
                );
                // phpcs:enable
            } else {
                // traditional CPT-based orders are in use.
                // phpcs:disable
                $query = $wpdb->prepare(
                    "SELECT do.order_status as order_status, count(do.id) as order_count
                    FROM {$wpdb->prefix}dokan_orders AS do
                    LEFT JOIN $order_table_name p ON do.order_id = p.ID
                    WHERE
                        do.seller_id = %d AND
                        p.post_status != 'trash'
                    GROUP BY do.order_status",
                    [ $seller_id ]
                );
                // phpcs:enable
            }

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
     * @since 3.8.0
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
     * Check if order is belonged to given seller
     *
     * @since 3.8.0
     *
     * @param int $seller_id
     * @param int $order_id
     *
     * @return bool
     */
    public function is_seller_has_order( $seller_id, $order_id ) {
        global $wpdb;

        return 1 === (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT 1 FROM {$wpdb->prefix}dokan_orders WHERE seller_id = %d AND order_id = %d LIMIT 1",
                    [ $seller_id, $order_id ]
                )
            );
    }

    /**
     * Get order of current logged-in users or by given customer id
     *
     * @since 3.8.0
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

        return $this->all(
            apply_filters( 'woocommerce_my_account_my_orders_query', $args )
        );
    }

    /**
     * Get Customer Order IDs by Seller
     *
     * @since 3.8.0
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
            'seller_id'   => $seller_id,
            'return'      => 'ids',
            'limit'       => -1,
        ];

        $orders = $this->all( apply_filters( 'dokan_get_customer_orders_by_seller', $args ) );

        return ! empty( $orders ) ? $orders : null;
    }

    /**
     * @param int|WC_Order $parent_order
     *
     * @return WC_Order[]
     */
    public function get_child_orders( $parent_order ) {
        $parent_order_id = is_numeric( $parent_order ) ? $parent_order : $parent_order->get_id();

        return wc_get_orders(
            [
                'type'   => 'shop_order',
                'parent' => $parent_order_id,
                'limit'  => -1,
            ]
        );
    }

    /**
     * Delete dokan order
     *
     * @since 3.8.0
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

        $deleted = $wpdb->delete( $wpdb->prefix . 'dokan_orders', $where, $where_format );
        if ( false === $deleted ) {
            dokan_log( sprintf( '[DeleteSellerOrder] Error while deleting dokan order table data, order_id: %d, Database Error: %s  ', $order_id, $wpdb->last_error ) );

            return; // since dokan_orders table data couldn't be deleted, returning from here
        }

        // delete from dokan refund table -> order_id
        $deleted = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM `{$wpdb->prefix}dokan_refund` WHERE order_id = %d",
                [ $order_id ]
            )
        );
        if ( false === $deleted ) {
            dokan_log( sprintf( '[DeleteSellerOrder] Error while deleting refund table data, order_id: %d, Database Error: %s  ', $order_id, $wpdb->last_error ) );
        }

        do_action( 'dokan_after_deleting_seller_order', $order_id );

        // delete data from vendor balance table -> trn_id, trn_type: dokan_orders, dokan_refund, dokan_withdraw
        $deleted = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM `{$wpdb->prefix}dokan_vendor_balance`
                WHERE trn_id = %d AND trn_type in ( %s, %s, %s )",
                [ $order_id, 'dokan_orders', 'dokan_refund', 'dokan_withdraw' ]
            )
        );
        if ( false === $deleted ) {
            dokan_log( sprintf( '[DeleteSellerOrder] Error while deleting vendor balance table data, order_id: %d, Database Error: %s  ', $order_id, $wpdb->last_error ) );
        }

        // delete data from reverse withdrawal table -> order_id, trn_type: order_commission, manual_order_commission, order_refund
        $deleted = $wpdb->query(
            $wpdb->prepare(
                "DELETE FROM `{$wpdb->prefix}dokan_reverse_withdrawal`
                WHERE trn_id = %d AND trn_type in ( %s, %s, %s )",
                [ $order_id, 'order_commission', 'manual_order_commission', 'order_refund' ]
            )
        );
        if ( false === $deleted ) {
            dokan_log( sprintf( '[DeleteSellerOrder] Error while deleting dokan reverse withdrawal table data, order_id: %d, Database Error: %s  ', $order_id, $wpdb->last_error ) );
        }
    }

    /**
     * Delete dokan order with suborders
     *
     * @since 3.8.0
     *
     * @param int $order_id
     *
     * @return void
     */
    public function delete_seller_order_with_suborders( $order_id ) {
        // delete main order
        $this->delete_seller_order( $order_id );

        $sub_orders = $this->get_child_orders( $order_id );

        if ( $sub_orders ) {
            foreach ( $sub_orders as $sub_order ) {
                // delete_seller_order for sub_order will be called from Order/Admin/Hooks.php file
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

            // save billing and shipping address
            foreach ( $bill_ship as $key ) {
                if ( is_callable( [ $order, "set_{$key}" ] ) ) {
                    $order->{"set_{$key}"}( $parent_order->{"get_{$key}"}() );
                }
            }

            // save other meta data
            $order->save(); // need to save order data before passing it to a hook

            // now insert line items
            $this->create_line_items( $order, $seller_products );

            // do shipping
            $this->create_shipping( $order, $parent_order );

            // do tax
            $this->create_taxes( $order, $parent_order, $seller_products );

            // add coupons if any
            $this->create_coupons( $order, $parent_order, $seller_products );

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

        $seller_shipping_total_taxes = array_map(
            function ( $item ) {
                return $item->get_total_tax();
            },
            $shipping
        );

        foreach ( $parent_order->get_taxes() as $tax ) {
            $item = new \WC_Order_Item_Tax();
            $item->set_props(
                [
                    'rate_id'            => $tax->get_rate_id(),
                    'label'              => $tax->get_label(),
                    'compound'           => $tax->get_compound(),
                    'rate_code'          => \WC_Tax::get_rate_code( $tax->get_rate_id() ),
                    'tax_total'          => $tax_total,
                    'shipping_tax_total' => empty( $seller_shipping_total_taxes ) ? '' : array_sum( $seller_shipping_total_taxes ),
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

        $applied_shipping_methods = [];

        if ( $shipping_methods ) {
            foreach ( $shipping_methods as $method_item_id => $shipping_object ) {
                $shipping_seller_id = (int) wc_get_order_item_meta( $method_item_id, 'seller_id', true );

                if ( $order_seller_id === $shipping_seller_id ) {
                    $applied_shipping_methods[] = $shipping_object;
                }
            }
            $applied_shipping_methods = array_filter( $applied_shipping_methods );
        }

        $applied_shipping_methods[0] = apply_filters_deprecated(
            'dokan_shipping_method',
            [
                $applied_shipping_methods[0] ?? '',
                $order->get_id(),
                $parent_order,
            ],
            '3.7.19',
            'dokan_shipping_methods'
        );

        $shipping_methods = apply_filters( 'dokan_shipping_methods', $applied_shipping_methods, $order->get_id(), $parent_order );

        // bail out if no shipping methods found
        if ( empty( $shipping_methods ) ) {
            dokan_log( sprintf( '#%d - No shipping method found. Aborting.', $order->get_id() ) );

            return;
        }

        $shipping_totals = 0.0;
        foreach ( $shipping_methods as $shipping_method ) {
            if ( ! is_a( $shipping_method, 'WC_Order_Item_Shipping' ) ) {
                continue;
            }
            dokan_log( sprintf( '#%d - Adding shipping item.', $order->get_id() ) );

            $item = new \WC_Order_Item_Shipping();
            $item->set_props(
                [
                    'method_title' => $shipping_method->get_name(),
                    'method_id'    => $shipping_method->get_method_id(),
                    'total'        => $shipping_method->get_total(),
                    'taxes'        => $shipping_method->get_taxes(),
                ]
            );
            $shipping_totals += $shipping_method->get_total();
            $metadata        = $shipping_method->get_meta_data();

            if ( $metadata ) {
                foreach ( $metadata as $meta ) {
                    $item->add_meta_data( $meta->key, $meta->value );
                }
            }
            $order->add_item( $item );
        }
        $order->set_shipping_total( $shipping_totals );
        $order->save();
    }

    /**
     * Create coupons for a sub-order if necessary
     *
     * @param WC_Order $order
     * @param WC_Order $parent_order
     * @param array    $products
     *
     * @return void
     */
    private function create_coupons( $order, $parent_order, $products ) {
        if ( dokan()->is_pro_exists() && property_exists( dokan_pro(), 'vendor_discount' ) ) {
            // remove vendor discount coupon code changes
            remove_filter( 'woocommerce_order_get_items', [ dokan_pro()->vendor_discount->woocommerce_hooks, 'replace_coupon_name' ], 10 );
        }

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
            /**
             * @var WC_Order_Item_Coupon $item
             */
            $coupon = new \WC_Coupon( $item->get_code() );

            if (
                apply_filters( 'dokan_should_copy_coupon_to_sub_order', true, $coupon, $item, $order ) &&
                (
                    array_intersect( $product_ids, $coupon->get_product_ids() ) ||
                    apply_filters( 'dokan_is_order_have_admin_coupon', false, $coupon, [ $seller_id ], $product_ids )
                )
            ) {
                $new_item = new WC_Order_Item_Coupon();
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
     * @since 3.8.0 added $force_create parameter
     *
     * @param bool $force_create if this parameter is true, if suborder is already created, they'd be deleted first
     *
     * @param int  $parent_order_id
     *
     * @return void
     */
    public function maybe_split_orders( $parent_order_id, $force_create = false ) {
        if ( is_a( $parent_order_id, 'WC_Order' ) ) {
            $parent_order    = $parent_order_id;
            $parent_order_id = $parent_order->get_id();
        } else {
            $parent_order = $this->get( $parent_order_id );
        }

        if ( ! $parent_order ) {
            //dokan_log( sprintf( 'Invalid Order ID #%d found. Skipping from here.', $parent_order_id ) );
            return;
        }

        // return if order already has been processed by checking if a vendor id has been assigned to it
        if ( (int) $parent_order->get_meta( '_dokan_vendor_id' ) > 0 ) {
            return;
        }

        //dokan_log( sprintf( 'New Order #%d created. Init sub order.', $parent_order_id ) );

        if ( $force_create || wc_string_to_bool( $parent_order->get_meta( 'has_sub_order' ) ) === true ) {
            $child_orders = $this->get_child_orders( $parent_order->get_id() );

            foreach ( $child_orders as $child_order ) {
                $child_order->delete( true );
            }
        }

        $vendors = dokan_get_sellers_by( $parent_order_id );
        if ( empty( $vendors ) ) {
            // we didn't find any vendor, so we can't create sub-order
            //dokan_log( 'No vendor found, skipping sub order.' );
            return;
        }

        // return if we've only ONE seller
        if ( count( $vendors ) === 1 ) {
            //dokan_log( '1 vendor only, skipping sub order.' );

            $temp      = array_keys( $vendors );
            $seller_id = reset( $temp );

            do_action( 'dokan_create_parent_order', $parent_order, $seller_id );

            $parent_order->update_meta_data( '_dokan_vendor_id', $seller_id );
            $parent_order->save();

            // if the request is made from rest api then insert the order data to the sync table
            if ( defined( 'REST_REQUEST' ) ) {
                do_action( 'dokan_checkout_update_order_meta', $parent_order_id, $seller_id );
            }

            return;
        }

        // flag it as it has a suborder
        $parent_order->update_meta_data( 'has_sub_order', true );
        $parent_order->save();

        //dokan_log( sprintf( 'Got %s vendors, starting sub order.', count( $vendors ) ) );

        // seems like we've got multiple sellers
        foreach ( $vendors as $seller_id => $seller_products ) {
            $this->create_sub_order( $parent_order, $seller_id, $seller_products );
        }

        //dokan_log( sprintf( 'Completed sub order for #%d.', $parent_order_id ) );
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
}

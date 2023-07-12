<?php
namespace WeDevs\Dokan\ReverseWithdrawal;

use WeDevs\Dokan\Cache;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Database Manager Class
 *
 * @since 3.5.1
 *
 * @class Manager
 *
 * @package WeDevs\Dokan\ReverseWithdrawal
 */
class Manager {

    /**
     * Table name for dokan_reverse_withdrawal table
     *
     * @var string
     *
     * @since 3.5.1
     */
    private $table;

    /**
     * Manager constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        global $wpdb;
        $this->table = "{$wpdb->prefix}dokan_reverse_withdrawal";
    }

    /**
     * This method will return data from dokan_reverse_withdrawal table
     *
     * @since 3.5.1
     *
     * @param array $args
     *
     * @return array|int|WP_Error
     */
    public function all( $args = [] ) {
        $default = [
            'id'            => [],
            'vendor_id'     => [],      // array of integers
            'trn_id'        => [],      // array of integers
            'trn_type'      => [],      // array of strings, possible values are:
            'trn_date'      => [
                'from' => '',
                'to'   => '',
            ],
            'orderby'       => 'added',
            'order'         => 'DESC',
            'return'        => 'balance',   // possible values are vendor_transaction, vendor_transaction_count, balance, balance_count
            'per_page'      => 20,
            'page'          => 1,
        ];

        $args = wp_parse_args( $args, $default );

        global $wpdb;

        $fields      = '';
        $join        = '';
        $where       = '';
        $groupby     = '';
        $orderby     = '';
        $limits      = '';
        $query_args  = [ 1, 1 ];

        // determine which fields to return
        if ( in_array( $args['return'], [ 'vendor_transaction' ], true ) ) {
            $fields = 'trn.*';
        } elseif ( in_array( $args['return'], [ 'count' ], true ) ) {
            $fields = 'COUNT(trn.id) AS count';
        } elseif ( in_array( $args['return'], [ 'balance_count', 'vendor_transaction_count' ], true ) ) {
            $fields = 'COUNT(trn.id) AS total_transactions, SUM(trn.debit) AS debit, SUM(trn.credit) AS credit';
            $fields .= 'balance_count' === $args['return'] ? ', COUNT( distinct vendor_id) AS total_vendors' : '';
        } elseif ( 'balance' === $args['return'] ) {
            $fields = 'trn.vendor_id, SUM(trn.debit) AS debit, SUM(trn.credit) AS credit';
            $fields .= ", (SELECT MAX(trn2.trn_date) AS last_transaction_date FROM {$this->table} As trn2 WHERE trn.vendor_id = trn2.vendor_id AND trn2.trn_type='vendor_payment') AS last_payment_date";
            $fields .= ', u_meta.meta_value as store_name';

            // join user meta table
            $join .= " LEFT JOIN {$wpdb->usermeta} AS u_meta ON trn.vendor_id = u_meta.user_id";
            // include dokan_store_name under where param
            $where .= ' AND u_meta.meta_key=%s';
            $query_args[] = 'dokan_store_name';

            $groupby = 'GROUP BY trn.vendor_id';

            // reset trn_date from
            if ( isset( $args['trn_date']['from'] ) ) {
                $args['trn_date']['from'] = '';
            }
        }

        // check if id filter is applied
        if ( ! $this->is_empty( $args['id'] ) ) {
            $transaction_ids = implode( "','", array_map( 'absint', (array) $args['id'] ) );
            $where .= " AND trn.id IN ('$transaction_ids')";
        }

        // check if vendor id filter is applied
        if ( ! $this->is_empty( $args['trn_id'] ) ) {
            $trn_id = implode( "','", array_map( 'absint', (array) $args['trn_id'] ) );
            $where .= " AND trn.trn_id IN ('$trn_id')";
        }

        // check if vendor id filter is applied
        if ( ! $this->is_empty( $args['vendor_id'] ) ) {
            $vendor_id = implode( "','", array_map( 'absint', (array) $args['vendor_id'] ) );
            $where .= " AND trn.vendor_id IN ('$vendor_id')";
        }

        // transaction type validation
        if ( ! empty( $args['trn_type'] ) && array_key_exists( $args['trn_type'], Helper::get_transaction_types() ) ) {
            $where .= ' AND trn.trn_type = %s';
            $query_args[] = $args['trn_type'];
        }

        // check if trn_date filter is applied
        // convert into timestamp
        $now = dokan_current_datetime();
        if ( ! empty( $args['trn_date']['from'] ) ) {
            // fix date format
            if ( is_numeric( $args['trn_date']['from'] ) ) {
                $now = $now->setTimestamp( $args['trn_date']['from'] );
                $args['trn_date']['from'] = $now ? $now->getTimestamp() : 0;
            } else {
                $now = $now->modify( $args['trn_date']['from'] );
                $args['trn_date']['from'] = $now ? $now->setTime( 0, 0, 0 )->getTimestamp() : 0;
            }
        }

        // convert into timestamp
        if ( ! empty( $args['trn_date']['to'] ) ) {
            if ( is_numeric( $args['trn_date']['to'] ) ) {
                $now = $now->setTimestamp( $args['trn_date']['to'] );
                $args['trn_date']['to'] = $now ? $now->getTimestamp() : 0;
            } else {
                $now = $now->modify( $args['trn_date']['to'] );
                $args['trn_date']['to'] = $now ? $now->setTime( 23, 59, 59 )->getTimestamp() : 0;
            }
        }

        // check if min and max both values are set, search  in between
        if ( ! empty( $args['trn_date']['from'] ) && ! empty( $args['trn_date']['to'] ) ) {
            // fix min max value
            if ( $args['trn_date']['from'] > $args['trn_date']['to'] ) {
                $temp = $args['trn_date']['from'];
                $args['trn_date']['from'] = $args['trn_date']['to'];
                $args['trn_date']['to'] = $temp;
            }

            $where        .= ' AND trn.trn_date BETWEEN %d AND %d';
            $query_args[] = $args['trn_date']['from'];
            $query_args[] = $args['trn_date']['to'];
        } elseif ( ! empty( $args['trn_date']['to'] ) ) {
            $where        .= ' AND trn.trn_date <= %d';
            $query_args[] = $args['trn_date']['to'];
        } elseif ( ! empty( $args['trn_date']['from'] ) ) {
            $where        .= ' AND trn.trn_date >= %d';
            $query_args[] = $args['trn_date']['from'];
        }

        // order and order by param
        // supported order by param
        $supported_order_by = [
            'id'        => 'trn.id',
            'trn_date'  => 'trn.trn_date',
            'debit'     => 'trn.debit',
            'credit'    => 'trn.credit',
        ];

        if ( ! empty( $args['orderby'] ) && array_key_exists( $args['orderby'], $supported_order_by ) ) {
            $order   = in_array( strtolower( $args['order'] ), [ 'asc', 'desc' ], true ) ? strtoupper( $args['order'] ) : 'ASC';
            $orderby = "ORDER BY {$supported_order_by[ $args['orderby'] ]} {$order}"; //no need for prepare, we've already whitelisted the parameters

            //second order by in case of similar value on first order by field
            if ( 'id' !== $args['orderby'] ) {
                $orderby .= ", trn.id {$order}";
            }
        }

        // pagination param
        if ( ! empty( $args['per_page'] ) && -1 !== intval( $args['per_page'] ) && ! in_array( $args['return'], [ 'count', 'balance_count', 'vendor_transaction_count' ], true ) ) {
            $limit  = absint( $args['per_page'] );
            $page   = absint( $args['page'] );
            $page   = $page > 0 ? $page : 1;
            $offset = ( $page - 1 ) * $limit;

            $limits       = 'LIMIT %d, %d';
            $query_args[] = $offset;
            $query_args[] = $limit;
        }

        $cache_group = 'reverse_withdrawal';
        $cache_key   = 'get_transactions_' . md5( wp_json_encode( $args ) );
        if ( is_numeric( $args['vendor_id'] ) ) {
            $cache_group = "reverse_withdrawal_{$args['vendor_id']}";
        } elseif ( ! $this->is_empty( $args['vendor_id'] ) && 1 === count( $args['vendor_id'] ) ) {
            $cache_group = "reverse_withdrawal_{$args['vendor_id'][0]}";
        }

        $data = Cache::get( $cache_key, $cache_group );

        if ( in_array( $args['return'], [ 'vendor_transaction' ], true ) && false === $data ) {
            // get all transactions of vendor(s)
            // @codingStandardsIgnoreStart
            $data = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT $fields FROM {$this->table} AS trn $join WHERE %d=%d $where $orderby $limits",
                    $query_args
                ),
                ARRAY_A
            );
            // @codingStandardsIgnoreEnd

            // check for query error
            if ( ! empty( $wpdb->last_error ) ) {
                return new WP_Error( 'db_query_error', $wpdb->last_error, $wpdb->last_query );
            }

            // if per_page is 1, send single item
            if ( 1 === $args['per_page'] ) {
                $data = is_array( $data ) && ! empty( $data ) ? $data[0] : [];
            }
            // store on cache
            Cache::set( $cache_key, $data, $cache_group );
        } elseif ( 'count' === $args['return'] && false === $data ) {
            // get count of entries
            // @codingStandardsIgnoreStart
            $data = (int) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT $fields FROM {$this->table} AS trn $join WHERE %d=%d $where",
                    $query_args
                )
            );
            // @codingStandardsIgnoreEnd
            Cache::set( $cache_key, $data, $cache_group );
        } elseif ( in_array( $args['return'], [ 'balance_count', 'vendor_transaction_count' ], true ) && false === $data ) {
            // @codingStandardsIgnoreStart
            $row = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT $fields FROM {$this->table} AS trn $join WHERE %d=%d $where",
                    $query_args
                )
            );

            $refund_amount = (float) $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT SUM(trn.credit) FROM {$this->table} AS trn $join WHERE %d=%d $where AND trn.trn_type='order_refund'",
                    $query_args
                )
            );

            // check for query error
            if ( ! empty( $wpdb->last_error ) ) {
                return new WP_Error( 'db_query_error', $wpdb->last_error, $wpdb->last_query );
            }

            $data = [
                'total_transactions' => (int) $row->total_transactions,
                'debit'              => (float) $row->debit,
                'credit'             => (float) $row->credit - $refund_amount,
            ];

            if ( 'balance_count' === $args['return'] ) {
                $data['total_vendors'] = (int) $row->total_vendors;
                $data['balance']       = (float) $row->debit - (float) $row->credit;
            }

            // @codingStandardsIgnoreEnd
            Cache::set( $cache_key, $data, $cache_group );
        } elseif ( 'balance' === $args['return'] && false === $data ) {
            // @codingStandardsIgnoreStart
            $data = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT $fields FROM {$this->table} AS trn $join WHERE %d=%d $where $groupby $orderby $limits",
                    $query_args
                ),
                ARRAY_A
            );
            // @codingStandardsIgnoreEnd

            // check for query error
            if ( ! empty( $wpdb->last_error ) ) {
                return new WP_Error( 'db_query_error', $wpdb->last_error, $wpdb->last_query );
            }

            // if per_page is 1, send single item
            if ( 1 === (int) $args['per_page'] ) {
                $data = is_array( $data ) && ! empty( $data ) ? $data[0] : [];
            }
            // store on cache
            Cache::set( $cache_key, $data, $cache_group );
        }

        return $data;
    }

    /**
     * This method will get all/selected vendors balance
     *
     * @since 3.5.1
     *
     * @param array $args
     *
     * @return array|WP_Error
     */
    public function get_stores_balance( $args = [] ) {
        $query_params = [
            'vendor_id' => isset( $args['vendor_id'] ) ? $args['vendor_id'] : 0,
            'trn_date'  => isset( $args['trn_date'] ) ? $args['trn_date'] : '',
            'per_page'  => isset( $args['per_page'] ) ? $args['per_page'] : -1,
            'page'      => isset( $args['page'] ) ? $args['page'] : 1,
            'orderby'   => isset( $args['orderby'] ) ? $args['orderby'] : 'id',
            'order'     => isset( $args['order'] ) ? $args['order'] : 'DESC',
        ];

        $items = [];
        // get item count
        $query_params['return'] = 'balance_count';
        $count = $this->all( $query_params );
        // check for errors
        if ( is_wp_error( $count ) ) {
            return $count;
        }

        // only run query if count value is greater than 0
        if ( $count['total_transactions'] > 0 ) {
            $query_params['return'] = 'balance';
            $items = $this->all( $query_params );
            // check for errors
            if ( is_wp_error( $items ) ) {
                return $items;
            }
        }

        return [
            'count' => $count,
            'items' => $items,
        ];
    }

    /**
     * This method will return current balance of a vendor
     *
     * @since 3.5.1
     *
     * @param array $args
     *
     * @return float|WP_Error
     */
    public function get_store_balance( $args = [] ) {
        $query_params = [
            'vendor_id' => isset( $args['vendor_id'] ) ? $args['vendor_id'] : 0,
            'trn_date'  => isset( $args['trn_date'] ) && ! $this->is_empty( $args['trn_date'] ) ? $args['trn_date'] : '',
            'per_page'  => 1,
            'return'    => 'balance',
        ];

        if ( empty( $query_params['vendor_id'] ) || ! is_numeric( $query_params['vendor_id'] ) ) {
            return new WP_Error( 'invalid_vendor_id', esc_html__( 'No vendor id provided', 'dokan-lite' ) );
        }

        $balance = $this->all( $query_params );
        if ( is_wp_error( $balance ) ) {
            return $balance;
        }

        return isset( $balance['debit'], $balance['credit'] ) ? floatval( $balance['debit'] - $balance['credit'] ) : 0;
    }

    /**
     * This method will get all the transactions for a vendor
     *
     * @since 3.5.1
     *
     * @param array $args
     *
     * @return array|WP_Error
     */
    public function get_store_transactions( $args = [] ) {
        $default_transactions_date = [
            'from' => dokan_current_datetime()->modify( '-1 month' )->format( 'Y-m-d' ),
            'to'   => dokan_current_datetime()->format( 'Y-m-d' ),
        ];

        $query_params = [
            'vendor_id' => isset( $args['vendor_id'] ) ? $args['vendor_id'] : 0,
            'trn_date'  => isset( $args['trn_date'] ) && ! $this->is_empty( $args['trn_date'] ) ? $args['trn_date'] : $default_transactions_date,
            'per_page'  => isset( $args['per_page'] ) ? $args['per_page'] : -1,
            'page'      => isset( $args['page'] ) ? $args['page'] : 1,
            'orderby'   => 'id',
            'order'     => 'ASC',
        ];

        if ( empty( $query_params['vendor_id'] ) || ! is_numeric( $query_params['vendor_id'] ) ) {
            return new WP_Error( 'invalid_vendor_id', esc_html__( 'No vendor id provided', 'dokan-lite' ) );
        }

        $return = [
            'balance' => [],
            'count'   => [],
            'items'   => [],
        ];

        // get balance date
        if ( ! empty( $query_params['trn_date']['from'] ) ) {
            $one_day_before = dokan_current_datetime()->modify( $query_params['trn_date']['from'] )->setTime( 0, 0, 0 )->getTimestamp();
        } else {
            // get balance for 1 day before start date
            $one_day_before = dokan_current_datetime()->setTime( 0, 0, 0 )->getTimestamp();
        }

        $balance_args = [
            'vendor_id' => $query_params['vendor_id'],
            'trn_date'  => [
                'to' => $one_day_before,
            ],
            'return'   => 'balance',
            'per_page' => 1,
        ];
        // we are getting opening balance here
        $balance = $this->all( $balance_args );

        if ( is_wp_error( $balance ) ) {
            return $balance;
        }

        // prepare formatted balance
        $balance['trn_type']  = 'opening_balance';
        $balance['trn_date']  = $one_day_before;
        $balance['vendor_id'] = isset( $balance['vendor_id'] ) ? absint( $balance['vendor_id'] ) : 0;

        // set balance
        $return['balance'] = $balance;

        // get item count
        $query_params['return'] = 'vendor_transaction_count';
        $count = $this->all( $query_params );
        // check for errors
        if ( is_wp_error( $count ) ) {
            return $count;
        }

        $return['count'] = $count;
        // only run query if count value is greater than 0
        if ( $count['total_transactions'] === 0 ) {
            return $return;
        }

        $query_params['return'] = 'vendor_transaction';
        $items = $this->all( $query_params );
        // check for errors
        if ( is_wp_error( $items ) ) {
            return $items;
        }

        $return['items'] = $items;

        return $return;
    }

    /**
     * This method will return a single item from reverse withdrawal table
     *
     * @since 3.5.1
     *
     * @param int $id
     *
     * @return WP_Error|array
     */
    public function get( $id = 0 ) {
        $args = [
            'id'       => $id,
            'per_page' => 1,
            'return'   => 'all',
        ];

        $data = $this->all( $args );

        if ( empty( $data ) ) {
            return new WP_Error( 'get_reverse_withdrawal_error', esc_html__( 'No reverse withdrawal data found with given id.', 'dokan-lite' ) );
        }

        return $data;
    }

    /**
     * Insert a new item into database.
     *
     * @since 3.5.1
     *
     * @param array $args
     *
     * @return int|WP_Error
     */
    public function insert( $args = [] ) {
        global $wpdb;

        $default = [
            'trn_id'    => 0,
            'trn_type'  => 'order_commission',
            'vendor_id' => 0,
            'note'      => '',
            'debit'     => 0,
            'credit'    => 0,
            'trn_date'  => time(),
        ];

        $args = wp_parse_args( $args, $default );

        // validate required fields
        if ( empty( $args['trn_id'] ) ) {
            return new WP_Error( 'insert_rw_invalid_transaction_id', esc_html__( 'Transaction id is required.', 'dokan-lite' ) );
        }

        if ( empty( $args['trn_type'] ) || ! array_key_exists( $args['trn_type'], Helper::get_transaction_types() ) ) {
            return new WP_Error( 'insert_rw_invalid_transaction_type', esc_html__( 'Invalid transaction type is provide. Please check your input.', 'dokan-lite' ) );
        }

        if ( empty( $args['vendor_id'] ) ) {
            return new WP_Error( 'insert_rw_invalid_vendor_id', esc_html__( 'Invalid vendor id provide. Please provide a valid vendor id.', 'dokan-lite' ) );
        }

        // just to make sure $args doesn't contain any unnecessary elements
        $data = [
            'trn_id'    => $args['trn_id'],
            'trn_type'  => $args['trn_type'],
            'vendor_id' => $args['vendor_id'],
            'note'      => $args['note'],
            'debit'     => $args['debit'],
            'credit'    => $args['credit'],
            'trn_date'  => $args['trn_date'],
        ];

        $format = [
            '%d',
            '%s',
            '%d',
            '%s',
            '%f',
            '%f',
            '%d',
        ];

        // add data into database
        $inserted  = $wpdb->insert( $this->get_table(), $data, $format );
        $insert_id = $wpdb->insert_id;

        if ( false === $inserted ) {
            dokan_log( '[Dokan Reverse Withdrawal] Error while inserting data: <strong>' . $wpdb->last_error . '</strong>, Data: ' . print_r( $data, true ) );
            return new WP_Error( 'insert_reverse_withdrawal_error', esc_html__( 'Something went wrong while inserting reverse withdrawal data. Please contact site admin.', 'dokan-lite' ) );
        }

        do_action( 'dokan_reverse_withdrawal_created', $data, $insert_id, $args );

        return $insert_id;
    }

    /**
     * Check if reverse withdrawal already inserted for an order
     *
     * @since 3.5.1
     *
     * @param int $order_id
     *
     * @return bool
     */
    public function is_reverse_withdrawal_added( $order_id ) {
        $args = [
            'trn_id'   => $order_id,
            'trn_type' => 'order_commission',
            'return'   => 'count',
        ];

        $count = $this->all( $args );
        return $count > 0;
    }

    /**
     * Check if reverse withdrawal payment already inserted for an order
     *
     * @since 3.5.1
     *
     * @param int $order_id
     *
     * @return bool
     */
    public function is_payment_inserted( $order_id ) {
        $args = [
            'trn_id'   => $order_id,
            'trn_type' => 'vendor_payment',
            'return'   => 'count',
        ];

        $count = $this->all( $args );
        return $count > 0;
    }

    /**
     * This method will return all refunded amount for a specific order
     *
     * @since 3.5.1
     *
     * @param int $order_id
     *
     * @return float
     */
    public function get_total_refunded_amount_by_order( $order_id ) {
        global $wpdb;
        //@codingStandardsIgnoreStart
        return (float) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT SUM(credit) FROM {$this->get_table()} WHERE trn_id = %d AND trn_type = %s",
                $order_id, 'order_refund'
            )
        );
        //@codingStandardsIgnoreEnd
    }

    /**
     * This method will return all the payments made by a vendor in a date range
     *
     * @since 3.5.1
     *
     * @param array $args
     *
     * @return WP_Error|float
     */
    public function get_payments_by_vendor( $args = [] ) {
        $default = [
            'vendor_id' => dokan_get_current_user_id(),
            'trn_date'  => [
                'from' => dokan_current_datetime()->modify( 'first day of this month' )->format( 'Y-m-d' ),
                'to'   => dokan_current_datetime()->modify( 'last day of this month' )->format( 'Y-m-d' ),
            ],
        ];

        $args = wp_parse_args( $args, $default );

        // validate vendor id
        if ( empty( $args['vendor_id'] ) ) {
            return new WP_Error( 'get_payments_by_vendor_error', esc_html__( 'Invalid vendor id provide. Please provide a valid vendor id.', 'dokan-lite' ) );
        }

        $params = [
            'vendor_id' => $args['vendor_id'],
            'trn_date'  => $args['trn_date'],
            'trn_type'  => 'vendor_payment',
            'return'    => 'vendor_transaction_count',
        ];

        $result = $this->all( $params );

        if ( is_wp_error( $result ) ) {
            return $result;
        }

        return $result['credit'];
    }

    /**
     * This method will return commission amount for a specific order
     *
     * @since 3.5.1
     *
     * @param int $order_id
     *
     * @return float
     */
    public function get_commission_amount_by_order( $order_id ) {
        global $wpdb;
        //@codingStandardsIgnoreStart
        return (float) $wpdb->get_var(
            $wpdb->prepare(
                "SELECT debit FROM {$this->get_table()} WHERE trn_id = %d AND trn_type = %s",
                $order_id, 'order_commission'
            )
        );
        //@codingStandardsIgnoreEnd
    }

    /**
     * This method will return unique stores under reverse withdrawal table
     *
     * @param array $args
     *
     * @since 3.5.1
     *
     * @return array|WP_Error
     */
    public function get_stores( $args = [] ) {
        $default = [
            'per_page' => 20,
            'page'     => 1,
        ];

        $args = wp_parse_args( $args, $default );

        global $wpdb;

        $fields      = ' DISTINCT trn.vendor_id as id, u_meta.meta_value as name ';
        $join        = " LEFT JOIN {$wpdb->usermeta} AS u_meta ON trn.vendor_id = u_meta.user_id";
        $where       = ' AND u_meta.meta_key=%s';
        $groupby     = '';
        $orderby     = ' ORDER BY name ASC';
        $limits      = '';
        $query_args  = [ 1, 1, 'dokan_store_name' ];

        // prepare search parameter
        if ( ! empty( $args['search'] ) ) {
            $like         = '%' . $wpdb->esc_like( $args['search'] ) . '%';
            $where        .= ' AND u_meta.meta_value like %s';
            $query_args[] = $like;
        }

        if ( $args['per_page'] ) {
            $limit  = absint( $args['per_page'] );
            $page   = absint( $args['page'] );
            $page   = $page ? $page : 1;
            $offset = ( $page - 1 ) * $limit;

            $limits       = 'LIMIT %d, %d';
            $query_args[] = $offset;
            $query_args[] = $limit;
        }

        // @codingStandardsIgnoreStart
        $data = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT $fields FROM {$this->table} AS trn $join WHERE %d=%d $where $groupby $orderby $limits", //phpcs:ignore
                $query_args
            ),
            ARRAY_A
        );
        // @codingStandardsIgnoreEnd
        // check for db error
        if ( ! empty( $wpdb->last_error ) ) {
            dokan_log( '[Dokan Reverse Withdrawal] Error while fetching data: <strong>' . $wpdb->last_error . '</strong>' );
            return new WP_Error( 'db_query_error', $wpdb->last_error, $wpdb->last_query );
        }

        return null === $data ? [] : $data;
    }

    /**
     * Get dokan_reverse_withdrawal table with prefix
     *
     * @since 3.5.1
     *
     * @return string
     */
    public function get_table() {
        return $this->table;
    }

    /**
     * This will check if given var is empty or not.
     *
     * @since 3.5.1
     *
     * @param mixed $var
     *
     * @return bool
     */
    protected function is_empty( $var ) {
        if ( empty( $var ) ) {
            return true;
        }

        if ( isset( $var[0] ) && intval( $var[0] ) === 0 ) {
            return true;
        }

        return false;
    }
}

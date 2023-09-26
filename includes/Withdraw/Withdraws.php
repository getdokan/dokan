<?php

namespace WeDevs\Dokan\Withdraw;

use WeDevs\Dokan\Cache;

class Withdraws {

    /**
     * Query arguments
     *
     * @var array
     */
    protected $args = [];

    /**
     * Withdraw results
     *
     * @var array
     */
    protected $withdraws = [];

    /**
     * Total withdraw found
     *
     * @var int
     */
    protected $total = 0;

    /**
     * Maximum number of pages
     *
     * @var null|int
     */
    protected $max_num_pages = null;

    /**
     * Status counts.
     *
     * @since 3.8.3
     *
     * @var array $status
     */
    protected $status = [];

    /**
     * Class constructor
     *
     * @since 3.0.0
     *
     * @param array $args
     *
     * @return void
     */
    public function __construct( $args = [] ) {
        $default_args = [
            'limit'         => 10,
            'page'          => 1,
            'no_found_rows' => false,
            'return'        => 'all', // Possible values are: count, all
        ];

        $this->args = wp_parse_args( $args, $default_args );

        $this->query();
    }

    /**
     * Get withdraws
     *
     * @since 3.0.0
     *
     * @return array
     */
    public function get_withdraws() {
        return $this->withdraws;
    }

    /**
     * Query withdraws
     *
     * @since 3.0.0
     *
     * @return \WeDevs\Dokan\Withdraw\Withdraws
     */
    public function query() {
        global $wpdb;

        $args = $this->args;

        // @note: empty variables may use in future
        $fields     = '*';
        $join       = '';
        $where      = '';
        $groupby    = '';
        $orderby    = '';
        $limits     = '';
        $query_args = [ 1, 1 ];

        // Check if retrun type is counts.
        if ( 'count' === $args['return'] ) {
            $fields  = " CASE `status` WHEN 0 THEN 'pending' WHEN 1 THEN 'completed' WHEN 2 THEN 'cancelled' END AS `status`, COUNT(id) AS count";
            $groupby = ' GROUP BY status';
        }

        if ( isset( $args['ids'] ) && is_array( $args['ids'] ) ) {
            $ids = array_map( 'absint', $args['ids'] );
            $ids = array_filter( $ids );

            $placeholders = [];
            foreach ( $ids as $id ) {
                $placeholders[] = '%d';
                $query_args[]   = $id;
            }

            $where .= ' and id in ( ' . implode( ',', $placeholders ) . ' )';
        }

        if ( isset( $args['user_id'] ) ) {
            $where        .= ' and user_id = %d';
            $query_args[] = $args['user_id'];
        }

        if ( isset( $args['amount'] ) ) {
            $where        .= ' and amount = %s';
            $query_args[] = $args['amount'];
        }

        if ( isset( $args['start_date'] ) && isset( $args['end_date'] ) ) {
            $where        .= ' and date(date) between %s and %s';
            $query_args[] = current_datetime()->modify( $args['start_date'] )->format( 'Y-m-d' );
            $query_args[] = current_datetime()->modify( $args['end_date'] )->format( 'Y-m-d' );
        }

        if ( 'count' !== $args['return'] && isset( $args['status'] ) ) {
            $where        .= ' and status = %d';
            $query_args[] = $args['status'];
        }

        if ( isset( $args['method'] ) ) {
            $where        .= ' and method = %s';
            $query_args[] = $args['method'];
        }

        if ( isset( $args['ip'] ) ) {
            $where        .= ' and ip = %s';
            $query_args[] = $args['ip'];
        }

        if ( 'count' !== $args['return'] && ! empty( $args['limit'] ) ) {
            $limit  = absint( $args['limit'] );
            $page   = absint( $args['page'] );
            $page   = $page ? $page : 1;
            $offset = ( $page - 1 ) * $limit;

            $limits       = 'LIMIT %d, %d';
            $query_args[] = $offset;
            $query_args[] = $limit;
        }

        $found_rows = '';
        if ( 'count' !== $args['return'] && ! $args['no_found_rows'] && ! empty( $limits ) ) {
            $found_rows = 'SQL_CALC_FOUND_ROWS';
        }

        $cache_group = 'withdraws';
        $cache_key   = 'withdraw_requests_' . md5( wp_json_encode( $args ) );
        $withdraws   = Cache::get( $cache_key, $cache_group );

        if ( false === $withdraws ) {
            // @codingStandardsIgnoreStart
            $withdraws = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT $found_rows $fields FROM {$wpdb->dokan_withdraw} $join WHERE %d=%d $where $groupby $orderby $limits",
                    ...$query_args
                ), ARRAY_A
            );
            // @codingStandardsIgnoreEnd
        }

        if ( 'count' === $args['return'] ) {
            // Reset default status values.
            $this->status = [
                'pending'   => 0,
                'completed' => 0,
                'cancelled' => 0,
            ];
            foreach ( $withdraws as $row ) {
                $this->status[ $row['status'] ] = $row['count'];
            }
        } else {
            $this->withdraws = [];
            foreach ( $withdraws as $withdraw ) {
                $this->withdraws[] = new Withdraw( $withdraw );
            }

            $this->total = absint( $wpdb->get_var( 'SELECT FOUND_ROWS()' ) );
        }

        return $this;
    }

    /**
     * Get withdraw status count.
     *
     * @since 3.8.3
     *
     * @return array
     */
    public function get_status_count() {
        return $this->status;
    }

    /**
     * Get total number of withdraws
     *
     * @since 3.0.0
     *
     * @return int
     */
    public function get_total() {
        return $this->total;
    }

    /**
     * Get maximum number of pages
     *
     * @since 3.0.0
     *
     * @return int
     */
    public function get_maximum_num_pages() {
        $total = $this->get_total();

        if ( ! $this->max_num_pages && $total && ! empty( $this->args['limit'] ) ) {
            $limit               = absint( $this->args['limit'] );
            $this->max_num_pages = ceil( $total / $limit );
        }

        return $this->max_num_pages;
    }
}

<?php

namespace WeDevs\Dokan\Withdraw;

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
     * @var null|int
     */
    protected $total = null;

    /**
     * Maximum number of pages
     *
     * @var null|int
     */
    protected $max_num_pages = null;

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
        $defaults = [
            'limit'         => 10,
            'page'          => 1,
            'no_found_rows' => false,
        ];

        $this->args = wp_parse_args( $args, $defaults );
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

        if ( isset( $args['date'] ) ) {
            $where        .= ' and date = %s';
            $query_args[] = $args['date'];
        }

        if ( isset( $args['status'] ) ) {
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

        if ( ! empty( $args['limit'] ) ) {
            $limit  = absint( $args['limit'] );
            $page   = absint( $args['page'] );
            $page   = $page ? $page : 1;
            $offset = ( $page - 1 ) * $limit;

            $limits       = 'LIMIT %d, %d';
            $query_args[] = $offset;
            $query_args[] = $limit;
        }

        $found_rows = '';
        if ( ! $args['no_found_rows'] && ! empty( $limits ) ) {
            $found_rows = 'SQL_CALC_FOUND_ROWS';
        }

        // @codingStandardsIgnoreStart
        $withdraws = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT $found_rows $fields FROM {$wpdb->dokan_withdraw} $join WHERE %d=%d $where $groupby $orderby $limits",
                ...$query_args
            ), ARRAY_A
        );
        // @codingStandardsIgnoreEnd

        if ( ! empty( $withdraws ) ) {
            foreach ( $withdraws as $withdraw ) {
                $this->withdraws[] = new Withdraw( $withdraw );
            }
        }

        return $this;
    }

    /**
     * Get total number of withdraws
     *
     * @since 3.0.0
     *
     * @return int
     */
    public function get_total() {
        global $wpdb;

        if ( ! isset( $this->total ) ) {
            $this->total = absint( $wpdb->get_var( 'SELECT FOUND_ROWS()' ) );
        }

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

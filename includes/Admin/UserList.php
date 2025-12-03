<?php

namespace WeDevs\Dokan\Admin;

/**
 * User List related tasks for wp-admin
 *
 * Adds Pending Vendor tab and Approve Vendors bulk action
 *
 * @package Dokan
 * @since DOKAN_SINCE
 */
class UserList {

    /**
     * Constructor
     */
    public function __construct() {
        // Add Pending Vendor tab.
        add_filter( 'views_users', array( $this, 'add_pending_vendor_view' ) );
        add_filter( 'pre_get_users', array( $this, 'filter_pending_vendors' ) );
        add_filter( 'bulk_actions-users', array( $this, 'add_bulk_actions' ) );
        add_filter( 'handle_bulk_actions-users', array( $this, 'handle_bulk_actions' ), 10, 3 );

        // Bulk action notices.
        add_action( 'admin_notices', array( $this, 'show_bulk_action_notices' ) );
    }

    /**
     * Add Pending Vendor view to users list
     *
     * @param array $views Existing views
     *
     * @return array Modified views
     */
    public function add_pending_vendor_view( $views ) {
        $pending_count = $this->get_pending_vendor_count();

        $class = '';
        if ( isset( $_GET['pending_vendors'] ) && $_GET['pending_vendors'] === '1' ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $class = 'current';
        }

        $views['pending_vendors'] = sprintf(
            '<a href="%s" class="%s">%s <span class="count">(%s)</span></a>',
            esc_url( add_query_arg( 'pending_vendors', '1', admin_url( 'users.php' ) ) ),
            esc_attr( $class ),
            esc_html__( 'Pending Vendors', 'dokan-lite' ),
            esc_html( $pending_count )
        );

        return $views;
    }

    /**
     * Get pending vendor count
     *
     * @return int
     */
    private function get_pending_vendor_count() {
        $args = array(
            'role'        => 'seller',
            'meta_query'  => array( // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_query
                'relation' => 'OR',
                array(
                    'key'     => 'dokan_enable_selling',
                    'value'   => 'no',
                    'compare' => '=',
                ),
                array(
                    'key'     => 'dokan_enable_selling',
                    'compare' => 'NOT EXISTS',
                ),
            ),
            'count_total' => true,
            'fields'      => 'ID',
        );

        $user_query = new \WP_User_Query( $args );

        return $user_query->get_total();
    }

    /**
     * Filter users to show only pending vendors
     *
     * @param \WP_User_Query $query User query object
     *
     * @return \WP_User_Query
     */
    public function filter_pending_vendors( $query ) {
        global $pagenow;

        if ( ! is_admin() || $pagenow !== 'users.php' ) {
            return $query;
        }

        if ( ! isset( $_GET['pending_vendors'] ) || $_GET['pending_vendors'] !== '1' ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            return $query;
        }

        $query->set( 'role', 'seller' );

        $meta_query = $query->get( 'meta_query' );
        if ( ! is_array( $meta_query ) ) {
            $meta_query = array();
        }

        // Include vendors with dokan_enable_selling = 'no' OR vendors without the meta key at all
        $meta_query[] = array(
            'relation' => 'OR',
            array(
                'key'     => 'dokan_enable_selling',
                'value'   => 'no',
                'compare' => '=',
            ),
            array(
                'key'     => 'dokan_enable_selling',
                'compare' => 'NOT EXISTS',
            ),
        );

        $query->set( 'meta_query', $meta_query );

        return $query;
    }

    /**
     * Add bulk actions to users list
     *
     * @param array $actions Existing bulk actions
     *
     * @return array Modified bulk actions
     */
    public function add_bulk_actions( $actions ) {
        if ( isset( $_GET['pending_vendors'] ) && $_GET['pending_vendors'] === '1' ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            $actions['approve_vendors'] = __( 'Approve Vendors', 'dokan-lite' );
        }

        return $actions;
    }

    /**
     * Handle bulk actions
     *
     * @param string $sendback Redirect URL
     * @param string $doaction Action being performed
     * @param array  $user_ids User IDs to process
     *
     * @return string Modified redirect URL
     */
    public function handle_bulk_actions( $sendback, $doaction, $user_ids ) {
        if ( $doaction !== 'approve_vendors' ) {
            return $sendback;
        }

        if ( ! current_user_can( 'manage_woocommerce' ) ) {
            return $sendback;
        }

        $approved_count = 0;

        foreach ( $user_ids as $user_id ) {
            $vendor = dokan()->vendor->get( $user_id );

            if ( ! $vendor || ! $vendor->get_id() ) {
                continue;
            }

            // Check if user is a vendor and is currently disabled
            if ( ! user_can( $user_id, 'dokandar' ) ) {
                continue;
            }

            $selling = get_user_meta( $user_id, 'dokan_enable_selling', true );

            // Approve if selling is 'no' or meta key doesn't exist (empty string)
            if ( $selling === 'no' || $selling === '' ) {
                $vendor->make_active();
                ++$approved_count;
            }
        }

        $sendback = add_query_arg( 'vendors_approved', $approved_count, $sendback );

        return $sendback;
    }

    /**
     * Show admin notices for bulk actions
     *
     * @return void
     */
    public function show_bulk_action_notices() {
        if ( ! isset( $_GET['vendors_approved'] ) ) { // phpcs:ignore WordPress.Security.NonceVerification.Recommended
            return;
        }

        $count = absint( $_GET['vendors_approved'] ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        if ( $count > 0 ) {
            printf(
                '<div class="notice notice-success is-dismissible"><p>%s</p></div>',
                sprintf(
                    /* translators: %d: number of vendors approved */
                    esc_html( _n( '%d vendor approved successfully.', '%d vendors approved successfully.', $count, 'dokan-lite' ) ),
                    esc_html( $count )
                )
            );
        }
    }
}

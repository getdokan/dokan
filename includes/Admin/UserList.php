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
     * Class Constructor.
     */
    public function __construct() {
        // Add Pending Vendor tab.
        add_filter( 'views_users', [ $this, 'add_pending_vendor_view' ] );
        add_filter( 'pre_get_users', [ $this, 'filter_pending_vendors' ] );
        add_filter( 'bulk_actions-users', [ $this, 'add_bulk_actions' ] );
        add_filter( 'handle_bulk_actions-users', [ $this, 'handle_bulk_actions' ], 10, 3 );

        // Bulk action notices.
        add_action( 'admin_notices', [ $this, 'show_bulk_action_notices' ] );
    }

    /**
     * Add Pending Vendor view to user's list.
     *
     * @since DOKAN_SINCE
     *
     * @param array $views Existing views
     *
     * @return array Modified views
     */
    public function add_pending_vendor_view( $views ) {
        $status_count   = dokan_get_seller_status_count();
        $pending_count  = $status_count['inactive'] ?? 0;
        $pending_filter = sanitize_text_field( wp_unslash( $_GET['pending_vendors'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        $views['pending_vendors'] = sprintf(
            /* translators: %1$s: Pending Vendors link, %2$s: Current class, %3$s: Pending Vendors label, %4$s: Pending Vendors count */
            '<a href="%1$s" class="%2$s">%3$s <span class="count">(%4$s)</span></a>',
            esc_url( add_query_arg( 'pending_vendors', '1', admin_url( 'users.php' ) ) ),
            esc_attr( '1' === $pending_filter ? 'current' : '' ),
            esc_html__( 'Pending Vendors', 'dokan-lite' ),
            esc_html( $pending_count )
        );

        return $views;
    }

    /**
     * Filter users to show only pending vendors.
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

        $pending_filter = sanitize_text_field( wp_unslash( $_GET['pending_vendors'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( '1' !== $pending_filter ) {
            return $query;
        }

        $query->set( 'role', 'seller' );

        $meta_query = $query->get( 'meta_query' );
        if ( ! is_array( $meta_query ) ) {
            $meta_query = [];
        }

        // Include vendors with dokan_enable_selling = 'no' OR vendors without the meta key at all
        $meta_query[] = [
            'relation' => 'OR',
            [
                'key'     => 'dokan_enable_selling',
                'value'   => 'no',
                'compare' => '=',
            ],
            [
                'key'     => 'dokan_enable_selling',
                'compare' => 'NOT EXISTS',
            ],
        ];

        $query->set( 'meta_query', $meta_query );

        return $query;
    }

    /**
     * Add bulk actions to the user's list.
     *
     * @since DOKAN_SINCE
     *
     * @param array $actions Existing bulk actions
     *
     * @return array Modified bulk actions
     */
    public function add_bulk_actions( $actions ) {
        $pending_filter = sanitize_text_field( wp_unslash( $_GET['pending_vendors'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( '1' === $pending_filter ) {
            $actions['approve_vendors'] = esc_html__( 'Approve Vendors', 'dokan-lite' );
        }

        return $actions;
    }

    /**
     * Handle bulk actions.
     *
     * @since DOKAN_SINCE
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

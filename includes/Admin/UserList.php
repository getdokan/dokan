<?php

namespace WeDevs\Dokan\Admin;

/**
 * User List related tasks for wp-admin.
 * Adds Pending Vendor tab and Approve Vendors bulk action.
 *
 * @since 4.2.4
 *
 * @package Dokan
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
     * @since 4.2.4
     *
     * @param array $views Existing views
     *
     * @return array Modified views
     */
    public function add_pending_vendor_view( $views ) {
        $status_count  = dokan_get_seller_status_count();
        $pending_count = $status_count['inactive'] ?? 0;
        $role_data     = sanitize_text_field( wp_unslash( $_GET['role'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended

        $views['pending_vendor'] = sprintf(
            /* translators: %1$s: Pending Vendors link, %2$s: Current class, %3$s: Pending Vendors label, %4$s: Pending Vendors count */
            '<a href="%1$s" class="%2$s">%3$s <span class="count">(%4$s)</span></a>',
            esc_url( add_query_arg( 'role', 'pending_vendor', admin_url( 'users.php' ) ) ),
            esc_attr( 'pending_vendor' === $role_data ? 'current' : '' ),
            esc_html__( 'Pending Vendor', 'dokan-lite' ),
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

        $role_data = sanitize_text_field( wp_unslash( $_GET['role'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( 'pending_vendor' !== $role_data ) {
            return $query;
        }

        // Unset the role parameter for fetch all users and set our custom role query.
        $query->set( 'role', '' );
        $query->set( 'role__in', [ 'seller', 'administrator' ] );

        $meta_query = $query->get( 'meta_query' );
        if ( ! is_array( $meta_query ) ) {
            $meta_query = [];
        }

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
     * @since 4.2.4
     *
     * @param array $actions Existing bulk actions
     *
     * @return array Modified bulk actions
     */
    public function add_bulk_actions( $actions ) {
        $role_data = sanitize_text_field( wp_unslash( $_GET['role'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( 'pending_vendor' === $role_data ) {
            $actions['approve_vendors'] = esc_html__( 'Approve Vendors', 'dokan-lite' );
        }

        return $actions;
    }

    /**
     * Handle bulk actions.
     *
     * @since 4.2.4
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

            // Check if the user is a vendor and is currently disabled.
            if ( ! user_can( $user_id, 'dokandar' ) ) {
                continue;
            }

            $selling = get_user_meta( $user_id, 'dokan_enable_selling', true );

            // Approve if selling is 'no' or a meta-key doesn't exist (empty string).
            if ( $selling !== 'yes' ) {
                $vendor->make_active();
                ++$approved_count;
            }
        }

        $sendback = add_query_arg( 'vendors_approved', $approved_count, $sendback );

        return $sendback;
    }

    /**
     * Show admin notices for bulk actions.
     *
     * @since 4.2.4
     *
     * @return void
     */
    public function show_bulk_action_notices() {
        $count = absint( wp_unslash( $_GET['vendors_approved'] ?? '' ) ); // phpcs:ignore WordPress.Security.NonceVerification.Recommended
        if ( empty( $count ) ) {
            return;
        }

        $message = sprintf(
            /* translators: %d: number of vendors approved */
            _n( '%d vendor approved successfully.', '%d vendors approved successfully.', $count, 'dokan-lite' ),
            $count
        );

        dokan_get_template(
            'admin/bulk-vendor-approve-notice.php',
            [
                'count'   => $count,
                'message' => $message,
            ]
        );
    }
}

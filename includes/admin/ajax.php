<?php

/**
*  Ajax handling for Dokan in Admin area
*
*  @since 2.2
*
*  @author weDevs <info@wedevs.com>
*/
class Dokan_Admin_Ajax {

	/**
	 *  Load autometically all actions
	 */
	function __construct() {
        add_action( 'wp_ajax_dokan_withdraw_form_action', array( $this, 'handle_withdraw_action' ) );
	}

	/**
     * Initializes the Dokan_Template_Withdraw class
     *
     * Checks for an existing Dokan_Template_Withdraw instance
     * and if it doesn't find one, creates it.
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new Dokan_Admin_Ajax();
        }

        return $instance;
    }

	/**
	 *  Handle withdraw action via ajax
	 *
	 *  @return json success|error|data
	 */
	function handle_withdraw_action() {

        parse_str( $_POST['formData'], $postdata );

        if( !wp_verify_nonce( $postdata['dokan_withdraw_admin_bulk_action_nonce'], 'dokan_withdraw_admin_bulk_action' ) ) {
            wp_send_json_error();
        }

        $withdraw = Dokan_Template_Withdraw::init();

        $bulk_action = $_POST['status'];
        $status      = $postdata['status_page'];
        $withdraw_id = $_POST['withdraw_id'];

        switch ( $bulk_action ) {

            case 'delete':

                $withdraw->delete_withdraw( $withdraw_id );

                $url = admin_url( 'admin.php?page=dokan-withdraw&message=trashed&status=' . $status );
                wp_send_json_success( array( 'url'=> $url ) );

                break;

            case 'cancel':

                $user_id = $postdata['user_id'][$withdraw_id];
                $amount  = $postdata['amount'][$withdraw_id];
                $method  = $postdata['method'][$withdraw_id];
                $note    = $postdata['note'][$withdraw_id];

                Dokan_Email::init()->withdraw_request_cancel( $user_id, $amount, $method, $note );
                $withdraw->update_status( $withdraw_id, $user_id, 2 );

                $url = admin_url( 'admin.php?page=dokan-withdraw&message=cancelled&status=' . $status );
                wp_send_json_success( array( 'url'=> $url ) );

                break;

            case 'approve':

                $user_id = $postdata['user_id'][$withdraw_id];
                $amount  = $postdata['amount'][$withdraw_id];
                $method  = $postdata['method'][$withdraw_id];

                Dokan_Email::init()->withdraw_request_approve( $user_id, $amount, $method );
                $withdraw->update_status( $withdraw_id, $user_id, 1 );

                $url = admin_url( 'admin.php?page=dokan-withdraw&message=approved&status=' . $status );
                wp_send_json_success( array( 'url'=> $url ) );

                break;

            case 'pending':

                $withdraw->update_status( $withdraw_id, $postdata['user_id'][$withdraw_id], 0 );

                $url = admin_url( 'admin.php?page=dokan-withdraw&message=pending&status=' . $status );
                wp_send_json_success( array( 'url'=> $url ) );

                break;
        }

    }
}
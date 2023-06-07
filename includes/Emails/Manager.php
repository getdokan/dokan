<?php

namespace WeDevs\Dokan\Emails;

/**
 * Dokan email handler class
 *
 * @package Dokan
 */
class Manager {

    /**
     * Load autometically when class initiate
     */
    public function __construct() {
        //Dokan Email filters for WC Email
        add_filter( 'woocommerce_email_classes', array( $this, 'load_dokan_emails' ), 35 );
        add_filter( 'woocommerce_template_directory', array( $this, 'set_email_template_directory' ), 15, 2 );
        add_filter( 'woocommerce_email_actions', array( $this, 'register_email_actions' ) );
    }

    /**
     * Get from name for email.
     *
     * @access public
     * @return string
     */
    public function get_from_name() {
        return wp_specialchars_decode( esc_html( get_option( 'woocommerce_email_from_name' ) ), ENT_QUOTES );
    }

    /**
     * Get from email address.
     *
     * @access public
     * @return string
     */
    public function get_from_address() {
        return sanitize_email( get_option( 'woocommerce_email_from_address' ) );
    }

    /**
     * Get admin email address
     *
     * @return string
     */
    public function admin_email() {
        return apply_filters( 'dokan_email_admin_mail', get_option( 'admin_email' ) );
    }

    /**
     * Get user agent string
     *
     * @return string
     */
    public function get_user_agent() {
        $agent = isset( $_SERVER['HTTP_USER_AGENT'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_USER_AGENT'] ) ) : '';
        return substr( $agent, 0, 150 );
    }

    /**
     * Replace currency HTML entities with symbol
     *
     * @param string $amount
     *
     * @return string
     */
    public function currency_symbol( $amount ) {
        $price = sprintf( get_woocommerce_price_format(), get_woocommerce_currency_symbol(), $amount );

        return html_entity_decode( $price );
    }

    /**
     * Add Dokan Email classes in WC Email
     *
     * @since 2.6.8
     *
     * @param array $wc_emails
     *
     * @return $wc_emails
     */
    public function load_dokan_emails( $wc_emails ) {
        $wc_emails['Dokan_Email_New_Product']                = new NewProduct();
        $wc_emails['Dokan_Email_New_Product_Pending']        = new NewProductPending();
        $wc_emails['Dokan_Email_Product_Published']          = new ProductPublished();
        $wc_emails['Dokan_Email_New_Seller']                 = new NewSeller();
        $wc_emails['Dokan_Email_Vendor_Withdraw_Request']    = new VendorWithdrawRequest();
        $wc_emails['Dokan_Email_Withdraw_Approved']          = new WithdrawApproved();
        $wc_emails['Dokan_Email_Withdraw_Cancelled']         = new WithdrawCancelled();
        $wc_emails['Dokan_Email_Contact_Seller']             = new ContactSeller();
        $wc_emails['Dokan_Email_New_Order']                  = new VendorNewOrder();
        $wc_emails['Dokan_Email_Completed_Order']            = new VendorCompletedOrder();
        $wc_emails['Dokan_Email_Reverse_Withdrawal_Invoice'] = new ReverseWithdrawalInvoice();

        return apply_filters( 'dokan_email_classes', $wc_emails );
    }

    /**
     * Set template override directory for Dokan Emails
     *
     * @since 2.6.8
     *
     * @param string $template_dir
     *
     * @param string $template
     *
     * @return string
     */
    public function set_email_template_directory( $template_dir, $template ) {
        $dokan_emails = apply_filters(
            'dokan_email_list',
            array(
                'new-product.php',
                'new-product-pending.php',
                'product-published.php',
                'contact-seller.php',
                'new-seller-registered.php',
                'withdraw-new.php',
                'withdraw-cancel.php',
                'withdraw-approve.php',
                'vendor-new-order.php',
                'vendor-completed-order.php',
            )
        );

        $template_name = basename( $template );

        if ( in_array( $template_name, $dokan_emails, true ) ) {
            return 'dokan';
        }

        return $template_dir;
    }

    /**
     * Register Dokan Email actions for WC
     *
     * @since 2.6.8
     *
     * @param array $actions
     *
     * @return $actions
     */
    public function register_email_actions( $actions ) {
        $dokan_email_actions = apply_filters(
            'dokan_email_actions', array(
				'dokan_new_product_added',
				'dokan_email_trigger_new_pending_product',
				'dokan_new_seller_created',
				'dokan_after_withdraw_request',
				'dokan_withdraw_request_approved',
				'dokan_withdraw_request_cancelled',
				'dokan_pending_product_published_notification',
				'dokan_trigger_contact_seller_mail',
            )
        );

        foreach ( $dokan_email_actions as $action ) {
            $actions[] = $action;
        }

        return $actions;
    }

    /**
     * Send email to seller from the seller contact form
     *
     * @param string $seller_email
     * @param string $from_name
     * @param string $from_email
     * @param string $message
     *
     * @return void
     */
    public function contact_seller( $seller_email, $from_name, $from_email, $message ) {
        ob_start();
        dokan_get_template_part( 'emails/contact-seller' );
        $body = ob_get_clean();

        $find = array(
            '%from_name%',
            '%from_email%',
            '%user_ip%',
            '%user_agent%',
            '%message%',
            '%site_name%',
            '%site_url%',
        );

        $replace = array(
            $from_name,
            $from_email,
            dokan_get_client_ip(),
            $this->get_user_agent(),
            $message,
            $this->get_from_name(),
            home_url(),
        );
        // translators: %1: from name, %2: from name
        $subject = sprintf( __( '"%1$s" sent you a message from your "%2$s" store', 'dokan-lite' ), $from_name, $this->get_from_name() );
        $body = str_replace( $find, $replace, $body );
        $headers = array( "Reply-To: {$from_name}<{$from_email}>" );

        $this->send( $seller_email, $subject, $body, $headers );

        do_action(
            'dokan_contact_seller_email_sent', array(
				'to'           => $seller_email,
				'subject'      => $subject,
				'message'      => $body,
				'sender_email' => $from_email,
				'sender_name'  => $from_name,
				'headers'      => $headers,
            )
        );
    }

    /**
     * Send seller email notification when a new refund request is made
     *
     * @param WP_User $seller_mail
     * @param int $order_id
     * @param object $refund
     *
     * @return void
     */
    public function dokan_refund_seller_mail( $seller_mail, $order_id, $status, $amount, $refund_reason ) {
        ob_start();
        dokan_get_template_part( 'emails/refund-seller-mail' );
        $body = ob_get_clean();
        $find = array(
            '%status%',
            '%order_id%',
            '%amount%',
            '%reason%',
            '%order_page%',
            '%site_name%',
            '%site_url%',
        );

        $replace = array(
            $status,
            $order_id,
            $amount,
            $refund_reason,
            dokan_get_navigation_url() . 'orders/?order_status=wc-refunded',
            $this->get_from_name(),
            home_url(),
        );

        // translators: %1: from name, %2: status
        $subject = sprintf( __( '[%1$s] Refund Request %2$s', 'dokan-lite' ), $this->get_from_name(), $status );
        $body = str_replace( $find, $replace, $body );

        $this->send( $seller_mail, $subject, $body );
        do_action( 'dokan_after_refund_seller_mail', $seller_mail, $subject, $body );
    }

    /**
     * Send admin email notification when a new refund request is cancle
     *
     * @param string $seller_mail
     * @param int $order_id
     * @param int $refund_id
     *
     * @return @void
     */
    public function dokan_refund_request( $order_id ) {
        ob_start();
        dokan_get_template_part( 'emails/refund-request' );
        $body = ob_get_clean();
        $find = array(
            '%order_id%',
            '%refund_page%',
            '%site_name%',
            '%site_url%',
        );

        $replace = array(
            $order_id,
            admin_url( 'admin.php?page=dokan#/refund?status=pending' ),
            $this->get_from_name(),
            home_url(),
        );
        // translators: %s: from name
        $subject = sprintf( __( '[%s] New Refund Request', 'dokan-lite' ), $this->get_from_name() );
        $body = str_replace( $find, $replace, $body );
        $this->send( $this->admin_email(), $subject, $body );
        do_action( 'after_dokan_refund_request', $this->admin_email(), $subject, $body );
    }

    /**
     * Prepare body for withdraw email
     *
     * @param string $body
     * @param WP_User $user
     * @param float $amount
     * @param string $method
     * @param string $note
     *
     * @return string
     */
    public function prepare_withdraw( $body, $user, $amount, $method, $note = '' ) {
        $find = array(
            '%username%',
            '%amount%',
            '%method%',
            '%profile_url%',
            '%withdraw_page%',
            '%site_name%',
            '%site_url%',
            '%notes%',
        );

        $replace = array(
            $user->user_login,
            $this->currency_symbol( $amount ),
            dokan_withdraw_get_method_title( $method ),
            admin_url( 'user-edit.php?user_id=' . $user->ID ),
            admin_url( 'admin.php?page=dokan#/withdraw?status=pending' ),
            $this->get_from_name(),
            home_url(),
            $note,
        );

        $body = str_replace( $find, $replace, $body );

        return $body;
    }

    /**
     * Send admin email notification when a new withdraw request is made
     *
     * @param WP_User $user
     * @param float $amount
     * @param string $method
     */
    public function new_withdraw_request( $user, $amount, $method ) {
        ob_start();
        dokan_get_template_part( 'emails/withdraw-new' );
        $body = ob_get_clean();
        // translators: %s: from name
        $subject = sprintf( __( '[%s] New Withdraw Request', 'dokan-lite' ), $this->get_from_name() );
        $body = $this->prepare_withdraw( $body, $user, $amount, $method );

        $this->send( $this->admin_email(), $subject, $body );
        do_action( 'after_new_withdraw_request', $this->admin_email(), $subject, $body );
    }

    /**
     * Send email to user once a withdraw request is approved
     *
     * @param int $user_id
     * @param float $amount
     * @param string $method
     *
     * @return 3.0.0
     */
    public function withdraw_request_approve( $user_id, $amount, $method ) {
        ob_start();
        dokan_get_template_part( 'emails/withdraw-approve' );
        $body = ob_get_clean();

        $user = get_user_by( 'id', $user_id );
        // translators: %s: from name
        $subject = sprintf( __( '[%s] Your Withdraw Request has been approved', 'dokan-lite' ), $this->get_from_name() );
        $body = $this->prepare_withdraw( $body, $user, $amount, $method );

        $this->send( $user->user_email, $subject, $body );
        do_action( 'after_withdraw_request_approve', $user->user_email, $subject, $body );
    }

    /**
     * Send email to user once a order has been cancelled
     *
     * @param int $user_id
     * @param float $amount
     * @param string $method
     * @param string $note
     *
     * @since 3.0.0
     */
    public function withdraw_request_cancel( $user_id, $amount, $method, $note = '' ) {
        ob_start();
        dokan_get_template_part( 'emails/withdraw-cancel' );
        $body = ob_get_clean();

        $user = get_user_by( 'id', $user_id );
        // translators: %s: from name
        $subject = sprintf( __( '[%s] Your Withdraw Request has been cancelled', 'dokan-lite' ), $this->get_from_name() );
        $body = $this->prepare_withdraw( $body, $user, $amount, $method, $note );

        $this->send( $user->user_email, $subject, $body );
        do_action( 'after_withdraw_request_cancel', $user->user_email, $subject, $body );
    }

    /**
     * Send email to admin once a new seller registered
     *
     * @param int $seller_id
     *
     * @return void
     */
    public function new_seller_registered_mail( $seller_id ) {
        ob_start();
        dokan_get_template_part( 'emails/new-seller-registered' );
        $body = ob_get_clean();

        $seller = get_user_by( 'id', $seller_id );

        $find = array(
            '%seller_name%',
            '%store_url%',
            '%seller_edit%',
            '%site_name%',
            '%site_url%',
        );

        $replace = array(
            $seller->display_name,
            dokan_get_store_url( $seller_id ),
            admin_url( 'user-edit.php?user_id=' . $seller_id ),
            $this->get_from_name(),
            home_url(),
        );
        // translators: %s: from name
        $body = str_replace( $find, $replace, $body );
        // translators: %s: from name
        $subject = sprintf( __( '[%s] New Vendor Registered', 'dokan-lite' ), $this->get_from_name() );

        $this->send( $this->admin_email(), $subject, $body );
        do_action( 'after_new_seller_registered_mail', $this->admin_email(), $subject, $body );
    }

    /**
     * Send email to admin once a product is added
     *
     * @param int $product_id
     * @param string $status
     *
     * @return void
     */
    public function new_product_added( $product_id, $status = 'pending' ) {
        $template = 'emails/new-product-pending';

        if ( 'publish' === $status ) {
            $template = 'emails/new-product';
        }
        ob_start();
        dokan_get_template_part( $template );
        $body = ob_get_clean();

        $product       = wc_get_product( $product_id );
        $seller_id     = get_post_field( 'post_author', $product_id );
        $seller        = get_user_by( 'id', $seller_id );
        $category      = wp_get_post_terms( dokan_get_prop( $product, 'id' ), 'product_cat', array( 'fields' => 'names' ) );
        $category_name = $category ? reset( $category ) : 'N/A';

        $find = array(
            '%title%',
            '%price%',
            '%seller_name%',
            '%seller_url%',
            '%category%',
            '%product_link%',
            '%site_name%',
            '%site_url%',
        );

        $replace = array(
            $product->get_title(),
            $this->currency_symbol( $product->get_price() ),
            $seller->display_name,
            dokan_get_store_url( $seller->ID ),
            $category_name,
            admin_url( 'post.php?action=edit&post=' . $product_id ),
            $this->get_from_name(),
            home_url(),
        );

        $body = str_replace( $find, $replace, $body );
        // translators: %s: from name
        $subject = sprintf( __( '[%s] New Product Added', 'dokan-lite' ), $this->get_from_name() );

        $this->send( $this->admin_email(), $subject, $body );
        do_action( 'after_new_product_added', $this->admin_email(), $subject, $body );
    }

    /**
     * Send email to seller once a product is published
     *
     * @param WP_Post $post
     * @param WP_User $seller
     *
     * @return void
     */
    public function product_published( $post, $seller ) {
        ob_start();
        dokan_get_template_part( 'emails/product-published' );
        $body = ob_get_clean();

        $product = wc_get_product( $post->ID );

        $find = array(
            '%seller_name%',
            '%title%',
            '%product_link%',
            '%product_edit_link%',
            '%site_name%',
            '%site_url%',
        );

        $replace = array(
            $seller->display_name,
            $product->get_title(),
            get_permalink( $post->ID ),
            dokan_edit_product_url( $post->ID ),
            $this->get_from_name(),
            home_url(),
        );

        $body = str_replace( $find, $replace, $body );
        // translators: %s: from name
        $subject = sprintf( __( '[%s] Your product has been approved!', 'dokan-lite' ), $this->get_from_name() );

        $this->send( $seller->user_email, $subject, $body );
        do_action( 'after_product_published', $seller->user_email, $subject, $body );
    }

    /**
     * Send the email.
     *
     * @access public
     *
     * @param mixed $to
     * @param mixed $subject
     * @param mixed $message
     * @param string $headers
     * @param string $attachments
     *
     * @return void
     */
    public function send( $to, $subject, $message, $headers = array() ) {
        add_filter( 'wp_mail_from', array( $this, 'get_from_address' ) );
        add_filter( 'wp_mail_from_name', array( $this, 'get_from_name' ) );

        wp_mail( $to, $subject, $message, $headers );

        remove_filter( 'wp_mail_from', array( $this, 'get_from_address' ) );
        remove_filter( 'wp_mail_from_name', array( $this, 'get_from_name' ) );
    }
}

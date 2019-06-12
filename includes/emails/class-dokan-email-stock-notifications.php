<?php

defined( 'ABSPATH' ) || exit;

if ( ! class_exists( 'Dokan_Email_Stock_Notifications' ) ) :

/**
 * An email sent to the vendor with product stock status.
 *
 * @version DOKAN_LITE_SINCE
 */
class Dokan_Email_Stock_Notifications extends WC_Email {
    public $vendor                = null;
    public $low_stock_products    = null;
    public $out_of_stock_products = null;

    /**
     * Constructor method
     *
     * @since DOKAN_LIEE_SINCE
     */
    public function __construct() {
        $this->id               = 'dokan_stock_notificatoins';
        $this->title            = __( 'Dokan Stock Notifications', 'dokan-lite' );
        $this->description      = __( 'These emails are sent to vendor with product stock status.', 'dokan-lite' );
        $this->template_html    = 'emails/stock-notifications.php';
        $this->template_base    = DOKAN_DIR . '/templates/';
        $this->recipient        = 'vendor@ofthe.product';

        add_action( 'send_out_of_notifications_email', array( $this, 'trigger' ), 10, 3 );

        parent::__construct();
    }

    /**
     * Get email subject
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_name}] Product Stock Notifications', 'dokan-lite' );
    }

    /**
     * Get email heading
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function get_default_heading() {
        return __( '[{site_name}] Product Stock Notification ', 'dokan-lite' );
    }

    /**
     * Trigger the sending of this email.
     *
     * @param Dokan_Vendor $vendor
     * @param WC_Query $low_stock_products
     * @param WC_Query $out_of_stock_products
     *
     * @since DOKAN_LITE_SINCE
     */
    public function trigger( $vendor, $low_stock_products, $out_of_stock_products ) {
        if ( ! $this->is_enabled() ) {
            return;
        }

        $this->vendor                = $vendor;
        $this->low_stock_products    = ! empty( $low_stock_products ) ? $low_stock_products->get_posts() : null;
        $this->out_of_stock_products = ! empty( $out_of_stock_products ) ? $out_of_stock_products->get_posts() : null;

        $this->find['site_name']     = '{site_name}';
        $this->replace['site_name']  = $this->get_from_name();

        $this->setup_locale();
        $this->send( $this->vendor->get_email(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        $this->restore_locale();
    }

    /**
     * Get content html
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return string
     */
    public function get_content_html() {
        ob_start();
        wc_get_template( $this->template_html, [
            'vendor'                => $this->vendor,
            'low_stock_products'    => $this->low_stock_products,
            'out_of_stock_products' => $this->out_of_stock_products,
            'email_heading'         => $this->get_heading(),
            'sent_to_admin'         => true,
            'plain_text'            => false,
            'email'                 => $this,
        ], 'dokan/', $this->template_base );

        return ob_get_clean();
    }

    /**
     * Initialise settings form fields.
     *
     * @since DOKAN_LITE_SINCE
     *
     * @return void
     */
    public function init_form_fields() {
        $this->form_fields = [
            'enabled' => [
                'title'         => __( 'Enable/Disable', 'dokan-lite' ),
                'type'          => 'checkbox',
                'label'         => __( 'Enable this email notification', 'dokan-lite' ),
                'default'       => 'yes',
            ],
            'subject' => [
                'title'         => __( 'Subject', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name}</code>' ),
                'placeholder'   => $this->get_default_subject(),
                'default'       => '',
            ],
            'heading' => [
                'title'         => __( 'Email heading', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                'description'   => sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>{site_name}</code>' ),
                'placeholder'   => $this->get_default_heading(),
                'default'       => '',
            ],
        ];
    }
}
endif;

return new Dokan_Email_Stock_Notifications();

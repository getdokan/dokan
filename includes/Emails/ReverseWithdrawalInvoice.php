<?php

namespace WeDevs\Dokan\Emails;

use WC_Email;
use WeDevs\Dokan\ReverseWithdrawal\Helper;
use WeDevs\Dokan\Vendor\Vendor;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Reverse Withdrawal Invoice Email.
 *
 * @since 3.5.1
 *
 * @extends WC_Email
 *
 * @package WeDevs\Dokan\Emails
 */
class ReverseWithdrawalInvoice extends WC_Email {

    /**
     * @var \WeDevs\Dokan\Vendor\Vendor|null
     *
     * @since 3.5.1
     */
    protected $seller_info;

    /**
     * @var array|null
     *
     * @since 3.5.1
     *
     * @see Helper::get_vendor_due_status()
     */
    protected $due_status;

    /**
     * Constructor.
     *
     * @since 3.5.1
     */
    public function __construct() {
        $this->id               = 'reverse_withdrawal_invoice';
        $this->title            = __( 'Dokan Reverse Withdrawal Invoice', 'dokan-lite' );
        $this->description      = __( 'These emails are sent to the vendor(s) who has a due reverse withdrawal payment based on settings.', 'dokan-lite' );
        $this->template_html    = 'emails/reverse-withdrawal-invoice.php';
        $this->template_plain   = 'emails/plain/reverse-withdrawal-invoice.php';
        $this->template_base    = DOKAN_DIR . '/templates/';
        $this->placeholders     = [
            '{reverse_withdrawal_url}'  => dokan_get_navigation_url( 'reverse-withdrawal' ),
            '{month}'                   => '',
            '{year}'                    => '',
            '{store_name}'              => '',
        ];

        // Call parent constructor.
        parent::__construct();

        $this->manual = true; // this email will be triggered manually
    }

    /**
     * Get email subject.
     *
     * @since 3.5.1
     *
     * @return string
     */
    public function get_default_subject() {
        return __( '[{site_title}]: Your {month} invoice for store: {store_name} is available', 'dokan-lite' );
    }

    /**
     * Get email heading.
     *
     * @since 3.5.1
     *
     * @return string
     */
    public function get_default_heading() {
        return __( 'Your latest {site_title} invoice', 'dokan-lite' );
    }

    /**
     * Default content to show below main email content.
     *
     * @since 3.5.1
     *
     * @return string
     */
    public function get_default_additional_content() {
        return __( 'Thanks for using {site_url}!', 'dokan-lite' );
    }

    /**
     * Trigger this email.
     *
     * @since 3.5.1
     *
     * @param int $vendor_id
     * @param array|array $due_status
     *
     * @return void
     */
    public function trigger( $vendor_id, $due_status = null ) {
        if ( ! $this->is_enabled() ) {
            return;
        }

        $this->seller_info = new Vendor( $vendor_id );

        if ( ! $this->seller_info->get_id() ) {
            return;
        }

        // get vendor due status
        if ( null === $due_status ) {
            $due_status = Helper::get_vendor_due_status( $vendor_id );
        }

        $this->due_status = $due_status;

        // add placeholders
        $last_month = dokan_current_datetime()->modify( 'first day of last month' );

        $this->placeholders['{month}']      = $last_month->format( 'F' );
        $this->placeholders['{year}']       = $last_month->format( 'Y' );
        $this->placeholders['{store_name}'] = $this->seller_info->get_shop_name();

        $this->setup_locale();

        if ( $this->get_recipient() !== 'unpaid_vendor@ofthe.site' ) {
            $this->send( $this->get_recipient(), $this->get_subject(), $this->get_content(), $this->get_headers(), $this->get_attachments() );
        }

        $this->restore_locale();
    }

    /**
     * Get vendor email address
     *
     * @since 3.5.1
     *
     * @return string|null
     */
    public function get_recipient() {
        return $this->seller_info && $this->seller_info->get_id() ? $this->seller_info->get_email() : 'unpaid_vendor@ofthe.site';
    }

    /**
     * Get content html.
     *
     * @since 3.5.1
     *
     * @return string
     */
    public function get_content_html() {
        return wc_get_template_html(
            $this->template_html,
            [
                'due_status'         => $this->due_status,
                'seller_info'        => $this->seller_info,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => false,
                'plain_text'         => false,
                'email'              => $this,
                'data'               => $this->placeholders,
            ],
            'dokan/', $this->template_base
        );
    }

    /**
     * Get content plain.
     *
     * @since 3.5.1
     *
     * @return string
     */
    public function get_content_plain() {
        return wc_get_template_html(
            $this->template_html,
            [
                'due_status'         => $this->due_status,
                'seller_info'        => $this->seller_info,
                'email_heading'      => $this->get_heading(),
                'additional_content' => $this->get_additional_content(),
                'sent_to_admin'      => false,
                'plain_text'         => true,
                'email'              => $this,
                'data'               => $this->placeholders,
            ],
            'dokan/', $this->template_base
        );
    }

    /**
     * Initialize settings form fields.
     *
     * @since 3.5.1
     *
     * @return void
     */
    public function init_form_fields() {
        /* translators: %s: list of placeholders */
        $placeholder_text = sprintf( __( 'Available placeholders: %s', 'dokan-lite' ), '<code>' . esc_html( implode( '</code>, <code>', array_keys( $this->placeholders ) ) ) . '</code>' );

        $this->form_fields = array(
            'enabled' => array(
                'title'         => __( 'Enable/Disable', 'dokan-lite' ),
                'type'          => 'checkbox',
                'label'         => __( 'Enable this email notification', 'dokan-lite' ),
                'default'       => 'yes',
            ),
            'subject' => array(
                'title'         => __( 'Subject', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                'description'   => $placeholder_text,
                'placeholder'   => $this->get_default_subject(),
                'default'       => '',
            ),
            'heading' => array(
                'title'         => __( 'Email heading', 'dokan-lite' ),
                'type'          => 'text',
                'desc_tip'      => true,
                'description'   => $placeholder_text,
                'placeholder'   => $this->get_default_heading(),
                'default'       => '',
            ),
            'additional_content' => array(
                'title'       => __( 'Additional content', 'dokan-lite' ),
                'description' => __( 'Text to appear below the main email content.', 'dokan-lite' ) . ' ' . $placeholder_text,
                'css'         => 'width:400px; height: 75px;',
                'placeholder' => __( 'N/A', 'dokan-lite' ),
                'type'        => 'textarea',
                'default'     => $this->get_default_additional_content(),
                'desc_tip'    => true,
            ),
            'email_type' => array(
                'title'         => __( 'Email type', 'dokan-lite' ),
                'type'          => 'select',
                'description'   => __( 'Choose which format of email to send.', 'dokan-lite' ),
                'default'       => 'html',
                'class'         => 'email_type wc-enhanced-select',
                'options'       => $this->get_email_type_options(),
                'desc_tip'      => true,
            ),
        );
    }
}

<?php

namespace WeDevs\Dokan\VendorRegistration;

use WeDevs\Dokan\Contracts\Hookable;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Hints in Dokan's settings about which settings the registration block follows and which it replaces.
 *
 * @since DOKAN_SINCE
 */
class SettingsHints implements Hookable {

    /** Settings that block pages replace with their own controls. */
    const REPLACED_FIELDS = [ 'vendor_registration_address_fields', 'reg_tc_page' ];

    /** @var FormSetup */
    protected FormSetup $setup;

    /**
     * Class constructor.
     *
     * @since DOKAN_SINCE
     *
     * @param FormSetup $setup Form setup reader.
     */
    public function __construct( FormSetup $setup ) {
        $this->setup = $setup;
    }

    /**
     * Register WordPress hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_get_admin_settings_schema', [ $this, 'add_hints' ] );
    }

    /**
     * Add the help lines and the Vendor Onboarding page note.
     *
     * @since DOKAN_SINCE
     *
     * @param array $elements Admin settings schema elements.
     *
     * @return array
     */
    public function add_hints( $elements ) {
        static $running = false;

        $elements = (array) $elements;

        // The settings bridge builds this schema on front-end requests too; the hints only matter on the settings screen.
        if ( $running || ! ( is_admin() || ( defined( 'REST_REQUEST' ) && REST_REQUEST ) ) ) {
            return $elements;
        }

        $running = true;
        $hints   = [];

        foreach ( $elements as $index => $element ) {
            $id = $element['id'] ?? '';

            if ( in_array( $id, self::REPLACED_FIELDS, true ) ) {
                $elements[ $index ]['description'] = trim( ( $element['description'] ?? '' ) . ' ' . __( 'Pages using the Vendor Registration Form block use the block’s own fields.', 'dokan-lite' ) );
            }

            if ( 'vendor_onboarding_page' === $id ) {
                $hints[] = $this->onboarding_page_note( $element );
            }
        }

        $running = false;

        return array_merge( $elements, array_filter( $hints ) );
    }

    /**
     * Note under the Vendor Onboarding Page setting: a link to edit its form, or a warning when it has no block.
     *
     * @since DOKAN_SINCE
     *
     * @param array $field The Vendor Onboarding Page field.
     *
     * @return array|null
     */
    public function onboarding_page_note( array $field ): ?array {
        $page_id = absint( dokan_get_option( 'vendor_onboarding', 'dokan_pages', 0 ) );

        if ( ! $page_id || ! get_post( $page_id ) ) {
            return null;
        }

        $has_block = $this->setup->page_has_block( $page_id );

        $note = [
            'id'         => 'vendor_onboarding_page_registration_form',
            'type'       => 'field',
            'variant'    => 'info',
            'section_id' => $field['section_id'] ?? '',
            'title'      => __( 'This page’s Vendor Registration Form block is used by Dokan’s links, My Account and the old shortcodes.', 'dokan-lite' ),
            'link_title' => __( 'Edit registration form', 'dokan-lite' ),
            'link_url'   => (string) get_edit_post_link( $page_id, 'raw' ),
            'show_icon'  => true,
        ];

        if ( ! $has_block ) {
            // Sign-ups never break: until the block is added the page keeps the standard form.
            $note['variant']     = 'notice';
            $note['notice_type'] = 'warning';
            $note['title']       = __( 'This page doesn’t have the Vendor Registration Form block. Add it to customise the sign-up form; until then it shows the standard form.', 'dokan-lite' );
            $note['link_title']  = __( 'Add the block', 'dokan-lite' );
        }

        return $note;
    }
}

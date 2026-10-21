<?php

namespace WeDevs\Dokan\VendorRegistration;

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

/**
 * Built-in sections and field rows of the vendor registration form, plus the rows extensions add.
 *
 * @since DOKAN_SINCE
 */
class FieldRegistry {

    /** Prefix every custom field's meta key starts with. */
    const META_KEY_PREFIX = 'dokan_vreg_';

    /** Prefixed keys Dokan stores itself, which a custom field can't use. */
    const RESERVED_META_KEYS = [ 'dokan_vreg_signup_page' ];

    /** Field types a custom field can use. */
    const CUSTOM_FIELD_TYPES = [ 'text', 'textarea', 'number', 'email', 'phone', 'url', 'select', 'multiselect', 'radio', 'checkbox', 'date' ];

    /** Custom field types that take a list of options. */
    const OPTION_FIELD_TYPES = [ 'select', 'multiselect', 'radio' ];

    /**
     * Get the form sections in their default order.
     *
     * @since DOKAN_SINCE
     *
     * @return array[] Each section has `id`, `title`, `hidden` (default) and `locked` (can't be hidden).
     */
    public function get_sections(): array {
        $sections = [
            [
                'id'     => 'account',
                'title'  => __( 'Account', 'dokan-lite' ),
                'hidden' => false,
                'locked' => true,
            ],
            [
                'id'     => 'store',
                'title'  => __( 'Store', 'dokan-lite' ),
                'hidden' => false,
                'locked' => true,
            ],
            [
                'id'     => 'address',
                'title'  => __( 'Store Address', 'dokan-lite' ),
                // Follows Dokan's "Address on registration" setting until the block saves its own choice.
                'hidden' => 'on' !== dokan_get_option( 'enabled_address_on_reg', 'dokan_general', 'off' ),
                'locked' => false,
            ],
            [
                'id'     => 'additional',
                'title'  => __( 'Additional Information', 'dokan-lite' ),
                'hidden' => false,
                'locked' => false,
            ],
            [
                'id'     => 'agreement',
                'title'  => __( 'Agreement', 'dokan-lite' ),
                'hidden' => false,
                'locked' => false,
            ],
        ];

        /**
         * Filter the vendor registration form sections.
         *
         * @since DOKAN_SINCE
         *
         * @param array[] $sections Sections in their default order.
         */
        $sections = apply_filters( 'dokan_vendor_registration_sections', $sections );

        return array_values( array_map( [ $this, 'normalize_section' ], $sections ) );
    }

    /**
     * Get the rows that are available on this site, keyed by row ID.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public function get_rows(): array {
        $rows = [];

        foreach ( $this->get_registered_rows() as $row ) {
            /**
             * Filter whether a registration row is offered on this site.
             *
             * Extensions return false while their module or registration setting is off.
             *
             * @since DOKAN_SINCE
             *
             * @param bool  $available Whether the row is available.
             * @param array $row       Row definition.
             */
            if ( apply_filters( 'dokan_vendor_registration_row_available', true, $row ) ) {
                $rows[ $row['id'] ] = $row;
            }
        }

        return $rows;
    }

    /**
     * Get one available row.
     *
     * @since DOKAN_SINCE
     *
     * @param string $row_id Row ID.
     *
     * @return array|null
     */
    public function get_row( string $row_id ): ?array {
        return $this->get_rows()[ $row_id ] ?? null;
    }

    /**
     * Get every registered row, available or not, in default order.
     *
     * @since DOKAN_SINCE
     *
     * @return array[]
     */
    public function get_registered_rows(): array {
        $rows = [
            $this->core_row( 'first_name', 'account', 10, __( 'First Name', 'dokan-lite' ), 'fname', __( 'WordPress user → First name', 'dokan-lite' ) ),
            $this->core_row( 'last_name', 'account', 20, __( 'Last Name', 'dokan-lite' ), 'lname', __( 'WordPress user → Last name', 'dokan-lite' ) ),
            $this->core_row( 'username', 'account', 30, __( 'Username', 'dokan-lite' ), 'username', __( 'WordPress user → Username', 'dokan-lite' ), [ 'woocommerce_setting' => 'woocommerce_registration_generate_username' ] ),
            $this->core_row(
                'email', 'account', 40, __( 'Email address', 'dokan-lite' ), 'email', __( 'WordPress user → Email', 'dokan-lite' ), [
					'locked' => true,
					'type' => 'email',
				]
            ),
            $this->core_row(
                'password', 'account', 50, __( 'Password', 'dokan-lite' ), 'password', __( 'WordPress user → Password', 'dokan-lite' ), [
					'woocommerce_setting' => 'woocommerce_registration_generate_password',
					'type' => 'password',
				]
            ),
            $this->core_row( 'shop_name', 'store', 10, __( 'Shop Name', 'dokan-lite' ), 'shopname', __( 'Dokan store settings → Store name', 'dokan-lite' ), [ 'locked' => true ] ),
            $this->core_row( 'shop_url', 'store', 20, __( 'Shop URL', 'dokan-lite' ), 'shopurl', __( 'WordPress user → Nicename (store URL)', 'dokan-lite' ), [ 'locked' => true ] ),
            $this->core_row( 'phone', 'store', 40, __( 'Phone Number', 'dokan-lite' ), 'phone', __( 'Dokan store settings → Phone', 'dokan-lite' ), [ 'type' => 'phone' ] ),
            $this->core_row( 'street_1', 'address', 10, __( 'Street', 'dokan-lite' ), 'dokan_address[street_1]', __( 'Dokan store settings → Address', 'dokan-lite' ) ),
            $this->core_row( 'street_2', 'address', 20, __( 'Street 2', 'dokan-lite' ), 'dokan_address[street_2]', __( 'Dokan store settings → Address', 'dokan-lite' ), [ 'required' => false ] ),
            $this->core_row( 'city', 'address', 30, __( 'City', 'dokan-lite' ), 'dokan_address[city]', __( 'Dokan store settings → Address', 'dokan-lite' ) ),
            $this->core_row( 'zip', 'address', 40, __( 'Post/ZIP Code', 'dokan-lite' ), 'dokan_address[zip]', __( 'Dokan store settings → Address', 'dokan-lite' ) ),
            $this->core_row( 'country', 'address', 50, __( 'Country', 'dokan-lite' ), 'dokan_address[country]', __( 'Dokan store settings → Address', 'dokan-lite' ), [ 'type' => 'country' ] ),
            $this->core_row( 'state', 'address', 60, __( 'State', 'dokan-lite' ), 'dokan_address[state]', __( 'Dokan store settings → Address', 'dokan-lite' ), [ 'type' => 'state' ] ),
            $this->core_row( 'terms', 'agreement', 20, __( 'I have read and agree to the Terms & Conditions.', 'dokan-lite' ), 'tc_agree', __( 'Not stored (checked at sign-up)', 'dokan-lite' ), [ 'type' => 'terms' ] ),
        ];

        /**
         * Filter the registration rows. Extensions add their own rows here.
         *
         * A row needs `id`, `section` and `label`; see FieldRegistry::normalize_row() for the rest.
         *
         * @since DOKAN_SINCE
         *
         * @param array[] $rows Row definitions.
         */
        $rows = apply_filters( 'dokan_vendor_registration_rows', $rows );

        $rows = array_values( array_filter( array_map( [ $this, 'normalize_row' ], $rows ) ) );

        // Stable sort by section order, then position.
        $section_order = array_flip( wp_list_pluck( $this->get_sections(), 'id' ) );
        $indexed       = array_keys( $rows );

        usort(
            $indexed,
            function ( $a, $b ) use ( $rows, $section_order ) {
                $section_a = $section_order[ $rows[ $a ]['section'] ] ?? PHP_INT_MAX;
                $section_b = $section_order[ $rows[ $b ]['section'] ] ?? PHP_INT_MAX;

                return [ $section_a, $rows[ $a ]['position'], $a ] <=> [ $section_b, $rows[ $b ]['position'], $b ];
            }
        );

        return array_map(
            function ( $index ) use ( $rows ) {
                return $rows[ $index ];
            },
            $indexed
        );
    }

    /**
     * Get the steps "Split into steps" starts with, and which step each default section lands on.
     *
     * @since DOKAN_SINCE
     *
     * @return array{steps: array[], sections: array<string, string>}
     */
    public function get_suggested_steps(): array {
        return [
            'steps'    => [
                [
                    'id'    => 'step-account',
                    'title' => __( 'Your account', 'dokan-lite' ),
                ],
                [
                    'id'    => 'step-store',
                    'title' => __( 'Your store', 'dokan-lite' ),
                ],
                [
                    'id'    => 'step-details',
                    'title' => __( 'A few more details', 'dokan-lite' ),
                ],
            ],
            'sections' => [
                'account'    => 'step-account',
                'store'      => 'step-store',
                'address'    => 'step-store',
                'additional' => 'step-details',
                'agreement'  => 'step-details',
            ],
        ];
    }

    /**
     * Check whether a meta key is a valid custom field key.
     *
     * @since DOKAN_SINCE
     *
     * @param string $meta_key Meta key.
     *
     * @return bool
     */
    public function is_custom_meta_key( string $meta_key ): bool {
        return strlen( $meta_key ) > strlen( self::META_KEY_PREFIX )
            && 0 === strpos( $meta_key, self::META_KEY_PREFIX )
            && sanitize_key( $meta_key ) === $meta_key
            && ! in_array( $meta_key, self::RESERVED_META_KEYS, true );
    }

    /**
     * Build a built-in row definition.
     *
     * @since DOKAN_SINCE
     *
     * @param string $id         Row ID.
     * @param string $section    Default section ID.
     * @param int    $position   Position within the section.
     * @param string $label      Default label.
     * @param string $input_name Name of the form input Dokan reads.
     * @param string $saved_in   Where the answer is stored, shown in the editor.
     * @param array  $args       Extra row properties.
     *
     * @return array
     */
    protected function core_row( string $id, string $section, int $position, string $label, string $input_name, string $saved_in, array $args = [] ): array {
        return array_merge(
            [
                'id'         => $id,
                'section'    => $section,
                'position'   => $position,
                'label'      => $label,
                'input_name' => $input_name,
                'saved_in'   => $saved_in,
                'source'     => 'core',
            ],
            $args
        );
    }

    /**
     * Fill in a section's defaults.
     *
     * @since DOKAN_SINCE
     *
     * @param array $section Section definition.
     *
     * @return array
     */
    protected function normalize_section( array $section ): array {
        return [
            'id'     => sanitize_key( $section['id'] ?? '' ),
            'title'  => (string) ( $section['title'] ?? '' ),
            'hidden' => ! empty( $section['hidden'] ),
            'locked' => ! empty( $section['locked'] ),
        ];
    }

    /**
     * Fill in a row's defaults; rows without an ID, section or label are dropped.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $row Row definition.
     *
     * @return array|null
     */
    protected function normalize_row( $row ): ?array {
        if ( ! is_array( $row ) || empty( $row['id'] ) || empty( $row['section'] ) || ! isset( $row['label'] ) ) {
            return null;
        }

        $locked = ! empty( $row['locked'] );

        return array_merge(
            $row,
            [
                'id'                    => sanitize_key( $row['id'] ),
                'section'               => sanitize_key( $row['section'] ),
                'position'              => (int) ( $row['position'] ?? 100 ),
                'label'                 => (string) $row['label'],
                'type'                  => (string) ( $row['type'] ?? 'text' ),
                'input_name'            => (string) ( $row['input_name'] ?? '' ),
                'saved_in'              => (string) ( $row['saved_in'] ?? '' ),
                'source'                => (string) ( $row['source'] ?? 'extension' ),
                'locked'                => $locked,
                'required'              => $locked || ! array_key_exists( 'required', $row ) || ! empty( $row['required'] ),
                'hidden'                => ! $locked && ! empty( $row['hidden'] ),
                'woocommerce_setting'   => (string) ( $row['woocommerce_setting'] ?? '' ),
                'keeps_section_visible' => ! empty( $row['keeps_section_visible'] ),
                'hook'                  => (string) ( $row['hook'] ?? '' ),
                'render_callback'       => $row['render_callback'] ?? null,
                'validate_callback'     => $row['validate_callback'] ?? null,
                'save_callback'         => $row['save_callback'] ?? null,
            ]
        );
    }
}

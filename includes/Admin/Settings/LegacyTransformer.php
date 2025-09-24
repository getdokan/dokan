<?php

namespace WeDevs\Dokan\Admin\Settings;

/**
 * Legacy Settings Value Transformer.
 *
 * Transforms values between legacy settings arrays and the new settings pages values
 * using the SettingsMapper.
 *
 * Directions:
 *  - from = 'new':  expects ['data' => [ pageId => nested values ... ] ] and returns
 *                   an array of legacy sections => [ field => value ].
 *  - from = 'old':  expects ['data' => [ legacySection => [ field => value ] ] ] and returns
 *                   [ pageId => nested values ... ] ready to be passed to Settings->save().
 */
class LegacyTransformer implements TransformerInterface {

    /** @var SettingsMapper */
    protected SettingsMapper $mapper;

    /** @var array */
    protected array $pages_values = [];

    /** @var array */
    protected array $legacy_values = [];

    public function __construct( ?SettingsMapper $mapper = null ) {
        $this->mapper = $mapper ?: new SettingsMapper();
    }

    public function get_target(): string {
        return self::TARGET_LEGACY;
    }

    /**
     * Set context/settings for transformation.
     * Accepts arrays with any of these keys:
     *  - 'pages_values'  => array of new settings values keyed by page id
     *  - 'legacy_values' => array of legacy section arrays keyed by section id
     *
     * @param mixed $data
     * @return $this
     */
    public function set_settings( $data ) {
        if ( is_array( $data ) ) {
            if ( isset( $data['pages_values'] ) && is_array( $data['pages_values'] ) ) {
                $this->pages_values = $data['pages_values'];
            }
            if ( isset( $data['legacy_values'] ) && is_array( $data['legacy_values'] ) ) {
                $this->legacy_values = $data['legacy_values'];
            }
        }
        return $this;
    }

    /**
     * Transform values between systems.
     *
     * @param array $data Must be an array with keys: 'from' and 'data'.
     *                    - from: 'new' | 'old'
     *                    - data: the values to transform
     *
     * @return array
     */
    public function transform( $data ) {
        if ( ! is_array( $data ) || empty( $data['from'] ) ) {
            return [];
        }

        if ( 'new' === $data['from'] ) {
            $pages_values = isset( $data['data'] ) && is_array( $data['data'] ) ? $data['data'] : $this->pages_values;
            return $this->transform_new_to_old( $pages_values );
        }

        if ( 'old' === $data['from'] ) {
            $legacy_values = isset( $data['data'] ) && is_array( $data['data'] ) ? $data['data'] : $this->legacy_values;
            return $this->transform_old_to_new( $legacy_values );
        }

        return [];
    }

    /**
     * Convert new settings page values to legacy section arrays.
     */
    protected function transform_new_to_old( array $pages_values ): array {
        $result = [];

        foreach ( $this->mapper->get_map() as $old_key => $new_key ) {
            // $old_key format: section.field
            $bits = explode( '.', $old_key, 2 );
            if ( count( $bits ) !== 2 ) {
                continue;
            }
            list( $legacy_section, $legacy_field ) = $bits;

            // Get value from pages using new key path.
            $value = SettingsMapper::get_value_by_path( $pages_values, $new_key, null );

            // Only map if value exists (null treated as not set).
            if ( null !== $value ) {
                if ( ! isset( $result[ $legacy_section ] ) || ! is_array( $result[ $legacy_section ] ) ) {
                    $result[ $legacy_section ] = [];
                }
                $result[ $legacy_section ][ $legacy_field ] = $value;
            }
        }

        return $result;
    }

    /**
     * Convert legacy section arrays to new settings page values.
     */
    protected function transform_old_to_new( array $legacy_values ): array {
        $result = [];

        foreach ( $legacy_values as $legacy_section => $fields ) {
            if ( ! is_array( $fields ) ) {
                continue;
            }
            foreach ( $fields as $legacy_field => $value ) {
                $old_key = $legacy_section . '.' . $legacy_field;
                $new_key = $this->mapper->to_new_key( $old_key );

                if ( empty( $new_key ) ) {
                    continue;
                }

                SettingsMapper::set_value_by_path( $result, $new_key, $value );
            }
        }

        return $result;
    }
}

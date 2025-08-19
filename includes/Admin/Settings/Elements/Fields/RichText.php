<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

/**
 * RichText Field.
 *
 * @since DOKAN_SINCE
 */
class RichText extends Text {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'rich_text';

    /**
     * Data validation.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        return isset( $data ) && is_string( $data );
    }

    /**
     * Sanitize data for storage using WordPress's native post-sanitization.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $data Data for sanitization.
     *
     * @return string
     */
    public function sanitize_element( $data ): string {
        if ( empty( $data ) || ! is_string( $data ) ) {
            return '';
        }

        // Use sanitize_post to sanitize HTML tags and attributes.
        $sanitized_data = sanitize_post( $data, 'db' );

        // Trim and sanitize the data.
        return apply_filters(
            'dokan_settings_sanitized_rich_text',
            trim( wp_unslash( $sanitized_data ) ),
            $data
        );
    }

    /**
     * Escape data for display using wp_kses_post.
     *
     * @since DOKAN_SINCE
     *
     * @param string $data Data for display.
     *
     * @return string
     */
    public function escape_element( $data ): string {
        if ( empty( $data ) || ! is_string( $data ) ) {
            return '';
        }

        // Apply filters to escape the data.
        return apply_filters( 'dokan_settings_escaped_rich_text', $data );
    }
}
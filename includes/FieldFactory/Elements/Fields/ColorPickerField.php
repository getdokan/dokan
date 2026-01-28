<?php
/**
 * Color Picker Field Element
 *
 * Color selection field with picker interface.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class ColorPickerField
 */
class ColorPickerField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'color';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'color';

    /**
     * Color format (hex, rgb, rgba, hsl).
     *
     * @var string
     */
    protected string $color_format = 'hex';

    /**
     * Enable alpha/opacity.
     *
     * @var bool
     */
    protected bool $enable_alpha = false;

    /**
     * Predefined color palette.
     *
     * @var array
     */
    protected array $palette = [];

    /**
     * Show input field.
     *
     * @var bool
     */
    protected bool $show_input = true;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'color_format',
                'enable_alpha',
                'palette',
                'show_input',
            ]
        );
    }

    /**
     * Get color format.
     *
     * @return string
     */
    public function get_color_format(): string {
        return $this->color_format;
    }

    /**
     * Check if alpha is enabled.
     *
     * @return bool
     */
    public function is_alpha_enabled(): bool {
        return $this->enable_alpha;
    }

    /**
     * Get color palette.
     *
     * @return array
     */
    public function get_palette(): array {
        return $this->palette;
    }

    /**
     * Check if input is shown.
     *
     * @return bool
     */
    public function shows_input(): bool {
        return $this->show_input;
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        $result = parent::validate( $item );
        $value  = $this->get_value( $item );

        if ( $value === null || $value === '' ) {
            return $result;
        }

        // Validate color format
        $is_valid_color = false;

        // Hex validation
        if ( preg_match( '/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/', $value ) ) {
            $is_valid_color = true;
        }

        // RGB validation
        if ( preg_match( '/^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/', $value ) ) {
            $is_valid_color = true;
        }

        // RGBA validation
        if ( preg_match( '/^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/', $value ) ) {
            $is_valid_color = true;
        }

        if ( ! $is_valid_color ) {
            $this->errors['color_format'] = [
                'type'    => 'invalid',
                'message' => __( 'Invalid color format.', 'dokan-lite' ),
            ];
        }

        return [
            'valid'  => empty( $this->errors ),
            'errors' => $this->errors,
        ];
    }

    /**
     * {@inheritdoc}
     */
    protected function get_default_operators(): array {
        return [ 'is', 'isNot', 'isAny', 'isNone' ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'color_format' => $this->color_format,
                'enable_alpha' => $this->enable_alpha,
                'palette'      => $this->palette,
                'show_input'   => $this->show_input,
            ]
        );
    }
}

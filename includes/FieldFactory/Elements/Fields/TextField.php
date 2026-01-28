<?php
/**
 * Text Field Element
 *
 * Basic text input field aligned with WordPress DataViews Fields API.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#fields-api
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class TextField
 */
class TextField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'text';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'text';

    /**
     * Input type attribute (text, email, url, tel, etc.).
     *
     * @var string
     */
    protected string $input_type = 'text';

    /**
     * Maximum length.
     *
     * @var int|null
     */
    protected ?int $maxlength = null;

    /**
     * Minimum length.
     *
     * @var int|null
     */
    protected ?int $minlength = null;

    /**
     * Pattern for validation (regex).
     *
     * @var string
     */
    protected string $pattern = '';

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'input_type',
                'maxlength',
                'minlength',
                'pattern',
            ]
        );
    }

    /**
     * Get input type.
     *
     * @return string
     */
    public function get_input_type(): string {
        return $this->input_type;
    }

    /**
     * Get maxlength.
     *
     * @return int|null
     */
    public function get_maxlength(): ?int {
        return $this->maxlength;
    }

    /**
     * Get minlength.
     *
     * @return int|null
     */
    public function get_minlength(): ?int {
        return $this->minlength;
    }

    /**
     * Get pattern.
     *
     * @return string
     */
    public function get_pattern(): string {
        return $this->pattern;
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

        // Maxlength validation
        if ( $this->maxlength !== null && strlen( $value ) > $this->maxlength ) {
            $this->errors['maxlength'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: 1: field label, 2: max length */
                    __( '%1$s must be at most %2$d characters.', 'dokan-lite' ),
                    $this->get_label(),
                    $this->maxlength
                ),
            ];
        }

        // Minlength validation
        if ( $this->minlength !== null && strlen( $value ) < $this->minlength ) {
            $this->errors['minlength'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: 1: field label, 2: min length */
                    __( '%1$s must be at least %2$d characters.', 'dokan-lite' ),
                    $this->get_label(),
                    $this->minlength
                ),
            ];
        }

        // Pattern validation
        if ( ! empty( $this->pattern ) && ! preg_match( '/' . $this->pattern . '/', $value ) ) {
            $this->errors['pattern'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: %s: field label */
                    __( '%s format is invalid.', 'dokan-lite' ),
                    $this->get_label()
                ),
            ];
        }

        return [
            'valid'  => empty( $this->errors ),
            'errors' => $this->errors,
        ];
    }
}

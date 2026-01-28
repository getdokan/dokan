<?php
/**
 * Textarea Field Element
 *
 * Multi-line text input field.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class TextareaField
 */
class TextareaField extends AbstractField {

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
    protected string $variant = 'textarea';

    /**
     * Number of rows.
     *
     * @var int
     */
    protected int $rows = 5;

    /**
     * Number of columns.
     *
     * @var int
     */
    protected int $cols = 50;

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
     * Resize behavior (none, vertical, horizontal, both).
     *
     * @var string
     */
    protected string $resize = 'vertical';

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'rows',
                'cols',
                'maxlength',
                'minlength',
                'resize',
            ]
        );
    }

    /**
     * Get rows.
     *
     * @return int
     */
    public function get_rows(): int {
        return $this->rows;
    }

    /**
     * Get columns.
     *
     * @return int
     */
    public function get_cols(): int {
        return $this->cols;
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
     * Get resize behavior.
     *
     * @return string
     */
    public function get_resize(): string {
        return $this->resize;
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

        return [
            'valid'  => empty( $this->errors ),
            'errors' => $this->errors,
        ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'rows'      => $this->rows,
                'cols'      => $this->cols,
                'maxlength' => $this->maxlength,
                'minlength' => $this->minlength,
                'resize'    => $this->resize,
            ]
        );
    }
}

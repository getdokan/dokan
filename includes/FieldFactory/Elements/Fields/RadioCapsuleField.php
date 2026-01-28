<?php
/**
 * Radio Capsule Field Element
 *
 * Pill/capsule style radio button group.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class RadioCapsuleField
 */
class RadioCapsuleField extends AbstractField {

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
    protected string $variant = 'radio_capsule';

    /**
     * Size of capsules (small, medium, large).
     *
     * @var string
     */
    protected string $capsule_size = 'medium';

    /**
     * Whether capsules should be full width.
     *
     * @var bool
     */
    protected bool $full_width = false;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'capsule_size',
                'full_width',
            ]
        );
    }

    /**
     * Get capsule size.
     *
     * @return string
     */
    public function get_capsule_size(): string {
        return $this->capsule_size;
    }

    /**
     * Check if full width.
     *
     * @return bool
     */
    public function is_full_width(): bool {
        return $this->full_width;
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

        // Ensure value is one of the options
        if ( ! empty( $this->elements ) ) {
            $valid_values = array_column( $this->elements, 'value' );
            if ( ! in_array( $value, $valid_values, true ) ) {
                $this->errors['invalid_option'] = [
                    'type'    => 'invalid',
                    'message' => __( 'Selected value is not a valid option.', 'dokan-lite' ),
                ];
            }
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
                'capsule_size' => $this->capsule_size,
                'full_width'   => $this->full_width,
            ]
        );
    }
}

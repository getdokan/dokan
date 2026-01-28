<?php
/**
 * Radio Field Element
 *
 * Standard radio button group field.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   DOKAN_SINCE
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

class RadioField extends AbstractField {

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
    protected string $variant = 'radio';

    /**
     * Layout style (inline, stacked).
     *
     * @var string
     */
    protected string $layout = 'stacked';

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'layout',
            ]
        );
    }

    /**
     * Get layout style.
     *
     * @return string
     */
    public function get_layout(): string {
        return $this->layout;
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
                'layout' => $this->layout,
            ]
        );
    }
}

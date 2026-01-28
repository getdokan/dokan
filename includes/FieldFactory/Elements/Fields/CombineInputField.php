<?php
/**
 * Combine Input Field Element
 *
 * Multiple inputs combined in a single field (e.g., percentage + flat fee).
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class CombineInputField
 */
class CombineInputField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'array';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'combine_input';

    /**
     * Input configurations.
     *
     * Each input: [
     *   'id' => string,
     *   'label' => string,
     *   'type' => 'text'|'number'|'select',
     *   'placeholder' => string,
     *   'prefix' => string,
     *   'postfix' => string,
     *   'options' => array (for select),
     * ]
     *
     * @var array
     */
    protected array $inputs = [];

    /**
     * Separator between inputs.
     *
     * @var string
     */
    protected string $separator = '+';

    /**
     * Layout direction (horizontal, vertical).
     *
     * @var string
     */
    protected string $direction = 'horizontal';

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'inputs',
                'separator',
                'direction',
            ]
        );
    }

    /**
     * Get input configurations.
     *
     * @return array
     */
    public function get_inputs(): array {
        return $this->inputs;
    }

    /**
     * Get separator.
     *
     * @return string
     */
    public function get_separator(): string {
        return $this->separator;
    }

    /**
     * Get direction.
     *
     * @return string
     */
    public function get_direction(): string {
        return $this->direction;
    }

    /**
     * {@inheritdoc}
     */
    public function get_value( array $item = [] ) {
        $value = parent::get_value( $item );

        if ( is_array( $value ) ) {
            return $value;
        }

        // Initialize with default structure from inputs
        $default_data = [];
        foreach ( $this->inputs as $input ) {
            $input_id             = $input['id'] ?? '';
            $default_data[ $input_id ] = $input['default'] ?? '';
        }

        return $default_data;
    }

    /**
     * {@inheritdoc}
     */
    public function get_value_formatted( array $item = [] ): string {
        $values = $this->get_value( $item );
        $parts  = [];

        foreach ( $this->inputs as $input ) {
            $input_id = $input['id'] ?? '';
            $value    = $values[ $input_id ] ?? '';
            $prefix   = $input['prefix'] ?? '';
            $postfix  = $input['postfix'] ?? '';

            if ( $value !== '' ) {
                $parts[] = $prefix . $value . $postfix;
            }
        }

        return implode( ' ' . $this->separator . ' ', $parts );
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        $result = parent::validate( $item );
        $values = $this->get_value( $item );

        foreach ( $this->inputs as $input ) {
            $input_id    = $input['id'] ?? '';
            $value       = $values[ $input_id ] ?? '';
            $is_required = $input['required'] ?? false;

            if ( $is_required && ( $value === '' || $value === null ) ) {
                $this->errors[ $input_id ] = [
                    'type'    => 'invalid',
                    'message' => sprintf(
                        /* translators: %s: input label */
                        __( '%s is required.', 'dokan-lite' ),
                        $input['label'] ?? $input_id
                    ),
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
                'inputs'    => $this->inputs,
                'separator' => $this->separator,
                'direction' => $this->direction,
            ]
        );
    }
}

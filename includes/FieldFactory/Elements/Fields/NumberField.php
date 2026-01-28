<?php
/**
 * Number Field Element
 *
 * Numeric input field aligned with WordPress DataViews Fields API.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#fields-api
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class NumberField
 */
class NumberField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'number';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'number';

    /**
     * Minimum value.
     *
     * @var float|null
     */
    protected ?float $min = null;

    /**
     * Maximum value.
     *
     * @var float|null
     */
    protected ?float $max = null;

    /**
     * Step value.
     *
     * @var float
     */
    protected float $step = 1.0;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'min',
                'max',
                'step',
            ]
        );
    }

    /**
     * Get minimum value.
     *
     * @return float|null
     */
    public function get_min(): ?float {
        return $this->min;
    }

    /**
     * Get maximum value.
     *
     * @return float|null
     */
    public function get_max(): ?float {
        return $this->max;
    }

    /**
     * Get step value.
     *
     * @return float
     */
    public function get_step(): float {
        return $this->step;
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

        $num_value = (float) $value;

        // Min validation
        if ( $this->min !== null && $num_value < $this->min ) {
            $this->errors['min'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: 1: field label, 2: minimum value */
                    __( '%1$s must be at least %2$s.', 'dokan-lite' ),
                    $this->get_label(),
                    $this->min
                ),
            ];
        }

        // Max validation
        if ( $this->max !== null && $num_value > $this->max ) {
            $this->errors['max'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: 1: field label, 2: maximum value */
                    __( '%1$s must be at most %2$s.', 'dokan-lite' ),
                    $this->get_label(),
                    $this->max
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
    protected function get_default_operators(): array {
        return [ 'is', 'isNot', 'lessThan', 'greaterThan', 'lessThanOrEqual', 'greaterThanOrEqual', 'between' ];
    }
}

<?php
/**
 * Multicheck Field Element
 *
 * Multiple checkbox selection field.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class MulticheckField
 */
class MulticheckField extends AbstractField {

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
    protected string $variant = 'multicheck';

    /**
     * Layout style (inline, stacked, grid).
     *
     * @var string
     */
    protected string $layout = 'stacked';

    /**
     * Number of columns for grid layout.
     *
     * @var int
     */
    protected int $columns = 2;

    /**
     * Minimum selections required.
     *
     * @var int|null
     */
    protected ?int $min_selections = null;

    /**
     * Maximum selections allowed.
     *
     * @var int|null
     */
    protected ?int $max_selections = null;

    /**
     * Show select all checkbox.
     *
     * @var bool
     */
    protected bool $show_select_all = false;

    /**
     * Validation rules - disable parent's single-value elements check.
     *
     * @var array
     */
    protected array $is_valid = [
        'elements' => false, // We handle array validation ourselves
    ];

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'layout',
                'columns',
                'min_selections',
                'max_selections',
                'show_select_all',
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
     * Get columns count.
     *
     * @return int
     */
    public function get_columns(): int {
        return $this->columns;
    }

    /**
     * Get minimum selections.
     *
     * @return int|null
     */
    public function get_min_selections(): ?int {
        return $this->min_selections;
    }

    /**
     * Get maximum selections.
     *
     * @return int|null
     */
    public function get_max_selections(): ?int {
        return $this->max_selections;
    }

    /**
     * Check if select all is shown.
     *
     * @return bool
     */
    public function shows_select_all(): bool {
        return $this->show_select_all;
    }

    /**
     * {@inheritdoc}
     */
    public function get_value( array $item = [] ) {
        $value = parent::get_value( $item );
        return is_array( $value ) ? $value : [];
    }

    /**
     * {@inheritdoc}
     */
    public function get_value_formatted( array $item = [] ): string {
        $values = $this->get_value( $item );
        $labels = [];

        foreach ( $values as $value ) {
            foreach ( $this->elements as $element ) {
                if ( ( $element['value'] ?? null ) === $value ) {
                    $labels[] = $element['label'] ?? $value;
                    break;
                }
            }
        }

        return implode( ', ', $labels );
    }

    /**
     * {@inheritdoc}
     */
    public function validate( array $item = [] ): array {
        $result = parent::validate( $item );
        $values = $this->get_value( $item );
        $count  = count( $values );

        // Validate against allowed options
        if ( ! empty( $values ) && ! empty( $this->elements ) ) {
            $valid_values = array_column( $this->elements, 'value' );
            foreach ( $values as $value ) {
                if ( ! in_array( $value, $valid_values, true ) ) {
                    $this->errors['invalid_option'] = [
                        'type'    => 'invalid',
                        'message' => __( 'One or more selected values are not valid.', 'dokan-lite' ),
                    ];
                    break;
                }
            }
        }

        // Min selections
        if ( $this->min_selections !== null && $count < $this->min_selections ) {
            $this->errors['min_selections'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: %d: minimum selections */
                    __( 'Please select at least %d options.', 'dokan-lite' ),
                    $this->min_selections
                ),
            ];
        }

        // Max selections
        if ( $this->max_selections !== null && $count > $this->max_selections ) {
            $this->errors['max_selections'] = [
                'type'    => 'invalid',
                'message' => sprintf(
                    /* translators: %d: maximum selections */
                    __( 'Please select at most %d options.', 'dokan-lite' ),
                    $this->max_selections
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
        return [ 'isAny', 'isNone', 'isAll' ];
    }

    /**
     * {@inheritdoc}
     */
    public function to_array(): array {
        return array_merge(
            parent::to_array(),
            [
                'layout'          => $this->layout,
                'columns'         => $this->columns,
                'min_selections'  => $this->min_selections,
                'max_selections'  => $this->max_selections,
                'show_select_all' => $this->show_select_all,
            ]
        );
    }
}

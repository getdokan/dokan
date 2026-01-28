<?php
/**
 * Radio Box Field Element
 *
 * Card-style radio selection field for visual options.
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class RadioBoxField
 */
class RadioBoxField extends AbstractField {

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
    protected string $variant = 'radio_box';

    /**
     * Layout style (horizontal, vertical, grid).
     *
     * @var string
     */
    protected string $layout = 'horizontal';

    /**
     * Number of columns for grid layout.
     *
     * @var int
     */
    protected int $columns = 2;

    /**
     * Show icons in options.
     *
     * @var bool
     */
    protected bool $show_icons = true;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'layout',
                'columns',
                'show_icons',
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
     * Check if icons should be shown.
     *
     * @return bool
     */
    public function should_show_icons(): bool {
        return $this->show_icons;
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
                'layout'     => $this->layout,
                'columns'    => $this->columns,
                'show_icons' => $this->show_icons,
            ]
        );
    }
}

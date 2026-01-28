<?php
/**
 * Select Field Element
 *
 * Dropdown select field aligned with WordPress DataViews Fields API.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#fields-api
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class SelectField
 */
class SelectField extends AbstractField {

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
    protected string $variant = 'select';

    /**
     * Allow multiple selections.
     *
     * @var bool
     */
    protected bool $multiple = false;

    /**
     * Enable search/filter in dropdown.
     *
     * @var bool
     */
    protected bool $searchable = false;

    /**
     * Allow clearing selection.
     *
     * @var bool
     */
    protected bool $clearable = false;

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'multiple',
                'searchable',
                'clearable',
            ]
        );
    }

    /**
     * {@inheritdoc}
     */
    public function fill( array $config ): self {
        parent::fill( $config );

        // If multiple, change field_type to array
        if ( $this->multiple ) {
            $this->field_type = 'array';
        }

        return $this;
    }

    /**
     * Check if multiple selections allowed.
     *
     * @return bool
     */
    public function is_multiple(): bool {
        return $this->multiple;
    }

    /**
     * Set multiple.
     *
     * @param bool $multiple Multiple state.
     *
     * @return self
     */
    public function set_multiple( bool $multiple ): self {
        $this->multiple   = $multiple;
        $this->field_type = $multiple ? 'array' : 'text';
        return $this;
    }

    /**
     * Check if searchable.
     *
     * @return bool
     */
    public function is_searchable(): bool {
        return $this->searchable;
    }

    /**
     * Check if clearable.
     *
     * @return bool
     */
    public function is_clearable(): bool {
        return $this->clearable;
    }

    /**
     * {@inheritdoc}
     */
    public function get_value_formatted( array $item = [] ): string {
        $value = $this->get_value( $item );

        if ( $value === null || $value === '' ) {
            return '';
        }

        // Handle multiple values
        if ( $this->multiple && is_array( $value ) ) {
            $labels = [];
            foreach ( $value as $val ) {
                foreach ( $this->elements as $element ) {
                    if ( ( $element['value'] ?? null ) === $val ) {
                        $labels[] = $element['label'] ?? $val;
                        break;
                    }
                }
            }
            return implode( ', ', $labels );
        }

        // Single value
        foreach ( $this->elements as $element ) {
            if ( ( $element['value'] ?? null ) === $value ) {
                return $element['label'] ?? (string) $value;
            }
        }

        return (string) $value;
    }

    /**
     * {@inheritdoc}
     */
    protected function get_default_operators(): array {
        if ( $this->multiple ) {
            return [ 'isAny', 'isNone', 'isAll' ];
        }
        return [ 'is', 'isNot' ];
    }
}

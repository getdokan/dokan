<?php
/**
 * Switch Field Element
 *
 * Toggle switch (boolean) field aligned with WordPress DataViews Fields API.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-dataviews/#fields-api
 *
 * @package WeDevs\Dokan\FieldFactory\Elements\Fields
 * @since   SUSPENDED
 */

namespace WeDevs\Dokan\FieldFactory\Elements\Fields;

use WeDevs\Dokan\FieldFactory\Abstracts\AbstractField;

/**
 * Class SwitchField
 */
class SwitchField extends AbstractField {

    /**
     * Field type.
     *
     * @var string
     */
    protected string $field_type = 'boolean';

    /**
     * Field variant (Edit control).
     *
     * @var string
     */
    protected string $variant = 'toggle';

    /**
     * Switcher type (visual style).
     *
     * @var string|null
     */
    protected ?string $switcher_type = null;

    /**
     * Whether confirmation is required before change.
     *
     * @var bool
     */
    protected bool $should_confirm = false;

    /**
     * Confirmation modal configuration.
     *
     * @var array
     */
    protected array $confirm_modal = [];

    /**
     * {@inheritdoc}
     */
    protected function get_fillable_properties(): array {
        return array_merge(
            parent::get_fillable_properties(),
            [
                'switcher_type',
                'should_confirm',
                'confirm_modal',
            ]
        );
    }

    /**
     * Check if switch is on.
     *
     * @param array $item Optional item context.
     *
     * @return bool
     */
    public function is_on( array $item = [] ): bool {
        $value      = $this->get_value( $item );
        $enable_val = $this->enable_state['value'] ?? true;

        return $value === $enable_val
            || $value === true
            || $value === 'on'
            || $value === 'yes'
            || $value === '1'
            || $value === 1;
    }

    /**
     * Get the enabled value.
     *
     * @return mixed
     */
    public function get_enabled_value() {
        return $this->enable_state['value'] ?? 'on';
    }

    /**
     * Get the disabled value.
     *
     * @return mixed
     */
    public function get_disabled_value() {
        return $this->disable_state['value'] ?? 'off';
    }

    /**
     * Get enabled state label.
     *
     * @return string
     */
    public function get_enabled_label(): string {
        return $this->enable_state['title'] ?? __( 'Enabled', 'dokan-lite' );
    }

    /**
     * Get disabled state label.
     *
     * @return string
     */
    public function get_disabled_label(): string {
        return $this->disable_state['title'] ?? __( 'Disabled', 'dokan-lite' );
    }

    /**
     * Check if confirmation required.
     *
     * @return bool
     */
    public function requires_confirmation(): bool {
        return $this->should_confirm;
    }

    /**
     * Get confirmation modal config.
     *
     * @return array
     */
    public function get_confirm_modal(): array {
        return $this->confirm_modal;
    }

    /**
     * Toggle the switch value.
     *
     * @return self
     */
    public function toggle(): self {
        if ( $this->is_on() ) {
            $this->value = $this->get_disabled_value();
        } else {
            $this->value = $this->get_enabled_value();
        }

        return $this;
    }
}

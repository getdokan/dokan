<?php

namespace WeDevs\Dokan\Admin\Settings\Elements\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;

/**
 * Switcher Field.
 *
 * Custom field that provides a toggle switch for boolean values.
 */
class Switcher extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'switch';

    /**
     * Options.
     *
     * @var array $options Options.
     */
    protected $states = array();

    /**
     * Switcher type (e.g., 'error' for error styling).
     *
     * @var string|null $switcher_type Switcher type.
     */
    protected $switcher_type = null;

    /**
     * Should confirm before enabling.
     *
     * @var bool $should_confirm Should confirm.
     */
    protected $should_confirm = false;

    /**
     * Confirmation modal settings.
     *
     * @var array $confirm_modal Confirmation modal settings.
     */
    protected $confirm_modal = array();


    /**
     * Get options.
     *
     * @return array
     */
    public function get_states(): array {
        return $this->states;
    }

    /**
     * Set active value.
     *
     * @param string $label Enable state label.
     * @param string $value Enable state value.
     *
     * @return Switcher
     */
    public function set_enable_state( string $label, string $value ): Switcher {
        $this->states['enable'] = array(
            'value' => $value,
            'title' => $label,
        );

        return $this;
    }



    /**
     * Get active value.
     *
     * @return array
     */
    public function get_enable_state(): array {
        return $this->states['enable'];
    }

    public function set_disable_state( string $label, string $value ): Switcher {
        $this->states['disable'] = array(
            'value' => $value,
            'title' => $label,
        );

        return $this;
    }

    /**
     * Get active value.
     *
     * @return array
     */
    public function get_disable_state(): array {
        return $this->states['disable'];
    }

    /**
     * Get switcher type.
     *
     * @return string|null
     */
    public function get_switcher_type(): ?string {
        return $this->switcher_type;
    }

    /**
     * Set switcher type.
     *
     * @param string $switcher_type Switcher type (e.g., 'error').
     *
     * @return Switcher
     */
    public function set_switcher_type( string $switcher_type ): Switcher {
        $this->switcher_type = $switcher_type;

        return $this;
    }

    /**
     * Get should confirm.
     *
     * @return bool
     */
    public function get_should_confirm(): bool {
        return $this->should_confirm;
    }

    /**
     * Set should confirm.
     *
     * @param bool $should_confirm Should confirm before enabling.
     *
     * @return Switcher
     */
    public function set_should_confirm( bool $should_confirm ): Switcher {
        $this->should_confirm = $should_confirm;

        return $this;
    }

    /**
     * Get confirmation modal settings.
     *
     * @return array
     */
    public function get_confirm_modal(): array {
        return $this->confirm_modal;
    }

    /**
     * Set confirmation modal settings.
     *
     * @param array $settings Modal settings (title, description, confirmText, cancelText, checkboxLabel).
     *
     * @return Switcher
     */
    public function set_confirm_modal( array $settings ): Switcher {
        $this->confirm_modal = $settings;

        return $this;
    }

    /**
     * Populate settings array.
     *
     * @return array
     */
    public function populate(): array {
        $data                   = parent::populate();
        $data['default']        = $this->get_default();
        $data['image_url']      = $this->get_image_url();
        $data['enable_state']   = $this->get_enable_state();
        $data['disable_state']  = $this->get_disable_state();
        $data['switcher_type']  = $this->get_switcher_type();
        $data['should_confirm'] = $this->get_should_confirm();
        $data['confirm_modal']  = $this->get_confirm_modal();

        return $data;
    }
}

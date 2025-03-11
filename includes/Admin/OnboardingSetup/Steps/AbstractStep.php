<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Abstracts\Settings;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * The abstract step class.
 *
 * @since DOKAN_SINCE
 */
abstract class AbstractStep extends Settings implements StepInterface, Hookable {

    /**
     * The step ID.
     *
     * @var string
     */
    protected $id = '';

    /**
     * The step priority.
     *
     * @var int
     */
    protected int $priority = 100;

    /**
     * The storage key.
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step';

    /**
     * Get the step ID.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
	public function get_id(): string {
        return $this->id;
    }

    /**
     * Register the hooks.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_admin_setup_guide_steps', [ $this, 'enlist' ] );
        add_action( 'dokan_settings_after_save_' . $this->storage_key, [ $this, 'option_dispatcher' ] );
    }

    /**
     * Enlist the steps.
     *
     * @since DOKAN_SINCE
     *
     * @param AbstractStep[] $steps The steps to enlist.
     *
     * @return AbstractStep[] The enlisted steps.
     */
    public function enlist( array $steps ): array {
        $steps[] = $this;

        return $steps;
    }

    /**
     * Get the step priority.
     *
     * @since DOKAN_SINCE
     *
     * @return int
     */
    public function get_priority(): int {
        return $this->priority;
    }

    /**
     * Register the scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
	abstract public function register(): void;

    /**
     * Get the scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string>
     */

	abstract public function scripts(): array;

    /**
     * Get the styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string>
     */

	abstract public function styles(): array;

    /**
     * Describe the settings options.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
	abstract public function describe_settings(): void;

    /**
     * Get the settings options for frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
	abstract public function settings(): array;

    /**
     * Get the settings options.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_completed(): bool {
        return get_option( $this->storage_key . '_completed', false );
    }

    /**
     * Dispatch the options to settings options.
     *
     * @since DOKAN_SINCE
     *
     * @param mixed $data The data to dispatch.
     *
     * @return void
     */
    public function option_dispatcher( $data ): void {
        update_option( $this->storage_key . '_completed', true );
    }
}

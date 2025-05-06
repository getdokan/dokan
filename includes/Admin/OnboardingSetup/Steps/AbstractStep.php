<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Abstracts\Settings;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * The abstract step class.
 *
 * @since 4.0.0
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
     * The step skippable or not.
     * The default is true.
     *
     * @var bool $skippable The step skippable or not.
     */
    protected bool $skippable = true;

    /**
     * The storage key.
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step';

    /**
     * The settings options.
     *
     * @var array
     */
    protected $settings_options = [];

    /**
     * Get the step ID.
     *
     * @since 4.0.0
     *
     * @return string
     */
	public function get_id(): string {
        return $this->id;
    }

    /**
     * Register the hooks.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_admin_setup_guide_steps', [ $this, 'enlist' ] );
        add_action( 'dokan_settings_after_save_' . $this->storage_key, [ $this, 'dispatch' ] );
        add_action( 'updated_option', [ $this, 'listen_for_settings_save' ], 10, 3 );
    }

    /**
     * Enlist the steps.
     *
     * @since 4.0.0
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
     * @since 4.0.0
     *
     * @return int
     */
    public function get_priority(): int {
        return $this->priority;
    }

    /**
     * Get the step skippable or not.
     *
     * @since 4.0.0
     *
     * @return bool
     */
    public function get_skippable(): bool {
        /**
         * Filters whether a step is skippable.
         * Allows overriding the skippable status of a specific setup step.
         *
         * @since 4.0.0
         *
         * @param bool $skippable Whether the step can be skipped.
         *
         * @return bool Modified skippable status.
         */
        return apply_filters( $this->storage_key . '_skippable', $this->skippable );
    }

    /**
     * Register the scripts and styles.
     *
     * @since 4.0.0
     *
     * @return void
     */
	abstract public function register(): void;

    /**
     * Get the scripts.
     *
     * @since 4.0.0
     *
     * @return array<string>
     */

	abstract public function scripts(): array;

    /**
     * Get the styles.
     *
     * @since 4.0.0
     *
     * @return array<string>
     */

	abstract public function styles(): array;

    /**
     * Describe the settings options.
     *
     * @since 4.0.0
     *
     * @return void
     */
	abstract public function describe_settings(): void;

    /**
     * Get the settings options for frontend.
     *
     * @since 4.0.0
     *
     * @return array
     */
	abstract public function settings(): array;

    /**
     * Dispatch the options to settings options.
     *
     * @since 4.0.0
     *
     * @param mixed $data The data to dispatch.
     *
     * @return void
     */
	abstract public function option_dispatcher( $data ): void;

    /**
     * Get the settings options.
     *
     * @since 4.0.0
     *
     * @return array
     */
    public function get_settings_options(): array {
        /**
         * Filters the settings options for a specific setup step.
         * Allows modification of the settings options for a particular step
         * identified by its ID.
         *
         * @since 4.0.0
         *
         * @param array $settings_options Array of settings options for the step.
         *
         * @return array Modified settings options.
         */
        return apply_filters( 'dokan_admin_setup_guide_step_' . $this->get_id() . '_options', $this->settings_options );
    }

    /**
     * Get the settings options.
     *
     * @since 4.0.0
     *
     * @return bool
     */
    public function is_completed(): bool {
        return get_option( $this->storage_key . '_completed', false );
    }

    /**
     * Dispatch the options to settings options.
     *
     * @since 4.0.0
     *
     * @param mixed $data The data to dispatch.
     *
     * @return void
     */
    public function dispatch( $data ): void {
        remove_action( 'updated_option', [ $this, 'listen_for_settings_save' ] );
        $this->mark_as_complete();
        $this->option_dispatcher( $data );
        add_action( 'updated_option', [ $this, 'listen_for_settings_save' ], 10, 3 );
    }

    /**
     * Listen for settings save.
     *
     * @since 4.0.0
     *
     * @param string $option The option to listen for.
     *
     * @return void
     */
    public function listen_for_settings_save( $option ) {
        if ( ! in_array( $option, $this->get_settings_options(), true ) ) {
            return;
        }

        $this->mark_as_complete();
        delete_option( $this->storage_key );
    }

    /**
     * Mark the step as complete.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function mark_as_complete() {
        update_option( $this->storage_key . '_completed', true );
    }
}

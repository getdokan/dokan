<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

/**
 * The step interface.
 *
 * @since 4.0.0
 */
interface StepInterface {

    /**
     * Get the step ID.
     *
     * @since 4.0.0
     *
     * @return string The step ID.
     */
    public function get_id(): string;

    /**
     * Get settings options to check for.
     *
     * @since 4.0.0
     *
     * @return string[] The settings options.
     */
    public function get_settings_options(): array;

    /**
     * Get the step priority.
     *
     * @since 4.0.0
     *
     * @return int The step priority.
     */
    public function get_priority(): int;

    /**
     * Get the step skippable or not.
     *
     * @since 4.0.0
     *
     * @return bool
     */
    public function get_skippable(): bool;

    /**
     * Register the step scripts and styles.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function register();

    /**
     * Get the step scripts.
     *
     * @since 4.0.0
     *
     * @return array The step scripts.
     */
    public function scripts(): array;

    /**
     * Get the step styles.
     *
     * @since 4.0.0
     *
     * @return array The step styles.
     */
    public function styles(): array;

    /**
     * Pass the settings options to frontend.
     *
     * @since 4.0.0
     *
     * @return array The settings options.
     */
    public function settings(): array;

    /**
     * Describe the settings options.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function option_dispatcher( $data ): void;
}

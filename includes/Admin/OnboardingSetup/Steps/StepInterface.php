<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

/**
 * The step interface.
 *
 * @since DOKAN_SINCE
 */
interface StepInterface {

    /**
     * Get the step ID.
     *
     * @since DOKAN_SINCE
     *
     * @return string The step ID.
     */
    public function get_id(): string;

    /**
     * Get settings options to check for.
     *
     * @since DOKAN_SINCE
     *
     * @return string[] The settings options.
     */
    public function get_settings_options(): array;

    /**
     * Get the step priority.
     *
     * @since DOKAN_SINCE
     *
     * @return int The step priority.
     */
    public function get_priority(): int;

    /**
     * Get the step skippable or not.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function get_skippable(): bool;

    /**
     * Register the step scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register();

    /**
     * Get the step scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array The step scripts.
     */
    public function scripts(): array;

    /**
     * Get the step styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array The step styles.
     */
    public function styles(): array;

    /**
     * Pass the settings options to frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array The settings options.
     */
    public function settings(): array;

    /**
     * Describe the settings options.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function option_dispatcher( $data ): void;
}

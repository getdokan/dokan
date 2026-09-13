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
     * Get the step title.
     *
     * @since DOKAN_SINCE
     *
     * @return string The step title.
     */
    public function get_title(): string;

    /**
     * Canonical SettingsSchema field ids this step exposes, in display order.
     *
     * The step harvests these fields from the shared admin settings schema and
     * saves their values into the single `dokan_admin_settings` option, so the
     * wizard and the settings page stay one source of truth.
     *
     * @since DOKAN_SINCE
     *
     * @return string[] The canonical field ids.
     */
    public function get_field_ids(): array;

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
}

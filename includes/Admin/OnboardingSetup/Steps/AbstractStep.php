<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Abstracts\Settings;
use WeDevs\Dokan\Admin\Settings\Repository\SettingsRepository;
use WeDevs\Dokan\Admin\Settings\Schema\SettingsRegistry;
use WeDevs\Dokan\Contracts\Hookable;

/**
 * The abstract step class.
 *
 * A setup step is a curated view over the shared admin settings schema. Instead
 * of declaring its own field tree, a step lists the canonical {@see SettingsSchema}
 * field ids it exposes via {@see get_field_ids()}. The step harvests those fields
 * from {@see SettingsRegistry} and saves their values into the single
 * `dokan_admin_settings` option through {@see SettingsRepository}, so the wizard
 * and the settings page remain one source of truth. Legacy options
 * (`dokan_selling`, `dokan_withdraw`, ...) stay in sync automatically through the
 * settings legacy read-overlay — the step never writes them directly.
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
     * Retained as the namespace for the per-step completion flag
     * (`{storage_key}_completed`). Setting values are NOT stored here — they go
     * to the single `dokan_admin_settings` option keyed by canonical field id.
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step';

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
     * Canonical SettingsSchema field ids this step exposes, in display order.
     *
     * @since DOKAN_SINCE
     *
     * @return string[]
     */
    abstract public function get_field_ids(): array;

    /**
     * No-op: steps no longer describe their own field tree.
     *
     * Required because {@see Settings} declares `describe_settings()` abstract and
     * invokes it on `init`. The field tree now comes from {@see populate()}.
     *
     * @since 4.0.0
     *
     * @return void
     */
    public function describe_settings(): void {}

    /**
     * Harvest this step's elements from the canonical admin settings schema.
     *
     * Returns a page subtree — `[ page, section, ...fields ]` — consumable by the
     * plugin-ui Onboarding component. Fields are re-parented under one section and
     * carry their current values (populated by {@see SettingsRegistry}).
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function populate(): array {
        $registry   = dokan_get_container()->get( SettingsRegistry::class );
        $schema     = $registry->get_schema();
        $wanted     = array_flip( $this->get_field_ids() );
        $page_id    = $this->get_id();
        $section_id = $page_id . '_section';

        // Index the wanted field elements by id for ordered lookup.
        $by_id = [];
        foreach ( $schema as $element ) {
            if ( ! is_array( $element ) || 'field' !== ( $element['type'] ?? '' ) ) {
                continue;
            }
            if ( isset( $wanted[ $element['id'] ] ) ) {
                $by_id[ $element['id'] ] = $element;
            }
        }

        $elements = [
            [
                'id'        => $page_id,
                'type'      => 'page',
                'label'     => $this->get_title(),
                'hide_save' => true,
            ],
            [
                'id'         => $section_id,
                'type'       => 'section',
                'page_id'    => $page_id,
            ],
        ];

        // Preserve the declared order from get_field_ids(); re-parent each field
        // under the wizard section and drop pointers to the settings-page layout.
        foreach ( $this->get_field_ids() as $field_id ) {
            if ( ! isset( $by_id[ $field_id ] ) ) {
                // e.g. a Pro-only id absent on this install — skip silently.
                continue;
            }

            $field = $by_id[ $field_id ];
            unset( $field['page_id'], $field['subpage_id'], $field['tab_id'], $field['field_group_id'] );
            $field['section_id'] = $section_id;
            $elements[]          = $field;
        }

        return $elements;
    }

    /**
     * Return only the field elements (used by the REST update response).
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function populate_children_only(): array {
        return array_values(
            array_filter(
                $this->populate(),
                static function ( $element ) {
                    return 'field' === ( $element['type'] ?? '' );
                }
            )
        );
    }

    /**
     * Persist a flat canonical-id payload into `dokan_admin_settings`.
     *
     * Only ids this step declares are written (whitelist). The legacy read-overlay
     * keeps `dokan_selling`/`dokan_withdraw`/... in sync on read — no direct legacy
     * write is needed.
     *
     * @since 4.0.0
     *
     * @param mixed $data canonical_field_id => value map.
     *
     * @return bool
     */
    public function save( $data ): bool {
        $allowed = array_flip( $this->get_field_ids() );
        $slice   = is_array( $data ) ? array_intersect_key( $data, $allowed ) : [];

        dokan_get_container()
            ->get( SettingsRepository::class )
            ->update( $slice );

        $this->mark_as_complete();

        return true;
    }

    /**
     * Whether the step has been completed.
     *
     * @since 4.0.0
     *
     * @return bool
     */
    public function is_completed(): bool {
        return (bool) get_option( $this->storage_key . '_completed', false );
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

<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup;

use WeDevs\Dokan\Admin\OnboardingSetup\Steps\AbstractStep;
use WeDevs\Dokan\Contracts\Hookable;

class AdminSetupGuide {

    /**
     * Steps.
     *
     * @since DOKAN_SINCE
     *
     * @var array< AbstractStep >
     */
    protected array $steps = [];

    /**
     * The setup completed option.
     *
     * @var string
     */
    protected string $setup_completed_option = 'dokan_admin_setup_guide_steps_completed';

    /**
     * Get all steps.
     *
     * @since DOKAN_SINCE
     *
     * @return array< AbstractStep >
     *
     * @throws \InvalidArgumentException If the step is not an instance of AbstractStep.
     */
    public function get_steps(): array {
        $steps = apply_filters( 'dokan_admin_setup_guide_steps', $this->steps );

        if ( ! is_array( $steps ) ) {
            return $this->steps;
        }

        $filtered_steps = array_filter(
            $steps, function ( $step ) {
				if ( ! $step instanceof AbstractStep ) {
					throw new \InvalidArgumentException( esc_html__( 'The admin onboarding step must be an instance of AbstractStep.', 'dokan-lite' ) );
				}
				return true;
			}
        );

        // Sort the steps by priority.
        usort(
            $filtered_steps, function ( $a, $b ) {
				return $a->get_priority() <=> $b->get_priority();
			}
        );

        return array_values( $filtered_steps );
    }


    /**
     * Get the steps mapper.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function get_steps_mapper(): array {
        $steps  = $this->get_steps();
        $mapper = [];

        foreach ( $steps as $index => $step ) {
            $mapper[] = [
                'title'         => $step->get_title(),
                'id'            => $step->get_id(),
                'is_completed'  => $step->is_completed(),
                'skippable'     => $step->get_skippable(),
                'previous_step' => $index > 0 ? $steps[ $index - 1 ]->get_id() : '',
                'next_step'     => $index < count( $steps ) - 1 ? $steps[ $index + 1 ]->get_id() : '',
            ];
        }

        return apply_filters( 'dokan_admin_setup_guide_steps_mapper', $mapper );
    }

    /**
     * Check if the setup is complete.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function is_setup_complete(): bool {
        // TODO: make this extensible by adding a filter.
        if ( $this->get_setup_complete() ) {
            return true;
        }

        $steps = $this->get_steps();

        foreach ( $steps as $step ) {
            if ( ! $step->is_completed() ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Set the setup complete.
     *
     * @since DOKAN_SINCE
     *
     * @param bool $value The value to set.
     *
     * @return bool
     */
    public function set_setup_complete( bool $value = true ): bool {
        return update_option( $this->setup_completed_option, $value );
    }

    /**
     * Get the setup complete from option.
     *
     * @since DOKAN_SINCE
     *
     * @return bool
     */
    public function get_setup_complete(): bool {
        return get_option( $this->setup_completed_option, false );
    }

    /**
     * Get the styles.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function styles(): array {
        return array_reduce(
            $this->get_steps(), function ( $styles, AbstractStep $step ) {
				return array_merge( $styles, $step->styles() );
			}, []
        );
    }

    /**
     * Get the scripts.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function scripts(): array {
        return array_reduce(
            $this->get_steps(), function ( $scripts, AbstractStep $step ) {
				return array_merge( $scripts, $step->scripts() );
			}, []
        );
    }

    /**
     * Register the steps scripts and styles.
     *
     * @since DOKAN_SINCE
     *
     * @return void
     */
    public function register(): void {
        array_map(
            function ( AbstractStep $step ) {
                $step->register();
            }, $this->get_steps()
        );
    }

    /**
     * Describe the settings options for frontend.
     *
     * @since DOKAN_SINCE
     *
     * @return array
     */
    public function settings(): array {
        return array_reduce(
            $this->get_steps(), function ( $settings, AbstractStep $step ) {
				return array_merge( $settings, [ $step->get_id() => $step->settings() ] );
			}, [ 'steps' => $this->get_steps_mapper() ]
        );
    }
}

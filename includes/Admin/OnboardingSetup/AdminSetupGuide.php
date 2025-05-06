<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup;

use WeDevs\Dokan\Admin\OnboardingSetup\Steps\AbstractStep;

class AdminSetupGuide {

    /**
     * Steps.
     *
     * @since 4.0.0
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
     * @since 4.0.0
     *
     * @return array< AbstractStep >
     *
     * @throws \InvalidArgumentException If the step is not an instance of AbstractStep.
     */
    public function get_steps(): array {
        /**
         * Filters the list of setup guide steps.
         * Allows modification of the setup guide steps array before processing.
         * Each step must be an instance of AbstractStep.
         *
         * @since 4.0.0
         *
         * @param array $steps Array of AbstractStep instances.
         *
         * @return array Modified array of steps.
         */
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
     * @since 4.0.0
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

        /**
         * Filters the steps mapper array for setup guide.
         * Allows modification of the steps mapper data which includes step title, ID,
         * completion status, and navigation details.
         *
         * @since 4.0.0
         *
         * @param array $mapper Array of step mapping information including title, ID,
         *                      completion status, and previous/next step references.
         *
         * @return array Modified steps mapper array.
         */
        return apply_filters( 'dokan_admin_setup_guide_steps_mapper', $mapper );
    }

    /**
     * Check if the setup is complete.
     *
     * @since 4.0.0
     *
     * @return bool
     */
    public function is_setup_complete(): bool {
        $setup_complete = $this->get_setup_complete();

        if ( ! $setup_complete ) {
            foreach ( $this->get_steps() as $step ) {
                if ( ! $step->is_completed() ) {
                    $setup_complete = false;
                    break;
                }
            }
        }

        /**
         * Filters whether the admin setup is complete.
         * Allows overriding the setup completion status determined by checking
         * all individual steps.
         *
         * @since 4.0.0
         *
         * @param bool $setup_complete Whether all setup steps are completed.
         *
         * @return bool Modified setup completion status.
         */
        return apply_filters( 'dokan_admin_setup_guide_is_setup_complete', $setup_complete );
    }

    /**
     * Set the setup complete.
     *
     * @since 4.0.0
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
     * @since 4.0.0
     *
     * @return bool
     */
    public function get_setup_complete(): bool {
        return get_option( $this->setup_completed_option, false );
    }

    /**
     * Get the styles.
     *
     * @since 4.0.0
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
     * @since 4.0.0
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
     * @since 4.0.0
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
     * @since 4.0.0
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

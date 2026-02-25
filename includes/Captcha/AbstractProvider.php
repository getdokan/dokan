<?php
namespace WeDevs\Dokan\Captcha;

use WeDevs\Dokan\Contracts\Hookable;

/**
 * Base captcha provider.
 *
 * Provides shared helpers such as option access and readiness caching for
 * concrete captcha providers.
 *
 * @since 4.3.0
 */
abstract class AbstractProvider implements ProviderInterface, Hookable {
    /** Cached readiness */
    protected ?bool $ready = null;

    /** Convenience: get option from dokan appearance */
    protected function get_option( string $key, $default = '' ) {
        return function_exists( 'dokan_get_option' ) ? dokan_get_option( $key, 'dokan_appearance', $default ) : $default;
    }

    /**
     * Whether this provider is ready to be used.
     *
     * Implements lazy cached readiness and delegates the actual check to
     * compute_readiness().
     *
     * @return bool True if ready, false otherwise.
     */
	public function is_ready(): bool {
        if ( null !== $this->ready ) {
            return $this->ready;
        }
        $this->ready = $this->compute_readiness();
        return $this->ready;
    }


    /**
     * Compute provider readiness.
     *
     * Concrete providers must implement their own rules to decide whether they
     * are ready to operate (e.g., enabled plus required credentials provided).
     *
     * @return bool
     */
	abstract protected function compute_readiness(): bool;

    /**
     * Register hooks for the provider.
     *
     * This method is responsible for registering the necessary hooks and actions
     * required for the provider's functionality. Default implementation is empty.
     *
     * @return void
     */
    public function register_hooks(): void {
        add_filter( 'dokan_captcha_providers', [ $this, 'enlist' ] );
    }

    /**
     * Add the current provider to the list of providers.
     *
     * This method appends the current provider instance to the provided list of providers.
     *
     * @param  array  $providers  The existing list of providers.
     *
     * @return array The updated list of providers with the current provider added.
     */
    public function enlist( array $providers ): array {
        $providers[] = $this;

        return $providers;
    }

    /**
     * Convert a truthy-ish value to boolean.
     *
     * @param mixed $value Value to evaluate.
     *
     * @return bool
     */
    protected function to_bool( $value ): bool {
        $truthy = [ 'yes', 1, '1', 'true', 'on' ];
        if ( is_bool( $value ) ) {
            return $value;
        }
        $value = strtolower( (string) $value );

        return in_array( $value, $truthy, true );
    }
}

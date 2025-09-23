<?php

namespace WeDevs\Dokan\Contracts;

/**
 * Interface HooksRegisterInterface
 * This interface should be implemented by all classes that use WordPress hooks with the Dependency Management Container.
 * Implementing this interface ensures that the hooks are registered automatically.
 * If this interface is not implemented, the hooks must be registered manually by resolving the container.
 */
interface Hookable {
    /**
     * Register hooks for WordPress.
     * This method will be called automatically to register the hooks.
     *
     * @return void
     */
    public function register_hooks(): void;
}

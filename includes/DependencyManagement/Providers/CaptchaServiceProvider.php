<?php

namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Captcha\Providers\CloudflareTurnstileProvider;
use WeDevs\Dokan\Captcha\Providers\GoogleRecaptchaV3Provider;
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;
use WeDevs\Dokan\Captcha\Manager;

/**
 * Captcha Service Provider
 *
 * Registers the Captcha Manager into Dokan's DI container.
 */
class CaptchaServiceProvider extends BaseServiceProvider {

    protected $tags = [ 'captcha-services' ];

    protected $services = [
        Manager::class,
        GoogleRecaptchaV3Provider::class,
        CloudflareTurnstileProvider::class,
    ];

    /**
     * Register the classes.
     */
    public function register(): void {
        foreach ( $this->services as $service ) {
            $definition = $this->share_with_implements_tags( $service );
            $this->add_tags( $definition, $this->tags );
        }
    }
}

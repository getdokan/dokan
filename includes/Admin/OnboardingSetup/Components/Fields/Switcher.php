<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

/**
 * Switcher Field.
 *
 * Custom field that provides a toggle switch for boolean values.
 */
class Switcher extends Radio {

    /**
     * Input Type.
     *
     * @var string $input_type Input Type.
     */
    protected $input_type = 'switch';
}

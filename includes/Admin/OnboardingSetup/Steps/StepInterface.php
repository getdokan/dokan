<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

interface StepInterface {
    public function get_id();

    public function register();

    public function scripts(): array;
    public function styles(): array;
    public function settings(): array;
    public function option_dispatcher(): array;
}

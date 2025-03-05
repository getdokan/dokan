<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Abstracts\Settings;

abstract class AbstractStep extends Settings implements StepInterface {

    protected $id = '';
    protected $title = '';
    protected $description = '';
    protected $icon = '';
    protected $type = '';
    protected $data = '';
    public $hook_key = '';

	public function get_id(): string {
        return $this->id;
    }

	abstract public function register(): void;

	abstract public function scripts(): array;

	abstract public function styles(): array;

    /**
     * Describe the settings options
     *
     * @return void
     */
	abstract public function describe_settings(): void;
}

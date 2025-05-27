<?php

namespace WeDevs\Dokan\Admin\OnboardingSetup\Components;

use WeDevs\Dokan\Abstracts\SettingsElement;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Checkbox;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Commission\CategoryBasedCommission;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Commission\CombineInput;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Currency;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\MultiCheck;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Number;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Password;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Radio;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\RadioBox;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Select;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Switcher;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Tel;
use WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields\Text;


/**
 * Settings element Field.
 */
class Field extends SettingsElement {

	/**
	 * Is children Supported.
	 *
	 * @var bool $support_children Children support.
	 */
	protected $support_children = false;

	/**
	 * The Input Element Type.
	 *
	 * @var string $input_type The Input Element Type.
	 */
	protected $input_type = 'text';

	/**
	 * The Settings Element Type.
	 *
	 * @var string $type Type Field.
	 */
	protected $type = 'field';

	/**
	 * Map for the Input type.
	 *
	 * @var string[] $field_map Map for the Input type.
	 */
    protected $field_map = array(
		'text'                      => Text::class,
		'number'                    => Number::class,
		'checkbox'                  => Checkbox::class,
		'select'                    => Select::class,
		'radio'                     => Radio::class,
		'tel'                       => Tel::class,
		'password'                  => Password::class,
		'radio_box'                 => RadioBox::class,
		'switch'                    => Switcher::class,
		'multicheck'                => MultiCheck::class,
		'currency'                  => Currency::class,
		'combine_input'             => CombineInput::class,
		'category_based_commission' => CategoryBasedCommission::class,
	);

	/**
	 * Constructor.
	 *
	 * @param string $id ID of the input field.
	 * @param string $type Type of the input field.
	 */
	public function __construct( string $id, string $type = 'text' ) {
		parent::__construct( $id );
		$this->input_type = $type;
	}

	/**
	 * Get input field.
	 *
	 * @return SettingsElement
	 */
	public function get_input(): SettingsElement {
		return $this->input_map( $this->get_id(), $this->input_type );
	}

	/**
	 * Populate The Page Object.
	 *
	 * @return array
	 */
	public function populate(): array {
		$data            = parent::populate();
		$data['variant'] = $this->input_type;
		$data['value']   = $this->escape_element( $this->get_value() );

		return $data;
	}

	/**
	 * Data validation.
	 *
	 * @param mixed $data Data for validation.
	 *
	 * @return bool
	 */
	public function data_validation( $data ): bool {
		return isset( $data );
	}

	/**
	 * Map input type to respective input class.
	 *
	 * @param string $id ID.
	 * @param string $input_type Input Type.
	 *
	 * @return SettingsElement
	 */
	private function input_map( string $id, string $input_type ): SettingsElement {
		$class_name = $this->field_map[ $input_type ] ?? $this->field_map['text'];

        /**
         * Filters for setup guide field mapper.
         *
         * @since 4.0.0
         *
         * @param int    $id
         * @param string $input_type
         * @param string $class_name
         */
        $class_name = apply_filters( 'dokan_admin_setup_guide_field_mapper', $class_name, $id, $input_type );

		try {
			$reflection_class_name = new \ReflectionClass( $class_name );
			return $reflection_class_name->newInstance( $id );
		} catch ( \ReflectionException $e ) {
			return new Text( $id );
		}
	}

	/**
	 * Sanitize data for storage.
	 *
	 * @param mixed $data Data for sanitization.
	 *
	 * @return array|float|string
	 */
	public function sanitize_element( $data ) {
		return wp_unslash( $data );
	}

	/**
	 * Escape data for display.
	 *
	 * @param mixed $data Data for display.
	 *
	 * @return mixed
	 */
	public function escape_element( $data ) {
		return $data;
	}
}

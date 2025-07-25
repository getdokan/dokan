# Dokan Admin Setup Guide Documentation

- [Introduction](#introduction)
- [1. Adding a New Step](#adding-a-new-step)
    - [Create a New Step Class](#create-a-new-step-class)
    - [Register Your Step in Service Provider](#register-your-step-in-service-provider)
- [2. Adding New Field Types](#adding-new-field-types)
    - [Create PHP Field Class](#create-php-field-class)
    - [Register Your Field in Field Class](#register-your-field-in-field-class)
    - [Create React Component for Your Field](#create-react-component-for-your-field)
    - [Update FieldParser to Include Your Field](#update-fieldparser-to-include-your-field)
- [3. Accessing Field Settings](#accessing-field-settings)
- [4. Creating New Admin Dashboard Pages](#creating-new-admin-dashboard-pages)

## Introduction
The Dokan Admin Setup Guide provides a structured, step-by-step onboarding experience for administrators configuring a Dokan marketplace.  

This documentation covers how to create custom setup steps, implement UI components, and integrate with Dokan's settings system. With examples for both PHP and React implementation, developers can extend the onboarding process with additional configuration steps tailored to their marketplace requirements.

## Adding a New Step

### Create a New Step Class
Create a new PHP class that extends `AbstractStep`:

```php
<?php
namespace WeDevs\Dokan\Admin\OnboardingSetup\Steps;

use WeDevs\Dokan\Admin\OnboardingSetup\Components\ComponentFactory as Factory;

class YourNewStep extends AbstractStep {

    /**
     * The step ID.
     *
     * @var string
     */
    protected $id = 'your_new_step';

    /**
     * The step priority.
     *
     * @var int
     */
    protected int $priority = 90; // Controls the order in the setup flow

    /**
     * Whether this step can be skipped
     *
     * @var bool
     */
    protected bool $skippable = true;

    /**
     * The option storage key.
     *
     * @var string
     */
    protected $storage_key = 'dokan_admin_onboarding_setup_step_your_new_step';

    /**
     * The WordPress options this step will modify.
     *
     * @var array
     */
    protected $settings_options = [ 'dokan_your_settings_option' ];

    /**
     * Get default settings
     *
     * @return array
     */
    protected function get_default_settings(): array {
        return apply_filters(
            'dokan_admin_setup_guides_your_new_step_default_data',
            [
                'option_1' => 'default_value_1',
                'option_2' => 'default_value_2',
            ]
        );
    }

    /**
     * Register assets
     */
    public function register(): void {
        // Register scripts or localize data for current step if needed
    }

    /**
     * Scripts to enqueue
     */
    public function scripts(): array {
        return []; // Add dependency scripts handler here.
    }

    /**
     * Styles to enqueue
     */
    public function styles(): array {
        return []; // Add dependency styles handler here.
    }

    /**
     * Define the UI structure for this step
     */
    public function describe_settings(): void {
        // Get default and current settings
        $default_settings = $this->get_default_settings();
        $current_options  = get_option( 'dokan_your_settings_option', $default_settings );

        // Define the UI using ComponentFactory
        $this->set_title( esc_html__( 'Your New Step', 'dokan-lite' ) )
            ->add(
                Factory::section( 'main_section' )
                    ->set_title( esc_html__( 'Section Title', 'dokan-lite' ) )
                    ->add(
                        Factory::field( 'option_1', 'text' )
                            ->set_title( esc_html__( 'Option 1', 'dokan-lite' ) )
                            ->set_description( esc_html__( 'Description for option 1', 'dokan-lite' ) )
                            ->set_default( $default_settings['option_1'] )
                            ->set_value( $current_options['option_1'] ?? $default_settings['option_1'] )
                    )
                    // Add more fields as needed
            );
    }

    /**
     * Additional settings for frontend
     */
    public function settings(): array {
        return [];
    }

    /**
     * Save settings when submitted from frontend
     * 
     * @param mixed $data Data submitted from frontend
     */
    public function option_dispatcher( $data ): void {
        $default_settings = $this->get_default_settings();
        $current_options = get_option( 'dokan_your_settings_option', $default_settings );

        // Update settings from submitted data.
        if ( isset( $data['main_section'] ) ) {
            $current_options['option_1'] = $data['main_section']['option_1'] ?? $default_settings['option_1'];
            $current_options['option_2'] = $data['main_section']['option_2'] ?? $default_settings['option_2'];
        }

        // Save to database
        update_option( 'dokan_your_settings_option', $current_options );
    }
}
```

### Register Your Step in Service Provider
Add your step class to the `AdminSetupGuideServiceProvider`:

```php
<?php
namespace WeDevs\Dokan\DependencyManagement\Providers;

use WeDevs\Dokan\Admin\OnboardingSetup\AdminSetupGuide;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\BasicStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\CommissionStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\WithdrawStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\AppearanceStep;
use WeDevs\Dokan\Admin\OnboardingSetup\Steps\YourNewStep; // Add this line
use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminSetupGuideServiceProvider extends BaseServiceProvider {

    /**
     * Tag for services added to the container.
     */
    protected $tags = [ 'admin-setup-guide-service' ];

    /**
     * Services to register.
     */
    protected $services = [
        AdminSetupGuide::class,
        BasicStep::class,
        CommissionStep::class,
        WithdrawStep::class, 
        AppearanceStep::class,
        YourNewStep::class, // Add your step.
    ];

    // Rest of the provider remains the same
}
```

## Adding New Field Types

### Create PHP Field Class
Create a new PHP class for your field in `WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields`:

```php
<?php
namespace WeDevs\Dokan\Admin\OnboardingSetup\Components\Fields;

use WeDevs\Dokan\Abstracts\SettingsElement;

class YourCustomField extends SettingsElement {

    /**
     * The type of the field.
     *
     * @var string
     */
    protected $type = 'field';

    /**
     * The variant of the field.
     *
     * @var string
     */
    protected $variant = 'your_custom_field';

    /**
     * Data validation.
     *
     * @param mixed $data Data for validation.
     *
     * @return bool
     */
    public function data_validation( $data ): bool {
        // Implement validation logic
        return true;
    }

    /**
     * Sanitize data for storage.
     *
     * @param mixed $data Data for sanitization.
     *
     * @return mixed
     */
    public function sanitize_element( $data ) {
        // Implement sanitization logic.
        return sanitize_text_field( wp_unslash( $data ) );
    }

    /**
     * Escape data for display.
     *
     * @param mixed $data Data for display.
     *
     * @return mixed
     */
    public function escape_element( $data ) {
        // Implement escaping logic.
        return esc_html( $data );
    }
}
```

### Register Your Field in Field Class

Add your field to the map in `WeDevs\Dokan\Admin\OnboardingSetup\Components\Field` class :

```php
private $field_map = array(
    'text'              => Text::class,
    'number'            => Number::class,
    'checkbox'          => Checkbox::class,
    'select'            => Select::class,
    'radio'             => Radio::class,
    'tel'               => Tel::class,
    'password'          => Password::class,
    'radio_box'         => RadioBox::class,
    'switch'            => Switcher::class,
    'multicheck'        => MultiCheck::class,
    'currency'          => Currency::class,
    'combine_input'     => CombineInput::class,
    'your_custom_field' => YourCustomField::class, // Add your field class.
);
```

### Create React Component for Your Field

Create a React component in the frontend `/src/admin/onboarding-setup/elements/fields/` directory:

```tsx
import { useState, RawHTML } from '@wordpress/element';
import { SettingsProps } from '../../StepSettings';

const YourCustomField = ({ element, getSetting, onValueChange }: SettingsProps) => {
    const [ value, setValue ] = useState( element.value );

    if ( ! element.display ) {
        return <></>;
    }

    const handleValueChange = ( newValue ) => {
        setValue( newValue );
        onValueChange( {
            ...element,
            value: newValue,
        } );
    };

    return (
        <div className="col-span-4">
            <label
                htmlFor={ element?.hook_key }
                className="block text-sm font-medium text-gray-700"
            >
                <RawHTML>{ element.title }</RawHTML>
            </label>
            <p className="text-sm text-gray-500">
                <RawHTML>{ element.description }</RawHTML>
            </p>
            
            {/* Your custom field UI implementation */}
            <div className="mt-1">
                {/* Custom field UI here */}
            </div>
        </div>
    );
};

export default YourCustomField;
```

### Update FieldParser to Include Your Field

Add your field to the `FieldParser.tsx` component:

```tsx
import YourCustomField from './YourCustomField';

const FieldParser = ( { element, getSetting, onValueChange }: SettingsProps ) => {
    switch ( element.variant ) {
        case 'text':
            // Existing cases
        case 'your_custom_field':
            return (
                <YourCustomField
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
        default:
            return (
                <Text
                    key={ element.hook_key }
                    element={ element }
                    onValueChange={ onValueChange }
                    getSetting={ getSetting }
                />
            );
    }
};
```

### Accessing Field Settings

If field components often need to access values from other settings in the application. The `getSetting()` function provides a convenient way to retrieve settings by their unique `hook_key`.

Each field component in the setup guide receives a `getSetting` function as part of its `props`, which can be used to look up settings by their `hook_key`.

Here's an example of how to use the `getSetting` function within a field component to create dynamic behavior:

```tsx
import { useState } from '@wordpress/element';
import { SettingsProps } from '../../../StepSettings';

const YourCustomField = ({ 
    element, 
    onValueChange, 
    getSetting 
}: SettingsProps) => {
    if ( ! element.display ) {
        return <></>;
    }

  // Retrieve another setting's element object by using `hook_key`.
    const otherSetting = getSetting( 'hook_key' );
    
    // Use the value in your component logic
    const isFeatureEnabled = otherSetting?.value;

    // Component implementation
    return (
        <div id={ element.hook_key } className="my-field-container">
            { isFeatureEnabled && (
                <div className="conditional-section">
                    {/* Render conditional UI here */}
               </div>
            ) }
            
            {/* Rest of your field component */}
        </div>
    );
};

export default YourCustomField;
```

### Creating New Admin Dashboard Pages

The Dokan admin dashboard system provides a structured way to create and manage admin pages. Each page extends the `AbstractPage` class and implements the `Pageable` and `Hookable` interfaces, ensuring consistent behavior across the admin interface.

To create a new admin dashboard page, follow these steps:

```php
<?php

namespace WeDevs\Dokan\Admin\Dashboard\Pages;

class YourCustomPage extends AbstractPage {

    /**
     * Get the unique ID of the page.
     *
     * @since DOKAN_SINCE
     *
     * @return string
     */
    public function get_id(): string {
        return 'your-custom-page';
    }

    /**
     * Define the menu configuration.
     *
     * @since DOKAN_SINCE
     * 
     * @param string $capability Required capability to access the page
     * @param string $position   Menu position
     *
     * @return array Menu configuration array
     */
    public function menu( string $capability, string $position ): array {
        return [
            'page_title' => esc_html__( 'Your Custom Page', 'dokan-lite' ),
            'menu_title' => esc_html__( 'Custom Page', 'dokan-lite' ),
            'route'      => 'your-custom-page',
            'capability' => $capability,
            'position'   => 50,
            // 'hidden'     => false, // Set to true to hide from admin menu
        ];
    }

    /**
     * Page settings and data.
     *
     * @since DOKAN_SINCE
     *
     * @return array Settings array passed to frontend
     */
    public function settings(): array {
        return [
            'api_endpoint' => 'your-custom-endpoint',
            'custom_data'  => [
                'option_1' => get_option( 'your_option_1', 'default' ),
                'option_2' => get_option( 'your_option_2', 'default' ),
            ],
            'nonce' => wp_create_nonce( 'your_custom_nonce' ),
        ];
    }

    /**
     * Scripts to enqueue for this page.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string> Array of script handles
     */
    public function scripts(): array {
        return [ 'your-custom-script' ];
    }

    /**
     * Styles to enqueue for this page.
     *
     * @since DOKAN_SINCE
     *
     * @return array<string> Array of style handles
     */
    public function styles(): array {
        return [ 'your-custom-style' ];
    }

    /**
     * Register page scripts and styles.
     *
     * @return void
     */
    public function register(): void {
        // Register your scripts and styles here
        $asset_file = include DOKAN_DIR . '/assets/js/your-custom-script.asset.php';

        wp_register_script(
            'your-custom-script',
            DOKAN_PLUGIN_ASSEST . '/js/your-custom-script.js',
            $asset_file['dependencies'],
            $asset_file['version'],
            [
                'strategy'  => 'defer',
                'in_footer' => true,
            ]
        );

        wp_register_style(
            'your-custom-style',
            DOKAN_PLUGIN_ASSEST . '/css/your-custom-style.css',
            [],
            $asset_file['version']
        );

        // Localize script data if needed
        wp_localize_script(
            'your-custom-script',
            'yourCustomPageData',
            [
                'ajax_url' => admin_url( 'admin-ajax.php' ),
                'nonce'    => wp_create_nonce( 'your_custom_nonce' ),
            ]
        );
    }
}
```

#### Important Properties and Methods
##### Menu Configuration Properties

- **page_title:** The title displayed in the browser tab and page header.
- **menu_title:** The title shown in the WordPress admin menu
- **route:** The URL route for the page
- **capability:** WordPress capability required to access the page
- **position:** Numeric position in the admin menu (lower numbers appear first)

##### Asset Management

- **scripts():** Returns an array of script handles to enqueue for this page
- **styles():** Returns an array of style handles to enqueue for this page
- **register():** Method where you register and configure your scripts and styles

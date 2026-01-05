# Dokan Settings Migration Guide

This guide explains how to migrate Dokan settings to use the `@wedevs/plugin-settings` package.

## Overview

The `plugin-settings` package provides a reusable settings framework that can be used across multiple WordPress plugins. This migration allows:

- Consistent settings API across Dokan Lite, Dokan Pro, and other WeDevs plugins
- Easier maintenance and feature development
- Better extensibility for third-party developers

## Migration Steps

### 1. Install the Package

The package is included as a local dependency in Dokan:

**PHP (composer.json):**
```json
{
  "repositories": [
    {
      "type": "path",
      "url": "./packages/plugin-settings"
    }
  ],
  "require": {
    "wedevs/plugin-settings": "*"
  }
}
```

**JavaScript (package.json):**
```json
{
  "dependencies": {
    "@wedevs/plugin-settings": "file:./packages/plugin-settings"
  }
}
```

### 2. Update PHP Settings Pages

#### Before (Old API)
```php
namespace WeDevs\Dokan\Admin\Settings\Pages;

use WeDevs\Dokan\Admin\Settings\Abstracts\AbstractPage;
use WeDevs\Dokan\Admin\Settings\Elements\ElementFactory;

class GeneralPage extends AbstractPage {
    protected string $id = 'general';
    // ...
}
```

#### After (New API)
```php
namespace WeDevs\Dokan\Admin\Settings\Bridge\Pages;

use WeDevs\Dokan\Admin\Settings\Bridge\AbstractPage;
use WeDevs\Dokan\Admin\Settings\Bridge\ElementFactory;

class GeneralPage extends AbstractPage {
    protected string $id = 'general';
    // ...
}
```

The Bridge classes extend the package's base classes while adding Dokan-specific defaults.

### 3. Update Service Provider

```php
namespace WeDevs\Dokan\Admin\Settings\Bridge;

use WeDevs\Dokan\DependencyManagement\BaseServiceProvider;

class AdminSettingsServiceProvider extends BaseServiceProvider {
    
    protected $page_classes = [
        Pages\GeneralPage::class,
        // Add other pages as they are migrated
    ];

    public function register(): void {
        // Register Settings Manager
        $this->getContainer()->add( SettingsManager::class )
            ->setShared( true );

        // Register REST Controller
        $this->getContainer()->add( SettingsController::class )
            ->addArgument( SettingsManager::class )
            ->setShared( true );

        // Register pages
        foreach ( $this->page_classes as $page_class ) {
            $this->share_with_implements_tags( $page_class );
        }
    }
}
```

### 4. Update Frontend

#### Before (Old API)
```tsx
import { useSelect, useDispatch } from '@wordpress/data';

const Settings = () => {
    const settings = useSelect( ( select ) => 
        select( 'dokan/admin-settings' ).getSettings()
    );
    
    const { saveSettings } = useDispatch( 'dokan/admin-settings' );
    // ...
};
```

#### After (New API)
```tsx
import {
    SettingsPage,
    SettingsProvider,
    registerStore,
} from '@wedevs/plugin-settings';

// Register store
registerStore( 'dokan/admin-settings', {
    restEndpoint: '/dokan/v1/admin/settings',
} );

const Settings = () => {
    return (
        <SettingsProvider storeName="dokan/admin-settings">
            <SettingsPage
                title="Dokan Settings"
                // ... other props
            />
        </SettingsProvider>
    );
};
```

### 5. Register Custom Fields

```tsx
import { registerField } from '@wedevs/plugin-settings';
import { MyCustomField } from './fields/MyCustomField';

// Register custom field type
registerField( 'my-custom-field', MyCustomField );
```

### 6. Define Fields in PHP

```php
use WeDevs\Dokan\Admin\Settings\Bridge\ElementFactory;

// Text field
ElementFactory::field( 'store_url', 'text' )
    ->set_title( 'Store URL' )
    ->set_description( 'The vendor store URL prefix' )
    ->set_default( 'store' );

// Switch field
ElementFactory::field( 'enable_feature', 'switch' )
    ->set_title( 'Enable Feature' )
    ->set_default( 'off' );

// Select field with options
ElementFactory::field( 'map_provider', 'select' )
    ->set_title( 'Map Provider' )
    ->add_option( 'Google Maps', 'google' )
    ->add_option( 'Mapbox', 'mapbox' )
    ->set_default( 'google' );

// Field with dependency
ElementFactory::field( 'google_api_key', 'password' )
    ->set_title( 'Google API Key' )
    ->add_dependency( 'location.map_provider', 'google', true, 'display', 'show', '==' );
```

## Backwards Compatibility

The Bridge classes maintain backwards compatibility by:

1. **Legacy Option Storage**: Settings are saved to both the new format and legacy `dokan_*` options
2. **Filter Hooks**: All existing filter hooks are preserved
3. **REST API**: Same endpoints, same response format

## Gradual Migration

You can migrate pages one at a time:

1. Start with less critical pages (e.g., Appearance)
2. Test thoroughly
3. Move to more complex pages (e.g., General, Vendor)
4. Update frontend components incrementally

## Testing

After migration, verify:

- [ ] Settings load correctly
- [ ] Settings save correctly
- [ ] Dependencies work (show/hide fields)
- [ ] Search functionality works
- [ ] Legacy options are updated
- [ ] Existing integrations still work

## Troubleshooting

### Settings not loading
- Check REST endpoint is registered
- Verify capability permissions
- Check browser console for errors

### Dependency not working
- Verify dependency path format: `page.section.field`
- Check comparison operator is correct

### Custom field not rendering
- Ensure field is registered before use
- Check variant name matches registration


# Dokan Hooks

## Overview

`Dokan` provides a set of reusable `hooks` that can be used across both `Free` and `Premium` versions. This documentation explains how to properly set up and use `hooks` in your project.

## Important Dependencies

For both `Dokan Free and Pro` versions, we must register the `dokan-react-components` dependency when using `global` components.

### Implementation Example

```php
// Register scripts with `dokan-react-components` dependency
$script_assets = 'add_your_script_assets_path_here';

if (file_exists($script_assets)) {
    $vendor_asset = require $script_assets;
    $version      = $vendor_asset['version'] ?? '';

    // Add dokan-react-components as a dependency
    $component_handle = 'dokan-react-components';
    $dependencies    = $vendor_asset['dependencies'] ?? [];
    $dependencies[]  = $component_handle;

    // Register Script
    wp_register_script(
        'handler-name',
        'path_to_your_script_file',
        $dependencies,
        $version,
        true
    );

    // Register Style
    wp_register_style(
        'handler-name',
        'path_to_your_style_file',
        [ $component_handle ],
        $version
    );
}
```

## Component Access

For `Dokan free & premium version`, we can import the components via `@dokan/hooks`:

```js
import { useWindowDimensions } from '@dokan/hooks';
```

For external `plugins`, we must include the `dokan-react-components` as scripts dependency and the `@dokan/hooks` should be introduced as an external resource configuration to resolve the path via `webpack`:

```js
externals: {
    '@dokan/hooks': 'dokan.hooks',
    ...
},
```

## Adding Global Components

### File Structure

```
|____ src/
|        |___ hooks/
|        |      |___ index.tsx               # Main export file
|        |      |___ ViewportDimensions.tsx  # Existing hook
|        |      |___ YourHook                # Your new hook
|        |      |
|        |      |___ Other Files
|        |
|        |___ Other Files
|
|____ Other Files
```

**Finally,** we need to export the new `hook` from the `src/hooks/index.tsx` file. Then, we can import the new component via `@dokan/hooks`.

```tsx
export { default as useWindowDimensions } from '@/hooks/ViewportDimensions';
```

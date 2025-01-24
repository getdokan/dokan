# Dokan Components

## Overview

`Dokan` provides a set of reusable `components` that can be used across both `Free` and `Pro` versions. This documentation explains how to properly set up and use these `components` in your project.

## Important Dependencies

For both `Dokan Free and Pro` versions, we must register the `dokan-react-components` dependency when using `global` components.

### Implementation Example

```php
// Register scripts with dokan-react-components dependency
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

For `dokan free & premium version`, we can import the components via `@dokan/components`:

```js
import { DataViews } from '@dokan/components';
```

For external `plugins`, we must include the `dokan-react-components` as scripts dependency and the `@dokan/components` should be introduced as an external resource configuration to resolve the path via `webpack`:

```js
externals: {
    '@dokan/components': 'dokan.components',
    ...
},
```

## Adding Global Components

### File Structure

```
|____ src/
|        |___ components/
|        |      |___ index.tsx         # Main export file
|        |      |___ dataviews/        # Existing component
|        |      |___ your-component/   # Your new component directory
|        |      |     |___ index.tsx
|        |      |     |___ style.scss
|        |      |
|        |      |___ Other Files
|        |
|        |___ Other Files
|
|____ Other Files
```

**Finally,** we need to export the new `component` from the `src/components/index.tsx` file. Then, we can import the new component from `@dokan/components` in `dokan pro` version.

```ts
export { default as DataViews } from './dataviews/DataViewTable';
export { default as ComponentName } from './YourComponent';
```

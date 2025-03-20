# Dokan Components

## Overview

`Dokan` provides a set of reusable `components` that can be used across both `Free` and `Pro` versions. This documentation explains how to properly set up and use these `components` in your project.

## Available Components

1. **DataViews** - Data management component for tabular data display and manipulation
2. **DokanModal** - Flexible modal dialog system
3. **Filter** - Standardized filtering interface
4. **SortableList** - Drag-and-drop interface for managing sortable items
5. **Label Components** - Status label badges in different styles (Warning, Info, Success, Danger)

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
import { DataViews, SuccessLabel } from '@dokan/components';
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
|        |      |___ dokan-modal/      # Modal component
|        |      |___ filter/           # Filter component 
|        |      |___ sortable-list/    # Sortable list component
|        |      |___ label/            # Label components
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
export { default as DokanModal } from './dokan-modal/DokanModal';
export { default as Filter } from './filter/Filter';
export { default as SortableList } from './sortable-list/SortableList'; 
export { 
    WarningLabel, 
    InfoLabel, 
    SuccessLabel, 
    DangerLabel 
} from './label/Label';
export { default as ComponentName } from './YourComponent';
```

## Label Components

`Dokan` provides a set of standardized label components used for displaying status badges in different visual styles. These components are built on top of the `Badge` component from `@getdokan/dokan-ui`.

### Available Label Components

- **WarningLabel** - Yellow styled badge for warning states
- **InfoLabel** - Blue styled badge for informational states
- **SuccessLabel** - Green styled badge for success states
- **DangerLabel** - Red styled badge for error or danger states

### Usage Example

```jsx
import { WarningLabel, InfoLabel, SuccessLabel, DangerLabel } from '@dokan/components';

const StatusBadges = () => {
    return (
        <div className="flex space-x-2">
            <SuccessLabel label="Active" />
            <InfoLabel label="Processing" />
            <WarningLabel label="Pending" />
            <DangerLabel label="Failed" />
        </div>
    );
};
```

### Label Component Properties

All Label components accept the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | The text to display in the badge |
| `...props` | `BadgeProps` | No | Any additional props from the Badge component |

Each label type applies specific styling appropriate for its semantic meaning:

- **WarningLabel** - Yellow background with matching text and ring
- **InfoLabel** - Blue background with matching text and ring
- **SuccessLabel** - Green background with matching text and ring
- **DangerLabel** - Red background with matching text and ring

The labels use Tailwind CSS for styling and maintain a consistent design language throughout the Dokan interface.

# Dokan Components

## Overview

`Dokan` provides a set of reusable `components` that can be used across both `Free` and `Pro` versions. This documentation explains how to properly set up and use these `components` in your project.

## Available Components

1. **DataViews** - Data management component for tabular data display and manipulation
2. **DokanModal** - Flexible modal dialog system
3. **Filter** - Standardized filtering interface
4. **SortableList** - Drag-and-drop interface for managing sortable items
5. **Button Components** - Button variants for different contexts (Primary, Secondary, Tertiary, Status-specific)
6. **Anchor Components** - Link elements styled as buttons for consistent UI
7. **Label Components** - Status label badges in different styles (Warning, Info, Success, Danger)
8. **Alert Components** - Contextual alert notifications with different severity levels

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
import { DataViews, SuccessLabel, Button, Anchor } from '@dokan/components';
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
|        |      |___ Button.tsx        # Button components
|        |      |___ Anchor.tsx        # Anchor components
|        |      |___ Label.tsx         # Label components
|        |      |___ Alert.tsx         # Alert components
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
export { default as DokanModal } from './modals/DokanModal';
export { default as Filter } from './Filter';
export { default as SortableList } from './sortable-list'; 
export { 
    Button,
    SecondaryButton,
    TertiaryButton,
    InfoButton,
    SuccessButton,
    WarningButton,
    DangerButton
} from './Button';
export { 
    Anchor,
    PrimaryAnchor,
    SecondaryAnchor,
    TertiaryAnchor,
    OutlineAnchor,
    InfoAnchor,
    SuccessAnchor,
    WarningAnchor,
    DangerAnchor
} from './Anchor';
export { 
    WarningLabel, 
    InfoLabel, 
    SuccessLabel, 
    DangerLabel 
} from './Label';
export {
    InfoAlert,
    WarningAlert,
    SuccessAlert,
    DangerAlert
} from './Alert';
export { default as ComponentName } from './YourComponent';
```

## Button Components

`Dokan` provides a set of standardized button components used throughout the interface. These components are built on top of the `Button` component from `@getdokan/dokan-ui` and are styled consistently with the Dokan design system.

### Available Button Components

#### Variant Buttons
- **Button** - Primary button (default)
- **SecondaryButton** - Secondary button style
- **TertiaryButton** - Tertiary button style

#### Status-Specific Buttons
- **InfoButton** - Blue styled button for informational actions
- **SuccessButton** - Green styled button for confirmation actions
- **WarningButton** - Yellow styled button for cautionary actions
- **DangerButton** - Red styled button for destructive actions

### Usage Example

```jsx
import { 
  Button,
  SecondaryButton,
  TertiaryButton,
  InfoButton,
  SuccessButton,
  WarningButton,
  DangerButton
} from '@dokan/components';

const ButtonsExample = () => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Variant Buttons */}
      <Button>Primary Button</Button>
      <SecondaryButton>Secondary Button</SecondaryButton>
      <TertiaryButton>Tertiary Button</TertiaryButton>
      
      {/* Status Buttons */}
      <InfoButton>Info Button</InfoButton>
      <SuccessButton>Success Button</SuccessButton>
      <WarningButton>Warning Button</WarningButton>
      <DangerButton>Danger Button</DangerButton>
      
      {/* Button Sizes */}
      <Button size="sm">Small Button</Button>
      <Button>Default Size</Button>
      <Button size="lg">Large Button</Button>
      
      {/* Button States */}
      <Button disabled>Disabled Button</Button>
      <Button loading={true}>Loading Button</Button>
    </div>
  );
};
```

### Button Component Properties

All Button components accept the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | The content to be displayed within the button |
| `className` | `string` | No | Additional CSS classes for custom styling |
| `size` | `"sm" \| "md" \| "lg"` | No | Button size (small, medium, large) |
| `disabled` | `boolean` | No | Whether the button is disabled |
| `loading` | `boolean` | No | Whether to show a loading indicator |
| `...props` | `ButtonProps` | No | Any additional props from the Button component |

Each button type applies specific styling appropriate for its semantic meaning:
- **Button (Primary)** - Purple background with white text (brand primary color)
- **SecondaryButton** - White background with purple text and border
- **TertiaryButton** - Transparent background with purple text
- **InfoButton** - Blue styling for informational actions
- **SuccessButton** - Green styling for confirmation actions
- **WarningButton** - Yellow styling for cautionary actions
- **DangerButton** - Red styling for destructive actions

The buttons use Tailwind CSS for styling and maintain a consistent design language throughout the Dokan interface.

### CSS Classes for Buttons

For more flexibility, you can also use predefined CSS classes directly with native `button` elements or other UI components:

#### Default Button
```html
<button class="dokan-btn">Default Button</button>
```

#### Button Variants
```html
<button class="dokan-btn dokan-btn-primary">Primary Button</button>
<button class="dokan-btn dokan-btn-secondary">Secondary Button</button>
<button class="dokan-btn dokan-btn-tertiary">Tertiary Button</button>
<button class="dokan-btn dokan-btn-outline">Outline Button</button>
```

#### Status Buttons
```html
<button class="dokan-btn dokan-btn-info">Info Button</button>
<button class="dokan-btn dokan-btn-success">Success Button</button>
<button class="dokan-btn dokan-btn-warning">Warning Button</button>
<button class="dokan-btn dokan-btn-danger">Danger Button</button>
```

#### Button Sizes
```html
<button class="dokan-btn dokan-btn-sm">Small Button</button>
<button class="dokan-btn">Default Size Button</button>
<button class="dokan-btn dokan-btn-lg">Large Button</button>
```

#### Disabled State
```html
<button class="dokan-btn" disabled>Disabled Button</button>
```

These CSS classes provide consistent styling across the interface whether you're using React components or standard HTML elements.

## Anchor Components

`Dokan` provides a set of standardized anchor components that have button-like styling. These are perfect for navigation links that should have the appearance of buttons. They are built on top of the `Link` component from `@getdokan/dokan-ui` and use the same style classes as the Button components.

### Available Anchor Components

#### Variant Anchors
- **Anchor** - Primary anchor (default)
- **PrimaryAnchor** - Primary anchor style
- **SecondaryAnchor** - Secondary anchor style
- **TertiaryAnchor** - Tertiary anchor style
- **OutlineAnchor** - Outline anchor style

#### Status-Specific Anchors
- **InfoAnchor** - Blue styled anchor for informational links
- **SuccessAnchor** - Green styled anchor for confirmation links
- **WarningAnchor** - Yellow styled anchor for cautionary links
- **DangerAnchor** - Red styled anchor for critical links

### Usage Example

```jsx
import { 
  Anchor,
  PrimaryAnchor,
  SecondaryAnchor,
  OutlineAnchor,
  InfoAnchor,
  SuccessAnchor,
  WarningAnchor,
  DangerAnchor
} from '@dokan/components';

const AnchorsExample = () => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Variant Anchors */}
      <Anchor href="/dashboard">Dashboard</Anchor>
      <PrimaryAnchor href="/products">Products</PrimaryAnchor>
      <SecondaryAnchor href="/orders">Orders</SecondaryAnchor>
      <OutlineAnchor href="/settings">Settings</OutlineAnchor>
      
      {/* Status Anchors */}
      <InfoAnchor href="/help">Help Center</InfoAnchor>
      <SuccessAnchor href="/complete">Complete Setup</SuccessAnchor>
      <WarningAnchor href="/verify">Verify Account</WarningAnchor>
      <DangerAnchor href="/delete">Delete Account</DangerAnchor>
      
      {/* Anchor Sizes */}
      <Anchor href="/link1" className="dokan-btn-sm">Small Anchor</Anchor>
      <Anchor href="/link2">Default Size</Anchor>
      <Anchor href="/link3" className="dokan-btn-lg">Large Anchor</Anchor>
    </div>
  );
};
```

### Anchor Component Properties

All Anchor components accept the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `href` | `string` | Yes | The URL to navigate to |
| `children` | `ReactNode` | Yes | The content to be displayed within the anchor |
| `className` | `string` | No | Additional CSS classes for custom styling |
| `variant` | `"primary" \| "secondary" \| "tertiary" \| "outline" \| "info" \| "success" \| "warning" \| "danger"` | No | The style variant of the anchor |
| `...props` | `LinkProps` | No | Any additional props from the Link component |

The Anchor components use the same Tailwind CSS classes as the Button components, providing a consistent look for both interactive elements while maintaining proper semantic HTML (links vs. buttons).

### CSS Classes for Anchors

You can also apply the button styling directly to anchor elements using CSS classes:

```html
<a href="/dashboard" class="dokan-btn inline-block">Dashboard</a>
<a href="/products" class="dokan-btn dokan-btn-primary inline-block">Products</a>
<a href="/orders" class="dokan-btn dokan-btn-success inline-block">Orders</a>
```

Note the addition of `inline-block` class which helps anchors render properly with button styling.

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

## Alert Components

`Dokan` provides semantic alert components for displaying notifications, warnings, or informational messages to users. These components are built on top of the `SimpleAlert` component from `@getdokan/dokan-ui`.

### Available Alert Components

- **InfoAlert** - Blue styled alert for informational messages
- **WarningAlert** - Yellow styled alert for warning messages
- **SuccessAlert** - Green styled alert for success messages
- **DangerAlert** - Red styled alert for error or critical messages

### Usage Example

```jsx
import { 
  InfoAlert, 
  WarningAlert, 
  SuccessAlert, 
  DangerAlert 
} from '@dokan/components';

const AlertExample = () => {
  return (
    <div className="space-y-4">
      <InfoAlert label="Information Message">
        <div className="text-sm mt-1">
          Additional information about this message.
        </div>
      </InfoAlert>
      
      <WarningAlert label="Warning Message">
        <div className="text-sm mt-1">
          Please pay attention to this warning.
        </div>
      </WarningAlert>
      
      <SuccessAlert label="Success Message">
        <div className="text-sm mt-1">
          The operation completed successfully.
        </div>
      </SuccessAlert>
      
      <DangerAlert label="Error Message">
        <div className="text-sm mt-1">
          There was a problem with your request.
        </div>
      </DangerAlert>
    </div>
  );
};
```

### Alert Component Properties

All Alert components accept the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | The main heading text of the alert |
| `children` | `ReactNode` | No | Optional content to be displayed below the heading |
| `className` | `string` | No | Additional CSS classes for custom styling |

Each alert type applies semantic styling appropriate for its meaning:

- **InfoAlert** - Blue styling for informational content
- **WarningAlert** - Yellow styling for warnings that require attention
- **SuccessAlert** - Green styling for success messages
- **DangerAlert** - Red styling for errors or critical issues

The alerts use predefined CSS classes (`dokan-alert-info`, `dokan-alert-warning`, etc.) which should be defined in your theme's stylesheets to maintain consistent appearance.

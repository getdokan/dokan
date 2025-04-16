# Dokan Components

## Overview

`Dokan` provides a set of reusable `components` that can be used across both `Free` and `Pro` versions. This documentation explains how to properly set up and use these `components` in your project.

## Available Components

1. **DataViews** - Data management component for tabular data display and manipulation
2. **DokanModal** - Flexible modal dialog system
3. **Filter** - Standardized filtering interface
4. **SortableList** - Drag-and-drop interface for managing sortable items
5. **DokanButton** - Unified button component with multiple variants
6. **Link Component** - Flexible link component with multiple style variants
7. **DokanBadge** - Unified badge component for status badges
8. **DokanAlert** - Unified alert component for notifications
9. **MediaUploader** - File upload component

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
import { DataViews, DokanBadge, DokanButton, DokanAlert, Link } from '@dokan/components';
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
|        |      |___ Button.tsx        # Button component
|        |      |___ Link.tsx        # Link component
|        |      |___ Badge.tsx         # Badge component
|        |      |___ Alert.tsx         # Alert component
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
export { default as DokanButton } from './Button';
export { default as Link } from './Link';
export { default as DokanBadge } from './Badge';
export { default as DokanAlert } from './Alert';
export { default as ComponentName } from './YourComponent';
```

## Button Component

`Dokan` provides a unified button component that supports multiple variants and styles. The component is built on top of the `Button` component from `@getdokan/dokan-ui` and is styled consistently with the Dokan design system.

### Available Button Variants

#### Action Variants
- **primary** - Primary button (default)
- **secondary** - Secondary button style
- **tertiary** - Tertiary button style

#### Status Variants
- **info** - Blue styled button for informational actions
- **success** - Green styled button for confirmation actions
- **warning** - Yellow styled button for cautionary actions
- **danger** - Red styled button for destructive actions

### Usage Example

```jsx
import { DokanButton } from '@dokan/components';

const ButtonsExample = () => {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Action Variants */}
      <DokanButton>Primary Button</DokanButton>
      <DokanButton variant="secondary">Secondary Button</DokanButton>
      <DokanButton variant="tertiary">Tertiary Button</DokanButton>
      
      {/* Status Variants */}
      <DokanButton variant="info">Info Button</DokanButton>
      <DokanButton variant="success">Success Button</DokanButton>
      <DokanButton variant="warning">Warning Button</DokanButton>
      <DokanButton variant="danger">Danger Button</DokanButton>
      
      {/* Button Sizes */}
      <DokanButton size="sm">Small Button</DokanButton>
      <DokanButton>Default Size</DokanButton>
      <DokanButton size="lg">Large Button</DokanButton>
      
      {/* Button States */}
      <DokanButton disabled>Disabled Button</DokanButton>
      <DokanButton loading={true}>Loading Button</DokanButton>
    </div>
  );
};
```

### Button Component Properties

The DokanButton component accepts the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `children` | `ReactNode` | Yes | The content to be displayed within the button |
| `className` | `string` | No | Additional CSS classes for custom styling |
| `variant` | `"primary" \| "secondary" \| "tertiary" \| "info" \| "success" \| "warning" \| "danger"` | No | Button style variant (default: "primary") |
| `size` | `"sm" \| "md" \| "lg"` | No | Button size (small, medium, large) |
| `disabled` | `boolean` | No | Whether the button is disabled |
| `loading` | `boolean` | No | Whether to show a loading indicator |
| `...props` | `ButtonProps` | No | Any additional props from the Button component |

## Badge Component

`Dokan` provides a unified badge component for displaying status badges in different visual styles. The component is built on top of the `Badge` component from `@getdokan/dokan-ui`.

### Available Badge Variants

- **info** - Blue styled badge for informational states (default)
- **warning** - Yellow styled badge for warning states
- **success** - Green styled badge for success states
- **danger** - Red styled badge for error or danger states

### Usage Example

```jsx
import { DokanBadge } from '@dokan/components';

const StatusBadges = () => {
    return (
        <div className="flex space-x-2">
            <DokanBadge label="Processing" />
            <DokanBadge variant="success" label="Active" />
            <DokanBadge variant="warning" label="Pending" />
            <DokanBadge variant="danger" label="Failed" />
        </div>
    );
};
```

### Badge Component Properties

The DokanBadge component accepts the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | The text to display in the badge |
| `variant` | `"info" \| "warning" \| "success" \| "danger"` | No | Label style variant (default: "info") |
| `...props` | `BadgeProps` | No | Any additional props from the Badge component |

## Alert Component

`Dokan` provides a unified alert component for displaying notifications, warnings, or informational messages to users. The component is built on top of the `SimpleAlert` component from `@getdokan/dokan-ui`.

### Available Alert Variants

- **info** - Blue styled alert for informational messages (default)
- **warning** - Yellow styled alert for warning messages
- **success** - Green styled alert for success messages
- **danger** - Red styled alert for error or critical messages

### Usage Example

```jsx
import { DokanAlert } from '@dokan/components';

const AlertExample = () => {
  return (
    <div className="space-y-4">
      <DokanAlert label="Information Message">
        <div className="text-sm mt-1 font-light">
          Additional information about this message.
        </div>
      </DokanAlert>
      
      <DokanAlert variant="warning" label="Warning Message">
        <div className="text-sm mt-1 font-light">
          Please pay attention to this warning.
        </div>
      </DokanAlert>
      
      <DokanAlert variant="success" label="Success Message">
        <div className="text-sm mt-1 font-light">
          The operation completed successfully.
        </div>
      </DokanAlert>
      
      <DokanAlert variant="danger" label="Error Message">
        <div className="text-sm mt-1 font-light">
          There was a problem with your request.
        </div>
      </DokanAlert>
    </div>
  );
};
```

### Alert Component Properties

The DokanAlert component accepts the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `label` | `string` | Yes | The main heading text of the alert |
| `children` | `ReactNode` | No | Optional content to be displayed below the heading |
| `className` | `string` | No | Additional CSS classes for custom styling |
| `variant` | `"info" \| "warning" \| "success" \| "danger"` | No | Alert style variant (default: "info") |

## Link Component

`Dokan` provides a unified link component for creating consistent and accessible hyperlinks throughout the application. The component extends the native HTML anchor element with Dokan's styling system.

### Usage Example

```jsx
import { DokanLink } from '@dokan/components';

const LinkExample = () => {
  return (
    <div className="space-y-4">
      {/* Basic Link */}
      <DokanLink href="/dashboard">
        Dashboard
      </DokanLink>

      {/* Link with Custom Class */}
      <DokanLink 
        href="/settings" 
        className="font-semibold"
      >
        Settings
      </DokanLink>

      {/* External Link */}
      <DokanLink 
        href="https://example.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        External Link
      </DokanLink>

      {/* Link with Icon */}
      <DokanLink href="/notifications">
        <span className="mr-2">🔔</span>
        Notifications
      </DokanLink>

        {/* Link as Button */}
        <DokanLink as="button" href="/button">
            Button Link
        </DokanLink>
    </div>
  );
};
```

### Link Component Properties

The Link component accepts the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `href` | `string` | Yes | The URL the link points to |
| `children` | `ReactNode` | No | The content to be displayed within the link |
| `className` | `string` | No | Additional CSS classes for custom styling |
| `...props` | `AnchorHTMLAttributes` | No | Any additional HTML anchor element props |

### Styling Features

- Automatically applies Dokan's link styling
- Includes hover and focus states
- Supports custom styling through className prop
- Maintains accessibility standards
- Transitions smoothly between states

### Best Practices

1. **Accessibility**
   ```jsx
   // Good
   <DokanLink href="/page">Page Link</DokanLink>

   // Better - with descriptive text
   <DokanLink href="/page">Visit the Products Page</DokanLink>
   ```

2. **External Links**
   ```jsx
   // Always include security attributes for external links
   <DokanLink 
     href="https://example.com"
     target="_blank"
     rel="noopener noreferrer"
   >
     External Site
   </DokanLink>
   ```

3. **Custom Styling**
   ```jsx
   // Combine with other utility classes
   <DokanLink 
     href="/profile"
     className="flex items-center space-x-2"
   >
     <span>👤</span>
     <span>View Profile</span>
   </DokanLink>
   ```

4. **Active States**
   ```jsx
   // Use with active state classes
   <DokanLink 
     href="/current-page"
     className="active:text-dokan-link-hover"
   >
     Current Page
   </DokanLink>
   ```

### Common Use Cases

1. **Navigation Links**
   ```jsx
   <nav className="space-x-4">
     <DokanLink href="/dashboard">Dashboard</DokanLink>
     <DokanLink href="/orders">Orders</DokanLink>
     <DokanLink href="/products">Products</DokanLink>
   </nav>
   ```

2. **Action Links**
   ```jsx
   <div className="space-y-2">
     <DokanLink href="/edit">Edit Profile</DokanLink>
     <DokanLink href="/settings">Account Settings</DokanLink>
     <DokanLink href="/help">Help Center</DokanLink>
   </div>
   ```

3. **Footer Links**
   ```jsx
   <footer className="grid grid-cols-3 gap-4">
     <div>
       <h3>Company</h3>
       <DokanLink href="/about">About Us</DokanLink>
       <DokanLink href="/careers">Careers</DokanLink>
       <DokanLink href="/contact">Contact</DokanLink>
     </div>
     {/* ... other footer sections ... */}
   </footer>
   ```

The DokanLink component is designed to be simple yet flexible, providing a consistent look and feel across the application while maintaining accessibility and usability standards.

## CustomerFilter Component

The CustomerFilter component provides a standardized way to filter content by customer across your application. It allows users to search and select customers from a dropdown interface.

### Features

- Customer search with autocomplete
- Selected customer display and management
- Consistent interface across different views

### Usage Example

```jsx
import { CustomerFilter } from '@dokan/components';

const [selectedCustomer, setSelectedCustomer] = useState({});

<CustomerFilter
    id="dokan-filter-by-customer"
    value={selectedCustomer}
    onChange={(selected) => {
        setSelectedCustomer(selected);
    }}
    placeholder={ __( 'Search', 'dokan' ) }
    label={ __( 'Filter By Registered Customer', 'dokan' ) }
/>
```

#### Props

| Prop                  | Type       | Required | Description                                                                |
|-----------------------|------------|----------|----------------------------------------------------------------------------|
| `id`                  | `string`   | Yes      | Unique identifier for the filter group                                     |
| `value`               | `object`   | Yes      | Currently selected customer object with `label` and `value` properties     |
| `onChange` | `function` | Yes      | Callback function to update the selected customer                          |
| `placeholder`         | `string`   | no       | Custom placeholder text for the search input |
| `label`         | `string`   | no       | Custom label text for the search input  |

#### Selected Customer Object Structure

```jsx
interface SelectedCustomer {
  label: string;  // Display name of the customer
  value: string;  // Customer ID
}
```

#### Example of Upload 

```tsx
import { MediaUploader } from '@dokan/components';

type UploadTypes = {
    onSelect: ( value: any ) => void;
    children: React.ReactNode;
    multiple?: boolean;
    className?: string;
    as?: React.ElementType;
    title?: string;
    buttonText?: string;
};

const App = () => {
    const handleUpload = (file) => {
        // Handle the uploaded files
        console.log(file);
    }
    return (
        <MediaUploader as="div" onSelect={ handleUpload }>
            <DokanButton variant="secondary" className="gap-1">
                <i className="fas fa-cloud-upload-alt" />
                { __( 'Upload', 'dokan' ) }
            </DokanButton>
        </MediaUploader>
    )
}

```

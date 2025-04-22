# Dokan Components

## Overview

`Dokan` provides a set of reusable `components` that can be used across both `Free` and `Pro` versions. This documentation explains how to properly set up and use these `components` in your project.

## Available Components

1. **DataViews** - Data management component for tabular data display and manipulation
2. **DokanModal** - Flexible modal dialog system
3. **Filter** - Standardized filtering interface
4. **SortableList** - Drag-and-drop interface for managing sortable items
5. **DokanButton** - Unified button component with multiple variants
6. **DokanLink** - Flexible link component with multiple style variants
7. **DokanBadge** - Unified badge component for status badges
8. **DokanAlert** - Unified alert component for notifications
9. **NotFound** - Unified 404 component for undefined route
10. **Forbidden** - Unified 403 component for unauthorized route
11. **MediaUploader** - File upload component
12. **DokanMaskInput** - Masked input component for formatted data entry

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
import { DataViews, DokanBadge, DokanButton, DokanAlert, DokanLink, DokanMaskInput } from '@dokan/components';
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
|        |      |___ Link.tsx          # Link component
|        |      |___ Badge.tsx         # Badge component
|        |      |___ Alert.tsx         # Alert component
|        |      |___ MaskInput.tsx     # Mask input component
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
export { default as DokanLink } from './Link';
export { default as DokanBadge } from './Badge';
export { default as DokanAlert } from './Alert';
export { default as DokanMaskInput } from './MaskInput';
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

### NotFound Component

The `NotFound` component displays a user-friendly `404` error page when a requested resource cannot be found.
We will import the `NotFound` component from the `@dokan/components` package (Both for Pro & Lite version).

The `NotFound` component accepts the following props:

| Prop             | Type        | Required | Description                                                                                                                             |
|------------------|-------------|----------|-----------------------------------------------------------------------------------------------------------------------------------------|
| `title`          | `string`    | No       | Custom title for the `NotFound` page (default: `Sorry, the page can’t be found`)                                                        |
| `message`        | `string`    | No       | Custom message for the `NotFound` page (default: `The page you were looking for appears to have been moved, deleted or does not exist`) |
| `navigateButton` | `ReactNode` | No       | Custom navigation button component (default: `Back to Dashboard` button)                                                                |
| `children`       | `ReactNode` | No       | Custom `NotFound` page template                                                                                                         |

### Usage Example

```jsx
import {NotFound} from '@dokan/components';
import {DokanButton} from '@dokan/components';

// Basic usage with default settings.
const BasicNotFound = () => {
    return <NotFound/>;
};

// Custom usage with navigation button.
const CustomNotFound = () => {
    return (
        <NotFound
            title={__('Resource Not Available', 'dokan-lite')}
            message={__("We couldn't find the page you were looking for.", 'dokan')}
            navigateButton={
                <DokanButton> // Add your necessary props.
                    {__('Return to Dashboard', 'dokan')}
                </DokanButton>
            }
        />
    );
};

// Usage in a component when a resource is not found.
const ProductDetails = ({params}) => {
    const [product, setProduct] = useState(null);
    const [isNotFound, setIsNotFound] = useState(false);

    useEffect(() => {
        apiFetch({
            path: `/dokan/v1/products/${params.id}`,
        })
            .then((response) => {
                if (response) {
                    setProduct(response);
                }
            })
            .catch((error) => {
                if (error?.data?.status === 404) {
                    setIsNotFound(true);
                }
            });
    }, [params.id]);

    if (isNotFound) {
        // Use your necessary `NotFound` from here.
        // return <BasicNotFound />;
        // return <CustomNotFound />;
    }

    // Rest of the component
};
```

### Forbidden Component

The `Forbidden` component displays a user-friendly `403` error page when a user attempts to access a resource they don't
have permission to view.
We will import the `Forbidden` component from the `@dokan/components` package (Both for Pro & Lite version).

The `Forbidden` component accepts the following props:

| Prop             | Type        | Required | Description                                                                                               |
|------------------|-------------|----------|-----------------------------------------------------------------------------------------------------------|
| `title`          | `string`    | No       | Custom title for the `Forbidden` page (default: `Permission Denied`)                                      |
| `message`        | `string`    | No       | Custom message for the `Forbidden` page (default: `Sorry, you don’t have permission to access this page`) |
| `navigateButton` | `ReactNode` | No       | Custom navigation button component (default: `Back to Dashboard` button)                                  |
| `children`       | `ReactNode` | No       | Custom `Forbidden` page template                                                                          |

### Usage Example

```jsx
import {Forbidden} from '@dokan/components';
import {DokanButton} from '@dokan/components';

// Basic usage with default settings
const BasicForbidden = () => {
    return <Forbidden/>;
};

// Custom usage with navigation button
const CustomForbidden = () => {
    return (
        <Forbidden
            title={__('Access Denied', 'dokan')}
            message={__('You don\'t have permission to access this area.', 'dokan')}
            navigateButton={
                <DokanButton> // Add your necessary props.
                    {__('Go to Dashboard', 'dokan')}
                </DokanButton>
            }
        />
    );
};

// Usage in a component when permission check fails
const VendorSettings = ({params}) => {
    const [settings, setSettings] = useState(null);
    const [isForbidden, setIsForbidden] = useState(false);

    useEffect(() => {
        apiFetch({
            path: `/dokan/v1/vendors/${params.id}/settings`,
        })
            .then((response) => {
                if (response) {
                    setSettings(response);
                }
            })
            .catch((error) => {
                if (error?.data?.status === 403) {
                    setIsForbidden(true);
                }
            });
    }, [params.id]);

    if (isForbidden) {
        // Use your necessary `Forbidden` from here.
        // return <BasicForbidden />;
        // return <CustomForbidden />;
    }

    // Rest of the component
};
```

### MediaUploader Component Properties

The MediaUploader component accepts the following props:

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

## DokanMaskInput Component

`Dokan` provides a unified masked input component for formatted data entry such as currency amounts, phone numbers, dates, etc. The component is built on top of the `MaskedInput` component from `@getdokan/dokan-ui`.

### Usage Example

```jsx
import { DokanMaskInput } from '@dokan/components';

const PriceInput = () => {
  const [amount, setAmount] = useState('');
  
  return (
    <DokanMaskInput
      namespace="product-price"
      label="Product Price"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      input={{
        id: 'product-price',
        name: 'product-price',
        placeholder: 'Enter price',
        required: true
      }}
      helpText="Enter the product price including decimal points."
    />
  );
};
```

### Real-World Example (LineItemForm)

```jsx
import { __ } from '@wordpress/i18n';
import { DokanMaskInput } from '@dokan/components';

const LineItemForm = ({ total, setTotal }) => {
  return (
    <DokanMaskInput
      namespace="manual-order-shipping-line-item-amount"
      label={__('Shipping Total', 'dokan')}
      value={total}
      onChange={(e) => setTotal(e.target.value)}
      input={{
        id: 'shipping-total',
        name: 'shipping-total',
        placeholder: __('Enter shipping cost', 'dokan'),
      }}
      helpText={__('Enter the total shipping cost for this method.', 'dokan')}
    />
  );
};
```

### MaskInput Component Properties

The DokanMaskInput component accepts the following props:

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `string` | Yes | Unique identifier for the input (used for filtering) |
| `label` | `string` | Yes | The label text for the input field |
| `value` | `string` | Yes | The current value of the input |
| `onChange` | `(e: any) => void` | Yes | Callback function when the input value changes |
| `input` | `object` | No | Input element HTML attributes (id, name, placeholder, required, etc.) |
| `className` | `string` | No | Additional CSS classes for custom styling |
| `addOnLeft` | `string` | No | Text or symbol to display on the left side (like currency symbol) |
| `maskRule` | `object` | No | Configuration for the input mask (default uses currency settings) |
| `helpText` | `string` | No | Helper text displayed below the input |

### Default Mask Rules

The DokanMaskInput component automatically configures the input mask based on the WordPress/WooCommerce site's currency settings. These are the default mask rules:

```js
maskRule: {
  numeral: true,                                                 // Enable numeric formatting
  numeralDecimalMark: window?.dokanFrontend?.currency?.decimal ?? '.',  // Use site's decimal separator
  delimiter: window?.dokanFrontend?.currency?.thousand ?? ',',   // Use site's thousands separator
  numeralDecimalScale: window?.dokanFrontend?.currency?.precision ?? 2, // Use site's decimal precision
}
```

You can override these defaults by providing your own `maskRule` object:

```jsx
<DokanMaskInput
  namespace="custom-precision-input"
  label="Amount (4 decimals)"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  maskRule={{
    numeral: true,
    numeralDecimalMark: '.',
    delimiter: ',',
    numeralDecimalScale: 4  // Override to use 4 decimal places
  }}
  // Other props...
/>
```

The component also automatically uses the site's currency symbol as the `addOnLeft` value. This can be customized:

```jsx
<DokanMaskInput
  namespace="custom-currency-input"
  label="Euro Amount"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  addOnLeft="€"  // Override currency symbol
  // Other props...
/>
```

### Using with formatNumber and unformatNumber Utilities

When working with the DokanMaskInput component, you'll typically use two important utilities from `@dokan/utilities`:

1. `formatNumber`: Formats a numeric value as a display string
2. `unformatNumber`: Converts the formatted string back to a numeric value

#### Typical Usage Pattern

```jsx
import { useState, useEffect } from '@wordpress/element';
import { DokanMaskInput } from '@dokan/components';
import { formatNumber, unformatNumber } from '@dokan/utilities';

const PriceEditor = ({ initialPrice, onSave }) => {
  const [formattedPrice, setFormattedPrice] = useState('');
  
  // Format initial value from API for display
  useEffect(() => {
    if (initialPrice) {
      setFormattedPrice(formatNumber(initialPrice));
    }
  }, [initialPrice]);
  
  // When saving, convert back to numeric
  const handleSave = () => {
    const numericPrice = unformatNumber(formattedPrice);
    onSave(numericPrice);
  };
  
  return (
    <div>
      <DokanMaskInput
        namespace="price-editor"
        label="Price"
        value={formattedPrice}
        onChange={(e) => setFormattedPrice(e.target.value)}
        input={{
          id: 'price',
          name: 'price',
          placeholder: 'Enter price',
        }}
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};
```

### Applying Filters

The component supports WordPress filters for customization:

```jsx
// In your code that extends functionality
wp.hooks.addFilter(
  'dokan_your_namespace_mask_input_props',
  'your-plugin/customize-mask-input',
  (props, currencySymbol) => {
    // Modify props as needed
    return {
      ...props,
      addOnLeft: '$', // Override currency symbol
      maskRule: {
        ...props.maskRule,
        numeralDecimalScale: 4, // Use 4 decimal places
      }
    };
  }
);
```

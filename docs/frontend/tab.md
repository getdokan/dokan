# DokanTab Component

## Overview

`DokanTab` is a React component that extends WordPress's TabPanel to provide an ARIA-compliant tab interface with additional Dokan-specific features. It organizes content across different screens, data sets, and interactions, with two main sections: a list of tabs and the view to show when tabs are chosen.

## Design Guidelines

### Usage

TabPanels organize and allow navigation between groups of content that are related and at the same level of hierarchy. As a set, all tabs are unified by a shared topic. For clarity, each tab should contain content that is distinct from all the other tabs in a set.

### Anatomy

1. Container
2. Active text label
3. Active tab indicator
4. Inactive text label
5. Tab item

#### Labels

Tab labels appear in a single row, in the same typeface and size. Use text labels that clearly and succinctly describe the content of a tab, and make sure that a set of tabs contains a cohesive group of items that share a common characteristic.

Tab labels can wrap to a second line, but do not add a second row of tabs.

#### Active tab indicators

To differentiate an active tab from an inactive tab, DokanTab applies an underline and color change to the active tab's text and icon.

### Behavior

Users can navigate between tabs by:
- Clicking on a tab
- Using the tab key on the keyboard
- Using arrow keys to move between tabs

### Placement

Place tabs above content. Tabs control the UI region displayed below them.

## Features

- Multiple tab variants (primary, secondary, tertiary)
- Customizable styling through className props
- Support for icons in tabs
- Horizontal and vertical orientations
- Slot system for content injection
- Filter hooks for customization
- TypeScript support
- ARIA-compliant accessibility

## Usage

### Basic Usage (Without Content)
```jsx
import { DokanTab } from '@dokan/components';

const MyTabs = () => {
    const tabs = [
        { name: 'tab1', title: 'Tab 1' },
        { name: 'tab2', title: 'Tab 2', icon: 'settings' },
        { name: 'tab3', title: 'Tab 3', disabled: true }
    ];

    return (
        <DokanTab
            namespace="my_tabs"
            tabs={tabs}
            variant="primary"
            onSelect={(tabName) => console.log('Selected tab:', tabName)}
        />
    );
};
```

### Usage With Content
```jsx
import { DokanTab } from '@dokan/components';

const MyTabs = () => {
    const tabs = [
        { name: 'tab1', title: 'Tab 1' },
        { name: 'tab2', title: 'Tab 2', icon: 'settings' },
        { name: 'tab3', title: 'Tab 3', disabled: true }
    ];

    return (
        <DokanTab
            namespace="my_tabs"
            tabs={tabs}
            variant="primary"
            onSelect={(tabName) => console.log('Selected tab:', tabName)}
        >
            {(tab) => <div>Content for {tab.name}</div>}
        </DokanTab>
    );
};
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `namespace` | `string` | Yes | Unique identifier for the tab component |
| `tabs` | `Tab[]` | Yes | Array of tab objects |
| `variant` | `'primary' \| 'secondary' \| 'tertiary'` | No | Tab style variant (default: 'primary') |
| `className` | `string` | No | Additional CSS classes for the tab panel |
| `activeClass` | `string` | No | CSS class for the active tab (default: 'is-active') |
| `orientation` | `'horizontal' \| 'vertical'` | No | Tab orientation (default: 'horizontal') |
| `onSelect` | `(tabName: string) => void` | No | Callback when a tab has been selected |
| `initialTabName` | `string` | No | Name of the tab to be selected upon mounting |
| `selectOnMove` | `boolean` | No | Whether to select tab on keyboard navigation (default: true) |
| `children` | `(tab: Tab) => React.ReactNode` | No | Optional function which renders the tabviews given the selected tab. If not provided, no content will be rendered |

### Tab Object Structure

```typescript
interface Tab {
    name: string;        // Defines the key for the tab
    title: string;       // Defines the translated text for the tab
    className?: string;  // Optional. Defines the class to put on the tab
    icon?: IconType;     // Optional. When set, displays the icon in place of the tab title
    disabled?: boolean;  // Optional. Determines if the tab should be disabled
}
```

## Variants

### Primary (Default)
```jsx
<DokanTab
    namespace="primary_tabs"
    variant="primary"
    tabs={tabs}
>
    {(tab) => <div>Primary tab content</div>}
</DokanTab>
```

### Secondary
```jsx
<DokanTab
    namespace="secondary_tabs"
    variant="secondary"
    tabs={tabs}
>
    {(tab) => <div>Secondary tab content</div>}
</DokanTab>
```

### Tertiary
```jsx
<DokanTab
    namespace="tertiary_tabs"
    variant="tertiary"
    tabs={tabs}
>
    {(tab) => <div>Tertiary tab content</div>}
</DokanTab>
```

## Slot System

The DokanTab component provides slots for injecting content before and after the tab panel. This allows external plugins/themes to add custom content without modifying the core component.

### Using Slots

```php
// Register a Fill component
add_action('init', function() {
    wp_register_script(
        'my-plugin-tab-content',
        'path/to/your/script.js',
        ['wp-components', 'wp-element'],
        '1.0.0',
        true
    );
});

// In your JavaScript
const { Fill } = wp.components;

const MyTabContent = ({ fillProps }) => {
    return (
        <Fill name="dokan-before-tab-my_tabs">
            <div className="my-custom-content">
                {/* Your custom content here */}
            </div>
        </Fill>
    );
};
```

Available slots:
- `dokan-before-tab-{namespace}` - Content before the tab panel
- `dokan-after-tab-{namespace}` - Content after the tab panel

## Filter Hooks

The DokanTab component provides filter hooks for customizing its behavior and appearance.

### Available Filters

```php
// Filter tabs
add_filter('dokan_my_tabs_tab_tabs', function($tabs, $props) {
    // Modify tabs array
    return $tabs;
}, 10, 2);

// Filter active class
add_filter('dokan_my_tabs_tab_active_class', function($activeClass, $props) {
    // Modify active class
    return $activeClass;
}, 10, 2);

// Filter panel class
add_filter('dokan_my_tabs_tab_panel_class', function($className, $props) {
    // Modify panel class
    return $className;
}, 10, 2);
```

## Styling

The DokanTab component uses Tailwind CSS for styling. You can customize the appearance using:

1. Built-in variants (primary, secondary, tertiary)
2. Custom className props
3. Filter hooks for modifying classes
4. CSS overrides using the component's class names

### Default Classes

```css
/* Tab wrapper */
.dokan-tab-wrapper

/* Tab panel */
.dokan-tab-panel
.dokan-tab-panel-secondary
.dokan-tab-panel-tertiary

/* Active tab */
.dokan-active-tab
```

## Best Practices

1. Always provide a unique namespace for each tab instance
2. Use the slot system for adding custom content
3. Use filter hooks for modifying component behavior
4. Follow the variant system for consistent styling
5. Use TypeScript for better type safety
6. Keep tab content components separate for better maintainability
7. Ensure tab labels are clear and descriptive
8. Maintain consistent tab ordering
9. Use icons to enhance tab recognition when appropriate
10. Consider keyboard navigation and accessibility

## Example Implementation

```jsx
import { DokanTab } from '@dokan/components';

const ProductTabs = () => {
    const tabs = [
        {
            name: 'general',
            title: 'General',
            icon: 'admin-generic'
        },
        {
            name: 'inventory',
            title: 'Inventory',
            icon: 'archive'
        },
        {
            name: 'shipping',
            title: 'Shipping',
            icon: 'cart'
        }
    ];

    const renderTabContent = (tab) => {
        switch (tab.name) {
            case 'general':
                return <GeneralSettings />;
            case 'inventory':
                return <InventorySettings />;
            case 'shipping':
                return <ShippingSettings />;
            default:
                return null;
        }
    };

    return (
        <DokanTab
            namespace="product_settings"
            tabs={tabs}
            variant="primary"
            onSelect={(tabName) => {
                // Handle tab selection
                console.log('Selected tab:', tabName);
            }}
        >
            {renderTabContent}
        </DokanTab>
    );
};
``` 

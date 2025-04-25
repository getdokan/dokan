# Dokan Color Guidelines

## Overview

This documentation outlines the color system used in Dokan and provides guidelines for consistent usage of color classes throughout the application. Dokan implements a semantic color system that aligns colors with their informational meaning.

## Semantic Color System

Dokan uses a semantic color system where colors represent specific meanings:

- **Info (Blue)** - Used for informational messages, neutral states, or in-progress actions
- **Success (Green)** - Used for successful operations, active states, or positive messages
- **Warning (Yellow)** - Used for alerts that require attention but aren't critical
- **Danger (Red)** - Used for errors, destructive actions, or critical warnings

## CSS Variables

### Button Variables
```css
/* Primary Button */
--dokan-button-text-color: #ffffff;
--dokan-button-hover-text-color: #ffffff;
--dokan-button-background-color: #7047EB;
--dokan-button-hover-background-color: #502BBF;
--dokan-button-border-color: #7047EB;
--dokan-button-hover-border-color: #370EB1;

/* Secondary Button */
--dokan-button-secondary-text-color: #7047EB;
--dokan-button-secondary-hover-text-color: #ffffff;
--dokan-button-secondary-background-color: #ffffff;
--dokan-button-secondary-hover-background-color: #7047EB;
--dokan-button-secondary-border-color: #7047EB;
--dokan-button-secondary-hover-border-color: #7047EB;

/* Tertiary Button */
--dokan-button-tertiary-text-color: #637381;
--dokan-button-tertiary-hover-text-color: #7047EB;
--dokan-button-tertiary-background-color: #00000000;
--dokan-button-tertiary-hover-background-color: #DACEFF;
--dokan-button-tertiary-border-color: transparent;
--dokan-button-tertiary-hover-border-color: #7047EB;

/* Status Button Variables */
--dokan-button-info-text-color: #ffffff;
--dokan-button-info-hover-text-color: #ffffff;
--dokan-button-info-background-color: #0B76B7;
--dokan-button-info-hover-background-color: #2795d7;

--dokan-button-success-text-color: #ffffff;
--dokan-button-success-hover-text-color: #ffffff;
--dokan-button-success-background-color: #07a67e;
--dokan-button-success-hover-background-color: #11b68c;

--dokan-button-warning-text-color: #ffffff;
--dokan-button-warning-hover-text-color: #ffffff;
--dokan-button-warning-background-color: #e9a905;
--dokan-button-warning-hover-background-color: #fbbf24;

--dokan-button-danger-text-color: #ffffff;
--dokan-button-danger-hover-text-color: #ffffff;
--dokan-button-danger-background-color: #e3050c;
--dokan-button-danger-hover-background-color: #f23030;
```

### Sidebar Variables
```css
--dokan-sidebar-text-color: #DACEFF;
--dokan-sidebar-hover-text-color: #ffffff;
--dokan-sidebar-background-color: #322067;
--dokan-sidebar-hover-background-color: #7047EB;
```

### Status Colors
```css
/* Info Colors */
--dokan-info-text-color: #0B76B7;
--dokan-info-secondary-text-color: #637381;
--dokan-info-background-color: #E9F9FF;
--dokan-info-border-color: #E9F9FFFF;
--dokan-info-hover-text-color: #3ea4e1;

/* Success Colors */
--dokan-success-text-color: #004434;
--dokan-success-secondary-text-color: #637381;
--dokan-success-background-color: #DAF8E6;
--dokan-success-border-color: #DAF8E6FF;
--dokan-success-hover-text-color: #09a77d;

/* Warning Colors */
--dokan-warning-text-color: #9D5425;
--dokan-warning-secondary-text-color: #D0915C;
--dokan-warning-background-color: #FFFBEB;
--dokan-warning-border-color: #FFFBEBFF;
--dokan-warning-hover-text-color: #e9a904;

/* Danger Colors */
--dokan-danger-text-color: #BC1C21;
--dokan-danger-secondary-text-color: #F56060;
--dokan-danger-background-color: #FEF3F3;
--dokan-danger-border-color: #FEF3F3FF;
--dokan-danger-hover-text-color: #e5292e;
```

### Link Colors
```css
--dokan-link-color: #7047EB;
--dokan-link-hover-color: #322067;
```

## Tailwind Utility Classes

### 1. Dokan Utility Classes

```jsx
// Button Classes
<button className="dokan-btn">Primary Button</button>
<button className="dokan-btn-secondary">Secondary Button</button>
<button className="dokan-btn-tertiary">Tertiary Button</button>
<button className="dokan-btn-info">Info Button</button>
<button className="dokan-btn-success">Success Button</button>
<button className="dokan-btn-warning">Warning Button</button>
<button className="dokan-btn-danger">Danger Button</button>

// Button Sizes
<button className="dokan-btn-sm">Small Button</button>
<button className="dokan-btn-lg">Large Button</button>

// Badge Classes
<span className="dokan-badge-info">Info Badge</span>
<span className="dokan-badge-success">Success Badge</span>
<span className="dokan-badge-warning">Warning Badge</span>
<span className="dokan-badge-danger">Danger Badge</span>

// Alert Classes
<div className="dokan-alert-info">Info Alert</div>
<div className="dokan-alert-success">Success Alert</div>
<div className="dokan-alert-warning">Warning Alert</div>
<div className="dokan-alert-danger">Danger Alert</div>

// Link Classes
<a className="dokan-link">Link Text</a>
```

### 2. Tailwind Uitility Classes with Dokan Colors

```jsx
// Text Colors
<div className="text-dokan-btn">Button Text Color</div>
<div className="text-dokan-btn-hover">Button Hover Text Color</div>
<div className="text-dokan-info">Info Text Color</div>
<div className="text-dokan-success">Success Text Color</div>
<div className="text-dokan-warning">Warning Text Color</div>
<div className="text-dokan-danger">Danger Text Color</div>

// Background Colors
<div className="bg-dokan-btn">Button Background</div>
<div className="bg-dokan-btn-hover">Button Hover Background</div>
<div className="bg-dokan-info">Info Background</div>
<div className="bg-dokan-success">Success Background</div>
<div className="bg-dokan-warning">Warning Background</div>
<div className="bg-dokan-danger">Danger Background</div>

// Border Colors
<div className="border-dokan-btn">Button Border</div>
<div className="border-dokan-btn-hover">Button Hover Border</div>
<div className="border-dokan-info">Info Border</div>
<div className="border-dokan-success">Success Border</div>
<div className="border-dokan-warning">Warning Border</div>
<div className="border-dokan-danger">Danger Border</div>

// Ring Colors
<div className="ring-dokan-btn">Button Ring</div>
<div className="ring-dokan-btn-hover">Button Hover Ring</div>
<div className="ring-dokan-info">Info Ring</div>
<div className="ring-dokan-success">Success Ring</div>
<div className="ring-dokan-warning">Warning Ring</div>
<div className="ring-dokan-danger">Danger Ring</div>

// State Modifiers
<div className="hover:text-dokan-btn">Hover Text</div>
<div className="hover:bg-dokan-btn">Hover Background</div>
<div className="focus:text-dokan-btn">Focus Text</div>
<div className="focus:bg-dokan-btn">Focus Background</div>
<div className="active:text-dokan-btn">Active Text</div>
<div className="active:bg-dokan-btn">Active Background</div>
<div className="disabled:opacity-60">Disabled State</div>
```

## Component CSS Classes

Dokan defines specific CSS classes for component styling that ensure consistent appearance across the application. These classes are implemented in SCSS and apply Tailwind utility classes.

### Button Styles

```css
/* Primary Button */
.dokan-btn {
  @apply relative ring-0 ring-offset-0 bg-dokan-btn text-dokan-btn border-dokan-btn ring-dokan-btn transition-colors duration-200 !important;

  &:hover {
    @apply ring-0 ring-offset-0 bg-dokan-btn-hover text-dokan-btn-hover border-dokan-btn-hover !important;
  }

  &:focus {
    @apply ring-0 ring-offset-0 !important;
  }

  &:disabled {
    @apply opacity-60 cursor-not-allowed !important;
  }
}

/* Additional button variants */
.dokan-btn-secondary {
  @apply relative ring-0 ring-offset-0 bg-dokan-btn-secondary text-dokan-btn-secondary border-dokan-btn-secondary ring-dokan-btn-secondary transition-colors duration-200 !important;
  /* Hover and focus states */
}

.dokan-btn-tertiary {
  @apply relative ring-0 ring-offset-0 bg-dokan-btn-tertiary text-dokan-btn-tertiary border-dokan-btn-tertiary ring-dokan-btn-tertiary transition-colors duration-200 !important;
  /* Hover and focus states */
}

/* Status Buttons */
.dokan-btn-info {
  @apply relative bg-dokan-btn-info text-dokan-btn-info border-dokan-btn-info ring-dokan-btn-info transition-colors duration-200 !important;
  /* Hover and focus states */
}

/* Size Variants */
.dokan-btn-sm {
  @apply relative px-2 py-1 text-sm !important;
}

.dokan-btn-lg {
  @apply relative px-6 py-3 text-lg !important;
}
```

### Badge Styles

```css
.dokan-badge-info {
  @apply relative ring-1 ring-inset bg-dokan-info text-dokan-info ring-dokan-info !important;
}

/* Additional badge variants */
```

### Alert Styles

```css
.dokan-alert-info {
  @apply relative ring-1 ring-inset bg-dokan-info text-dokan-info-secondary ring-dokan-info !important;
}

/* Additional alert variants */
```

### Link Styles

```css
.dokan-link {
  @apply relative text-dokan-link no-underline transition-colors duration-200 !important;

  &:hover, &:focus {
    @apply text-dokan-link-hover !important;
  }
}
```

## Best Practices

1. **Consistent Usage**
   - Use predefined CSS variables for colors
   - Use component classes for common UI elements
   - Use utility classes for custom styling
   - Follow semantic color meanings

2. **Accessibility**
   - Ensure sufficient contrast ratios
   - Use appropriate text colors for backgrounds
   - Maintain focus states for interactive elements
   - Test with screen readers and keyboard navigation

3. **Component Usage**
   - Use the appropriate component class for each element
   - Combine with utility classes when needed
   - Follow the established patterns for consistent user experience
   - Use the `.dokan-layout` container to ensure proper styling

4. **Maintenance**
   - Use CSS variables for global color changes
   - Update the base Tailwind config for new color additions
   - Follow the established naming conventions
   - Keep styles consistent across components

## Implementation Examples

### Button Examples
```jsx
<div className="flex gap-2">
  <button className="dokan-btn">Primary Action</button>
  <button className="dokan-btn-secondary">Secondary Action</button>
  <button className="dokan-btn-tertiary">Tertiary Action</button>
</div>

<div className="flex gap-2">
  <button className="dokan-btn-info">View Details</button>
  <button className="dokan-btn-success">Approve</button>
  <button className="dokan-btn-warning">Review</button>
  <button className="dokan-btn-danger">Delete</button>
</div>
```

### Status Indicators
```jsx
<div className="flex gap-2">
  <span className="dokan-badge-info">Processing</span>
  <span className="dokan-badge-success">Active</span>
  <span className="dokan-badge-warning">Pending</span>
  <span className="dokan-badge-danger">Failed</span>
</div>
```

### Alert Messages
```jsx
<div className="space-y-4">
  <div className="dokan-alert-info">
    All systems are operational
  </div>
  <div className="dokan-alert-success">
    Your changes have been saved
  </div>
  <div className="dokan-alert-warning">
    Please review your recent changes
  </div>
  <div className="dokan-alert-danger">
    Failed to connect to the server
  </div>
</div>
```

### Links
```jsx
<div className="flex gap-2">
  <a href="#" className="dokan-link">Learn More</a>
  <a href="#" className="dokan-link">Contact Support</a>
  <a href="#" className="dokan-link">Privacy Policy</a>
  <a href="#" className="dokan-link">Terms of Service</a>
  <a href="#" className="dokan-link-danger">Terms of Service</a>
</div>
```

### Combined Implementation

For more complex UI, combine component classes with utility classes:

```jsx
<div className="p-4 rounded-lg bg-white shadow">
  <h2 className="text-lg font-semibold mb-4">Vendor Status</h2>
  
  <div className="flex items-center justify-between mb-4">
    <span className="dokan-badge-success">Active</span>
    <button className="dokan-btn-sm">Edit Status</button>
  </div>
  
  <div className="dokan-alert-info mb-4">
    Your store is currently visible to customers.
  </div>
  
  <div className="flex justify-end gap-2">
    <button className="dokan-btn-tertiary">Cancel</button>
    <button className="dokan-btn">Save Changes</button>
  </div>
</div>
```

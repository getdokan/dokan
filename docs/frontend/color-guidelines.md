# Dokan Color Guidelines

## Overview

This documentation outlines the color system used in Dokan and provides guidelines for consistent usage of color classes throughout the application. Dokan implements a semantic color system that aligns colors with their informational meaning.

## Semantic Color System

Dokan uses a semantic color system where colors represent specific meanings:

- **Info (Blue)** - Used for informational messages, neutral states, or in-progress actions
- **Success (Green)** - Used for successful operations, active states, or positive messages
- **Warning (Yellow)** - Used for alerts that require attention but aren't critical
- **Danger (Red)** - Used for errors, destructive actions, or critical warnings

## Base Color Classes

The semantic color classes follow this pattern:

| Class Type | Format | Example |
|------------|--------|---------|
| Text | `text-dokan-{semantic}` | `text-dokan-success` |
| Background | `bg-dokan-{semantic}` | `bg-dokan-warning` |
| Border/Ring | `ring-dokan-{semantic}` | `ring-dokan-danger` |

Where `{semantic}` is one of: `info`, `success`, `warning`, or `danger`.

## Component-Specific Classes

### Alert Classes
```jsx
// Info Alert
<div className="ring-1 ring-inset !dokan-alert-info">
  <span className="text-dokan-info">Info message</span>
</div>

// Success Alert
<div className="ring-1 ring-inset !dokan-alert-success">
  <span className="text-dokan-success">Success message</span>
</div>

// Warning Alert
<div className="ring-1 ring-inset !dokan-alert-warning">
  <span className="text-dokan-warning">Warning message</span>
</div>

// Danger Alert
<div className="ring-1 ring-inset !dokan-alert-danger">
  <span className="text-dokan-danger">Danger message</span>
</div>
```

### Button Classes
```jsx
// Primary Button
<button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn">
  Primary Action
</button>

// Secondary Button
<button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-secondary">
  Secondary Action
</button>

// Tertiary Button
<button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-tertiary">
  Tertiary Action
</button>

// Status Buttons
<button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-info">
  Info Action
</button>
<button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-success">
  Success Action
</button>
<button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-warning">
  Warning Action
</button>
<button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-danger">
  Danger Action
</button>
```

### Label/Badge Classes
```jsx
// Info Label
<span className="dokan-info">Info Label</span>

// Success Label
<span className="dokan-success">Success Label</span>

// Warning Label
<span className="dokan-warning">Warning Label</span>

// Danger Label
<span className="dokan-danger">Danger Label</span>
```

## Class Structure

### Alert Styling
- Ring styling: `ring-1 ring-inset`
- Semantic class: `!dokan-alert-{semantic}`

### Button Styling
- Base styling: `transition-colors duration-200 ease-in-out ring-1 ring-inset`
- Semantic class: `dokan-btn-{semantic}`

### Label Styling
- Semantic class: `dokan-{semantic}`

## Best Practices

1. **Consistent Usage** - Use colors according to their semantic meaning, not for visual preference.
2. **Accessible Combinations** - Ensure text colors have sufficient contrast with their backgrounds.
3. **Class Combinations** - Use the predefined class combinations for consistent styling.
4. **Semantic Meaning** - Reserve colors for their intended semantic meaning:
    - Green for success/active/positive
    - Blue for information/neutral/in-progress
    - Yellow for warnings/caution
    - Red for errors/destructive actions

## Implementation Examples

### Status Indicators
```jsx
<div className="flex gap-2">
  <span className="dokan-info">Processing</span>
  <span className="dokan-success">Active</span>
  <span className="dokan-warning">Pending</span>
  <span className="dokan-danger">Failed</span>
</div>
```

### Action Buttons
```jsx
<div className="flex gap-2">
  <button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-info">
    View Details
  </button>
  <button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-success">
    Approve
  </button>
  <button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-warning">
    Review
  </button>
  <button className="transition-colors duration-200 ease-in-out ring-1 ring-inset dokan-btn-danger">
    Delete
  </button>
</div>
```

### Alert Messages
```jsx
<div className="space-y-4">
  <div className="ring-1 ring-inset !dokan-alert-info">
    <span className="text-dokan-info">All systems are operational</span>
  </div>
  <div className="ring-1 ring-inset !dokan-alert-success">
    <span className="text-dokan-success">Your changes have been saved</span>
  </div>
  <div className="ring-1 ring-inset !dokan-alert-warning">
    <span className="text-dokan-warning">Please review your recent changes</span>
  </div>
  <div className="ring-1 ring-inset !dokan-alert-danger">
    <span className="text-dokan-danger">Failed to connect to the server</span>
  </div>
</div>
```

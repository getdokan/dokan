# Dokan Color Guidelines

## Overview

This documentation outlines the color system used in Dokan components and provides guidelines for consistent usage of color classes throughout the application. Dokan implements a semantic color system that aligns colors with their informational meaning.

## Semantic Color System

Dokan uses a semantic color system where colors represent specific meanings:

- **Info (Blue)** - Used for informational messages, neutral states, or in-progress actions
- **Success (Green)** - Used for successful operations, active states, or positive messages
- **Warning (Yellow)** - Used for alerts that require attention but aren't critical
- **Danger (Red)** - Used for errors, destructive actions, or critical warnings

## Text Color Classes

To apply semantic colors to text elements, use the following Tailwind CSS classes:

```jsx
<p className="text-dokan-info">Informational text</p>
<p className="text-dokan-success">Success text</p>
<p className="text-dokan-warning">Warning text</p>
<p className="text-dokan-danger">Danger text</p>
```

## Badge Component Styling

When using the Badge component from `@getdokan/dokan-ui`, you can apply semantic styling using a combination of Tailwind classes:

```jsx
// Info Badge
<Badge
    color="blue"
    label="Info"
    className="ring-1 ring-inset bg-dokan-info text-dokan-info ring-dokan-info"
/>

// Success Badge
<Badge
    color="green"
    label="Success"
    className="ring-1 ring-inset bg-dokan-success text-dokan-success ring-dokan-success"
/>

// Warning Badge
<Badge
    color="yellow"
    label="Warning"
    className="ring-1 ring-inset bg-dokan-warning text-dokan-warning ring-dokan-warning"
/>

// Danger Badge
<Badge
    color="red"
    label="Danger"
    className="ring-1 ring-inset bg-dokan-danger text-dokan-danger ring-dokan-danger"
/>
```

## Predefined Label Components

For convenience, Dokan provides prebuilt Label components that encapsulate these styles:

```jsx
import { InfoLabel, SuccessLabel, WarningLabel, DangerLabel } from '@dokan/components';

// Usage
<InfoLabel label="Info" />
<SuccessLabel label="Success" />
<WarningLabel label="Warning" />
<DangerLabel label="Danger" />
```

## Class Structure

The semantic color classes follow this pattern:

| Class Type | Format | Example |
|------------|--------|---------|
| Text | `text-dokan-{semantic}` | `text-dokan-success` |
| Background | `bg-dokan-{semantic}` | `bg-dokan-warning` |
| Border/Ring | `ring-dokan-{semantic}` | `ring-dokan-danger` |

Where `{semantic}` is one of: `info`, `success`, `warning`, or `danger`.

## Badge Styling Structure

The consistent badge styling includes three aspects:

1. **Ring styling**: `ring-1 ring-inset ring-dokan-{semantic}`
2. **Background color**: `bg-dokan-{semantic}`
3. **Text color**: `text-dokan-{semantic}`

## Best Practices

1. **Consistent Usage** - Use colors according to their semantic meaning, not for visual preference.
2. **Accessible Combinations** - Ensure text colors have sufficient contrast with their backgrounds.
3. **Predefined Components** - Use the predefined Label components when possible for consistency.
4. **Semantic Meaning** - Reserve colors for their intended semantic meaning:
    - Green for success/active/positive
    - Blue for information/neutral/in-progress
    - Yellow for warnings/caution
    - Red for errors/destructive actions

## Implementation Examples

### Text with Semantic Colors

```jsx
<div>
  <p className="text-dokan-info">Your order is being processed.</p>
  <p className="text-dokan-success">Payment completed successfully!</p>
  <p className="text-dokan-warning">Your subscription will expire soon.</p>
  <p className="text-dokan-danger">Failed to connect to the server.</p>
</div>
```

### Status Indicators

```jsx
<div className="flex gap-2">
  <InfoLabel label="Processing" />
  <SuccessLabel label="Active" />
  <WarningLabel label="Pending" />
  <DangerLabel label="Failed" />
</div>
```

### Custom Badge Implementation

```jsx
<Badge
  color="blue"
  label="Custom Status"
  className="ring-1 ring-inset bg-dokan-info text-dokan-info ring-dokan-info"
/>
```

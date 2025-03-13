# Layout Components Filters

## Overview
Extension points using WordPress Filters in Dokan's layout components.

## Filter Reference

### Header (`/src/layout/Header.tsx`)
| Filter Name | Arguments | Return | Description |
|------------|-----------|--------|-------------|
| `dokan-vendor-dashboard-header-title` | `title: string` | `string` | Modify dashboard header title |

## Basic Implementation

```javascript
// Add filter in your plugin
wp.hooks.addFilter(
    'dokan-vendor-dashboard-header-title',    // Filter name
    'my-plugin-name',                         // Namespace
    function(title) {                         // Callback
        return 'Modified Title';              // Return modified value
    }
);
```

## Filter Priority
```javascript
// Add filter with priority
wp.hooks.addFilter(
    'dokan-vendor-dashboard-header-title',
    'my-plugin-name',
    function(title) {
        return 'Modified Title';
    },
    10                                      // Priority (default: 10)
);
```

## Typescript Interface
```typescript
interface FilterCallback {
    (title: string): string;
}
```

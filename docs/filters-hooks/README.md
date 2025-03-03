# Guidelines for Creating Filter Documentation

## File Structure
1. Create markdown file in `/docs/filters-hooks/` directory
2. Name the file based on the feature area (e.g., `layout-filters.md`, `product-filters.md`)

## Documentation Template
```markdown
# [Feature Name] Component Filters

## Overview
Brief one-line description of the feature area.

## Filter Reference

### [Component Name] (`path/to/component`)
| Filter Name | Arguments | Return | Description |
|------------|-----------|--------|-------------|
| `filter-name` | argument types | return type | Brief description |

## Basic Implementation
```javascript
wp.hooks.addFilter(
    'filter-name',
    'namespace',
    function(value) {
        return modifiedValue;
    }
);
```

## Typescript Interface
```typescript
interface FilterCallback {
    (value: ValueType): ReturnType;
}
```
```

## Example Implementation
Here's how your `product-filters.md` might look:

```markdown
# Product Component Filters

## Overview
Filter hooks available in product management features.

## Filter Reference

### Product Form (`/components/products/Form.tsx`)
| Filter Name | Arguments | Return | Description |
|------------|-----------|--------|-------------|
| `dokan-product-form-fields` | `fields: FormField[]` | `FormField[]` | Modify product form fields |
| `dokan-product-validation-rules` | `rules: ValidationRule[]` | `ValidationRule[]` | Modify validation rules |

## Basic Implementation
```javascript
wp.hooks.addFilter(
    'dokan-product-form-fields',
    'my-plugin',
    function(fields) {
        return [...fields, newField];
    }
);
```

## Typescript Interface
```typescript
interface FormField {
    name: string;
    type: string;
    // other properties
}
```
```

## Key Points to Remember
1. Keep filter names consistent: `dokan-[feature]-[action]`
2. Document all arguments passed to filter
3. Specify return type clearly
4. Include TypeScript interfaces when needed
5. Add basic implementation example

## Naming Conventions
- Use kebab-case for filter names
- Keep descriptions concise
- Be specific about arguments and return types
- Use consistent naming across components

## Documentation Checklist
- [ ] Created file in correct location
- [ ] Used correct naming format for filters
- [ ] Documented all arguments
- [ ] Specified return types
- [ ] Added implementation example
- [ ] Included TypeScript interfaces if needed

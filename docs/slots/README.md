# Guidelines for Creating Slot Documentation

## File Structure
1. Create a markdown file in `/docs/slots/` directory
2. Name the file based on the feature area (e.g., `product-slots.md`, `order-slots.md`)

## Documentation Template
```markdown
# [Feature Name] Component Slots

## Overview
Brief one-line description of the feature area.

## Slot Reference

### [Component Name] (`path/to/component`)
| Slot Name | Position | Props | Description |
|-----------|----------|-------|-------------|
| `dokan-component-position` | Location | Props object or None | Brief description |

[Add tables for each component in your feature]

## Basic Implementation
```jsx
// Only if special implementation is needed
import { Fill } from '@wordpress/components';

const ExampleUsage = () => (
    <Fill name="slot-name">
        {(props) => (
            // Example implementation
        )}
    </Fill>
);
```

## Props Interface
```typescript
// Only if component has props ( If there are no props, you can skip this section but keep the heading and mention "None" )
interface CustomProps {
    property: type;
}
```
```

## Example Implementation
Here's how your `product-slots.md` might look:

```markdown
# Product Component Slots

## Overview
Extension points for product listing and management features.

## Slot Reference

### Product List (`/components/products/List.tsx`)
| Slot Name | Position | Props | Description |
|-----------|----------|-------|-------------|
| `dokan-product-list-before` | Before list | None | Content before product list |
| `dokan-product-list-actions` | Action area | `{ selection }` | Bulk actions for products |
| `dokan-product-list-after` | After list | None | Content after product list |

### Product Form (`/components/products/Form.tsx`)
| Slot Name | Position | Props | Description |
|-----------|----------|-------|-------------|
| `dokan-product-form-before` | Before form | `{ product }` | Content before product form |
| `dokan-product-form-fields` | Form fields | `{ product }` | Additional form fields |

## Props Interface ( If there are no props, you can skip this section but keep the heading and mention "None" )
```typescript
interface ProductProps {
    product: Product;
    selection?: number[];
}
```
```

## Key Points to Remember
1. Keep slot names consistent: `dokan-[feature]-[component]-[position]`
2. Use clear, brief descriptions
3. Document all props passed to slots
4. Include TypeScript interfaces when props are used
5. Add basic implementation only if needed

## Naming Conventions
- Use kebab-case for slot names
- Keep descriptions concise
- Be specific about positions
- Use consistent prop naming

## Documentation Checklist
- [ ] Created file in correct location
- [ ] Used correct naming format for slots
- [ ] Included all slots in feature area
- [ ] Documented all props
- [ ] Added TypeScript interfaces if needed

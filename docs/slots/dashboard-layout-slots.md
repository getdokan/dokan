# Layout Components Slots

## Overview
Extension points available in Dokan's layout components: Header, Footer, Sidebar, and Content Area.

## Slot Reference

### Header (`/src/layout/Header.tsx`)
| Slot Name | Position | Props | Description |
|-----------|----------|-------|-------------|
| `dokan-before-header` | Before header | None | Content before header section |
| `dokan-header-actions` | Header right | `{ navigate }` | Actions in header right area |
| `dokan-after-header` | After header | None | Content after header section |

### Content Area (`/src/layout/ContentArea.tsx`)
| Slot Name | Position | Props | Description |
|-----------|----------|-------|-------------|
| `dokan-layout-content-area-before` | Before content | None | Content before main area |
| `dokan-layout-content-area-after` | After content | None | Content after main area |

### Footer (`/src/layout/Footer.tsx`)
| Slot Name | Position | Props | Description |
|-----------|----------|-------|-------------|
| `dokan-footer-area` | Footer content | None | Content in footer area |

## Basic Implementation

```jsx
import { Fill } from '@wordpress/components';

// Header action example
const HeaderAction = () => (
    <Fill name="dokan-header-actions">
        {({ navigate }) => (
            <button onClick={() => navigate('/new')}>Add New</button>
        )}
    </Fill>
);

// Content area example
const ContentExtension = () => (
    <Fill name="dokan-layout-content-area-before">
        <div>Content before main area</div>
    </Fill>
);
```

## Props Interface
```typescript
interface HeaderActionProps {
    navigate: (path: string) => void;
}
```

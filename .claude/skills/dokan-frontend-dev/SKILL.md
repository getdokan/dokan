---
name: dokan-frontend-dev
description: Add or modify Dokan frontend code (React, TypeScript, Vue, Tailwind). Use when creating components, hooks, stores, or modifying webpack configuration.
---

# Dokan Frontend Development

This skill provides guidance for developing Dokan Lite frontend code.

## Tech Stack

| Technology | Usage | Files |
|---|---|---|
| React + TypeScript | New admin/dashboard components | `.tsx` files in `src/` |
| Vue 2.7 | Legacy vendor dashboard & frontend | `.vue` files, `main.js` entry points |
| Tailwind CSS | Styling (with WordPress compat) | `tailwind.config.js` |
| Less | Legacy styles | `assets/src/less/` |
| @wordpress/data | State management (Redux-like) | `src/stores/` |
| Webpack 5 | Build system (80+ entry points) | `webpack.config.js`, `webpack-entries.js` |

## React Components

### Conventions

- **Functional components only** (no class components)
- **PascalCase** file names: `Button.tsx`, `DokanModal.tsx`
- **Wrap `@getdokan/dokan-ui`** components for project consistency:

```tsx
import { Button as DokanUIButton } from '@getdokan/dokan-ui';
import { twMerge } from 'tailwind-merge';

const DokanButton = ({ className = '', variant = 'primary', ...props }: DokanButtonProps) => {
    const config = variantConfig[variant];
    return (
        <DokanUIButton
            color={config.color}
            className={twMerge(config.className, className)}
            {...props}
        />
    );
};

export default DokanButton;
```

### Barrel Exports

Export from `index.tsx` in component directories:

```tsx
// src/components/index.tsx
export { default as DokanButton } from './Button';
export { default as DokanModal } from './modals/DokanModal';
export { default as DataViews } from './dataviews/DataViewTable';
```

### Global Libraries

Components are exposed globally on `window.dokan`:

- `window.dokan.components` — Shared React components (`src/components/index.tsx`)
- `window.dokan.utilities` — Utility functions (`src/utilities/index.ts`)
- `window.dokan.reactHooks` — Custom hooks (`src/hooks/index.tsx`)
- `window.dokan.coreStore` — Core data store (`src/stores/core/store.ts`)

## Custom Hooks

Located in `src/hooks/`, TypeScript, `use` prefix:

```tsx
import { useSelect } from '@wordpress/data';

export const useCurrentUser = () => {
    return useSelect((select) => {
        return select('dokan/core').getCurrentUser();
    }, []);
};
```

Available: `useCategories`, `useCurrentUser`, `useCustomerById`, `useCustomerSearch`, `useMutationObserver`, `usePermission`, `useProducts`, `ViewportDimensions`.

## State Management

Uses `@wordpress/data` (Redux-like) stores in `src/stores/`:

```
src/stores/
├── core/              # dokan/core store
│   ├── actions.ts
│   ├── reducer.ts
│   ├── selectors.ts
│   ├── resolvers.ts
│   └── defaultState.ts
├── productCategories/
├── products/
└── vendors/
```

Store creation:

```tsx
import { createReduxStore } from '@wordpress/data';

export const DOKAN_CORE_STORE = 'dokan/core';

const store = createReduxStore<CoreState, typeof actions, typeof selectors>(
    DOKAN_CORE_STORE,
    { reducer, selectors, actions, resolvers }
);
```

## Tailwind CSS

Config: `tailwind.config.js` (extends `base-tailwind.config.js`)

- **`preflight: false`** — Disabled to avoid conflicts with WordPress styles
- Use `twMerge()` from `tailwind-merge` for conditional class composition
- RTL support included

## TypeScript

Config: `tsconfig.json`

- **Strict mode:** enabled (`strict: true`, `noImplicitAny`, `strictNullChecks`)
- **Target:** ESNext, module: ESNext, JSX: react-jsx
- **Path aliases:**
  - `@src/*` → `src/*`
  - `frontend/*` → `src/frontend/*`
  - `admin/*` → `src/admin/*`
  - `reports/*` → `src/reports/*`

## Webpack

Config: `webpack.config.js` (extends `@wordpress/scripts` default config)

- **Entry points:** Defined in `webpack-entries.js` (80+ entries)
- **Output:** `assets/js/` (JS), `assets/css/` (CSS via MiniCssExtractPlugin)
- **Loaders:** Vue (VueLoaderPlugin), Less (less-loader), SVG (inline), images (→ `../images/`)
- **Externals:** `jquery: 'jQuery'`, `moment`, WooCommerce packages as `wc.*`
- **Dependency extraction:** `DependencyExtractionWebpackPlugin` with custom `requestToExternal` mapping

### Adding a New Entry Point

Add to `webpack-entries.js`:

```js
module.exports = {
    // ...existing entries
    'my-feature': './src/my-feature/index.tsx',
};
```

## Localization / Translation (JavaScript)

**Library:** `@wordpress/i18n` — WordPress's official i18n package.

### React / TypeScript

```tsx
import { __, _n, sprintf } from '@wordpress/i18n';

// Simple translation
const label = __( 'Save changes', 'dokan-lite' );

// With sprintf for dynamic content
const message = sprintf(
    /* translators: %s: vendor name */
    __( 'Welcome, %s!', 'dokan-lite' ),
    vendorName
);

// Pluralization
const itemLabel = sprintf(
    _n( '%d item', '%d items', count, 'dokan-lite' ),
    count
);

// In JSX
<button>{ __( 'Submit', 'dokan-lite' ) }</button>
```

### Translator Comments

Always add `/* translators: */` comments before `sprintf()` with placeholders — these are extracted into the POT file:

```tsx
sprintf(
    /* translators: 1: start date 2: end date */
    __( 'From %1$s to %2$s', 'dokan-lite' ),
    startDate,
    endDate
)
```

### Vue 2.7 (Legacy)

Vue components use a translation mixin from `src/utils/Mixin.js` that wraps `@wordpress/i18n`:

```vue
<template>
    <h2>{{ __( 'Dashboard', 'dokan-lite' ) }}</h2>
</template>

<script>
import Mixin from 'admin/utils/Mixin';

export default {
    mixins: [ Mixin ],
};
</script>
```

Available mixin methods: `__()`, `_x()`, `__n()`, `_nx()`, `sprintf()`.

### Script Translation Registration (PHP side)

When registering a new script, translations are auto-registered via `wp_set_script_translations()` in `includes/Assets.php`. For custom scripts:

```php
wp_set_script_translations( 'my-script-handle', 'dokan-lite', plugin_dir_path( DOKAN_FILE ) . 'languages' );
```

### Localized Data (PHP → JS)

Server-side data is passed to JS via `wp_localize_script()`. Access via `window.dokan`:

-   `window.dokan.i18n_date_format` — WordPress date format
-   `window.dokan.i18n_time_format` — WordPress time format
-   `window.dokan.currency` — WooCommerce currency settings (symbol, decimals, position)
-   `window.dokan.timepicker_locale` — Localized AM/PM, hr/hrs/mins strings
-   `window.dokan.daterange_picker_local` — Localized day/month names, labels

Filter hooks for extending: `dokan_helper_localize_script`, `dokan_frontend_localize_script`, `dokan_admin_localize_script`.

### Key Rules

-   **Text domain:** Always use `'dokan-lite'` (not `'dokan'`)
-   **Never concatenate** translated strings — use `sprintf()` with placeholders
-   **Always add translator comments** for strings with placeholders
-   **Use `_n()` for plurals** — never use ternary with `__()`

## Vue 2.7 (Legacy)

Older components use Vue 2.7 with `.vue` files. New development should use React unless modifying existing Vue code. Vue entry points typically use `main.js`.

## Key Reference Files

- `webpack.config.js` — Webpack configuration
- `webpack-entries.js` — All entry points
- `tailwind.config.js` / `base-tailwind.config.js` — Tailwind config
- `tsconfig.json` — TypeScript configuration
- `postcss.config.js` — PostCSS configuration
- `src/components/index.tsx` — Component barrel exports
- `src/hooks/index.tsx` — Hooks barrel exports
- `src/stores/core/index.ts` — Core data store

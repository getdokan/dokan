# 🚀 Dokan Pro Developer Guide: Module and Route Integration

## 📁 Project Structure Overview

### Core Feature Structure
```
Root/
├── includes/
│   └── PHP Files
│
├── assets/                 # Compiled assets
│
└── src/
    ├── components/
    │   └── *.{jsx,tsx}    # Component files
    │
    └── features/
        └── {FeatureName}/ # e.g., Announcement, SEO
            ├── components/ # Feature-specific components
            ├── scss/
            │   └── tailwind.scss
            └── custom-tailwind.config.js
```

### Module Structure
```
Module/
├── includes/
│   └── PHP Files
│
├── assets/                # Compiled assets
│
├── src/
│   ├── components/
│   │   └── *.{jsx,tsx}   # Component files
│   │
│   ├── scss/
│   │   └── tailwind.scss
│   │
│   └── custom-tailwind.config.js
│
└── Other Files
```

## 🌿 Getting Started

### 1. Branch Setup
```bash
# Create a new branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```
> 💡 Always create new features branching from the latest develop branch

### 2. 🎨 Tailwind Configuration

#### Create `tailwind.scss`
📍 Location: `modules/{module-name}/assets/src/scss/tailwind.scss`
```scss
@config './../custom-tailwind.config.js';
@import "@/base-tailwind";

// 💡 Uncomment for Dokan UI components
// @import "@getdokan/dokan-ui/dist/dokan-ui.css";
```

#### Setup `custom-tailwind.config.js`
📍 Location: `modules/{module-name}/assets/src/custom-tailwind.config.js`
```javascript
import baseConfig from '../../../base-tailwind.config';

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [
        ...baseConfig.content,
        './modules/{module-name}/src/**/*.{js,jsx,ts,tsx}',
    ],
};

export default updatedConfig;
```

## 🛠️ Component and Route Integration

### 1. Import Tailwind in Main Component
```typescript
import './scss/tailwind.scss';
```

### 2. Register Route and Component
```typescript
import Component from '...';
import './scss/tailwind.scss';
import { __ } from '@wordpress/i18n';

document.addEventListener('DOMContentLoaded', () => {
    window.wp.hooks.addFilter(
        'dokan-dashboard-routes',
        '{your-namespace}',
        (routes) => {
            routes.push({
                id: '{your-route-id}',         // Unique identifier
                title: __('Page Heading', 'text-domain'),
                element: <Component />,
                path: 'my-path',
                exact: true,
                order: 10,
                parent: '',
            });

            return routes;
        }
    );
});
```

## 🏗️ Build and Integration

### 1. Webpack Configuration
Add your entry file (`index.ts/js/jsx/tsx`) to `webpack.entries.js`

### 2. PHP Integration
```php
// Register Scripts and Styles
$script_assets = plugin_dir_path(__FILE__) . 'assets/js/{file-name}.asset.php';

if (file_exists($script_assets)) {
    $assets = include $script_assets;

    // Register Style
    wp_register_style(
        'user-handle',
        {ASSETS_DIR} . '/js/{file-name}.css',
        false,
        $assets['version'],
        'all'
    );

    // Register Script
    wp_register_script(
        'user-handle',
        {ASSETS_DIR} . '/js/{file-name}.js',
        $assets['dependencies'],
        $assets['version'],
        true
    );
}

// Enqueue in Vendor Dashboard
add_action('wp_enqueue_scripts', [$this, 'load_scripts']);

public function load_scripts() {
    if (dokan_is_seller_dashboard()) {
        wp_enqueue_script('{handle-name}');
        wp_enqueue_style('{handle-name}');
    }
}
```

## 🎨 Color System Integration

### Available Dokan Colors
| Color Variable | Purpose |
|---------------|---------|
| `dokan-sidebar` | Sidebar background |
| `dokan-sidebar-hover` | Sidebar hover states |
| `dokan-btn` | Button colors |
| `dokan-btn-hover` | Button hover states |

### Usage Examples
```css
.bg-dokan-btn        /* Background color */
.text-dokan-btn      /* Text color */
.border-dokan-btn    /* Border color */
```

## 📝 Best Practices
1. ✨ Use meaningful route IDs and namespaces
2. 🔍 Follow the prescribed directory structure
3. 🎯 Implement proper error handling
4. 📱 Ensure responsive design
5. 🧪 Test thoroughly before deployment

## 🆘 Need Help?
- 📚 Check our [Documentation](https://docs.getdokan.com)
- 💬 Join our [Developer Community](https://community.getdokan.com)
- 🐛 Report issues on [GitHub](https://github.com/getdokan/dokan-pro/issues)

---
*🔄 Last Updated: January 2025*

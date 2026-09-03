# 🚀 Dokan Developer Guide: Adding New Routes and Components

## 📋 Overview
This guide walks you through the process of adding new routes and components to Dokan Lite. Follow these steps to ensure proper integration with our existing architecture.

## 🎨 Setting Up Tailwind Configuration
### 1. Create `custom-tailwind.config.js`
First, create your custom Tailwind configuration file:

```javascript
import baseConfig from '../../base-tailwind.config'; // 📝 Update path as needed

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [
        ...baseConfig.content,
        './src/{your-path}/**/*.{js,jsx,ts,tsx}', // 📝 Update path as needed
    ],
};

export default updatedConfig;
```

### 2. Create `tailwind.scss`
💡 **Important**: Import `dokan-ui.css` if you're using [Dokan UI components](https://www.npmjs.com/package/@getdokan/dokan-ui)

```scss
@config './custom-tailwind.config.js'; // 📝 Update path as needed
@import "@/base-tailwind";

// 🎯 Uncomment if using Dokan UI components
// @import "@getdokan/dokan-ui/dist/dokan-ui.css";
```

## 🏗️ Component Creation
### Create Your Component
⚠️ **Remember**: Import your `tailwind.scss` file in your component

```jsx
import './tailwind.scss';

function Component(props) {
    return (
        <div className="bg-gradient-to-r from-red-600 via-green-500 to-yellow-600 inline-block text-transparent bg-clip-text">
            This is my component body...
        </div>
    );
}

export default Component;
```

## 🛣️ Route Registration
### Add Route Configuration
Navigate to `dokan-lite/src/Routing/index.tsx` and add your route configuration:

```javascript
routes.push({
    id: 'your-page',                                    // 🔑 Unique identifier
    title: __('Your page heading...', 'dokan-lite'),    // 📝 Page title
    element: <Component/>,                              // 🎨 Your component
    path: 'your-page',                                  // 🔗 URL path
    exact: true,                                        // ✅ Exact path matching
    order: 10,                                          // 🔢 Menu order
    parent: '',                                         // 👆 Parent route (if any)
});
```

## 🎨 Color Customization Guide

### Available Dokan-Specific Colors
These color variables are available for use in your components:

| Color Name | Usage |
|------------|-------|
| `dokan-sidebar` | Sidebar background |
| `dokan-sidebar-hover` | Sidebar hover states |
| `dokan-btn` | Button colors |
| `dokan-btn-hover` | Button hover states |

### Usage Examples
The color system automatically handles different contexts:

```css
/* Examples of color usage */
.bg-dokan-btn          /* Uses --dokan-button-background-color */
.text-dokan-btn        /* Automatically adapts for text */
.border-dokan-btn      /* Automatically adapts for borders */
```

## 🔍 Pro Tips
- ✅ Always use meaningful route IDs and paths
- 🎨 Leverage Dokan's color system for consistent theming
- 📱 Ensure your components are responsive
- 🧪 Test your routes thoroughly before deployment

## 📚 Additional Resources
- [Dokan UI Components Documentation](https://www.npmjs.com/package/@getdokan/dokan-ui)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Need Help?
If you encounter any issues or have questions, please:
1. Check our existing documentation
2. Reach out to the development team
3. Submit an issue on our repository

---
*🔄 Last Updated: January 2025*

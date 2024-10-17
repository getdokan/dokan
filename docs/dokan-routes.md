# Register a new `route` and `component` in dokan lite.

## Create `custom-tailwind.config.js` in your directory
```js
import baseConfig from '../../base-tailwind.config'; // update the location according to your location

/** @type {import('tailwindcss').Config} */
const updatedConfig = {
    ...baseConfig,
    content: [
        ...baseConfig.content,
        './src/{your-path}/**/*.{js,jsx,ts,tsx}', // update the location according to your location
    ],
};

export default updatedConfig;
```

## Create `tailwind.scss` in your directory
⚠️ Make sure you imported `dokan-ui.css` if you are using [Dokan ui components](https://www.npmjs.com/package/@getdokan/dokan-ui)
```scss
@config './custom-tailwind.config.js'; // update the location according to your location
@import "@/base-tailwind";
// @import "@getdokan/dokan-ui/dist/dokan-ui.css"; // Make sure to uncomment it if you use Dokan UI in you components

```

## Create the component that you want to show when visit your specific route.
⚠️ Make sure you import your `tailwind.scss` here.
```jsx
import './tailwind.scss';
function Component(props) {
    return (
        <div className="bg-gradient-to-r from-red-600 via-green-500 to-yellow-600 inline-block text-transparent bg-clip-text">This is my component body...</div>
    );
}

export default Component;
```

## Register your `route` and `router component`
Navigate to `dokan-lite/src/Routing/index.tsx` and push your route and component before the `dokan-frontend-routes` apply filters.
```js
routes.push(
    {
        id: 'your-page',
        title: __( 'Your page heading...', 'dokan-lite' ),
        element: <Component/>,
        path: 'your-page',
        exact: true,
        order: 10,
        parent: '',
    }
);
```

## Color Customizer support for components

## Dokan Specific Color
```text
dokan-sidebar
dokan-sidebar-hover
dokan-btn
dokan-btn-hover
```
## Color usecase
The usage of the color name for the background `.bg-dokan-btn` will use `--dokan-button-background-color` variable and other use of the color name such as `.text-dokan-btn` or `.border-dokan-btn` will take the correct color from the variable. 

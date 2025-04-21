# Back Button Navigation Documentation

- [Overview](#overview)
- [Implement Back Button Navigation](#implement-back-button-navigation)
- [How to Process](#how-to-process)
- [Using the Filter Hook](#using-the-rilter-hook)

## Overview

The back button functionality in the `Dokan` dashboard allows for consistent navigation across different views. This
document explains how to implement and customize back navigation using the routing system and hooks.

## Implement Back Button Navigation

### Define Route with backUrl

When registering a route, include the backUrl property to specify where the back button should navigate to:

### Initiate `Back Button` by passing the `backUrl` props:

```jsx
routes.push({
    id: 'custom-settings',
    title: 'Module Settings',
    element: <YourComponent/>,
    path: '/module/settings/:moduleId',
    backUrl: '/module/settings', // Add backUrl props with redirected `URL` for getting Back Button.
    // If query params need then we can pass by using `:`
    // backUrl: '/settings/shipping/:zoneID', 
    exact: true,
    order: 10,
    parent: 'settings',
    capabilities: ['your_menu_capabilities'],
});
```

**Note that:** `backUrl` can include route parameters (prefixed with `:`) that will be substituted with actual values
from the current route.

### How to Process:

The `Header` component extracts the backUrl from the route and processes it:

```jsx
const Header = ({route}) => {
    let {title = '', backUrl = '', id} = route;

    const navigate = useNavigate();
    const params = useParams();
    // ... other hooks

    /**
     * Parse url from `backUrl` query params.
     *
     * @param urlString
     *
     * @return string
     */
    const parseBackUrl = (urlString: string) => {
        // Replace pattern :paramName with actual param values
        const url = urlString.replace(/:(\w+)/g, (match, key) => {
            return params[key];
        });

        return url;
    };

    // Apply filter to potentially customize backUrl
    backUrl = wp.hooks.applyFilters(
        `dokan-vendor-${kebabCase(id)}-dashboard-header-backUrl`,
        backUrl
    );

    return (
        // ... header container
        <div className="dokan-header-actions grid grid-cols-2 flex-wrap gap-2.5 md:justify-end">
            {backUrl && (
                <DokanButton
                    variant="secondary"
                    className={`col-span-2 flex items-center`}
                    onClick={() => navigate(parseBackUrl(backUrl))}
                >
                    <ArrowLeft
                        className={`text-dokan-link`}
                        size={16}
                    />
                    {__('Back', 'dokan-lite')}
                </DokanButton>
            )}
            <Slot
                name="dokan-header-actions"
                fillProps={{...routerProps}}
            />
        </div>
        // ... other header elements
    );
};
```

### Using the Filter Hook

You can customize the back URL for specific routes using the WordPress hooks system. The filter name follows the
pattern: `dokan-vendor-{routeId}-dashboard-header-backUrl`.

```jsx
// If the route is:
routes.push({
    id: 'custom-settings',
    title: 'Module Settings',
    element: <YourComponent/>,
    path: '/module/settings/:moduleId',
    backUrl: '/module/settings', // Add backUrl props with redirected `URL` for getting Back Button.
    // If query params need then we can pass by using `:`
    // backUrl: '/settings/shipping/:zoneID', 
    exact: true,
    order: 10,
    parent: 'settings',
    capabilities: ['your_menu_capabilities'],
});

// Customize back URL for a specific route
wp.hooks.addFilter(
    'dokan-vendor-custom-settings-dashboard-header-backUrl',
    'my-plugin/custom-back-navigation',
    (backUrl) => {
        // You can completely override the backUrl or modify it
        return '/custom-back-url';
    }
);
```

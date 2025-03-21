# Dokan Core Store

The `Dokan Core Store` is a `WordPress Data Store` that provides access to the core data of the `Dokan` plugin. This store is available in the `@dokan/stores/core` package.

```js
import { useSelect } from '@wordpress/data';
import coreStore from '@dokan/stores/core';

const App = () => {
    const isVendorStaff = useSelect( ( select ) => {
        return select( coreStore ).isVendorStaff();
    }, [] );
    
    const getStoreSettings = useSelect( ( select ) => {
        return select( coreStore ).getStoreSettings();
    }, [] );

    const currentUser = useSelect( ( select ) => {
        return select( coreStore ).getCurrentUser();
    }, [] );
};
```

## Use Dokan Hooks

```js
import { usePermission, useCurrentUser } from '@dokan/hooks';

/*
// or import separately
import { usePermission } from '@dokan/hooks/usePermission';
import { useCurrentUser } from '@dokan/hooks/useCurrentUser';
*/

const App = () => {
    const isDokandar = usePermission('dokandar'); // you can pass string as single permission or pass string[] array for multiple permission checking
    const { currentUser } = useCurrentUser();
}

```

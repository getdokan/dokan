# Dokan Core Store

The `Dokan Core Store` is a `WordPress Data Store` that provides access to the core data of the `Dokan` plugin. This store is available in the `@dokan/stores/core` package.

```js
import { useSelect } from '@wordpress/data';
import coreStore from '@dokan/stores/core';

export const usePermission = () => {
    const hasPermission = useSelect( ( select ) => {
        return select( coreStore ).hasCap( 'dokandar' );
    }, [] );

    const currentUser = useSelect( ( select ) => {
        return select( coreStore ).getCurrentUser();
    }, [] );

    return { hasPermission, currentUser };
};
```

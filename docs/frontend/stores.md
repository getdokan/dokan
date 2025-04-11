# How to Register a New Store in Dokan

This guide explains how to register a new store in Dokan following our established pattern for the `dokan/core` store.

## Store Structure

Follow these steps to create a new store:

1. Choose a short, meaningful name for your store.
2. Create a new directory at `src/stores/{store-name}/` to house your store files.
3. Follow the core store pattern with these files:
    - `index.ts` - Store creation
    - `actions.ts` - Store actions
    - `selectors.ts` - Selectors for retrieving data
    - `reducer.ts` - Reducer to handle state changes
    - `defaultState.ts` - Initial state definition
    - `resolvers.ts` - Async data resolution
    - `store.ts` - Store registration

## Registration Steps

### 1. Create Type Definitions

Create a TypeScript definition file in `src/definitions/{store-name}.ts` that defines your store's state structure:

```typescript
export type YourStoreState = {
    // Define your state structure here
    items: any[];
    // other properties...
};
```

### 2. Add Webpack Entry Points

Add the following to `webpack-entries.js`:

```javascript
'{store-name}-store'
:
'/src/stores/{store-name}/store.ts',
```

### 3. Register in Assets.php

Add the entry to the `get_scripts()` method in `includes/Assets.php`:

```php
$store_name_asset_file = DOKAN_DIR . '/assets/js/{store-name}-store.asset.php';
if ( file_exists( $store_name_asset_file ) ) {
    $store_name_asset = require $store_name_asset_file;

    // Register store scripts.
    $scripts['dokan-stores-{store-name}'] = [
        'version' => $store_name_asset['version'],
        'src'     => $asset_url . '/js/{store-name}-store.js',
        'deps'    => $store_name_asset['dependencies'],
    ];
}
```

## Implementation Details

### The Store Files

1. **store.ts** - Registers the store:

```typescript
import {register} from '@wordpress/data';
import store from './index';

register(store);

export default store;
```

2. **index.ts** - Creates the Redux store:

```typescript
import {createReduxStore} from '@wordpress/data';
import reducer from './reducer';
import actions from './actions';
import selectors from './selectors';
import resolvers from './resolvers';
import {YourStoreState} from '@dokan/definitions/{store-name}';

export const storeName = 'dokan/{store-name}';

const store = createReduxStore<YourStoreState, typeof actions, typeof selectors>(
    storeName,
    {
        reducer,
        selectors,
        actions,
        resolvers,
    }
);

export default store;
```

3. **actions.ts**, **reducers.ts**, **selectors.ts**, and **resolvers.ts** - Implement according to your store's needs.

## Using the Store

Import and use the store in your components:

```typescript
import {useSelect, useDispatch} from '@wordpress/data';
import store from '@dokan/stores/{store-name}';

function YourComponent() {
    const {items} = useSelect((select) => {
        return {
           items: select(store).getItems(),
        };
    }, []);

    const {setItems} = useDispatch(storeModule);

    // Use items and setItems in your component
}
```

# Dokan Product Store

The `Dokan Product Store` manages product data  within Dokan. Use this store  products.

```js
import { useSelect,resolveSelect } from '@wordpress/data';
import productStore from '@dokan/stores/products';

const App = () => {
    const products = useSelect( ( select ) => {
        return select( productStore ).getItems();
    }, []);

    const singleProduct = useSelect( ( select ) => {
        return select( productStore ).getItem( 1 ); // Get product with ID 1
    }, []);

    // async product fetch using resolveSelect
    
    const fetchProducts = async () => {
        resolveSelect( productStore )
                        .getItems( {
                            per_page: 10,
                            search: searchValue,
                            _fields: 'id,name',
                            exclude: [ 1, 2, 3 ], // Exclude products with IDs 1, 2, and 3
                        } )
                        .then( ( response ) => {
                               const mappedResponse = response.map( ( item ) => ( {
                                    value: item.id,
                                    label: item.name,
                                } ) )
                        } );
    };

    // Additional logic to handle products can be added here
};

```

# Dokan Product Category Store
The `Dokan Product Category Store` manages product categories within Dokan. Use this store to manage product categories.

```js
import { useSelect,resolveSelect } from '@wordpress/data';
import productCategoryStore from '@dokan/stores/product-categories';
const App = () => {
    const categories = useSelect( ( select ) => {
        return select( productCategoryStore ).getItems();
    }, []);

    const singleCategory = useSelect( ( select ) => {
        return select( productCategoryStore ).getItem( 1 ); // Get category with ID 1
    }, []);

    // async category fetch using resolveSelect
    
    const fetchCategories = async () => {
        resolveSelect( productCategoryStore )
                        .getItems( {
                            per_page: 10,
                            search: searchValue,
                            _fields: 'id,name',
                            exclude: [ 1, 2, 3 ], // Exclude categories with IDs 1, 2, and 3
                        } )
                        .then( ( response ) => {
                               const mappedResponse = response.map( ( item ) => ( {
                                    value: item.id,
                                    label: item.name,
                                } ) )
                        } );
    };

    // Additional logic to handle categories can be added here
};

```


## Dependency Resolution

The Dokan dependency extraction webpack plugin will automatically handle the mapping of `@dokan/stores/{store-name}` to
the global `dokan.{store-name}-store` when your code is bundled.

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
    const currentUser = useCurrentUser();
}

```

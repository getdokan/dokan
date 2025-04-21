import { createReduxStore } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { actions } from './actions';
import { resolvers } from './resolvers';
import { State } from '@dokan/definitions/dokan-product-categories';

export const DOKAN_PRODUCT_CATEGORIES_STORE = 'dokan/product-categories';

const store = createReduxStore< State, typeof actions, typeof selectors >(
    DOKAN_PRODUCT_CATEGORIES_STORE,
    {
        reducer,
        actions,
        selectors,
        resolvers,
    }
);

export default store;

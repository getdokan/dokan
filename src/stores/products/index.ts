import { createReduxStore } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { resolvers } from './resolvers';
import { actions } from './actions';
import { State } from '@dokan/definitions/dokan-product';

export const DOKAN_PRODUCT_STORE = 'dokan/products';

const store = createReduxStore< State, typeof actions, typeof selectors >(
    DOKAN_PRODUCT_STORE,
    {
        reducer,
        actions,
        selectors,
        resolvers,
    }
);

export default store;

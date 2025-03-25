import { createReduxStore } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { actions } from './actions';
import { resolvers } from './resolvers';
import { State } from '@dokan/definitions/dokan-product-categories';

export const storeName = 'dokan/product-categories';

const store = createReduxStore< State, typeof actions, typeof selectors >(
    storeName,
    {
        reducer,
        actions,
        selectors,
        resolvers,
    }
);

export default store;

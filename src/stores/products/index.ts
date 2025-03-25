import { createReduxStore } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { resolvers } from './resolvers';
import { actions } from './actions';
import { State } from '@dokan/definitions/dokan-product';

export const storeName = 'dokan/products';

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

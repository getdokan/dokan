import { createReduxStore } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { actions } from './actions';
import { resolvers } from './resolvers';

export const storeName = 'dokan/product-categories';

const store = createReduxStore( storeName, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

export * from './types';

export default store;

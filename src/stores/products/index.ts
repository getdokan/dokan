import { createReduxStore } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { resolvers } from './resolvers';
import { actions } from './actions';

export const storeName = 'dokan/products';
export * from './types';
const store = createReduxStore( storeName, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

export default store;

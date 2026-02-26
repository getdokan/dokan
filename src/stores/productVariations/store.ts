import { createReduxStore, register } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { resolvers } from './resolvers';
import { actions } from './actions';
import { ProductVariationState } from './types';

export const DOKAN_PRODUCT_VARIATIONS_STORE = 'dokan/product-variations';

const store = createReduxStore<
    ProductVariationState,
    typeof actions,
    typeof selectors
>( DOKAN_PRODUCT_VARIATIONS_STORE, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

register( store );

export default store;

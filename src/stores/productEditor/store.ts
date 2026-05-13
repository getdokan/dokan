import { createReduxStore, register } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { resolvers } from './resolvers';
import { actions } from './actions';
import { ProductEditorState } from './types';

export const DOKAN_PRODUCT_EDITOR_STORE = 'dokan/product-editor';

const store = createReduxStore<
    ProductEditorState,
    typeof actions,
    typeof selectors
>( DOKAN_PRODUCT_EDITOR_STORE, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

register( store );

export default store;

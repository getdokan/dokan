import { createReduxStore, register } from '@wordpress/data';
import { reducer } from './reducer';
import { selectors } from './selectors';
import { actions } from './actions';
import { ProductFormState } from './types';

export const DOKAN_PRODUCT_FORM_STORE = 'dokan/product-form';

const store = createReduxStore<
    ProductFormState,
    typeof actions,
    typeof selectors
>( DOKAN_PRODUCT_FORM_STORE, {
    reducer,
    actions,
    selectors,
} );

register( store );

export default store;

import { createReduxStore } from '@wordpress/data';
import reducer from './reducer';
import actions from './actions';
import selectors from './selectors';
import resolvers from './resolvers';
import { VendorsStoreState } from '../../definitions/dokan-vendors';

export const storeName = 'dokan/vendors';

const store = createReduxStore<
    VendorsStoreState,
    typeof actions,
    typeof selectors
>( storeName, {
    reducer,
    selectors,
    actions,
    resolvers,
} );

export default store;

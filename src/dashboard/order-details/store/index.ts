import { register, createReduxStore } from '@wordpress/data';

import reducer from './reducer';
import actions from './actions';
import resolvers from './resolvers';
import selectors from './selectors';

export const ORDER_DETAILS_STORE = 'dokan-order-details-store';

// Create Redux store
const orderStore = createReduxStore( ORDER_DETAILS_STORE, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

// Register the store with WordPress Data
register( orderStore );

export default orderStore;

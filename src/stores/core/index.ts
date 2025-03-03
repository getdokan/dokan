import { createReduxStore } from '@wordpress/data';
import reducer from './reducer';
import actions from './actions';
import selectors from './selectors';
import resolvers from './resolvers';
import { CoreState } from '@dokan/definitions/dokan-core';

export const storeName = 'dokan/core';

const store = createReduxStore< CoreState, typeof actions, typeof selectors >(
    storeName,
    {
        reducer,
        selectors,
        actions,
        resolvers,
    }
);

export default store;

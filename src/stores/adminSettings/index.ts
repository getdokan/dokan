import { createReduxStore } from '@wordpress/data';
import actions from './actions';
import reducer from './reducer';
import selectors from './selectors';
import resolvers from './resolvers';

const SETTINGS_STORE = 'dokan/admin/settings';

const settingsStore = createReduxStore( SETTINGS_STORE, {
    reducer,
    actions,
    selectors,
    resolvers,
} );

export { SETTINGS_STORE };

export default settingsStore;

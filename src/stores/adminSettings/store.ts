import { register } from '@wordpress/data';
import store from './index';

register( store );

export { SETTINGS_STORE } from './index';
export default store;

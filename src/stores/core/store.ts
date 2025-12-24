import { register } from '@wordpress/data';
import store from './index';

register( store );

export { DOKAN_CORE_STORE } from './index';
export default store;

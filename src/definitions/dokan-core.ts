import { User } from '@wordpress/core-data';

export type CoreState = {
    currentUser: User;
    store: {};
    global: {};
};

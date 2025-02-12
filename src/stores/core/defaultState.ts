import { CoreState } from '@dokan/definitions/dokan-core';

/**
 * Default state for the core store.
 */
const DEFAULT_STATE: CoreState = {
    currentUser: {
        id: 0,
        username: '',
        name: '',
        first_name: '',
        last_name: '',
        email: '',
        url: '',
        description: '',
        link: '',
        locale: '',
        nickname: '',
        slug: '',
        registered_date: '',
        roles: [],
        capabilities: undefined,
        extra_capabilities: undefined,
        avatar_urls: undefined,
        meta: undefined,
    },
    global: {},
    store: {},
};

export default DEFAULT_STATE;

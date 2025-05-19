import DEFAULT_STATE from './defaultState';

/**
 * Core store reducer.
 *
 * @param {CoreState} state          The current state.
 * @param             action         The action to perform.
 * @param             action.type    The action type.
 * @param             action.payload The action payload.
 */
const reducer = (
    state = DEFAULT_STATE,
    action: { type: string; payload?: any }
) => {
    switch ( action.type ) {
        case 'SET_CURRENT_USER':
            return {
                ...state,
                currentUser: action.payload,
            };

        case 'SET_STORE_SETTINGS':
            return {
                ...state,
                store: action.payload,
            };

        case 'SET_GLOBAL_SETTINGS':
            return {
                ...state,
                global: action.payload,
            };
    }

    return state;
};

export default reducer;

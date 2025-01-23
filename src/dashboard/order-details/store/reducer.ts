// define reducer function

export const initialState = {
    order: {},
    isLoading: false,
    error: '',
};

export default function reducer( state = initialState, action ) {
    switch ( action.type ) {
        case 'SET_ORDER_DETAILS':
            return {
                ...state,
                order: action.payload,
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
            };

        default:
            return state;
    }
}

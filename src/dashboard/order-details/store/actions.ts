export default {
    setOrderDetails( data ) {
        return {
            type: 'SET_ORDER_DETAILS',
            payload: data,
        };
    },
    setLoading( data ) {
        return {
            type: 'SET_LOADING',
            payload: data,
        };
    },
    setError( data ) {
        return {
            type: 'SET_ERROR',
            payload: data,
        };
    },
};

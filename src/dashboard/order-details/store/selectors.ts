export default {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    getOrderDetails( state, id ) {
        return state.order;
    },
    isLoading( state ) {
        return state.isLoading;
    },
    getError( state ) {
        return state.error;
    },
};

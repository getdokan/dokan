const defaultState = {
    vendors: [],
    loading: true,
    error: undefined,
    queryParams: {
        page: 1,
        per_page: 10,
        status: undefined,
        search: '',
        orderby: 'registered',
        order: 'desc',
    },
};

export default defaultState;

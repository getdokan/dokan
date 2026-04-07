import { actions } from './actions';

export const resolvers = {
    getVariations: ( productId: number, page = 1, perPage = 10 ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            await dispatch( actions.fetchVariations( productId, page, perPage ) );
        };
    },
};

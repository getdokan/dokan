import { actions } from './actions';

export const resolvers = {
    getVariations: ( productId: number ) => {
        return async ( { dispatch }: { dispatch: any } ) => {
            await dispatch( actions.fetchVariations( productId ) );
        };
    },
};

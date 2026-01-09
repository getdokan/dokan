import actions from './actions';

const resolvers = {
    getSettings() {
        return actions.fetchSettings();
    },
};
export default resolvers;

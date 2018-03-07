import Home from 'admin/components/Home.vue'
import Settings from 'admin/components/Settings.vue'

let Vue    = dokan_get_lib('Vue')
let Router = dokan_get_lib('Router')

Vue.use(Router)

dokan_add_route(Home)
dokan_add_route(Settings)

/**
 * Parse the route array and bind required components
 *
 * This changes the dokan.routes array and changes the components
 * so we can use dokan.routeComponents.{compontent} component.
 *
 * @param  {array} routes
 *
 * @return {void}
 */
function parseRouteComponent(routes) {

    for (var i = 0; i < routes.length; i++) {
        if ( typeof routes[i].children === 'object' ) {

            parseRouteComponent( routes[i].children );

            if ( typeof routes[i].component !== 'undefined' ) {
                routes[i].component = dokan.routeComponents[ routes[i].component ];
            }

        } else {
            routes[i].component = dokan.routeComponents[ routes[i].component ];
        }
    }
}

// mutate the localized array
parseRouteComponent(dokan.routes);

export default new Router({
    routes: dokan.routes
})

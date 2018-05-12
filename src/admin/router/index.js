import Dashboard from 'admin/pages/Dashboard.vue'
import Withdraw from 'admin/pages/Withdraw.vue'
import Premium from 'admin/pages/Premium.vue'
import Help from 'admin/pages/Help.vue'
import Settings from 'admin/pages/Settings.vue'

let Vue    = dokan_get_lib('Vue')
let Router = dokan_get_lib('Router')

Vue.use(Router)

dokan_add_route(Dashboard)
dokan_add_route(Withdraw)
dokan_add_route(Premium)
dokan_add_route(Help)
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

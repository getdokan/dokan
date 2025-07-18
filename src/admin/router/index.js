// import Dashboard from 'admin/pages/Dashboard.vue';
import Withdraw from 'admin/pages/Withdraw.vue';
import Premium from 'admin/pages/Premium.vue';
import Help from 'admin/pages/Help.vue';
import ChangeLog from 'admin/pages/ChangeLog.vue';
import Settings from 'admin/pages/Settings.vue';
import Vendors from 'admin/pages/Vendors.vue';
import VendorSingle from 'admin/pages/VendorSingle.vue';
import DummyData from 'admin/pages/DummyData.vue';
import VendorCapabilities from 'admin/pages/VendorCapabilities.vue';
import ReverseWithdrawal from 'admin/pages/ReverseWithdrawal.vue';
import ReverseWithdrawalTransactions from 'admin/pages/ReverseWithdrawalTransactions.vue';

const Vue = dokan_get_lib( 'Vue' );
const Router = dokan_get_lib( 'Router' );
const VersionCompare = dokan_get_lib( 'VersionCompare' );

Vue.use( Router );

// dokan_add_route( Dashboard );
dokan_add_route( Withdraw );
dokan_add_route( Premium );
dokan_add_route( ChangeLog );
dokan_add_route( Help );
dokan_add_route( Settings );
dokan_add_route( VendorCapabilities );
dokan_add_route( DummyData );
dokan_add_route( ReverseWithdrawal );
dokan_add_route( ReverseWithdrawalTransactions );
dokan_add_route( Vendors );
dokan_add_route( VendorSingle );

/**
 * Parse the route array and bind required components
 *
 * This changes the dokan.routes array and changes the components
 * so we can use dokan.routeComponents.{compontent} component.
 *
 * @param {Array} routes
 *
 * @return {void}
 */
function parseRouteComponent( routes ) {
    for ( let i = 0; i < routes.length; i++ ) {
        if ( typeof routes[ i ].children === 'object' ) {
            parseRouteComponent( routes[ i ].children );

            if ( typeof routes[ i ].component !== 'undefined' ) {
                routes[ i ].component =
                    dokan.routeComponents[ routes[ i ].component ];
            }
        } else {
            routes[ i ].component =
                dokan.routeComponents[ routes[ i ].component ];
        }
    }
}

// mutate the localized array
parseRouteComponent( dokan.routes );

export default new Router( {
    routes: dokan.routes,
} );

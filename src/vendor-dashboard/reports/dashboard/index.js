/**
 * External dependencies
 */
import { Component, Suspense, lazy } from "@wordpress/element";
import { Spinner } from "@woocommerce/components";
import { addFilter } from "@wordpress/hooks";
import VendorEarning from "./components/vendor-earning";

/**
 * Internal dependencies
 */
// import './style.scss';

const CustomizableDashboard = lazy(() =>
  import(/* webpackChunkName: "customizable-dashboard" */ "./customizable")
);

// Register the header items
addFilter(
    'woocommerce_admin_header_items',
    'dokan/dashboard/header-items',
    () => VendorEarning
);


class Dashboard extends Component {
  render() {
    const { path, query } = this.props;

    return (
      <Suspense fallback={ <Spinner /> } >
        <VendorEarning query={ query } />
        <CustomizableDashboard query={ query } path={ path } />
      </Suspense>
    );
  }
}

export default Dashboard;

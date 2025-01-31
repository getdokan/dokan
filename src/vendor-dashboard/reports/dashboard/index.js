/**
 * External dependencies
 */
import { Spinner } from "@woocommerce/components";
import { Component, Suspense, lazy } from "@wordpress/element";

/**
 * Internal dependencies
 */
import VendorEarning from "./components/vendor-earning";
// import './style.scss';

const CustomizableDashboard = lazy(() =>
  import(/* webpackChunkName: "customizable-dashboard" */ "./customizable")
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

/**
 * External dependencies
 */
import { Component } from "@wordpress/element";

/**
 * Internal dependencies
 */
import VendorEarning from './components/vendor-earning';
import CustomizableDashboard from './customizable';
// import './style.scss';

class Dashboard extends Component {
  render() {
    const { path, query } = this.props;

    return (
      <>
        <VendorEarning query={ query } />
        <CustomizableDashboard query={ query } path={ path } />
      </>
    );
  }
}

export default Dashboard;

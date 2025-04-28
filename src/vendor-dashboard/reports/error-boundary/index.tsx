/**
 * External dependencies
 */
import { Component, ReactNode, ErrorInfo } from "react";
import { __ } from "@wordpress/i18n";
import { Button } from "@wordpress/components";
/**
 * Internal dependencies
 */
// import "./style.scss";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
};

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    // TODO: Log error to error tracking service
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleOpenSupport = () => {
    window.open("https://wordpress.org/support/plugin/woocommerce/", "_blank");
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="woocommerce-global-error-boundary">
          <h1 className="woocommerce-global-error-boundary__heading">
            {__("Oops, something went wrong", 'dokan-lite')}
          </h1>
          <p className="woocommerce-global-error-boundary__subheading">
            {__(
              "We're sorry for the inconvenience. Please try reloading the page, or you can get support from the community forums.",
              'dokan-lite'
            )}
          </p>
          <div className="woocommerce-global-error-boundary__actions">
            <Button variant="secondary" onClick={this.handleOpenSupport}>
              {__("Get Support", 'dokan-lite')}
            </Button>
            <Button variant="primary" onClick={this.handleRefresh}>
              {__("Reload Page", 'dokan-lite')}
            </Button>
          </div>
          <details className="woocommerce-global-error-boundary__details">
            <summary>{__("Click for error details", 'dokan-lite')}</summary>
            <div className="woocommerce-global-error-boundary__details-content">
              <strong className="woocommerce-global-error-boundary__error">
                {this.state.error && this.state.error.toString()}
              </strong>
              <p>
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </p>
            </div>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

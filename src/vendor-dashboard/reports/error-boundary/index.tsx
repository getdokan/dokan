/**
 * External dependencies
 */
// eslint-disable-next-line import/no-extraneous-dependencies
import { Component, ReactNode, ErrorInfo } from 'react';
import InternalError from '../../../layout/500';
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
    constructor( props: ErrorBoundaryProps ) {
        super( props );
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(
        error: Error
    ): Partial< ErrorBoundaryState > {
        return { hasError: true, error };
    }

    componentDidCatch( _error: Error, errorInfo: ErrorInfo ) {
        this.setState( { errorInfo } );
        // TODO: Log error to error tracking service
    }

    handleRefresh = () => {
        window.location.reload();
    };

    render() {
        if ( this.state.hasError ) {
            return (
                <div className="woocommerce-global-error-boundary dokan-layout">
                    <InternalError onRefresh={ this.handleRefresh } />
                </div>
            );
        }

        return this.props.children;
    }
}

// components/ErrorMessage.tsx
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';

interface ErrorMessageProps {
    message: string;
    onRetry: () => void;
}

const ErrorMessage = ( { message, onRetry }: ErrorMessageProps ) => {
    return (
        <div className="p-8 text-center">
            <h2 className="text-xl text-red-600 mb-4">
                { __( 'Error', 'dokan-lite' ) }
            </h2>
            <p>{ message }</p>
            <Button
                onClick={ onRetry }
                className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                { __( 'Try Again', 'dokan-lite' ) }
            </Button>
        </div>
    );
};

export default ErrorMessage;

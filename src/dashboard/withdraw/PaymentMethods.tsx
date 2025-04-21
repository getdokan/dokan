import { Card, useToast } from '@getdokan/dokan-ui';
import { DokanButton } from '@dokan/components';
import { twMerge } from 'tailwind-merge';
import {
    UseWithdrawSettingsReturn,
    WithdrawMethod,
} from './Hooks/useWithdrawSettings';
import { __ } from '@wordpress/i18n';
import { useMakeDefaultMethod } from './Hooks/useMakeDefaultMethod';

const Loader = () => {
    return (
        <Card>
            <Card.Header>
                <div className="h-6 w-36 bg-gray-200 rounded animate-pulse"></div>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    { /* PayPal Method */ }
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                            <div>
                                <div className="h-4 w-16 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 w-36 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>

                    { /* Bank Transfer Method */ }
                    <div className="flex items-center justify-between border-t pt-4">
                        <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                            <div>
                                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2"></div>
                                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="h-10 w-20 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
};
function PaymentMethods( {
    bodyData,
    masterLoading,
}: {
    bodyData: UseWithdrawSettingsReturn;
    masterLoading: boolean;
} ) {
    const makeDefaultMethodHook = useMakeDefaultMethod();
    const toast = useToast();
    const actionButton = ( activemethod: WithdrawMethod ) => {
        if (
            activemethod.has_information &&
            activemethod?.value === bodyData?.data?.withdraw_method
        ) {
            return (
                <DokanButton disabled={ true } variant="secondary">
                    { __( 'Default', 'dokan-lite' ) }
                </DokanButton>
            );
        } else if (
            activemethod.has_information &&
            activemethod?.value !== bodyData?.data?.withdraw_method
        ) {
            return (
                <DokanButton
                    onClick={ () => {
                        makeDefaultMethodHook
                            .makeDefaultMethod( activemethod.value )
                            .then( () => {
                                toast( {
                                    type: 'success',
                                    title: __(
                                        'Default method updated',
                                        'dokan-lite'
                                    ),
                                } );
                                bodyData.refresh();
                            } );
                    } }
                    disabled={ makeDefaultMethodHook.isLoading }
                    loading={
                        makeDefaultMethodHook.isLoading &&
                        makeDefaultMethodHook.makingDefault ===
                            activemethod.value
                    }
                >
                    { __( 'Make Default', 'dokan-lite' ) }
                </DokanButton>
            );
        }
        return (
            <a href={ bodyData?.data?.setup_url } className="dokan-btn">
                { __( 'Setup', 'dokan-lite' ) }
            </a>
        );
    };
    if (
        ! bodyData ||
        ! bodyData.hasOwnProperty( 'isLoading' ) ||
        bodyData.isLoading ||
        masterLoading
    ) {
        return <Loader />;
    }

    return (
        <Card>
            <Card.Header>
                <Card.Title className="p-0 m-0">Payment Methods</Card.Title>
            </Card.Header>
            <Card.Body>
                <div className="space-y-4">
                    { /* Bank Transfer Method */ }
                    { bodyData?.data?.active_methods &&
                        Object.values( bodyData?.data?.active_methods ).map(
                            ( activeMethod, index ) => {
                                return (
                                    <div
                                        key={ activeMethod.value }
                                        className={ twMerge(
                                            'flex flex-col md:flex-row sm:items-center justify-between',
                                            index !== 0 ? 'border-t pt-4' : ''
                                        ) }
                                    >
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={ activeMethod?.icon ?? '' }
                                                alt="icon"
                                                className="w-8 h-8"
                                            />
                                            <div>
                                                <span className="font-medium">
                                                    { activeMethod?.label ??
                                                        '' }
                                                </span>
                                                <span className="text-gray-500 ml-2">
                                                    { activeMethod?.info ?? '' }
                                                </span>
                                            </div>
                                        </div>
                                        { actionButton( activeMethod ) }
                                    </div>
                                );
                            }
                        ) }
                </div>
            </Card.Body>
        </Card>
    );
}

export default PaymentMethods;

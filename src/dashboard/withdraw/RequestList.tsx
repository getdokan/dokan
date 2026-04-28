import { __ } from '@wordpress/i18n';
import { useMemo, useCallback } from '@wordpress/element';
import { useToast } from '@getdokan/dokan-ui';
import { DataViews } from '@dokan/components';
import { useWithdraw } from './Hooks/useWithdraw';
import { UseWithdrawRequestsReturn } from './Hooks/useWithdrawRequests';
import {
    baseFields,
    statusField,
    DEFAULT_LAYOUTS,
    type WithdrawRequest,
} from './withdraw-fields';

const pendingFields = [ ...baseFields, statusField ];

function RequestList( {
    withdrawRequests,
    loading = true,
}: {
    withdrawRequests: UseWithdrawRequestsReturn;
    loading: boolean;
} ) {
    const withdrawHook = useWithdraw();
    const toast = useToast();

    const actions = useMemo(
        () => [
            {
                id: 'withdraw-cancel',
                isEligible: () => true,
                label: () => __( 'Cancel', 'dokan-lite' ),
                isDestructive: true,
                confirmButtonLabel: __( 'Cancel Withdraw', 'dokan-lite' ),
                callback: ( [ item ]: WithdrawRequest[] ) => {
                    withdrawHook
                        .updateWithdraw( item.id, {
                            status: 'cancelled',
                        } )
                        .then( () => {
                            toast( {
                                type: 'success',
                                title: __(
                                    'Request cancelled successfully',
                                    'dokan-lite'
                                ),
                            } );
                            withdrawRequests.refresh();
                        } )
                        .catch( () => {
                            toast( {
                                type: 'error',
                                title: __(
                                    'Failed to cancel request',
                                    'dokan-lite'
                                ),
                            } );
                        } );
                },
            },
        ],
        [ withdrawHook.updateWithdraw, withdrawRequests.refresh ]
    );

    const onViewChange = useCallback(
        ( newView: typeof withdrawRequests.view ) => {
            withdrawRequests.setView( newView );
            withdrawRequests.fetchWithdrawRequests( {
                ...withdrawRequests.lastPayload,
                page: newView.page,
                status: 'pending',
                per_page: newView.perPage,
                user_id: withdrawRequests.lastPayload?.user_id ?? 0,
            } );
        },
        [
            withdrawRequests.setView,
            withdrawRequests.fetchWithdrawRequests,
            withdrawRequests.lastPayload,
        ]
    );

    return (
        <DataViews
            namespace="dokan-pending-requests-data-view"
            data={ withdrawRequests?.data ?? [] }
            defaultLayouts={ DEFAULT_LAYOUTS }
            fields={ pendingFields }
            getItemId={ ( item: WithdrawRequest ) => String( item.id ) }
            onChangeView={ onViewChange }
            search={ false }
            paginationInfo={ {
                totalItems: withdrawRequests?.totalItems,
                totalPages: withdrawRequests?.totalPages,
            } }
            view={ {
                ...withdrawRequests?.view,
                fields: pendingFields.map( ( field ) => field.id ),
            } }
            actions={ actions }
            isLoading={ loading }
        />
    );
}

export default RequestList;

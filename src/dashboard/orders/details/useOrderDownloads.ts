import { useCallback, useEffect, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import type { OrderDownloadPermission } from './types';

/**
 * Downloadable-product permissions over `dokan/v1/orders/<id>/downloads`.
 * @param orderId
 */
const useOrderDownloads = ( orderId: number ) => {
    const [ permissions, setPermissions ] = useState<
        OrderDownloadPermission[]
    >( [] );
    const [ isLoading, setIsLoading ] = useState( true );
    const [ error, setError ] = useState< string >( '' );

    const fetchPermissions = useCallback( () => {
        if ( ! orderId ) {
            return;
        }

        setIsLoading( true );
        setError( '' );

        apiFetch< OrderDownloadPermission[] >( {
            path: `/dokan/v1/orders/${ orderId }/downloads`,
        } )
            .then( ( loaded ) => {
                setPermissions( Array.isArray( loaded ) ? loaded : [] );
            } )
            .catch( ( fetchError: { message?: string } ) => {
                setError( fetchError?.message || '' );
            } )
            .finally( () => setIsLoading( false ) );
    }, [ orderId ] );

    useEffect( () => {
        fetchPermissions();
    }, [ fetchPermissions ] );

    const grantAccess = useCallback(
        ( productIds: number[] ) =>
            apiFetch< OrderDownloadPermission[] >( {
                path: `/dokan/v1/orders/${ orderId }/downloads`,
                method: 'POST',
                data: { product_ids: productIds },
            } ).then( ( created ) => {
                fetchPermissions();
                return created;
            } ),
        [ orderId, fetchPermissions ]
    );

    const revokeAccess = useCallback(
        ( permissionId: number ) =>
            apiFetch( {
                path: `/dokan/v1/orders/${ orderId }/downloads/${ permissionId }`,
                method: 'DELETE',
            } ).then( ( result ) => {
                setPermissions( ( previous ) =>
                    previous.filter(
                        ( permission ) =>
                            permission.permission_id !== permissionId
                    )
                );
                return result;
            } ),
        [ orderId ]
    );

    return {
        permissions,
        isLoading,
        error,
        grantAccess,
        revokeAccess,
        refetch: fetchPermissions,
    };
};

export default useOrderDownloads;

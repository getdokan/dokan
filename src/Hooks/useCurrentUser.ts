import { useState, useCallback, useEffect } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';

interface Links {
    self: { href: string; targetHints: { allow: string[] } }[];
    collection: { href: string }[];
}

interface CurrentUserResponse {
    id: number;
    name: string;
    url: string;
    description: string;
    link: string;
    slug: string;
    avatar_urls: Record< any, any >;
    meta: any[];
    is_super_admin: boolean;
    woocommerce_meta: Record< string, any >;
    _links: Links;
}

export interface UseCurrentUserReturn {
    data: CurrentUserResponse | null;
    isLoading: boolean;
    error: Error | null;
    fetchCurrentUser: () => Promise< CurrentUserResponse | void >;
}

export const useCurrentUser = (
    defaultLoader: boolean = false
): UseCurrentUserReturn => {
    const [ data, setData ] = useState< CurrentUserResponse | null >( null );
    const [ isLoading, setIsLoading ] = useState< boolean >( defaultLoader );
    const [ error, setError ] = useState< Error | null >( null );

    const fetchCurrentUser =
        useCallback( async (): Promise< CurrentUserResponse | void > => {
            try {
                setIsLoading( true );
                setError( null );

                const response = await apiFetch< CurrentUserResponse >( {
                    path: '/wp/v2/users/me',
                    method: 'GET',
                } );

                setData( response );
                return response;
            } catch ( err ) {
                setError(
                    err instanceof Error
                        ? err
                        : new Error( 'Failed to fetch current user' )
                );
                console.error( 'Error fetching current user:', err );
            } finally {
                setIsLoading( false );
            }
        }, [] );

    // useEffect( () => {
    //     fetchCurrentUser();
    // }, [ fetchCurrentUser ] );

    return { data, isLoading, error, fetchCurrentUser };
};

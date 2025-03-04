import { useSelect } from '@wordpress/data';

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
    hasFinished: boolean;
    error: Error | null;
}

export const useCurrentUser = (
    enabled: boolean = true
): UseCurrentUserReturn => {
    // @ts-ignore
    return useSelect(
        ( select ) => {
            if ( ! enabled ) {
                return {
                    data: null,
                    isLoading: false,
                    hasFinished: false,
                    error: null,
                };
            }

            const store = select( 'core' );

            return {
                // @ts-ignore
                data: store.getCurrentUser() as CurrentUserResponse,
                // @ts-ignore
                isLoading: store.isResolving( 'getCurrentUser', [] ),
                // @ts-ignore
                hasFinished: store.hasFinishedResolution(
                    'getCurrentUser',
                    []
                ),
            };
        },
        [ enabled ]
    );
};

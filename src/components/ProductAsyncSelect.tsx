import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import { addQueryArgs } from '@wordpress/url';
import DokanAsyncSelect from './DokanAsyncSelect';

export interface ProductOption {
    value: number;
    label: string;
    raw?: any;
}

export interface ProductAsyncSelectProps extends Record< string, any > {
    // New upward data/state callbacks for controlled-by-consumer data with internal loading
    onOptionsChange?: ( options: ProductOption[] ) => void;
    onAppendOptions?: ( more: ProductOption[] ) => void;
    onLoadingChange?: ( loading: boolean ) => void;
    onHasMoreChange?: ( hasMore: boolean ) => void;
    // Controlled mode props (consumer-managed state)
    options?: ProductOption[];
    isLoading?: boolean;
    hasMore?: boolean;
    onSearch?: ( term: string ) => Promise< ProductOption[] > | void; // should reset and load page 1
    onLoadMore?: () => Promise< ProductOption[] > | void; // should append next page
    onOpen?: () => Promise< ProductOption[] > | void; // called on first menu open

    // Backward-compatible internal fetching props (uncontrolled mode)
    endpoint?: string; // REST path
    perPage?: number;
    mapOption?: ( product: any ) => ProductOption;
    extraQuery?: Record< string, any >;
    buildQuery?: ( term: string, page: number ) => Record< string, any >;
    loadOptions?: ( inputValue: string ) => Promise< ProductOption[] >; // allow override
    disableInfiniteScroll?: boolean; // opt-out
}

const defaultMap = ( product: any ): ProductOption => ( {
    value: product.id,
    label: product.name || `Product #${ product?.id }`,
    raw: product,
} );

function ProductAsyncSelect( props: ProductAsyncSelectProps ) {
    const {
        // controlled mode inputs
        options: controlledOptions,
        isLoading: controlledLoading,
        hasMore: controlledHasMore,
        onSearch,
        onLoadMore,
        onOpen,
        // upward callbacks
        onOptionsChange,
        onAppendOptions,
        onLoadingChange,
        onHasMoreChange,
        // uncontrolled mode inputs
        endpoint = '/wc/v3/products',
        perPage = 20,
        mapOption = defaultMap,
        extraQuery = {},
        buildQuery,
        loadOptions: userLoadOptions,
        disableInfiniteScroll = false,
        ...rest
    } = props;

    // If consumer passes options (controlled mode), we will not use internal state
    const isControlled = Array.isArray( controlledOptions );

    const [ options, setOptions ] = useState< ProductOption[] >( [] );
    const [ page, setPage ] = useState( 1 );
    const [ hasMore, setHasMore ] = useState( true );
    const [ loading, setLoading ] = useState( false );
    const termRef = useRef( '' );
    const openedOnceRef = useRef( false );

    const fetchPage = useCallback(
        async (
            searchTerm: string,
            pageNo: number
        ): Promise< ProductOption[] > => {
            try {
                const query = buildQuery
                    ? buildQuery( searchTerm, pageNo )
                    : {
                          search: searchTerm || '',
                          per_page: perPage,
                          page: pageNo,
                          ...extraQuery,
                      };

                const data = await apiFetch< any[] >( {
                    path: addQueryArgs( endpoint, query ),
                } );

                const list = Array.isArray( data ) ? data : [];
                const mapped = list.map( ( product: any ) =>
                    mapOption( product )
                );
                setHasMore( mapped.length >= perPage );
                return mapped;
            } catch ( e ) {
                setHasMore( false );
                return [];
            }
        },
        [ buildQuery, perPage, extraQuery, endpoint, mapOption ]
    );

    const loadOptions = useCallback(
        async ( inputValue: string ): Promise< ProductOption[] > => {
            termRef.current = inputValue || '';
            // Reset page and hasMore tracking
            setPage( 1 );
            setHasMore( true );

            // Notify loading start
            setLoading( true );
            onLoadingChange && onLoadingChange( true );

            let first: ProductOption[] = [];

            if ( isControlled ) {
                // Perform internal fetch but push results upward to consumer state
                first = await fetchPage( termRef.current, 1 );
                onHasMoreChange && onHasMoreChange( first.length >= perPage );
                onOptionsChange && onOptionsChange( first );

                // Back-compat: also support consumer-provided onSearch if they want to react
                if ( onSearch ) {
                    try {
                        await onSearch( termRef.current );
                    } catch ( _e ) {}
                }
            } else {
                first = await fetchPage( termRef.current, 1 );
                setOptions( first );
            }

            // Notify loading end
            setLoading( false );
            onLoadingChange && onLoadingChange( false );
            return first;
        },
        [ fetchPage, isControlled, onSearch, onOptionsChange, onLoadingChange, onHasMoreChange, perPage ]
    );

    const handleMenuScrollToBottom = useCallback( async () => {
        if ( isControlled ) {
            if ( disableInfiniteScroll ) {
                return;
            }
            if ( controlledLoading ) {
                return;
            }
            if ( controlledHasMore === false ) {
                return;
            }
            // Start loading
            setLoading( true );
            onLoadingChange && onLoadingChange( true );
            const nextPage = page + 1;
            const more = await fetchPage( termRef.current, nextPage );
            onAppendOptions && onAppendOptions( more );
            onHasMoreChange && onHasMoreChange( more.length >= perPage );
            setPage( nextPage );
            // Back-compat
            if ( onLoadMore ) {
                try {
                    await onLoadMore();
                } catch ( _e ) {}
            }
            setLoading( false );
            onLoadingChange && onLoadingChange( false );
            return;
        }
        if ( disableInfiniteScroll || loading || ! hasMore ) {
            return;
        }
        const nextPage = page + 1;
        setLoading( true );
        const more = await fetchPage( termRef.current, nextPage );
        setOptions( ( prev ) => [ ...prev, ...more ] );
        setPage( nextPage );
        setLoading( false );
    }, [
        isControlled,
        disableInfiniteScroll,
        controlledLoading,
        controlledHasMore,
        onLoadMore,
        loading,
        hasMore,
        page,
        fetchPage,
    ] );

    const defaultOptions = useMemo(
        () => ( isControlled ? controlledOptions || [] : options ),
        [ isControlled, controlledOptions, options ]
    );

    const handleMenuOpen = useCallback( async () => {
        if ( isControlled ) {
            if ( openedOnceRef.current ) {
                return;
            }
            openedOnceRef.current = true;
            // Kick off initial load to populate consumer options when menu opens
            await loadOptions( termRef.current );
            // Back-compat for onOpen hook
            if ( onOpen ) {
                try {
                    await onOpen();
                } catch ( _e ) {}
            }
        }
    }, [ isControlled, onOpen, loadOptions ] );

    return (
        <DokanAsyncSelect
            defaultOptions={ defaultOptions }
            loadOptions={ userLoadOptions || loadOptions }
            onMenuScrollToBottom={ handleMenuScrollToBottom }
            onMenuOpen={ handleMenuOpen }
            isLoading={
                isControlled
                    ? rest.isLoading || controlledLoading
                    : rest.isLoading || loading
            }
            { ...rest }
        />
    );
}

export default ProductAsyncSelect;

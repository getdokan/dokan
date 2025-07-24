import { useState, useEffect } from '@wordpress/element';
import { AdminNoticesData, AdminNotice } from '../types';
import {
    fetchAdminNotices,
    dismissAdminNotice,
    executeNoticeAction,
} from '../utils/api';

interface UseAdminNoticesOptions {
    endpoint?: string;
    scope?: string;
    interval?: number;
    autoSlide?: boolean;
}

export const useAdminNotices = ( {
    endpoint = 'admin',
    scope,
    interval = 5000,
    autoSlide = true,
}: UseAdminNoticesOptions = {} ) => {
    const [ notices, setNotices ] = useState< AdminNoticesData >( [] );
    const [ loading, setLoading ] = useState( true );
    const [ error, setError ] = useState< string | null >( null );
    const [ currentNotice, setCurrentNotice ] = useState( 1 );
    const [ isAutoSliding, setIsAutoSliding ] = useState( autoSlide );
    const [ actionLoading, setActionLoading ] = useState< {
        [ key: number ]: boolean;
    } >( {} );

    // Fetch notices function
    const fetchNotices = async () => {
        try {
            setLoading( true );
            setError( null );
            const response = await fetchAdminNotices( endpoint, scope );
            const filteredNotices = response.filter(
                ( notice ) => notice.description || notice.title
            );
            setNotices( filteredNotices );
        } catch ( err ) {
            setError(
                err instanceof Error ? err.message : 'Failed to fetch notices'
            );
        } finally {
            setLoading( false );
        }
    };

    // Auto-slide functionality
    useEffect( () => {
        if ( ! isAutoSliding || notices.length <= 1 ) {
            return;
        }

        const timer = setInterval( () => {
            setCurrentNotice( ( prev ) =>
                prev >= notices.length ? 1 : prev + 1
            );
        }, interval );

        return () => clearInterval( timer );
    }, [ isAutoSliding, notices.length, interval ] );

    // Navigation functions
    const nextNotice = () => {
        setCurrentNotice( ( prev ) =>
            prev >= notices.length ? 1 : prev + 1
        );
    };

    const prevNotice = () => {
        setCurrentNotice( ( prev ) =>
            prev <= 1 ? notices.length : prev - 1
        );
    };

    const pauseAutoSlide = () => setIsAutoSliding( false );
    const resumeAutoSlide = () => setIsAutoSliding( autoSlide );

    // Close notice
    const closeNotice = async ( notice: AdminNotice, index: number ) => {
        if ( notice.ajax_data ) {
            try {
                await dismissAdminNotice( notice.ajax_data );
                setNotices( ( prev ) =>
                    prev.filter( ( _, i ) => i !== index )
                );
                if ( currentNotice > notices.length - 1 ) {
                    setCurrentNotice( 1 );
                }
            } catch ( err ) {
                // eslint-disable-next-line no-console
                console.error( 'Failed to dismiss notice:', err );
            }
        }
    };

    // Execute action
    const executeAction = async ( action: any, noticeIndex: number ) => {
        if ( ! action.ajax_data ) {
            return;
        }

        setActionLoading( ( prev ) => ( { ...prev, [ noticeIndex ]: true } ) );

        try {
            await executeNoticeAction( action.ajax_data );

            if ( action.reload ) {
                window.location.reload();
            } else {
                setNotices( ( prev ) =>
                    prev.filter( ( _, i ) => i !== noticeIndex )
                );
                if ( currentNotice > notices.length - 1 ) {
                    setCurrentNotice( 1 );
                }
            }
        } catch ( err ) {
            // eslint-disable-next-line no-console
            console.error( 'Failed to execute action:', err );
        } finally {
            setActionLoading( ( prev ) => ( {
                ...prev,
                [ noticeIndex ]: false,
            } ) );
        }
    };

    // Initial fetch
    useEffect( () => {
        fetchNotices();
    }, [ endpoint, scope ] );

    return {
        notices,
        loading,
        error,
        currentNotice,
        nextNotice,
        prevNotice,
        pauseAutoSlide,
        resumeAutoSlide,
        closeNotice,
        executeAction,
        actionLoading,
        refetch: fetchNotices,
    };
};

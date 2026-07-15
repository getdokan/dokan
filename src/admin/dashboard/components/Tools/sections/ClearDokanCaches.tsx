import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import { useToast } from '@getdokan/dokan-ui';
import { ToolsSection } from '@dokan/components';

export default function ClearDokanCaches() {
    const toast = useToast();
    const [ loading, setLoading ] = useState( false );

    const handleClick = async () => {
        if ( loading ) {
            return;
        }
        setLoading( true );
        try {
            const res = await apiFetch( {
                path: '/dokan/v1/admin/tools/clear-caches',
                method: 'POST',
            } );
            toast( {
                type: 'success',
                title: __( 'Caches cleared', 'dokan-lite' ),
                subtitle:
                    res?.message ||
                    __( 'Dokan caches have been cleared.', 'dokan-lite' ),
            } );
        } catch ( e: any ) {
            toast( {
                type: 'error',
                title: __( 'Failed', 'dokan-lite' ),
                subtitle:
                    e?.message ||
                    __( 'Could not clear Dokan caches.', 'dokan-lite' ),
            } );
        } finally {
            setLoading( false );
        }
    };

    return (
        <ToolsSection
            type={ {
                id: 'clear_dokan_caches',
                name: __( 'Clear Dokan Caches', 'dokan-lite' ),
                desc: __(
                    'Flush all Dokan cached data (vendor stats, reports, product counts, etc.). Use this if cached values look stale — caches rebuild automatically on the next load.',
                    'dokan-lite'
                ),
                button: __( 'Clear Caches', 'dokan-lite' ),
            } }
            onClick={ handleClick }
            loading={ loading }
        />
    );
}

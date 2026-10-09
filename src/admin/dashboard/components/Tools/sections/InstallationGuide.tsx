import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState, useEffect } from '@wordpress/element';
import { useToast } from '@getdokan/dokan-ui';
import { ToolsSection } from '@dokan/components';

export default function InstallationGuide() {
    const toast = useToast();
    const [ loading, setLoading ] = useState( false );
    const [ disabled, setDisabled ] = useState( false );

    const handleClick = async () => {
        if ( loading ) {
            return;
        }
        setLoading( true );
        try {
            const res = await apiFetch( {
                path: '/dokan/v1/admin/tools/create-pages',
                method: 'POST',
            } );

            toast( {
                type: 'success',
                title: __( 'Success!', 'dokan-lite' ),
                subtitle:
                    res?.message ||
                    __(
                        'Required pages created or already exist.',
                        'dokan-lite'
                    ),
            } );
        } catch ( e: any ) {
            toast( {
                type: 'error',
                title: __( 'Failed', 'dokan-lite' ),
                subtitle:
                    e?.message || __( 'Could not create pages.', 'dokan-lite' ),
            } );
        } finally {
            setLoading( false );
        }
    };

    useEffect( () => {
        apiFetch( {
            path: '/dokan/v1/admin/tools/check-all-dokan-pages-exists',
            method: 'GET',
        } ).then( ( res ) => {
            if ( res?.all_pages_exists ) {
                setDisabled( true );
            }
        } );
    }, [] );

    return (
        <ToolsSection
            type={ {
                id: 'create_pages',
                name: __( 'Installation Guide', 'dokan-lite' ),
                desc: __(
                    'Clicking this button will create required pages for the plugin.',
                    'dokan-lite'
                ),
                button: __( 'Regenerate', 'dokan-lite' ),
            } }
            onClick={ handleClick }
            loading={ loading }
            disabled={ disabled }
        />
    );
}

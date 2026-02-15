import { applyFilters } from '@wordpress/hooks';
import AdminNotices from 'admin/dashboard/pages/dashboard/components/AdminNotices';
import { __ } from '@wordpress/i18n';

const AdminHeader = ( {
    title = __( 'Dashboard', 'dokan-lite' ),
    noticeScopes = applyFilters( 'dokan_admin_dashboard_notices_scopes', [
        { scope: 'global', endpoint: 'admin' },
        { scope: '', endpoint: 'admin' },
        { scope: 'promo', endpoint: 'promo' },
    ] ),
} ) => {
    return (
        <>
            <h1 className="wp-heading-inline">{ title }</h1>
            <hr className="wp-header-end" />

            { noticeScopes?.map( ( noticeConfig ) => (
                <AdminNotices
                    key={ `${ noticeConfig.endpoint }-${
                        noticeConfig.scope || 'local'
                    }` }
                    endpoint={ noticeConfig.endpoint }
                    scope={ noticeConfig.scope }
                />
            ) ) }
        </>
    );
};

export default AdminHeader;

import { applyFilters } from '@wordpress/hooks';
import AdminNotices from 'admin/dashboard/pages/dashboard/components/AdminNotices';
import { __ } from '@wordpress/i18n';

interface NoticeScope {
    scope: string;
    endpoint: string;
}

interface AdminHeaderProps {
    title?: string;
    noticeScopes?: NoticeScope[];
}

const defaultNoticeScopes: NoticeScope[] = [
    { scope: 'global', endpoint: 'admin' },
    { scope: '', endpoint: 'admin' },
    { scope: 'promo', endpoint: 'promo' },
];

const AdminHeader = ( {
    title = __( 'Dashboard', 'dokan-lite' ),
    noticeScopes,
}: AdminHeaderProps ) => {
    const resolvedScopes: NoticeScope[] =
        noticeScopes ??
        ( applyFilters(
            'dokan_admin_dashboard_notices_scopes',
            defaultNoticeScopes
        ) as NoticeScope[] );

    return (
        <>
            <h1 className="wp-heading-inline text-2xl leading-3 text-gray-900 font-bold mb-6">
                { title }
            </h1>
            <hr className="wp-header-end" />

            { resolvedScopes?.map( ( noticeConfig ) => (
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
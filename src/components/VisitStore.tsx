import { __ } from '@wordpress/i18n';
import { Tooltip } from '@getdokan/dokan-ui';
import { ExternalLink } from 'lucide-react';

type VisitStoreProps = {
    children: React.ReactNode;
    externalLink?: string;
    target?: string;
    size?: number;
};

const VisitStore = ( props: VisitStoreProps ) => {
    // @ts-ignore
    const filteredProps = wp.hooks.applyFilters(
        'dokan-vendor-dashboard-visit-store',
        props
    );

    const {
        children,
        // @ts-ignore
        externalLink = window.dokan?.urls?.storeUrl,
        target = '_blank',
        size = 24,
    } = filteredProps;

    return (
        <span className="flex gap-3">
            { children }
            <Tooltip content={ __( 'Visit Store', 'dokan-lite' ) }>
                <a
                    href={ externalLink }
                    target={ target }
                    className="font-normal self-center active-title text-xl"
                    rel="noreferrer"
                >
                    <ExternalLink
                        className="text-dokan-link stroke-[2.5]"
                        size={ size }
                    />
                </a>
            </Tooltip>
        </span>
    );
};

export default VisitStore;

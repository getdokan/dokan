import { __ } from '@wordpress/i18n';
import { Button } from '@wedevs/plugin-ui';
import { ExternalLink } from 'lucide-react';
import { ExtensionIcon } from './RecommendedAddons';
import { twMerge } from 'tailwind-merge';
import { DokanLink } from '@src/components';
import { sortByPosition } from 'admin/dashboard/pages/dashboard/utils/sorting';

export type MobileApp = {
    slug: string;
    title: string;
    audience: string;
    description: string;
    image: string;
    url: string;
};

const MobileApps = ( { apps }: { apps: MobileApp[] } ) => {
    const filteredApps = apps ? sortByPosition( { ...apps } ) : [];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3.5 mb-10">
            { filteredApps.map( ( [ _, app ] ) => (
                <div
                    key={ app.slug }
                    className="flex flex-col bg-white rounded-md shadow relative"
                >
                    { /* Header: icon + name + badge */ }
                    <div className="flex items-start justify-between px-5 pt-5 pb-3">
                        <ExtensionIcon
                            src={ app.image }
                            alt={ app.title }
                            className="rounded-lg object-contain"
                        />
                        <span
                            className={ twMerge(
                                'flex items-center gap-1.5 text-xs font-medium px-2 py-1.5 rounded-md leading-none',
                                app.slug === 'dokan-vendor-app' &&
                                    'text-[#008236] bg-[#DCFCE7]',
                                app.slug === 'dokan-customer-app' &&
                                    'text-[#165DFC] bg-[#F0F6FF]',
                                app.slug === 'delivery-driver-app' &&
                                    'text-[#9F2D00] bg-[#FEF9C2]'
                            ) }
                        >
                            <span
                                className={ twMerge(
                                    'w-1.5 h-1.5 rounded-full',
                                    app.slug === 'dokan-vendor-app' &&
                                        'bg-[#02C951]',
                                    app.slug === 'dokan-customer-app' &&
                                        'bg-[#2B7FFF]',
                                    app.slug === 'delivery-driver-app' &&
                                        'bg-[#FD9A00]'
                                ) }
                            ></span>
                            { app.audience }
                        </span>
                    </div>

                    { /* Content */ }
                    <div className="flex flex-col flex-1 px-5 pb-5 pt-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                            { app.title }
                        </h3>
                        <p className="text-sm text-[#25252D] leading-relaxed mb-9 flex-1">
                            { app.description }
                        </p>
                        <DokanLink
                            as="a"
                            href={ app.url }
                            target="_blank"
                            className="w-fit"
                        >
                            <Button variant="default" className="gap-2.5 px-5">
                                { __( 'Get App', 'dokan-lite' ) }
                                <ExternalLink size={ 16 } />
                            </Button>
                        </DokanLink>
                    </div>
                </div>
            ) ) }
        </div>
    );
};

export default MobileApps;

import { __ } from '@wordpress/i18n';
import { DokanButton } from '@dokan/components';
import { ExtensionIcon } from './RecommendedAddons';

export type MobileApp = {
    slug: string;
    title: string;
    audience: string;
    tagline: string;
    description: string;
    image: string;
    url: string;
};

const MobileApps = ( { apps }: { apps: MobileApp[] } ) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
            { apps.map( ( app ) => (
                <div
                    key={ app.slug }
                    className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md"
                >
                    { /* Header: icon + name + badge */ }
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                        <ExtensionIcon
                            src={ app.image }
                            alt={ app.title }
                            className="w-[53px] h-[53px] rounded-lg object-contain"
                        />
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#7047EB] bg-[#F0EBFF] px-2 py-0.5 rounded-full border border-[#E0D5FF]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7047EB]"></span>
                            { app.audience }
                        </span>
                    </div>

                    { /* Content */ }
                    <div className="flex flex-col flex-1 px-5 pb-5">
                        <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                            { app.title }
                        </h3>
                        <p className="text-[13px] font-medium text-gray-800 mb-1">
                            { app.tagline }
                        </p>
                        <p className="text-[13px] text-gray-500 leading-relaxed mb-5 flex-1">
                            { app.description }
                        </p>
                        <a
                            href={ app.url }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block no-underline mt-auto"
                        >
                            <DokanButton variant="secondary" className="w-full">
                                { __( 'Get App', 'dokan-lite' ) }
                            </DokanButton>
                        </a>
                    </div>
                </div>
            ) ) }
        </div>
    );
};

export default MobileApps;

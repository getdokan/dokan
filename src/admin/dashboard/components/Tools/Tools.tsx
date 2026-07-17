import { __ } from '@wordpress/i18n';
import { Card, DokanToaster } from '@getdokan/dokan-ui';
import { ToolsSection } from '@dokan/components';
import { applyFilters } from '@wordpress/hooks';
import HeaderImage from './HeaderImage';
import InstallationGuide from './sections/InstallationGuide';
import ClearDokanCaches from './sections/ClearDokanCaches';
import { ToolsProps } from './types';

type SectionItem = { id: string; component: React.ComponentType };

export default function Tools( props: ToolsProps ) {
    // Free sections shipped by Dokan Lite. Dokan Pro injects its own sections via
    // the `dokan_admin_dashboard_tools_sections` filter — splicing them in before
    // "Clear Dokan Caches" so the free button always stays at the tail.
    const baseSections: Array< SectionItem > = [
        { id: 'create_pages', component: InstallationGuide },
        { id: 'clear_dokan_caches', component: ClearDokanCaches },
    ];

    // Allow Dokan Pro / 3rd-parties to add sections.
    const sections: Array< SectionItem > = applyFilters(
        'dokan_admin_dashboard_tools_sections',
        baseSections,
        ToolsSection,
        props
    ) as Array< SectionItem >;

    return (
        <div className="w-full md:w-[658px] m-auto">
            <h2 className="font-[700] text-[24px] text-[#25252D] mb-[24px]">
                { __( 'Tools', 'dokan-lite' ) }
            </h2>
            <Card className="bg-white rounded-[6px] border border-[#E9E9E9]">
                <div className="p-[24px] flex items-start justify-between border-b border-[#E9E9E9]">
                    <div className="w-1/2">
                        <h2 className="font-[700] text-[18px] text-[#25252D] mb-[10px]">
                            { __( 'Essential Marketplace Tools', 'dokan-lite' ) }
                        </h2>
                        <p className="font-[400] text-[14px] text-[#828282]">
                            { __(
                                'Customize your platform by selecting the necessary tools to enhance functionality and operational efficiency.',
                                'dokan-lite'
                            ) }
                        </p>
                    </div>
                    <div>
                        <HeaderImage />
                    </div>
                </div>

                { sections.map( ( section ) => {
                    const Component = section.component;
                    return (
                        <div
                            className="border-b border-[#E9E9E9]"
                            key={ section.id }
                        >
                            <Component key={ section.id } { ...props } />
                        </div>
                    );
                } ) }
            </Card>

            <DokanToaster />
        </div>
    );
}

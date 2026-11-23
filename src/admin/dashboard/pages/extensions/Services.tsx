import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ExternalLink, Check, Calendar } from 'lucide-react';
import { DokanLink } from '@dokan/components';
import { ExtensionIcon } from './RecommendedAddons';
import getSettings from '../../settings/getSettings';
import { Button } from '@wedevs/plugin-ui';
import { DokanModal } from '@src/components';
import { applyFilters } from '@wordpress/hooks';
import { decodeEntities } from '@wordpress/html-entities';

const Services = () => {
    const extensionsSettings = getSettings( 'extensions' ) || {};
    const welabsData = extensionsSettings?.extensions?.welabs || {};
    const [ isModalOpen, setIsModalOpen ] = useState( false );

    const benefits = applyFilters( 'dokan_extensions_services_benefits', [
        __(
            'Discover payment gateway integrations that enhance your transaction experience.',
            'dokan-lite'
        ),
        __(
            'Try our easy store locator to find nearby locations effortlessly.',
            'dokan-lite'
        ),
        __(
            'We provide custom solutions for any complex feature to elevate your project.',
            'dokan-lite'
        ),
        __(
            'Enjoy seamless POS integration that boosts your sales process.',
            'dokan-lite'
        ),
        __(
            "Design a checkout experience that reflects your brand's identity.",
            'dokan-lite'
        ),
    ] );

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3.5">
            <div className="flex flex-col bg-white rounded-md shadow">
                <div className="px-5 pt-5 pb-3">
                    <ExtensionIcon
                        src={ welabsData?.image }
                        alt={ welabsData?.title }
                    />
                </div>

                <div className="flex flex-col flex-1 px-5 pb-5 pt-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        { welabsData?.title }
                    </h3>
                    <p className="text-sm text-[#25252D] leading-relaxed mb-9 flex-1">
                        { welabsData?.description }
                    </p>

                    <div className="flex items-center justify-between gap-4 mt-auto">
                        <DokanLink
                            as="a"
                            target="_blank"
                            href={ welabsData?.url }
                        >
                            <Button variant="default" className="px-5 gap-2.5">
                                { __( 'Visit weLabs', 'dokan-lite' ) }
                                <ExternalLink size={ 16 } />
                            </Button>
                        </DokanLink>
                        <DokanLink
                            as="div"
                            onClick={ () => setIsModalOpen( true ) }
                            className="cursor-pointer dokan-link underline text-sm font-medium"
                        >
                            { __( 'View Details', 'dokan-lite' ) }
                        </DokanLink>
                    </div>
                </div>
            </div>

            <DokanModal
                isOpen={ isModalOpen }
                onClose={ () => setIsModalOpen( false ) }
                onConfirm={ () => setIsModalOpen( false ) }
                namespace="dokan-extenstion-services-modal"
                dialogTitle={ __(
                    'Custom Development for your Marketplace',
                    'dokan-lite'
                ) }
                dialogFooter={ false }
                dialogContent={
                    <>
                        <div className="space-y-3 mb-8">
                            { benefits?.map(
                                ( benefit: string, index: number ) => (
                                    <div
                                        key={ index }
                                        className="flex items-start gap-2.5"
                                    >
                                        <Check
                                            size={ 18 }
                                            className="text-[#00A63E] mt-0.5"
                                        />
                                        <p className="text-sm text-[#575757] m-0">
                                            { decodeEntities( benefit ) }
                                        </p>
                                    </div>
                                )
                            ) }
                        </div>

                        <div className="mb-8">
                            <p className="text-sm font-medium text-gray-900 mb-3">
                                { __(
                                    "Let's talk to our customer success manager.",
                                    'dokan-lite'
                                ) }
                            </p>
                            <div className="flex items-center">
                                <div className="flex -space-x-2 mr-3">
                                    <img
                                        src={ `${
                                            ( window as any )
                                                .dokanAdminDashboard.urls
                                                .assetsUrl
                                        }/images/extensions/services/teams.svg` }
                                        alt={ __(
                                            'Team Members Image',
                                            'dokan-lite'
                                        ) }
                                    />
                                </div>
                            </div>
                        </div>

                        <DokanLink
                            as="a"
                            target="_blank"
                            href="https://calendly.com/welabstech/30min"
                        >
                            <Button
                                variant="default"
                                className="gap-2.5 px-5 bg-[#7047EB] hover:bg-[#5B39C9] text-white"
                            >
                                <Calendar size={ 16 } strokeWidth={ 3 } />
                                { __( 'Book a meeting', 'dokan-lite' ) }
                            </Button>
                        </DokanLink>
                    </>
                }
            />
        </div>
    );
};

export default Services;

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ExternalLink, CircleCheck, Calendar } from 'lucide-react';
import { DokanButton, DokanLink } from '@dokan/components';
import { ExtensionIcon } from './RecommendedAddons';
import getSettings from '../../settings/getSettings';
import { Button } from '@wedevs/plugin-ui';
import { DokanModal } from '@src/components';

const Services = () => {
    const extensionsSettings = getSettings( 'extensions' ) || {};
    const welabsData = extensionsSettings?.extensions?.welabs || {};
    const [ isModalOpen, setIsModalOpen ] = useState( false );

    const teamImages = [
        'https://avatars.githubusercontent.com/u/1384976?v=4',
        'https://avatars.githubusercontent.com/u/55513?v=4',
        'https://avatars.githubusercontent.com/u/1000000?v=4',
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-3.5">
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
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

                    <div className="flex items-center gap-4 mt-auto">
                        <a
                            target="_blank"
                            href={ welabsData?.url }
                            rel="noopener noreferrer"
                            className="no-underline flex-1"
                        >
                            <DokanButton variant="primary">
                                { __( 'Visit weLabs', 'dokan-lite' ) }
                                <ExternalLink size={ 14 } />
                            </DokanButton>
                        </a>
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
                dialogContent={
                    <div className="p-10">
                        <div className="space-y-4 mb-8">
                            { welabsData?.benefits?.map(
                                ( benefit: string, index: number ) => (
                                    <div
                                        key={ index }
                                        className="flex items-start gap-3"
                                    >
                                        <CircleCheck
                                            size={ 18 }
                                            className="text-[#039855] mt-0.5 shrink-0"
                                        />
                                        <p className="text-[15px] text-gray-600 m-0">
                                            { benefit }
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
                                    { teamImages.map( ( img, i ) => (
                                        <img
                                            key={ i }
                                            src={ img }
                                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                            alt="Team member"
                                        />
                                    ) ) }
                                    <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                        +3
                                    </div>
                                </div>
                            </div>
                        </div>

                        <a
                            href="https://example.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline inline-block"
                        >
                            <Button className="bg-[#7047EB] hover:bg-[#5B39C9] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 border-none">
                                <Calendar size={ 18 } />
                                { __( 'Book a meeting', 'dokan-lite' ) }
                            </Button>
                        </a>
                    </div>
                }
            />
        </div>
    );
};

export default Services;

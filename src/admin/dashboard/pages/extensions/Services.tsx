import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';
import { ExternalLink, CircleCheck, Calendar } from 'lucide-react';
import { DokanButton } from '@dokan/components';
import { ExtensionIcon } from './RecommendedAddons';
import getSettings from '../../settings/getSettings';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalTitle,
} from '@wedevs/plugin-ui';

const Services = () => {
    const extensionsSettings = getSettings( 'extensions' ) || {};
    const welabsImage = extensionsSettings?.extensions?.welabs_image || '';
    const [ isModalOpen, setIsModalOpen ] = useState( false );

    const tags = [
        __( 'WordPress', 'dokan-lite' ),
        __( 'WooCommerce', 'dokan-lite' ),
        __( 'Marketplace', 'dokan-lite' ),
        __( 'Custom Development', 'dokan-lite' ),
    ];

    const benefits = [
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
    ];

    const teamImages = [
        'https://avatars.githubusercontent.com/u/1384976?v=4',
        'https://avatars.githubusercontent.com/u/55513?v=4',
        'https://avatars.githubusercontent.com/u/1000000?v=4',
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
            <div className="flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-shadow hover:shadow-md">
                <div className="px-5 pt-5 pb-3">
                    <ExtensionIcon
                        src={ welabsImage }
                        alt="weLabs"
                        className="w-[120px] h-auto object-contain"
                    />
                </div>

                <div className="flex flex-col flex-1 px-5 pb-5">
                    <h3 className="text-[15px] font-semibold text-gray-900 mb-1">
                        { __( 'weLabs', 'dokan-lite' ) }
                    </h3>
                    <p className="text-[13px] text-gray-500 leading-relaxed mb-3">
                        { __(
                            'weLabs is a sister concern of weDevs, specializing in customizing Dokan-related integrations and development. From bespoke feature development to complex integration work, weLabs helps you extend Dokan exactly the way your business needs.',
                            'dokan-lite'
                        ) }
                    </p>

                    <div className="flex flex-wrap gap-1.5 mb-5 flex-1">
                        { tags.map( ( tag ) => (
                            <span
                                key={ tag }
                                className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full"
                            >
                                { tag }
                            </span>
                        ) ) }
                    </div>

                    <div className="flex items-center gap-4 mt-auto">
                        <a
                            href="https://welabs.dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline flex-1"
                        >
                            <DokanButton variant="primary" className="w-full">
                                { __( 'Visit weLabs', 'dokan-lite' ) }
                                <ExternalLink size={ 14 } />
                            </DokanButton>
                        </a>
                        <button
                            onClick={ () => setIsModalOpen( true ) }
                            className="text-sm font-medium text-[#7047EB] hover:text-[#5B39C9] bg-transparent border-none p-0 cursor-pointer underline decoration-[#7047EB]/30 underline-offset-4"
                        >
                            { __( 'View Details', 'dokan-lite' ) }
                        </button>
                    </div>
                </div>
            </div>

            <Modal open={ isModalOpen } onOpenChange={ setIsModalOpen }>
                <ModalContent className="sm:max-w-[600px] p-0 overflow-hidden border-none rounded-2xl">
                    <div className="p-10">
                        <ModalHeader className="p-0 mb-6">
                            <ModalTitle className="text-2xl font-bold text-gray-900">
                                { __(
                                    'Custom Development for your Marketplace',
                                    'dokan-lite'
                                ) }
                            </ModalTitle>
                        </ModalHeader>

                        <div className="space-y-4 mb-8">
                            { benefits.map( ( benefit, index ) => (
                                <div
                                    key={ index }
                                    className="flex items-start gap-3"
                                >
                                    <CircleCheck
                                        size={ 18 }
                                        className="text-[#039855] mt-0.5 flex-shrink-0"
                                    />
                                    <p className="text-[15px] text-gray-600 m-0">
                                        { benefit }
                                    </p>
                                </div>
                            ) ) }
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
                            href="https://welabs.dev/start-a-project/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="no-underline inline-block"
                        >
                            <DokanButton className="bg-[#7047EB] hover:bg-[#5B39C9] text-white px-6 py-2.5 rounded-lg flex items-center gap-2 border-none">
                                <Calendar size={ 18 } />
                                { __( 'Book a meeting', 'dokan-lite' ) }
                            </DokanButton>
                        </a>
                    </div>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default Services;

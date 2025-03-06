import React, { useEffect, useState } from 'react';
import Logo from '../Logo';
import RadioCard from '../RadioCard';
import { __ } from '@wordpress/i18n';
import { Button } from '@getdokan/dokan-ui';

interface MarketplaceGoalScreenProps {
    onNext: () => void;
    onBack: () => void;
    marketplaceType: string;
    deliveryMethod: string;
    priority: string;
    onUpdate: (
        focus: string,
        deliveryHandling: string,
        priority: string
    ) => void;
}

const MarketplaceGoalScreen = ( {
    onNext,
    onBack,
    marketplaceType = 'physical',
    deliveryMethod = 'vendor',
    priority = 'sales',
    onUpdate,
}: MarketplaceGoalScreenProps ) => {
    const [ localMarketplaceType, setLocalMarketplaceType ] =
        useState( marketplaceType );
    const [ localDeliveryMethod, setLocalDeliveryMethod ] =
        useState( deliveryMethod );
    const [ localPriority, setLocalPriority ] = useState( priority );

    // Update parent component when values change
    useEffect( () => {
        // Convert delivery method string to boolean for API
        onUpdate( localMarketplaceType, localDeliveryMethod, localPriority );
    }, [ localMarketplaceType, localDeliveryMethod, localPriority ] );

    const handleNext = () => {
        // Ensure values are updated before proceeding
        onUpdate( localMarketplaceType, localDeliveryMethod, localPriority );
        onNext();
    };

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 md:p-10 max-w-4xl">
                <div className="mb-8">
                    <Logo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-10">
                    { __( 'Marketplace Goal', 'dokan' ) }
                </h1>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-lg font-medium mb-4">
                            { __(
                                "What's the primary focus of your marketplace?",
                                'dokan'
                            ) }
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <RadioCard
                                label="Digital Products"
                                checked={ localMarketplaceType === 'digital' }
                                onChange={ () =>
                                    setLocalMarketplaceType( 'digital' )
                                }
                            />
                            <RadioCard
                                label="Physical Products"
                                checked={ localMarketplaceType === 'physical' }
                                onChange={ () =>
                                    setLocalMarketplaceType( 'physical' )
                                }
                            />
                            <RadioCard
                                label="Services"
                                checked={ localMarketplaceType === 'services' }
                                onChange={ () =>
                                    setLocalMarketplaceType( 'services' )
                                }
                            />
                            <RadioCard
                                label="Subscriptions"
                                checked={
                                    localMarketplaceType === 'subscriptions'
                                }
                                onChange={ () =>
                                    setLocalMarketplaceType( 'subscriptions' )
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium mb-4">
                            { __(
                                'How do you plan to handle deliveries?',
                                'dokan'
                            ) }
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <RadioCard
                                label="Marketplace Handles Delivery"
                                checked={
                                    localDeliveryMethod === 'marketplace'
                                }
                                onChange={ () =>
                                    setLocalDeliveryMethod( 'marketplace' )
                                }
                            />
                            <RadioCard
                                label="Vendors manage their deliveries"
                                checked={ localDeliveryMethod === 'vendor' }
                                onChange={ () =>
                                    setLocalDeliveryMethod( 'vendor' )
                                }
                            />
                            <RadioCard
                                label="No Delivery Needed"
                                description="(Digital product)"
                                checked={ localDeliveryMethod === 'none' }
                                onChange={ () =>
                                    setLocalDeliveryMethod( 'none' )
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium mb-4">
                            { __( "What's your top priority?", 'dokan' ) }
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            <RadioCard
                                label="International market reach"
                                checked={ localPriority === 'international' }
                                onChange={ () =>
                                    setLocalPriority( 'international' )
                                }
                            />
                            <RadioCard
                                label="Maximizing sales conversion"
                                checked={ localPriority === 'sales' }
                                onChange={ () => setLocalPriority( 'sales' ) }
                            />
                            <RadioCard
                                label="Local store management"
                                checked={ localPriority === 'local' }
                                onChange={ () => setLocalPriority( 'local' ) }
                            />
                            <RadioCard
                                label="Security and compliance"
                                checked={ localPriority === 'security' }
                                onChange={ () =>
                                    setLocalPriority( 'security' )
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-12">
                    <Button
                        onClick={ onBack }
                        className="flex items-center text-gray-600 font-medium border-0 shadow-none"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                        { __( 'Back', 'dokan' ) }
                    </Button>
                    <Button
                        onClick={ handleNext }
                        className="bg-dokan-btn hover:bg-dokan-btn-hover text-white rounded-md py-3 px-8"
                    >
                        { __( 'Next', 'dokan' ) }
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 ml-1"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                        >
                            <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MarketplaceGoalScreen;

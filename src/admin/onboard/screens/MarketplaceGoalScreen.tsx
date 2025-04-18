import { useEffect, useState } from '@wordpress/element';
import DokanLogo from '../DokanLogo';
import RadioCard from '../components/RadioCard';
import { __ } from '@wordpress/i18n';
import NextButton from '@dokan/admin/onboard/components/NextButton';
import BackButton from '@dokan/admin/onboard/components/BackButton';

interface MarketplaceGoalScreenProps {
    onNext: () => void;
    onBack: () => void;
    onUpdate: (
        focus: string,
        deliveryHandling: string,
        priority: string
    ) => void;
    marketplaceGoal: {
        marketplace_focus: string;
        handle_delivery: string;
        top_priority: string;
    };
}

const marketplaceFocus = [
    {
        label: __( 'Digital Products', 'dokan-lite' ),
        value: 'digital',
    },
    {
        label: __( 'Physical Products', 'dokan-lite' ),
        value: 'physical',
    },
    {
        label: __( 'Services', 'dokan-lite' ),
        value: 'services',
    },
    {
        label: __( 'Subscriptions', 'dokan-lite' ),
        value: 'subscriptions',
    },
];

const deliveryMethods = [
    {
        label: __( 'Marketplace handles delivery', 'dokan-lite' ),
        value: 'marketplace',
    },
    {
        label: __( 'Vendors manage their deliveries', 'dokan-lite' ),
        value: 'vendor',
    },
    {
        label: __( 'No delivery needed (Digital Products)', 'dokan-lite' ),
        value: 'none',
    },
];

const priorities = [
    {
        label: __( 'International market reach', 'dokan-lite' ),
        value: 'international',
    },
    {
        label: __( 'Maximizing sales conversion', 'dokan-lite' ),
        value: 'sales',
    },
    {
        label: __( 'Local store management', 'dokan-lite' ),
        value: 'local',
    },
];

const MarketplaceGoalScreen = ( {
    onNext,
    onBack,
    onUpdate,
    marketplaceGoal,
}: MarketplaceGoalScreenProps ) => {
    const [ localMarketplaceType, setLocalMarketplaceType ] = useState(
        marketplaceGoal?.marketplace_focus
    );
    const [ localDeliveryMethod, setLocalDeliveryMethod ] = useState(
        marketplaceGoal?.handle_delivery
    );
    const [ localPriority, setLocalPriority ] = useState(
        marketplaceGoal?.top_priority
    );

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
    const isDisabledNextButton =
        ! localMarketplaceType || ! localDeliveryMethod || ! localPriority;

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="p-8 md:p-10 sm:w-[54rem] w-full">
                <div className="mb-12">
                    <DokanLogo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-8">
                    { __( 'Marketplace Goal', 'dokan-lite' ) }
                </h1>

                <div className="space-y-8">
                    <div>
                        <h2 className="text-lg font-medium mb-4">
                            { __(
                                "What's the primary focus of your marketplace?",
                                'dokan-lite'
                            ) }
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            { marketplaceFocus.map( ( focus ) => (
                                <RadioCard
                                    width={ 'w-[137px]' }
                                    key={ focus.value }
                                    label={ focus.label }
                                    checked={
                                        localMarketplaceType === focus.value
                                    }
                                    onChange={ () =>
                                        setLocalMarketplaceType( focus.value )
                                    }
                                />
                            ) ) }
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium mb-4">
                            { __(
                                'How do you plan to handle deliveries?',
                                'dokan-lite'
                            ) }
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            { deliveryMethods.map( ( method ) => (
                                <RadioCard
                                    width={ 'w-[157px]' }
                                    key={ method.value }
                                    label={ method.label }
                                    checked={
                                        localDeliveryMethod === method.value
                                    }
                                    onChange={ () =>
                                        setLocalDeliveryMethod( method.value )
                                    }
                                />
                            ) ) }
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-medium mb-4">
                            { __( "What's your top priority?", 'dokan-lite' ) }
                        </h2>
                        <div className="flex flex-wrap gap-4">
                            { priorities.map( ( priority ) => (
                                <RadioCard
                                    width={ 'w-[137px]' }
                                    key={ priority.value }
                                    label={ priority.label }
                                    checked={ localPriority === priority.value }
                                    onChange={ () =>
                                        setLocalPriority( priority.value )
                                    }
                                />
                            ) ) }
                        </div>
                    </div>
                </div>

                <div className="flex justify-between mt-12">
                    <BackButton onBack={ onBack } />
                    <NextButton
                        handleNext={ handleNext }
                        disabled={ isDisabledNextButton }
                    />
                </div>
            </div>
        </div>
    );
};

export default MarketplaceGoalScreen;

import Logo from './Logo';
import RadioCard from './RadioCard';
import { __ } from '@wordpress/i18n';
import { Button } from  '@getdokan/dokan-ui';
import { useState } from '@wordpress/element';

const MarketplaceGoalScreen = ({ onNext, onBack }) => {
    const [ marketplaceType, setMarketplaceType ] = useState( 'subscriptions' );
    const [ deliveryMethod, setDeliveryMethod ] = useState( 'vendor' );
    const [ priority, setPriority ] = useState( null );

    return (
        <div className={`min-h-screen flex items-center justify-center`}>
            <div className='p-8 md:p-10 max-w-4xl'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <h1 className='text-2xl md:text-3xl font-bold mb-10'>
                    { __( 'Marketplace Goal', 'dokan' ) }
                </h1>

                <div className='space-y-8'>
                    <div>
                        <h2 className='text-lg font-medium mb-4'>
                            { __( 'What\'s the primary focus of your marketplace?', 'dokan' ) }
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                            <RadioCard
                                label='Digital Products'
                                checked={marketplaceType === 'digital'}
                                onChange={() => setMarketplaceType('digital')}
                            />
                            <RadioCard
                                label='Physical Products'
                                checked={marketplaceType === 'physical'}
                                onChange={() => setMarketplaceType('physical')}
                            />
                            <RadioCard
                                label='Services'
                                checked={marketplaceType === 'services'}
                                onChange={() => setMarketplaceType('services')}
                            />
                            <RadioCard
                                label='Subscriptions'
                                checked={marketplaceType === 'subscriptions'}
                                onChange={() => setMarketplaceType('subscriptions')}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className='text-lg font-medium mb-4'>
                            { __( 'How do you plan to handle deliveries?', 'dokan' ) }
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <RadioCard
                                label='Marketplace Handles Delivery'
                                checked={deliveryMethod === 'marketplace'}
                                onChange={() => setDeliveryMethod('marketplace')}
                            />
                            <RadioCard
                                label='Vendors manage their deliveries'
                                checked={deliveryMethod === 'vendor'}
                                onChange={() => setDeliveryMethod('vendor')}
                            />
                            <RadioCard
                                label='No Delivery Needed (Digital product)'
                                checked={deliveryMethod === 'none'}
                                onChange={() => setDeliveryMethod('none')}
                            />
                        </div>
                    </div>

                    <div>
                        <h2 className='text-lg font-medium mb-4'>
                            { __( 'What\'s your top priority?', 'dokan' ) }
                        </h2>
                        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                            <RadioCard
                                label='International market reach'
                                checked={priority === 'international'}
                                onChange={() => setPriority('international')}
                            />
                            <RadioCard
                                label='Maximizing sales conversion'
                                checked={priority === 'sales'}
                                onChange={() => setPriority('sales')}
                            />
                            <RadioCard
                                label='Local store management'
                                checked={priority === 'local'}
                                onChange={() => setPriority('local')}
                            />
                        </div>
                    </div>
                </div>

                <div className='flex justify-between mt-12'>
                    <Button onClick={ onBack } className='flex items-center text-gray-600 font-medium border-0 shadow-none'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' clipRule='evenodd' />
                        </svg>
                        { __( 'Back', 'dokan' ) }
                    </Button>
                    <Button onClick={ onNext } className='bg-dokan-btn hover:bg-dokan-btn-hover text-white rounded-md py-3 px-8'>
                        { __( 'Next', 'dokan' ) }
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 ml-1' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default MarketplaceGoalScreen;

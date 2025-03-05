import { useState } from '@wordpress/element';
import OnboardingLayout from './OnboardingLayout';
import RadioCard from './RadioCard';
import Logo from './Logo';

const MarketplaceGoalScreen = () => {
    const [marketplaceType, setMarketplaceType] = useState('subscriptions')
    const [deliveryMethod, setDeliveryMethod] = useState('vendor')
    const [priority, setPriority] = useState(null)

    return (
        <OnboardingLayout>
            <div className='p-8 md:p-10'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <h1 className='text-2xl md:text-3xl font-bold mb-10'>Marketplace Goal</h1>

                <div className='space-y-8'>
                    <div>
                        <h2 className='text-lg font-medium mb-4'>What's the primary focus of your marketplace?</h2>
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
                        <h2 className='text-lg font-medium mb-4'>How do you plan to handle deliveries?</h2>
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
                        <h2 className='text-lg font-medium mb-4'>What's your top priority?</h2>
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
                    <button className='flex items-center text-gray-600 font-medium'>
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z' clipRule='evenodd' />
                        </svg>
                        Back
                    </button>
                    <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg flex items-center transition-colors'>
                        Next
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 ml-1' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                        </svg>
                    </button>
                </div>
            </div>
        </OnboardingLayout>
    )
}

export default MarketplaceGoalScreen;

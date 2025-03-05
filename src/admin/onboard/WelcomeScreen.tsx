import Logo from './Logo';
import OnboardingLayout from './OnboardingLayout';

const WelcomeScreen = () => {
    return (
        <OnboardingLayout>
            <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <h1 className='text-3xl md:text-4xl font-bold mb-6'>
                    Welcome to Your New<br />Multi-Vendor Marketplace!
                </h1>
                <p className='text-gray-600 max-w-lg mb-10'>
                    Ready to revolutionize online selling? We're excited to help you create a marketplace that stands out! Let's start with a few quick questions.
                </p>
                <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors'>
                    Start Journey
                </button>
            </div>
        </OnboardingLayout>
    )
}

export default WelcomeScreen;

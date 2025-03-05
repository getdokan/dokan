import Logo from './Logo';
import OnboardingLayout from './OnboardingLayout';

const SuccessScreen = () => {
    return (
        <OnboardingLayout>
            <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <h1 className='text-3xl font-bold mb-4'>Congratulations! 🎉</h1>
                <p className='text-xl mb-10'>You're all set to start selling.</p>
                <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-8 rounded-lg transition-colors'>
                    Explore Dashboard
                </button>
            </div>
        </OnboardingLayout>
    )
}

export default SuccessScreen;

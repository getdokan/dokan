import Logo from './Logo';
import OnboardingLayout from './OnboardingLayout';

export const LoadingScreen = () => {
    return (
        <OnboardingLayout>
            <div className='flex flex-col items-center justify-center py-16 px-6 text-center'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <div className='flex items-center space-x-3 mb-6'>
                    <svg className='animate-spin h-5 w-5 text-indigo-600' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                        <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                        <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    <span className='text-lg font-medium text-gray-700'>Creating your new marketplace...</span>
                </div>
            </div>
        </OnboardingLayout>
    )
}

export default LoadingScreen;

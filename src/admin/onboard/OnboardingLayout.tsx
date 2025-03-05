const OnboardingLayout = ({ children, className = '' }) => {
    return (
        <div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-4'>
            <div className={ `w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden ${ className }` }>
                {children}
            </div>
        </div>
    )
}

export default OnboardingLayout;

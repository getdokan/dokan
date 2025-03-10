const OnboardingLayout = ( { children, className = '' } ) => {
    return (
        <div className={ `min-h-screen dokan-onboard-welcome flex ` }>
            <div
                className={ `drop-shadow-lg rounded-2xl  overflow-hidden bg-white sm:w-[744px] m-auto h-[532px] border border-solid border-[#E9E9E9] flex items-center justify-center ${ className }` }
            >
                { children }
            </div>
        </div>
    );
};

export default OnboardingLayout;

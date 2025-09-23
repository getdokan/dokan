const OnBoardLayout = ( { children, className = '' } ) => {
    return (
        <div className="min-h-screen dokan-onboard-radial-gradient flex items-center justify-center p-4">
            <div
                className={ `w-full max-w-[46rem] md:h-[33.5rem]  bg-white rounded-2xl border border-[#E9E9E9] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.05)] overflow-hidden ${ className }` }
            >
                { children }
            </div>
        </div>
    );
};

export default OnBoardLayout;

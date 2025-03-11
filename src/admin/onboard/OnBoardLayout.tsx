const OnBoardLayout = ({ children, className = '' } ) => {
    return (
        <div className="min-h-screen dokan-onboard-radial-gradient flex items-center justify-center p-4">
            <div
                className={ `w-full max-w-4xl bg-white rounded-2xl shadow-lg overflow-hidden ${ className }` }
            >
                { children }
            </div>
        </div>
    );
};

export default OnBoardLayout;

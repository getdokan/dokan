import OnboardingLayout from '../OnboardingLayout';

export const LoadingScreen = () => {
    return (
        <OnboardingLayout
            className={ `!bg-transparent shadow-none drop-shadow-none rounded-none border-none` }
        >
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="mb-8">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="183"
                        height="183"
                        fill="none"
                    >
                        <circle cx="91.421" cy="91.091" r="91" fill="#fff" />
                        <path
                            d="M110.908 89.548c-.064 15.946-6.908 32.408-21.046 39.897-9.942 5.294-33.441 9.361-33.441-7.876V57.399c0-9.554 8.07-12.718 16.139-12.266 12.008.646 23.499 6.262 30.471 16.591 4.455 6.585 6.908 14.525 7.683 22.531.064 1.808.193 3.551.193 5.294z"
                            fill="url(#A)"
                        />
                        <path
                            d="M133.181 83.932c-1.356-13.17-9.426-24.209-20.594-30.859-7.425-4.454-16.721-5.552-21.563 3.357 0 .065-32.602 59.974-32.602 59.974-2.841 5.23-2.195 9.555.387 13.106 3.873 5.293 11.556 7.682 17.818 8.328 5.81.645 11.685 0 17.302-1.292 16.979-3.873 32.021-15.429 37.121-32.214 2.001-6.585 2.841-13.493 2.131-20.4z"
                            fill="url(#B)"
                        />
                        <path
                            d="M89.862 129.51c14.138-7.554 20.982-24.016 21.046-39.897 0-1.743-.064-3.486-.258-5.229-.71-8.005-3.228-15.946-7.682-22.531-2.454-3.68-5.488-6.714-8.91-9.232-1.097.968-2.13 2.26-2.97 3.874 0 .065-32.602 59.974-32.602 59.974-2.13 3.873-2.26 7.295-1.162 10.265 0 .064.065.129.065.193.065.129.129.323.194.452s.065.194.129.323c0 .065.065.129.065.129 5.1 9.813 23.563 6.198 32.085 1.679z"
                            fill="url(#C)"
                        />
                        <defs>
                            <linearGradient
                                id="A"
                                x1="83.652"
                                y1="50.068"
                                x2="83.652"
                                y2="81.358"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#5711cf" />
                                <stop offset="1" stopColor="#800bd1" />
                            </linearGradient>
                            <linearGradient
                                id="B"
                                x1="121.481"
                                y1="59.395"
                                x2="83.084"
                                y2="133.789"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop stopColor="#fe9879" />
                                <stop offset="1" stopColor="#fe7598" />
                            </linearGradient>
                            <linearGradient
                                id="C"
                                x1="105.911"
                                y1="57.58"
                                x2="76.154"
                                y2="128.614"
                                gradientUnits="userSpaceOnUse"
                            >
                                <stop offset=".014" stopColor="#d8476f" />
                                <stop offset=".996" stopColor="#e93083" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>
                <div className="flex items-center space-x-3 mb-6">
                    <svg
                        className="animate-spin h-5 w-5 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                    <span className="text-lg font-medium text-gray-700">
                        { __( 'Creating your new marketplace…', 'dokan' ) }
                    </span>
                </div>
            </div>
        </OnboardingLayout>
    );
};

export default LoadingScreen;

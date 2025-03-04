const ResponseHistory = ( { prev, next, history } ) => {
    if ( ! history ) {
        return null;
    }
    return (
        <div className="flex gap-1 items-center">
            <svg
                onClick={ prev }
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={ 1.5 }
                stroke="currentColor"
                className="h-4 w-4 cursor-pointer"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                />
            </svg>
            <span>{ history }</span>
            <svg
                onClick={ next }
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={ 1.5 }
                stroke="currentColor"
                className="h-4 w-4 cursor-pointer"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
            </svg>
        </div>
    );
};

export default ResponseHistory;

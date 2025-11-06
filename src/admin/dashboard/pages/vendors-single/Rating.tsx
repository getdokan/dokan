const Rating = ( { rating }: { rating: number } ) => {
    return (
        <div className="flex items-center">
            <span className="text-yellow-400 flex items-center gap-1">
                { Array.from( { length: 5 }, ( _, index ) => {
                    const isHalf = rating > index && rating < index + 1;
                    return (
                        <svg
                            key={ index }
                            xmlns="http://www.w3.org/2000/svg"
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill={
                                index < rating
                                    ? isHalf
                                        ? 'url(#half)'
                                        : 'currentColor'
                                    : 'none'
                            }
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            { isHalf && (
                                <defs>
                                    <linearGradient
                                        id="half"
                                        x1="0"
                                        x2="1"
                                        y1="0"
                                        y2="0"
                                    >
                                        <stop
                                            offset="50%"
                                            stopColor="currentColor"
                                        />
                                        <stop offset="50%" stopColor="#fff" />
                                    </linearGradient>
                                </defs>
                            ) }
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    );
                } ) }
            </span>
            <span className="ml-2 text-gray-600">{ rating.toFixed( 1 ) }</span>
        </div>
    );
};
export default Rating;

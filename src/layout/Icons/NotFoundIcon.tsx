const NotFoundIcon = ( {
    className = '',
    color = 'text-primary-500',
}: {
    className?: string;
    color?: string;
} ) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="221"
            height="86"
            viewBox="0 0 221 86"
            fill="none"
            className={ `${ className } ${ color }` }
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M40.6666 85.6258H57.8382V70.3622H64.039L68.3319 56.5295H57.8382V0.721863H35.4197L0.122559 55.5756V70.3622H40.6666V85.6258ZM16.8173 57.0065H40.6667V18.3704L16.8173 57.0065Z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M193.303 85.6258H210.475V70.3622H216.676L220.968 56.5295H210.475V0.721863H188.056L152.759 55.5756V70.3622H193.303V85.6258ZM169.454 57.0065H193.303V18.3704L169.454 57.0065Z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M109.353 79.902C129.637 79.902 146.081 63.4582 146.081 43.1739C146.081 22.8895 129.637 6.44572 109.353 6.44572C89.0686 6.44572 72.6249 22.8895 72.6249 43.1739C72.6249 63.4582 89.0686 79.902 109.353 79.902ZM109.353 64.6383C121.207 64.6383 130.817 55.0283 130.817 43.1738C130.817 31.3193 121.207 21.7093 109.353 21.7093C97.4984 21.7093 87.8885 31.3193 87.8885 43.1738C87.8885 55.0283 97.4984 64.6383 109.353 64.6383Z"
                fill="currentColor"
            />
        </svg>
    );
};

export default NotFoundIcon;

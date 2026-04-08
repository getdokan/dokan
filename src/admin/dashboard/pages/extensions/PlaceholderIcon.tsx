const PlaceholderIcon = ( { size = 'default' }: { size?: 'default' | 'lg' } ) => {
    const dim = size === 'lg' ? 56 : 40;
    const iconDim = size === 'lg' ? 24 : 20;
    const radius = size === 'lg' ? 14 : 10;
    const offset = ( dim - iconDim ) / 2;

    return (
        <div
            className="flex items-center justify-center flex-shrink-0"
            style={ {
                width: dim,
                height: dim,
                borderRadius: radius,
                background: 'linear-gradient(135deg, #F0EBFF 0%, #E8E0FF 100%)',
            } }
        >
            <svg
                width={ iconDim }
                height={ iconDim }
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M3 14l4-4 4 4 4-4"
                    stroke="#7047EB"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M3 10l4-4 4 4 4-4"
                    stroke="#7047EB"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M3 6l4-4 4 4 4-4"
                    stroke="#7047EB"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default PlaceholderIcon;

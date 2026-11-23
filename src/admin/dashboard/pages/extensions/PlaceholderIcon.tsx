const PlaceholderIcon = () => (
    <div
        className="w-[60px] h-[60px] rounded-lg flex items-center justify-center flex-shrink-0"
        style={ {
            background: 'linear-gradient(135deg, #F0EBFF 0%, #E8E0FF 100%)',
        } }
    >
        <svg
            width="24"
            height="24"
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

export default PlaceholderIcon;

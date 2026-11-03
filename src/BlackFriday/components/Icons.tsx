// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); only the menu entry auto-hides.
// Outlined check in a circle (deal feature lists), exported from the Figma file.
export const CircleCheck = ( {
    size = 22,
    className = '',
}: {
    size?: number;
    className?: string;
} ) => (
    <svg
        width={ size }
        height={ size }
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={ className }
        aria-hidden="true"
    >
        <path
            d="M19.25 11C19.25 15.5563 15.5563 19.25 11 19.25C6.44365 19.25 2.75 15.5563 2.75 11C2.75 6.44365 6.44365 2.75 11 2.75C15.5563 2.75 19.25 6.44365 19.25 11Z"
            stroke="#3A3A3E"
            strokeWidth="1.5"
        />
        <path
            d="M7.5 11L10 13.5L14.5 8.5"
            stroke="#3A3A3E"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

// Filled purple check for the comparison table's "Pro" column.
export const CheckBadge = () => (
    <svg
        width={ 18 }
        height={ 18 }
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
    >
        <circle cx="9" cy="9" r="9" fill="#7047EB" />
        <path
            d="M5.5 9L8 11.5L12.5 6.5"
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

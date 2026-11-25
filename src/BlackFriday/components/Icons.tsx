// TODO BFCM-2026-REMOVE: seasonal Black Friday / Cyber Monday page. Remove manually after the campaign ends (Dec 5, 2026); nothing switches itself off.
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

// Green sparkle in front of the bundle's "You save" amount.
export const Sparkle = () => (
    <svg
        width={ 10.5 }
        height={ 11.9 }
        viewBox="0 0 10.4981 11.8674"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
    >
        <path
            d="M5.24903 0C6.39013 3.19506 7.303 4.10794 10.4981 5.93369C7.303 7.303 6.39013 8.67231 5.24903 11.8674C3.6515 8.67231 2.73863 7.303 0 5.93369C2.73863 4.10794 3.6515 3.19506 5.24903 0Z"
            fill="#02CB18"
        />
    </svg>
);

// Grey shield with a check beside the bundle's "One time payment" note.
export const ShieldCheck = () => (
    <svg
        width={ 19 }
        height={ 22.4 }
        viewBox="0 0 18.9351 22.3779"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
    >
        <path
            d="M9.91841 0L18.9351 3.44275V11.189C18.9351 15.4924 14.4268 19.7958 9.91841 22.3779C4.50837 19.7958 0 15.4924 0 11.189V3.44275L9.91841 0Z"
            fill="#8282A4"
        />
        <path
            d="M4.3 11.808L8.431 15.497L14.628 6.89"
            stroke="white"
            strokeWidth="2.15"
            strokeLinecap="round"
        />
    </svg>
);

// White arrow inside the bundle's purchase button.
export const ArrowRight = () => (
    <svg
        width={ 20.7 }
        height={ 20.7 }
        viewBox="0 0 20.6565 20.6565"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0 rtl:-scale-x-100"
    >
        <path
            d="M4.30344 10.3283H16.3531M10.3283 4.30344L16.3531 10.3283L10.3283 16.3531"
            stroke="white"
            strokeWidth="2.15172"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

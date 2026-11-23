
const ChevronDownIcon = ({
    color = '#828282',
    size = 20,
}: {
    color?: string;
    size?: number;
}) => (
    <svg
        width={ size }
        height={ size }
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M5 8L10 13L15 8"
            stroke={ color }
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

export default ChevronDownIcon;

import { RadioButtonProps } from './types';

const RadioButton: React.FC< RadioButtonProps > = ( {
    checked,
    disabled = false,
} ) => {
    let strokeColor = '#E9E9E9';
    if ( checked ) {
        strokeColor = '#7047EB';
    } else if ( disabled ) {
        strokeColor = '#E9E9E9';
    }

    return (
        <div className="relative w-[18px] h-[18px]">
            <svg
                className="block w-full h-full"
                fill="none"
                preserveAspectRatio="none"
                viewBox="0 0 18 18"
            >
                <circle
                    cx="9"
                    cy="9"
                    r="8.5"
                    stroke={ strokeColor }
                    strokeWidth="1"
                    fill="none"
                />
            </svg>
            { checked && (
                <div className="absolute inset-[22.222%]">
                    <svg
                        className="block w-full h-full"
                        fill="none"
                        preserveAspectRatio="none"
                        viewBox="0 0 10 10"
                    >
                        <circle cx="5" cy="5" fill="#7047EB" r="5" />
                    </svg>
                </div>
            ) }
        </div>
    );
};

export default RadioButton;

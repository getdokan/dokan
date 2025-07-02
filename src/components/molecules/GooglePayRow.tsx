import { InputLabel, ToggleSwitch } from '../fields';

interface GooglePayRowProps {
    checked: boolean;
    onChange: ( checked: boolean ) => void;
}

const GooglePayRow: React.FC< GooglePayRowProps > = ( {
    checked,
    onChange,
} ) => (
    <div className="flex flex-row items-center bg-white border border-[#e9e9e9] rounded-[5px] p-5 w-full">
        <div className="flex flex-col flex-1">
            <InputLabel
                title="Google App"
                icon={
                    <svg
                        width="44"
                        height="44"
                        viewBox="0 0 44 44"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <rect
                            x="0.513158"
                            y="0.513158"
                            width="42.8225"
                            height="42.9737"
                            rx="2.56579"
                            fill="white"
                            stroke="#E9E9E9"
                            strokeWidth="1.02632"
                        />
                        <g clipPath="url(#clip0_10839_15599)">
                            <path
                                d="M35.4425 22.2596C35.4425 21.1211 35.3504 20.2903 35.1512 19.4287H22.1951V24.5674H29.8C29.6468 25.8445 28.8188 27.7677 26.9788 29.06L26.953 29.232L31.0495 32.4165L31.3333 32.4449C33.9399 30.0293 35.4425 26.4753 35.4425 22.2596Z"
                                fill="#4285F4"
                            />
                            <path
                                d="M22.192 35.7998C25.9178 35.7998 29.0456 34.5689 31.3303 32.4457L26.9758 29.0608C25.8105 29.8763 24.2466 30.4455 22.192 30.4455C18.5429 30.4455 15.4457 28.0301 14.3416 24.6914L14.1798 24.7052L9.92021 28.0131L9.8645 28.1685C12.1337 32.6918 16.7949 35.7998 22.192 35.7998Z"
                                fill="#34A853"
                            />
                            <path
                                d="M14.3438 24.6909C14.0525 23.8293 13.8839 22.9061 13.8839 21.9522C13.8839 20.9983 14.0525 20.0752 14.3285 19.2136L14.3208 19.0301L10.0078 15.6691L9.86668 15.7364C8.93143 17.6135 8.39478 19.7213 8.39478 21.9522C8.39478 24.1831 8.93143 26.2909 9.86668 28.168L14.3438 24.6909Z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M22.192 13.4596C24.7832 13.4596 26.5311 14.5827 27.5278 15.5213L31.4223 11.7057C29.0304 9.47479 25.9178 8.10547 22.192 8.10547C16.7949 8.10547 12.1337 11.2133 9.8645 15.7366L14.3263 19.2138C15.4457 15.8752 18.5429 13.4596 22.192 13.4596Z"
                                fill="#EB4335"
                            />
                        </g>
                        <defs>
                            <clipPath id="clip0_10839_15599">
                                <rect
                                    width="27.694"
                                    height="27.7895"
                                    fill="white"
                                    transform="translate(8.07568 8.10547)"
                                />
                            </clipPath>
                        </defs>
                    </svg>
                }
                helperText={
                    <div className="flex flex-row items-center gap-2">
                        <span className="text-[#828282] text-[12px] font-normal leading-[1.4]">
                            Connect to your Google account with your website.
                        </span>
                        <a
                            href="#"
                            className="text-[#7047eb] text-[12px] underline flex items-center gap-1"
                        >
                            Get Help
                        </a>
                    </div>
                }
            />
        </div>
        <div className="ml-8">
            <ToggleSwitch checked={ checked } onChange={ onChange } />
        </div>
    </div>
);

export default GooglePayRow;

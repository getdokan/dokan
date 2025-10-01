import { twMerge } from 'tailwind-merge';

interface Props {
    className?: string;
    children?: React.ReactNode | JSX.Element;
}
function IconWrapper( props: Props ) {
    return (
        <div
            className={ twMerge(
                'w-[110px] h-[36px] p-2 bg-[#FFF2FF] flex justify-center items-center rounded',
                props?.className || ''
            ) }
        >
            { props?.children || '' }
        </div>
    );
}

export default IconWrapper;

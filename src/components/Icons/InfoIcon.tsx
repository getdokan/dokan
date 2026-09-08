import { Info } from 'lucide-react';
import { twMerge } from "tailwind-merge";

const InfoIcon = (
    {
        className = '',
        size = 16,
        color = '#828282'
    }: {
        className?: string;
        size?: number;
        color?: string;
    }
) => {
    return (
        <Info
            size={ size }
            color={ color }
            className={ twMerge( 'cursor-pointer', className ) }
        />
    );
};

export default InfoIcon;

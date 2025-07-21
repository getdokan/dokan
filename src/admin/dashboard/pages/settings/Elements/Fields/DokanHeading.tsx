import React from 'react';

export default function DokanHeading({ children, className = '' }) {
    return (
        <h2 className={`font-inter font-bold text-[24px] leading-[1.3] text-[#25252D] ${className}`}>
            {children}
        </h2>
    );
}

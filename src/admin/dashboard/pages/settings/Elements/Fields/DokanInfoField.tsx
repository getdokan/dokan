import { SettingsElement } from '../../types';
import { twMerge } from 'tailwind-merge';
import parse from 'html-react-parser';

interface DokanInfoFieldProps extends SettingsElement {
    link_text?: string;
    link_url?: string;
    showIcon?: boolean;
}

const DokanInfoField = ( {
    element,
    className,
}: {
    element: DokanInfoFieldProps;
    className?: string;
} ) => {
    if ( ! element.display ) {
        return null;
    }
    const handleLinkClick = () => {
        if ( element?.link_url ) {
            window.open( element?.link_url, '_blank', 'noopener,noreferrer' );
        }
    };

    return (
        <div className="w-full p-5">
            <div
                className={ twMerge(
                    'w-full relative  h-12 bg-[#f9f7ff] rounded-[3px] before:content-[""] before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#AB92F6] before:rounded-l-[3px] before:z-20 flex items-center pl-5',
                    className
                ) }
            >
                { /* Content container */ }
                <div className="flex items-center gap-2">
                    { /* Main text */ }
                    <div className="text-[#575757] text-sm leading-[1.4]">
                        { parse(
                            element?.description || element?.title || ''
                        ) }
                    </div>

                    { /* Link with icon */ }
                    { element.link_text && (
                        <div className="flex items-end gap-[5px]">
                            <button
                                onClick={ handleLinkClick }
                                className="text-[#575757] text-xs underline underline-offset-1 hover:text-[#AB92F6] transition-colors"
                            >
                                { element.link_text }
                            </button>

                            {
                                <div className="w-[13px] h-[13px] flex items-center justify-center">
                                    <svg
                                        width="10"
                                        height="10"
                                        viewBox="0 0 10 10"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            d="M5.33333 1H8.58333M8.58333 1V4.25M8.58333 1L1 8.58333"
                                            stroke="currentColor"
                                            strokeWidth="1.08333"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </div>
                            }
                        </div>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default DokanInfoField;

import { twMerge } from 'tailwind-merge';

const CountBubble = ( {
    count,
    isCollapsed = false,
}: {
    count: number;
    isCollapsed?: boolean;
} ) => (
    <span
        className={ twMerge(
            'sidebar-menu-bubble ms-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 py-0.5 text-[10px] font-semibold leading-none rounded-md text-white',
            isCollapsed && 'absolute -top-1 -end-2'
        ) }
    >
        { count }
    </span>
);

export default CountBubble;

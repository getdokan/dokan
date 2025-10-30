import { twMerge } from 'tailwind-merge';

interface SectionHeadingProps {
    title: string;
    className?: string;
}

const SectionHeading = ( { title, className = '' }: SectionHeadingProps ) => (
    <h2
        className={ twMerge(
            'text-lg font-medium text-[#828282] mb-4',
            className
        ) }
    >
        { title }
    </h2>
);

export default SectionHeading;

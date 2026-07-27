import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, CardContent, CardHeader, CardTitle } from '@wedevs/plugin-ui';

interface SectionCardProps {
    title?: ReactNode;
    description?: ReactNode;
    subtitle?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    headerClassName?: string;
    contentClassName?: string;
    headerDivider?: boolean;
}

/**
 * The card shell every order-details section renders in — plugin-ui `Card`
 * carrying the product editor's section-header spec (14/600 #25252d title,
 * #828282 description, #ddd divider), so the page reads like the rest of the
 * panel's Figma surfaces.
 *
 * `subtitle` is the sidebar's variant: a value that belongs to the title itself
 * (the customer's name under "Customer Details"), which is why it renders above
 * the first divider rather than as the first row beneath it.
 * @param root0
 * @param root0.title
 * @param root0.description
 * @param root0.subtitle
 * @param root0.action
 * @param root0.children
 * @param root0.className
 * @param root0.headerClassName
 * @param root0.contentClassName
 * @param root0.headerDivider
 */
const SectionCard = ( {
    title,
    description,
    subtitle,
    action,
    children,
    className = '',
    headerClassName = '',
    contentClassName = '',
    headerDivider = true,
}: SectionCardProps ) => (
    // 6px radius, no ring border — a mild shadow carries the edge.
    <Card
        className={ twMerge(
            'gap-4 rounded-md bg-white shadow-sm ring-0',
            className
        ) }
    >
        { ( title || action ) && (
            <CardHeader
                className={ twMerge(
                    'grid-cols-[1fr_auto] items-center pb-4',
                    headerDivider ? 'border-b border-[#E9E9E9]' : '',
                    headerClassName
                ) }
            >
                <div className="flex min-w-0 flex-col gap-0.5">
                    <CardTitle className="text-sm font-semibold text-[#25252d]">
                        { title }
                    </CardTitle>
                    { description && (
                        <p className="text-sm font-normal text-[#828282]">
                            { description }
                        </p>
                    ) }
                    { subtitle && (
                        <p className="mt-1.5 text-sm font-normal leading-[1.4] text-[#575757]">
                            { subtitle }
                        </p>
                    ) }
                </div>
                { action && <div className="justify-self-end">{ action }</div> }
            </CardHeader>
        ) }
        <CardContent className={ contentClassName }>{ children }</CardContent>
    </Card>
);

export default SectionCard;

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Card, CardContent, CardHeader, CardTitle } from '@wedevs/plugin-ui';

interface SectionCardProps {
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    children: ReactNode;
    className?: string;
    contentClassName?: string;
}

/**
 * The card shell every order-details section renders in — plugin-ui `Card`
 * carrying the product editor's section-header spec (14/600 #25252d title,
 * #828282 description, #ddd divider), so the page reads like the rest of the
 * panel's Figma surfaces.
 * @param root0
 * @param root0.title
 * @param root0.description
 * @param root0.action
 * @param root0.children
 * @param root0.className
 * @param root0.contentClassName
 */
const SectionCard = ( {
    title,
    description,
    action,
    children,
    className = '',
    contentClassName = '',
}: SectionCardProps ) => (
    // 6px radius, no ring border — a mild shadow carries the edge.
    <Card
        className={ twMerge(
            'gap-4 rounded-md bg-white shadow-sm ring-0',
            className
        ) }
    >
        { ( title || action ) && (
            <CardHeader className="grid-cols-[1fr_auto] items-center border-b border-[#E9E9E9] pb-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <CardTitle className="text-sm font-semibold text-[#25252d]">
                        { title }
                    </CardTitle>
                    { description && (
                        <p className="text-sm font-normal text-[#828282]">
                            { description }
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

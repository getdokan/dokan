import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import SectionCard from '../SectionCard';

interface SidebarCardProps {
    title: ReactNode;
    subtitle?: ReactNode;
    children: ReactNode;
    contentClassName?: string;
}

/**
 * The sidebar's card preset: the shared section shell on the mockup's 20px
 * grid, with dividers that run edge to edge instead of insetting with the text.
 *
 * The header never draws the rule itself — the card header's own
 * `[.border-b]:pb-6` variant would then win the padding on specificity and put
 * that one card off the grid. Each block draws the rule above itself instead,
 * so every card breathes identically.
 * @param root0
 * @param root0.title
 * @param root0.subtitle
 * @param root0.children
 * @param root0.contentClassName
 */
export const SidebarCard = ( {
    title,
    subtitle,
    children,
    contentClassName = '',
}: SidebarCardProps ) => (
    <SectionCard
        title={ title }
        subtitle={ subtitle }
        headerDivider={ false }
        className="gap-0 py-5"
        headerClassName="px-5 pb-0"
        contentClassName={ twMerge( 'px-0 pt-0', contentClassName ) }
    >
        { children }
    </SectionCard>
);

/**
 * One labelled block inside a sidebar card, opening with the 20px rule that
 * separates it from whatever came before.
 * @param root0
 * @param root0.label
 * @param root0.children
 */
export const SidebarBlock = ( {
    label,
    children,
}: {
    label: ReactNode;
    children: ReactNode;
} ) => (
    <div className="mt-5 border-t border-[#E9E9E9] px-5 pt-5">
        { /* Every block label reads at one size and weight — the sidebar has
             no hierarchy between Contact, Customer IP and Customer Note. */ }
        <p className="text-xs font-semibold leading-[1.3] text-[#25252d]">
            { label }
        </p>
        <div className="mt-2.5 text-sm leading-[1.4] text-[#575757]">
            { children }
        </div>
    </div>
);

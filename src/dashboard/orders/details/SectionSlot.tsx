import { Slot } from '@wordpress/components';
import { useOrderDetailsContext } from './OrderDetailsContext';
import { ORDER_DETAILS_SECTION_SLOTS } from './slots';

/**
 * A slot that hands fills the whole view context — the order, its id, the
 * section markers, the loading flag, `refetch` and `navigate` — so an
 * extension never has to fetch the order again to render beside a section.
 * @param root0
 * @param root0.name
 */
export const SectionSlot = ( { name }: { name: string } ) => {
    const context = useOrderDetailsContext();

    return <Slot name={ name } fillProps={ context } />;
};

/**
 * Brackets a first-party section with its `before-*` / `after-*` slots.
 * @param root0
 * @param root0.section
 * @param root0.children
 */
export const SectionWithSlots = ( {
    section,
    children,
}: {
    section: keyof typeof ORDER_DETAILS_SECTION_SLOTS | string;
    children: React.ReactNode;
} ) => {
    const slots = ORDER_DETAILS_SECTION_SLOTS[ section ];

    if ( ! slots ) {
        return <>{ children }</>;
    }

    return (
        <>
            <SectionSlot name={ slots.before } />
            { children }
            <SectionSlot name={ slots.after } />
        </>
    );
};

export default SectionSlot;

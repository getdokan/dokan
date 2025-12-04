import { __ } from '@wordpress/i18n';
import { RawHTML } from '@wordpress/element';
import { DokanTooltip } from '@src/components';
import { truncate } from '@src/utilities';

interface ShortContentProps {
    content: string;
    maxLength?: number;
    className?: string;
    fallback?: string;
    useRawHTML?: boolean;
}

/**
 * ShortContent Component
 * Displays content with automatic truncation and tooltip for longer text
 *
 * @param {Object}  props
 * @param {string}  props.content    - The content to display
 * @param {number}  props.maxLength  - Maximum length before truncation (default: 22)
 * @param {string}  props.className  - Additional CSS classes
 * @param {string}  props.fallback   - Fallback text when content is empty (default: '-')
 * @param {boolean} props.useRawHTML - Whether to render as raw HTML (default: true)
 */
const ShortContent = ( {
    content,
    maxLength = 22,
    className = 'm-0 space-x-2 flex flex-wrap text-wrap leading-6 text-sm text-gray-600',
    fallback = __( '-', 'dokan-lite' ),
    useRawHTML = true,
}: ShortContentProps ) => {
    const displayContent = content || fallback;
    const ContentWrapper = useRawHTML ? RawHTML : 'span';

    // Short content - display directly.
    if ( displayContent?.length <= maxLength ) {
        return (
            <p className={ className }>
                <ContentWrapper>{ displayContent }</ContentWrapper>
            </p>
        );
    }

    // Long content - display with tooltip.
    const truncatedContent = truncate
        ? truncate( displayContent, maxLength )
        : displayContent;

    return (
        <DokanTooltip
            content={ <ContentWrapper>{ displayContent }</ContentWrapper> }
        >
            <p className={ className }>
                <ContentWrapper>{ truncatedContent }</ContentWrapper>
            </p>
        </DokanTooltip>
    );
};

export default ShortContent;

import { twMerge } from 'tailwind-merge';
import parse from 'html-react-parser';
import { SettingsElement, SettingsProps } from '../../types';

interface DokanHtmlElement extends SettingsElement {
    html_content?: string;
    css_classes?: string;
    escape_html?: boolean;
    allow_shortcodes?: boolean;
}

interface DokanHtmlFieldProps extends SettingsProps {
    element: DokanHtmlElement;
}

const DokanHtmlField = ( { element, onValueChange }: DokanHtmlFieldProps ) => {
    if ( ! element.display ) {
        return null;
    }

    // Process HTML content based on settings
    const processHtmlContent = ( content: string ): string => {
        if ( ! content ) {
            return '';
        }

        // If shortcodes are allowed, we would need to process them
        // For now, we'll just return the content as-is
        // In a real implementation, you might want to use a shortcode processor
        if ( element.allow_shortcodes ) {
            // This would typically be handled server-side
            // For now, we'll just return the content
            return content;
        }

        return content;
    };

    const processedContent = processHtmlContent( element.html_content || '' );

    // If escape_html is enabled, render as plain text instead of HTML
    const renderContent = () => {
        if ( element.escape_html ) {
            return <span>{ processedContent }</span>;
        }
        return parse( processedContent );
    };

    return (
        <div
            id={ element.id }
            className={ twMerge(
                'w-full flex flex-wrap justify-between p-5',
                element.css_classes || element.css_class
            ) }
        >
            { /* Title and Description */ }
            { ( element.title || element.description ) && (
                <div className="mb-4">
                    { element.title && (
                        <h3 className="text-sm font-semibold text-[#25252D] mb-2">
                            { element.title }
                        </h3>
                    ) }
                    { element.description && (
                        <p className="text-xs text-[#828282] leading-relaxed">
                            { element.description }
                        </p>
                    ) }
                </div>
            ) }

            { /* HTML Content */ }
            <div className="html-field-content">{ renderContent() }</div>

            { /* Hidden input for form submission */ }
            <input
                type="hidden"
                value={ String( element.value || '' ) }
                onChange={ ( e ) => {
                    onValueChange( {
                        ...element,
                        value: e.target.value,
                    } );
                } }
            />
        </div>
    );
};

export default DokanHtmlField;

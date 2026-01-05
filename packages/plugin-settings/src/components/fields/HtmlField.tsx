import type { FieldProps } from '../../types';

/**
 * HtmlField Component
 *
 * A field for rendering raw HTML content.
 */
const HtmlField = ( { element }: FieldProps ) => {
    if ( ! element.display ) {
        return null;
    }

    const htmlContent =
        ( element.value as string ) ||
        ( element.default as string ) ||
        element.description ||
        '';

    return (
        <div
            className={ `w-full p-4 ${ element.css_class || '' }` }
            dangerouslySetInnerHTML={ { __html: htmlContent } }
        />
    );
};

export default HtmlField;


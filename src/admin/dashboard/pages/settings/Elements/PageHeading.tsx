import { RawHTML } from '@wordpress/element';

interface PageHeadingProps {
    title: string;
    description?: string;
    id?: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    size?: 'small' | 'medium' | 'large';
}

const PageHeading = ( {
    title,
    description,
    id,
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    size = 'large',
}: PageHeadingProps ): JSX.Element => {
    const sizeClasses = {
        small: 'text-xl',
        medium: 'text-2xl',
        large: 'text-3xl',
    };

    const headingClass = `${ sizeClasses[ size ] } font-bold text-gray-900 leading-5 ${ titleClassName }`;
    const descriptionClass = `mt-4 text-sm text-gray-500 leading-5 ${ descriptionClassName }`;

    return (
        <div className={ `mb-8 ${ className }` }>
            <h2 id={ id } className={ headingClass }>
                <RawHTML>{ title }</RawHTML>
            </h2>
            { description && (
                <p className={ descriptionClass }>
                    <RawHTML>{ description }</RawHTML>
                </p>
            ) }
        </div>
    );
};

export default PageHeading;

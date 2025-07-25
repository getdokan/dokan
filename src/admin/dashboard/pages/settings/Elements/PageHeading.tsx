import { RawHTML } from '@wordpress/element';
import { twMerge } from 'tailwind-merge';
import DocumentLink from '../../../../../components/Icons/DocumentLink';
import { __ } from '@wordpress/i18n';

interface PageHeadingProps {
    title: string;
    description?: string;
    id?: string;
    className?: string;
    titleClassName?: string;
    descriptionClassName?: string;
    size?: 'small' | 'medium' | 'large';
    documentationLink?: string;
}

const PageHeading = ( {
    title,
    description,
    id,
    className = '',
    titleClassName = '',
    descriptionClassName = '',
    size = 'large',
    documentationLink = '',
}: PageHeadingProps ): JSX.Element => {
    const sizeClasses = {
        small: 'text-xl',
        medium: 'text-2xl',
        large: 'text-3xl',
    };

    const headingClass = `${ sizeClasses[ size ] } font-bold text-gray-900 leading-5 ${ titleClassName }`;
    const descriptionClass = ` text-sm text-gray-500 leading-5 ${ descriptionClassName }`;

    return (
        <div
            id={ id }
            className={ twMerge( 'mb-6 flex justify-between ', className ) }
        >
            <div className={ 'flex flex-col gap-2' }>
                <h2 className={ headingClass }>
                    <RawHTML>{ title }</RawHTML>
                </h2>
                { description && (
                    <p className={ descriptionClass }>
                        <RawHTML>{ description }</RawHTML>
                    </p>
                ) }
            </div>
            { documentationLink && (
                <a
                    href={ documentationLink }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                >
                    <DocumentLink />
                    { __( 'Doc', 'dokan-lite' ) }
                </a>
            ) }
        </div>
    );
};

export default PageHeading;

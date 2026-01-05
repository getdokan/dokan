import { __ } from '@wordpress/i18n';

interface PageHeadingProps {
    title?: string;
    description?: string;
    documentationLink?: string;
}

/**
 * PageHeading Component
 *
 * Renders the page title, description, and optional documentation link.
 */
const PageHeading = ( { title, description, documentationLink }: PageHeadingProps ) => {
    if ( ! title && ! description ) {
        return null;
    }

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between">
                { title && (
                    <h3 className="text-lg font-medium text-gray-900">
                        { title }
                    </h3>
                ) }
                { documentationLink && (
                    <a
                        href={ documentationLink }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                    >
                        { __( 'Documentation', 'plugin-settings' ) }
                        <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={ 2 }
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                        </svg>
                    </a>
                ) }
            </div>
            { description && (
                <p className="mt-1 text-sm text-gray-500">
                    { description }
                </p>
            ) }
        </div>
    );
};

export default PageHeading;


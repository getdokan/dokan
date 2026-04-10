import { __ } from '@wordpress/i18n';
import { CircleCheck } from 'lucide-react';
import ChangeBadge from 'admin/dashboard/pages/changelog/ChangeBadge';

interface ChangeItem {
    title: string;
    description: string;
}

interface VersionChanges {
    [ key: string ]: ChangeItem[];
}

interface Version {
    version: string;
    released: string;
    changes: VersionChanges;
}

const VersionRow = ( {
    version,
    isLatest,
    isExpanded,
    isHighlighted,
    onToggle,
}: {
    version: Version;
    isLatest: boolean;
    isExpanded: boolean;
    isHighlighted: boolean;
    onToggle: () => void;
} ) => {
    const formatDate = ( dateString: string ) => {
        const date = new Date( dateString );
        return date.toLocaleDateString( 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        } );
    };

    const changeTypes = Object.keys( version.changes );

    // Calculate total items across all change types
    const totalItems = changeTypes.reduce(
        ( sum, type ) => sum + version.changes[ type ].length,
        0
    );

    // Show toggle only when total items > 5 (not for latest)
    const shouldShowToggle = ! isLatest && totalItems > 5;

    // For non-latest versions, show limited content when collapsed
    const getVisibleChanges = () => {
        if ( isLatest || isExpanded || totalItems <= 5 ) {
            return version.changes;
        }

        // Show only first 5 items total when collapsed
        const limitedChanges: VersionChanges = {};
        let itemCount = 0;
        const maxItems = 5;

        for ( const type of changeTypes ) {
            if ( itemCount >= maxItems ) {
                break;
            }

            const items = version.changes[ type ];
            const remainingSlots = maxItems - itemCount;
            const itemsToShow = items.slice( 0, remainingSlots );

            if ( itemsToShow.length > 0 ) {
                limitedChanges[ type ] = itemsToShow;
                itemCount += itemsToShow.length;
            }
        }

        return limitedChanges;
    };

    const visibleChanges = getVisibleChanges();
    const visibleChangeEntries = Object.entries( visibleChanges );

    return (
        <div className="flex gap-20 mb-10">
            { /* Left Column - Version Info (Sticky) */ }
            <div className="w-48 shrink-0">
                <div className="sticky top-4">
                    <div className="flex items-center gap-1.5 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                            { version.version }
                        </h3>
                        { isLatest && (
                            <span className="inline-flex items-center">
                                <span className="block border-l border-[#A5A5AA] h-4"></span>
                                <span className="flex items-center px-2 py-1 rounded-full text-sm font-normal text-[#008864] gap-1.5">
                                    { __( 'Latest', 'dokan-lite' ) }
                                    <CircleCheck size={ 12 } />
                                </span>
                            </span>
                        ) }
                    </div>
                    <p className="text-sm text-gray-500">
                        { formatDate( version.released ) }
                    </p>
                </div>
            </div>

            { /* Right Column - Changes Card */ }
            <div className="flex-1">
                <div
                    className={ `bg-white rounded-lg transition-all duration-300 shadow-[0_1px_2px_-1px_rgba(0,0,0,0.10),0_1px_3px_0_rgba(0,0,0,0.10)] ${
                        isHighlighted
                            ? 'ring-2 ring-[#7047EB]'
                            : 'border border-gray-200'
                    }` }
                >
                    { visibleChangeEntries.map(
                        ( [ type, items ], typeIndex ) => (
                            <div key={ type }>
                                { /* Add border/divider before each section except the first */ }
                                { typeIndex > 0 && (
                                    <hr className="my-6 w-full h-px bg-[#E9E9E9] border-0 m-0" />
                                ) }
                                <div className="p-6">
                                    <ChangeBadge type={ type } />
                                    <ul className="mt-3 space-y-3">
                                        { items.map( ( item, itemIndex ) => (
                                            <li
                                                key={ itemIndex }
                                                className="flex items-start text-sm text-[#575757] mb-0"
                                            >
                                                { item?.title && (
                                                    <span className="mr-2 text-sm text-[#575757]">
                                                        •
                                                    </span>
                                                ) }
                                                <span>{ item?.title }</span>
                                            </li>
                                        ) ) }
                                    </ul>
                                </div>
                            </div>
                        )
                    ) }

                    { /* See Details / See Less Toggle */ }
                    { shouldShowToggle && (
                        <button
                            onClick={ onToggle }
                            className="text-sm text-[#7047EB] hover:text-[#5a38bc] font-medium !outline-none !focus:outline-none focus:ring-0 focus:border-0 underline p-6 pt-0"
                        >
                            { isExpanded
                                ? __( 'See Less', 'dokan-lite' )
                                : __( 'See Details', 'dokan-lite' ) }
                        </button>
                    ) }
                </div>
            </div>
        </div>
    );
};

export default VersionRow;

// Helper function for addon icons
function getAddonIcon( id: string ): string {
    const icons: { [ key: string ]: string } = {
        analytics: '📊',
        social: '🔔',
        automation: '🛒',
        email: '✉️',
        loyalty: '🏆',
        reports: '📈',
        wemail: '📧',
        'dokan-pro': '🛍️',
    };

    return icons[ id ] || '🔌';
}

const SinglePlugin = ( {
    addon,
    isSelected,
    toggleAddon,
}: {
    addon: {
        id: string;
        title: string;
        description: string;
        icon?: string;
    };
    isSelected: boolean;
    toggleAddon: ( id: string ) => void;
} ) => {
    return (
        <div
            key={ addon.id }
            className={ `border rounded-lg p-4 sm:gap-4 gap-2 flex items-start cursor-pointer transition-colors ${
                isSelected
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-300'
            }` }
            onClick={ () => toggleAddon( addon.id ) }
        >
            <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 text-indigo-600 rounded flex items-center justify-center">
                <img
                    src={ addon.icon || getAddonIcon( addon.id ) }
                    alt={ addon.title }
                    className="w-6 h-6"
                />
            </div>
            <div className="flex flex-col gap-1">
                <h3 className="font-medium capitalize">{ addon.title }</h3>
                <p className="sm:text-sm text-xs text-gray-500 leading-4">
                    { addon.description }
                </p>
            </div>
            <div
                className={ `min-w-[25px] h-[25px] rounded-full flex  items-center justify-center ${
                    isSelected ? 'bg-[#7047EB]' : 'border-2 border-gray-300'
                }` }
            >
                { isSelected ? (
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                ) : (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                ) }
            </div>
        </div>
    );
};

export default SinglePlugin;

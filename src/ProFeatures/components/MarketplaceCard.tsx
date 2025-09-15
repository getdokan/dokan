// Interface for marketplace items
interface Marketplace {
    name: string;
    country: string;
    flag: string;
    img: string;
    siteLink: string;
}

function MarketplaceCard( { item }: { item: Marketplace } ) {
    return (
        <div
            className="relative bg-white overflow-hidden"
            style={ {
                width: '274.51px',
                height: '251px',
                borderRadius: '4.2px',
                border: '0.92px solid #E5E7EB',
                opacity: 1,
                transform: 'rotate(0deg)',
            } }
        >
            { /* Image Container */ }
            <div
                className="overflow-hidden"
                style={ {
                    width: '273.94px',
                    height: '188.49px',
                    marginLeft: '0.06px',
                    borderTopLeftRadius: '4.19px',
                    borderTopRightRadius: '4.19px',
                    border: '0.35px solid #E5E7EB',
                } }
            >
                <img
                    src={ item.img }
                    alt={ item.name }
                    className="w-full h-full object-cover"
                    draggable={ false }
                />
            </div>

            { /* Content Section */ }
            <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                    <a
                        href={ item.siteLink }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[14px] font-medium text-gray-900 hover:text-purple-600 transition-colors line-clamp-2"
                    >
                        { item.name }
                    </a>
                </div>

                <div className="absolute bottom-4 right-4">
                    <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs"
                        style={ {
                            backgroundColor: 'rgba(124, 58, 237, 0.1)',
                            color: '#7047EB',
                        } }
                    >
                        { item.country } { item.flag }
                    </span>
                </div>
            </div>
        </div>
    );
}

export default MarketplaceCard;

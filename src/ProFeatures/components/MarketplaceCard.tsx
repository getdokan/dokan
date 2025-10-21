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
        <div className="relative bg-white overflow-hidden w-full md:!w-[274.51px] h-auto md:!h-[251px] rounded border border-[#E5E7EB]">
            { /* Image Container */ }
            <div className="overflow-hidden border-b">
                <img
                    src={ item.img }
                    alt={ item.name }
                    className="w-full h-full object-cover"
                    draggable={ false }
                />
            </div>

            { /* Content Section */ }
            <div className="flex justify-between p-4 items-center">
                <a
                    href={ item.siteLink }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[14px] font-medium !text-black hover:text-dokan-primary transition-colors line-clamp-2 underline"
                >
                    { item.name }
                </a>

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[rgba(124,58,237,0.1)] text-black">
                    { item.country } { item.flag }
                </span>
            </div>
        </div>
    );
}

export default MarketplaceCard;

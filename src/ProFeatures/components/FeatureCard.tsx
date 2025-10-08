function FeatureCard( {
    title,
    description,
    image,
}: {
    title: string;
    description: string;
    image: string;
} ) {
    return (
        <div className="min-w-[258px] max-w-[258px] bg-white rounded-md border flex-shrink-0 overflow-hidden flex flex-col">
            <div className="w-full h-[140px] flex items-center justify-center">
                <img
                    src={ image }
                    alt={ title }
                    className="object-contain w-full h-full"
                    draggable={ false }
                />
            </div>
            <div className="p-5 flex flex-col flex-1">
                <h4 className="mb-2 font-bold text-[18px] leading-[130%] tracking-[0%]">
                    { title }
                </h4>
                <p className="text-sm text-gray-600">{ description }</p>
            </div>
        </div>
    );
}

export default FeatureCard;

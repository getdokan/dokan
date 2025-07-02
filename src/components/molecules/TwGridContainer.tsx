const GridCard = ( { title, items } ) => {
    return (
        <div className="@container bg-white rounded-lg p-4 shadow-lg">
            <h2 className="text-lg font-bold mb-3 text-gray-800">{ title }</h2>
            <div className="grid grid-cols-1 @sm:grid-cols-2 @md:grid-cols-3 @lg:grid-cols-4 gap-3 @md:gap-4">
                { items.map( ( item, index ) => (
                    <div
                        key={ index }
                        className="bg-gradient-to-br from-blue-500 to-purple-600 text-white p-3 rounded-lg text-center hover:scale-105 transition-transform"
                    >
                        <h3 className="font-semibold text-sm">{ item.name }</h3>
                        <p className="text-xs opacity-90 mt-1">{ item.desc }</p>
                    </div>
                ) ) }
            </div>
        </div>
    );
};

export default function TwGridContainer() {
    const products = [
        { name: 'Product A', desc: 'Premium' },
        { name: 'Product B', desc: 'Popular' },
        { name: 'Product C', desc: 'New' },
        { name: 'Product D', desc: 'Sale' },
        { name: 'Product E', desc: 'Featured' },
        { name: 'Product F', desc: 'Limited' },
    ];

    const widgets = [
        { name: 'Stats', desc: 'Analytics' },
        { name: 'Tasks', desc: 'To-do' },
        { name: 'Notes', desc: 'Quick' },
    ];

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
                Grid + Container Queries
            </h1>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
                { /* Main content - 2 columns */ }
                <div className="lg:col-span-2 space-y-6">
                    <GridCard title="Main Products" items={ products } />
                    <GridCard
                        title="More Items"
                        items={ products.slice( 0, 4 ) }
                    />
                </div>

                { /* Sidebar - 1 column */ }
                <div>
                    <GridCard title="Sidebar Widgets" items={ widgets } />
                </div>
            </div>

            { /* Info */ }
            <div className="max-w-6xl mx-auto mt-6 bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                    <strong>Magic:</strong> Same component, different layouts!
                    Main area shows 3-4 columns, sidebar shows 1-2 columns based
                    on container size.
                </p>
            </div>
        </div>
    );
}

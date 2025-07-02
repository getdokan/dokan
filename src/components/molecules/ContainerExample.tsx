const CardGrid = ( { title, items } ) => {
    return (
        <div
            style={ {
                containerType: 'inline-size',
                background: 'white',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                marginBottom: '20px',
            } }
        >
            <h2 style={ { marginBottom: '15px', color: '#2c3e50' } }>
                { title }
            </h2>
            <div className="responsive-grid">
                { items.map( ( item, index ) => (
                    <div key={ index } className="card">
                        <h3>{ item.name }</h3>
                        <p>{ item.description }</p>
                    </div>
                ) ) }
            </div>

            <style jsx>{ `
                .responsive-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 16px;
                }

                @container (min-width: 300px) {
                    .responsive-grid {
                        grid-template-columns: repeat( 2, 1fr );
                    }
                }

                @container (min-width: 500px) {
                    .responsive-grid {
                        grid-template-columns: repeat( 3, 1fr );
                    }
                }

                @container (min-width: 700px) {
                    .responsive-grid {
                        grid-template-columns: repeat( 4, 1fr );
                    }
                }

                .card {
                    background: linear-gradient(
                        135deg,
                        #667eea 0%,
                        #764ba2 100%
                    );
                    color: white;
                    padding: 20px;
                    border-radius: 8px;
                    text-align: center;
                    transition: transform 0.2s ease;
                }

                .card:hover {
                    transform: translateY( -2px );
                }

                .card h3 {
                    margin: 0 0 8px 0;
                    font-size: 1.1em;
                }

                .card p {
                    margin: 0;
                    opacity: 0.9;
                    font-size: 0.9em;
                }
            ` }</style>
        </div>
    );
};

export default function ContainerExample() {
    const products = [
        { name: 'Product A', description: 'Premium quality' },
        { name: 'Product B', description: 'Best seller' },
        { name: 'Product C', description: 'New arrival' },
        { name: 'Product D', description: 'Limited edition' },
        { name: 'Product E', description: 'Customer favorite' },
        { name: 'Product F', description: 'Special offer' },
    ];

    const widgets = [
        { name: 'Widget A', description: 'Compact view' },
        { name: 'Widget B', description: 'Auto-adapts' },
        { name: 'Widget C', description: 'Smart layout' },
        { name: 'Widget D', description: 'Responsive' },
    ];

    return (
        <div
            style={ {
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px',
                fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                background: '#f5f7fa',
                minHeight: '100vh',
            } }
        >
            <h1
                style={ {
                    textAlign: 'center',
                    marginBottom: '30px',
                    color: '#2c3e50',
                } }
            >
                React + Container Queries + Grid
            </h1>

            <div
                style={ {
                    display: 'grid',
                    gridTemplateColumns: '1fr 300px',
                    gap: '20px',
                    '@media (max-width: 768px)': {
                        gridTemplateColumns: '1fr',
                    },
                } }
            >
                <CardGrid title="Main Content" items={ products } />
                <CardGrid title="Sidebar" items={ widgets } />
            </div>

            <div
                style={ {
                    background: '#e8f4fd',
                    borderLeft: '4px solid #3498db',
                    padding: '20px',
                    borderRadius: '0 8px 8px 0',
                } }
            >
                <h3 style={ { color: '#2980b9', margin: '0 0 10px 0' } }>
                    💡 How it works
                </h3>
                <p style={ { margin: 0, color: '#2c3e50' } }>
                    Each CardGrid responds to its own container size using{ ' ' }
                    <code>containerType: 'inline-size'</code>
                    and <code>@container</code> queries. Same component,
                    different layouts!
                </p>
            </div>
        </div>
    );
}

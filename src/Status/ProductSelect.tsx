import { useState } from '@wordpress/element';
import { Package } from 'lucide-react';
import { ProductAsyncSelect } from '../components';

interface ProductOption {
    value: number;
    label: string;
    raw?: any;
}

function ProductSelect() {
    const [ value, setValue ] = useState< ProductOption | null >( null );

    // No longer need to control options/loading/hasMore from consumer

    return (
        <div style={ { padding: 16, maxWidth: 360 } }>
            <h2>Product search</h2>
            <ProductAsyncSelect
                value={ value }
                onChange={ ( v: any ) => setValue( v ) }
                placeholder="Search products..."
                isClearable
                leftIcon={ <Package size={ 16 } /> }
                defaultOptions
            />

            { value ? (
                <div style={ { marginTop: 12, fontSize: 12, color: '#555' } }>
                    Selected: { value.label } (ID: { value.value })
                </div>
            ) : null }
        </div>
    );
}

export default ProductSelect;

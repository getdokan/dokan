import { useState } from '@wordpress/element';
import { Home } from 'lucide-react';
import { VendorAsyncSelect } from '../components';

interface StoreOption {
    value: number;
    label: string;
    raw?: any;
}

function VendorSelect() {
    const [ value, setValue ] = useState< StoreOption | null >( null );

    return (
        <div style={ { padding: 16, maxWidth: 360 } }>
            <h2>Vendor search</h2>
            <VendorAsyncSelect
                value={ value }
                onChange={ ( v: any ) => setValue( v ) }
                placeholder="Search vendors..."
                isClearable
                leftIcon={ <Home size={ 16 } /> }
            />

            { value ? (
                <div style={ { marginTop: 12, fontSize: 12, color: '#555' } }>
                    Selected: { value.label } (ID: { value.value })
                </div>
            ) : null }
        </div>
    );
}

export default VendorSelect;

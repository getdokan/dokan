import { useState } from '@wordpress/element';
import { BadgeDollarSign, Home, Search, Package, Flame } from "lucide-react";
import { SimpleInput } from '@getdokan/dokan-ui';
import {
    AsyncSelect,
    Select,
    WpDateTimePicker,
    OrderAsyncSelect,
    CouponAsyncSelect,
    ProductAsyncSelect,
    VendorAsyncSelect,
} from '../components';
import SearchInput from '../components/SearchInput';
import WcDateRangePicker from '../components/WcDateRangePicker';

const options = [
    { value: 'all', label: 'All Vendor' },
    { value: 'store-king', label: 'Store King' },
    { value: 'grocery-shop', label: 'Grocery Shop' },
    { value: 'medicine-corner', label: 'Medicine Corner' },
    { value: 'craft-zone', label: 'Craft Zone' },
];

interface StoreOption {
    value: number;
    label: string;
    raw?: any;
}

interface ProductOption {
    value: number;
    label: string;
    raw?: any;
}

function Test() {
    const [ value, setValue ] = useState( options[ 1 ] );
    const [ data1, setData1 ] = useState( '' );
    const [ orderValue, setOrderValue ] = useState< any >( null );

    const [ after, setAfter ] = useState( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusInput, setFocusInput ] = useState( 'startDate' );
    const [ products, setProducts ] = useState< ProductOption | null >( null );
    const [ vendorsData, setVendorsData ] = useState< StoreOption | null >(
        null
    );

    return (
        <div>
            <div className="flex flex-row gap-2">
                <AsyncSelect
                    options={ options }
                    value={ value }
                    onChange={ ( v: any ) => setValue( v ) }
                    placeholder="Select vendor"
                    leftIcon={ <Home size={ 16 } /> }
                />

                <Select
                    options={ options }
                    value={ value }
                    onChange={ ( v: any ) => setValue( v ) }
                    placeholder="Select vendor"
                    isLoading={ true }
                    leftIcon={ <Flame size={ 16 } /> }
                />

                <SimpleInput
                    value={ data1 }
                    input={ {
                        id: 'withdraw-charge',
                        name: 'withdraw-charge',
                        type: 'text',
                        placeholder: 'Write',
                        disabled: false,
                    } }
                    onChange={ ( e ) => {
                        setData1( e.target.value );
                    } }
                />

                <SearchInput
                    value={ data1 }
                    onChange={ ( val: string ) => setData1( val ) }
                    input={ {
                        id: 'sea',
                        name: 'sea',
                        type: 'text',
                        placeholder: 'vendors',
                        disabled: false,
                    } }
                    leftIcon={ <Search size={ 16 } /> }
                />

                <ProductAsyncSelect
                    value={ products }
                    onChange={ ( v: any ) => setProducts( v ) }
                    placeholder="products"
                    isClearable
                    leftIcon={ <Package size={ 16 } /> }
                    defaultOptions
                />

                <VendorAsyncSelect
                    value={ vendorsData }
                    onChange={ ( v: any ) => setVendorsData( v ) }
                    placeholder="vendors"
                    isClearable
                    leftIcon={ <Home size={ 16 } /> }
                    isMulti={ true }
                />

                <OrderAsyncSelect
                    value={ orderValue }
                    onChange={ ( opt: any ) => setOrderValue( opt ) }
                    placeholder="Select order"
                    isClearable
                    leftIcon={ <BadgeDollarSign size={ 16 } /> }
                />

                <CouponAsyncSelect
                    placeholder="coupon"
                    isClearable
                    onChange={ ( opt: any ) =>
                        console.log( 'coupon selected', opt )
                    }
                    leftIcon={ <BadgeDollarSign size={ 16 } /> }
                />
            </div>

            <div style={ { width: 320 } }>
                <WpDateTimePicker
                    currentDate={ data1 }
                    onChange={ ( val: any ) => setData1( val as string ) }
                >
                    <input
                        type="text"
                        value={ data1 }
                        className="border rounded px-3 py-1.5 w-full"
                        onChange={ () => {} }
                        placeholder="Select date & time"
                        readOnly
                    />
                </WpDateTimePicker>
            </div>

            <div style={ { width: 500 } }>
                <WcDateRangePicker
                    after={ after }
                    afterText={ afterText }
                    before={ before }
                    beforeText={ beforeText }
                    onUpdate={ ( update ) => {
                        if ( update.after ) {
                            setAfter( update.after );
                        }

                        if ( update.afterText ) {
                            setAfterText( update.afterText );
                        }

                        if ( update.before ) {
                            setBefore( update.before );
                        }

                        if ( update.beforeText ) {
                            setBeforeText( update.beforeText );
                        }

                        if ( update.focusedInput ) {
                            setFocusInput( update.focusedInput );

                            if ( update.focusedInput === 'endDate' && after ) {
                                setBefore( '' );
                                setBeforeText( '' );
                            }
                        }
                    } }
                    shortDateFormat="MM/DD/YYYY"
                    focusedInput={ focusInput }
                    isInvalidDate={ () => false }
                    wrapperClassName="w-full"
                    pickerToggleClassName="block"
                    wpPopoverClassName="dokan-layout"
                    popoverBodyClassName="p-4 w-auto text-sm/6"
                    onClear={ () => {
                        setAfter( '' );
                        setAfterText( '' );
                        setBefore( '' );
                        setBeforeText( '' );
                    } }
                    onOk={ () => {
                        // Handle apply action here if you need to
                    } }
                >
                    <input
                        type="text"
                        value={ `${ after } - ${ before }` }
                        className="border rounded px-3 py-1.5 w-full"
                        onChange={ () => {} }
                        placeholder="Select date range"
                        readOnly
                    />
                </WcDateRangePicker>
            </div>
        </div>
    );
}

export default Test;

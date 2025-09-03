import { useState } from '@wordpress/element';
import { BadgeDollarSign, Home, Search } from "lucide-react";
import {
    AsyncSearchableSelect,
    SearchableSelect,
    SimpleInput,
    ReactSelect,
} from '@getdokan/dokan-ui';
import { DokanSelect, DokanAsyncSelect, WpDateTimePicker, OrderAsyncSelect, CouponAsyncSelect } from '../components';
import SearchInput from '../components/SearchInput';
import { twMerge } from "tailwind-merge";
import VendorSelect from "./VendorSelect";
import ProductSelect from "./ProductSelect";
import WcDateRangePicker from "../components/WcDateRangePicker";

const options = [
    { value: 'all', label: 'All Vendor' },
    { value: 'store-king', label: 'Store King' },
    { value: 'grocery-shop', label: 'Grocery Shop' },
    { value: 'medicine-corner', label: 'Medicine Corner' },
    { value: 'craft-zone', label: 'Craft Zone' },
];

function Test() {
    const [ value, setValue ] = useState( options[ 1 ] );
    const [ data1, setData1 ] = useState( '' );
    const [ orderValue, setOrderValue ] = useState<any>( null );
    const { components } = ReactSelect;

    const [ after, setAfter ] = useState( '' );
    const [ afterText, setAfterText ] = useState( '' );
    const [ before, setBefore ] = useState( '' );
    const [ beforeText, setBeforeText ] = useState( '' );
    const [ focusInput, setFocusInput ] = useState( 'startDate' );

    const Control = ( props: any ) => {
        const { children, selectProps } = props;
        return (
            <components.Control { ...props }>
                <span
                    style={ {
                        display: 'flex',
                        alignItems: 'center',
                        marginLeft: 8,
                        color: 'red',
                    } }
                >
                    🔥
                </span>

                <div
                    style={ {
                        marginLeft: selectProps.leftIcon ? 6 : 0,
                        flex: 1,
                        display: 'flex',
                    } }
                >
                    { children }
                </div>
            </components.Control>
        );
    };

    const styles = {
        control: ( base: any, state: any ) => ( {
            ...base,
            borderRadius: '0.40rem',
            minHeight: '2.5rem',
            boxShadow: 'none',
            marginTop: -1,
        } ),
        placeholder: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        singleValue: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
        } ),
        input: ( base: any ) => ( {
            ...base,
            fontSize: 14,
            lineHeight: '22px',
            marginTop: 1,
            marginBottom: 1,
        } ),
        valueContainer: ( base: any ) => ( { ...base, paddingLeft: 4 } ),
        indicatorsContainer: ( base: any ) => ( {
            ...base,
            cursor: 'pointer',
        } ),
        menuList: ( base: any ) => ( {
            ...base,
            cursor: 'default',
        } ),
        option: ( base: any, state: any ) => {
            return {
                ...base,
                paddingTop: 10,
                paddingBottom: 10,
                cursor: 'pointer',
                '&:active': { backgroundColor: 'rgba(124,58,237,0.12)' },
            };
        },
    } as const;

    return (
        <div className="flex flex-col gap-2 w-full h-screen p-6">
            <div style={ { width: 280 } }>
                <h3>my component</h3>
                <DokanSelect
                    options={ options }
                    value={ value }
                    onChange={ ( v: any ) => setValue( v ) }
                    placeholder="Select vendor"
                    leftIcon={ <Home size={ 16 } /> }
                    isClearable
                    components={ { Control } }
                />
            </div>

            {/*<div style={ { width: 280 } }>*/}
            {/*    <DokanSelect*/}
            {/*        options={ options }*/}
            {/*        value={ value }*/}
            {/*        onChange={ ( v: any ) => setValue( v ) }*/}
            {/*        placeholder="Select vendor"*/}
            {/*        isLoading={ true }*/}
            {/*    />*/}
            {/*</div>*/}

            <div style={ { width: 280 } }>
                <h3>Dokan ui</h3>
                <DokanAsyncSelect
                    options={ options }
                    value={ value }
                    onChange={ ( v: any ) => setValue( v ) }
                    placeholder="Select vendor"
                    isLoading={ true }
                    leftIcon={ <Home size={ 16 } /> }
                />
            </div>

            <div style={ { width: 280 } }>
                <h3>Dokan ui</h3>
                <SearchableSelect
                    options={ options }
                    value={ value }
                    onChange={ ( v: any ) => setValue( v ) }
                    placeholder="Select vendor"
                    isLoading={ true }
                    components={ { Control } }
                />
            </div>

            {/*<div style={ { width: 280 } }>*/}
            {/*    <div className="bg-white">*/}
            {/*        <SimpleInput*/}
            {/*            value={ data1 }*/}
            {/*            input={ {*/}
            {/*                id: 'withdraw-charge',*/}
            {/*                name: 'withdraw-charge',*/}
            {/*                type: 'text',*/}
            {/*                placeholder: 'Write',*/}
            {/*                disabled: false,*/}
            {/*            } }*/}
            {/*            onChange={ ( e ) => {*/}
            {/*                setData1( e.target.value );*/}
            {/*            } }*/}
            {/*            icon={ () => <Home size={ 16 } /> }*/}
            {/*        />*/}
            {/*    </div>*/}
            {/*</div>*/}

            {/*<div style={ { width: 280 } }>*/}
            {/*    <DokanSelect*/}
            {/*        options={ options }*/}
            {/*        value={ value }*/}
            {/*        onChange={ ( v: any ) => setValue( v ) }*/}
            {/*        placeholder="Select vendor"*/}
            {/*        leftIcon={ <Home size={ 16 } /> }*/}
            {/*        isMulti={ true }*/}
            {/*        isLoading={ true }*/}
            {/*    />*/}
            {/*</div>*/}

            <div style={ { width: 280 } }>
                <h3>dokan ui</h3>
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
            </div>

            <div style={ { width: 280 } }>
                <h3>dokan ui</h3>
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
            </div>

            <div style={ { width: 280 } }>
                <h3>SearchInput</h3>
                <SearchInput
                    value={ data1 }
                    onChange={ ( val: string ) => setData1( val ) }
                    input={ {
                        id: 'sea',
                        name: 'sea',
                        type: 'text',
                        placeholder: 'Search vendors',
                        disabled: false,
                    } }
                    leftIcon={ <Search size={ 16 } /> }
                />
                <div className="text-xs mt-2">Current: { data1 }</div>
            </div>

            <div style={ { width: 500 } }>
                <VendorSelect />
            </div>

            <div style={ { width: 500 } }>
                <ProductSelect />
            </div>

            <div style={ { width: 500 } }>
                <h3>Order select</h3>
                <OrderAsyncSelect
                    value={ orderValue }
                    onChange={ (opt: any) => setOrderValue( opt ) }
                    placeholder="Select order"
                    isClearable
                />
                <pre className="text-xs mt-2">{ JSON.stringify( orderValue, null, 2 ) }</pre>
            </div>

            <div style={ { width: 500 } }>
                <h3>Coupon select</h3>
                <CouponAsyncSelect
                    placeholder="Select coupon"
                    isClearable
                    onChange={ (opt: any) => console.log('coupon selected', opt) }
                    leftIcon={<BadgeDollarSign size={16} />}
                />
            </div>

            <div style={ { width: 320 } }>
                <h3>DateTime picker</h3>
                {/* WordPress DateTimePicker wrapped by Dokan */}
                { /* It expects a string value (ISO-like) in many WP versions; default to empty when cleared */ }
                <WpDateTimePicker
                    currentDate={ data1 }
                    onChange={ (val: any) => setData1( val as string ) }
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

import React, { useState } from '@wordpress/element';
import TextField from '../fields/TextField';

// Icon components
const SearchIcon = () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path
            d="M8.25 14.25C11.5637 14.25 14.25 11.5637 14.25 8.25C14.25 4.93629 11.5637 2.25 8.25 2.25C4.93629 2.25 2.25 4.93629 2.25 8.25C2.25 11.5637 4.93629 14.25 8.25 14.25Z"
            stroke="#828282"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M15.75 15.75L12.75 12.75"
            stroke="#828282"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const EmailIcon = () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <rect
            x="3"
            y="4.5"
            width="12"
            height="9"
            rx="1"
            stroke="#828282"
            strokeWidth="1.5"
        />
        <path
            d="M3 5.25L9 9.75L15 5.25"
            stroke="#828282"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const DollarIcon = () => (
    <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
        <path
            d="M9 1.5V16.5"
            stroke="#828282"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path
            d="M12.75 4.5H7.125C6.50625 4.5 5.91274 4.74693 5.47008 5.18008C5.02743 5.61324 4.78125 6.20625 4.78125 6.825C4.78125 7.44375 5.02743 8.03676 5.47008 8.46992C5.91274 8.90307 6.50625 9.15 7.125 9.15H10.875C11.4938 9.15 12.0873 9.39693 12.5299 9.83008C12.9726 10.2632 13.2188 10.8562 13.2188 11.475C13.2188 12.0938 12.9726 12.6868 12.5299 13.1199C12.0873 13.5531 11.4938 13.8 10.875 13.8H4.5"
            stroke="#828282"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

const TextFieldsVariations = () => {
    const [ values, setValues ] = useState( {
        default: 'Default input',
        disabled: 'Disabled input',
        error: 'Error input',
        prefix: 'Prefix input',
        postfix: 'Postfix input',
        prefixPostfix: 'Prefix and postfix',
        copyable: 'Click the copy button',
        password: 'mysecretpassword',
        searchPrefix: 'Search something',
        emailPrefix: 'example@email.com',
        pricePrefix: '99.99',
        errorWithPrefix: 'Invalid email',
        empty: '',
        copyPrefix: 'Copy with prefix',
        passwordPrefix: 'secret123',
    } );

    const handleChange = ( field: string, value: string ) => {
        setValues( ( prev ) => ( { ...prev, [ field ]: value } ) );
    };

    return (
        <div className="p-6 flex flex-col gap-8">
            <h1 className="text-2xl font-bold">TextField Variations</h1>

            { /* Basic variations */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Default</h2>
                    <TextField
                        value={ values.default }
                        onChange={ ( val ) => handleChange( 'default', val ) }
                        placeholder="Type something"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Disabled</h2>
                    <TextField
                        value={ values.disabled }
                        onChange={ ( val ) => handleChange( 'disabled', val ) }
                        placeholder="Disabled input"
                        disabled={ true }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">With Error</h2>
                    <TextField
                        value={ values.error }
                        onChange={ ( val ) => handleChange( 'error', val ) }
                        placeholder="Input with error"
                        error="This field has an error"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Empty</h2>
                    <TextField
                        value={ values.empty }
                        onChange={ ( val ) => handleChange( 'empty', val ) }
                        placeholder="Placeholder text"
                    />
                </div>
            </div>

            { /* Prefix and Postfix variations */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">With Prefix</h2>
                    <TextField
                        value={ values.prefix }
                        onChange={ ( val ) => handleChange( 'prefix', val ) }
                        placeholder="With prefix"
                        prefix={ <span className="text-gray-500">@</span> }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">With Postfix</h2>
                    <TextField
                        value={ values.postfix }
                        onChange={ ( val ) => handleChange( 'postfix', val ) }
                        placeholder="With postfix"
                        postfix={ <span className="text-gray-500">.com</span> }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">
                        With Prefix and Postfix
                    </h2>
                    <TextField
                        value={ values.prefixPostfix }
                        onChange={ ( val ) =>
                            handleChange( 'prefixPostfix', val )
                        }
                        placeholder="With prefix and postfix"
                        prefix={ <span className="text-gray-500">@</span> }
                        postfix={ <span className="text-gray-500">.com</span> }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">
                        With Error and Prefix
                    </h2>
                    <TextField
                        value={ values.errorWithPrefix }
                        onChange={ ( val ) =>
                            handleChange( 'errorWithPrefix', val )
                        }
                        placeholder="Error with prefix"
                        prefix={ <EmailIcon /> }
                        error="Invalid email address"
                    />
                </div>
            </div>

            { /* Special variations */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Copyable</h2>
                    <TextField
                        value={ values.copyable }
                        onChange={ ( val ) => handleChange( 'copyable', val ) }
                        placeholder="Copyable text"
                        copyable={ true }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Password</h2>
                    <TextField
                        value={ values.password }
                        onChange={ ( val ) => handleChange( 'password', val ) }
                        placeholder="Password"
                        password={ true }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">
                        Copyable with Prefix
                    </h2>
                    <TextField
                        value={ values.copyPrefix }
                        onChange={ ( val ) =>
                            handleChange( 'copyPrefix', val )
                        }
                        placeholder="Copyable with prefix"
                        copyable={ true }
                        prefix={ <span className="text-gray-500">ID:</span> }
                        postfix={ <span className="text-gray-500">.com</span> }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">
                        Password with Prefix
                    </h2>
                    <TextField
                        value={ values.passwordPrefix }
                        onChange={ ( val ) =>
                            handleChange( 'passwordPrefix', val )
                        }
                        placeholder="Password with prefix"
                        password={ true }
                        prefix={ <span className="text-gray-500">🔑</span> }
                    />
                </div>
            </div>

            { /* Icon prefix variations */ }
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Search Input</h2>
                    <TextField
                        value={ values.searchPrefix }
                        onChange={ ( val ) =>
                            handleChange( 'searchPrefix', val )
                        }
                        placeholder="Search..."
                        prefix={ <SearchIcon /> }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Email Input</h2>
                    <TextField
                        value={ values.emailPrefix }
                        onChange={ ( val ) =>
                            handleChange( 'emailPrefix', val )
                        }
                        placeholder="Email address"
                        prefix={ <EmailIcon /> }
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <h2 className="text-lg font-medium">Price Input</h2>
                    <TextField
                        value={ values.pricePrefix }
                        onChange={ ( val ) =>
                            handleChange( 'pricePrefix', val )
                        }
                        placeholder="0.00"
                        prefix={ <DollarIcon /> }
                    />
                </div>
            </div>
        </div>
    );
};

export default TextFieldsVariations;

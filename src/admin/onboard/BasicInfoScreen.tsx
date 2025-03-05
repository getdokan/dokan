import { __ } from "@wordpress/i18n";
import { useState } from '@wordpress/element';
import { SimpleInput, Button } from '@getdokan/dokan-ui';
import Logo from "@dokan/admin/onboard/Logo";

const BasicInfoScreen = ({ onNext }) => {
    const [ storeUrl, setStoreUrl ] = useState(
        'marketplace.dokan.com/store/name'
    );
    const [ shareDiagnostics, setShareDiagnostics ] = useState(true);

    return (
        <div className={`min-h-screen flex items-center justify-center`}>
            <div className='p-8 md:p-10 max-w-4xl'>
                <div className='mb-8'>
                    <Logo />
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-10">
                    { __( 'Basic Information', 'dokan' ) }
                </h1>

                <div className='space-y-8'>
                    <div>
                        <label className='block text-lg font-medium mb-4'>
                            { __('Choose how vendor store URLs will appear', 'dokan' ) }
                        </label>
                        {/*<input*/}
                        {/*    type='text'*/}
                        {/*    value={storeUrl}*/}
                        {/*    onChange={(e) => setStoreUrl(e.target.value)}*/}
                        {/*    className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none'*/}
                        {/*/>*/}
                        <SimpleInput
                            value={ storeUrl }
                            addOnLeft={
                                <span className="inline-flex items-center bg-gray-50 px-3 text-gray-900 sm:text-sm rouned-bl absolute left-0 top-0 h-full rounded-bl rounded-tl w-max">
                                    https://dokan-dev.test/
                                </span>
                            }
                            addOnRight={
                                <span className="inline-flex items-center bg-gray-50 px-3 text-gray-900 sm:text-sm rouned-bl absolute right-0 top-0 h-full rounded-bl rounded-tl">
                                    store
                                </span>
                            }
                            input={
                                {
                                    id: "login-storename",
                                    name: "storename",
                                    type: "text",
                                    autoComplete: "off",
                                    placeholder: "daraz"
                                }
                            }
                            onChange={ (e) => setStoreUrl( e.target.value ) }
                            className="w-[80%] md:w-full pl-[12rem] block"
                        />
                        <div className='flex items-center mt-2 text-sm text-gray-500'>
                            <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 mr-1' viewBox='0 0 20 20' fill='currentColor'>
                                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z' clipRule='evenodd' />
                            </svg>
                            <span>Vendor Store URL will be (<span className='text-indigo-600'>https://marketplace.dokan.com/store/name</span>)</span>
                        </div>
                    </div>

                    <div className='flex items-start space-x-4'>
                        <div className='flex-shrink-0 pt-0.5'>
                            {/*<div*/}
                            {/*    className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${*/}
                            {/*        shareDiagnostics ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'*/}
                            {/*    }`}*/}
                            {/*    onClick={ () => setShareDiagnostics( !shareDiagnostics ) }*/}
                            {/*>*/}
                            {/*    { shareDiagnostics && <span className='dashicons dashicons-yes-alt h-3 w-3 text-white'></span> }*/}
                            {/*</div>*/}
                            <input
                                type="checkbox"
                                defaultChecked={ shareDiagnostics }
                                aria-describedby="comments-description"
                                className='border border-gray-300 rounded'
                                onChange={(e) => shareDiagnostics(!shareDiagnostics)}
                            />
                        </div>
                        <div>
                            <h3 className='text-base font-medium'>
                                {__('Help Us Tailor Your Marketplace', 'dokan')}
                            </h3>
                            <p className='text-sm text-gray-500'>
                                {__('Allow Dokan Multivendor Marketplace to collect non-sensitive diagnostic data and usage information.', 'dokan')}
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex justify-end mt-12'>
                    <Button onClick={ onNext } className='bg-dokan-btn hover:bg-dokan-btn-hover text-white py-3 px-8 flex items-center rounded-md'>
                        { __( 'Next', 'dokan' ) }
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 ml-1' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                        </svg>
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default BasicInfoScreen;

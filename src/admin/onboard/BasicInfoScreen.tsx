import {useState} from '@wordpress/element';
import {SimpleInput} from '@getdokan/dokan-ui';

const BasicInfoScreen = () => {
    const [storeUrl, setStoreUrl] = useState(
        'marketplace.dokan.com/store/name'
    );
    const [shareDiagnostics, setShareDiagnostics] = useState(true);

    return (
            <div className='p-8 md:p-10'>
                <div className='mb-8'>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-10">
                    Basic Information
                </h1>

                <div className='space-y-8'>
                    <div>
                        <label className='block text-lg font-medium mb-4'>
                            Choose how vendor store URLs will appear
                        </label>
                        {/*<input*/}
                        {/*    type='text'*/}
                        {/*    value={storeUrl}*/}
                        {/*    onChange={(e) => setStoreUrl(e.target.value)}*/}
                        {/*    className='w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none'*/}
                        {/*/>*/}
                        <SimpleInput
                            value={storeUrl}
                            addOnLeft={"https://dokan-dev.test/"}
                            addOnRight={"store"}
                            input={
                                {
                                    id: "login-storename",
                                    name: "storename",
                                    type: "text",
                                    autoComplete: "off",
                                    placeholder: "daraz"
                                }
                            }
                            onChange={(e) => setStoreUrl(e.target.value)}
                            className="w-[80%] md:w-[50%] pl-[12rem] "
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
                            <div
                                className={`w-5 h-5 rounded border flex items-center justify-center cursor-pointer ${
                                    shareDiagnostics ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300'
                                }`}
                                onClick={() => setShareDiagnostics(!shareDiagnostics)}
                            >
                                {shareDiagnostics && <span className='dashicons dashicons-yes-alt h-3 w-3 text-white'></span>}
                            </div>
                        </div>
                        <div>
                            <h3 className='text-base font-medium'>Help Us Tailor Your Marketplace</h3>
                            <p className='text-sm text-gray-500'>
                                Allow Dokan Multivendor Marketplace to collect non-sensitive diagnostic data and usage information.
                            </p>
                        </div>
                    </div>
                </div>

                <div className='flex justify-end mt-12'>
                    <button className='bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg flex items-center transition-colors'>
                        Next
                        <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 ml-1' viewBox='0 0 20 20' fill='currentColor'>
                            <path fillRule='evenodd' d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z' clipRule='evenodd' />
                        </svg>
                    </button>
                </div>
            </div>
    )
}

export default BasicInfoScreen;

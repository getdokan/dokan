import { useState, RawHTML } from '@wordpress/element';
import { Modal } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { generateAiContent } from '../utils/api';
import { updateWordPressField } from '../utils/dom';

const DokanAI = ( { field } ) => {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ prompt, setPrompt ] = useState( '' );
    const [ error, setError ] = useState( '' );

    const [ response, setResponse ] = useState( '' );
    const [ responseHistory, setResponseHistory ] = useState< string[] >( [] );
    const [ currentIndex, setCurrentIndex ] = useState( 0 );
    const [ isLoading, setIsLoading ] = useState( false );

    const handleLabelClick = ( event: any ) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen( true );
    };

    const onClose = () => {
        setIsOpen( false );
        setResponse( '' );
        setPrompt( '' );
        setError( '' );
        setResponseHistory( [] );
    };

    const generateContent = async () => {
        setError( '' );
        if ( ! prompt.trim() ) {
            setError( __( 'Please enter a prompt.', 'dokan' ) );
            return;
        }
        setIsLoading( true );
        try {
            const content = await generateAiContent( prompt, field );
            setResponse( content );
            setResponseHistory( ( prevState ) => {
                return [ ...prevState, content ];
            } );
            setCurrentIndex( responseHistory.length );
        } catch ( err ) {
            setError( err.message );
        } finally {
            setIsLoading( false );
        }
    };

    const handlePrevious = () => {
        if ( currentIndex > 0 ) {
            setResponse( responseHistory[ currentIndex - 1 ] );
            setCurrentIndex( currentIndex - 1 );
        }
    };

    const handleNext = () => {
        if ( currentIndex < responseHistory.length - 1 ) {
            setResponse( responseHistory[ currentIndex + 1 ] );
            setCurrentIndex( currentIndex + 1 );
        }
    };

    const insertHandler = () => {
        updateWordPressField( response, field );
        onClose();
    };

    return (
        <>
            <svg
                onClick={ handleLabelClick }
                width="24"
                height="24"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M8.67091 4.01777C8.84169 3.32602 9.82508 3.32602 9.99586 4.01777V4.01777C10.7248 6.97053 13.0303 9.27598 15.9831 10.0049V10.0049C16.6749 10.1757 16.6749 11.1591 15.9831 11.3299V11.3299C13.0303 12.0588 10.7248 14.3642 9.99586 17.317V17.317C9.82508 18.0087 8.84169 18.0087 8.67091 17.317V17.317C7.94194 14.3642 5.63643 12.0588 2.68366 11.3299V11.3299C1.99189 11.1591 1.99189 10.1757 2.68366 10.0049V10.0049C5.63643 9.27598 7.94194 6.97053 8.67091 4.01777V4.01777Z"
                    fill="url(#paint0_linear_231_101)"
                />
                <path
                    d="M15.9535 1.08615C16.0226 0.806151 16.4207 0.806151 16.4898 1.08615V1.08615C16.7848 2.28131 17.718 3.21447 18.9132 3.50951V3.50951C19.1932 3.57863 19.1932 3.97668 18.9132 4.0458V4.0458C17.718 4.34084 16.7848 5.274 16.4898 6.46916V6.46916C16.4207 6.74916 16.0226 6.74916 15.9535 6.46916V6.46916C15.6584 5.274 14.7253 4.34084 13.5301 4.0458V4.0458C13.2501 3.97668 13.2501 3.57863 13.5301 3.50951V3.50951C14.7253 3.21447 15.6584 2.28131 15.9535 1.08615V1.08615Z"
                    fill="url(#paint1_linear_231_101)"
                />
                <defs>
                    <linearGradient
                        id="paint0_linear_231_101"
                        x1="9.33338"
                        y1="1.33435"
                        x2="9.33338"
                        y2="20.0004"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#A875FF" />
                        <stop offset="1" stopColor="#7D60D6" />
                    </linearGradient>
                    <linearGradient
                        id="paint1_linear_231_101"
                        x1="16.2216"
                        y1="0"
                        x2="16.2216"
                        y2="7.55531"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#A875FF" />
                        <stop offset="1" stopColor="#7D60D6" />
                    </linearGradient>
                </defs>
            </svg>
            <Modal
                className="max-w-lg dokan-ai-modal"
                isOpen={ isOpen }
                onClose={ onClose }
            >
                <Modal.Title className="border border-b border-gray-200 border-solid">
                    { field.title }
                </Modal.Title>
                <Modal.Content>
                    { error && (
                        <div className="mb-2 bg-red-100 text-red-700 p-3 rounded-lg text-sm border border-red-300">
                            { error }
                        </div>
                    ) }
                    { response ? (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="text-sm font-medium text-gray-700">
                                    { __( 'Result:', 'dokan' ) }
                                    { ` ${ currentIndex + 1 } / ${
                                        responseHistory.length
                                    }` }
                                </div>
                                { responseHistory.length > 1 && (
                                    <div className="flex">
                                        <svg
                                            onClick={ handlePrevious }
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={ 1.5 }
                                            stroke="currentColor"
                                            className={ `size-6 cursor-pointer ${
                                                currentIndex === 0
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                            }` }
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M15.75 19.5 8.25 12l7.5-7.5"
                                            />
                                        </svg>
                                        <svg
                                            onClick={ handleNext }
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={ 1.5 }
                                            stroke="currentColor"
                                            className={ `size-6 cursor-pointer ${
                                                currentIndex ===
                                                responseHistory.length - 1
                                                    ? 'text-gray-300'
                                                    : 'text-gray-700'
                                            }` }
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="m8.25 4.5 7.5 7.5-7.5 7.5"
                                            />
                                        </svg>
                                    </div>
                                ) }
                            </div>
                            <div className="flex flex-row">
                                <div className="rounded border border-gray-200 bg-gray-50 p-4 max-h-48 overflow-y-auto text-gray-700 text-base shadow-inner">
                                    <RawHTML>{ response }</RawHTML>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            className="w-full p-4 border border-gray-200 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-gray-400 text-base resize-none"
                            value={ prompt }
                            onChange={ ( e ) => setPrompt( e.target.value ) }
                            disabled={ isLoading }
                            placeholder={ __(
                                'Write a tagline or keywords here…',
                                'dokan'
                            ) }
                            rows={ 5 }
                        />
                    ) }
                </Modal.Content>
                <Modal.Footer className="border border-t border-gray-200 border-solid">
                    { response ? (
                        <div className="flex gap-4 justify-center">
                            <button
                                className="dokan-btn dokan-btn-default w-full"
                                type="button"
                                disabled={ isLoading }
                                onClick={ generateContent }
                            >
                                { isLoading
                                    ? __( 'Generating…', 'dokan' )
                                    : __( 'Refine', 'dokan' ) }
                            </button>
                            <button
                                className="dokan-btn dokan-btn-theme w-full"
                                type="button"
                                disabled={ isLoading }
                                onClick={ insertHandler }
                            >
                                { __( 'Insert', 'dokan' ) }
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4 justify-center">
                            <button
                                className="dokan-btn dokan-btn-theme w-full"
                                disabled={ isLoading }
                                onClick={ generateContent }
                            >
                                { isLoading
                                    ? __( 'Generating…', 'dokan' )
                                    : __( 'Generate Text', 'dokan' ) }
                            </button>
                        </div>
                    ) }
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DokanAI;

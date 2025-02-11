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
            <div className="text-dokan-primary">
                <svg
                    role={ 'button' }
                    onClick={ handleLabelClick }
                    width="24"
                    height="24"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <rect width="40" height="40" rx="5" fill="currentColor" />
                    <path
                        d="M18.0064 11.0266C18.2625 9.98897 19.7376 9.98897 19.9938 11.0266V11.0266C21.0872 15.4557 24.5455 18.9139 28.9747 20.0073V20.0073C30.0123 20.2634 30.0123 21.7386 28.9747 21.9947V21.9947C24.5455 23.0881 21.0872 26.5463 19.9938 30.9754V30.9754C19.7376 32.0131 18.2625 32.0131 18.0064 30.9754V30.9754C16.9129 26.5463 13.4546 23.0881 9.02549 21.9947V21.9947C7.98784 21.7386 7.98784 20.2634 9.02549 20.0073V20.0073C13.4546 18.9139 16.9129 15.4557 18.0064 11.0266V11.0266Z"
                        fill="white"
                    />
                    <path
                        d="M28.9309 6.62922C29.0345 6.20923 29.6316 6.20923 29.7353 6.62922V6.62922C30.1779 8.42196 31.5777 9.82171 33.3704 10.2643V10.2643C33.7904 10.3679 33.7904 10.965 33.3704 11.0687V11.0687C31.5777 11.5113 30.1779 12.911 29.7353 14.7037V14.7037C29.6316 15.1237 29.0345 15.1237 28.9309 14.7037V14.7037C28.4883 12.911 27.0885 11.5113 25.2957 11.0687V11.0687C24.8757 10.965 24.8757 10.3679 25.2957 10.2643V10.2643C27.0885 9.82171 28.4883 8.42196 28.9309 6.62922V6.62922Z"
                        fill="white"
                    />
                </svg>
            </div>

            <Modal
                className="max-w-xl dokan-ai-modal"
                isOpen={ isOpen }
                onClose={ onClose }
            >
                <Modal.Title className="border border-b border-gray-200 border-solid">
                    { field.title }
                </Modal.Title>
                <Modal.Content className="min-h-48">
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
                            <div className="rounded border border-solid border-gray-200 bg-gray-50 p-4 max-h-48 overflow-y-auto text-gray-700 text-base shadow-inner">
                                <RawHTML>{ response }</RawHTML>
                            </div>
                        </div>
                    ) : (
                        <textarea
                            className="w-full p-4 border border-solid border-gray-200 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all placeholder-gray-400 text-base resize-none"
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
                        <div className="flex gap-4 justify-end">
                            <button
                                className="dokan-btn dokan-btn-default !px-5"
                                type="button"
                                disabled={ isLoading }
                                onClick={ generateContent }
                            >
                                { isLoading
                                    ? __( 'Generating…', 'dokan' )
                                    : __( 'Refine', 'dokan' ) }
                            </button>
                            <button
                                className="dokan-btn dokan-btn-theme !px-5"
                                type="button"
                                disabled={ isLoading }
                                onClick={ insertHandler }
                            >
                                { __( 'Insert', 'dokan' ) }
                            </button>
                        </div>
                    ) : (
                        <div className="flex gap-4 justify-end">
                            <button
                                className="dokan-btn dokan-btn-theme !px-5"
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

import { useState, RawHTML } from '@wordpress/element';
import { Modal, SimpleInput, TextArea } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { generateAiContent } from '../utils/api';
import { updateWordPressField } from '../utils/dom';

const DokanAI = () => {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ prompt, setPrompt ] = useState(
        'Generate me all the product related details for iPhone 15 pro max'
    );
    const [ error, setError ] = useState( '' );

    const [ response, setResponse ] = useState( {
        title: '',
        short_description: '',
        long_description: '',
    } );

    const [ isLoading, setIsLoading ] = useState( false );

    const handleLabelClick = ( event: any ) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen( true );
    };

    const onClose = () => {
        setIsOpen( false );
        setResponse( {
            title: '',
            short_description: '',
            long_description: '',
        } );
        setPrompt( '' );
        setError( '' );
    };

    const generateContent = async () => {
        setError( '' );
        if ( ! prompt.trim() ) {
            setError( __( 'Please enter a prompt.', 'dokan' ) );
            return;
        }
        setIsLoading( true );
        try {
            const content = await generateAiContent( prompt );
            setResponse( content as any );
        } catch ( err ) {
            setError( err.message );
        } finally {
            setIsLoading( false );
        }
    };

    const insertHandler = () => {
        updateWordPressField( response.title, 'post_title' );
        updateWordPressField( response.short_description, 'post_excerpt' );
        updateWordPressField( response.long_description, 'post_content' );
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
                    { __( 'Craft your product information', 'dokan' ) }
                </Modal.Title>

                <Modal.Content>
                    { error && <div className="text-red-600">{ error }</div> }
                    { response.title ? (
                        <div>
                            <div className="font-semibold mb-2">
                                { __( 'Product Title', 'dokan-lite' ) }
                            </div>
                            <div className="mb-2">
                                <SimpleInput
                                    className="!bg-white !border !border-solid !border-gray-300"
                                    onChange={ ( e ) => {
                                        setResponse( {
                                            ...response,
                                            title: e.target.value,
                                        } );
                                    } }
                                    value={ response.title }
                                />
                            </div>
                            <button
                                type="button"
                                className="dokan-btn dokan-btn-default !px-5"
                            >
                                { __( 'Refine', 'dokan-lite' ) }
                            </button>
                            <div className="font-semibold mt-4">
                                { __( 'Short Description', 'dokan-lite' ) }
                            </div>
                            <div
                                className="mb-2 h-48 border border-solid border-gray-300 rounded p-2.5 overflow-auto"
                                contentEditable={ true }
                                onBlur={ ( e ) => {
                                    setResponse( {
                                        ...response,
                                        // @ts-ignore
                                        short_description: e.target.innerHTML,
                                    } );
                                } }
                                dangerouslySetInnerHTML={ {
                                    __html: response.short_description,
                                } }
                            ></div>
                            <button
                                type="button"
                                className="dokan-btn dokan-btn-default !px-5"
                            >
                                { __( 'Refine', 'dokan-lite' ) }
                            </button>
                            <div className="font-semibold mt-4">
                                { __( 'Long Description', 'dokan-lite' ) }
                            </div>
                            <div
                                className="mb-2 h-48 border border-solid border-gray-300 rounded p-2.5 overflow-auto"
                                contentEditable={ true }
                                onBlur={ ( e ) => {
                                    setResponse( {
                                        ...response,
                                        // @ts-ignore
                                        long_description: e.target.innerHTML,
                                    } );
                                } }
                                dangerouslySetInnerHTML={ {
                                    __html: response.long_description,
                                } }
                            ></div>
                            <button
                                type="button"
                                className="dokan-btn dokan-btn-default !px-5"
                            >
                                { __( 'Refine', 'dokan-lite' ) }
                            </button>
                            <p className="text-sm mt-4 mb-2">
                                { __(
                                    '** If you think the outcome doesn’t match your choice then you can regenerate all again',
                                    'dokan-lite'
                                ) }
                            </p>
                            <button
                                className="dokan-btn dokan-btn-default !px-5"
                                type="button"
                                disabled={ isLoading }
                                onClick={ generateContent }
                            >
                                { __( 'Refine All', 'dokan-lite' ) }
                            </button>
                        </div>
                    ) : (
                        <div>
                            <div className="font-semibold mb-2">
                                { __(
                                    'Generate product information',
                                    'dokan-lite'
                                ) }
                            </div>
                            <p className="text-sm">
                                { __(
                                    'You can generate your product title, short description, long description all at once with this prompt. Type your prompt below',
                                    'dokan-lite'
                                ) }
                            </p>
                            <TextArea
                                className="min-h-48 bg-white"
                                input={ {
                                    id: 'dokan-ai-prompt',
                                    value: prompt,
                                    onChange: ( e ) =>
                                        setPrompt( e.target.value ),
                                    placeholder: __(
                                        'Enter prompt',
                                        'dokan-lite'
                                    ),
                                } }
                            />
                        </div>
                    ) }
                </Modal.Content>
                <Modal.Footer className="border border-t border-gray-200 border-solid">
                    <div className="flex gap-4 justify-end">
                        <button
                            className="dokan-btn dokan-btn-default !px-5"
                            type="button"
                            disabled={ isLoading }
                            onClick={ onClose }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </button>
                        { response.title ? (
                            <button
                                className="dokan-btn dokan-btn-theme !px-5"
                                disabled={ isLoading }
                                onClick={ insertHandler }
                            >
                                { __( 'Insert', 'dokan-lite' ) }
                            </button>
                        ) : (
                            <button
                                className="dokan-btn dokan-btn-theme !px-5"
                                disabled={ isLoading }
                                onClick={ generateContent }
                            >
                                { isLoading
                                    ? __( 'Generating…', 'dokan-lite' )
                                    : __( 'Generate', 'dokan-lite' ) }
                            </button>
                        ) }
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default DokanAI;

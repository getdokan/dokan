import { useState, RawHTML } from '@wordpress/element';
import { Modal, SimpleInput, TextArea } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { generateAiContent } from '../utils/api';
import { updateWordPressField } from '../utils/dom';
import ResponseHistory from './ResponseHistory';

const DokanAI = () => {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ prompt, setPrompt ] = useState( '' );
    const [ error, setError ] = useState( '' );
    const [ regenerateModal, setRegenerateModal ] = useState( false );
    const [ responseHistory, setResponseHistory ] = useState( {
        post_title: [],
        post_excerpt: [],
        post_content: [],
    } );

    const [ historyIndex, setHistoryIndex ] = useState( {
        post_title: 0,
        post_excerpt: 0,
        post_content: 0,
    } );

    const [ isLoading, setIsLoading ] = useState( false );

    const handleLabelClick = ( event: any ) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen( true );
    };

    const onClose = () => {
        setIsOpen( false );
        setPrompt( '' );
        setError( '' );
        setRegenerateModal( false );
        setResponseHistory( {
            post_title: [],
            post_excerpt: [],
            post_content: [],
        } );
        setHistoryIndex( {
            post_title: 0,
            post_excerpt: 0,
            post_content: 0,
        } );
    };

    const generateContent = async () => {
        setError( '' );
        if ( ! prompt.trim() ) {
            setError( __( 'Please enter a prompt.', 'dokan' ) );
            return;
        }
        setIsLoading( true );
        try {
            const content = await generateAiContent( prompt, {
                json_format: 'true',
            } );
            setResponseHistory( {
                post_title: [ content.title ],
                post_excerpt: [ content.short_description ],
                post_content: [ content.long_description ],
            } );
            setHistoryIndex( {
                post_title: 0,
                post_excerpt: 0,
                post_content: 0,
            } );
        } catch ( err ) {
            setError( err.message );
        } finally {
            setIsLoading( false );
        }
    };

    const refineContent = async ( field: string ) => {
        setError( '' );
        const refineField = responseHistory[ field ][ historyIndex[ field ] ];
        if ( ! refineField.trim() ) {
            setError( __( 'Please enter a prompt.', 'dokan' ) );
            return;
        }
        setIsLoading( true );
        try {
            const content = await generateAiContent( refineField, {
                field,
            } );
            setResponseHistory( ( prevState ) => {
                return {
                    ...prevState,
                    [ field ]: [ content, ...prevState[ field ] ],
                };
            } );
            setHistoryIndex( ( prevState ) => {
                return {
                    ...prevState,
                    [ field ]: 0,
                };
            } );
        } catch ( err ) {
            setError( err.message );
        } finally {
            setIsLoading( false );
        }
    };

    const inputHandler = ( value: any, field: string ) => {
        setResponseHistory( ( prevState ) => {
            return {
                ...prevState,
                [ field ]: responseHistory[ field ].map(
                    ( item: string, index: number ) => {
                        if ( index === historyIndex[ field ] ) {
                            return value;
                        }
                        return item;
                    }
                ),
            };
        } );
    };

    const prevHandler = ( field: string ) => {
        if ( historyIndex[ field ] === 0 ) {
            return;
        }
        setHistoryIndex( ( prevState ) => {
            return {
                ...prevState,
                [ field ]: prevState[ field ] - 1,
            };
        } );
    };

    const nextHandler = ( field: string ) => {
        if ( historyIndex[ field ] < responseHistory[ field ].length - 1 ) {
            setHistoryIndex( ( prevState ) => {
                return {
                    ...prevState,
                    [ field ]: prevState[ field ] + 1,
                };
            } );
        }
    };

    const getHistoryLabel = ( field: string ) => {
        const totalHistory = responseHistory[ field ].length;
        if ( totalHistory === 0 ) {
            return '';
        }
        return `${ historyIndex[ field ] + 1 }/${ totalHistory }`;
    };

    const getInputValue = ( field: string ) => {
        return responseHistory[ field ][ historyIndex[ field ] ];
    };

    const insertHandler = ( force = false ) => {
        // get title from post_title field
        const existingTitle = document.querySelector(
            '#post_title'
        ) as HTMLInputElement;

        if ( existingTitle.value && ! force ) {
            setIsOpen( false );
            setRegenerateModal( true );
            return;
        }

        if ( ! responseHistory.post_title.length ) {
            setError( __( 'Invalid input data', 'dokan' ) );
            return;
        }

        updateWordPressField(
            responseHistory.post_title[ historyIndex.post_title ],
            'post_title'
        );
        updateWordPressField(
            responseHistory.post_excerpt[ historyIndex.post_excerpt ],
            'post_excerpt'
        );
        updateWordPressField(
            responseHistory.post_content[ historyIndex.post_content ],
            'post_content'
        );
        onClose();
    };

    return (
        <>
            <div className="text-dokan-primary cursor-pointer text-primary-500">
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
                    { __( 'Craft your product information', 'dokan-lite' ) }
                </Modal.Title>

                <Modal.Content>
                    { error && <div className="text-red-600">{ error }</div> }
                    { responseHistory.post_title.length ? (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <p className="font-semibold m-0">
                                    { __( 'Product Title', 'dokan-lite' ) }
                                </p>
                                <ResponseHistory
                                    history={ getHistoryLabel( 'post_title' ) }
                                    prev={ () => prevHandler( 'post_title' ) }
                                    next={ () => nextHandler( 'post_title' ) }
                                />
                            </div>
                            <div className="mb-2">
                                <SimpleInput
                                    className="!bg-white !border !border-solid !border-gray-300"
                                    onChange={ ( e ) => {
                                        inputHandler(
                                            e.target.value,
                                            'post_title'
                                        );
                                    } }
                                    value={ getInputValue( 'post_title' ) }
                                />
                            </div>
                            <button
                                type="button"
                                onClick={ () => refineContent( 'post_title' ) }
                                disabled={ isLoading }
                                className="dokan-btn dokan-btn-default !px-5"
                            >
                                { __( 'Refine', 'dokan-lite' ) }
                            </button>
                            { /* Short Description Section */ }
                            <div className="mt-4">
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="font-semibold m-0">
                                        { __(
                                            'Short Description',
                                            'dokan-lite'
                                        ) }
                                    </p>
                                    <ResponseHistory
                                        history={ getHistoryLabel(
                                            'post_excerpt'
                                        ) }
                                        prev={ () =>
                                            prevHandler( 'post_excerpt' )
                                        }
                                        next={ () =>
                                            nextHandler( 'post_excerpt' )
                                        }
                                    />
                                </div>
                                <div
                                    className="mb-2 h-48 border border-solid border-gray-300 rounded p-2.5 overflow-auto"
                                    contentEditable={ true }
                                    onBlur={ ( e ) => {
                                        inputHandler(
                                            e.target.innerHTML,
                                            'post_excerpt'
                                        );
                                    } }
                                    dangerouslySetInnerHTML={ {
                                        __html: getInputValue( 'post_excerpt' ),
                                    } }
                                ></div>
                                <button
                                    type="button"
                                    onClick={ () =>
                                        refineContent( 'post_excerpt' )
                                    }
                                    disabled={ isLoading }
                                    className="dokan-btn dokan-btn-default !px-5"
                                >
                                    { __( 'Refine', 'dokan-lite' ) }
                                </button>
                            </div>
                            { /* Long Description Section */ }
                            <div className="mt-4">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold m-0">
                                        { __(
                                            'Long Description',
                                            'dokan-lite'
                                        ) }
                                    </p>
                                    <ResponseHistory
                                        history={ getHistoryLabel(
                                            'post_content'
                                        ) }
                                        prev={ () =>
                                            prevHandler( 'post_content' )
                                        }
                                        next={ () =>
                                            nextHandler( 'post_content' )
                                        }
                                    />
                                </div>
                                <div
                                    className="mb-2 h-48 border border-solid border-gray-300 rounded p-2.5 overflow-auto"
                                    contentEditable={ true }
                                    onBlur={ ( e ) => {
                                        inputHandler(
                                            e.target.innerHTML,
                                            'post_content'
                                        );
                                    } }
                                    dangerouslySetInnerHTML={ {
                                        __html: getInputValue( 'post_content' ),
                                    } }
                                ></div>
                                <button
                                    type="button"
                                    onClick={ () =>
                                        refineContent( 'post_content' )
                                    }
                                    disabled={ isLoading }
                                    className="dokan-btn dokan-btn-default !px-5"
                                >
                                    { __( 'Refine', 'dokan-lite' ) }
                                </button>
                            </div>

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
                                disabled={ isLoading }
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
                        { responseHistory.post_title.length ? (
                            <button
                                className="dokan-btn dokan-btn-theme !px-5"
                                disabled={ isLoading }
                                onClick={ () => insertHandler() }
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
            <Modal
                className="max-w-md dokan-ai-modal"
                isOpen={ regenerateModal }
                onClose={ () => setRegenerateModal( false ) }
            >
                <Modal.Content>
                    <div className="text-center p-10">
                        <div className="text-xl font-semibold mb-4">
                            { __(
                                'Insert Generated Information?',
                                'dokan-lite'
                            ) }
                        </div>
                        <p>
                            { __(
                                'Are you sure you want to insert the generated information? If you insert then your current product information will be updated with the generated content.',
                                'dokan-lite'
                            ) }
                        </p>
                        <div className="mt-4 flex gap-4 justify-center">
                            <button
                                className="dokan-btn dokan-btn-theme !px-5"
                                type="button"
                                onClick={ () => setRegenerateModal( false ) }
                            >
                                { __( 'Cancel', 'dokan-lite' ) }
                            </button>
                            <button
                                className="dokan-btn dokan-btn-default !px-5"
                                type="button"
                                onClick={ () => insertHandler( true ) }
                            >
                                { __( 'Yes, Insert', 'dokan-lite' ) }
                            </button>
                        </div>
                    </div>
                </Modal.Content>
            </Modal>
        </>
    );
};
export default DokanAI;

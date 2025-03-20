import { useEffect, useState } from '@wordpress/element';
import { Modal, SimpleInput, TextArea, Button } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { generateAiContent } from '../utils/api';
import { updateWordPressField } from '../utils/dom';
import ResponseHistory from './ResponseHistory';
import { useMutationObserver } from '../../hooks';

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
    const [ isEditMode, setIsEditMode ] = useState( false );

    const [ historyIndex, setHistoryIndex ] = useState( {
        post_title: 0,
        post_excerpt: 0,
        post_content: 0,
    } );

    const [ isLoading, setIsLoading ] = useState( false );

    const resetIndex = () => {
        setHistoryIndex( {
            post_title: 0,
            post_excerpt: 0,
            post_content: 0,
        } );
    };

    const handleLabelClick = ( event: any ) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen( true );

        // if title exists
        const title = document.querySelector(
            '#post_title'
        ) as HTMLInputElement;
        const postExcerpt = document.querySelector(
            '#post_excerpt'
        ) as HTMLInputElement;
        const postContent = document.querySelector(
            '#post_content'
        ) as HTMLInputElement;

        const previousData = {
            post_title: [],
            post_excerpt: [],
            post_content: [],
        } as any;
        if ( title.value ) {
            previousData.post_title = [ title.value ];
            setPrompt( title.value );
        }
        if ( postExcerpt.value ) {
            previousData.post_excerpt = [ postExcerpt.value ];
        }
        if ( postContent.value ) {
            previousData.post_content = [ postContent.value ];
        }
        setResponseHistory( previousData );
        resetIndex();
    };

    const startOver = () => {
        setPrompt( '' );
        setError( '' );
        setRegenerateModal( false );
        setResponseHistory( {
            post_title: [],
            post_excerpt: [],
            post_content: [],
        } );
        resetIndex();
    };

    const onClose = () => {
        setIsOpen( false );
        startOver();
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
            resetIndex();
        } catch ( err ) {
            setError( err.message );
        } finally {
            setIsLoading( false );
        }
    };

    const refineContent = async ( field: string ) => {
        setError( '' );
        let refineField = responseHistory[ field ][ historyIndex[ field ] ];
        if ( ! refineField.trim() ) {
            setError( __( 'Please enter a prompt.', 'dokan' ) );
            return;
        }

        if ( field !== 'post_title' ) {
            refineField = `${ refineField } \n
            product title is ${
                responseHistory.post_title[ historyIndex.post_title ]
            }`;
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

        if ( ! isEditMode ) {
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

    useMutationObserver(
        document.body,
        ( mutations ) => {
            for ( const mutation of mutations ) {
                if ( mutation.type !== 'childList' ) {
                    continue;
                }
                // @ts-ignore
                for ( const node of mutation.addedNodes ) {
                    if ( node.id !== 'headlessui-portal-root' ) {
                        continue;
                    }

                    node.classList.add( 'dokan-layout' );
                    node.style.display = 'block';
                }
            }
        },
        { childList: true }
    );

    useEffect( () => {
        if ( responseHistory.post_title.length ) {
            setIsEditMode( true );
        } else {
            setIsEditMode( false );
        }
    }, [ responseHistory.post_title ] );

    return (
        <>
            <div className="text-dokan-primary cursor-pointer">
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
                className="max-w-2xl"
                isOpen={ isOpen }
                onClose={ onClose }
                showXButton={ false }
            >
                <Modal.Title className="border-b flex justify-between items-center">
                    <p>
                        { __( 'Craft your product information', 'dokan-lite' ) }
                    </p>
                    { isEditMode && (
                        <Button
                            color="primary"
                            onClick={ startOver }
                            className="flex gap-2 items-center"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={ 1.5 }
                                stroke="currentColor"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                                />
                            </svg>

                            { __( 'Start Over', 'dokan-lite' ) }
                        </Button>
                    ) }
                </Modal.Title>

                <Modal.Content>
                    { error && (
                        <div
                            className="mb-4 bg-red-100 border border-red-200 text-sm text-red-800 rounded-lg p-4 dark:bg-red-800/10 dark:border-red-900 dark:text-red-500"
                            role="alert"
                        >
                            <span className="font-bold text-wrap">Error</span>{ ' ' }
                            { error }
                        </div>
                    ) }
                    { isEditMode ? (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <div className="font-semibold text-gray-800">
                                    { __( 'Product Title', 'dokan-lite' ) }
                                </div>
                                <ResponseHistory
                                    history={ getHistoryLabel( 'post_title' ) }
                                    prev={ () => prevHandler( 'post_title' ) }
                                    next={ () => nextHandler( 'post_title' ) }
                                />
                            </div>
                            <div className="mb-3">
                                <SimpleInput
                                    className="bg-white focus:outline-none"
                                    onChange={ ( e: any ) => {
                                        inputHandler(
                                            e.target.value,
                                            'post_title'
                                        );
                                    } }
                                    value={ getInputValue( 'post_title' ) }
                                />
                            </div>
                            <Button
                                color="secondary"
                                className="!bg-gray-200"
                                onClick={ () => refineContent( 'post_title' ) }
                                disabled={ isLoading }
                            >
                                { __( 'Refine', 'dokan-lite' ) }
                            </Button>
                            { /* Short Description Section */ }
                            <div className="my-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold text-gray-800">
                                        { __(
                                            'Short Description',
                                            'dokan-lite'
                                        ) }
                                    </div>
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
                                    className="mb-3 focus:outline-none h-36 border border-gray-300 rounded p-2.5 overflow-auto"
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
                                <Button
                                    color="secondary"
                                    className="!bg-gray-200"
                                    onClick={ () =>
                                        refineContent( 'post_excerpt' )
                                    }
                                    disabled={ isLoading }
                                >
                                    { __( 'Refine', 'dokan-lite' ) }
                                </Button>
                            </div>
                            { /* Long Description Section */ }
                            <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold text-gray-800">
                                        { __(
                                            'Long Description',
                                            'dokan-lite'
                                        ) }
                                    </div>
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
                                    className="mb-3 h-48 focus:outline-none border border-gray-300 rounded p-2.5 overflow-auto"
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
                                <Button
                                    color="secondary"
                                    className="!bg-gray-200"
                                    onClick={ () =>
                                        refineContent( 'post_content' )
                                    }
                                    disabled={ isLoading }
                                >
                                    { __( 'Refine', 'dokan-lite' ) }
                                </Button>
                            </div>

                            <p className="text-sm mt-4 mb-3">
                                { __(
                                    '** If you think the outcome doesn’t match your choice then you can',
                                    'dokan-lite'
                                ) }

                                { /* eslint-disable-next-line jsx-a11y/click-events-have-key-events */ }
                                <span
                                    tabIndex={ 0 }
                                    role="button"
                                    onClick={ generateContent }
                                    className="text-dokan-primary mx-1 underline"
                                >
                                    { __(
                                        'regenerate all again',
                                        'dokan-lite'
                                    ) }
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div>
                            <div className="font-semibold mb-2">
                                { __(
                                    'Generate product information',
                                    'dokan-lite'
                                ) }
                            </div>
                            <p className="text-sm mb-3">
                                { __(
                                    'You can generate your product title, short description, long description all at once with this prompt. Type your prompt below',
                                    'dokan-lite'
                                ) }
                            </p>
                            <TextArea
                                disabled={ isLoading }
                                className="min-h-48 bg-white focus:outline-none"
                                input={ {
                                    id: 'dokan-ai-prompt',
                                    value: prompt,
                                    onChange: ( e: any ) =>
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
                <Modal.Footer className="border-t">
                    <div className="flex gap-4 justify-end">
                        <Button
                            color="secondary"
                            className="!bg-gray-200"
                            disabled={ isLoading }
                            onClick={ onClose }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        { isEditMode ? (
                            <Button
                                color="primary"
                                disabled={ isLoading }
                                onClick={ () => insertHandler() }
                            >
                                { __( 'Insert', 'dokan-lite' ) }
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                disabled={ isLoading }
                                onClick={ generateContent }
                            >
                                { isLoading
                                    ? __( 'Generating…', 'dokan-lite' )
                                    : __( 'Generate', 'dokan-lite' ) }
                            </Button>
                        ) }
                    </div>
                </Modal.Footer>
            </Modal>
            <Modal
                className="max-w-md"
                isOpen={ regenerateModal }
                showXButton={ false }
                onClose={ () => setRegenerateModal( false ) }
            >
                <Modal.Content>
                    <div className="text-center p-5">
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
                            <Button
                                color="secondary"
                                className="!bg-gray-200"
                                onClick={ () => setRegenerateModal( false ) }
                            >
                                { __( 'Cancel', 'dokan-lite' ) }
                            </Button>
                            <Button
                                color="primary"
                                onClick={ () => insertHandler( true ) }
                            >
                                { __( 'Yes, Insert', 'dokan-lite' ) }
                            </Button>
                        </div>
                    </div>
                </Modal.Content>
            </Modal>
        </>
    );
};
export default DokanAI;

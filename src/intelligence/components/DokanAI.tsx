import { useEffect, useState } from '@wordpress/element';
import { Modal, SimpleInput, TextArea, Tooltip } from '@getdokan/dokan-ui';
import { __ } from '@wordpress/i18n';
import { generateAiContent } from '../utils/api';
import { updateWordPressField } from '../utils/dom';
import ResponseHistory from './ResponseHistory';
import { useMutationObserver } from '../../hooks';
import { DokanAlert, DokanButton } from '../../components';
import AISkeleton from './Skeleton';

const initialIndex = {
    post_title: 0,
    post_excerpt: 0,
    post_content: 0,
};
const initialContent = {
    post_title: [],
    post_excerpt: [],
    post_content: [],
};

const DokanAI = () => {
    const [ isOpen, setIsOpen ] = useState( false );
    const [ refineLoading, setRefineLoading ] = useState( {
        post_title: false,
        post_excerpt: false,
        post_content: false,
    } );
    const [ isRefining, setIsRefining ] = useState( false );
    const [ prompt, setPrompt ] = useState( '' );
    const [ error, setError ] = useState( '' );
    const [ regenerateModal, setRegenerateModal ] = useState( false );
    const [ responseHistory, setResponseHistory ] = useState( initialContent );
    const [ isEditMode, setIsEditMode ] = useState( false );

    const [ historyIndex, setHistoryIndex ] = useState( initialIndex );

    const [ isLoading, setIsLoading ] = useState( false );

    const resetIndex = () => {
        setHistoryIndex( initialIndex );
    };

    const getElement = ( ifr: string, selector: string ) => {
        const iframe = document.getElementById( ifr ) as HTMLIFrameElement;
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        return (
            doc?.querySelector( `[data-id="${ selector }"]` ) ||
            document.querySelector( `#${ selector }` )
        );
    };

    const handleLabelClick = ( event: any ) => {
        event.preventDefault();
        event.stopPropagation();
        setIsOpen( true );

        // if values exists
        const title = document.querySelector(
            '#post_title'
        ) as HTMLInputElement;
        const postExcerpt = getElement( 'post_excerpt_ifr', 'post_excerpt' );
        const excerptValue = document.querySelector(
            '#post_excerpt'
        ) as HTMLInputElement;
        const postContent = getElement( 'post_content_ifr', 'post_content' );
        const contentValue = document.querySelector(
            '#post_content'
        ) as HTMLInputElement;

        const previousData = {
            ...initialContent,
        } as any;

        if ( excerptValue.value || contentValue.value ) {
            previousData.post_title = [ title.value || '' ];
            setPrompt( title.value );
        }

        if ( postExcerpt.innerHTML && excerptValue.value ) {
            previousData.post_excerpt = [ postExcerpt.innerHTML ];
        }
        if ( postContent.innerHTML && contentValue.value ) {
            previousData.post_content = [ postContent.innerHTML ];
        }
        setResponseHistory( previousData );
        resetIndex();
    };

    const startOver = () => {
        setPrompt( '' );
        setError( '' );
        setRegenerateModal( false );
        setResponseHistory( initialContent );
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
            if ( content ) {
                setResponseHistory( {
                    post_title: [ content.title ],
                    post_excerpt: [ content.short_description ],
                    post_content: [ content.long_description ],
                } );
            } else {
                setError(
                    __(
                        'No content generated, please try again.',
                        'dokan-lite'
                    )
                );
            }
            resetIndex();
        } catch ( err ) {
            setError( err.message );
        } finally {
            setIsLoading( false );
        }
    };

    const refineAllContent = async () => {
        setIsRefining( true );
        await generateContent();
        setIsRefining( false );
    };

    const skeletonLoading = ( field: string ) => {
        return refineLoading[ field ] || isRefining;
    };

    const refineContent = async ( field: string ) => {
        setError( '' );
        let refineField = responseHistory[ field ][ historyIndex[ field ] ];
        if ( ! refineField?.trim() ) {
            const promptContent = {
                post_excerpt: 'generate short description',
                post_content: 'generate long description',
            };
            refineField = promptContent[ field ];
        }

        if ( field !== 'post_title' ) {
            refineField = `${ refineField } \n
            product title is ${
                responseHistory.post_title[ historyIndex.post_title ]
            }`;
        }

        if ( ! refineField?.trim() ) {
            setError( __( 'Please enter a prompt.', 'dokan-lite' ) );
            return;
        }

        setIsLoading( true );
        // only current field is loading and other fields are false
        setRefineLoading( ( prevState ) => {
            return {
                ...prevState,
                [ field ]: true,
            };
        } );
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
            setRefineLoading( ( prevState ) => {
                return {
                    ...prevState,
                    [ field ]: false,
                };
            } );
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
        const existingTitle = document.getElementById(
            'post_title'
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
                    if ( node.id === 'headlessui-portal-root' ) {
                        node.classList.add( 'dokan-layout' );
                        node.style.display = 'block';
                    }

                    if (
                        node.hasAttribute( 'data-radix-popper-content-wrapper' )
                    ) {
                        node.classList.add( 'dokan-layout' );
                    }
                }
            }
        },
        { childList: true }
    );

    useEffect( () => {
        const hasContent =
            responseHistory.post_title.length > 0 ||
            responseHistory.post_content.length > 0 ||
            responseHistory.post_excerpt.length > 0;

        setIsEditMode( hasContent );
    }, [
        responseHistory.post_title,
        responseHistory.post_content,
        responseHistory.post_excerpt,
    ] );

    return (
        <>
            <button
                type="button"
                className="dokan-btn p-0 !min-h-[max-content]"
                onClick={ handleLabelClick }
            >
                <Tooltip content={ __( 'AI Assistant', 'dokan-lite' ) }>
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 40 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M18.0064 11.0266C18.2625 9.98897 19.7376 9.98897 19.9938 11.0266V11.0266C21.0872 15.4557 24.5455 18.9139 28.9747 20.0073V20.0073C30.0123 20.2634 30.0123 21.7386 28.9747 21.9947V21.9947C24.5455 23.0881 21.0872 26.5463 19.9938 30.9754V30.9754C19.7376 32.0131 18.2625 32.0131 18.0064 30.9754V30.9754C16.9129 26.5463 13.4546 23.0881 9.02549 21.9947V21.9947C7.98784 21.7386 7.98784 20.2634 9.02549 20.0073V20.0073C13.4546 18.9139 16.9129 15.4557 18.0064 11.0266V11.0266Z"
                            fill="white"
                        />
                        <path
                            d="M28.9309 6.62922C29.0345 6.20923 29.6316 6.20923 29.7353 6.62922V6.62922C30.1779 8.42196 31.5777 9.82171 33.3704 10.2643V10.2643C33.7904 10.3679 33.7904 10.965 33.3704 11.0687V11.0687C31.5777 11.5113 30.1779 12.911 29.7353 14.7037V14.7037C29.6316 15.1237 29.0345 15.1237 28.9309 14.7037V14.7037C28.4883 12.911 27.0885 11.5113 25.2957 11.0687V11.0687C24.8757 10.965 24.8757 10.3679 25.2957 10.2643V10.2643C27.0885 9.82171 28.4883 8.42196 28.9309 6.62922V6.62922Z"
                            fill="white"
                        />
                    </svg>
                </Tooltip>
            </button>

            <Modal
                className="max-w-2xl"
                isOpen={ isOpen }
                onClose={ onClose }
                showXButton={ false }
            >
                <Modal.Title className="border-b flex justify-between items-center">
                    <div>
                        { __( 'Craft your product information', 'dokan-lite' ) }
                    </div>
                    { isEditMode && (
                        <DokanButton
                            variant="secondary"
                            onClick={ startOver }
                            disabled={ isLoading }
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
                        </DokanButton>
                    ) }
                </Modal.Title>

                <Modal.Content>
                    { error && (
                        <DokanAlert
                            label={ __( 'Error', 'dokan-lite' ) }
                            variant="danger"
                            className="mb-4 [&_*_p]:m-0"
                        >
                            { error }
                        </DokanAlert>
                    ) }
                    { isEditMode ? (
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <div className="font-semibold text-gray-800">
                                    { __( 'Title:', 'dokan-lite' ) }
                                </div>
                                <ResponseHistory
                                    loading={ skeletonLoading( 'post_title' ) }
                                    history={ getHistoryLabel( 'post_title' ) }
                                    prev={ () => prevHandler( 'post_title' ) }
                                    next={ () => nextHandler( 'post_title' ) }
                                />
                            </div>
                            <div className="mb-3">
                                <AISkeleton
                                    type="text"
                                    loading={ skeletonLoading( 'post_title' ) }
                                    element={
                                        <SimpleInput
                                            className="focus:outline-none"
                                            onChange={ ( e: any ) => {
                                                inputHandler(
                                                    e.target.value,
                                                    'post_title'
                                                );
                                            } }
                                            value={ getInputValue(
                                                'post_title'
                                            ) }
                                        />
                                    }
                                />
                            </div>
                            <DokanButton
                                variant="secondary"
                                onClick={ () => refineContent( 'post_title' ) }
                                disabled={ skeletonLoading( 'post_title' ) }
                            >
                                { __( 'Refine', 'dokan-lite' ) }
                            </DokanButton>
                            { /* Short Description Section */ }
                            <div className="my-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold text-gray-800">
                                        { __(
                                            'Short Description:',
                                            'dokan-lite'
                                        ) }
                                    </div>
                                    <ResponseHistory
                                        loading={ skeletonLoading(
                                            'post_excerpt'
                                        ) }
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

                                <AISkeleton
                                    loading={ skeletonLoading(
                                        'post_excerpt'
                                    ) }
                                    element={
                                        <div
                                            className="mb-3 focus:outline-dokan-btn h-36 border rounded p-2.5 overflow-auto"
                                            contentEditable={ true }
                                            onBlur={ ( e ) => {
                                                inputHandler(
                                                    e.target.innerHTML,
                                                    'post_excerpt'
                                                );
                                            } }
                                            dangerouslySetInnerHTML={ {
                                                __html: getInputValue(
                                                    'post_excerpt'
                                                ),
                                            } }
                                        ></div>
                                    }
                                />
                                <DokanButton
                                    variant="secondary"
                                    onClick={ () =>
                                        refineContent( 'post_excerpt' )
                                    }
                                    disabled={ skeletonLoading(
                                        'post_excerpt'
                                    ) }
                                >
                                    { __( 'Refine', 'dokan-lite' ) }
                                </DokanButton>
                            </div>
                            { /* Long Description Section */ }
                            <div className="mt-4">
                                <div className="mb-2 flex items-center justify-between">
                                    <div className="font-semibold text-gray-800">
                                        { __(
                                            'Long Description:',
                                            'dokan-lite'
                                        ) }
                                    </div>
                                    <ResponseHistory
                                        loading={ skeletonLoading(
                                            'post_content'
                                        ) }
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
                                <AISkeleton
                                    loading={ skeletonLoading(
                                        'post_content'
                                    ) }
                                    element={
                                        <div
                                            className="mb-3 h-48 focus:outline-dokan-btn border rounded p-2.5 overflow-auto"
                                            contentEditable={ true }
                                            onBlur={ ( e ) => {
                                                inputHandler(
                                                    e.target.innerHTML,
                                                    'post_content'
                                                );
                                            } }
                                            dangerouslySetInnerHTML={ {
                                                __html: getInputValue(
                                                    'post_content'
                                                ),
                                            } }
                                        ></div>
                                    }
                                />

                                <DokanButton
                                    variant="secondary"
                                    onClick={ () =>
                                        refineContent( 'post_content' )
                                    }
                                    disabled={ skeletonLoading(
                                        'post_content'
                                    ) }
                                >
                                    { __( 'Refine', 'dokan-lite' ) }
                                </DokanButton>
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
                                    onClick={ refineAllContent }
                                    className="text-dokan-link mx-1 underline"
                                >
                                    { __(
                                        'regenerate all again.',
                                        'dokan-lite'
                                    ) }
                                </span>
                            </p>
                        </div>
                    ) : (
                        <div>
                            <p className="text-sm mb-3">
                                { __(
                                    'You can generate your product title, short description, long description all at once with this prompt. Type your prompt below',
                                    'dokan-lite'
                                ) }
                            </p>
                            <TextArea
                                disabled={ isLoading }
                                className="min-h-48"
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
                        <DokanButton
                            variant="secondary"
                            disabled={ isLoading }
                            onClick={ onClose }
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </DokanButton>
                        { isEditMode ? (
                            <DokanButton
                                disabled={ isLoading }
                                onClick={ () => insertHandler() }
                            >
                                { __( 'Insert', 'dokan-lite' ) }
                            </DokanButton>
                        ) : (
                            <DokanButton
                                disabled={ isLoading || ! prompt }
                                onClick={ generateContent }
                            >
                                { isLoading
                                    ? __( 'Generating…', 'dokan-lite' )
                                    : __( 'Generate', 'dokan-lite' ) }
                            </DokanButton>
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
                            <DokanButton
                                variant="secondary"
                                onClick={ () => setRegenerateModal( false ) }
                            >
                                { __( 'Cancel', 'dokan-lite' ) }
                            </DokanButton>

                            <DokanButton
                                onClick={ () => insertHandler( true ) }
                            >
                                { __( 'Yes, Insert', 'dokan-lite' ) }
                            </DokanButton>
                        </div>
                    </div>
                </Modal.Content>
            </Modal>
        </>
    );
};
export default DokanAI;

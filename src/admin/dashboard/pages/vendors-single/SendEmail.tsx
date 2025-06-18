import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { InfoCardProps } from './InfoCard';
import { Send, X } from 'lucide-react';
import {
    Button,
    Modal,
    TextArea,
    SimpleInput,
    useToast,
} from '@getdokan/dokan-ui';
import apiFetch from '@wordpress/api-fetch';
import { useSelect } from '@wordpress/data';
import { Vendor } from '@dokan/definitions/dokan-vendors';

export interface SendEmailProps extends InfoCardProps {
    vendor: Vendor;
}

const SendEmail = ( { vendor }: SendEmailProps ) => {
    const toast = useToast();
    const currentUser = useSelect( ( select: any ) => {
        return select( 'dokan/core' )?.getCurrentUser?.();
    }, [] );

    const [ body, setBody ] = useState( '' );
    const [ open, setOpen ] = useState( false );
    const [ subject, setSubject ] = useState( '' );
    const [ loading, setLoading ] = useState( false );
    const [ error, setError ] = useState< string | null >( null );

    const handleSend = async () => {
        setLoading( true );
        setError( null );
        try {
            await apiFetch( {
                path: `/dokan/v1/stores/${ vendor.id }/email`,
                method: 'POST',
                data: {
                    subject,
                    body,
                    replyto: currentUser?.email,
                },
            } )
                .then( ( response ) => {
                    toast( {
                        type: 'success',
                        title: __( 'Success!', 'dokan-lite' ),
                        subtitle: __(
                            'Email has been sent successfully.',
                            'dokan-lite'
                        ),
                    } );
                    setOpen( false );
                    setSubject( '' );
                    setBody( '' );
                } )
                .catch( ( error ) => {
                    setError( error.message );
                } );
        } catch ( e: any ) {
            setError(
                e?.message || __( 'Failed to send email', 'dokan-lite' )
            );
        } finally {
            setLoading( false );
        }
    };

    const closeModal = () => {
        setOpen( false );
        setError( null );
    };

    return (
        <div className="flex flex-col items-center">
            <Button
                type="button"
                color="primary"
                data-testid="send-email-btn"
                onClick={ () => setOpen( true ) }
                className="w-full flex items-center justify-center gap-2 rounded-full transition-colors shadow-sm bg-[#D8D8FE] hover:bg-[#C0C0F5] text-[#181894] font-normal transition"
            >
                <Send size={ 16 } className={ `font-medium` } />
                { __( 'Send Email', 'dokan-lite' ) }
            </Button>
            <Modal
                isOpen={ open }
                showXButton={ false }
                onClose={ closeModal }
                className={ `w-[600px]` }
            >
                <Modal.Title className="border-b text-base text-[#25252D] font-bold !pl-7 flex justify-between items-center">
                    { __( 'Send Email', 'dokan-lite' ) }
                    <X
                        size={ 20 }
                        onClick={ closeModal }
                        className={ `rounded-full stroke-gray-500 cursor-pointer hover:stroke-red-600 transition-colors duration-150` }
                    />
                </Modal.Title>
                <Modal.Content className={ `!p-7` }>
                    <form className="flex flex-col gap-6 w-full mx-auto">
                        <div className={ `flex items-center gap-3` }>
                            <img
                                src={ vendor?.gravatar }
                                alt={ vendor.store_name }
                                className="w-12 h-12 rounded-full"
                            />

                            <div className={ `space-y-1` }>
                                <div className="text-base font-medium text-gray-800">
                                    { vendor.store_name }
                                </div>

                                <div className="text-xs text-gray-500">
                                    { vendor.email }
                                </div>
                            </div>
                        </div>

                        { /* Reply to the email input field */ }
                        <div className={ `reply-to-input` }>
                            <SimpleInput
                                input={ {
                                    id: 'current-user-email',
                                    placeholder: 'example@email.com',
                                    type: 'email',
                                } }
                                value={ currentUser?.email || '' }
                                label={ __( 'Reply-To', 'dokan-lite' ) }
                                required
                                disabled
                                readOnly
                            />
                        </div>

                        { /* Email subject input field */ }
                        <div className={ `email-subject-input` }>
                            <SimpleInput
                                value={ subject }
                                input={ {
                                    id: 'subject',
                                    type: 'text',
                                    placeholder: __(
                                        'Enter email subject',
                                        'dokan-lite'
                                    ),
                                } }
                                onChange={ ( e ) =>
                                    setSubject( e.target.value )
                                }
                                label={ __( 'Email Subject', 'dokan-lite' ) }
                                required
                            />
                        </div>

                        { /* Email body field */ }
                        <div className={ `email-body-input` }>
                            <TextArea
                                value={ body }
                                input={ {
                                    id: 'body',
                                    rows: 10,
                                    placeholder: __(
                                        'Write message',
                                        'dokan-lite'
                                    ),
                                } }
                                className={ `resize-none` }
                                onChange={ ( e ) => setBody( e.target.value ) }
                                label={ __( 'Email Body', 'dokan-lite' ) }
                                required
                            />
                        </div>

                        { error && (
                            <div className="text-red-600 text-sm">
                                { error }
                            </div>
                        ) }
                    </form>
                </Modal.Content>
                <Modal.Footer className={ `!p-7 border-t` }>
                    <div className="flex items-center justify-end gap-2 w-full">
                        <Button
                            type="button"
                            color="secondary"
                            onClick={ closeModal }
                            disabled={ loading }
                            className="px-4 py-2 rounded border bg-white text-gray-700 hover:bg-gray-200 text-sm font-medium"
                        >
                            { __( 'Cancel', 'dokan-lite' ) }
                        </Button>
                        <Button
                            color="primary"
                            className="px-6 py-2 rounded bg-primary-600 text-white hover:bg-primary-700 text-sm font-semibold disabled:opacity-60"
                            onClick={ ( e ) => {
                                e.preventDefault();
                                handleSend();
                            } }
                            type="button"
                            disabled={ loading || ! subject || ! body }
                        >
                            { loading
                                ? __( 'Sending…', 'dokan-lite' )
                                : __( 'Send', 'dokan-lite' ) }
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default SendEmail;

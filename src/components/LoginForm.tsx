// eslint-disable-next-line import/no-extraneous-dependencies
import $ from 'jquery';

import { __ } from '@wordpress/i18n';
import { useState } from '@wordpress/element';

import { SimpleInput } from '@getdokan/dokan-ui';

import { DokanButton, DokanAlert } from './index';
import { decodeEntities } from '@wordpress/html-entities';

/**
 * LoginModal component for handling user authentication
 *
 * @param {Object}   props                 Component properties
 * @param {Function} props.onLoginSuccess  Function to call on successful login
 * @param {Function} props.onCreateAccount
 * @return {JSX.Element} Login modal component
 */
const LoginForm = ( {
    onLoginSuccess = () => {},
    onCreateAccount = () => {},
} ) => {
    const [ isLoading, setIsLoading ] = useState( false );
    const [ error, setError ] = useState( '' );
    const [ loginData, setLoginData ] = useState( {
        username: '',
        password: '',
        remember: true,
    } );

    /**
     * Handle login form submission using jQuery Ajax
     */
    const onUserLogin = async () => {
        setError( '' );
        setIsLoading( true );

        try {
            const formData = new URLSearchParams();
            formData.append( 'dokan_login_form_username', loginData.username );
            formData.append( 'dokan_login_form_password', loginData.password );
            formData.append(
                'dokan_login_form_remember',
                loginData.remember ? '1' : '0'
            );

            // Use jQuery ajax instead of apiFetch
            $.ajax( {
                url: dokan.ajaxurl,
                method: 'POST',
                dataType: 'json',
                data: {
                    action: 'dokan_login_user',
                    _wpnonce: dokan.nonce,
                    form_data: formData.toString(),
                },
                success( response: any ) {
                    setIsLoading( false );

                    if ( response && ! response.success ) {
                        onLoginSuccess();
                    } else {
                        setError(
                            response.data.message ||
                                __(
                                    'Failed to login. Please try again later.',
                                    'dokan-lite'
                                )
                        );
                    }
                },
                error( err: any ) {
                    setIsLoading( false );
                    setError(
                        err.responseJSON.data.message ||
                            __(
                                'Failed to login. Please try again later.',
                                'dokan-lite'
                            )
                    );
                },
            } );
        } catch ( err: any ) {
            setIsLoading( false );
            setError(
                err.message ||
                    __(
                        'Failed to login. Please try again later.',
                        'dokan-lite'
                    )
            );
        }
    };

    return (
        <div className={ 'flex flex-col gap-4' }>
            <div className="w-full grid grid-cols-1 gap-4">
                { error && (
                    <DokanAlert
                        label={ decodeEntities( error ) }
                        type="danger"
                    />
                ) }
                <div className="flex flex-col">
                    <SimpleInput
                        input={ {
                            id: 'username',
                            name: 'username',
                            type: 'text',
                            placeholder: __( 'Write your username', 'dokan' ),
                        } }
                        label={ __( 'Username', 'dokan-lite' ) }
                        value={ loginData.username }
                        onChange={ ( event ) => {
                            setLoginData( ( prevState ) => ( {
                                ...prevState,
                                username: event.target.value,
                            } ) );
                        } }
                    />
                </div>
                <div className="flex flex-col">
                    <SimpleInput
                        input={ {
                            id: 'password',
                            name: 'password',
                            type: 'password',
                            placeholder: __( 'Write your password', 'dokan' ),
                        } }
                        label={ __( 'Password', 'dokan-lite' ) }
                        value={ loginData.password }
                        onChange={ ( event ) => {
                            setLoginData( ( prevState ) => ( {
                                ...prevState,
                                password: event.target.value,
                            } ) );
                        } }
                    />
                </div>
            </div>
            <div className="flex justify-end">
                <div className={ `flex items-center justify-end gap-3` }>
                    <DokanButton
                        variant="secondary"
                        onClick={ onCreateAccount }
                        disabled={ isLoading }
                        label={ __( 'Create an account', 'dokan-lite' ) }
                    />
                    <DokanButton
                        onClick={ onUserLogin }
                        disabled={
                            isLoading ||
                            ! loginData.username ||
                            ! loginData.password
                        }
                        loading={ isLoading }
                        label={ __( 'Login', 'dokan-lite' ) }
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginForm;

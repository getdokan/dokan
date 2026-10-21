import { __ } from '@wordpress/i18n';
import {
    PanelBody,
    SelectControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import { useEditorContext } from '../context';
import type { LoginSettings } from '../types';

export default function LoginPanel() {
    const { data, attributes, setAttributes, view, setView } =
        useEditorContext();
    const login: LoginSettings = { ...data.login, ...attributes.login };
    const set = ( patch: Partial< LoginSettings > ) =>
        setAttributes( { login: { ...attributes.login, ...patch } } );

    const text = ( key: keyof LoginSettings, label: string ) => (
        <TextControl
            __nextHasNoMarginBottom
            __next40pxDefaultSize
            label={ label }
            value={ String( login[ key ] ?? '' ) }
            placeholder={ String( data.login[ key ] ?? '' ) }
            onChange={ ( value ) =>
                set( { [ key ]: value } as Partial< LoginSettings > )
            }
        />
    );

    return (
        <PanelBody
            title={ __( 'Login', 'dokan-lite' ) }
            initialOpen={ false }
            // Login only shows to visitors, so opening the panel previews that view.
            onToggle={ ( opening: boolean ) =>
                opening && 'visitor' !== view && setView( 'visitor' )
            }
        >
            { 'visitor' !== view && (
                <p className="dokan-vreg-editor__muted">
                    { __( 'Not shown to logged-in customers.', 'dokan-lite' ) }
                </p>
            ) }

            <ToggleControl
                __nextHasNoMarginBottom
                label={ __( 'Show login box', 'dokan-lite' ) }
                checked={ login.enabled }
                onChange={ ( enabled ) => set( { enabled } ) }
            />

            { login.enabled && (
                <div className="dokan-vreg-editor__texts">
                    <SelectControl
                        __nextHasNoMarginBottom
                        __next40pxDefaultSize
                        label={ __( 'Position', 'dokan-lite' ) }
                        value={ login.position }
                        options={ [
                            {
                                value: 'right',
                                label: __(
                                    'Column on the right',
                                    'dokan-lite'
                                ),
                            },
                            {
                                value: 'left',
                                label: __( 'Column on the left', 'dokan-lite' ),
                            },
                            {
                                value: 'link',
                                label: __(
                                    '“Already have an account? Log in” link above the form',
                                    'dokan-lite'
                                ),
                            },
                        ] }
                        onChange={ ( position ) =>
                            set( {
                                position:
                                    position as LoginSettings[ 'position' ],
                            } )
                        }
                    />
                    { 'link' === login.position
                        ? text( 'linkText', __( 'Link text', 'dokan-lite' ) )
                        : text( 'heading', __( 'Heading', 'dokan-lite' ) ) }
                    { text(
                        'usernameLabel',
                        __( 'Username label', 'dokan-lite' )
                    ) }
                    { text(
                        'passwordLabel',
                        __( 'Password label', 'dokan-lite' )
                    ) }
                    { text( 'buttonText', __( 'Button text', 'dokan-lite' ) ) }
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label={ __( '“Remember me”', 'dokan-lite' ) }
                        checked={ login.showRemember }
                        onChange={ ( showRemember ) => set( { showRemember } ) }
                    />
                    <ToggleControl
                        __nextHasNoMarginBottom
                        label={ __( '“Lost your password?”', 'dokan-lite' ) }
                        checked={ login.showLostPassword }
                        onChange={ ( showLostPassword ) =>
                            set( { showLostPassword } )
                        }
                    />
                </div>
            ) }
        </PanelBody>
    );
}
